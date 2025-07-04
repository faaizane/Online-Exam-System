// src/pages/ReviewCheating.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';

export default function ReviewCheating() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [incidents, setIncidents] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Load cheating incidents
  useEffect(() => {
    (async () => {
      try {
        const token = sessionStorage.getItem('token'); // sessionStorage for exam data
        const res = await fetch(`${API_BASE_URL}/api/cheats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setIncidents(data);

        const grp = groupByYearSession(data);
        if (grp.length) {
          const firstKey = `${grp[0].year}-${grp[0].session}`;
          setExpanded({ [firstKey]: true });
        }
      } catch {
        alert('Could not load cheating incidents');
      }
    })();
  }, []);

  // Group incidents by year & session
  const groupedIncidents = useMemo(
    () => groupByYearSession(incidents),
    [incidents]
  );

  function groupByYearSession(list) {
    const map = {};
    list.forEach(c => {
      const year = c.year ?? '';
      const session = c.session ?? '';
      const sem = c.semester ?? '';
      const key = `${year}-${session}`;

      if (!map[key]) {
        map[key] = { year, session, semesters: {} };
      }
      if (!map[key].semesters[sem]) {
        map[key].semesters[sem] = [];
      }
      map[key].semesters[sem].push(c);
    });

    return Object.values(map)
      .filter(g => g.year && g.session)
      .sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));
  }

  const capitalize = str => {
    if (typeof str !== 'string' || !str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formatSemester = sem => {
    const num = parseInt(sem, 10);
    if (isNaN(num)) return '';
    const suf =
      num % 10 === 1 && num % 100 !== 11
        ? 'st'
        : num % 10 === 2 && num % 100 !== 12
        ? 'nd'
        : num % 10 === 3 && num % 100 !== 13
        ? 'rd'
        : 'th';
    return `${num}${suf} Semester`;
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(o => !o)}
      />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <Header toggleSidebar={() => setSidebarOpen(o => !o)} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-6">
            Review Cheating Incidents
          </h1>

          <div className="space-y-4">
            {groupedIncidents.length === 0 ? (
              <p className="text-center text-gray-500">No incidents found.</p>
            ) : (
              groupedIncidents.map(group => {
                const key = `${group.year}-${group.session}`;
                const sems = Object.keys(group.semesters);
                return (
                  <div
                    key={key}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <div
                      className="bg-[#002855] text-white px-4 md:px-6 py-2 md:py-3 flex justify-between items-center cursor-pointer"
                      onClick={() =>
                        setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
                      }
                    >
                      <span className="font-semibold text-[16px] md:text-lg">
                        {group.year} – {capitalize(group.session)} Session
                      </span>
                      <span className="text-lg">
                        {expanded[key] ? '▲' : '▼'}
                      </span>
                    </div>

                    {expanded[key] && (
                      <div className="divide-y divide-gray-200">
                        {sems.map((sem, i) => (
                          <div
                            key={i}
                            className="px-4 md:px-6 py-2 md:py-3 hover:bg-gray-100 cursor-pointer transition"
                            onClick={() =>
                              navigate('/reviewcheating/details', {
                                state: {
                                  year: group.year,
                                  session: group.session,
                                  semester: sem,
                                  incidents: group.semesters[sem]
                                }
                              })
                            }
                          >
                            {formatSemester(sem)} (
                            {group.semesters[sem].length}{' '}
                            incident
                            {group.semesters[sem].length > 1 ? 's' : ''})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
