// // File: src/pages/AddSubject.jsx

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Sidebar from '../components/TSidebar';
// import Header from '../components/THeader';
// import axios from 'axios';

// export default function AddSubject() {
//   const navigate = useNavigate();

//   // ← Sidebar toggle state
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const toggleSidebar = () => setSidebarOpen(o => !o);

//   const [form, setForm] = useState({
//     name: '',
//     session: '',
//     year: '',
//     semester: ''
//   });
//   const [error, setError] = useState('');
//   const [subjects, setSubjects] = useState([]);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) return;
//     axios.get('/api/subjects', {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//     .then(res => setSubjects(res.data))
//     .catch(() => {});
//   }, []);

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setForm(f => ({ ...f, [name]: value }));
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     setError('');

//     const token = localStorage.getItem('token');
//     if (!token) {
//       setError('You must be logged in to add a subject.');
//       return;
//     }

//     // Normalize and check duplicates
//     const nameNorm = form.name.trim().toLowerCase();
//     const sessionNorm = form.session.trim().toLowerCase();
//     const yearInt = parseInt(form.year, 10);
//     const semInt = parseInt(form.semester, 10);

//     const duplicate = subjects.find(s =>
//       s.name.trim().toLowerCase() === nameNorm &&
//       s.session.trim().toLowerCase() === sessionNorm &&
//       s.year === yearInt &&
//       s.semester === semInt
//     );
//     if (duplicate) {
//       setError('This subject for the same year/session/semester already exists.');
//       return;
//     }

//     try {
//       await axios.post(
//         '/api/subjects',
//         {
//           name: form.name.trim(),
//           session: form.session.trim(),
//           year: yearInt,
//           semester: semInt
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );
//       navigate('/studentmanagement');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to create subject');
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
//       {/* ← pass real sidebarOpen & toggle */}
//       <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
//         <Header toggleSidebar={toggleSidebar} />

//         <div className="px-4 md:px-16 py-6">
//           <button
//             onClick={() => navigate('/studentmanagement')}
//             className="mb-4 text-sm text-[#002855] hover:underline"
//           >
//             ← Back
//           </button>
//           <h1 className="text-3xl font-bold text-[#002855] mb-6">
//             Add New Subject
//           </h1>

//           {error && <p className="text-red-600 mb-4">{error}</p>}

//           <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
//             <div>
//               <label className="block mb-1 font-medium">Subject Name</label>
//               <input
//                 name="name"
//                 value={form.name}
//                 onChange={handleChange}
//                 required
//                 className="w-full border px-3 py-2 rounded"
//               />
//             </div>

//             <div>
//               <label className="block mb-1 font-medium">Session</label>
//               <input
//                 name="session"
//                 value={form.session}
//                 onChange={handleChange}
//                 placeholder="e.g. Spring"
//                 required
//                 className="w-full border px-3 py-2 rounded"
//               />
//             </div>

//             <div>
//               <label className="block mb-1 font-medium">Year</label>
//               <input
//                 name="year"
//                 type="number"
//                 min="2000"
//                 max="2100"
//                 value={form.year}
//                 onChange={handleChange}
//                 placeholder="e.g. 2025"
//                 required
//                 className="w-full border px-3 py-2 rounded"
//               />
//             </div>

//             <div>
//               <label className="block mb-1 font-medium">Semester</label>
//               <input
//                 name="semester"
//                 type="number"
//                 min="1"
//                 max="12"
//                 value={form.semester}
//                 onChange={handleChange}
//                 required
//                 className="w-full border px-3 py-2 rounded"
//               />
//             </div>

//             <button
//               type="submit"
//               className="bg-[#002855] text-white px-4 py-2 rounded hover:bg-[#001f47] transition"
//             >
//               Save Subject
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }









// src/pages/AddSubject.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';
import axios from 'axios';

export default function AddSubject() {
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const [form, setForm] = useState({
    name: '',
    session: '',
    year: '',
    semester: ''
  });
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${API_BASE_URL}/api/subjects`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setSubjects(res.data))
      .catch(() => { });
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to add a subject.');
      return;
    }

    const nameNorm = form.name.trim().toLowerCase();
    const sessionNorm = form.session.trim().toLowerCase();
    const yearInt = parseInt(form.year, 10);
    const semInt = parseInt(form.semester, 10);

    const duplicate = subjects.find(s =>
      s.name.trim().toLowerCase() === nameNorm &&
      s.session.trim().toLowerCase() === sessionNorm &&
      s.year === yearInt &&
      s.semester === semInt
    );
    if (duplicate) {
      setError('This subject for the same year/session/semester already exists.');
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/subjects`,
        {
          name: form.name.trim(),
          session: form.session.trim(),
          year: yearInt,
          semester: semInt
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      navigate('/studentmanagement');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subject');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <div className="px-4 md:px-16 py-6">
          <button
            onClick={() => navigate('/studentmanagement')}
            className="mb-4 text-sm text-[#002855] hover:underline"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-[#002855] mb-6">
            Add New Subject
          </h1>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            <div>
              <label className="block mb-1 font-medium">Subject Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Session</label>
              <input
                name="session"
                value={form.session}
                onChange={handleChange}
                placeholder="e.g. Spring"
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Year</label>
              <input
                name="year"
                type="number"
                min="2000"
                max="2100"
                value={form.year}
                onChange={handleChange}
                placeholder="e.g. 2025"
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Semester</label>
              <input
                name="semester"
                type="number"
                min="1"
                max="12"
                value={form.semester}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <button
              type="submit"
              className="bg-[#002855] text-white px-4 py-2 rounded hover:bg-[#001f47] transition"
            >
              Save Subject
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
