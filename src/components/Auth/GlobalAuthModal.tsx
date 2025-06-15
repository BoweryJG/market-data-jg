import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  Box, 
  Button, 
  Stack, 
  TextField, 
  Typography, 
  IconButton,
  InputAdornment,
  Fade,
  Backdrop,
  Divider,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  Close, 
  Visibility, 
  VisibilityOff, 
  Google, 
  Facebook, 
  Email,
  AutoAwesome,
  Fingerprint,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../../auth';
import { keyframes } from '@mui/system';

// Subtle animations
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 255, 198, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 255, 198, 0.8), 0 0 30px rgba(0, 255, 198, 0.4); }
  100% { box-shadow: 0 0 5px rgba(0, 255, 198, 0.5); }
`;

interface GlobalAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GlobalAuthModal({ open, onClose, onSuccess }: GlobalAuthModalProps) {
  const theme = useTheme();
  const [authMode, setAuthMode] = useState<'options' | 'email'>('options');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    signInWithEmail, 
    signUpWithEmail,
    signInWithProvider 
  } = useAuth();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setAuthMode('options');
      setEmail('');
      setPassword('');
      setError('');
      setIsSignUp(false);
    }
  }, [open]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      setError(error.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');
    
    try {
      await signInWithProvider(provider);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      setError(`Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(8px)',
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          maxWidth: 440,
          width: '90%',
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #f5f5f5 0%, #e3e3e3 100%)',
          border: '1px solid',
          borderColor: 'rgba(0, 255, 198, 0.3)',
          borderRadius: 4,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: 'linear-gradient(45deg, #00ffc6, #00a693, #00ffc6)',
            borderRadius: 4,
            opacity: 0.3,
            zIndex: -1,
            animation: `${glow} 3s ease-in-out infinite`,
          }
        }}
      >
        {/* Decorative orb */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 255, 198, 0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: `${float} 6s ease-in-out infinite`,
          }}
        />

        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.7)' 
              : 'rgba(0, 0, 0, 0.7)',
            zIndex: 1,
            '&:hover': {
              color: '#00ffc6',
              backgroundColor: 'rgba(0, 255, 198, 0.1)',
            }
          }}
        >
          <Close />
        </IconButton>

        {/* Content */}
        <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <TrendingUp sx={{ color: '#00ffc6', fontSize: 28 }} />
            <Typography 
              variant="h5" 
              sx={{ 
                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${shimmer} 3s linear infinite`,
                backgroundSize: '200% 200%',
              }}
            >
              Market Data
            </Typography>
          </Stack>

          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.8)' 
                : 'rgba(0, 0, 0, 0.8)',
              mb: 3
            }}
          >
            {authMode === 'options' 
              ? 'Access real-time market intelligence'
              : isSignUp 
                ? 'Create your account' 
                : 'Welcome back'
            }
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                color: '#ff6b6b',
                '& .MuiAlert-icon': {
                  color: '#ff6b6b'
                }
              }}
            >
              {error}
            </Alert>
          )}

          {authMode === 'options' ? (
            <Stack spacing={2}>
              {/* Google */}
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleSocialAuth('google')}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Google />}
                sx={{
                  py: 1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                  fontSize: '15px',
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderColor: '#00ffc6',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0, 255, 198, 0.3)',
                  }
                }}
              >
                Continue with Google
              </Button>

              {/* Facebook */}
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleSocialAuth('facebook')}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Facebook />}
                sx={{
                  py: 1.5,
                  backgroundColor: 'rgba(24, 119, 242, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(24, 119, 242, 0.3)',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                  fontSize: '15px',
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(24, 119, 242, 0.3)',
                    borderColor: '#1877F2',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(24, 119, 242, 0.3)',
                  }
                }}
              >
                Continue with Facebook
              </Button>

              {/* Divider */}
              <Box sx={{ position: 'relative', my: 2 }}>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    px: 2,
                    color: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.5)' 
                      : 'rgba(0, 0, 0, 0.5)',
                  }}
                >
                  or
                </Typography>
              </Box>

              {/* Email */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setAuthMode('email')}
                startIcon={<Email />}
                sx={{
                  py: 1.5,
                  borderColor: 'rgba(0, 255, 198, 0.5)',
                  color: '#00ffc6',
                  fontSize: '15px',
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#00ffc6',
                    backgroundColor: 'rgba(0, 255, 198, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0, 255, 198, 0.2)',
                  }
                }}
              >
                Continue with Email
              </Button>
            </Stack>
          ) : (
            <Box component="form" onSubmit={handleEmailAuth}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoFocus
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 255, 198, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ffc6',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.7)' 
                        : 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ 
                            color: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.5)' 
                              : 'rgba(0, 0, 0, 0.5)' 
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 255, 198, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ffc6',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.7)' 
                        : 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Fingerprint />}
                  sx={{
                    py: 1.5,
                    mt: 1,
                    backgroundColor: '#00ffc6',
                    color: '#0a0a0a',
                    fontSize: '15px',
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#00d9a6',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(0, 255, 198, 0.4)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(0, 255, 198, 0.3)',
                    }
                  }}
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setAuthMode('options')}
                    sx={{ 
                      color: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.7)' 
                        : 'rgba(0, 0, 0, 0.7)',
                      textTransform: 'none',
                      '&:hover': {
                        color: '#00ffc6',
                        backgroundColor: 'transparent',
                      }
                    }}
                  >
                    ← Back
                  </Button>

                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setIsSignUp(!isSignUp)}
                    sx={{ 
                      color: '#00ffc6',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 198, 0.1)',
                      }
                    }}
                  >
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}