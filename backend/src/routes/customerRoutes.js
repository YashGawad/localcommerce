const express = require('express');
const router = express.Router();
const {
  getCustomerProfile,
  updateCustomerProfile,
} = require('../controllers/customerController');
const {
  getCustomerAddresses,
  getCustomerAddressById,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
} = require('../controllers/addressController');
const { authenticate } = require('../middleware/authMiddleware');

// Customer Profile Routes
// GET /api/customers/me - View authenticated customer profile
router.get('/me', authenticate, getCustomerProfile);

// PATCH /api/customers/me - Update authenticated customer profile
router.patch('/me', authenticate, updateCustomerProfile);

// Customer Address Routes
// GET /api/customers/me/addresses - List all addresses for authenticated customer
router.get('/me/addresses', authenticate, getCustomerAddresses);

// GET /api/customers/me/addresses/:id - Get specific address by ID
router.get('/me/addresses/:id', authenticate, getCustomerAddressById);

// POST /api/customers/me/addresses - Create new address
router.post('/me/addresses', authenticate, createCustomerAddress);

// PATCH /api/customers/me/addresses/:id - Update address
router.patch('/me/addresses/:id', authenticate, updateCustomerAddress);

// DELETE /api/customers/me/addresses/:id - Delete address
router.delete('/me/addresses/:id', authenticate, deleteCustomerAddress);

module.exports = router;
