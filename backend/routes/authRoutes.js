// const express = require('express');
// const { login } = require('../controllers/authController');
// const router = express.Router();

// // POST /api/auth/login
// router.post('/login', login);

// module.exports = router;

const express = require('express');
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public: login
router.post('/login', login);

// Protected: get current user
router.get('/me', protect, getMe);

module.exports = router;
