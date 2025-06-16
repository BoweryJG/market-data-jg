import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../auth/supabase';

export default function ManualAuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleManualAuth = async () => {
      try {
        // Get tokens from URL hash
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        console.log('Manual auth handler - tokens found:', !!accessToken, !!refreshToken);

        if (accessToken && refreshToken) {
          // Set the session manually
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Manual auth error:', error);
          } else if (data.session) {
            console.log('Manual auth successful:', data.session.user.email);
            // Clear the hash and redirect
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/');
            return;
          }
        }

        // If no tokens or auth failed, go to home
        console.log('No tokens found or auth failed, redirecting to home');
        navigate('/');
      } catch (error) {
        console.error('Manual auth handler error:', error);
        navigate('/');
      }
    };

    handleManualAuth();
  }, [navigate, location.hash]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        color: 'text.primary',
      }}
    >
      <CircularProgress size={48} sx={{ color: '#00ffc6', mb: 2 }} />
      <Typography variant="h6">
        Processing authentication...
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
        Setting up your session
      </Typography>
    </Box>
  );
}