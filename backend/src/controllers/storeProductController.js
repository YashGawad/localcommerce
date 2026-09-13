const pool = require('../config/db');

// UUID format validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

const VALID_STATUSES = ['active', 'inactive'];

// Helper to query a store product with joined global_product details
const getStoreProductWithGlobalDetails = async (productId, storeId) => {
  const result = await pool.query(
    `
    SELECT 
      sp.id,
      sp.store_id,
      sp.global_product_id,
      sp.category_id,
      sp.name,
      sp.description,
      sp.sku,
      sp.price,
      sp.cost_price,
      sp.stock_quantity,
      sp.low_stock_threshold,
      sp.unit,
      sp.image_url,
      sp.status,
      sp.created_at,
      sp.updated_at,
      CASE 
        WHEN gp.id IS NOT NULL THEN
          json_build_object(
            'id', gp.id,
            'name', gp.name,
            'brand', gp.brand,
            'barcode', gp.barcode,
            'unit', gp.unit,
            'mrp', gp.mrp,
            'image_url', gp.image_url
          )
        ELSE NULL
      END AS global_product
    FROM store_products sp
    LEFT JOIN global_products gp ON sp.global_product_id = gp.id
    WHERE sp.id = $1 AND sp.store_id = $2;
    `,
    [productId, storeId]
  );

  return result.rows[0] || null;
};

/**
 * GET /api/stores/:storeId/products
 * Retrieve all products for a specific store (multi-tenant isolated)
 */
const getStoreProducts = async (req, res) => {
  const { storeId } = req.params;

  if (!isValidUUID(storeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid store ID format',
    });
  }

  try {
    // Verify store exists
    const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    // Query products strictly scoped to store_id
    const result = await pool.query(
      `
      SELECT 
        sp.id,
        sp.store_id,
        sp.global_product_id,
        sp.category_id,
        sp.name,
        sp.description,
        sp.sku,
        sp.price,
        sp.cost_price,
        sp.stock_quantity,
        sp.low_stock_threshold,
        sp.unit,
        sp.image_url,
        sp.status,
        sp.created_at,
        sp.updated_at,
        CASE 
          WHEN gp.id IS NOT NULL THEN
            json_build_object(
              'id', gp.id,
              'name', gp.name,
              'brand', gp.brand,
              'barcode', gp.barcode,
              'unit', gp.unit,
              'mrp', gp.mrp,
              'image_url', gp.image_url
            )
          ELSE NULL
        END AS global_product
      FROM store_products sp
      LEFT JOIN global_products gp ON sp.global_product_id = gp.id
      WHERE sp.store_id = $1
      ORDER BY sp.created_at ASC;
      `,
      [storeId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(`Error fetching products for store (${storeId}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store products',
    });
  }
};

/**
 * GET /api/stores/:storeId/products/:id
 * Retrieve a specific product for a store (multi-tenant isolated)
 */
const getStoreProductById = async (req, res) => {
  const { storeId, id } = req.params;

  if (!isValidUUID(storeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid store ID format',
    });
  }

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID format',
    });
  }

  try {
    const product = await getStoreProductWithGlobalDetails(id, storeId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Store product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(`Error fetching store product (${id}) for store (${storeId}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store product',
    });
  }
};

/**
 * POST /api/stores/:storeId/products
 * Create a new store product listing (mapped or custom)
 */
const createStoreProduct = async (req, res) => {
  const { storeId } = req.params;

  if (!isValidUUID(storeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid store ID format',
    });
  }

  // Verify store exists
  const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
  if (storeCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Store not found',
    });
  }

  const {
    global_product_id,
    category_id,
    name,
    description,
    sku,
    price,
    cost_price,
    stock_quantity,
    stock,
    low_stock_threshold,
    threshold,
    unit,
    image_url,
    status,
  } = req.body;

  // Resolve aliases
  const resolvedStock = stock_quantity !== undefined ? stock_quantity : stock;
  const resolvedThreshold = low_stock_threshold !== undefined ? low_stock_threshold : threshold;

  // Validate price (mandatory)
  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({
      success: false,
      message: 'A valid non-negative price is required',
    });
  }

  // Validate cost_price if provided
  if (cost_price !== undefined && cost_price !== null && (isNaN(Number(cost_price)) || Number(cost_price) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Cost price must be a valid non-negative number',
    });
  }

  // Validate stock if provided
  if (resolvedStock !== undefined && resolvedStock !== null && (isNaN(Number(resolvedStock)) || Number(resolvedStock) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Stock quantity must be a valid non-negative number',
    });
  }

  // Validate low stock threshold if provided
  if (resolvedThreshold !== undefined && resolvedThreshold !== null && (isNaN(Number(resolvedThreshold)) || Number(resolvedThreshold) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Low stock threshold must be a valid non-negative number',
    });
  }

  // Validate status
  const finalStatus = status ? status.trim().toLowerCase() : 'active';
  if (!VALID_STATUSES.includes(finalStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
    });
  }

  // Validate global_product_id if provided
  let resolvedName = name ? name.trim() : '';
  let resolvedUnit = unit ? unit.trim() : null;
  let resolvedImage = image_url || null;

  if (global_product_id) {
    if (!isValidUUID(global_product_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid global product ID format',
      });
    }

    const gpResult = await pool.query(
      'SELECT id, name, unit, image_url FROM global_products WHERE id = $1',
      [global_product_id]
    );

    if (gpResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Referenced global product not found',
      });
    }

    const globalProd = gpResult.rows[0];
    if (!resolvedName) resolvedName = globalProd.name;
    if (!resolvedUnit) resolvedUnit = globalProd.unit;
    if (!resolvedImage) resolvedImage = globalProd.image_url;
  } else {
    // Custom product: name is required
    if (!resolvedName) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required for custom store products',
      });
    }
  }

  // Validate category_id if provided
  if (category_id) {
    if (!isValidUUID(category_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }

    const catCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (catCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Referenced category not found',
      });
    }
  }

  try {
    const insertResult = await pool.query(
      `
      INSERT INTO store_products (
        store_id,
        global_product_id,
        category_id,
        name,
        description,
        sku,
        price,
        cost_price,
        stock_quantity,
        low_stock_threshold,
        unit,
        image_url,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
      RETURNING id;
      `,
      [
        storeId,
        global_product_id || null,
        category_id || null,
        resolvedName,
        description || null,
        sku ? sku.trim() : null,
        Number(price),
        cost_price !== undefined && cost_price !== null ? Number(cost_price) : null,
        resolvedStock !== undefined && resolvedStock !== null ? Number(resolvedStock) : 0,
        resolvedThreshold !== undefined && resolvedThreshold !== null ? Number(resolvedThreshold) : 5,
        resolvedUnit,
        resolvedImage,
        finalStatus,
      ]
    );

    const createdId = insertResult.rows[0].id;
    const fullProduct = await getStoreProductWithGlobalDetails(createdId, storeId);

    return res.status(201).json({
      success: true,
      data: fullProduct,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A product with this SKU already exists for this store',
      });
    }

    console.error('Error creating store product:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create store product',
    });
  }
};

/**
 * PATCH /api/stores/:storeId/products/:id
 * Update an existing store product listing (multi-tenant isolated)
 */
const updateStoreProduct = async (req, res) => {
  const { storeId, id } = req.params;

  if (!isValidUUID(storeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid store ID format',
    });
  }

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID format',
    });
  }

  // Whitelist of allowed editable fields
  const allowedFields = [
    'global_product_id',
    'category_id',
    'name',
    'description',
    'sku',
    'price',
    'cost_price',
    'stock_quantity',
    'low_stock_threshold',
    'unit',
    'image_url',
    'status',
  ];

  const updates = {};

  // Support aliases for stock and threshold
  const body = { ...req.body };
  if (body.stock !== undefined && body.stock_quantity === undefined) {
    body.stock_quantity = body.stock;
  }
  if (body.threshold !== undefined && body.low_stock_threshold === undefined) {
    body.low_stock_threshold = body.threshold;
  }

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields provided for update',
    });
  }

  // Validate individual fields
  if (updates.name !== undefined) {
    if (typeof updates.name !== 'string' || updates.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product name cannot be empty',
      });
    }
    updates.name = updates.name.trim();
  }

  if (updates.price !== undefined) {
    if (isNaN(Number(updates.price)) || Number(updates.price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number',
      });
    }
    updates.price = Number(updates.price);
  }

  if (updates.cost_price !== undefined && updates.cost_price !== null) {
    if (isNaN(Number(updates.cost_price)) || Number(updates.cost_price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cost price must be a valid non-negative number',
      });
    }
    updates.cost_price = Number(updates.cost_price);
  }

  if (updates.stock_quantity !== undefined) {
    if (isNaN(Number(updates.stock_quantity)) || Number(updates.stock_quantity) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity must be a valid non-negative number',
      });
    }
    updates.stock_quantity = Number(updates.stock_quantity);
  }

  if (updates.low_stock_threshold !== undefined) {
    if (isNaN(Number(updates.low_stock_threshold)) || Number(updates.low_stock_threshold) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Low stock threshold must be a valid non-negative number',
      });
    }
    updates.low_stock_threshold = Number(updates.low_stock_threshold);
  }

  if (updates.status !== undefined) {
    const statusVal = typeof updates.status === 'string' ? updates.status.trim().toLowerCase() : '';
    if (!VALID_STATUSES.includes(statusVal)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
      });
    }
    updates.status = statusVal;
  }

  if (updates.global_product_id) {
    if (!isValidUUID(updates.global_product_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid global product ID format',
      });
    }
    const gpCheck = await pool.query('SELECT id FROM global_products WHERE id = $1', [updates.global_product_id]);
    if (gpCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Referenced global product not found',
      });
    }
  }

  if (updates.category_id) {
    if (!isValidUUID(updates.category_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }
    const catCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [updates.category_id]);
    if (catCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Referenced category not found',
      });
    }
  }

  // Build parameterized update query
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, val] of Object.entries(updates)) {
    setClauses.push(`${key} = $${paramIndex}`);
    values.push(val);
    paramIndex++;
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');

  // CRITICAL: WHERE id = $1 AND store_id = $2
  values.push(id);
  const idIndex = paramIndex++;
  values.push(storeId);
  const storeIdIndex = paramIndex;

  const queryText = `
    UPDATE store_products
    SET ${setClauses.join(', ')}
    WHERE id = $${idIndex} AND store_id = $${storeIdIndex}
    RETURNING id;
  `;

  try {
    const result = await pool.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store product not found',
      });
    }

    const updatedProduct = await getStoreProductWithGlobalDetails(id, storeId);

    return res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A product with this SKU already exists for this store',
      });
    }

    console.error(`Error updating store product (${id}) for store (${storeId}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update store product',
    });
  }
};

module.exports = {
  getStoreProducts,
  getStoreProductById,
  createStoreProduct,
  updateStoreProduct,
};
