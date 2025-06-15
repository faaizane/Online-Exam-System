// src/pages/ViewResult.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import SHeader from '../components/SHeader';

export default function ViewResult() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groups, setGroups]           = useState([]);
  const navigate                      = useNavigate();
  const token                         = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/submissions', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setGroups)
      .catch(console.error);
  }, [token]);

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(o => !o)} />
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <SHeader toggleSidebar={() => setSidebarOpen(o => !o)} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <h1 className="text-4xl font-bold text-[#002855] mb-6">My Results</h1>

          {groups.map((g, i) => {
            // group items by subject
            const bySubject = g.items.reduce((acc, item) => {
              (acc[item.subject] ||= []).push(item);
              return acc;
            }, {});

            return (
              <section key={i} className="mb-8">
                <h2 className="text-2xl font-semibold text-[#002855] mb-4">
                  {g.year} – {g.session}
                </h2>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#002855] text-white text-sm font-light">
                      <tr>
                        <th className="p-3">Subject</th>
                        <th className="p-3 text-right">Attempts</th>
                      </tr>
                    </thead>
                    <tbody className="text-black text-md divide-y divide-gray-200">
                      {Object.entries(bySubject).map(([subjectName, items]) => (
                        <tr
                          key={subjectName}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            navigate(
                              `/view-result-details/${items[0].subjectId}`,
                              { state: { subjectName, items } }
                            )
                          }
                        >
                          <td className="p-3">{subjectName}</td>
                          <td className="p-3 text-right">{items.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
