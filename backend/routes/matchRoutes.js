const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const matchController = require('../controllers/matchController');

router.get('/', auth, matchController.getMatches);

module.exports = router;
