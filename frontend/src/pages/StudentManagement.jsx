// src/pages/StudentManagement.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';

export default function StudentManagement() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) console.log('Selected file:', file.name);
  };

  // sample data
  const students = [
    {
      reg: '21pwbcsxxxx',
      name: 'Student 1',
      subject: 'Web Programming',
      semester: '7th',
      section: 'A',
      department: 'Computer Science'
    },
    // ...more records
  ];

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-6">
            Student Management
          </h1>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <label
              htmlFor="csv-upload"
              className="cursor-pointer bg-[#002855] text-white px-4 py-2 rounded shadow-sm hover:shadow-md hover:bg-[#001f47] transition inline-block"
            >
              Import CSV
            </label>
            <input
              type="file"
              id="csv-upload"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="hidden"
              onChange={handleFileImport}
            />
            <button
              onClick={() => navigate('/add-student')}
              className="bg-[#002855] text-white px-4 py-2 rounded shadow-sm hover:shadow-md hover:bg-[#001f47] transition"
            >
              Add Students
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search for a student by name or registration number"
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          {/* Mobile Cards */}
          <div className="space-y-4 [@media(min-width:486px)]:hidden">
            {students.map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
              >
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Reg No.:</span>
                  <span>{s.reg}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Name:</span>
                  <span>{s.name}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Subject:</span>
                  <span>{s.subject}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Semester:</span>
                  <span>{s.semester}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Section:</span>
                  <span>{s.section}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Department:</span>
                  <span>{s.department}</span>
                </div>
                <div className="text-right pt-2 flex justify-end space-x-3">
                  <i className="fa-solid fa-user-pen text-[#63E6BE] cursor-pointer hover:text-[#6ACFA4] transition"></i>
                  <i className="fa-solid fa-user-slash text-red-600 cursor-pointer hover:text-red-800 transition"></i>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#002855] text-white font-light">
                <tr>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Registration No.</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Name</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Subject</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Semester</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Section</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Department</th>
                  <th className="p-3 [@media(min-width:846px)]:p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-black text-md">
                {students.map((s, i) => (
                  <tr key={i} className="border-t hover:bg-gray-100 transition">
                    <td className="p-3 [@media(min-width:846px)]:p-4">{s.reg}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{s.name}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{s.subject}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{s.semester}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{s.section}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4">{s.department}</td>
                    <td className="p-3 [@media(min-width:846px)]:p-4 flex items-center gap-3 text-lg">
                      <i className="fa-solid fa-user-pen text-[#63E6BE] cursor-pointer hover:text-[#6ACFA4] transition"></i>
                      <i className="fa-solid fa-user-slash text-red-600 cursor-pointer hover:text-red-800 transition"></i>
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
