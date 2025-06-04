// src/pages/Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();
  useEffect(() => {
    // grab role first so we know where to send them
    const role = localStorage.getItem('role');
    localStorage.clear();
    navigate(role === 'teacher' ? '/tlogin' : '/slogin', { replace: true });
  }, [navigate]);
  return null;
}
