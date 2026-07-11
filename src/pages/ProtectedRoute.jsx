// frontend/src/pages/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check for 'token' (used by Employees) OR 'admin_token' (just in case you used that for Admin)
  const token = localStorage.getItem('token') || localStorage.getItem('admin_token');

  if (!token) {
    // If they have NO token, send them back to the main portal menu
    return <Navigate to="/" replace />;
  }

  // If they have a valid token, let them through to the page!
  return children;
};

export default ProtectedRoute;