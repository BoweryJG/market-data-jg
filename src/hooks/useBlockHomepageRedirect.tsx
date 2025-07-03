import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useBlockHomepageRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Store the current path when component mounts
    const currentPath = location.pathname;
    
    // If we detect a navigation to homepage, go back
    const checkInterval = setInterval(() => {
      if (location.pathname === '/' && currentPath !== '/') {
        console.log('🚫 Blocked redirect to homepage, returning to:', currentPath);
        navigate(currentPath, { replace: true });
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);
};