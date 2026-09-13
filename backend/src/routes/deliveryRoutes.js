const express = require('express');
const router = express.Router();
const {
  getDeliveryAssignments,
  getDeliveryAssignmentById,
  updateDeliveryAssignmentStatus,
} = require('../controllers/deliveryController');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/delivery/assignments - List delivery assignments
router.get('/assignments', authenticate, getDeliveryAssignments);

// GET /api/delivery/assignments/:id - Delivery assignment details
router.get('/assignments/:id', authenticate, getDeliveryAssignmentById);

// PATCH /api/delivery/assignments/:id/status - Update delivery assignment status
router.patch('/assignments/:id/status', authenticate, updateDeliveryAssignmentStatus);

module.exports = router;
