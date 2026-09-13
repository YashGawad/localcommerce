const pool = require('../config/db');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

/**
 * Sanitize payment output object
 * Ensures sensitive internal fields, passwords, or tokens are never leaked.
 */
const sanitizePayment = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    order_id: row.order_id,
    payment_method: row.payment_method,
    status: row.status,
    amount: row.amount !== undefined && row.amount !== null ? Number(row.amount) : undefined,
    transaction_reference: row.transaction_reference || null,
    paid_at: row.paid_at || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    order_number: row.order_number || undefined,
    store_id: row.store_id || undefined,
    customer_id: row.customer_id || undefined,
  };
};

/**
 * Helper: Resolve customer ID for authenticated user
 */
const getCustomerIdByUserId = async (userId, dbClient = pool) => {
  const res = await dbClient.query('SELECT id FROM customers WHERE user_id = $1', [userId]);
  return res.rows[0]?.id || null;
};

/**
 * GET /api/orders/:orderId/payment
 * Retrieve payment for an order.
 * - Customer: allowed only for own orders
 * - Store owner / manager: allowed only for orders in their store
 * - Platform admin: allowed platform-wide
 */
const getOrderPayment = async (req, res) => {
  const { orderId } = req.params;

  if (!isValidUUID(orderId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID format.',
    });
  }

  const user = req.user;
  const userRole = (user.role || '').toLowerCase();

  try {
    // 1. Fetch order
    const orderRes = await pool.query(
      `
      SELECT id, order_number, store_id, customer_id, total_amount, payment_method, payment_status, status
      FROM orders
      WHERE id = $1;
      `,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const order = orderRes.rows[0];

    // 2. Authorize actor
    if (userRole === 'admin') {
      // Platform admin permitted
    } else if (userRole === 'customer') {
      const customerId = await getCustomerIdByUserId(user.id);
      if (!customerId || customerId !== order.customer_id) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }
    } else {
      // Store staff / manager / owner
      const memberRes = await pool.query(
        'SELECT role FROM store_users WHERE user_id = $1 AND store_id = $2',
        [user.id, order.store_id]
      );
      if (memberRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }
    }

    // 3. Fetch payment
    const paymentRes = await pool.query(
      `
      SELECT p.id, p.order_id, p.payment_method, p.status, p.amount, p.transaction_reference, p.paid_at, p.created_at, p.updated_at,
             o.order_number, o.store_id, o.customer_id
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE p.order_id = $1;
      `,
      [orderId]
    );

    if (paymentRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found for this order.',
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizePayment(paymentRes.rows[0]),
    });
  } catch (error) {
    console.error(`Error retrieving order payment (${orderId}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order payment.',
    });
  }
};

/**
 * GET /api/payments/:id
 * Retrieve payment details by payment ID with scoped authorization.
 * Authorized actors:
 * - Customer who owns the order
 * - Store owner / manager of the order's store
 * - Platform admin
 */
const getPaymentById = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment ID format.',
    });
  }

  const user = req.user;
  const userRole = (user.role || '').toLowerCase();

  try {
    const paymentRes = await pool.query(
      `
      SELECT p.id, p.order_id, p.payment_method, p.status, p.amount, p.transaction_reference, p.paid_at, p.created_at, p.updated_at,
             o.order_number, o.store_id, o.customer_id
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE p.id = $1;
      `,
      [id]
    );

    if (paymentRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found.',
      });
    }

    const payment = paymentRes.rows[0];

    // Authorization check
    if (userRole === 'admin') {
      // Platform admin allowed
    } else if (userRole === 'customer') {
      const customerId = await getCustomerIdByUserId(user.id);
      if (!customerId || customerId !== payment.customer_id) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found.',
        });
      }
    } else {
      // Store-level check: must have appropriate role in store_users
      const memberRes = await pool.query(
        'SELECT role FROM store_users WHERE user_id = $1 AND store_id = $2',
        [user.id, payment.store_id]
      );
      if (memberRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found.',
        });
      }
      const role = (memberRes.rows[0].role || '').toLowerCase();
      if (!['owner', 'manager', 'staff'].includes(role)) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: sanitizePayment(payment),
    });
  } catch (error) {
    console.error(`Error retrieving payment (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment.',
    });
  }
};

/**
 * POST /api/orders/:orderId/payment/pay
 * Mock development payment success operation.
 * Synchronizes payments.status = 'PAID' and orders.payment_status = 'PAID' atomically.
 * Actor: Customer who owns the order.
 */
const mockPaymentSuccess = async (req, res) => {
  const { orderId } = req.params;

  if (!isValidUUID(orderId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID format.',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify customer actor
    const customerId = await getCustomerIdByUserId(req.user.id, client);
    if (!customerId) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only customer accounts can initiate payments.',
      });
    }

    // 2. Fetch and lock order row
    const orderRes = await client.query(
      `
      SELECT id, order_number, store_id, customer_id, status, payment_method, payment_status, total_amount
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

    // Verify order ownership
    if (order.customer_id !== customerId) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // 3. Verify payment method is eligible for online simulation (COD cannot be paid online)
    if (order.payment_method === 'cod') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cash on delivery (COD) orders cannot be paid online. Payment is collected upon delivery.',
      });
    }

    // 4. Verify order is not cancelled
    if (order.status === 'CANCELLED') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Cannot process payment for a cancelled order.',
      });
    }

    // 5. Fetch and lock payment row
    const paymentRes = await client.query(
      `
      SELECT id, order_id, payment_method, status, amount, transaction_reference, paid_at
      FROM payments
      WHERE order_id = $1
      FOR UPDATE;
      `,
      [orderId]
    );

    if (paymentRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Payment record not found for this order.',
      });
    }

    const payment = paymentRes.rows[0];

    // 6. Verify current payment state
    if (payment.status === 'PAID') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Payment has already been completed for this order.',
      });
    }

    if (payment.status !== 'PENDING') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `Cannot process payment. Current payment status is "${payment.status}". Expected "PENDING".`,
      });
    }

    // 7. Verify Amount Integrity (derive strictly from database, do not trust client body)
    if (Number(payment.amount) !== Number(order.total_amount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Payment amount integrity check failed: payment amount (₹${payment.amount}) does not match order total (₹${order.total_amount}).`,
      });
    }

    // 8. Generate safe mock transaction reference
    const txnRef = payment.transaction_reference || `MOCK-${order.payment_method.toUpperCase()}-${order.order_number}`;

    // 9. Execute atomic updates in the SAME database transaction
    const updatedPaymentRes = await client.query(
      `
      UPDATE payments
      SET status = 'PAID',
          paid_at = CURRENT_TIMESTAMP,
          transaction_reference = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
      `,
      [txnRef, payment.id]
    );

    await client.query(
      `
      UPDATE orders
      SET payment_status = 'PAID',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
      `,
      [orderId]
    );

    // CRITICAL: orders.status is NOT changed! Payment status and order status are separate.

    await client.query('COMMIT');

    const updatedPayment = {
      ...updatedPaymentRes.rows[0],
      order_number: order.order_number,
      store_id: order.store_id,
      customer_id: order.customer_id,
    };

    return res.status(200).json({
      success: true,
      message: 'Mock payment processed successfully.',
      data: sanitizePayment(updatedPayment),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error processing mock payment for order (${orderId}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process payment.',
    });
  } finally {
    client.release();
  }
};

/**
 * POST /api/orders/:orderId/payment/fail
 * Mock development payment failure operation.
 * Synchronizes payments.status = 'FAILED' and orders.payment_status = 'FAILED' atomically.
 * Actor: Customer who owns the order.
 */
const mockPaymentFailure = async (req, res) => {
  const { orderId } = req.params;

  if (!isValidUUID(orderId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID format.',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify customer actor
    const customerId = await getCustomerIdByUserId(req.user.id, client);
    if (!customerId) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only customer accounts can simulate payment failure.',
      });
    }

    // 2. Fetch and lock order row
    const orderRes = await client.query(
      `
      SELECT id, order_number, store_id, customer_id, status, payment_method, payment_status, total_amount
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

    // Verify order ownership
    if (order.customer_id !== customerId) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // 3. Verify payment method is not COD
    if (order.payment_method === 'cod') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'COD orders do not support online payment failure simulation.',
      });
    }

    // 4. Verify order is not cancelled
    if (order.status === 'CANCELLED') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Cannot fail payment for a cancelled order.',
      });
    }

    // 5. Fetch and lock payment row
    const paymentRes = await client.query(
      `
      SELECT id, order_id, payment_method, status, amount, transaction_reference, paid_at
      FROM payments
      WHERE order_id = $1
      FOR UPDATE;
      `,
      [orderId]
    );

    if (paymentRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Payment record not found for this order.',
      });
    }

    const payment = paymentRes.rows[0];

    // 6. Verify current payment state
    if (payment.status === 'PAID') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Cannot fail a payment that has already been completed.',
      });
    }

    if (payment.status === 'FAILED') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Payment has already been marked as failed.',
      });
    }

    if (payment.status !== 'PENDING') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `Cannot fail payment from status "${payment.status}". Expected "PENDING".`,
      });
    }

    // 7. Execute atomic updates in the SAME database transaction
    const updatedPaymentRes = await client.query(
      `
      UPDATE payments
      SET status = 'FAILED',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
      `,
      [payment.id]
    );

    await client.query(
      `
      UPDATE orders
      SET payment_status = 'FAILED',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
      `,
      [orderId]
    );

    // CRITICAL: orders.status is NOT changed.
    // Inventory, subtotal, delivery fee, tax, discount are completely untouched.

    await client.query('COMMIT');

    const updatedPayment = {
      ...updatedPaymentRes.rows[0],
      order_number: order.order_number,
      store_id: order.store_id,
      customer_id: order.customer_id,
    };

    return res.status(200).json({
      success: true,
      message: 'Mock payment marked as failed.',
      data: sanitizePayment(updatedPayment),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error failing mock payment for order (${orderId}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment status.',
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getOrderPayment,
  getPaymentById,
  mockPaymentSuccess,
  mockPaymentFailure,
};
