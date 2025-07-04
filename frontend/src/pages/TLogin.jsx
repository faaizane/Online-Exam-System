import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TLogin() {
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    if (token && role === 'teacher') {
      navigate('/tdashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: teacherId, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      if (data.role !== 'teacher') throw new Error('Not a teacher account');

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', data.role);

      navigate('/tdashboard');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* 🔵 Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-[1.5px]"
        style={{ backgroundImage: "url('/bg-image.jpg')" }}
      />

      {/* 🔵 Login Container */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                      w-[90%] max-w-[550px] h-[530px] rounded-[10px] overflow-hidden
                      shadow-[0_4px_20px_rgba(0,0,0,0.3)] bg-white z-10">
        {/* 🔵 Top Section */}
        <div className="bg-[#17046d] h-[204px] text-center p-5 text-white relative">
          <h2 className="text-[19px] pt-[10px] mb-[5px]">
            UNIVERSITY OF ENGINEERING AND TECHNOLOGY PESHAWAR
          </h2>
          <h3 className="text-[18px] pt-[7px] mb-3 text-[#bbbbbb]">
            Effortless Exam Management for Teachers
          </h3>
          <div
            className="
              absolute
              -bottom-[60px]
              left-1/2 transform -translate-x-1/2
              w-[80px] h-[80px]
              sm:w-[100px] sm:h-[100px]
              md:w-[145px] md:h-[145px]
              rounded-full bg-white border
              flex items-center justify-center overflow-hidden
            "
          >
            <img src="/LOGO.png" alt="Logo" className="w-[90%] h-auto" />
          </div>
        </div>

        {/* 🔵 Form Section */}
        <form onSubmit={handleSubmit} className="pt-[70px] px-20 pb-[30px] bg-white text-center">
          <div className="mb-2 text-left">
            <label htmlFor="teacherid" className="block text-[13.5px] font-semibold mb-1">
              Teacher ID
            </label>
            <input
              id="teacherid"
              type="text"
              value={teacherId}
              onChange={e => setTeacherId(e.target.value)}
              placeholder="Teacher ID"
              required
              className="w-full p-2 border-[2px] border-[#ccc] rounded-[5px] text-[13px]"
            />
          </div>
          <div className="mb-5 text-left">
            <label htmlFor="password" className="block text-[13.5px] font-semibold mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-2 border-[2px] border-[#ccc] rounded-[5px] text-[13px]"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-[#0e008f] text-white rounded-[5px] text-[16px]
                       cursor-pointer hover:bg-[#3f29ff]"
          >
            Login
          </button>

          <div className="mt-3">
            <span className="text-[13px] text-[#555]">
              Are you a student?{' '}
              <button
                type="button"
                onClick={() => navigate('/slogin')}
                className="text-[#0073e6] hover:underline"
              >
                Login here
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
