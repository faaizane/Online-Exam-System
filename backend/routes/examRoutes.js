// // This is tested code for handling exam creation and file uploads in a Node.js application.
// // File: backend/controllers/examController.js
// const express = require('express');
// const router = express.Router();
// const examController = require('../controllers/examController');
// // const authMiddleware = require('../middleware/authMiddleware');
// const { protect, authorize } = require('../middleware/authMiddleware');


// // router.post('/create', authMiddleware, examController.createExam);
// // router.post('/upload', authMiddleware, examController.uploadFile);
// router.post('/create', protect, authorize('teacher'), examController.createExam);

// router.post('/upload', protect, authorize('teacher'), examController.uploadFile);

// module.exports = router;

// this is new code for handling exam creation and file uploads in a Node.js application.
// backend/routes/examRoutes.js
const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create', protect, authorize('teacher'), examController.createExam);
router.post('/upload', protect, authorize('teacher'), examController.uploadFile);

// New routes:
router.get('/grouped', protect, authorize('teacher'), examController.getGroupedExams);
router.get('/filtered', protect, authorize('teacher'), examController.getExamsByFilter);

// Get exam by ID
router.get('/:id', protect, authorize('teacher'), examController.getExamById);

// Update exam by ID
router.put('/:id', protect, authorize('teacher'), examController.updateExamById);


module.exports = router;
