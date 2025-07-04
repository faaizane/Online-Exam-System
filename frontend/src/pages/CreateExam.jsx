// src/pages/CreateExam.jsx

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';
import StudentSelectionModal from '../components/StudentSelectionModal';

export default function CreateExam() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    year: '',
    subject: '',
    session: '',
    semester: '',
    examNo: '',
    duration: '',
    scheduleDate: '',
    scheduleTime: '',
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [excludedStudents, setExcludedStudents] = useState([]); // Track excluded students
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswerIndex: null }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const fileInputRef = useRef(null);

  // Fetch subjects by year
  useEffect(() => {
    async function fetchSubjects() {
      if (!form.year) {
        setSubjects([]);
        setForm(f => ({ ...f, subject: '', session: '', semester: '' }));
        return;
      }
      try {
        const token = sessionStorage.getItem('token'); // session
        const res = await fetch(`${API_BASE_URL}/api/subjects?year=${form.year}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const list = await res.json();
        setSubjects(list);
        setForm(f => ({ ...f, subject: '', session: '', semester: '' }));
      } catch {
        setSubjects([]);
      }
    }
    fetchSubjects();
  }, [form.year]);

  // Form input changes
  const handleFormChange = e => {
    const { name, value } = e.target;
    if (name === 'subject') {
      const sel = subjects.find(s => s._id === value);
      if (sel) {
        setForm(f => ({
          ...f,
          subject: sel._id,
          session: sel.session,
          semester: sel.semester.toString()
        }));
      } else {
        setForm(f => ({ ...f, subject: '', session: '', semester: '' }));
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Question Handlers
  const addQuestion = () =>
    setQuestions(qs => [...qs, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: null }]);

  const deleteQuestion = idx =>
    setQuestions(qs => qs.filter((_, i) => i !== idx));

  const handleQuestionChange = (idx, field, val, optIdx = null) =>
    setQuestions(qs => {
      const a = [...qs];
      if (field === 'questionText') a[idx].questionText = val;
      if (field === 'option') a[idx].options[optIdx] = val;
      if (field === 'correctAnswerIndex') a[idx].correctAnswerIndex = Number(val);
      return a;
    });

  // File Upload
  const handleFileUploadClick = () => fileInputRef.current.click();

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);

    try {
      const token = sessionStorage.getItem('token'); // session
      const res = await fetch(`${API_BASE_URL}/api/exams/upload`, {
        method: 'POST',
        body: fd,
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.questions) {
        setQuestions(data.questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex
        })));
        // No popup for file upload
      }

      // ✅ Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch {
      // No popup for file upload errors either
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // ✅ Reset file input even on error
      }
    }
  };

  // Submit
  const handleSubmit = async e => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);
    
    const payload = {
      ...form,
      assignedSemester: `${form.session} ${form.year}`,
      duration: Number(form.duration),
      questions,
      excludedStudents: excludedStudents // Send excluded students instead
    };
    try {
      const token = sessionStorage.getItem('token'); //session
      const res = await fetch(`${API_BASE_URL}/api/exams/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setPopup({ show: true, message: 'Exam created successfully!', type: 'success' });
        setForm({
          year: '', subject: '', session: '', semester: '',
          examNo: '', duration: '', scheduleDate: '', scheduleTime: ''
        });
        setSelectedStudents([]);
        setExcludedStudents([]);
        setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswerIndex: null }]);
      } else {
        setPopup({ show: true, message: `Error: ${data.message}`, type: 'error' });
      }
    } catch {
      setPopup({ show: true, message: 'Server error. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close popup
  const closePopup = () => {
    setPopup({ show: false, message: '', type: '' });
  };

  // Auto close popup after 5 seconds
  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => {
        closePopup();
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <div className="relative flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="px-4 md:px-8 [@media(min-width:1100px)]:px-16 py-6 space-y-6">
          <h1 className="text-3xl font-bold text-[#002855]">Create Exam</h1>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Year</label>
              <input
                name="year"
                type="text"
                value={form.year}
                onChange={handleFormChange}
                placeholder="e.g. 2025"
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-[#002855]">Subject</label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855]"
                required
              >
                <option value="">— Select Subject —</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} — {s.session.charAt(0).toUpperCase() + s.session.slice(1)} {s.year} (Sem {s.semester})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-[#002855]">Session</label>
              <input
                name="session"
                value={form.session}
                disabled
                className="w-full bg-gray-100 border px-3 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-[#002855]">Semester</label>
              <input
                name="semester"
                value={form.semester}
                disabled
                className="w-full bg-gray-100 border px-3 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-[#002855]">Exam Number</label>
              <input
                name="examNo"
                value={form.examNo}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-[#002855]">Duration (min)</label>
              <input
                name="duration"
                type="number"
                min="1"
                value={form.duration}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-[#002855]">Schedule Date</label>
              <input
                name="scheduleDate"
                type="date"
                value={form.scheduleDate}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-[#002855]">Schedule Time</label>
              <input
                name="scheduleTime"
                type="time"
                value={form.scheduleTime}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>
          </div>

          {/* Student Selection Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <label className="block mb-2 font-medium text-[#002855]">Manage Students for Exam</label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {excludedStudents.length > 0 
                  ? `${excludedStudents.length} students excluded from exam` 
                  : 'All students are included in this exam'
                }
              </span>
              <button
                type="button"
                onClick={() => setShowStudentModal(true)}
                disabled={!form.subject}
                className={`px-4 py-2 rounded-lg transition ${
                  !form.subject 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-[#002855] hover:bg-[#001f47] text-white'
                }`}
              >
                {excludedStudents.length > 0 ? 'Manage Exclusions' : 'Manage Students'}
              </button>
            </div>
            {!form.subject && (
              <p className="text-xs text-red-500 mt-1">Please select a subject first</p>
            )}
          </div>

          {/* File Upload + Submit Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleFileUploadClick}
              className="bg-[#002855] text-white px-4 py-2 rounded-lg hover:bg-[#001f47] transition"
            >
              Upload Questions File
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg transition ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#002855] hover:bg-[#001f47]'
              } text-white`}
            >
              {isSubmitting ? 'Creating Exam...' : 'Submit Exam'}
            </button>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="relative bg-white shadow-lg rounded-lg p-6">
                <div className="absolute -top-3 -left-3 bg-[#002855] text-white font-bold rounded-full w-10 h-10 flex items-center justify-center">
                  {idx + 1}
                </div>
                <div className="mt-6">
                  <label className="block mb-1 font-semibold text-[#002855]">
                    Question {idx + 1}
                  </label>
                  <textarea
                    rows={2}
                    value={q.questionText}
                    onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855] resize-none"
                    placeholder="Enter question text"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {q.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={e => handleQuestionChange(idx, 'option', e.target.value, i)}
                      className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855]"
                      required
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block mb-1 font-medium text-[#002855]">Correct Answer</label>
                  <select
                    value={q.correctAnswerIndex ?? ''}
                    onChange={e => handleQuestionChange(idx, 'correctAnswerIndex', e.target.value)}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855]"
                    required
                  >
                    <option value="" disabled>Select correct option</option>
                    {q.options.map((_, i) => (
                      <option key={i} value={i}>Option {i + 1}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => deleteQuestion(idx)}
                  className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-800"
                >
                  ×
                </button>
              </div>
            ))}  
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center text-[#0073E6] font-medium"
            >
              + Add Question
            </button>
          </div>
        </form>

        {/* Student Selection Modal */}
        <StudentSelectionModal
          isOpen={showStudentModal}
          onClose={() => setShowStudentModal(false)}
          subjectId={form.subject}
          excludedStudents={excludedStudents}
          onSave={(excluded) => {
            setExcludedStudents(excluded);
            setShowStudentModal(false);
          }}
        />
      </div>

      {/* Custom Popup Modal - Small floating notification with slide animation */}
      {popup.show && (
        <div 
          className="fixed top-4 right-4 z-50 transform transition-all duration-500 ease-in-out animate-slide-in-right"
          style={{
            animation: 'slideInRight 0.5s ease-out forwards'
          }}
        >
          <style jsx>{`
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .animate-slide-in-right {
              animation: slideInRight 0.5s ease-out forwards;
            }
          `}</style>
          
          <div className={`rounded-lg p-4 shadow-lg max-w-sm ${
            popup.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {popup.type === 'success' ? (
                <div className="bg-green-100 rounded-full p-1 mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              ) : (
                <div className="bg-red-100 rounded-full p-1 mr-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h4 className={`text-sm font-semibold ${popup.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {popup.type === 'success' ? 'Success!' : 'Error!'}
                </h4>
                <p className={`text-xs mt-1 ${popup.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {popup.message}
                </p>
              </div>
              <button
                onClick={closePopup}
                className={`ml-3 px-3 py-1 text-xs rounded font-medium transition ${
                  popup.type === 'success' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
