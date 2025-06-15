// src/pages/ViewAnswers.jsx
import React, { useState, useEffect }           from 'react';
import { useParams, useNavigate }               from 'react-router-dom';
import Sidebar                                  from '../components/SSidebar';
import SHeader                                  from '../components/SHeader';

export default function ViewAnswers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const { submissionId } = useParams();
  const navigate        = useNavigate();
  const token           = localStorage.getItem('token');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    fetch(`/api/submissions/${submissionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setDetail)
      .catch(console.error);
  }, [submissionId, token]);

  if (!detail) {
    return <div className="p-8 text-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <SHeader toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-[22px] md:text-4xl font-bold text-[#002855]">
                Answers for {detail.exam.examNo} - {detail.exam.subjectName}
              </h1>
              <p className="text-[16px] md:text-lg text-gray-600 mt-1">
                Review each question’s options and see correct vs. your choice
              </p>
            </div>
            {/* <button
              onClick={() => navigate(-1)}
              className="mt-4 md:mt-0 bg-white border border-gray-300 px-4 py-2 rounded-full shadow text-sm font-medium hover:bg-gray-100 transition"
            >
              ← Back
            </button> */}
          </div>

          {/* Mobile Cards */}
          <div className="space-y-6 [@media(min-width:486px)]:hidden">
            {detail.detailedAnswers.map((q, qi) => (
              <div
                key={qi}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <h2 className="font-semibold text-[#002855] mb-2">
                  Q{qi+1}: {q.questionText}
                </h2>
                <ul className="list-disc list-inside space-y-1">
                  {q.options.map((opt, idx) => {
                    const isCorrect = idx === q.correctIdx;
                    const isChosen  = idx === q.selectedIdx;
                    return (
                      <li
                        key={idx}
                        className={
                          isCorrect
                            ? 'text-green-600'
                            : isChosen
                              ? 'text-red-600'
                              : ''
                        }
                      >
                        {opt}{' '}
                        {isCorrect && '✔️'}
                        {(!isCorrect && isChosen) && '❌'}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-200">
                {detail.detailedAnswers.map((q, qi) => (
                  <React.Fragment key={qi}>
                    {/* Question row */}
                    <tr className="bg-[#f1f5f9]">
                      <td colSpan="2" className="p-3 font-semibold text-[#002855]">
                        Q{qi+1}: {q.questionText}
                      </td>
                    </tr>
                    {/* Option rows */}
                    {q.options.map((opt, idx) => {
                      const isCorrect = idx === q.correctIdx;
                      const isChosen  = idx === q.selectedIdx;
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-3">{opt}</td>
                          <td className={`p-3 ${isCorrect ? 'text-green-600' : isChosen ? 'text-red-600' : ''}`}>
                            {isCorrect
                              ? '✔️ Correct'
                              : isChosen
                                ? '❌ Your choice'
                                : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
