// File: controllers/examController.js

const multer   = require('multer');
const fs       = require('fs');
const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');
const Exam     = require('../models/Exam');
const Subject  = require('../models/Subject');
const Submission  = require('../models/Submission');
const User       = require('../models/User');

const upload = multer({ dest: 'uploads/' });

const CheatClip    = require('../models/CheatClip');  // ← add this


/**
 * Normalize any “quiz” + number input into “Quiz No. XX”
 */
function normalizeExamNo(raw) {
  const m = raw.match(/\d+/);
  if (!m) return raw.trim();
  const num = m[0].padStart(2, '0');
  return `Quiz No. ${num}`;
}

/**
 * Parse raw extracted text (from PDF/Docx) into structured questions array.
 */

function parseTextToQuestions(text) {
  // 1. Fix stuck options by putting them on new lines
  text = text.replace(/([abcd][).])\s*/gi, '\n$1 ');

  // 2. Split text into lines, remove empty lines
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const questions = [];
  let currentQuestion = null;

  lines.forEach(line => {
    // Detect new question
    if (/^Q\d+\./i.test(line)) {
      if (currentQuestion) questions.push(currentQuestion);
      currentQuestion = {
        questionText: line.replace(/^Q\d+\.\s*/, ''),
        options: [],
        correctAnswerIndex: null
      };
    }
    // Detect option, also handle if answer is at end of option
    else if (/^[abcd][).]\s?/i.test(line) && currentQuestion) {
      const optionPart = line.slice(2).trim();
      // If 'Answer:' is at end, split it out
      const [optionText, answerPart] = optionPart.split(/Answer:/i);
      currentQuestion.options.push(optionText.trim());
      if (answerPart) {
        const match = answerPart.match(/\s*([abcd])/i);
        if (match) {
          currentQuestion.correctAnswerIndex = ['a','b','c','d'].indexOf(match[1].toLowerCase());
        }
      }
    }
    // Detect separate answer line
    else if (/^Answer:/i.test(line) && currentQuestion) {
      const match = line.match(/^Answer:\s*([abcd])/i);
      if (match) {
        currentQuestion.correctAnswerIndex = ['a','b','c','d'].indexOf(match[1].toLowerCase());
      }
    }
    // Multiline question: before options, append to question text
    else if (currentQuestion && currentQuestion.options.length === 0 && !/^Answer:/i.test(line)) {
      currentQuestion.questionText += ' ' + line.trim();
    }
  });

  // Last question add karo
  if (currentQuestion) questions.push(currentQuestion);
  return questions;
}



/**
 * POST /api/exams/upload
 */
exports.uploadFile = (req, res, next) => {
  upload.single('file')(req, res, async err => {
    if (err) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ message: 'No file uploaded' });

      let text = '';
      if (file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(dataBuffer);
        text = pdfData.text;
      } else if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/msword'
      ) {
        const result = await mammoth.extractRawText({ path: file.path });
        text = result.value;
      } else {
        fs.unlinkSync(file.path);
        return res.status(400).json({ message: 'Unsupported file format' });
      }

      const questions = parseTextToQuestions(text);
      fs.unlinkSync(file.path);

      if (questions.length === 0) {
        return res.status(400).json({ message: 'No questions found in file' });
      }
      return res.json({ questions });
    } catch (error) {
      console.error('uploadFile error:', error);
      return res.status(500).json({ message: 'Error processing file' });
    }
  });
};

/**
 * POST /api/exams/create
 */
exports.createExam = async (req, res) => {
  try {
    const {
      year,
      semester,
      session,
      subject: subjectId,
      examNo: rawExamNo,
      questions,
      assignedSemester,
      duration,
      scheduleDate,
      scheduleTime,
    } = req.body;

    const examNo = normalizeExamNo(rawExamNo);

    if (!year || !semester || !session || !subjectId || !examNo ||
        !questions || !duration || !scheduleDate || !scheduleTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (typeof duration !== 'number' || duration <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive number' });
    }

    const subjectDoc = await Subject.findById(subjectId).lean();
    if (!subjectDoc) return res.status(404).json({ message: 'Subject not found' });
    if (subjectDoc.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to use this subject' });
    }
    if (
      subjectDoc.year.toString() !== year.toString() ||
      subjectDoc.session !== session.trim().toLowerCase()
    ) {
      return res.status(400).json({
        message: 'Selected subject does not match the specified year or session'
      });
    }

    const newExam = new Exam({
      year,
      semester,
      session,
      subject: subjectId,
      assignedStudents: subjectDoc.students,
      examNo,
      questions,
      assignedSemester,
      duration,
      scheduleDate: new Date(scheduleDate),
      scheduleTime,
      createdBy: req.user.id,
    });

    await newExam.save();
    res.status(201).json({ message: 'Exam created successfully', exam: newExam });
  } catch (err) {
    console.error('createExam error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

/**
 * GET /api/exams/grouped
 */
exports.getGroupedExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('subject', 'name')
      .lean();

    const grouped = {};
    exams.forEach(exam => {
      const key = `${exam.year}-${exam.session}`;
      if (!grouped[key]) {
        grouped[key] = { year: exam.year, session: exam.session, semesters: {} };
      }
      if (!grouped[key].semesters[exam.assignedSemester]) {
        grouped[key].semesters[exam.assignedSemester] = [];
      }
      grouped[key].semesters[exam.assignedSemester].push(exam);
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error('getGroupedExams error:', err);
    res.status(500).json({ message: 'Server error fetching grouped exams' });
  }
};


exports.getExamsByFilter = async (req, res) => {
  try {
    const { year, session, semester } = req.query;
    if (!year || !session || !semester)
      return res.status(400).json({ message: 'Missing filter parameters' });

    let exams = await Exam.find({ year, session, semester })
      .populate('subject', 'name')
      .lean();

    exams = await Promise.all(
      exams.map(async e => ({
        ...e,
        examNo: normalizeExamNo(e.examNo),
        status: await computeStatus(e)   // 👈 add here
      }))
    );

    res.json(exams);
  } catch (err) {
    console.error('getExamsByFilter error:', err);
    res.status(500).json({ message: 'Server error fetching exams by filter' });
  }
};


/**
 * GET /api/exams/:id
 */
exports.getExamById = async (req, res) => {
  try {
    let exam = await Exam.findById(req.params.id)
      .populate('subject', 'name')
      .lean();
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    exam.examNo = normalizeExamNo(exam.examNo);
    res.json(exam);
  } catch (err) {
    console.error('getExamById error:', err);
    res.status(500).json({ message: 'Server error fetching exam' });
  }
};

/**
 * PUT /api/exams/:id
 */
exports.updateExamById = async (req, res) => {
  try {
    const examId = req.params.id;
    const {
      year,
      semester,
      session,
      subject: subjectId,
      examNo: rawExamNo,
      questions,
      assignedSemester,
      duration,
      scheduleDate,
      scheduleTime,
    } = req.body;

    const examNo = normalizeExamNo(rawExamNo);

    if (!year || !semester || !session || !subjectId || !examNo ||
        !questions || !duration || !scheduleDate || !scheduleTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const subjectDoc = await Subject.findById(subjectId).lean();
    if (!subjectDoc) return res.status(404).json({ message: 'Subject not found' });
    if (subjectDoc.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to use this subject' });
    }
    if (
      subjectDoc.year.toString() !== year.toString() ||
      subjectDoc.session !== session.trim().toLowerCase()
    ) {
      return res.status(400).json({
        message: 'Selected subject does not match the specified year or session'
      });
    }

    let updatedExam = await Exam.findByIdAndUpdate(
      examId,
      {
        year,
        semester,
        session,
        subject: subjectId,
        assignedStudents: subjectDoc.students,
        examNo,
        questions,
        assignedSemester,
        duration,
        scheduleDate: new Date(scheduleDate),
        scheduleTime,
      },
      { new: true, runValidators: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    updatedExam = await updatedExam.populate('subject', 'name');
    res.json({ message: 'Exam updated successfully', exam: updatedExam });
  } catch (err) {
    console.error('updateExamById error:', err);
    res.status(500).json({ message: 'Server error updating exam' });
  }
};


/**
 * DELETE /api/exams/:id
 * Deletes the exam (only by its creator) and cascades to delete all related submissions.
 */
// exports.deleteExamById = async (req, res) => {
//   try {
//     // 1) Delete the exam itself (only if created by this user)
//     const deleted = await Exam.findOneAndDelete({
//       _id: req.params.id,
//       createdBy: req.user.id
//     });

//     if (!deleted) {
//       return res
//         .status(404)
//         .json({ message: 'Exam not found or you are not authorized' });
//     }

//     // 2) Cascade: remove ALL submissions for that exam
//     await Submission.deleteMany({ exam: deleted._id });

//     return res.json({ message: 'Exam and its submissions deleted successfully' });
//   } catch (err) {
//     console.error('deleteExamById error:', err);
//     return res.status(500).json({ message: 'Server error deleting exam' });
//   }
// };



/**
 * DELETE /api/exams/:id
 * Deletes the exam (only by its creator) and cascades to delete all related submissions and cheat clips.
 */
exports.deleteExamById = async (req, res) => {
  try {
    // 1) Delete the exam itself (only if created by this user)
    const deleted = await Exam.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: 'Exam not found or you are not authorized' });
    }

    // 2) Cascade: remove ALL submissions for that exam
    await Submission.deleteMany({ exam: deleted._id });

    // 3) Cascade: remove ALL cheat clips for that exam
    await CheatClip.deleteMany({ exam: deleted._id });

    return res.json({ message: 'Exam, its submissions and cheat clips deleted successfully' });
  } catch (err) {
    console.error('deleteExamById error:', err);
    return res.status(500).json({ message: 'Server error deleting exam' });
  }
};


/**
 * GET /api/exams/recent
 */
exports.getRecentExams = async (req, res) => {
  try {
    let exams = await Exam.find({ teacher: req.user._id })
      .populate('subject', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    exams = await Promise.all(
      exams.map(async e => ({
        ...e,
        examNo: normalizeExamNo(e.examNo),
        status: await computeStatus(e)   // ✅ safe now
      }))
    );

    res.json(exams);
  } catch (err) {
    console.error('getRecentExams error:', err);
    res.status(500).json({ message: 'Server error fetching recent exams' });
  }
};


/**
 * GET /api/exams/available — student sees only exams they're assigned to
 */

exports.getAvailableExams = async (req, res) => {
  try {
    // 1) Figure out which subjects this student is in
    const subs = await Subject
      .find({ students: req.user.id })
      .select('_id')
      .lean();
    const subjectIds = subs.map(s => s._id);

    // 2) Pull every exam in those subjects, with subject.name
    let exams = await Exam
      .find({ subject: { $in: subjectIds } })
      .populate('subject', 'name')
      .lean();

    // 3) Build a map of already-taken exams for this student
    const done = await Submission
      .find({ student: req.user.id })
      .select('exam')
      .lean();
    const takenMap = new Map(done.map(d => [ d.exam.toString(), d._id.toString() ]));

    // 4) Optionally filter out attempted:
    const includeAttempted = req.query.includeAttempted === 'true';
    if (!includeAttempted) {
      exams = exams.filter(e => !takenMap.has(e._id.toString()));
    }

    // 5) Group & annotate each exam with attempted + submissionId
    const grouped = {};
    exams.forEach(exam => {
      const key = `${exam.year}-${exam.session}`;
      if (!grouped[key]) {
        grouped[key] = { year: exam.year, session: exam.session, exams: [] };
      }
      grouped[key].exams.push({
        _id:          exam._id,
        subjectName:  exam.subject.name,
        examNo:       normalizeExamNo(exam.examNo),
        duration:     exam.duration,
        scheduleDate: exam.scheduleDate,
        scheduleTime: exam.scheduleTime,
        semester:     exam.semester,
        attempted:    takenMap.has(exam._id.toString()),
        submissionId: takenMap.get(exam._id.toString()) || null
      });
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error('getAvailableExams error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};




// … your existing requires and exports …

/**
 * POST /api/exams/:id/submit
 */
exports.submitExam = async (req, res) => {
  try {
    console.log("HIT!", req.body);

    const examId = req.params.id;
    const studentId = req.user.id;
    const { answers, score } = req.body;

    // Validate existence
    const exam = await Exam.findById(examId).lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Prevent double‐submissions
    const existing = await Submission.findOne({ exam: examId, student: studentId });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted this exam' });
    }

    // Create submission
    const sub = new Submission({
      exam: examId,
      student: studentId,
      answers,
      score,
    submitted: true, // ADD THIS LINE!
    submittedAt: new Date() // (optional, for timestamp)
    });
    await sub.save();

    return res.json({ message: 'Submission recorded', submissionId: sub._id });
  } catch (err) {
    console.error('submitExam error:', err);
    return res.status(500).json({ message: 'Server error recording submission' });
  }
};


// GET /api/exams/:id/student
exports.getExamForStudent = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('subject', 'name')
      .lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Only allow assigned students
    if (!exam.assignedStudents.map(String).includes(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    exam.examNo = normalizeExamNo(exam.examNo);
    res.json({
      ...exam,
      subjectName: exam.subject.name // frontend ke liye direct
    });
  } catch (err) {
    console.error('getExamForStudent error:', err);
    res.status(500).json({ message: 'Server error fetching exam' });
  }
};



// Mark zeros for all students who never submitted
async function finalizeExamZeros(examDoc) {
  // pull ids who already submitted
  const doneIds = await Submission.distinct('student', { exam: examDoc._id });
  const absent  = examDoc.assignedStudents
                  .filter(id => !doneIds.map(String).includes(String(id)));

  if (!absent.length) return;

  const zeroSubs = absent.map(studentId => ({
    exam   : examDoc._id,
    student: studentId,
    answers: [],            // or null
    score  : 0,
    absent : true           // (optional flag, add to Submission schema)
  }));
  await Submission.insertMany(zeroSubs);
}

/* --------------------------------------------------
   Helper: work out status = 'Scheduled' | 'Completed'
-------------------------------------------------- */
async function computeStatus(exam) {
  // 1) End date-time nikalo
  const start = new Date(exam.scheduleDate);
  const [hh, mm] = exam.scheduleTime.split(':').map(Number); // "14:05"
  start.setHours(hh, mm, 0, 0);
  const end = new Date(start.getTime() + exam.duration * 60_000); // +duration

  // 2) Time already passed?
  if (new Date() >= end) {
   // auto-finalise *once*
   if (!exam.finalized) {
     const doc = await Exam.findById(exam._id);   // real Mongoose doc
     if (doc && !doc.finalized) {
       await finalizeExamZeros(doc);
       doc.finalized = true;
       await doc.save();
     }
   }
    return 'Completed';
  }

  // 3) Sab students submit kar chuke?
  const total      = exam.assignedStudents.length;
  if (!total) return 'Completed';               // edge case
  const submitted  = await Submission.countDocuments({ exam: exam._id });
  if (submitted >= total) return 'Completed';

  // 4) Otherwise scheduled/ongoing
  return 'Scheduled';
}
