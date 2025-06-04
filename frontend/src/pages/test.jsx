// src/pages/SDashboard.jsx
import React, { useState } from 'react';
import Sidebar from '../components/SSidebar';
import StudentHeader from '../components/SHeader';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const upcomingExams = [
    { subj: 'App Development', no: 'Quiz 02', sem: '5th', date: '14-12-2024', status: 'Scheduled' },
    { subj: 'App Development', no: 'Quiz 03', sem: '5th', date: '25-12-2024', status: 'Scheduled' },
  ];

  const recentResults = [
    { subj: 'App Development', no: 'Quiz 01', sem: '5th', date: '01-12-2024', score: '85/100' },
    { subj: 'App Development', no: 'Quiz 01', sem: '5th', date: '01-12-2024', score: '85/100' },
    { subj: 'App Development', no: 'Quiz 01', sem: '5th', date: '01-12-2024', score: '85/100' },
  ];

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col md:ml-64">
        <StudentHeader toggleSidebar={toggleSidebar} />

        {/* px-2 on <768px; px-4 on 768–1023px; px-16 on ≥1024px */}
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

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {upcomingExams.map((e, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md p-4 w-full divide-y divide-gray-200"
                >
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Subject:</span>
                    <span>{e.subj}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Exam No.:</span>
                    <span>{e.no}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Semester:</span>
                    <span>{e.sem}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Date:</span>
                    <span>{e.date}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Status:</span>
                    <span>{e.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#002855] text-white text-sm font-light">
                  <tr>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Exam No.</th>
                    <th className="p-4">Semester</th>
                    <th className="p-4">Scheduled Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-black text-md">
                  {upcomingExams.map((e, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-t">
                      <td className="p-4">{e.subj}</td>
                      <td className="p-4">{e.no}</td>
                      <td className="p-4">{e.sem}</td>
                      <td className="p-4">{e.date}</td>
                      <td className="p-4">{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Results */}
          <section>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
              Recent Results
            </h2>

            <div className="md:hidden space-y-4">
              {recentResults.map((e, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md p-4 w-full divide-y divide-gray-200"
                >
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Subject:</span>
                    <span>{e.subj}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Exam No.:</span>
                    <span>{e.no}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Semester:</span>
                    <span>{e.sem}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Date:</span>
                    <span>{e.date}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-[#002855]">Score:</span>
                    <span>{e.score}</span>
                  </div>
                  <div className="text-right pt-2">
                    <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#002855] text-white text-sm font-light">
                  <tr>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Exam No.</th>
                    <th className="p-4">Semester</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-black text-md">
                  {recentResults.map((e, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-t">
                      <td className="p-4">{e.subj}</td>
                      <td className="p-4">{e.no}</td>
                      <td className="p-4">{e.sem}</td>
                      <td className="p-4">{e.date}</td>
                      <td className="p-4">{e.score}</td>
                      <td className="p-4">
                        <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
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