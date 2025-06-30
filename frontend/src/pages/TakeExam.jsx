// // src/pages/TakeExam.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Sidebar from '../components/SSidebar';
// import StudentHeader from '../components/SHeader';

// export default function TakeExam() {
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sections, setSections] = useState([]);
//   const [expanded, setExpanded] = useState(null);

//   useEffect(() => {
//     async function loadAvailable() {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch('/api/exams/available?includeAttempted=true', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (!res.ok) throw new Error('Failed to load exams');
//         const data = await res.json();

//         setSections(
//           data.map(group => ({
//             id: `${group.year}${group.session}`,
//             label: `${group.year} – ${
//               group.session.charAt(0).toUpperCase() + group.session.slice(1)
//             } Semester`,
//             exams: group.exams.map(e => ({
//               examId:       e._id,
//               _id:          e._id,            // ← keep for TestPage
//               subjectName:  e.subjectName,
//               examNo:       e.examNo,
//               semester:     e.semester,
//               duration:     e.duration,
//               scheduleDate: e.scheduleDate,
//               scheduleTime: e.scheduleTime,
//               attempted:    e.attempted,
//               submissionId: e.submissionId
//             }))
//           }))
//         );

//         // auto-expand first group
//         if (data.length) {
//           setExpanded(`${data[0].year}${data[0].session}`);
//         }
//       } catch (err) {
//         console.error(err);
//         alert('Failed to load available exams');
//       }
//     }
//     loadAvailable();
//   }, []);

//   const toggleSidebar  = () => setSidebarOpen(o => !o);
//   const toggleSection  = id => setExpanded(expanded === id ? null : id);

//   return (
//     <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
//       <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//         <StudentHeader toggleSidebar={toggleSidebar} />

//         <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
//           <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-6">
//             Take Exam
//           </h1>

//           {sections.map(sec => {
//             // group by subjectName
//             const bySubject = sec.exams.reduce((acc, e) => {
//               (acc[e.subjectName] ||= []).push(e);
//               return acc;
//             }, {});

//             return (
//               <section key={sec.id} className="mb-6">
//                 <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                   {/* Section header */}
//                   <button
//                     onClick={() => toggleSection(sec.id)}
//                     className="w-full bg-[#002855] text-white px-4 md:px-6 py-2 md:py-3 flex justify-between items-center font-medium"
//                   >
//                     <span className="text-[16px] md:text-lg">{sec.label}</span>
//                     <span className="text-sm">
//                       {expanded === sec.id ? '▲' : '▼'}
//                     </span>
//                   </button>

//                   {/* Section body */}
//                   {expanded === sec.id && (
//                     <div className="divide-y divide-gray-200">
//                       {Object.entries(bySubject).map(([subjectName, exams]) => (
//                         <div
//                           key={subjectName}
//                           onClick={() =>
//                             navigate('/take-exam/test-page', { state: { exams } })
//                           }
//                           className="px-4 md:px-6 py-2 md:py-3 bg-white cursor-pointer hover:bg-gray-100 transition flex items-center"
//                         >
//                           {/* Only the subject name now */}
//                           <span className="text-gray-800">{subjectName}</span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </section>
//             );
//           })}

//           {!sections.length && (
//             <p className="text-center text-gray-500">No exams found for you.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }









// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Sidebar from '../components/SSidebar';
// import StudentHeader from '../components/SHeader';

// export default function TakeExam() {
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sections, setSections] = useState([]);
//   const [expanded, setExpanded] = useState(null);

//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   useEffect(() => {
//     async function loadAvailable() {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch(
//           `${API_BASE_URL}/api/exams/available?includeAttempted=true`,
//           {
//             headers: { Authorization: `Bearer ${token}` }
//           }
//         );
//         if (!res.ok) throw new Error('Failed to load exams');
//         const data = await res.json();

//         setSections(
//           data.map(group => ({
//             id: `${group.year}${group.session}`,
//             label: `${group.year} – ${
//               group.session.charAt(0).toUpperCase() + group.session.slice(1)
//             } Semester`,
//             exams: group.exams.map(e => ({
//               examId:       e._id,
//               _id:          e._id,
//               subjectName:  e.subjectName,
//               examNo:       e.examNo,
//               semester:     e.semester,
//               duration:     e.duration,
//               scheduleDate: e.scheduleDate,
//               scheduleTime: e.scheduleTime,
//               attempted:    e.attempted,
//               submissionId: e.submissionId
//             }))
//           }))
//         );

//         if (data.length) {
//           setExpanded(`${data[0].year}${data[0].session}`);
//         }
//       } catch (err) {
//         console.error(err);
//         alert('Failed to load available exams');
//       }
//     }
//     loadAvailable();
//   }, [API_BASE_URL]);

//   const toggleSidebar = () => setSidebarOpen(o => !o);
//   const toggleSection = id => setExpanded(expanded === id ? null : id);

//   return (
//     <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
//       <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//         <StudentHeader toggleSidebar={toggleSidebar} />

//         <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
//           <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-6">
//             Take Exam
//           </h1>

//           {sections.map(sec => {
//             const bySubject = sec.exams.reduce((acc, e) => {
//               (acc[e.subjectName] ||= []).push(e);
//               return acc;
//             }, {});

//             return (
//               <section key={sec.id} className="mb-6">
//                 <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                   <button
//                     onClick={() => toggleSection(sec.id)}
//                     className="w-full bg-[#002855] text-white px-4 md:px-6 py-2 md:py-3 flex justify-between items-center font-medium"
//                   >
//                     <span className="text-[16px] md:text-lg">{sec.label}</span>
//                     <span className="text-sm">
//                       {expanded === sec.id ? '▲' : '▼'}
//                     </span>
//                   </button>

//                   {expanded === sec.id && (
//                     <div className="divide-y divide-gray-200">
//                       {Object.entries(bySubject).map(([subjectName, exams]) => (
//                         <div
//                           key={subjectName}
//                           onClick={() =>
//                             navigate('/take-exam/test-page', { state: { exams } })
//                           }
//                           className="px-4 md:px-6 py-2 md:py-3 bg-white cursor-pointer hover:bg-gray-100 transition flex items-center"
//                         >
//                           <span className="text-gray-800">{subjectName}</span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </section>
//             );
//           })}

//           {!sections.length && (
//             <p className="text-center text-gray-500">No exams found for you.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }






// src/pages/TakeExam.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import StudentHeader from '../components/SHeader';

export default function TakeExam() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    async function loadAvailable() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${API_BASE_URL}/api/exams/available?includeAttempted=true`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!res.ok) throw new Error('Failed to load exams');
        const data = await res.json();

        setSections(
          data.map(group => ({
            id: `${group.year}${group.session}`,
            label: `${group.year} – ${
              group.session.charAt(0).toUpperCase() + group.session.slice(1)
            } Semester`,
            exams: group.exams.map(e => ({
              examId:       e._id,
              _id:          e._id,
              subjectName:  e.subjectName,
              examNo:       e.examNo,
              semester:     e.semester,
              duration:     e.duration,
              scheduleDate: e.scheduleDate,
              scheduleTime: e.scheduleTime,
              attempted:    e.attempted,
              submissionId: e.submissionId
            }))
          }))
        );

        if (data.length) {
          setExpanded(`${data[0].year}${data[0].session}`);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load available exams');
      }
    }
    loadAvailable();
  }, [API_BASE_URL]);

  const toggleSidebar = () => setSidebarOpen(o => !o);
  const toggleSection = id => setExpanded(expanded === id ? null : id);

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <StudentHeader toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-6">
            Take Exam
          </h1>

          {sections.map(sec => {
            const bySubject = sec.exams.reduce((acc, e) => {
              (acc[e.subjectName] ||= []).push(e);
              return acc;
            }, {});

            return (
              <section key={sec.id} className="mb-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleSection(sec.id)}
                    className="w-full bg-[#002855] text-white px-4 md:px-6 py-2 md:py-3 flex justify-between items-center font-medium"
                  >
                    <span className="text-[16px] md:text-lg">{sec.label}</span>
                    <span className="text-sm">
                      {expanded === sec.id ? '▲' : '▼'}
                    </span>
                  </button>

                  {expanded === sec.id && (
                    <div className="divide-y divide-gray-200">
                      {Object.entries(bySubject).map(([subjectName, exams]) => (
                        <div
                          key={subjectName}
                          onClick={() =>
                            navigate('/take-exam/test-page', { state: { exams } })
                          }
                          className="px-4 md:px-6 py-2 md:py-3 bg-white cursor-pointer hover:bg-gray-100 transition flex items-center"
                        >
                          <span className="text-gray-800">{subjectName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          {!sections.length && (
            <p className="text-center text-gray-500">No exams found for you.</p>
          )}
        </div>
      </div>
    </div>
  );
}
