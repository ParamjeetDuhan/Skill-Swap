// Match controller — returns a ranked list of compatible peers for the
// logged-in user using the matching algorithm in utils/matching.js.

const User = require('../models/User');
const { findMatches } = require('../utils/matching');

// @route GET /api/matches
exports.getMatches = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // Only fetch users who have at least one skill in either list, to keep this cheap.
    const others = await User.find({
      _id: { $ne: currentUser._id },
      $or: [
        { 'skillsToTeach.0': { $exists: true } },
        { 'skillsToLearn.0': { $exists: true } },
      ],
    });

    const matches = findMatches(currentUser, others);
    res.json({ count: matches.length, matches });
  } catch (err) {
    next(err);
  }
};
