// src/pages/ExamSchedule.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';

// Status component with styling for teacher exam schedule
const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
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

export default function ExamSchedule() {
  const { year, session, semester } = useLocation().state || {};
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const formatTime = timeStr => {
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = ((h + 11) % 12) + 1;
    return `${hour12}:${m.toString().padStart(2, '0')} ${suffix}`;
  };

  useEffect(() => {
    if (!year || !session || !semester) return;

    async function fetchExams() {
      try {
        const token = sessionStorage.getItem('token'); // sessionStorage instead of localStorage
        const query = new URLSearchParams({ year, session, semester }).toString();
        const res = await fetch(`${API_BASE_URL}/api/exams/filtered?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        setExams(await res.json());
      } catch {
        alert('Failed to fetch exams');
      }
    }

    fetchExams();
  }, [year, session, semester]);

  const upcoming = exams.filter(e => e.status !== 'Completed');
  const completed = exams.filter(e => e.status === 'Completed');

  const handleEditClick = id => navigate(`/editexam/${id}`);

  const handleDeleteClick = async id => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      const token = sessionStorage.getItem('token'); // sessionStorage instead of localStorage
      const res = await fetch(`${API_BASE_URL}/api/exams/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      setExams(prev => prev.filter(e => e._id !== id));
    } catch {
      alert('Failed to delete exam');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />
        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8 space-y-12">

          {/* ───── Upcoming Exams ───── */}
          <section>
            <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-4">
              Upcoming Exams – Semester {semester}
            </h1>

            {upcoming.length === 0 ? (
              <p className="text-center text-gray-500">No upcoming exams.</p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#002855] text-white">
                      <tr>
                        <th className="p-4">Subject</th>
                        <th className="p-4">Exam No.</th>
                        <th className="p-4">Duration</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Time</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcoming.map((exam, i) => {
                        const subj = exam.subject?.name || exam.subject;
                        return (
                          <tr key={i} className="hover:bg-gray-50 border-t">
                            <td className="p-4">{subj}</td>
                            <td className="p-4">{exam.examNo}</td>
                            <td className="p-4">{exam.duration} min</td>
                            <td className="p-4">{new Date(exam.scheduleDate).toLocaleDateString()}</td>
                            <td className="p-4">{formatTime(exam.scheduleTime)}</td>
                            <td className="p-4">
                              <StatusBadge status={exam.status} />
                            </td>
                            <td className="p-4 flex space-x-2">
                              <button
                                onClick={() => handleEditClick(exam._id)}
                                title="Edit Exam"
                                className="p-1 rounded hover:bg-blue-200"
                              >
                                <i className="fa-solid fa-pencil" style={{ color: '#FFD43B' }} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(exam._id)}
                                title="Delete Exam"
                                className="p-1 rounded hover:bg-red-100"
                              >
                                <i className="fa-solid fa-trash" style={{ color: '#E53E3E' }} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="block [@media(min-width:486px)]:hidden space-y-4">
                  {upcoming.map((exam, i) => {
                    const subj = exam.subject?.name || exam.subject;
                    return (
                      <div key={i} className="bg-white p-4 rounded-xl shadow-md space-y-2">
                        <div className="flex justify-between">
                          <h2 className="font-semibold text-lg text-[#002855]">{subj}</h2>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditClick(exam._id)}
                              className="p-2 rounded hover:bg-blue-200"
                            >
                              <i className="fa-solid fa-pencil" style={{ color: '#FFD43B' }} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(exam._id)}
                              className="p-2 rounded hover:bg-red-100"
                            >
                              <i className="fa-solid fa-trash" style={{ color: '#E53E3E' }} />
                            </button>
                          </div>
                        </div>
                        <p><strong>Exam No.:</strong> {exam.examNo}</p>
                        <p><strong>Duration:</strong> {exam.duration} min</p>
                        <p><strong>Date:</strong> {new Date(exam.scheduleDate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {formatTime(exam.scheduleTime)}</p>
                        <div>
                          <StatusBadge status={exam.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {/* ───── Completed Exams ───── */}
          <section>
            <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-4">
              Completed Exams – Semester {semester}
            </h1>

            {completed.length === 0 ? (
              <p className="text-center text-gray-500">No completed exams.</p>
            ) : (
              <>
                <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#002855] text-white">
                      <tr>
                        <th className="p-4">Subject</th>
                        <th className="p-4">Exam No.</th>
                        <th className="p-4">Duration</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Time</th>
                        <th className="p-4">View Results</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completed.map((exam, i) => {
                        const subj = exam.subject?.name || exam.subject;
                        return (
                          <tr key={i} className="hover:bg-gray-50 border-t">
                            <td className="p-4">{subj}</td>
                            <td className="p-4">{exam.examNo}</td>
                            <td className="p-4">{exam.duration} min</td>
                            <td className="p-4">{new Date(exam.scheduleDate).toLocaleDateString()}</td>
                            <td className="p-4">{formatTime(exam.scheduleTime)}</td>
                            <td className="p-4">
                              <Link
                                to="/viewresults"
                                state={{ examId: exam._id, title: `${exam.examNo} – ${subj}` }}
                              >
                                <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
                                  View
                                </button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="block [@media(min-width:486px)]:hidden space-y-4">
                  {completed.map((exam, i) => {
                    const subj = exam.subject?.name || exam.subject;
                    return (
                      <div key={i} className="bg-white p-4 rounded-xl shadow-md space-y-2">
                        <h2 className="font-semibold text-lg text-[#002855]">{subj}</h2>
                        <p><strong>Exam No.:</strong> {exam.examNo}</p>
                        <p><strong>Duration:</strong> {exam.duration} min</p>
                        <p><strong>Date:</strong> {new Date(exam.scheduleDate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {formatTime(exam.scheduleTime)}</p>
                        <Link to="/viewresults" state={{ examId: exam._id, title: `${exam.examNo} – ${subj}` }}>
                          <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
                            View Results
                          </button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
