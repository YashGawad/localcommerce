const pool = require('../config/db');

/**
 * GET /api/customers/me
 * Retrieve profile information for the authenticated customer.
 */
const getCustomerProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        c.id,
        c.user_id,
        u.name,
        u.email,
        u.phone,
        c.created_at,
        c.updated_at
      FROM customers c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = $1;
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found for this account.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        customer: result.rows[0],
      },
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer profile.',
    });
  }
};

/**
 * PATCH /api/customers/me
 * Update authenticated customer profile fields (name, phone).
 * Protects system/identity fields (id, customer_id, user_id, role, status, email, password_hash).
 */
const updateCustomerProfile = async (req, res) => {
  try {
    // 1. Verify customer profile exists for this authenticated user
    const customerCheck = await pool.query(
      'SELECT id FROM customers WHERE user_id = $1',
      [req.user.id]
    );

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found for this account.',
      });
    }

    const { name, phone } = req.body;
    const updates = {};

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty.',
        });
      }
      updates.name = name.trim();
    }

    // Validate phone if provided
    if (phone !== undefined) {
      if (phone === null) {
        updates.phone = null;
      } else if (typeof phone === 'string') {
        updates.phone = phone.trim();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Phone must be a valid string or null.',
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update. Allowed fields: name, phone.',
      });
    }

    // 2. Build parameterized query for users table
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, val] of Object.entries(updates)) {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(val);
      paramIndex++;
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.user.id);

    await pool.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // 3. Keep customers updated_at aligned
    await pool.query(
      'UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [req.user.id]
    );

    // 4. Return refreshed customer profile
    const result = await pool.query(
      `
      SELECT 
        c.id,
        c.user_id,
        u.name,
        u.email,
        u.phone,
        c.created_at,
        c.updated_at
      FROM customers c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = $1;
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        customer: result.rows[0],
      },
    });
  } catch (error) {
    console.error('Error updating customer profile:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update customer profile.',
    });
  }
};

module.exports = {
  getCustomerProfile,
  updateCustomerProfile,
};
