// File: backend/controllers/submissionController.js
const Submission = require('../models/Submission');
const Cheat = require('../models/CheatClip');

/**
 * GET /api/submissions
 * List all submissions for the logged-in student, grouped by year–session.
 */
exports.list = async (req, res) => {
  try {
    const subs = await Submission.find({ student: req.user.id })
      .populate({
        path: 'exam',
        select: 'year session subject',
        populate: { path: 'subject', select: 'name' }
      })
      .lean();

    const valid = subs.filter(s => s.exam && s.exam.subject);

    const grouped = {};
    valid.forEach(s => {
      const key = `${s.exam.year}-${s.exam.session}`;
      if (!grouped[key]) {
        grouped[key] = {
          year: s.exam.year,
          session: s.exam.session,
          items: []
        };
      }
      grouped[key].items.push({
        submissionId: s._id,
        subject: s.exam.subject.name,
        subjectId: s.exam.subject._id,
        marks: s.score
      });
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error('submissionController.list:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/submissions/:id
 * Return one submission’s detail, including questions, selected answers, and correct options.
 */
exports.detail = async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id)
      .populate({
        path: 'exam',
        populate: { path: 'subject', select: 'name' }
      })
      .lean();

    if (!sub || !sub.exam || !sub.exam.subject) {
      return res.status(404).json({ message: 'Submission or related exam not found' });
    }

    const detailedAnswers = sub.exam.questions.map((q, idx) => ({
      questionText: q.questionText,
      options: q.options,
      selectedIdx: sub.answers[idx],
      correctIdx: q.correctAnswerIndex
    }));

    res.json({
      exam: {
        _id: sub.exam._id,
        subjectName: sub.exam.subject.name,
        examNo: sub.exam.examNo,
        year: sub.exam.year,
        session: sub.exam.session
      },
      detailedAnswers,
      score: sub.score,
      takenAt: sub.createdAt
    });
  } catch (err) {
    console.error('submissionController.detail:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/submissions/subject/:subjectId
 * List all the logged-in student’s submissions for one subject.
 */
exports.bySubject = async (req, res) => {
  try {
    const subs = await Submission.find({ student: req.user.id })
      .populate({
        path: 'exam',
        select: 'examNo year session subject',
        populate: { path: 'subject', select: 'name' }
      })
      .lean();

    const valid = subs.filter(s => s.exam && s.exam.subject);
    const filtered = valid.filter(
      s => s.exam.subject._id.toString() === req.params.subjectId
    );

    const results = filtered.map(s => ({
      submissionId: s._id,
      subjectName: s.exam.subject.name,
      examNo: s.exam.examNo,
      semester: s.exam.session,
      date: s.createdAt,
      marks: s.score
    }));

    res.json(results);
  } catch (err) {
    console.error('submissionController.bySubject:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/submissions/recent?limit=5
 * Returns latest submissions for dashboard.
 */
exports.recent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const subs = await Submission.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: 'exam',
        select: 'examNo semester session subject',
        populate: { path: 'subject', select: 'name' }
      })
      .lean();

    const valid = subs.filter(s => s.exam && s.exam.subject);

    const results = valid.map(s => ({
      submissionId: s._id,
      subjectName: s.exam.subject.name,
      examNo: s.exam.examNo,
      semester: s.exam.semester,
      date: s.createdAt,
      marks: s.score
    }));

    res.json(results);
  } catch (err) {
    console.error('submissionController.recent:', err);
    res.status(500).json({ message: 'Server error fetching recent results' });
  }
};

/**
 * GET /api/exams/:examId/results (Teacher only)
 * List all student submissions for a specific exam.
 */
// exports.resultsByExam = async (req, res) => {
//   try {
//     const examId = req.params.examId;

//     const subs = await Submission.find({ exam: examId })
//       .populate({
//         path: 'student',
//         select: 'name registrationNumber'
//       })
//       .lean();

//     const results = subs.map(s => ({
//       submissionId: s._id,
//       studentName: s.student.name,
//       registrationNumber: s.student.registrationNumber,
//       marks: s.score,
//       flagged: s.flagged || false
//     }));

//     res.json(results);
//   } catch (err) {
//     console.error('resultsByExam error:', err);
//     res.status(500).json({ message: 'Server error fetching results' });
//   }
// };


exports.resultsByExam = async (req, res) => {
  try {
    const examId = req.params.examId;

    const submissions = await Submission.find({ exam: examId })
      .populate('student', 'name registrationNumber')
      .lean();

    const cheats = await Cheat.find({ exam: examId })
      .populate('student', 'name registrationNumber')
      .lean();

    const result = submissions.map(sub => {
      const cheat = cheats.find(
        c => c.student._id.toString() === sub.student._id.toString()
      );

      return {
        submissionId: sub._id,
        studentName: sub.student.name,
        registrationNumber: sub.student.registrationNumber,
        marks: sub.score,
        flagged: !!cheat,
        reason: cheat ? cheat.reason : '',
        videoId: cheat ? cheat._id : null,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('resultsByExam error:', err);
    res.status(500).json({ message: 'Server error fetching results' });
  }
};