import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  // Check if user is logged in
  if (!token) {
    console.log('🔒 No token found, redirecting to login');
    return <Navigate to="/Login" replace />;
  }

  try {
    // Decode token to get user role
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;

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
