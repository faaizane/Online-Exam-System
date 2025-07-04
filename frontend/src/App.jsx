// src/App.jsx
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import PrivateRoute from './components/Privateroute.jsx';

// Auth Pages
import SLogin from './pages/SLogin';
import TLogin from './pages/TLogin';
import Logout from './pages/Logout';

// Student Pages
import SDashboard from './pages/SDashboard';
import TakeExam from './pages/TakeExam';
import TestPage from './pages/TestPage';
import ViewResult from './pages/ViewResult';
import ViewResultDetails from './pages/ViewResultDetails';
import StudentProfile from './pages/StudentProfile';
import GiveExam from './pages/GiveExam';
import ViewAnswers from './pages/ViewAnswers';

// Teacher Pages
import TDashboard from './pages/TDashboard';
import StudentManagement from './pages/StudentManagement';
import ManageExams from './pages/ManageExams';
import CreateExam from './pages/CreateExam';
import EditExam from './pages/EditExam';
import ReviewCheating from './pages/ReviewCheating';
import ReviewCheatingDetails from './pages/ReviewCheatingDetails';
import ViewTeacherResults from './pages/ViewTeacherResults';
import ExamSchedule from './pages/ExamSchedule';
import TeacherProfile from './pages/TeacherProfile';
import SubjectStudents from './pages/SubjectStudents';
import AddSubject from './pages/AddSubject';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/slogin" replace />} />

        {/* Public Auth Routes */}
        <Route path="/slogin" element={<SLogin />} />
        <Route path="/tlogin" element={<TLogin />} />
        <Route path="/logout" element={<Logout />} />

        {/* Student Protected Routes */}
        <Route path="/sdashboard" element={
          <PrivateRoute allowedRoles={['student']}><SDashboard /></PrivateRoute>
        } />
        <Route path="/take-exam" element={
          <PrivateRoute allowedRoles={['student']}><TakeExam /></PrivateRoute>
        } />
        <Route path="/take-exam/test-page" element={
          <PrivateRoute allowedRoles={['student']}><TestPage /></PrivateRoute>
        } />
        <Route path="/view-result" element={
          <PrivateRoute allowedRoles={['student']}><ViewResult /></PrivateRoute>
        } />
        <Route path="/view-result-details/:subjectId" element={
          <PrivateRoute allowedRoles={['student']}><ViewResultDetails /></PrivateRoute>
        } />
        <Route path="/student-profile" element={
          <PrivateRoute allowedRoles={['student']}><StudentProfile /></PrivateRoute>
        } />
        <Route path="/give-exam/:id" element={
          <PrivateRoute allowedRoles={['student']}><GiveExam /></PrivateRoute>
        } />
        <Route path="/view-answers/:submissionId" element={
          <PrivateRoute allowedRoles={['student']}><ViewAnswers /></PrivateRoute>
        } />

        {/* Teacher Protected Routes */}
        <Route path="/tdashboard" element={
          <PrivateRoute allowedRoles={['teacher']}><TDashboard /></PrivateRoute>
        } />
        <Route path="/studentmanagement" element={
          <PrivateRoute allowedRoles={['teacher']}><StudentManagement /></PrivateRoute>
        } />
        <Route path="/manageexams" element={
          <PrivateRoute allowedRoles={['teacher']}><ManageExams /></PrivateRoute>
        } />
        <Route path="/createexam" element={
          <PrivateRoute allowedRoles={['teacher']}><CreateExam /></PrivateRoute>
        } />
        <Route path="/editexam/:id" element={
          <PrivateRoute allowedRoles={['teacher']}><EditExam /></PrivateRoute>
        } />
        <Route path="/reviewcheating" element={
          <PrivateRoute allowedRoles={['teacher']}><ReviewCheating /></PrivateRoute>
        } />
        <Route path="/reviewcheating/details" element={
          <PrivateRoute allowedRoles={['teacher']}><ReviewCheatingDetails /></PrivateRoute>
        } />
        <Route path="/viewresults" element={
          <PrivateRoute allowedRoles={['teacher']}><ViewTeacherResults /></PrivateRoute>
        } />
        <Route path="/examschedule" element={
          <PrivateRoute allowedRoles={['teacher']}><ExamSchedule /></PrivateRoute>
        } />
        <Route path="/teacherprofile" element={
          <PrivateRoute allowedRoles={['teacher']}><TeacherProfile /></PrivateRoute>
        } />
        <Route path="/subjects/:id/students" element={
          <PrivateRoute allowedRoles={['teacher']}><SubjectStudents /></PrivateRoute>
        } />
        <Route path="/add-subject" element={
          <PrivateRoute allowedRoles={['teacher']}><AddSubject /></PrivateRoute>
        } />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
