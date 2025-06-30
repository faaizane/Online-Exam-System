// // src/pages/ManageExams.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Sidebar from '../components/TSidebar';
// import Header from '../components/THeader';

// export default function ManageExams() {
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [expanded, setExpanded] = useState({});
//   const [groupedExams, setGroupedExams] = useState([]);

//   const [yearSearch, setYearSearch] = useState('');
//   const [sessionFilter, setSessionFilter] = useState('');

//   const toggleSidebar = () => setSidebarOpen(o => !o);

//   useEffect(() => {
//     async function fetchGroupedExams() {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch('/api/exams/grouped', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) throw new Error('Failed to fetch');
//         const data = await res.json();
//         setGroupedExams(data);
//         // expand the very first (highest-year) group by default after sorting
//         const sorted = data
//           .slice()
//           .sort((a, b) => parseInt(b.year) - parseInt(a.year));
//         if (sorted.length > 0) {
//           const firstKey = `${sorted[0].year}-${sorted[0].session}`;
//           setExpanded({ [firstKey]: true });
//         }
//       } catch {
//         alert('Failed to fetch exams');
//       }
//     }
//     fetchGroupedExams();
//   }, []);

//   const toggleSection = key => {
//     setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   const capitalize = str =>
//     str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

//   const formatSemesterLabel = code => {
//     const num = parseInt(code, 10);
//     const suffix =
//       num % 10 === 1 && num % 100 !== 11
//         ? 'st'
//         : num % 10 === 2 && num % 100 !== 12
//         ? 'nd'
//         : num % 10 === 3 && num % 100 !== 13
//         ? 'rd'
//         : 'th';
//     return `${num}${suffix} Semester`;
//   };

//   // get all sessions for the dropdown
//   const allSessions = useMemo(
//     () => [...new Set(groupedExams.map(g => g.session))],
//     [groupedExams]
//   );

//   // filter by year text & session
//   const trimmedYear = yearSearch.trim();
//   const filteredGroups = useMemo(
//     () =>
//       groupedExams.filter(g => {
//         const matchesYear =
//           !trimmedYear || g.year.includes(trimmedYear);
//         const matchesSession =
//           !sessionFilter || g.session === sessionFilter;
//         return matchesYear && matchesSession;
//       }),
//     [groupedExams, trimmedYear, sessionFilter]
//   );

//   // sort filtered groups by year descending
//   const sortedGroups = useMemo(
//     () =>
//       filteredGroups
//         .slice()
//         .sort((a, b) => parseInt(b.year) - parseInt(a.year)),
//     [filteredGroups]
//   );

//   return (
//     <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
//       <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//         <Header toggleSidebar={toggleSidebar} />
//         <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
//           <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-6">
//             Manage Exams
//           </h1>

//           <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
//             <button
//               className="bg-[#002855] text-white px-4 py-2 rounded shadow-sm hover:shadow-md hover:bg-[#001f47] transition mb-3 sm:mb-0"
//               onClick={() => navigate('/createexam')}
//             >
//               Create Exam
//             </button>

//             <input
//               type="text"
//               value={yearSearch}
//               onChange={e => setYearSearch(e.target.value)}
//               placeholder="Search by year"
//               className="border px-4 py-2 rounded w-full sm:w-1/3"
//             />
//             <select
//               value={sessionFilter}
//               onChange={e => setSessionFilter(e.target.value)}
//               className="border px-4 py-2 rounded w-full sm:w-1/4"
//             >
//               <option value="">All Sessions</option>
//               {allSessions.map(session => (
//                 <option key={session} value={session}>
//                   {capitalize(session)}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="space-y-4">
//             {sortedGroups.length === 0 ? (
//               <p className="text-center text-gray-500">No exams found.</p>
//             ) : (
//               sortedGroups.map(group => {
//                 const key = `${group.year}-${group.session}`;
//                 const allExams = Object.values(group.semesters).flat();
//                 const uniqueSemesters = [
//                   ...new Set(allExams.map(e => e.semester))
//                 ];

//                 return (
//                   <div
//                     key={key}
//                     className="bg-white rounded-xl shadow-md overflow-hidden"
//                   >
//                     <div
//                       className="bg-[#002855] text-white px-4 md:px-6 py-2 md:py-3 flex justify-between items-center cursor-pointer"
//                       onClick={() => toggleSection(key)}
//                     >
//                       <span className="font-semibold text-[16px] md:text-lg">
//                         {group.year} – {capitalize(group.session)} Semester
//                       </span>
//                       <span className="text-lg">
//                         {expanded[key] ? '▲' : '▼'}
//                       </span>
//                     </div>

//                     {expanded[key] && (
//                       <div className="divide-y divide-gray-200">
//                         {uniqueSemesters.length === 0 ? (
//                           <div className="px-4 md:px-6 py-2 md:py-3 text-gray-500">
//                             No semesters found.
//                           </div>
//                         ) : (
//                           uniqueSemesters.map((semCode, idx) => (
//                             <div
//                               key={idx}
//                               onClick={() =>
//                                 navigate('/examschedule', {
//                                   state: {
//                                     year: group.year,
//                                     session: group.session,
//                                     semester: semCode
//                                   }
//                                 })
//                               }
//                               className="px-4 md:px-6 py-2 md:py-3 hover:bg-gray-100 cursor-pointer transition"
//                             >
//                               {formatSemesterLabel(semCode)}
//                             </div>
//                           ))
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }










// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Sidebar from '../components/TSidebar';
// import Header from '../components/THeader';

// export default function ManageExams() {
//   const navigate = useNavigate();
//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [expanded, setExpanded] = useState({});
//   const [groupedExams, setGroupedExams] = useState([]);

//   const [yearSearch, setYearSearch] = useState('');
//   const [sessionFilter, setSessionFilter] = useState('');

//   const toggleSidebar = () => setSidebarOpen(o => !o);

//   useEffect(() => {
//     async function fetchGroupedExams() {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch(`${API_BASE_URL}/api/exams/grouped`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) throw new Error('Failed to fetch');
//         const data = await res.json();
//         setGroupedExams(data);
//         const sorted = data
//           .slice()
//           .sort((a, b) => parseInt(b.year) - parseInt(a.year));
//         if (sorted.length > 0) {
//           const firstKey = `${sorted[0].year}-${sorted[0].session}`;
//           setExpanded({ [firstKey]: true });
//         }
//       } catch {
//         alert('Failed to fetch exams');
//       }
//     }
//     fetchGroupedExams();
//   }, []);

//   const toggleSection = key => {
//     setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   const capitalize = str =>
//     str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

//   const formatSemesterLabel = code => {
//     const num = parseInt(code, 10);
//     const suffix =
//       num % 10 === 1 && num % 100 !== 11
//         ? 'st'
//         : num % 10 === 2 && num % 100 !== 12
//         ? 'nd'
//         : num % 10 === 3 && num % 100 !== 13
//         ? 'rd'
//         : 'th';
//     return `${num}${suffix} Semester`;
//   };

//   const allSessions = useMemo(
//     () => [...new Set(groupedExams.map(g => g.session))],
//     [groupedExams]
//   );

//   const trimmedYear = yearSearch.trim();
//   const filteredGroups = useMemo(
//     () =>
//       groupedExams.filter(g => {
//         const matchesYear =
//           !trimmedYear || g.year.includes(trimmedYear);
//         const matchesSession =
//           !sessionFilter || g.session === sessionFilter;
//         return matchesYear && matchesSession;
//       }),
//     [groupedExams, trimmedYear, sessionFilter]
//   );

//   const sortedGroups = useMemo(
//     () =>
//       filteredGroups
//         .slice()
//         .sort((a, b) => parseInt(b.year) - parseInt(a.year)),
//     [filteredGroups]
//   );

//   return (
//     <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
//       <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//         <Header toggleSidebar={toggleSidebar} />
//         <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
//           <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-6">
//             Manage Exams
//           </h1>

//           <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
//             <button
//               className="bg-[#002855] text-white px-4 py-2 rounded shadow-sm hover:shadow-md hover:bg-[#001f47] transition mb-3 sm:mb-0"
//               onClick={() => navigate('/createexam')}
//             >
//               Create Exam
//             </button>

//             <input
//               type="text"
//               value={yearSearch}
//               onChange={e => setYearSearch(e.target.value)}
//               placeholder="Search by year"
//               className="border px-4 py-2 rounded w-full sm:w-1/3"
//             />
//             <select
//               value={sessionFilter}
//               onChange={e => setSessionFilter(e.target.value)}
//               className="border px-4 py-2 rounded w-full sm:w-1/4"
//             >
//               <option value="">All Sessions</option>
//               {allSessions.map(session => (
//                 <option key={session} value={session}>
//                   {capitalize(session)}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="space-y-4">
//             {sortedGroups.length === 0 ? (
//               <p className="text-center text-gray-500">No exams found.</p>
//             ) : (
//               sortedGroups.map(group => {
//                 const key = `${group.year}-${group.session}`;
//                 const allExams = Object.values(group.semesters).flat();
//                 const uniqueSemesters = [
//                   ...new Set(allExams.map(e => e.semester))
//                 ];

//                 return (
//                   <div
//                     key={key}
//                     className="bg-white rounded-xl shadow-md overflow-hidden"
//                   >
//                     <div
//                       className="bg-[#002855] text-white px-4 md:px-6 py-2 md:py-3 flex justify-between items-center cursor-pointer"
//                       onClick={() => toggleSection(key)}
//                     >
//                       <span className="font-semibold text-[16px] md:text-lg">
//                         {group.year} – {capitalize(group.session)} Semester
//                       </span>
//                       <span className="text-lg">
//                         {expanded[key] ? '▲' : '▼'}
//                       </span>
//                     </div>

//                     {expanded[key] && (
//                       <div className="divide-y divide-gray-200">
//                         {uniqueSemesters.length === 0 ? (
//                           <div className="px-4 md:px-6 py-2 md:py-3 text-gray-500">
//                             No semesters found.
//                           </div>
//                         ) : (
//                           uniqueSemesters.map((semCode, idx) => (
//                             <div
//                               key={idx}
//                               onClick={() =>
//                                 navigate('/examschedule', {
//                                   state: {
//                                     year: group.year,
//                                     session: group.session,
//                                     semester: semCode
//                                   }
//                                 })
//                               }
//                               className="px-4 md:px-6 py-2 md:py-3 hover:bg-gray-100 cursor-pointer transition"
//                             >
//                               {formatSemesterLabel(semCode)}
//                             </div>
//                           ))
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// src/pages/ManageExams.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';

export default function ManageExams() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [groupedExams, setGroupedExams] = useState([]);

  const [yearSearch, setYearSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');

  const toggleSidebar = () => setSidebarOpen(o => !o);

  useEffect(() => {
    async function fetchGroupedExams() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/exams/grouped`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setGroupedExams(data);
        const sorted = data
          .slice()
          .sort((a, b) => parseInt(b.year) - parseInt(a.year));
        if (sorted.length > 0) {
          const firstKey = `${sorted[0].year}-${sorted[0].session}`;
          setExpanded({ [firstKey]: true });
        }
      } catch {
        alert('Failed to fetch exams');
      }
    }
    fetchGroupedExams();
  }, []);

  const toggleSection = key => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const capitalize = str =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const formatSemesterLabel = code => {
    const num = parseInt(code, 10);
    const suffix =
      num % 10 === 1 && num % 100 !== 11
        ? 'st'
        : num % 10 === 2 && num % 100 !== 12
        ? 'nd'
        : num % 10 === 3 && num % 100 !== 13
        ? 'rd'
        : 'th';
    return `${num}${suffix} Semester`;
  };

  const allSessions = useMemo(
    () => [...new Set(groupedExams.map(g => g.session))],
    [groupedExams]
  );

  const trimmedYear = yearSearch.trim();
  const filteredGroups = useMemo(
    () =>
      groupedExams.filter(g => {
        const matchesYear =
          !trimmedYear || g.year.includes(trimmedYear);
        const matchesSession =
          !sessionFilter || g.session === sessionFilter;
        return matchesYear && matchesSession;
      }),
    [groupedExams, trimmedYear, sessionFilter]
  );

  const sortedGroups = useMemo(
    () =>
      filteredGroups
        .slice()
        .sort((a, b) => parseInt(b.year) - parseInt(a.year)),
    [filteredGroups]
  );

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />
        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-6">
            Manage Exams
          </h1>

          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <button
              className="bg-[#002855] text-white px-4 py-2 rounded shadow-sm hover:shadow-md hover:bg-[#001f47] transition mb-3 sm:mb-0"
              onClick={() => navigate('/createexam')}
            >
              Create Exam
            </button>

            <input
              type="text"
              value={yearSearch}
              onChange={e => setYearSearch(e.target.value)}
              placeholder="Search by year"
              className="border px-4 py-2 rounded w-full sm:w-1/3"
            />
            <select
              value={sessionFilter}
              onChange={e => setSessionFilter(e.target.value)}
              className="border px-4 py-2 rounded w-full sm:w-1/4"
            >
              <option value="">All Sessions</option>
              {allSessions.map(session => (
                <option key={session} value={session}>
                  {capitalize(session)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {sortedGroups.length === 0 ? (
              <p className="text-center text-gray-500">No exams found.</p>
            ) : (
              sortedGroups.map(group => {
                const key = `${group.year}-${group.session}`;
                const allExams = Object.values(group.semesters).flat();
                const uniqueSemesters = [
                  ...new Set(allExams.map(e => e.semester))
                ];

                return (
                  <div
                    key={key}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <div
                      className="bg-[#002855] text-white px-4 md:px-6 py-2 md:py-3 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection(key)}
                    >
                      <span className="font-semibold text-[16px] md:text-lg">
                        {group.year} – {capitalize(group.session)} Semester
                      </span>
                      <span className="text-lg">
                        {expanded[key] ? '▲' : '▼'}
                      </span>
                    </div>

                    {expanded[key] && (
                      <div className="divide-y divide-gray-200">
                        {uniqueSemesters.length === 0 ? (
                          <div className="px-4 md:px-6 py-2 md:py-3 text-gray-500">
                            No semesters found.
                          </div>
                        ) : (
                          uniqueSemesters.map((semCode, idx) => (
                            <div
                              key={idx}
                              onClick={() =>
                                navigate('/examschedule', {
                                  state: {
                                    year: group.year,
                                    session: group.session,
                                    semester: semCode
                                  }
                                })
                              }
                              className="px-4 md:px-6 py-2 md:py-3 hover:bg-gray-100 cursor-pointer transition"
                            >
                              {formatSemesterLabel(semCode)}
                            </div>
                          ))
                        )}
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
