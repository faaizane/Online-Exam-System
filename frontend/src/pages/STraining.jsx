import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StudentHeader from "../components/SHeader";
import Sidebar from "../components/SSidebar";
import StudentTour from "../components/StudentTour";

const STraining = () => {
  const trainingId = 'practice';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const navigate = useNavigate();
  const [flagged, setFlagged] = useState(false);

  const [step, setStep] = useState(0);
  const rulesRef = useRef(null);
  const testButtonRef = useRef(null);

  const checkCheating = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      console.log('🎓 Checking practice session cheat status...');
      const res = await axios.get(`/api/cheats/me?exam=${trainingId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('🎓 Practice cheat check result:', res.data);
      if (res.data.cheated && !flagged) {
        setFlagged(true);
        alert('⚠️ Training violation detected. Please follow the guidelines!');
      }
    } catch (err) {
      console.error('❌ Training cheat check failed', err);
    }
  }, [trainingId, flagged]);

  useEffect(() => {
    const iv = setInterval(checkCheating, 1000);
    return () => clearInterval(iv);
  }, [checkCheating]);

  useEffect(() => {
    const completed = sessionStorage.getItem("studentTourComplete");
    if (!completed) {
      setTimeout(() => setStep(2), 500);
    }
  }, []);

  const handleStep2Done = () => {
    setStep(3);
  };

  const handleStep3Done = () => {
    setStep(0);
    sessionStorage.setItem("studentTourComplete", "true");
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64 relative">
        <StudentHeader toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 [@media(min-width:1100px)]:px-16 py-4 md:py-8 overflow-y-auto">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">🎓 Exam Training & Guidelines</h1>

          {/* Camera Preview Section */}
          <div className="bg-white rounded-2xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">📸 Camera Setup Preview</h2>
            <p className="text-gray-600 mb-4">
              This is how your face should appear during the exam. Make sure you're in a well-lit room, and your full face is clearly visible.
            </p>
            <div className="flex gap-4 flex-wrap">
              <div className="border rounded-xl overflow-hidden shadow-inner w-72 h-48">
                <img
                  src="../../public/camera1.jpeg"
                  alt="Camera preview 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="border rounded-xl overflow-hidden shadow-inner w-72 h-48">
                <img
                  src="../../public/camera2.jpeg"
                  alt="Camera preview 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="border rounded-xl overflow-hidden shadow-inner w-72 h-48">
                <img
                  src="../../public/camera3.jpeg"
                  alt="Camera preview 3"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Rules Section */}
          <div ref={rulesRef} className="bg-white rounded-2xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">⚠️ Important Exam Rules</h2>
            <ul className="list-disc ml-6 text-gray-600 space-y-2 mt-2">
              <li>Keep your face clearly visible at all times.</li>
              <li>Do not look away from the screen during the exam.</li>
              <li>Mobile phones and external help are strictly prohibited.</li>
              <li>Make sure you are in a quiet, distraction-free environment.</li>
              <li>Do not leave the screen or cover the camera.</li>
              <li>Only one person should be visible in the camera view.</li>
            </ul>
          </div>

          {/* Practice Session */}
          <div className="bg-white rounded-2xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">🧪 Practice Session</h2>
            <p className="text-gray-600 mb-4">
              You can try a dummy question to see how the exam screen will look. This is only for practice.
            </p>
            <div ref={testButtonRef}>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition"
                onClick={async () => {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    stream.getTracks().forEach(t => t.stop());

                    const token = sessionStorage.getItem('token') || '';
                    const url = `${window.location.origin}/give-exam/practice?tk=${encodeURIComponent(token)}`;
                    const features = [
                      `left=0`,
                      `top=0`,
                      `width=${screen.availWidth}`,
                      `height=${screen.availHeight}`,
                      `fullscreen=yes`,
                      `toolbar=no`,
                      `menubar=no`,
                      `location=no`,
                      `status=no`,
                      `scrollbars=no`,
                      `resizable=no`
                    ].join(',');
                    const win = window.open(url, '_blank', features);
                    if (win) {
                      win.moveTo(0, 0);
                      win.resizeTo(screen.availWidth, screen.availHeight);
                      win.focus();
                    }
                    handleStep3Done();
                  } catch {
                    alert('⚠️ Please enable your camera to start the practice session.');
                  }
                }}
              >
                Start Practice Session
              </button>
            </div>
          </div>

          {/* Agreement */}
          <div className="text-center">
            <button
              className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-green-700 transition"
              onClick={() => {
                alert("Thank you! You may now begin your actual exam.");
                navigate("/sdashboard");
              }}
            >
              ✅ I Understand & Agree
            </button>
          </div>
        </div>

        {/* Tooltips */}
        <StudentTour
          visible={step === 2}
          message="Step 2: Please carefully read all the exam rules before proceeding."
          targetRef={rulesRef}
          onClose={handleStep2Done}
          showButton
        />
        <StudentTour
          visible={step === 3}
          message="Step 3: Click here to start your training test. This is just a practice session."
          targetRef={testButtonRef}
          onClose={handleStep3Done}
        />
      </div>
    </div>
  );
};

export default STraining;
