// // src/App.jsx
// import React from 'react';
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate
// } from 'react-router-dom';

// import PrivateRoute from './components/PrivateRoute';

// import SLogin              from './pages/SLogin';
// import SDashboard          from './pages/SDashboard';
// import TakeExam            from './pages/TakeExam';
// import TestPage            from './pages/TestPage';
// import ViewResult          from './pages/ViewResult';
// import ViewResultDetails   from './pages/ViewResultDetails';
// import StudentProfile      from './pages/StudentProfile';
// import GiveExam            from './pages/GiveExam';

// import TLogin              from './pages/TLogin';
// import TDashboard          from './pages/TDashboard';
// import StudentManagement   from './pages/StudentManagement';
// import AddStudent          from './pages/AddStudent';
// import ManageExams         from './pages/ManageExams';
// import CreateExam          from './pages/CreateExam';
// import ReviewCheating      from './pages/ReviewCheating';
// import ViewResults         from './pages/ViewResults';
// import ExamSchedule        from './pages/ExamSchedule';
// import TeacherProfile      from './pages/TeacherProfile';

// export default function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* default to student login */}
//         <Route path="/" element={<Navigate to="/slogin" replace />} />

//         {/* public auth */}
//         <Route path="/slogin" element={<SLogin />} />
//         <Route path="/tlogin" element={<TLogin />} />

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
//           path="/view-result-detail"
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
//           path="/give-exam"
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
//         <Route
//           path="/add-student"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <AddStudent />
//             </PrivateRoute>
//           }
//         />
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

//         {/* catch-all */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// src/App.jsx
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
// import AddStudent        from './pages/AddStudent';
// import ManageExams       from './pages/ManageExams';
// import CreateExam        from './pages/CreateExam';
// import ReviewCheating    from './pages/ReviewCheating';
// import ViewResults       from './pages/ViewResults';
// import ExamSchedule      from './pages/ExamSchedule';
// import TeacherProfile    from './pages/TeacherProfile';

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
//           path="/view-result-detail"
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
//           path="/give-exam"
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
//         <Route
//           path="/add-student"
//           element={
//             <PrivateRoute allowedRoles={['teacher']}>
//               <AddStudent />
//             </PrivateRoute>
//           }
//         />
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

//         {/* catch-all */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// src/App.jsx
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';

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

import TDashboard        from './pages/TDashboard';
import StudentManagement from './pages/StudentManagement';
import AddStudent        from './pages/AddStudent';
import ManageExams       from './pages/ManageExams';
import CreateExam        from './pages/CreateExam';
import EditExam          from './pages/EditExam';           // <-- Naya import
import ReviewCheating    from './pages/ReviewCheating';
import ViewResults       from './pages/ViewResults';
import ExamSchedule      from './pages/ExamSchedule';
import TeacherProfile    from './pages/TeacherProfile';

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

        {/* student-only pages */}
        <Route
          path="/sdashboard"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <SDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/take-exam"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <TakeExam />
            </PrivateRoute>
          }
        />
        <Route
          path="/take-exam/test-page"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <TestPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/view-result"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <ViewResult />
            </PrivateRoute>
          }
        />
        <Route
          path="/view-result-detail"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <ViewResultDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/student-profile"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <StudentProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/give-exam"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <GiveExam />
            </PrivateRoute>
          }
        />

        {/* teacher-only pages */}
        <Route
          path="/tdashboard"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <TDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/studentmanagement"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <StudentManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-student"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <AddStudent />
            </PrivateRoute>
          }
        />
        <Route
          path="/manageexams"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <ManageExams />
            </PrivateRoute>
          }
        />
        <Route
          path="/createexam"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <CreateExam />
            </PrivateRoute>
          }
        />
        <Route
          path="/editexam/:id"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <EditExam />
            </PrivateRoute>
          }
        />
        <Route
          path="/reviewcheating"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <ReviewCheating />
            </PrivateRoute>
          }
        />
        <Route
          path="/viewresults"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <ViewResults />
            </PrivateRoute>
          }
        />
        <Route
          path="/examschedule"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <ExamSchedule />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacherprofile"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <TeacherProfile />
            </PrivateRoute>
          }
        />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
