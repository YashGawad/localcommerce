const pool = require('../config/db');

// UUID format validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

const VALID_STATUSES = ['active', 'inactive'];
const ALLOWED_UPDATE_FIELDS = ['name', 'description', 'image_url', 'status'];

/**
 * GET /api/categories
 * List categories, optionally filtered by ?store_id=... (Public access)
 */
const getAllCategories = async (req, res) => {
  const { store_id } = req.query;

  try {
    if (store_id) {
      if (!isValidUUID(store_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID format in query',
        });
      }

      const result = await pool.query(
        `
        SELECT id, store_id, name, description, image_url, status, created_at, updated_at
        FROM categories
        WHERE store_id = $1
        ORDER BY created_at ASC;
        `,
        [store_id]
      );

      return res.status(200).json({
        success: true,
        data: result.rows,
      });
    }

    const result = await pool.query(`
      SELECT id, store_id, name, description, image_url, status, created_at, updated_at
      FROM categories
      ORDER BY created_at ASC;
    `);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
    });
  }
};

/**
 * GET /api/categories/:id
 * Retrieve a category by UUID (Public access)
 */
const getCategoryById = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category ID format',
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, store_id, name, description, image_url, status, created_at, updated_at
      FROM categories
      WHERE id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(`Error fetching category (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve category',
    });
  }
};

/**
 * POST /api/categories
 * Create a new store-specific category (Store owner/manager only)
 */
const createCategory = async (req, res) => {
  const { store_id, name, description, image_url, status } = req.body;

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Category name is required and cannot be empty',
    });
  }

  if (!store_id || !isValidUUID(store_id)) {
    return res.status(400).json({
      success: false,
      message: 'Valid store_id is required',
    });
  }

  // Validate store exists
  const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [store_id]);
  if (storeCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Referenced store not found',
    });
  }

  // Multi-tenant authorization: verify authenticated user has owner or manager membership for store_id
  const membershipRes = await pool.query(
    `
    SELECT role
    FROM store_users
    WHERE store_id = $1 AND user_id = $2;
    `,
    [store_id, req.user.id]
  );

  if (membershipRes.rows.length === 0) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You do not have access to this store.',
    });
  }

  const userStoreRole = (membershipRes.rows[0].role || '').toLowerCase();
  if (!['owner', 'manager'].includes(userStoreRole)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Insufficient store permissions for this action.',
    });
  }

  const finalStatus = status ? status.trim().toLowerCase() : 'active';
  if (!VALID_STATUSES.includes(finalStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO categories (
        store_id, name, description, image_url, status
      ) VALUES (
        $1, $2, $3, $4, $5
      )
      RETURNING id, store_id, name, description, image_url, status, created_at, updated_at;
      `,
      [
        store_id,
        name.trim(),
        description || null,
        image_url || null,
        finalStatus,
      ]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    // Unique violation on (store_id, name)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A category with this name already exists for this store',
      });
    }

    console.error('Error creating category:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category',
    });
  }
};

/**
 * PATCH /api/categories/:id
 * Update an existing category (Store owner/manager for that store only)
 */
const updateCategory = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category ID format',
    });
  }

  // 1. Determine category store_id directly from database
  const catCheck = await pool.query(
    'SELECT id, store_id FROM categories WHERE id = $1',
    [id]
  );

  if (catCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }

  const targetStoreId = catCheck.rows[0].store_id;

  // 2. Multi-tenant authorization: verify authenticated user has owner or manager membership for targetStoreId
  const membershipRes = await pool.query(
    `
    SELECT role
    FROM store_users
    WHERE store_id = $1 AND user_id = $2;
    `,
    [targetStoreId, req.user.id]
  );

  if (membershipRes.rows.length === 0) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You do not have access to this store.',
    });
  }

  const userStoreRole = (membershipRes.rows[0].role || '').toLowerCase();
  if (!['owner', 'manager'].includes(userStoreRole)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Insufficient store permissions for this action.',
    });
  }

  const updates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields provided for update',
    });
  }

  if (updates.name !== undefined) {
    if (typeof updates.name !== 'string' || updates.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name cannot be empty',
      });
    }
    updates.name = updates.name.trim();
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

  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, val] of Object.entries(updates)) {
    setClauses.push(`${key} = $${paramIndex}`);
    values.push(val);
    paramIndex++;
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const queryText = `
    UPDATE categories
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, store_id, name, description, image_url, status, created_at, updated_at;
  `;

  try {
    const result = await pool.query(queryText, values);

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A category with this name already exists for this store',
      });
    }

    console.error(`Error updating category (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update category',
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
};
