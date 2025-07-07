// backend/routes/examProgress.js
const express = require('express');
const router  = express.Router({ mergeParams: true });

// Destructure the protect function
const { protect } = require('../middleware/authMiddleware');
const ctrl        = require('../controllers/progressController');

// GET in-progress state
router.get('/progress',    protect, ctrl.getProgress);

// SAVE in-progress state
router.post('/progress',   protect, ctrl.saveProgress);

// CLEAR on final submit
router.delete('/progress', protect, ctrl.clearProgress);

module.exports = router;
