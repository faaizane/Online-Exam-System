// src/pages/SDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import StudentHeader from '../components/SHeader';
import StudentTour from '../components/StudentTour';


// Status component with styling
const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
};

const getExamStatus = (exam) => {
  // Since we're only showing upcoming exams, status is always "Scheduled"
  return 'Scheduled';
};

export default function SDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when submission changes
  const [expanded, setExpanded] = useState(null);
  const [userName, setUserName] = useState('');

  const navigate = useNavigate();
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  // Helper function to format semester with ordinal suffix
  const formatSemester = (semester) => {
    const num = parseInt(semester);
    if (isNaN(num)) return semester;
    
    const suffix = (num) => {
      if (num % 100 >= 11 && num % 100 <= 13) return 'th';
      switch (num % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${num}${suffix(num)}`;
  };

  // Helper function to format date as DD-MM-YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const loadExams = async () => {
      try {
        const token = sessionStorage.getItem('token'); // session
        const res = await fetch(`${API_BASE_URL}/api/exams/available`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch exams');
        const groups = await res.json();

        const now = new Date();

        const scheduled = groups
          .flatMap(g => g.exams)
          .filter(e => {
            const dt = new Date(e.scheduleDate);
            const [h, m] = e.scheduleTime.split(':').map(Number);
            dt.setHours(h, m, 0, 0);

            const endTime = new Date(dt.getTime() + e.duration * 60000);

            const submissionKey = `submission_${e._id}`;
            const attempted = sessionStorage.getItem(submissionKey) || e.submissionId; // session

            return now < endTime && !attempted;
          })
          .sort((a, b) => {
            // Create datetime objects for comparison
            const dateTimeA = new Date(a.scheduleDate);
            const [hA, mA] = a.scheduleTime.split(':').map(Number);
            dateTimeA.setHours(hA, mA, 0, 0);

            const dateTimeB = new Date(b.scheduleDate);
            const [hB, mB] = b.scheduleTime.split(':').map(Number);
            dateTimeB.setHours(hB, mB, 0, 0);

            // Sort by closest date and time (ascending order)
            return dateTimeA.getTime() - dateTimeB.getTime();
          });

        setUpcomingExams(scheduled);
      } catch (err) {
        console.error(err);
      }
    };
    loadExams();
  }, [API_BASE_URL]);

  // Monitor storage changes for exam submissions
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('submission_') && e.newValue) {
        console.log('Dashboard detected submission change:', e.key, e.newValue);
        setRefreshKey(prev => prev + 1); // Force re-render
      }
    };

    const handleFocus = () => {
      console.log('Dashboard window focused, checking for submission updates...');
      setRefreshKey(prev => prev + 1); // Force re-render to update status
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Dashboard visible, checking for submission updates...');
        setRefreshKey(prev => prev + 1); // Force re-render
      }
    };

    // Listen for localStorage changes (works across windows)
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Check for updates every 30 seconds
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const token = sessionStorage.getItem('token'); // session
        const res = await fetch(`${API_BASE_URL}/api/submissions/recent?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch recent results');
        const data = await res.json();
        setRecentResults(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadRecent();
  }, [API_BASE_URL]);

  useEffect(() => {
    async function fetchMe(){
      try{
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/auth/me`,{headers:{Authorization:`Bearer ${token}`}});
        if(res.ok){
          const data=await res.json();
          setUserName(data.user?.name || '');
        }
      }catch{}
    }
    fetchMe();
  }, [API_BASE_URL]);

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden relative">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      {/* 🧭 Guided Training Overlay removed per new flow */}

      {/* sidebar shifts in at 945px now */}
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <StudentHeader toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 [@media(min-width:1100px)]:px-16 py-4 md:py-8">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-2">
            Dashboard
          </h1>
          <p className="text-[16px] md:text-lg text-gray-600 mb-8">
            Welcome back{userName ? `, ${userName}` : ''}
          </p>

          <section className="mb-12">
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
              Upcoming Exams
            </h2>

            {/* Mobile view */}
            <div className="space-y-4 [@media(min-width:486px)]:hidden">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((e, i) => (
                  <ExamCard key={`${e._id}-${refreshKey}`} exam={e} nav={navigate} formatDate={formatDate} formatSemester={formatSemester} />
                ))
              ) : (
                <p className="text-center text-gray-500">No upcoming exams</p>
              )}
            </div>

            {/* Desktop view */}
            <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#002855] text-white text-sm font-light">
                  <tr>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Exam No.</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-black text-md">
                  {upcomingExams.map((e, i) => (
                    <ExamRow key={`${e._id}-${refreshKey}`} exam={e} nav={navigate} formatDate={formatDate} formatSemester={formatSemester} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
              Recent Results
            </h2>

            {/* Mobile view */}
            <div className="space-y-4 [@media(min-width:486px)]:hidden">
              {recentResults.length > 0 ? (
                recentResults.map((r, i) => (
                  <ResultCard key={i} result={r} nav={navigate} formatDate={formatDate} formatSemester={formatSemester} />
                ))
              ) : (
                <p className="text-center text-gray-500">No results yet</p>
              )}
            </div>

            {/* Desktop view */}
            <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#002855] text-white text-sm font-light">
                  <tr>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Exam No.</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="text-black text-md">
                  {recentResults.map((r, i) => (
                    <ResultRow key={i} result={r} nav={navigate} formatDate={formatDate} formatSemester={formatSemester} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ExamCard({ exam, nav, formatDate, formatSemester }) {
  const dt = new Date(exam.scheduleDate);
  const [h, m] = exam.scheduleTime.split(':').map(Number);
  dt.setHours(h, m);

  return (
    <div
      onClick={() => nav('/take-exam/test-page', { state: { exam } })}
      className="cursor-pointer bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
    >
      <DetailRow label="Subject:" value={exam.subjectName} />
      <DetailRow label="Exam No.:" value={exam.examNo} />
      <DetailRow label="Semester:" value={formatSemester(exam.semester)} />
      <DetailRow label="Date:" value={formatDate(exam.scheduleDate)} />
      <DetailRow
        label="Time:"
        value={dt.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}
      />
      <DetailRow label="Duration:" value={`${exam.duration} minutes`} />
      <DetailRow label="Status:" value="Scheduled" />
    </div>
  );
}

function ExamRow({ exam, nav, formatDate, formatSemester }) {
  const dt = new Date(exam.scheduleDate);
  const [h, m] = exam.scheduleTime.split(':').map(Number);
  dt.setHours(h, m);

  return (
    <tr
      onClick={() => nav('/take-exam/test-page', { state: { exam } })}
      className="cursor-pointer border-t hover:bg-gray-50"
    >
      <td className="p-3">{exam.subjectName}</td>
      <td className="p-3">{exam.examNo}</td>
      <td className="p-3">{formatSemester(exam.semester)}</td>
      <td className="p-3">{formatDate(exam.scheduleDate)}</td>
      <td className="p-3">
        {dt.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}
      </td>
      <td className="p-3">{`${exam.duration} min`}</td>
      <td className="p-3"><StatusBadge status="Scheduled" /></td>
    </tr>
  );
}

function ResultCard({ result, nav, formatDate, formatSemester }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200">
      <DetailRow label="Subject:" value={result.subjectName} />
      <DetailRow label="Exam:" value={result.examNo} />
      <DetailRow label="Semester:" value={formatSemester(result.semester)} />
      <DetailRow
        label="Date:"
        value={formatDate(result.date)}
      />
      <DetailRow label="Score:" value={result.marks} />
      <div className="text-right pt-2">
        <button
          onClick={() => nav(`/view-answers/${result.submissionId}`)}
          className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition cursor-pointer"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

function ResultRow({ result, nav, formatDate, formatSemester }) {
  return (
    <tr className="hover:bg-gray-50 border-t">
      <td className="p-3">{result.subjectName}</td>
      <td className="p-3">{result.examNo}</td>
      <td className="p-3">{formatSemester(result.semester)}</td>
      <td className="p-3">
        {formatDate(result.date)}
      </td>
      <td className="p-3">{result.marks}</td>
      <td className="p-3">
        <button
          onClick={() => nav(`/view-answers/${result.submissionId}`)}
          className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition cursor-pointer"
        >
          View Results
        </button>
      </td>
    </tr>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2">
      <span className="font-semibold text-[#002855]">{label}</span>
      {label === 'Status:' ? <StatusBadge status={value} /> : <span>{value}</span>}
    </div>
  );
}
