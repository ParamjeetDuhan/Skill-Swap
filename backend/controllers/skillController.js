// Skill controller — add/remove/list skills a user can teach or wants to learn.

const User = require('../models/User');

// @route POST /api/skills/teach
exports.addTeachSkill = async (req, res, next) => {
  try {
    const { name, category, proficiency, description } = req.body;
    const user = await User.findById(req.userId);
    user.skillsToTeach.push({ name, category, proficiency, description });
    await user.save();
    res.status(201).json({ message: 'Skill added', skillsToTeach: user.skillsToTeach });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/skills/learn
exports.addLearnSkill = async (req, res, next) => {
  try {
    const { name, category, proficiency, description } = req.body;
    const user = await User.findById(req.userId);
    user.skillsToLearn.push({ name, category, proficiency, description });
    await user.save();
    res.status(201).json({ message: 'Skill added', skillsToLearn: user.skillsToLearn });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/skills/teach/:skillId
exports.removeTeachSkill = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    user.skillsToTeach = user.skillsToTeach.filter(
      (s) => s._id.toString() !== req.params.skillId
    );
    await user.save();
    res.json({ message: 'Skill removed', skillsToTeach: user.skillsToTeach });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/skills/learn/:skillId
exports.removeLearnSkill = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    user.skillsToLearn = user.skillsToLearn.filter(
      (s) => s._id.toString() !== req.params.skillId
    );
    await user.save();
    res.json({ message: 'Skill removed', skillsToLearn: user.skillsToLearn });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/skills/mine
exports.getMySkills = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      skillsToTeach: user.skillsToTeach,
      skillsToLearn: user.skillsToLearn,
    });
  } catch (err) {
    next(err);
  }
};
