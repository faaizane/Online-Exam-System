// src/pages/TeacherProfile.jsx

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import THeader from '../components/THeader';

export default function TeacherProfile() {
  const fileInputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const [profilePic, setProfilePic] = useState('/user-profile.png');
  const [user, setUser] = useState({
    name: '',
    email: '',
    department: '',
    designation: ''
  });

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
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
        setUser({
          name: user.name,
          email: user.email,
          department: user.department,
          designation: user.designation
        });
      } catch {
        sessionStorage.clear(); // sessionStorage for better security
        navigate('/tlogin');
      }
    })();
  }, [navigate, API_BASE_URL]);

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) setProfilePic(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* breakpoint changed from 845px to 945px */}
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <THeader toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855] mb-6">
            My Profile
          </h1>
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 lg:p-10 max-w-3xl mx-auto">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-[#002855] shadow"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 bg-[#002855] text-white px-2 py-1 text-xs rounded-full shadow hover:bg-blue-800"
                >
                  Change
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-black text-sm">
              <div>
                <label className="block font-medium text-gray-600 mb-1">Full Name</label>
                <div className="p-3 bg-gray-100 rounded-lg">{user.name}</div>
              </div>
              <div>
                <label className="block font-medium text-gray-600 mb-1">Designation</label>
                <div className="p-3 bg-gray-100 rounded-lg">{user.designation}</div>
              </div>
              <div>
                <label className="block font-medium text-gray-600 mb-1">Email</label>
                <div className="p-3 bg-gray-100 rounded-lg">{user.email}</div>
              </div>
              <div>
                <label className="block font-medium text-gray-600 mb-1">Department</label>
                <div className="p-3 bg-gray-100 rounded-lg">{user.department}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
