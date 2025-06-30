// // src/pages/TestPage.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import Sidebar from '../components/SSidebar';
// import SHeader from '../components/SHeader';

// /* 1 → 1st, 2 → 2nd … */
// const toOrdinal = n => {
//   const num = Number(n), rem100 = num % 100;
//   if (rem100 >= 11 && rem100 <= 13) return `${num}th`;
//   switch (num % 10) {
//     case 1: return `${num}st`;
//     case 2: return `${num}nd`;
//     case 3: return `${num}rd`;
//     default: return `${num}th`;
//   }
// };

// function useFormatted(exam) {
//   return useMemo(() => {
//     if (!exam?.scheduleDate) return {};
//     const dt = new Date(exam.scheduleDate);
//     if (exam.scheduleTime) {
//       const [hh, mm] = exam.scheduleTime.split(':').map(Number);
//       dt.setHours(hh, mm, 0, 0);
//     }
//     return {
//       examDate: dt.toLocaleDateString(),
//       examTime: dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
//       dateTime: dt
//     };
//   }, [exam.scheduleDate, exam.scheduleTime]);
// }

// const getStatus = (exam, dateTime) => {
//   if (exam?.attempted) return 'Attempted';
//   if (!dateTime) return '';
//   const now = new Date();
//   if (dateTime.toDateString() === now.toDateString()) return 'Ongoing';
//   return dateTime > now ? 'Scheduled' : 'Completed';
// };

// export default function TestPage() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const toggleSidebar = () => setSidebarOpen(o => !o);

//   const { state } = useLocation();
//   const navigate  = useNavigate();
//   const exams     = state?.exams ?? (state?.exam ? [state.exam] : []);

//   // State for submissionId, so we can re-render on storage events
//   const [subId, setSubId] = useState(() => {
//     const first = exams[0];
//     return first
//       ? first.submissionId || localStorage.getItem(`submission_${first._id}`)
//       : null;
//   });

//   useEffect(() => {
//     if (!exams.length) navigate(-1);
//   }, [exams, navigate]);

//   // Listen for other-window storage events
//   useEffect(() => {
//     const key = exams[0]? `submission_${exams[0]._id}` : null;
//     if (!key) return;
//     const onStorage = e => {
//       if (e.key === key) {
//         setSubId(e.newValue);
//       }
//     };
//     window.addEventListener('storage', onStorage);
//     return () => window.removeEventListener('storage', onStorage);
//   }, [exams]);

//   if (exams.length > 1) {
//     return (
//       <Layout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
//         <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
//           Choose Your Exam
//         </h2>
//         <div className="space-y-4 [@media(min-width:486px)]:hidden">
//           {exams.map((exam, i) => (
//             <ExamCard key={i} exam={exam} nav={navigate} />
//           ))}
//         </div>
//         <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-x-auto">
//           <table className="w-full text-left">
//             <TableHead />
//             <tbody className="text-black text-md divide-y divide-gray-200">
//               {exams.map(exam => (
//                 <ExamRow key={exam._id} exam={exam} nav={navigate} />
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </Layout>
//     );
//   }

//   const exam      = exams[0];
//   const formatted = useFormatted(exam);
//   const examDate  = formatted.examDate;
//   const examTime  = formatted.examTime;
//   const status    = getStatus(exam, formatted.dateTime);

//   return (
//     <Layout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
//       <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
//         Exam Details
//       </h2>
//       <div className="bg-white rounded-xl shadow-md overflow-hidden">
//         <div className="space-y-4 [@media(min-width:486px)]:hidden px-4 py-4">
//           <DetailRow label="Subject:"  value={exam.subjectName} />
//           <DetailRow label="Exam No:"  value={exam.examNo} />
//           <DetailRow label="Semester:" value={toOrdinal(exam.semester)} />
//           <DetailRow label="Date:"     value={examDate || '—'} />
//           <DetailRow label="Time:"     value={examTime || '—'} />
//           <DetailRow label="Duration:" value={`${exam.duration} minutes`} />
//           <DetailRow label="Status:"   value={status} />
//           <div className="text-right pt-2">
//             <ActionButton exam={exam} storedSubId={subId} />
//           </div>
//         </div>
//         <div className="hidden [@media(min-width:486px)]:block overflow-x-auto">
//           <table className="w-full text-left">
//             <TableHead />
//             <tbody className="text-black text-md divide-y divide-gray-200">
//               <ExamRow exam={exam} nav={navigate} />
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// const Layout = ({ children, sidebarOpen, toggleSidebar }) => (
//   <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
//     <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
//     <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//       <SHeader toggleSidebar={toggleSidebar} />
//       <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">{children}</div>
//     </div>
//   </div>
// );

// const TableHead = () => (
//   <thead className="bg-[#002855] text-white text-sm font-light">
//     <tr>
//       <th className="p-3 rounded-tl-xl">Subject</th>
//       <th className="p-3">Exam No</th>
//       <th className="p-3">Semester</th>
//       <th className="p-3">Date</th>
//       <th className="p-3">Time</th>
//       <th className="p-3">Duration</th>
//       <th className="p-3">Status</th>
//       <th className="p-3 rounded-tr-xl">Action</th>
//     </tr>
//   </thead>
// );

// function ExamCard({ exam, nav }) {
//   const { examDate, examTime, dateTime } = useFormatted(exam);
//   const status = getStatus(exam, dateTime);
//   return (
//     <div
//       onClick={() => nav('/take-exam/test-page', { state: { exam } })}
//       className="cursor-pointer bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
//     >
//       <DetailRow label="Subject:"  value={exam.subjectName} />
//       <DetailRow label="Exam No.:" value={exam.examNo} />
//       <DetailRow label="Semester:" value={toOrdinal(exam.semester)} />
//       <DetailRow label="Date:"     value={examDate || '—'} />
//       <DetailRow label="Time:"     value={examTime || '—'} />
//       <DetailRow label="Duration:" value={`${exam.duration} minutes`} />
//       <DetailRow label="Status:"   value={status} />
//       <div className="text-right pt-2">
//         <ActionButton exam={exam} storedSubId={localStorage.getItem(`submission_${exam._id}`)} />
//       </div>
//     </div>
//   );
// }

// function ExamRow({ exam, nav }) {
//   const { examDate, examTime, dateTime } = useFormatted(exam);
//   const status = getStatus(exam, dateTime);
//   return (
//     <tr className="hover:bg-gray-50 cursor-pointer">
//       <td className="p-3">{exam.subjectName}</td>
//       <td className="p-3">{exam.examNo}</td>
//       <td className="p-3">{toOrdinal(exam.semester)}</td>
//       <td className="p-3">{examDate || '—'}</td>
//       <td className="p-3">{examTime || '—'}</td>
//       <td className="p-3">{exam.duration} minutes</td>
//       <td className="p-3">{status}</td>
//       <td className="p-3">
//         <ActionButton exam={exam} storedSubId={localStorage.getItem(`submission_${exam._id}`)} />
//       </td>
//     </tr>
//   );
// }

// export function ActionButton({ exam }) {
//   const navigate = useNavigate();

//   // 1) Track submission ID from localStorage or props
//   const storageKey = `submission_${exam._id}`;
//   const [submissionId, setSubmissionId] = useState(
//     () => localStorage.getItem(storageKey) || exam.submissionId
//   );
//   const attempted = Boolean(submissionId);

//   // 2) Listen for cross-tab storage events
//   useEffect(() => {
//     function onStorage(e) {
//       if (e.key === storageKey) {
//         setSubmissionId(e.newValue);
//       }
//     }
//     window.addEventListener('storage', onStorage);
//     return () => window.removeEventListener('storage', onStorage);
//   }, [storageKey]);

//   // 3) Compute the exact DateTime when exam becomes available
//   const scheduled = useMemo(() => {
//     const dt = new Date(exam.scheduleDate);
//     const [hh, mm] = (exam.scheduleTime || '00:00')
//       .split(':')
//       .map(Number);
//     dt.setHours(hh, mm, 0, 0);
//     return dt;
//   }, [exam.scheduleDate, exam.scheduleTime]);

//   const now = Date.now();
//   const tooEarly = now < scheduled.getTime();

//   // 4) Auto-enable at scheduled time
//   const [ready, setReady] = useState(!tooEarly);
//   useEffect(() => {
//     if (tooEarly) {
//       const ms = scheduled.getTime() - Date.now();
//       const timer = setTimeout(() => setReady(true), ms);
//       return () => clearTimeout(timer);
//     }
//   }, [tooEarly, scheduled]);

//   // 5) Disable if not attempted and not yet ready
//   const isDisabled = !attempted && !ready;

//   // 6) Click handler: view answers or open exam window
//   const handleClick = e => {
//     e.stopPropagation();
//     if (attempted) {
//       navigate(`/view-answers/${submissionId}`);
//     } else if (ready) {
//       const url = `${window.location.origin}/give-exam/${exam._id}`;
//       const features = [
//         `left=0`,
//         `top=0`,
//         `width=${screen.availWidth}`,
//         `height=${screen.availHeight}`,
//         `fullscreen=yes`,
//         `toolbar=no`,
//         `menubar=no`,
//         `location=no`,
//         `status=no`,
//         `scrollbars=no`,
//         `resizable=no`,
//       ].join(',');
//       const win = window.open(url, '_blank', features);
//       if (win) {
//         win.moveTo(0, 0);
//         win.resizeTo(screen.availWidth, screen.availHeight);
//         win.focus();
//       }
//     }
//   };

//   return (
//     <button
//       onClick={handleClick}
//       disabled={isDisabled}
//       className={`
//         px-3 py-1 rounded transition
//         bg-[#003366] text-white hover:bg-blue-700
//         ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
//       `}
//       title={!ready && !attempted ? `Available at ${scheduled.toLocaleString()}` : ''}
//     >
//       {attempted ? 'View Answers' : 'Start Test'}
//     </button>
//   );
// }

// const DetailRow = ({ label, value }) => (
//   <div className="flex justify-between py-2">
//     <span className="font-semibold text-[#002855]">{label}</span>
//     <span>{value}</span>
//   </div>
// );









// import React, { useState, useEffect, useMemo } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import Sidebar from '../components/SSidebar';
// import SHeader from '../components/SHeader';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // → Ordinal helper: 1 → 1st, 2 → 2nd, 3 → 3rd
// const toOrdinal = n => {
//   const num = Number(n), rem100 = num % 100;
//   if (rem100 >= 11 && rem100 <= 13) return `${num}th`;
//   switch (num % 10) {
//     case 1: return `${num}st`;
//     case 2: return `${num}nd`;
//     case 3: return `${num}rd`;
//     default: return `${num}th`;
//   }
// };

// function useFormatted(exam) {
//   return useMemo(() => {
//     if (!exam?.scheduleDate) return {};
//     const dt = new Date(exam.scheduleDate);
//     if (exam.scheduleTime) {
//       const [hh, mm] = exam.scheduleTime.split(':').map(Number);
//       dt.setHours(hh, mm, 0, 0);
//     }
//     return {
//       examDate: dt.toLocaleDateString(),
//       examTime: dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
//       dateTime: dt
//     };
//   }, [exam.scheduleDate, exam.scheduleTime]);
// }

// const getStatus = (exam, dateTime) => {
//   if (exam?.attempted) return 'Attempted';
//   if (!dateTime) return '';
//   const now = new Date();
//   if (dateTime.toDateString() === now.toDateString()) return 'Ongoing';
//   return dateTime > now ? 'Scheduled' : 'Completed';
// };

// export default function TestPage() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const toggleSidebar = () => setSidebarOpen(o => !o);

//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const exams = state?.exams ?? (state?.exam ? [state.exam] : []);

//   const [subId, setSubId] = useState(() => {
//     const first = exams[0];
//     return first
//       ? first.submissionId || localStorage.getItem(`submission_${first._id}`)
//       : null;
//   });

//   useEffect(() => {
//     if (!exams.length) navigate(-1);
//   }, [exams, navigate]);

//   useEffect(() => {
//     const key = exams[0] ? `submission_${exams[0]._id}` : null;
//     if (!key) return;
//     const onStorage = e => {
//       if (e.key === key) {
//         setSubId(e.newValue);
//       }
//     };
//     window.addEventListener('storage', onStorage);
//     return () => window.removeEventListener('storage', onStorage);
//   }, [exams]);

//   if (exams.length > 1) {
//     return (
//       <Layout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
//         <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
//           Choose Your Exam
//         </h2>
//         <div className="space-y-4 [@media(min-width:486px)]:hidden">
//           {exams.map((exam, i) => (
//             <ExamCard key={i} exam={exam} nav={navigate} />
//           ))}
//         </div>
//         <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-x-auto">
//           <table className="w-full text-left">
//             <TableHead />
//             <tbody className="text-black text-md divide-y divide-gray-200">
//               {exams.map(exam => (
//                 <ExamRow key={exam._id} exam={exam} nav={navigate} />
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </Layout>
//     );
//   }

//   const exam = exams[0];
//   const formatted = useFormatted(exam);
//   const examDate = formatted.examDate;
//   const examTime = formatted.examTime;
//   const status = getStatus(exam, formatted.dateTime);

//   return (
//     <Layout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
//       <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
//         Exam Details
//       </h2>
//       <div className="bg-white rounded-xl shadow-md overflow-hidden">
//         <div className="space-y-4 [@media(min-width:486px)]:hidden px-4 py-4">
//           <DetailRow label="Subject:" value={exam.subjectName} />
//           <DetailRow label="Exam No:" value={exam.examNo} />
//           <DetailRow label="Semester:" value={toOrdinal(exam.semester)} />
//           <DetailRow label="Date:" value={examDate || '—'} />
//           <DetailRow label="Time:" value={examTime || '—'} />
//           <DetailRow label="Duration:" value={`${exam.duration} minutes`} />
//           <DetailRow label="Status:" value={status} />
//           <div className="text-right pt-2">
//             <ActionButton exam={exam} storedSubId={subId} />
//           </div>
//         </div>
//         <div className="hidden [@media(min-width:486px)]:block overflow-x-auto">
//           <table className="w-full text-left">
//             <TableHead />
//             <tbody className="text-black text-md divide-y divide-gray-200">
//               <ExamRow exam={exam} nav={navigate} />
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// const Layout = ({ children, sidebarOpen, toggleSidebar }) => (
//   <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
//     <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
//     <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//       <SHeader toggleSidebar={toggleSidebar} />
//       <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">{children}</div>
//     </div>
//   </div>
// );

// const TableHead = () => (
//   <thead className="bg-[#002855] text-white text-sm font-light">
//     <tr>
//       <th className="p-3 rounded-tl-xl">Subject</th>
//       <th className="p-3">Exam No</th>
//       <th className="p-3">Semester</th>
//       <th className="p-3">Date</th>
//       <th className="p-3">Time</th>
//       <th className="p-3">Duration</th>
//       <th className="p-3">Status</th>
//       <th className="p-3 rounded-tr-xl">Action</th>
//     </tr>
//   </thead>
// );

// function ExamCard({ exam, nav }) {
//   const { examDate, examTime, dateTime } = useFormatted(exam);
//   const status = getStatus(exam, dateTime);
//   return (
//     <div
//       onClick={() => nav('/take-exam/test-page', { state: { exam } })}
//       className="cursor-pointer bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
//     >
//       <DetailRow label="Subject:" value={exam.subjectName} />
//       <DetailRow label="Exam No.:" value={exam.examNo} />
//       <DetailRow label="Semester:" value={toOrdinal(exam.semester)} />
//       <DetailRow label="Date:" value={examDate || '—'} />
//       <DetailRow label="Time:" value={examTime || '—'} />
//       <DetailRow label="Duration:" value={`${exam.duration} minutes`} />
//       <DetailRow label="Status:" value={status} />
//       <div className="text-right pt-2">
//         <ActionButton exam={exam} storedSubId={localStorage.getItem(`submission_${exam._id}`)} />
//       </div>
//     </div>
//   );
// }

// function ExamRow({ exam, nav }) {
//   const { examDate, examTime, dateTime } = useFormatted(exam);
//   const status = getStatus(exam, dateTime);
//   return (
//     <tr className="hover:bg-gray-50 cursor-pointer">
//       <td className="p-3">{exam.subjectName}</td>
//       <td className="p-3">{exam.examNo}</td>
//       <td className="p-3">{toOrdinal(exam.semester)}</td>
//       <td className="p-3">{examDate || '—'}</td>
//       <td className="p-3">{examTime || '—'}</td>
//       <td className="p-3">{exam.duration} minutes</td>
//       <td className="p-3">{status}</td>
//       <td className="p-3">
//         <ActionButton exam={exam} storedSubId={localStorage.getItem(`submission_${exam._id}`)} />
//       </td>
//     </tr>
//   );
// }

// export function ActionButton({ exam }) {
//   const navigate = useNavigate();

//   const storageKey = `submission_${exam._id}`;
//   const [submissionId, setSubmissionId] = useState(
//     () => localStorage.getItem(storageKey) || exam.submissionId
//   );
//   const attempted = Boolean(submissionId);

//   useEffect(() => {
//     function onStorage(e) {
//       if (e.key === storageKey) {
//         setSubmissionId(e.newValue);
//       }
//     }
//     window.addEventListener('storage', onStorage);
//     return () => window.removeEventListener('storage', onStorage);
//   }, [storageKey]);

//   const scheduled = useMemo(() => {
//     const dt = new Date(exam.scheduleDate);
//     const [hh, mm] = (exam.scheduleTime || '00:00').split(':').map(Number);
//     dt.setHours(hh, mm, 0, 0);
//     return dt;
//   }, [exam.scheduleDate, exam.scheduleTime]);

//   const now = Date.now();
//   const tooEarly = now < scheduled.getTime();
//   const [ready, setReady] = useState(!tooEarly);

//   useEffect(() => {
//     if (tooEarly) {
//       const ms = scheduled.getTime() - Date.now();
//       const timer = setTimeout(() => setReady(true), ms);
//       return () => clearTimeout(timer);
//     }
//   }, [tooEarly, scheduled]);

//   const isDisabled = !attempted && !ready;

//   // const handleClick = e => {
//   //   e.stopPropagation();
//   //   if (attempted) {
//   //     navigate(`/view-answers/${submissionId}`);
//   //   } else if (ready) {
//   //     const url = `${window.location.origin}/give-exam/${exam._id}`;
//   //     const features = [
//   //       `left=0`,
//   //       `top=0`,
//   //       `width=${screen.availWidth}`,
//   //       `height=${screen.availHeight}`,
//   //       `fullscreen=yes`,
//   //       `toolbar=no`,
//   //       `menubar=no`,
//   //       `location=no`,
//   //       `status=no`,
//   //       `scrollbars=no`,
//   //       `resizable=no`,
//   //     ].join(',');
//   //     const win = window.open(url, '_blank', features);
//   //     if (win) {
//   //       win.moveTo(0, 0);
//   //       win.resizeTo(screen.availWidth, screen.availHeight);
//   //       win.focus();
//   //     }
//   //   }
//   // };

// // requirement for checking the camera permission before starting the exam
//   const handleClick = async (e) => {
//   e.stopPropagation();
//   if (attempted) {
//     navigate(`/view-answers/${submissionId}`);
//   } else if (ready) {
//     try {
//       // 🔥 Check camera permission
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       stream.getTracks().forEach(track => track.stop()); // stop the stream after check

//       // ✅ If camera is accessible, open exam
//       const url = `${window.location.origin}/give-exam/${exam._id}`;
//       const features = [
//         `left=0`,
//         `top=0`,
//         `width=${screen.availWidth}`,
//         `height=${screen.availHeight}`,
//         `fullscreen=yes`,
//         `toolbar=no`,
//         `menubar=no`,
//         `location=no`,
//         `status=no`,
//         `scrollbars=no`,
//         `resizable=no`,
//       ].join(',');
//       const win = window.open(url, '_blank', features);
//       if (win) {
//         win.moveTo(0, 0);
//         win.resizeTo(screen.availWidth, screen.availHeight);
//         win.focus();
//       }

//     } catch (err) {
//       // ❌ Camera blocked or error
//       alert('⚠️ Please enable your camera to start the exam.');
//     }
//   }
// };


//   return (
//     <button
//       onClick={handleClick}
//       disabled={isDisabled}
//       className={`px-3 py-1 rounded transition bg-[#003366] text-white hover:bg-blue-700 ${
//         isDisabled ? 'opacity-50 cursor-not-allowed' : ''
//       }`}
//       title={!ready && !attempted ? `Available at ${scheduled.toLocaleString()}` : ''}
//     >
//       {attempted ? 'View Answers' : 'Start Test'}
//     </button>
//   );
// }

// const DetailRow = ({ label, value }) => (
//   <div className="flex justify-between py-2">
//     <span className="font-semibold text-[#002855]">{label}</span>
//     <span>{value}</span>
//   </div>
// );







// yeh mera full tested code hy sirf window giveexam ki exit krne pr button start test se nai
//nai change hota hy 

// src/pages/TestPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import SHeader from '../components/SHeader';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// → Ordinal helper: 1 → 1st, 2 → 2nd, 3 → 3rd
const toOrdinal = n => {
  const num = Number(n), rem100 = num % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${num}th`;
  switch (num % 10) {
    case 1: return `${num}st`;
    case 2: return `${num}nd`;
    case 3: return `${num}rd`;
    default: return `${num}th`;
  }
};

function useFormatted(exam) {
  return useMemo(() => {
    if (!exam?.scheduleDate) return {};
    const dt = new Date(exam.scheduleDate);
    if (exam.scheduleTime) {
      const [hh, mm] = exam.scheduleTime.split(':').map(Number);
      dt.setHours(hh, mm, 0, 0);
    }
    return {
      examDate: dt.toLocaleDateString(),
      examTime: dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
      dateTime: dt
    };
  }, [exam.scheduleDate, exam.scheduleTime]);
}

const getStatus = (exam, dateTime) => {
  if (exam?.attempted) return 'Attempted';
  if (!dateTime) return '';
  const now = new Date();
  if (dateTime.toDateString() === now.toDateString()) return 'Ongoing';
  return dateTime > now ? 'Scheduled' : 'Completed';
};

export default function TestPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const { state } = useLocation();
  const navigate = useNavigate();
  const exams = state?.exams ?? (state?.exam ? [state.exam] : []);

  const [subId, setSubId] = useState(() => {
    const first = exams[0];
    return first
      ? first.submissionId || localStorage.getItem(`submission_${first._id}`)
      : null;
  });

  useEffect(() => {
    if (!exams.length) navigate(-1);
  }, [exams, navigate]);

  useEffect(() => {
    const key = exams[0] ? `submission_${exams[0]._id}` : null;
    if (!key) return;
    const onStorage = e => {
      if (e.key === key) {
        setSubId(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [exams]);

  if (exams.length > 1) {
    return (
      <Layout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
        <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
          Choose Your Exam
        </h2>
        <div className="space-y-4 [@media(min-width:486px)]:hidden">
          {exams.map((exam, i) => (
            <ExamCard key={i} exam={exam} nav={navigate} />
          ))}
        </div>
        <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="w-full text-left">
            <TableHead />
            <tbody className="text-black text-md divide-y divide-gray-200">
              {exams.map(exam => (
                <ExamRow key={exam._id} exam={exam} nav={navigate} />
              ))}
            </tbody>
          </table>
        </div>
      </Layout>
    );
  }

  const exam = exams[0];
  const formatted = useFormatted(exam);
  const examDate = formatted.examDate;
  const examTime = formatted.examTime;
  const status = getStatus(exam, formatted.dateTime);

  return (
    <Layout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
      <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
        Exam Details
      </h2>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="space-y-4 [@media(min-width:486px)]:hidden px-4 py-4">
          <DetailRow label="Subject:" value={exam.subjectName} />
          <DetailRow label="Exam No:" value={exam.examNo} />
          <DetailRow label="Semester:" value={toOrdinal(exam.semester)} />
          <DetailRow label="Date:" value={examDate || '—'} />
          <DetailRow label="Time:" value={examTime || '—'} />
          <DetailRow label="Duration:" value={`${exam.duration} minutes`} />
          <DetailRow label="Status:" value={status} />
          <div className="text-right pt-2">
            <ActionButton exam={exam} />
          </div>
        </div>
        <div className="hidden [@media(min-width:486px)]:block overflow-x-auto">
          <table className="w-full text-left">
            <TableHead />
            <tbody className="text-black text-md divide-y divide-gray-200">
              <ExamRow exam={exam} nav={navigate} />
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

const Layout = ({ children, sidebarOpen, toggleSidebar }) => (
  <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
    <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
      <SHeader toggleSidebar={toggleSidebar} />
      <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">{children}</div>
    </div>
  </div>
);

const TableHead = () => (
  <thead className="bg-[#002855] text-white text-sm font-light">
    <tr>
      <th className="p-3 rounded-tl-xl">Subject</th>
      <th className="p-3">Exam No</th>
      <th className="p-3">Semester</th>
      <th className="p-3">Date</th>
      <th className="p-3">Time</th>
      <th className="p-3">Duration</th>
      <th className="p-3">Status</th>
      <th className="p-3 rounded-tr-xl">Action</th>
    </tr>
  </thead>
);

function ExamCard({ exam, nav }) {
  const { examDate, examTime, dateTime } = useFormatted(exam);
  const status = getStatus(exam, dateTime);
  return (
    <div
      onClick={() => nav('/take-exam/test-page', { state: { exam } })}
      className="cursor-pointer bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
    >
      <DetailRow label="Subject:" value={exam.subjectName} />
      <DetailRow label="Exam No.:" value={exam.examNo} />
      <DetailRow label="Semester:" value={toOrdinal(exam.semester)} />
      <DetailRow label="Date:" value={examDate || '—'} />
      <DetailRow label="Time:" value={examTime || '—'} />
      <DetailRow label="Duration:" value={`${exam.duration} minutes`} />
      <DetailRow label="Status:" value={status} />
      <div className="text-right pt-2">
        <ActionButton exam={exam} />
      </div>
    </div>
  );
}

function ExamRow({ exam, nav }) {
  const { examDate, examTime, dateTime } = useFormatted(exam);
  const status = getStatus(exam, dateTime);
  return (
    <tr className="hover:bg-gray-50 cursor-pointer">
      <td className="p-3">{exam.subjectName}</td>
      <td className="p-3">{exam.examNo}</td>
      <td className="p-3">{toOrdinal(exam.semester)}</td>
      <td className="p-3">{examDate || '—'}</td>
      <td className="p-3">{examTime || '—'}</td>
      <td className="p-3">{`${exam.duration} minutes`}</td>
      <td className="p-3">{status}</td>
      <td className="p-3">
        <ActionButton exam={exam} />
      </td>
    </tr>
  );
}

export function ActionButton({ exam }) {
  const navigate = useNavigate();
  const storageKey = `submission_${exam._id}`;
  const [submissionId, setSubmissionId] = useState(
    () => localStorage.getItem(storageKey) || exam.submissionId
  );
  const attempted = Boolean(submissionId);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === storageKey) {
        setSubmissionId(e.newValue);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  const scheduled = useMemo(() => {
    const dt = new Date(exam.scheduleDate);
    const [hh, mm] = (exam.scheduleTime || '00:00').split(':').map(Number);
    dt.setHours(hh, mm, 0, 0);
    return dt;
  }, [exam.scheduleDate, exam.scheduleTime]);

  const now = Date.now();
  const tooEarly = now < scheduled.getTime();
  const [ready, setReady] = useState(!tooEarly);

  useEffect(() => {
    if (tooEarly) {
      const ms = scheduled.getTime() - Date.now();
      const timer = setTimeout(() => setReady(true), ms);
      return () => clearTimeout(timer);
    }
  }, [tooEarly, scheduled]);

  const isDisabled = !attempted && !ready;

  const handleClick = async e => {
    e.stopPropagation();
    if (attempted) {
      navigate(`/view-answers/${submissionId}`);
    } else if (ready) {
      try {
        // Check camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());

        const url = `${window.location.origin}/give-exam/${exam._id}`;
        const features = [
          `left=0`,
          `top=0`,
          `width=${screen.availWidth}`,
          `height=${screen.availHeight}`,
          `fullscreen=yes`,
          `toolbar=no`,
          `menubar=no`,
          `location=no`,
          `status=no`,
          `scrollbars=no`,
          `resizable=no`
        ].join(',');
        const win = window.open(url, '_blank', features);
        if (win) {
          win.moveTo(0, 0);
          win.resizeTo(screen.availWidth, screen.availHeight);
          win.focus();
        }
      } catch {
        alert('⚠️ Please enable your camera to start the exam.');
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`px-3 py-1 rounded transition bg-[#003366] text-white hover:bg-blue-700 ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={!ready && !attempted ? `Available at ${scheduled.toLocaleString()}` : ''}
    >
      {attempted ? 'View Answers' : 'Start Test'}
    </button>
  );
}

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2">
    <span className="font-semibold text-[#002855]">{label}</span>
    <span>{value}</span>
  </div>
);

