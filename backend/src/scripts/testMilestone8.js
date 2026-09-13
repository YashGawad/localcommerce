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
  log('STARTING BACKEND MILESTONE 8 TEST SUITE');
  log('(ORDER OPERATIONS + DELIVERY ASSIGNMENT)');
  log('====================================================\n');

  // 1. Record baseline database counts
  const baselineCounts = await getTableCounts();
  log('Baseline database counts:');
  for (const [t, c] of Object.entries(baselineCounts)) {
    log(`  ${t}: ${c}`);
  }
  log('');

  // Track created IDs for cleanup
  const createdAssignmentIds = [];
  const createdOrderIds = [];
  const createdUserIds = [];
  const createdStoreUserIds = [];
  let initialStocks = null;

  try {
    // Record initial product stock quantities to ensure 100% restoration
    initialStocks = await pool.query('SELECT id, stock_quantity FROM store_products');
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

    // Fetch user IDs
    const userRes = await pool.query('SELECT id, email FROM users');
    const userMap = {};
    userRes.rows.forEach((u) => {
      userMap[u.email] = u.id;
    });

    const deliveryUserId = userMap['delivery@example.com'];
    const staffUserId = userMap['staff@example.com'];
    const customerUserId = userMap['customer@example.com'];

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

    // Retrieve a product from Store A and Store B with sufficient stock
    const prodARes = await pool.query('SELECT id, price FROM store_products WHERE store_id = $1 AND stock_quantity >= 10 LIMIT 1', [storeA.id]);
    const prodBRes = await pool.query('SELECT id, price FROM store_products WHERE store_id = $1 AND stock_quantity >= 10 LIMIT 1', [storeB.id]);
    const prodA = prodARes.rows[0];
    const prodB = prodBRes.rows[0];

    // Existing seed assignment & orders
    const seedAssignRes = await pool.query('SELECT id, order_id, store_id, delivery_staff_user_id FROM delivery_assignments LIMIT 1');
    const seedAssignId = seedAssignRes.rows[0].id;

    const seedOrderRes = await pool.query('SELECT id FROM orders LIMIT 1');
    const seedOrderId = seedOrderRes.rows[0].id;

    // ----------------------------------------------------
    // TEST GROUP 1: AUTHENTICATION
    // ----------------------------------------------------
    log('\n--- 1. AUTHENTICATION & SECURITY (Unauthenticated calls must return 401) ---');
    {
      const r1 = await postJson(`${API_BASE}/orders/${seedOrderId}/delivery-assignment`, {
        delivery_staff_user_id: deliveryUserId,
      });
      if (r1.status === 401) pass('POST /api/orders/:id/delivery-assignment unauthenticated -> 401');
      else fail('POST /api/orders/:id/delivery-assignment unauthenticated', `Status: ${r1.status}`);

      const r2 = await getJson(`${API_BASE}/delivery/assignments`);
      if (r2.status === 401) pass('GET /api/delivery/assignments unauthenticated -> 401');
      else fail('GET /api/delivery/assignments unauthenticated', `Status: ${r2.status}`);

      const r3 = await getJson(`${API_BASE}/delivery/assignments/${seedAssignId}`);
      if (r3.status === 401) pass('GET /api/delivery/assignments/:id unauthenticated -> 401');
      else fail('GET /api/delivery/assignments/:id unauthenticated', `Status: ${r3.status}`);

      const r4 = await patchJson(`${API_BASE}/delivery/assignments/${seedAssignId}/status`, {
        status: 'out_for_delivery',
      });
      if (r4.status === 401) pass('PATCH /api/delivery/assignments/:id/status unauthenticated -> 401');
      else fail('PATCH /api/delivery/assignments/:id/status unauthenticated', `Status: ${r4.status}`);
    }

    // ----------------------------------------------------
    // TEST GROUP 2: ROLE AUTHORIZATION FOR ASSIGNMENT CREATION
    // ----------------------------------------------------
    log('\n--- 2. ROLE AUTHORIZATION FOR ASSIGNMENT CREATION ---');

    // Create a new test delivery order for Store A
    const orderCreateRes = await postJson(
      `${API_BASE}/orders`,
      {
        store_id: storeA.id,
        fulfillment_type: 'delivery',
        customer_address_id: custAddrId,
        payment_method: 'cod',
        items: [{ store_product_id: prodA.id, quantity: 5 }],
      },
      customerToken
    );
    if (orderCreateRes.status !== 201) {
      throw new Error(`Failed to create test order: ${JSON.stringify(orderCreateRes.data)}`);
    }
    const testOrderId = orderCreateRes.data.data.id;
    createdOrderIds.push(testOrderId);

    {
      // 2.1 Customer cannot assign
      const rCust = await postJson(
        `${API_BASE}/orders/${testOrderId}/delivery-assignment`,
        { delivery_staff_user_id: deliveryUserId },
        customerToken
      );
      if (rCust.status === 403) pass('Customer cannot assign delivery staff -> 403');
      else fail('Customer cannot assign delivery staff', `Status: ${rCust.status}`);

      // 2.2 Store Staff cannot assign
      const rStaff = await postJson(
        `${API_BASE}/orders/${testOrderId}/delivery-assignment`,
        { delivery_staff_user_id: deliveryUserId },
        staffToken
      );
      if (rStaff.status === 403) pass('Store staff cannot assign delivery staff -> 403');
      else fail('Store staff cannot assign delivery staff', `Status: ${rStaff.status}`);

      // 2.3 Delivery Staff cannot assign
      const rDeliv = await postJson(
        `${API_BASE}/orders/${testOrderId}/delivery-assignment`,
        { delivery_staff_user_id: deliveryUserId },
        deliveryToken
      );
      if (rDeliv.status === 403) pass('Delivery staff cannot assign delivery staff -> 403');
      else fail('Delivery staff cannot assign delivery staff', `Status: ${rDeliv.status}`);
    }

    // ----------------------------------------------------
    // TEST GROUP 3: INPUT VALIDATION & BUSINESS RULES
    // ----------------------------------------------------
    log('\n--- 3. INPUT VALIDATION & BUSINESS RULES ---');
    {
      // 3.1 Malformed order UUID
      const rBadOrder = await postJson(
        `${API_BASE}/orders/not-a-uuid/delivery-assignment`,
        { delivery_staff_user_id: deliveryUserId },
        ownerToken
      );
      if (rBadOrder.status === 400) pass('Malformed order UUID -> 400');
      else fail('Malformed order UUID', `Status: ${rBadOrder.status}`);

      // 3.2 Non-existent order UUID
      const rNonExistOrder = await postJson(
        `${API_BASE}/orders/00000000-0000-0000-0000-000000009999/delivery-assignment`,
        { delivery_staff_user_id: deliveryUserId },
        ownerToken
      );
      if (rNonExistOrder.status === 404) pass('Non-existent order UUID -> 404');
      else fail('Non-existent order UUID', `Status: ${rNonExistOrder.status}`);

      // 3.3 Missing or malformed delivery_staff_user_id
      const rBadStaff = await postJson(
        `${API_BASE}/orders/${testOrderId}/delivery-assignment`,
        { delivery_staff_user_id: 'invalid-uuid' },
        ownerToken
      );
      if (rBadStaff.status === 400) pass('Malformed delivery_staff_user_id -> 400');
      else fail('Malformed delivery_staff_user_id', `Status: ${rBadStaff.status}`);

      // 3.4 Non-existent delivery staff user
      const rNonExistStaff = await postJson(
        `${API_BASE}/orders/${testOrderId}/delivery-assignment`,
        { delivery_staff_user_id: '00000000-0000-0000-0000-000000009999' },
        ownerToken
      );
      if (rNonExistStaff.status === 400) pass('Non-existent delivery staff user -> 400');
      else fail('Non-existent delivery staff user', `Status: ${rNonExistStaff.status}`);

      // 3.5 Non-delivery user (assigning customer or staff who lacks delivery_staff role)
      const rNonDelivUser = await postJson(
        `${API_BASE}/orders/${testOrderId}/delivery-assignment`,
        { delivery_staff_user_id: staffUserId },
        ownerToken
      );
      if (rNonDelivUser.status === 400) pass('Non-delivery staff user cannot be assigned -> 400');
      else fail('Non-delivery staff user cannot be assigned', `Status: ${rNonDelivUser.status}`);

      // 3.6 Pickup order cannot be assigned
      const pickupOrderRes = await postJson(
        `${API_BASE}/orders`,
        {
          store_id: storeA.id,
          fulfillment_type: 'pickup',
          payment_method: 'cod',
          items: [{ store_product_id: prodA.id, quantity: 5 }],
        },
        customerToken
      );
      if (pickupOrderRes.status === 201) {
        const pickupOrderId = pickupOrderRes.data.data.id;
        createdOrderIds.push(pickupOrderId);

        const rPickupAssign = await postJson(
          `${API_BASE}/orders/${pickupOrderId}/delivery-assignment`,
          { delivery_staff_user_id: deliveryUserId },
          ownerToken
        );
        if (rPickupAssign.status === 400) pass('Pickup order cannot be assigned -> 400');
        else fail('Pickup order cannot be assigned', `Status: ${rPickupAssign.status}`);
      } else {
        fail('Create pickup order for validation', `Status: ${pickupOrderRes.status}`);
      }
    }

    // ----------------------------------------------------
    // TEST GROUP 4: MULTI-TENANT ISOLATION
    // ----------------------------------------------------
    log('\n--- 4. MULTI-TENANT STORE ISOLATION ---');
    {
      // Create an order for Store B
      const orderBRes = await postJson(
        `${API_BASE}/orders`,
        {
          store_id: storeB.id,
          fulfillment_type: 'delivery',
          customer_address_id: custAddrId,
          payment_method: 'cod',
          items: [{ store_product_id: prodB.id, quantity: 5 }],
        },
        customerToken
      );
      if (orderBRes.status === 201) {
        const orderBId = orderBRes.data.data.id;
        createdOrderIds.push(orderBId);

        // 4.1 Owner of Store A cannot assign Store B order
        const rCrossAssign = await postJson(
          `${API_BASE}/orders/${orderBId}/delivery-assignment`,
          { delivery_staff_user_id: deliveryUserId },
          ownerToken
        );
        if (rCrossAssign.status === 403) pass('Store A owner cannot assign Store B order -> 403');
        else fail('Store A owner cannot assign Store B order', `Status: ${rCrossAssign.status}`);
      } else {
        fail('Create Store B order', `Status: ${orderBRes.status}`);
      }

      // 4.2 Cross-store delivery staff assignment check:
      // Create a dedicated delivery staff user for Store B ONLY, ensure Store A owner cannot assign them to Store A order
      const newStaffEmail = `staff_b_temp_${Date.now()}@example.com`;
      const staffBRes = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, status)
         VALUES ('Temp Delivery B', $1, 'hashed_pw', 'delivery_staff', 'active')
         RETURNING id;`,
        [newStaffEmail]
      );
      const tempStaffBId = staffBRes.rows[0].id;
      createdUserIds.push(tempStaffBId);

      const suRes = await pool.query(
        `INSERT INTO store_users (store_id, user_id, role)
         VALUES ($1, $2, 'delivery_staff')
         RETURNING id;`,
        [storeB.id, tempStaffBId]
      );
      createdStoreUserIds.push(suRes.rows[0].id);

      const rCrossStaff = await postJson(
        `${API_BASE}/orders/${testOrderId}/delivery-assignment`,
        { delivery_staff_user_id: tempStaffBId },
        ownerToken
      );
      if (rCrossStaff.status === 400) pass('Cannot assign delivery staff from a different store -> 400');
      else fail('Cannot assign delivery staff from a different store', `Status: ${rCrossStaff.status}`);
    }

    // ----------------------------------------------------
    // TEST GROUP 5: SUCCESSFUL ASSIGNMENT & REASSIGNMENT
    // ----------------------------------------------------
    log('\n--- 5. SUCCESSFUL ASSIGNMENT & REASSIGNMENT ---');
    let testAssignmentId = null;
    {
      // 5.1 Store Owner assigns valid delivery staff
      const rAssign = await postJson(
        `${API_BASE}/orders/${testOrderId}/delivery-assignment`,
        { delivery_staff_user_id: deliveryUserId },
        ownerToken
      );
      if (rAssign.status === 201 && rAssign.data?.success) {
        pass('Store owner successfully assigns eligible delivery staff -> 201');
        testAssignmentId = rAssign.data.data.id;
        createdAssignmentIds.push(testAssignmentId);

        if (rAssign.data.data.status === 'assigned' && rAssign.data.data.delivery_staff_user_id === deliveryUserId) {
          pass('Assignment status is "assigned" and assigned to correct user');
        } else {
          fail('Assignment payload structure', JSON.stringify(rAssign.data.data));
        }
      } else {
        fail('Store owner assigns delivery staff', `Status: ${rAssign.status} ${JSON.stringify(rAssign.data)}`);
      }

      // 5.2 Create a second delivery staff for Store A to test reassignment
      const staffA2Email = `staff_a2_temp_${Date.now()}@example.com`;
      const staffA2Res = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, status)
         VALUES ('Temp Delivery A2', $1, 'hashed_pw', 'delivery_staff', 'active')
         RETURNING id;`,
        [staffA2Email]
      );
      const tempStaffA2Id = staffA2Res.rows[0].id;
      createdUserIds.push(tempStaffA2Id);

      const suA2Res = await pool.query(
        `INSERT INTO store_users (store_id, user_id, role)
         VALUES ($1, $2, 'delivery_staff')
         RETURNING id;`,
        [storeA.id, tempStaffA2Id]
      );
      createdStoreUserIds.push(suA2Res.rows[0].id);

      // Reassign to tempStaffA2
      const rReassign = await postJson(
        `${API_BASE}/orders/${testOrderId}/delivery-assignment`,
        { delivery_staff_user_id: tempStaffA2Id },
        ownerToken
      );
      if (rReassign.status === 200 && rReassign.data?.data?.delivery_staff_user_id === tempStaffA2Id) {
        pass('Store owner successfully reassigns delivery staff -> 200');
      } else {
        fail('Store owner reassigns delivery staff', `Status: ${rReassign.status}`);
      }

      // Reassign back to primary delivery staff
      const rReassignBack = await postJson(
        `${API_BASE}/orders/${testOrderId}/delivery-assignment`,
        { delivery_staff_user_id: deliveryUserId },
        ownerToken
      );
      if (rReassignBack.status === 200 && rReassignBack.data?.data?.delivery_staff_user_id === deliveryUserId) {
        pass('Store owner reassigns back to primary delivery staff -> 200');
      } else {
        fail('Store owner reassigns back', `Status: ${rReassignBack.status}`);
      }
    }

    // ----------------------------------------------------
    // TEST GROUP 6: VIEW ASSIGNMENTS & DETAILS
    // ----------------------------------------------------
    log('\n--- 6. VIEW ASSIGNMENTS & DETAILS ---');
    {
      // 6.1 Delivery staff views own assignments
      const rStaffList = await getJson(`${API_BASE}/delivery/assignments`, deliveryToken);
      if (rStaffList.status === 200 && Array.isArray(rStaffList.data?.data)) {
        pass('Delivery staff views assignments -> 200');
        const allAssignedToMe = rStaffList.data.data.every((a) => a.delivery_staff_user_id === deliveryUserId);
        if (allAssignedToMe) {
          pass('All returned assignments belong strictly to authenticated delivery staff');
        } else {
          fail('Delivery staff list isolation', 'Returned assignments of other staff');
        }
      } else {
        fail('Delivery staff views assignments', `Status: ${rStaffList.status}`);
      }

      // 6.2 Store Owner views store assignments
      const rOwnerList = await getJson(`${API_BASE}/delivery/assignments`, ownerToken);
      if (rOwnerList.status === 200 && Array.isArray(rOwnerList.data?.data)) {
        pass('Store owner views assignments -> 200');
        const allInStoreA = rOwnerList.data.data.every((a) => a.store_id === storeA.id);
        if (allInStoreA) {
          pass('Store owner sees only assignments belonging to their store');
        } else {
          fail('Store owner list isolation', 'Returned assignments from another store');
        }
      } else {
        fail('Store owner views assignments', `Status: ${rOwnerList.status}`);
      }

      // 6.3 Customer cannot view assignments
      const rCustList = await getJson(`${API_BASE}/delivery/assignments`, customerToken);
      if (rCustList.status === 403) pass('Customer viewing assignments -> 403 Forbidden');
      else fail('Customer viewing assignments', `Status: ${rCustList.status}`);

      // 6.4 Assignment details by ID
      const rDetail = await getJson(`${API_BASE}/delivery/assignments/${testAssignmentId}`, deliveryToken);
      if (rDetail.status === 200 && rDetail.data?.data?.id === testAssignmentId) {
        pass('Delivery staff gets assignment details by ID -> 200');
      } else {
        fail('Delivery staff gets assignment details by ID', `Status: ${rDetail.status}`);
      }

      // 6.5 Isolation on details: another user cannot view
      // Non-member or customer attempting to view testAssignmentId
      const rCustDetail = await getJson(`${API_BASE}/delivery/assignments/${testAssignmentId}`, customerToken);
      if (rCustDetail.status === 403 || rCustDetail.status === 404) {
        pass('Customer cannot access internal assignment details -> 403/404');
      } else {
        fail('Customer cannot access internal assignment details', `Status: ${rCustDetail.status}`);
      }
    }

    // ----------------------------------------------------
    // TEST GROUP 7: ATOMIC STATUS TRANSITIONS & ORDER LIFECYCLE
    // ----------------------------------------------------
    log('\n--- 7. ATOMIC STATUS TRANSITIONS & ORDER LIFECYCLE ---');
    {
      // Currently testOrder is PLACED.
      // Attempting to move assignment to 'out_for_delivery' while order is not READY must fail with 409
      const rPremature = await patchJson(
        `${API_BASE}/delivery/assignments/${testAssignmentId}/status`,
        { status: 'out_for_delivery' },
        deliveryToken
      );
      if (rPremature.status === 409) {
        pass('Cannot dispatch delivery while order is not READY -> 409 Conflict');
      } else {
        fail('Premature dispatch prevention', `Status: ${rPremature.status}`);
      }

      // Progress order legitimately through store staff: PLACED -> CONFIRMED -> PREPARING -> READY
      const rConf = await patchJson(`${API_BASE}/orders/${testOrderId}/status`, { status: 'CONFIRMED' }, staffToken);
      const rPrep = await patchJson(`${API_BASE}/orders/${testOrderId}/status`, { status: 'PREPARING' }, staffToken);
      const rReady = await patchJson(`${API_BASE}/orders/${testOrderId}/status`, { status: 'READY' }, staffToken);
      if (rReady.status === 200 && rReady.data?.data?.status === 'READY') {
        pass('Store staff progressed order to READY');
      } else {
        fail('Progress order to READY', `Status: ${rReady.status}`);
      }

      // 7.1 Delivery Staff dispatches order: assigned -> out_for_delivery
      const rDispatch = await patchJson(
        `${API_BASE}/delivery/assignments/${testAssignmentId}/status`,
        { status: 'out_for_delivery' },
        deliveryToken
      );
      if (rDispatch.status === 200 && rDispatch.data?.data?.status === 'out_for_delivery') {
        pass('Delivery staff transitions assignment: assigned -> out_for_delivery (200)');

        // Verify corresponding order was updated to OUT_FOR_DELIVERY in DB
        const ordCheck = await pool.query('SELECT status FROM orders WHERE id = $1', [testOrderId]);
        if (ordCheck.rows[0]?.status === 'OUT_FOR_DELIVERY') {
          pass('Associated order atomically transitioned: READY -> OUT_FOR_DELIVERY');
        } else {
          fail('Order status after dispatch', `Expected OUT_FOR_DELIVERY, got ${ordCheck.rows[0]?.status}`);
        }
      } else {
        fail('Delivery staff dispatches order', `Status: ${rDispatch.status}`);
      }

      // 7.2 Invalid transition:
      // (a) Invalid status string -> 400
      const rBadStatus = await patchJson(
        `${API_BASE}/delivery/assignments/${testAssignmentId}/status`,
        { status: 'invalid_status' },
        deliveryToken
      );
      if (rBadStatus.status === 400) {
        pass('Unsupported status string correctly rejected (400)');
      } else {
        fail('Unsupported status string rejection', `Status: ${rBadStatus.status}`);
      }

      // (b) Invalid state transition: repeating out_for_delivery when already out_for_delivery -> 409
      const rInvalidTrans = await patchJson(
        `${API_BASE}/delivery/assignments/${testAssignmentId}/status`,
        { status: 'out_for_delivery' },
        deliveryToken
      );
      if (rInvalidTrans.status === 409) {
        pass('Invalid state transition (already out_for_delivery) correctly rejected (409)');
      } else {
        fail('Invalid transition rejection', `Status: ${rInvalidTrans.status}`);
      }

      // 7.3 Delivery Staff completes delivery: out_for_delivery -> delivered
      const rDeliver = await patchJson(
        `${API_BASE}/delivery/assignments/${testAssignmentId}/status`,
        { status: 'delivered' },
        deliveryToken
      );
      if (rDeliver.status === 200 && rDeliver.data?.data?.status === 'delivered') {
        pass('Delivery staff transitions assignment: out_for_delivery -> delivered (200)');

        // Verify corresponding order was updated to DELIVERED in DB
        const ordCheck2 = await pool.query('SELECT status FROM orders WHERE id = $1', [testOrderId]);
        if (ordCheck2.rows[0]?.status === 'DELIVERED') {
          pass('Associated order atomically transitioned: OUT_FOR_DELIVERY -> DELIVERED');
        } else {
          fail('Order status after delivery', `Expected DELIVERED, got ${ordCheck2.rows[0]?.status}`);
        }
      } else {
        fail('Delivery staff completes delivery', `Status: ${rDeliver.status}`);
      }

      // 7.4 Already delivered order cannot be assigned or reassigned
      const rReassignDelivered = await postJson(
        `${API_BASE}/orders/${testOrderId}/delivery-assignment`,
        { delivery_staff_user_id: deliveryUserId },
        ownerToken
      );
      if (rReassignDelivered.status === 409) {
        pass('Already delivered order cannot be reassigned -> 409 Conflict');
      } else {
        fail('Reassign already delivered order', `Status: ${rReassignDelivered.status}`);
      }
    }

    // ----------------------------------------------------
    // TEST GROUP 8: CONCURRENCY / ROW LOCKING
    // ----------------------------------------------------
    log('\n--- 8. CONCURRENCY & ROW LOCKING ---');
    {
      // Create a fresh test delivery order for concurrency testing
      const concOrderRes = await postJson(
        `${API_BASE}/orders`,
        {
          store_id: storeA.id,
          fulfillment_type: 'delivery',
          customer_address_id: custAddrId,
          payment_method: 'cod',
          items: [{ store_product_id: prodA.id, quantity: 5 }],
        },
        customerToken
      );
      const concOrderId = concOrderRes.data.data.id;
      createdOrderIds.push(concOrderId);

      // Move order to READY
      await patchJson(`${API_BASE}/orders/${concOrderId}/status`, { status: 'CONFIRMED' }, staffToken);
      await patchJson(`${API_BASE}/orders/${concOrderId}/status`, { status: 'PREPARING' }, staffToken);
      await patchJson(`${API_BASE}/orders/${concOrderId}/status`, { status: 'READY' }, staffToken);

      // Assign delivery
      const concAssignRes = await postJson(
        `${API_BASE}/orders/${concOrderId}/delivery-assignment`,
        { delivery_staff_user_id: deliveryUserId },
        ownerToken
      );
      const concAssignId = concAssignRes.data.data.id;
      createdAssignmentIds.push(concAssignId);

      // Fire two concurrent requests to transition assigned -> out_for_delivery
      const [p1, p2] = await Promise.all([
        patchJson(`${API_BASE}/delivery/assignments/${concAssignId}/status`, { status: 'out_for_delivery' }, deliveryToken),
        patchJson(`${API_BASE}/delivery/assignments/${concAssignId}/status`, { status: 'out_for_delivery' }, deliveryToken),
      ]);

      const statuses = [p1.status, p2.status].sort();
      if (statuses[0] === 200 && statuses[1] === 409) {
        pass('Concurrent dispatch race condition handled: exactly 1 succeeded (200) and 1 rejected (409)');
      } else {
        fail('Concurrent dispatch test', `Statuses received: [${p1.status}, ${p2.status}]`);
      }
    }

    // ----------------------------------------------------
    // TEST GROUP 9: SECURITY CHECKS
    // ----------------------------------------------------
    log('\n--- 9. SECURITY (NO SENSITIVE CREDENTIAL LEAKS) ---');
    {
      const rCheck = await getJson(`${API_BASE}/delivery/assignments/${testAssignmentId}`, deliveryToken);
      const bodyStr = JSON.stringify(rCheck.data);

      if (bodyStr.includes('password') || bodyStr.includes('hash') || bodyStr.includes('secret')) {
        fail('Security field leakage', 'Response contains password/hash/secret');
      } else {
        pass('Delivery assignment API responses do not expose password_hash or secret tokens');
      }
    }

  } catch (err) {
    fail('Unexpected test error', err.message);
  } finally {
    // ----------------------------------------------------
    // CLEANUP: RESTORE DATABASE TO EXACT BASELINE
    // ----------------------------------------------------
    log('\n--- DATABASE CLEANUP ---');

    // 1. Delete created delivery assignments
    if (createdAssignmentIds.length > 0) {
      await pool.query('DELETE FROM delivery_assignments WHERE id = ANY($1)', [createdAssignmentIds]);
    }

    // 2. Delete created orders (cascades to order_items, payments, etc.)
    if (createdOrderIds.length > 0) {
      await pool.query('DELETE FROM orders WHERE id = ANY($1)', [createdOrderIds]);
    }

    // 3. Delete created store_users
    if (createdStoreUserIds.length > 0) {
      await pool.query('DELETE FROM store_users WHERE id = ANY($1)', [createdStoreUserIds]);
    }

    // 4. Delete created users
    if (createdUserIds.length > 0) {
      await pool.query('DELETE FROM users WHERE id = ANY($1)', [createdUserIds]);
    }

    // 5. Restore all product stock quantities
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
    log('MILESTONE 8 TEST SUITE COMPLETED');
    log('====================================================');

    await pool.end();
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
