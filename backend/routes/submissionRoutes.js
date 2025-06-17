// backend/routes/submissionRoutes.js
// Student-only submission routes (JWT `protect` + role-based `authorize('student')`)

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const submissionController = require('../controllers/submissionController');

// List all submissions for the logged-in student
router.get('/api/submissions', protect, authorize('student'), submissionController.list);

// 2) NEW: latest N results  ➜ place BEFORE `/:id`
router.get('/api/submissions/recent', protect, authorize('student'), submissionController.recent);

// Get one submission by its ID
router.get('/api/submissions/:id', protect, authorize('student'), submissionController.detail);

// Get submissions for a specific subject
router.get('/api/submissions/subject/:subjectId', protect, authorize('student'), submissionController.bySubject);


module.exports = router;
