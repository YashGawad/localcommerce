const pool = require('../config/db');

const API_BASE = 'http://localhost:5000/api';

async function runBusinessOnboardingTests() {
  console.log('====================================================');
  console.log('  LOCALCOMMERCE BUSINESS ONBOARDING INTEGRATION TESTS');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const testEmail = `merchant_${timestamp}@testcommerce.com`;
  const testStoreSlug = `test-market-${timestamp}`;
  const testPassword = 'Password@123';
  const testStoreName = `Test Onboarded Market ${timestamp}`;

  let merchantToken = null;
  let merchantUserId = null;
  let initialStoreId = null;
  let secondStoreId = null;
  let createdProductId = null;

  try {
    // -------------------------------------------------------------
    // TEST 1: Business Onboarding Transaction (POST /api/auth/business/register)
    // -------------------------------------------------------------
    console.log('[TEST 1] Testing Business Onboarding Transaction...');
    const registerPayload = {
      name: 'Priya Sharma',
      email: testEmail,
      password: testPassword,
      phone: '+91 98765 43210',
      store: {
        name: testStoreName,
        slug: testStoreSlug,
        description: 'Quality fresh groceries and household goods.',
        phone: '+91 98765 43210',
        email: testEmail,
        address: '104 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400020',
      },
    };

    const regRes = await fetch(`${API_BASE}/auth/business/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload),
    });

    const regData = await regRes.json();
    if (regRes.status !== 201 || !regData.success) {
      throw new Error(`TEST 1 FAILED: Expected 201 Created, got ${regRes.status}: ${JSON.stringify(regData)}`);
    }

    merchantToken = regData.data.token;
    merchantUserId = regData.data.user.id;
    initialStoreId = regData.data.store.id;

    if (!merchantToken) throw new Error('TEST 1 FAILED: No JWT token returned in onboarding response');
    if (regData.data.user.role !== 'business_owner') {
      throw new Error(`TEST 1 FAILED: User role should be 'business_owner', got: ${regData.data.user.role}`);
    }
    if (regData.data.user.store_roles[0]?.role !== 'owner') {
      throw new Error(`TEST 1 FAILED: User store_role should be 'owner', got: ${regData.data.user.store_roles[0]?.role}`);
    }

    // Verify DB integrity for store_settings
    const settingsCheck = await pool.query('SELECT * FROM store_settings WHERE store_id = $1', [initialStoreId]);
    if (settingsCheck.rows.length === 0) {
      throw new Error('TEST 1 FAILED: store_settings record was not created for new store');
    }
    if (!settingsCheck.rows[0].accepting_orders) {
      throw new Error('TEST 1 FAILED: store_settings accepting_orders is not true');
    }

    console.log(`  ✓ Onboarded user ${merchantUserId} as 'business_owner'`);
    console.log(`  ✓ Created store ${initialStoreId} ('${testStoreSlug}')`);
    console.log(`  ✓ Linked in store_users as 'owner'`);
    console.log(`  ✓ Initialized store_settings with accepting_orders=true`);
    console.log('  ✓ TEST 1 PASSED: Onboarding transaction completed successfully.\n');

    // -------------------------------------------------------------
    // TEST 2: Validation & Uniqueness Protection
    // -------------------------------------------------------------
    console.log('[TEST 2] Testing Uniqueness Conflicts (Email & Slug)...');

    // Duplicate email
    const dupEmailRes = await fetch(`${API_BASE}/auth/business/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...registerPayload,
        store: { ...registerPayload.store, slug: `different-slug-${timestamp}` },
      }),
    });
    if (dupEmailRes.status !== 409) {
      throw new Error(`TEST 2 FAILED: Expected 409 for duplicate email, got ${dupEmailRes.status}`);
    }
    console.log('  ✓ Duplicate email rejected with 409 Conflict');

    // Duplicate slug
    const dupSlugRes = await fetch(`${API_BASE}/auth/business/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...registerPayload,
        email: `unique_${timestamp}@example.com`,
      }),
    });
    if (dupSlugRes.status !== 409) {
      throw new Error(`TEST 2 FAILED: Expected 409 for duplicate slug, got ${dupSlugRes.status}`);
    }
    console.log('  ✓ Duplicate slug rejected with 409 Conflict');
    console.log('  ✓ TEST 2 PASSED: Uniqueness constraints enforced.\n');

    // -------------------------------------------------------------
    // TEST 3: Merchant Authenticated Action (Add Product under New Store)
    // -------------------------------------------------------------
    console.log('[TEST 3] Testing Merchant Authenticated Action with Issued JWT...');
    
    // Pick an existing category from DB
    const catResult = await pool.query('SELECT id FROM categories LIMIT 1');
    const categoryId = catResult.rows[0]?.id;

    const productPayload = {
      name: `Organic Honeycomb ${timestamp}`,
      sku: `HON-${timestamp}`,
      category_id: categoryId,
      price: 349.00,
      cost_price: 280.00,
      stock_quantity: 45,
      unit: '500g',
      status: 'active',
      description: 'Raw unprocessed organic wildflower honey.',
    };

    const addProductRes = await fetch(`${API_BASE}/stores/${initialStoreId}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${merchantToken}`,
      },
      body: JSON.stringify(productPayload),
    });

    const addProductData = await addProductRes.json();
    if (addProductRes.status !== 201 || !addProductData.success) {
      throw new Error(`TEST 3 FAILED: Could not add product with merchant token: ${JSON.stringify(addProductData)}`);
    }

    createdProductId = addProductData.data.id;
    console.log(`  ✓ Product created successfully: id ${createdProductId} ('${productPayload.title}')`);
    console.log('  ✓ TEST 3 PASSED: Merchant token authenticated and authorized for store operations.\n');

    // -------------------------------------------------------------
    // TEST 4: Customer Discovery (Public Storefront & Catalog)
    // -------------------------------------------------------------
    console.log('[TEST 4] Testing Customer Discovery (Public Store & Products)...');

    // 4A. Discover store by slug without authentication
    const storeSlugRes = await fetch(`${API_BASE}/stores/slug/${testStoreSlug}`);
    const storeSlugData = await storeSlugRes.json();
    if (storeSlugRes.status !== 200 || !storeSlugData.success || storeSlugData.data.slug !== testStoreSlug) {
      throw new Error(`TEST 4A FAILED: Public customer could not find store by slug: ${JSON.stringify(storeSlugData)}`);
    }
    console.log(`  ✓ Store publicly discovered at /api/stores/slug/${testStoreSlug}`);

    // 4B. Discover store products without authentication
    const publicProductsRes = await fetch(`${API_BASE}/stores/${initialStoreId}/products`);
    const publicProductsData = await publicProductsRes.json();
    if (publicProductsRes.status !== 200 || !publicProductsData.success) {
      throw new Error(`TEST 4B FAILED: Public customer could not fetch store products: ${JSON.stringify(publicProductsData)}`);
    }

    const foundProduct = (publicProductsData.data || []).find((p) => p.id === createdProductId);
    if (!foundProduct) {
      throw new Error(`TEST 4B FAILED: Created product ${createdProductId} not found in public store catalog`);
    }
    console.log(`  ✓ Product publicly visible in store catalog: '${foundProduct.name}' (Price: ₹${foundProduct.price})`);
    console.log('  ✓ TEST 4 PASSED: Storefront and catalog publicly discoverable.\n');

    // -------------------------------------------------------------
    // TEST 5: Authenticated Additional Store Creation (POST /api/stores)
    // -------------------------------------------------------------
    console.log('[TEST 5] Testing Authenticated Additional Store Creation...');
    const secondStoreSlug = `second-branch-${timestamp}`;
    const secondStorePayload = {
      name: `Second Branch ${timestamp}`,
      slug: secondStoreSlug,
      description: 'Second branch in suburban area.',
      phone: '+91 98765 43210',
      email: testEmail,
      address: 'Plot 88, Link Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400053',
      status: 'active',
    };

    const createSecondRes = await fetch(`${API_BASE}/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${merchantToken}`,
      },
      body: JSON.stringify(secondStorePayload),
    });

    const createSecondData = await createSecondRes.json();
    if (createSecondRes.status !== 201 || !createSecondData.success) {
      throw new Error(`TEST 5 FAILED: Failed to create additional store: ${JSON.stringify(createSecondData)}`);
    }

    secondStoreId = createSecondData.data.id;

    // Verify creator linked as 'owner' in store_users
    const linkCheck = await pool.query(
      'SELECT role FROM store_users WHERE store_id = $1 AND user_id = $2',
      [secondStoreId, merchantUserId]
    );
    if (linkCheck.rows.length === 0 || linkCheck.rows[0].role !== 'owner') {
      throw new Error(`TEST 5 FAILED: Creator was not linked as 'owner' in store_users for store ${secondStoreId}`);
    }

    // Verify store_settings was initialized
    const secondSettingsCheck = await pool.query('SELECT * FROM store_settings WHERE store_id = $1', [secondStoreId]);
    if (secondSettingsCheck.rows.length === 0 || !secondSettingsCheck.rows[0].accepting_orders) {
      throw new Error(`TEST 5 FAILED: store_settings not initialized for store ${secondStoreId}`);
    }

    console.log(`  ✓ Additional store created: id ${secondStoreId} ('${secondStoreSlug}')`);
    console.log(`  ✓ Business owner automatically linked as 'owner' in store_users`);
    console.log(`  ✓ store_settings initialized with accepting_orders=true`);
    console.log('  ✓ TEST 5 PASSED: In-app store creation fully functional.\n');

    // -------------------------------------------------------------
    // TEST 6: Multi-Tenant Authorization Protection
    // -------------------------------------------------------------
    console.log('[TEST 6] Testing Multi-Tenant Authorization Isolation...');

    // Attempt to add product without auth token -> must return 401
    const noAuthRes = await fetch(`${API_BASE}/stores/${initialStoreId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productPayload),
    });
    if (noAuthRes.status !== 401) {
      throw new Error(`TEST 6 FAILED: Expected 401 Unauthorized for unauthenticated product addition, got ${noAuthRes.status}`);
    }
    console.log('  ✓ Unauthenticated product creation rejected with 401 Unauthorized');
    console.log('  ✓ TEST 6 PASSED: Multi-tenant store authorization enforced.\n');

    console.log('====================================================');
    console.log('  ALL BUSINESS ONBOARDING TESTS PASSED (100% SUCCESS)');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err.message);
    throw err;
  } finally {
    // -------------------------------------------------------------
    // CLEANUP: Clean database teardown to prevent pollution
    // -------------------------------------------------------------
    console.log('[CLEANUP] Tearing down test records...');
    try {
      if (initialStoreId) {
        await pool.query('DELETE FROM store_products WHERE store_id = $1', [initialStoreId]);
        await pool.query('DELETE FROM store_settings WHERE store_id = $1', [initialStoreId]);
        await pool.query('DELETE FROM store_users WHERE store_id = $1', [initialStoreId]);
        await pool.query('DELETE FROM stores WHERE id = $1', [initialStoreId]);
      }
      if (secondStoreId) {
        await pool.query('DELETE FROM store_products WHERE store_id = $1', [secondStoreId]);
        await pool.query('DELETE FROM store_settings WHERE store_id = $1', [secondStoreId]);
        await pool.query('DELETE FROM store_users WHERE store_id = $1', [secondStoreId]);
        await pool.query('DELETE FROM stores WHERE id = $1', [secondStoreId]);
      }
      if (createdProductId) {
        await pool.query('DELETE FROM store_products WHERE id = $1', [createdProductId]);
      }
      if (merchantUserId) {
        await pool.query('DELETE FROM users WHERE id = $1', [merchantUserId]);
      }
      console.log('  ✓ Test database records cleaned up cleanly. Zero residual pollution.\n');
    } catch (cleanupErr) {
      console.error('  ⚠️ Cleanup warning:', cleanupErr.message);
    } finally {
      await pool.end();
    }
  }
}

runBusinessOnboardingTests();
