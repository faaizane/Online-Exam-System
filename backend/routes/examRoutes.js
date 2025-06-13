// File: routes/examRoutes.js
const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Teacher-only endpoints
router.post(
  '/create',
  protect,
  authorize('teacher'),
  examController.createExam
);
router.post(
  '/upload',
  protect,
  authorize('teacher'),
  examController.uploadFile
);

router.get(
  '/grouped',
  protect,
  authorize('teacher'),
  examController.getGroupedExams
);
router.get(
  '/filtered',
  protect,
  authorize('teacher'),
  examController.getExamsByFilter
);
router.get(
  '/recent',
  protect,
  authorize('teacher'),
  examController.getRecentExams
);

// Student-only: list only exams assigned to this student
router.get(
  '/available',
  protect,
  authorize('student'),
  examController.getAvailableExams
);

// Teacher-only per-exam routes (parameterized)
// must come *after* any fixed paths like '/available'
router.get(
  '/:id',
  protect,
  authorize('teacher'),
  examController.getExamById
);
router.put(
  '/:id',
  protect,
  authorize('teacher'),
  examController.updateExamById
);
router.delete(
  '/:id',
  protect,
  authorize('teacher'),
  examController.deleteExamById
);

module.exports = router;
