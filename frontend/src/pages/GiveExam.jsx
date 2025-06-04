// import React from 'react';
// import Sidebar from '../components/SSidebar';
// import StudentHeader from '../components/SHeader';

// const GiveExam = () => {
//   return (
//     <div className="flex min-h-screen bg-white">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="ml-64 flex-1 flex flex-col">
//         {/* Header */}
//         <StudentHeader />

//         {/* Content */}
//         <div className="flex-1 flex flex-col lg:flex-row">
//           {/* Exam Questions */}
//           <div className="flex-1 p-12">
//             {/* Question 1 */}
//             <div className="mb-10">
//               <h2 className="text-2xl font-extrabold mb-2">Question No. 01</h2>
//               <p className="mb-4 text-gray-800">Which of the following is a prime number?</p>
//               <div className="space-y-3">
//                 {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((option, idx) => (
//                   <label key={idx} className="flex items-center space-x-2 text-gray-700">
//                     <input type="radio" name="q1" className="accent-[#002855]" />
//                     <span>{option}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Question 2 */}
//             <div className="mb-10">
//               <h2 className="text-2xl font-extrabold mb-2">Question No. 02</h2>
//               <p className="mb-4 text-gray-800">What is the chemical symbol for water?</p>
//               <div className="space-y-3">
//                 {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((option, idx) => (
//                   <label key={idx} className="flex items-center space-x-2 text-gray-700">
//                     <input type="radio" name="q2" className="accent-[#002855]" />
//                     <span>{option}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Submit Button */}
//             <button className="mt-6 px-6 py-2 bg-[#002855] text-white font-medium rounded hover:bg-[#001f47] transition">
//               Submit
//             </button>
//           </div>

//           {/* Webcam + Timer */}
//           <div className="w-full lg:w-[300px] flex flex-col items-center justify-start p-6">
//             <div className="bg-black w-[250px] h-[150px] mb-6 rounded-md shadow-md"></div>
//             <div className="text-3xl font-bold text-[#000000]">10 : 00</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GiveExam;


// src/pages/GiveExam.jsx
import React, { useState } from 'react';
import Sidebar from '../components/SSidebar';
import StudentHeader from '../components/SHeader';

export default function GiveExam() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  return (
    <div className="min-h-screen flex bg-white overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <StudentHeader toggleSidebar={toggleSidebar} />

        {/* camera on top for mobile, on right for desktop */}
        <div className="flex-1 flex flex-col lg:flex-row-reverse">
          {/* Camera + Timer */}
          <div className="w-full lg:w-[300px] flex flex-col items-center justify-start p-6">
            <div className="bg-black w-full h-[150px] mb-4 rounded-md shadow-md" />
            <div className="text-3xl font-bold text-[#000000]">10:00</div>
          </div>

          {/* Exam Questions */}
          <div className="flex-1 p-6 lg:p-12">
            <div className="mb-10">
              <h2 className="text-2xl font-extrabold mb-2">Question No. 01</h2>
              <p className="mb-4 text-gray-800">
                Which of the following is a prime number?
              </p>
              <div className="space-y-3">
                {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((opt, i) => (
                  <label key={i} className="flex items-center space-x-2 text-gray-700">
                    <input type="radio" name="q1" className="accent-[#002855]" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-10">
              <h2 className="text-2xl font-extrabold mb-2">Question No. 02</h2>
              <p className="mb-4 text-gray-800">
                What is the chemical symbol for water?
              </p>
              <div className="space-y-3">
                {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((opt, i) => (
                  <label key={i} className="flex items-center space-x-2 text-gray-700">
                    <input type="radio" name="q2" className="accent-[#002855]" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="mt-4 px-6 py-2 bg-[#002855] text-white font-medium rounded hover:bg-[#001f47] transition">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
