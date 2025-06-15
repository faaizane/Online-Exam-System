import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import StudentHeader from '../components/SHeader';

export default function GiveExam() {
  const { state }     = useLocation();
  const { id: examId }= useParams();
  const navigate      = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exam, setExam]               = useState(null);
  const [answers, setAnswers]         = useState({});
  const [timeLeft, setTimeLeft]       = useState(null);
  const [submitted, setSubmitted]     = useState(false);
  const [score, setScore]             = useState(null);

  // For tab change detection
  const [warningCount, setWarningCount] = useState(0);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);

  // Fetch exam and submission status
  useEffect(() => {
    if (!examId) return navigate(-1);
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res   = await fetch(`/api/exams/${examId}/student`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();

        // 👇 Yeh block check karega ke exam already submitted hai ya nahi
        if (data.alreadySubmitted) {
          setAlreadySubmitted(true);
          setSubmitted(true);
          setScore(data.score);
          setSubmittedAnswers(data.answers || []);
          setExam({ questions: data.questions || [] }); // fallback for questions (if needed)
        } else {
          setExam(data);
          setTimeLeft(data.duration * 60);
        }
      } catch {
        navigate(-1);
      }
    })();
    // eslint-disable-next-line
  }, [examId, navigate]);

  // Timer
  useEffect(() => {
    if (timeLeft == null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, submitted]);

  // Tab change/visibility detection
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden && !submitted && !alreadySubmitted) {
        setWarningCount(prev => prev + 1);
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [submitted, alreadySubmitted]);

  useEffect(() => {
    if (warningCount === 1) {
      alert('Warning: Tab change detected! Exam will be auto-submitted on next tab change.');
    }
    if (warningCount === 2 && !submitted && !alreadySubmitted) {
      alert('Tab changed again. Exam will be auto-submitted.');
      handleSubmit();
    }
    // eslint-disable-next-line
  }, [warningCount, submitted, alreadySubmitted]);

  const dateTime = useMemo(() => {
    if (!exam) return null;
    const dt = new Date(exam.scheduleDate);
    if (exam.scheduleTime) {
      const [h, m] = exam.scheduleTime.split(':').map(Number);
      dt.setHours(h, m);
    }
    return dt;
  }, [exam]);
  const examDate = dateTime?.toLocaleDateString();
  const examTime = dateTime?.toLocaleTimeString([], {
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  const toggleSidebar = () => setSidebarOpen(o => !o);

  const handleChange = (qIdx, optIdx) => {
    setAnswers(a => ({ ...a, [qIdx]: optIdx }));
  };

  // Submit logic
  async function handleSubmit() {
    if (submitted || alreadySubmitted) return;
    setSubmitted(true);

    const answersArr = (exam.questions || []).map((_, idx) =>
      answers.hasOwnProperty(idx) ? answers[idx] : null
    );

    let rawScore = 0;
    (exam.questions || []).forEach((q, i) => {
      const sel = answersArr[i];
      if (sel == null) return;
      rawScore += sel === q.correctAnswerIndex ? 1 : 0;
    });
    setScore(rawScore);

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: answersArr, score: rawScore })
      });
    } catch (err) {
      console.error('Save submission error:', err);
    }
  }

  // 🟢 Agar exam already submitted hai, ya abhi submit kiya, toh answers/result dikhao, form kabhi bhi na dikhao
  if (alreadySubmitted || submitted) {
    return (
      <div className="min-h-screen flex bg-white overflow-x-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
          <StudentHeader toggleSidebar={toggleSidebar} />
          <div className="flex-1 flex flex-col lg:flex-row-reverse">
            <div className="w-full lg:w-[300px] flex flex-col items-center justify-start p-6">
              <div className="bg-black w-full h-[150px] mb-4 rounded-md shadow-md" />
              <div className="text-3xl font-bold">{timeLeft != null ? '--:--' : '--:--'}</div>
            </div>
            <div className="flex-1 p-6 lg:p-12">
              <h2 className="text-3xl font-bold text-[#002855] mb-6 text-center">
                Your Score: {score} / {(exam.questions || []).length}
              </h2>
              <div className="space-y-6 [@media(min-width:486px)]:hidden">
                {(exam.questions || []).map((q, qi) => (
                  <div key={qi} className="bg-white rounded-xl shadow-md p-4">
                    <h3 className="font-semibold text-[#002855] mb-2">
                      Q{qi + 1}: {q.questionText}
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {q.options.map((opt, idx) => {
                        const isCorrect = idx === q.correctAnswerIndex;
                        const isChosen  = idx === (submittedAnswers[qi] ?? answers[qi]);
                        return (
                          <li key={idx} className={isCorrect ? 'text-green-600' : isChosen ? 'text-red-600' : ''}>
                            {opt}{' '}
                            {isCorrect && '✔️'}
                            {!isCorrect && isChosen && '❌'}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-200">
                    {(exam.questions || []).map((q, qi) => (
                      <React.Fragment key={qi}>
                        <tr className="bg-[#f1f5f9]">
                          <td colSpan="2" className="p-3 font-semibold text-[#002855]">
                            Q{qi + 1}: {q.questionText}
                          </td>
                        </tr>
                        {q.options.map((opt, idx) => {
                          const isCorrect = idx === q.correctAnswerIndex;
                          const isChosen  = idx === (submittedAnswers[qi] ?? answers[qi]);
                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="p-3">{opt}</td>
                              <td className={`p-3 ${
                                isCorrect
                                  ? 'text-green-600'
                                  : isChosen
                                    ? 'text-red-600'
                                    : ''
                              }`}>
                                {isCorrect
                                  ? '✔️ Correct'
                                  : isChosen
                                    ? '❌ Your choice'
                                    : ''}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) return <div className="p-8 text-center">Loading exam...</div>;

  // 🟢 Exam attempt UI, yeh sirf tab aayegi jab already submit nahi kiya ho!
  return (
    <div className="min-h-screen flex bg-white overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <StudentHeader toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col lg:flex-row-reverse">
          <div className="w-full lg:w-[300px] flex flex-col items-center justify-start p-6">
            <div className="bg-black w-full h-[150px] mb-4 rounded-md shadow-md" />
            <div className="text-3xl font-bold">
              {timeLeft != null ? (
                String(Math.floor(timeLeft / 60)).padStart(2, '0') +
                ':' +
                String(timeLeft % 60).padStart(2, '0')
              ) : '--:--'}
            </div>
          </div>
          <div className="flex-1 p-6 lg:p-12">
            {(exam.questions || []).map((q, i) => (
              <div key={i} className="mb-8">
                <h2 className="text-2xl font-extrabold mb-2">
                  Question No. {String(i + 1).padStart(2, '0')}
                </h2>
                <p className="mb-4 text-gray-800">{q.questionText}</p>
                <div className="space-y-3">
                  {q.options.map((opt, j) => (
                    <label
                      key={j}
                      className="flex items-center space-x-2 text-gray-700"
                    >
                      <input
                        type="radio"
                        name={`q${i}`}
                        className="accent-[#002855]"
                        checked={answers[i] === j}
                        onChange={() => handleChange(i, j)}
                        required
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              className="mt-4 px-6 py-2 bg-[#002855] text-white rounded hover:bg-[#001f47] transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}





// // src/pages/GiveExam.jsx
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import Sidebar from '../components/SSidebar';
// import StudentHeader from '../components/SHeader';

// export default function GiveExam() {
//   const { state }       = useLocation();
//   const { id: examId }  = useParams();
//   const navigate        = useNavigate();

//   const [sidebarOpen, setSidebarOpen]           = useState(false);
//   const [exam, setExam]                         = useState(null);
//   const [answers, setAnswers]                   = useState({});
//   const [timeLeft, setTimeLeft]                 = useState(null);
//   const [submitted, setSubmitted]               = useState(false);
//   const [score, setScore]                       = useState(null);
//   const [alreadySubmitted, setAlreadySubmitted] = useState(false);
//   const [submittedAnswers, setSubmittedAnswers] = useState([]);

//   // Tab‐switch warning tracking
//   const [warningCount, setWarningCount] = useState(0);

//   // Fetch exam data / status
//   useEffect(() => {
//     if (!examId) return navigate(-1);
//     (async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res   = await fetch(`/api/exams/${examId}/student`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (!res.ok) throw new Error();
//         const data = await res.json();

//         if (data.alreadySubmitted) {
//           setAlreadySubmitted(true);
//           setSubmitted(true);
//           setScore(data.score);
//           setSubmittedAnswers(data.answers || []);
//           setExam({ questions: data.questions || [] });
//         } else {
//           setExam(data);
//           setTimeLeft(data.duration * 60);
//         }
//       } catch {
//         navigate(-1);
//       }
//     })();
//   }, [examId, navigate]);

//   // Timer countdown
//   useEffect(() => {
//     if (timeLeft == null || submitted) return;
//     if (timeLeft <= 0) {
//       handleSubmit();
//       return;
//     }
//     const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
//     return () => clearTimeout(id);
//   }, [timeLeft, submitted]);

//   // Detect tab switches
//   useEffect(() => {
//     const onVisChange = () => {
//       if (document.hidden && !submitted && !alreadySubmitted) {
//         setWarningCount(w => w + 1);
//       }
//     };
//     document.addEventListener('visibilitychange', onVisChange);
//     return () => document.removeEventListener('visibilitychange', onVisChange);
//   }, [submitted, alreadySubmitted]);

//   // Handle warnings & auto-submit
//   useEffect(() => {
//     if (warningCount === 1) {
//       alert('Warning: Tab change detected! Exam will be auto-submitted on next tab change.');
//     }
//     if (warningCount === 2 && !submitted && !alreadySubmitted) {
//       alert('Tab changed again. Exam will be auto-submitted now.');
//       handleSubmit();
//     }
//   }, [warningCount, submitted, alreadySubmitted]);

//   // Submit logic
//   const handleSubmit = useCallback(async () => {
//     if (submitted || alreadySubmitted) return;
//     setSubmitted(true);

//     const answersArr = (exam.questions || []).map((_, idx) =>
//       answers.hasOwnProperty(idx) ? answers[idx] : null
//     );

//     // Calculate score
//     let rawScore = 0;
//     (exam.questions || []).forEach((q, i) => {
//       if (answersArr[i] === q.correctAnswerIndex) rawScore += 1;
//     });
//     setScore(rawScore);

//     // Send to server
//     try {
//       const token = localStorage.getItem('token');
//       await fetch(`/api/exams/${examId}/submit`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({ answers: answersArr, score: rawScore })
//       });
//     } catch (err) {
//       console.error('Submission error:', err);
//     }
//   }, [exam, answers, submitted, alreadySubmitted, examId]);

//   // Answer selection
//   const handleChange = (qIdx, optIdx) => {
//     setAnswers(a => ({ ...a, [qIdx]: optIdx }));
//   };

//   // Format exam date/time if needed
//   const dateTime = useMemo(() => {
//     if (!exam) return null;
//     const dt = new Date(exam.scheduleDate);
//     if (exam.scheduleTime) {
//       const [h, m] = exam.scheduleTime.split(':').map(Number);
//       dt.setHours(h, m);
//     }
//     return dt;
//   }, [exam]);
//   const examDate = dateTime?.toLocaleDateString();
//   const examTime = dateTime?.toLocaleTimeString([], {
//     hour: 'numeric', minute: '2-digit', hour12: true
//   });

//   // Render submitted/results view
//   if (alreadySubmitted || submitted) {
//     return (
//       <div className="min-h-screen flex bg-white overflow-x-hidden">
//         <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(o => !o)} />
//         <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//           <StudentHeader toggleSidebar={() => setSidebarOpen(o => !o)} />
//           <div className="flex-1 flex flex-col lg:flex-row-reverse">
//             {/* Timer placeholder */}
//             <div className="w-full lg:w-[300px] flex flex-col items-center p-6">
//               <div className="bg-black w-full h-[150px] mb-4 rounded-md shadow-md" />
//               <div className="text-3xl font-bold">--:--</div>
//             </div>
//             {/* Score & review */}
//             <div className="flex-1 p-6 lg:p-12">
//               <h2 className="text-3xl font-bold text-[#002855] mb-6 text-center">
//                 Your Score: {score} / {(exam.questions || []).length}
//               </h2>
//               <div className="space-y-6 [@media(min-width:486px)]:hidden">
//                 {(exam.questions || []).map((q, qi) => {
//                   const chosen = submittedAnswers[qi] ?? answers[qi];
//                   return (
//                     <div key={qi} className="bg-white rounded-xl shadow-md p-4">
//                       <h3 className="font-semibold text-[#002855] mb-2">
//                         Q{qi + 1}: {q.questionText}
//                       </h3>
//                       <ul className="list-disc list-inside space-y-1">
//                         {q.options.map((opt, idx) => {
//                           const isCorrect = idx === q.correctAnswerIndex;
//                           const isChosen  = idx === chosen;
//                           return (
//                             <li
//                               key={idx}
//                               className={
//                                 isCorrect ? 'text-green-600' :
//                                 isChosen  ? 'text-red-600' : ''
//                               }
//                             >
//                               {opt} {isCorrect ? '✔️' : isChosen ? '❌' : ''}
//                             </li>
//                           );
//                         })}
//                       </ul>
//                     </div>
//                   );
//                 })}
//               </div>
//               <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
//                 <table className="w-full text-left">
//                   <tbody className="divide-y divide-gray-200">
//                     {(exam.questions || []).map((q, qi) => {
//                       const chosen = submittedAnswers[qi] ?? answers[qi];
//                       return (
//                         <React.Fragment key={qi}>
//                           <tr className="bg-[#f1f5f9]">
//                             <td colSpan="2" className="p-3 font-semibold text-[#002855]">
//                               Q{qi + 1}: {q.questionText}
//                             </td>
//                           </tr>
//                           {q.options.map((opt, idx) => {
//                             const isCorrect = idx === q.correctAnswerIndex;
//                             const isChosen  = idx === chosen;
//                             return (
//                               <tr key={idx} className="hover:bg-gray-50">
//                                 <td className="p-3">{opt}</td>
//                                 <td
//                                   className={`p-3 ${
//                                     isCorrect ? 'text-green-600' :
//                                     isChosen  ? 'text-red-600' : ''
//                                   }`}
//                                 >
//                                   {isCorrect
//                                     ? '✔️ Correct'
//                                     : isChosen
//                                       ? '❌ Your choice'
//                                       : ''}
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </React.Fragment>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Render exam-taking UI
//   if (!exam) {
//     return <div className="p-8 text-center">Loading exam...</div>;
//   }

//   return (
//     <div className="min-h-screen flex bg-white overflow-x-hidden">
//       <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(o => !o)} />
//       <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//         <StudentHeader toggleSidebar={() => setSidebarOpen(o => !o)} />
//         <div className="flex-1 flex flex-col lg:flex-row-reverse">
//           {/* Timer */}
//           <div className="w-full lg:w-[300px] flex flex-col items-center p-6">
//             <div className="bg-black w-full h-[150px] mb-4 rounded-md shadow-md" />
//             <div className="text-3xl font-bold">
//               {timeLeft != null
//                 ? `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`
//                 : '--:--'}
//             </div>
//           </div>
//           {/* Questions */}
//           <div className="flex-1 p-6 lg:p-12">
//             {(exam.questions || []).map((q, i) => (
//               <div key={i} className="mb-8">
//                 <h2 className="text-2xl font-extrabold mb-2">
//                   Question No. {String(i + 1).padStart(2, '0')}
//                 </h2>
//                 <p className="mb-4 text-gray-800">{q.questionText}</p>
//                 <div className="space-y-3">
//                   {q.options.map((opt, j) => (
//                     <label key={j} className="flex items-center space-x-2 text-gray-700">
//                       <input
//                         type="radio"
//                         name={`q${i}`}
//                         className="accent-[#002855]"
//                         checked={answers[i] === j}
//                         onChange={() => handleChange(i, j)}
//                         required
//                       />
//                       <span>{opt}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             ))}
//             <button
//               onClick={handleSubmit}
//               className="mt-4 px-6 py-2 bg-[#002855] text-white rounded hover:bg-[#001f47] transition"
//             >
//               Submit
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
