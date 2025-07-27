import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BiLoaderAlt, BiWifi, BiWifiOff } from 'react-icons/bi';

export default function GiveExam() {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  // Copy prevention functions
  const preventCopy = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);

  const preventRightClick = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);

  const preventKeyboardShortcuts = useCallback((e) => {
    
    // Prevent Ctrl+C, Ctrl+A, Ctrl+V, Ctrl+X, Ctrl+S, F12, etc.
    if (e.ctrlKey && (e.key === 'c' || e.key === 'a' || e.key === 'v' || e.key === 'x' || e.key === 's')) {
      e.preventDefault();
      return false;
    }
    // Prevent F12 (Developer Tools)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    // Prevent Ctrl+Shift+I (Developer Tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    // Prevent Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
  }, []);

  // Ensure JWT token exists in sessionStorage (passed via ?tk=)
  const queryParams = new URLSearchParams(window.location.search);
  const passedToken = queryParams.get('tk');
  if (passedToken && !sessionStorage.getItem('token')) {
    sessionStorage.setItem('token', passedToken);
  }
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const submittingRef = useRef(false);
  const frameProcessingRef = useRef(false);
  // Refs for WiFi change state to fix closure issues
  const isWifiChangeModeRef = useRef(false);
  const wifiChangeTimeLeftRef = useRef(0);

  const [cameraStatus, setCameraStatus] = useState('loading'); // 'loading', 'active', 'inactive', 'error'
  const [aiServerStatus, setAiServerStatus] = useState('checking'); // 'checking', 'active', 'inactive'
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  // Check if exam was previously auto-submitted offline
  const offlineSubmittedKey = `offline_submitted_${examId}`;
  const [offlineSubmitted, setOfflineSubmitted] = useState(() => !!localStorage.getItem(offlineSubmittedKey));
  const [score, setScore] = useState(null);
  const [submitReason, setSubmitReason] = useState('');
  // Track connection status to pause exam when offline
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  // WiFi change management states
  const [isWifiChangeMode, setIsWifiChangeMode] = useState(false);
  const [wifiChangeTimeLeft, setWifiChangeTimeLeft] = useState(0);
  const [showWifiIcon, setShowWifiIcon] = useState(false);
  // Allow only 2 WiFi-change attempts per offline session
  const [wifiChances, setWifiChances] = useState(2);
  const wifiChancesRef = useRef(2);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const YOLO_BACKEND_URL = import.meta.env.VITE_YOLO_BACKEND_URL || 'http://127.0.0.1:5001';

  // Practice mode flag and dummy exam
  const isPractice = examId === 'practice';

  const dummyExam = {
    _id: 'practice',
    subjectName: 'Practice Test',
    examNo: 0,
    semester: 'N/A',
    duration: 10, // minutes
    scheduleDate: new Date().toISOString(),
    scheduleTime: new Date().toTimeString().slice(0,5),
    questions: [
      {
        questionText: 'What is 2 + 2?',
        options: ['3', '4', '5', '2'],
        correctAnswerIndex: 1
      },
      {
        questionText: 'Which planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        correctAnswerIndex: 1
      },
      {
        questionText: 'Who wrote the national anthem of Pakistan?',
        options: ['Allama Iqbal', 'Hafeez Jullundhri', 'Faiz Ahmed Faiz', 'Ahmed Faraz'],
        correctAnswerIndex: 1
      }
    ]
  };

  // Add copy prevention event listeners
  useEffect(() => {
    if (!submitted && exam) {
      // Add event listeners for copy prevention
      document.addEventListener('copy', preventCopy);
      document.addEventListener('contextmenu', preventRightClick);
      document.addEventListener('keydown', preventKeyboardShortcuts);
      document.addEventListener('selectstart', preventCopy);
      document.addEventListener('dragstart', preventCopy);

      // Disable text selection via CSS
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.mozUserSelect = 'none';
      document.body.style.msUserSelect = 'none';

      return () => {
        // Clean up event listeners
        document.removeEventListener('copy', preventCopy);
        document.removeEventListener('contextmenu', preventRightClick);
        document.removeEventListener('keydown', preventKeyboardShortcuts);
        document.removeEventListener('selectstart', preventCopy);
        document.removeEventListener('dragstart', preventCopy);

        // Re-enable text selection
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        document.body.style.mozUserSelect = '';
        document.body.style.msUserSelect = '';
      };
    }
  }, [submitted, exam, preventCopy, preventRightClick, preventKeyboardShortcuts]);

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
      
      // Use different endpoints for practice vs real exams
      const endpoint = isPractice ? '/process_frame_practice' : '/process_frame';
      console.log(`🔍 Processing frame via ${endpoint} for exam: ${examId}`);
      
      const response = await fetch(`${YOLO_BACKEND_URL}${endpoint}`, {
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
          if (isPractice) {
            console.log('🎓 PRACTICE CHEAT DETECTED:', result.reason);
            console.log('🎓 Practice exam data:', { exam: !!exam, questions: exam?.questions?.length, answers: Object.keys(answers).length });
            // For practice, also auto-submit to show the training experience
            setSubmitReason(`Practice: ${result.reason || 'Cheating detected'}`);
            handleSubmit();
            return;
          } else {
            console.log('🚨 IMMEDIATE CHEAT DETECTED:', result.reason);
            setSubmitReason(result.reason || 'Cheating detected');
            handleSubmit();
            return;
          }
        }
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    }
  }, [examId, YOLO_BACKEND_URL, isPractice]);

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
    console.log('🔥 HandleSubmit called:', { isWindowClosing, submitted, alreadySubmitted, examExists: !!exam, isPractice });
    
    // For practice mode, allow submission without checking exam existence  
    if (submittingRef.current || submitted || alreadySubmitted || (!exam && !isPractice)) {
      console.log('❌ Submit blocked:', { 
        submittingRef: submittingRef.current, 
        submitted, 
        alreadySubmitted, 
        examExists: !!exam,
        isPractice 
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

    if (isPractice) {
      // Practice mode: always calculate score from latest answers, even on cheating/auto-submit
      // Always use dummyExam if exam is missing in practice mode
      const practiceExam = exam && exam.questions ? exam : dummyExam;
      // Try to get latest answers from storage if answers is empty (closure issue)
      let latestAnswers = answers;
      if (Object.keys(latestAnswers).length === 0) {
        try {
          const storageKey = `practice_answers_${practiceExam._id}`;
          const stored = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);
          if (stored) {
            latestAnswers = JSON.parse(stored);
            console.log('DEBUG: Loaded answers from storage:', latestAnswers);
          }
        } catch (e) { console.log('DEBUG: Could not load answers from storage', e); }
      }
      console.log('DEBUG: Practice auto-submit triggered');
      console.log('DEBUG: practiceExam.questions:', practiceExam.questions);
      console.log('DEBUG: answers:', latestAnswers);
      setScore(() => {
        const calculatedScore = practiceExam.questions.reduce((sum, q, i) => {
          const ans = latestAnswers[i];
          const correct = q.correctAnswerIndex;
          const isCorrect = ans === correct;
          console.log(`DEBUG: Q${i+1}: ans=${ans}, correct=${correct}, isCorrect=${isCorrect}`);
          return sum + (isCorrect ? 1 : 0);
        }, 0);
        console.log(`🎓 Practice score: ${calculatedScore}/${practiceExam.questions.length}`);
        return calculatedScore;
      });
      // Clean up camera server for practice session
      try {
        await cleanupAiServer();
      } catch (error) {
        console.error('🎓 Practice cleanup error:', error);
      }
      return;
    }

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
    
    // Cleanup calls (skip in practice mode)
    if (!isPractice) {
    fetch(`${API_URL}/api/exams/${examId}/progress`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
    }
    
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
    cleanupAiServer,
    isPractice
  ]);

  const onTabChange = () => {
    if (!submitted && !alreadySubmitted && document.hidden) {
      // If in WiFi change mode, allow tab changes for WiFi settings
      if (isWifiChangeModeRef.current && wifiChangeTimeLeftRef.current > 0) {
        console.log('Tab change allowed during WiFi change window');
        return;
      }
      setSubmitReason('Tab change detected');
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
    // If in WiFi change mode, allow blur events for WiFi settings
    if (isWifiChangeModeRef.current && wifiChangeTimeLeftRef.current > 0) {
      console.log('HandleBlur allowed during WiFi change window');
      return;
    }
    setSubmitReason('Tab change detected');
    handleSubmit();
  }, [handleSubmit]);


  // Auto-submit (local) when tab closes during offline
  useEffect(() => {
    const handleBeforeUnloadOffline = () => {
      if (isOffline && !submitted && !alreadySubmitted) {
        // mark locally as submitted
        try {
          localStorage.setItem(offlineSubmittedKey, '1');
        } catch {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnloadOffline);
    return () => window.removeEventListener('beforeunload', handleBeforeUnloadOffline);
  }, [isOffline, submitted, alreadySubmitted]);

  useEffect(() => {
     window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => window.removeEventListener('beforeunload', beforeUnloadHandler);
  }, [beforeUnloadHandler]);

  useEffect(() => {
     const onUnload = () => {
       if (isOffline && !submitted && !alreadySubmitted) {
         try { localStorage.setItem(offlineSubmittedKey, '1'); } catch {}
       }

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
      // If in WiFi change mode, allow blur events for WiFi settings
      if (isWifiChangeModeRef.current && wifiChangeTimeLeftRef.current > 0) {
        console.log('Window blur allowed during WiFi change window');
        return;
      }
      console.log('Window blur detected (minimize/focus change/app switch), auto-submitting...');
      setSubmitReason('Tab change detected');
      handleSubmit();
    };

    // Strict window resize detection - NO TOLERANCE for desktop
    const resizeEventHandler = () => {
      // Skip ALL resize detection on mobile devices
      if (isMobile) {
        console.log('Mobile device detected - skipping resize detection');
        return;
      }

      // If in WiFi change mode, previously resize was allowed and skipped, but we now treat it as a violation
      if (isWifiChangeModeRef.current && wifiChangeTimeLeftRef.current > 0) {
        console.log('Window resize detected during WiFi change window - treating as violation');
        // Note: we intentionally do NOT return here so that the resize still triggers auto-submit below
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
      
      // If in WiFi change mode, allow fullscreen changes for WiFi settings
      if (isWifiChangeModeRef.current && wifiChangeTimeLeftRef.current > 0) {
        console.log('Fullscreen change allowed during WiFi change window');
        return;
      }
      
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
      // If in WiFi change mode, allow popstate events for WiFi settings
      if (isWifiChangeModeRef.current && wifiChangeTimeLeftRef.current > 0) {
        console.log('Popstate allowed during WiFi change window');
        return;
      }
      if (!submitted && !alreadySubmitted) handleSubmit();
    };
    return () => { window.onpopstate = null; };
  }, [submitted, alreadySubmitted, handleSubmit]);
    

  useEffect(() => {
    if (isPractice) {
      setExam(dummyExam);
      return;
          }

    if (!examId) return navigate(-1);
    (async () => {
      // If locally marked offline-submitted, mark as already submitted and skip fetch
      if (localStorage.getItem(offlineSubmittedKey)) {
        setAlreadySubmitted(true);
        setSubmitted(true);
        return;
      }
      try {
        const token = sessionStorage.getItem('token');
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
      } catch (err) {
        console.error(err);
        navigate(-1);
      }
    })();
  }, [examId, navigate, isPractice]);

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
    if (timeLeft == null || submitted || isOffline) return;
    if (timeLeft <= 0) {
      setSubmitReason('Time finished');
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted, isOffline, handleSubmit]);

  useEffect(() => {
    if (!isPractice && exam && !submitted && !alreadySubmitted && !isOffline) {
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
  }, [answers, timeLeft, exam, submitted, examId, API_URL, isOffline, isPractice]);

  useEffect(() => {
    if (exam && !submitted && !alreadySubmitted && !isOffline) {
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
  }, [exam, submitted, alreadySubmitted, examId, API_URL, isOffline, handleSubmit, isPractice]);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      // reset chances on each fresh disconnect
      setWifiChances(2);
      wifiChancesRef.current = 2;
      setShowWifiIcon(true);
      // Reset WiFi change mode when going offline
      setIsWifiChangeMode(false);
      setWifiChangeTimeLeft(0);
      // Update refs
      isWifiChangeModeRef.current = false;
      wifiChangeTimeLeftRef.current = 0;
    };
    const handleOnline = () => {
      setIsOffline(false);
      // If we had offline-submitted, attempt to send submission to server once back online
      if (localStorage.getItem(offlineSubmittedKey)) {
        if (!submitted && !alreadySubmitted) {
          setSubmitReason('Tab resize');
          handleSubmit();
        }
        // keep flag so other pages know; it will be cleared by successful handleSubmit inside cleanup
      }

      setShowWifiIcon(false);
      // hide icon if no chances left
      if (wifiChancesRef.current <= 0) setShowWifiIcon(false);
      // Reset WiFi change mode when coming back online
      setIsWifiChangeMode(false);
      setWifiChangeTimeLeft(0);
      // Update refs
      isWifiChangeModeRef.current = false;
      wifiChangeTimeLeftRef.current = 0;
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online',  handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online',  handleOnline);
    };
  }, []);

  // WiFi change timer effect
  useEffect(() => {
    let timer;
    if (isWifiChangeMode && wifiChangeTimeLeft > 0) {
      timer = setInterval(() => {
        setWifiChangeTimeLeft(prev => {
          const newValue = prev <= 1 ? 0 : prev - 1;
          // Update ref for event handlers
          wifiChangeTimeLeftRef.current = newValue;
          if (newValue <= 0) {
            setIsWifiChangeMode(false);
            isWifiChangeModeRef.current = false;
          }
          return newValue;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isWifiChangeMode, wifiChangeTimeLeft]);

  // Handle WiFi icon click to enable WiFi change mode
  const handleWifiIconClick = () => {
    if (wifiChancesRef.current <= 0) return; // no more attempts
    // consume a chance
    setWifiChances(c => c - 1);
    wifiChancesRef.current -= 1;
    if (isOffline && !isWifiChangeMode) {
      setIsWifiChangeMode(true);
      setWifiChangeTimeLeft(30); // 30 seconds
      // Update refs for event handlers
      isWifiChangeModeRef.current = true;
      wifiChangeTimeLeftRef.current = 30;
      console.log('WiFi change mode activated for 30 seconds');
    }
  };

  const handleChange = (i, j) => {
    setAnswers(a => {
      const updated = { ...a, [i]: j };
      // Persist answers for practice mode
      if (isPractice) {
        try {
          const storageKey = `practice_answers_practice`;
          sessionStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) { console.log('DEBUG: Could not persist practice answers', e); }
      }
      return updated;
    });
  };
  const fmt = s => String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');

  // Overlay shown when offline – blocks interaction and informs user
  const OfflineOverlay = () => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 text-white backdrop-blur-sm">
      <div className="bg-white text-red-700 rounded-lg p-6 shadow-xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-2">No Internet Connection</h2>
        <p className="mb-4">Your exam has been paused. Please reconnect to resume.</p>
        
        {/* WiFi Change Section */}
        {showWifiIcon && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {!isWifiChangeMode ? (
              <>
                <p className="text-blue-700 text-sm mb-3">Need to change WiFi?</p>
                <button
                  onClick={handleWifiIconClick}
                  className="flex items-center justify-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BiWifi className="mr-2 text-xl" />
                  Change WiFi (30s)
                </button>
              </>
            ) : (
              <>
                <p className="text-green-700 text-sm mb-2">WiFi Change Mode Active</p>
                <div className="flex items-center justify-center mb-2">
                  <BiWifiOff className="mr-2 text-xl text-green-600" />
                  <span className="text-green-700 font-bold text-lg">{wifiChangeTimeLeft}s</span>
                </div>
                <p className="text-green-600 text-xs">You can safely change WiFi settings now</p>
              </>
            )}
          </div>
        )}
        
        <div className="text-4xl animate-pulse mt-4">⚠️</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {isOffline && <OfflineOverlay />}
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
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                {isPractice ? 'Practice Session Completed!' : 'Exam Completed'}
              </h2>
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm inline-block">
                <div className="text-lg text-slate-600 mb-1">
                  {isPractice ? 'Practice Score' : 'Your Score'}
                </div>
                <div className="text-4xl font-bold text-slate-800">
                  {score !== null ? score : 0} / {exam?.questions?.length || 0}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {exam?.questions?.length ? Math.round(((score || 0) / exam.questions.length) * 100) : 0}% Correct
                </div>
                
                {isPractice && (
                  <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                    🎓 This was a practice session. Your responses were not saved.
                    {submitReason && (
                      <div className="mt-2 font-medium">
                        <strong>Training Trigger:</strong> {submitReason}
                      </div>
                    )}
                  </div>
                )}
                
                {submitReason && !isPractice && (
                  <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <strong>Submission Reason:</strong> {submitReason}
                  </div>
                )}

                {/* Detailed breakdown */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">{score || 0}</div>
                      <div className="text-xs text-slate-500">Correct</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {Object.keys(answers).length - (score || 0)}
                      </div>
                      <div className="text-xs text-slate-500">Incorrect</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">
                        {(exam?.questions?.length || 0) - Object.keys(answers).length}
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
            {/* Restart button after submission */}
            {isPractice && (
              <div className="text-center mb-12">
                <button
                  onClick={async () => {
                    try {
                      // Check camera permission first
                      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                      stream.getTracks().forEach(t => t.stop());

                      // Open new practice session in full window
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
                        // Close current window after opening new one
                        setTimeout(() => {
                          window.close();
                        }, 500);
                      }
                    } catch {
                      alert('⚠️ Please enable your camera to start another practice session.');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md text-sm"
                >
                  Try Again With Another Action
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Practice instructions */}
            {isPractice && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Before you answer, please perform these actions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Move your head to the <strong>right</strong> and <strong>left</strong> for a few seconds. The system should detect and auto-submit.</li>
                  <li>Briefly <strong>remove your face</strong> from the camera frame.</li>
                  <li><strong>Change the browser tab / minimize window</strong> to simulate leaving the exam.</li>
                  <li>Hold up or glance at a <strong>mobile phone</strong> in view of the camera.</li>
                  <li><strong>Internet Connection Test:</strong> First of all ther internet connection should be stable durig the exam, if not so try bychance, Disconnect your internet without changing your tab (like unplug your internet or close hotspot from mobile). When there's no internet connection, a notice will appear with a button. Click that button and you will be given 30 seconds to only change your 
                  internet connection or connect it from the internet icon. Return within the time limit - that's good.
                   Otherwise, it will be submitted automatically and any other action will be detected as tab changing.
                   You can apply for 30s more only one more time next time it will not allow to access the internet connection icon.</li>
                </ol>
                <p className="text-xs text-blue-700 mt-2">Each of these actions is flagged as cheating in real exams.</p>
              </div>
            )}

            {/* MCQ Cards */}
            {exam.questions.map((q,i) => (
              <div 
                key={i} 
                className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6 hover:shadow-md transition-all duration-200 hover:border-slate-300"
                style={{
                  userSelect: 'none',
                  webkitUserSelect: 'none',
                  mozUserSelect: 'none',
                  msUserSelect: 'none',
                  webkitTouchCallout: 'none',
                  webkitTapHighlightColor: 'transparent'
                }}
                onCopy={preventCopy}
                onContextMenu={preventRightClick}
                onSelectStart={preventCopy}
                onDragStart={preventCopy}
              >
                <h3 
                  className="text-xl font-semibold text-slate-800 mb-4"
                  style={{
                    userSelect: 'none',
                    webkitUserSelect: 'none',
                    mozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                >
                  Q{i+1}. {q.questionText}
                </h3>
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
                      <span 
                        className={`flex-1 ${
                          answers[i] === j ? 'text-blue-800 font-medium' : 'text-slate-700'
                        }`}
                        style={{
                          userSelect: 'none',
                          webkitUserSelect: 'none',
                          mozUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                      >
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
                onClick={() => {
                  console.log('🔘 Submit button clicked:', { isPractice, submitted, exam: !!exam });
                  handleSubmit(false);
                }}
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
                    {isPractice ? 'Practice Completed' : 'Submitted'}
                  </>
                ) : (
                  isPractice ? 'Complete Practice' : 'Submit Exam'
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