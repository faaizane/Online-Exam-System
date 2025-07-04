import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function PrivateRoute({ children, allowedRoles }) {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  const location = useLocation();

  // Not logged in → redirect to relevant login page
  if (!token) {
    const loginPath = allowedRoles.includes('teacher') ? '/tlogin' : '/slogin';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Logged in but with wrong role → redirect to relevant dashboard
  if (!allowedRoles.includes(role)) {
    const fallbackPath = role === 'teacher' ? '/tdashboard' : '/sdashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  // Authorized → render page
  return children;
}
