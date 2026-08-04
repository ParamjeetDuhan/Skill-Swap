const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const sessionController = require('../controllers/sessionController');

router.use(auth);

router.post(
  '/',
  [
    body('otherUserId').notEmpty().withMessage('otherUserId is required'),
    body('skill').trim().notEmpty().withMessage('skill is required'),
    body('dateTime').isISO8601().withMessage('Valid dateTime is required'),
    body('role').isIn(['teacher', 'learner']).withMessage('role must be teacher or learner'),
  ],
  validate,
  sessionController.createSession
);

router.get('/', sessionController.getMySessions);
router.get('/:id', sessionController.getSession);
router.put('/:id/propose', sessionController.proposeTime);
router.put('/:id/accept', sessionController.acceptSession);
router.put('/:id/complete', sessionController.completeSession);
router.put('/:id/cancel', sessionController.cancelSession);

module.exports = router;
