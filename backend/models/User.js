// User model
// Stores auth info, profile info, skills the user can teach/wants to learn,
// and aggregated rating info.

const mongoose = require('mongoose');

const skillSubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner',
    },
    description: { type: String, trim: true, default: '' },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false }, // hashed
    bio: { type: String, default: '', maxlength: 500 },
    profilePic: { type: String, default: '' }, // URL or path to uploaded image

    skillsToTeach: [skillSubSchema],
    skillsToLearn: [skillSubSchema],

    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

// Index for faster matching queries on skill names
userSchema.index({ 'skillsToTeach.name': 1 });
userSchema.index({ 'skillsToLearn.name': 1 });

module.exports = mongoose.model('User', userSchema);
