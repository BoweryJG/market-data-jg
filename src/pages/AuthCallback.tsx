import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../auth/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have auth tokens in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        let accessToken = hashParams.get('access_token');
        let refreshToken = hashParams.get('refresh_token');
        
        // If no tokens in URL, check localStorage (from auth-handler.html)
        if (!accessToken || !refreshToken) {
          const storedTokens = localStorage.getItem('supabase.auth.token');
          if (storedTokens) {
            try {
              const tokens = JSON.parse(storedTokens);
              accessToken = tokens.access_token;
              refreshToken = tokens.refresh_token;
              // Clean up stored tokens
              localStorage.removeItem('supabase.auth.token');
            } catch (e) {
              console.error('Error parsing stored tokens:', e);
            }
          }
        }
        
        if (accessToken && refreshToken) {
          // Set the session from URL parameters
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Auth callback error:', error);
            navigate('/');
            return;
          }
          
          if (data.session) {
            console.log('Auth callback successful, user logged in');
            // Clear the URL hash to clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Navigate to dashboard
            navigate('/');
            return;
          }
        }
        
        // Fallback: try to get existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/');
          return;
        }

        if (session) {
          console.log('Existing session found');
          navigate('/');
        } else {
          console.log('No session found, redirecting to home');
          navigate('/');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        navigate('/');
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