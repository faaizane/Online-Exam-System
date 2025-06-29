const mongoose = require('mongoose');
const CheatClip = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam:    { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  clip:    { data: Buffer, contentType: String },
  reason:    { type: String, required: true },           // ← NEW
  createdAt: { type: Date, default: Date.now, expires: 7*24*60*60 } // 7 days
});
module.exports = mongoose.model('CheatClip', CheatClip);
