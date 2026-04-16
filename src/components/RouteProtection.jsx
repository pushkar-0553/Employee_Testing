import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function RouteProtection() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const isLoginPage = location.pathname === '/login';
    
    if (!token && !isLoginPage) {
      // If not logged in and not on login page, redirect to login
      navigate('/login', { replace: true });
      return;
    }

    if (token && isLoginPage) {
      // If logged in but on login page, redirect to dashboard
      navigate('/dashboard', { replace: true });
      return;
    }

    // Prevent back navigation after logout
    const handlePopState = (event) => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        // If no token, prevent back navigation
        event.preventDefault();
        window.history.pushState(null, null, window.location.href);
        navigate('/login', { replace: true });
      }
    };

    // Add initial history entry to prevent back
    if (token) {
      window.history.pushState(null, null, window.location.href);
    }

    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, location]);

  // This component doesn't render anything
  return null;
}
