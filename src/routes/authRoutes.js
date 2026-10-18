const express = require('express');

const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Rate limiting applies only to the credential endpoints.
// /me is called on every page load, so it must not be limited.
router.post('/register', authLimiter, register);

router.post('/login', authLimiter, login);

router.get('/me', protect, me);

module.exports = router;
