import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../auth/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login');
          return;
        }

        if (session) {
          // Successfully authenticated, redirect to home
          navigate('/');
        } else {
          // No session, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: theme => theme.palette.background.default,
      }}
    >
      <CircularProgress size={48} sx={{ color: '#00ffc6', mb: 2 }} />
      <Typography variant="h6" sx={{ color: 'text.primary' }}>
        Completing sign in...
      </Typography>
    </Box>
  );
}