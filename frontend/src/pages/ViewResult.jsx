// File: src/pages/ViewResult.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import SHeader from '../components/SHeader';

export default function ViewResult() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  const token = sessionStorage.getItem('token');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ── Fetch results on mount ────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/submissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();

        // Transform API → UI data
        const transformed = data.map(g => ({
          id: `${g.year}${g.session}`,
          label: `${g.year} – ${
            g.session.charAt(0).toUpperCase() + g.session.slice(1)
          } Semester`,
          subjects: g.items.reduce((acc, it) => {
            (acc[it.subject] ||= []).push(it);
            return acc;
          }, {})
        }));

        setSections(transformed);
        if (transformed.length) setExpanded(transformed[0].id);
      } catch {
        alert('Could not load your results');
      }
    })();
  }, [token, API_BASE_URL]);

  // ── Helpers ───────────────────────────────────────────
  const toggleSidebar = () => setSidebarOpen(o => !o);
  const toggleSection = id => setExpanded(expanded === id ? null : id);

  // ── UI ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      {/* sidebar shifts in at 945px now */}
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <SHeader toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 [@media(min-width:1100px)]:px-16 py-4 md:py-8">
          <h1 className="text-4xl font-bold text-[#002855] mb-6">My Results</h1>

          {sections.map(sec => (
            <section key={sec.id} className="mb-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => toggleSection(sec.id)}
                  className="w-full bg-[#002855] text-white px-4 md:px-6 py-3 flex justify-between items-center font-medium"
                >
                  <span className="text-[16px] md:text-lg">{sec.label}</span>
                  <span>{expanded === sec.id ? '▲' : '▼'}</span>
                </button>

                {expanded === sec.id && (
                  <div className="divide-y divide-gray-200">
                    {Object.entries(sec.subjects).map(([subjectName, items]) => (
                      <div
                        key={subjectName}
                        onClick={() =>
                          navigate(
                            `/view-result-details/${items[0].subjectId}`,
                            { state: { subjectName, items } }
                          )
                        }
                        className="px-4 md:px-6 py-3 bg-white cursor-pointer hover:bg-gray-100 transition flex items-center"
                      >
                        <span className="text-gray-800">{subjectName}</span>
                      </div>
                    ))}

                    {Object.keys(sec.subjects).length === 0 && (
                      <div className="px-4 md:px-6 py-3 text-gray-500">
                        No results in this session
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          ))}

          {!sections.length && (
            <p className="text-center text-gray-500">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
