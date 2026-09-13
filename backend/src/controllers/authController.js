const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Basic email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 * Public registration creates a CUSTOMER account.
 * Automatically creates matching record in customers table within a transaction.
 */
const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  // 1. Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Name is required and cannot be empty.',
    });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password is required and must be at least 6 characters long.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 2. Check if email already exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE lower(email) = lower($1)',
    [normalizedEmail]
  );

  if (existingUser.rows.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email address already exists.',
    });
  }

  // 3. Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // 4. Transaction: insert into users + customers
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Force role to 'customer' — public registration cannot escalate privileges
    const userResult = await client.query(
      `
      INSERT INTO users (
        name, email, password_hash, role, phone, status
      ) VALUES (
        $1, $2, $3, 'customer', $4, 'active'
      )
      RETURNING id, name, email, role, phone, status, created_at, updated_at;
      `,
      [name.trim(), normalizedEmail, passwordHash, phone ? phone.trim() : null]
    );

    const newUser = userResult.rows[0];

    // Create corresponding customer profile record
    await client.query(
      `
      INSERT INTO customers (user_id)
      VALUES ($1);
      `,
      [newUser.id]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          status: newUser.status,
          created_at: newUser.created_at,
          updated_at: newUser.updated_at,
        },
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    console.error('Registration error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again later.',
    });
  } finally {
    client.release();
  }
};

/**
 * POST /api/auth/login
 * Authenticates user credentials, verifies account status, and generates a JWT.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const userResult = await pool.query(
      `
      SELECT id, name, email, password_hash, role, phone, status
      FROM users
      WHERE lower(email) = lower($1);
      `,
      [normalizedEmail]
    );

    // Generic error message if user not found
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = userResult.rows[0];

    // Compare password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify account status
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or suspended.',
      });
    }

    // Query store-specific roles
    const storeRolesResult = await pool.query(
      `
      SELECT store_id, role
      FROM store_users
      WHERE user_id = $1;
      `,
      [user.id]
    );

    // Generate JWT access token
    const jwtSecret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    if (!jwtSecret) {
      console.error('FATAL: JWT_SECRET environment variable is missing.');
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          status: user.status,
          store_roles: storeRolesResult.rows,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Login failed. Please try again later.',
    });
  }
};

/**
 * GET /api/auth/me
 * Protected endpoint returning the currently authenticated user's profile.
 */
const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
