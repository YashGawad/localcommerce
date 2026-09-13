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

async function login(email) {
  const res = await postJson(`${API_BASE}/auth/login`, {
    email,
    password: DEV_SEED_PASSWORD,
  });
  if (res.status !== 200 || !res.data?.data?.token) {
    throw new Error(`Failed to login as ${email}: status ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.data.token;
}

async function runTests() {
  log('====================================================');
  log('STARTING BACKEND MILESTONE 5 TEST SUITE');
  log('====================================================\n');

  // Baseline database count verification
  const catCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM categories');
  const gpCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM global_products');
  const spCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM store_products');
  const storeCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM stores');

  const baselineCats = catCountRes.rows[0].count;
  const baselineGps = gpCountRes.rows[0].count;
  const baselineSps = spCountRes.rows[0].count;
  const baselineStores = storeCountRes.rows[0].count;

  log(`Baseline counts in DB:`);
  log(`  Categories: ${baselineCats} (expected 5)`);
  log(`  Global Products: ${baselineGps} (expected 4)`);
  log(`  Store Products: ${baselineSps} (expected 8)`);
  log(`  Stores: ${baselineStores} (expected 2)\n`);

  if (baselineCats !== 5 || baselineGps !== 4 || baselineSps !== 8 || baselineStores !== 2) {
    fail('Baseline Database Counts', `Expected 5 cats, 4 gps, 8 sps, 2 stores. Found ${baselineCats}, ${baselineGps}, ${baselineSps}, ${baselineStores}`);
  } else {
    pass('Baseline Database Counts match exact specification');
  }

  // Retrieve existing test UUIDs from DB
  const storesRes = await pool.query('SELECT id, name FROM stores ORDER BY id ASC');
  const storeA = storesRes.rows[0]; // Sharma Supermarket (10000000-0000-0000-0000-000000000001)
  const storeB = storesRes.rows[1]; // Shree Kirana (10000000-0000-0000-0000-000000000002)

  const existingCatRes = await pool.query('SELECT id, name, store_id FROM categories WHERE store_id = $1 LIMIT 1', [storeA.id]);
  const catStoreA = existingCatRes.rows[0];

  const existingCatBRes = await pool.query('SELECT id, name, store_id FROM categories WHERE store_id = $1 LIMIT 1', [storeB.id]);
  const catStoreB = existingCatBRes.rows[0];

  const existingSpRes = await pool.query('SELECT id, name, store_id, price FROM store_products WHERE store_id = $1 LIMIT 1', [storeA.id]);
  const spStoreA = existingSpRes.rows[0];

  const existingSpBRes = await pool.query('SELECT id, name, store_id, price FROM store_products WHERE store_id = $1 LIMIT 1', [storeB.id]);
  const spStoreB = existingSpBRes.rows[0];

  const existingGpRes = await pool.query('SELECT id, name FROM global_products LIMIT 1');
  const gpOne = existingGpRes.rows[0];

  // ----------------------------------------------------
  // TEST 1: UNAUTHENTICATED
  // ----------------------------------------------------
  log('\n--- 1. UNAUTHENTICATED REQUESTS ---');
  {
    const r1 = await getJson(`${API_BASE}/categories`);
    if (r1.status === 200 && r1.data?.success) pass('Public GET /api/categories -> 200');
    else fail('Public GET /api/categories', `Status: ${r1.status}`);

    const r2 = await getJson(`${API_BASE}/categories/${catStoreA.id}`);
    if (r2.status === 200 && r2.data?.success) pass('Public GET /api/categories/:id -> 200');
    else fail('Public GET /api/categories/:id', `Status: ${r2.status}`);

    const r3 = await getJson(`${API_BASE}/global-products`);
    if (r3.status === 200 && r3.data?.success) pass('Public GET /api/global-products -> 200');
    else fail('Public GET /api/global-products', `Status: ${r3.status}`);

    const r4 = await getJson(`${API_BASE}/global-products/${gpOne.id}`);
    if (r4.status === 200 && r4.data?.success) pass('Public GET /api/global-products/:id -> 200');
    else fail('Public GET /api/global-products/:id', `Status: ${r4.status}`);

    const r5 = await getJson(`${API_BASE}/stores/${storeA.id}/products`);
    if (r5.status === 200 && r5.data?.success) pass('Public GET /api/stores/:storeId/products -> 200');
    else fail('Public GET /api/stores/:storeId/products', `Status: ${r5.status}`);

    const r6 = await getJson(`${API_BASE}/stores/${storeA.id}/products/${spStoreA.id}`);
    if (r6.status === 200 && r6.data?.success) pass('Public GET /api/stores/:storeId/products/:id -> 200');
    else fail('Public GET /api/stores/:storeId/products/:id', `Status: ${r6.status}`);

    // Unauthenticated writes should fail with 401
    const w1 = await postJson(`${API_BASE}/categories`, { store_id: storeA.id, name: 'Unauth Cat' });
    if (w1.status === 401) pass('Unauth POST /api/categories -> 401');
    else fail('Unauth POST /api/categories', `Status: ${w1.status}`);

    const w2 = await patchJson(`${API_BASE}/categories/${catStoreA.id}`, { name: 'Unauth Cat Update' });
    if (w2.status === 401) pass('Unauth PATCH /api/categories/:id -> 401');
    else fail('Unauth PATCH /api/categories/:id', `Status: ${w2.status}`);

    const w3 = await postJson(`${API_BASE}/global-products`, { name: 'Unauth GP' });
    if (w3.status === 401) pass('Unauth POST /api/global-products -> 401');
    else fail('Unauth POST /api/global-products', `Status: ${w3.status}`);

    const w4 = await patchJson(`${API_BASE}/global-products/${gpOne.id}`, { name: 'Unauth GP Update' });
    if (w4.status === 401) pass('Unauth PATCH /api/global-products/:id -> 401');
    else fail('Unauth PATCH /api/global-products/:id', `Status: ${w4.status}`);

    const w5 = await postJson(`${API_BASE}/stores/${storeA.id}/products`, { name: 'Unauth Prod', price: 99 });
    if (w5.status === 401) pass('Unauth POST /api/stores/:storeId/products -> 401');
    else fail('Unauth POST /api/stores/:storeId/products', `Status: ${w5.status}`);

    const w6 = await patchJson(`${API_BASE}/stores/${storeA.id}/products/${spStoreA.id}`, { price: 88 });
    if (w6.status === 401) pass('Unauth PATCH /api/stores/:storeId/products/:id -> 401');
    else fail('Unauth PATCH /api/stores/:storeId/products/:id', `Status: ${w6.status}`);

    const w7 = await postJson(`${API_BASE}/stores`, { name: 'Unauth Store', slug: 'unauth-store' });
    if (w7.status === 401) pass('Unauth POST /api/stores -> 401');
    else fail('Unauth POST /api/stores', `Status: ${w7.status}`);

    const w8 = await patchJson(`${API_BASE}/stores/${storeA.id}`, { name: 'Unauth Store Update' });
    if (w8.status === 401) pass('Unauth PATCH /api/stores/:id -> 401');
    else fail('Unauth PATCH /api/stores/:id', `Status: ${w8.status}`);
  }

  // ----------------------------------------------------
  // TEST 2: CUSTOMER
  // ----------------------------------------------------
  log('\n--- 2. CUSTOMER (customer@example.com) ---');
  {
    const token = await login('customer@example.com');

    // Customer can read
    const r1 = await getJson(`${API_BASE}/categories`, token);
    if (r1.status === 200) pass('Customer GET /api/categories -> 200');
    else fail('Customer GET /api/categories', `Status: ${r1.status}`);

    const r2 = await getJson(`${API_BASE}/global-products`, token);
    if (r2.status === 200) pass('Customer GET /api/global-products -> 200');
    else fail('Customer GET /api/global-products', `Status: ${r2.status}`);

    const r3 = await getJson(`${API_BASE}/stores/${storeA.id}/products`, token);
    if (r3.status === 200) pass('Customer GET /api/stores/:storeId/products -> 200');
    else fail('Customer GET /api/stores/:storeId/products', `Status: ${r3.status}`);

    // Customer cannot write -> 403
    const w1 = await postJson(`${API_BASE}/categories`, { store_id: storeA.id, name: 'Cust Cat' }, token);
    if (w1.status === 403) pass('Customer POST /api/categories -> 403');
    else fail('Customer POST /api/categories', `Status: ${w1.status}`);

    const w2 = await patchJson(`${API_BASE}/categories/${catStoreA.id}`, { name: 'Cust Cat Up' }, token);
    if (w2.status === 403) pass('Customer PATCH /api/categories/:id -> 403');
    else fail('Customer PATCH /api/categories/:id', `Status: ${w2.status}`);

    const w3 = await postJson(`${API_BASE}/global-products`, { name: 'Cust GP' }, token);
    if (w3.status === 403) pass('Customer POST /api/global-products -> 403');
    else fail('Customer POST /api/global-products', `Status: ${w3.status}`);

    const w4 = await patchJson(`${API_BASE}/global-products/${gpOne.id}`, { name: 'Cust GP Up' }, token);
    if (w4.status === 403) pass('Customer PATCH /api/global-products/:id -> 403');
    else fail('Customer PATCH /api/global-products/:id', `Status: ${w4.status}`);

    const w5 = await postJson(`${API_BASE}/stores/${storeA.id}/products`, { name: 'Cust Prod', price: 10 }, token);
    if (w5.status === 403) pass('Customer POST /api/stores/:storeId/products -> 403');
    else fail('Customer POST /api/stores/:storeId/products', `Status: ${w5.status}`);

    const w6 = await patchJson(`${API_BASE}/stores/${storeA.id}/products/${spStoreA.id}`, { price: 15 }, token);
    if (w6.status === 403) pass('Customer PATCH /api/stores/:storeId/products/:id -> 403');
    else fail('Customer PATCH /api/stores/:storeId/products/:id', `Status: ${w6.status}`);

    const w7 = await postJson(`${API_BASE}/stores`, { name: 'Cust Store', slug: 'cust-store' }, token);
    if (w7.status === 403) pass('Customer POST /api/stores -> 403');
    else fail('Customer POST /api/stores', `Status: ${w7.status}`);

    const w8 = await patchJson(`${API_BASE}/stores/${storeA.id}`, { name: 'Cust Store Up' }, token);
    if (w8.status === 403) pass('Customer PATCH /api/stores/:id -> 403');
    else fail('Customer PATCH /api/stores/:id', `Status: ${w8.status}`);
  }

  // ----------------------------------------------------
  // TEST 3: OWNER
  // ----------------------------------------------------
  log('\n--- 3. OWNER (owner@example.com -> Sharma Supermarket) ---');
  let tempOwnerCatId = null;
  let tempOwnerProdId = null;
  {
    const token = await login('owner@example.com');

    // 3.1 Can manage Store A category
    const catCreateRes = await postJson(`${API_BASE}/categories`, {
      store_id: storeA.id,
      name: 'Temp Organic Dairy',
      description: 'Temporary category for owner test',
      status: 'active',
    }, token);

    if (catCreateRes.status === 201 && catCreateRes.data?.data?.id) {
      tempOwnerCatId = catCreateRes.data.data.id;
      pass('Owner POST /api/categories for Store A -> 201');
    } else {
      fail('Owner POST /api/categories for Store A', `Status: ${catCreateRes.status} ${JSON.stringify(catCreateRes.data)}`);
    }

    if (tempOwnerCatId) {
      const catPatchRes = await patchJson(`${API_BASE}/categories/${tempOwnerCatId}`, {
        description: 'Updated description by owner',
      }, token);
      if (catPatchRes.status === 200 && catPatchRes.data?.data?.description === 'Updated description by owner') {
        pass('Owner PATCH /api/categories/:id for Store A -> 200');
      } else {
        fail('Owner PATCH /api/categories/:id for Store A', `Status: ${catPatchRes.status} ${JSON.stringify(catPatchRes.data)}`);
      }
    }

    // 3.2 Can manage Store A product
    const prodCreateRes = await postJson(`${API_BASE}/stores/${storeA.id}/products`, {
      name: 'Temp Farm Butter',
      sku: 'TEMP-BUTTER-001',
      price: 120.00,
      stock_quantity: 25,
      status: 'active',
    }, token);

    if (prodCreateRes.status === 201 && prodCreateRes.data?.data?.id) {
      tempOwnerProdId = prodCreateRes.data.data.id;
      pass('Owner POST /api/stores/:storeId/products for Store A -> 201');
    } else {
      fail('Owner POST /api/stores/:storeId/products for Store A', `Status: ${prodCreateRes.status} ${JSON.stringify(prodCreateRes.data)}`);
    }

    if (tempOwnerProdId) {
      const prodPatchRes = await patchJson(`${API_BASE}/stores/${storeA.id}/products/${tempOwnerProdId}`, {
        price: 125.00,
      }, token);
      if (prodPatchRes.status === 200 && Number(prodPatchRes.data?.data?.price) === 125) {
        pass('Owner PATCH /api/stores/:storeId/products/:id for Store A -> 200');
      } else {
        fail('Owner PATCH /api/stores/:storeId/products/:id for Store A', `Status: ${prodPatchRes.status} ${JSON.stringify(prodPatchRes.data)}`);
      }
    }

    // 3.3 CANNOT manage Store B (Shree Kirana) -> Multi-tenant Isolation
    log('  Testing Multi-Tenant Cross-Store Isolation for Owner:');

    // Attempt POST category for Store B
    const crossCatPost = await postJson(`${API_BASE}/categories`, {
      store_id: storeB.id,
      name: 'Malicious Store B Category',
    }, token);
    if (crossCatPost.status === 403) {
      pass('Owner POST /api/categories for Store B -> 403 Forbidden');
    } else {
      fail('Owner POST /api/categories for Store B', `Expected 403, got ${crossCatPost.status}`);
    }

    // Attempt PATCH existing Store B category
    const crossCatPatch = await patchJson(`${API_BASE}/categories/${catStoreB.id}`, {
      name: 'Hacked Category Name',
    }, token);
    if (crossCatPatch.status === 403) {
      pass('Owner PATCH /api/categories/:id for Store B category -> 403 Forbidden');
    } else {
      fail('Owner PATCH /api/categories/:id for Store B category', `Expected 403, got ${crossCatPatch.status}`);
    }

    // Attempt POST product for Store B
    const crossProdPost = await postJson(`${API_BASE}/stores/${storeB.id}/products`, {
      name: 'Malicious Store B Product',
      price: 50.00,
    }, token);
    if (crossProdPost.status === 403) {
      pass('Owner POST /api/stores/:storeId/products for Store B -> 403 Forbidden');
    } else {
      fail('Owner POST /api/stores/:storeId/products for Store B', `Expected 403, got ${crossProdPost.status}`);
    }

    // Attempt PATCH existing Store B product via Store B URL
    const crossProdPatchB = await patchJson(`${API_BASE}/stores/${storeB.id}/products/${spStoreB.id}`, {
      price: 1.00,
    }, token);
    if (crossProdPatchB.status === 403) {
      pass('Owner PATCH /api/stores/:storeB/products/:id -> 403 Forbidden');
    } else {
      fail('Owner PATCH /api/stores/:storeB/products/:id', `Expected 403, got ${crossProdPatchB.status}`);
    }

    // Attempt PATCH existing Store B product via Store A URL (UUID tampering)
    const crossProdPatchA = await patchJson(`${API_BASE}/stores/${storeA.id}/products/${spStoreB.id}`, {
      price: 1.00,
    }, token);
    if (crossProdPatchA.status === 404) {
      pass('Owner PATCH /api/stores/:storeA/products/:storeBProductId (tamper) -> 404 Not Found');
    } else {
      fail('Owner PATCH /api/stores/:storeA/products/:storeBProductId (tamper)', `Expected 404, got ${crossProdPatchA.status}`);
    }

    // Attempt POST/PATCH global products (Owner should be forbidden)
    const gpPost = await postJson(`${API_BASE}/global-products`, { name: 'Owner GP' }, token);
    if (gpPost.status === 403) pass('Owner POST /api/global-products -> 403 Forbidden');
    else fail('Owner POST /api/global-products', `Expected 403, got ${gpPost.status}`);

    const gpPatch = await patchJson(`${API_BASE}/global-products/${gpOne.id}`, { name: 'Owner GP Up' }, token);
    if (gpPatch.status === 403) pass('Owner PATCH /api/global-products/:id -> 403 Forbidden');
    else fail('Owner PATCH /api/global-products/:id', `Expected 403, got ${gpPatch.status}`);
  }

  // ----------------------------------------------------
  // TEST 4: STAFF
  // ----------------------------------------------------
  log('\n--- 4. STAFF (staff@example.com) ---');
  {
    const token = await login('staff@example.com');

    const r1 = await getJson(`${API_BASE}/stores/${storeA.id}/products`, token);
    if (r1.status === 200) pass('Staff GET /api/stores/:storeId/products -> 200');
    else fail('Staff GET /api/stores/:storeId/products', `Status: ${r1.status}`);

    const w1 = await postJson(`${API_BASE}/categories`, { store_id: storeA.id, name: 'Staff Cat' }, token);
    if (w1.status === 403) pass('Staff POST /api/categories -> 403 Forbidden');
    else fail('Staff POST /api/categories', `Status: ${w1.status}`);

    const w2 = await patchJson(`${API_BASE}/categories/${catStoreA.id}`, { name: 'Staff Cat Up' }, token);
    if (w2.status === 403) pass('Staff PATCH /api/categories/:id -> 403 Forbidden');
    else fail('Staff PATCH /api/categories/:id', `Status: ${w2.status}`);

    const w3 = await postJson(`${API_BASE}/stores/${storeA.id}/products`, { name: 'Staff Prod', price: 10 }, token);
    if (w3.status === 403) pass('Staff POST /api/stores/:storeId/products -> 403 Forbidden');
    else fail('Staff POST /api/stores/:storeId/products', `Status: ${w3.status}`);

    const w4 = await patchJson(`${API_BASE}/stores/${storeA.id}/products/${spStoreA.id}`, { price: 10 }, token);
    if (w4.status === 403) pass('Staff PATCH /api/stores/:storeId/products/:id -> 403 Forbidden');
    else fail('Staff PATCH /api/stores/:storeId/products/:id', `Status: ${w4.status}`);
  }

  // ----------------------------------------------------
  // TEST 5: DELIVERY STAFF
  // ----------------------------------------------------
  log('\n--- 5. DELIVERY STAFF (delivery@example.com -> Member of Store A & Store B) ---');
  {
    const token = await login('delivery@example.com');

    const r1 = await getJson(`${API_BASE}/stores/${storeA.id}/products`, token);
    if (r1.status === 200) pass('Delivery GET /api/stores/:storeA/products -> 200');
    else fail('Delivery GET /api/stores/:storeA/products', `Status: ${r1.status}`);

    const r2 = await getJson(`${API_BASE}/stores/${storeB.id}/products`, token);
    if (r2.status === 200) pass('Delivery GET /api/stores/:storeB/products -> 200');
    else fail('Delivery GET /api/stores/:storeB/products', `Status: ${r2.status}`);

    // Delivery user belongs to both stores, but role is delivery_staff -> writes must fail with 403
    const w1 = await postJson(`${API_BASE}/stores/${storeA.id}/products`, { name: 'Delivery Prod', price: 20 }, token);
    if (w1.status === 403) pass('Delivery POST /api/stores/:storeA/products -> 403 Forbidden');
    else fail('Delivery POST /api/stores/:storeA/products', `Status: ${w1.status}`);

    const w2 = await postJson(`${API_BASE}/stores/${storeB.id}/products`, { name: 'Delivery Prod B', price: 20 }, token);
    if (w2.status === 403) pass('Delivery POST /api/stores/:storeB/products -> 403 Forbidden');
    else fail('Delivery POST /api/stores/:storeB/products', `Status: ${w2.status}`);

    const w3 = await postJson(`${API_BASE}/categories`, { store_id: storeA.id, name: 'Delivery Cat' }, token);
    if (w3.status === 403) pass('Delivery POST /api/categories -> 403 Forbidden');
    else fail('Delivery POST /api/categories', `Status: ${w3.status}`);

    const w4 = await patchJson(`${API_BASE}/categories/${catStoreA.id}`, { name: 'Delivery Cat Up' }, token);
    if (w4.status === 403) pass('Delivery PATCH /api/categories/:id -> 403 Forbidden');
    else fail('Delivery PATCH /api/categories/:id', `Status: ${w4.status}`);
  }

  // ----------------------------------------------------
  // TEST 6: ADMIN
  // ----------------------------------------------------
  log('\n--- 6. ADMIN (admin@example.com) ---');
  let tempAdminGpId = null;
  {
    const token = await login('admin@example.com');

    // Admin can read and manage global products
    const gpListRes = await getJson(`${API_BASE}/global-products`, token);
    if (gpListRes.status === 200) pass('Admin GET /api/global-products -> 200');
    else fail('Admin GET /api/global-products', `Status: ${gpListRes.status}`);

    const gpCreateRes = await postJson(`${API_BASE}/global-products`, {
      name: 'Temp Test Global Flour',
      brand: 'National Mills',
      description: 'Temporary global flour reference',
      mrp: 55.00,
      unit: 'kg',
      status: 'active',
    }, token);

    if (gpCreateRes.status === 201 && gpCreateRes.data?.data?.id) {
      tempAdminGpId = gpCreateRes.data.data.id;
      pass('Admin POST /api/global-products -> 201');
    } else {
      fail('Admin POST /api/global-products', `Status: ${gpCreateRes.status} ${JSON.stringify(gpCreateRes.data)}`);
    }

    if (tempAdminGpId) {
      const gpPatchRes = await patchJson(`${API_BASE}/global-products/${tempAdminGpId}`, {
        mrp: 60.00,
        description: 'Updated global flour reference description',
      }, token);
      if (gpPatchRes.status === 200 && Number(gpPatchRes.data?.data?.mrp) === 60) {
        pass('Admin PATCH /api/global-products/:id -> 200');
      } else {
        fail('Admin PATCH /api/global-products/:id', `Status: ${gpPatchRes.status} ${JSON.stringify(gpPatchRes.data)}`);
      }
    }

    // Admin should NOT have casual write access to store-owned catalog without store membership
    const storeCatPost = await postJson(`${API_BASE}/categories`, {
      store_id: storeA.id,
      name: 'Admin Category',
    }, token);
    if (storeCatPost.status === 403) {
      pass('Admin POST /api/categories without store membership -> 403 Forbidden (Catalog explicit ownership preserved)');
    } else {
      fail('Admin POST /api/categories without store membership', `Expected 403, got ${storeCatPost.status}`);
    }

    const storeProdPost = await postJson(`${API_BASE}/stores/${storeA.id}/products`, {
      name: 'Admin Prod',
      price: 50,
    }, token);
    if (storeProdPost.status === 403) {
      pass('Admin POST /api/stores/:storeId/products without store membership -> 403 Forbidden');
    } else {
      fail('Admin POST /api/stores/:storeId/products without store membership', `Expected 403, got ${storeProdPost.status}`);
    }
  }

  // ----------------------------------------------------
  // TEST 7: VERIFY STORE B DATA REMAINED UNTOUCHED
  // ----------------------------------------------------
  log('\n--- 7. VERIFY STORE B DATA UNTOUCHED AFTER TAMPERING ATTEMPTS ---');
  {
    const checkCatB = await pool.query('SELECT name, description FROM categories WHERE id = $1', [catStoreB.id]);
    if (checkCatB.rows[0].name === catStoreB.name) {
      pass(`Store B category "${catStoreB.name}" is completely unmodified`);
    } else {
      fail('Store B category tampering detected!', `Expected "${catStoreB.name}", got "${checkCatB.rows[0].name}"`);
    }

    const checkSpB = await pool.query('SELECT name, price FROM store_products WHERE id = $1', [spStoreB.id]);
    if (Number(checkSpB.rows[0].price) === Number(spStoreB.price)) {
      pass(`Store B product "${spStoreB.name}" price is completely unmodified (${spStoreB.price})`);
    } else {
      fail('Store B product tampering detected!', `Expected price ${spStoreB.price}, got ${checkSpB.rows[0].price}`);
    }
  }

  // ----------------------------------------------------
  // CLEANUP TEMPORARY TEST RECORDS
  // ----------------------------------------------------
  log('\n--- CLEANING UP TEMPORARY TEST RECORDS ---');
  if (tempOwnerProdId) {
    await pool.query('DELETE FROM store_products WHERE id = $1', [tempOwnerProdId]);
    log('  Deleted temporary store product: ' + tempOwnerProdId);
  }
  if (tempOwnerCatId) {
    await pool.query('DELETE FROM categories WHERE id = $1', [tempOwnerCatId]);
    log('  Deleted temporary category: ' + tempOwnerCatId);
  }
  if (tempAdminGpId) {
    await pool.query('DELETE FROM global_products WHERE id = $1', [tempAdminGpId]);
    log('  Deleted temporary global product: ' + tempAdminGpId);
  }

  // ----------------------------------------------------
  // DATABASE INTEGRITY VERIFICATION
  // ----------------------------------------------------
  log('\n--- 8. DATABASE INTEGRITY FINAL COUNTS ---');
  const postCatCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM categories');
  const postGpCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM global_products');
  const postSpCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM store_products');
  const postStoreCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM stores');

  const finalCats = postCatCountRes.rows[0].count;
  const finalGps = postGpCountRes.rows[0].count;
  const finalSps = postSpCountRes.rows[0].count;
  const finalStores = postStoreCountRes.rows[0].count;

  log(`Final counts in DB:`);
  log(`  Categories: ${finalCats} (expected 5)`);
  log(`  Global Products: ${finalGps} (expected 4)`);
  log(`  Store Products: ${finalSps} (expected 8)`);
  log(`  Stores: ${finalStores} (expected 2)\n`);

  if (finalCats === 5 && finalGps === 4 && finalSps === 8 && finalStores === 2) {
    pass('Database counts restored exactly to baseline (no contamination)');
  } else {
    fail('Database contamination detected', `Expected 5/4/8/2, got ${finalCats}/${finalGps}/${finalSps}/${finalStores}`);
  }

  // ----------------------------------------------------
  // REGRESSION TESTS
  // ----------------------------------------------------
  log('\n--- 9. REGRESSION TESTS ---');
  {
    const hRes = await getJson(`${API_BASE}/health`);
    if (hRes.status === 200 && hRes.data?.database === 'connected') pass('GET /api/health -> 200 (connected)');
    else fail('GET /api/health', `Status: ${hRes.status}`);

    const storesRes = await getJson(`${API_BASE}/stores`);
    if (storesRes.status === 200 && storesRes.data?.data?.length === 2) pass('GET /api/stores -> 200 (2 stores)');
    else fail('GET /api/stores', `Status: ${storesRes.status}`);

    const meToken = await login('owner@example.com');
    const meRes = await getJson(`${API_BASE}/auth/me`, meToken);
    if (meRes.status === 200 && meRes.data?.data?.user?.email === 'owner@example.com') pass('GET /api/auth/me -> 200 (authenticated user verified)');
    else fail('GET /api/auth/me', `Status: ${meRes.status}`);
  }

  log('\n====================================================');
  log('BACKEND MILESTONE 5 TEST SUITE COMPLETED');
  log('====================================================');

  await pool.end();
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  pool.end();
  process.exit(1);
});
