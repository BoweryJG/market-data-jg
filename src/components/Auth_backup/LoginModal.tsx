import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
  Stack,
  CircularProgress,
  Link,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../auth';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignup?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onSwitchToSignup }) => {
  const { signInWithEmail, signInWithProvider } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: 'google' | 'facebook') => {
    setLoadingProvider(provider);
    setError(null);
    try {
      await signInWithProvider(provider);
      // OAuth redirect will happen, no need to close modal
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setLoadingProvider(null);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header with gradient background */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          px: 3,
          py: 2,
          position: 'relative'
        }}
      >
        <IconButton 
          onClick={onClose} 
          sx={{ 
            position: 'absolute', 
            right: 8, 
            top: 8,
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
          Welcome Back
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
          Sign in to access your market intelligence dashboard
        </Typography>
      </Box>

      <DialogContent sx={{ px: 4, py: 3 }}>
        {/* Social login buttons */}
        <Stack spacing={2} mb={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={() => handleProviderSignIn('google')}
            disabled={loadingProvider !== null}
            sx={{
              borderColor: '#e0e0e0',
              color: '#5f6368',
              textTransform: 'none',
              fontSize: '0.95rem',
              py: 1.5,
              '&:hover': {
                borderColor: '#d0d0d0',
                backgroundColor: '#f8f9fa'
              }
            }}
          >
            {loadingProvider === 'google' ? (
              <CircularProgress size={20} />
            ) : (
              'Continue with Google'
            )}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<FacebookIcon />}
            onClick={() => handleProviderSignIn('facebook')}
            disabled={loadingProvider !== null}
            sx={{
              borderColor: '#e0e0e0',
              color: '#1877f2',
              textTransform: 'none',
              fontSize: '0.95rem',
              py: 1.5,
              '&:hover': {
                borderColor: '#1877f2',
                backgroundColor: '#f0f2ff'
              }
            }}
          >
            {loadingProvider === 'facebook' ? (
              <CircularProgress size={20} />
            ) : (
              'Continue with Facebook'
            )}
          </Button>
        </Stack>

        {/* Divider */}
        <Box sx={{ position: 'relative', my: 3 }}>
          <Divider>
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              OR
            </Typography>
          </Divider>
        </Box>

        {/* Email login form */}
        <form onSubmit={handleEmailSubmit}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || loadingProvider !== null}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || loadingProvider !== null}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            />

            {error && (
              <Typography 
                color="error" 
                variant="body2" 
                sx={{ 
                  backgroundColor: '#ffebee',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  fontSize: '0.875rem'
                }}
              >
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || loadingProvider !== null}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                fontSize: '1rem',
                py: 1.5,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link 
                href="#" 
                underline="hover" 
                sx={{ 
                  color: '#667eea',
                  fontSize: '0.875rem',
                  display: 'block',
                  mb: 1
                }}
              >
                Forgot your password?
              </Link>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link 
                  href="#" 
                  underline="hover" 
                  onClick={(e) => {
                    e.preventDefault();
                    onSwitchToSignup?.();
                  }}
                  sx={{ color: '#667eea', fontWeight: 500 }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
