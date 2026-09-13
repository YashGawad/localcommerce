const pool = require('../config/db');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

/**
 * Sanitize assignment response object
 * Ensures sensitive user/store information is never leaked.
 */
const sanitizeAssignment = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    order_id: row.order_id,
    store_id: row.store_id,
    delivery_staff_user_id: row.delivery_staff_user_id,
    status: row.status,
    assigned_at: row.assigned_at,
    started_at: row.started_at,
    delivered_at: row.delivered_at,
    failure_reason: row.failure_reason,
    otp_verified_at: row.otp_verified_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    order_number: row.order_number || undefined,
    order_status: row.order_status || undefined,
    fulfillment_type: row.fulfillment_type || undefined,
    total_amount: row.total_amount !== undefined && row.total_amount !== null ? Number(row.total_amount) : undefined,
    delivery_recipient_name: row.delivery_recipient_name || undefined,
    delivery_recipient_phone: row.delivery_recipient_phone || undefined,
    delivery_address: row.delivery_address_line1
      ? {
          line1: row.delivery_address_line1,
          line2: row.delivery_address_line2,
          city: row.delivery_address_city,
          state: row.delivery_address_state,
          postal_code: row.delivery_address_postal_code,
        }
      : undefined,
    customer_notes: row.customer_notes || undefined,
    store: row.store_name
      ? {
          id: row.store_id,
          name: row.store_name,
          slug: row.store_slug,
          phone: row.store_phone,
        }
      : undefined,
    delivery_staff: row.delivery_staff_name
      ? {
          id: row.delivery_staff_user_id,
          name: row.delivery_staff_name,
          email: row.delivery_staff_email,
          phone: row.delivery_staff_phone,
        }
      : undefined,
  };
};

/**
 * Helper to fetch complete delivery assignment with order, store, and staff details.
 */
const fetchFullAssignmentById = async (assignmentId, dbClient = pool) => {
  const result = await dbClient.query(
    `
    SELECT 
      da.id,
      da.order_id,
      da.store_id,
      da.delivery_staff_user_id,
      da.status,
      da.assigned_at,
      da.started_at,
      da.delivered_at,
      da.failure_reason,
      da.otp_verified_at,
      da.created_at,
      da.updated_at,
      o.order_number,
      o.status AS order_status,
      o.fulfillment_type,
      o.total_amount,
      o.delivery_recipient_name,
      o.delivery_recipient_phone,
      o.delivery_address_line1,
      o.delivery_address_line2,
      o.delivery_address_city,
      o.delivery_address_state,
      o.delivery_address_postal_code,
      o.customer_notes,
      s.name AS store_name,
      s.slug AS store_slug,
      s.phone AS store_phone,
      u.name AS delivery_staff_name,
      u.email AS delivery_staff_email,
      u.phone AS delivery_staff_phone
    FROM delivery_assignments da
    JOIN orders o ON da.order_id = o.id
    JOIN stores s ON da.store_id = s.id
    JOIN users u ON da.delivery_staff_user_id = u.id
    WHERE da.id = $1;
    `,
    [assignmentId]
  );
  return result.rows[0] || null;
};

/**
 * POST /api/orders/:orderId/delivery-assignment
 * Assign or reassign an eligible delivery staff member to a delivery order.
 * Authorized: Store owner or manager for the order's store.
 */
const assignDeliveryOrder = async (req, res) => {
  const { orderId } = req.params;
  const deliveryStaffUserId = req.body?.delivery_staff_user_id || req.body?.deliveryStaffUserId;

  if (!isValidUUID(orderId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID format.',
    });
  }

  if (!deliveryStaffUserId || !isValidUUID(deliveryStaffUserId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid delivery_staff_user_id is required.',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch order with row lock
    const orderRes = await client.query(
      `
      SELECT id, order_number, store_id, status, fulfillment_type
      FROM orders
      WHERE id = $1
      FOR UPDATE;
      `,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const order = orderRes.rows[0];

    // 2. Validate caller authorization: must be owner or manager for order.store_id
    const callerRoleRes = await client.query(
      `
      SELECT role FROM store_users WHERE store_id = $1 AND user_id = $2;
      `,
      [order.store_id, req.user.id]
    );

    const callerRole = (callerRoleRes.rows[0]?.role || '').toLowerCase();
    if (!['owner', 'manager'].includes(callerRole)) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only store owners or managers can assign delivery staff for this store.',
      });
    }

    // 3. Verify fulfillment_type is delivery
    if (order.fulfillment_type !== 'delivery') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Delivery assignments are only allowed for delivery orders.',
      });
    }

    // 4. Verify order is eligible for assignment (not cancelled or already delivered)
    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `Cannot assign delivery for an order that is already ${order.status.toLowerCase()}.`,
      });
    }

    // 5. Verify selected delivery staff user exists and is active
    const staffUserRes = await client.query(
      `SELECT id, name, email, phone, status FROM users WHERE id = $1;`,
      [deliveryStaffUserId]
    );
    if (staffUserRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Selected delivery staff user not found.',
      });
    }
    if (staffUserRes.rows[0].status !== 'active') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Selected delivery staff user account is inactive.',
      });
    }

    // 6. Verify selected delivery staff has delivery_staff role in store_users for this SAME store
    const staffStoreRes = await client.query(
      `SELECT role FROM store_users WHERE store_id = $1 AND user_id = $2;`,
      [order.store_id, deliveryStaffUserId]
    );
    if (staffStoreRes.rows.length === 0 || staffStoreRes.rows[0].role !== 'delivery_staff') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Selected user is not an eligible delivery staff member for this store.',
      });
    }

    // 7. Check existing assignment (reassignment handling)
    const existingAssignRes = await client.query(
      `
      SELECT id, status, delivery_staff_user_id
      FROM delivery_assignments
      WHERE order_id = $1
      FOR UPDATE;
      `,
      [orderId]
    );

    let assignmentRow;
    let isReassignment = false;

    if (existingAssignRes.rows.length > 0) {
      const existing = existingAssignRes.rows[0];
      if (existing.status === 'delivered') {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: 'Cannot reassign an order that has already been delivered.',
        });
      }

      // Reassign to new delivery staff
      const updateRes = await client.query(
        `
        UPDATE delivery_assignments
        SET delivery_staff_user_id = $1,
            status = 'assigned',
            assigned_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
        `,
        [deliveryStaffUserId, existing.id]
      );
      assignmentRow = updateRes.rows[0];
      isReassignment = true;
    } else {
      // Insert new assignment
      const insertRes = await client.query(
        `
        INSERT INTO delivery_assignments (
          order_id,
          store_id,
          delivery_staff_user_id,
          status,
          assigned_at,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, 'assigned', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
        `,
        [orderId, order.store_id, deliveryStaffUserId]
      );
      assignmentRow = insertRes.rows[0];
    }

    await client.query('COMMIT');

    const fullAssignment = await fetchFullAssignmentById(assignmentRow.id);

    return res.status(isReassignment ? 200 : 201).json({
      success: true,
      message: isReassignment ? 'Delivery staff reassigned successfully.' : 'Delivery staff assigned successfully.',
      data: sanitizeAssignment(fullAssignment),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error assigning delivery staff:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign delivery staff.',
    });
  } finally {
    client.release();
  }
};

/**
 * GET /api/delivery/assignments
 * List delivery assignments based on actor role:
 * - Store owner/manager: assignments belonging to their managed stores.
 * - Delivery staff: assignments assigned to them.
 * - Admin: platform-wide assignments.
 * - Customer: 403 Forbidden.
 */
const getDeliveryAssignments = async (req, res) => {
  const user = req.user;
  const userRole = (user.role || '').toLowerCase();

  if (userRole === 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Customers cannot access delivery assignments.',
    });
  }

  try {
    let query = `
      SELECT 
        da.id,
        da.order_id,
        da.store_id,
        da.delivery_staff_user_id,
        da.status,
        da.assigned_at,
        da.started_at,
        da.delivered_at,
        da.failure_reason,
        da.otp_verified_at,
        da.created_at,
        da.updated_at,
        o.order_number,
        o.status AS order_status,
        o.fulfillment_type,
        o.total_amount,
        o.delivery_recipient_name,
        o.delivery_recipient_phone,
        o.delivery_address_line1,
        o.delivery_address_line2,
        o.delivery_address_city,
        o.delivery_address_state,
        o.delivery_address_postal_code,
        o.customer_notes,
        s.name AS store_name,
        s.slug AS store_slug,
        s.phone AS store_phone,
        u.name AS delivery_staff_name,
        u.email AS delivery_staff_email,
        u.phone AS delivery_staff_phone
      FROM delivery_assignments da
      JOIN orders o ON da.order_id = o.id
      JOIN stores s ON da.store_id = s.id
      JOIN users u ON da.delivery_staff_user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (userRole === 'admin') {
      // Platform admin can view all or filter
      if (req.query.store_id && isValidUUID(req.query.store_id)) {
        params.push(req.query.store_id);
        conditions.push(`da.store_id = $${params.length}`);
      }
      if (req.query.status) {
        params.push(req.query.status.toLowerCase());
        conditions.push(`da.status = $${params.length}`);
      }
    } else {
      const storeRoles = user.store_roles || [];
      const managedStores = storeRoles
        .filter((sr) => ['owner', 'manager'].includes((sr.role || '').toLowerCase()))
        .map((sr) => sr.store_id);
      const isDeliveryStaff = storeRoles.some(
        (sr) => (sr.role || '').toLowerCase() === 'delivery_staff'
      ) || userRole === 'delivery_staff';

      if (isDeliveryStaff && (!managedStores.length || req.query.my_deliveries === 'true')) {
        // Delivery staff member inspecting their own deliveries
        params.push(user.id);
        conditions.push(`da.delivery_staff_user_id = $${params.length}`);
      } else if (managedStores.length > 0) {
        // Store owner/manager inspecting deliveries for their store(s)
        params.push(managedStores);
        conditions.push(`da.store_id = ANY($${params.length})`);
        if (req.query.store_id && managedStores.includes(req.query.store_id)) {
          params.push(req.query.store_id);
          conditions.push(`da.store_id = $${params.length}`);
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. Insufficient permissions to view delivery assignments.',
        });
      }

      if (req.query.status) {
        params.push(req.query.status.toLowerCase());
        conditions.push(`da.status = $${params.length}`);
      }
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY da.created_at DESC;`;

    const result = await pool.query(query, params);
    const sanitized = result.rows.map(sanitizeAssignment);

    return res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    console.error('Error fetching delivery assignments:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve delivery assignments.',
    });
  }
};

/**
 * GET /api/delivery/assignments/:id
 * Retrieve assignment details with strict scoped authorization.
 */
const getDeliveryAssignmentById = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid assignment ID format.',
    });
  }

  const user = req.user;
  const userRole = (user.role || '').toLowerCase();

  if (userRole === 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Customers cannot access delivery assignments.',
    });
  }

  try {
    const fullAssignment = await fetchFullAssignmentById(id);

    if (!fullAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.',
      });
    }

    // Tenant / Scoped Authorization check:
    if (userRole === 'admin') {
      // Platform admin allowed
    } else {
      const isAssignedDeliveryStaff = fullAssignment.delivery_staff_user_id === user.id;
      const hasStoreManagement = (user.store_roles || []).some(
        (sr) => sr.store_id === fullAssignment.store_id && ['owner', 'manager'].includes((sr.role || '').toLowerCase())
      );

      if (!isAssignedDeliveryStaff && !hasStoreManagement) {
        // Return 404 to avoid leaking assignment existence across stores or staff
        return res.status(404).json({
          success: false,
          message: 'Assignment not found.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: sanitizeAssignment(fullAssignment),
    });
  } catch (error) {
    console.error(`Error retrieving assignment (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assignment.',
    });
  }
};

/**
 * PATCH /api/delivery/assignments/:id/status
 * Update delivery assignment status and atomically sync the corresponding order status.
 *
 * Transitions:
 * assigned -> out_for_delivery (associated order READY -> OUT_FOR_DELIVERY)
 * out_for_delivery -> delivered (associated order OUT_FOR_DELIVERY -> DELIVERED)
 *
 * Authorized: Assigned delivery staff only.
 */
const updateDeliveryAssignmentStatus = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid assignment ID format.',
    });
  }

  const { status: targetStatus, failure_reason } = req.body;
  if (!targetStatus || typeof targetStatus !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Status is required and must be a string.',
    });
  }

  const normalizedTarget = targetStatus.trim().toLowerCase();
  const allowedStatuses = ['out_for_delivery', 'delivered', 'failed'];
  if (!allowedStatuses.includes(normalizedTarget)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status "${targetStatus}". Allowed values: [${allowedStatuses.join(', ')}].`,
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch assignment with row lock
    const assignRes = await client.query(
      `
      SELECT id, order_id, store_id, delivery_staff_user_id, status
      FROM delivery_assignments
      WHERE id = $1
      FOR UPDATE;
      `,
      [id]
    );

    if (assignRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.',
      });
    }

    const assignment = assignRes.rows[0];

    // 2. Authorize delivery staff: must be assigned to this delivery
    if (assignment.delivery_staff_user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not authorized to update this delivery assignment.',
      });
    }

    // 3. Verify user's store membership is valid delivery_staff for this store
    const memberRes = await client.query(
      `SELECT role FROM store_users WHERE store_id = $1 AND user_id = $2;`,
      [assignment.store_id, req.user.id]
    );
    if (memberRes.rows.length === 0 || memberRes.rows[0].role !== 'delivery_staff') {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Active delivery_staff store membership required.',
      });
    }

    // 4. Validate assignment transition rules
    const currentAssignStatus = assignment.status;
    let expectedCurrentAssignStatus;
    let targetOrderStatus;
    let expectedCurrentOrderStatus;

    if (normalizedTarget === 'out_for_delivery') {
      expectedCurrentAssignStatus = 'assigned';
      targetOrderStatus = 'OUT_FOR_DELIVERY';
      expectedCurrentOrderStatus = 'READY';
    } else if (normalizedTarget === 'delivered') {
      expectedCurrentAssignStatus = 'out_for_delivery';
      targetOrderStatus = 'DELIVERED';
      expectedCurrentOrderStatus = 'OUT_FOR_DELIVERY';
    } else if (normalizedTarget === 'failed') {
      if (!['assigned', 'out_for_delivery'].includes(currentAssignStatus)) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: `Cannot mark assignment as failed from status "${currentAssignStatus}".`,
        });
      }
    }

    if (normalizedTarget !== 'failed' && currentAssignStatus !== expectedCurrentAssignStatus) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `Invalid assignment transition from "${currentAssignStatus}" to "${normalizedTarget}". Expected current status to be "${expectedCurrentAssignStatus}".`,
      });
    }

    // 5. Fetch associated order with row lock
    const orderRes = await client.query(
      `
      SELECT id, status, fulfillment_type, store_id
      FROM orders
      WHERE id = $1
      FOR UPDATE;
      `,
      [assignment.order_id]
    );

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Associated order not found.',
      });
    }

    const order = orderRes.rows[0];

    // Verify order fulfillment_type is delivery
    if (order.fulfillment_type !== 'delivery') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cannot update delivery assignment for non-delivery order.',
      });
    }

    // Verify order status matches the required state
    if (normalizedTarget !== 'failed') {
      if (order.status !== expectedCurrentOrderStatus) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: `Cannot transition assignment to "${normalizedTarget}". Associated order status is "${order.status}", but expected "${expectedCurrentOrderStatus}".`,
        });
      }
    }

    // 6. Execute atomic updates in the SAME database transaction
    if (normalizedTarget === 'out_for_delivery') {
      await client.query(
        `
        UPDATE delivery_assignments
        SET status = 'out_for_delivery',
            started_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1;
        `,
        [id]
      );
      await client.query(
        `
        UPDATE orders
        SET status = 'OUT_FOR_DELIVERY',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1;
        `,
        [assignment.order_id]
      );
    } else if (normalizedTarget === 'delivered') {
      await client.query(
        `
        UPDATE delivery_assignments
        SET status = 'delivered',
            delivered_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1;
        `,
        [id]
      );
      await client.query(
        `
        UPDATE orders
        SET status = 'DELIVERED',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1;
        `,
        [assignment.order_id]
      );
    } else if (normalizedTarget === 'failed') {
      await client.query(
        `
        UPDATE delivery_assignments
        SET status = 'failed',
            failure_reason = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
        `,
        [failure_reason || 'Delivery failed', id]
      );
    }

    await client.query('COMMIT');

    const updatedAssignment = await fetchFullAssignmentById(id);

    return res.status(200).json({
      success: true,
      message: `Delivery assignment updated to ${normalizedTarget}.`,
      data: sanitizeAssignment(updatedAssignment),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error updating assignment status (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update delivery assignment status.',
    });
  } finally {
    client.release();
  }
};

module.exports = {
  assignDeliveryOrder,
  getDeliveryAssignments,
  getDeliveryAssignmentById,
  updateDeliveryAssignmentStatus,
};
