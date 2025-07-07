// File: models/Subject.js
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  section:  { type: String, trim: true, lowercase: true, default: '' },
  session:  { type: String, required: true, trim: true, lowercase: true },
  year:     { type: Number, required: true, min: 2000 },
  semester: { type: Number, required: true, min: 1 },
  teacher:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Compound unique index to enforce no duplicates per teacher
subjectSchema.index(
  { teacher: 1, name: 1, section: 1, year: 1, session: 1, semester: 1 },
  { unique: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
