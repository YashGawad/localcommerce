const pool = require('../config/db');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

const VALID_FULFILLMENT_TYPES = ['delivery', 'pickup'];
const VALID_PAYMENT_METHODS = ['cod', 'upi', 'card', 'net_banking'];

/**
 * Lifecycle transitions map:
 * Defines valid next statuses from a given current status.
 */
const LIFECYCLE_TRANSITIONS = {
  delivery: {
    PLACED: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['OUT_FOR_DELIVERY', 'CANCELLED'],
    OUT_FOR_DELIVERY: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  },
  pickup: {
    PLACED: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
    READY_FOR_PICKUP: ['PICKED_UP', 'CANCELLED'],
    PICKED_UP: [],
    CANCELLED: [],
  },
};

/**
 * Helper to fetch complete order with items and payment details.
 */
const getFullOrderById = async (orderId, dbClient = pool) => {
  const result = await dbClient.query(
    `
    SELECT 
      o.id,
      o.order_number,
      o.store_id,
      o.customer_id,
      o.status,
      o.fulfillment_type,
      o.subtotal,
      o.discount_amount,
      o.delivery_fee,
      o.tax_amount,
      o.total_amount,
      o.discount_id,
      o.payment_method,
      o.payment_status,
      o.delivery_address_line1,
      o.delivery_address_line2,
      o.delivery_address_city,
      o.delivery_address_state,
      o.delivery_address_postal_code,
      o.delivery_recipient_name,
      o.delivery_recipient_phone,
      o.customer_notes,
      o.created_at,
      o.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'store_product_id', oi.store_product_id,
            'product_name', oi.product_name,
            'sku', oi.sku,
            'unit_price', oi.unit_price,
            'quantity', oi.quantity,
            'line_total', oi.line_total
          )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]'
      ) AS items,
      CASE 
        WHEN p.id IS NOT NULL THEN
          json_build_object(
            'id', p.id,
            'payment_method', p.payment_method,
            'status', p.status,
            'amount', p.amount,
            'transaction_reference', p.transaction_reference,
            'paid_at', p.paid_at
          )
        ELSE NULL 
      END AS payment
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN payments p ON o.id = p.order_id
    WHERE o.id = $1
    GROUP BY o.id, p.id;
    `,
    [orderId]
  );

  return result.rows[0] || null;
};

/**
 * POST /api/orders
 * Create a new single-store order with transactional row-locking and inventory decrement.
 */
const createOrder = async (req, res) => {
  // 1. Authenticated customer verification
  const customerRes = await pool.query(
    'SELECT id FROM customers WHERE user_id = $1',
    [req.user.id]
  );

  if (customerRes.rows.length === 0) {
    return res.status(403).json({
      success: false,
      message: 'Only registered customer accounts can place orders.',
    });
  }

  const customerId = customerRes.rows[0].id;
  const {
    store_id,
    items,
    fulfillment_type,
    customer_address_id,
    payment_method,
    customer_notes,
  } = req.body;

  // 2. Validate input parameters
  if (!store_id || !isValidUUID(store_id)) {
    return res.status(400).json({
      success: false,
      message: 'A valid store_id is required.',
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Items must be a non-empty array.',
    });
  }

  const normalizedFulfillment = (fulfillment_type || '').toLowerCase();
  if (!VALID_FULFILLMENT_TYPES.includes(normalizedFulfillment)) {
    return res.status(400).json({
      success: false,
      message: `Invalid fulfillment_type. Allowed values: ${VALID_FULFILLMENT_TYPES.join(', ')}`,
    });
  }

  const normalizedPaymentMethod = (payment_method || '').toLowerCase();
  if (!VALID_PAYMENT_METHODS.includes(normalizedPaymentMethod)) {
    return res.status(400).json({
      success: false,
      message: `Invalid payment_method. Allowed values: ${VALID_PAYMENT_METHODS.join(', ')}`,
    });
  }

  if (normalizedFulfillment === 'delivery') {
    if (!customer_address_id || !isValidUUID(customer_address_id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid customer_address_id is required for delivery orders.',
      });
    }
  }

  // Merge duplicate store_product_ids if present
  const mergedItemsMap = new Map();
  for (const item of items) {
    if (!item.store_product_id || !isValidUUID(item.store_product_id)) {
      return res.status(400).json({
        success: false,
        message: 'Each item must have a valid store_product_id UUID.',
      });
    }

    const qty = Number(item.quantity);
    if (isNaN(qty) || qty <= 0 || !Number.isFinite(qty)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number.',
      });
    }

    const existingQty = mergedItemsMap.get(item.store_product_id) || 0;
    mergedItemsMap.set(item.store_product_id, existingQty + qty);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 3. Verify Store & Store Settings
    const storeRes = await client.query(
      `
      SELECT 
        s.id, s.status,
        ss.is_online, ss.accepting_orders, ss.pickup_enabled, ss.delivery_enabled,
        ss.delivery_base_fee, ss.free_delivery_threshold, ss.minimum_order_amount,
        ss.tax_enabled, ss.tax_percentage
      FROM stores s
      LEFT JOIN store_settings ss ON s.id = ss.store_id
      WHERE s.id = $1;
      `,
      [store_id]
    );

    if (storeRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }

    const store = storeRes.rows[0];

    if (store.status !== 'active' || (store.is_online !== null && (!store.is_online || !store.accepting_orders))) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Store is currently inactive or not accepting orders.',
      });
    }

    if (normalizedFulfillment === 'delivery' && store.delivery_enabled === false) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Delivery is currently disabled for this store.',
      });
    }

    if (normalizedFulfillment === 'pickup' && store.pickup_enabled === false) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Pickup is currently disabled for this store.',
      });
    }

    // 4. Validate Delivery Address Snapshot (if delivery)
    let addressSnapshot = {
      delivery_address_line1: null,
      delivery_address_line2: null,
      delivery_address_city: null,
      delivery_address_state: null,
      delivery_address_postal_code: null,
      delivery_recipient_name: null,
      delivery_recipient_phone: null,
    };

    if (normalizedFulfillment === 'delivery') {
      const addrRes = await client.query(
        `
        SELECT address_line1, address_line2, city, state, postal_code, recipient_name, phone
        FROM customer_addresses
        WHERE id = $1 AND customer_id = $2;
        `,
        [customer_address_id, customerId]
      );

      if (addrRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Delivery address not found or does not belong to you.',
        });
      }

      const addr = addrRes.rows[0];
      addressSnapshot = {
        delivery_address_line1: addr.address_line1,
        delivery_address_line2: addr.address_line2,
        delivery_address_city: addr.city,
        delivery_address_state: addr.state,
        delivery_address_postal_code: addr.postal_code,
        delivery_recipient_name: addr.recipient_name,
        delivery_recipient_phone: addr.phone,
      };
    }

    // 5. Lock Inventory & Validate Products
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const [productId, quantity] of mergedItemsMap.entries()) {
      // FOR UPDATE locks the product row to prevent race conditions & overselling
      const prodRes = await client.query(
        `
        SELECT id, store_id, name, sku, price, stock_quantity, status
        FROM store_products
        WHERE id = $1
        FOR UPDATE;
        `,
        [productId]
      );

      if (prodRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} not found.`,
        });
      }

      const product = prodRes.rows[0];

      // Multi-tenant check: Every product MUST belong to the requested store
      if (product.store_id !== store_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `All items in an order must belong to the requested store. Product "${product.name}" belongs to another store.`,
        });
      }

      if (product.status !== 'active') {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: `Product "${product.name}" is currently inactive or unavailable.`,
        });
      }

      const currentStock = Number(product.stock_quantity);
      if (currentStock < quantity) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for product "${product.name}". Available: ${currentStock}, requested: ${quantity}.`,
        });
      }

      const unitPrice = Number(product.price);
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        store_product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        unit_price: unitPrice,
        quantity: quantity,
        line_total: lineTotal,
      });
    }

    calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;

    // 6. Minimum Order Amount Check
    const minOrder = store.minimum_order_amount !== null ? Number(store.minimum_order_amount) : 0;
    if (minOrder > 0 && calculatedSubtotal < minOrder) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `Order subtotal ₹${calculatedSubtotal.toFixed(2)} is less than the minimum required order amount of ₹${minOrder.toFixed(2)}.`,
      });
    }

    // 7. Delivery Fee Calculation
    let deliveryFee = 0;
    if (normalizedFulfillment === 'delivery') {
      const baseFee = store.delivery_base_fee !== null ? Number(store.delivery_base_fee) : 0;
      const freeThreshold = store.free_delivery_threshold !== null ? Number(store.free_delivery_threshold) : null;

      if (freeThreshold !== null && calculatedSubtotal >= freeThreshold) {
        deliveryFee = 0;
      } else {
        deliveryFee = baseFee;
      }
    }

    // 8. Tax Calculation
    let taxAmount = 0;
    if (store.tax_enabled && store.tax_percentage !== null && Number(store.tax_percentage) > 0) {
      taxAmount = Math.round((calculatedSubtotal * Number(store.tax_percentage) / 100) * 100) / 100;
    }

    // 9. Total Calculation (discount is 0 for this milestone)
    const discountAmount = 0;
    const totalAmount = Math.round((calculatedSubtotal + deliveryFee + taxAmount - discountAmount) * 100) / 100;

    // 10. Generate Unique Order Number
    const orderNumber = `LC-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

    // 11. Insert Order Record
    const orderInsertRes = await client.query(
      `
      INSERT INTO orders (
        order_number,
        store_id,
        customer_id,
        status,
        fulfillment_type,
        subtotal,
        discount_amount,
        delivery_fee,
        tax_amount,
        total_amount,
        payment_method,
        payment_status,
        delivery_address_line1,
        delivery_address_line2,
        delivery_address_city,
        delivery_address_state,
        delivery_address_postal_code,
        delivery_recipient_name,
        delivery_recipient_phone,
        customer_notes
      ) VALUES (
        $1, $2, $3, 'PLACED', $4, $5, $6, $7, $8, $9, $10, 'PENDING',
        $11, $12, $13, $14, $15, $16, $17, $18
      )
      RETURNING id;
      `,
      [
        orderNumber,
        store_id,
        customerId,
        normalizedFulfillment,
        calculatedSubtotal.toFixed(2),
        discountAmount.toFixed(2),
        deliveryFee.toFixed(2),
        taxAmount.toFixed(2),
        totalAmount.toFixed(2),
        normalizedPaymentMethod,
        addressSnapshot.delivery_address_line1,
        addressSnapshot.delivery_address_line2,
        addressSnapshot.delivery_address_city,
        addressSnapshot.delivery_address_state,
        addressSnapshot.delivery_address_postal_code,
        addressSnapshot.delivery_recipient_name,
        addressSnapshot.delivery_recipient_phone,
        customer_notes && typeof customer_notes === 'string' ? customer_notes.trim() : null,
      ]
    );

    const createdOrderId = orderInsertRes.rows[0].id;

    // 12. Insert Order Items & Decrement Stock
    for (const item of validatedItems) {
      await client.query(
        `
        INSERT INTO order_items (
          order_id, store_product_id, product_name, sku, unit_price, quantity, line_total
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        );
        `,
        [
          createdOrderId,
          item.store_product_id,
          item.product_name,
          item.sku,
          item.unit_price.toFixed(2),
          item.quantity,
          item.line_total.toFixed(2),
        ]
      );

      // Inventory decrement
      await client.query(
        `
        UPDATE store_products
        SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
        `,
        [item.quantity, item.store_product_id]
      );
    }

    // 13. Create Payment Record (V1 Database Recording)
    await client.query(
      `
      INSERT INTO payments (
        order_id, payment_method, status, amount, transaction_reference
      ) VALUES (
        $1, $2, 'PENDING', $3, $4
      );
      `,
      [
        createdOrderId,
        normalizedPaymentMethod,
        totalAmount.toFixed(2),
        `${normalizedPaymentMethod.toUpperCase()}-${orderNumber}`,
      ]
    );

    await client.query('COMMIT');

    // 14. Fetch freshly created order details
    const fullOrder = await getFullOrderById(createdOrderId);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: fullOrder,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to place order due to a server error.',
    });
  } finally {
    client.release();
  }
};

/**
 * GET /api/orders
 * List orders with strict role-based access control.
 */
const getOrders = async (req, res) => {
  const { store_id } = req.query;

  try {
    const userRole = (req.user.role || '').toLowerCase();

    // 1. Customer Role: strictly limited to own orders
    if (userRole === 'customer') {
      const custRes = await pool.query('SELECT id FROM customers WHERE user_id = $1', [req.user.id]);
      if (custRes.rows.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }

      const customerId = custRes.rows[0].id;
      const ordersRes = await pool.query(
        `
        SELECT 
          o.id, o.order_number, o.store_id, o.customer_id, o.status, o.fulfillment_type,
          o.subtotal, o.discount_amount, o.delivery_fee, o.tax_amount, o.total_amount,
          o.payment_method, o.payment_status, o.created_at, o.updated_at,
          s.name AS store_name
        FROM orders o
        JOIN stores s ON o.store_id = s.id
        WHERE o.customer_id = $1
        ORDER BY o.created_at DESC;
        `,
        [customerId]
      );

      return res.status(200).json({
        success: true,
        data: ordersRes.rows,
      });
    }

    // 2. Admin Role: can view all orders, optionally filtered by store_id
    if (userRole === 'admin') {
      if (store_id) {
        if (!isValidUUID(store_id)) {
          return res.status(400).json({ success: false, message: 'Invalid store_id format.' });
        }
        const ordersRes = await pool.query(
          `
          SELECT 
            o.id, o.order_number, o.store_id, o.customer_id, o.status, o.fulfillment_type,
            o.subtotal, o.discount_amount, o.delivery_fee, o.tax_amount, o.total_amount,
            o.payment_method, o.payment_status, o.created_at, o.updated_at,
            s.name AS store_name
          FROM orders o
          JOIN stores s ON o.store_id = s.id
          WHERE o.store_id = $1
          ORDER BY o.created_at DESC;
          `,
          [store_id]
        );
        return res.status(200).json({ success: true, data: ordersRes.rows });
      }

      const ordersRes = await pool.query(
        `
        SELECT 
          o.id, o.order_number, o.store_id, o.customer_id, o.status, o.fulfillment_type,
          o.subtotal, o.discount_amount, o.delivery_fee, o.tax_amount, o.total_amount,
          o.payment_method, o.payment_status, o.created_at, o.updated_at,
          s.name AS store_name
        FROM orders o
        JOIN stores s ON o.store_id = s.id
        ORDER BY o.created_at DESC;
        `
      );
      return res.status(200).json({ success: true, data: ordersRes.rows });
    }

    // 3. Store Users (owner, manager, staff, delivery_staff): restricted to authorized stores
    const userStoresRes = await pool.query(
      'SELECT store_id, role FROM store_users WHERE user_id = $1',
      [req.user.id]
    );

    if (userStoresRes.rows.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const authorizedStoreIds = userStoresRes.rows.map((r) => r.store_id);

    if (store_id) {
      if (!isValidUUID(store_id)) {
        return res.status(400).json({ success: false, message: 'Invalid store_id format.' });
      }
      if (!authorizedStoreIds.includes(store_id)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. You do not have permission to view orders for this store.',
        });
      }

      const ordersRes = await pool.query(
        `
        SELECT 
          o.id, o.order_number, o.store_id, o.customer_id, o.status, o.fulfillment_type,
          o.subtotal, o.discount_amount, o.delivery_fee, o.tax_amount, o.total_amount,
          o.payment_method, o.payment_status, o.created_at, o.updated_at,
          s.name AS store_name
        FROM orders o
        JOIN stores s ON o.store_id = s.id
        WHERE o.store_id = $1
        ORDER BY o.created_at DESC;
        `,
        [store_id]
      );
      return res.status(200).json({ success: true, data: ordersRes.rows });
    }

    // Return orders across all stores user is authorized for
    const ordersRes = await pool.query(
      `
      SELECT 
        o.id, o.order_number, o.store_id, o.customer_id, o.status, o.fulfillment_type,
        o.subtotal, o.discount_amount, o.delivery_fee, o.tax_amount, o.total_amount,
        o.payment_method, o.payment_status, o.created_at, o.updated_at,
        s.name AS store_name
      FROM orders o
      JOIN stores s ON o.store_id = s.id
      WHERE o.store_id = ANY($1)
      ORDER BY o.created_at DESC;
      `,
      [authorizedStoreIds]
    );

    return res.status(200).json({ success: true, data: ordersRes.rows });
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders.',
    });
  }
};

/**
 * GET /api/orders/:id
 * Retrieve a specific order with full item snapshot and payment details.
 */
const getOrderById = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID format.',
    });
  }

  try {
    const order = await getFullOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const userRole = (req.user.role || '').toLowerCase();

    // 1. Platform Admin
    if (userRole === 'admin') {
      return res.status(200).json({ success: true, data: order });
    }

    // 2. Customer
    if (userRole === 'customer') {
      const custRes = await pool.query('SELECT id FROM customers WHERE user_id = $1', [req.user.id]);
      if (custRes.rows.length === 0 || custRes.rows[0].id !== order.customer_id) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }
      return res.status(200).json({ success: true, data: order });
    }

    // 3. Store Users (owner, manager, staff, delivery_staff)
    const membershipRes = await pool.query(
      'SELECT role FROM store_users WHERE user_id = $1 AND store_id = $2',
      [req.user.id, order.store_id]
    );

    if (membershipRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(`Error fetching order (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order.',
    });
  }
};

/**
 * PATCH /api/orders/:id/status
 * Update order status based on lifecycle transition rules and actor permissions.
 */
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID format.',
    });
  }

  const { status: targetStatus } = req.body;
  if (!targetStatus || typeof targetStatus !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Status is required and must be a valid string.',
    });
  }

  const normalizedTarget = targetStatus.trim().toUpperCase();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch order with row lock
    const orderRes = await client.query(
      `
      SELECT id, store_id, customer_id, status, fulfillment_type
      FROM orders
      WHERE id = $1
      FOR UPDATE;
      `,
      [id]
    );

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const order = orderRes.rows[0];
    const currentStatus = order.status;
    const fulfillmentType = order.fulfillment_type;

    // Check transition rules
    const allowedTransitions = (LIFECYCLE_TRANSITIONS[fulfillmentType] || {})[currentStatus] || [];
    if (!allowedTransitions.includes(normalizedTarget)) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `Invalid status transition from "${currentStatus}" to "${normalizedTarget}" for fulfillment type "${fulfillmentType}". Allowed transitions: [${allowedTransitions.join(', ')}]`,
      });
    }

    // Role-based transition authorization
    const userRole = (req.user.role || '').toLowerCase();

    // 1. Customer: Can only cancel their own order while it is still PLACED or CONFIRMED
    if (userRole === 'customer') {
      const custRes = await client.query('SELECT id FROM customers WHERE user_id = $1', [req.user.id]);
      if (custRes.rows.length === 0 || custRes.rows[0].id !== order.customer_id) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      if (normalizedTarget !== 'CANCELLED') {
        await client.query('ROLLBACK');
        return res.status(403).json({
          success: false,
          message: 'Customers are only permitted to cancel their own orders.',
        });
      }
    } else if (userRole === 'admin') {
      // Platform admin check: admin cannot casually mutate store-operational orders
      // For this milestone, keep platform and merchant roles separated
    } else {
      // Store-level roles: check membership in store_users
      const memberRes = await client.query(
        'SELECT role FROM store_users WHERE user_id = $1 AND store_id = $2',
        [req.user.id, order.store_id]
      );

      if (memberRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(403).json({
          success: false,
          message: 'Forbidden. You do not have permissions for this store order.',
        });
      }

      const storeRole = (memberRes.rows[0].role || '').toLowerCase();

      // Delivery staff: strictly limited to delivery dispatch transitions
      if (storeRole === 'delivery_staff') {
        const allowedDeliveryTransitions = ['OUT_FOR_DELIVERY', 'DELIVERED'];
        if (!allowedDeliveryTransitions.includes(normalizedTarget)) {
          await client.query('ROLLBACK');
          return res.status(403).json({
            success: false,
            message: `Delivery staff can only update status to [${allowedDeliveryTransitions.join(', ')}].`,
          });
        }
      }
    }

    // Execute Status Update
    await client.query(
      `
      UPDATE orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
      `,
      [normalizedTarget, id]
    );

    // If order was cancelled, restock product quantities
    if (normalizedTarget === 'CANCELLED') {
      await client.query(
        `
        UPDATE store_products sp
        SET stock_quantity = sp.stock_quantity + oi.quantity, updated_at = CURRENT_TIMESTAMP
        FROM order_items oi
        WHERE oi.order_id = $1 AND sp.id = oi.store_product_id;
        `,
        [id]
      );
    }

    await client.query('COMMIT');

    const updatedOrder = await getFullOrderById(id);

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${normalizedTarget}.`,
      data: updatedOrder,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error updating order status (${id}):`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status.',
    });
  } finally {
    client.release();
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
