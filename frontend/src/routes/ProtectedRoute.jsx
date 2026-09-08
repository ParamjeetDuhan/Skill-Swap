// Wraps routes that require the user to be logged in. Redirects to /login
// if there's no access token, preserving the intended destination.

import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { accessToken } = useSelector((state) => state.auth);
  const location = useLocation();

  const token = accessToken || localStorage.getItem('accessToken');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
