import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider, 
  Chip,
  Box,
  useTheme,
  alpha,
  Button
} from '@mui/material';
import { 
  Dashboard,
  Analytics,
  Speed,
  Business,
  Public,
  TrendingUp,
  Settings,
  TableChart,
  PieChart,
  BusinessCenter
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardOption {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  isNew?: boolean;
  isPremium?: boolean;
}

const DashboardSelector: React.FC<{ 
  open: boolean; 
  onClose: () => void; 
  onSalesModeToggle?: () => void; 
}> = ({ open, onClose, onSalesModeToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const dashboards: DashboardOption[] = [
    {
      path: '/',
      label: 'Market Command Center',
      description: 'Comprehensive real-time market intelligence with ALL data',
      icon: <Speed />,
      features: ['500+ Procedures', 'Cockpit Gauges', 'Live Data', 'Territory Intel'],
      isNew: true,
    },
    {
      path: '/enhanced',
      label: 'Enhanced Market Dashboard',
      description: 'Advanced analytics with comprehensive market data',
      icon: <Analytics />,
      features: ['Market Trends', 'Company Analysis', 'Category Insights'],
    },
    {
      path: '/actionable',
      label: 'Actionable Sales Dashboard',
      description: 'Sales-focused insights and actionable opportunities',
      icon: <TrendingUp />,
      features: ['Lead Scoring', 'Opportunity Alerts', 'Sales Metrics'],
    },
    {
      path: '/quantum',
      label: 'Quantum 3D Dashboard',
      description: '3D galaxy visualization of market data',
      icon: <Public />,
      features: ['3D Navigation', 'Spatial Memory', 'Voice Commands'],
      isNew: true,
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 350,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          Market Intelligence
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose your view of the market data
        </Typography>
        
        <List>
          {dashboards.map((dashboard) => (
            <ListItem
              key={dashboard.path}
              button
              onClick={() => handleNavigation(dashboard.path)}
              selected={location.pathname === dashboard.path}
              sx={{
                borderRadius: 2,
                mb: 1,
                background: location.pathname === dashboard.path 
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'transparent',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.05),
                },
                '&.Mui-selected': {
                  background: alpha(theme.palette.primary.main, 0.15),
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === dashboard.path 
                    ? theme.palette.primary.main 
                    : theme.palette.text.secondary,
                }}
              >
                {dashboard.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {dashboard.label}
                    </Typography>
                    {dashboard.isNew && (
                      <Chip 
                        label="NEW" 
                        size="small" 
                        sx={{ 
                          height: 20, 
                          fontSize: 10, 
                          background: theme.palette.success.main,
                          color: 'white'
                        }} 
                      />
                    )}
                    {dashboard.isPremium && (
                      <Chip 
                        label="PREMIUM" 
                        size="small" 
                        sx={{ 
                          height: 20, 
                          fontSize: 10, 
                          background: theme.palette.warning.main,
                          color: 'white'
                        }} 
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {dashboard.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {dashboard.features.map((feature) => (
                        <Chip
                          key={feature}
                          label={feature}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: 10, height: 18 }}
                        />
                      ))}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 3 }} />
        
        {/* Sales Mode Toggle */}
        {onSalesModeToggle && (
          <>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                onSalesModeToggle();
                onClose();
              }}
              startIcon={<BusinessCenter />}
              sx={{
                mb: 3,
                background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FF5252 0%, #45B7B8 100%)',
                  transform: 'scale(1.02)',
                },
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              Switch to Sales Mode
            </Button>
            <Divider sx={{ mb: 3 }} />
          </>
        )}
        
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Data Status
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Procedures</Typography>
            <Chip label="500+" size="small" color="success" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Companies</Typography>
            <Chip label="100+" size="small" color="info" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Territory Data</Typography>
            <Chip label="PREMIUM" size="small" sx={{ background: theme.palette.warning.main, color: 'white' }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Tables Discovered</Typography>
            <Chip label="150+" size="small" color="primary" />
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default DashboardSelector;