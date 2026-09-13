const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');
const { assignDeliveryOrder } = require('../controllers/deliveryController');
const {
  getOrderPayment,
  mockPaymentSuccess,
  mockPaymentFailure,
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

// POST /api/orders - Create a new order (Authenticated customer)
router.post('/', authenticate, createOrder);

// GET /api/orders - List orders (Filtered by customer/store/admin role)
router.get('/', authenticate, getOrders);

// GET /api/orders/:id - Get order details with items and payment
router.get('/:id', authenticate, getOrderById);

// PATCH /api/orders/:id/status - Update order lifecycle status
router.patch('/:id/status', authenticate, updateOrderStatus);

// POST /api/orders/:orderId/delivery-assignment - Assign delivery staff to delivery order
router.post('/:orderId/delivery-assignment', authenticate, assignDeliveryOrder);

// GET /api/orders/:orderId/payment - Get payment for order
router.get('/:orderId/payment', authenticate, getOrderPayment);

// POST /api/orders/:orderId/payment/pay - Mock payment success
router.post('/:orderId/payment/pay', authenticate, mockPaymentSuccess);

// POST /api/orders/:orderId/payment/fail - Mock payment failure
router.post('/:orderId/payment/fail', authenticate, mockPaymentFailure);

module.exports = router;

