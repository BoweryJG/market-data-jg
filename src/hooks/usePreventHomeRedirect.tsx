import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const usePreventHomeRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If we're authenticated and on the homepage, redirect to market-data
    if (isAuthenticated && location.pathname === '/') {
      console.log('🚀 Preventing homepage, redirecting to /market-data');
      navigate('/market-data', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);
};