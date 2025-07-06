import React, { useState, useEffect } from 'react';

const StudentSelectionModal = ({ 
  isOpen, 
  onClose, 
  subjectId, 
  excludedStudents = [], // Changed from selectedStudents to excludedStudents
  selectedStudents = [], // Keep for edit mode to calculate excluded
  onSave 
}) => {
  const [allStudents, setAllStudents] = useState([]);
  const [localExcluded, setLocalExcluded] = useState(excludedStudents); // Track excluded students
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch students when modal opens
  useEffect(() => {
    if (isOpen && subjectId) {
      fetchStudents();
    }
  }, [isOpen, subjectId]);

  // Calculate excluded students for edit mode
  useEffect(() => {
    if (selectedStudents.length > 0 && allStudents.length > 0) {
      // Edit mode: calculate excluded students
      const excluded = allStudents
        .filter(student => !selectedStudents.includes(student._id))
        .map(student => student._id);
      setLocalExcluded(excluded);
    }
  }, [selectedStudents, allStudents]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token'); // Changed to sessionStorage
      const response = await fetch(`${API_BASE_URL}/api/subjects/${subjectId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllStudents(data.students);
      } else {
        console.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
    setLoading(false);
  };

  // Filter students based on search term
  const filteredStudents = allStudents.filter(student =>
    (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.rollNumber && student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Toggle individual student exclusion
  const toggleStudent = (studentId) => {
    setLocalExcluded(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId) // Remove from excluded (include student)
        : [...prev, studentId] // Add to excluded (exclude student)
    );
  };

  // Exclude all students
  const excludeAll = () => {
    setLocalExcluded(filteredStudents.map(student => student._id));
  };

  // Include all students (clear exclusions)
  const includeAll = () => {
    setLocalExcluded([]);
  };

  // Save exclusions and close modal
  const handleSave = () => {
    onSave(localExcluded);
    onClose();
  };

  // Cancel and revert changes
  const handleCancel = () => {
    setLocalExcluded(excludedStudents);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-start pt-8 z-50 bg-black/40 backdrop-blur-sm" onClick={handleCancel}>
      <div className="bg-white rounded-xl w-[90%] max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Manage Students for Exam</h3>
          <button 
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors" 
            onClick={handleCancel}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search students by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
            />
          </div>

          {/* Info Banner */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">
                <i className="fa-solid fa-circle-info mr-1"></i> All students are included by default.
              </span> Uncheck students you want to exclude from this exam.
            </p>
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={includeAll} 
              className="px-4 py-2 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg text-sm font-medium transition-colors text-green-700"
            >
              Include All ({filteredStudents.length})
            </button>
            <button 
              onClick={excludeAll} 
              className="px-4 py-2 bg-red-100 hover:bg-red-200 border border-red-300 rounded-lg text-sm font-medium transition-colors text-red-700"
            >
              Exclude All
            </button>
          </div>

          {/* Students List */}
          <div className="flex-1 border border-gray-200 rounded-lg overflow-y-auto max-h-80">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? 'No students found matching your search.' : 'No students found in this subject.'}
              </div>
            ) : (
              filteredStudents.map(student => (
                <div key={student._id} className="flex items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => toggleStudent(student._id)}
                    className="mr-3 text-blue-600 focus:outline-none"
                  >
                    <i className={`fa-solid ${!localExcluded.includes(student._id) ? 'fa-square-check' : 'fa-square'}`}></i>
                  </button>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{student.name}</div>
                    {student.rollNumber && (
                      <div className="text-xs text-gray-600 font-medium">Roll: {student.rollNumber}</div>
                    )}
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </div>
                  {localExcluded.includes(student._id) && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Excluded</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="text-sm text-gray-600 font-medium">
            {allStudents.length - localExcluded.length} out of {allStudents.length} students included
            {localExcluded.length > 0 && (
              <span className="text-red-600 ml-2">({localExcluded.length} excluded)</span>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleCancel} 
              className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="px-5 py-2 bg-[#003366] hover:bg-[#002855] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSelectionModal;
