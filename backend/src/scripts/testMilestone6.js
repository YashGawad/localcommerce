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

async function deleteJson(url, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'DELETE',
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
  log('STARTING BACKEND MILESTONE 6 TEST SUITE');
  log('====================================================\n');

  // Baseline database count verification
  const userCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  const custCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM customers');
  const addrCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM customer_addresses');

  const baselineUsers = userCountRes.rows[0].count;
  const baselineCusts = custCountRes.rows[0].count;
  const baselineAddrs = addrCountRes.rows[0].count;

  log(`Baseline counts in DB:`);
  log(`  Users: ${baselineUsers} (expected 5)`);
  log(`  Customers: ${baselineCusts} (expected 1)`);
  log(`  Customer Addresses: ${baselineAddrs} (expected 2)\n`);

  if (baselineUsers !== 5 || baselineCusts !== 1 || baselineAddrs !== 2) {
    fail('Baseline Database Counts', `Expected 5 users, 1 customer, 2 addresses. Got ${baselineUsers}, ${baselineCusts}, ${baselineAddrs}`);
  } else {
    pass('Baseline Database Counts verified');
  }

  // Record seeded customer A original state
  const origCustUserRes = await pool.query("SELECT name, phone FROM users WHERE email = 'customer@example.com'");
  const origName = origCustUserRes.rows[0].name;
  const origPhone = origCustUserRes.rows[0].phone;

  // Retrieve seeded addresses for Customer A
  const seededAddrsRes = await pool.query(`
    SELECT ca.id, ca.label, ca.is_default
    FROM customer_addresses ca
    JOIN customers c ON ca.customer_id = c.id
    JOIN users u ON c.user_id = u.id
    WHERE u.email = 'customer@example.com'
    ORDER BY ca.created_at ASC;
  `);
  const seededAddr1 = seededAddrsRes.rows[0];
  const seededAddr2 = seededAddrsRes.rows[1];

  // ----------------------------------------------------
  // TEST 1: UNAUTHENTICATED REQUESTS
  // ----------------------------------------------------
  log('\n--- 1. UNAUTHENTICATED REQUESTS (Should all return 401) ---');
  {
    const r1 = await getJson(`${API_BASE}/customers/me`);
    if (r1.status === 401) pass('GET /api/customers/me -> 401');
    else fail('GET /api/customers/me', `Status: ${r1.status}`);

    const r2 = await patchJson(`${API_BASE}/customers/me`, { name: 'Hacker' });
    if (r2.status === 401) pass('PATCH /api/customers/me -> 401');
    else fail('PATCH /api/customers/me', `Status: ${r2.status}`);

    const r3 = await getJson(`${API_BASE}/customers/me/addresses`);
    if (r3.status === 401) pass('GET /api/customers/me/addresses -> 401');
    else fail('GET /api/customers/me/addresses', `Status: ${r3.status}`);

    const r4 = await getJson(`${API_BASE}/customers/me/addresses/${seededAddr1.id}`);
    if (r4.status === 401) pass('GET /api/customers/me/addresses/:id -> 401');
    else fail('GET /api/customers/me/addresses/:id', `Status: ${r4.status}`);

    const r5 = await postJson(`${API_BASE}/customers/me/addresses`, { label: 'Unauth' });
    if (r5.status === 401) pass('POST /api/customers/me/addresses -> 401');
    else fail('POST /api/customers/me/addresses', `Status: ${r5.status}`);

    const r6 = await patchJson(`${API_BASE}/customers/me/addresses/${seededAddr1.id}`, { label: 'Unauth' });
    if (r6.status === 401) pass('PATCH /api/customers/me/addresses/:id -> 401');
    else fail('PATCH /api/customers/me/addresses/:id', `Status: ${r6.status}`);

    const r7 = await deleteJson(`${API_BASE}/customers/me/addresses/${seededAddr1.id}`);
    if (r7.status === 401) pass('DELETE /api/customers/me/addresses/:id -> 401');
    else fail('DELETE /api/customers/me/addresses/:id', `Status: ${r7.status}`);
  }

  // ----------------------------------------------------
  // TEST 2: NON-CUSTOMER USER
  // ----------------------------------------------------
  log('\n--- 2. NON-CUSTOMER USER (Admin & Delivery Staff) ---');
  {
    const adminToken = await login('admin@example.com');
    const rAdminMe = await getJson(`${API_BASE}/customers/me`, adminToken);
    if (rAdminMe.status === 404) pass('Admin GET /api/customers/me -> 404 Not Found');
    else fail('Admin GET /api/customers/me', `Status: ${rAdminMe.status}`);

    const rAdminAddr = await getJson(`${API_BASE}/customers/me/addresses`, adminToken);
    if (rAdminAddr.status === 404) pass('Admin GET /api/customers/me/addresses -> 404 Not Found');
    else fail('Admin GET /api/customers/me/addresses', `Status: ${rAdminAddr.status}`);

    const deliveryToken = await login('delivery@example.com');
    const rDelivMe = await getJson(`${API_BASE}/customers/me`, deliveryToken);
    if (rDelivMe.status === 404) pass('Delivery GET /api/customers/me -> 404 Not Found');
    else fail('Delivery GET /api/customers/me', `Status: ${rDelivMe.status}`);

    // Verify no customer record was created
    const custCountCheck = await pool.query('SELECT COUNT(*)::int AS count FROM customers');
    if (custCountCheck.rows[0].count === 1) pass('Verified no customer record was implicitly created');
    else fail('Implicit customer creation detected', `Count: ${custCountCheck.rows[0].count}`);
  }

  // ----------------------------------------------------
  // TEST 3: CUSTOMER PROFILE (GET & PATCH /api/customers/me)
  // ----------------------------------------------------
  log('\n--- 3. CUSTOMER PROFILE (customer@example.com) ---');
  const custToken = await login('customer@example.com');
  {
    // 3.1 GET Profile
    const meRes = await getJson(`${API_BASE}/customers/me`, custToken);
    if (meRes.status === 200 && meRes.data?.data?.customer) {
      const c = meRes.data.data.customer;
      if (c.email === 'customer@example.com' && !c.password_hash && !c.password) {
        pass('GET /api/customers/me -> 200 (Safe profile returned, no sensitive credentials)');
      } else {
        fail('GET /api/customers/me', `Insecure or wrong data: ${JSON.stringify(c)}`);
      }
    } else {
      fail('GET /api/customers/me', `Status: ${meRes.status}`);
    }

    // 3.2 PATCH Profile - Legitimate update
    const patchRes = await patchJson(`${API_BASE}/customers/me`, {
      name: 'Demo Customer Updated',
      phone: '9988776655',
    }, custToken);

    if (patchRes.status === 200 && patchRes.data?.data?.customer?.name === 'Demo Customer Updated') {
      pass('PATCH /api/customers/me -> 200 (Name and phone updated successfully)');
    } else {
      fail('PATCH /api/customers/me', `Status: ${patchRes.status} ${JSON.stringify(patchRes.data)}`);
    }

    // 3.3 Verify update persisted via GET
    const meVerify = await getJson(`${API_BASE}/customers/me`, custToken);
    if (meVerify.data?.data?.customer?.name === 'Demo Customer Updated' && meVerify.data?.data?.customer?.phone === '9988776655') {
      pass('GET /api/customers/me confirms persisted update');
    } else {
      fail('GET /api/customers/me verification', `Did not match: ${JSON.stringify(meVerify.data)}`);
    }

    // 3.4 Privilege Escalation Attempt: Try to change role to admin
    const roleTamper = await patchJson(`${API_BASE}/customers/me`, { role: 'admin' }, custToken);
    if (roleTamper.status === 400) {
      pass('Attempt to modify role -> 400 Bad Request (Blocked)');
    } else {
      fail('Role tamper status', `Expected 400, got ${roleTamper.status}`);
    }

    // Verify role in database remains 'customer'
    const roleCheck = await pool.query("SELECT role FROM users WHERE email = 'customer@example.com'");
    if (roleCheck.rows[0].role === 'customer') {
      pass("Database confirms user role strictly remains 'customer'");
    } else {
      fail('Privilege Escalation occurred!', `Role is now: ${roleCheck.rows[0].role}`);
    }

    // 3.5 Ownership Tampering: Try to change customer_id or user_id
    const idTamper = await patchJson(`${API_BASE}/customers/me`, {
      customer_id: '99999999-9999-9999-9999-999999999999',
      user_id: '99999999-9999-9999-9999-999999999999',
    }, custToken);
    if (idTamper.status === 400) {
      pass('Attempt to modify customer_id/user_id -> 400 Bad Request (Blocked)');
    } else {
      fail('ID tamper status', `Expected 400, got ${idTamper.status}`);
    }
  }

  // ----------------------------------------------------
  // TEST 4: CUSTOMER ADDRESS CRUD & DEFAULT ADDRESS
  // ----------------------------------------------------
  log('\n--- 4. CUSTOMER ADDRESSES CRUD & DEFAULT ADDRESS LOGIC ---');
  let tempAddrId = null;
  {
    // 4.1 List addresses
    const listRes = await getJson(`${API_BASE}/customers/me/addresses`, custToken);
    if (listRes.status === 200 && Array.isArray(listRes.data?.data) && listRes.data.data.length === 2) {
      pass('GET /api/customers/me/addresses -> 200 (Returns 2 seeded addresses)');
    } else {
      fail('GET /api/customers/me/addresses', `Status: ${listRes.status} count: ${listRes.data?.data?.length}`);
    }

    // 4.2 Get single address by ID
    const singleRes = await getJson(`${API_BASE}/customers/me/addresses/${seededAddr1.id}`, custToken);
    if (singleRes.status === 200 && singleRes.data?.data?.id === seededAddr1.id) {
      pass('GET /api/customers/me/addresses/:id -> 200 (Fetched seeded address 1)');
    } else {
      fail('GET /api/customers/me/addresses/:id', `Status: ${singleRes.status}`);
    }

    // 4.3 Create temporary new address as DEFAULT
    const createRes = await postJson(`${API_BASE}/customers/me/addresses`, {
      label: 'Temporary Vacation Home',
      recipient_name: 'Demo Customer',
      phone: '9876543210',
      address_line1: '789 Beach Road',
      address_line2: 'Villa 10',
      city: 'Alibaug',
      state: 'Maharashtra',
      postal_code: '402201',
      is_default: true,
    }, custToken);

    if (createRes.status === 201 && createRes.data?.data?.id) {
      tempAddrId = createRes.data.data.id;
      pass('POST /api/customers/me/addresses (is_default: true) -> 201 Created');
    } else {
      fail('POST /api/customers/me/addresses', `Status: ${createRes.status} ${JSON.stringify(createRes.data)}`);
    }

    // 4.4 Verify default address atomic rule:
    // Only tempAddrId should be is_default = true; seededAddr1 must have been toggled to false
    const verifyDefaults = await pool.query(
      'SELECT id, is_default FROM customer_addresses WHERE is_default = true'
    );
    if (verifyDefaults.rows.length === 1 && verifyDefaults.rows[0].id === tempAddrId) {
      pass('Atomic default address verified: Previous default unset, new address set as default');
    } else {
      fail('Default address invariant violated!', `Default addresses found: ${JSON.stringify(verifyDefaults.rows)}`);
    }

    // 4.5 Update temporary address
    const patchAddrRes = await patchJson(`${API_BASE}/customers/me/addresses/${tempAddrId}`, {
      address_line2: 'Villa 10B (Updated)',
    }, custToken);

    if (patchAddrRes.status === 200 && patchAddrRes.data?.data?.address_line2 === 'Villa 10B (Updated)') {
      pass('PATCH /api/customers/me/addresses/:id -> 200 (Address updated)');
    } else {
      fail('PATCH /api/customers/me/addresses/:id', `Status: ${patchAddrRes.status}`);
    }

    // 4.6 Restore seededAddr1 as default
    const restoreDefRes = await patchJson(`${API_BASE}/customers/me/addresses/${seededAddr1.id}`, {
      is_default: true,
    }, custToken);
    if (restoreDefRes.status === 200 && restoreDefRes.data?.data?.is_default === true) {
      pass('Restored seeded address 1 as default');
    } else {
      fail('Restoring default address', `Status: ${restoreDefRes.status}`);
    }

    // 4.7 Delete temporary address
    const delRes = await deleteJson(`${API_BASE}/customers/me/addresses/${tempAddrId}`, custToken);
    if (delRes.status === 200 && delRes.data?.success) {
      pass('DELETE /api/customers/me/addresses/:id -> 200 Deleted');
      tempAddrId = null;
    } else {
      fail('DELETE /api/customers/me/addresses/:id', `Status: ${delRes.status}`);
    }

    // Verify deletion in DB
    const countAfterDel = await pool.query('SELECT COUNT(*)::int AS count FROM customer_addresses');
    if (countAfterDel.rows[0].count === 2) {
      pass('Database confirms temporary address was deleted (Address count: 2)');
    } else {
      fail('Address count mismatch after delete', `Count: ${countAfterDel.rows[0].count}`);
    }
  }

  // ----------------------------------------------------
  // TEST 5: MULTI-TENANT CUSTOMER ISOLATION (CUSTOMER A VS CUSTOMER B)
  // ----------------------------------------------------
  log('\n--- 5. MULTI-TENANT CUSTOMER ISOLATION TEST ---');
  let custBUserId = null;
  let custBId = null;
  let custBAddrId = null;
  {
    // 5.1 Register Customer B through public registration
    const regRes = await postJson(`${API_BASE}/auth/register`, {
      name: 'Customer Beta',
      email: 'customer_beta_test@example.com',
      password: 'Password@123',
      phone: '9123456789',
    });

    if (regRes.status === 201 && regRes.data?.data?.user?.id) {
      custBUserId = regRes.data.data.user.id;
      pass('Registered Customer B -> 201');
    } else {
      fail('Register Customer B', `Status: ${regRes.status} ${JSON.stringify(regRes.data)}`);
    }

    // Login as Customer B
    const custBToken = await login('customer_beta_test@example.com', 'Password@123');

    // Create address for Customer B
    const bAddrRes = await postJson(`${API_BASE}/customers/me/addresses`, {
      label: 'Customer B Secret House',
      recipient_name: 'Customer Beta',
      address_line1: '999 Private Lane',
      city: 'Pune',
      state: 'Maharashtra',
      postal_code: '411001',
    }, custBToken);

    if (bAddrRes.status === 201 && bAddrRes.data?.data?.id) {
      custBAddrId = bAddrRes.data.data.id;
      pass('Customer B created address -> 201');
    } else {
      fail('Customer B address creation', `Status: ${bAddrRes.status} ${JSON.stringify(bAddrRes.data)}`);
    }

    // Get Customer B customer record id
    const custBRow = await pool.query('SELECT id FROM customers WHERE user_id = $1', [custBUserId]);
    custBId = custBRow.rows[0].id;

    // 5.2 Attempt Cross-Customer Access using Customer A's token!
    log('  Customer A attempting to access/modify Customer B address:');

    // GET Customer B address as Customer A
    const crossGet = await getJson(`${API_BASE}/customers/me/addresses/${custBAddrId}`, custToken);
    if (crossGet.status === 404) {
      pass('Customer A GET Customer B address -> 404 Not Found (Protected from IDOR)');
    } else {
      fail('Customer A GET Customer B address', `Expected 404, got ${crossGet.status}`);
    }

    // PATCH Customer B address as Customer A
    const crossPatch = await patchJson(`${API_BASE}/customers/me/addresses/${custBAddrId}`, {
      address_line1: 'Hacked by Customer A',
    }, custToken);
    if (crossPatch.status === 404) {
      pass('Customer A PATCH Customer B address -> 404 Not Found (Protected from IDOR)');
    } else {
      fail('Customer A PATCH Customer B address', `Expected 404, got ${crossPatch.status}`);
    }

    // DELETE Customer B address as Customer A
    const crossDelete = await deleteJson(`${API_BASE}/customers/me/addresses/${custBAddrId}`, custToken);
    if (crossDelete.status === 404) {
      pass('Customer A DELETE Customer B address -> 404 Not Found (Protected from IDOR)');
    } else {
      fail('Customer A DELETE Customer B address', `Expected 404, got ${crossDelete.status}`);
    }

    // 5.3 Verify Customer B address remained completely untouched in DB
    const checkBAddr = await pool.query(
      'SELECT address_line1, recipient_name FROM customer_addresses WHERE id = $1',
      [custBAddrId]
    );
    if (checkBAddr.rows.length === 1 && checkBAddr.rows[0].address_line1 === '999 Private Lane') {
      pass('Database confirms Customer B address is completely unmodified');
    } else {
      fail('Customer B address data was tampered with!', JSON.stringify(checkBAddr.rows));
    }

    // Clean up Customer B records
    await pool.query('DELETE FROM customer_addresses WHERE id = $1', [custBAddrId]);
    await pool.query('DELETE FROM customers WHERE id = $1', [custBId]);
    await pool.query('DELETE FROM users WHERE id = $1', [custBUserId]);
    log('  Cleaned up Customer B test records.');
  }

  // ----------------------------------------------------
  // CLEANUP & RESTORE SEEDED CUSTOMER A
  // ----------------------------------------------------
  log('\n--- CLEANING UP & RESTORING SEEDED DATA ---');
  if (tempAddrId) {
    await pool.query('DELETE FROM customer_addresses WHERE id = $1', [tempAddrId]);
  }

  // Restore seeded Customer A profile
  await pool.query(
    "UPDATE users SET name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP WHERE email = 'customer@example.com'",
    [origName, origPhone]
  );
  // Restore seeded address default status
  await pool.query('UPDATE customer_addresses SET is_default = false WHERE id = $1', [seededAddr2.id]);
  await pool.query('UPDATE customer_addresses SET is_default = true WHERE id = $1', [seededAddr1.id]);
  log('  Restored seeded Customer A profile & default address.');

  // ----------------------------------------------------
  // TEST 6: DATABASE INTEGRITY VERIFICATION
  // ----------------------------------------------------
  log('\n--- 6. DATABASE INTEGRITY FINAL COUNTS ---');
  const postUserCount = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  const postCustCount = await pool.query('SELECT COUNT(*)::int AS count FROM customers');
  const postAddrCount = await pool.query('SELECT COUNT(*)::int AS count FROM customer_addresses');

  const finalUsers = postUserCount.rows[0].count;
  const finalCusts = postCustCount.rows[0].count;
  const finalAddrs = postAddrCount.rows[0].count;

  log(`Final counts in DB:`);
  log(`  Users: ${finalUsers} (expected ${baselineUsers})`);
  log(`  Customers: ${finalCusts} (expected ${baselineCusts})`);
  log(`  Customer Addresses: ${finalAddrs} (expected ${baselineAddrs})\n`);

  if (finalUsers === baselineUsers && finalCusts === baselineCusts && finalAddrs === baselineAddrs) {
    pass('Database counts restored exactly to baseline (no contamination)');
  } else {
    fail('Database contamination detected!', `Counts: ${finalUsers}/${finalCusts}/${finalAddrs}`);
  }

  // ----------------------------------------------------
  // TEST 7: REGRESSION TESTS
  // ----------------------------------------------------
  log('\n--- 7. REGRESSION TESTS ---');
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

    const stores = await pool.query('SELECT id FROM stores LIMIT 1');
    const spRes = await getJson(`${API_BASE}/stores/${stores.rows[0].id}/products`);
    if (spRes.status === 200) pass('GET /api/stores/:storeId/products -> 200');
    else fail('GET /api/stores/:storeId/products', `Status: ${spRes.status}`);

    const authMeRes = await getJson(`${API_BASE}/auth/me`, custToken);
    if (authMeRes.status === 200 && authMeRes.data?.data?.user?.email === 'customer@example.com') {
      pass('GET /api/auth/me -> 200');
    } else {
      fail('GET /api/auth/me', `Status: ${authMeRes.status}`);
    }
  }

  log('\n====================================================');
  log('BACKEND MILESTONE 6 TEST SUITE COMPLETED');
  log('====================================================');

  await pool.end();
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  pool.end();
  process.exit(1);
});
