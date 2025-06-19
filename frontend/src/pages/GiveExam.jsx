// frontend/src/pages/GiveExam.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar       from '../components/SSidebar';
import StudentHeader from '../components/SHeader';

export default function GiveExam() {
  const { id: examId }  = useParams();
  const navigate        = useNavigate();

  const [exam,               setExam]            = useState(null);
  const [answers,            setAnswers]         = useState({});
  const [timeLeft,           setTimeLeft]        = useState(null);
  const [submitted,          setSubmitted]       = useState(false);
  const [alreadySubmitted,   setAlreadySubmitted]= useState(false);
  const [score,              setScore]           = useState(null);
  const [warningCount,       setWarningCount]    = useState(0);
  const [submittedAnswers,   setSubmittedAnswers] = useState([]);

  // 1️⃣ Fetch exam or existing submission
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  // 2️⃣ Countdown timer
  useEffect(() => {
    if (timeLeft == null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timerId = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerId);
  }, [timeLeft, submitted]);

  // 3️⃣ Disable right-click & refresh/close keys
  useEffect(() => {
    const prevent = e => e.preventDefault();
    window.addEventListener('contextmenu', prevent);
    const trapKeys = e => {
      if (
        e.key === 'F5' ||
        (e.ctrlKey && ['r','w'].includes(e.key.toLowerCase())) ||
        (e.altKey && e.key === 'F4')
      ) e.preventDefault();
    };
    window.addEventListener('keydown', trapKeys);
    return () => {
      window.removeEventListener('contextmenu', prevent);
      window.removeEventListener('keydown', trapKeys);
    };
  }, []);

  // 4️⃣ Tab/window blur detection
  useEffect(() => {
    const onBlur = () => {
      if (!submitted && !alreadySubmitted) {
        setWarningCount(c => c + 1);
      }
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [submitted, alreadySubmitted]);

  // 5️⃣ Warn then auto-submit on second blur
  useEffect(() => {
    if (warningCount === 1) {
      alert('Warning: You left the exam window! Next time will auto-submit.');
    }
    if (warningCount >= 2 && !submitted && !alreadySubmitted) {
      alert('Auto-submitting due to window switch.');
      handleSubmit();
    }
  }, [warningCount, submitted, alreadySubmitted]);

  // 6️⃣ Auto-submit on close/refresh via Beacon or keepalive fetch
  useEffect(() => {
    const onBeforeUnload = e => {
      if (submitted || alreadySubmitted) return;
      const arr = (exam?.questions || []).map((_, i) =>
        answers.hasOwnProperty(i) ? answers[i] : null
      );
      const rawScore = (exam?.questions || []).reduce((sum, q, i) =>
        sum + (arr[i] === q.correctAnswerIndex ? 1 : 0), 0
      );
      const payload = JSON.stringify({ answers: arr, score: rawScore });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`/api/exams/${examId}/submit`, payload);
      } else {
        fetch(`/api/exams/${examId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });
      }
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [answers, exam, examId, submitted, alreadySubmitted]);

  // 7️⃣ Heartbeat to backend every 10s
  useEffect(() => {
    const sendHeartbeat = () => {
      if (submitted || alreadySubmitted) return;
      const data = JSON.stringify({ ts: new Date().toISOString() });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`/api/exams/${examId}/heartbeat`, data);
      } else {
        fetch(`/api/exams/${examId}/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true
        });
      }
    };
    const hbInterval = setInterval(sendHeartbeat, 10000);
    return () => clearInterval(hbInterval);
  }, [examId, submitted, alreadySubmitted]);

  // 8️⃣ Auto-save answers every 30s
  useEffect(() => {
    const autoSave = () => {
      if (submitted || alreadySubmitted) return;
      const arr = (exam?.questions || []).map((_, i) =>
        answers.hasOwnProperty(i) ? answers[i] : null
      );
      const payload = JSON.stringify({ answers: arr });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`/api/exams/${examId}/autosave`, payload);
      } else {
        fetch(`/api/exams/${examId}/autosave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });
      }
    };
    const saveInterval = setInterval(autoSave, 30000);
    return () => clearInterval(saveInterval);
  }, [answers, exam, examId, submitted, alreadySubmitted]);

  // 9️⃣ Handle answer change
  const handleChange = (qIdx, optIdx) =>
    setAnswers(a => ({ ...a, [qIdx]: optIdx }));

  // 🔟 Submit exam
  async function handleSubmit() {
    if (submitted || alreadySubmitted) return;
    setSubmitted(true);

    const arr = (exam.questions || []).map((_, i) =>
      answers.hasOwnProperty(i) ? answers[i] : null
    );
    const rawScore = (exam.questions || []).reduce((sum, q, i) =>
      sum + (arr[i] === q.correctAnswerIndex ? 1 : 0), 0
    );
    setScore(rawScore);

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: arr, score: rawScore })
      });
    } catch (err) {
      console.error('Submission error:', err);
    }
  }

  // ===== Result view =====
  if (alreadySubmitted || submitted) {
    return (
      <div className="min-h-screen flex bg-white overflow-x-hidden">
        <Sidebar isOpen toggleSidebar={() => {}} />
        <div className="flex-1 flex flex-col lg:ml-64">
          <StudentHeader toggleSidebar={() => {}} />
          <div className="p-12 text-center">
            <h2 className="text-3xl font-bold text-[#002855]">
              Your Score: {score} / {(exam.questions || []).length}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // ===== Loading or Exam view =====
  if (!exam) {
    return <div className="p-8 text-center">Loading exam…</div>;
  }

  return (
    <div className="min-h-screen flex bg-white overflow-x-hidden">
      <Sidebar isOpen toggleSidebar={() => setSidebarOpen(o => !o)} />
      <div className="flex-1 flex flex-col lg:ml-64">
        <StudentHeader toggleSidebar={() => setSidebarOpen(o => !o)} />
        <div className="flex-1 flex flex-col lg:flex-row-reverse">
          {/* Timer Panel */}
          <div className="w-full lg:w-72 p-6 flex flex-col items-center">
            <div className="bg-black w-full h-40 mb-4 rounded-md" />
            <div className="text-3xl font-bold">
              {timeLeft != null
                ? `${String(Math.floor(timeLeft/60)).padStart(2,'0')}:${String(timeLeft%60).padStart(2,'0')}`
                : '--:--'}
            </div>
          </div>

          {/* Questions Panel */}
          <div className="flex-1 p-6 lg:p-12">
            {exam.questions.map((q, i) => (
              <div key={i} className="mb-8">
                <h2 className="text-2xl font-extrabold mb-2">
                  Question {i+1}
                </h2>
                <p className="mb-4 text-gray-800">{q.questionText}</p>
                <div className="space-y-3">
                  {q.options.map((opt, j) => (
                    <label key={j} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`q${i}`}
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
              className="mt-4 px-6 py-2 bg-[#002855] text-white rounded hover:bg-[#001f47]"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
