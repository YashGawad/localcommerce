const pool = require('../config/db');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

/**
 * Helper to resolve customer_id from authenticated req.user.id
 */
const getCustomerByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT id FROM customers WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] ? result.rows[0].id : null;
};

/**
 * GET /api/customers/me/addresses
 * List all saved addresses for the authenticated customer.
 */
const getCustomerAddresses = async (req, res) => {
  try {
    const customerId = await getCustomerByUserId(req.user.id);
    if (!customerId) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found for this account.',
      });
    }

    const result = await pool.query(
      `
      SELECT 
        id, customer_id, label, recipient_name, phone,
        address_line1, address_line2, city, state, postal_code,
        latitude, longitude, is_default, created_at, updated_at
      FROM customer_addresses
      WHERE customer_id = $1
      ORDER BY is_default DESC, created_at ASC;
      `,
      [customerId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching customer addresses:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve addresses.',
    });
  }
};

/**
 * GET /api/customers/me/addresses/:id
 * Retrieve a specific address by ID, scoped to the authenticated customer.
 */
const getCustomerAddressById = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid address ID format.',
    });
  }

  try {
    const customerId = await getCustomerByUserId(req.user.id);
    if (!customerId) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found for this account.',
      });
    }

    // Must match both address ID and customer_id
    const result = await pool.query(
      `
      SELECT 
        id, customer_id, label, recipient_name, phone,
        address_line1, address_line2, city, state, postal_code,
        latitude, longitude, is_default, created_at, updated_at
      FROM customer_addresses
      WHERE id = $1 AND customer_id = $2;
      `,
      [id, customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(`Error fetching address (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve address.',
    });
  }
};

/**
 * POST /api/customers/me/addresses
 * Create a new address for the authenticated customer.
 */
const createCustomerAddress = async (req, res) => {
  try {
    const customerId = await getCustomerByUserId(req.user.id);
    if (!customerId) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found for this account.',
      });
    }

    const {
      label,
      recipient_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      latitude,
      longitude,
      is_default,
    } = req.body;

    // Validate required fields
    if (!label || typeof label !== 'string' || label.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Label is required and cannot be empty.',
      });
    }
    if (!recipient_name || typeof recipient_name !== 'string' || recipient_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Recipient name is required and cannot be empty.',
      });
    }
    if (!address_line1 || typeof address_line1 !== 'string' || address_line1.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Address line 1 is required and cannot be empty.',
      });
    }
    if (!city || typeof city !== 'string' || city.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'City is required and cannot be empty.',
      });
    }
    if (!state || typeof state !== 'string' || state.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'State is required and cannot be empty.',
      });
    }
    if (!postal_code || typeof postal_code !== 'string' || postal_code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Postal code is required and cannot be empty.',
      });
    }

    // Optional numeric coordinates validation
    if (latitude !== undefined && latitude !== null && isNaN(Number(latitude))) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be a valid number.',
      });
    }
    if (longitude !== undefined && longitude !== null && isNaN(Number(longitude))) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be a valid number.',
      });
    }

    const shouldBeDefault = is_default === true;

    // Transaction for setting default address atomically
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (shouldBeDefault) {
        await client.query(
          'UPDATE customer_addresses SET is_default = false, updated_at = CURRENT_TIMESTAMP WHERE customer_id = $1 AND is_default = true',
          [customerId]
        );
      }

      const insertRes = await client.query(
        `
        INSERT INTO customer_addresses (
          customer_id,
          label,
          recipient_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          latitude,
          longitude,
          is_default
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
        RETURNING 
          id, customer_id, label, recipient_name, phone,
          address_line1, address_line2, city, state, postal_code,
          latitude, longitude, is_default, created_at, updated_at;
        `,
        [
          customerId,
          label.trim(),
          recipient_name.trim(),
          phone && typeof phone === 'string' ? phone.trim() : null,
          address_line1.trim(),
          address_line2 && typeof address_line2 === 'string' ? address_line2.trim() : null,
          city.trim(),
          state.trim(),
          postal_code.trim(),
          latitude !== undefined && latitude !== null ? Number(latitude) : null,
          longitude !== undefined && longitude !== null ? Number(longitude) : null,
          shouldBeDefault,
        ]
      );

      await client.query('COMMIT');

      return res.status(201).json({
        success: true,
        message: 'Address created successfully.',
        data: insertRes.rows[0],
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error inserting address:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to create address.',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in createCustomerAddress:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating address.',
    });
  }
};

/**
 * PATCH /api/customers/me/addresses/:id
 * Update an existing address belonging to the authenticated customer.
 */
const updateCustomerAddress = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid address ID format.',
    });
  }

  try {
    const customerId = await getCustomerByUserId(req.user.id);
    if (!customerId) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found for this account.',
      });
    }

    // Verify address exists and belongs to this customer
    const checkRes = await pool.query(
      'SELECT id, is_default FROM customer_addresses WHERE id = $1 AND customer_id = $2',
      [id, customerId]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    const allowedFields = [
      'label',
      'recipient_name',
      'phone',
      'address_line1',
      'address_line2',
      'city',
      'state',
      'postal_code',
      'latitude',
      'longitude',
      'is_default',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
      });
    }

    // Validate string fields
    for (const strField of ['label', 'recipient_name', 'address_line1', 'city', 'state', 'postal_code']) {
      if (updates[strField] !== undefined) {
        if (typeof updates[strField] !== 'string' || updates[strField].trim() === '') {
          return res.status(400).json({
            success: false,
            message: `${strField} cannot be empty.`,
          });
        }
        updates[strField] = updates[strField].trim();
      }
    }

    if (updates.phone !== undefined) {
      if (updates.phone !== null && typeof updates.phone !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Phone must be a valid string or null.',
        });
      }
      updates.phone = updates.phone ? updates.phone.trim() : null;
    }

    if (updates.address_line2 !== undefined) {
      if (updates.address_line2 !== null && typeof updates.address_line2 !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Address line 2 must be a valid string or null.',
        });
      }
      updates.address_line2 = updates.address_line2 ? updates.address_line2.trim() : null;
    }

    if (updates.latitude !== undefined && updates.latitude !== null) {
      if (isNaN(Number(updates.latitude))) {
        return res.status(400).json({
          success: false,
          message: 'Latitude must be a valid number.',
        });
      }
      updates.latitude = Number(updates.latitude);
    }

    if (updates.longitude !== undefined && updates.longitude !== null) {
      if (isNaN(Number(updates.longitude))) {
        return res.status(400).json({
          success: false,
          message: 'Longitude must be a valid number.',
        });
      }
      updates.longitude = Number(updates.longitude);
    }

    if (updates.is_default !== undefined) {
      if (typeof updates.is_default !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'is_default must be a boolean.',
        });
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If making this address the default, unset other default addresses for this customer
      if (updates.is_default === true) {
        await client.query(
          'UPDATE customer_addresses SET is_default = false, updated_at = CURRENT_TIMESTAMP WHERE customer_id = $1 AND is_default = true AND id != $2',
          [customerId, id]
        );
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
      const idParam = paramIndex++;
      values.push(customerId);
      const custParam = paramIndex;

      const queryText = `
        UPDATE customer_addresses
        SET ${setClauses.join(', ')}
        WHERE id = $${idParam} AND customer_id = $${custParam}
        RETURNING 
          id, customer_id, label, recipient_name, phone,
          address_line1, address_line2, city, state, postal_code,
          latitude, longitude, is_default, created_at, updated_at;
      `;

      const updateRes = await client.query(queryText, values);
      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Address updated successfully.',
        data: updateRes.rows[0],
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error updating address:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to update address.',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in updateCustomerAddress:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating address.',
    });
  }
};

/**
 * DELETE /api/customers/me/addresses/:id
 * Delete an existing address belonging to the authenticated customer.
 */
const deleteCustomerAddress = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid address ID format.',
    });
  }

  try {
    const customerId = await getCustomerByUserId(req.user.id);
    if (!customerId) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found for this account.',
      });
    }

    // Must delete strictly WHERE id = $1 AND customer_id = $2
    const result = await pool.query(
      'DELETE FROM customer_addresses WHERE id = $1 AND customer_id = $2 RETURNING id;',
      [id, customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (error) {
    console.error(`Error deleting address (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete address.',
    });
  }
};

module.exports = {
  getCustomerAddresses,
  getCustomerAddressById,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
};
