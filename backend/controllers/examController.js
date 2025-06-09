// File: controllers/examController.js
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Exam = require('../models/Exam');

const upload = multer({ dest: 'uploads/' });

function parseTextToQuestions(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
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
      const ansLetter = line.match(/^Answer:\s*([abcd])/i);
      if (ansLetter) {
        currentQuestion.correctAnswerIndex = ['a','b','c','d'].indexOf(ansLetter[1].toLowerCase());
      }
    }
  });

  if (currentQuestion) questions.push(currentQuestion);
  return questions;
}

exports.createExam = async (req, res) => {
  try {
    const {
      year,
      semester,
      session,         // renamed
      subject,
      examNo,
      questions,
      assignedSemester,
      duration,
      scheduleDate,
      scheduleTime,
    } = req.body;

    if (!year || !semester || !session || !subject || !examNo || !questions || !duration || !scheduleDate || !scheduleTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (typeof duration !== 'number' || duration <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive number' });
    }

    const newExam = new Exam({
      year,
      semester,
      session,         // renamed
      subject,
      examNo,
      questions,
      assignedSemester,
      duration,
      scheduleDate: new Date(scheduleDate),
      scheduleTime,
      createdBy: req.user.id,
    });

    await newExam.save();
    return res.status(201).json({ message: 'Exam created successfully', exam: newExam });
  } catch (err) {
    console.error('CreateExam error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.uploadFile = (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
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
      console.error(error);
      return res.status(500).json({ message: 'Error processing file' });
    }
  });
};

exports.getGroupedExams = async (req, res) => {
  try {
    const exams = await Exam.find().lean();
    const grouped = {};

    exams.forEach(exam => {
      const key = `${exam.year}-${exam.session}`;  // renamed

      if (!grouped[key]) {
        grouped[key] = {
          year: exam.year,
          session: exam.session,                   // renamed
          semesters: {}
        };
      }

      if (!grouped[key].semesters[exam.assignedSemester]) {
        grouped[key].semesters[exam.assignedSemester] = [];
      }
      grouped[key].semesters[exam.assignedSemester].push(exam);
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching grouped exams' });
  }
};

exports.getExamsByFilter = async (req, res) => {
  try {
    const { year, session, semester } = req.query;  // renamed

    if (!year || !session || !semester) {
      return res.status(400).json({ message: 'Missing filter parameters' });
    }

    const exams = await Exam.find({
      year,
      session,   // renamed
      semester
    }).lean();

    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching exams by filter' });
  }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching exam' });
  }
};

exports.updateExamById = async (req, res) => {
  try {
    const examId = req.params.id;
    const {
      year,
      semester,
      session,  // renamed
      subject,
      examNo,
      questions,
      assignedSemester,
      duration,
      scheduleDate,
      scheduleTime,
    } = req.body;

    if (!year || !semester || !session || !subject || !examNo || !questions || !duration || !scheduleDate || !scheduleTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      {
        year,
        semester,
        session,        // renamed
        subject,
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
    res.json({ message: 'Exam updated successfully', exam: updatedExam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating exam' });
  }
};

// Add at the bottom of controllers/examController.js:

// GET /api/exams/recent
exports.getRecentExams = async (req, res) => {
  try {
    // Fetch the 5 most recent exams by scheduleDate descending
    const exams = await Exam.find()
      .sort({ scheduleDate: -1 })
      .limit()
      .lean();

    res.json(exams);
  } catch (err) {
    console.error('GetRecentExams error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
