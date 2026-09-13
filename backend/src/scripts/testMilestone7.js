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

async function runTests() {
  log('====================================================');
  log('STARTING BACKEND MILESTONE 7 TEST SUITE (ORDERS)');
  log('====================================================\n');

  // Baseline database count verification
  const orderCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM orders');
  const itemsCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM order_items');
  const payCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM payments');

  const baselineOrders = orderCountRes.rows[0].count;
  const baselineItems = itemsCountRes.rows[0].count;
  const baselinePayments = payCountRes.rows[0].count;

  log(`Baseline counts in DB:`);
  log(`  Orders: ${baselineOrders} (expected 3)`);
  log(`  Order Items: ${baselineItems} (expected 8)`);
  log(`  Payments: ${baselinePayments} (expected 3)\n`);

  if (baselineOrders !== 3 || baselineItems !== 8 || baselinePayments !== 3) {
    fail('Baseline Database Counts', `Expected 3 orders, 8 items, 3 payments. Got ${baselineOrders}, ${baselineItems}, ${baselinePayments}`);
  } else {
    pass('Baseline Database Counts verified');
  }

  // Retrieve test stores & products
  const storeARes = await pool.query("SELECT id, name FROM stores WHERE name LIKE '%Sharma%' LIMIT 1");
  const storeBRes = await pool.query("SELECT id, name FROM stores WHERE name LIKE '%Shree%' LIMIT 1");
  const storeA = storeARes.rows[0];
  const storeB = storeBRes.rows[0];

  const prodStoreARes = await pool.query(
    'SELECT id, name, price, stock_quantity FROM store_products WHERE store_id = $1 ORDER BY price DESC LIMIT 2',
    [storeA.id]
  );
  const prodA1 = prodStoreARes.rows[0];
  const prodA2 = prodStoreARes.rows[1];

  const prodStoreBRes = await pool.query(
    'SELECT id, name, price, stock_quantity FROM store_products WHERE store_id = $1 LIMIT 1',
    [storeB.id]
  );
  const prodB1 = prodStoreBRes.rows[0];

  // Record initial stock for prodA1 & prodA2
  const initialStockA1 = Number(prodA1.stock_quantity);
  const initialStockA2 = Number(prodA2.stock_quantity);

  // Retrieve seeded Customer A address
  const addrRes = await pool.query(`
    SELECT ca.id, ca.address_line1, ca.city
    FROM customer_addresses ca
    JOIN customers c ON ca.customer_id = c.id
    JOIN users u ON c.user_id = u.id
    WHERE u.email = 'customer@example.com'
    LIMIT 1;
  `);
  const custAddr = addrRes.rows[0];

  // Existing seed order ID
  const seedOrderRes = await pool.query('SELECT id FROM orders LIMIT 1');
  const existingSeedOrderId = seedOrderRes.rows[0].id;

  const createdOrderIds = [];

  // ----------------------------------------------------
  // TEST 1: UNAUTHENTICATED CALLS (Must return 401)
  // ----------------------------------------------------
  log('\n--- 1. UNAUTHENTICATED REQUESTS (Should all return 401) ---');
  {
    const r1 = await postJson(`${API_BASE}/orders`, { store_id: storeA.id, items: [] });
    if (r1.status === 401) pass('POST /api/orders -> 401');
    else fail('POST /api/orders', `Status: ${r1.status}`);

    const r2 = await getJson(`${API_BASE}/orders`);
    if (r2.status === 401) pass('GET /api/orders -> 401');
    else fail('GET /api/orders', `Status: ${r2.status}`);

    const r3 = await getJson(`${API_BASE}/orders/${existingSeedOrderId}`);
    if (r3.status === 401) pass('GET /api/orders/:id -> 401');
    else fail('GET /api/orders/:id', `Status: ${r3.status}`);

    const r4 = await patchJson(`${API_BASE}/orders/${existingSeedOrderId}/status`, { status: 'CONFIRMED' });
    if (r4.status === 401) pass('PATCH /api/orders/:id/status -> 401');
    else fail('PATCH /api/orders/:id/status', `Status: ${r4.status}`);
  }

  // ----------------------------------------------------
  // TEST 2: CUSTOMER ORDER CREATION (DELIVERY & PICKUP)
  // ----------------------------------------------------
  log('\n--- 2. CUSTOMER ORDER CREATION ---');
  const custToken = await login('customer@example.com');
  let deliveryOrderId = null;
  let pickupOrderId = null;
  {
    // 2.1 Delivery Order
    const orderPayload = {
      store_id: storeA.id,
      fulfillment_type: 'delivery',
      customer_address_id: custAddr.id,
      payment_method: 'cod',
      customer_notes: 'Ring the doorbell twice please',
      items: [
        { store_product_id: prodA1.id, quantity: 2 },
        { store_product_id: prodA2.id, quantity: 1 },
      ],
      // Malicious fake client values that MUST be ignored
      subtotal: 10,
      total_amount: 10,
      delivery_fee: 0,
    };

    const res = await postJson(`${API_BASE}/orders`, orderPayload, custToken);
    if (res.status === 201 && res.data?.data?.id) {
      deliveryOrderId = res.data.data.id;
      createdOrderIds.push(deliveryOrderId);
      pass('POST /api/orders (delivery) -> 201 Created');

      const ord = res.data.data;
      const expectedSubtotal = Math.round((Number(prodA1.price) * 2 + Number(prodA2.price) * 1) * 100) / 100;
      if (Number(ord.subtotal) === expectedSubtotal) {
        pass(`Authoritative subtotal calculated correctly: ₹${ord.subtotal}`);
      } else {
        fail('Subtotal mismatch', `Expected ${expectedSubtotal}, got ${ord.subtotal}`);
      }

      if (ord.delivery_address_line1 === custAddr.address_line1) {
        pass('Delivery address snapshotted correctly into order');
      } else {
        fail('Address snapshot mismatch', ord.delivery_address_line1);
      }

      if (ord.items && ord.items.length === 2) {
        pass('Order items snapshot verified (2 items)');
      } else {
        fail('Order items count', ord.items?.length);
      }

      if (ord.payment && ord.payment.payment_method === 'cod' && ord.payment.status === 'PENDING') {
        pass('Payment record created with status PENDING');
      } else {
        fail('Payment record mismatch', JSON.stringify(ord.payment));
      }

      // Verify stock was decremented in DB
      const stockCheck = await pool.query(
        'SELECT id, stock_quantity FROM store_products WHERE id = $1',
        [prodA1.id]
      );
      if (Number(stockCheck.rows[0].stock_quantity) === initialStockA1 - 2) {
        pass(`Stock quantity correctly decremented for product: ${initialStockA1} -> ${stockCheck.rows[0].stock_quantity}`);
      } else {
        fail('Stock not decremented', `Expected ${initialStockA1 - 2}, got ${stockCheck.rows[0].stock_quantity}`);
      }
    } else {
      fail('POST /api/orders (delivery)', `Status: ${res.status} ${JSON.stringify(res.data)}`);
    }

    // 2.2 Pickup Order (no address required, delivery fee = 0)
    const pickupPayload = {
      store_id: storeA.id,
      fulfillment_type: 'pickup',
      payment_method: 'upi',
      items: [
        { store_product_id: prodA1.id, quantity: 2 },
      ],
    };

    const pRes = await postJson(`${API_BASE}/orders`, pickupPayload, custToken);
    if (pRes.status === 201 && pRes.data?.data?.id) {
      pickupOrderId = pRes.data.data.id;
      createdOrderIds.push(pickupOrderId);
      pass('POST /api/orders (pickup) -> 201 Created');

      const pOrd = pRes.data.data;
      if (Number(pOrd.delivery_fee) === 0) {
        pass('Pickup order delivery_fee is strictly 0.00');
      } else {
        fail('Pickup delivery fee', pOrd.delivery_fee);
      }

      if (pOrd.delivery_address_line1 === null) {
        pass('Pickup order delivery address snapshot is null');
      } else {
        fail('Pickup address snapshot not null', pOrd.delivery_address_line1);
      }
    } else {
      fail('POST /api/orders (pickup)', `Status: ${pRes.status} ${JSON.stringify(pRes.data)}`);
    }
  }

  // ----------------------------------------------------
  // TEST 3: VALIDATION & TAMPERING PREVENTION
  // ----------------------------------------------------
  log('\n--- 3. VALIDATION & SECURITY TAMPERING PREVENTION ---');
  {
    // 3.1 Multi-Store Cart Tampering (Products from Store A and Store B)
    const crossStoreOrder = {
      store_id: storeA.id,
      fulfillment_type: 'pickup',
      payment_method: 'cod',
      items: [
        { store_product_id: prodA1.id, quantity: 1 },
        { store_product_id: prodB1.id, quantity: 1 }, // Belongs to Store B!
      ],
    };
    const crossRes = await postJson(`${API_BASE}/orders`, crossStoreOrder, custToken);
    if (crossRes.status === 400) {
      pass('Multi-Store Cart Tampering rejected with 400 Bad Request');
    } else {
      fail('Cross-store order creation not blocked', `Status: ${crossRes.status}`);
    }

    // 3.2 Insufficient Stock
    const excessOrder = {
      store_id: storeA.id,
      fulfillment_type: 'pickup',
      payment_method: 'cod',
      items: [
        { store_product_id: prodA1.id, quantity: 999999 }, // Way more than available
      ],
    };
    const excessRes = await postJson(`${API_BASE}/orders`, excessOrder, custToken);
    if (excessRes.status === 409) {
      pass('Insufficient stock order rejected with 409 Conflict');
    } else {
      fail('Insufficient stock not rejected', `Status: ${excessRes.status}`);
    }

    // 3.3 Address belonging to another customer
    // Register temporary customer B with address
    const regRes = await postJson(`${API_BASE}/auth/register`, {
      name: 'Temp Cust B',
      email: 'temp_cust_b_order@example.com',
      password: 'Password@123',
    });
    const custBToken = await login('temp_cust_b_order@example.com');
    const custBAddrRes = await postJson(`${API_BASE}/customers/me/addresses`, {
      label: 'Cust B Home',
      recipient_name: 'Temp Cust B',
      address_line1: '999 Private Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400001',
    }, custBToken);
    const custBAddrId = custBAddrRes.data?.data?.id;

    // Customer A tries to use Customer B's address
    const stolenAddrOrder = {
      store_id: storeA.id,
      fulfillment_type: 'delivery',
      customer_address_id: custBAddrId,
      payment_method: 'cod',
      items: [{ store_product_id: prodA1.id, quantity: 1 }],
    };
    const stolenRes = await postJson(`${API_BASE}/orders`, stolenAddrOrder, custToken);
    if (stolenRes.status === 404) {
      pass('Foreign customer address usage rejected with 404 Not Found (IDOR prevented)');
    } else {
      fail('Foreign address usage not blocked', `Status: ${stolenRes.status}`);
    }

    // Clean up temporary customer B
    await pool.query('DELETE FROM customer_addresses WHERE id = $1', [custBAddrId]);
    await pool.query("DELETE FROM customers WHERE user_id IN (SELECT id FROM users WHERE email = 'temp_cust_b_order@example.com')");
    await pool.query("DELETE FROM users WHERE email = 'temp_cust_b_order@example.com'");
  }

  // ----------------------------------------------------
  // TEST 4: ORDER LIST & DETAILS AUTHORIZATION
  // ----------------------------------------------------
  log('\n--- 4. ORDER LIST & DETAILS AUTHORIZATION ---');
  {
    // 4.1 Customer Order List
    const custOrdersRes = await getJson(`${API_BASE}/orders`, custToken);
    if (custOrdersRes.status === 200 && custOrdersRes.data?.data) {
      pass(`Customer GET /api/orders -> 200 (${custOrdersRes.data.data.length} orders returned)`);
    } else {
      fail('Customer GET /api/orders', `Status: ${custOrdersRes.status}`);
    }

    // 4.2 Customer GET own order by ID
    const ownOrderRes = await getJson(`${API_BASE}/orders/${deliveryOrderId}`, custToken);
    if (ownOrderRes.status === 200 && ownOrderRes.data?.data?.id === deliveryOrderId) {
      pass('Customer GET /api/orders/:id for own order -> 200');
    } else {
      fail('Customer GET own order', `Status: ${ownOrderRes.status}`);
    }

    // 4.3 Store Owner of Store A
    const ownerToken = await login('owner@example.com'); // Owner of Store A
    const ownerOrders = await getJson(`${API_BASE}/orders`, ownerToken);
    if (ownerOrders.status === 200 && Array.isArray(ownerOrders.data?.data)) {
      pass('Store Owner GET /api/orders -> 200');
    } else {
      fail('Store Owner GET /api/orders', `Status: ${ownerOrders.status}`);
    }

    // Store Owner querying Store B orders explicitly via query param
    const ownerStoreBRes = await getJson(`${API_BASE}/orders?store_id=${storeB.id}`, ownerToken);
    if (ownerStoreBRes.status === 403) {
      pass('Store Owner querying Store B orders -> 403 Forbidden (Cross-store isolation)');
    } else {
      fail('Store Owner querying Store B', `Expected 403, got ${ownerStoreBRes.status}`);
    }

    // 4.4 Admin
    const adminToken = await login('admin@example.com');
    const adminOrders = await getJson(`${API_BASE}/orders`, adminToken);
    if (adminOrders.status === 200 && adminOrders.data?.data) {
      pass('Admin GET /api/orders -> 200 (Platform-level inspection)');
    } else {
      fail('Admin GET /api/orders', `Status: ${adminOrders.status}`);
    }
  }

  // ----------------------------------------------------
  // TEST 5: ORDER STATUS TRANSITIONS & PERMISSIONS
  // ----------------------------------------------------
  log('\n--- 5. ORDER STATUS TRANSITIONS & LIFECYCLE RULES ---');
  {
    const ownerToken = await login('owner@example.com');

    // 5.1 Invalid Status Jump: PLACED -> DELIVERED (must fail with 409)
    const invalidJumpRes = await patchJson(
      `${API_BASE}/orders/${deliveryOrderId}/status`,
      { status: 'DELIVERED' },
      ownerToken
    );
    if (invalidJumpRes.status === 409) {
      pass('Invalid status jump PLACED -> DELIVERED rejected with 409 Conflict');
    } else {
      fail('Invalid status jump', `Expected 409, got ${invalidJumpRes.status}`);
    }

    // 5.2 Customer cannot mark order CONFIRMED
    const custIllegalTransition = await patchJson(
      `${API_BASE}/orders/${deliveryOrderId}/status`,
      { status: 'CONFIRMED' },
      custToken
    );
    if (custIllegalTransition.status === 403) {
      pass('Customer attempting to CONFIRM order rejected with 403 Forbidden');
    } else {
      fail('Customer transition not blocked', `Expected 403, got ${custIllegalTransition.status}`);
    }

    // 5.3 Valid Step-by-Step Transition for Delivery Order:
    // PLACED -> CONFIRMED
    const s1 = await patchJson(`${API_BASE}/orders/${deliveryOrderId}/status`, { status: 'CONFIRMED' }, ownerToken);
    if (s1.status === 200 && s1.data?.data?.status === 'CONFIRMED') pass('Order status -> CONFIRMED (200)');
    else fail('Status -> CONFIRMED', `Status: ${s1.status}`);

    // CONFIRMED -> PREPARING
    const s2 = await patchJson(`${API_BASE}/orders/${deliveryOrderId}/status`, { status: 'PREPARING' }, ownerToken);
    if (s2.status === 200 && s2.data?.data?.status === 'PREPARING') pass('Order status -> PREPARING (200)');
    else fail('Status -> PREPARING', `Status: ${s2.status}`);

    // PREPARING -> READY
    const s3 = await patchJson(`${API_BASE}/orders/${deliveryOrderId}/status`, { status: 'READY' }, ownerToken);
    if (s3.status === 200 && s3.data?.data?.status === 'READY') pass('Order status -> READY (200)');
    else fail('Status -> READY', `Status: ${s3.status}`);

    // 5.4 Delivery Staff: READY -> OUT_FOR_DELIVERY -> DELIVERED
    const deliveryToken = await login('delivery@example.com');
    const s4 = await patchJson(`${API_BASE}/orders/${deliveryOrderId}/status`, { status: 'OUT_FOR_DELIVERY' }, deliveryToken);
    if (s4.status === 200 && s4.data?.data?.status === 'OUT_FOR_DELIVERY') pass('Delivery staff: READY -> OUT_FOR_DELIVERY (200)');
    else fail('Delivery staff -> OUT_FOR_DELIVERY', `Status: ${s4.status}`);

    const s5 = await patchJson(`${API_BASE}/orders/${deliveryOrderId}/status`, { status: 'DELIVERED' }, deliveryToken);
    if (s5.status === 200 && s5.data?.data?.status === 'DELIVERED') pass('Delivery staff: OUT_FOR_DELIVERY -> DELIVERED (200)');
    else fail('Delivery staff -> DELIVERED', `Status: ${s5.status}`);

    // 5.5 Pickup Order Transitions:
    // PLACED -> CONFIRMED -> PREPARING -> READY_FOR_PICKUP -> PICKED_UP
    const p1 = await patchJson(`${API_BASE}/orders/${pickupOrderId}/status`, { status: 'CONFIRMED' }, ownerToken);
    const p2 = await patchJson(`${API_BASE}/orders/${pickupOrderId}/status`, { status: 'PREPARING' }, ownerToken);
    const p3 = await patchJson(`${API_BASE}/orders/${pickupOrderId}/status`, { status: 'READY_FOR_PICKUP' }, ownerToken);
    const p4 = await patchJson(`${API_BASE}/orders/${pickupOrderId}/status`, { status: 'PICKED_UP' }, ownerToken);
    if (p4.status === 200 && p4.data?.data?.status === 'PICKED_UP') {
      pass('Pickup order transitions: PLACED -> CONFIRMED -> PREPARING -> READY_FOR_PICKUP -> PICKED_UP (200)');
    } else {
      fail('Pickup order lifecycle failed', `${p1.status}/${p2.status}/${p3.status}/${p4.status}`);
    }

    // 5.6 Cancellation & Stock Restock
    // Create a temporary order to test customer cancellation & restock
    const cancelTestOrder = await postJson(`${API_BASE}/orders`, {
      store_id: storeA.id,
      fulfillment_type: 'pickup',
      payment_method: 'cod',
      items: [{ store_product_id: prodA1.id, quantity: 3 }],
    }, custToken);
    const cancelOrderId = cancelTestOrder.data?.data?.id;
    createdOrderIds.push(cancelOrderId);

    // Stock before cancellation
    const stockBeforeCancel = await pool.query('SELECT stock_quantity FROM store_products WHERE id = $1', [prodA1.id]);

    // Customer cancels order
    const cancelRes = await patchJson(
      `${API_BASE}/orders/${cancelOrderId}/status`,
      { status: 'CANCELLED' },
      custToken
    );
    if (cancelRes.status === 200 && cancelRes.data?.data?.status === 'CANCELLED') {
      pass('Customer successfully cancelled order (200)');

      // Verify stock was restored (+3)
      const stockAfterCancel = await pool.query('SELECT stock_quantity FROM store_products WHERE id = $1', [prodA1.id]);
      if (Number(stockAfterCancel.rows[0].stock_quantity) === Number(stockBeforeCancel.rows[0].stock_quantity) + 3) {
        pass('Product stock quantity correctly restored upon order cancellation');
      } else {
        fail('Stock not restored on cancellation', `${stockBeforeCancel.rows[0].stock_quantity} -> ${stockAfterCancel.rows[0].stock_quantity}`);
      }
    } else {
      fail('Cancellation failed', `Status: ${cancelRes.status}`);
    }
  }

  // ----------------------------------------------------
  // TEST 6: CONCURRENCY TEST (RACE CONDITION CHECK)
  // ----------------------------------------------------
  log('\n--- 6. CONCURRENCY & INVENTORY ROW-LOCKING TEST ---');
  {
    // Create a temporary product with stock = 5
    const tempProdRes = await pool.query(`
      INSERT INTO store_products (
        store_id, name, price, stock_quantity, status
      ) VALUES (
        $1, 'Limited Stock Item', 100.00, 5, 'active'
      ) RETURNING id;
    `, [storeA.id]);
    const limitedProdId = tempProdRes.rows[0].id;

    // Concurrently submit two orders for quantity = 4 (Total requested = 8, Available = 5)
    const req1 = postJson(`${API_BASE}/orders`, {
      store_id: storeA.id,
      fulfillment_type: 'pickup',
      payment_method: 'cod',
      items: [{ store_product_id: limitedProdId, quantity: 4 }],
    }, custToken);

    const req2 = postJson(`${API_BASE}/orders`, {
      store_id: storeA.id,
      fulfillment_type: 'pickup',
      payment_method: 'cod',
      items: [{ store_product_id: limitedProdId, quantity: 4 }],
    }, custToken);

    const [res1, res2] = await Promise.all([req1, req2]);

    const statuses = [res1.status, res2.status].sort();
    if (statuses[0] === 201 && statuses[1] === 409) {
      pass('Transactional row locking verified: Exactly one order succeeded (201) and one failed with 409 Conflict');
    } else {
      fail('Concurrency violation detected!', `Statuses: ${statuses.join(', ')}`);
    }

    if (res1.status === 201 && res1.data?.data?.id) createdOrderIds.push(res1.data.data.id);
    if (res2.status === 201 && res2.data?.data?.id) createdOrderIds.push(res2.data.data.id);

    // Verify stock did not become negative
    const finalStockCheck = await pool.query('SELECT stock_quantity FROM store_products WHERE id = $1', [limitedProdId]);
    const remainingStock = Number(finalStockCheck.rows[0].stock_quantity);
    if (remainingStock === 1) {
      pass(`Inventory intact: 5 - 4 = ${remainingStock} remaining (stock never negative)`);
    } else {
      fail('Stock corrupted during concurrency test', `Remaining: ${remainingStock}`);
    }

    // Clean up temporary limited product
    await pool.query('DELETE FROM store_products WHERE id = $1', [limitedProdId]);
  }

  // ----------------------------------------------------
  // CLEANUP TEST RECORDS & RESTORE DATABASE
  // ----------------------------------------------------
  log('\n--- CLEANING UP TEST ORDERS & RESTORING INVENTORY ---');
  for (const orderId of createdOrderIds) {
    await pool.query('DELETE FROM payments WHERE order_id = $1', [orderId]);
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
    await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
  }
  log(`  Cleaned up ${createdOrderIds.length} test orders, items, and payments.`);

  // Restore exact baseline stock for prodA1 and prodA2
  await pool.query('UPDATE store_products SET stock_quantity = $1 WHERE id = $2', [initialStockA1, prodA1.id]);
  await pool.query('UPDATE store_products SET stock_quantity = $1 WHERE id = $2', [initialStockA2, prodA2.id]);
  log('  Restored original product stock quantities.');

  // ----------------------------------------------------
  // TEST 7: DATABASE INTEGRITY FINAL COUNTS
  // ----------------------------------------------------
  log('\n--- 7. DATABASE INTEGRITY FINAL COUNTS ---');
  const postOrderCount = await pool.query('SELECT COUNT(*)::int AS count FROM orders');
  const postItemsCount = await pool.query('SELECT COUNT(*)::int AS count FROM order_items');
  const postPayCount = await pool.query('SELECT COUNT(*)::int AS count FROM payments');

  const finalOrders = postOrderCount.rows[0].count;
  const finalItems = postItemsCount.rows[0].count;
  const finalPayments = postPayCount.rows[0].count;

  log(`Final counts in DB:`);
  log(`  Orders: ${finalOrders} (expected ${baselineOrders})`);
  log(`  Order Items: ${finalItems} (expected ${baselineItems})`);
  log(`  Payments: ${finalPayments} (expected ${baselinePayments})\n`);

  if (finalOrders === baselineOrders && finalItems === baselineItems && finalPayments === baselinePayments) {
    pass('Database counts restored exactly to baseline (no contamination)');
  } else {
    fail('Database contamination detected!', `Counts: ${finalOrders}/${finalItems}/${finalPayments}`);
  }

  // ----------------------------------------------------
  // TEST 8: REGRESSION TESTS
  // ----------------------------------------------------
  log('\n--- 8. REGRESSION TESTS ---');
  {
    const hRes = await getJson(`${API_BASE}/health`);
    if (hRes.status === 200 && hRes.data?.database === 'connected') pass('GET /api/health -> 200');
    else fail('GET /api/health', `Status: ${hRes.status}`);

    const sRes = await getJson(`${API_BASE}/stores`);
    if (sRes.status === 200) pass('GET /api/stores -> 200');
    else fail('GET /api/stores', `Status: ${sRes.status}`);

    const cRes = await getJson(`${API_BASE}/categories`);
    if (cRes.status === 200) pass('GET /api/categories -> 200');
    else fail('GET /api/categories', `Status: ${cRes.status}`);

    const gpRes = await getJson(`${API_BASE}/global-products`);
    if (gpRes.status === 200) pass('GET /api/global-products -> 200');
    else fail('GET /api/global-products', `Status: ${gpRes.status}`);

    const spRes = await getJson(`${API_BASE}/stores/${storeA.id}/products`);
    if (spRes.status === 200) pass('GET /api/stores/:storeId/products -> 200');
    else fail('GET /api/stores/:storeId/products', `Status: ${spRes.status}`);

    const authMeRes = await getJson(`${API_BASE}/auth/me`, custToken);
    if (authMeRes.status === 200 && authMeRes.data?.data?.user?.email === 'customer@example.com') {
      pass('GET /api/auth/me -> 200');
    } else {
      fail('GET /api/auth/me', `Status: ${authMeRes.status}`);
    }

    const custMeRes = await getJson(`${API_BASE}/customers/me`, custToken);
    if (custMeRes.status === 200 && custMeRes.data?.data?.customer?.email === 'customer@example.com') {
      pass('GET /api/customers/me -> 200');
    } else {
      fail('GET /api/customers/me', `Status: ${custMeRes.status}`);
    }

    const custAddrsRes = await getJson(`${API_BASE}/customers/me/addresses`, custToken);
    if (custAddrsRes.status === 200 && Array.isArray(custAddrsRes.data?.data)) {
      pass('GET /api/customers/me/addresses -> 200');
    } else {
      fail('GET /api/customers/me/addresses', `Status: ${custAddrsRes.status}`);
    }
  }

  log('\n====================================================');
  log('BACKEND MILESTONE 7 TEST SUITE COMPLETED');
  log('====================================================');

  await pool.end();
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  pool.end();
  process.exit(1);
});
