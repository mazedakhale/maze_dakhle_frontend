import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import Swal from 'sweetalert2';

const AutoRedirect = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const { role } = decodedToken;
        
        console.log('🔄 Auto-redirecting to dashboard for role:', role);
        
        // Show popup message
        Swal.fire({
          title: 'Already Logged In!',
          text: `You are already logged in as ${role}. Redirecting to your dashboard...`,
          icon: 'info',
          timer: 4000,
          showConfirmButton: false,
          confirmButtonColor: '#F58A3B',
        });
        
        // Redirect based on role after a short delay
        setTimeout(() => {
          if (role === 'Customer') navigate('/Cdashinner', { replace: true });
          else if (role === 'Admin') navigate('/Adashinner', { replace: true });
          else if (role === 'Distributor') navigate('/Ddashinner', { replace: true });
          else if (role === 'Employee') navigate('/Edashinner', { replace: true });
        }, 2000);
      } catch (error) {
        console.error('❌ Invalid token during auto-redirect, clearing...', error);
        localStorage.removeItem('token');
      }
    }
  }, [navigate]);

  return children;
};

export default AutoRedirect;
