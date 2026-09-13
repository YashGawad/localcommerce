const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'localcommerce',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// Log any unexpected errors on idle clients in the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

module.exports = pool;
