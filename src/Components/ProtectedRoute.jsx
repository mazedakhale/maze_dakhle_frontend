import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Check if token is expired
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log('⏰ Token expired, removing from localStorage');
        localStorage.removeItem('token');
        
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Your login session has expired. Please login again.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          setShouldRedirect(true);
        });
      }
    } catch (error) {
      console.error('❌ Token decode error:', error);
    }
  }, [token]);

  // Check if user is logged in
  if (!token || shouldRedirect) {
    console.log('🔒 No token found, redirecting to login');
    return <Navigate to="/Login" replace />;
  }

  try {
    // Decode token to get user role
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;

    // Check if token is expired
    const currentTime = Date.now() / 1000; // Convert to seconds
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      return null; // Will be handled by useEffect
    }

    console.log('👤 User role:', userRole);
    console.log('✅ Allowed roles:', allowedRoles);

    // Check if user's role is allowed for this route
    if (!allowedRoles.includes(userRole)) {
      console.log('❌ Access denied - redirecting to appropriate dashboard');
      
      // Redirect to appropriate dashboard based on role
      if (userRole === 'Admin') return <Navigate to="/Adashinner" replace />;
      if (userRole === 'Customer') return <Navigate to="/Cdashinner" replace />;
      if (userRole === 'Distributor') return <Navigate to="/Ddashinner" replace />;
      if (userRole === 'Employee') return <Navigate to="/Edashinner" replace />;
      
      return <Navigate to="/Login" replace />;
    }

    // User has correct role, allow access
    return children;
  } catch (error) {
    console.error('❌ Token decode error:', error);
    localStorage.removeItem('token'); // Remove invalid token
    return <Navigate to="/Login" replace />;
  }
};

export default ProtectedRoute;
