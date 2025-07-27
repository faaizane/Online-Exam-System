// src/components/THeader.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function THeader({ toggleSidebar }) {
  const [user, setUser] = React.useState({ name: '', email: '' });
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  React.useEffect(() => {
    const token = sessionStorage.getItem('token'); // sessionStorage for better security
    if (!token) return navigate('/tlogin');
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const { user } = await res.json();
        if (user.role !== 'teacher') throw new Error();
        setUser({ name: user.name, email: user.email });
      } catch {
        sessionStorage.clear(); // sessionStorage for better security
        navigate('/tlogin');
      }
    })();
  }, [navigate, API_BASE_URL]);

  return (
    <div className="w-full bg-[#B0C4DE] h-[80px] flex items-center px-4 shadow-sm">
      {/* ☰ Hamburger for small screens */}
      <button
        className="mr-4 [@media(min-width:945px)]:hidden"
        onClick={toggleSidebar}
      >
        <i className="fa-solid fa-bars text-2xl"></i>
      </button>

      <div className="flex-1" />

      {/* 👤 User Info (Hide on Mobile) */}
      <div className="text-right [@media(max-width:500px)]:hidden">
        <h4 className="font-semibold text-lg">
          {user.name || 'Loading...'}
        </h4>
        <p className="text-sm text-gray-600">
          {user.email || ''}
        </p>
      </div>

      {/* 👤 Profile Image */}
      <Link to="/teacherprofile" className="ml-4">
        <img
          src="/profile.png"
          alt="Profile"
          className="w-12 h-12 rounded-full cursor-pointer hover:opacity-90 transition"
        />
      </Link>
    </div>
  );
}
