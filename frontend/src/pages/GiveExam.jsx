// // src/pages/GiveExam.jsx
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { BiLoaderAlt } from 'react-icons/bi';

// export default function GiveExam() {
//   const { id: examId } = useParams();
//   const navigate       = useNavigate();
//   const imgRef         = useRef(null);
//   const submittingRef  = useRef(false);

//   const [feedLoaded, setFeedLoaded]             = useState(false);
//   const [exam, setExam]                         = useState(null);
//   const [answers, setAnswers]                   = useState({});
//   const [timeLeft, setTimeLeft]                 = useState(null);
//   const [submitted, setSubmitted]               = useState(false);
//   const [alreadySubmitted, setAlreadySubmitted] = useState(false);
//   const [score, setScore]                       = useState(null);
//   const [warningCount, setWarningCount]         = useState(0);

//   const API_URL          = 'http://localhost:5000';
//   const YOLO_BACKEND_URL = 'http://127.0.0.1:5001';

//   // stable unload handler
//   const beforeUnloadHandler = useCallback((e) => {
//     if (!submitted && !alreadySubmitted) {
//       e.preventDefault();
//       e.returnValue = 'Closing this window will auto-submit your exam.';
//     }
//   }, [submitted, alreadySubmitted]);

//   // register beforeunload once
//   useEffect(() => {
//     window.addEventListener('beforeunload', beforeUnloadHandler);
//     return () => {
//       window.removeEventListener('beforeunload', beforeUnloadHandler);
//     };
//   }, [beforeUnloadHandler]);

//   // auto-submit via Beacon on actual unload
//   useEffect(() => {
//     const handleUnload = () => {
//       if (submitted || alreadySubmitted || !exam) return;
//       const arr = exam.questions.map((_, i) =>
//         answers.hasOwnProperty(i) ? answers[i] : null
//       );
//       const raw = exam.questions.reduce(
//         (s, q, i) => s + (arr[i] === q.correctAnswerIndex ? 1 : 0),
//         0
//       );
//       navigator.sendBeacon(
//         `${API_URL}/api/exams/${examId}/submit`,
//         JSON.stringify({ answers: arr, score: raw })
//       );
//     };
//     window.addEventListener('unload', handleUnload);
//     return () => window.removeEventListener('unload', handleUnload);
//   }, [submitted, alreadySubmitted, exam, answers, examId]);

//   // 1) restore progress
//   useEffect(() => {
//     if (!examId) return;
//     (async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch(
//           `${API_URL}/api/exams/${examId}/progress`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (res.ok) {
//           const p = await res.json();
//           if (p.timeLeft != null) {
//             setAnswers(p.answers || {});
//             setTimeLeft(p.timeLeft);
//           }
//         }
//       } catch {}
//     })();
//   }, [examId]);

//   // 2) fetch exam or past submission
//   useEffect(() => {
//     if (!examId) return navigate(-1);
//     (async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch(
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
//           setAnswers(data.answers || {});
//         } else {
//           setExam(data);
//         }
//       } catch {
//         navigate(-1);
//       }
//     })();
//   }, [examId, navigate]);

//   // 3) init timer
//   useEffect(() => {
//     if (exam && timeLeft == null && !alreadySubmitted) {
//       setTimeLeft(exam.duration * 60);
//     }
//   }, [exam, timeLeft, alreadySubmitted]);

//   // 4) countdown
//   useEffect(() => {
//     if (timeLeft == null || submitted) return;
//     if (timeLeft <= 0) {
//       handleSubmit();
//       return;
//     }
//     const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
//     return () => clearTimeout(t);
//   }, [timeLeft, submitted]);

//   // 5) tab-switch warnings
//   useEffect(() => {
//     const onVis = () => {
//       if (document.hidden && !submitted && !alreadySubmitted) {
//         setWarningCount(c => c + 1);
//       }
//     };
//     document.addEventListener('visibilitychange', onVis);
//     return () => document.removeEventListener('visibilitychange', onVis);
//   }, [submitted, alreadySubmitted]);

//   useEffect(() => {
//     if (warningCount === 1) {
//       alert('⚠️ Warning: You left the exam—next time auto-submits.');
//     }
//     if (warningCount >= 2 && !submitted && !alreadySubmitted) {
//       alert('⚠️ Left again—auto-submitting now.');
//       handleSubmit();
//     }
//   }, [warningCount, submitted, alreadySubmitted]);

//   // 6) persist progress
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
//       );
//     }
//   }, [answers, timeLeft, exam, submitted, examId]);

//   // 7) release camera
//   useEffect(() => {
//     const rel = () => {
//       const u = `${YOLO_BACKEND_URL}/release_camera`;
//       if (navigator.sendBeacon) navigator.sendBeacon(u);
//       else fetch(u, { method:'POST', mode:'no-cors' });
//     };
//     window.addEventListener('beforeunload', rel);
//     return () => window.removeEventListener('beforeunload', rel);
//   }, []);

//   // 8) cheat polling
//   useEffect(() => {
//     if (exam && !submitted && !alreadySubmitted) {
//       const token = localStorage.getItem('token');
//       const iv = setInterval(async () => {
//         const res = await fetch(
//           `${API_URL}/api/cheats/me?exam=${examId}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (res.ok && (await res.json()).cheated) {
//           alert('⚠️ Cheating detected—auto-submitting!');
//           handleSubmit();
//         }
//       }, 5000);
//       return () => clearInterval(iv);
//     }
//   }, [exam, submitted, alreadySubmitted, examId]);

//   // // 9) fullscreen + back
//   // useEffect(() => {
//   //   document.documentElement.requestFullscreen().catch(()=>{});
//   //   window.history.pushState(null, '', window.location.href);
//   //   window.onpopstate = () => {
//   //     alert('Cannot go back—auto-submitting.');
//   //     handleSubmit();
//   //   };
//   //   return () => {
//   //     window.onpopstate = null;
//   //   };
//   // }, []);

//   // // 10) resize
//   // const resizeHandled = useRef(false);
//   // useEffect(() => {
//   //   const onResize = () => {
//   //     if (resizeHandled.current) return;
//   //     resizeHandled.current = true;
//   //     alert('Resizing is not allowed. Your exam will be submitted.');
//   //     handleSubmit();
//   //   };
//   //   window.addEventListener('resize', onResize);
//   //   return () => window.removeEventListener('resize', onResize);
//   // }, []);

//   // inside GiveExam()

// // 9) Prevent back‐button and auto‐submit on back
// useEffect(() => {
//   window.history.pushState(null, '', window.location.href);
//   function onBack() {
//     alert('Cannot go back—auto-submitting.');
//     handleSubmit();
//   }
//   window.onpopstate = onBack;
//   return () => { window.onpopstate = null; };
// }, [handleSubmit]);

// // 10) Auto‐submit on resize
// useEffect(() => {
//   function onResize() {
//     alert('Resizing is not allowed. Your exam will be submitted.');
//     handleSubmit();
//   }
//   window.addEventListener('resize', onResize);
//   return () => window.removeEventListener('resize', onResize);
// }, [handleSubmit]);

// // 11) Auto‐submit if fullscreen ever exits (for browsers that actually enter it)
// useEffect(() => {
//   function onFsChange() {
//     if (!document.fullscreenElement) {
//       alert('You exited fullscreen—auto-submitting.');
//       handleSubmit();
//     }
//   }
//   document.addEventListener('fullscreenchange', onFsChange);
//   return () => document.removeEventListener('fullscreenchange', onFsChange);
// }, [handleSubmit]);

  

//   // select answer
//   const handleChange = (i,j) => setAnswers(a => ({ ...a, [i]: j }));

//   // submit exam
//   async function handleSubmit() {
//     if (submittingRef.current || submitted || alreadySubmitted || !exam)
//       return;
//     submittingRef.current = true;
//     setSubmitted(true);

//     const arr = exam.questions.map((_,i)=>answers[i] ?? null);
//     const raw = exam.questions.reduce(
//       (s,q,i)=>s + (arr[i]===q.correctAnswerIndex ? 1:0),
//       0
//     );
//     setScore(raw);

//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(
//         `${API_URL}/api/exams/${examId}/submit`,
//         {
//           method:'POST',
//           headers:{
//             'Content-Type':'application/json',
//             Authorization:`Bearer ${token}`
//           },
//           body:JSON.stringify({ answers:arr, score:raw })
//         }
//       );
//       if (!res.ok) throw new Error();

//             // ←── add this so TestPage button flips immediately
//       const data = await res.json();
//       localStorage.setItem(`submission_${examId}`, data.submissionId);

//       // remove unload warning
//       window.removeEventListener('beforeunload', beforeUnloadHandler);
//       window.onpopstate = null;
//       document.exitFullscreen?.();

//       await fetch(`${API_URL}/api/exams/${examId}/progress`, {
//         method:'DELETE',
//         headers:{ Authorization:`Bearer ${token}` }
//       });
//       await fetch(`${YOLO_BACKEND_URL}/release_camera`, {
//         method:'POST'
//       });
//     } catch {
//       alert('Submission failed—retry.');
//       submittingRef.current = false;
//       setSubmitted(false);
//     }
//   }

//   // format mm:ss
//   const fmt = s => {
//     const m = String(Math.floor(s/60)).padStart(2,'0');
//     const sec = String(s%60).padStart(2,'0');
//     return `${m}:${sec}`;
//   };

//   const streamUrl = `${YOLO_BACKEND_URL}/video_feed?exam=${examId}&token=${encodeURIComponent(localStorage.getItem('token'))}`;

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
//       {/* Sidebar */}
//       <div className="w-full lg:w-80 bg-white p-6 flex flex-col sticky top-0 h-screen">
//         <div className="bg-black mb-4 rounded-lg overflow-hidden relative" style={{ paddingTop:'100%' }}>
//           <img
//             ref={imgRef}
//             src={streamUrl}
//             alt="Proctoring"
//             className="absolute top-0 left-0 w-full h-full object-cover"
//             onLoad={()=>setFeedLoaded(true)}
//           />
//           {!feedLoaded && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black">
//               <BiLoaderAlt className="animate-spin text-white text-4xl"/>
//             </div>
//           )}
//         </div>
//         <div className="text-4xl font-mono mb-2 text-center">
//           {timeLeft!=null ? fmt(timeLeft) : '--:--'}
//         </div>
//         <div className="w-full bg-gray-200 h-2 rounded-full">
//           <div
//             className="bg-[#002855] h-2 rounded-full transition-all duration-500"
//             style={{
//               width: exam
//                 ? `${((exam.duration*60 - (timeLeft||0)) / (exam.duration*60)) * 100}%`
//                 : '0%'
//             }}
//           />
//         </div>
//       </div>

//       {/* Main */}
//       <div className="flex-1 p-6 lg:p-12 overflow-auto">
//         {!exam ? (
//           <div className="text-center text-gray-500">Loading exam…</div>
//         ) : submitted || alreadySubmitted ? (
//           <div className="text-center">
//             <h2 className="text-4xl font-bold text-[#002855] mb-4">Your Score</h2>
//             <p className="text-2xl mb-6">{score} / {exam.questions.length}</p>
//             {exam.questions.map((q,i) => (
//               <div key={i} className="bg-white rounded-xl shadow-md p-6 mb-6 max-w-2xl mx-auto text-left">
//                 <h3 className="text-2xl font-semibold text-[#002855] mb-3">Q{i+1}. {q.questionText}</h3>
//                 <ul className="list-disc list-inside space-y-2">
//                   {q.options.map((opt,j) => {
//                     const corr = j === q.correctAnswerIndex;
//                     const cho  = answers[i] === j;
//                     return (
//                       <li key={j} className={corr ? 'text-green-600' : cho ? 'text-red-600' : ''}>
//                         {opt} {corr ? '✔️' : cho ? '❌' : ''}
//                       </li>
//                     );
//                   })}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <>
//             {exam.questions.map((q,i) => (
//               <div key={i} className="bg-white rounded-xl shadow-md p-6 mb-8">
//                 <h3 className="text-2xl font-semibold text-[#002855] mb-3">Q{i+1}. {q.questionText}</h3>
//                 <div className="space-y-3">
//                   {q.options.map((opt,j) => (
//                     <label key={j} className="flex items-center space-x-3">
//                       <input
//                         type="radio"
//                         checked={answers[i] === j}
//                         onChange={() => handleChange(i,j)}
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
//                 disabled={submitted}
//                 className={`px-8 py-3 text-lg rounded transition ${
//                   submitted ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#002855] hover:bg-[#001f47] text-white'
//                 }`}
//               >
//                 {submitted ? 'Submitted' : 'Submit'}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }



// /// with env variables

// // src/pages/GiveExam.jsx
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { BiLoaderAlt } from 'react-icons/bi';

// export default function GiveExam() {
//   const { id: examId } = useParams();
//   const navigate = useNavigate();
//   const imgRef = useRef(null);
//   const submittingRef = useRef(false);

//   const [feedLoaded, setFeedLoaded] = useState(false);
//   const [exam, setExam] = useState(null);
//   const [answers, setAnswers] = useState({});
//   const [timeLeft, setTimeLeft] = useState(null);
//   const [submitted, setSubmitted] = useState(false);
//   const [alreadySubmitted, setAlreadySubmitted] = useState(false);
//   const [score, setScore] = useState(null);
//   const [warningCount, setWarningCount] = useState(0);

//   const API_URL = import.meta.env.VITE_API_BASE_URL;
//   const YOLO_BACKEND_URL = import.meta.env.VITE_YOLO_BACKEND_URL;

//   const beforeUnloadHandler = useCallback((e) => {
//     if (!submitted && !alreadySubmitted) {
//       e.preventDefault();
//       e.returnValue = 'Closing this window will auto-submit your exam.';
//     }
//   }, [submitted, alreadySubmitted]);

//   useEffect(() => {
//     window.addEventListener('beforeunload', beforeUnloadHandler);
//     return () => {
//       window.removeEventListener('beforeunload', beforeUnloadHandler);
//     };
//   }, [beforeUnloadHandler]);

//   useEffect(() => {
//     const handleUnload = () => {
//       if (submitted || alreadySubmitted || !exam) return;
//       const arr = exam.questions.map((_, i) =>
//         answers.hasOwnProperty(i) ? answers[i] : null
//       );
//       const raw = exam.questions.reduce(
//         (s, q, i) => s + (arr[i] === q.correctAnswerIndex ? 1 : 0),
//         0
//       );
//       navigator.sendBeacon(
//         `${API_URL}/api/exams/${examId}/submit`,
//         JSON.stringify({ answers: arr, score: raw })
//       );
//     };
//     window.addEventListener('unload', handleUnload);
//     return () => window.removeEventListener('unload', handleUnload);
//   }, [submitted, alreadySubmitted, exam, answers, examId]);

//   useEffect(() => {
//     if (!examId) return;
//     (async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch(
//           `${API_URL}/api/exams/${examId}/progress`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (res.ok) {
//           const p = await res.json();
//           if (p.timeLeft != null) {
//             setAnswers(p.answers || {});
//             setTimeLeft(p.timeLeft);
//           }
//         }
//       } catch {}
//     })();
//   }, [examId]);

//   useEffect(() => {
//     if (!examId) return navigate(-1);
//     (async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch(
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
//           setAnswers(data.answers || {});
//         } else {
//           setExam(data);
//         }
//       } catch {
//         navigate(-1);
//       }
//     })();
//   }, [examId, navigate]);

//   useEffect(() => {
//     if (exam && timeLeft == null && !alreadySubmitted) {
//       setTimeLeft(exam.duration * 60);
//     }
//   }, [exam, timeLeft, alreadySubmitted]);

//   useEffect(() => {
//     if (timeLeft == null || submitted) return;
//     if (timeLeft <= 0) {
//       handleSubmit();
//       return;
//     }
//     const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
//     return () => clearTimeout(t);
//   }, [timeLeft, submitted]);

//   useEffect(() => {
//     const onVis = () => {
//       if (document.hidden && !submitted && !alreadySubmitted) {
//         setWarningCount(c => c + 1);
//       }
//     };
//     document.addEventListener('visibilitychange', onVis);
//     return () => document.removeEventListener('visibilitychange', onVis);
//   }, [submitted, alreadySubmitted]);

//   useEffect(() => {
//     if (warningCount === 1) {
//       alert('⚠️ Warning: You left the exam—next time auto-submits.');
//     }
//     if (warningCount >= 2 && !submitted && !alreadySubmitted) {
//       alert('⚠️ Left again—auto-submitting now.');
//       handleSubmit();
//     }
//   }, [warningCount, submitted, alreadySubmitted]);

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
//       );
//     }
//   }, [answers, timeLeft, exam, submitted, examId]);

//   useEffect(() => {
//     const rel = () => {
//       const u = `${YOLO_BACKEND_URL}/release_camera`;
//       if (navigator.sendBeacon) navigator.sendBeacon(u);
//       else fetch(u, { method: 'POST', mode: 'no-cors' });
//     };
//     window.addEventListener('beforeunload', rel);
//     return () => window.removeEventListener('beforeunload', rel);
//   }, []);

//   useEffect(() => {
//     if (exam && !submitted && !alreadySubmitted) {
//       const token = localStorage.getItem('token');
//       const iv = setInterval(async () => {
//         const res = await fetch(
//           `${API_URL}/api/cheats/me?exam=${examId}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (res.ok && (await res.json()).cheated) {
//           alert('⚠️ Cheating detected—auto-submitting!');
//           handleSubmit();
//         }
//       }, 5000);
//       return () => clearInterval(iv);
//     }
//   }, [exam, submitted, alreadySubmitted, examId]);

//   useEffect(() => {
//     window.history.pushState(null, '', window.location.href);
//     function onBack() {
//       alert('Cannot go back—auto-submitting.');
//       handleSubmit();
//     }
//     window.onpopstate = onBack;
//     return () => { window.onpopstate = null; };
//   }, [handleSubmit]);

//   useEffect(() => {
//     function onResize() {
//       alert('Resizing is not allowed. Your exam will be submitted.');
//       handleSubmit();
//     }
//     window.addEventListener('resize', onResize);
//     return () => window.removeEventListener('resize', onResize);
//   }, [handleSubmit]);

//   useEffect(() => {
//     function onFsChange() {
//       if (!document.fullscreenElement) {
//         alert('You exited fullscreen—auto-submitting.');
//         handleSubmit();
//       }
//     }
//     document.addEventListener('fullscreenchange', onFsChange);
//     return () => document.removeEventListener('fullscreenchange', onFsChange);
//   }, [handleSubmit]);

//   const handleChange = (i, j) => setAnswers(a => ({ ...a, [i]: j }));

//   async function handleSubmit() {
//     if (submittingRef.current || submitted || alreadySubmitted || !exam) return;
//     submittingRef.current = true;
//     setSubmitted(true);

//     const arr = exam.questions.map((_, i) => answers[i] ?? null);
//     const raw = exam.questions.reduce(
//       (s, q, i) => s + (arr[i] === q.correctAnswerIndex ? 1 : 0),
//       0
//     );
//     setScore(raw);

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
//           body: JSON.stringify({ answers: arr, score: raw })
//         }
//       );
//       if (!res.ok) throw new Error();

//       const data = await res.json();
//       localStorage.setItem(`submission_${examId}`, data.submissionId);

//       window.removeEventListener('beforeunload', beforeUnloadHandler);
//       window.onpopstate = null;
//       document.exitFullscreen?.();

//       await fetch(`${API_URL}/api/exams/${examId}/progress`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       await fetch(`${YOLO_BACKEND_URL}/release_camera`, { method: 'POST' });
//     } catch {
//       alert('Submission failed—retry.');
//       submittingRef.current = false;
//       setSubmitted(false);
//     }
//   }

//   const fmt = s => {
//     const m = String(Math.floor(s / 60)).padStart(2, '0');
//     const sec = String(s % 60).padStart(2, '0');
//     return `${m}:${sec}`;
//   };

//   const streamUrl = `${YOLO_BACKEND_URL}/video_feed?exam=${examId}&token=${encodeURIComponent(localStorage.getItem('token'))}`;

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
//       <div className="w-full lg:w-80 bg-white p-6 flex flex-col sticky top-0 h-screen">
//         <div className="bg-black mb-4 rounded-lg overflow-hidden relative" style={{ paddingTop: '100%' }}>
//           <img
//             ref={imgRef}
//             src={streamUrl}
//             alt="Proctoring"
//             className="absolute top-0 left-0 w-full h-full object-cover"
//             onLoad={() => setFeedLoaded(true)}
//           />
//           {!feedLoaded && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black">
//               <BiLoaderAlt className="animate-spin text-white text-4xl" />
//             </div>
//           )}
//         </div>
//         <div className="text-4xl font-mono mb-2 text-center">
//           {timeLeft != null ? fmt(timeLeft) : '--:--'}
//         </div>
//         <div className="w-full bg-gray-200 h-2 rounded-full">
//           <div
//             className="bg-[#002855] h-2 rounded-full transition-all duration-500"
//             style={{
//               width: exam
//                 ? `${((exam.duration * 60 - (timeLeft || 0)) / (exam.duration * 60)) * 100}%`
//                 : '0%'
//             }}
//           />
//         </div>
//       </div>

//       <div className="flex-1 p-6 lg:p-12 overflow-auto">
//         {!exam ? (
//           <div className="text-center text-gray-500">Loading exam…</div>
//         ) : submitted || alreadySubmitted ? (
//           <div className="text-center">
//             <h2 className="text-4xl font-bold text-[#002855] mb-4">Your Score</h2>
//             <p className="text-2xl mb-6">{score} / {exam.questions.length}</p>
//             {exam.questions.map((q, i) => (
//               <div key={i} className="bg-white rounded-xl shadow-md p-6 mb-6 max-w-2xl mx-auto text-left">
//                 <h3 className="text-2xl font-semibold text-[#002855] mb-3">Q{i + 1}. {q.questionText}</h3>
//                 <ul className="list-disc list-inside space-y-2">
//                   {q.options.map((opt, j) => {
//                     const corr = j === q.correctAnswerIndex;
//                     const cho = answers[i] === j;
//                     return (
//                       <li key={j} className={corr ? 'text-green-600' : cho ? 'text-red-600' : ''}>
//                         {opt} {corr ? '✔️' : cho ? '❌' : ''}
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
//                 <h3 className="text-2xl font-semibold text-[#002855] mb-3">Q{i + 1}. {q.questionText}</h3>
//                 <div className="space-y-3">
//                   {q.options.map((opt, j) => (
//                     <label key={j} className="flex items-center space-x-3">
//                       <input
//                         type="radio"
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
//                 disabled={submitted}
//                 className={`px-8 py-3 text-lg rounded transition ${submitted ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#002855] hover:bg-[#001f47] text-white'}`}
//               >
//                 {submitted ? 'Submitted' : 'Submit'}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }







// // src/pages/GiveExam.jsx
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { BiLoaderAlt } from 'react-icons/bi';

// export default function GiveExam() {
//   const { id: examId } = useParams();
//   const navigate = useNavigate();
//   const imgRef = useRef(null);
//   const submittingRef = useRef(false);

//   const [feedLoaded, setFeedLoaded] = useState(false);
//   const [exam, setExam] = useState(null);
//   const [answers, setAnswers] = useState({});
//   const [timeLeft, setTimeLeft] = useState(null);
//   const [submitted, setSubmitted] = useState(false);
//   const [alreadySubmitted, setAlreadySubmitted] = useState(false);
//   const [score, setScore] = useState(null);
//   const [warningCount, setWarningCount] = useState(0);

//   const API_URL = import.meta.env.VITE_API_BASE_URL;
//   const YOLO_BACKEND_URL = import.meta.env.VITE_YOLO_BACKEND_URL;

//   const beforeUnloadHandler = useCallback((e) => {
//     if (!submitted && !alreadySubmitted) {
//       e.preventDefault();
//       e.returnValue = 'Closing this window will auto-submit your exam.';
//     }
//   }, [submitted, alreadySubmitted]);

//   useEffect(() => {
//     window.addEventListener('beforeunload', beforeUnloadHandler);
//     return () => window.removeEventListener('beforeunload', beforeUnloadHandler);
//   }, [beforeUnloadHandler]);

//   useEffect(() => {
//     const handleUnload = () => {
//       if (submitted || alreadySubmitted || !exam) return;
//       const arr = exam.questions.map((_, i) =>
//         answers.hasOwnProperty(i) ? answers[i] : null
//       );
//       const raw = exam.questions.reduce(
//         (s, q, i) => s + (arr[i] === q.correctAnswerIndex ? 1 : 0),
//         0
//       );
//       navigator.sendBeacon(
//         `${API_URL}/api/exams/${examId}/submit`,
//         JSON.stringify({ answers: arr, score: raw })
//       );
//     };
//     window.addEventListener('unload', handleUnload);
//     return () => window.removeEventListener('unload', handleUnload);
//   }, [submitted, alreadySubmitted, exam, answers, examId]);

//   useEffect(() => {
//     if (!examId) return;
//     (async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch(
//           `${API_URL}/api/exams/${examId}/progress`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (res.ok) {
//           const p = await res.json();
//           if (p.timeLeft != null) {
//             setAnswers(p.answers || {});
//             setTimeLeft(p.timeLeft);
//           }
//         }
//       } catch {}
//     })();
//   }, [examId]);

//   useEffect(() => {
//     if (!examId) return navigate(-1);
//     (async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch(
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
//           setAnswers(data.answers || {});
//         } else {
//           setExam(data);
//         }
//       } catch {
//         navigate(-1);
//       }
//     })();
//   }, [examId, navigate]);

//   useEffect(() => {
//     if (exam && timeLeft == null && !alreadySubmitted) {
//       setTimeLeft(exam.duration * 60);
//     }
//   }, [exam, timeLeft, alreadySubmitted]);

//   useEffect(() => {
//     if (timeLeft == null || submitted) return;
//     if (timeLeft <= 0) {
//       handleSubmit();
//       return;
//     }
//     const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
//     return () => clearTimeout(t);
//   }, [timeLeft, submitted]);

//   useEffect(() => {
//     const onVis = () => {
//       if (document.hidden && !submitted && !alreadySubmitted) {
//         setWarningCount(c => c + 1);
//       }
//     };
//     document.addEventListener('visibilitychange', onVis);
//     return () => document.removeEventListener('visibilitychange', onVis);
//   }, [submitted, alreadySubmitted]);

//   useEffect(() => {
//     if (warningCount === 1) {
//       alert('⚠️ Warning: You left the exam—next time auto-submits.');
//     }
//     if (warningCount >= 2 && !submitted && !alreadySubmitted) {
//       alert('⚠️ Left again—auto-submitting now.');
//       handleSubmit();
//     }
//   }, [warningCount, submitted, alreadySubmitted]);

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
//       );
//     }
//   }, [answers, timeLeft, exam, submitted, examId]);

//   useEffect(() => {
//     const rel = () => {
//       const u = `${YOLO_BACKEND_URL}/release_camera`;
//       if (navigator.sendBeacon) navigator.sendBeacon(u);
//       else fetch(u, { method: 'POST', mode: 'no-cors' });
//     };
//     window.addEventListener('beforeunload', rel);
//     return () => window.removeEventListener('beforeunload', rel);
//   }, []);

//   useEffect(() => {
//     if (exam && !submitted && !alreadySubmitted) {
//       const token = localStorage.getItem('token');
//       const iv = setInterval(async () => {
//         const res = await fetch(
//           `${API_URL}/api/cheats/me?exam=${examId}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (res.ok && (await res.json()).cheated) {
//           alert('⚠️ Cheating detected—auto-submitting!');
//           handleSubmit();
//         }
//       }, 5000);
//       return () => clearInterval(iv);
//     }
//   }, [exam, submitted, alreadySubmitted, examId]);

//   useEffect(() => {
//     window.history.pushState(null, '', window.location.href);
//     function onBack() {
//       alert('Cannot go back—auto-submitting.');
//       handleSubmit();
//     }
//     window.onpopstate = onBack;
//     return () => { window.onpopstate = null; };
//   }, []);

//   // == Updated: Desktop resize + mobile orientation-change ==
//   useEffect(() => {
//     function onResize() {
//       if (window.matchMedia('(min-width: 1024px)').matches) {
//         alert('⚠️ Resizing is not allowed. Your exam will be submitted.');
//         handleSubmit();
//       }
//     }
//     function onOrientationChange() {
//       alert('⚠️ Orientation change is not allowed. Your exam will be submitted.');
//       handleSubmit();
//     }
//     window.addEventListener('resize', onResize);
//     window.addEventListener('orientationchange', onOrientationChange);
//     return () => {
//       window.removeEventListener('resize', onResize);
//       window.removeEventListener('orientationchange', onOrientationChange);
//     };
//   }, [handleSubmit]);

//   const handleChange = (i, j) => setAnswers(a => ({ ...a, [i]: j }));

//   async function handleSubmit() {
//     if (submittingRef.current || submitted || alreadySubmitted || !exam) return;
//     submittingRef.current = true;
//     setSubmitted(true);

//     const arr = exam.questions.map((_, i) => answers[i] ?? null);
//     const raw = exam.questions.reduce(
//       (s, q, i) => s + (arr[i] === q.correctAnswerIndex ? 1 : 0),
//       0
//     );
//     setScore(raw);

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
//           body: JSON.stringify({ answers: arr, score: raw })
//         }
//       );
//       if (!res.ok) throw new Error();

//       const data = await res.json();
//       localStorage.setItem(`submission_${examId}`, data.submissionId);

//       window.removeEventListener('beforeunload', beforeUnloadHandler);
//       window.onpopstate = null;
//       document.exitFullscreen?.();

//       await fetch(`${API_URL}/api/exams/${examId}/progress`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       await fetch(`${YOLO_BACKEND_URL}/release_camera`, { method: 'POST' });
//     } catch {
//       alert('Submission failed—retry.');
//       submittingRef.current = false;
//       setSubmitted(false);
//     }
//   }

//   const fmt = s => {
//     const m = String(Math.floor(s / 60)).padStart(2, '0');
//     const sec = String(s % 60).padStart(2, '0');
//     return `${m}:${sec}`;
//   };

//   const streamUrl = `${YOLO_BACKEND_URL}/video_feed?exam=${examId}&token=${encodeURIComponent(localStorage.getItem('token'))}`;

//   return (
//     <>
//       {/* Ensure in public/index.html: <meta name="viewport" content="width=device-width, initial-scale=1" /> */}
//       <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
//         {/* Side panel */}
//         <div className="w-full lg:w-80 bg-white p-6 flex flex-col sticky lg:top-0 h-auto lg:h-screen">
//           <div className="bg-black mb-4 rounded-lg overflow-hidden relative" style={{ paddingTop: '100%' }}>
//             <img
//               ref={imgRef}
//               src={streamUrl}
//               alt="Proctoring"
//               className="absolute top-0 left-0 w-full h-full object-cover"
//               onLoad={() => setFeedLoaded(true)}
//             />
//             {!feedLoaded && (
//               <div className="absolute inset-0 flex items-center justify-center bg-black">
//                 <BiLoaderAlt className="animate-spin text-white text-4xl" />
//               </div>
//             )}
//           </div>
//           <div className="text-4xl font-mono mb-2 text-center">
//             {timeLeft != null ? fmt(timeLeft) : '--:--'}
//           </div>
//           <div className="w-full bg-gray-200 h-2 rounded-full">
//             <div
//               className="bg-[#002855] h-2 rounded-full transition-all duration-500"
//               style={{
//                 width: exam
//                   ? `${((exam.duration * 60 - (timeLeft || 0)) / (exam.duration * 60)) * 100}%`
//                   : '0%'
//               }}
//             />
//           </div>
//         </div>

//         {/* Main content */}
//         <div className="flex-1 p-6 lg:p-12 overflow-auto">
//           {!exam ? (
//             <div className="text-center text-gray-500">Loading exam…</div>
//           ) : submitted || alreadySubmitted ? (
//             <div className="text-center">
//               <h2 className="text-4xl font-bold text-[#002855] mb-4">Your Score</h2>
//               <p className="text-2xl mb-6">{score} / {exam.questions.length}</p>
//               {exam.questions.map((q, i) => (
//                 <div key={i} className="bg-white rounded-xl shadow-md p-6 mb-6 max-w-2xl mx-auto text-left">
//                   <h3 className="text-2xl font-semibold text-[#002855] mb-3">
//                     Q{i + 1}. {q.questionText}
//                   </h3>
//                   <ul className="list-disc list-inside space-y-2">
//                     {q.options.map((opt, j) => {
//                       const corr = j === q.correctAnswerIndex;
//                       const cho = answers[i] === j;
//                       return (
//                         <li key={j} className={corr ? 'text-green-600' : cho ? 'text-red-600' : ''}>
//                           {opt} {corr ? '✔️' : cho ? '❌' : ''}
//                         </li>
//                       );
//                     })}
//                   </ul>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <>
//               {exam.questions.map((q, i) => (
//                 <div key={i} className="bg-white rounded-xl shadow-md p-6 mb-8">
//                   <h3 className="text-2xl font-semibold text-[#002855] mb-3">
//                     Q{i + 1}. {q.questionText}
//                   </h3>
//                   <div className="space-y-3">
//                     {q.options.map((opt, j) => (
//                       <label key={j} className="flex items-center space-x-3">
//                         <input
//                           type="radio"
//                           checked={answers[i] === j}
//                           onChange={() => handleChange(i, j)}
//                           className="accent-[#002855] h-5 w-5"
//                         />
//                         <span>{opt}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//               <div className="text-center mt-6">
//                 <button
//                   onClick={handleSubmit}
//                   disabled={submitted}
//                   className={`px-8 py-3 text-lg rounded transition ${submitted ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#002855] hover:bg-[#001f47] text-white'}`}
//                 >
//                   {submitted ? 'Submitted' : 'Submit'}
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }












// src/pages/GiveExam.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BiLoaderAlt } from 'react-icons/bi';

export default function GiveExam() {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const imgRef = useRef(null);
  const submittingRef = useRef(false);
  const onVisRef = useRef(null);

  const [feedLoaded, setFeedLoaded] = useState(false);
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const YOLO_BACKEND_URL = import.meta.env.VITE_YOLO_BACKEND_URL;

  // Prevent accidental close
  const beforeUnloadHandler = useCallback((e) => {
    if (!submitted && !alreadySubmitted) {
      e.preventDefault();
      e.returnValue = 'Closing this window will auto-submit your exam.';
    }
  }, [submitted, alreadySubmitted]);

  useEffect(() => {
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, [beforeUnloadHandler]);

  // Auto-submit on unload if needed
  useEffect(() => {
    const handleUnload = () => {
      if (submitted || alreadySubmitted || !exam) return;
      handleSubmit();
    };
    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, [submitted, alreadySubmitted, exam]);

  // Immediate auto-submit on first tab switch
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden && !submitted && !alreadySubmitted) {
        alert('⚠️ Tab change detected—auto-submitting now.');
        handleSubmit();
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [submitted, alreadySubmitted]);

  // Load saved progress
  useEffect(() => {
    if (!examId) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${API_URL}/api/exams/${examId}/progress`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const p = await res.json();
          if (p.timeLeft != null) {
            setAnswers(p.answers || {});
            setTimeLeft(p.timeLeft);
          }
        }
      } catch {}
    })();
  }, [examId]);

  // Fetch exam details or submission
  useEffect(() => {
    if (!examId) return navigate(-1);
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
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

  // Initialize timer
  useEffect(() => {
    if (exam && timeLeft == null && !alreadySubmitted) {
      setTimeLeft(exam.duration * 60);
    }
  }, [exam, timeLeft, alreadySubmitted]);

  // Countdown
  useEffect(() => {
    if (timeLeft == null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted]);

  // Periodically save progress
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
      );
    }
  }, [answers, timeLeft, exam, submitted, examId]);

  // Release camera on leave
  useEffect(() => {
    const rel = () => {
      const u = `${YOLO_BACKEND_URL}/release_camera`;
      if (navigator.sendBeacon) navigator.sendBeacon(u);
      else fetch(u, { method: 'POST', mode: 'no-cors' });
    };
    window.addEventListener('beforeunload', rel);
    return () => window.removeEventListener('beforeunload', rel);
  }, []);

  // Cheating poll
  useEffect(() => {
    if (exam && !submitted && !alreadySubmitted) {
      const token = localStorage.getItem('token');
      const iv = setInterval(async () => {
        const res = await fetch(
          `${API_URL}/api/cheats/me?exam=${examId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok && (await res.json()).cheated) {
          alert('⚠️ Cheating detected—auto-submitting!');
          handleSubmit();
        }
      }, 5000);
      return () => clearInterval(iv);
    }
  }, [exam, submitted, alreadySubmitted, examId]);

  // Prevent back navigation
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    function onBack() {
      alert('Cannot go back—auto-submitting.');
      handleSubmit();
    }
    window.onpopstate = onBack;
    return () => { window.onpopstate = null; };
  }, []);

  // Desktop resize lock (mobile scrolling won’t trigger this)
  useEffect(() => {
    function onResize() {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        alert('⚠️ Resizing is not allowed. Auto-submitting.');
        handleSubmit();
      }
    }
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [handleSubmit]);

  // Handle answer change
  const handleChange = (i, j) => setAnswers(a => ({ ...a, [i]: j }));

  // Submit logic
  async function handleSubmit() {
    if (submittingRef.current || submitted || alreadySubmitted || !exam) return;
    submittingRef.current = true;
    setSubmitted(true);

    // Remove visibility listener so no further tab submissions
    document.removeEventListener('visibilitychange', onVisRef.current);

    const arr = exam.questions.map((_, i) => answers[i] ?? null);
    const raw = exam.questions.reduce(
      (s, q, i) => s + (arr[i] === q.correctAnswerIndex ? 1 : 0),
      0
    );
    setScore(raw);

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
          body: JSON.stringify({ answers: arr, score: raw })
        }
      );
      if (!res.ok) throw new Error();

      const data = await res.json();
      localStorage.setItem(`submission_${examId}`, data.submissionId);

      window.removeEventListener('beforeunload', beforeUnloadHandler);
      window.onpopstate = null;
      document.exitFullscreen?.();

      await fetch(`${API_URL}/api/exams/${examId}/progress`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetch(`${YOLO_BACKEND_URL}/release_camera`, { method: 'POST' });
    } catch {
      alert('Submission failed—retry.');
      submittingRef.current = false;
      setSubmitted(false);
    }
  }

  // Format timer
  const fmt = s => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  };

  // Video stream URL
  const streamUrl = `${YOLO_BACKEND_URL}/video_feed?exam=${examId}&token=${encodeURIComponent(localStorage.getItem('token'))}`;

  return (
    <>
      {/* Ensure public/index.html includes: */}
      {/* <meta name="viewport" content="width=device-width, initial-scale=1" /> */}

      <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
        {/* Side panel */}
        <div className="w-full lg:w-80 bg-white p-6 flex flex-col sticky lg:top-0 h-auto lg:h-screen">
          <div className="bg-black mb-4 rounded-lg overflow-hidden relative" style={{ paddingTop: '100%' }}>
            <img
              ref={imgRef}
              src={streamUrl}
              alt="Proctoring"
              className="absolute top-0 left-0 w-full h-full object-cover"
              onLoad={() => setFeedLoaded(true)}
            />
            {!feedLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <BiLoaderAlt className="animate-spin text-white text-4xl" />
              </div>
            )}
          </div>
          <div className="text-4xl font-mono mb-2 text-center">
            {timeLeft != null ? fmt(timeLeft) : '--:--'}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-[#002855] h-2 rounded-full transition-all duration-500"
              style={{
                width: exam
                  ? `${((exam.duration * 60 - (timeLeft || 0)) / (exam.duration * 60)) * 100}%`
                  : '0%'
              }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 lg:p-12 overflow-auto">
          {!exam ? (
            <div className="text-center text-gray-500">Loading exam…</div>
          ) : submitted || alreadySubmitted ? (
            <div className="text-center">
              <h2 className="text-4xl font-bold text-[#002855] mb-4">Your Score</h2>
              <p className="text-2xl mb-6">{score} / {exam.questions.length}</p>
              {exam.questions.map((q, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 mb-6 max-w-2xl mx-auto text-left">
                  <h3 className="text-2xl font-semibold text-[#002855] mb-3">
                    Q{i + 1}. {q.questionText}
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    {q.options.map((opt, j) => {
                      const corr = j === q.correctAnswerIndex;
                      const cho = answers[i] === j;
                      return (
                        <li key={j} className={corr ? 'text-green-600' : cho ? 'text-red-600' : ''}>
                          {opt} {corr ? '✔️' : cho ? '❌' : ''}
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
                      <label key={j} className="flex items-center space-x-3">
                        <input
                          type="radio"
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
                  disabled={submitted}
                  className={`px-8 py-3 text-lg rounded transition ${
                    submitted ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#002855] hover:bg-[#001f47] text-white'
                  }`}
                >
                  {submitted ? 'Submitted' : 'Submit'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
