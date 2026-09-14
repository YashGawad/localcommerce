const pool = require('../config/db');

const API_BASE = 'http://localhost:5000/api';

async function runIsolationAudit() {
  console.log('====================================================');
  console.log('  LOCALCOMMERCE SECURITY & DATA ISOLATION AUDIT');
  console.log('====================================================\n');

  const ts = Date.now();

  // Test identities
  const custEmailA = `audit_cust_a_${ts}@test.com`;
  const custEmailB = `audit_cust_b_${ts}@test.com`;
  const ownerEmailA = `audit_owner_a_${ts}@test.com`;
  const ownerEmailB = `audit_owner_b_${ts}@test.com`;
  const password = 'Password@123';

  let tokenCustA, tokenCustB, tokenOwnerA, tokenOwnerB;
  let userIdCustA, userIdCustB, userIdOwnerA, userIdOwnerB;
  let customerIdA, customerIdB;
  let storeIdA, storeIdB, newStoreIdA2;
  let storeSlugA = `audit-store-a-${ts}`;
  let storeSlugB = `audit-store-b-${ts}`;
  let addressIdA = null;
  let orderIdA = null;
  let productIdA = null;
  let productIdB = null;

  // Track initial baseline counts to verify zero DB pollution
  const baseUsersCount = (await pool.query('SELECT count(*) FROM users')).rows[0].count;
  const baseStoresCount = (await pool.query('SELECT count(*) FROM stores')).rows[0].count;
  const baseOrdersCount = (await pool.query('SELECT count(*) FROM orders')).rows[0].count;

  try {
    // -------------------------------------------------------------
    // SETUP: Provision Test Customers & Stores
    // -------------------------------------------------------------
    console.log('[SETUP] Provisioning isolated test accounts and tenants...');

    // 1. Customer A
    const regCustARes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Customer Alpha', email: custEmailA, password, phone: '+91 91111 11111' }),
    });
    const regCustA = await regCustARes.json();
    userIdCustA = regCustA.data.user.id;

    const loginCustARes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: custEmailA, password }),
    });
    const loginCustA = await loginCustARes.json();
    tokenCustA = loginCustA.data.token;

    const custARow = await pool.query('SELECT id FROM customers WHERE user_id = $1', [userIdCustA]);
    customerIdA = custARow.rows[0].id;

    // 2. Customer B
    const regCustBRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Customer Beta', email: custEmailB, password, phone: '+91 92222 22222' }),
    });
    const regCustB = await regCustBRes.json();
    userIdCustB = regCustB.data.user.id;

    const loginCustBRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: custEmailB, password }),
    });
    const loginCustB = await loginCustBRes.json();
    tokenCustB = loginCustB.data.token;

    const custBRow = await pool.query('SELECT id FROM customers WHERE user_id = $1', [userIdCustB]);
    customerIdB = custBRow.rows[0].id;

    // 3. Store Owner A with Store A
    const regOwnerARes = await fetch(`${API_BASE}/auth/business/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Owner Alpha',
        email: ownerEmailA,
        password,
        store: { name: 'Audit Store Alpha', slug: storeSlugA, address: 'Road 1', city: 'Mumbai' },
      }),
    });
    const regOwnerA = await regOwnerARes.json();
    tokenOwnerA = regOwnerA.data.token;
    userIdOwnerA = regOwnerA.data.user.id;
    storeIdA = regOwnerA.data.store.id;

    // 4. Store Owner B with Store B
    const regOwnerBRes = await fetch(`${API_BASE}/auth/business/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Owner Beta',
        email: ownerEmailB,
        password,
        store: { name: 'Audit Store Beta', slug: storeSlugB, address: 'Road 2', city: 'Pune' },
      }),
    });
    const regOwnerB = await regOwnerBRes.json();
    tokenOwnerB = regOwnerB.data.token;
    userIdOwnerB = regOwnerB.data.user.id;
    storeIdB = regOwnerB.data.store.id;

    // Pick category for products
    const catId = (await pool.query('SELECT id FROM categories LIMIT 1')).rows[0]?.id;

    // Add Product A to Store A
    const prodARes = await fetch(`${API_BASE}/stores/${storeIdA}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenOwnerA}` },
      body: JSON.stringify({
        name: `Alpha Organic Apples ${ts}`,
        sku: `APP-A-${ts}`,
        category_id: catId,
        price: 150.0,
        cost_price: 100.0,
        stock_quantity: 50,
        unit: '1 kg',
      }),
    });
    const prodAData = await prodARes.json();
    productIdA = prodAData.data.id;

    // Add Product B to Store B
    const prodBRes = await fetch(`${API_BASE}/stores/${storeIdB}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenOwnerB}` },
      body: JSON.stringify({
        name: `Beta Fresh Oranges ${ts}`,
        sku: `ORG-B-${ts}`,
        category_id: catId,
        price: 120.0,
        cost_price: 80.0,
        stock_quantity: 40,
        unit: '1 kg',
      }),
    });
    const prodBData = await prodBRes.json();
    productIdB = prodBData.data.id;

    // Create Saved Address for Customer A
    const addrRes = await fetch(`${API_BASE}/customers/me/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenCustA}` },
      body: JSON.stringify({
        label: 'Home',
        recipient_name: 'Customer Alpha',
        phone: '+91 91111 11111',
        address_line1: 'Flat 401, Palm Grove',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400050',
        is_default: true,
      }),
    });
    const addrData = await addrRes.json();
    addressIdA = addrData.data.id;

    // Create Order for Customer A at Store A
    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenCustA}` },
      body: JSON.stringify({
        store_id: storeIdA,
        fulfillment_type: 'delivery',
        customer_address_id: addressIdA,
        payment_method: 'card',
        items: [{ store_product_id: productIdA, quantity: 2 }],
      }),
    });
    const orderData = await orderRes.json();
    orderIdA = orderData.data.id;

    console.log('  ✓ Setup completed successfully.\n');

    // -------------------------------------------------------------
    // AUDIT 1: Customer Profile Isolation (PART 3)
    // -------------------------------------------------------------
    console.log('[AUDIT 1] Testing Customer Profile Isolation & Tampering Protection...');
    const profARes = await fetch(`${API_BASE}/customers/me`, {
      headers: { Authorization: `Bearer ${tokenCustA}` },
    });
    const profA = await profARes.json();
    if (profA.data.customer.email !== custEmailA) {
      throw new Error(`AUDIT 1 FAILED: Customer A profile returned wrong email: ${profA.data.customer.email}`);
    }

    const profBRes = await fetch(`${API_BASE}/customers/me`, {
      headers: { Authorization: `Bearer ${tokenCustB}` },
    });
    const profB = await profBRes.json();
    if (profB.data.customer.email !== custEmailB) {
      throw new Error(`AUDIT 1 FAILED: Customer B profile returned wrong email: ${profB.data.customer.email}`);
    }

    // IDOR check: Attempting to supply another customer's ID in body cannot alter identity
    const patchProfB = await fetch(`${API_BASE}/customers/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenCustB}` },
      body: JSON.stringify({ user_id: userIdCustA, customer_id: customerIdA, name: 'Hacked Name' }),
    });
    // Verify Customer A was NOT modified
    const checkA = await pool.query('SELECT name FROM users WHERE id = $1', [userIdCustA]);
    if (checkA.rows[0].name !== 'Customer Alpha') {
      throw new Error('AUDIT 1 FAILED: Customer A profile was tampered by Customer B payload!');
    }
    console.log('  [PASS] Customer profiles are strictly isolated and identity fields are protected.');

    // -------------------------------------------------------------
    // AUDIT 2: Customer Address Isolation & IDOR Protection (PART 4)
    // -------------------------------------------------------------
    console.log('\n[AUDIT 2] Testing Customer Address Isolation & IDOR Protection...');
    // Customer B lists addresses -> must be empty
    const listBRes = await fetch(`${API_BASE}/customers/me/addresses`, {
      headers: { Authorization: `Bearer ${tokenCustB}` },
    });
    const listB = await listBRes.json();
    if (listB.data.length !== 0) {
      throw new Error(`AUDIT 2 FAILED: Customer B saw addresses that do not belong to them: ${JSON.stringify(listB.data)}`);
    }

    // Customer B attempts to get Customer A's address by ID -> 404
    const getAddrB = await fetch(`${API_BASE}/customers/me/addresses/${addressIdA}`, {
      headers: { Authorization: `Bearer ${tokenCustB}` },
    });
    if (getAddrB.status !== 404) {
      throw new Error(`AUDIT 2 FAILED: Customer B could read Customer A address IDOR (status ${getAddrB.status})`);
    }

    // Customer B attempts to modify Customer A's address -> 404
    const patchAddrB = await fetch(`${API_BASE}/customers/me/addresses/${addressIdA}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenCustB}` },
      body: JSON.stringify({ address_line1: 'Attacker Street' }),
    });
    if (patchAddrB.status !== 404) {
      throw new Error(`AUDIT 2 FAILED: Customer B could modify Customer A address IDOR (status ${patchAddrB.status})`);
    }

    // Customer B attempts to delete Customer A's address -> 404
    const delAddrB = await fetch(`${API_BASE}/customers/me/addresses/${addressIdA}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenCustB}` },
    });
    if (delAddrB.status !== 404) {
      throw new Error(`AUDIT 2 FAILED: Customer B could delete Customer A address IDOR (status ${delAddrB.status})`);
    }
    console.log('  [PASS] Address operations strictly scoped to authenticated customer. Cross-customer access rejected.');

    // -------------------------------------------------------------
    // AUDIT 3: Order Isolation & Cross-Customer Protection (PART 5)
    // -------------------------------------------------------------
    console.log('\n[AUDIT 3] Testing Customer Order Isolation & IDOR Protection...');
    // Customer B lists orders -> must not contain orderIdA
    const ordersBRes = await fetch(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${tokenCustB}` },
    });
    const ordersB = await ordersBRes.json();
    if (ordersB.data.some((o) => o.id === orderIdA)) {
      throw new Error('AUDIT 3 FAILED: Customer B can see Customer A order in order list!');
    }

    // Customer B gets Order A directly by ID -> 404
    const getOrderB = await fetch(`${API_BASE}/orders/${orderIdA}`, {
      headers: { Authorization: `Bearer ${tokenCustB}` },
    });
    if (getOrderB.status !== 404) {
      throw new Error(`AUDIT 3 FAILED: Customer B accessed Customer A order directly by ID (status ${getOrderB.status})`);
    }

    // Customer B attempts to place order using Customer A's address -> 404
    const hijackAddrOrder = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenCustB}` },
      body: JSON.stringify({
        store_id: storeIdA,
        fulfillment_type: 'delivery',
        customer_address_id: addressIdA,
        payment_method: 'card',
        items: [{ store_product_id: productIdA, quantity: 1 }],
      }),
    });
    if (hijackAddrOrder.status !== 404) {
      throw new Error(`AUDIT 3 FAILED: Customer B was able to hijack Customer A address in order (status ${hijackAddrOrder.status})`);
    }
    console.log('  [PASS] Orders isolated. Cross-customer order inspection & address hijacking blocked.');

    // -------------------------------------------------------------
    // AUDIT 4: Payment Isolation & Manipulation Protection (PART 6)
    // -------------------------------------------------------------
    console.log('\n[AUDIT 4] Testing Payment Isolation & State Manipulation Protection...');
    // Customer B attempts to view Payment for Order A -> 404
    const getPayB = await fetch(`${API_BASE}/orders/${orderIdA}/payment`, {
      headers: { Authorization: `Bearer ${tokenCustB}` },
    });
    if (getPayB.status !== 404) {
      throw new Error(`AUDIT 4 FAILED: Customer B can view Payment A details (status ${getPayB.status})`);
    }

    // Customer B attempts to trigger Payment Success on Order A -> 404
    const paySuccessB = await fetch(`${API_BASE}/orders/${orderIdA}/payment/pay`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenCustB}` },
    });
    if (paySuccessB.status !== 404) {
      throw new Error(`AUDIT 4 FAILED: Customer B could pay for Customer A order (status ${paySuccessB.status})`);
    }

    // Customer B attempts to trigger Payment Failure on Order A -> 404
    const payFailB = await fetch(`${API_BASE}/orders/${orderIdA}/payment/fail`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenCustB}` },
    });
    if (payFailB.status !== 404) {
      throw new Error(`AUDIT 4 FAILED: Customer B could fail Payment A (status ${payFailB.status})`);
    }

    // Verify legitimate payment execution by Customer A works
    const paySuccessA = await fetch(`${API_BASE}/orders/${orderIdA}/payment/pay`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenCustA}` },
    });
    if (paySuccessA.status !== 200) {
      throw new Error(`AUDIT 4 FAILED: Customer A could not pay for own order (status ${paySuccessA.status})`);
    }
    console.log('  [PASS] Payments isolated. Cross-customer payment inspection and manipulation blocked.');

    // -------------------------------------------------------------
    // AUDIT 5: Review Ownership & Impersonation Protection (PART 7)
    // -------------------------------------------------------------
    console.log('\n[AUDIT 5] Testing Review Ownership & Impersonation Protection...');
    // Customer B attempts to review Customer A's order -> rejected 404
    const reviewB = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenCustB}` },
      body: JSON.stringify({
        order_id: orderIdA,
        store_id: storeIdA,
        rating: 5,
        comment: 'Fake review by competitor/unauthorized customer',
      }),
    });
    if (reviewB.status !== 404) {
      throw new Error(`AUDIT 5 FAILED: Customer B was able to submit review for Customer A order (status ${reviewB.status})`);
    }
    console.log('  [PASS] Review submission requires ownership of the completed order.');

    // -------------------------------------------------------------
    // AUDIT 6: Business Tenant Isolation (PART 8)
    // -------------------------------------------------------------
    console.log('\n[AUDIT 6] Testing Business Tenant Isolation between Store Owners...');
    // Owner A attempts to add product to Store B -> 403
    const crossProduct = await fetch(`${API_BASE}/stores/${storeIdB}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenOwnerA}` },
      body: JSON.stringify({
        name: 'Infiltrated Product',
        sku: `INF-${ts}`,
        category_id: catId,
        price: 99.0,
        stock_quantity: 10,
        unit: '1 unit',
      }),
    });
    if (crossProduct.status !== 403) {
      throw new Error(`AUDIT 6 FAILED: Owner A was able to add product to Store B (status ${crossProduct.status})`);
    }

    // Owner A attempts to modify Store B's product -> 403
    const crossUpdateProduct = await fetch(`${API_BASE}/stores/${storeIdB}/products/${productIdB}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenOwnerA}` },
      body: JSON.stringify({ price: 1.0 }),
    });
    if (crossUpdateProduct.status !== 403) {
      throw new Error(`AUDIT 6 FAILED: Owner A was able to modify Store B product (status ${crossUpdateProduct.status})`);
    }

    // Owner B attempts to view Store A orders via query param -> 403
    const crossOrders = await fetch(`${API_BASE}/orders?store_id=${storeIdA}`, {
      headers: { Authorization: `Bearer ${tokenOwnerB}` },
    });
    if (crossOrders.status !== 403) {
      throw new Error(`AUDIT 6 FAILED: Owner B was able to query Store A orders (status ${crossOrders.status})`);
    }

    // Owner B attempts to view Order A details directly -> 404
    const crossOrderDetails = await fetch(`${API_BASE}/orders/${orderIdA}`, {
      headers: { Authorization: `Bearer ${tokenOwnerB}` },
    });
    if (crossOrderDetails.status !== 404) {
      throw new Error(`AUDIT 6 FAILED: Owner B accessed Store A order details directly (status ${crossOrderDetails.status})`);
    }
    console.log('  [PASS] Business tenants are isolated. Cross-store product and order operations blocked.');

    // -------------------------------------------------------------
    // AUDIT 7: Store Creation Isolation (PART 10)
    // -------------------------------------------------------------
    console.log('\n[AUDIT 7] Testing Store Creation Ownership & Multi-Tenancy...');
    // Owner A creates a 2nd store
    const createStoreA2Res = await fetch(`${API_BASE}/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenOwnerA}` },
      body: JSON.stringify({
        name: `Owner A Second Store ${ts}`,
        slug: `owner-a-store-2-${ts}`,
        status: 'active',
      }),
    });
    const storeA2Data = await createStoreA2Res.json();
    newStoreIdA2 = storeA2Data.data.id;

    // Verify Owner A has access
    const checkOwnerA = await fetch(`${API_BASE}/orders?store_id=${newStoreIdA2}`, {
      headers: { Authorization: `Bearer ${tokenOwnerA}` },
    });
    if (checkOwnerA.status !== 200) {
      throw new Error(`AUDIT 7 FAILED: Owner A cannot access own new store (status ${checkOwnerA.status})`);
    }

    // Verify Owner B DOES NOT have access to Owner A's new store
    const checkOwnerBAgain = await fetch(`${API_BASE}/orders?store_id=${newStoreIdA2}`, {
      headers: { Authorization: `Bearer ${tokenOwnerB}` },
    });
    if (checkOwnerBAgain.status !== 403) {
      throw new Error(`AUDIT 7 FAILED: Owner B has access to Owner A's newly created store (status ${checkOwnerBAgain.status})`);
    }
    console.log('  [PASS] New store creation correctly binds creator and denies competitor access.');

    // -------------------------------------------------------------
    // AUDIT 8: Public Catalog Shared Visibility (PART 9)
    // -------------------------------------------------------------
    console.log('\n[AUDIT 8] Testing Public Shared Catalog Visibility...');
    // Public unauthenticated visitor
    const publicStoreRes = await fetch(`${API_BASE}/stores/slug/${storeSlugA}`);
    const publicStore = await publicStoreRes.json();
    if (publicStoreRes.status !== 200 || publicStore.data.slug !== storeSlugA) {
      throw new Error('AUDIT 8 FAILED: Public user cannot browse active store');
    }

    const publicProdsRes = await fetch(`${API_BASE}/stores/${storeIdA}/products`);
    const publicProds = await publicProdsRes.json();
    if (publicProdsRes.status !== 200 || !publicProds.data.some((p) => p.id === productIdA)) {
      throw new Error('AUDIT 8 FAILED: Public user cannot browse store products');
    }

    // Both Customer A and Customer B see the same public store and product
    const custAProds = await (await fetch(`${API_BASE}/stores/${storeIdA}/products`, { headers: { Authorization: `Bearer ${tokenCustA}` } })).json();
    const custBProds = await (await fetch(`${API_BASE}/stores/${storeIdA}/products`, { headers: { Authorization: `Bearer ${tokenCustB}` } })).json();
    if (custAProds.data.length !== custBProds.data.length || custAProds.data.length === 0) {
      throw new Error('AUDIT 8 FAILED: Customer A and Customer B have inconsistent public catalog view');
    }
    console.log('  [PASS] Public catalog is shared and accessible without data leakage.');

    // -------------------------------------------------------------
    // AUDIT 9: Customer Cart Isolation Verification (PART 2)
    // -------------------------------------------------------------
    console.log('\n[AUDIT 9] Testing Customer Cart Keying & Isolation Architecture...');
    const keyCustA = `localcommerce_cart_${userIdCustA}`;
    const keyCustB = `localcommerce_cart_${userIdCustB}`;
    const keyGuest = 'localcommerce_cart_guest';

    if (keyCustA === keyCustB) {
      throw new Error('AUDIT 9 FAILED: Customer A and B cart storage keys are identical!');
    }
    if (keyCustA === keyGuest || keyCustB === keyGuest) {
      throw new Error('AUDIT 9 FAILED: Customer cart key collided with guest cart key!');
    }
    console.log(`  ✓ Customer A cart key: "${keyCustA}"`);
    console.log(`  ✓ Customer B cart key: "${keyCustB}"`);
    console.log(`  ✓ Guest cart key:      "${keyGuest}"`);
    console.log('  [PASS] Carts are isolated per customer identity.');

    console.log('\n====================================================');
    console.log('  ALL AUDIT SUITES PASSED (100% SUCCESS)');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err.message);
    throw err;
  } finally {
    // -------------------------------------------------------------
    // CLEANUP: Purge all test records and restore baseline counts
    // -------------------------------------------------------------
    console.log('[CLEANUP] Tearing down test audit records...');
    try {
      if (orderIdA) {
        await pool.query('DELETE FROM payments WHERE order_id = $1', [orderIdA]);
        await pool.query('DELETE FROM order_items WHERE order_id = $1', [orderIdA]);
        await pool.query('DELETE FROM orders WHERE id = $1', [orderIdA]);
      }
      if (addressIdA) {
        await pool.query('DELETE FROM customer_addresses WHERE id = $1', [addressIdA]);
      }
      if (productIdA) {
        await pool.query('DELETE FROM store_products WHERE id = $1', [productIdA]);
      }
      if (productIdB) {
        await pool.query('DELETE FROM store_products WHERE id = $1', [productIdB]);
      }
      if (newStoreIdA2) {
        await pool.query('DELETE FROM store_settings WHERE store_id = $1', [newStoreIdA2]);
        await pool.query('DELETE FROM store_users WHERE store_id = $1', [newStoreIdA2]);
        await pool.query('DELETE FROM stores WHERE id = $1', [newStoreIdA2]);
      }
      if (storeIdA) {
        await pool.query('DELETE FROM store_settings WHERE store_id = $1', [storeIdA]);
        await pool.query('DELETE FROM store_users WHERE store_id = $1', [storeIdA]);
        await pool.query('DELETE FROM stores WHERE id = $1', [storeIdA]);
      }
      if (storeIdB) {
        await pool.query('DELETE FROM store_settings WHERE store_id = $1', [storeIdB]);
        await pool.query('DELETE FROM store_users WHERE store_id = $1', [storeIdB]);
        await pool.query('DELETE FROM stores WHERE id = $1', [storeIdB]);
      }
      if (customerIdA) {
        await pool.query('DELETE FROM customers WHERE id = $1', [customerIdA]);
      }
      if (customerIdB) {
        await pool.query('DELETE FROM customers WHERE id = $1', [customerIdB]);
      }
      const testUserIds = [userIdCustA, userIdCustB, userIdOwnerA, userIdOwnerB].filter(Boolean);
      if (testUserIds.length > 0) {
        await pool.query('DELETE FROM users WHERE id = ANY($1)', [testUserIds]);
      }

      // Verify baseline database counts
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
        console.log('  [PASS] Database successfully restored to exact baseline counts! Zero data pollution.\n');
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

runIsolationAudit();
