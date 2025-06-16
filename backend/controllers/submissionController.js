// backend/controllers/submissionController.js
const Submission = require('../models/Submission');

/**
 * GET /api/submissions
 * List all submissions for the logged-in student,
 * grouped by year–session.
 */
exports.list = async (req, res) => {
  const subs = await Submission
    .find({ student: req.user.id })
    .populate({
      path: 'exam',
      select: 'year session subject',
      populate: { path: 'subject', select: 'name' }
    })
    .lean();

  const grouped = {};
  subs.forEach(s => {
    const key = `${s.exam.year}-${s.exam.session}`;
    if (!grouped[key]) {
      grouped[key] = {
        year:    s.exam.year,
        session: s.exam.session,
        items:   []
      };
    }
    grouped[key].items.push({
      submissionId: s._id,
      subject:      s.exam.subject.name,
      subjectId:   s.exam.subject._id,
      marks:        s.score
    });
  });

  res.json(Object.values(grouped));
};

/**
 * GET /api/submissions/:id
 * Return one submission’s detail, including questions,
 * selected answers, and correct options.
 */
exports.detail = async (req, res) => {
  try {
    // 1) Load the submission + its exam (with subject name)
    const sub = await Submission
      .findById(req.params.id)
      .populate({
        path: 'exam',
        populate: { path: 'subject', select: 'name' }
      })
      .lean();
    if (!sub) return res.status(404).json({ message: 'Not found' });

    // 2) Merge exam.questions (embedded) with sub.answers (indices)
    const detailedAnswers = sub.exam.questions.map((q, idx) => ({
      questionText: q.questionText,
      options:      q.options,
      selectedIdx:  sub.answers[idx],
      correctIdx:   q.correctAnswerIndex
    }));

    // 3) Return everything the frontend needs
    return res.json({
      exam:            { 
        _id: sub.exam._id,
        subjectName: sub.exam.subject.name,
        examNo:      sub.exam.examNo,
        year:        sub.exam.year,
        session:     sub.exam.session
      },
      detailedAnswers,    // array of {questionText, options, selectedIdx, correctIdx}
      score:           sub.score,
      takenAt:         sub.createdAt
    });
  } catch (err) {
    console.error('submissionController.detail:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};




/**
 * GET /api/submissions/subject/:subjectId
 * List all the logged-in student’s submissions for one subject,
 * with examNo, semester, date, marks and submissionId.
 */
exports.bySubject = async (req, res) => {
  try {
    const subs = await Submission
      .find({ student: req.user.id })
      .populate({
        path: 'exam',
        select: 'examNo year session subject',
        populate: { path: 'subject', select: 'name' }
      })
      .lean();

    // filter to only this subject
    const filtered = subs.filter(s =>
      s.exam.subject._id.toString() === req.params.subjectId
    );

    const results = filtered.map(s => ({
      submissionId: s._id,
      subjectName:  s.exam.subject.name,  // ← added
      examNo:       s.exam.examNo,
      semester:     s.exam.session,
      date:         s.createdAt,
      marks:        s.score
    }));

    return res.json(results);
  } catch (err) {
    console.error('submissionController.bySubject:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/submissions/recent?limit=5
exports.recent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;   // default 5

    const subs = await Submission.find({ student: req.user.id })
      .sort({ createdAt: -1 })          // newest first
      .limit(limit)
      .populate({
        path: 'exam',
        select: 'examNo semester session subject',
        populate: { path: 'subject', select: 'name' }
      })
      .lean();

    const results = subs.map(s => ({
      submissionId: s._id,
      subjectName : s.exam.subject.name,
      examNo      : s.exam.examNo,
      semester    : s.exam.semester,
      date        : s.createdAt,
      marks       : s.score
    }));

    res.json(results);
  } catch (err) {
    console.error('submissionController.recent:', err);
    res.status(500).json({ message: 'Server error fetching recent results' });
  }
};
