import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../auth/supabase';
import { logger } from '../services/logging/logger';
import { getErrorMessage } from '../utils/errorUtils';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have an authorization code in the query params (PKCE flow)
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        
        if (code) {
          logger.info('Authorization code found, letting Supabase AuthContext handle PKCE exchange');
          // The Supabase client with detectSessionInUrl: true will automatically handle this
          // Just wait for the auth state change and redirect
          setTimeout(() => {
            // Clear the URL params to clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Navigate to dashboard
            navigate('/');
          }, 1500); // Give a bit more time for the auth to process
          return;
        }
        
        // Check if we have auth tokens in the URL hash (implicit flow)
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
              logger.error('Error parsing stored tokens', { error: getErrorMessage(e) });
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
            logger.error('Auth callback error', { error: getErrorMessage(error) });
            navigate('/');
            return;
          }
          
          if (data.session) {
            logger.info('Auth callback successful, user logged in');
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
          logger.error('Auth callback error', { error: getErrorMessage(error) });
          navigate('/');
          return;
        }

        if (session) {
          logger.info('Existing session found');
          navigate('/');
        } else {
          logger.info('No session found, redirecting to home');
          navigate('/');
        }
      } catch (error) {
        logger.error('Unexpected error during auth callback', { error: getErrorMessage(error) });
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

AuthCallback.displayName = 'AuthCallback';