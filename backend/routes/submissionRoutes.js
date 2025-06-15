// backend/routes/submissionRoutes.js
const express             = require('express');
const { protect }         = require('../middleware/authMiddleware');
const submissionController = require('../controllers/submissionController');
const router              = express.Router();

// Student-only: list and detail
router.get('/api/submissions',        protect, submissionController.list);
router.get('/api/submissions/:id',    protect, submissionController.detail);
// GET /api/submissions/subject/:subjectId
router.get(
  '/api/submissions/subject/:subjectId',
  protect,
  submissionController.bySubject
);


module.exports = router;
