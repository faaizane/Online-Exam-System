const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam:     { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers:  { type: [Number], default: [] },
  timeLeft: { type: Number, required: true },
  isPaused: { type: Boolean, default: false },
  pausedAt: { type: Date, default: null },
  resumeAllowedUntil: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
