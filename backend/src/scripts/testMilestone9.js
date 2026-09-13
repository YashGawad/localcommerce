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
  } catch (e) {
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
  } catch (e) {
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

async function getTableCounts() {
  const tables = [
    'users',
    'stores',
    'store_users',
    'customers',
    'customer_addresses',
    'categories',
    'global_products',
    'store_products',
    'orders',
    'order_items',
    'payments',
    'delivery_assignments',
  ];

  const counts = {};
  for (const table of tables) {
    const res = await pool.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
    counts[table] = res.rows[0].count;
  }
  return counts;
}

async function runTests() {
  log('====================================================');
  log('STARTING BACKEND MILESTONE 9 TEST SUITE');
  log('(PAYMENTS + ORDER PAYMENT OPERATIONS)');
  log('====================================================\n');

  // 1. Record baseline database counts
  const baselineCounts = await getTableCounts();
  log('Baseline database counts:');
  for (const [t, c] of Object.entries(baselineCounts)) {
    log(`  ${t}: ${c}`);
  }
  log('');

  // Track created IDs for cleanup
  const createdOrderIds = [];
  const createdCustomerUserIds = [];
  let initialStocks = null;

  try {
    // Retrieve Seeded Entities
    const storeARes = await pool.query("SELECT id, name FROM stores WHERE name LIKE '%Sharma%' LIMIT 1");
    const storeBRes = await pool.query("SELECT id, name FROM stores WHERE name LIKE '%Shree%' LIMIT 1");
    const storeA = storeARes.rows[0];
    const storeB = storeBRes.rows[0];

    // Seeded Users
    const ownerToken = await login('owner@example.com');
    const staffToken = await login('staff@example.com');
    const deliveryToken = await login('delivery@example.com');
    const adminToken = await login('admin@example.com');
    const customerToken = await login('customer@example.com');

    // Retrieve seeded customer address
    const addrRes = await pool.query(`
      SELECT ca.id
      FROM customer_addresses ca
      JOIN customers c ON ca.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE u.email = 'customer@example.com'
      LIMIT 1;
    `);
    const custAddrId = addrRes.rows[0].id;

    // Record initial product stock quantities to ensure 100% restoration
    initialStocks = await pool.query('SELECT id, stock_quantity FROM store_products');

    // Retrieve products with ample stock
    const prodARes = await pool.query('SELECT id, price FROM store_products WHERE store_id = $1 AND stock_quantity >= 10 LIMIT 1', [storeA.id]);
    const prodBRes = await pool.query('SELECT id, price FROM store_products WHERE store_id = $1 AND stock_quantity >= 10 LIMIT 1', [storeB.id]);
    const prodA = prodARes.rows[0];
    const prodB = prodBRes.rows[0];

    // Existing seed order & payment
    const seedOrderRes = await pool.query('SELECT id, order_number FROM orders WHERE payment_method = \'cod\' AND payment_status = \'PENDING\' LIMIT 1');
    const seedOrder = seedOrderRes.rows[0];

    const seedPayRes = await pool.query('SELECT id FROM payments WHERE order_id = $1', [seedOrder.id]);
    const seedPayId = seedPayRes.rows[0].id;

    // ----------------------------------------------------
    // TEST GROUP 1: AUTHENTICATION
    // ----------------------------------------------------
    log('\n--- 1. AUTHENTICATION & SECURITY (Unauthenticated calls must return 401) ---');
    {
      const r1 = await getJson(`${API_BASE}/orders/${seedOrder.id}/payment`);
      if (r1.status === 401) pass('GET /api/orders/:orderId/payment unauthenticated -> 401');
      else fail('GET /api/orders/:orderId/payment unauthenticated', `Status: ${r1.status}`);

      const r2 = await getJson(`${API_BASE}/payments/${seedPayId}`);
      if (r2.status === 401) pass('GET /api/payments/:id unauthenticated -> 401');
      else fail('GET /api/payments/:id unauthenticated', `Status: ${r2.status}`);

      const r3 = await postJson(`${API_BASE}/orders/${seedOrder.id}/payment/pay`, {});
      if (r3.status === 401) pass('POST /api/orders/:orderId/payment/pay unauthenticated -> 401');
      else fail('POST /api/orders/:orderId/payment/pay unauthenticated', `Status: ${r3.status}`);

      const r4 = await postJson(`${API_BASE}/orders/${seedOrder.id}/payment/fail`, {});
      if (r4.status === 401) pass('POST /api/orders/:orderId/payment/fail unauthenticated -> 401');
      else fail('POST /api/orders/:orderId/payment/fail unauthenticated', `Status: ${r4.status}`);
    }

    // ----------------------------------------------------
    // TEST GROUP 2: INPUT VALIDATION & CASH ON DELIVERY (COD) RULES
    // ----------------------------------------------------
    log('\n--- 2. INPUT VALIDATION & CASH ON DELIVERY (COD) RULES ---');
    {
      // 2.1 Malformed order UUID
      const rBadOrder = await getJson(`${API_BASE}/orders/not-a-uuid/payment`, customerToken);
      if (rBadOrder.status === 400) pass('Malformed order UUID -> 400');
      else fail('Malformed order UUID', `Status: ${rBadOrder.status}`);

      // 2.2 Malformed payment UUID
      const rBadPay = await getJson(`${API_BASE}/payments/not-a-uuid`, customerToken);
      if (rBadPay.status === 400) pass('Malformed payment UUID -> 400');
      else fail('Malformed payment UUID', `Status: ${rBadPay.status}`);

      // 2.3 Non-existent order UUID
      const rNonExistOrder = await getJson(`${API_BASE}/orders/00000000-0000-0000-0000-000000009999/payment`, customerToken);
      if (rNonExistOrder.status === 404) pass('Non-existent order UUID -> 404');
      else fail('Non-existent order UUID', `Status: ${rNonExistOrder.status}`);

      // 2.4 Non-existent payment UUID
      const rNonExistPay = await getJson(`${API_BASE}/payments/00000000-0000-0000-0000-000000009999`, customerToken);
      if (rNonExistPay.status === 404) pass('Non-existent payment UUID -> 404');
      else fail('Non-existent payment UUID', `Status: ${rNonExistPay.status}`);

      // 2.5 Cash on Delivery (COD) cannot be paid via online simulation
      const rCodPay = await postJson(`${API_BASE}/orders/${seedOrder.id}/payment/pay`, {}, customerToken);
      if (rCodPay.status === 400) pass('COD order cannot be paid online -> 400 Bad Request');
      else fail('COD online payment rejection', `Status: ${rCodPay.status}`);

      // 2.6 Cash on Delivery (COD) cannot simulate online payment failure
      const rCodFail = await postJson(`${API_BASE}/orders/${seedOrder.id}/payment/fail`, {}, customerToken);
      if (rCodFail.status === 400) pass('COD order cannot simulate online payment failure -> 400 Bad Request');
      else fail('COD online failure rejection', `Status: ${rCodFail.status}`);
    }

    // ----------------------------------------------------
    // TEST GROUP 3: ONLINE PAYMENT ORDER CREATION (UPI, CARD, NET_BANKING)
    // ----------------------------------------------------
    log('\n--- 3. ONLINE ORDER CREATION & INITIAL PAYMENT STATE ---');
    // Create UPI order
    const upiOrderRes = await postJson(
      `${API_BASE}/orders`,
      {
        store_id: storeA.id,
        fulfillment_type: 'delivery',
        customer_address_id: custAddrId,
        payment_method: 'upi',
        items: [{ store_product_id: prodA.id, quantity: 5 }],
      },
      customerToken
    );
    if (upiOrderRes.status !== 201) throw new Error(`Failed to create UPI order: ${JSON.stringify(upiOrderRes.data)}`);
    const upiOrderId = upiOrderRes.data.data.id;
    createdOrderIds.push(upiOrderId);
    pass('Created online delivery order with payment_method="upi"');

    // Create Card order
    const cardOrderRes = await postJson(
      `${API_BASE}/orders`,
      {
        store_id: storeA.id,
        fulfillment_type: 'delivery',
        customer_address_id: custAddrId,
        payment_method: 'card',
        items: [{ store_product_id: prodA.id, quantity: 5 }],
      },
      customerToken
    );
    if (cardOrderRes.status !== 201) throw new Error(`Failed to create Card order: ${JSON.stringify(cardOrderRes.data)}`);
    const cardOrderId = cardOrderRes.data.data.id;
    createdOrderIds.push(cardOrderId);
    pass('Created online delivery order with payment_method="card"');

    // Verify initial payment record for upiOrder
    let upiPaymentId = null;
    {
      const rGetPay = await getJson(`${API_BASE}/orders/${upiOrderId}/payment`, customerToken);
      if (rGetPay.status === 200 && rGetPay.data?.data) {
        pass('Customer GET /api/orders/:orderId/payment -> 200');
        const pay = rGetPay.data.data;
        upiPaymentId = pay.id;

        if (pay.status === 'PENDING' && pay.payment_method === 'upi' && Number(pay.amount) > 0) {
          pass('Initial payment state is PENDING with matching amount and upi method');
        } else {
          fail('Initial payment state mismatch', JSON.stringify(pay));
        }
      } else {
        fail('Customer GET order payment', `Status: ${rGetPay.status}`);
      }
    }

    // ----------------------------------------------------
    // TEST GROUP 4: MULTI-TENANT & ACTOR ACCESS CONTROL
    // ----------------------------------------------------
    log('\n--- 4. MULTI-TENANT & ACTOR ACCESS CONTROL ---');
    {
      // Register a second customer (Customer B)
      const custBEmail = `customer_b_test_${Date.now()}@example.com`;
      const custBReg = await postJson(`${API_BASE}/auth/register`, {
        name: 'Customer B',
        email: custBEmail,
        password: DEV_SEED_PASSWORD,
        phone: '9876543219',
      });
      if (custBReg.status !== 201) throw new Error(`Failed to register Customer B: ${JSON.stringify(custBReg.data)}`);
      const custBToken = await login(custBEmail, DEV_SEED_PASSWORD);
      const custBUserRes = await pool.query('SELECT id FROM users WHERE email = $1', [custBEmail]);
      createdCustomerUserIds.push(custBUserRes.rows[0].id);

      // 4.1 Customer B attempting to view Customer A's order payment -> 404
      const rCrossCust = await getJson(`${API_BASE}/orders/${upiOrderId}/payment`, custBToken);
      if (rCrossCust.status === 404) pass('Customer B cannot view Customer A order payment -> 404');
      else fail('Customer cross-access prevention', `Status: ${rCrossCust.status}`);

      // 4.2 Customer B attempting to view Customer A's payment by ID -> 404
      const rCrossCustById = await getJson(`${API_BASE}/payments/${upiPaymentId}`, custBToken);
      if (rCrossCustById.status === 404) pass('Customer B cannot view Customer A payment by ID -> 404');
      else fail('Payment ID cross-access prevention', `Status: ${rCrossCustById.status}`);

      // 4.3 Customer B attempting to pay Customer A's order -> 404
      const rCrossPay = await postJson(`${API_BASE}/orders/${upiOrderId}/payment/pay`, {}, custBToken);
      if (rCrossPay.status === 404) pass('Customer B cannot pay Customer A order -> 404');
      else fail('Customer cross-payment prevention', `Status: ${rCrossPay.status}`);

      // 4.4 Store A owner can view payment for Store A order -> 200
      const rOwnerGet = await getJson(`${API_BASE}/orders/${upiOrderId}/payment`, ownerToken);
      if (rOwnerGet.status === 200) pass('Store A owner can view payment for Store A order -> 200');
      else fail('Store owner view payment', `Status: ${rOwnerGet.status}`);

      // 4.5 Store A owner cannot view payment for Store B order
      const orderBRes = await postJson(
        `${API_BASE}/orders`,
        {
          store_id: storeB.id,
          fulfillment_type: 'delivery',
          customer_address_id: custAddrId,
          payment_method: 'upi',
          items: [{ store_product_id: prodB.id, quantity: 5 }],
        },
        customerToken
      );
      const orderBId = orderBRes.data.data.id;
      createdOrderIds.push(orderBId);

      const rCrossStore = await getJson(`${API_BASE}/orders/${orderBId}/payment`, ownerToken);
      if (rCrossStore.status === 404) pass('Store A owner cannot view Store B order payment -> 404');
      else fail('Store isolation on payments', `Status: ${rCrossStore.status}`);

      // 4.6 Platform Admin can view any payment
      const rAdminGet = await getJson(`${API_BASE}/orders/${upiOrderId}/payment`, adminToken);
      if (rAdminGet.status === 200) pass('Platform admin can view any order payment -> 200');
      else fail('Platform admin view payment', `Status: ${rAdminGet.status}`);
    }

    // ----------------------------------------------------
    // TEST GROUP 5: MOCK PAYMENT SUCCESS & ATOMIC SYNCHRONIZATION
    // ----------------------------------------------------
    log('\n--- 5. MOCK PAYMENT SUCCESS & ATOMIC SYNCHRONIZATION ---');
    {
      // Check order status before payment: must be PLACED
      const preOrderRes = await pool.query('SELECT status, payment_status, total_amount FROM orders WHERE id = $1', [upiOrderId]);
      const preOrder = preOrderRes.rows[0];
      if (preOrder.status === 'PLACED' && preOrder.payment_status === 'PENDING') {
        pass('Order is initially PLACED with payment_status="PENDING"');
      }

      // Customer simulates payment success
      // Even if client maliciously sends { amount: 1, status: "PAID", paid_at: "2000-01-01" }, backend is authoritative!
      const rPay = await postJson(
        `${API_BASE}/orders/${upiOrderId}/payment/pay`,
        { amount: 1, status: 'arbitrary', paid_at: '2000-01-01' },
        customerToken
      );

      if (rPay.status === 200 && rPay.data?.success) {
        pass('Customer POST /api/orders/:orderId/payment/pay -> 200');
        const payData = rPay.data.data;

        // Verify payment record
        if (payData.status === 'PAID' && payData.paid_at && payData.transaction_reference) {
          pass(`Payment marked as PAID with paid_at timestamp and txn ref (${payData.transaction_reference})`);
        } else {
          fail('Payment success response fields', JSON.stringify(payData));
        }

        // Verify amount integrity: client's amount: 1 was IGNORED
        if (Number(payData.amount) === Number(preOrder.total_amount)) {
          pass(`Amount integrity preserved: amount remains ₹${payData.amount} (client amount: 1 was ignored)`);
        } else {
          fail('Amount tampering allowed!', `Expected ₹${preOrder.total_amount}, got ₹${payData.amount}`);
        }

        // Verify database state directly from PostgreSQL
        const dbPayRes = await pool.query('SELECT status, amount, paid_at FROM payments WHERE id = $1', [upiPaymentId]);
        const dbOrderRes = await pool.query('SELECT status, payment_status, total_amount FROM orders WHERE id = $1', [upiOrderId]);

        if (dbPayRes.rows[0].status === 'PAID' && dbOrderRes.rows[0].payment_status === 'PAID') {
          pass('Atomic synchronization verified: payments.status="PAID" and orders.payment_status="PAID"');
        } else {
          fail('Atomic synchronization mismatch', `Pay: ${dbPayRes.rows[0].status}, Order: ${dbOrderRes.rows[0].payment_status}`);
        }

        // CRITICAL: orders.status must NOT have changed!
        if (dbOrderRes.rows[0].status === 'PLACED') {
          pass('Order lifecycle separation verified: orders.status remains strictly "PLACED"');
        } else {
          fail('Order status incorrectly modified!', `orders.status changed to ${dbOrderRes.rows[0].status}`);
        }
      } else {
        fail('Customer mock payment success', `Status: ${rPay.status} ${JSON.stringify(rPay.data)}`);
      }

      // 5.2 Invalid transition: Repeating payment on already PAID order must return 409 Conflict
      const rRepeatPay = await postJson(`${API_BASE}/orders/${upiOrderId}/payment/pay`, {}, customerToken);
      if (rRepeatPay.status === 409) pass('Repeat payment on already PAID order rejected with 409 Conflict');
      else fail('Repeat payment rejection', `Status: ${rRepeatPay.status}`);

      // 5.3 Invalid transition: Failing an already PAID order must return 409 Conflict
      const rFailPaid = await postJson(`${API_BASE}/orders/${upiOrderId}/payment/fail`, {}, customerToken);
      if (rFailPaid.status === 409) pass('Failing an already PAID payment rejected with 409 Conflict');
      else fail('Failing paid payment rejection', `Status: ${rFailPaid.status}`);
    }

    // ----------------------------------------------------
    // TEST GROUP 6: MOCK PAYMENT FAILURE
    // ----------------------------------------------------
    log('\n--- 6. MOCK PAYMENT FAILURE ---');
    {
      // Use cardOrderId (currently PENDING)
      const rFail = await postJson(`${API_BASE}/orders/${cardOrderId}/payment/fail`, {}, customerToken);

      if (rFail.status === 200 && rFail.data?.success) {
        pass('Customer POST /api/orders/:orderId/payment/fail -> 200');
        const failData = rFail.data.data;

        if (failData.status === 'FAILED') {
          pass('Payment marked as FAILED in response');
        } else {
          fail('Payment fail status', JSON.stringify(failData));
        }

        // Verify database state directly from PostgreSQL
        const dbCardPayRes = await pool.query('SELECT status, amount FROM payments WHERE order_id = $1', [cardOrderId]);
        const dbCardOrderRes = await pool.query('SELECT status, payment_status, total_amount FROM orders WHERE id = $1', [cardOrderId]);

        if (dbCardPayRes.rows[0].status === 'FAILED' && dbCardOrderRes.rows[0].payment_status === 'FAILED') {
          pass('Atomic synchronization verified: payments.status="FAILED" and orders.payment_status="FAILED"');
        } else {
          fail('Atomic fail sync mismatch', `Pay: ${dbCardPayRes.rows[0].status}, Order: ${dbCardOrderRes.rows[0].payment_status}`);
        }

        // Orders.status is NOT cancelled automatically
        if (dbCardOrderRes.rows[0].status === 'PLACED') {
          pass('Order lifecycle separation verified: orders.status remains "PLACED" (not cancelled automatically)');
        } else {
          fail('Order status incorrectly modified on failure', dbCardOrderRes.rows[0].status);
        }
      } else {
        fail('Customer mock payment failure', `Status: ${rFail.status}`);
      }

      // 6.2 Repeating failure on already FAILED payment must return 409 Conflict
      const rRepeatFail = await postJson(`${API_BASE}/orders/${cardOrderId}/payment/fail`, {}, customerToken);
      if (rRepeatFail.status === 409) pass('Repeat failure on already FAILED payment rejected with 409 Conflict');
      else fail('Repeat failure rejection', `Status: ${rRepeatFail.status}`);

      // 6.3 Paying an already FAILED payment must return 409 Conflict in V1
      const rPayFailed = await postJson(`${API_BASE}/orders/${cardOrderId}/payment/pay`, {}, customerToken);
      if (rPayFailed.status === 409) pass('Paying an already FAILED payment rejected with 409 Conflict');
      else fail('Paying failed payment rejection', `Status: ${rPayFailed.status}`);
    }

    // ----------------------------------------------------
    // TEST GROUP 7: GET PAYMENT BY ID
    // ----------------------------------------------------
    log('\n--- 7. GET PAYMENT BY ID ---');
    {
      const rGetById = await getJson(`${API_BASE}/payments/${upiPaymentId}`, customerToken);
      if (rGetById.status === 200 && rGetById.data?.data?.id === upiPaymentId) {
        pass('Customer gets payment details by ID -> 200');
        const pay = rGetById.data.data;
        if (pay.status === 'PAID' && pay.order_number) {
          pass('Payment details include order_number and safe payment attributes');
        }
      } else {
        fail('Get payment by ID', `Status: ${rGetById.status}`);
      }
    }

    // ----------------------------------------------------
    // TEST GROUP 8: CONCURRENCY & ROW LOCKING
    // ----------------------------------------------------
    log('\n--- 8. CONCURRENCY & ROW LOCKING ---');
    {
      // Create a fresh online order for concurrency testing
      const concOrderRes = await postJson(
        `${API_BASE}/orders`,
        {
          store_id: storeA.id,
          fulfillment_type: 'delivery',
          customer_address_id: custAddrId,
          payment_method: 'net_banking',
          items: [{ store_product_id: prodA.id, quantity: 5 }],
        },
        customerToken
      );
      const concOrderId = concOrderRes.data.data.id;
      createdOrderIds.push(concOrderId);

      // Fire two simultaneous payment requests against the same PENDING payment
      const [p1, p2] = await Promise.all([
        postJson(`${API_BASE}/orders/${concOrderId}/payment/pay`, {}, customerToken),
        postJson(`${API_BASE}/orders/${concOrderId}/payment/pay`, {}, customerToken),
      ]);

      const statuses = [p1.status, p2.status].sort();
      if (statuses[0] === 200 && statuses[1] === 409) {
        pass('Concurrent payment race condition handled: exactly 1 succeeded (200) and 1 rejected (409)');
      } else {
        fail('Concurrent payment test', `Statuses received: [${p1.status}, ${p2.status}]`);
      }

      // Verify exactly ONE payment row exists in DB and is PAID
      const concPayRes = await pool.query('SELECT status FROM payments WHERE order_id = $1', [concOrderId]);
      if (concPayRes.rows.length === 1 && concPayRes.rows[0].status === 'PAID') {
        pass('Database state confirmed: exactly 1 payment record exists and is PAID');
      } else {
        fail('Concurrency payment verification', `Rows: ${concPayRes.rows.length}`);
      }
    }

    // ----------------------------------------------------
    // TEST GROUP 9: SECURITY CHECKS (NO CREDENTIAL LEAKS)
    // ----------------------------------------------------
    log('\n--- 9. SECURITY (NO CREDENTIAL / SECRET LEAKS) ---');
    {
      const rCheck = await getJson(`${API_BASE}/orders/${upiOrderId}/payment`, customerToken);
      const bodyStr = JSON.stringify(rCheck.data);

      if (bodyStr.includes('password') || bodyStr.includes('hash') || bodyStr.includes('secret')) {
        fail('Security credential leakage', 'Response contains password/hash/secret');
      } else {
        pass('Payment API responses do not leak password_hash, JWT secret, or database secrets');
      }
    }

  } catch (err) {
    fail('Unexpected test error', err.message);
  } finally {
    // ----------------------------------------------------
    // CLEANUP: RESTORE DATABASE TO EXACT BASELINE
    // ----------------------------------------------------
    log('\n--- DATABASE CLEANUP ---');

    // 1. Delete created orders (cascades to order_items, payments, delivery_assignments)
    if (createdOrderIds.length > 0) {
      await pool.query('DELETE FROM orders WHERE id = ANY($1)', [createdOrderIds]);
    }

    // 2. Delete created customer users
    if (createdCustomerUserIds.length > 0) {
      await pool.query('DELETE FROM users WHERE id = ANY($1)', [createdCustomerUserIds]);
    }

    // 3. Restore all product stock quantities
    if (initialStocks && initialStocks.rows) {
      for (const p of initialStocks.rows) {
        await pool.query('UPDATE store_products SET stock_quantity = $1 WHERE id = $2', [p.stock_quantity, p.id]);
      }
    }

    // Verify final counts against baseline
    const finalCounts = await getTableCounts();
    log('Database counts: Baseline vs Final:');
    let allMatches = true;

    for (const [table, baseline] of Object.entries(baselineCounts)) {
      const final = finalCounts[table];
      const match = baseline === final;
      if (!match) allMatches = false;
      log(`  ${table.padEnd(22)}: Baseline=${baseline} | Final=${final} | Match=${match ? 'YES' : 'NO'}`);
    }

    if (allMatches) {
      pass('Database successfully restored to exact baseline counts!');
    } else {
      fail('Database Cleanup', 'Mismatch between baseline and final counts');
    }

    log('\n====================================================');
    log('MILESTONE 9 TEST SUITE COMPLETED');
    log('====================================================');

    await pool.end();
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
