const express = require('express');
const router = express.Router();
const {
  getAllStores,
  getStoreById,
  getStoreBySlug,
  createStore,
  updateStore,
} = require('../controllers/storeController');
const storeProductRoutes = require('./storeProductRoutes');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { requireStoreRole } = require('../middleware/storeAuthMiddleware');

// Mount nested store product routes: /api/stores/:storeId/products
router.use('/:storeId/products', storeProductRoutes);

// GET /api/stores - List all stores [Public]
router.get('/', getAllStores);

// GET /api/stores/slug/:slug - Get store by unique slug [Public]
router.get('/slug/:slug', getStoreBySlug);

// GET /api/stores/:id - Get store by UUID [Public]
router.get('/:id', getStoreById);

// POST /api/stores - Create a new store [Business Owner / Admin]
router.post('/', authenticate, requireRole('business_owner', 'admin'), createStore);

// PATCH /api/stores/:id - Update an existing store by UUID [Store Owner / Manager / Platform Admin]
router.patch('/:id', authenticate, requireStoreRole('owner', 'manager', { allowAdmin: true }), updateStore);

module.exports = router;
