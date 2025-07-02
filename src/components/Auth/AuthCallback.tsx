import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Wait for auth to be checked
    if (!loading) {
      if (isAuthenticated) {
        // User is authenticated, redirect to market data
        navigate('/market-data', { replace: true });
      } else {
        // Not authenticated, go to home
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      }}
    >
      <CircularProgress 
        sx={{ 
          color: '#9f58fa',
          mb: 3 
        }} 
        size={60}
      />
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#fff',
          fontFamily: 'Orbitron, monospace',
          letterSpacing: '0.5px'
        }}
      >
        Authenticating...
      </Typography>
    </Box>
  );
};

export default AuthCallback;