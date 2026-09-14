const express = require('express');
const router = express.Router();
const { register, registerBusiness, login, getCurrentUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// POST /api/auth/register - Register a new customer
router.post('/register', register);

// POST /api/auth/business/register - Register a new business owner and initial store
router.post('/business/register', registerBusiness);

// POST /api/auth/login - Login user
router.post('/login', login);

// GET /api/auth/me - Retrieve current authenticated user profile
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
