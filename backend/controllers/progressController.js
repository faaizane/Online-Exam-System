// backend/controllers/progressController.js

const Progress = require('../models/Progress');
const Exam     = require('../models/Exam');
const Submission = require('../models/Submission');  // ← add this


exports.getProgress = async (req, res) => {
  try {
    const prog = await Progress.findOne({
      user: req.user.id,
      exam: req.params.examId
    }).lean();
    if (!prog) return res.json({});
    res.json({ answers: prog.answers, timeLeft: prog.timeLeft });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load progress' });
  }
};

exports.saveProgress = async (req, res) => {
  try {
    let { answers: answersObj, timeLeft } = req.body;

    // load exam to know how many questions
    const exam = await Exam.findById(req.params.examId).lean();
    const qCount = Array.isArray(exam.questions)
      ? exam.questions.length
      : 0;

    // initialize an array of nulls
    let answersArr = Array(qCount).fill(null);

    if (Array.isArray(answersObj)) {
      // if client already sent an array, sanitize it
      answersArr = answersObj.map(v => (typeof v === 'number' ? v : null));
    } else if (answersObj && typeof answersObj === 'object') {
      // convert object map { "0": 2, "3": 1 } → [2, null, null, 1, ...]
      Object.entries(answersObj).forEach(([key, val]) => {
        const idx = parseInt(key, 10);
        if (!isNaN(idx) && typeof val === 'number') {
          answersArr[idx] = val;
        }
      });
    }

    // upsert progress
    await Progress.findOneAndUpdate(
      { user: req.user.id, exam: req.params.examId },
      { answers: answersArr, timeLeft, updatedAt: Date.now() },
      { upsert: true }
    );

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not save progress' });
  }
};

exports.clearProgress = async (req, res) => {
  try {
    await Progress.deleteOne({
      user: req.user.id,
      exam: req.params.examId
    });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to clear progress' });
  }
};
