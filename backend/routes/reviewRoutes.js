const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const reviewController = require('../controllers/reviewController');

router.post(
  '/',
  auth,
  [
    body('sessionId').notEmpty().withMessage('sessionId is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
  ],
  validate,
  reviewController.createReview
);

router.get('/user/:userId', reviewController.getUserReviews);

module.exports = router;
