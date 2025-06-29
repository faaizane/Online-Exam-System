// // src/pages/GiveExam.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { BiLoaderAlt } from 'react-icons/bi';

// export default function GiveExam() {
//   const { id: examId } = useParams();
//   const navigate       = useNavigate();
//   const imgRef         = useRef(null);
//   const [feedLoaded, setFeedLoaded] = useState(false);

//   const API_URL = 'http://localhost:5000';
//   const YOLO_BACKEND_URL = 'http://127.0.0.1:5001'; 

//   const [exam, setExam]                   = useState(null);
//   const [answers, setAnswers]             = useState({});
//   const [timeLeft, setTimeLeft]           = useState(null);
//   const [submitted, setSubmitted]         = useState(false);
//   const [alreadySubmitted, setAlreadySubmitted] = useState(false);
//   const [score, setScore]                 = useState(null);
//   const [warningCount, setWarningCount]   = useState(0);

//   // 1) Restore saved progress
//   useEffect(() => {
//     if (!examId) return;
//     (async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res   = await fetch(
//           `${API_URL}/api/exams/${examId}/progress`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (res.ok) {
//           const prog = await res.json();
//           if (prog.timeLeft != null) {
//             setAnswers(prog.answers || {});
//             setTimeLeft(prog.timeLeft);
//           }
//         }
//       } catch (err) {
//         console.error('Load progress error:', err);
//       }
//     })();
//   }, [examId]);

//   // 2) Fetch exam or past submission
//   useEffect(() => {
//     if (!examId) return navigate(-1);
//     (async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res   = await fetch(
//           `${API_URL}/api/exams/${examId}/student`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (!res.ok) throw new Error();
//         const data = await res.json();

//         if (data.alreadySubmitted) {
//           setAlreadySubmitted(true);
//           setSubmitted(true);
//           setScore(data.score);
//           setExam({ questions: data.questions || [], duration: 0 });
//         } else {
//           setExam(data);
//         }
//       } catch {
//         navigate(-1);
//       }
//     })();
//   }, [examId, navigate]);

//   // 3) Initialize timer
//   useEffect(() => {
//     if (exam && timeLeft == null && !alreadySubmitted) {
//       setTimeLeft(exam.duration * 60);
//     }
//   }, [exam, timeLeft, alreadySubmitted]);

//   // 4) Countdown
//   useEffect(() => {
//     if (timeLeft == null || submitted) return;
//     if (timeLeft <= 0) {
//       handleSubmit();
//       return;
//     }
//     const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
//     return () => clearTimeout(id);
//   }, [timeLeft, submitted]);

//   // 5) Anti-cheat: tab switch
//   useEffect(() => {
//     const onVisibility = () => {
//       if (document.hidden && !submitted && !alreadySubmitted) {
//         setWarningCount(c => c + 1);
//       }
//     };
//     document.addEventListener('visibilitychange', onVisibility);
//     return () => document.removeEventListener('visibilitychange', onVisibility);
//   }, [submitted, alreadySubmitted]);

//   useEffect(() => {
//     if (warningCount === 1) {
//       alert('⚠️ Warning: Tab change detected! Next change auto-submits.');
//     }
//     if (warningCount >= 2 && !submitted && !alreadySubmitted) {
//       alert('⚠️ Tab changed again. Auto-submitting.');
//       handleSubmit();
//     }
//   }, [warningCount, submitted, alreadySubmitted]);

//   // 6) Persist progress
//   useEffect(() => {
//     if (!submitted && exam && timeLeft != null) {
//       const token = localStorage.getItem('token');
//       fetch(
//         `${API_URL}/api/exams/${examId}/progress`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`
//           },
//           body: JSON.stringify({ answers, timeLeft })
//         }
//       ).catch(console.error);
//     }
//   }, [answers, timeLeft, exam, submitted, examId]);

//   // 7) Release camera on unload or route change
//   useEffect(() => {
//     const releaseCamera = () => {
//       const url = `${YOLO_BACKEND_URL}/release_camera`;
//       if (navigator.sendBeacon) {
//         navigator.sendBeacon(url);
//       } else {
//         fetch(url, { method: 'POST', mode: 'no-cors' });
//       }
//     };
//     window.addEventListener('beforeunload', releaseCamera);
//     return () => {
//       releaseCamera();
//       window.removeEventListener('beforeunload', releaseCamera);
//     };
//   }, []);

//   // option select handler
//   const handleChange = (qIdx, optIdx) =>
//     setAnswers(a => ({ ...a, [qIdx]: optIdx }));

//   // submit exam
//   async function handleSubmit() {
//     if (submitted || alreadySubmitted) return;
//     setSubmitted(true);

//     const answersArr = (exam.questions || []).map((_, i) =>
//       answers.hasOwnProperty(i) ? answers[i] : null
//     );
//     const rawScore = (exam.questions || []).reduce(
//       (sum, q, i) =>
//         sum + (answersArr[i] === q.correctAnswerIndex ? 1 : 0),
//       0
//     );
//     setScore(rawScore);

//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(
//         `${API_URL}/api/exams/${examId}/submit`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`
//           },
//           body: JSON.stringify({ answers: answersArr, score: rawScore })
//         }
//       );
//       const data = await res.json();
//       if (!res.ok) {
//         console.error('Submit failed:', data);
//         alert(`Submit failed: ${data.message || 'Unknown error'}`);
//         return;
//       }

//       // clear progress record
//       await fetch(
//         `${API_URL}/api/exams/${examId}/progress`,
//         {
//           method: 'DELETE',
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );
//     } catch (err) {
//       console.error('Submit error:', err);
//       alert('There was an error submitting your exam.');
//     }
//   }

//   // format timer mm:ss
//   const formatTime = secs => {
//     const m = String(Math.floor(secs / 60)).padStart(2, '0');
//     const s = String(secs % 60).padStart(2, '0');
//     return `${m}:${s}`;
//   };

//   // proctoring feed URL
//   const streamUrl =
//     `${YOLO_BACKEND_URL}/video_feed`
//     + `?exam=${examId}`
//     + `&token=${encodeURIComponent(localStorage.getItem('token'))}`;

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
//       {/* ===== Sidebar ===== */}
//       <div className="w-full lg:w-80 bg-white p-6 flex flex-col sticky top-0 h-screen">
//         <div
//           className="bg-black w-full mb-4 rounded-lg shadow-lg overflow-hidden relative"
//           style={{ paddingTop: '100%' }}
//         >
//           <img
//             ref={imgRef}
//             src={streamUrl}
//             alt="Proctoring feed"
//             className="absolute top-0 left-0 w-full h-full object-cover"
//             onLoad={() => setFeedLoaded(true)}
//             onError={() => console.error('Feed load error')}
//           />
//           {!feedLoaded && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black">
//               <BiLoaderAlt className="animate-spin text-white text-4xl" />
//             </div>
//           )}
//         </div>

//         <div className="text-4xl font-mono mb-2 text-center">
//           {timeLeft != null ? formatTime(timeLeft) : '--:--'}
//         </div>
//         <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
//           <div
//             className="bg-[#002855] h-2 rounded-full transition-all duration-500"
//             style={{
//               width: exam
//                 ? `${((exam.duration * 60 - (timeLeft || 0)) /
//                      (exam.duration * 60)) * 100}%`
//                 : '0%'
//             }}
//           />
//         </div>
//       </div>

//       {/* ===== Main ===== */}
//       <div className="flex-1 p-6 lg:p-12 overflow-auto">
//         {!exam ? (
//           <div className="text-center text-gray-500">Loading exam…</div>
//         ) : submitted || alreadySubmitted ? (
//           <div className="text-center">
//             <h2 className="text-4xl font-bold text-[#002855] mb-4">
//               Your Score
//             </h2>
//             <p className="text-2xl">
//               {score} / {exam.questions.length}
//             </p>
//           </div>
//         ) : (
//           <>
//             {exam.questions.map((q, i) => (
//               <div key={i} className="bg-white rounded-xl shadow-md p-6 mb-8">
//                 <h3 className="text-2xl font-semibold text-[#002855] mb-3">
//                   Q{i + 1}. {q.questionText}
//                 </h3>
//                 <div className="space-y-3">
//                   {q.options.map((opt, j) => (
//                     <label
//                       key={j}
//                       className="flex items-center space-x-3 text-gray-700"
//                     >
//                       <input
//                         type="radio"
//                         name={`q${i}`}
//                         checked={answers[i] === j}
//                         onChange={() => handleChange(i, j)}
//                         className="accent-[#002855] h-5 w-5"
//                       />
//                       <span>{opt}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             ))}

//             <div className="text-center mt-6">
//               <button
//                 onClick={handleSubmit}
//                 className="px-8 py-3 bg-[#002855] text-white text-lg rounded hover:bg-[#001f47] transition"
//               >
//                 Submit
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }












// // src/pages/GiveExam.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { BiLoaderAlt } from 'react-icons/bi';

// export default function GiveExam() {
//   const { id: examId } = useParams();
//   const navigate       = useNavigate();
//   const imgRef         = useRef(null);
//   const [feedLoaded, setFeedLoaded] = useState(false);

//   const API_URL = 'http://localhost:5000';
//   const YOLO_BACKEND_URL = 'http://127.0.0.1:5001'; 

//   const [exam, setExam]                   = useState(null);
//   const [answers, setAnswers]             = useState({});
//   const [timeLeft, setTimeLeft]           = useState(null);
//   const [submitted, setSubmitted]         = useState(false);
//   const [alreadySubmitted, setAlreadySubmitted] = useState(false);
//   const [score, setScore]                 = useState(null);
//   const [warningCount, setWarningCount]   = useState(0);

//   // 1) Restore saved progress
//   useEffect(() => {
//     if (!examId) return;
//     (async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res   = await fetch(
//           `${API_URL}/api/exams/${examId}/progress`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (res.ok) {
//           const prog = await res.json();
//           if (prog.timeLeft != null) {
//             setAnswers(prog.answers || {});
//             setTimeLeft(prog.timeLeft);
//           }
//         }
//       } catch (err) {
//         console.error('Load progress error:', err);
//       }
//     })();
//   }, [examId]);

//   // 2) Fetch exam or past submission
//   useEffect(() => {
//     if (!examId) return navigate(-1);
//     (async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res   = await fetch(
//           `${API_URL}/api/exams/${examId}/student`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (!res.ok) throw new Error();
//         const data = await res.json();

//         if (data.alreadySubmitted) {
//           setAlreadySubmitted(true);
//           setSubmitted(true);
//           setScore(data.score);
//           setExam({ questions: data.questions || [], duration: 0 });
//           setAnswers(data.answers || {});          // ← capture submitted answers
//         } else {
//           setExam(data);
//         }
//       } catch {
//         navigate(-1);
//       }
//     })();
//   }, [examId, navigate]);

//   // 3) Initialize timer
//   useEffect(() => {
//     if (exam && timeLeft == null && !alreadySubmitted) {
//       setTimeLeft(exam.duration * 60);
//     }
//   }, [exam, timeLeft, alreadySubmitted]);

//   // 4) Countdown
//   useEffect(() => {
//     if (timeLeft == null || submitted) return;
//     if (timeLeft <= 0) {
//       handleSubmit();
//       return;
//     }
//     const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
//     return () => clearTimeout(id);
//   }, [timeLeft, submitted]);

//   // 5) Anti-cheat: tab switch
//   useEffect(() => {
//     const onVisibility = () => {
//       if (document.hidden && !submitted && !alreadySubmitted) {
//         setWarningCount(c => c + 1);
//       }
//     };
//     document.addEventListener('visibilitychange', onVisibility);
//     return () => document.removeEventListener('visibilitychange', onVisibility);
//   }, [submitted, alreadySubmitted]);

//   useEffect(() => {
//     if (warningCount === 1) {
//       alert('⚠️ Warning: Tab change detected! Next change auto-submits.');
//     }
//     if (warningCount >= 2 && !submitted && !alreadySubmitted) {
//       alert('⚠️ Tab changed again. Auto-submitting.');
//       handleSubmit();
//     }
//   }, [warningCount, submitted, alreadySubmitted]);

//   // 6) Persist progress
//   useEffect(() => {
//     if (!submitted && exam && timeLeft != null) {
//       const token = localStorage.getItem('token');
//       fetch(
//         `${API_URL}/api/exams/${examId}/progress`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`
//           },
//           body: JSON.stringify({ answers, timeLeft })
//         }
//       ).catch(console.error);
//     }
//   }, [answers, timeLeft, exam, submitted, examId]);

//   // 7) Release camera on unload or route change
//   useEffect(() => {
//     const releaseCamera = () => {
//       const url = `${YOLO_BACKEND_URL}/release_camera`;
//       if (navigator.sendBeacon) {
//         navigator.sendBeacon(url);
//       } else {
//         fetch(url, { method: 'POST', mode: 'no-cors' });
//       }
//     };
//     window.addEventListener('beforeunload', releaseCamera);
//     return () => {
//       releaseCamera();
//       window.removeEventListener('beforeunload', releaseCamera);
//     };
//   }, []);

//   // option select handler
//   const handleChange = (qIdx, optIdx) =>
//     setAnswers(a => ({ ...a, [qIdx]: optIdx }));

//   // submit exam
//   async function handleSubmit() {
//     if (submitted || alreadySubmitted) return;
//     setSubmitted(true);

//     const answersArr = (exam.questions || []).map((_, i) =>
//       answers.hasOwnProperty(i) ? answers[i] : null
//     );
//     const rawScore = (exam.questions || []).reduce(
//       (sum, q, i) =>
//         sum + (answersArr[i] === q.correctAnswerIndex ? 1 : 0),
//       0
//     );
//     setScore(rawScore);

//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(
//         `${API_URL}/api/exams/${examId}/submit`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`
//           },
//           body: JSON.stringify({ answers: answersArr, score: rawScore })
//         }
//       );
//       const data = await res.json();
//       if (!res.ok) {
//         console.error('Submit failed:', data);
//         alert(`Submit failed: ${data.message || 'Unknown error'}`);
//         return;
//       }

//       // clear progress record
//       await fetch(
//         `${API_URL}/api/exams/${examId}/progress`,
//         {
//           method: 'DELETE',
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );
//     } catch (err) {
//       console.error('Submit error:', err);
//       alert('There was an error submitting your exam.');
//     }
//   }

//   // format timer mm:ss
//   const formatTime = secs => {
//     const m = String(Math.floor(secs / 60)).padStart(2, '0');
//     const s = String(secs % 60).padStart(2, '0');
//     return `${m}:${s}`;
//   };

//   // proctoring feed URL
//   const streamUrl =
//     `${YOLO_BACKEND_URL}/video_feed`
//     + `?exam=${examId}`
//     + `&token=${encodeURIComponent(localStorage.getItem('token'))}`;

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
//       {/* ===== Sidebar ===== */}
//       <div className="w-full lg:w-80 bg-white p-6 flex flex-col sticky top-0 h-screen">
//         <div
//           className="bg-black w-full mb-4 rounded-lg shadow-lg overflow-hidden relative"
//           style={{ paddingTop: '100%' }}
//         >
//           <img
//             ref={imgRef}
//             src={streamUrl}
//             alt="Proctoring feed"
//             className="absolute top-0 left-0 w-full h-full object-cover"
//             onLoad={() => setFeedLoaded(true)}
//             onError={() => console.error('Feed load error')}
//           />
//           {!feedLoaded && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black">
//               <BiLoaderAlt className="animate-spin text-white text-4xl" />
//             </div>
//           )}
//         </div>

//         <div className="text-4xl font-mono mb-2 text-center">
//           {timeLeft != null ? formatTime(timeLeft) : '--:--'}
//         </div>
//         <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
//           <div
//             className="bg-[#002855] h-2 rounded-full transition-all duration-500"
//             style={{
//               width: exam
//                 ? `${((exam.duration * 60 - (timeLeft || 0)) /
//                      (exam.duration * 60)) * 100}%`
//                 : '0%'
//             }}
//           />
//         </div>
//       </div>

//       {/* ===== Main ===== */}
//       <div className="flex-1 p-6 lg:p-12 overflow-auto">
//         {!exam ? (
//           <div className="text-center text-gray-500">Loading exam…</div>
//         ) : submitted || alreadySubmitted ? (
//           <div className="text-center">
//             <h2 className="text-4xl font-bold text-[#002855] mb-4">
//               Your Score
//             </h2>
//             <p className="text-2xl mb-6">
//               {score} / {exam.questions.length}
//             </p>

//             {exam.questions.map((q, i) => (
//               <div
//                 key={i}
//                 className="bg-white rounded-xl shadow-md p-6 mb-6 text-left max-w-2xl mx-auto"
//               >
//                 <h3 className="text-2xl font-semibold text-[#002855] mb-3">
//                   Q{i + 1}. {q.questionText}
//                 </h3>
//                 <ul className="list-disc list-inside space-y-2">
//                   {q.options.map((opt, j) => {
//                     const isCorrect = j === q.correctAnswerIndex;
//                     const isChosen = answers[i] === j;
//                     return (
//                       <li
//                         key={j}
//                         className={
//                           isCorrect
//                             ? 'text-green-600'
//                             : isChosen
//                               ? 'text-red-600'
//                               : ''
//                         }
//                       >
//                         {opt}{' '}
//                         {isCorrect && '✔️'}
//                         {!isCorrect && isChosen && '❌'}
//                       </li>
//                     );
//                   })}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <>
//             {exam.questions.map((q, i) => (
//               <div key={i} className="bg-white rounded-xl shadow-md p-6 mb-8">
//                 <h3 className="text-2xl font-semibold text-[#002855] mb-3">
//                   Q{i + 1}. {q.questionText}
//                 </h3>
//                 <div className="space-y-3">
//                   {q.options.map((opt, j) => (
//                     <label
//                       key={j}
//                       className="flex items-center space-x-3 text-gray-700"
//                     >
//                       <input
//                         type="radio"
//                         name={`q${i}`}
//                         checked={answers[i] === j}
//                         onChange={() => handleChange(i, j)}
//                         className="accent-[#002855] h-5 w-5"
//                       />
//                       <span>{opt}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             ))}

//             <div className="text-center mt-6">
//               <button
//                 onClick={handleSubmit}
//                 className="px-8 py-3 bg-[#002855] text-white text-lg rounded hover:bg-[#001f47] transition"
//               >
//                 Submit
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }















// src/pages/GiveExam.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BiLoaderAlt } from 'react-icons/bi';

export default function GiveExam() {
  const { id: examId } = useParams();
  const navigate       = useNavigate();
  const imgRef         = useRef(null);
  const [feedLoaded, setFeedLoaded] = useState(false);

  const API_URL          = 'http://localhost:5000';
  const YOLO_BACKEND_URL = 'http://127.0.0.1:5001';

  const [exam, setExam]                   = useState(null);
  const [answers, setAnswers]             = useState({});
  const [timeLeft, setTimeLeft]           = useState(null);
  const [submitted, setSubmitted]         = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [score, setScore]                 = useState(null);
  const [warningCount, setWarningCount]   = useState(0);

  // 1) Restore saved progress
  useEffect(() => {
    if (!examId) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res   = await fetch(
          `${API_URL}/api/exams/${examId}/progress`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const prog = await res.json();
          if (prog.timeLeft != null) {
            setAnswers(prog.answers || {});
            setTimeLeft(prog.timeLeft);
          }
        }
      } catch (err) {
        console.error('Load progress error:', err);
      }
    })();
  }, [examId]);

  // 2) Fetch exam or past submission
  useEffect(() => {
    if (!examId) return navigate(-1);
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res   = await fetch(
          `${API_URL}/api/exams/${examId}/student`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error();
        const data = await res.json();

        if (data.alreadySubmitted) {
          setAlreadySubmitted(true);
          setSubmitted(true);
          setScore(data.score);
          setExam({ questions: data.questions || [], duration: 0 });
          setAnswers(data.answers || {});
        } else {
          setExam(data);
        }
      } catch {
        navigate(-1);
      }
    })();
  }, [examId, navigate]);

  // 3) Initialize timer
  useEffect(() => {
    if (exam && timeLeft == null && !alreadySubmitted) {
      setTimeLeft(exam.duration * 60);
    }
  }, [exam, timeLeft, alreadySubmitted]);

  // 4) Countdown
  useEffect(() => {
    if (timeLeft == null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, submitted]);

  // 5) Anti-cheat: tab switch
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && !submitted && !alreadySubmitted) {
        setWarningCount(c => c + 1);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [submitted, alreadySubmitted]);

  useEffect(() => {
    if (warningCount === 1) {
      alert('⚠️ Warning: Tab change detected! Next change auto-submits.');
    }
    if (warningCount >= 2 && !submitted && !alreadySubmitted) {
      alert('⚠️ Tab changed again. Auto-submitting.');
      handleSubmit();
    }
  }, [warningCount, submitted, alreadySubmitted]);

  // 6) Persist progress
  useEffect(() => {
    if (!submitted && exam && timeLeft != null) {
      const token = localStorage.getItem('token');
      fetch(
        `${API_URL}/api/exams/${examId}/progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ answers, timeLeft })
        }
      ).catch(console.error);
    }
  }, [answers, timeLeft, exam, submitted, examId]);

  // 7) Release camera on unload or route change
  useEffect(() => {
    const releaseCamera = () => {
      const url = `${YOLO_BACKEND_URL}/release_camera`;
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url);
      } else {
        fetch(url, { method: 'POST', mode: 'no-cors' });
      }
    };
    window.addEventListener('beforeunload', releaseCamera);
    return () => {
      releaseCamera();
      window.removeEventListener('beforeunload', releaseCamera);
    };
  }, []);

  // option select handler
  const handleChange = (qIdx, optIdx) =>
    setAnswers(a => ({ ...a, [qIdx]: optIdx }));

  // submit exam
  async function handleSubmit() {
    if (submitted || alreadySubmitted) return;
    setSubmitted(true);

    const answersArr = (exam.questions || []).map((_, i) =>
      answers.hasOwnProperty(i) ? answers[i] : null
    );
    const rawScore = (exam.questions || []).reduce(
      (sum, q, i) =>
        sum + (answersArr[i] === q.correctAnswerIndex ? 1 : 0),
      0
    );
    setScore(rawScore);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_URL}/api/exams/${examId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ answers: answersArr, score: rawScore })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error('Submit failed:', data);
        alert(`Submit failed: ${data.message || 'Unknown error'}`);
        return;
      }

      // clear progress record
      await fetch(
        `${API_URL}/api/exams/${examId}/progress`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // ── Release camera on successful submit ──
      await fetch(`${YOLO_BACKEND_URL}/release_camera`, {
        method: 'POST'
      });

    } catch (err) {
      console.error('Submit error:', err);
      alert('There was an error submitting your exam.');
    }
  }

  // format timer mm:ss
  const formatTime = secs => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // proctoring feed URL
  const streamUrl =
    `${YOLO_BACKEND_URL}/video_feed`
    + `?exam=${examId}`
    + `&token=${encodeURIComponent(localStorage.getItem('token'))}`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* ===== Sidebar ===== */}
      <div className="w-full lg:w-80 bg-white p-6 flex flex-col sticky top-0 h-screen">
        <div
          className="bg-black w-full mb-4 rounded-lg shadow-lg overflow-hidden relative"
          style={{ paddingTop: '100%' }}
        >
          <img
            ref={imgRef}
            src={streamUrl}
            alt="Proctoring feed"
            className="absolute top-0 left-0 w-full h-full object-cover"
            onLoad={() => setFeedLoaded(true)}
            onError={() => console.error('Feed load error')}
          />
          {!feedLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <BiLoaderAlt className="animate-spin text-white text-4xl" />
            </div>
          )}
        </div>

        <div className="text-4xl font-mono mb-2 text-center">
          {timeLeft != null ? formatTime(timeLeft) : '--:--'}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#002855] h-2 rounded-full transition-all duration-500"
            style={{
              width: exam
                ? `${((exam.duration * 60 - (timeLeft || 0)) /
                     (exam.duration * 60)) * 100}%`
                : '0%'
            }}
          />
        </div>
      </div>

      {/* ===== Main ===== */}
      <div className="flex-1 p-6 lg:p-12 overflow-auto">
        {!exam ? (
          <div className="text-center text-gray-500">Loading exam…</div>
        ) : submitted || alreadySubmitted ? (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-[#002855] mb-4">
              Your Score
            </h2>
            <p className="text-2xl mb-6">
              {score} / {exam.questions.length}
            </p>
            {exam.questions.map((q, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-6 mb-6 text-left max-w-2xl mx-auto"
              >
                <h3 className="text-2xl font-semibold text-[#002855] mb-3">
                  Q{i + 1}. {q.questionText}
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {q.options.map((opt, j) => {
                    const isCorrect = j === q.correctAnswerIndex;
                    const isChosen = answers[i] === j;
                    return (
                      <li
                        key={j}
                        className={
                          isCorrect
                            ? 'text-green-600'
                            : isChosen
                              ? 'text-red-600'
                              : ''
                        }
                      >
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
        ) : (
          <>
            {exam.questions.map((q, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-2xl font-semibold text-[#002855] mb-3">
                  Q{i + 1}. {q.questionText}
                </h3>
                <div className="space-y-3">
                  {q.options.map((opt, j) => (
                    <label
                      key={j}
                      className="flex items-center space-x-3 text-gray-700"
                    >
                      <input
                        type="radio"
                        name={`q${i}`}
                        checked={answers[i] === j}
                        onChange={() => handleChange(i, j)}
                        className="accent-[#002855] h-5 w-5"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="text-center mt-6">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-[#002855] text-white text-lg rounded hover:bg-[#001f47] transition"
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
