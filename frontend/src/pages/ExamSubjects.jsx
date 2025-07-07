import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';
import BackButton from '../components/BackButton';

// Utility
const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
const ordinal = n => {
  const num = parseInt(n, 10);
  if (isNaN(num)) return n;
  const mod100 = num % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${num}th`;
  switch (num % 10) {
    case 1: return `${num}st`;
    case 2: return `${num}nd`;
    case 3: return `${num}rd`;
    default: return `${num}th`;
  }
};

export default function ExamSubjects() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { year, session, semester } = state || {};

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subjects, setSubjects]     = useState([]);
  const [error, setError] = useState('');

  const toggleSidebar = () => setSidebarOpen(o => !o);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!year || !session || !semester) return;
    (async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/subjects?year=${year}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const list = await res.json();
        const filtered = list.filter(s => s.session.trim().toLowerCase() === session && s.semester === Number(semester));
        setSubjects(filtered);
      } catch {
        setError('Could not load subjects');
      }
    })();
  }, [year, session, semester]);

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <div className="px-4 md:px-16 py-6">
          <BackButton />

          <h1 className="text-3xl md:text-4xl font-bold text-[#002855] mb-6">
            Exam Schedule – {year} {capitalize(session)} ({ordinal(semester)} Semester)
          </h1>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects.map(sub => (
              <div
                key={sub._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 cursor-pointer hover:-translate-y-1 transition transform group"
                onClick={() => navigate('/examschedule', { state: { year, session, semester, subjectId: sub._id, subjectName: capitalize(sub.name) } })}
              >
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-[#002855] truncate mb-1">
                  {capitalize(sub.name)}
                </h3>
                {sub.section && (
                  <p className="text-sm text-gray-600">Section {capitalize(sub.section)}</p>
                )}
                <p className="text-sm text-gray-500">{ordinal(sub.semester)} Semester</p>
              </div>
            ))}
          </div>

          {!subjects.length && !error && (
            <p className="text-center text-gray-500">No subjects found for this semester.</p>
          )}
        </div>
      </div>
    </div>
  );
} 