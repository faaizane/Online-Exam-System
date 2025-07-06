// // src/pages/TDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TSidebar from '../components/TSidebar';
import THeader from '../components/THeader';

// Status component with styling for teacher dashboard
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

export default function TDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentExams, setRecentExams] = useState([]);
  const [recentCheats, setRecentCheats] = useState([]);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = sessionStorage.getItem('token'); // 🔁 Changed from localStorage to sessionStorage

  const toggleSidebar = () => setSidebarOpen(o => !o);
  const formatDate = iso => new Date(iso).toLocaleDateString('en-GB');
  const formatDateSimple = iso => {
    const date = new Date(iso);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const toOrdinal = n => {
    const s = ["th","st","nd","rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // ───────── Load Profile ─────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { user } = await res.json();
        setUserName(user.name);
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    })();
  }, [API_BASE_URL, token]);

  // ───────── Load Recent Exams ─────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/exams/recent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Fetch failed');
        setRecentExams(await res.json());
      } catch (err) {
        console.error('Failed to load exams', err);
      }
    })();
  }, [API_BASE_URL, token]);

  // ───────── Load Recent Cheats ─────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/cheats/recent?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Fetch failed');
        setRecentCheats(await res.json());
      } catch (err) {
        console.error('Failed to load cheating incidents', err);
      }
    })();
  }, [API_BASE_URL, token]);

  const handleEditClick = id => navigate(`/editexam/${id}`);
  const handleDeleteClick = async id => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/exams/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      setRecentExams(prev => prev.filter(e => e._id !== id));
    } catch {
      alert('Failed to delete exam');
    }
  };

  // ───────── View Video Helper ─────────
  const viewVideo = async id => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cheats/${id}/clip`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch {
      alert('Video load nahi ho paaya');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <TSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <THeader toggleSidebar={toggleSidebar} />

        <div className="px-4 md:px-8 [@media(min-width:1100px)]:px-16 py-6 md:py-10 space-y-12">
          <div>
            <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-1">Dashboard</h1>
            <p className="text-[16px] md:text-lg text-gray-600">
              Welcome back, {userName || 'Teacher'}
            </p>
          </div>

          {/* ───────── Recent Exams ───────── */}
          {/* Unchanged — your design remains same */}
          {/* … rest of UI remains unchanged … */}

          {/* ───────── Recent Cheating Incidents ───────── */}
          {/* Also unchanged — only data fetching token updated */}

          {/* ───────── Recent Exams ───────── */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#002855] mb-4">
              Recent Exams
            </h2>

            {/* Mobile */}
            <div className="space-y-4 md:hidden">
              {recentExams.map((exam, i) => {
                const status = exam.status;
                const total = exam.assignedStudents?.length ?? '-';
                const semNum = parseInt(exam.semester, 10) || exam.semester;
                const subj = exam.subject.name;

                return (
                  <div key={i} className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200">
                    <Row label="Subject:" value={subj} />
                    <Row label="Exam No.:" value={exam.examNo} />
                    <Row label="Date:" value={formatDateSimple(exam.scheduleDate)} />
                    <Row label="Semester:" value={toOrdinal(semNum)} />
                    <Row label="Total Students:" value={total} />
                    <Row
                      label="Status:"
                      value={status}
                    />
                    <div className="flex justify-end items-center pt-3 space-x-2">
                      {status==='Scheduled' ? (
                        <>
                          <IconButton onClick={() => handleEditClick(exam._id)} icon="fa-pencil" color="#D97706" title="Edit" />
                          <IconButton onClick={() => handleDeleteClick(exam._id)} icon="fa-trash" color="#DC2626" title="Delete" />
                        </>
                      ) : (
                        <Link to="/viewresults" state={{ examId: exam._id, title: `${exam.examNo} – ${subj}` }}>
                          <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition cursor-pointer">
                            View Results
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop */}
            <div className="hidden md:block bg-white rounded-xl shadow-md overflow-auto">
              <table className="w-full text-left">
                <thead className="bg-[#002855] text-white text-sm font-light">
                  <tr>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Exam No.</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Total Students</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="text-black text-md">
                  {recentExams.map((exam, i) => {
                    const status = exam.status;
                    const total = exam.assignedStudents?.length ?? '-';
                    const semNum = parseInt(exam.semester, 10) || exam.semester;
                    const subj = exam.subject.name;
                    return (
                      <tr key={i} className="hover:bg-gray-50 border-t">
                        <td className="p-3">{subj}</td>
                        <td className="p-3">{exam.examNo}</td>
                        <td className="p-3">{formatDateSimple(exam.scheduleDate)}</td>
                        <td className="p-3">{toOrdinal(semNum)}</td>
                        <td className="p-3">{total}</td>
                        <td className="p-3">
                          <StatusBadge status={status} />
                        </td>
                        <td className="p-3">
                          {status==='Scheduled' ? (
                            <div className="flex space-x-2">
                              <IconButton onClick={() => handleEditClick(exam._id)} icon="fa-pencil" color="#D97706" />
                              <IconButton onClick={() => handleDeleteClick(exam._id)} icon="fa-trash" color="#DC2626" />
                            </div>
                          ) : (
                            <Link to="/viewresults" state={{ examId: exam._id, title: `${exam.examNo} – ${subj}` }}>
                              <button className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition cursor-pointer">
                                View Results
                              </button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* ───────── Recent Cheating Incidents ───────── */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#002855] mb-4">
              Recent Cheating Incidents
            </h2>
            {/* Mobile */}
            <div className="space-y-4 md:hidden">
              {recentCheats.length ? recentCheats.map((c, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200">
                  <Row label="Reg No.:" value={c.registrationNumber} />
                  <Row label="Student:" value={c.name} />
                  <Row label="Subject:" value={c.subject} />
                  <Row label="Exam No.:" value={c.exam} />
                  <Row label="Semester:" value={toOrdinal(c.semester)} />
                  <Row label="Date:" value={formatDateSimple(c.date)} />
                  <div className="text-right pt-3">
                    <button
                      onClick={() => viewVideo(c.id)}
                      className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition cursor-pointer"
                    >
                      View Video
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-500">No incidents found</p>
              )}
            </div>
            {/* Desktop */}
            <div className="hidden md:block bg-white rounded-xl shadow-md overflow-auto mt-4">
              <table className="w-full text-left">
                <thead className="bg-[#002855] text-white text-sm font-light">
                  <tr>
                    <th className="p-3">Reg No.</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Exam No.</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="text-black text-md">
                  {recentCheats.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-t">
                      <td className="p-3">{c.registrationNumber}</td>
                      <td className="p-3">{c.name}</td>
                      <td className="p-3">{c.subject}</td>
                      <td className="p-3">{c.exam}</td>
                      <td className="p-3">{toOrdinal(c.semester)}</td>
                      <td className="p-3">{formatDateSimple(c.date)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => viewVideo(c.id)}
                          className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition cursor-pointer"
                        >
                          View Video
                        </button>
                      </td>
                    </tr>
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

function Row({ label, value, className = '' }) {
  return (
    <div className={`flex justify-between py-2 ${className}`}>
      <span className="font-semibold text-[#002855]">{label}</span>
      {label === 'Status:' ? <StatusBadge status={value} /> : <span>{value}</span>}
    </div>
  );
}

function IconButton({ onClick, icon, color, title }) {
  const getButtonStyle = (icon) => {
    if (icon === 'fa-pencil') {
      return 'bg-yellow-100 hover:bg-yellow-200';
    } else if (icon === 'fa-trash') {
      return 'bg-red-100 hover:bg-red-200';
    }
    return 'bg-gray-100 hover:bg-gray-200';
  };

  return (
    <button 
      onClick={onClick} 
      title={title} 
      className={`w-8 h-8 rounded-full ${getButtonStyle(icon)} flex items-center justify-center transition-all duration-200 hover:shadow-md cursor-pointer`}
    >
      <i className={`fa-solid ${icon} text-sm`} style={{ color }} />
    </button>
  );
}
