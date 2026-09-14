const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool using environment variables
// Supports both DATABASE_URL (Render, Heroku, Supabase) and individual DB_* variables
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'localcommerce',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    };

const pool = new Pool(poolConfig);

// Log any unexpected errors on idle clients in the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

module.exports = pool;
