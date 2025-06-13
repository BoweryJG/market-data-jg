import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  Google,
  GitHub,
  Facebook,
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';

interface QuickLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickLoginModal: React.FC<QuickLoginModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const { signInWithEmail, signInWithProvider, loading, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError(null);

    try {
      await signInWithEmail(email, password);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github' | 'facebook') => {
    setLocalLoading(true);
    setLocalError(null);

    try {
      await signInWithProvider(provider, {
        redirectTo: window.location.href
      });
      // OAuth will redirect, so we don't need to handle success here
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed');
      setLocalLoading(false);
    }
  };

  const isLoading = loading || localLoading;
  const displayError = error?.message || localError;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(15,15,30,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(123,66,246,0.2)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        color: 'white'
      }}>
        <Typography variant="h5" fontWeight="bold">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Typography>
        <IconButton 
          onClick={onClose} 
          sx={{ color: 'white' }}
          disabled={isLoading}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ color: 'white' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Access full market intelligence and premium features
        </Typography>

        {displayError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {displayError}
          </Alert>
        )}

        {/* Social Auth Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Google />}
            onClick={() => handleSocialAuth('google')}
            disabled={isLoading}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                borderColor: '#00ffc6',
                backgroundColor: 'rgba(0,255,198,0.1)'
              }
            }}
          >
            Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHub />}
            onClick={() => handleSocialAuth('github')}
            disabled={isLoading}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                borderColor: '#00ffc6',
                backgroundColor: 'rgba(0,255,198,0.1)'
              }
            }}
          >
            GitHub
          </Button>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Typography variant="body2" color="text.secondary">
            or continue with email
          </Typography>
        </Divider>

        {/* Email Form */}
        <Box component="form" onSubmit={handleEmailAuth}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: '#00ffc6',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ffc6',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#00ffc6',
                },
              },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: '#00ffc6',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ffc6',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#00ffc6',
                },
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading || !email || !password}
            sx={{
              py: 1.5,
              background: 'linear-gradient(45deg, #7B42F6 30%, #00ffc6 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #6B32E6 30%, #00e6b6 90%)',
              },
              '&:disabled': {
                background: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
            sx={{ 
              color: '#00ffc6',
              textTransform: 'none',
              fontSize: '0.9rem'
            }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};