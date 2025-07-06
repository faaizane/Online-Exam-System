// src/pages/ReviewCheatingDetails.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';

export default function ReviewCheatingDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { year, session, semester, incidents } = state || {};

  // Sort incidents by timestamp in descending order (recent first)
  const sortedIncidents = incidents ? [...incidents].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const token = sessionStorage.getItem('token'); // sessionStorage for exam data
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const formatDateTimeSimple = timestamp => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTimeSimple = timestamp => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
  };

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

  const capitalize = str => {
    if (typeof str !== 'string' || !str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const ordinal = n => {
    const num = parseInt(n, 10);
    if (isNaN(num)) return '';
    const rem100 = num % 100;
    if (rem100 >= 11 && rem100 <= 13) return `${num}th`;
    switch (num % 10) {
      case 1: return `${num}st`;
      case 2: return `${num}nd`;
      case 3: return `${num}rd`;
      default: return `${num}th`;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <div className="px-4 py-6 lg:px-16 space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="text-[#0073E6] hover:underline"
          >
            ← Back
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-[#002855]">
            {year} – {capitalize(session)} ({ordinal(semester)} Semester)
          </h1>

          {/* Mobile cards */}
          <div className="space-y-4 sm:hidden">
            {sortedIncidents.map(row => (
              <div
                key={row.id}
                className="bg-white p-4 rounded-xl shadow divide-y divide-gray-200"
              >
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#002855]">Reg No</span>
                  <span>{row.registrationNumber}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#002855]">Student</span>
                  <span>{row.student}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#002855]">Subject</span>
                  <span>{row.subjectName}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#002855]">Exam No</span>
                  <span>{row.exam}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#002855]">Reason</span>
                  <span>{row.reason}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#002855]">Date</span>
                  <span>{formatDateTimeSimple(row.timestamp)}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#002855]">Time</span>
                  <span>{formatTimeSimple(row.timestamp)}</span>
                </div>
                <div className="pt-3 text-right">
                  <button
                    onClick={() => viewVideo(row.id)}
                    className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-[#002855] transition cursor-pointer"
                  >
                    View Video
                  </button>
                </div>
              </div>
            ))}
            {sortedIncidents.length === 0 && (
              <div className="text-center text-gray-500 py-6">
                No incidents in this semester.
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-xl shadow overflow-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#002855] text-white">
                <tr>
                  <th className="p-3">Reg No</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Exam No</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {sortedIncidents.map(row => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{row.registrationNumber}</td>
                    <td className="p-3">{row.student}</td>
                    <td className="p-3">{row.subjectName}</td>
                    <td className="p-3">{row.exam}</td>
                    <td className="p-3">{row.reason}</td>
                    <td className="p-3">{formatDateTimeSimple(row.timestamp)}</td>
                    <td className="p-3">{formatTimeSimple(row.timestamp)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => viewVideo(row.id)}
                        className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-[#002855] transition cursor-pointer"
                      >
                        View Video
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedIncidents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-gray-500">
                      No incidents in this semester.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
