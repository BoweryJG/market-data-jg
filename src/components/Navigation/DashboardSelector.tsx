import React from 'react';
import { 
  Drawer, 
  Typography, 
  Divider, 
  Chip,
  Box,
  useTheme,
  alpha,
  Button,
  IconButton
} from '@mui/material';
import { 
  BusinessCenter,
  Close
} from '@mui/icons-material';

const DashboardSelector: React.FC<{ 
  open: boolean; 
  onClose: () => void; 
  onSalesModeToggle?: () => void; 
}> = ({ open, onClose, onSalesModeToggle }) => {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Quick Actions
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
        
        {/* Sales Mode Toggle */}
        {onSalesModeToggle && (
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              onSalesModeToggle();
              onClose();
            }}
            startIcon={<BusinessCenter />}
            sx={{
              mb: 3,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                background: alpha(theme.palette.primary.main, 0.1),
              },
              borderRadius: 2,
              textTransform: 'none',
              py: 1.5,
            }}
          >
            Sales Mode
          </Button>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          System Status
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Data Feed</Typography>
            <Chip label="LIVE" size="small" color="success" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Procedures</Typography>
            <Chip label="500+" size="small" color="info" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Companies</Typography>
            <Chip label="100+" size="small" color="primary" />
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default DashboardSelector;