import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar        from '../components/SSidebar';
import StudentHeader  from '../components/SHeader';

export default function GiveExam() {
  const { state }        = useLocation();
  const { id: examId }   = useParams();
  const navigate         = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exam, setExam]               = useState(null);
  const [answers, setAnswers]         = useState({});
  const [timeLeft, setTimeLeft]       = useState(null);
  const [submitted, setSubmitted]     = useState(false);
  const [score, setScore]             = useState(null);

  // anti-cheat / already submitted flags
  const [warningCount,      setWarningCount]      = useState(0);
  const [alreadySubmitted,  setAlreadySubmitted]  = useState(false);
  const [submittedAnswers,  setSubmittedAnswers]  = useState([]);

  /* Fetch exam or existing submission */
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

        if (data.alreadySubmitted) {
          setAlreadySubmitted(true);
          setSubmitted(true);
          setScore(data.score);
          setSubmittedAnswers(data.answers || []);
          setExam({ questions: data.questions || [] });
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

  /* Countdown */
  useEffect(() => {
    if (timeLeft == null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, submitted]);

  /* Tab-change detection */
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden && !submitted && !alreadySubmitted) {
        setWarningCount(c => c + 1);
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [submitted, alreadySubmitted]);

  useEffect(() => {
    if (warningCount === 1) {
      alert('Warning: Tab change detected! Exam will auto-submit on next tab change.');
    }
    if (warningCount === 2 && !submitted && !alreadySubmitted) {
      alert('Tab changed again. Auto-submitting now.');
      handleSubmit();
    }
    // eslint-disable-next-line
  }, [warningCount, submitted, alreadySubmitted]);

  /* Helpers */
  const dateTime = useMemo(() => {
    if (!exam) return null;
    const dt = new Date(exam.scheduleDate);
    if (exam.scheduleTime) {
      const [h, m] = exam.scheduleTime.split(':').map(Number);
      dt.setHours(h, m);
    }
    return dt;
  }, [exam]);

  const toggleSidebar = () => setSidebarOpen(o => !o);
  const handleChange  = (qIdx, optIdx) =>
    setAnswers(a => ({ ...a, [qIdx]: optIdx }));

  /* Submit */
  async function handleSubmit() {
    if (submitted || alreadySubmitted) return;
    setSubmitted(true);

    const answersArr = (exam.questions || []).map((_, i) =>
      answers.hasOwnProperty(i) ? answers[i] : null
    );

    const rawScore = (exam.questions || []).reduce((sum, q, i) =>
      sum + (answersArr[i] === q.correctAnswerIndex ? 1 : 0), 0);

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

  /* ============ RESULT VIEW (alreadySubmitted || submitted) ============ */
  if (alreadySubmitted || submitted) {
    return (
      <div className="min-h-screen flex bg-white overflow-x-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
          <StudentHeader toggleSidebar={toggleSidebar} />
          <div className="flex-1 flex flex-col lg:flex-row-reverse">
            {/* Right sidebar (timer placeholder) */}
            <div className="w-full lg:w-[300px] flex flex-col items-center p-6">
              <div className="bg-black w-full h-[150px] mb-4 rounded-md shadow-md" />
              <div className="text-3xl font-bold">--:--</div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 lg:p-12">
              <h2 className="text-3xl font-bold text-[#002855] mb-6 text-center">
                Your Score: {score} / {(exam.questions || []).length}
              </h2>

              {/* Mobile / Tablet cards */}
              <div className="space-y-6 [@media(min-width:486px)]:hidden">
                {(exam.questions || []).map((q, qi) => (
                  <div key={qi} className="bg-white rounded-xl shadow-md p-4">
                    <h3 className="font-semibold text-[#002855] mb-3">
                      Q{qi + 1}. {q.questionText}
                    </h3>

                    {q.options.map((opt, idx) => {
                      const isCorrect = idx === q.correctAnswerIndex;
                      const isChosen  = idx === (submittedAnswers[qi] ?? answers[qi]);
                      const base      = 'rounded-lg px-3 py-2 text-sm flex items-start';
                      const style =
                        isCorrect
                          ? 'bg-green-50 text-green-800'
                          : isChosen
                            ? 'bg-red-50 text-red-800'
                            : 'bg-gray-100 text-gray-800';

                      return (
                        <div key={idx} className={`${base} ${style} mt-2`}>
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="ml-auto font-semibold">✔ Correct</span>
                          )}
                          {!isCorrect && isChosen && (
                            <span className="ml-auto font-semibold">✖ Your choice</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-gray-200">
                    {(exam.questions || []).map((q, qi) => (
                      <React.Fragment key={qi}>
                        <tr className="bg-[#e7edf6]">
                          <td colSpan="2" className="p-3 font-semibold text-[#002855]">
                            Q{qi + 1}. {q.questionText}
                          </td>
                        </tr>
                        {q.options.map((opt, idx) => {
                          const isCorrect = idx === q.correctAnswerIndex;
                          const isChosen  = idx === (submittedAnswers[qi] ?? answers[qi]);
                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="p-3">{opt}</td>
                              <td className={`p-3 ${
                                isCorrect ? 'text-green-600' : isChosen ? 'text-red-600' : ''
                              }`}>
                                {isCorrect
                                  ? '✔ Correct'
                                  : isChosen
                                    ? '✖ Your choice'
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

  /* ============ LOADING OR EXAM ATTEMPT VIEW ============ */
  if (!exam) return <div className="p-8 text-center">Loading exam…</div>;

  return (
    <div className="min-h-screen flex bg-white overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <StudentHeader toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col lg:flex-row-reverse">
          {/* Right sidebar (timer) */}
          <div className="w-full lg:w-[300px] flex flex-col items-center p-6">
            <div className="bg-black w-full h-[150px] mb-4 rounded-md shadow-md" />
            <div className="text-3xl font-bold">
              {timeLeft != null
                ? `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`
                : '--:--'}
            </div>
          </div>

          {/* Questions */}
          <div className="flex-1 p-6 lg:p-12">
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
