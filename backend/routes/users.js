// File: routes/users.js
const express               = require('express');
const router                = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const userController        = require('../controllers/userController');

router.get(
  '/departments',
  protect,
  authorize('teacher'),
  userController.getDepartments
);

router.get(
  '/semesters',
  protect,
  authorize('teacher'),
  userController.getSemesters
);

module.exports = router;
