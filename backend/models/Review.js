// Review model
// Created after a session is marked "completed" — both participants can leave one review each.

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

// Prevent the same reviewer from reviewing the same session twice
reviewSchema.index({ session: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
