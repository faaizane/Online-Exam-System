// src/pages/Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get role before clearing specific session data
    const role = sessionStorage.getItem('role');
    
    // Only clear user-specific session data, not everything
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userEmail');
    
    navigate(role === 'teacher' ? '/tlogin' : '/slogin', { replace: true });
  }, [navigate]);

  return null;
}