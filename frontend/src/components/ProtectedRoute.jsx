import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  
  // Get auth state from localStorage
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); // 'citizen' or 'authority'

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is not allowed for this route, redirect based on their role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'authority') {
      return <Navigate to="/authority" replace />;
    } else {
      return <Navigate to="/citizen" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
