const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/stores/:storeId/staff
 * Retrieve list of staff members linked to the store in store_users.
 * Authorized: Store owner or manager (or platform admin).
 */
const getStoreStaff = async (req, res) => {
  const targetStoreId = req.params.storeId || req.params.id;

  if (!targetStoreId || !isValidUUID(targetStoreId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid store ID format is required.',
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        su.id AS id,
        su.store_id,
        su.user_id,
        su.role,
        su.created_at AS linked_at,
        u.name,
        u.email,
        u.phone,
        u.status,
        u.role AS user_role
      FROM store_users su
      JOIN users u ON su.user_id = u.id
      WHERE su.store_id = $1
      ORDER BY su.created_at ASC;
      `,
      [targetStoreId]
    );

    const staffList = result.rows.map((row) => ({
      id: row.id,
      store_id: row.store_id,
      user_id: row.user_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      user_role: row.user_role,
      status: row.status,
      created_at: row.linked_at,
    }));

    return res.status(200).json({
      success: true,
      data: staffList,
    });
  } catch (error) {
    console.error('Error fetching store staff:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store staff.',
    });
  }
};

/**
 * POST /api/stores/:storeId/staff
 * Create and link a new staff member (e.g. staff or delivery_staff) to the store.
 * Authorized: Store owner or manager (or platform admin).
 */
const addStoreStaff = async (req, res) => {
  const targetStoreId = req.params.storeId || req.params.id;

  if (!targetStoreId || !isValidUUID(targetStoreId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid store ID format is required.',
    });
  }

  const { name, email, phone, role, password } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be at least 2 characters.',
    });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const allowedRoles = ['staff', 'delivery_staff', 'manager'];
  const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : 'staff';
  if (!allowedRoles.includes(normalizedRole)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Allowed values: ${allowedRoles.join(', ')}.`,
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password is required and must be at least 6 characters.',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if user already exists with this email
    const existingUserRes = await client.query(
      `SELECT id, name, email, role, phone, status FROM users WHERE LOWER(email) = $1 FOR UPDATE;`,
      [normalizedEmail]
    );

    let userId;
    let userName = name.trim();
    let userPhone = phone ? phone.trim() : null;
    let userStatus = 'active';

    if (existingUserRes.rows.length > 0) {
      const existingUser = existingUserRes.rows[0];
      userId = existingUser.id;
      userName = existingUser.name;
      userPhone = existingUser.phone || userPhone;
      userStatus = existingUser.status;

      // Check if user is already linked to this store
      const existingStoreUserRes = await client.query(
        `SELECT id, role FROM store_users WHERE store_id = $1 AND user_id = $2;`,
        [targetStoreId, userId]
      );

      if (existingStoreUserRes.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: 'User is already a staff member of this store.',
        });
      }

      // If existing user role is customer, promote user.role if needed or verify compatibility
      if (normalizedRole === 'delivery_staff' && existingUser.role !== 'delivery_staff') {
        // If the user's platform role isn't delivery_staff, update it so delivery assignments pass
        await client.query(
          `UPDATE users SET role = 'delivery_staff', updated_at = CURRENT_TIMESTAMP WHERE id = $1;`,
          [userId]
        );
      }
    } else {
      // 2. Create new user with bcrypt password hash
      const passwordHash = await bcrypt.hash(password, 10);
      const userPlatformRole = normalizedRole; // 'staff' or 'delivery_staff'

      const insertUserRes = await client.query(
        `
        INSERT INTO users (name, email, password_hash, role, phone, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, name, email, role, phone, status, created_at;
        `,
        [name.trim(), normalizedEmail, passwordHash, userPlatformRole, userPhone]
      );

      userId = insertUserRes.rows[0].id;
    }

    // 3. Link user in store_users
    const insertStoreUserRes = await client.query(
      `
      INSERT INTO store_users (store_id, user_id, role, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING id, store_id, user_id, role, created_at;
      `,
      [targetStoreId, userId, normalizedRole]
    );

    const storeUserRow = insertStoreUserRes.rows[0];

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: `${normalizedRole === 'delivery_staff' ? 'Delivery staff' : 'Staff'} member added successfully.`,
      data: {
        id: storeUserRow.id,
        store_id: storeUserRow.store_id,
        user_id: userId,
        name: userName,
        email: normalizedEmail,
        phone: userPhone,
        role: storeUserRow.role,
        status: userStatus,
        created_at: storeUserRow.created_at,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding store staff:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to add staff member.',
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getStoreStaff,
  addStoreStaff,
};
