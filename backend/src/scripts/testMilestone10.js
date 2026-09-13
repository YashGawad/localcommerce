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
    'reviews',
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
  log('STARTING BACKEND MILESTONE 10 TEST SUITE');
  log('(REVIEWS + RATINGS)');
  log('====================================================\n');

  // 1. Record baseline database counts
  const baselineCounts = await getTableCounts();
  log('Baseline database counts:');
  for (const [t, c] of Object.entries(baselineCounts)) {
    log(`  ${t}: ${c}`);
  }
  log('');

  // Track created IDs for cleanup
  const createdReviewIds = [];
  const createdOrderIds = [];
  const createdCustomerUserIds = [];
  let initialStocks = null;

  try {
    // Record initial stocks to restore later
    const stockRes = await pool.query('SELECT id, stock_quantity FROM store_products');
    initialStocks = stockRes.rows;

    // Login users
    const customerToken = await login('customer@example.com');
    const ownerToken = await login('owner@example.com');
    const staffToken = await login('staff@example.com');
    const deliveryToken = await login('delivery@example.com');
    const adminToken = await login('admin@example.com');

    // Retrieve Seeded Entities
    const order1Res = await pool.query("SELECT id, store_id, customer_id, status FROM orders WHERE order_number = 'LC-100001'");
    const order1 = order1Res.rows[0];

    const order2Res = await pool.query("SELECT id, store_id, customer_id, status FROM orders WHERE order_number = 'LC-100002'");
    const order2 = order2Res.rows[0];

    const store1Id = '10000000-0000-0000-0000-000000000001';
    const store2Id = '10000000-0000-0000-0000-000000000002';
    const globalProduct1Id = '20000000-0000-0000-0000-000000000001'; // Amul Taaza Milk 1L (already reviewed)
    const globalProduct2Id = '20000000-0000-0000-0000-000000000002'; // Tata Salt 1kg (purchased in order1, unreviewed)
    const globalProduct4Id = '20000000-0000-0000-0000-000000000004'; // Fortune Oil (not in order1)

    // Register a secondary customer B for IDOR tests
    const customerBEmail = `cust_b_${Date.now()}@example.com`;
    const regRes = await postJson(`${API_BASE}/auth/register`, {
      name: 'Customer B',
      email: customerBEmail,
      password: DEV_SEED_PASSWORD,
      phone: '9876543210',
    });
    if (regRes.status !== 201) throw new Error('Failed to register Customer B');
    const customerBUserId = regRes.data.data.user.id;
    createdCustomerUserIds.push(customerBUserId);
    const customerBToken = await login(customerBEmail, DEV_SEED_PASSWORD);

    // --- 1. AUTHENTICATION & ROLE RESTRICTIONS ---
    log('--- 1. AUTHENTICATION & ROLE RESTRICTIONS ---');

    // Unauthenticated POST /api/reviews -> 401
    const unauthPost = await postJson(`${API_BASE}/reviews`, {
      order_id: order1.id,
      store_id: store1Id,
      rating: 5,
    });
    if (unauthPost.status === 401) {
      pass('Unauthenticated POST /api/reviews -> 401');
    } else {
      fail('Unauthenticated POST /api/reviews -> 401', unauthPost);
    }

    // Unauthenticated GET /api/customers/me/reviews -> 401
    const unauthMe = await getJson(`${API_BASE}/customers/me/reviews`);
    if (unauthMe.status === 401) {
      pass('Unauthenticated GET /api/customers/me/reviews -> 401');
    } else {
      fail('Unauthenticated GET /api/customers/me/reviews -> 401', unauthMe);
    }

    // Non-customer role (Store Staff) attempting POST /api/reviews -> 403
    const staffReview = await postJson(
      `${API_BASE}/reviews`,
      { order_id: order1.id, store_id: store1Id, rating: 5 },
      staffToken
    );
    if (staffReview.status === 403) {
      pass('Store staff cannot submit reviews -> 403');
    } else {
      fail('Store staff cannot submit reviews -> 403', staffReview);
    }

    // Delivery staff attempting POST /api/reviews -> 403
    const deliveryReview = await postJson(
      `${API_BASE}/reviews`,
      { order_id: order1.id, store_id: store1Id, rating: 5 },
      deliveryToken
    );
    if (deliveryReview.status === 403) {
      pass('Delivery staff cannot submit reviews -> 403');
    } else {
      fail('Delivery staff cannot submit reviews -> 403', deliveryReview);
    }

    // Platform admin attempting POST /api/reviews -> 403 (customer only)
    const adminReview = await postJson(
      `${API_BASE}/reviews`,
      { order_id: order1.id, store_id: store1Id, rating: 5 },
      adminToken
    );
    if (adminReview.status === 403) {
      pass('Platform admin cannot submit customer reviews -> 403');
    } else {
      fail('Platform admin cannot submit customer reviews -> 403', adminReview);
    }

    // --- 2. INPUT VALIDATION ---
    log('\n--- 2. INPUT VALIDATION ---');

    // Malformed order UUID -> 400
    const malformedOrder = await postJson(
      `${API_BASE}/reviews`,
      { order_id: 'bad-uuid', store_id: store1Id, rating: 5 },
      customerToken
    );
    if (malformedOrder.status === 400) {
      pass('Malformed order_id UUID -> 400');
    } else {
      fail('Malformed order_id UUID -> 400', malformedOrder);
    }

    // Both store_id and global_product_id provided -> 400
    const bothTargets = await postJson(
      `${API_BASE}/reviews`,
      { order_id: order1.id, store_id: store1Id, global_product_id: globalProduct1Id, rating: 5 },
      customerToken
    );
    if (bothTargets.status === 400) {
      pass('Supplying both store_id and global_product_id -> 400');
    } else {
      fail('Supplying both store_id and global_product_id -> 400', bothTargets);
    }

    // Neither store_id nor global_product_id provided -> 400
    const neitherTarget = await postJson(
      `${API_BASE}/reviews`,
      { order_id: order1.id, rating: 5 },
      customerToken
    );
    if (neitherTarget.status === 400) {
      pass('Supplying neither store_id nor global_product_id -> 400');
    } else {
      fail('Supplying neither store_id nor global_product_id -> 400', neitherTarget);
    }

    // Malformed store_id -> 400
    const malformedStore = await postJson(
      `${API_BASE}/reviews`,
      { order_id: order1.id, store_id: 'bad-uuid', rating: 5 },
      customerToken
    );
    if (malformedStore.status === 400) {
      pass('Malformed store_id UUID -> 400');
    } else {
      fail('Malformed store_id UUID -> 400', malformedStore);
    }

    // Malformed global_product_id -> 400
    const malformedGp = await postJson(
      `${API_BASE}/reviews`,
      { order_id: order1.id, global_product_id: 'bad-uuid', rating: 5 },
      customerToken
    );
    if (malformedGp.status === 400) {
      pass('Malformed global_product_id UUID -> 400');
    } else {
      fail('Malformed global_product_id UUID -> 400', malformedGp);
    }

    // Rating validation: 0, 6, -1, 3.5, non-number
    const invalidRatings = [0, 6, -1, 3.5, 'five', null];
    let allRatingsRejected = true;
    for (const r of invalidRatings) {
      const res = await postJson(
        `${API_BASE}/reviews`,
        { order_id: order1.id, store_id: store1Id, rating: r },
        customerToken
      );
      if (res.status !== 400) {
        allRatingsRejected = false;
        fail(`Invalid rating ${r} was not rejected with 400`, res);
      }
    }
    if (allRatingsRejected) {
      pass('Invalid ratings (0, 6, -1, decimal, string, null) correctly rejected -> 400');
    }

    // Invalid comment type (number) -> 400
    const badComment = await postJson(
      `${API_BASE}/reviews`,
      { order_id: order1.id, store_id: store1Id, rating: 5, comment: 12345 },
      customerToken
    );
    if (badComment.status === 400) {
      pass('Non-string comment rejected -> 400');
    } else {
      fail('Non-string comment rejected -> 400', badComment);
    }

    // --- 3. PURCHASE VERIFICATION & ELIGIBILITY ---
    log('\n--- 3. PURCHASE VERIFICATION & ELIGIBILITY ---');

    // Non-existent order -> 404
    const nonExistentOrder = await postJson(
      `${API_BASE}/reviews`,
      { order_id: '00000000-0000-0000-0000-999999999999', store_id: store1Id, rating: 5 },
      customerToken
    );
    if (nonExistentOrder.status === 404) {
      pass('Non-existent order UUID -> 404');
    } else {
      fail('Non-existent order UUID -> 404', nonExistentOrder);
    }

    // Customer B attempts to review using Customer A's completed order -> 404 (anti-IDOR)
    const idorOrder = await postJson(
      `${API_BASE}/reviews`,
      { order_id: order1.id, store_id: store1Id, rating: 5 },
      customerBToken
    );
    if (idorOrder.status === 404) {
      pass("Customer B cannot use Customer A's order -> 404 (anti-IDOR)");
    } else {
      fail("Customer B cannot use Customer A's order -> 404 (anti-IDOR)", idorOrder);
    }

    // Review on non-completed order (order2 is PREPARING) -> 400
    const incompleteOrderReview = await postJson(
      `${API_BASE}/reviews`,
      { order_id: order2.id, store_id: store1Id, rating: 5 },
      customerToken
    );
    if (incompleteOrderReview.status === 400) {
      pass('Cannot review an order that is not completed (status PREPARING) -> 400');
    } else {
      fail('Cannot review an order that is not completed (status PREPARING) -> 400', incompleteOrderReview);
    }

    // Cross-store review attempt: Order 1 is from Store 1, customer attempts to review Store 2 -> 400
    const crossStoreReview = await postJson(
      `${API_BASE}/reviews`,
      { order_id: order1.id, store_id: store2Id, rating: 5 },
      customerToken
    );
    if (crossStoreReview.status === 400) {
      pass('Cannot review Store B using order placed at Store A -> 400');
    } else {
      fail('Cannot review Store B using order placed at Store A -> 400', crossStoreReview);
    }

    // Unrelated product review: Order 1 does not contain globalProduct4 -> 400
    const unpurchasedProductReview = await postJson(
      `${API_BASE}/reviews`,
      { order_id: order1.id, global_product_id: globalProduct4Id, rating: 5 },
      customerToken
    );
    if (unpurchasedProductReview.status === 400) {
      pass('Cannot review a global product not purchased in the order -> 400');
    } else {
      fail('Cannot review a global product not purchased in the order -> 400', unpurchasedProductReview);
    }

    // --- 4. SUCCESSFUL PRODUCT REVIEW & DUPLICATE PREVENTION ---
    log('\n--- 4. SUCCESSFUL PRODUCT REVIEW & DUPLICATE PREVENTION ---');

    // Customer A reviews globalProduct2 (Tata Salt 1kg) purchased in order 1 -> 201
    const createProductRev = await postJson(
      `${API_BASE}/reviews`,
      {
        order_id: order1.id,
        global_product_id: globalProduct2Id,
        rating: 4,
        comment: 'Great quality salt, fast delivery!',
      },
      customerToken
    );
    if (createProductRev.status === 201 && createProductRev.data?.data?.id) {
      pass('Customer submits valid product review -> 201 Created');
      createdReviewIds.push(createProductRev.data.data.id);
      const revData = createProductRev.data.data;
      if (
        revData.rating === 4 &&
        revData.global_product_id === globalProduct2Id &&
        revData.store_id === null &&
        revData.status === 'published'
      ) {
        pass('Product review contains correct rating, global_product_id, null store_id, and published status');
      } else {
        fail('Product review data attributes mismatch', revData);
      }
    } else {
      fail('Customer submits valid product review -> 201 Created', createProductRev);
    }

    // Duplicate product review attempt on same order and same global product -> 409 Conflict
    const dupProductRev = await postJson(
      `${API_BASE}/reviews`,
      {
        order_id: order1.id,
        global_product_id: globalProduct2Id,
        rating: 5,
        comment: 'Attempting duplicate review',
      },
      customerToken
    );
    if (dupProductRev.status === 409) {
      pass('Duplicate product review on same order rejected -> 409 Conflict');
    } else {
      fail('Duplicate product review on same order rejected -> 409 Conflict', dupProductRev);
    }

    // Seeded duplicate check: order 1 already had a review for store 1 -> 409 Conflict
    const dupStoreRev = await postJson(
      `${API_BASE}/reviews`,
      {
        order_id: order1.id,
        store_id: store1Id,
        rating: 5,
        comment: 'Duplicate store review attempt',
      },
      customerToken
    );
    if (dupStoreRev.status === 409) {
      pass('Duplicate store review on same order rejected -> 409 Conflict');
    } else {
      fail('Duplicate store review on same order rejected -> 409 Conflict', dupStoreRev);
    }

    // --- 5. END-TO-END FLOW WITH CUSTOMER B ---
    log('\n--- 5. END-TO-END FLOW WITH CUSTOMER B (ORDER TO REVIEW) ---');

    // Add address for Customer B
    const addrRes = await postJson(
      `${API_BASE}/customers/me/addresses`,
      {
        label: 'Home',
        recipient_name: 'Customer B',
        phone: '9876543210',
        address_line1: '456 Market Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400002',
      },
      customerBToken
    );
    if (addrRes.status !== 201) throw new Error(`Failed to create address for Customer B: ${JSON.stringify(addrRes)}`);
    const custBAddressId = addrRes.data.data.id;

    // Customer B places an order from Store 1 (pickup fulfillment)
    // Find store_product for store 1
    const spRes = await pool.query("SELECT id, global_product_id FROM store_products WHERE store_id = $1 AND stock_quantity >= 5 LIMIT 1", [store1Id]);
    const testSp = spRes.rows[0];

    const createOrderRes = await postJson(
      `${API_BASE}/orders`,
      {
        store_id: store1Id,
        fulfillment_type: 'pickup',
        payment_method: 'cod',
        items: [{ store_product_id: testSp.id, quantity: 4 }],
      },
      customerBToken
    );
    if (createOrderRes.status !== 201) throw new Error(`Failed to create test order for Customer B: ${JSON.stringify(createOrderRes)}`);
    const custBOrderId = createOrderRes.data.data.id;
    createdOrderIds.push(custBOrderId);

    // Initial order status is PLACED -> review must fail (400)
    const earlyReview = await postJson(
      `${API_BASE}/reviews`,
      { order_id: custBOrderId, store_id: store1Id, rating: 5 },
      customerBToken
    );
    if (earlyReview.status === 400) {
      pass('Customer B cannot review newly PLACED order -> 400');
    } else {
      fail('Customer B cannot review newly PLACED order -> 400', earlyReview);
    }

    // Transition order through pickup lifecycle: PLACED -> CONFIRMED -> PREPARING -> READY_FOR_PICKUP -> PICKED_UP
    await patchJson(`${API_BASE}/orders/${custBOrderId}/status`, { status: 'CONFIRMED' }, ownerToken);
    await patchJson(`${API_BASE}/orders/${custBOrderId}/status`, { status: 'PREPARING' }, ownerToken);
    await patchJson(`${API_BASE}/orders/${custBOrderId}/status`, { status: 'READY_FOR_PICKUP' }, ownerToken);
    const completeRes = await patchJson(`${API_BASE}/orders/${custBOrderId}/status`, { status: 'PICKED_UP' }, ownerToken);
    if (completeRes.status === 200) {
      pass('Order successfully progressed to PICKED_UP');
    } else {
      fail('Order progression to PICKED_UP failed', completeRes);
    }

    // Now Customer B submits a Store Review for Store 1 -> 201
    const createStoreRev = await postJson(
      `${API_BASE}/reviews`,
      {
        order_id: custBOrderId,
        store_id: store1Id,
        rating: 4,
        comment: 'Excellent in-store pickup experience!',
      },
      customerBToken
    );
    if (createStoreRev.status === 201 && createStoreRev.data?.data?.id) {
      pass('Customer B successfully submits Store Review for completed pickup order -> 201');
      createdReviewIds.push(createStoreRev.data.data.id);
    } else {
      fail('Customer B successfully submits Store Review for completed pickup order -> 201', createStoreRev);
    }

    // Customer B duplicate store review -> 409
    const dupCustBStoreRev = await postJson(
      `${API_BASE}/reviews`,
      { order_id: custBOrderId, store_id: store1Id, rating: 5 },
      customerBToken
    );
    if (dupCustBStoreRev.status === 409) {
      pass('Customer B duplicate store review rejected -> 409 Conflict');
    } else {
      fail('Customer B duplicate store review rejected -> 409 Conflict', dupCustBStoreRev);
    }

    // --- 6. READ APIS & AGGREGATES ---
    log('\n--- 6. READ APIS & AGGREGATES ---');

    // GET /api/reviews (Public list)
    const listRes = await getJson(`${API_BASE}/reviews`);
    if (listRes.status === 200 && Array.isArray(listRes.data?.data)) {
      pass(`Public GET /api/reviews returns list of published reviews (${listRes.data.data.length} items)`);
      const sampleRev = listRes.data.data[0];
      if (sampleRev.customer?.name && sampleRev.rating && !sampleRev.customer?.email) {
        pass('Reviews list includes customer display name and suppresses private customer email/phone');
      }
    } else {
      fail('Public GET /api/reviews failed', listRes);
    }

    // GET /api/reviews/:id
    const reviewId = createdReviewIds[0];
    const singleRev = await getJson(`${API_BASE}/reviews/${reviewId}`);
    if (singleRev.status === 200 && singleRev.data?.data?.id === reviewId) {
      pass('Public GET /api/reviews/:id retrieves single review with correct details');
    } else {
      fail('Public GET /api/reviews/:id failed', singleRev);
    }

    // GET /api/stores/:storeId/reviews
    const storeReviewsRes = await getJson(`${API_BASE}/stores/${store1Id}/reviews`);
    if (
      storeReviewsRes.status === 200 &&
      storeReviewsRes.data?.data?.store_id === store1Id &&
      typeof storeReviewsRes.data?.data?.average_rating === 'number' &&
      typeof storeReviewsRes.data?.data?.review_count === 'number' &&
      storeReviewsRes.data.data.review_count >= 1
    ) {
      pass(`GET /api/stores/:storeId/reviews returns reviews and calculated aggregates (Avg: ${storeReviewsRes.data.data.average_rating}, Count: ${storeReviewsRes.data.data.review_count})`);
    } else {
      fail('GET /api/stores/:storeId/reviews failed', storeReviewsRes);
    }

    // GET /api/global-products/:globalProductId/reviews
    const gpReviewsRes = await getJson(`${API_BASE}/global-products/${globalProduct2Id}/reviews`);
    if (
      gpReviewsRes.status === 200 &&
      gpReviewsRes.data?.data?.global_product_id === globalProduct2Id &&
      typeof gpReviewsRes.data?.data?.average_rating === 'number' &&
      typeof gpReviewsRes.data?.data?.review_count === 'number'
    ) {
      pass(`GET /api/global-products/:globalProductId/reviews returns reviews and calculated aggregates (Avg: ${gpReviewsRes.data.data.average_rating}, Count: ${gpReviewsRes.data.data.review_count})`);
    } else {
      fail('GET /api/global-products/:globalProductId/reviews failed', gpReviewsRes);
    }

    // GET /api/customers/me/reviews (Customer history)
    const custHistory = await getJson(`${API_BASE}/customers/me/reviews`, customerToken);
    if (custHistory.status === 200 && Array.isArray(custHistory.data?.data)) {
      pass(`Customer views own review history -> 200 OK (${custHistory.data.data.length} reviews)`);
    } else {
      fail('Customer views own review history failed', custHistory);
    }

    // Non-customer accessing /api/customers/me/reviews -> 403
    const staffCustHistory = await getJson(`${API_BASE}/customers/me/reviews`, staffToken);
    if (staffCustHistory.status === 403) {
      pass('Store staff cannot access /api/customers/me/reviews -> 403 Forbidden');
    } else {
      fail('Store staff cannot access /api/customers/me/reviews -> 403 Forbidden', staffCustHistory);
    }

    // --- 7. SECURITY & SENSITIVE CREDENTIAL LEAKS ---
    log('\n--- 7. SECURITY & SENSITIVE CREDENTIAL LEAKS ---');
    const samplePayloadString = JSON.stringify({
      list: listRes.data,
      single: singleRev.data,
      store: storeReviewsRes.data,
      gp: gpReviewsRes.data,
      history: custHistory.data,
    });

    const forbiddenPatterns = [
      /password_hash/i,
      /jwt_secret/i,
      /BEGIN RSA PRIVATE KEY/i,
      /postgres:\/\//i,
    ];

    let hasLeak = false;
    for (const pat of forbiddenPatterns) {
      if (pat.test(samplePayloadString)) {
        hasLeak = true;
        fail(`Security leak detected matching pattern ${pat}`);
      }
    }
    if (!hasLeak) {
      pass('Review API responses do not expose password_hash, JWT secrets, or DB credentials');
    }

  } catch (err) {
    fail('Unexpected exception during Milestone 10 tests', err.message || err);
  } finally {
    log('\n--- DATABASE CLEANUP & RESTORATION ---');
    try {
      // 1. Delete created test reviews
      if (createdReviewIds.length > 0) {
        await pool.query('DELETE FROM reviews WHERE id = ANY($1)', [createdReviewIds]);
        log(`Cleaned up ${createdReviewIds.length} test reviews.`);
      }

      // 2. Delete test orders (and cascades: items, payments, delivery_assignments)
      if (createdOrderIds.length > 0) {
        await pool.query('DELETE FROM delivery_assignments WHERE order_id = ANY($1)', [createdOrderIds]);
        await pool.query('DELETE FROM payments WHERE order_id = ANY($1)', [createdOrderIds]);
        await pool.query('DELETE FROM order_items WHERE order_id = ANY($1)', [createdOrderIds]);
        await pool.query('DELETE FROM orders WHERE id = ANY($1)', [createdOrderIds]);
        log(`Cleaned up ${createdOrderIds.length} test orders.`);
      }

      // 3. Delete created test customers/users
      if (createdCustomerUserIds.length > 0) {
        const custRows = await pool.query('SELECT id FROM customers WHERE user_id = ANY($1)', [createdCustomerUserIds]);
        const custIds = custRows.rows.map((r) => r.id);
        if (custIds.length > 0) {
          await pool.query('DELETE FROM customer_addresses WHERE customer_id = ANY($1)', [custIds]);
          await pool.query('DELETE FROM customers WHERE id = ANY($1)', [custIds]);
        }
        await pool.query('DELETE FROM users WHERE id = ANY($1)', [createdCustomerUserIds]);
        log(`Cleaned up ${createdCustomerUserIds.length} test customer users.`);
      }

      // 4. Restore store_product stocks if modified
      if (initialStocks && initialStocks.length > 0) {
        for (const sp of initialStocks) {
          await pool.query('UPDATE store_products SET stock_quantity = $1 WHERE id = $2', [sp.stock_quantity, sp.id]);
        }
        log('Restored store_products stock quantities to baseline.');
      }

      // 5. Check and print baseline vs final counts
      const finalCounts = await getTableCounts();
      log('Database counts: Baseline vs Final:');
      let allMatch = true;
      for (const [table, baseCount] of Object.entries(baselineCounts)) {
        const finCount = finalCounts[table];
        const match = baseCount === finCount;
        if (!match) allMatch = false;
        log(`  ${table.padEnd(22)}: Baseline=${baseCount} | Final=${finCount} | Match=${match ? 'YES' : 'NO'}`);
      }

      if (allMatch) {
        pass('Database successfully restored to exact baseline counts!');
      } else {
        fail('Database count mismatch between baseline and final state!');
      }
    } catch (cleanupErr) {
      console.error('Error during database cleanup:', cleanupErr);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  }

  log('\n====================================================');
  log('MILESTONE 10 TEST SUITE COMPLETED');
  log('====================================================\n');
}

runTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
