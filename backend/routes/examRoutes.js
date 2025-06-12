// File: routes/examRoutes.js
const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create', protect, authorize('teacher'), examController.createExam);
router.post('/upload', protect, authorize('teacher'), examController.uploadFile);

// Now uses `session` query param instead of `season`
router.get('/grouped', protect, authorize('teacher'), examController.getGroupedExams);
router.get('/filtered', protect, authorize('teacher'), examController.getExamsByFilter);

// Add just after your other GETs:
router.get(
  '/recent',
  protect,
  authorize('teacher'),
  examController.getRecentExams
);


router.get('/:id', protect, authorize('teacher'), examController.getExamById);
router.put('/:id', protect, authorize('teacher'), examController.updateExamById);

// DELETE /api/exams/:id
router.delete(
  '/:id',
  protect,
  authorize('teacher'),
  examController.deleteExamById
);


module.exports = router;
