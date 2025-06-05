// src/pages/ViewResultDetail.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import SHeader from '../components/SHeader';

export default function ViewResultDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);
  const location = useLocation();
  const navigate = useNavigate();
  const subject = location.state?.subject || 'Subject';

  const resultsBySubject = {
    'Mobile App Development': [
      { exam: 'Quiz 01', semester: '7th', date: '02-12-2024', marks: '10/10' },
      { exam: 'Quiz 02', semester: '7th', date: '03-12-2024', marks: '06/10' },
      { exam: 'Quiz 03', semester: '7th', date: '08-12-2024', marks: '05/10' },
    ],
    'Parallel & Distributed Computing': [
      { exam: 'Quiz 01', semester: '7th', date: '01-12-2024', marks: '08/10' },
      { exam: 'Quiz 02', semester: '7th', date: '04-12-2024', marks: '07/10' },
    ],
    'Islamic Studies': [
      { exam: 'Midterm', semester: '7th', date: '10-11-2024', marks: '09/10' },
    ],
    'Machine Learning': [
      { exam: 'Quiz 01', semester: '7th', date: '05-12-2024', marks: '06/10' },
    ],
    'Computer Intelligence': [
      { exam: 'Assignment', semester: '7th', date: '07-12-2024', marks: '07/10' },
    ],
    'Data Structures': [
      { exam: 'Quiz 01', semester: '6th', date: '01-06-2024', marks: '09/10' },
      { exam: 'Midterm',  semester: '6th', date: '15-06-2024', marks: '08/10' },
    ],
    'Computer Networks': [
      { exam: 'Quiz 01', semester: '6th', date: '05-06-2024', marks: '08/10' },
      { exam: 'Final',     semester: '6th', date: '20-06-2024', marks: '07/10' },
    ],
    'Operating Systems': [
      { exam: 'Midterm', semester: '5th', date: '10-10-2023', marks: '07/10' },
      { exam: 'Final',   semester: '5th', date: '20-11-2023', marks: '08/10' },
    ],
    'Digital Logic Design': [
      { exam: 'Quiz 01', semester: '5th', date: '01-11-2023', marks: '09/10' },
      { exam: 'Final',   semester: '5th', date: '15-11-2023', marks: '08/10' },
    ],
  };
  const mockResults = resultsBySubject[subject] || [];

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <SHeader toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-[22px] md:text-4xl font-bold text-[#002855]">
                {subject} Results
              </h1>
              <p className="text-[16px] md:text-lg text-gray-600 mt-1">
                View your exam attempts and scores
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 md:mt-0 bg-white border border-gray-300 px-4 py-2 rounded-full shadow text-sm font-medium hover:bg-gray-100 transition"
            >
              ← Back
            </button>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-4 [@media(min-width:486px)]:hidden">
            {mockResults.map((r, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
              >
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Subject:</span>
                  <span>{subject}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Exam:</span>
                  <span>{r.exam}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Semester:</span>
                  <span>{r.semester}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Date:</span>
                  <span>{r.date}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Marks:</span>
                  <span>{r.marks}</span>
                </div>
                <div className="text-right pt-2">
                  <button
                    className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
                  >
                    View Answers
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
                  <th className="p-3 [@media(min-width:846px)]:p-4">Subject</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Exam</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Semester</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Date</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Marks</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-black text-md">
                {mockResults.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-3 [@media(min-width:846px)]:p-4">{subject}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{r.exam}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{r.semester}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{r.date}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{r.marks}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">
                      <button className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                        View Answers
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
