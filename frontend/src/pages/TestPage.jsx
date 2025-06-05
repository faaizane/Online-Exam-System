// src/pages/TestPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import SHeader from '../components/SHeader';

export default function TestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  const subject = location.state?.subject || 'Mobile App Development';
  const semester = '2024 – Fall Semester';

  // single exam record
  const exam = {
    subject,
    examNo: '1',
    semester,
    duration: '10 minutes',
    date: currentDate,
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <SHeader toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          {/* Header + Back */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-2 md:mb-0">
              Take Exam
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#2c3e50] bg-white hover:bg-gray-100 border border-gray-300 px-4 py-2 rounded-full transition"
            >
              <span className="text-xl">←</span>
              <span className="font-semibold text-sm">Back</span>
            </button>
          </div>

          {/* Exam Details */}
          <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
            Exam Details
          </h2>

          {/* Mobile Card */}
          <div className="space-y-4 [@media(min-width:486px)]:hidden">
            <div className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200">
              <div className="flex justify-between py-2">
                <span className="font-semibold text-[#002855]">Subject Name:</span>
                <span>{exam.subject}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-[#002855]">Exam No.:</span>
                <span>{exam.examNo}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-[#002855]">Semester:</span>
                <span>{exam.semester}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-[#002855]">Total Time:</span>
                <span>{exam.duration}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-[#002855]">Date:</span>
                <span>{exam.date}</span>
              </div>
              <div className="text-right pt-2">
                <button
                  onClick={() => navigate('/give-exam')}
                  className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
                >
                  Start Test
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#002855] text-white text-sm font-light">
                <tr>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Subject Name</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Exam No.</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Semester</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Total Time</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Date</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-black text-md">
                <tr className="border-t hover:bg-gray-50">
                  <td className="p-3 [@media(min-width:846px)]:p-4">{exam.subject}</td>
                  <td className="p-3 [@media(min-width:846px)]:p-4">{exam.examNo}</td>
                  <td className="p-3 [@media(min-width:846px)]:p-4">{exam.semester}</td>
                  <td className="p-3 [@media(min-width:846px)]:p-4">{exam.duration}</td>
                  <td className="p-3 [@media(min-width:846px)]:p-4">{exam.date}</td>
                  <td className="p-3 [@media(min-width:846px)]:p-4">
                    <button
                      onClick={() => navigate('/give-exam')}
                      className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    >
                      Start Test
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
