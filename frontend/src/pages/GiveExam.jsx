
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BiLoaderAlt } from 'react-icons/bi';

export default function GiveExam() {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const submittingRef = useRef(false);
  const frameProcessingRef = useRef(false);

  const [cameraStatus, setCameraStatus] = useState('loading'); // 'loading', 'active', 'inactive', 'error'
  const [aiServerStatus, setAiServerStatus] = useState('checking'); // 'checking', 'active', 'inactive'
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const YOLO_BACKEND_URL = import.meta.env.VITE_YOLO_BACKEND_URL || 'http://127.0.0.1:5001';

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setCameraStatus('loading');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraStatus('active');
        
        // Start frame processing
        startFrameProcessing();
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
      setCameraStatus('error');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped:', track.kind);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Force video element to release resources
    }
    setCameraStatus('inactive');
    frameProcessingRef.current = false;
  }, []);

  // Check AI server status
  const checkAiServerStatus = useCallback(async () => {
    try {
      const response = await fetch(`${YOLO_BACKEND_URL}/status`);
      if (response.ok) {
        setAiServerStatus('active');
      } else {
        setAiServerStatus('inactive');
      }
    } catch (error) {
      console.error('AI server status check failed:', error);
      setAiServerStatus('inactive');
    }
  }, [YOLO_BACKEND_URL]);

  // Process frame for AI detection
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || frameProcessingRef.current === false) return;
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      const token = sessionStorage.getItem('token');
      
      const response = await fetch(`${YOLO_BACKEND_URL}/process_frame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frame: frameData,
          exam: examId,
          token: `Bearer ${token}`
        })
      });
      
      if (!response.ok) {
        console.error('Frame processing failed:', response.status);
      } else {
        // Check if cheat was detected in the response
        const result = await response.json();
        if (result.status === 'cheat_detected') {
          console.log('🚨 IMMEDIATE CHEAT DETECTED:', result.reason);
          handleSubmit();
          return;
        }
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    }
  }, [examId, YOLO_BACKEND_URL]);

  // Start frame processing loop
  const startFrameProcessing = useCallback(() => {
    frameProcessingRef.current = true;
    
    const processLoop = () => {
      if (frameProcessingRef.current && !submitted && !alreadySubmitted) {
        processFrame();
        setTimeout(processLoop, 1000); // Process frame every second
      }
    };
    
    processLoop();
  }, [processFrame, submitted, alreadySubmitted]);

  // Cleanup student data from AI server
  const cleanupAiServer = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`${YOLO_BACKEND_URL}/cleanup_student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: `Bearer ${token}`
        })
      });
    } catch (error) {
      console.error('AI server cleanup failed:', error);
    }
  }, [YOLO_BACKEND_URL]);

  const beforeUnloadHandler = useCallback(e => {
    if (!submitted && !alreadySubmitted && exam) {
      e.preventDefault();
      e.returnValue = '';
      
      // Stop camera and cleanup
      stopCamera();
      cleanupAiServer();
      
      // Immediate localStorage update for cross-window communication
      const storageKey = `submission_${examId}`;
      const tempSubmissionId = `temp_${Date.now()}_${examId}`;
      
      // Set temporary submission to trigger button change immediately
      localStorage.setItem(storageKey, tempSubmissionId);
      sessionStorage.setItem(storageKey, tempSubmissionId);
      
      // Send notification to parent window immediately
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.dispatchEvent(new CustomEvent('examSubmitted', {
            detail: { type: 'examSubmitted', examId: examId, submissionId: tempSubmissionId }
          }));
        }
      } catch (error) {
        console.log('Could not notify parent window on beforeunload:', error);
      }
    }
  }, [submitted, alreadySubmitted, exam, examId, stopCamera, cleanupAiServer]);

  const handleSubmit = useCallback(async (isWindowClosing = false) => {
    console.log('🔥 HandleSubmit called:', { isWindowClosing, submitted, alreadySubmitted, examExists: !!exam });
    
    if (submittingRef.current || submitted || alreadySubmitted || !exam) {
      console.log('❌ Submit blocked:', { 
        submittingRef: submittingRef.current, 
        submitted, 
        alreadySubmitted, 
        examExists: !!exam 
      });
      return;
    }
    
    console.log('✅ Submit proceeding...');
    submittingRef.current = true;
    setSubmitted(true);

    // Stop camera and frame processing immediately
    frameProcessingRef.current = false;
    stopCamera();
    
    // Force additional cleanup
    setTimeout(() => {
      stopCamera();
    }, 100);

    // Remove all anti-cheating event listeners once submitted
    window.removeEventListener('beforeunload', beforeUnloadHandler);
    document.removeEventListener('visibilitychange', onTabChange);
    // Remove blur listener if it exists
    try {
      window.removeEventListener('blur', handleBlur);
    } catch (e) {
      console.log('Blur listener removal failed:', e);
    }
    window.onpopstate = null;

    const arr = exam.questions.map((_, i) => answers[i] ?? null);
    const raw = exam.questions.reduce(
      (sum, q, i) => sum + (arr[i] === q.correctAnswerIndex ? 1 : 0),
      0
    );
    setScore(raw);

    const token = sessionStorage.getItem('token');
    const submissionData = JSON.stringify({ answers: arr, score: raw });
    const storageKey = `submission_${examId}`;
    
    try {
      if (isWindowClosing && navigator.sendBeacon) {
        // Use sendBeacon for reliable submission during window close
        const formData = new FormData();
        formData.append('data', submissionData);
        formData.append('token', token);
        
        navigator.sendBeacon(`${API_URL}/api/exams/${examId}/submit`, formData);
        
        // Set storage immediately for cross-window communication
        const tempSubmissionId = `beacon_${Date.now()}_${examId}`;
        localStorage.setItem(storageKey, tempSubmissionId);
        sessionStorage.setItem(storageKey, tempSubmissionId);
      } else {
        // Normal fetch for regular submissions
        console.log('📤 Sending submission to API...');
        const res = await fetch(`${API_URL}/api/exams/${examId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: submissionData
        });
        
        console.log('📥 API Response status:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('✅ Submission successful:', data);
          sessionStorage.setItem(storageKey, data.submissionId);
          localStorage.setItem(storageKey, data.submissionId);
          
          // Dispatch custom event to notify parent window
          try {
            if (window.opener && !window.opener.closed) {
              window.opener.dispatchEvent(new CustomEvent('examSubmitted', {
                detail: { type: 'examSubmitted', examId: examId, submissionId: data.submissionId }
              }));
            }
          } catch (e) {
            console.log('Could not notify parent window:', e);
          }
        } else {
          console.error('❌ API submission failed with status:', res.status);
          const errorText = await res.text();
          console.error('Error details:', errorText);
        }
      }
    } catch (e) {
      console.error('Submit failed', e);
      // Even if submission fails, mark as submitted to prevent retries
      const fallbackSubmissionId = `failed_${Date.now()}_${examId}`;
      localStorage.setItem(storageKey, fallbackSubmissionId);
      sessionStorage.setItem(storageKey, fallbackSubmissionId);
    }
    
    // Cleanup calls
    fetch(`${API_URL}/api/exams/${examId}/progress`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
    
    // Cleanup AI server
    cleanupAiServer();
  }, [
    submitted,
    alreadySubmitted,
    exam,
    answers,
    examId,
    API_URL,
    beforeUnloadHandler,
    stopCamera,
    cleanupAiServer
  ]);

  const onTabChange = () => {
    if (!submitted && !alreadySubmitted && document.hidden) {
      handleSubmit();
    }
  };
  
  // Initialize camera and AI server when exam starts
  useEffect(() => {
    if (exam && !submitted && !alreadySubmitted) {
      checkAiServerStatus();
      initializeCamera();
    } else if (submitted || alreadySubmitted) {
      // Immediately stop camera if exam is submitted
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [exam, submitted, alreadySubmitted, initializeCamera, stopCamera, checkAiServerStatus]);

  // Dummy handleBlur for useCallback dependency, real one is inside useEffect
  const handleBlur = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);


  useEffect(() => {
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => window.removeEventListener('beforeunload', beforeUnloadHandler);
  }, [beforeUnloadHandler]);

  useEffect(() => {
    const onUnload = () => {
      if (!submitted && !alreadySubmitted && exam) {
        // Call handleSubmit with window closing flag for sendBeacon
        handleSubmit(true);
      }
    };
    window.addEventListener('unload', onUnload);
    return () => window.removeEventListener('unload', onUnload);
  }, [submitted, alreadySubmitted, handleSubmit, exam]);

  useEffect(() => {
    if (!exam || submitted || alreadySubmitted) return;
    document.addEventListener('visibilitychange', onTabChange);
    return () => {
      document.removeEventListener('visibilitychange', onTabChange);
    };
  }, [exam, submitted, alreadySubmitted, handleSubmit]);

  // START: UPDATED CODE FOR MINIMIZE/FOCUS CHANGE AND STRICT RESIZE
  useEffect(() => {
    if (submitted || alreadySubmitted || !exam) return;

    // Store initial window dimensions
    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;
    const initialOuterWidth = window.outerWidth;
    const initialOuterHeight = window.outerHeight;
    
    // Check if device is mobile/tablet
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768;

    console.log(`Initial window size: ${initialWidth}x${initialHeight}, Mobile: ${isMobile}`);

    // Blur event handler (minimize/focus change/app switch)
    const blurEventHandler = () => {
      console.log('Window blur detected (minimize/focus change/app switch), auto-submitting...');
      handleSubmit();
    };

    // Strict window resize detection - NO TOLERANCE for desktop
    const resizeEventHandler = () => {
      // Skip ALL resize detection on mobile devices
      if (isMobile) {
        console.log('Mobile device detected - skipping resize detection');
        return;
      }

      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const currentOuterWidth = window.outerWidth;
      const currentOuterHeight = window.outerHeight;

      // Desktop: ZERO tolerance - even 1px change triggers submit
      const widthChanged = currentWidth !== initialWidth;
      const heightChanged = currentHeight !== initialHeight;
      const outerWidthChanged = currentOuterWidth !== initialOuterWidth;
      const outerHeightChanged = currentOuterHeight !== initialOuterHeight;
      
      if (widthChanged || heightChanged || outerWidthChanged || outerHeightChanged) {
        console.log(`Desktop window resize detected: ${initialWidth}x${initialHeight} → ${currentWidth}x${currentHeight}, auto-submitting...`);
        handleSubmit();
      }
    };

    // Fullscreen change detection (desktop only)
    const fullscreenChangeHandler = () => {
      if (isMobile) return; // Skip on mobile
      
      // If user exits fullscreen mode
      if (!document.fullscreenElement && !document.webkitFullscreenElement && 
          !document.mozFullScreenElement && !document.msFullscreenElement) {
        console.log('Desktop fullscreen mode exited, auto-submitting...');
        handleSubmit();
      }
    };
    
    // Add event listeners
    window.addEventListener('blur', blurEventHandler);
    
    // Only add resize detection for desktop
    if (!isMobile) {
      window.addEventListener('resize', resizeEventHandler);
      document.addEventListener('fullscreenchange', fullscreenChangeHandler);
      document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
      document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
      document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);
    }

    return () => {
      window.removeEventListener('blur', blurEventHandler);
      
      if (!isMobile) {
        window.removeEventListener('resize', resizeEventHandler);
        document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
        document.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler);
        document.removeEventListener('mozfullscreenchange', fullscreenChangeHandler);
        document.removeEventListener('MSFullscreenChange', fullscreenChangeHandler);
      }
    };
  }, [submitted, alreadySubmitted, exam, handleSubmit]);
  // END: UPDATED CODE

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      if (!submitted && !alreadySubmitted) handleSubmit();
    };
    return () => { window.onpopstate = null; };
  }, [submitted, alreadySubmitted, handleSubmit]);
    

  useEffect(() => {
    if (!examId) return;
    (async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/exams/${examId}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const p = await res.json();
          if (p.timeLeft != null) {
            setAnswers(p.answers || {});
            setTimeLeft(p.timeLeft);
          }
        }
      } catch {}
    })();
  }, [examId, API_URL]);

  useEffect(() => {
    if (!examId) return navigate(-1);
    (async () => {
      try {
        const token =sessionStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/exams/${examId}/student`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.alreadySubmitted) {
          setAlreadySubmitted(true);
          setSubmitted(true);
          setScore(data.score);
          setExam({ questions: data.questions || [], duration: 0 });
          setAnswers(data.answers || {});
        } else {
          setExam(data);
        }
      } catch {
        navigate(-1);
      }
    })();
  }, [examId, navigate]);

  useEffect(() => {
    if (exam && timeLeft == null && !alreadySubmitted) {
      const scheduled = new Date(exam.scheduleDate);
      if (exam.scheduleTime) {
        const [hh, mm] = exam.scheduleTime.split(':').map(Number);
        scheduled.setHours(hh, mm, 0, 0);
      }
      const endTime = new Date(scheduled.getTime() + exam.duration * 60000);
      const now = new Date();
      const remaining = Math.floor((endTime - now) / 1000);
      setTimeLeft(remaining > 0 ? remaining : 0);
    }
  }, [exam, timeLeft, alreadySubmitted]);

  useEffect(() => {
    if (timeLeft == null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted, handleSubmit]);

  useEffect(() => {
    if (!submitted && exam && timeLeft != null) {
      const token = sessionStorage.getItem('token');
      fetch(`${API_URL}/api/exams/${examId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers, timeLeft })
      });
    }
  }, [answers, timeLeft, exam, submitted, examId, API_URL]);

  useEffect(() => {
    if (exam && !submitted && !alreadySubmitted) {
      const token = sessionStorage.getItem('token');
      const iv = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/api/cheats/me?exam=${examId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok && (await res.json()).cheated) {
            console.log('🚨 CHEAT DETECTED - Auto-submitting exam!');
            handleSubmit();
          }
        } catch (error) {
          console.error('Cheat check failed:', error);
        }
      }, 1000); // Check every 1 second instead of 5 seconds
      return () => clearInterval(iv);
    }
  }, [exam, submitted, alreadySubmitted, examId, API_URL, handleSubmit]);

  const handleChange = (i, j) => setAnswers(a => ({ ...a, [i]: j }));
  const fmt = s => String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Enhanced Side panel with border */}
      <div className="w-full lg:w-80 bg-white border-r-4 border-slate-200 shadow-lg p-6 flex flex-col sticky lg:top-0 h-auto lg:h-screen">
        {/* Camera section with subtle styling */}
        <div className="bg-slate-900 mb-6 rounded-xl overflow-hidden relative shadow-lg border-2 border-slate-300" style={{ paddingTop:'75%' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          {cameraStatus === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="text-center">
                <BiLoaderAlt className="animate-spin text-blue-400 text-4xl mb-2 mx-auto"/>
                <div className="text-white text-sm">Initializing...</div>
              </div>
            </div>
          )}
          {cameraStatus === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white text-center p-4">
              <div>
                <div className="text-red-400 mb-2 text-3xl">📷</div>
                <div className="text-sm">Camera Unavailable</div>
              </div>
            </div>
          )}
          {cameraStatus === 'inactive' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white text-center p-4">
              <div>
                <div className="text-slate-400 mb-2 text-3xl">📷</div>
                <div className="text-sm">Camera Inactive</div>
              </div>
            </div>
          )}
          {/* Enhanced status indicator */}
          <div className="absolute top-3 right-3 flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              cameraStatus === 'active' && aiServerStatus === 'active' 
                ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' 
                : 'bg-amber-400 animate-pulse shadow-lg shadow-amber-400/50'
            }`}></div>
            <span className="text-white text-xs bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
              {cameraStatus === 'active' && aiServerStatus === 'active' ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
        
        {/* Enhanced timer section */}
        <div className="bg-slate-800 text-white p-4 rounded-xl mb-4 shadow-lg border border-slate-300">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-slate-300 mb-1">Time Remaining</div>
            <div className="text-3xl font-mono font-bold tracking-wider">
              {timeLeft != null ? fmt(timeLeft) : '--:--'}
            </div>
          </div>
        </div>
        
        {/* Animated progress bar */}
        <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between text-xs text-slate-600 mb-2">
            <span>Progress</span>
            <span>{exam ? Math.round(((exam.duration*60 - (timeLeft||0))/(exam.duration*60))*100) : 0}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: exam ? `${((exam.duration*60 - (timeLeft||0))/(exam.duration*60))*100}%` : '0%' }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Exam info */}
        {exam && (
          <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Questions:</span>
                <span className="font-medium text-slate-800">{exam.questions?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Answered:</span>
                <span className="font-medium text-blue-600">{Object.keys(answers).length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Main content with professional styling */}
      <div className="flex-1 p-6 lg:p-12 overflow-auto bg-white">
        {!exam ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <BiLoaderAlt className="animate-spin text-slate-400 text-5xl mb-4 mx-auto"/>
              <div className="text-xl font-medium text-slate-600">Loading Exam...</div>
              <div className="text-slate-500 mt-1">Please wait</div>
            </div>
          </div>
        ) : submitted || alreadySubmitted ? (
          <div className="max-w-3xl mx-auto">
            {/* Results header - professional and clean */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <span className="text-2xl text-emerald-600">✓</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Exam Completed</h2>
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm inline-block">
                <div className="text-lg text-slate-600 mb-1">Your Score</div>
                <div className="text-4xl font-bold text-slate-800">
                  {score} / {exam.questions.length}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {Math.round((score / exam.questions.length) * 100)}% Correct
                </div>
                
                {/* Detailed breakdown */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">{score}</div>
                      <div className="text-xs text-slate-500">Correct</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {Object.keys(answers).length - score}
                      </div>
                      <div className="text-xs text-slate-500">Incorrect</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">
                        {exam.questions.length - Object.keys(answers).length}
                      </div>
                      <div className="text-xs text-slate-500">Unattempted</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Answer review - enhanced with unattempted tracking */}
            {exam.questions.map((q,i) => {
              const isAttempted = answers[i] !== undefined && answers[i] !== null;
              const studentAnswer = answers[i];
              const correctAnswer = q.correctAnswerIndex;
              const isCorrect = isAttempted && studentAnswer === correctAnswer;
              
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-slate-800">Q{i+1}. {q.questionText}</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isCorrect 
                        ? 'bg-emerald-100 text-emerald-700'
                        : !isAttempted
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {isCorrect ? '✓ Correct' : !isAttempted ? '⚠ Unattempted' : '✗ Incorrect'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {q.options.map((opt,j) => {
                      const isCorrectOption = j === correctAnswer;
                      const isStudentChoice = isAttempted && studentAnswer === j;
                      
                      // Determine styling based on different scenarios
                      let styling = 'bg-slate-50 border-slate-200 text-slate-700';
                      let label = '';
                      
                      if (isCorrectOption && !isAttempted) {
                        // Correct answer for unattempted question
                        styling = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                        label = '✓ Correct Answer';
                      } else if (isCorrectOption && isStudentChoice) {
                        // Student chose correct answer
                        styling = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                        label = '✓ Your Correct Answer';
                      } else if (isCorrectOption && !isStudentChoice && isAttempted) {
                        // Correct answer when student chose wrong
                        styling = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                        label = '✓ Correct Answer';
                      } else if (isStudentChoice && !isCorrectOption) {
                        // Student's wrong choice
                        styling = 'bg-red-50 border-red-200 text-red-800';
                        label = '✗ Your Answer (Incorrect)';
                      }
                      
                      return (
                        <div key={j} className={`p-3 rounded-lg border ${styling}`}>
                          <div className="flex items-center justify-between">
                            <span className="flex-1">{opt}</span>
                            {label && (
                              <span className={`font-medium text-sm ${
                                label.includes('Correct') ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {label}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Summary for each question */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-sm text-slate-600">
                      {isCorrect ? (
                        <span className="text-emerald-600 font-medium">
                          ✓ You answered this question correctly
                        </span>
                      ) : !isAttempted ? (
                        <span className="text-amber-600 font-medium">
                          ⚠ You did not attempt this question
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          ✗ You answered this question incorrectly
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {/* MCQ Cards - same size but professional styling */}
            {exam.questions.map((q,i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6 hover:shadow-md transition-all duration-200 hover:border-slate-300">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Q{i+1}. {q.questionText}</h3>
                <div className="space-y-3">
                  {q.options.map((opt,j) => (
                    <label key={j} className={`group flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-150 ${
                      answers[i] === j
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-blue-25 hover:border-blue-100'
                    }`}>
                      <input
                        type="radio"
                        checked={answers[i] === j}
                        onChange={() => handleChange(i,j)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className={`flex-1 ${
                        answers[i] === j ? 'text-blue-800 font-medium' : 'text-slate-700'
                      }`}>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Submit button - professional styling */}
            <div className="text-center mt-8 pb-8">
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitted}
                className={`px-8 py-3 text-lg font-medium rounded-lg transition-all duration-200 ${
                  submitted
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {submitted ? (
                  <>
                    <BiLoaderAlt className="inline animate-spin mr-2" />
                    Submitted
                  </>
                ) : (
                  'Submit Exam'
                )}
              </button>
              
              {/* Progress indicator */}
              {!submitted && Object.keys(answers).length < exam.questions.length && (
                <div className="mt-4 text-sm text-amber-600 bg-amber-50 inline-block px-3 py-2 rounded-md border border-amber-200">
                  {exam.questions.length - Object.keys(answers).length} questions remaining
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}