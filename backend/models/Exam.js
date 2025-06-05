// models/Exam.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
});

const examSchema = new mongoose.Schema({
  year: { type: String, required: true },
  semester: { type: String, required: true },
  season: { type: String, required: true },
  subject: { type: String, required: true },
  examNo: { type: String, required: true },
  questions: {
    type: [questionSchema],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0,
  },
  assignedSemester: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number, required: true }, // minutes
  scheduleDate: { type: Date, required: true }, // exam ki date
  scheduleTime: { type: String, required: true }, // exam ka start time, e.g. '14:30'
}, {
  timestamps: true,
});

module.exports = mongoose.model('Exam', examSchema);
