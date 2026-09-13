const express = require('express');
const router = express.Router();
const { getPaymentById } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/payments/:id - Get payment details by ID (authorization-scoped)
router.get('/:id', authenticate, getPaymentById);

module.exports = router;
