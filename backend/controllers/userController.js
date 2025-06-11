// File: controllers/userController.js
// This is for adding the students and departments endpoints
const User = require('../models/User');

exports.getDepartments = async (req, res) => {
  try {
    const deps = await User.distinct('department', { role: 'student' });
    res.json(deps);
  } catch (err) {
    console.error('getDepartments error:', err);
    res.status(500).json({ message: 'Server error fetching departments' });
  }
};

exports.getSemesters = async (req, res) => {
  try {
    const sems = await User.distinct('semester', { role: 'student' });
    // sort numerically
    sems.sort((a, b) => a - b);
    res.json(sems);
  } catch (err) {
    console.error('getSemesters error:', err);
    res.status(500).json({ message: 'Server error fetching semesters' });
  }
};
