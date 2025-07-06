// src/components/SHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SHeader({ toggleSidebar }) {
  const [user, setUser] = useState({ name: '', email: '' });
  const [showNotice, setShowNotice] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = sessionStorage.getItem('token');  // sessionStorage for better security
    if (!token) return navigate('/slogin');

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const { user } = await res.json();
        if (user.role !== 'student') throw new Error();
        setUser({ name: user.name, email: user.email });

        const noticeSeen = sessionStorage.getItem('noticeSeen'); // sessionStorage for exam data
        if (!noticeSeen) {
          setShowNotice(true);
        }
      } catch {
       sessionStorage.clear(); // sessionStorage for better security
        navigate('/slogin');
      }
    })();
  }, [navigate, API_BASE_URL]);

  const handleCloseNotice = () => {
    setShowNotice(false);
    sessionStorage.setItem('noticeSeen', 'true'); // sessionStorage for exam data
  };

  return (
    <>
      <div className="w-full bg-[#B0C4DE] h-[80px] flex items-center px-2 md:px-4 [@media(min-width:1100px)]:px-16 shadow-sm relative">
        <button
          className="mr-4 [@media(min-width:945px)]:hidden"
          onClick={toggleSidebar}
        >
          <i className="fa-solid fa-bars text-2xl"></i>
        </button>

        <div
          onClick={() => setShowNotice(true)}
          className="flex items-center gap-1 cursor-pointer 
                     [@media(max-width:800px)]:order-2"
          title="View Notice"
        >
          <div className="bg-[#f3dede] rounded-full w-9 h-9 flex items-center justify-center 
                          shadow-md hover:shadow-xl transition-shadow duration-500">
            <i className="fa-solid fa-bell 
                          text-[20px] [@media(max-width:500px)]:text-[17px] 
                          text-[#d32f2f]"></i>
          </div>

          <span className="text-sm font-semibold text-[#002855] 
                            [@media(max-width:500px)]:hidden">
            Notice!
          </span>
        </div>

        <div className="flex-1" />

        <div className="text-right [@media(max-width:500px)]:hidden">
          <h4 className="font-semibold text-lg">
            {user.name || 'Loading...'}
          </h4>
          <p className="text-sm text-gray-600">
            {user.email || ''}
          </p>
        </div>

        <Link to="/student-profile" className="order-2">
          <img
            src="/profile.png"
            alt="Profile"
            className="w-11 h-11 rounded-full ml-4"
          />
        </Link>
      </div>

      {showNotice && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-[550px] rounded-xl shadow-2xl border border-gray-100">
            {/* Header */}
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-info-circle text-blue-600 text-lg"></i>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Exam Instructions</h2>
                </div>
                <button
                  onClick={handleCloseNotice}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <i className="fa-solid fa-times text-lg"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <p>Maintain a <strong>stable internet connection</strong> throughout the exam.</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <div>
                    <p><strong>Do not refresh, close, minimize, switch tabs, or open other applications</strong> during the exam.</p>
                    <p className="mt-1 text-red-600">Any violation will result in automatic submission.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <div>
                    <p><strong>Camera access is mandatory</strong> - the exam will not start without it.</p>
                    <p className="mt-1">The system monitors face detection and motion tracking.</p>
                    <p className="mt-1 text-amber-600">Suspicious behavior will trigger automatic submission with evidence.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  </div>
                  <p>Any form of suspicious activity may lead to <strong>disqualification</strong>.</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <p>
                    For assistance, contact: 
                    <a href="mailto:exam@uetpeshawar.edu.pk" className="text-blue-600 hover:underline ml-1 font-medium">
                      exam@uetpeshawar.edu.pk
                    </a>
                  </p>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <p className="text-xs text-gray-500">Please read all instructions carefully before proceeding.</p>
                <button
                  onClick={handleCloseNotice}
                  className="bg-[#002855] hover:bg-[#003366] text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-medium transition-colors text-sm w-fit self-end md:self-auto"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
