// src/pages/AddStudent.jsx
import React, { useState } from 'react';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';

export default function AddStudent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-2">
            Add Student
          </h1>
          <p className="text-[16px] md:text-lg text-gray-600 mb-8">
            Fill out the form below to register a new student
          </p>

          <div className="bg-white p-4 md:p-6 lg:p-8 rounded-xl shadow-md max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Student Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Registration No</label>
                <input
                  type="text"
                  placeholder="e.g. 21pwbcsxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Semester</label>
                <input
                  type="text"
                  placeholder="e.g. 7th"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Section</label>
                <input
                  type="text"
                  placeholder="e.g. A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="student@uetpeshawar.edu.pk"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>
            </div>

            <div className="text-center md:text-right">
              <button className="bg-[#002855] text-white px-6 py-2 rounded-lg hover:bg-[#001f47] transition w-full md:w-auto">
                Add Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
