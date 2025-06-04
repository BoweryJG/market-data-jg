import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../auth';

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
}

const glassStyles = {
  sx: {
    p: 3,
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: 3,
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: '0 16px 32px rgba(0,0,0,0.25)'
  }
};

const LogoutModal: React.FC<LogoutModalProps> = ({ open, onClose }) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={glassStyles}>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Log Out</Typography>
          <IconButton onClick={onClose} size="small" aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to log out?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" onClick={handleLogout}>
          Log Out
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutModal;
