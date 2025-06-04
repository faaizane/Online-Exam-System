// src/components/TSidebar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  const linkClass = (path) =>
    `flex items-center
     px-4 md:px-8
     py-2 md:py-4
     text-sm md:text-base
     transition-colors ${
       currentPath === path
         ? 'bg-[#003366] text-white font-semibold'
         : 'text-white hover:bg-[#003366]'
     }`;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/tlogin');
  };

  return (
    <div
      style={{ height: '100vh' }}
      className={`
        fixed inset-y-0 left-0
        w-48 md:w-64
        bg-[#002855] text-white z-40

        /* slide in/out below 845px */
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        [@media(min-width:845px)]:translate-x-0

        transition-transform duration-200 ease-in-out
        flex flex-col justify-between overflow-hidden pb-6
      `}
    >
      {/* Top: close button on <845px */}
      <div>
        <div className="flex items-center justify-between px-2 py-2 [@media(min-width:845px)]:hidden">
          <span className="text-white font-semibold text-lg">Menu</span>
          <button onClick={toggleSidebar}>
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-4 md:mb-12 mt-4 md:mt-10">
          <img
            src="/Logo-wbg.png"
            alt="UET Logo"
            className="mx-auto w-16 h-16 md:w-20 md:h-20"
          />
        </div>

        {/* Teacher Navigation links */}
        <nav className="flex flex-col gap-1 md:gap-2 mt-2 md:mt-4 px-0">
          <Link to="/tdashboard" className={linkClass('/tdashboard')}>
            <i className="fa-solid fa-house mr-3 text-lg md:text-base"></i>
            Dashboard
          </Link>
          <Link to="/studentmanagement" className={linkClass('/studentmanagement')}>
            <i className="fa-solid fa-user mr-3 text-lg md:text-base"></i>
            Student Management
          </Link>
          <Link to="/manageexams" className={linkClass('/manageexams')}>
            <i className="fa-solid fa-clipboard-check mr-3 text-lg md:text-base"></i>
            Manage Exams
          </Link>
          <Link to="/reviewcheating" className={linkClass('/reviewcheating')}>
            <i className="fa-solid fa-eye mr-3 text-lg md:text-base"></i>
            Review Cheating
          </Link>
          <Link to="/teacherprofile" className={linkClass('/teacherprofile')}>
            <i className="fa-solid fa-user-graduate mr-3 text-lg md:text-base"></i>
            Profile
          </Link>
        </nav>
      </div>

      {/* Bottom: logout always at bottom */}
      <div className="px-4 md:px-8 py-2 md:py-4">
        <button onClick={handleLogout} className={linkClass('/logout')}>
          <i className="fa-solid fa-right-from-bracket mr-3 text-lg md:text-base"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
