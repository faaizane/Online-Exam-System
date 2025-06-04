import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');
  const location = useLocation();

  // Not logged in → send to appropriate login page
  if (!token) {
    const loginPath = allowedRoles.includes('teacher') ? '/tlogin' : '/slogin';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }
  // Logged in but wrong role → back to landing or login
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  // OK → render child component
  return children;
}
