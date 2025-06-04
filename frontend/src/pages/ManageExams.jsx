// this is new code for a React component that manages exams, allowing users to create exams and view them in a structured format with collapsible sections for different semesters.
// src/pages/ManageExams.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';

export default function ManageExams() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [groupedExams, setGroupedExams] = useState([]);

  const toggleSidebar = () => setSidebarOpen(o => !o);

  useEffect(() => {
    async function fetchGroupedExams() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/exams/grouped', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setGroupedExams(data);

        // Sab groups initially expand kar den
        const initialExpanded = {};
        data.forEach(group => {
          initialExpanded[`${group.year}-${group.season}`] = true;
        });
        setExpanded(initialExpanded);
      } catch (err) {
        alert('Failed to fetch exams');
      }
    }
    fetchGroupedExams();
  }, []);

  const toggleSection = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-6">
            Manage Exams
          </h1>

          <div className="mb-4">
            <button
              className="bg-[#002855] text-white px-4 py-2 rounded shadow-sm hover:shadow-md hover:bg-[#001f47] transition"
              onClick={() => navigate('/createexam')}
            >
              Create Exam
            </button>
          </div>

          {/* Search bar optional */}

          <div className="space-y-4">
            {groupedExams.length === 0 && (
              <p className="text-center text-gray-500">No exams found.</p>
            )}

            {groupedExams.map(group => {
              const key = `${group.year}-${group.season}`;
              return (
                <div key={key} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div
                    className="bg-[#002855] text-white px-4 md:px-6 py-2 md:py-3 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection(key)}
                  >
                    <span className="font-semibold text-[16px] md:text-lg">
                      {group.year} – {group.season} Semester
                    </span>
                    <span className="text-lg">{expanded[key] ? '▲' : '▼'}</span>
                  </div>

                  {expanded[key] && (
                    <div className="divide-y divide-gray-200">
                      {Object.keys(group.semesters).length === 0 && (
                        <div className="px-4 md:px-6 py-2 md:py-3 text-gray-500">
                          No semesters found.
                        </div>
                      )}
                      {Object.keys(group.semesters).map((sem, idx) => (
                        <div
                          key={idx}
                          onClick={() => navigate('/examschedule', { state: { year: group.year, season: group.season, assignedSemester: sem } })}
                          className="px-4 md:px-6 py-2 md:py-3 hover:bg-gray-100 cursor-pointer transition"
                        >
                          {sem}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
