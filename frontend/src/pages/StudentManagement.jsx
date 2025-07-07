// src/pages/StudentManagement.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';
import axios from 'axios';

export default function StudentManagement() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');

  const capitalize = str =>
    !str ? '' : str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

  const ordinal = val => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return val;
    const mod100 = num % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${num}th`;
    switch (num % 10) {
      case 1: return `${num}st`;
      case 2: return `${num}nd`;
      case 3: return `${num}rd`;
      default: return `${num}th`;
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token'); // ✅ changed from localStorage
    if (!token) {
      setError('You must be logged in to view subjects.');
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setSubjects(res.data))
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || 'Error fetching subjects');
      });
  }, [API_BASE_URL]);

  const groups = subjects.reduce((acc, sub) => {
    const year = sub.year;
    const sessionNorm = sub.session.trim().toLowerCase();
    const key = year != null
      ? `${year}—${sessionNorm}`
      : `—${sessionNorm}`;
    if (!acc[key]) {
      acc[key] = {
        year,
        session: sessionNorm,
        items: []
      };
    }
    acc[key].items.push(sub);
    return acc;
  }, {});

  const sortedGroups = Object.values(groups).sort((a, b) => {
    if (a.year == null && b.year != null) return 1;
    if (b.year == null && a.year != null) return -1;
    if (a.year != null && b.year != null && a.year !== b.year) {
      return b.year - a.year;
    }
    return a.session.localeCompare(b.session);
  });

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <div className="px-4 md:px-16 py-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#002855]">
              Student Management
            </h1>
            <button
              onClick={() => navigate('/add-subject')}
              className="bg-[#002855] text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:bg-[#001f47] transition-all duration-200"
            >
              + Add Subject
            </button>
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          {sortedGroups.map(({ year, session, items }) => (
            <div key={`${year ?? 'noYear'}—${session}`} className="mb-10">
              <div className="border-b-2 border-gray-200 pb-2 mb-6">
                <h2 className="text-2xl font-bold text-gray-700">
                  {year != null
                    ? `${year} — ${capitalize(session)}`
                    : capitalize(session)}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(sub => (
                  <div
                    key={sub._id}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden group cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                    onClick={() =>
                      navigate(`/subjects/${sub._id}/students`)
                    }
                  >
                    <div className="p-5">
                      <h3 className="text-xl font-semibold tracking-tight text-gray-800 truncate group-hover:text-[#002855] transition-colors duration-300">
                        {capitalize(sub.name)}
                      </h3>
                      {sub.section && (
                        <p className="text-sm text-gray-600">
                          {capitalize(sub.section)}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        {ordinal(sub.semester)} Semester
                      </p>
                    </div>
                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        {Array.isArray(sub.students)
                          ? `${sub.students.length} ${sub.students.length === 1 ? 'student' : 'students'}`
                          : '0 students'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!sortedGroups.length && !error && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No subjects yet. Click “+ Add Subject” to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
