// File: src/pages/TDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TSidebar from '../components/TSidebar';
import THeader from '../components/THeader';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentExams, setRecentExams] = useState([]);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const cheatingIncidents = [
    { name: 'Student 1', reg: '21pwbcsxxxx', exam: 'Quiz 01', subject: 'Software Engineering', semester: 5, date: '22-12-2024' },
    { name: 'Student 2', reg: '21pwbcsyyy', exam: 'Quiz 02', subject: 'Computer Networks', semester: 6, date: '23-12-2024' },
    { name: 'Student 3', reg: '21pwbcszzz', exam: 'Quiz 01', subject: 'Operating Systems', semester: 6, date: '21-12-2024' },
  ];

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const { user } = await res.json();
        setUserName(user.name);
      } catch (err) {
        console.error('Failed to load user profile', err);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await fetch('/api/exams/recent', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setRecentExams(data);
      } catch (err) {
        console.error('Failed to load recent exams', err);
      }
    }
    loadExams();
  }, []);

  const toggleSidebar = () => setSidebarOpen(o => !o);
  const formatDate = iso => new Date(iso).toLocaleDateString('en-GB');

  const toOrdinal = n => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const handleEditClick = id => navigate(`/editexam/${id}`);
  const handleDeleteClick = async id => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      const res = await fetch(`/api/exams/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error();
      setRecentExams(prev => prev.filter(e => e._id !== id));
    } catch {
      alert('Failed to delete exam');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <TSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <THeader toggleSidebar={toggleSidebar} />
        <div className="px-4 md:px-8 lg:px-16 py-6 md:py-10">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-1">Dashboard</h1>
          <p className="text-[16px] md:text-lg text-gray-600 mb-6">Welcome back, {userName || 'Teacher'}</p>

          {/* Recent Exams */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-semibold text-[#002855] mb-4">Recent Exams</h2>

            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {recentExams.map((exam, i) => {
                const status = exam.status;
                const total = exam.assignedStudents?.length ?? '-';
                const semNum = parseInt(exam.semester, 10) || exam.semester;
                const subj = typeof exam.subject === 'object' ? exam.subject.name : exam.subject;

                return (
                  <div key={i} className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200">
                    <div className="flex justify-between py-2"><span className="font-semibold text-[#002855]">Subject:</span><span>{subj}</span></div>
                    <div className="flex justify-between py-2"><span className="font-semibold text-[#002855]">Exam No.:</span><span>{exam.examNo}</span></div>
                    <div className="flex justify-between py-2"><span className="font-semibold text-[#002855]">Date:</span><span>{formatDate(exam.scheduleDate)}</span></div>
                    <div className="flex justify-between py-2"><span className="font-semibold text-[#002855]">Semester:</span><span>{toOrdinal(semNum)}</span></div>
                    <div className="flex justify-between py-2"><span className="font-semibold text-[#002855]">Total Students:</span><span>{total}</span></div>
                    <div className="flex justify-between py-2"><span className="font-semibold text-[#002855]">Status:</span>
                      <span className={status === 'Scheduled' ? 'text-green-600' : 'text-gray-500'}>{status}</span>
                    </div>
                    <div className="flex justify-end items-center pt-3 space-x-2">
                      {status === 'Scheduled' ? (
                        <>
                          <button
                            onClick={() => handleEditClick(exam._id)}
                            title="Edit Exam"
                            className="p-2 rounded hover:bg-blue-200 hover:text-blue-800 transition"
                          >
                            <i className="fa-solid fa-pencil" style={{ color: '#FFD43B' }} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(exam._id)}
                            title="Delete Exam"
                            className="p-2 rounded hover:bg-red-100 hover:text-red-600 transition"
                          >
                            <i className="fa-solid fa-trash" style={{ color: '#E53E3E' }} />
                          </button>
                        </>
                      ) : (
                        <Link to="/viewresults" state={{ examId: exam._id, title: `${exam.examNo} – ${subj}` }}>
                          <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">View Results</button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
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
                    const subj = typeof exam.subject === 'object' ? exam.subject.name : exam.subject;

                    return (
                      <tr key={i} className="hover:bg-gray-50 border-t">
                        <td className="p-3">{subj}</td>
                        <td className="p-3">{exam.examNo}</td>
                        <td className="p-3">{formatDate(exam.scheduleDate)}</td>
                        <td className="p-3">{toOrdinal(semNum)}</td>
                        <td className="p-3">{total}</td>
                        <td className="p-3">
                          <span className={status === 'Scheduled' ? 'text-green-600' : 'text-gray-500'}>{status}</span>
                        </td>
                        <td className="p-3">
                          {status === 'Scheduled' ? (
                            <div className="flex justify-start space-x-2">
                              <button
                                onClick={() => handleEditClick(exam._id)}
                                title="Edit Exam"
                                className="p-1 rounded hover:bg-blue-200 hover:text-blue-800 transition"
                              >
                                <i className="fa-solid fa-pencil" style={{ color: '#FFD43B' }} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(exam._id)}
                                title="Delete Exam"
                                className="p-1 rounded hover:bg-red-100 hover:text-red-600 transition"
                              >
                                <i className="fa-solid fa-trash" style={{ color: '#E53E3E' }} />
                              </button>
                            </div>
                          ) : (
                            <Link to="/viewresults" state={{ examId: exam._id, title: `${exam.examNo} – ${subj}` }}>
                              <button className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition">View Results</button>
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

          {/* Recent Cheating Incidents */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#002855] mb-4">Recent Cheating Incidents</h2>

            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {cheatingIncidents.map((row, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200">
                  <div className="flex justify-between py-2"><span className="font-semibold text-[#002855]">Student:</span><span>{row.name}</span></div>
                  <div className="flex justify-between py-2"><span className="font-semibold text-[#002855]">Reg No.:</span><span>{row.reg}</span></div>
                  <div className="flex justify-between py-2"><span className="font-semibold text-[#002855]">Exam:</span><span>{row.exam}</span></div>
                  <div className="flex justify-between py-2"><span className="font-semibold text-[#002855]">Subject:</span><span>{row.subject}</span></div>
                  <div className="flex justify-between py-2"><span className="font-semibold text-[#002855]">Semester:</span><span>{toOrdinal(row.semester)}</span></div>
                  <div className="flex justify-between py-2"><span className="font-semibold text-[#002855]">Date:</span><span>{row.date}</span></div>
                  <div className="text-right pt-3">
                    <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">View Video</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-md overflow-auto mt-4">
              <table className="w-full text-left">
                <thead className="bg-[#002855] text-white text-sm font-light">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Reg No.</th>
                    <th className="p-3">Exam</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="text-black text-md">
                  {cheatingIncidents.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-t">
                      <td className="p-3">{row.name}</td>
                      <td className="p-3">{row.reg}</td>
                      <td className="p-3">{row.exam}</td>
                      <td className="p-3">{row.subject}</td>
                      <td className="p-3">{toOrdinal(row.semester)}</td>
                      <td className="p-3">{row.date}</td>
                      <td className="p-3">
                        <button className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition">View Video</button>
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
