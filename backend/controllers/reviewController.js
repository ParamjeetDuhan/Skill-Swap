// Review controller — create a review after a session is completed, and
// recompute the reviewee's average rating.

const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');

// @route POST /api/reviews
// Body: { sessionId, rating, comment }
exports.createReview = async (req, res, next) => {
  try {
    const { sessionId, rating, comment } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review completed sessions' });
    }

    const teacherId = session.teacher.toString();
    const learnerId = session.learner.toString();

    if (req.userId !== teacherId && req.userId !== learnerId) {
      return res.status(403).json({ message: 'Not authorized to review this session' });
    }

    const revieweeId = req.userId === teacherId ? learnerId : teacherId;

    const review = await Review.create({
      session: sessionId,
      reviewer: req.userId,
      reviewee: revieweeId,
      rating,
      comment: comment || '',
    });

    // Recompute average rating for the reviewee
    const stats = await Review.aggregate([
      { $match: { reviewee: review.reviewee } },
      { $group: { _id: '$reviewee', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(revieweeId, {
        avgRating: Math.round(stats[0].avg * 10) / 10,
        ratingCount: stats[0].count,
      });
    }

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You already reviewed this session' });
    }
    next(err);
  }
};

// @route GET /api/reviews/user/:userId
exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name profilePic')
      .sort({ createdAt: -1 });

    res.json({ count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
};
