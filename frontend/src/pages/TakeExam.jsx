// src/pages/TakeExam.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import StudentHeader from '../components/SHeader';

export default function TakeExam() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);
  const [expandedSemester, setExpandedSemester] = useState('fall2024');

  const sections = [
    {
      id: 'fall2024',
      label: '2024 – Fall Semester',
      subjects: [
        'Mobile App Development',
        'Parallel & Distributed Computing',
        'Islamic Studies',
        'Machine Learning',
        'Computer Intelligence'
      ]
    },
    {
      id: 'spring2024',
      label: '2024 – Spring Semester',
      subjects: ['Data Structures', 'Computer Networks']
    },
    {
      id: 'fall2023',
      label: '2023 – Fall Semester',
      subjects: ['Operating Systems', 'Digital Logic Design']
    }
  ];

  const toggleSubjects = (id) =>
    setExpandedSemester(expandedSemester === id ? null : id);

  const handleSubjectClick = (subject) => {
    navigate('/take-exam/test-page', { state: { subject } });
  };

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
            Select a subject to begin your exam
          </p>

          {sections.map((sec) => (
            <section key={sec.id} className="mb-6">
              <button
                onClick={() => toggleSubjects(sec.id)}
                className="w-full bg-[#002855] text-white px-4 md:px-6 py-2 md:py-3 rounded flex justify-between items-center font-medium"
              >
                <span className="text-[16px] md:text-lg">{sec.label}</span>
                <span className="text-sm">{expandedSemester === sec.id ? '▲' : '▼'}</span>
              </button>

              {expandedSemester === sec.id && (
                <div className="border border-gray-300 border-t-0 rounded-b overflow-hidden">
                  {sec.subjects.map((subj) => (
                    <div
                      key={subj}
                      onClick={() => handleSubjectClick(subj)}
                      className="p-3 md:p-4 bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                    >
                      {subj}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
