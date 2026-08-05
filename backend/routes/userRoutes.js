const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route GET /api/users/:id — view another user's public profile
router.get('/:id', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name bio profilePic skillsToTeach skillsToLearn avgRating ratingCount createdAt'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/users — browse all users (simple directory, paginated)
router.get('/', auth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const users = await User.find({ _id: { $ne: req.userId } })
      .select('name bio profilePic skillsToTeach skillsToLearn avgRating')
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ page, count: users.length, users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
