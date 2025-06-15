// // File: backend/controllers/examController.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const subjectRoutes = require('./routes/subjects');


// // File: server.js (or app.js)
// const userRoutes    = require('./routes/users');



// const app = express();
// connectDB();

// app.use(cors());
// app.use(express.json());

// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/exams', require('./routes/examRoutes'));
// // after your other `app.use(…)` calls:
// app.use(require('./routes/submissionRoutes'));



// app.use('/api/subjects', subjectRoutes);

//  app.use('/api/users',    userRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// Load environment variables first
require('dotenv').config();

// ── Core Modules ────────────────────────────────────────
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

// ── Route Modules ───────────────────────────────────────
const authRoutes       = require('./routes/authRoutes');
const examRoutes       = require('./routes/examRoutes');
const subjectRoutes    = require('./routes/subjects');
const userRoutes       = require('./routes/users');
const submissionRoutes = require('./routes/submissionRoutes');

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
app.use('/api/subjects',    subjectRoutes);
app.use('/api/users',       userRoutes);
app.use(submissionRoutes);  // No prefix—routes file defines its own paths

// ── Start Server ────────────────────────────────────────
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);
