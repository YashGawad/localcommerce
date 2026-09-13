const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
} = require('../controllers/categoryController');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/categories - List all categories (optional ?store_id=...) [Public]
router.get('/', getAllCategories);

// GET /api/categories/:id - Get category by UUID [Public]
router.get('/:id', getCategoryById);

// POST /api/categories - Create category [Store Owner / Manager]
router.post('/', authenticate, createCategory);

// PATCH /api/categories/:id - Update category [Store Owner / Manager for that category's store]
router.patch('/:id', authenticate, updateCategory);

module.exports = router;
