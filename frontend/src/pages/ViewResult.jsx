// // src/pages/ViewResult.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Sidebar from '../components/SSidebar';
// import SHeader from '../components/SHeader';

// export default function ViewResult() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const toggleSidebar = () => setSidebarOpen(o => !o);
//   const [expandedSemester, setExpandedSemester] = useState('fall2024');
//   const navigate = useNavigate();

//   const semesters = [
//     {
//       id: 'fall2024',
//       label: '2024 – Fall Semester',
//       subjects: [
//         'Mobile App Development',
//         'Parallel & Distributed Computing',
//         'Islamic Studies',
//         'Machine Learning',
//         'Computer Intelligence',
//       ],
//     },
//     {
//       id: 'spring2024',
//       label: '2024 – Spring Semester',
//       subjects: ['Data Structures', 'Computer Networks'],
//     },
//     {
//       id: 'fall2023',
//       label: '2023 – Fall Semester',
//       subjects: ['Operating Systems', 'Digital Logic Design'],
//     },
//   ];

//   const toggleSemester = (id) =>
//     setExpandedSemester(expandedSemester === id ? null : id);

//   const handleSubjectClick = (subject) =>
//     navigate('/view-result-detail', { state: { subject } });

//   return (
//     <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
//       <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

//       <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//         <SHeader toggleSidebar={toggleSidebar} />

//         <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
//           <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-2">
//             View Results
//           </h1>
//           <p className="text-[16px] md:text-lg text-gray-600 mb-8">
//             Click on a subject to view exam results
//           </p>

//           {semesters.map((sem) => (
//             <section key={sem.id} className="mb-6">
//               <button
//                 onClick={() => toggleSemester(sem.id)}
//                 className="w-full bg-[#002855] text-white px-4 md:px-6 py-2 md:py-3 rounded flex justify-between items-center text-[16px] md:text-lg"
//               >
//                 {sem.label}
//                 <span>{expandedSemester === sem.id ? '▲' : '▼'}</span>
//               </button>

//               {expandedSemester === sem.id && (
//                 <div className="bg-white rounded-b-xl shadow-md divide-y divide-gray-200 overflow-hidden">
//                   {sem.subjects.map((subj) => (
//                     <div
//                       key={subj}
//                       onClick={() => handleSubjectClick(subj)}
//                       className="px-4 md:px-6 py-3 cursor-pointer hover:bg-gray-100 transition"
//                     >
//                       {subj}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </section>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }





// // frontend/src/pages/ViewResult.jsx
// import React, { useEffect, useState } from 'react';
// import { useNavigate }                from 'react-router-dom';
// import Sidebar                        from '../components/SSidebar';
// import SHeader                        from '../components/SHeader';

// export default function ViewResult() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [groups, setGroups]           = useState([]);
//   const navigate                      = useNavigate();
//   const token                         = localStorage.getItem('token');

//   useEffect(() => {
//     fetch('/api/submissions', {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(r => r.json())
//       .then(setGroups)
//       .catch(console.error);
//   }, [token]);

//   return (
//     <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
//       <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(o=>!o)} />
//       <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//         <SHeader toggleSidebar={() => setSidebarOpen(o=>!o)} />
//         <div className="px-4 py-8">
//           <h1 className="text-4xl font-bold text-[#002855] mb-6">My Results</h1>

//           {groups.map((g, i) => (
//             <section key={i} className="mb-8">
//               <h2 className="text-2xl font-semibold text-[#002855] mb-4">
//                 {g.year} – {g.session}
//               </h2>
//               <table className="w-full bg-white rounded-xl shadow overflow-hidden">
//                 <thead className="bg-[#002855] text-white text-sm">
//                   <tr>
//                     <th className="p-3">Subject</th>
//                     <th className="p-3">Marks</th>
//                     <th className="p-3">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-black text-md">
//                   {g.items.map((item, j) => (
//                     <tr
//                       key={j}
//                       className="border-t hover:bg-gray-50 cursor-pointer"
//                       onClick={() => navigate(`/view-result/${item.submissionId}`)}
//                     >
//                       <td className="p-3">{item.subject}</td>
//                       <td className="p-3">{item.marks}</td>
//                       <td className="p-3">
//                         <button className="bg-[#003366] text-white px-4 py-1.5 rounded">
//                           View Answers
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </section>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }





// src/pages/ViewResult.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate }                from 'react-router-dom';
import Sidebar                        from '../components/SSidebar';
import SHeader                        from '../components/SHeader';

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
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(o=>!o)} />
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <SHeader toggleSidebar={() => setSidebarOpen(o=>!o)} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <h1 className="text-4xl font-bold text-[#002855] mb-6">My Results</h1>

          {groups.map((g, i) => (
            <section key={i} className="mb-8">
              <h2 className="text-2xl font-semibold text-[#002855] mb-4">
                {g.year} – {g.session}
              </h2>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#002855] text-white text-sm font-light">
                    <tr>
                      <th className="p-3">Subject</th>
                    </tr>
                  </thead>
                  <tbody className="text-black text-md divide-y divide-gray-200">
                    {g.items.map((item, j) => (
                      <tr
                        key={j}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/view-result-details/${item.subjectId}`, { state: { subjectName: item.subjectName }})}
                      >
                        <td className="p-3">{item.subject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
