// backend/jobs/autoSubmit.js

const cron       = require('node-cron');
const Progress   = require('../models/Progress');
const Submission = require('../models/Submission');
const Exam       = require('../models/Exam');

// run har minute, but ensure job khatam ho jaye before next run
cron.schedule('* * * * *', async () => {
  try {
    // 20 minutes se zyada purani progress records nikaalo
    const cutoff = new Date(Date.now() - 20 * 60 * 1000);
    const expired = await Progress.find({
      updatedAt: { $lt: cutoff }
    }).lean();

    for (const prog of expired) {
      // load exam to calc score
      const exam = await Exam.findById(prog.exam).lean();
      const answersArr = prog.answers || [];
      let rawScore = 0;
      (exam.questions || []).forEach((q, i) => {
        if (answersArr[i] === q.correctAnswerIndex) rawScore++;
      });

      // **yahaan student field zaroori hai**
      await Submission.create({
        exam:      prog.exam,
        student:   prog.user,       // <— add this
        answers:   answersArr,
        score:     rawScore,
        submittedAt: new Date()
      });

      // ab progress record hata do
      await Progress.deleteOne({ _id: prog._id });
    }
  } catch (err) {
    console.error('[AUTO-SUBMIT ERROR]', err.message);
  }
}, {
  scheduled: true,
  timezone: 'Asia/Karachi'
});
