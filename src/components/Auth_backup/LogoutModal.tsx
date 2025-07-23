import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  IconButton,
  Typography,
  Box,
  Stack,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../auth';

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ open, onClose }) => {
  const { signOut, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      onClose();
    } catch (error) {
      // Logout error occurred
      setLoading(false);
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
          overflow: 'hidden',
          maxWidth: '400px'
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
          Sign Out
        </Typography>
      </Box>

      <DialogContent sx={{ px: 4, py: 4 }}>
        <Stack spacing={3} alignItems="center">
          {/* User Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
            }}
          >
            <PersonIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>

          {/* User Email */}
          {user?.email && (
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                textAlign: 'center'
              }}
            >
              {user.email}
            </Typography>
          )}

          {/* Confirmation Message */}
          <Typography 
            variant="h6" 
            sx={{ 
              textAlign: 'center',
              fontWeight: 500
            }}
          >
            Are you sure you want to sign out?
          </Typography>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={onClose}
              disabled={loading}
              sx={{
                borderColor: '#e0e0e0',
                color: 'text.primary',
                textTransform: 'none',
                fontSize: '0.95rem',
                py: 1.2,
                '&:hover': {
                  borderColor: '#d0d0d0',
                  backgroundColor: 'rgba(0,0,0,0.02)'
                }
              }}
            >
              Cancel
            </Button>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={loading ? null : <LogoutIcon />}
              onClick={handleLogout}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
                textTransform: 'none',
                fontSize: '0.95rem',
                py: 1.2,
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(244, 67, 54, 0.6)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Out'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutModal;
