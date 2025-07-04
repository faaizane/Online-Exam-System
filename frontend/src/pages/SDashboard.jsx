// src/pages/SDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import StudentHeader from '../components/SHeader';

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

  const navigate = useNavigate();
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const semLabel = n => `${n}${['st', 'nd', 'rd'][n % 10 - 1] || 'th'}`;

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

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* sidebar shifts in at 945px now */}
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <StudentHeader toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 [@media(min-width:1100px)]:px-16 py-4 md:py-8">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-2">
            Dashboard
          </h1>
          <p className="text-[16px] md:text-lg text-gray-600 mb-8">
            Welcome back, Student Name
          </p>

          <section className="mb-12">
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
              Upcoming Exams
            </h2>

            {/* Mobile view */}
            <div className="space-y-4 [@media(min-width:486px)]:hidden">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((e, i) => (
                  <ExamCard key={`${e._id}-${refreshKey}`} exam={e} nav={navigate} semLabel={semLabel} />
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
                    <ExamRow key={`${e._id}-${refreshKey}`} exam={e} nav={navigate} semLabel={semLabel} />
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
                  <ResultCard key={i} result={r} nav={navigate} semLabel={semLabel} />
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
                    <ResultRow key={i} result={r} nav={navigate} semLabel={semLabel} />
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

function ExamCard({ exam, nav, semLabel }) {
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
      <DetailRow label="Semester:" value={semLabel(exam.semester)} />
      <DetailRow label="Date:" value={dt.toLocaleDateString('en-GB')} />
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

function ExamRow({ exam, nav, semLabel }) {
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
      <td className="p-3">{semLabel(exam.semester)}</td>
      <td className="p-3">{dt.toLocaleDateString('en-GB')}</td>
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

function ResultCard({ result, nav, semLabel }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200">
      <DetailRow label="Subject:" value={result.subjectName} />
      <DetailRow label="Exam:" value={result.examNo} />
      <DetailRow label="Semester:" value={semLabel(result.semester)} />
      <DetailRow
        label="Date:"
        value={new Date(result.date).toLocaleDateString()}
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

function ResultRow({ result, nav, semLabel }) {
  return (
    <tr className="hover:bg-gray-50 border-t">
      <td className="p-3">{result.subjectName}</td>
      <td className="p-3">{result.examNo}</td>
      <td className="p-3">{semLabel(result.semester)}</td>
      <td className="p-3">
        {new Date(result.date).toLocaleDateString()}
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
