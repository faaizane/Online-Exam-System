// src/pages/EditExam.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';
import BackButton from '../components/BackButton';
import StudentSelectionModal from '../components/StudentSelectionModal';

export default function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

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
  const [excludedStudents, setExcludedStudents] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    async function loadExam() {
      try {
        const token = sessionStorage.getItem('token'); // sessionStorage for exam upload
        const res = await fetch(`${API_BASE_URL}/api/exams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();

        setForm({
          year: data.year,
          subject: data.subject._id || data.subject,
          session: data.session,
          semester: data.semester.toString(),
          examNo: data.examNo,
          duration: data.duration.toString(),
          scheduleDate: data.scheduleDate.slice(0, 10),
          scheduleTime: data.scheduleTime,
        });
        setSelectedStudents(data.assignedStudents || []);
        
        // Calculate excluded students - need to fetch subject data for this
        // Will be handled when modal opens
        setExcludedStudents([]);
        
        setQuestions(data.questions);
      } catch {
        setPopup({ show: true, message: 'Failed to load exam. Please try again.', type: 'error' });
      }
    }
    loadExam();
  }, [id, API_BASE_URL]);

  useEffect(() => {
    async function fetchByYear() {
      if (!form.year) {
        setSubjects([]);
        setForm(f => ({ ...f, subject: '', session: '', semester: '' }));
        return;
      }
      try {
        const token = sessionStorage.getItem('token'); // sessionStorage for exam upload
        const res = await fetch(`${API_BASE_URL}/api/subjects?year=${form.year}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const list = await res.json();
        setSubjects(list);
      } catch {
        setSubjects([]);
      }
    }
    fetchByYear();
  }, [form.year, API_BASE_URL]);

  const handleFormChange = e => {
    const { name, value } = e.target;
    if (name === 'subject') {
      const sel = subjects.find(s => s._id === value);
      if (sel) {
        setForm(f => ({
          ...f,
          subject: sel._id,
          session: sel.session,
          semester: sel.semester.toString(),
        }));
      } else {
        setForm(f => ({ ...f, subject: '', session: '', semester: '' }));
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const addQuestion = () =>
    setQuestions(qs => [
      ...qs,
      { questionText: '', options: ['', '', '', ''], correctAnswerIndex: null },
    ]);
  const deleteQuestion = idx => setQuestions(qs => qs.filter((_, i) => i !== idx));
  const handleQuestionChange = (idx, field, val, optIdx = null) =>
    setQuestions(qs => {
      const a = [...qs];
      if (field === 'questionText') a[idx].questionText = val;
      if (field === 'option') a[idx].options[optIdx] = val;
      if (field === 'correctAnswerIndex') a[idx].correctAnswerIndex = Number(val);
      return a;
    });

  const handleFileUploadClick = () => fileInputRef.current.click();
  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const token = sessionStorage.getItem('token'); // sessionStorage for exam upload
      const res = await fetch(`${API_BASE_URL}/api/exams/upload`, {
        method: 'POST',
        body: fd,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(
          data.questions.map(q => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswerIndex: q.correctAnswerIndex,
          }))
        );
        // No popup for file upload
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      // No popup for file upload errors either
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);
    
    const payload = {
      ...form,
      assignedSemester: `${form.session} ${form.year}`,
      duration: Number(form.duration),
      questions,
      excludedStudents: excludedStudents // Send excluded students
    };
    try {
      const token = sessionStorage.getItem('token'); //
      const res = await fetch(`${API_BASE_URL}/api/exams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setPopup({ show: true, message: 'Exam updated successfully!', type: 'success' });
        // Navigate after a short delay to let user see the success message
        setTimeout(() => {
          navigate('/manageexams');
        }, 1500);
      } else {
        const data = await res.json();
        setPopup({ show: true, message: data.message, type: 'error' }); // Removed 'Error:' prefix
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

        <div className="px-4 md:px-16 py-6">
          <BackButton />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="px-4 md:px-8 [@media(min-width:1100px)]:px-16 py-6 space-y-6"
          >
          <h1 className="text-3xl font-bold text-[#002855]">Edit Exam</h1>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-[#002855] text-sm">Subject</label>
              <div className="relative">
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleFormChange}
                  required
                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-4 focus:ring-[#002855]/20 focus:border-[#002855] transition-all duration-200 bg-white shadow-sm hover:border-gray-400 appearance-none pr-10"
                >
                  <option value="">— Select Subject —</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} - {s.semester} {s.section ? s.section.charAt(0).toUpperCase() + s.section.slice(1) : ''} - {s.session ? s.session.charAt(0).toUpperCase() + s.session.slice(1) : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-[#002855] text-sm">Year</label>
              <input
                name="year"
                type="text"
                value={form.year}
                disabled
                className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 rounded-xl text-gray-600 shadow-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-[#002855] text-sm">Session</label>
              <input
                name="session"
                value={form.session ? form.session.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : ''}
                disabled
                className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 rounded-xl text-gray-600 shadow-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-[#002855] text-sm">Semester</label>
              <input
                name="semester"
                value={form.semester}
                disabled
                className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 rounded-xl text-gray-600 shadow-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#002855] text-sm">Exam Number</label>
              <input
                name="examNo"
                value={form.examNo}
                onChange={handleFormChange}
                placeholder="Enter exam number"
                className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-4 focus:ring-[#002855]/20 focus:border-[#002855] transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#002855] text-sm">Duration (minutes)</label>
              <input
                name="duration"
                type="number"
                min="1"
                value={form.duration}
                onChange={handleFormChange}
                placeholder="e.g. 60"
                className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-4 focus:ring-[#002855]/20 focus:border-[#002855] transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#002855] text-sm">Schedule Date</label>
              <input
                name="scheduleDate" type="date"
                value={form.scheduleDate}
                onChange={handleFormChange}
                className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-4 focus:ring-[#002855]/20 focus:border-[#002855] transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#002855] text-sm">Schedule Time</label>
              <input
                name="scheduleTime" type="time"
                value={form.scheduleTime}
                onChange={handleFormChange}
                className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-4 focus:ring-[#002855]/20 focus:border-[#002855] transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                required
              />
            </div>
          </div>

          {/* Student Selection Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100 shadow-sm">
            <label className="block mb-3 font-semibold text-[#002855] text-lg">Manage Students for Exam</label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">
                {excludedStudents.length > 0 
                  ? `${excludedStudents.length} students excluded from exam` 
                  : 'All students are included in this exam'
                }
              </span>
              <button
                type="button"
                onClick={() => setShowStudentModal(true)}
                disabled={!form.subject}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  !form.subject 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#002855] hover:bg-[#001f47] text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {excludedStudents.length > 0 ? 'Manage Exclusions' : 'Manage Students'}
              </button>
            </div>
            {!form.subject && (
              <p className="text-xs text-red-500 mt-2 font-medium">Please select a subject first</p>
            )}
          </div>

          {/* Upload + Submit */}
          <div className="flex justify-between flex-wrap gap-4">
            <div>
              <button
                type="button"
                onClick={handleFileUploadClick}
                className="bg-[#002855] text-white px-4 py-2 rounded-lg hover:bg-[#001f47] transition"
              >
                Upload Questions File
              </button>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg transition ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {isSubmitting ? 'Updating Exam...' : 'Update Exam'}
              </button>
            </div>
          </div>

          {/* Questions UI */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="relative bg-white shadow-sm rounded-2xl p-6 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="absolute -top-3 -left-3 bg-[#002855] text-white font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                  {idx + 1}
                </div>

                <div className="mt-4">
                  <label className="block mb-2 font-semibold text-[#002855] text-sm">
                    Question {idx + 1}
                  </label>
                  <textarea
                    rows={3}
                    value={q.questionText}
                    onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)}
                    className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-4 focus:ring-[#002855]/20 focus:border-[#002855] transition-all duration-200 resize-none bg-white shadow-sm hover:border-gray-400"
                    placeholder="Enter question text"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  {q.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={e => handleQuestionChange(idx, 'option', e.target.value, i)}
                      className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-4 focus:ring-[#002855]/20 focus:border-[#002855] transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                      required
                    />
                  ))}
                </div>

                <div className="mt-5">
                  <label className="block mb-2 font-semibold text-[#002855] text-sm">Correct Answer</label>
                  <div className="relative">
                    <select
                      value={q.correctAnswerIndex ?? ''}
                      onChange={e => handleQuestionChange(idx, 'correctAnswerIndex', e.target.value)}
                      className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-4 focus:ring-[#002855]/20 focus:border-[#002855] transition-all duration-200 bg-white shadow-sm hover:border-gray-400 cursor-pointer appearance-none pr-10"
                      required
                    >
                      <option value="" disabled>Select correct option</option>
                      {q.options.map((_, i) => (
                        <option key={i} value={i}>Option {i + 1}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteQuestion(idx)}
                  className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-bold"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center justify-center w-full py-4 border-2 border-dashed border-[#002855] rounded-xl text-[#002855] font-semibold text-lg hover:bg-[#002855]/5 hover:border-solid transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Question
            </button>
          </div>
        </form>

        {/* Student Selection Modal */}
        <StudentSelectionModal
          isOpen={showStudentModal}
          onClose={() => setShowStudentModal(false)}
          subjectId={form.subject}
          excludedStudents={excludedStudents}
          selectedStudents={selectedStudents} // Pass for edit mode calculation
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
                  {popup.type === 'success' ? 'Success!' : 'Exam Update Error'}
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
