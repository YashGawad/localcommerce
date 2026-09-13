const express = require('express');
const router = express.Router();
const {
  createReview,
  getAllReviews,
  getReviewById,
} = require('../controllers/reviewController');
const { authenticate, optionalAuthenticate } = require('../middleware/authMiddleware');

// POST /api/reviews - Create review for a store or global product [Authenticated Customer]
router.post('/', authenticate, createReview);

// GET /api/reviews - List reviews with optional filtering [Public / Admin]
router.get('/', optionalAuthenticate, getAllReviews);

// GET /api/reviews/:id - Get single review by ID [Public / Authenticated]
router.get('/:id', optionalAuthenticate, getReviewById);

module.exports = router;
