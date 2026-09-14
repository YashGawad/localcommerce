const pool = require('../config/db');

// UUID format validation regex (matches standard 8-4-4-4-12 hex UUIDs)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

// Allowed editable columns for update
const ALLOWED_UPDATE_FIELDS = [
  'name',
  'slug',
  'description',
  'phone',
  'email',
  'address',
  'city',
  'state',
  'postal_code',
  'latitude',
  'longitude',
  'status',
];

const VALID_STATUSES = ['active', 'inactive', 'suspended'];

/**
 * GET /api/stores
 * Return all stores in deterministic order (created_at ASC)
 */
const getAllStores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, slug, description, phone, email,
        address, city, state, postal_code, latitude, longitude,
        status, created_at, updated_at
      FROM stores
      ORDER BY created_at ASC;
    `);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching stores:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stores',
    });
  }
};

/**
 * GET /api/stores/:id
 * Return one store by UUID
 */
const getStoreById = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid store ID format',
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        id, name, slug, description, phone, email,
        address, city, state, postal_code, latitude, longitude,
        status, created_at, updated_at
      FROM stores
      WHERE id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(`Error fetching store by ID (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store',
    });
  }
};

/**
 * GET /api/stores/slug/:slug
 * Return one store by unique slug
 */
const getStoreBySlug = async (req, res) => {
  const { slug } = req.params;

  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Store slug is required',
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        id, name, slug, description, phone, email,
        address, city, state, postal_code, latitude, longitude,
        status, created_at, updated_at
      FROM stores
      WHERE slug = $1;
      `,
      [slug.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(`Error fetching store by slug (${slug}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store',
    });
  }
};

/**
 * POST /api/stores
 * Create a new store using PostgreSQL defaults for id, timestamps, and status
 */
const createStore = async (req, res) => {
  const {
    name,
    slug,
    description,
    phone,
    email,
    address,
    city,
    state,
    postal_code,
    latitude,
    longitude,
    status,
  } = req.body;

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Store name is required and cannot be empty',
    });
  }

  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Store slug is required and cannot be empty',
    });
  }

  // Validate status if provided
  const finalStatus = status ? status.trim().toLowerCase() : 'active';
  if (!VALID_STATUSES.includes(finalStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
    });
  }

  // Validate coordinates if provided
  if (latitude !== undefined && latitude !== null && isNaN(Number(latitude))) {
    return res.status(400).json({
      success: false,
      message: 'Latitude must be a valid number',
    });
  }

  if (longitude !== undefined && longitude !== null && isNaN(Number(longitude))) {
    return res.status(400).json({
      success: false,
      message: 'Longitude must be a valid number',
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `
      INSERT INTO stores (
        name, slug, description, phone, email,
        address, city, state, postal_code, latitude, longitude, status
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11, $12
      )
      RETURNING 
        id, name, slug, description, phone, email,
        address, city, state, postal_code, latitude, longitude,
        status, created_at, updated_at;
      `,
      [
        name.trim(),
        slug.trim().toLowerCase(),
        description || null,
        phone || null,
        email || null,
        address || null,
        city || null,
        state || null,
        postal_code || null,
        latitude !== undefined && latitude !== null ? Number(latitude) : null,
        longitude !== undefined && longitude !== null ? Number(longitude) : null,
        finalStatus,
      ]
    );

    const newStore = result.rows[0];

    // If authenticated user created the store, automatically link them in store_users as 'owner'
    if (req.user && req.user.id) {
      await client.query(
        `
        INSERT INTO store_users (store_id, user_id, role)
        VALUES ($1, $2, 'owner')
        ON CONFLICT (store_id, user_id) DO UPDATE SET role = 'owner';
        `,
        [newStore.id, req.user.id]
      );
    }

    // Initialize default store_settings
    await client.query(
      `
      INSERT INTO store_settings (
        store_id, is_online, accepting_orders, pickup_enabled, delivery_enabled, delivery_base_fee, minimum_order_amount
      ) VALUES (
        $1, true, true, true, true, 0, 0
      )
      ON CONFLICT (store_id) DO NOTHING;
      `,
      [newStore.id]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      data: newStore,
    });
  } catch (error) {
    await client.query('ROLLBACK');

    // Unique violation on slug
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A store with this slug already exists',
      });
    }

    console.error('Error creating store:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create store',
    });
  } finally {
    client.release();
  }
};

/**
 * PATCH /api/stores/:id
 * Update an existing store by UUID
 */
const updateStore = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid store ID format',
    });
  }

  const updates = {};

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  // Check if any valid fields were passed
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields provided for update',
    });
  }

  // Validate individual fields if present
  if (updates.name !== undefined) {
    if (typeof updates.name !== 'string' || updates.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Store name cannot be empty',
      });
    }
    updates.name = updates.name.trim();
  }

  if (updates.slug !== undefined) {
    if (typeof updates.slug !== 'string' || updates.slug.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Store slug cannot be empty',
      });
    }
    updates.slug = updates.slug.trim().toLowerCase();
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

  if (updates.latitude !== undefined && updates.latitude !== null && isNaN(Number(updates.latitude))) {
    return res.status(400).json({
      success: false,
      message: 'Latitude must be a valid number',
    });
  }

  if (updates.longitude !== undefined && updates.longitude !== null && isNaN(Number(updates.longitude))) {
    return res.status(400).json({
      success: false,
      message: 'Longitude must be a valid number',
    });
  }

  // Build parameterized query dynamically
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, val] of Object.entries(updates)) {
    setClauses.push(`${key} = $${paramIndex}`);
    values.push(val);
    paramIndex++;
  }

  // Always update updated_at timestamp
  setClauses.push('updated_at = CURRENT_TIMESTAMP');

  // Add the id parameter for WHERE clause
  values.push(id);

  const queryText = `
    UPDATE stores
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING 
      id, name, slug, description, phone, email,
      address, city, state, postal_code, latitude, longitude,
      status, created_at, updated_at;
  `;

  try {
    const result = await pool.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A store with this slug already exists',
      });
    }

    console.error(`Error updating store (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update store',
    });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  getStoreBySlug,
  createStore,
  updateStore,
};
