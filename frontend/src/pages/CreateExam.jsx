// src/pages/CreateExam.jsx
import React, { useState, useRef } from 'react';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';

export default function CreateExam() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const [form, setForm] = useState({
    year: '',
    semester: '',
    session: '',
    subject: '',
    examNo: '',
    duration: '',
    scheduleDate: '',
    scheduleTime: '',
  });
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswerIndex: null }
  ]);
  const fileInputRef = useRef(null);

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addQuestion = () =>
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: null }]);

  const deleteQuestion = (idx) =>
    setQuestions(questions.filter((_, i) => i !== idx));

  const handleQuestionChange = (idx, field, val, optIdx = null) => {
    const newQs = [...questions];
    if (field === 'questionText') newQs[idx].questionText = val;
    else if (field === 'option') newQs[idx].options[optIdx] = val;
    else if (field === 'correctAnswerIndex') newQs[idx].correctAnswerIndex = Number(val);
    setQuestions(newQs);
  };

  const handleFileUploadClick = () => fileInputRef.current.click();
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/exams/upload', {
        method: 'POST',
        body: fd,
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
        })));
      }
    } catch {
      alert('Failed to upload file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      duration: Number(form.duration),
      assignedSemester: `${form.session} ${form.year}`,
      questions,
    };
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/exams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Exam created successfully');
        setForm({
          year: '',
          semester: '',
          session: '',
          subject: '',
          examNo: '',
          duration: '',
          scheduleDate: '',
          scheduleTime: '',
        });
        setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswerIndex: null }]);
      } else {
        alert('Error: ' + data.message);
      }
    } catch {
      alert('Server error');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <form onSubmit={handleSubmit} className="px-2 md:px-4 lg:px-16 py-4 md:py-8 space-y-6">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855]">Create Exam</h1>

          {/* Tighter grid for main exam fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Year */}
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Year</label>
              <input
                type="text" name="year" placeholder="e.g. 2025"
                value={form.year} onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Semester</label>
              <input
                type="text" name="semester" placeholder="e.g. 6"
                value={form.semester} onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>

            {/* Session */}
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Session</label>
              <input
                type="text" name="session" placeholder="Fall / Spring"
                value={form.session} onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Subject</label>
              <input
                type="text" name="subject" placeholder="e.g. Data Structures"
                value={form.subject} onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>

            {/* Exam Number */}
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Exam Number</label>
              <input
                type="text" name="examNo" placeholder="e.g. Quiz 01"
                value={form.examNo} onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Duration (minutes)</label>
              <input
                type="number" name="duration" min={1}
                value={form.duration} onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>

            {/* Schedule Date */}
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Schedule Date</label>
              <input
                type="date" name="scheduleDate"
                value={form.scheduleDate} onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>

            {/* Schedule Time */}
            <div>
              <label className="block mb-1 font-medium text-[#002855]">Schedule Time</label>
              <input
                type="time" name="scheduleTime"
                value={form.scheduleTime} onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                required
              />
            </div>
          </div>

          {/* Upload Questions File */}
          <div className="flex items-center gap-4">
            <button
              type="button" onClick={handleFileUploadClick}
              className="bg-[#002855] text-white px-4 py-2 rounded-lg hover:bg-[#001f47] transition"
            >
              Upload Questions File
            </button>
            <input
              type="file" accept=".pdf,.doc,.docx"
              ref={fileInputRef} onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Questions */}
          <div className="bg-white rounded-xl shadow-md p-4 space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="border p-4 rounded-md space-y-3 relative">
                <button
                  type="button"
                  onClick={() => deleteQuestion(idx)}
                  className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold hover:bg-red-800 transition"
                  title="Delete Question"
                >
                  ×
                </button>
                <label className="block mb-1 font-medium text-[#002855]">
                  Question {idx + 1}
                </label>
                <input
                  type="text" placeholder="Enter question text"
                  value={q.questionText}
                  onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  required
                />
                {q.options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => handleQuestionChange(idx, 'option', e.target.value, i)}
                    className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                    required
                  />
                ))}
                <label className="block mb-1 font-medium text-[#002855]">Correct Option</label>
                <select
                  value={q.correctAnswerIndex ?? ''}
                  onChange={e => handleQuestionChange(idx, 'correctAnswerIndex', e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  required
                >
                  <option value="" disabled>Select Correct Option</option>
                  {q.options.map((_, i) => (
                    <option key={i} value={i}>Option {i + 1}</option>
                  ))}
                </select>
              </div>
            ))}
            <button
              type="button" onClick={addQuestion}
              className="text-[#0073E6] font-medium text-lg"
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
              Submit Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
