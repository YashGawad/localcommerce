require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const storeRoutes = require('./routes/storeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const globalProductRoutes = require('./routes/globalProductRoutes');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable middleware
app.use(cors());
app.use(express.json());

// Health check route: verifies API and PostgreSQL connectivity
app.get('/api/health', async (req, res) => {
  try {
    // Run a simple test query to verify PostgreSQL communication
    await pool.query('SELECT 1');
    return res.status(200).json({
      success: true,
      message: 'LocalCommerce API is healthy',
      database: 'connected',
    });
  } catch (error) {
    console.error('Database connection check failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'LocalCommerce API is running, but database connection failed',
      database: 'disconnected',
      error: 'Unable to connect to the database',
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/global-products', globalProductRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`LocalCommerce API running on port ${PORT}`);
});

// Explicit error listener to handle port conflicts (EADDRINUSE) cleanly
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Error: Port ${PORT} is already in use by another process.`);
  } else {
    console.error('Server error:', error.message);
  }
  process.exit(1);
});

// Graceful shutdown handling for cloud orchestrators (Render) and local termination
const handleShutdown = (signal) => {
  console.log(`${signal} signal received: closing HTTP server gracefully`);
  server.close(() => {
    console.log('HTTP server closed.');
    pool.end().then(() => {
      console.log('PostgreSQL pool closed.');
      process.exit(0);
    }).catch(() => process.exit(0));
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = server;
