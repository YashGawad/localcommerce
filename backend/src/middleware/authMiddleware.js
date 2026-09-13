const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Authentication Middleware
 * Validates the JWT Bearer token and attaches the authenticated user to req.user
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Missing or malformed authorization header.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is missing.',
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('FATAL: JWT_SECRET is not configured in environment.');
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
      });
    }

    const decoded = jwt.verify(token, jwtSecret);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
      });
    }

    // Load user identity from PostgreSQL
    const userResult = await pool.query(
      `
      SELECT id, name, email, role, phone, status, created_at, updated_at
      FROM users
      WHERE id = $1;
      `,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const user = userResult.rows[0];

    // Check account status
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or suspended.',
      });
    }

    // Query store-specific roles from store_users
    const storeRolesResult = await pool.query(
      `
      SELECT store_id, role
      FROM store_users
      WHERE user_id = $1;
      `,
      [user.id]
    );

    // Attach safe user profile to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
      store_roles: storeRolesResult.rows,
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    console.error('Authentication middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server authentication error.',
    });
  }
};

module.exports = {
  authenticate,
};
