// src/pages/ReviewCheating.jsx
import React, { useState } from 'react';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';

export default function ReviewCheating() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const incidents = [
    {
      name: 'Student 1',
      reg: '21pwbcsxxxx',
      exam: 'Quiz 01',
      subject: 'Software Engineering',
      semester: '5th',
      date: '22-12-2024',
    },
    {
      name: 'Student 2',
      reg: '21pwbcsyyy',
      exam: 'Quiz 02',
      subject: 'Computer Networks',
      semester: '6th',
      date: '23-12-2024',
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8 space-y-6">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-2">
            Review Cheating
          </h1>
          <p className="text-[16px] md:text-lg text-gray-600 mb-4">
            Below are the flagged incidents from ongoing or completed exams.
          </p>

          {/* Mobile Cards */}
          <div className="space-y-4 [@media(min-width:486px)]:hidden">
            {incidents.map((row, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
              >
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Student:</span>
                  <span>{row.name}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Reg No.:</span>
                  <span>{row.reg}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Exam No.:</span>
                  <span>{row.exam}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Subject:</span>
                  <span>{row.subject}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Semester:</span>
                  <span>{row.semester}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Date:</span>
                  <span>{row.date}</span>
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
                  <th className="p-3 [@media(min-width:846px)]:p-4">Student Name</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Registration No</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Exam No</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Subject</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Semester</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Date</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-black text-md">
                {incidents.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 border-t">
                    <td className="p-3 [@media(min-width:846px)]:p-4">{row.name}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{row.reg}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{row.exam}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{row.subject}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{row.semester}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{row.date}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">
                      <button className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                        View Video
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
