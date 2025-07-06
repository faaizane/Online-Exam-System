// File: src/pages/ViewAnswers.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import SHeader from '../components/SHeader';

export default function ViewAnswers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const { submissionId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  const [detail, setDetail] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  /* Fetch once */
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/submissions/${submissionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setDetail)
      .catch(console.error);
  }, [submissionId, token, API_BASE_URL]);

  if (!detail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <SHeader toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 [@media(min-width:1100px)]:px-16 py-4 md:py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-[22px] md:text-4xl font-bold text-[#002855]">
                {detail.exam.subjectName} – {detail.exam.examNo}
              </h1>
              <p className="text-[16px] md:text-lg text-gray-600 mt-1">
                Review your selections versus the correct answers
              </p>
            </div>
          </div>

          {/* ───────── Mobile / Tablet: Card view ───────── */}
          <div className="space-y-6 [@media(min-width:486px)]:hidden">
            {detail.detailedAnswers.map((q, qi) => {
              const isUnattempted = q.selectedIdx === null || q.selectedIdx === undefined;
              
              return (
                <div key={qi} className="bg-white rounded-xl shadow-md p-4">
                  <h2 className="font-semibold text-[#002855] mb-3">
                    Q{qi + 1}. {q.questionText}
                    {isUnattempted && (
                      <span className="ml-2 text-yellow-600 font-medium text-sm">
                        (Unattempted)
                      </span>
                    )}
                  </h2>

                  {q.options.map((opt, idx) => {
                    const isCorrect = idx === q.correctIdx;
                    const isChosen = idx === q.selectedIdx;
                    const base =
                      'rounded-lg px-3 py-2 text-sm flex items-start';
                    const style = isCorrect
                      ? 'bg-green-50 text-green-800'
                      : isChosen
                      ? 'bg-red-50 text-red-800'
                      : 'bg-gray-100 text-gray-800';

                    return (
                      <div key={idx} className={`${base} ${style} mt-2`}>
                        <span>{opt}</span>
                        {isCorrect && (
                          <span className="ml-auto font-semibold">✔ Correct</span>
                        )}
                        {!isCorrect && isChosen && (
                          <span className="ml-auto font-semibold">
                            ✖ Your choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ───────── Desktop: Table view ───────── */}
          <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-200 text-sm">
                {detail.detailedAnswers.map((q, qi) => {
                  const isUnattempted = q.selectedIdx === null || q.selectedIdx === undefined;
                  
                  return (
                    <React.Fragment key={qi}>
                      {/* Question row */}
                      <tr className="bg-[#e7edf6]">
                        <td colSpan="2" className="p-3 font-semibold text-[#002855]">
                          Q{qi + 1}. {q.questionText}
                          {isUnattempted && (
                            <span className="ml-2 text-yellow-600 font-medium text-sm">
                              (Unattempted)
                            </span>
                          )}
                        </td>
                      </tr>
                      {/* Option rows */}
                      {q.options.map((opt, idx) => {
                        const isCorrect = idx === q.correctIdx;
                        const isChosen = idx === q.selectedIdx;
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-3">{opt}</td>
                            <td
                              className={`p-3 ${
                                isCorrect
                                  ? 'text-green-600'
                                  : isChosen
                                  ? 'text-red-600'
                                  : ''
                              }`}
                            >
                              {isCorrect
                                ? '✔ Correct'
                                : isChosen
                                ? '✖ Your choice'
                                : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
