// File: controllers/examController.js

const multer   = require('multer');
const fs       = require('fs');
const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');
const Exam     = require('../models/Exam');
const Subject  = require('../models/Subject');

const upload = multer({ dest: 'uploads/' });

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
 * Parse a block of raw text into question objects.
 */
function parseTextToQuestions(text) {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const questions = [];
  let currentQuestion = null;

  lines.forEach(line => {
    if (/^Q\d+\./i.test(line)) {
      if (currentQuestion) questions.push(currentQuestion);
      currentQuestion = {
        questionText: line.replace(/^Q\d+\.\s*/, ''),
        options: [],
        correctAnswerIndex: null
      };
    } else if (/^[abcd]\)/i.test(line) && currentQuestion) {
      currentQuestion.options.push(line.slice(2).trim());
    } else if (/^Answer:/i.test(line) && currentQuestion) {
      const match = line.match(/^Answer:\s*([abcd])/i);
      if (match) {
        currentQuestion.correctAnswerIndex =
          ['a','b','c','d'].indexOf(match[1].toLowerCase());
      }
    }
  });

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

    // Normalize examNo
    const examNo = normalizeExamNo(rawExamNo);

    // Validate
    if (!year || !semester || !session || !subjectId || !examNo ||
        !questions || !duration || !scheduleDate || !scheduleTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (typeof duration !== 'number' || duration <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive number' });
    }

    // Check Subject
    const subjectDoc = await Subject.findById(subjectId).lean();
    if (!subjectDoc) {
      return res.status(404).json({ message: 'Subject not found' });
    }
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

    // Create exam
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

/**
 * GET /api/exams/filtered
 */
exports.getExamsByFilter = async (req, res) => {
  try {
    const { year, session, semester } = req.query;
    if (!year || !session || !semester) {
      return res.status(400).json({ message: 'Missing filter parameters' });
    }

    let exams = await Exam.find({ year, session, semester })
      .populate('subject', 'name')
      .lean();

    // Normalize examNo
    exams = exams.map(exam => ({ ...exam, examNo: normalizeExamNo(exam.examNo) }));

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
    if (!subjectDoc) {
      return res.status(404).json({ message: 'Subject not found' });
    }
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
 */
exports.deleteExamById = async (req, res) => {
  try {
    const deleted = await Exam.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: 'Exam not found or you are not authorized' });
    }
    res.json({ message: 'Exam deleted successfully' });
  } catch (err) {
    console.error('deleteExamById error:', err);
    res.status(500).json({ message: 'Server error deleting exam' });
  }
};

/**
 * GET /api/exams/recent
 */
exports.getRecentExams = async (req, res) => {
  try {
    let exams = await Exam.find()
      .sort({ scheduleDate: -1 })
      .limit(5)
      .populate('subject', 'name')
      .lean();

    exams = exams.map(exam => ({ ...exam, examNo: normalizeExamNo(exam.examNo) }));
    res.json(exams);
  } catch (err) {
    console.error('getRecentExams error:', err);
    res.status(500).json({ message: 'Server error fetching recent exams' });
  }
};
