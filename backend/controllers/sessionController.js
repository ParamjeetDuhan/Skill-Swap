// Session controller — booking requests, accepting/proposing time slots,
// marking sessions complete/cancelled, and listing a user's sessions.

const Session = require('../models/Session');
const User = require('../models/User');

// @route POST /api/sessions
// Body: { otherUserId, skill, dateTime, duration, notes, role } role = 'teacher' | 'learner'
// role indicates whether the CURRENT user will be the teacher or learner for this skill.
exports.createSession = async (req, res, next) => {
  try {
    const { otherUserId, skill, dateTime, duration, notes, role } = req.body;

    if (otherUserId === req.userId) {
      return res.status(400).json({ message: 'You cannot book a session with yourself' });
    }

    const otherUser = await User.findById(otherUserId);
    if (!otherUser) return res.status(404).json({ message: 'Other user not found' });

    const teacher = role === 'teacher' ? req.userId : otherUserId;
    const learner = role === 'teacher' ? otherUserId : req.userId;

    const session = await Session.create({
      teacher,
      learner,
      skill,
      dateTime,
      duration: duration || 60,
      notes: notes || '',
      proposedBy: req.userId,
      status: 'pending',
    });

    res.status(201).json({ message: 'Session request created', session });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/sessions
// Query: ?status=upcoming|past|pending etc.
exports.getMySessions = async (req, res, next) => {
  try {
    const filter = {
      $or: [{ teacher: req.userId }, { learner: req.userId }],
    };

    const sessions = await Session.find(filter)
      .populate('teacher', 'name profilePic avgRating')
      .populate('learner', 'name profilePic avgRating')
      .sort({ dateTime: 1 });

    res.json({ count: sessions.length, sessions });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/sessions/:id
exports.getSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('teacher', 'name profilePic avgRating')
      .populate('learner', 'name profilePic avgRating');

    if (!session) return res.status(404).json({ message: 'Session not found' });

    assertParticipant(session, req.userId);

    res.json({ session });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/sessions/:id/propose
// Lets a participant propose a new date/time; flips status back to pending for the other party.
exports.proposeTime = async (req, res, next) => {
  try {
    const { dateTime, duration } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    assertParticipant(session, req.userId);

    session.dateTime = dateTime || session.dateTime;
    if (duration) session.duration = duration;
    session.proposedBy = req.userId;
    session.status = 'pending';
    await session.save();

    res.json({ message: 'New time proposed', session });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/sessions/:id/accept
exports.acceptSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    assertParticipant(session, req.userId);

    if (session.proposedBy.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot accept your own proposal' });
    }

    session.status = 'accepted';
    await session.save();

    res.json({ message: 'Session accepted', session });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/sessions/:id/complete
exports.completeSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    assertParticipant(session, req.userId);

    session.status = 'completed';
    await session.save();

    res.json({ message: 'Session marked as completed', session });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/sessions/:id/cancel
exports.cancelSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    assertParticipant(session, req.userId);

    session.status = 'cancelled';
    await session.save();

    res.json({ message: 'Session cancelled', session });
  } catch (err) {
    next(err);
  }
};

function assertParticipant(session, userId) {
  const isParticipant =
    session.teacher.toString() === userId || session.learner.toString() === userId;
  if (!isParticipant) {
    const err = new Error('Not authorized to access this session');
    err.statusCode = 403;
    throw err;
  }
}
