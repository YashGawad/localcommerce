const pool = require('../config/db');

const API_BASE = 'http://localhost:5000/api';
const DEV_SEED_PASSWORD = process.env.DEV_SEED_PASSWORD || 'Password@123';

const log = (msg) => console.log(msg);
const pass = (testName) => console.log(`  [PASS] ${testName}`);
const fail = (testName, detail) => {
  console.error(`  [FAIL] ${testName}:`, detail);
  process.exitCode = 1;
};

async function postJson(url, body, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

async function patchJson(url, body, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

async function getJson(url, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'GET',
    headers,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

async function login(email, password = DEV_SEED_PASSWORD) {
  const res = await postJson(`${API_BASE}/auth/login`, { email, password });
  if (res.status !== 200 || !res.data?.data?.token) {
    throw new Error(`Failed to login as ${email}: status ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.data.token;
}

async function runIntegration2BTests() {
  log('====================================================');
  log('STARTING LOCALCOMMERCE INTEGRATION 2B TEST SUITE');
  log('====================================================\n');

  // Baseline database count verification
  const orderCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM orders');
  const itemsCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM order_items');
  const payCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM payments');

  const baselineOrders = orderCountRes.rows[0].count;
  const baselineItems = itemsCountRes.rows[0].count;
  const baselinePayments = payCountRes.rows[0].count;

  log(`Baseline database counts: Orders=${baselineOrders}, Items=${baselineItems}, Payments=${baselinePayments}\n`);

  // Log in actors
  const customerToken = await login('customer@example.com');
  const storeAOwnerToken = await login('owner@example.com');

  // Register a secondary customer for isolation testing
  const customerBEmail = `cust_iso_${Date.now()}@example.com`;
  await postJson(`${API_BASE}/auth/register`, {
    name: 'Customer Isolation Tester',
    email: customerBEmail,
    password: DEV_SEED_PASSWORD,
    phone: '+919811223344',
  });
  const customerBToken = await login(customerBEmail, DEV_SEED_PASSWORD);

  // Retrieve test stores & products
  const storeARes = await pool.query("SELECT id, name FROM stores WHERE name LIKE '%Sharma%' LIMIT 1");
  const storeBRes = await pool.query("SELECT id, name FROM stores WHERE name LIKE '%Shree%' LIMIT 1");
  const storeA = storeARes.rows[0];
  const storeB = storeBRes.rows[0];

  // Register and bind a temporary Store B owner to verify cross-store isolation
  const storeBUserEmail = `owner_b_${Date.now()}@example.com`;
  const regBRes = await postJson(`${API_BASE}/auth/register`, {
    name: 'Store B Manager',
    email: storeBUserEmail,
    password: DEV_SEED_PASSWORD,
    phone: '+919811223399',
  });
  const storeBUserId = regBRes.data?.data?.user?.id;
  await pool.query("UPDATE users SET role = 'business_owner' WHERE id = $1", [storeBUserId]);
  await pool.query('INSERT INTO store_users (store_id, user_id, role) VALUES ($1, $2, $3)', [storeB.id, storeBUserId, 'owner']);
  const storeBOwnerToken = await login(storeBUserEmail, DEV_SEED_PASSWORD);

  const prodARes = await pool.query(
    'SELECT id, name, price, stock_quantity FROM store_products WHERE store_id = $1 AND stock_quantity > 5 ORDER BY price DESC LIMIT 1',
    [storeA.id]
  );
  const prodA = prodARes.rows[0];
  const initialStockA = Number(prodA.stock_quantity);

  // Retrieve customer address
  const addrRes = await pool.query(`
    SELECT ca.id, ca.address_line1, ca.city
    FROM customer_addresses ca
    JOIN customers c ON ca.customer_id = c.id
    JOIN users u ON c.user_id = u.id
    WHERE u.email = 'customer@example.com'
    LIMIT 1;
  `);
  const custAddress = addrRes.rows[0];

  const createdOrderIds = [];

  // =========================================================================
  // TEST 1: Customer Order flow (Cart → Checkout → POST /api/orders → DB check)
  // =========================================================================
  log('--- TEST 1: Customer Order Creation & Inventory Decrement ---');
  const order1Payload = {
    store_id: storeA.id,
    fulfillment_type: 'delivery',
    customer_address_id: custAddress.id,
    payment_method: 'upi',
    customer_notes: 'Ring the doorbell twice',
    items: [
      {
        store_product_id: prodA.id,
        quantity: 2,
      },
    ],
  };

  const createRes = await postJson(`${API_BASE}/orders`, order1Payload, customerToken);
  if (createRes.status === 201 && createRes.data?.data?.id) {
    pass('Order placed successfully via POST /api/orders (201)');
    const order1 = createRes.data.data;
    createdOrderIds.push(order1.id);

    // Verify DB snapshot
    if (order1.status === 'PLACED' && order1.payment_status === 'PENDING') {
      pass('Order initially status="PLACED", payment_status="PENDING"');
    } else {
      fail('Initial order status', order1);
    }

    // Verify stock decrement
    const stockCheck = await pool.query('SELECT stock_quantity FROM store_products WHERE id = $1', [prodA.id]);
    const remainingStock = Number(stockCheck.rows[0].stock_quantity);
    if (remainingStock === initialStockA - 2) {
      pass(`Inventory atomically decremented: ${initialStockA} -> ${remainingStock}`);
    } else {
      fail('Stock decrement mismatch', { expected: initialStockA - 2, got: remainingStock });
    }

    // Customer can view order details
    const trackRes = await getJson(`${API_BASE}/orders/${order1.id}`, customerToken);
    if (trackRes.status === 200 && trackRes.data?.data?.items?.length === 1) {
      pass('Customer retrieves authoritative order tracking details (200)');
    } else {
      fail('Order tracking fetch failed', trackRes);
    }
  } else {
    fail('Order creation failed', createRes);
  }

  // =========================================================================
  // TEST 2: Business Order Flow (Merchant sees order & advances status)
  // =========================================================================
  log('\n--- TEST 2: Business Order Flow (Merchant Lifecycle Management) ---');
  if (createdOrderIds.length > 0) {
    const activeOrderId = createdOrderIds[0];

    // Merchant fetches store orders
    const storeOrdersRes = await getJson(`${API_BASE}/orders?store_id=${storeA.id}`, storeAOwnerToken);
    if (storeOrdersRes.status === 200 && Array.isArray(storeOrdersRes.data?.data)) {
      const found = storeOrdersRes.data.data.find((o) => o.id === activeOrderId);
      if (found) {
        pass(`Store Owner sees new order ${found.order_number} in live store orders list`);
      } else {
        fail('Order not found in merchant list', storeOrdersRes.data);
      }
    } else {
      fail('Merchant getOrders failed', storeOrdersRes);
    }

    // Advance: PLACED -> CONFIRMED
    const confRes = await patchJson(`${API_BASE}/orders/${activeOrderId}/status`, { status: 'CONFIRMED' }, storeAOwnerToken);
    if (confRes.status === 200 && confRes.data?.data?.status === 'CONFIRMED') {
      pass('Merchant transitions order: PLACED -> CONFIRMED (200)');
    } else {
      fail('Transition to CONFIRMED failed', confRes);
    }

    // Advance: CONFIRMED -> PREPARING
    const prepRes = await patchJson(`${API_BASE}/orders/${activeOrderId}/status`, { status: 'PREPARING' }, storeAOwnerToken);
    if (prepRes.status === 200 && prepRes.data?.data?.status === 'PREPARING') {
      pass('Merchant transitions order: CONFIRMED -> PREPARING (200)');
    } else {
      fail('Transition to PREPARING failed', prepRes);
    }

    // Advance: PREPARING -> READY
    const readyRes = await patchJson(`${API_BASE}/orders/${activeOrderId}/status`, { status: 'READY' }, storeAOwnerToken);
    if (readyRes.status === 200 && readyRes.data?.data?.status === 'READY') {
      pass('Merchant transitions order: PREPARING -> READY (200)');
    } else {
      fail('Transition to READY failed', readyRes);
    }
  }

  // =========================================================================
  // TEST 3: Cross-Customer Authorization (IDOR protection)
  // =========================================================================
  log('\n--- TEST 3: Cross-Customer Authorization & IDOR Protection ---');
  if (createdOrderIds.length > 0 && customerBToken) {
    const orderAId = createdOrderIds[0];

    // Customer B attempts to view Customer A's order
    const crossView = await getJson(`${API_BASE}/orders/${orderAId}`, customerBToken);
    if (crossView.status === 404) {
      pass("Customer B cannot view Customer A's order (404 Not Found)");
    } else {
      fail('Cross-customer view allowed!', crossView);
    }

    // Customer B attempts to pay Customer A's order
    const crossPay = await postJson(`${API_BASE}/orders/${orderAId}/payment/pay`, {}, customerBToken);
    if (crossPay.status === 404 || crossPay.status === 403) {
      pass("Customer B cannot pay Customer A's order (404/403 Blocked)");
    } else {
      fail('Cross-customer payment allowed!', crossPay);
    }
  }

  // =========================================================================
  // TEST 4: Cross-Store Authorization (Multi-tenant store isolation)
  // =========================================================================
  log('\n--- TEST 4: Cross-Store Authorization (Store Isolation) ---');
  if (createdOrderIds.length > 0) {
    const orderAId = createdOrderIds[0];

    // Store B Owner attempts to view Store A's orders
    const crossStoreList = await getJson(`${API_BASE}/orders?store_id=${storeA.id}`, storeBOwnerToken);
    if (crossStoreList.status === 403) {
      pass("Store B Owner cannot view Store A's orders (403 Forbidden)");
    } else {
      fail('Cross-store orders list allowed!', crossStoreList);
    }

    // Store B Owner attempts to update Store A's order status
    const crossStoreUpdate = await patchJson(`${API_BASE}/orders/${orderAId}/status`, { status: 'OUT_FOR_DELIVERY' }, storeBOwnerToken);
    if (crossStoreUpdate.status === 403 || crossStoreUpdate.status === 404) {
      pass("Store B Owner cannot modify Store A's order (403/404 Blocked)");
    } else {
      fail('Cross-store status update allowed!', crossStoreUpdate);
    }
  }

  // =========================================================================
  // TEST 5: Stock Failure (Graceful 409 error on insufficient inventory)
  // =========================================================================
  log('\n--- TEST 5: Stock Failure Handling ---');
  const excessPayload = {
    store_id: storeA.id,
    fulfillment_type: 'delivery',
    customer_address_id: custAddress.id,
    payment_method: 'card',
    items: [
      {
        store_product_id: prodA.id,
        quantity: 999999, // Way more than available stock
      },
    ],
  };

  const excessRes = await postJson(`${API_BASE}/orders`, excessPayload, customerToken);
  if (excessRes.status === 409) {
    pass('Order rejected with 409 Conflict due to insufficient stock');
  } else {
    fail('Expected 409 on excess stock, got', excessRes);
  }

  // Verify stock is untouched
  const stockCheckAfter = await pool.query('SELECT stock_quantity FROM store_products WHERE id = $1', [prodA.id]);
  if (Number(stockCheckAfter.rows[0].stock_quantity) === initialStockA - 2) {
    pass('Database stock unchanged after failed checkout attempt');
  } else {
    fail('Stock corrupted after 409 rejection', stockCheckAfter.rows[0]);
  }

  // =========================================================================
  // TEST 6: Online Payment Success & Failure Simulation
  // =========================================================================
  log('\n--- TEST 6: Online Payment Success & Failure Operations ---');
  // Create an online card order to test payment failure
  const cardOrderPayload = {
    store_id: storeA.id,
    fulfillment_type: 'delivery',
    customer_address_id: custAddress.id,
    payment_method: 'card',
    items: [{ store_product_id: prodA.id, quantity: 2 }],
  };
  const cardOrderRes = await postJson(`${API_BASE}/orders`, cardOrderPayload, customerToken);
  if (cardOrderRes.status === 201) {
    const cardOrder = cardOrderRes.data.data;
    createdOrderIds.push(cardOrder.id);
    pass('Created online order with payment_method="card"');

    // Test Failure simulation
    const failRes = await postJson(`${API_BASE}/orders/${cardOrder.id}/payment/fail`, { reason: 'Card declined' }, customerToken);
    if (failRes.status === 200 && failRes.data?.data?.status === 'FAILED') {
      pass('Customer simulated payment failure: status="FAILED" (200)');

      // Verify orders.payment_status in DB
      const orderDb = await pool.query('SELECT payment_status FROM orders WHERE id = $1', [cardOrder.id]);
      if (orderDb.rows[0].payment_status === 'FAILED') {
        pass('orders.payment_status atomically updated to FAILED in PostgreSQL');
      } else {
        fail('Payment status mismatch in DB', orderDb.rows[0]);
      }
    } else {
      fail('Payment failure simulation failed', failRes);
    }
  }

  // Now test Payment Success on the first order (order1)
  if (createdOrderIds.length > 0) {
    const activeOrderId = createdOrderIds[0];
    const paySuccessRes = await postJson(`${API_BASE}/orders/${activeOrderId}/payment/pay`, {}, customerToken);
    if (paySuccessRes.status === 200 && paySuccessRes.data?.data?.status === 'PAID') {
      pass('Customer simulated payment success: status="PAID" (200)');

      // Verify orders.payment_status in DB
      const orderDb = await pool.query('SELECT payment_status, status FROM orders WHERE id = $1', [activeOrderId]);
      if (orderDb.rows[0].payment_status === 'PAID') {
        pass('orders.payment_status atomically updated to PAID in PostgreSQL');
      } else {
        fail('Order payment status mismatch in DB', orderDb.rows[0]);
      }

      // Verify operational status remains untouched
      if (orderDb.rows[0].status === 'READY') {
        pass('Operational lifecycle separated: orders.status remains READY');
      } else {
        fail('Operational status corrupted by payment', orderDb.rows[0]);
      }
    } else {
      fail('Payment success simulation failed', paySuccessRes);
    }
  }

  // =========================================================================
  // TEST 7: Cash on Delivery (COD) Rules
  // =========================================================================
  log('\n--- TEST 7: Cash on Delivery (COD) Rules ---');
  const codPayload = {
    store_id: storeA.id,
    fulfillment_type: 'pickup',
    payment_method: 'cod',
    items: [{ store_product_id: prodA.id, quantity: 2 }],
  };
  const codOrderRes = await postJson(`${API_BASE}/orders`, codPayload, customerToken);
  if (codOrderRes.status === 201) {
    const codOrder = codOrderRes.data.data;
    createdOrderIds.push(codOrder.id);
    pass('Created Cash on Delivery (COD) order (201)');

    // Online payment on COD must be rejected
    const codPayAttempt = await postJson(`${API_BASE}/orders/${codOrder.id}/payment/pay`, {}, customerToken);
    if (codPayAttempt.status === 400) {
      pass('Online payment simulation on COD order strictly rejected (400 Bad Request)');
    } else {
      fail('COD online payment was unexpectedly allowed!', codPayAttempt);
    }
  } else {
    fail('COD order creation failed', codOrderRes);
  }

  // =========================================================================
  // CLEANUP TEST DATA TO RESTORE REPOSITORY BASELINE
  // =========================================================================
  log('\n--- CLEANING UP TEST DATA ---');
  for (const oId of createdOrderIds) {
    await pool.query('DELETE FROM payments WHERE order_id = $1', [oId]);
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [oId]);
    await pool.query('DELETE FROM orders WHERE id = $1', [oId]);
  }
  log(`Cleaned up ${createdOrderIds.length} test orders, items, and payments.`);

  // Clean up isolation test customer
  if (customerBEmail) {
    await pool.query('DELETE FROM customers WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [customerBEmail]);
    await pool.query('DELETE FROM users WHERE email = $1', [customerBEmail]);
    log('Cleaned up isolation test customer.');
  }

  // Clean up temporary Store B owner
  if (storeBUserEmail) {
    await pool.query('DELETE FROM store_users WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [storeBUserEmail]);
    await pool.query('DELETE FROM users WHERE email = $1', [storeBUserEmail]);
    log('Cleaned up temporary Store B user.');
  }

  // Restore product stock quantity
  await pool.query('UPDATE store_products SET stock_quantity = $1 WHERE id = $2', [initialStockA, prodA.id]);
  log(`Restored product stock to baseline (${initialStockA}).`);

  // Verify final counts
  const finalOrderCount = (await pool.query('SELECT COUNT(*)::int AS count FROM orders')).rows[0].count;
  const finalItemsCount = (await pool.query('SELECT COUNT(*)::int AS count FROM order_items')).rows[0].count;
  const finalPayCount = (await pool.query('SELECT COUNT(*)::int AS count FROM payments')).rows[0].count;

  if (finalOrderCount === baselineOrders && finalItemsCount === baselineItems && finalPayCount === baselinePayments) {
    pass('Database successfully restored to exact baseline counts! Zero data pollution.');
  } else {
    fail('Database cleanup mismatch', { finalOrderCount, finalItemsCount, finalPayCount });
  }

  log('\n====================================================');
  log('LOCALCOMMERCE INTEGRATION 2B TEST SUITE COMPLETED');
  log('====================================================\n');
}

runIntegration2BTests()
  .catch((err) => {
    console.error('Test suite uncaught error:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    pool.end();
  });
