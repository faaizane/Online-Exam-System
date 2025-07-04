// src/pages/ViewResultDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import SHeader from '../components/SHeader';

export default function ViewResultDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const subjectName = location.state?.subjectName || 'Subject';

  const [results, setResults] = useState([]);

  const token = sessionStorage.getItem('token');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/submissions/subject/${subjectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(console.error);
  }, [subjectId, token, API_BASE_URL]);

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <SHeader toggleSidebar={toggleSidebar} />
        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-[22px] md:text-4xl font-bold text-[#002855]">
                {subjectName} Results
              </h1>
              <p className="text-[16px] md:text-lg text-gray-600 mt-1">
                View your exam attempts and scores
              </p>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-4 [@media(min-width:486px)]:hidden">
            {results.map((r, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
              >
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Subject:</span>
                  <span>{r.subjectName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Exam:</span>
                  <span>{r.examNo}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Semester:</span>
                  <span>{r.semester}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Date:</span>
                  <span>{new Date(r.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Marks:</span>
                  <span>{r.marks}</span>
                </div>
                <div className="text-right pt-2">
                  <button
                    onClick={() => navigate(`/view-answers/${r.submissionId}`)}
                    className="bg-[#003366] text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
                  >
                    View Answers
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#002855] text-white text-sm font-light">
                <tr>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Exam</th>
                  <th className="p-3">Semester</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Marks</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="text-black text-md">
                {results.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-3">{r.subjectName}</td>
                    <td className="p-3">{r.examNo}</td>
                    <td className="p-3">{r.semester}</td>
                    <td className="p-3">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="p-3">{r.marks}</td>
                    <td className="p-3">
                      <button
                        onClick={() => navigate(`/view-answers/${r.submissionId}`)}
                        className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                      >
                        View Answers
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
