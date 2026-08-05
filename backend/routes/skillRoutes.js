const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const skillController = require('../controllers/skillController');

const skillValidation = [
  body('name').trim().notEmpty().withMessage('Skill name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('proficiency')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .withMessage('Invalid proficiency level'),
];

router.use(auth); // all skill routes require authentication

router.get('/mine', skillController.getMySkills);
router.post('/teach', skillValidation, validate, skillController.addTeachSkill);
router.post('/learn', skillValidation, validate, skillController.addLearnSkill);
router.delete('/teach/:skillId', skillController.removeTeachSkill);
router.delete('/learn/:skillId', skillController.removeLearnSkill);

module.exports = router;
