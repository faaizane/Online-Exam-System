// File: routes/subjects.js

const express               = require('express');
const router                = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const subjectController     = require('../controllers/subjectController');

// GET all subjects for this teacher
router.get(
  '/',
  protect,
  authorize('teacher'),
  subjectController.getSubjects
);

// CREATE a new subject
router.post(
  '/',
  protect,
  authorize('teacher'),
  subjectController.createSubject
);

// GET a single subject (so front-end can read its name & semester)
router.get(
  '/:id',
  protect,
  authorize('teacher'),
  subjectController.getSubjectById
);

// GET students for one subject
router.get(
  '/:id/students',
  protect,
  authorize('teacher'),
  subjectController.getSubjectStudents
);

// ADD a single student by registrationNumber
router.post(
  '/:id/students',
  protect,
  authorize('teacher'),
  subjectController.addStudentToSubject
);

// BULK-ADD students by department & semester
router.post(
  '/:id/students/bulk',
  protect,
  authorize('teacher'),
  subjectController.bulkAddStudents
);

// DELETE a student from a subject
router.delete(
  '/:id/students/:studentId',
  protect,
  authorize('teacher'),
  subjectController.removeStudentFromSubject
);

module.exports = router;
