const pool = require('../config/db');

const API_BASE = 'http://localhost:5000/api';
const DEV_SEED_PASSWORD = process.env.DEV_SEED_PASSWORD || 'Password@123';

const log = (msg) => console.log(msg);
const pass = (testName) => console.log(`  ✓ [PASS] ${testName}`);
const fail = (testName, detail) => {
  console.error(`  ✗ [FAIL] ${testName}:`, detail);
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

async function run() {
  log('===============================================================');
  log('LOCALCOMMERCE FULL COMMERCE CYCLE & DELIVERY STAFF FLOW TEST');
  log('===============================================================');

  const createdUserEmails = [];
  const createdStoreIds = [];
  const createdOrderIds = [];
  const createdProductIds = [];
  const createdCategoryIds = [];

  // Record baseline database counts
  const baselineUsers = await pool.query('SELECT COUNT(*) FROM users');
  const baselineStores = await pool.query('SELECT COUNT(*) FROM stores');
  const baselineOrders = await pool.query('SELECT COUNT(*) FROM orders');
  log(`Baseline counts: Users=${baselineUsers.rows[0].count}, Stores=${baselineStores.rows[0].count}, Orders=${baselineOrders.rows[0].count}`);

  try {
    const timestamp = Date.now();

    // ================================================================
    // PART A: TENANT SETUP (Store A & Store B)
    // ================================================================
    log('\n--- PART A: TENANT SETUP (Store A & Store B) ---');

    // 1. Create Business Owner A and Store A
    const ownerAEmail = `owner_a_${timestamp}@example.com`;
    createdUserEmails.push(ownerAEmail);
    const regOwnerARes = await postJson(`${API_BASE}/auth/business/register`, {
      name: 'Owner Alice',
      email: ownerAEmail,
      password: DEV_SEED_PASSWORD,
      phone: '+919811111111',
      store: {
        name: `Alice Mart ${timestamp}`,
        slug: `alice-mart-${timestamp}`,
        address: '123 Market St',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560001',
      },
    });

    if (regOwnerARes.status !== 201) {
      throw new Error(`Failed to register Owner A: ${JSON.stringify(regOwnerARes.data)}`);
    }
    const tokenOwnerA = regOwnerARes.data.data.token;
    const storeAId = regOwnerARes.data.data.store.id;
    createdStoreIds.push(storeAId);
    pass('Created Business Owner A and Store A');

    // 2. Create Delivery Staff A via Store Staff Endpoint
    const staffAEmail = `staff_a_${timestamp}@example.com`;
    createdUserEmails.push(staffAEmail);
    const addStaffARes = await postJson(
      `${API_BASE}/stores/${storeAId}/staff`,
      {
        name: 'Rider Anil',
        email: staffAEmail,
        phone: '+919822222222',
        role: 'delivery_staff',
        password: DEV_SEED_PASSWORD,
      },
      tokenOwnerA
    );

    if (addStaffARes.status !== 201) {
      throw new Error(`Failed to add Delivery Staff A: ${JSON.stringify(addStaffARes.data)}`);
    }
    const deliveryStaffAUserId = addStaffARes.data.data.user_id;
    pass('Store Owner A created Delivery Staff A account via POST /api/stores/:id/staff');

    // 3. Verify Staff A membership in store_users
    const staffACheck = await pool.query(
      `SELECT role FROM store_users WHERE store_id = $1 AND user_id = $2`,
      [storeAId, deliveryStaffAUserId]
    );
    if (staffACheck.rows.length === 1 && staffACheck.rows[0].role === 'delivery_staff') {
      pass('Delivery Staff A is verified in store_users with role "delivery_staff"');
    } else {
      fail('Delivery Staff A store_users membership check', staffACheck.rows);
    }

    // 4. Login as Delivery Staff A
    const loginStaffARes = await postJson(`${API_BASE}/auth/login`, {
      email: staffAEmail,
      password: DEV_SEED_PASSWORD,
    });
    if (loginStaffARes.status !== 200 || loginStaffARes.data.data.user.role !== 'delivery_staff') {
      throw new Error(`Delivery Staff A login failed: ${JSON.stringify(loginStaffARes.data)}`);
    }
    const tokenStaffA = loginStaffARes.data.data.token;
    pass('Delivery Staff A logged in successfully at /api/auth/login');

    // 5. Create Business Owner B and Store B
    const ownerBEmail = `owner_b_${timestamp}@example.com`;
    createdUserEmails.push(ownerBEmail);
    const regOwnerBRes = await postJson(`${API_BASE}/auth/business/register`, {
      name: 'Owner Bob',
      email: ownerBEmail,
      password: DEV_SEED_PASSWORD,
      phone: '+919833333333',
      store: {
        name: `Bob Bazaar ${timestamp}`,
        slug: `bob-bazaar-${timestamp}`,
        address: '456 Commercial Rd',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560002',
      },
    });

    if (regOwnerBRes.status !== 201) {
      throw new Error(`Failed to register Owner B: ${JSON.stringify(regOwnerBRes.data)}`);
    }
    const tokenOwnerB = regOwnerBRes.data.data.token;
    const storeBId = regOwnerBRes.data.data.store.id;
    createdStoreIds.push(storeBId);
    pass('Created Business Owner B and Store B');

    // 6. Create Delivery Staff B in Store B
    const staffBEmail = `staff_b_${timestamp}@example.com`;
    createdUserEmails.push(staffBEmail);
    const addStaffBRes = await postJson(
      `${API_BASE}/stores/${storeBId}/staff`,
      {
        name: 'Rider Bharat',
        email: staffBEmail,
        phone: '+919844444444',
        role: 'delivery_staff',
        password: DEV_SEED_PASSWORD,
      },
      tokenOwnerB
    );
    if (addStaffBRes.status !== 201) {
      throw new Error(`Failed to add Delivery Staff B: ${JSON.stringify(addStaffBRes.data)}`);
    }
    const deliveryStaffBUserId = addStaffBRes.data.data.user_id;
    pass('Store Owner B created Delivery Staff B in Store B');

    const loginStaffBRes = await postJson(`${API_BASE}/auth/login`, {
      email: staffBEmail,
      password: DEV_SEED_PASSWORD,
    });
    const tokenStaffB = loginStaffBRes.data.data.token;
    pass('Delivery Staff B logged in successfully');

    // 7. Add Category & Product in Store A
    const catRes = await postJson(
      `${API_BASE}/categories`,
      {
        name: `Groceries ${timestamp}`,
        slug: `groceries-${timestamp}`,
      },
      tokenOwnerA
    );
    const categoryId = catRes.data?.data?.category?.id || catRes.data?.category?.id || (await pool.query('SELECT id FROM categories LIMIT 1')).rows[0].id;
    if (catRes.data?.data?.category?.id) createdCategoryIds.push(catRes.data.data.category.id);

    const prodRes = await postJson(
      `${API_BASE}/stores/${storeAId}/products`,
      {
        name: `Fresh Organic Milk ${timestamp}`,
        description: 'Chilled pasteurized farm milk',
        price: 60,
        unit: '1L',
        category_id: categoryId,
        stock_quantity: 50,
      },
      tokenOwnerA
    );

    if (prodRes.status !== 201) {
      throw new Error(`Failed to create product in Store A: ${JSON.stringify(prodRes.data)}`);
    }
    const storeProductId = prodRes.data.data.id;
    const globalProductId = prodRes.data.data.product_id;
    createdProductIds.push(globalProductId);
    pass('Created product in Store A catalog');

    // 8. Create Customer Account & Address
    const customerEmail = `customer_${timestamp}@example.com`;
    createdUserEmails.push(customerEmail);
    const custRegRes = await postJson(`${API_BASE}/auth/register`, {
      name: 'Customer Chetan',
      email: customerEmail,
      password: DEV_SEED_PASSWORD,
      phone: '+919855555555',
    });
    if (custRegRes.status !== 201) {
      throw new Error(`Failed to register Customer: ${JSON.stringify(custRegRes.data)}`);
    }
    const custLoginRes = await postJson(`${API_BASE}/auth/login`, {
      email: customerEmail,
      password: DEV_SEED_PASSWORD,
    });
    const tokenCustomer = custLoginRes.data.data.token;
    pass('Customer registered and authenticated');


    const addrRes = await postJson(
      `${API_BASE}/customers/me/addresses`,
      {
        label: 'Home',
        recipient_name: 'Customer Chetan',
        phone: '+919855555555',
        address_line1: 'Flat 101, Galaxy Apts',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560001',
        is_default: true,
      },
      tokenCustomer
    );
    if (addrRes.status !== 201) {
      throw new Error(`Failed to create address: ${JSON.stringify(addrRes.data)}`);
    }
    const customerAddressId = addrRes.data.data.id;
    pass('Customer delivery address saved');


    // ================================================================
    // PART B: DELIVERY FLOW EXECUTION
    // ================================================================
    log('\n--- PART B: DELIVERY FLOW EXECUTION ---');

    // 1. Customer creates delivery order
    const createDeliveryOrderRes = await postJson(
      `${API_BASE}/orders`,
      {
        store_id: storeAId,
        fulfillment_type: 'delivery',
        customer_address_id: customerAddressId,
        payment_method: 'cod',
        items: [
          {
            store_product_id: storeProductId,
            quantity: 2,
          },
        ],
      },
      tokenCustomer
    );
    if (createDeliveryOrderRes.status !== 201) {
      throw new Error(`Failed to create delivery order: ${JSON.stringify(createDeliveryOrderRes.data)}`);
    }
    const deliveryOrderId = createDeliveryOrderRes.data.data.id;
    createdOrderIds.push(deliveryOrderId);
    pass(`Customer created delivery order #${createDeliveryOrderRes.data.data.order_number} (status: PLACED)`);

    // 2. Business advances order: PLACED -> CONFIRMED -> PREPARING -> READY
    await patchJson(`${API_BASE}/orders/${deliveryOrderId}/status`, { status: 'CONFIRMED' }, tokenOwnerA);
    await patchJson(`${API_BASE}/orders/${deliveryOrderId}/status`, { status: 'PREPARING' }, tokenOwnerA);
    const readyRes = await patchJson(`${API_BASE}/orders/${deliveryOrderId}/status`, { status: 'READY' }, tokenOwnerA);
    if (readyRes.status === 200 && readyRes.data.data.status === 'READY') {
      pass('Business Owner moved order: PLACED → CONFIRMED → PREPARING → READY');
    } else {
      fail('Business order status advance to READY', readyRes);
    }

    // 3. Business assigns Delivery Staff A to the order
    const assignRes = await postJson(
      `${API_BASE}/orders/${deliveryOrderId}/delivery-assignment`,
      { delivery_staff_user_id: deliveryStaffAUserId },
      tokenOwnerA
    );
    if (assignRes.status === 201 && assignRes.data.data.delivery_staff_user_id === deliveryStaffAUserId) {
      pass('Business Owner A assigned Store A delivery staff to the order');
    } else {
      fail('Delivery assignment creation', assignRes);
    }
    const assignmentId = assignRes.data.data.id;

    // 4. Delivery Staff A retrieves own assignments
    const staffDeliveriesRes = await getJson(`${API_BASE}/delivery/assignments`, tokenStaffA);
    if (
      staffDeliveriesRes.status === 200 &&
      Array.isArray(staffDeliveriesRes.data.data) &&
      staffDeliveriesRes.data.data.some((a) => a.order_id === deliveryOrderId)
    ) {
      pass('Delivery Staff A retrieved assigned deliveries via GET /api/delivery/assignments');
    } else {
      fail('Delivery Staff A assignment retrieval', staffDeliveriesRes);
    }

    // 5. Delivery Staff A transitions: assigned -> out_for_delivery
    const startDeliveryRes = await patchJson(
      `${API_BASE}/delivery/assignments/${assignmentId}/status`,
      { status: 'out_for_delivery' },
      tokenStaffA
    );
    if (startDeliveryRes.status === 200 && startDeliveryRes.data.data.status === 'out_for_delivery') {
      pass('Delivery Staff A started delivery (assignment status: out_for_delivery)');
    } else {
      fail('Start delivery status transition', startDeliveryRes);
    }

    // 6. Verify Customer sees order is OUT_FOR_DELIVERY
    const custCheckOutRes = await getJson(`${API_BASE}/orders/${deliveryOrderId}`, tokenCustomer);
    if (custCheckOutRes.status === 200 && custCheckOutRes.data.data.status === 'OUT_FOR_DELIVERY') {
      pass('Customer verified order status is OUT_FOR_DELIVERY');
    } else {
      fail('Customer check OUT_FOR_DELIVERY', custCheckOutRes);
    }

    // 7. Delivery Staff A completes delivery: out_for_delivery -> delivered
    const completeDeliveryRes = await patchJson(
      `${API_BASE}/delivery/assignments/${assignmentId}/status`,
      { status: 'delivered' },
      tokenStaffA
    );
    if (completeDeliveryRes.status === 200 && completeDeliveryRes.data.data.status === 'delivered') {
      pass('Delivery Staff A marked delivery as completed (delivered)');
    } else {
      fail('Complete delivery transition', completeDeliveryRes);
    }

    // 8. Verify Customer sees DELIVERED and review eligibility
    const custCheckDeliveredRes = await getJson(`${API_BASE}/orders/${deliveryOrderId}`, tokenCustomer);
    if (custCheckDeliveredRes.status === 200 && custCheckDeliveredRes.data.data.status === 'DELIVERED') {
      pass('Customer verified order status is DELIVERED');
    } else {
      fail('Customer check DELIVERED', custCheckDeliveredRes);
    }

    const reviewRes = await postJson(
      `${API_BASE}/reviews`,
      {
        order_id: deliveryOrderId,
        store_id: storeAId,
        rating: 5,
        comment: 'Excellent on-time doorstep delivery!',
      },
      tokenCustomer
    );
    if (reviewRes.status === 201) {
      pass('Customer verified review eligibility: review successfully created for DELIVERED order');
    } else {
      fail('Customer review creation for delivered order', reviewRes);
    }


    // ================================================================
    // PART C: PICKUP FLOW EXECUTION
    // ================================================================
    log('\n--- PART C: PICKUP FLOW EXECUTION (NO DELIVERY STAFF) ---');

    // 1. Customer creates pickup order
    const createPickupOrderRes = await postJson(
      `${API_BASE}/orders`,
      {
        store_id: storeAId,
        fulfillment_type: 'pickup',
        payment_method: 'cod',
        items: [
          {
            store_product_id: storeProductId,
            quantity: 1,
          },
        ],
      },
      tokenCustomer
    );
    if (createPickupOrderRes.status !== 201) {
      throw new Error(`Failed to create pickup order: ${JSON.stringify(createPickupOrderRes.data)}`);
    }
    const pickupOrderId = createPickupOrderRes.data.data.id;
    createdOrderIds.push(pickupOrderId);
    pass(`Customer created pickup order #${createPickupOrderRes.data.data.order_number} (status: PLACED)`);

    // 2. Business advances pickup order: PLACED -> CONFIRMED -> PREPARING -> READY_FOR_PICKUP
    await patchJson(`${API_BASE}/orders/${pickupOrderId}/status`, { status: 'CONFIRMED' }, tokenOwnerA);
    await patchJson(`${API_BASE}/orders/${pickupOrderId}/status`, { status: 'PREPARING' }, tokenOwnerA);
    const readyPickupRes = await patchJson(`${API_BASE}/orders/${pickupOrderId}/status`, { status: 'READY_FOR_PICKUP' }, tokenOwnerA);
    if (readyPickupRes.status === 200 && readyPickupRes.data.data.status === 'READY_FOR_PICKUP') {
      pass('Business advanced pickup order: PLACED → CONFIRMED → PREPARING → READY_FOR_PICKUP');
    } else {
      fail('Pickup advance to READY_FOR_PICKUP', readyPickupRes);
    }

    // 3. Verify NO delivery assignment exists for this pickup order
    const pickupAssignmentCheck = await pool.query(
      `SELECT id FROM delivery_assignments WHERE order_id = $1`,
      [pickupOrderId]
    );
    if (pickupAssignmentCheck.rows.length === 0) {
      pass('Verified: No delivery assignment created for pickup order');
    } else {
      fail('Pickup order should not have delivery assignment', pickupAssignmentCheck.rows);
    }

    // 4. Business marks picked up
    const pickedUpRes = await patchJson(`${API_BASE}/orders/${pickupOrderId}/status`, { status: 'PICKED_UP' }, tokenOwnerA);
    if (pickedUpRes.status === 200 && pickedUpRes.data.data.status === 'PICKED_UP') {
      pass('Business marked order as PICKED_UP');
    } else {
      fail('Mark PICKED_UP', pickedUpRes);
    }

    // 5. Customer verifies final status
    const custPickupCheck = await getJson(`${API_BASE}/orders/${pickupOrderId}`, tokenCustomer);
    if (custPickupCheck.status === 200 && custPickupCheck.data.data.status === 'PICKED_UP') {
      pass('Customer verified final pickup order status is PICKED_UP');
    } else {
      fail('Customer verify PICKED_UP', custPickupCheck);
    }

    // ================================================================
    // PART D: MULTI-TENANT ISOLATION & SECURITY BOUNDARIES
    // ================================================================
    log('\n--- PART D: MULTI-TENANT ISOLATION & SECURITY BOUNDARIES ---');

    // 1. Owner A tries to assign Store A order to Delivery Staff B (from Store B) -> must fail (400)
    const crossStaffAssignRes = await postJson(
      `${API_BASE}/orders/${deliveryOrderId}/delivery-assignment`,
      { delivery_staff_user_id: deliveryStaffBUserId },
      tokenOwnerA
    );
    if (crossStaffAssignRes.status === 400 || crossStaffAssignRes.status === 409) {
      pass('Security: Owner A cannot assign Store A order to Delivery Staff B (from Store B) -> 400');
    } else {
      fail('Cross-store staff assignment should fail', crossStaffAssignRes);
    }

    // 2. Delivery Staff A cannot see Store B assignments
    const staffAAssignments = await getJson(`${API_BASE}/delivery/assignments`, tokenStaffA);
    const hasStoreBAssignments = staffAAssignments.data.data?.some((a) => a.store_id === storeBId);
    if (!hasStoreBAssignments) {
      pass('Isolation: Delivery Staff A cannot see any Store B assignments');
    } else {
      fail('Delivery Staff A saw Store B assignments', staffAAssignments);
    }

    // 3. Delivery Staff B cannot see Delivery Staff A assignments
    const staffBAssignments = await getJson(`${API_BASE}/delivery/assignments`, tokenStaffB);
    const hasStaffAAssignments = staffBAssignments.data.data?.some((a) => a.delivery_staff_user_id === deliveryStaffAUserId);
    if (!hasStaffAAssignments) {
      pass('Isolation: Delivery Staff B cannot see Delivery Staff A assignments');
    } else {
      fail('Delivery Staff B saw Delivery Staff A assignments', staffBAssignments);
    }

    // 4. Delivery Staff B cannot mutate Delivery Staff A assignment
    const unauthorizedUpdateRes = await patchJson(
      `${API_BASE}/delivery/assignments/${assignmentId}/status`,
      { status: 'out_for_delivery' },
      tokenStaffB
    );
    if (unauthorizedUpdateRes.status === 403 || unauthorizedUpdateRes.status === 404) {
      pass('Security: Delivery Staff B cannot mutate Delivery Staff A assignment -> 403');
    } else {
      fail('Unauthorized delivery assignment update should fail', unauthorizedUpdateRes);
    }

    // 5. Customer cannot assign delivery staff
    const custAssignRes = await postJson(
      `${API_BASE}/orders/${deliveryOrderId}/delivery-assignment`,
      { delivery_staff_user_id: deliveryStaffAUserId },
      tokenCustomer
    );
    if (custAssignRes.status === 403) {
      pass('Security: Customer cannot assign delivery staff -> 403');
    } else {
      fail('Customer delivery assignment should return 403', custAssignRes);
    }

    // 6. Customer cannot update delivery assignment status
    const custUpdateAssignRes = await patchJson(
      `${API_BASE}/delivery/assignments/${assignmentId}/status`,
      { status: 'delivered' },
      tokenCustomer
    );
    if (custUpdateAssignRes.status === 403) {
      pass('Security: Customer cannot update delivery assignment status -> 403');
    } else {
      fail('Customer update assignment status should return 403', custUpdateAssignRes);
    }
  } catch (error) {
    console.error('\nEXCEPTION during test execution:', error);
    process.exitCode = 1;
  } finally {
    log('\n--- CLEANUP TEMPORARY RECORDS ---');
    if (createdOrderIds.length > 0) {
      await pool.query('DELETE FROM delivery_assignments WHERE order_id = ANY($1)', [createdOrderIds]);
      await pool.query('DELETE FROM payments WHERE order_id = ANY($1)', [createdOrderIds]);
      await pool.query('DELETE FROM reviews WHERE order_id = ANY($1)', [createdOrderIds]);
      await pool.query('DELETE FROM order_items WHERE order_id = ANY($1)', [createdOrderIds]);
      await pool.query('DELETE FROM orders WHERE id = ANY($1)', [createdOrderIds]);
    }
    // Safety purge of test stores and related tables
    await pool.query("DELETE FROM store_products WHERE store_id IN (SELECT id FROM stores WHERE slug LIKE 'alice-mart-%' OR slug LIKE 'bob-bazaar-%')");
    await pool.query("DELETE FROM store_settings WHERE store_id IN (SELECT id FROM stores WHERE slug LIKE 'alice-mart-%' OR slug LIKE 'bob-bazaar-%')");
    await pool.query("DELETE FROM store_users WHERE store_id IN (SELECT id FROM stores WHERE slug LIKE 'alice-mart-%' OR slug LIKE 'bob-bazaar-%')");
    await pool.query("DELETE FROM stores WHERE slug LIKE 'alice-mart-%' OR slug LIKE 'bob-bazaar-%'");

    if (createdCategoryIds.length > 0) {
      await pool.query('DELETE FROM categories WHERE id = ANY($1)', [createdCategoryIds]);
    }

    if (createdStoreIds.length > 0) {
      await pool.query('DELETE FROM store_products WHERE store_id = ANY($1)', [createdStoreIds]);
      await pool.query('DELETE FROM store_settings WHERE store_id = ANY($1)', [createdStoreIds]);
      await pool.query('DELETE FROM store_users WHERE store_id = ANY($1)', [createdStoreIds]);
      await pool.query('DELETE FROM stores WHERE id = ANY($1)', [createdStoreIds]);
    }


    if (createdUserEmails.length > 0) {
      await pool.query('DELETE FROM customer_addresses WHERE customer_id IN (SELECT id FROM customers WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1)))', [createdUserEmails]);
      await pool.query('DELETE FROM store_users WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))', [createdUserEmails]);
      await pool.query('DELETE FROM customers WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))', [createdUserEmails]);
      await pool.query('DELETE FROM users WHERE email = ANY($1)', [createdUserEmails]);
    }

    const finalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const finalStores = await pool.query('SELECT COUNT(*) FROM stores');
    const finalOrders = await pool.query('SELECT COUNT(*) FROM orders');
    log(`Final counts: Users=${finalUsers.rows[0].count} (delta: ${finalUsers.rows[0].count - baselineUsers.rows[0].count}), Stores=${finalStores.rows[0].count} (delta: ${finalStores.rows[0].count - baselineStores.rows[0].count}), Orders=${finalOrders.rows[0].count} (delta: ${finalOrders.rows[0].count - baselineOrders.rows[0].count})`);

    if (
      finalUsers.rows[0].count === baselineUsers.rows[0].count &&
      finalStores.rows[0].count === baselineStores.rows[0].count &&
      finalOrders.rows[0].count === baselineOrders.rows[0].count
    ) {
      pass('Database completely restored to clean baseline state');
    } else {
      fail('Database cleanup mismatch detected', {
        baseline: { users: baselineUsers.rows[0].count, stores: baselineStores.rows[0].count, orders: baselineOrders.rows[0].count },
        final: { users: finalUsers.rows[0].count, stores: finalStores.rows[0].count, orders: finalOrders.rows[0].count },
      });
    }

    log('\n===============================================================');
    if (process.exitCode === 1) {
      log('FULL COMMERCE CYCLE TEST: FAILED');
    } else {
      log('FULL COMMERCE CYCLE TEST: ALL PASS');
    }
    log('===============================================================');
  }

  process.exit(process.exitCode || 0);
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
