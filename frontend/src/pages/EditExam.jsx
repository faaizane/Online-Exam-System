// File: src/pages/EditExam.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header  from '../components/THeader';

export default function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  // Subjects for the selected year
  const [subjects, setSubjects] = useState([]);

  // Form state
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

  // Questions
  const [questions, setQuestions] = useState([]);
  const fileInputRef = useRef(null);

  // 1) Load exam data on mount
  useEffect(() => {
    async function loadExam() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/exams/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();

        // Initialize form
        setForm({
          year:         data.year,
          subject:      data.subject._id || data.subject,
          session:      data.session,
          semester:     data.semester.toString(),
          examNo:       data.examNo,
          duration:     data.duration.toString(),
          scheduleDate: data.scheduleDate.slice(0, 10),
          scheduleTime: data.scheduleTime,
        });
        setQuestions(data.questions);
      } catch {
        alert('Failed to load exam');
      }
    }
    loadExam();
  }, [id]);

  // 2) Fetch subjects whenever `form.year` changes
  useEffect(() => {
    async function fetchByYear() {
      if (!form.year) {
        setSubjects([]);
        setForm(f => ({ ...f, subject: '', session: '', semester: '' }));
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/subjects?year=${form.year}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const list = await res.json();
        setSubjects(list);
      } catch {
        setSubjects([]);
      }
    }
    fetchByYear();
  }, [form.year]);

  // 3) Handle form changes
  const handleFormChange = e => {
    const { name, value } = e.target;
    if (name === 'subject') {
      const sel = subjects.find(s => s._id === value);
      if (sel) {
        setForm(f => ({
          ...f,
          subject:  sel._id,
          session:  sel.session,
          semester: sel.semester.toString(),
        }));
      } else {
        setForm(f => ({ ...f, subject:'', session:'', semester:'' }));
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Question handlers
  const addQuestion = () =>
    setQuestions(qs => [...qs, { questionText:'', options:['','','',''], correctAnswerIndex:null }]);
  const deleteQuestion = idx =>
    setQuestions(qs => qs.filter((_,i) => i!==idx));
  const handleQuestionChange = (idx, field, val, optIdx=null) =>
    setQuestions(qs => {
      const a = [...qs];
      if (field==='questionText') a[idx].questionText = val;
      if (field==='option')       a[idx].options[optIdx] = val;
      if (field==='correctAnswerIndex') a[idx].correctAnswerIndex = Number(val);
      return a;
    });

  // File upload
  const handleFileUploadClick = () => fileInputRef.current.click();
  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/exams/upload', {
        method:'POST', body:fd,
        headers:{ Authorization:`Bearer ${token}` }
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions.map(q=>({
          questionText: q.questionText,
          options:      q.options,
          correctAnswerIndex: q.correctAnswerIndex
        })));
      }
    } catch {
      alert('Upload failed');
    }
  };

  // Submit update
  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...form,
      assignedSemester: `${form.session} ${form.year}`,
      duration: Number(form.duration),
      questions
    };
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/exams/${id}`, {
        method:'PUT',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Exam updated');
        navigate('/manageexams');
      } else {
        const data = await res.json();
        alert('Error: '+data.message);
      }
    } catch {
      alert('Server error');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar}/>
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <Header toggleSidebar={toggleSidebar}/>

        <form onSubmit={handleSubmit} className="px-4 md:px-8 lg:px-16 py-6 space-y-6">
          <h1 className="text-3xl font-bold text-[#002855]">Edit Exam</h1>

          {/* Year & Subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Year</label>
              <input
                name="year"
                value={form.year}
                onChange={handleFormChange}
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
                    {s.name} — {s.session.charAt(0).toUpperCase()+s.session.slice(1)} {s.year} (Sem {s.semester})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-filled Session & Semester */}
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

            {/* Exam No */}
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-[#002855]">Exam Number</label>
              <input
                name="examNo"
                value={form.examNo}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>

            {/* Duration, Date, Time */}
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Duration (min)</label>
              <input
                name="duration" type="number" min="1"
                value={form.duration}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Schedule Date</label>
              <input
                name="scheduleDate" type="date"
                value={form.scheduleDate}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Schedule Time</label>
              <input
                name="scheduleTime" type="time"
                value={form.scheduleTime}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="flex items-center space-x-4">
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

          {/* Questions UI (unchanged) */}
          {/* Improved Questions UI */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="relative bg-white shadow-lg rounded-lg p-6">
                <div className="absolute -top-3 -left-3 bg-[#002855] text-white font-bold rounded-full w-10 h-10 flex items-center justify-center">
                  {idx + 1}
                </div>

                <div className="mt-6">
                  <label className="block mb-1 font-semibold text-[#002855]">Question {idx + 1}</label>
                  <textarea
                    rows={2}
                    value={q.questionText}
                    onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855] resize-none"
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
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                      required
                    />
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block mb-1 font-medium text-[#002855]">Correct Answer</label>
                  <select
                    value={q.correctAnswerIndex ?? ''}
                    onChange={e => handleQuestionChange(idx, 'correctAnswerIndex', e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
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
                  className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-800 transition"
                  title="Delete Question"
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

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#002855] text-white px-6 py-2 rounded-lg hover:bg-[#001f47] transition"
            >
              Update Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
