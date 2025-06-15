// File: backend/controllers/examController.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const subjectRoutes = require('./routes/subjects');

// File: server.js (or app.js)
const userRoutes    = require('./routes/users');



const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
// after your other `app.use(…)` calls:
app.use(require('./routes/submissionRoutes'));


app.use('/api/subjects', subjectRoutes);

 app.use('/api/users',    userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
