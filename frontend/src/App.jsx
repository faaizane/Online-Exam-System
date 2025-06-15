// // src/App.jsx
// import React from 'react';
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate
// } from 'react-router-dom';

// import PrivateRoute from './components/PrivateRoute';

// import SLogin            from './pages/SLogin';
// import TLogin            from './pages/TLogin';
// import Logout            from './pages/Logout';

// import SDashboard        from './pages/SDashboard';
// import TakeExam          from './pages/TakeExam';
// import TestPage          from './pages/TestPage';
// import ViewResult        from './pages/ViewResult';
// import ViewResultDetails from './pages/ViewResultDetails';
// import StudentProfile    from './pages/StudentProfile';
// import GiveExam          from './pages/GiveExam';

// import TDashboard        from './pages/TDashboard';
// import StudentManagement from './pages/StudentManagement';
// // import AddStudent        from './pages/AddStudent';
// import ManageExams       from './pages/ManageExams';
// import CreateExam        from './pages/CreateExam';
// import EditExam          from './pages/EditExam';           // <-- Naya import
// import ReviewCheating    from './pages/ReviewCheating';
// import ViewResults       from './pages/ViewTeacherResults';
// import ExamSchedule      from './pages/ExamSchedule';
// import TeacherProfile    from './pages/TeacherProfile';
// // import ViewAnswer        from './pages/ViewAnswer';       // ← NEW: import for ViewAnswer page

// // ← NEW:
// import SubjectStudents   from './pages/SubjectStudents';
// import AddSubject        from './pages/AddSubject';

// export default function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* default to student login */}
//         <Route path="/" element={<Navigate to="/slogin" replace />} />

//         {/* public auth */}
//         <Route path="/slogin" element={<SLogin />} />
//         <Route path="/tlogin" element={<TLogin />} />

//         {/* logout */}
//         <Route path="/logout" element={<Logout />} />

//         {/* student-only pages */}
//         <Route
//           path="/sdashboard"
//           element={
//             <PrivateRoute allowedRoles={['student']}>
//               <SDashboard />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/take-exam"
//           element={
//             <PrivateRoute allowedRoles={['student']}>
//               <TakeExam />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/take-exam/test-page"
//           element={
//             <PrivateRoute allowedRoles={['student']}>
//               <TestPage />
//             </PrivateRoute>
//           }
//         />
        
//         <Route
//           path="/view-result"
//           element={
//             <PrivateRoute allowedRoles={['student']}>
//               <ViewResult />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/view-result-details/"
//           element={
//             <PrivateRoute allowedRoles={['student']}>
//               <ViewResultDetails />
//             </PrivateRoute>
//           }
//         />
        
//         <Route
//           path="/student-profile"
//           element={
//             <PrivateRoute allowedRoles={['student']}>
//               <StudentProfile />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/give-exam/:id"
//           element={
//             <PrivateRoute allowedRoles={['student']}>
//               <GiveExam />
//             </PrivateRoute>
//           }
//         />

//         {/* teacher-only pages */}
//         <Route
//           path="/tdashboard"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <TDashboard />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/studentmanagement"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <StudentManagement />
//             </PrivateRoute>
//           }
//         />
//         {/* <Route
//           path="/add-student"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <AddStudent />
//             </PrivateRoute>
//           }
//         /> */}
//         <Route
//           path="/manageexams"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <ManageExams />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/createexam"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <CreateExam />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/editexam/:id"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <EditExam />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/reviewcheating"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <ReviewCheating />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/viewresults"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <ViewResults />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/examschedule"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <ExamSchedule />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/teacherprofile"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <TeacherProfile />
//             </PrivateRoute>
//           }
//         />
//         {/* ← NEW ROUTE for subject’s students */}
//         <Route
//           path="/subjects/:id/students"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <SubjectStudents />
//             </PrivateRoute>
//           }
//         />
//         <Route
//           path="/add-subject"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <AddSubject />
//             </PrivateRoute>
//           }
//         />

//         {/* catch-all */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }




import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

// Removed PrivateRoute import

import SLogin            from './pages/SLogin';
import TLogin            from './pages/TLogin';
import Logout            from './pages/Logout';

import SDashboard        from './pages/SDashboard';
import TakeExam          from './pages/TakeExam';
import TestPage          from './pages/TestPage';
import ViewResult        from './pages/ViewResult';
import ViewResultDetails from './pages/ViewResultDetails';
import StudentProfile    from './pages/StudentProfile';
import GiveExam          from './pages/GiveExam';
import ViewAnswers       from './pages/ViewAnswers';

import TDashboard        from './pages/TDashboard';
import StudentManagement from './pages/StudentManagement';
import ManageExams       from './pages/ManageExams';
import CreateExam        from './pages/CreateExam';
import EditExam          from './pages/EditExam';
import ReviewCheating    from './pages/ReviewCheating';
import ViewTeacherResults       from './pages/ViewTeacherResults';
import ExamSchedule      from './pages/ExamSchedule';
import TeacherProfile    from './pages/TeacherProfile';

import SubjectStudents   from './pages/SubjectStudents';
import AddSubject        from './pages/AddSubject';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* default to student login */}
        <Route path="/" element={<Navigate to="/slogin" replace />} />

        {/* public auth */}
        <Route path="/slogin" element={<SLogin />} />
        <Route path="/tlogin" element={<TLogin />} />

        {/* logout */}
        <Route path="/logout" element={<Logout />} />

        {/* student-only pages (now accessible directly) */}
        <Route path="/sdashboard" element={<SDashboard />} />
        <Route path="/take-exam" element={<TakeExam />} />
        <Route path="/take-exam/test-page" element={<TestPage />} />
        <Route path="/view-result" element={<ViewResult />} />
        {/* <Route path="/view-result-detail" element={<ViewResultDetails />} /> */}
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/give-exam/:id" element={<GiveExam />} />
        {/* // after: */}
<Route path="/view-result-details/:subjectId" element={<ViewResultDetails />} />
{/* // …and if you want a separate answers page: */}
<Route path="/view-answers/:submissionId" element={<ViewAnswers />} />

        {/* teacher-only pages (now accessible directly) */}
        <Route path="/tdashboard" element={<TDashboard />} />
        <Route path="/studentmanagement" element={<StudentManagement />} />
        <Route path="/manageexams" element={<ManageExams />} />
        <Route path="/createexam" element={<CreateExam />} />
        <Route path="/editexam/:id" element={<EditExam />} />
        <Route path="/reviewcheating" element={<ReviewCheating />} />
        <Route path="/viewresults" element={<ViewTeacherResults />} />
        <Route path="/examschedule" element={<ExamSchedule />} />
        <Route path="/teacherprofile" element={<TeacherProfile />} />
        <Route path="/subjects/:id/students" element={<SubjectStudents />} />
        <Route path="/add-subject" element={<AddSubject />} />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
