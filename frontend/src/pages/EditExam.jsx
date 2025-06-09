// src/pages/EditExam.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';

export default function EditExam() {
  const { id } = useParams(); // exam ID from URL
  const navigate = useNavigate();
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

  const [questions, setQuestions] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch existing exam data
  useEffect(() => {
    async function fetchExam() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/exams/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch exam');
        const data = await res.json();

        setForm({
          year: data.year,
          semester: data.semester,
          session: data.session,
          subject: data.subject,
          examNo: data.examNo,
          duration: data.duration,
          scheduleDate: data.scheduleDate.slice(0, 10), // yyyy-mm-dd format
          scheduleTime: data.scheduleTime,
        });

        setQuestions(data.questions);
      } catch (err) {
        alert('Failed to load exam data');
      }
    }
    fetchExam();
  }, [id]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: null }]);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value, optionIndex = null) => {
    const newQuestions = [...questions];
    if (field === 'questionText') {
      newQuestions[index].questionText = value;
    } else if (field === 'option') {
      newQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctAnswerIndex') {
      newQuestions[index].correctAnswerIndex = Number(value);
    }
    setQuestions(newQuestions);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/api/exams/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

      const res = await fetch(`/api/exams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Exam updated successfully');
        navigate('/manageexams'); // Redirect as per your routing
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

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8 space-y-6">
          <h1 className="text-[22px] md:text-4xl font-bold text-[#002855]">Edit Exam</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Same inputs as create exam with values from form */}
            <input
              type="text"
              name="year"
              placeholder="Year"
              value={form.year}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
              required
            />
            <input
              type="text"
              name="semester"
              placeholder="Semester"
              value={form.semester}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
              required
            />
            <input
              type="text"
              name="session"
              placeholder="Fall / Spring"
              value={form.session}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
              required
            />
            <input
              type="text"
              name="examNo"
              placeholder="Exam No."
              value={form.examNo}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855] md:col-span-2"
              required
            />
            <input
              type="number"
              name="duration"
              placeholder="Assign Duration (minutes)"
              value={form.duration}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
              min={1}
              required
            />
            <input
              type="date"
              name="scheduleDate"
              placeholder="Schedule Date"
              value={form.scheduleDate}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
              required
            />
            <input
              type="time"
              name="scheduleTime"
              placeholder="Schedule Time"
              value={form.scheduleTime}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002855]"
              required
            />

            {/* Upload Button */}
            <div className="md:col-span-2 flex items-center gap-4">
              <button
                type="button"
                onClick={handleFileUploadClick}
                className="bg-[#002855] text-white px-4 py-2 rounded-lg hover:bg-[#001f47] transition"
              >
                Upload Questions File (PDF/Word)
              </button>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </form>

          {/* Questions Section */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md p-4 md:p-6 space-y-6">
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

                <label className="font-semibold mb-2 block text-[#002855]">Question {idx + 1}</label>

                <input
                  type="text"
                  placeholder={`Enter question text`}
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
              type="button"
              onClick={addQuestion}
              className="text-[#0073E6] font-medium text-lg"
            >
              + Add Questions
            </button>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-[#002855] text-white px-6 py-2 rounded-lg hover:bg-[#001f47] transition"
            >
              Update Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
