// Session model
// Represents a booked (or proposed) skill-swap session between a teacher and learner.

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: String, required: true, trim: true }, // skill name being taught

    dateTime: { type: Date, required: true }, // proposed/confirmed date & time
    duration: { type: Number, required: true, default: 60 }, // minutes

    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
    },

    // Whoever proposed the current dateTime, so the other party knows they need to accept it
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    notes: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

sessionSchema.index({ teacher: 1, status: 1 });
sessionSchema.index({ learner: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
