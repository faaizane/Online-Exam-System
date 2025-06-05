// src/pages/ExamSchedule.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';

export default function ExamSchedule() {
  const location = useLocation();
  const navigate = useNavigate();  // <-- add this
  const { year, season, assignedSemester } = location.state || {};

  const [exams, setExams] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(o => !o);

  useEffect(() => {
    if (!year || !season || !assignedSemester) return;

    async function fetchExams() {
      try {
        const token = localStorage.getItem('token');
        const query = new URLSearchParams({ year, season, assignedSemester });
        const res = await fetch(`/api/exams/filtered?${query.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch exams');
        const data = await res.json();
        setExams(data);
      } catch (err) {
        alert('Failed to fetch exams');
      }
    }
    fetchExams();
  }, [year, season, assignedSemester]);

  // Aaj ki date
  const today = new Date();

  // Filter upcoming and completed
  const upcoming = exams.filter(e => new Date(e.scheduleDate) >= today);
  const completed = exams.filter(e => new Date(e.scheduleDate) < today);

  // New function to handle edit click
  const handleEditClick = (examId) => {
    navigate(`/editexam/${examId}`);
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8 space-y-12">
          {/* Upcoming Exam */}
          <section>
            <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-4">
              Upcoming Exam
            </h1>

            {upcoming.length === 0 ? (
              <p className="text-center text-gray-500">No upcoming exams.</p>
            ) : (
              <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#002855] text-white text-sm font-light">
                    <tr>
                      <th className="p-3 [@media(min-width:846px)]:p-4">Subject</th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">Exam No.</th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">Scheduled Date</th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">Total Students</th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">Status</th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="text-black text-md">
  {upcoming.map((exam, i) => (
    <tr key={i} className="hover:bg-gray-50 border-t">
      <td className="p-3 [@media(min-width:846px)]:p-4">{exam.subject}</td>
      <td className="p-3 [@media(min-width:846px)]:p-4">{exam.examNo}</td>
      <td className="p-3 [@media(min-width:846px)]:p-4">{new Date(exam.scheduleDate).toLocaleDateString()}</td>
      <td className="p-3 [@media(min-width:846px)]:p-4">{null}</td>
      <td className="p-3 [@media(min-width:846px)]:p-4">Scheduled</td>
      <td className="p-3 [@media(min-width:846px)]:p-4 text-center">
        <button
          onClick={() => handleEditClick(exam._id)}
          title="Edit Exam"
          className="text-lg cursor-pointer p-1 rounded hover:bg-blue-200 hover:text-blue-800 transition"
          type="button"
        >
          ✏️
        </button>
      </td>
    </tr>
  ))}
</tbody>

                </table>
              </div>
            )}
          </section>

          {/* Completed Exam */}
          <section>
            <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-4">
              Completed Exam
            </h1>

            {completed.length === 0 ? (
              <p className="text-center text-gray-500">No completed exams.</p>
            ) : (
              <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#002855] text-white text-sm font-light">
                    <tr>
                      <th className="p-3 [@media(min-width:846px)]:p-4">Subject</th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">Exam No.</th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">Exam Date</th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">Total Students</th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">Passed</th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">Failed</th>
                      <th className="p-3 [@media(min-width:846px)]:p-4">View Results</th>
                    </tr>
                  </thead>
                  <tbody className="text-black text-md">
                    {completed.map((exam, i) => (
                      <tr key={i} className="hover:bg-gray-50 border-t">
                        <td className="p-3 [@media(min-width:846px)]:p-4">{exam.subject}</td>
                        <td className="p-3 [@media(min-width:846px)]:p-4">{exam.examNo}</td>
                        <td className="p-3 [@media(min-width:846px)]:p-4">{new Date(exam.scheduleDate).toLocaleDateString()}</td>
                        <td className="p-3 [@media(min-width:846px)]:p-4">{null /* Total students not available */}</td>
                        <td className="p-3 [@media(min-width:846px)]:p-4">{null /* Passed count not available */}</td>
                        <td className="p-3 [@media(min-width:846px)]:p-4">{null /* Failed count not available */}</td>
                        <td className="p-3 [@media(min-width:846px)]:p-4">
                          <Link to="/viewresults">
                            <button className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
                              View
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
