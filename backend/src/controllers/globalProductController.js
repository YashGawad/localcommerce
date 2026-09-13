const pool = require('../config/db');

// UUID format validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

const VALID_STATUSES = ['active', 'inactive'];
const ALLOWED_UPDATE_FIELDS = [
  'name',
  'brand',
  'description',
  'barcode',
  'unit',
  'mrp',
  'image_url',
  'status',
];

/**
 * GET /api/global-products
 * List all global products in deterministic order
 */
const getAllGlobalProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, brand, description, barcode, unit, mrp, image_url, status, created_at, updated_at
      FROM global_products
      ORDER BY created_at ASC;
    `);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching global products:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve global products',
    });
  }
};

/**
 * GET /api/global-products/:id
 * Retrieve single global product by UUID
 */
const getGlobalProductById = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid global product ID format',
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, name, brand, description, barcode, unit, mrp, image_url, status, created_at, updated_at
      FROM global_products
      WHERE id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Global product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(`Error fetching global product (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve global product',
    });
  }
};

/**
 * POST /api/global-products
 * Create a new global product (global identity only)
 */
const createGlobalProduct = async (req, res) => {
  const {
    name,
    brand,
    description,
    barcode,
    unit,
    mrp,
    image_url,
    status,
  } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Global product name is required and cannot be empty',
    });
  }

  if (mrp !== undefined && mrp !== null && (isNaN(Number(mrp)) || Number(mrp) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'MRP must be a valid non-negative number',
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
      INSERT INTO global_products (
        name, brand, description, barcode, unit, mrp, image_url, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
      RETURNING id, name, brand, description, barcode, unit, mrp, image_url, status, created_at, updated_at;
      `,
      [
        name.trim(),
        brand ? brand.trim() : null,
        description || null,
        barcode ? barcode.trim() : null,
        unit ? unit.trim() : null,
        mrp !== undefined && mrp !== null ? Number(mrp) : null,
        image_url || null,
        finalStatus,
      ]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating global product:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create global product',
    });
  }
};

/**
 * PATCH /api/global-products/:id
 * Update an existing global product (global identity only)
 */
const updateGlobalProduct = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid global product ID format',
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
        message: 'Product name cannot be empty',
      });
    }
    updates.name = updates.name.trim();
  }

  if (updates.mrp !== undefined && updates.mrp !== null) {
    if (isNaN(Number(updates.mrp)) || Number(updates.mrp) < 0) {
      return res.status(400).json({
        success: false,
        message: 'MRP must be a valid non-negative number',
      });
    }
    updates.mrp = Number(updates.mrp);
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
    UPDATE global_products
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, name, brand, description, barcode, unit, mrp, image_url, status, created_at, updated_at;
  `;

  try {
    const result = await pool.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Global product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(`Error updating global product (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update global product',
    });
  }
};

module.exports = {
  getAllGlobalProducts,
  getGlobalProductById,
  createGlobalProduct,
  updateGlobalProduct,
};
