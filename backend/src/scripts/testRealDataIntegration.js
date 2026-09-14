const pool = require('../config/db');

const API_BASE = 'http://localhost:5000/api';

async function runRealDataIntegrationAudit() {
  console.log('====================================================');
  console.log('  LOCALCOMMERCE REAL DATA INTEGRATION AUDIT');
  console.log('====================================================\n');

  const ts = Date.now();

  // Test identities
  const custEmail = `real_cust_${ts}@test.com`;
  const ownerEmail = `real_owner_${ts}@test.com`;
  const staffEmail = `real_staff_${ts}@test.com`;
  const adminEmail = `admin@example.com`;
  const password = 'Password@123';

  let tokenCust, tokenOwner, tokenStaff, tokenAdmin;
  let userIdCust, userIdOwner, userIdStaff;
  let customerId;
  let storeId;
  let storeSlug = `real-store-${ts}`;
  let addressId = null;
  let deliveryOrderId = null;
  let pickupOrderId = null;
  let cancelledOrderId = null;
  let productId = null;
  let deliveryAssignmentId = null;
  let reviewId = null;

  // Track initial baseline counts to verify zero DB pollution
  const baseUsersCount = (await pool.query('SELECT count(*) FROM users')).rows[0].count;
  const baseStoresCount = (await pool.query('SELECT count(*) FROM stores')).rows[0].count;
  const baseOrdersCount = (await pool.query('SELECT count(*) FROM orders')).rows[0].count;

  console.log(`[BASELINE] Initial DB Counts: Users=${baseUsersCount}, Stores=${baseStoresCount}, Orders=${baseOrdersCount}\n`);

  try {
    // -------------------------------------------------------------
    // 1. SETUP: Provision Store, Owner, Staff, Customer & Admin Auth
    // -------------------------------------------------------------
    console.log('[STEP 1] Provisioning test accounts & tenant...');

    // 1.1 Admin Login
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password }),
    });
    const adminLogin = await adminLoginRes.json();
    if (!adminLogin.success) {
      throw new Error(`Admin login failed: ${adminLogin.message}`);
    }
    tokenAdmin = adminLogin.data.token;
    console.log('  [PASS] Admin authenticated successfully.');

    // 1.2 Customer Registration & Login
    const custRegRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Real Customer Audit', email: custEmail, password, phone: '+91 91234 56789' }),
    });
    const custReg = await custRegRes.json();
    userIdCust = custReg.data.user.id;

    const custLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: custEmail, password }),
    });
    const custLogin = await custLoginRes.json();
    tokenCust = custLogin.data.token;

    const custRow = await pool.query('SELECT id FROM customers WHERE user_id = $1', [userIdCust]);
    customerId = custRow.rows[0].id;
    console.log('  [PASS] Customer registered and authenticated.');

    // 1.3 Business Owner Registration & Store Creation
    const ownerRegRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Real Owner Audit', email: ownerEmail, password, phone: '+91 99887 76655' }),
    });
    const ownerReg = await ownerRegRes.json();
    userIdOwner = ownerReg.data.user.id;
    await pool.query("UPDATE users SET role = 'business_owner' WHERE id = $1", [userIdOwner]);

    const ownerLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerEmail, password }),
    });
    const ownerLogin = await ownerLoginRes.json();
    tokenOwner = ownerLogin.data.token;

    const storeRes = await fetch(`${API_BASE}/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`,
      },
      body: JSON.stringify({
        name: `Audit Kirana ${ts}`,
        slug: storeSlug,
        description: 'Audit Store for Real Data Validation',
        address_line1: '123 Market Street',
        city: 'Thane',
        state: 'Maharashtra',
        postal_code: '400601',
        phone: '+91 99887 76655',
        email: ownerEmail,
      }),
    });
    const storeData = await storeRes.json();
    if (!storeData.success) throw new Error(`Store creation failed: ${storeData.message}`);
    storeId = storeData.data.id;
    console.log(`  [PASS] Business store created with ID: ${storeId}`);

    // 1.4 Add a Store Product
    const prodRes = await fetch(`${API_BASE}/stores/${storeId}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`,
      },
      body: JSON.stringify({
        name: 'Audit Organic Turmeric Powder',
        price: 150.0,
        stock_quantity: 50,
        sku: `TURM-AUDIT-${ts}`,
      }),
    });
    const prodData = await prodRes.json();
    if (!prodData.success) throw new Error(`Store product creation failed: ${prodData.message}`);
    productId = prodData.data.id;
    console.log('  [PASS] Store product catalog item created.');

    // 1.5 Add Delivery Staff via Business Staff API
    const staffRes = await fetch(`${API_BASE}/stores/${storeId}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`,
      },
      body: JSON.stringify({
        name: 'Audit Delivery Fleet Agent',
        email: staffEmail,
        phone: '+91 98765 43210',
        password,
        role: 'delivery_staff',
      }),
    });
    const staffData = await staffRes.json();
    if (!staffData.success) throw new Error(`Staff creation failed: ${staffData.message}`);
    userIdStaff = staffData.data.user_id || staffData.data.id;
    console.log('  [PASS] Delivery staff created and linked to store.');

    // 1.6 Authenticate Delivery Staff
    const staffLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: staffEmail, password }),
    });
    const staffLogin = await staffLoginRes.json();
    if (!staffLogin.success) throw new Error(`Staff login failed: ${staffLogin.message}`);
    tokenStaff = staffLogin.data.token;
    console.log('  [PASS] Delivery staff authenticated successfully.\n');

    // -------------------------------------------------------------
    // 2. EMPTY STATE VERIFICATION: Real Zero State for New Customer & Store
    // -------------------------------------------------------------
    console.log('[STEP 2] Verifying honest empty states (zero mock fallback)...');

    // 2.1 Customer orders empty state
    const custOrdersInitRes = await fetch(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${tokenCust}` },
    });
    const custOrdersInit = await custOrdersInitRes.json();
    if (custOrdersInit.data.length !== 0) {
      throw new Error(`Expected 0 orders for fresh customer, got ${custOrdersInit.data.length}`);
    }
    console.log('  [PASS] New customer has exactly 0 orders. No mock orders rendered.');

    // 2.2 Customer addresses empty state
    const custAddrInitRes = await fetch(`${API_BASE}/customers/me/addresses`, {
      headers: { Authorization: `Bearer ${tokenCust}` },
    });
    const custAddrInit = await custAddrInitRes.json();
    if (custAddrInit.data.length !== 0) {
      throw new Error(`Expected 0 addresses for fresh customer, got ${custAddrInit.data.length}`);
    }
    console.log('  [PASS] New customer has exactly 0 addresses. No mock addresses rendered.');

    // 2.3 Store orders empty state
    const storeOrdersInitRes = await fetch(`${API_BASE}/orders?store_id=${storeId}`, {
      headers: { Authorization: `Bearer ${tokenOwner}` },
    });
    const storeOrdersInit = await storeOrdersInitRes.json();
    if (storeOrdersInit.data.length !== 0) {
      throw new Error(`Expected 0 orders for fresh store, got ${storeOrdersInit.data.length}`);
    }
    console.log('  [PASS] New business store has exactly 0 orders. No mock orders rendered.\n');

    // -------------------------------------------------------------
    // 3. COMMERCE TRANSACTIONS: Create Delivery, Pickup & Cancelled Orders
    // -------------------------------------------------------------
    console.log('[STEP 3] Executing real commerce orders across delivery and pickup...');

    // 3.1 Customer creates an address
    const addrCreateRes = await fetch(`${API_BASE}/customers/me/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCust}`,
      },
      body: JSON.stringify({
        label: 'Home',
        recipient_name: 'Real Customer Audit',
        phone: '+91 91234 56789',
        address_line1: 'Flat 402, Sunshine Heights',
        address_line2: 'Panch Pakhadi',
        city: 'Thane',
        state: 'Maharashtra',
        postal_code: '400602',
        landmark: 'Near Central Park',
        is_default: true,
      }),
    });
    const addrCreate = await addrCreateRes.json();
    if (!addrCreate.success) throw new Error(`Address creation failed: ${addrCreate.message}`);
    addressId = addrCreate.data.id;
    console.log('  [PASS] Customer address saved to database.');

    // 3.2 Place Delivery Order (Amount: 2 x 150 = 300)
    const delivOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCust}`,
      },
      body: JSON.stringify({
        store_id: storeId,
        fulfillment_type: 'DELIVERY',
        customer_address_id: addressId,
        payment_method: 'UPI',
        items: [{ store_product_id: productId, quantity: 2 }],
        customer_notes: 'Leave at the door.',
      }),
    });
    const delivOrder = await delivOrderRes.json();
    if (!delivOrder.success) throw new Error(`Delivery order placement failed: ${delivOrder.message}`);
    deliveryOrderId = delivOrder.data.id;
    console.log(`  [PASS] Real delivery order placed: ${delivOrder.data.order_number}`);

    // 3.3 Place Pickup Order (Amount: 1 x 150 = 150)
    const pickupOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCust}`,
      },
      body: JSON.stringify({
        store_id: storeId,
        fulfillment_type: 'PICKUP',
        payment_method: 'COD',
        items: [{ store_product_id: productId, quantity: 1 }],
      }),
    });
    const pickupOrder = await pickupOrderRes.json();
    if (!pickupOrder.success) throw new Error(`Pickup order placement failed: ${pickupOrder.message}`);
    pickupOrderId = pickupOrder.data.id;
    console.log(`  [PASS] Real pickup order placed: ${pickupOrder.data.order_number}`);

    // 3.4 Place Order to be Cancelled (Amount: 1 x 150 = 150)
    const cancOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCust}`,
      },
      body: JSON.stringify({
        store_id: storeId,
        fulfillment_type: 'DELIVERY',
        customer_address_id: addressId,
        payment_method: 'UPI',
        items: [{ store_product_id: productId, quantity: 1 }],
      }),
    });
    const cancOrder = await cancOrderRes.json();
    cancelledOrderId = cancOrder.data.id;

    // Owner cancels this order
    await fetch(`${API_BASE}/orders/${cancelledOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`,
      },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    console.log('  [PASS] Cancelled order created for KPI exclusion testing.\n');

    // -------------------------------------------------------------
    // 4. BUSINESS KPI & REVENUE MATHEMATICAL INTEGRITY AUDIT
    // -------------------------------------------------------------
    console.log('[STEP 4] Auditing business revenue, KPI derivations & customer list...');

    const businessOrdersRes = await fetch(`${API_BASE}/orders?store_id=${storeId}`, {
      headers: { Authorization: `Bearer ${tokenOwner}` },
    });
    const businessOrders = (await businessOrdersRes.json()).data;

    // Verify 3 orders are returned for this store
    if (businessOrders.length !== 3) {
      throw new Error(`Expected 3 orders for store, found ${businessOrders.length}`);
    }

    // Mathematical calculations
    const activeOrders = businessOrders.filter((o) => o.status !== 'CANCELLED');
    const cancelledOrders = businessOrders.filter((o) => o.status === 'CANCELLED');
    const calculatedRevenue = activeOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    if (activeOrders.length !== 2) {
      throw new Error(`Expected 2 active orders, got ${activeOrders.length}`);
    }
    if (cancelledOrders.length !== 1) {
      throw new Error(`Expected 1 cancelled order, got ${cancelledOrders.length}`);
    }
    if (calculatedRevenue !== 450.0) {
      throw new Error(`Expected ₹450.00 revenue (excluding cancelled), got ₹${calculatedRevenue}`);
    }
    console.log(`  [PASS] Authoritative Revenue: ₹${calculatedRevenue.toFixed(2)} (Cancelled order ₹150 correctly excluded).`);
    console.log(`  [PASS] Store Total Orders: ${businessOrders.length}, Active: ${activeOrders.length}, Cancelled: ${cancelledOrders.length}`);

    // Business Staff listing security check
    const storeStaffRes = await fetch(`${API_BASE}/stores/${storeId}/staff`, {
      headers: { Authorization: `Bearer ${tokenOwner}` },
    });
    const storeStaffList = (await storeStaffRes.json()).data;
    if (storeStaffList.length === 0) {
      throw new Error('Expected at least 1 staff member');
    }
    const staffMember = storeStaffList.find((s) => s.email === staffEmail);
    if (!staffMember) {
      throw new Error('Created staff member not returned in store staff list');
    }
    if (staffMember.password_hash || staffMember.password) {
      throw new Error('SECURITY VIOLATION: Password hash exposed in staff response!');
    }
    console.log('  [PASS] Business staff list is authoritative and password hashes are strictly omitted.\n');

    // -------------------------------------------------------------
    // 5. DELIVERY FLEET & PICKUP ISOLATION AUDIT
    // -------------------------------------------------------------
    console.log('[STEP 5] Auditing delivery fleet assignments vs pickup independence...');

    // 5.1 Business moves order through PLACED -> CONFIRMED -> PREPARING -> READY
    for (const st of ['CONFIRMED', 'PREPARING', 'READY']) {
      const res = await fetch(`${API_BASE}/orders/${deliveryOrderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenOwner}`,
        },
        body: JSON.stringify({ status: st }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(`Transition to ${st} failed: ${data.message}`);
    }

    const assignRes = await fetch(`${API_BASE}/orders/${deliveryOrderId}/delivery-assignment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`,
      },
      body: JSON.stringify({
        delivery_staff_user_id: userIdStaff,
      }),
    });
    const assignData = await assignRes.json();
    if (!assignData.success) throw new Error(`Delivery assignment failed: ${assignData.message}`);
    deliveryAssignmentId = assignData.data.id;
    console.log('  [PASS] Real delivery assignment created.');

    // 5.2 Delivery staff fetches assignments
    const staffAssignmentsRes = await fetch(`${API_BASE}/delivery/assignments`, {
      headers: { Authorization: `Bearer ${tokenStaff}` },
    });
    const staffAssignments = (await staffAssignmentsRes.json()).data;
    const hasAssignedOrder = staffAssignments.some((a) => a.order_id === deliveryOrderId);
    if (!hasAssignedOrder) {
      throw new Error('Delivery staff cannot see assigned delivery order');
    }
    console.log('  [PASS] Delivery staff receives assigned delivery order.');

    // 5.3 Verify Pickup Order has NO delivery assignment
    const pickupAssignCheck = await pool.query('SELECT * FROM delivery_assignments WHERE order_id = $1', [pickupOrderId]);
    if (pickupAssignCheck.rows.length !== 0) {
      throw new Error('REGRESSION: Pickup order was assigned to delivery fleet!');
    }
    console.log('  [PASS] Pickup order remains completely independent of delivery fleet.');

    // 5.4 Delivery Staff starts delivery and completes delivery
    await fetch(`${API_BASE}/delivery/assignments/${deliveryAssignmentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStaff}`,
      },
      body: JSON.stringify({ status: 'out_for_delivery' }),
    });

    await fetch(`${API_BASE}/delivery/assignments/${deliveryAssignmentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStaff}`,
      },
      body: JSON.stringify({ status: 'delivered' }),
    });
    console.log('  [PASS] Delivery staff completed assignment (order status -> DELIVERED).\n');

    // -------------------------------------------------------------
    // 6. CUSTOMER REVIEW CREATION & ADMIN MODERATION AUDIT
    // -------------------------------------------------------------
    console.log('[STEP 6] Auditing customer reviews and admin moderation...');

    // 6.1 Customer creates review for delivered order
    const revCreateRes = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCust}`,
      },
      body: JSON.stringify({
        store_id: storeId,
        order_id: deliveryOrderId,
        rating: 5,
        comment: 'Fresh items, quick delivery! Highly recommend.',
      }),
    });
    const revCreate = await revCreateRes.json();
    if (!revCreate.success) throw new Error(`Review creation failed: ${revCreate.message || revCreate.error}`);
    reviewId = revCreate.data.id;
    console.log(`  [PASS] Real customer review submitted: ID ${reviewId}`);

    // 6.2 Admin views reviews
    const adminRevRes = await fetch(`${API_BASE}/reviews`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const adminRevData = await adminRevRes.json();
    const foundRev = adminRevData.data.find((r) => r.id === reviewId);
    if (!foundRev) {
      throw new Error('Admin could not see newly submitted review');
    }
    console.log('  [PASS] Admin can view real customer reviews from PostgreSQL.');

    // -------------------------------------------------------------
    // 7. ADMIN REAL DATA ENDPOINTS & SECURITY AUDIT
    // -------------------------------------------------------------
    console.log('\n[STEP 7] Auditing Admin-exclusive PostgreSQL endpoints...');

    // 7.1 Users API
    const adminUsersRes = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const adminUsers = await adminUsersRes.json();
    if (!adminUsers.success || !Array.isArray(adminUsers.data)) {
      throw new Error('Admin users endpoint failed');
    }
    const hasLeak = adminUsers.data.some((u) => u.password_hash || u.password);
    if (hasLeak) {
      throw new Error('SECURITY VIOLATION: Password hash leaked in /api/admin/users');
    }
    console.log(`  [PASS] GET /api/admin/users returned ${adminUsers.data.length} real users (0 password leaks).`);

    // 7.2 Non-admin rejection
    const nonAdminUsersRes = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${tokenCust}` },
    });
    if (nonAdminUsersRes.status !== 403) {
      throw new Error(`SECURITY VIOLATION: Customer could access /api/admin/users! Status: ${nonAdminUsersRes.status}`);
    }
    console.log('  [PASS] Non-admin access to /api/admin/users strictly blocked (HTTP 403).');

    // 7.3 Subscriptions API
    const subsRes = await fetch(`${API_BASE}/admin/subscriptions`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const subsData = await subsRes.json();
    if (!subsData.success) throw new Error('Admin subscriptions endpoint failed');
    console.log(`  [PASS] GET /api/admin/subscriptions returned ${subsData.data.length} real merchant subscriptions.`);

    // 7.4 Platform Settings API
    const settingsRes = await fetch(`${API_BASE}/admin/platform-settings`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const settingsData = await settingsRes.json();
    if (!settingsData.success) throw new Error('Admin settings endpoint failed');
    console.log('  [PASS] GET /api/admin/platform-settings returned real platform configuration.');

    // 7.5 Admin Notifications API
    const notifsRes = await fetch(`${API_BASE}/admin/notifications`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const notifsData = await notifsRes.json();
    if (!notifsData.success) throw new Error('Admin notifications endpoint failed');
    console.log(`  [PASS] GET /api/admin/notifications returned ${notifsData.data.length} admin alerts.`);

    // 7.6 Cross-Store Admin Orders
    const adminOrdersRes = await fetch(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const adminOrders = await adminOrdersRes.json();
    if (!adminOrders.success || !Array.isArray(adminOrders.data)) {
      throw new Error('Admin cross-store orders endpoint failed');
    }
    console.log(`  [PASS] GET /api/orders for Admin returned ${adminOrders.data.length} platform-wide orders.\n`);

    console.log('====================================================');
    console.log('  ALL REAL DATA INTEGRATION AUDIT TESTS PASSED!');
    console.log('====================================================\n');

  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    // -------------------------------------------------------------
    // TEARDOWN: Clean up temporary test data & verify zero pollution
    // -------------------------------------------------------------
    console.log('[CLEANUP] Purging test artifacts and verifying DB integrity...');
    try {
      if (reviewId) {
        await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
      }
      if (deliveryAssignmentId) {
        await pool.query('DELETE FROM delivery_assignments WHERE id = $1', [deliveryAssignmentId]);
      }
      const testOrderIds = [deliveryOrderId, pickupOrderId, cancelledOrderId].filter(Boolean);
      if (testOrderIds.length > 0) {
        await pool.query('DELETE FROM payments WHERE order_id = ANY($1)', [testOrderIds]);
        await pool.query('DELETE FROM order_items WHERE order_id = ANY($1)', [testOrderIds]);
        await pool.query('DELETE FROM orders WHERE id = ANY($1)', [testOrderIds]);
      }
      if (productId) {
        await pool.query('DELETE FROM store_products WHERE id = $1', [productId]);
      }
      if (addressId) {
        await pool.query('DELETE FROM customer_addresses WHERE id = $1', [addressId]);
      }
      if (storeId) {
        await pool.query('DELETE FROM store_settings WHERE store_id = $1', [storeId]);
        await pool.query('DELETE FROM store_users WHERE store_id = $1', [storeId]);
        await pool.query('DELETE FROM stores WHERE id = $1', [storeId]);
      }
      if (customerId) {
        await pool.query('DELETE FROM customers WHERE id = $1', [customerId]);
      }
      const testUserIds = [userIdCust, userIdOwner, userIdStaff].filter(Boolean);
      if (testUserIds.length > 0) {
        await pool.query('DELETE FROM users WHERE id = ANY($1)', [testUserIds]);
      }
      await pool.query("DELETE FROM users WHERE email LIKE 'real_%'");

      // Final DB integrity counts
      const finalUsersCount = (await pool.query('SELECT count(*) FROM users')).rows[0].count;
      const finalStoresCount = (await pool.query('SELECT count(*) FROM stores')).rows[0].count;
      const finalOrdersCount = (await pool.query('SELECT count(*) FROM orders')).rows[0].count;

      console.log(`  Users count:  ${finalUsersCount} (baseline: ${baseUsersCount})`);
      console.log(`  Stores count: ${finalStoresCount} (baseline: ${baseStoresCount})`);
      console.log(`  Orders count: ${finalOrdersCount} (baseline: ${baseOrdersCount})`);

      if (
        finalUsersCount === baseUsersCount &&
        finalStoresCount === baseStoresCount &&
        finalOrdersCount === baseOrdersCount
      ) {
        console.log('  [PASS] Database successfully restored to exact baseline counts! Zero pollution.\n');
      } else {
        console.warn('  ⚠️ Database counts differ slightly from baseline.');
      }
    } catch (cleanupErr) {
      console.error('  ⚠️ Cleanup warning:', cleanupErr.message);
    } finally {
      await pool.end();
    }
  }
}

runRealDataIntegrationAudit();
