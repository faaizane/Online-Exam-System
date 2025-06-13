// File: src/pages/GiveExam.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import StudentHeader from '../components/SHeader';

export default function GiveExam() {
  const { state } = useLocation();
  const params = useParams();
  const examId = params.id;
  const navigate  = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exam, setExam]               = useState(null);
  const [answers, setAnswers]         = useState({});
  const [timeLeft, setTimeLeft]       = useState(null);
  const [submitted, setSubmitted]     = useState(false);
  const [score, setScore]             = useState(null);

  // Fetch exam if not provided via state
  useEffect(() => {
    if (!examId) return navigate(-1);
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/exams/${examId}/student`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setExam(data);
        setTimeLeft(data.duration * 60);
      } catch (err) {
        navigate(-1);
      }
    })();
  }, [examId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft == null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, submitted]);

  // Combine scheduleDate + scheduleTime
  const dateTime = useMemo(() => {
    if (!exam) return null;
    const dt = new Date(exam.scheduleDate);
    const [h, m] = exam.scheduleTime.split(':').map(Number);
    dt.setHours(h, m);
    return dt;
  }, [exam]);

  const examDate = dateTime?.toLocaleDateString();
  const examTime = dateTime?.toLocaleTimeString([], {
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  const status = useMemo(() => {
    if (!dateTime) return '';
    const now = new Date();
    if (dateTime.toDateString() === now.toDateString()) return 'Ongoing';
    return dateTime > now ? 'Scheduled' : 'Completed';
  }, [dateTime]);

  const formatTime = sec => {
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const toggleSidebar = () => setSidebarOpen(o => !o);

  const handleChange = (qIdx, optIdx) => {
    setAnswers(a => ({ ...a, [qIdx]: optIdx }));
  };


  async function handleSubmit() {
  if (submitted) return;
  setSubmitted(true);

  // Convert answers object to array
  const answersArr = (exam.questions || []).map((_, idx) =>
    answers.hasOwnProperty(idx) ? answers[idx] : null
  );

  // Grade
  let rawScore = 0;
  (exam.questions || []).forEach((q, i) => {
    const sel = answersArr[i];
    if (sel == null) return;
    rawScore += sel === q.correctAnswerIndex ? 1 : 0;
  });
  setScore(rawScore);

  // Save result
  try {
    const token = localStorage.getItem('token');
    await fetch(`/api/exams/${exam._id}/submit`, {
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


  if (!exam) return <div>Loading exam...</div>;

  return (
    <div className="min-h-screen flex bg-white overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <StudentHeader toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col lg:flex-row-reverse">
          {/* Camera + Timer */}
          <div className="w-full lg:w-[300px] flex flex-col items-center justify-start p-6">
            <div className="bg-black w-full h-[150px] mb-4 rounded-md shadow-md" />
            <div className="text-3xl font-bold">
              {timeLeft != null ? formatTime(timeLeft) : '--:--'}
            </div>
          </div>

          {/* Questions or Results */}
          <div className="flex-1 p-6 lg:p-12">
            {!submitted ? (
              <>
                {(exam.questions || []).map((q, i) => (
                  <div key={i} className="mb-8">
                    <h2 className="text-2xl font-extrabold mb-2">
                      Question No. {String(i + 1).padStart(2, '0')}
                    </h2>
                    <p className="mb-4 text-gray-800">{q.questionText}</p>
                    <div className="space-y-3">
                      {q.options.map((opt, j) => (
                        <label key={j} className="flex items-center space-x-2 text-gray-700">
                          <input
                            type="radio"
                            name={`q${i}`}
                            className="accent-[#002855]"
                            checked={answers[i] === j}
                            onChange={() => handleChange(i, j)}
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
              </>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-[#002855] mb-4 text-center">
                  Your Score: {score} / {(exam.questions || []).length}
                </h2>
                {(exam.questions || []).map((q, i) => {
                  const correctIdx = q.correctAnswerIndex;
                  const studentAns = answers[i];

                  return (
                    <div key={i} className="mb-8">
                      <h2 className="text-xl font-bold mb-2">
                        Question No. {String(i + 1).padStart(2, '0')}
                      </h2>
                      <p className="mb-4 text-gray-800">{q.questionText}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, j) => {
                          let optionClass = "block px-4 py-2 rounded transition";
                          // Highlighting
                          if (j === correctIdx) {
                            optionClass += " bg-green-200 text-green-900 font-semibold";
                          } else if (j === studentAns && studentAns !== correctIdx) {
                            optionClass += " bg-red-200 text-red-800 font-semibold";
                          } else {
                            optionClass += " bg-gray-100";
                          }

                          return (
                            <div key={j} className={optionClass + " flex items-center"}>
                              <span>{opt}</span>
                              {/* Correct answer */}
                              {j === correctIdx && <span className="ml-2 text-green-800 text-xl">✔️</span>}
                              {/* Student selected wrong */}
                              {j === studentAns && studentAns !== correctIdx && (
                                <span className="ml-2 text-red-700 text-xl">❌</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
