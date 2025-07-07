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
    
    // Check if progress is paused and resume window expired
    if (prog.isPaused && prog.resumeAllowedUntil && new Date() > prog.resumeAllowedUntil) {
      return res.json({ 
        expired: true, 
        message: 'Resume window expired. Exam will be auto-submitted.' 
      });
    }
    
    res.json({ 
      answers: prog.answers, 
      timeLeft: prog.timeLeft,
      isPaused: prog.isPaused,
      pausedAt: prog.pausedAt,
      resumeAllowedUntil: prog.resumeAllowedUntil
    });
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

    // Check if progress is paused - don't allow updates if paused
    const existingProgress = await Progress.findOne({
      user: req.user.id,
      exam: req.params.examId
    }).lean();

    if (existingProgress && existingProgress.isPaused) {
      return res.status(400).json({ 
        message: 'Cannot update progress while paused', 
        isPaused: true 
      });
    }

    // upsert progress (only if not paused)
    await Progress.findOneAndUpdate(
      { user: req.user.id, exam: req.params.examId },
      { 
        answers: answersArr, 
        timeLeft, 
        updatedAt: Date.now(),
        // Reset pause state if this is a normal save
        isPaused: false,
        pausedAt: null,
        resumeAllowedUntil: null
      },
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

exports.pauseProgress = async (req, res) => {
  try {
    const { reason } = req.body; // "power_outage" or other reasons
    
    const prog = await Progress.findOne({
      user: req.user.id,
      exam: req.params.examId
    });

    if (!prog) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    if (prog.isPaused) {
      return res.status(400).json({ message: 'Progress already paused' });
    }

    const now = new Date();
    const resumeAllowedUntil = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

    await Progress.findOneAndUpdate(
      { user: req.user.id, exam: req.params.examId },
      { 
        isPaused: true,
        pausedAt: now,
        resumeAllowedUntil: resumeAllowedUntil,
        updatedAt: now
      }
    );

    res.json({ 
      message: 'Progress paused due to power outage',
      resumeAllowedUntil: resumeAllowedUntil
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to pause progress' });
  }
};

exports.resumeProgress = async (req, res) => {
  try {
    const prog = await Progress.findOne({
      user: req.user.id,
      exam: req.params.examId
    });

    if (!prog) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    if (!prog.isPaused) {
      return res.status(400).json({ message: 'Progress is not paused' });
    }

    const now = new Date();
    
    // Check if resume window has expired
    if (now > prog.resumeAllowedUntil) {
      return res.status(403).json({ 
        message: 'Resume window expired. Exam has been auto-submitted.',
        expired: true
      });
    }

    await Progress.findOneAndUpdate(
      { user: req.user.id, exam: req.params.examId },
      { 
        isPaused: false,
        pausedAt: null,
        resumeAllowedUntil: null,
        updatedAt: now
      }
    );

    res.json({ 
      answers: prog.answers, 
      timeLeft: prog.timeLeft,
      message: 'Progress resumed successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to resume progress' });
  }
};
