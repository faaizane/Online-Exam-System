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
  // Check if exam is submitted (from storage or exam object)
  const storageKey = `submission_${exam._id}`;
  const submissionId = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey) || exam.submissionId;
  
  if (submissionId || exam?.attempted) return 'Attempted';
  if (!dateTime) return '';
  
  const now = new Date();
  const examStart = new Date(dateTime);
  const examEnd = new Date(examStart.getTime() + (exam.duration * 60 * 1000));
  
  // If current time is before exam start time
  if (now < examStart) return 'Scheduled';
  
  // If current time is between exam start and end time
  if (now >= examStart && now <= examEnd) return 'Ongoing';
  
  // If current time is after exam end time but not submitted, still show as Ongoing
  return 'Ongoing';
};

export default function TestPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when submission changes
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const { state } = useLocation();
  const navigate = useNavigate();
  const exams = state?.exams ?? (state?.exam ? [state.exam] : []);

  const [subId, setSubId] = useState(() => {
    const first = exams[0];
    return first
      ? first.submissionId || sessionStorage.getItem(`submission_${first._id}`) || localStorage.getItem(`submission_${first._id}`)
      : null;
  });

  useEffect(() => {
    if (!exams.length) navigate(-1);
  }, [exams, navigate]);

  // Hybrid approach: localStorage for cross-window detection, sessionStorage for main storage
  useEffect(() => {
    const key = exams[0] ? `submission_${exams[0]._id}` : null;
    if (!key) return;
    
    const checkSubmission = () => {
      // Check both localStorage (for cross-window) and sessionStorage (for main data)
      const localSubmission = localStorage.getItem(key);
      const sessionSubmission = sessionStorage.getItem(key);
      const currentSubmission = localSubmission || sessionSubmission;
      
      if (currentSubmission && currentSubmission !== subId) {
        console.log('Main component detected submission:', currentSubmission);
        setSubId(currentSubmission);
        setRefreshKey(prev => prev + 1); // Force re-render
        
        // Sync to sessionStorage if found in localStorage
        if (localSubmission && !sessionSubmission) {
          sessionStorage.setItem(key, localSubmission);
        }
      }
    };

    // Check immediately
    checkSubmission();

    // Check every 500ms for faster detection
    const interval = setInterval(checkSubmission, 500);
    
    // Listen for localStorage changes (works across windows)
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        console.log('Main component localStorage change detected:', e.newValue);
        setSubId(e.newValue);
        setRefreshKey(prev => prev + 1); // Force re-render
        // Sync to sessionStorage
        sessionStorage.setItem(key, e.newValue);
      }
    };
    
    // Check when window gets focus (when user returns from exam window)
    const handleFocus = () => {
      console.log('Main window focused, checking submission...');
      setTimeout(checkSubmission, 100);
    };

    // Check when window becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Main document visible, checking submission...');
        setTimeout(checkSubmission, 100);
      }
    };

    // Listen for custom events from exam window
    const handleExamSubmitted = (e) => {
      if (e.detail && e.detail.type === 'examSubmitted' && e.detail.examId === exams[0]?._id) {
        console.log('Main component received exam submitted event');
        setTimeout(checkSubmission, 100);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('examSubmitted', handleExamSubmitted);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('examSubmitted', handleExamSubmitted);
    };
  }, [exams, subId]);

  if (exams.length > 1) {
    return (
      <Layout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
        <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
          Choose Your Exam
        </h2>
        <div className="space-y-4 [@media(min-width:486px)]:hidden">
          {exams.map((exam, i) => (
            <ExamCard key={`${exam._id}-${refreshKey}`} exam={exam} nav={navigate} />
          ))}
        </div>
        <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="w-full text-left">
            <TableHead />
            <tbody className="text-black text-md divide-y divide-gray-200">
              {exams.map(exam => (
                <ExamRow key={`${exam._id}-${refreshKey}`} exam={exam} nav={navigate} />
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
            <ActionButton key={refreshKey} exam={exam} />
          </div>
        </div>
        <div className="hidden [@media(min-width:486px)]:block overflow-x-auto">
          <table className="w-full text-left">
            <TableHead />
            <tbody className="text-black text-md divide-y divide-gray-200">
              <ExamRow key={refreshKey} exam={exam} nav={navigate} />
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
    <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
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
      <td className="p-3"><StatusBadge status={status} /></td>
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
    () => sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey) || exam.submissionId
  );
  const attempted = Boolean(submissionId);

  // Use localStorage for cross-window detection, sessionStorage for main storage
  useEffect(() => {
    const checkSubmission = () => {
      // Check both localStorage (for cross-window) and sessionStorage (for main data)
      const localSubmission = localStorage.getItem(storageKey);
      const sessionSubmission = sessionStorage.getItem(storageKey);
      const currentSubmission = localSubmission || sessionSubmission;
      
      if (currentSubmission && currentSubmission !== submissionId) {
        console.log('Submission detected:', currentSubmission);
        setSubmissionId(currentSubmission);
        
        // Sync to sessionStorage if found in localStorage
        if (localSubmission && !sessionSubmission) {
          sessionStorage.setItem(storageKey, localSubmission);
        }
      }
    };

    // Check immediately
    checkSubmission();

    // Check every 500ms for faster detection
    const interval = setInterval(checkSubmission, 500);
    
    // Listen for localStorage changes (works across windows)
    const handleStorageChange = (e) => {
      if (e.key === storageKey && e.newValue) {
        console.log('localStorage change detected:', e.newValue);
        setSubmissionId(e.newValue);
        // Sync to sessionStorage
        sessionStorage.setItem(storageKey, e.newValue);
      }
    };
    
    // Check when window gets focus (when user returns from exam window)
    const handleFocus = () => {
      console.log('Window focused, checking submission...');
      setTimeout(checkSubmission, 100);
    };

    // Check when window becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Document visible, checking submission...');
        setTimeout(checkSubmission, 100);
      }
    };

    // Listen for custom events (in case exam window sends message)
    const handleCustomEvent = (e) => {
      if (e.detail && e.detail.type === 'examSubmitted' && e.detail.examId === exam._id) {
        console.log('Custom event received for exam submission');
        setTimeout(checkSubmission, 100);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('examSubmitted', handleCustomEvent);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('examSubmitted', handleCustomEvent);
    };
  }, [storageKey, submissionId, exam._id]);

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

          // Monitor when the exam window closes
          const checkClosed = setInterval(() => {
            if (win.closed) {
              console.log('Exam window closed, checking submission...');
              clearInterval(checkClosed);
              // Check submission with delay to allow localStorage update
              setTimeout(() => {
                const currentSubmission = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
                if (currentSubmission && currentSubmission !== submissionId) {
                  setSubmissionId(currentSubmission);
                  // Sync to sessionStorage if needed
                  if (!sessionStorage.getItem(storageKey)) {
                    sessionStorage.setItem(storageKey, currentSubmission);
                  }
                }
              }, 500);
            }
          }, 1000);
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

// Status component with styling
const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Attempted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2">
    <span className="font-semibold text-[#002855]">{label}</span>
    {label === 'Status:' ? <StatusBadge status={value} /> : <span>{value}</span>}
  </div>
);