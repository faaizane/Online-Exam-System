// File: src/pages/TakeExam.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import StudentHeader from '../components/SHeader';

export default function TakeExam() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function loadAvailable() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/exams/available', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSections(
          data.map(group => ({
            id: `${group.year}${group.session}`,
            label: `${group.year} – ${
              group.session.charAt(0).toUpperCase() + group.session.slice(1)
            } Semester`,
            exams: group.exams.map(e => ({
              examId: e._id,
              subjectName: e.subjectName,
              examNo: e.examNo,
              duration: e.duration,
              scheduleDate: e.scheduleDate,
              scheduleTime: e.scheduleTime,
              semester:     e.semester
            }))
          }))
        );
        if (data.length) setExpanded(`${data[0].year}${data[0].session}`);
      } catch {
        alert('Failed to load available exams');
      }
    }
    loadAvailable();
  }, []);

  const toggleSidebar = () => setSidebarOpen(o => !o);
  const toggleSection = id => setExpanded(expanded === id ? null : id);
  const startExam = exam =>
    navigate('/take-exam/test-page', { state: { exam } });

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <StudentHeader toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-2">
            Take Exam
          </h1>
          <p className="text-[16px] md:text-lg text-gray-600 mb-8">
            Select a subject to begin
          </p>

          {sections.map(sec => (
            <section key={sec.id} className="mb-6">
              <button
                onClick={() => toggleSection(sec.id)}
                className="w-full bg-[#002855] text-white px-4 md:px-6 py-2 md:py-3 rounded flex justify-between items-center font-medium"
              >
                <span className="text-[16px] md:text-lg">{sec.label}</span>
                <span className="text-sm">
                  {expanded === sec.id ? '▲' : '▼'}
                </span>
              </button>

              {expanded === sec.id && (
                <div className="border border-gray-300 border-t-0 rounded-b overflow-hidden">
                  {sec.exams.map(exam => (
                    <div
                      key={exam.examId}
                      onClick={() => startExam(exam)}
                      className="p-3 md:p-4 bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                    >
                      {exam.subjectName}
                    </div>
                  ))}
                  {sec.exams.length === 0 && (
                    <div className="p-4 bg-white text-gray-500">
                      No exams available
                    </div>
                  )}
                </div>
              )}
            </section>
          ))}

          {sections.length === 0 && (
            <p className="text-center text-gray-500">No exams found for you.</p>
          )}
        </div>
      </div>
    </div>
  );
}
