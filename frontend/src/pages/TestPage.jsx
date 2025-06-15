// // File: src/pages/TestPage.jsx
// import React, { useEffect, useMemo } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import Sidebar from '../components/SSidebar';
// import SHeader from '../components/SHeader';

// /** Convert 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th", etc. */
// function toOrdinal(n) {
//   const num = Number(n);
//   const rem100 = num % 100;
//   if (rem100 >= 11 && rem100 <= 13) return `${num}th`;
//   switch (num % 10) {
//     case 1: return `${num}st`;
//     case 2: return `${num}nd`;
//     case 3: return `${num}rd`;
//     default: return `${num}th`;
//   }
// }


// export default function TestPage() {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const exam = state?.exam;

//   useEffect(() => {
//     if (!exam) navigate(-1);
//   }, [exam, navigate]);

//   // combine date + time into one Date
//   const dateTime = useMemo(() => {
//     if (!exam) return null;
//     const dt = new Date(exam.scheduleDate);
//     const [h, m] = exam.scheduleTime.split(':').map(Number);
//     dt.setHours(h, m);
//     return dt;
//   }, [exam]);

//   const examDate = dateTime?.toLocaleDateString();
//   const examTime = dateTime?.toLocaleTimeString([], {
//     hour: 'numeric',
//     minute: '2-digit',
//     hour12: true
//   });

//   const status = useMemo(() => {
//     if (!dateTime) return '';
//     const now = new Date();
//     if (dateTime.toDateString() === now.toDateString()) return 'Ongoing';
//     return dateTime > now ? 'Scheduled' : 'Completed';
//   }, [dateTime]);

//   if (!exam) return null;
//   return (
//     <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
//       <Sidebar isOpen={false} toggleSidebar={() => {}} />
//       <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//         <SHeader toggleSidebar={() => {}} />

//         <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
//           {/* Header + Back */}
//           <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
//             <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-2 md:mb-0">
//               Take Exam
//             </h1>
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-2 text-[#2c3e50] bg-white hover:bg-gray-100 border border-gray-300 px-4 py-2 rounded-full transition"
//             >
//               <span className="text-xl">←</span>
//               <span className="font-semibold text-sm">Back</span>
//             </button>
//           </div>

//           <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
//             Exam Details
//           </h2>

//           {/* Mobile Card */}
//           <div className="space-y-4 [@media(min-width:486px)]:hidden">
//             <DetailRow label="Subject:" value={exam.subjectName} />
//             <DetailRow label="Semester:" value={toOrdinal(exam.semester)} />
//             <DetailRow label="Date:" value={examDate} />
//             <DetailRow label="Time:" value={examTime} />
//             <DetailRow label="Duration:" value={`${exam.duration} minutes`} />
//             <DetailRow label="Status:" value={status} />
//             <div className="text-right pt-2">
//               <button
//                 onClick={() => navigate(`/give-exam/${exam.examId}`)}
//                 className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
//               >
//                 Start Test
//               </button>
//             </div>
//           </div>

//           {/* Desktop Table */}
//           <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
//             <table className="w-full text-left">
//               <thead className="bg-[#002855] text-white text-sm font-light">
//                 <tr>
//                   <th className="p-3">Subject</th>
//                   <th className="p-3">Semester</th>
//                   <th className="p-3">Date</th>
//                   <th className="p-3">Time</th>
//                   <th className="p-3">Duration</th>
//                   <th className="p-3">Status</th>
//                   <th className="p-3">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="text-black text-md">
//                 <tr className="border-t hover:bg-gray-50">
//                   <td className="p-3">{exam.subjectName}</td>
//                   <td className="p-3">{toOrdinal(exam.semester)}</td>
//                   <td className="p-3">{examDate}</td>
//                   <td className="p-3">{examTime}</td>
//                   <td className="p-3">{exam.duration} minutes</td>
//                   <td className="p-3">{status}</td>
//                   <td className="p-3">
//                     <button
//                       onClick={() => navigate(`/give-exam/${exam.examId}`)}
//                       className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition"
//                     >
//                       Start Test
//                     </button>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function DetailRow({ label, value }) {
//   return (
//     <div className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200 flex justify-between py-2">
//       <span className="font-semibold text-[#002855]">{label}</span>
//       <span>{value}</span>
//     </div>
//   );
// }




// // src/pages/TestPage.jsx
// import React, { useEffect, useMemo } from 'react';
// import { useLocation, useNavigate }  from 'react-router-dom';
// import Sidebar                        from '../components/SSidebar';
// import SHeader                        from '../components/SHeader';

// /** Convert 1 → "1st", 2 → "2nd", etc. */
// function toOrdinal(n) {
//   const num = Number(n), rem100 = num % 100;
//   if (rem100 >= 11 && rem100 <= 13) return `${num}th`;
//   switch (num % 10) {
//     case 1: return `${num}st`;
//     case 2: return `${num}nd`;
//     case 3: return `${num}rd`;
//     default: return `${num}th`;
//   }
// }

// export default function TestPage() {
//   const { state } = useLocation();
//   const navigate  = useNavigate();
//   const exam      = state?.exam;

//   useEffect(() => {
//     if (!exam) navigate(-1);
//   }, [exam, navigate]);

//   const dateTime = useMemo(() => {
//     if (!exam?.scheduleDate) return null;
//     const dt = new Date(exam.scheduleDate);
//     const [h, m] = exam.scheduleTime.split(':').map(Number);
//     dt.setHours(h, m);
//     return dt;
//   }, [exam]);

//   const examDate = dateTime?.toLocaleDateString();
//   const examTime = dateTime?.toLocaleTimeString([], {
//     hour: 'numeric', minute: '2-digit', hour12: true
//   });

//   const status = useMemo(() => {
//     if (!exam) return '';
//     if (exam.attempted) return 'Attempted';
//     if (!dateTime) return '';
//     const now = new Date();
//     if (dateTime.toDateString() === now.toDateString()) return 'Ongoing';
//     return dateTime > now ? 'Scheduled' : 'Completed';
//   }, [exam, dateTime]);

//   if (!exam) return null;
//   return (
//     <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
//       <Sidebar isOpen={false} toggleSidebar={()=>{}} />
//       <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//         <SHeader toggleSidebar={()=>{}} />

//         {/* match spacing of other pages */}
//         <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
//           {/* Header + Back */}
//           {/* <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
//             <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-2 md:mb-0">
//               {exam.attempted ? 'Review Exam' : 'Take Exam'}
//             </h1>
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-2 text-[#2c3e50] bg-white hover:bg-gray-100 border border-gray-300 px-4 py-2 rounded-full transition"
//             >
//               <span className="text-xl">←</span>
//               <span className="font-semibold text-sm">Back</span>
//             </button>
//           </div> */}

//           <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
//             Exam Details
//           </h2>

//           {/* container matching other cards */}
//           <div className="bg-white rounded-xl shadow-md overflow-hidden">
//             {/* Mobile Card */}
//             <div className="space-y-4 [@media(min-width:486px)]:hidden px-4 py-4">
//               <DetailRow label="Subject:"  value={exam.subjectName} />
//               <DetailRow label="Exam No:" value={exam.examNo} />
//               <DetailRow label="Semester:" value={toOrdinal(exam.semester)} />
//               <DetailRow label="Date:"     value={examDate} />
//               <DetailRow label="Time:"     value={examTime} />
//               <DetailRow label="Duration:" value={`${exam.duration} minutes`} />
//               <DetailRow label="Status:"   value={status} />
//               <div className="text-right pt-2">
//                 {exam.attempted ? (
//                   <button
//                     onClick={() => navigate(`/view-result/${exam.submissionId}`)}
//                     className="bg-[#003366] text-white px-4 py-1.5 rounded"
//                   >
//                     View Result
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => navigate(`/give-exam/${exam.examId}`)}
//                     className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
//                   >
//                     Start Test
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Desktop Table */}
//             <div className="hidden [@media(min-width:486px)]:block overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead className="bg-[#002855] text-white text-sm font-light">
//                   <tr>
//                     <th className="p-3">Subject</th>
//                     <th className="p-3">Exam No</th>
//                     <th className="p-3">Semester</th>
//                     <th className="p-3">Date</th>
//                     <th className="p-3">Time</th>
//                     <th className="p-3">Duration</th>
//                     <th className="p-3">Status</th>
//                     <th className="p-3">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-black text-md divide-y divide-gray-200">
//                   <tr className="hover:bg-gray-50">
//                     <td className="p-3">{exam.subjectName}</td>
//                     <td className="p-3">{exam.examNo}</td>
//                     <td className="p-3">{toOrdinal(exam.semester)}</td>
//                     <td className="p-3">{examDate}</td>
//                     <td className="p-3">{examTime}</td>
//                     <td className="p-3">{exam.duration} minutes</td>
//                     <td className="p-3">{status}</td>
//                     <td className="p-3">
//                       {exam.attempted ? (
//                         <button
//                           onClick={() => navigate(`/view-result/${exam.submissionId}`)}
//                           className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition"
//                         >
//                           View Result
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => navigate(`/give-exam/${exam.examId}`)}
//                           className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition"
//                         >
//                           Start Test
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// function DetailRow({ label, value }) {
//   return (
//     <div className="flex justify-between py-2">
//       <span className="font-semibold text-[#002855]">{label}</span>
//       <span>{value}</span>
//     </div>
//   );
// }












// src/pages/TestPage.jsx
import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import SHeader from '../components/SHeader';

/** 1 → "1st", 2 → "2nd", etc. */
function toOrdinal(n) {
  const num = Number(n), rem100 = num % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${num}th`;
  switch (num % 10) {
    case 1: return `${num}st`;
    case 2: return `${num}nd`;
    case 3: return `${num}rd`;
    default: return `${num}th`;
  }
}

/** Parse and format each exam’s date/time */
// function useFormatted(exam) {
//   return useMemo(() => {
//     if (!exam?.scheduleDate || !exam?.scheduleTime) return {};
//     // combine into ISO-ish string
//     const iso = `${exam.scheduleDate}T${exam.scheduleTime}`;
//     const dt = new Date(iso);
//     if (isNaN(dt)) return {};
//     return {
//       examDate: dt.toLocaleDateString(),
//       examTime: dt.toLocaleTimeString([], {
//         hour: 'numeric', minute: '2-digit', hour12: true
//       }),
//       dateTime: dt
//     };
//   }, [exam]);
// }

function useFormatted(exam) {
  return useMemo(() => {
    if (!exam?.scheduleDate) return {};

    // If scheduleDate is already in ISO format with time, no need to add scheduleTime separately
    const dt = new Date(exam.scheduleDate);
    if (isNaN(dt)) return {};

    return {
      examDate: dt.toLocaleDateString(),
      examTime: dt.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      dateTime: dt,
    };
  }, [exam]);
}



/** Determine status */
function getStatus(exam, dateTime) {
  if (exam.attempted) return 'Attempted';
  if (!dateTime) return '';
  const now = new Date();
  if (dateTime.toDateString() === now.toDateString()) return 'Ongoing';
  return dateTime > now ? 'Scheduled' : 'Completed';
}

export default function TestPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // either an array or wrap single exam
  const exams = state?.exams ?? (state?.exam ? [state.exam] : []);

  // nothing to show? bounce back
  useEffect(() => {
    if (!exams.length) navigate(-1);
  }, [exams, navigate]);

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={false} toggleSidebar={() => {}} />
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <SHeader toggleSidebar={() => {}} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          {exams.length > 1 ? (
            <>
              <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
                Choose Your Exam
              </h2>

              <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#002855] text-white text-sm font-light">
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
                  <tbody className="text-black text-md divide-y divide-gray-200">
                    {exams.map(exam => {
                      const { examDate, examTime, dateTime } = useFormatted(exam);
                      const status = getStatus(exam, dateTime);
                      return (
                        <tr
                          key={exam.examId}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="p-3">{exam.subjectName}</td>
                          <td className="p-3">{exam.examNo}</td>
                          <td className="p-3">{toOrdinal(exam.semester)}</td>
                          <td className="p-3">{examDate || '—'}</td>
                          <td className="p-3">{examTime || '—'}</td>
                          <td className="p-3">{exam.duration} minutes</td>
                          <td className="p-3">{status}</td>
                          <td className="p-3">
                            <button
                              onClick={() =>
                                navigate(
                                  exam.attempted
                                    ? `/view-result/${exam.submissionId}`
                                    : `/give-exam/${exam.examId}`
                                )
                              }
                              className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                            >
                              {exam.attempted ? 'View Result' : 'Start Test'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            // Single-exam fallback: your original card + table UI
            (() => {
              const exam = exams[0];
              const { examDate, examTime, dateTime } = useFormatted(exam);
              const status = getStatus(exam, dateTime);
              return (
                <>
                  <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
                    Exam Details
                  </h2>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* mobile */}
                    <div className="space-y-4 [@media(min-width:486px)]:hidden px-4 py-4">
                      <DetailRow label="Subject:" value={exam.subjectName} />
                      <DetailRow label="Exam No:" value={exam.examNo} />
                      <DetailRow
                        label="Semester:"
                        value={toOrdinal(exam.semester)}
                      />
                      <DetailRow label="Date:" value={examDate || '—'} />
                      <DetailRow label="Time:" value={examTime || '—'} />
                      <DetailRow
                        label="Duration:"
                        value={`${exam.duration} minutes`}
                      />
                      <DetailRow label="Status:" value={status} />
                      <div className="text-right pt-2">
                        <button
                          onClick={() =>
                            navigate(
                              exam.attempted
                                ? `/view-result/${exam.submissionId}`
                                : `/give-exam/${exam.examId}`
                            )
                          }
                          className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
                        >
                          {exam.attempted ? 'View Result' : 'Start Test'}
                        </button>
                      </div>
                    </div>
                    {/* desktop */}
                    <div className="hidden [@media(min-width:486px)]:block overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-[#002855] text-white text-sm font-light">
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
                        <tbody className="text-black text-md divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="p-3">{exam.subjectName}</td>
                            <td className="p-3">{exam.examNo}</td>
                            <td className="p-3">
                              {toOrdinal(exam.semester)}
                            </td>
                            <td className="p-3">{examDate || '—'}</td>
                            <td className="p-3">{examTime || '—'}</td>
                            <td className="p-3">{exam.duration} minutes</td>
                            <td className="p-3">{status}</td>
                            <td className="p-3">
                              <button
                                onClick={() =>
                                  navigate(
                                    exam.attempted
                                      ? `/view-result/${exam.submissionId}`
                                      : `/give-exam/${exam.examId}`
                                  )
                                }
                                className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                              >
                                {exam.attempted ? 'View Result' : 'Start Test'}
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2">
      <span className="font-semibold text-[#002855]">{label}</span>
      <span>{value}</span>
    </div>
  );
}
