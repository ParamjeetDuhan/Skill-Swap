// Runs after express-validator's check(...) chains; collects any validation
// errors and returns a 400 response instead of letting the request continue.

const { validationResult } = require('express-validator');

module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};
