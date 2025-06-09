// File: src/pages/TDashboard.jsx
import React, { useState, useEffect } from 'react';
import TSidebar from '../components/TSidebar';
import THeader from '../components/THeader';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentExams, setRecentExams] = useState([]);
  const [userName, setUserName] = useState(''); // for teacher’s name

  // Load current user profile
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const { user } = await res.json();
        setUserName(user.name);
      } catch (err) {
        console.error('Failed to load user profile', err);
      }
    }
    loadUser();
  }, []);

  // Load recent exams
  useEffect(() => {
    async function loadExams() {
      try {
        const res = await fetch('/api/exams/recent', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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

  // Static cheating incidents
  const cheatingIncidents = [
    { name: 'Student 1', reg: '21pwbcsxxxx', exam: 'Quiz 01', subject: 'Software Engineering', semester: '5th', date: '22-12-2024' },
    { name: 'Student 2', reg: '21pwbcsyyy', exam: 'Quiz 02', subject: 'Computer Networks',    semester: '6th', date: '23-12-2024' },
    { name: 'Student 3', reg: '21pwbcszzz', exam: 'Quiz 01', subject: 'Operating Systems',    semester: '6th', date: '21-12-2024' },
  ];

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <TSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <THeader toggleSidebar={toggleSidebar} />
        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-2">
            Dashboard
          </h1>
          <p className="text-[16px] md:text-lg text-gray-600 mb-8">
            Welcome back, {userName || 'Teacher'}
          </p>

          {/* Recent Exams */}
          <section className="mb-12">
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
              Recent Exams
            </h2>
            {/* Mobile Cards */}
            <div className="space-y-4 [@media(min-width:486px)]:hidden">
              {recentExams.map((exam, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200">
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Subject:</span><span>{exam.subject}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Exam No.:</span><span>{exam.examNo}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Date:</span><span>{formatDate(exam.scheduleDate)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Semester:</span><span>{exam.semester}</span>
                  </div>
                  {/* Placeholders */}
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Total Students:</span><span>–</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Passed:</span><span>–</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Failed:</span><span>–</span>
                  </div>
                  <div className="text-right pt-2">
                    <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
                      View Results
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop Table */}
            <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#002855] text-white text-sm font-light">
                  <tr>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Exam No.</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Total Students</th>
                    <th className="p-3">Passed</th>
                    <th className="p-3">Failed</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="text-black text-md">
                  {recentExams.map((exam, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-t">
                      <td className="p-3">{exam.subject}</td>
                      <td className="p-3">{exam.examNo}</td>
                      <td className="p-3">{formatDate(exam.scheduleDate)}</td>
                      <td className="p-3">{exam.semester}</td>
                      <td className="p-3">–</td>
                      <td className="p-3">–</td>
                      <td className="p-3">–</td>
                      <td className="p-3">
                        <button className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                          View Results
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Cheating Incidents (static) */}
          <section>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
              Recent Cheating Incidents
            </h2>
            {/* Mobile Cards */}
            <div className="space-y-4 [@media(min-width:486px)]:hidden">
              {cheatingIncidents.map((row, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200">
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Student:</span><span>{row.name}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Reg No.:</span><span>{row.reg}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Exam:</span><span>{row.exam}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Subject:</span><span>{row.subject}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Semester:</span><span>{row.semester}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Date:</span><span>{row.date}</span>
                  </div>
                  <div className="text-right pt-2">
                    <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
                      View Video
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop Table */}
            <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
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
                      <td className="p-3">{row.semester}</td>
                      <td className="p-3">{row.date}</td>
                      <td className="p-3">
                        <button className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition">
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
