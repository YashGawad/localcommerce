const express = require('express');
const router = express.Router();
const {
  getAllGlobalProducts,
  getGlobalProductById,
  createGlobalProduct,
  updateGlobalProduct,
} = require('../controllers/globalProductController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// GET /api/global-products - List all global products [Public]
router.get('/', getAllGlobalProducts);

// GET /api/global-products/:id - Get global product by UUID [Public]
router.get('/:id', getGlobalProductById);

// POST /api/global-products - Create global product [Platform Admin only]
router.post('/', authenticate, requireRole('admin'), createGlobalProduct);

// PATCH /api/global-products/:id - Update global product [Platform Admin only]
router.patch('/:id', authenticate, requireRole('admin'), updateGlobalProduct);

module.exports = router;
