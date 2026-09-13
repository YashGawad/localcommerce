const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getStoreProducts,
  getStoreProductById,
  createStoreProduct,
  updateStoreProduct,
} = require('../controllers/storeProductController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireStoreRole } = require('../middleware/storeAuthMiddleware');

// GET /api/stores/:storeId/products - List all products for this store [Public]
router.get('/', getStoreProducts);

// GET /api/stores/:storeId/products/:id - Get specific product for this store [Public]
router.get('/:id', getStoreProductById);

// POST /api/stores/:storeId/products - Create a product listing for this store [Store Owner / Manager]
router.post('/', authenticate, requireStoreRole('owner', 'manager'), createStoreProduct);

// PATCH /api/stores/:storeId/products/:id - Update product listing for this store [Store Owner / Manager]
router.patch('/:id', authenticate, requireStoreRole('owner', 'manager'), updateStoreProduct);

module.exports = router;
