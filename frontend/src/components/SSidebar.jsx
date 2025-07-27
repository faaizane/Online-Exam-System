// src/components/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const step1Done = sessionStorage.getItem("tour-step1");
    const noticeDone = sessionStorage.getItem("student_guided_steps_done");

    // Show hint only if notice was shown & this is first time
    if (!step1Done && noticeDone === "true") {
      setShowHint(true);
    }
  }, []);

  const handleTrainingClick = (e) => {
    if (currentPath === "/student/training") {
      e.preventDefault();
      window.location.reload();
    }
    sessionStorage.setItem("tour-step1", "true");
    setShowHint(false);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/slogin");
  };

  const linkClass = (path, isTraining = false) =>
    `flex items-center relative px-4 md:px-8 py-2 md:py-4 text-sm md:text-base transition-colors ${
      currentPath === path
        ? 'bg-[#003366] text-white font-semibold'
        : 'text-white hover:bg-[#003366]'
    } ${isTraining && showHint ? 'ring-2 ring-yellow-400 rounded-md' : ''}`;

  // Helper for nav links: reload if already on page
  const handleLinkClick = (path, e) => {
    if (currentPath === path) {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 w-56 md:w-64 bg-[#002855] text-white z-40 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } [@media(min-width:945px)]:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col justify-between pb-4 md:pb-6`}
      style={{ height: '100vh' }}
    >
      {/* Top for mobile close */}
      <div>
        <div className="flex items-center justify-between px-2 py-2 [@media(min-width:945px)]:hidden">
          <span className="text-white font-semibold text-lg">Menu</span>
          <button onClick={toggleSidebar}>
            <i className="fa-solid fa-circle-xmark text-2xl"></i>
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mt-4 md:mt-10 mb-4 md:mb-12">
          <img
            src="/Logo-wbg.png"
            alt="UET Logo"
            className="mx-auto w-16 h-16 md:w-20 md:h-20"
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 md:gap-2 mt-2 md:mt-4 px-0 relative overflow-x-hidden">
          <Link
            to="/sdashboard"
            className={linkClass('/sdashboard')}
            onClick={(e) => handleLinkClick('/sdashboard', e)}
          >
            <i className="fa-solid fa-house mr-3"></i> Dashboard
          </Link>

          <Link
            to="/take-exam"
            className={linkClass('/take-exam')}
            onClick={(e) => handleLinkClick('/take-exam', e)}
          >
            <i className="fa-solid fa-pen mr-3"></i> Take Exam
          </Link>

          <Link
            to="/view-result"
            className={linkClass('/view-result')}
            onClick={(e) => handleLinkClick('/view-result', e)}
          >
            <i className="fa-solid fa-trophy mr-3"></i> View Result
          </Link>

          {/* Training link with inline hint */}
          <div className="relative">
            {showHint && (
              <div className="text-yellow-300 text-xs ml-6 mt-1 mb-[-6px]">
                🔰 Click here for training
              </div>
            )}
            <Link
              to="/student/training"
              className={linkClass('/student/training', true)}
              onClick={handleTrainingClick}
            >
              <i className="fa-solid fa-graduation-cap mr-3"></i> Training
            </Link>
          </div>

          <Link
            to="/student-profile"
            className={linkClass('/student-profile')}
            onClick={(e) => handleLinkClick('/student-profile', e)}
          >
            <i className="fa-solid fa-user-graduate mr-3"></i> Profile
          </Link>
        </nav>
      </div>

      {/* Bottom logout */}
      <div className="px-4 md:px-8 py-2 md:py-4">
        <button
          onClick={handleLogout}
          className={`${linkClass('/logout')} cursor-pointer`}
        >
          <i className="fa-solid fa-right-from-bracket mr-3"></i> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
