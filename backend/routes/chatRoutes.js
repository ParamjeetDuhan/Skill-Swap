const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const chatController = require('../controllers/chatController');

router.use(auth);

router.get('/', chatController.getMyChats);
router.get('/with/:otherUserId', chatController.getOrCreateChat);
router.post(
  '/:chatId/messages',
  [body('text').trim().notEmpty().withMessage('Message text is required')],
  validate,
  chatController.sendMessage
);

module.exports = router;
