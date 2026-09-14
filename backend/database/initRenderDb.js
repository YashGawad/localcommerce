/**
 * LocalCommerce Production Database Initializer (Render)
 * 
 * Safely applies:
 * 1. backend/database/schema.sql (creates 19 tables, constraints, indexes)
 * 2. backend/database/seed_production.sql (seeds subscription plans, stores, catalog, users)
 * 
 * Safety guards:
 * - Requires explicit target DATABASE_URL (must not default to localhost)
 * - Supports optional --reset flag to truncate all tables before seeding
 * - Executes seeding inside an explicit transaction (BEGIN ... COMMIT) with automatic rollback on error
 * - Validates schema and exact expected row counts after execution
 * - Does not alter local database
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const EXPECTED_COUNTS = {
  catalog: {
    subscription_plans: 4,
    platform_settings: 4,
    users: 6,
    stores: 3,
    store_users: 6,
    store_settings: 3,
    store_subscriptions: 2,
    categories: 5,
    global_products: 4,
    store_products: 9,
    discounts: 2,
  },
  transactional: {
    orders: 0,
    order_items: 0,
    payments: 0,
    delivery_assignments: 0,
    reviews: 0,
    customers: 0,
    customer_addresses: 0,
    notifications: 0,
  }
};

async function initializeRenderDatabase(targetConnectionString, shouldReset = false) {
  const connectionString = targetConnectionString || process.env.RENDER_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('ERROR: No connection string provided.');
    console.error('Usage: node backend/database/initRenderDb.js [--reset] "<RENDER_EXTERNAL_DATABASE_URL>"');
    console.error('   or: $env:RENDER_DATABASE_URL="..."; node backend/database/initRenderDb.js [--reset]');
    process.exit(1);
  }

  if (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) {
    console.error('SAFETY BLOCK: Target connection string points to localhost/127.0.0.1. Aborting to protect local database.');
    process.exit(1);
  }

  console.log('Connecting to target production database on Render...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Render external connections
  });

  try {
    await client.connect();
    console.log('Connected successfully to Render PostgreSQL database.');

    // 1. Read SQL files
    const schemaSqlPath = path.join(__dirname, 'schema.sql');
    const seedSqlPath = path.join(__dirname, 'seed_production.sql');

    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');

    // 2. Execute Schema DDL
    console.log('Applying 19-table schema...');
    await client.query(schemaSql);
    console.log('Schema DDL applied successfully.');

    // 3. Optional clean reset
    if (shouldReset) {
      console.log('Reset requested: Truncating all 19 tables cascade...');
      const allTables = [
        ...Object.keys(EXPECTED_COUNTS.catalog),
        ...Object.keys(EXPECTED_COUNTS.transactional)
      ];
      await client.query(`TRUNCATE TABLE ${allTables.map(t => `public."${t}"`).join(', ')} CASCADE;`);
      console.log('Tables truncated successfully.');
    }

    // 4. Execute Production Catalog Seed inside an explicit transaction
    console.log('Seeding initial production catalog data in transaction...');
    await client.query('BEGIN');
    try {
      await client.query(seedSql);
      await client.query('COMMIT');
      console.log('Production catalog seeded successfully.');
    } catch (seedErr) {
      await client.query('ROLLBACK');
      console.error('Error during seeding, transaction rolled back.');
      throw seedErr;
    }

    // 5. Verify 19 tables exist
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(`\nVerified ${tables.length} tables in public schema:`);
    console.log(tables.join(', '));

    // 6. Verify transactional tables are strictly clean (0 rows)
    let hasVerificationError = false;
    console.log('\nVerifying transactional/test tables are clean (Expected: 0):');
    for (const [table, expected] of Object.entries(EXPECTED_COUNTS.transactional)) {
      const countRes = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
      const actual = countRes.rows[0].count;
      const pass = actual === expected;
      if (!pass) hasVerificationError = true;
      console.log(`- ${table}: ${actual} rows [${pass ? 'PASS' : 'FAIL - Expected ' + expected}]`);
    }

    // 7. Verify catalog tables have exact expected seed records
    console.log('\nVerifying catalog seed row counts:');
    for (const [table, expected] of Object.entries(EXPECTED_COUNTS.catalog)) {
      const countRes = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
      const actual = countRes.rows[0].count;
      const pass = actual === expected;
      if (!pass) hasVerificationError = true;
      console.log(`- ${table}: ${actual} rows [${pass ? 'PASS' : 'FAIL - Expected ' + expected}]`);
    }

    if (hasVerificationError) {
      console.warn('\nWARNING: Some table counts did not match the exact expected numbers.');
    } else {
      console.log('\nALL CHECKS PASSED: Production database setup verified successfully and safely!');
    }
  } catch (error) {
    console.error('Fatal error during production database initialization:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const shouldReset = args.includes('--reset');
  const urlArg = args.find(a => a !== '--reset');
  initializeRenderDatabase(urlArg, shouldReset);
}

module.exports = initializeRenderDatabase;
