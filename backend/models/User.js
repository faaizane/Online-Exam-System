// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: function() { return this.role === 'student'; },
    min: 1
  },
  registrationNumber: {
    type: String,
    required: function() { return this.role === 'student'; },
    trim: true
  },
  designation: {
    type: String,
    required: function() { return this.role === 'teacher'; },
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
