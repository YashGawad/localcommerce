const express = require('express');
const router = express.Router();
const {
  getUsers,
  getSubscriptions,
  getPlatformSettings,
  updatePlatformSetting,
  getNotifications,
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All admin routes strictly require authenticated platform admin
router.use(authenticate);
router.use(requireRole('admin'));

// GET /api/admin/users
router.get('/users', getUsers);

// GET /api/admin/subscriptions
router.get('/subscriptions', getSubscriptions);

// GET /api/admin/platform-settings
router.get('/platform-settings', getPlatformSettings);

// PATCH /api/admin/platform-settings/:key
router.patch('/platform-settings/:key', updatePlatformSetting);

// GET /api/admin/notifications
router.get('/notifications', getNotifications);

module.exports = router;
