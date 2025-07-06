// src/pages/SubjectStudents.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/TSidebar';
import Header from '../components/THeader';
import axios from 'axios';

export default function SubjectStudents() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token'); // sessionStorage for better security
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  const [subjectName, setSubjectName] = useState('');
  const [subjectSem, setSubjectSem] = useState(null);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bulkDept, setBulkDept] = useState('');
  const [bulkSem, setBulkSem] = useState('');
  const [regNo, setRegNo] = useState('');
  const [msg, setMsg] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [editName, setEditName] = useState('');
  const [editSession, setEditSession] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editSemester, setEditSemester] = useState('');

  const ordinal = num => {
    const n = parseInt(num, 10);
    if (isNaN(n)) return num;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    switch (n % 10) {
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  };

  const fetchSubject = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/subjects/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        console.log('Subject API response:', res.data); // Debug log
        setSubjectName(res.data.name || 'Unknown Subject');
        setSubjectSem(parseInt(res.data.semester, 10) || 1);
        setEditName(res.data.name || '');
        setEditSession(res.data.session || '');
        setEditYear(res.data.year || '');
        setEditSemester(res.data.semester || '');
      })
      .catch(err => {
        console.error('Error fetching subject:', err);
        setMsg('Failed to load subject data');
      })
      .finally(() => setLoading(false));
  };

  const fetchStudents = () => {
    axios.get(`${API_BASE_URL}/api/subjects/${id}/students`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        console.log('Students API response:', res.data); // Debug log
        console.log('Students API response type:', typeof res.data); // Debug log
        console.log('Students API response length:', res.data?.length); // Debug log
        
        // Handle different response formats
        let studentsData = [];
        if (Array.isArray(res.data)) {
          studentsData = res.data;
        } else if (res.data && Array.isArray(res.data.students)) {
          studentsData = res.data.students;
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          studentsData = res.data.data;
        }
        
        console.log('Processed students data:', studentsData);
        setStudents(studentsData.sort((a, b) => a.name?.localeCompare(b.name) || 0));
      })
      .catch(err => {
        console.error('Error fetching students:', err);
        setMsg('Failed to load students');
        setStudents([]); // Reset students on error
      });
  };

  const fetchMetadata = () => {
    axios.get(`${API_BASE_URL}/api/users/departments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const departmentsData = Array.isArray(res.data) ? res.data : [];
        setDepartments(departmentsData);
      })
      .catch(console.error);
    axios.get(`${API_BASE_URL}/api/users/semesters`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const semestersData = Array.isArray(res.data) ? res.data : [];
        setSemesters(semestersData);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (!id) {
      console.error('No subject ID found');
      setMsg('Subject ID is missing');
      return;
    }

    fetchSubject();
    fetchStudents();
    fetchMetadata();
  }, [id, token, navigate]);

  const handleBulkAdd = async () => {
    if (!bulkDept || !bulkSem) {
      setMsg('Choose both department and semester');
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/subjects/${id}/students/bulk`,
        { department: bulkDept, semester: bulkSem },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg('Bulk add succeeded');
      fetchStudents();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Bulk add failed');
    }
  };

  const handleSingleAdd = async () => {
    const trimmed = regNo.trim();
    if (!trimmed) {
      setMsg('Enter a registration number');
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/subjects/${id}/students`,
        { registrationNumber: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg(`Added ${trimmed}`);
      setRegNo('');
      fetchStudents();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Add failed');
    }
  };

  const handleRemove = async studentId => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/subjects/${id}/students/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg('Student removed');
      fetchStudents();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Remove failed');
    }
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/subjects/${id}`,
        {
          name: editName,
          session: editSession.trim().toLowerCase(),
          year: Number(editYear),
          semester: Number(editSemester)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg('Subject updated');
      setShowEditPanel(false);
      fetchSubject();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteSubject = async () => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/subjects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/studentmanagement');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Delete failed');
    }
  };

  const primaryAll = students.filter(s => {
    // If semester is missing, treat as primary student for the subject's semester
    return s && (s.semester === subjectSem || !s.semester);
  });
  const repeatersAll = students.filter(s => {
    // Only show repeaters if they explicitly have a different semester
    return s && s.semester && s.semester !== subjectSem;
  });
  const term = searchTerm.trim().toLowerCase();
  const filterFn = s => {
    if (!s || !s.name) return false;
    const name = s.name.toLowerCase();
    const regNo = s.registrationNumber ? s.registrationNumber.toLowerCase() : '';
    const email = s.email ? s.email.toLowerCase() : '';
    return name.includes(term) || regNo.includes(term) || email.includes(term);
  };
  const primary = primaryAll.filter(filterFn);
  const repeaters = repeatersAll.filter(filterFn);

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col [@media(min-width:945px)]:ml-64">
        <Header toggleSidebar={toggleSidebar} />

        <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">
          <button
            onClick={() => navigate('/studentmanagement')}
            className="mb-4 text-sm text-[#002855] hover:underline"
          >
            ← Back to Subjects
          </button>

          {/* Global error message */}
          {msg && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {msg}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="text-[#002855]">Loading...</div>
            </div>
          )}

          {!loading && (
            <>
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h1 className="text-[22px] md:text-4xl font-bold text-[#002855]">
              Students in {subjectName} — {ordinal(subjectSem)} Semester
            </h1>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button
                onClick={() => setShowEditPanel(e => !e)}
                className={`flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                  showEditPanel 
                    ? 'bg-gray-300 text-gray-800 hover:bg-gray-400 shadow-md' 
                    : 'bg-yellow-200 text-gray-800 hover:bg-yellow-300 hover:shadow-md'
                }`}
              >
                <i
                  className={`fa-solid ${showEditPanel ? 'fa-times' : 'fa-pen'} text-lg`}
                />
                <span className="hidden sm:inline text-sm [@media(min-width:1100px)]:text-xs">
                  {showEditPanel ? 'Cancel Edit' : 'Edit Subject'}
                </span>
              </button>

              <button
                onClick={() => setShowPanel(p => !p)}
                className={`flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                  showPanel 
                    ? 'bg-gray-300 text-gray-800 hover:bg-gray-400 shadow-md' 
                    : 'bg-blue-200 text-gray-800 hover:bg-blue-300 hover:shadow-md'
                }`}
              >
                <i
                  className={`fa-solid ${showPanel ? 'fa-times' : 'fa-user-plus'} text-lg`}
                />
                <span className="hidden sm:inline text-sm [@media(min-width:1100px)]:text-xs">
                  {showPanel ? 'Close Panel' : 'Add Students'}
                </span>
              </button>

              <input
                type="text"
                placeholder="Search by name or reg no."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border px-4 py-2 rounded w-full sm:w-64"
              />
            </div>
          </div>

          {showEditPanel && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
              <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 w-full max-w-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Edit Subject Details</h3>
                  <button
                    onClick={() => setShowEditPanel(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <i className="fa-solid fa-times text-lg"></i>
                  </button>
                </div>
                {msg && <p className="mb-4 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{msg}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Subject Name</label>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Session</label>
                    <input
                      value={editSession}
                      onChange={e => setEditSession(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Year</label>
                    <input
                      type="number"
                      value={editYear}
                      onChange={e => setEditYear(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Semester</label>
                    <input
                      type="number"
                      value={editSemester}
                      onChange={e => setEditSemester(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleEditSubmit}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <i className="fa-solid fa-check"></i>
                    Save Changes
                  </button>
                  <button
                    onClick={handleDeleteSubject}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <i className="fa-solid fa-trash"></i> 
                    Delete Subject
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPanel && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
              <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 w-full max-w-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Add Students to Subject</h3>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <i className="fa-solid fa-times text-lg"></i>
                  </button>
                </div>
                {msg && <p className="mb-4 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{msg}</p>}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-users text-blue-500"></i>
                    Bulk Add Students
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block mb-1 font-medium text-gray-700">Department</label>
                      <select
                        value={bulkDept}
                        onChange={e => setBulkDept(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">-- Select Department --</option>
                        {departments.map(dep => (
                          <option key={dep} value={dep}>{dep}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1 font-medium text-gray-700">Semester</label>
                      <select
                        value={bulkSem}
                        onChange={e => setBulkSem(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">-- Select Semester --</option>
                        {semesters.map(sem => (
                          <option key={sem} value={sem}>{sem}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleBulkAdd}
                      className="self-end bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <i className="fa-solid fa-plus"></i>
                      Add All
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-user-plus text-blue-500"></i>
                    Add Individual Student
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block mb-1 font-medium text-gray-700">Registration Number</label>
                      <input
                        value={regNo}
                        onChange={e => setRegNo(e.target.value)}
                        placeholder="e.g. 21pwbcs001"
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleSingleAdd}
                      className="self-end bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <i className="fa-solid fa-user-plus"></i>
                      Add Student
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile and Desktop student listings unchanged below... */}

          {/* No students message */}
          {students.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found in this subject.</p>
            </div>
          )}

          {/* Show students only if we have some */}
          {students.length > 0 && (
            <>

          {/* Mobile: Current Semester */}
          <h2 className="px-4 py-2 mb-2 bg-[#002855] text-white rounded-t-xl [@media(min-width:486px)]:hidden">
            Current Semester ({primary.length} students)
          </h2>
          <div className="space-y-4 [@media(min-width:486px)]:hidden">
            {primary.map((s, i) => (
              <div key={s._id} className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200">
                <div className="mb-2 text-sm font-semibold text-gray-500">#{i + 1}</div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Reg. No.:</span>
                  <span>{s.registrationNumber || 'Not Available'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Name:</span>
                  <span>{s.name}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Semester:</span>
                  <span>{s.semester || subjectSem}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Section:</span>
                  <span>{s.section || 'Not Available'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-[#002855]">Dept:</span>
                  <span>{s.department || 'Not Available'}</span>
                </div>
                <div className="text-right pt-2">
                  <button 
                    onClick={() => handleRemove(s._id)}
                    title="Remove Student"
                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    <i className="fa-solid fa-trash text-sm" style={{ color: '#DC2626' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Repeaters */}
          {repeaters.length > 0 && (
            <>
              <h2 className="px-4 py-2 mt-6 mb-2 bg-[#002855] text-white rounded-t-xl [@media(min-width:486px)]:hidden">
                Repeaters
              </h2>
              <div className="space-y-4 [@media(min-width:486px)]:hidden">
                {repeaters.map((s, i) => (
                  <div key={s._id} className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200">
                    <div className="mb-2 text-sm font-semibold text-gray-500">#{primary.length + i + 1}</div>
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-[#002855]">Reg. No.:</span><span>{s.registrationNumber}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-[#002855]">Name:</span><span>{s.name}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-[#002855]">Semester:</span><span>{s.semester}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-[#002855]">Section:</span><span>{s.section}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-[#002855]">Dept:</span><span>{s.department}</span>
                    </div>
                    <div className="text-right pt-2">
                      <button 
                        onClick={() => handleRemove(s._id)}
                        title="Remove Student"
                        className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-200 hover:shadow-md cursor-pointer"
                      >
                        <i className="fa-solid fa-trash text-sm" style={{ color: '#DC2626' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Desktop Tables */}
          <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <h2 className="p-4 bg-gray-100 font-semibold">Current Semester</h2>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#002855] text-white">
                <tr>
                  <th className="p-4">S. No.</th>
                  <th className="p-4">Reg. No.</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Semester</th>
                  <th className="p-4">Section</th>
                  <th className="p-4">Dept.</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {primary.map((s, i) => (
                  <tr key={s._id} className="border-t hover:bg-gray-100">
                    <td className="p-4">{i + 1}</td>
                    <td className="p-4">{s.registrationNumber || 'N/A'}</td>
                    <td className="p-4">{s.name}</td>
                    <td className="p-4">{s.semester || subjectSem}</td>
                    <td className="p-4">{s.section || 'N/A'}</td>
                    <td className="p-4">{s.department || 'N/A'}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleRemove(s._id)}
                        title="Remove Student"
                        className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-200 hover:shadow-md cursor-pointer"
                      >
                        <i className="fa-solid fa-trash text-sm" style={{ color: '#DC2626' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {repeaters.length > 0 && (
            <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-hidden">
              <h2 className="p-4 bg-gray-100 font-semibold">Repeaters</h2>
              <table className="w-full text-left text-sm">
                <thead className="bg-[#002855] text-white">
                  <tr>
                    <th className="p-4">S. No.</th>
                    <th className="p-4">Reg. No.</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Semester</th>
                    <th className="p-4">Section</th>
                    <th className="p-4">Dept.</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {repeaters.map((s, i) => (
                    <tr key={s._id} className="border-t hover:bg-gray-100">
                      <td className="p-4">{primary.length + i + 1}</td>
                      <td className="p-4">{s.registrationNumber}</td>
                      <td className="p-4">{s.name}</td>
                      <td className="p-4">{s.semester}</td>
                      <td className="p-4">{s.section}</td>
                      <td className="p-4">{s.department}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleRemove(s._id)}
                          title="Remove Student"
                          className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-200 hover:shadow-md cursor-pointer"
                        >
                          <i className="fa-solid fa-trash text-sm" style={{ color: '#DC2626' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

            </>
          )}

            </>
          )}

        </div>
      </div>
    </div>
  );
}
