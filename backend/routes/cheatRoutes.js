const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const Cheat   = require('../models/CheatClip');
const { protect, authorize } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload  = multer({ storage });

// ✅ Student uploads cheat clip
router.post(
  '/',
  protect,
  authorize('student'),
  upload.single('clip'),
  async (req, res) => {
    try {
      const { examId, reason } = req.body;
      if (!req.file) {
        return res.status(400).json({ error: 'No clip uploaded' });
      }

      const clip = {
        data:        req.file.buffer,
        contentType: req.file.mimetype
      };

      // Use req.user.id instead of trusting studentId from client
      await Cheat.create({
        student: req.user.id,
        exam:    examId,
        clip,
        reason
      });

      // Return a JSON message
      return res.status(201).json({ message: 'Cheat recorded' });
    } catch (err) {
      console.error('Cheat upload error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ✅ Teacher fetches all cheats
router.get(
  '/',
  protect,
  authorize('teacher'),
  async (req, res) => {
    try {
      const all = await Cheat.find().populate('student exam');
      return res.json(
        all.map(c => ({
          id:        c._id,
          student:   c.student.name,
          // examNo is the correct field on your Exam model
          examNo:    c.exam.examNo,
          reason:    c.reason,
          timestamp: c.createdAt
        }))
      );
    } catch (err) {
      console.error('Fetch cheats error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ✅ Teacher streams the clip
router.get(
  '/:id/clip',
  protect,
  authorize('teacher'),
  async (req, res) => {
    try {
      const c = await Cheat.findById(req.params.id);
      if (!c) return res.sendStatus(404);

      res.contentType(c.clip.contentType);
      return res.send(c.clip.data);
    } catch (err) {
      console.error('Stream clip error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
