// backend/server.js
require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const connectDB     = require('./config/db');
require('./jobs/autoSubmit');

const authRoutes       = require('./routes/authRoutes');
const examRoutes       = require('./routes/examRoutes');
const progressRoutes   = require('./routes/examProgress');
const subjectRoutes    = require('./routes/subjects');
const userRoutes       = require('./routes/users');
const submissionRoutes = require('./routes/submissionRoutes');
const cheatRoutes      = require('./routes/cheatRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

connectDB();
app.use(cors());
app.use(express.json());

// mount your routers
app.use('/api/auth',        authRoutes);
app.use('/api/exams',       examRoutes);
app.use('/api/exams/:examId', progressRoutes);
app.use('/api/subjects',    subjectRoutes);
app.use('/api/users',       userRoutes);
// app.use('/api/submissions', submissionRoutes);
app.use(submissionRoutes);
// option A: mount cheats on its own prefix,
// and inside cheatRoutes.js use relative paths ('/' and '/:id/clip')
app.use('/api/cheats', cheatRoutes);

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
