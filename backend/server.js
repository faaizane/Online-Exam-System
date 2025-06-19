// Load environment variables first
require('dotenv').config();

// ── Core Modules ────────────────────────────────────────
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

// file ke top me
require('./jobs/autoSubmit');
// baaki app initialization…

// ── Route Modules ───────────────────────────────────────
const authRoutes       = require('./routes/authRoutes');
const examRoutes       = require('./routes/examRoutes');
const subjectRoutes    = require('./routes/subjects');
const userRoutes       = require('./routes/users');
const submissionRoutes = require('./routes/submissionRoutes');

const progressRoutes = require('./routes/examProgress');



// ── App Setup ───────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// ── Global Middleware ───────────────────────────────────
app.use(cors());           // Enable CORS for all origins
app.use(express.json());   // Parse incoming JSON bodies

// ── API Endpoints ───────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/exams',       examRoutes);
app.use('/api/exams/:examId', progressRoutes);
app.use('/api/subjects',    subjectRoutes);
app.use('/api/users',       userRoutes);
app.use(submissionRoutes);  // No prefix—routes file defines its own paths


// ── Start Server ────────────────────────────────────────
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);
