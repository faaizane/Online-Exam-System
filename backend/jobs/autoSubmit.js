// backend/jobs/autoSubmit.js

const cron       = require('node-cron');
const Progress   = require('../models/Progress');
const Submission = require('../models/Submission');
const Exam       = require('../models/Exam');

let isJobRunning = false;

// Changed from every minute to every 5 minutes to reduce load
cron.schedule('*/5 * * * *', async () => {
  // Prevent multiple instances from running simultaneously
  if (isJobRunning) {
    console.log('[AUTO-SUBMIT] Previous job still running, skipping...');
    return;
  }
  
  isJobRunning = true;
  
  try {
    console.log('[AUTO-SUBMIT] Starting auto-submit job...');
    
    // 20 minutes se purani progress, but exclude paused ones
    const cutoff = new Date(Date.now() - 20 * 60 * 1000);
    const expired = await Progress.find({
      updatedAt: { $lt: cutoff },
      $or: [
        { isPaused: { $ne: true } }, // Not paused
        { isPaused: true, resumeAllowedUntil: { $lt: new Date() } } // Paused but resume window expired
      ]
    }).lean();

    console.log(`[AUTO-SUBMIT] Found ${expired.length} expired progress records`);

    // Process in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < expired.length; i += batchSize) {
      const batch = expired.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (prog) => {
        try {
          // 1) agar student-exam pe pehle se submission ho, to skip
          const already = await Submission.exists({
            exam:    prog.exam,
            student: prog.user
          });
          if (already) {
            await Progress.deleteOne({ _id: prog._id });
            return;
          }

          // 2) load exam, skip orphaned
          const exam = await Exam.findById(prog.exam).lean();
          if (!exam) {
            console.warn(`[AUTO-SUBMIT] Orphaned progress ${prog._id} for exam ${prog.exam}`);
            await Progress.deleteOne({ _id: prog._id });
            return;
          }

          // 3) calculate score
          const answersArr = prog.answers || [];
          let rawScore = 0;
          (exam.questions || []).forEach((q, i) => {
            if (answersArr[i] === q.correctAnswerIndex) rawScore++;
          });

          // 4) create submission
          await Submission.create({
            exam:        prog.exam,
            student:     prog.user,
            answers:     answersArr,
            score:       rawScore,
            submittedAt: new Date()
          });

          // 5) cleanup progress
          await Progress.deleteOne({ _id: prog._id });
          
          console.log(`[AUTO-SUBMIT] Processed expired progress for exam ${prog.exam}, score: ${rawScore}`);
        } catch (err) {
          console.error(`[AUTO-SUBMIT] Error processing progress ${prog._id}:`, err.message);
        }
      }));
      
      // Small delay between batches to prevent overwhelming the database
      if (i + batchSize < expired.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('[AUTO-SUBMIT] Job completed successfully');
  } catch (err) {
    console.error('[AUTO-SUBMIT ERROR]', err.message);
  } finally {
    isJobRunning = false;
  }
}, {
  scheduled: true,
  timezone: 'Asia/Karachi'
});
