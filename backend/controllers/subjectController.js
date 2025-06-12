// File: controllers/subjectController.js

const Subject = require('../models/Subject');
const User    = require('../models/User');

// GET /api/subjects
exports.getSubjects = async (req, res) => {
  try {
    // Only this teacher’s subjects
    const filter = { teacher: req.user.id };
    // If a year query param is provided, only fetch that year
    if (req.query.year) {
      filter.year = Number(req.query.year);
    }
    let subs = await Subject.find(filter).lean();

    // Fill in a fallback year if missing
    subs = subs.map(sub => ({
      ...sub,
      year: sub.year || (sub.createdAt
        ? new Date(sub.createdAt).getFullYear()
        : new Date().getFullYear()
      )
    }));
    res.json(subs);
  } catch (err) {
    console.error('getSubjects error:', err);
    res.status(500).json({ message: 'Server error fetching subjects' });
  }
};

// GET /api/subjects/:id
exports.getSubjectById = async (req, res) => {
  try {
    const sub = await Subject.findById(req.params.id).lean();
    if (!sub) return res.status(404).json({ message: 'Subject not found' });
    res.json(sub);
  } catch (err) {
    console.error('getSubjectById error:', err);
    res.status(500).json({ message: 'Server error fetching subject' });
  }
};

// In createSubject:
exports.createSubject = async (req, res) => {
  let { name, session, year, semester } = req.body;
  if (!name || !session || !year || !semester) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // normalize session to lowercase
  session = session.trim().toLowerCase();

  try {
    const newSub = new Subject({
      name:       name.trim(),
      session,
      year,
      semester,
      teacher:    req.user.id,
      students:   []
    });
    await newSub.save();
    res.status(201).json(newSub);

  } catch (err) {
    // duplicate key error?
    if (err.code === 11000) {
      return res.status(400).json({ message: 'This subject already exists.' });
    }
    console.error('createSubject error:', err);
    res.status(500).json({ message: 'Server error creating subject' });
  }
};


// GET /api/subjects/:id/students
exports.getSubjectStudents = async (req, res) => {
  try {
    const sub = await Subject.findById(req.params.id)
      .populate({
        path: 'students',
        match: { role: 'student' },
        select: 'name email registrationNumber semester section department',
        options: { sort: { name: 1 } }
      })
      .lean();
    if (!sub) return res.status(404).json({ message: 'Subject not found' });
    res.json(sub.students);
  } catch (err) {
    console.error('getSubjectStudents error:', err);
    res.status(500).json({ message: 'Server error fetching students' });
  }
};

// POST /api/subjects/:id/students
exports.addStudentToSubject = async (req, res) => {
  const { registrationNumber } = req.body;
  if (!registrationNumber) {
    return res.status(400).json({ message: 'registrationNumber required' });
  }
  try {
    const [ sub, user ] = await Promise.all([
      Subject.findById(req.params.id),
      User.findOne({
        registrationNumber: { $regex: `^${registrationNumber}$`, $options: 'i' },
        role: 'student'
      })
    ]);
    if (!sub)  return res.status(404).json({ message: 'Subject not found' });
    if (!user) return res.status(404).json({ message: 'Student not found' });

    if (sub.students.includes(user._id)) {
      return res.status(400).json({ message: 'Student already added' });
    }

    sub.students.push(user._id);
    await sub.save();
    res.json({ message: 'Student added', student: user });
  } catch (err) {
    console.error('addStudentToSubject error:', err);
    res.status(500).json({ message: 'Server error adding student' });
  }
};

// POST /api/subjects/:id/students/bulk
exports.bulkAddStudents = async (req, res) => {
  const { department, semester } = req.body;
  if (!department || semester == null) {
    return res.status(400).json({ message: 'department and semester required' });
  }
  try {
    const sub = await Subject.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subject not found' });

    // Now uses case-insensitive match for department
    const candidates = await User.find({
      role: 'student',
      department: { $regex: `^${department}$`, $options: 'i' },
      semester:   parseInt(semester, 10)
    }).select('_id');

    const existingIds = sub.students.map(id => id.toString());
    const toAdd = candidates
      .map(u => u._id.toString())
      .filter(id => !existingIds.includes(id));

    if (toAdd.length) {
      sub.students.push(...toAdd);
      await sub.save();
    }

    res.json({
      message: `${toAdd.length} student(s) added`,
      addedCount: toAdd.length
    });
  } catch (err) {
    console.error('bulkAddStudents error:', err);
    res.status(500).json({ message: 'Server error bulk adding students' });
  }
};

// DELETE /api/subjects/:id/students/:studentId
exports.removeStudentFromSubject = async (req, res) => {
  try {
    const sub = await Subject.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subject not found' });

    const studentId = req.params.studentId;
    const idx = sub.students.findIndex(sid => sid.toString() === studentId);
    if (idx === -1) {
      return res.status(404).json({ message: 'Student not enrolled' });
    }

    sub.students.splice(idx, 1);
    await sub.save();
    res.json({ message: 'Student removed' });
  } catch (err) {
    console.error('removeStudentFromSubject error:', err);
    res.status(500).json({ message: 'Server error removing student' });
  }
};

// … your existing requires and exports …

// PUT /api/subjects/:id
exports.updateSubject = async (req, res) => {
  const { name, session, year, semester } = req.body;
  if (!name || !session || !year || !semester) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const sub = await Subject.findById(req.params.id);
    if (!sub) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    // (optional) enforce that only the owner can update:
    if (sub.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    sub.name     = name.trim();
    sub.session  = session.trim().toLowerCase();
    sub.year     = year;
    sub.semester = semester;
    await sub.save();

    res.json(sub);
  } catch (err) {
    // handle unique‐index violation
    if (err.code === 11000) {
      return res.status(400).json({ message: 'This subject already exists.' });
    }
    console.error('updateSubject error:', err);
    res.status(500).json({ message: 'Server error updating subject' });
  }
};

// DELETE /api/subjects/:id
exports.deleteSubject = async (req, res) => {
  try {
    // find and delete in one operation, scoping to this teacher
    const sub = await Subject.findOneAndDelete({
      _id: req.params.id,
      teacher: req.user.id
    });
    if (!sub) {
      return res
        .status(404)
        .json({ message: 'Subject not found or you are not authorized' });
    }
    return res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error('deleteSubject error:', err);
    return res.status(500).json({ message: 'Server error deleting subject' });
  }
};

