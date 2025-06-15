// src/pages/SDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import StudentHeader from '../components/SHeader';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const [upcomingExams, setUpcomingExams] = useState([]);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/exams/available', {
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
            dt.setHours(h, m);
            return dt > now;
          });

        setUpcomingExams(scheduled);
      } catch (err) {
        console.error(err);
      }
    };

    loadExams();
  }, []);

  const recentResults = [
    { subj: 'App Development', no: 'Quiz 01', sem: '5th', date: '01-12-2024', score: '85/100' },
    { subj: 'App Development', no: 'Quiz 02', sem: '5th', date: '05-12-2024', score: '90/100' },
    { subj: 'App Development', no: 'Quiz 03', sem: '5th', date: '10-12-2024', score: '88/100' },
  ];

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <StudentHeader toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-2">
            Dashboard
          </h1>
          <p className="text-[16px] md:text-lg text-gray-600 mb-8">
            Welcome back, Student Name
          </p>

          {/* Upcoming Exams */}
          <section className="mb-12">
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
              Upcoming Exams
            </h2>

            {/* Card view on ≤485px */}
            <div className="space-y-4 [@media(min-width:486px)]:hidden">
              {upcomingExams.length > 0 ? upcomingExams.map((e, i) => {
                const dt = new Date(e.scheduleDate);
                const [h, m] = e.scheduleTime.split(':').map(Number);
                dt.setHours(h, m);

                const subj = e.subjectName;
                const no   = e.examNo;
                const sem  = `${e.semester}${['st','nd','rd'][e.semester % 10 - 1]||'th'}`;
                const date = dt.toLocaleDateString('en-GB');
                const time = dt.toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
                const dur  = `${e.duration} minutes`;

                return (
                  <div
                    key={i}
                    onClick={() =>
                      navigate('/take-exam/test-page', { state: { exam: e } })
                    }
                    className="cursor-pointer bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
                  >
                    <DetailRow label="Subject:"  value={subj} />
                    <DetailRow label="Exam No.:" value={no} />
                    <DetailRow label="Semester:" value={sem} />
                    <DetailRow label="Date:"     value={date} />
                    <DetailRow label="Time:"     value={time} />
                    <DetailRow label="Duration:" value={dur} />
                    <DetailRow label="Status:"   value="Scheduled" />
                  </div>
                );
              }) : (
                <p className="text-center text-gray-500">No upcoming exams</p>
              )}
            </div>

            {/* Table view on ≥486px */}
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
                  {upcomingExams.map((e, i) => {
                    const dt = new Date(e.scheduleDate);
                    const [h, m] = e.scheduleTime.split(':').map(Number);
                    dt.setHours(h, m);

                    const subj = e.subjectName;
                    const no   = e.examNo;
                    const sem  = `${e.semester}${['st','nd','rd'][e.semester % 10 - 1]||'th'}`;
                    const date = dt.toLocaleDateString('en-GB');
                    const time = dt.toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    const dur  = `${e.duration} minutes`;

                    return (
                      <tr
                        key={i}
                        onClick={() =>
                          navigate('/take-exam/test-page', { state: { exam: e } })
                        }
                        className="cursor-pointer border-t hover:bg-gray-50"
                      >
                        <td className="p-3">{subj}</td>
                        <td className="p-3">{no}</td>
                        <td className="p-3">{sem}</td>
                        <td className="p-3">{date}</td>
                        <td className="p-3">{time}</td>
                        <td className="p-3">{dur}</td>
                        <td className="p-3">Scheduled</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Results */}
          <section>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
              Recent Results
            </h2>
            {/* …unchanged… */}
            {/* Card view on ≤485px */}
            <div className="space-y-4 [@media(min-width:486px)]:hidden">
              {recentResults.map((e, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
                >
                  <DetailRow label="Subject:"  value={e.subj} />
                  <DetailRow label="Exam No.:" value={e.no} />
                  <DetailRow label="Semester:" value={e.sem} />
                  <DetailRow label="Date:"     value={e.date} />
                  <DetailRow label="Score:"    value={e.score} />
                  <div className="text-right pt-2">
                    <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Table view on ≥486px */}
            <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#002855] text-white text-sm font-light">
                  <tr>
                    <th className="p-3 [@media(min-width:846px)]:p-4">Subject</th>
                    <th className="p-3 [@media(min-width:846px)]:p-4">Exam No.</th>
                    <th className="p-3 [@media(min-width:846px)]:p-4">Semester</th>
                    <th className="p-3 [@media(min-width:846px)]:p-4">Date</th>
                    <th className="p-3 [@media(min-width:846px)]:p-4">Score</th>
                    <th className="p-3 [@media(min-width:846px)]:p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-black text-md">
                  {recentResults.map((e, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-t">
                      <td className="p-3 [@media(min-width:846px)]:p-4">{e.subj}</td>
                      <td className="p-3 [@media(min-width:846px)]:p-4">{e.no}</td>
                      <td className="p-3 [@media(min-width:846px)]:p-4">{e.sem}</td>
                      <td className="p-3 [@media(min-width:846px)]:p-4">{e.date}</td>
                      <td className="p-3 [@media(min-width:846px)]:p-4">{e.score}</td>
                      <td className="p-3 [@media(min-width:846px)]:p-4">
                        <button className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                          View Details
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
};

export default Dashboard;

// Helper component
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2">
      <span className="font-semibold text-[#002855]">{label}</span>
      <span>{value}</span>
    </div>
  );
}
