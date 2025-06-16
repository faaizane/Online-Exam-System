// // src/pages/ViewResults.jsx
// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import Sidebar from '../components/TSidebar';
// import Header from '../components/THeader';

// export default function ViewResults() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const toggleSidebar = () => setSidebarOpen(o => !o);

//   const rows = [
//     {
//       name: 'Student 1',
//       reg: '21pwbcsxxxx',
//       marks: '10/10',
//       flag: 'Yes',
//       action: 'Review',
//     },
//     {
//       name: 'Student 2',
//       reg: '21pwbcsyyy',
//       marks: '06/10',
//       flag: 'No',
//       action: 'N/A',
//     },
//   ];

//   return (
//     <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
//       <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//         <Header toggleSidebar={toggleSidebar} />

//         <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8 space-y-6">
//           <h1 className="text-[22px] md:text-4xl font-bold text-[#002855]">
//             Quiz 01 – App Development
//           </h1>

//           {/* Mobile Cards */}
//           <div className="space-y-4 [@media(min-width:486px)]:hidden">
//             {rows.map((row, i) => (
//               <div
//                 key={i}
//                 className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
//               >
//                 <div className="flex justify-between py-2">
//                   <span className="font-semibold text-[#002855]">Student:</span>
//                   <span>{row.name}</span>
//                 </div>
//                 <div className="flex justify-between py-2">
//                   <span className="font-semibold text-[#002855]">Reg No.:</span>
//                   <span>{row.reg}</span>
//                 </div>
//                 <div className="flex justify-between py-2">
//                   <span className="font-semibold text-[#002855]">Marks:</span>
//                   <span>{row.marks}</span>
//                 </div>
//                 <div className="flex justify-between py-2">
//                   <span className="font-semibold text-[#002855]">Flag Incidents:</span>
//                   <span>{row.flag}</span>
//                 </div>
//                 <div className="text-right pt-2">
//                   {row.action === 'Review' ? (
//                     <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
//                       {row.action}
//                     </button>
//                   ) : (
//                     <span className="text-gray-400">N/A</span>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Desktop Table */}
//           <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
//             <table className="w-full text-left">
//               <thead className="bg-[#002855] text-white text-sm font-light">
//                 <tr>
//                   <th className="p-3 [@media(min-width:846px)]:p-4">Student Name</th>
//                   <th className="p-3 [@media(min-width:846px)]:p-4">Registration No</th>
//                   <th className="p-3 [@media(min-width:846px)]:p-4">Marks</th>
//                   <th className="p-3 [@media(min-width:846px)]:p-4">Flag Incidents</th>
//                   <th className="p-3 [@media(min-width:846px)]:p-4">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="text-black text-md">
//                 {rows.map((row, i) => (
//                   <tr key={i} className="border-t hover:bg-gray-50">
//                     <td className="p-3 [@media(min-width:846px)]:p-4">{row.name}</td>
//                     <td className="p-3 [@media(min-width:846px)]:p-4">{row.reg}</td>
//                     <td className="p-3 [@media(min-width:846px)]:p-4">{row.marks}</td>
//                     <td className="p-3 [@media(min-width:846px)]:p-4">{row.flag}</td>
//                     <td className="p-3 [@media(min-width:846px)]:p-4">
//                       {row.action === 'Review' ? (
//                         <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
//                           {row.action}
//                         </button>
//                       ) : (
//                         <span className="text-gray-400">N/A</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




// src/pages/ViewResults.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header  from '../components/THeader';

export default function ViewResults() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const { state } = useLocation();          // ← examId comes from ExamSchedule
  const navigate  = useNavigate();
  const examId    = state?.examId;
  const pageTitle = state?.title || 'Results';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId) return;

    async function fetchResults() {
      try {
        const token = localStorage.getItem('token');
        const res   = await fetch(`/api/exams/${examId}/results`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        setRows(await res.json());
      } catch {
        alert('Failed to fetch results');
        navigate(-1);            // go back
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [examId, navigate]);

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8 space-y-6">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855]">
            {pageTitle}
          </h1>

          {loading ? (
            <p className="text-center text-gray-500">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-center text-gray-500">No submissions yet.</p>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="space-y-4 [@media(min-width:486px)]:hidden">
                {rows.map((row, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
                  >
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-[#002855]">
                        Student:
                      </span>
                      <span>{row.studentName}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-[#002855]">
                        Reg No.:
                      </span>
                      <span>{row.registrationNumber}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-[#002855]">
                        Marks:
                      </span>
                      <span>{row.marks}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-[#002855]">
                        Flag Incidents:
                      </span>
                      <span>{row.flagged ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="text-right pt-2">
                      {row.flagged ? (
                        <Link
                          to="/reviewcheating"
                          state={{ submissionId: row.submissionId }}
                        >
                          <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
                            Review
                          </button>
                        </Link>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#002855] text-white text-sm font-light">
                    <tr>
                      <th className="p-3 [@media(min-width:846px)]:p-4">
                        Student Name
                      </th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">
                        Registration No
                      </th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">
                        Marks
                      </th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">
                        Flag Incidents
                      </th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-black text-md">
                    {rows.map((row, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-3 [@media(min-width:846px)]:p-4">
                          {row.studentName}
                        </td>
                        <td className="p-3 [@media(min-width:846px)]:p-4">
                          {row.registrationNumber}
                        </td>
                        <td className="p-3 [@media(min-width:846px)]:p-4">
                          {row.marks}
                        </td>
                        <td className="p-3 [@media(min-width:846px)]:p-4">
                          {row.flagged ? 'Yes' : 'No'}
                        </td>
                        <td className="p-3 [@media(min-width:846px)]:p-4">
                          {row.flagged ? (
                            <Link
                              to="/reviewcheating"
                              state={{ submissionId: row.submissionId }}
                            >
                              <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
                                Review
                              </button>
                            </Link>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
