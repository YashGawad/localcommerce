const pool = require('../config/db');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

/**
 * Valid completed fulfillment statuses eligible for review:
 * - delivery: DELIVERED
 * - pickup: PICKED_UP
 */
const COMPLETED_ORDER_STATUSES = ['DELIVERED', 'PICKED_UP'];

/**
 * Helper to get customer record for the authenticated user
 */
const getCustomerByUserId = async (userId, dbClient = pool) => {
  const res = await dbClient.query(
    'SELECT id, user_id FROM customers WHERE user_id = $1',
    [userId]
  );
  return res.rows[0] || null;
};

/**
 * Helper to sanitize review row for API responses
 */
const formatReview = (row) => ({
  id: row.id,
  order_id: row.order_id,
  order_number: row.order_number || undefined,
  store_id: row.store_id || null,
  store_name: row.store_name || undefined,
  global_product_id: row.global_product_id || null,
  product_name: row.product_name || undefined,
  rating: row.rating,
  comment: row.comment,
  status: row.status,
  customer: {
    id: row.customer_id,
    name: row.customer_name || undefined,
  },
  created_at: row.created_at,
  updated_at: row.updated_at,
});

/**
 * POST /api/reviews
 * Creates a verified review for a store or global product from a completed order.
 * Requires authenticated customer role.
 */
const createReview = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        error: 'Only customers can submit reviews.',
      });
    }

    const customer = await getCustomerByUserId(req.user.id);
    if (!customer) {
      return res.status(403).json({
        success: false,
        error: 'Customer profile not found.',
      });
    }

    const { order_id, store_id, global_product_id, rating, comment } = req.body;

    // 1. Validate order_id
    if (!isValidUUID(order_id)) {
      return res.status(400).json({
        success: false,
        error: 'A valid order_id UUID is required.',
      });
    }

    // 2. Validate target: exactly one of store_id or global_product_id
    if (store_id && global_product_id) {
      return res.status(400).json({
        success: false,
        error: 'A review must target either a store or a global product, not both.',
      });
    }

    if (!store_id && !global_product_id) {
      return res.status(400).json({
        success: false,
        error: 'Either store_id or global_product_id must be provided.',
      });
    }

    if (store_id && !isValidUUID(store_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid store_id UUID format.',
      });
    }

    if (global_product_id && !isValidUUID(global_product_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid global_product_id UUID format.',
      });
    }

    // 3. Validate rating: integer 1 to 5
    if (
      rating === undefined ||
      rating === null ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be an integer between 1 and 5.',
      });
    }

    // 4. Validate comment
    let trimmedComment = null;
    if (comment !== undefined && comment !== null) {
      if (typeof comment !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Comment must be a string.',
        });
      }
      trimmedComment = comment.trim();
      if (trimmedComment.length > 1000) {
        return res.status(400).json({
          success: false,
          error: 'Comment must not exceed 1000 characters.',
        });
      }
      if (trimmedComment.length === 0) {
        trimmedComment = null;
      }
    }

    // 5. Check order existence, customer ownership, and completion
    const orderRes = await pool.query(
      `SELECT id, order_number, status, fulfillment_type, store_id, customer_id
       FROM orders
       WHERE id = $1`,
      [order_id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found.',
      });
    }

    const order = orderRes.rows[0];

    // Anti-IDOR: Check customer ownership
    if (order.customer_id !== customer.id) {
      return res.status(404).json({
        success: false,
        error: 'Order not found.',
      });
    }

    // Check completed fulfillment state
    if (order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: 'Cannot review a cancelled order.',
      });
    }

    if (!COMPLETED_ORDER_STATUSES.includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `Reviews can only be submitted for completed orders. Current order status: ${order.status}.`,
      });
    }

    // 6. Verify target eligibility against order
    if (store_id) {
      // Store Review: order must belong to this store
      if (order.store_id !== store_id) {
        return res.status(400).json({
          success: false,
          error: 'The specified store does not match the store from which this order was placed.',
        });
      }

      // Check duplicate review for this order and store
      const dupCheck = await pool.query(
        `SELECT id FROM reviews
         WHERE customer_id = $1 AND order_id = $2 AND store_id = $3`,
        [customer.id, order_id, store_id]
      );

      if (dupCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'You have already submitted a review for this store on this order.',
        });
      }
    } else {
      // Product Review: order items must contain a store product mapped to global_product_id
      const itemCheck = await pool.query(
        `SELECT oi.id, gp.id AS global_product_id, gp.name AS product_name
         FROM order_items oi
         JOIN store_products sp ON oi.store_product_id = sp.id
         JOIN global_products gp ON sp.global_product_id = gp.id
         WHERE oi.order_id = $1 AND sp.global_product_id = $2`,
        [order_id, global_product_id]
      );

      if (itemCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'The specified product was not purchased in this order.',
        });
      }

      // Check duplicate review for this order and global product
      const dupCheck = await pool.query(
        `SELECT id FROM reviews
         WHERE customer_id = $1 AND order_id = $2 AND global_product_id = $3`,
        [customer.id, order_id, global_product_id]
      );

      if (dupCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'You have already submitted a review for this product on this order.',
        });
      }
    }

    // 7. Insert review
    const insertRes = await pool.query(
      `INSERT INTO reviews (
         customer_id,
         order_id,
         store_id,
         global_product_id,
         rating,
         comment,
         status
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'published')
       RETURNING id, customer_id, order_id, store_id, global_product_id, rating, comment, status, created_at, updated_at`,
      [
        customer.id,
        order_id,
        store_id || null,
        global_product_id || null,
        rating,
        trimmedComment,
      ]
    );

    const newReview = insertRes.rows[0];

    // Fetch author user name for sanitized response
    const userRes = await pool.query(
      `SELECT u.name FROM customers c JOIN users u ON c.user_id = u.id WHERE c.id = $1`,
      [customer.id]
    );
    const customerName = userRes.rows[0]?.name;

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: formatReview({
        ...newReview,
        order_number: order.order_number,
        customer_name: customerName,
      }),
    });
  } catch (error) {
    // Catch database check or unique constraint violations
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        error: 'Review failed database validation constraints.',
      });
    }
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'A duplicate review already exists.',
      });
    }
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while creating review.',
    });
  }
};

/**
 * GET /api/reviews
 * List published reviews with optional filtering by store_id or global_product_id.
 * Platform admins can view all statuses.
 */
const getAllReviews = async (req, res) => {
  try {
    const { store_id, global_product_id, status } = req.query;

    const conditions = [];
    const values = [];

    // Filter by store_id
    if (store_id) {
      if (!isValidUUID(store_id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid store_id UUID format.',
        });
      }
      values.push(store_id);
      conditions.push(`r.store_id = $${values.length}`);
    }

    // Filter by global_product_id
    if (global_product_id) {
      if (!isValidUUID(global_product_id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid global_product_id UUID format.',
        });
      }
      values.push(global_product_id);
      conditions.push(`r.global_product_id = $${values.length}`);
    }

    // Status filter: Public / regular users only see 'published'
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      conditions.push(`r.status = 'published'`);
    } else if (status) {
      values.push(status);
      conditions.push(`r.status = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT r.id, r.customer_id, r.order_id, r.store_id, r.global_product_id,
             r.rating, r.comment, r.status, r.created_at, r.updated_at,
             o.order_number,
             u.name AS customer_name,
             s.name AS store_name,
             gp.name AS product_name
      FROM reviews r
      JOIN customers c ON r.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN orders o ON r.order_id = o.id
      LEFT JOIN stores s ON r.store_id = s.id
      LEFT JOIN global_products gp ON r.global_product_id = gp.id
      ${whereClause}
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      data: result.rows.map(formatReview),
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching reviews.',
    });
  }
};

/**
 * GET /api/reviews/:id
 * Retrieve a specific review by ID.
 * Returns 404 if not found or if unpublished and requester is unauthorized.
 */
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid review ID format.',
      });
    }

    const query = `
      SELECT r.id, r.customer_id, r.order_id, r.store_id, r.global_product_id,
             r.rating, r.comment, r.status, r.created_at, r.updated_at,
             c.user_id AS customer_user_id,
             o.order_number,
             u.name AS customer_name,
             s.name AS store_name,
             gp.name AS product_name
      FROM reviews r
      JOIN customers c ON r.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN orders o ON r.order_id = o.id
      LEFT JOIN stores s ON r.store_id = s.id
      LEFT JOIN global_products gp ON r.global_product_id = gp.id
      WHERE r.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found.',
      });
    }

    const review = result.rows[0];

    // Unpublished reviews are only visible to platform admin or the author
    if (review.status !== 'published') {
      const isAuthor = req.user && req.user.id === review.customer_user_id;
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isAuthor && !isAdmin) {
        return res.status(404).json({
          success: false,
          error: 'Review not found.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: formatReview(review),
    });
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching review.',
    });
  }
};

/**
 * GET /api/stores/:storeId/reviews
 * Public endpoint to list reviews and calculate aggregate ratings for a store.
 */
const getStoreReviews = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!isValidUUID(storeId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid storeId UUID format.',
      });
    }

    // Verify store exists
    const storeRes = await pool.query(
      'SELECT id, name, slug FROM stores WHERE id = $1',
      [storeId]
    );

    if (storeRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Store not found.',
      });
    }

    const store = storeRes.rows[0];

    // Aggregates query
    const aggRes = await pool.query(
      `SELECT 
         COUNT(*)::int AS review_count,
         ROUND(AVG(rating)::numeric, 1)::float AS average_rating
       FROM reviews
       WHERE store_id = $1 AND status = 'published'`,
      [storeId]
    );

    const stats = aggRes.rows[0];

    // Reviews query
    const reviewsRes = await pool.query(
      `SELECT r.id, r.customer_id, r.order_id, r.store_id, r.global_product_id,
              r.rating, r.comment, r.status, r.created_at, r.updated_at,
              o.order_number,
              u.name AS customer_name
       FROM reviews r
       JOIN customers c ON r.customer_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN orders o ON r.order_id = o.id
       WHERE r.store_id = $1 AND r.status = 'published'
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    return res.status(200).json({
      success: true,
      data: {
        store_id: store.id,
        store_name: store.name,
        average_rating: stats.average_rating !== null ? stats.average_rating : null,
        review_count: stats.review_count || 0,
        reviews: reviewsRes.rows.map(formatReview),
      },
    });
  } catch (error) {
    console.error('Error fetching store reviews:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching store reviews.',
    });
  }
};

/**
 * GET /api/global-products/:globalProductId/reviews
 * Public endpoint to list reviews and calculate aggregate ratings for a global product.
 */
const getGlobalProductReviews = async (req, res) => {
  try {
    const { globalProductId } = req.params;

    if (!isValidUUID(globalProductId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid globalProductId UUID format.',
      });
    }

    // Verify global product exists
    const gpRes = await pool.query(
      'SELECT id, name FROM global_products WHERE id = $1',
      [globalProductId]
    );

    if (gpRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Global product not found.',
      });
    }

    const gp = gpRes.rows[0];

    // Aggregates query
    const aggRes = await pool.query(
      `SELECT 
         COUNT(*)::int AS review_count,
         ROUND(AVG(rating)::numeric, 1)::float AS average_rating
       FROM reviews
       WHERE global_product_id = $1 AND status = 'published'`,
      [globalProductId]
    );

    const stats = aggRes.rows[0];

    // Reviews query
    const reviewsRes = await pool.query(
      `SELECT r.id, r.customer_id, r.order_id, r.store_id, r.global_product_id,
              r.rating, r.comment, r.status, r.created_at, r.updated_at,
              o.order_number,
              u.name AS customer_name
       FROM reviews r
       JOIN customers c ON r.customer_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN orders o ON r.order_id = o.id
       WHERE r.global_product_id = $1 AND r.status = 'published'
       ORDER BY r.created_at DESC`,
      [globalProductId]
    );

    return res.status(200).json({
      success: true,
      data: {
        global_product_id: gp.id,
        product_name: gp.name,
        average_rating: stats.average_rating !== null ? stats.average_rating : null,
        review_count: stats.review_count || 0,
        reviews: reviewsRes.rows.map(formatReview),
      },
    });
  } catch (error) {
    console.error('Error fetching global product reviews:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching global product reviews.',
    });
  }
};

/**
 * GET /api/customers/me/reviews
 * Returns review history for the authenticated customer.
 */
const getCustomerReviews = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        error: 'Customer profile required.',
      });
    }

    const customer = await getCustomerByUserId(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer profile not found.',
      });
    }

    const query = `
      SELECT r.id, r.customer_id, r.order_id, r.store_id, r.global_product_id,
             r.rating, r.comment, r.status, r.created_at, r.updated_at,
             o.order_number,
             u.name AS customer_name,
             s.name AS store_name,
             gp.name AS product_name
      FROM reviews r
      JOIN customers c ON r.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN orders o ON r.order_id = o.id
      LEFT JOIN stores s ON r.store_id = s.id
      LEFT JOIN global_products gp ON r.global_product_id = gp.id
      WHERE r.customer_id = $1
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [customer.id]);

    return res.status(200).json({
      success: true,
      data: result.rows.map(formatReview),
    });
  } catch (error) {
    console.error('Error fetching customer reviews:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching customer reviews.',
    });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  getStoreReviews,
  getGlobalProductReviews,
  getCustomerReviews,
};
