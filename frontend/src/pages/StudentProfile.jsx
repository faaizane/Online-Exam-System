// src/pages/StudentProfile.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import SHeader from '../components/SHeader';

export default function StudentProfile() {
  const fileInputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const [profilePic, setProfilePic] = useState('/user-profile.png');
  const [user, setUser] = useState({
    name: '',
    email: '',
    department: '',
    semester: '',
    registrationNumber: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/slogin');
    (async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const { user } = await res.json();
        if (user.role !== 'student') throw new Error();
        setUser({
          name: user.name,
          email: user.email,
          department: user.department,
          semester: `${user.semester}th Semester`,
          registrationNumber: user.registrationNumber
        });
      } catch {
        localStorage.clear();
        navigate('/slogin');
      }
    })();
  }, [navigate]);

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) setProfilePic(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <SHeader toggleSidebar={toggleSidebar} />

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
                <label className="block font-medium text-gray-600 mb-1">Registration No</label>
                <div className="p-3 bg-gray-100 rounded-lg">{user.registrationNumber}</div>
              </div>
              <div>
                <label className="block font-medium text-gray-600 mb-1">Semester</label>
                <div className="p-3 bg-gray-100 rounded-lg">{user.semester}</div>
              </div>
              <div>
                <label className="block font-medium text-gray-600 mb-1">Email</label>
                <div className="p-3 bg-gray-100 rounded-lg">{user.email}</div>
              </div>
              <div className="sm:col-span-2">
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
