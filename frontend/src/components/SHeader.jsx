// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// export default function SHeader({ toggleSidebar }) {
//   const [user, setUser] = useState({ name: '', email: '' });
//   const [showNotice, setShowNotice] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) return navigate('/slogin');

//     (async () => {
//       try {
//         const res = await fetch('/api/auth/me', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) throw new Error();
//         const { user } = await res.json();
//         if (user.role !== 'student') throw new Error();
//         setUser({ name: user.name, email: user.email });

//         // 🔥 Check if noticeSeen exists, if not show popup
//         const noticeSeen = localStorage.getItem('noticeSeen');
//         if (!noticeSeen) {
//           setShowNotice(true);
//         }
//       } catch {
//         localStorage.clear();
//         navigate('/slogin');
//       }
//     })();
//   }, [navigate]);

//   // 🔥 Handle Close Notice
//   const handleCloseNotice = () => {
//     setShowNotice(false);
//     localStorage.setItem('noticeSeen', 'true');
//   };

//   return (
//     <>
//       <div className="w-full bg-[#B0C4DE] h-[80px] flex items-center px-4 shadow-sm relative">

//         {/* ☰ Hamburger */}
//         <button
//           className="mr-4 [@media(min-width:845px)]:hidden"
//           onClick={toggleSidebar}
//         >
//           <i className="fa-solid fa-bars text-2xl"></i>
//         </button>

//         {/* 🔔 Notice */}
//         <div
//           onClick={() => setShowNotice(true)}
//           className="flex items-center gap-1 cursor-pointer 
//                      [@media(max-width:800px)]:order-2"
//           title="View Notice"
//         >
//           <div className="bg-[#f3dede] rounded-full w-9 h-9 flex items-center justify-center 
//                           shadow-md hover:shadow-xl transition-shadow duration-500">
//             <i className="fa-solid fa-bell 
//                           text-[20px] [@media(max-width:500px)]:text-[17px] 
//                           text-[#d32f2f]"></i>
//           </div>

//           {/* Notice text hidden on mobile */}
//           <span className="text-sm font-semibold text-[#002855] 
//                             [@media(max-width:500px)]:hidden">
//             Notice!
//           </span>
//         </div>

//         <div className="flex-1" />

//         {/* 👤 User Info (Hidden on Mobile) */}
//         <div className="text-right [@media(max-width:500px)]:hidden">
//           <h4 className="font-semibold text-lg">
//             {user.name || 'Loading...'}
//           </h4>
//           <p className="text-sm text-gray-600">
//             {user.email || ''}
//           </p>
//         </div>

//         {/* 👤 Profile Image */}
//         <Link to="/student-profile" className="order-2">
//           <img
//             src="/profile.png"
//             alt="Profile"
//             className="w-11 h-11 rounded-full ml-4"
//           />
//         </Link>
//       </div>

//       {/* 🔥 Full Screen Notice Popup */}
//       {showNotice && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] z-50">
//           <div className="bg-white w-[90%] max-w-[550px] rounded-xl p-6 shadow-2xl">
//             <h2 className="text-2xl font-bold mb-4 text-[#002855] flex items-center gap-2">
//               <span>📢</span> Important Instructions
//             </h2>
//             <div className="text-gray-700 mb-6 leading-relaxed space-y-3 text-[15px]">
//               <p>➤ Please maintain a <b>stable internet connection</b> throughout the exam.</p>
//               <p>
//                 ➤ <b>Do not refresh, close, minimize, switch tabs, or open other applications during the exam.</b><br />
//                 Any such action will be considered a violation and will result in the <b>automatic submission of your exam.</b>
//               </p>
//               <p>
//                 ➤ <b>Your camera is mandatory for the exam.</b><br />
//                 • Kindly <b>allow camera access</b>, otherwise the exam <b>will not start.</b><br />
//                 • The system uses <b>face detection</b> and <b>motion tracking</b>.<br />
//                 • Actions like <b>looking around frequently, turning your head, using mobile devices, or interacting with others</b> will be treated as <b>cheating</b>.<br />
//                 • In such cases, your exam will be <b>automatically submitted</b> along with the <b>cheating evidence clip</b> sent to your instructor.
//               </p>
//               <p>➤ Any form of <b>suspicious activity may lead to disqualification.</b></p>
//               <p>
//                 ➤ For assistance, contact: <b>exam@uetpeshawar.edu.pk</b>
//               </p>
//             </div>
//             <div className="flex justify-end">
//               <button
//                 onClick={handleCloseNotice}
//                 className="bg-[#002855] hover:bg-[#003366] text-white px-5 py-2 rounded"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }





// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// export default function SHeader({ toggleSidebar }) {
//   const [user, setUser] = useState({ name: '', email: '' });
//   const [showNotice, setShowNotice] = useState(false);
//   const navigate = useNavigate();

//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) return navigate('/slogin');

//     (async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) throw new Error();
//         const { user } = await res.json();
//         if (user.role !== 'student') throw new Error();
//         setUser({ name: user.name, email: user.email });

//         const noticeSeen = localStorage.getItem('noticeSeen');
//         if (!noticeSeen) {
//           setShowNotice(true);
//         }
//       } catch {
//         localStorage.clear();
//         navigate('/slogin');
//       }
//     })();
//   }, [navigate, API_BASE_URL]);

//   const handleCloseNotice = () => {
//     setShowNotice(false);
//     localStorage.setItem('noticeSeen', 'true');
//   };

//   return (
//     <>
//       <div className="w-full bg-[#B0C4DE] h-[80px] flex items-center px-4 shadow-sm relative">

//         <button
//           className="mr-4 [@media(min-width:845px)]:hidden"
//           onClick={toggleSidebar}
//         >
//           <i className="fa-solid fa-bars text-2xl"></i>
//         </button>

//         <div
//           onClick={() => setShowNotice(true)}
//           className="flex items-center gap-1 cursor-pointer 
//                      [@media(max-width:800px)]:order-2"
//           title="View Notice"
//         >
//           <div className="bg-[#f3dede] rounded-full w-9 h-9 flex items-center justify-center 
//                           shadow-md hover:shadow-xl transition-shadow duration-500">
//             <i className="fa-solid fa-bell 
//                           text-[20px] [@media(max-width:500px)]:text-[17px] 
//                           text-[#d32f2f]"></i>
//           </div>

//           <span className="text-sm font-semibold text-[#002855] 
//                             [@media(max-width:500px)]:hidden">
//             Notice!
//           </span>
//         </div>

//         <div className="flex-1" />

//         <div className="text-right [@media(max-width:500px)]:hidden">
//           <h4 className="font-semibold text-lg">
//             {user.name || 'Loading...'}
//           </h4>
//           <p className="text-sm text-gray-600">
//             {user.email || ''}
//           </p>
//         </div>

//         <Link to="/student-profile" className="order-2">
//           <img
//             src="/profile.png"
//             alt="Profile"
//             className="w-11 h-11 rounded-full ml-4"
//           />
//         </Link>
//       </div>

//       {showNotice && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] z-50">
//           <div className="bg-white w-[90%] max-w-[550px] rounded-xl p-6 shadow-2xl">
//             <h2 className="text-2xl font-bold mb-4 text-[#002855] flex items-center gap-2">
//               <span>📢</span> Important Instructions
//             </h2>
//             <div className="text-gray-700 mb-6 leading-relaxed space-y-3 text-[15px]">
//               <p>➤ Please maintain a <b>stable internet connection</b> throughout the exam.</p>
//               <p>
//                 ➤ <b>Do not refresh, close, minimize, switch tabs, or open other applications during the exam.</b><br />
//                 Any such action will be considered a violation and will result in the <b>automatic submission of your exam.</b>
//               </p>
//               <p>
//                 ➤ <b>Your camera is mandatory for the exam.</b><br />
//                 • Kindly <b>allow camera access</b>, otherwise the exam <b>will not start.</b><br />
//                 • The system uses <b>face detection</b> and <b>motion tracking</b>.<br />
//                 • Actions like <b>looking around frequently, turning your head, using mobile devices, or interacting with others</b> will be treated as <b>cheating</b>.<br />
//                 • In such cases, your exam will be <b>automatically submitted</b> along with the <b>cheating evidence clip</b> sent to your instructor.
//               </p>
//               <p>➤ Any form of <b>suspicious activity may lead to disqualification.</b></p>
//               <p>
//                 ➤ For assistance, contact: <b>exam@uetpeshawar.edu.pk</b>
//               </p>
//             </div>
//             <div className="flex justify-end">
//               <button
//                 onClick={handleCloseNotice}
//                 className="bg-[#002855] hover:bg-[#003366] text-white px-5 py-2 rounded"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }








// src/components/SHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SHeader({ toggleSidebar }) {
  const [user, setUser] = useState({ name: '', email: '' });
  const [showNotice, setShowNotice] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
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

        const noticeSeen = localStorage.getItem('noticeSeen');
        if (!noticeSeen) {
          setShowNotice(true);
        }
      } catch {
        localStorage.clear();
        navigate('/slogin');
      }
    })();
  }, [navigate, API_BASE_URL]);

  const handleCloseNotice = () => {
    setShowNotice(false);
    localStorage.setItem('noticeSeen', 'true');
  };

  return (
    <>
      <div className="w-full bg-[#B0C4DE] h-[80px] flex items-center px-4 shadow-sm relative">
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] z-50">
          <div className="bg-white w-[90%] max-w-[550px] rounded-xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-[#002855] flex items-center gap-2">
              <span>📢</span> Important Instructions
            </h2>
            {/* ... notice content unchanged ... */}
            <div className="text-gray-700 mb-6 leading-relaxed space-y-3 text-[15px]">
              <p>➤ Please maintain a <b>stable internet connection</b> throughout the exam.</p>
              <p>
                ➤ <b>Do not refresh, close, minimize, switch tabs, or open other applications during the exam.</b><br />
                Any such action will be considered a violation and will result in the <b>automatic submission of your exam.</b>
              </p>
              <p>
                ➤ <b>Your camera is mandatory for the exam.</b><br />
                • Kindly <b>allow camera access</b>, otherwise the exam <b>will not start.</b><br />
                • The system uses <b>face detection</b> and <b>motion tracking</b>.<br />
                • Actions like <b>looking around frequently, turning your head, using mobile devices, or interacting with others</b> will be treated as <b>cheating</b>.<br />
                • In such cases, your exam will be <b>automatically submitted</b> along with the <b>cheating evidence clip</b> sent to your instructor.
              </p>
              <p>➤ Any form of <b>suspicious activity may lead to disqualification.</b></p>
              <p>
                ➤ For assistance, contact: <b>exam@uetpeshawar.edu.pk</b>
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCloseNotice}
                className="bg-[#002855] hover:bg-[#003366] text-white px-5 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
