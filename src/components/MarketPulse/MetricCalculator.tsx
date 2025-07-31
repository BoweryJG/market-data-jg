import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Divider,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  SwipeableDrawer
} from '@mui/material';

import {
  Close,
  AttachMoney,
  Speed,
  Schedule,
  TrendingUp,
  Psychology,
  Calculate,
  Lightbulb,
  ExpandMore,
  ExpandLess,
  Phone,
  Email,
  CalendarToday,
  CheckCircle
} from '@mui/icons-material';

interface MetricCalculatorProps {
  procedure: any;
  marketData: any;
  onClose: () => void;
  onActionTaken?: (action: string) => void;
}

const MetricCalculator: React.FC<MetricCalculatorProps> = ({
  procedure,
  marketData,
  onClose,
  onActionTaken
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedSection, setExpandedSection] = useState<string | null>('metrics');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  // Calculate unique metrics
  const calculateMetrics = () => {
    const baseRevenue = procedure.marketSize || 1000;
    const growthRate = procedure.growth || 10;
    const intensity = procedure.intensity || 0.5;

    // Revenue per minute calculation
    const avgProcedureTime = 45; // minutes
    const avgProcedurePrice = baseRevenue * 50; // simplified
    const proceduresPerDay = 8; // average
    const revenuePerMinute = (avgProcedurePrice / avgProcedureTime);

    // Market velocity score
    const velocityScore = Math.round(
      (growthRate * 2) + 
      (intensity * 30) + 
      (proceduresPerDay * 3)
    );

    // Convergence opportunities
    const convergenceScore = procedure.procedures?.includes('Dental') && 
                           procedure.procedures?.includes('Botox') ? 85 : 45;

    // Competition vacuum score
    const providerDensity = marketData?.providerDensity || 60;
    const demandScore = intensity * 100;
    const vacuumScore = Math.max(0, demandScore - providerDensity);

    return {
      revenuePerMinute: Math.round(revenuePerMinute),
      velocityScore,
      convergenceScore,
      vacuumScore: Math.round(vacuumScore),
      totalOpportunity: Math.round(baseRevenue * growthRate / 10),
      timeToROI: Math.round(12 / (growthRate / 10))
    };
  };

  const metrics = calculateMetrics();

  const handleAction = (action: string) => {
    setSelectedActions(prev => 
      prev.includes(action) 
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
    if (onActionTaken) {
      onActionTaken(action);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {procedure.bodyArea || 'Market Opportunity'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
        <Box display="flex" gap={1} mt={1} flexWrap="wrap">
          {procedure.procedures?.slice(0, 3).map((proc: string) => (
            <Chip key={proc} label={proc} size="small" variant="outlined" />
          ))}
        </Box>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Key Metrics Section */}
        <Box>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center"
            onClick={() => toggleSection('metrics')}
            sx={{ cursor: 'pointer', mb: 1 }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Revolutionary Metrics™
            </Typography>
            {expandedSection === 'metrics' ? <ExpandLess /> : <ExpandMore />}
          </Box>
          
          <Collapse in={expandedSection === 'metrics'}>
            <Stack spacing={2}>
              {/* Revenue Per Minute */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AttachMoney sx={{ color: theme.palette.success.main }} />
                  <Typography variant="subtitle2">Revenue Per Minute™</Typography>
                </Box>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  ${metrics.revenuePerMinute}/min
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Every minute of provider time generates this revenue
                </Typography>
              </Paper>

              {/* Market Velocity */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Speed sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="subtitle2">Market Velocity Score™</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {metrics.velocityScore}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(metrics.velocityScore, 100)}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Speed of market adoption and growth
                </Typography>
              </Paper>

              {/* Convergence Score */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Psychology sx={{ color: theme.palette.secondary.main }} />
                  <Typography variant="subtitle2">Convergence Index™</Typography>
                </Box>
                <Typography variant="h5" color="secondary" fontWeight="bold">
                  {metrics.convergenceScore}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Dental + Aesthetic procedure overlap potential
                </Typography>
              </Paper>

              {/* Competition Vacuum */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Lightbulb sx={{ color: theme.palette.warning.main }} />
                  <Typography variant="subtitle2">Competition Vacuum™</Typography>
                </Box>
                <Typography variant="h5" color="warning.main" fontWeight="bold">
                  {metrics.vacuumScore}% gap
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Unmet demand vs. provider capacity
                </Typography>
              </Paper>
            </Stack>
          </Collapse>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Sales Intelligence */}
        <Box>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center"
            onClick={() => toggleSection('sales')}
            sx={{ cursor: 'pointer', mb: 1 }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Sales Intelligence
            </Typography>
            {expandedSection === 'sales' ? <ExpandLess /> : <ExpandMore />}
          </Box>

          <Collapse in={expandedSection === 'sales'}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Opportunity
                </Typography>
                <Typography variant="h5" color="primary">
                  ${metrics.totalOpportunity}M
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Time to ROI
                </Typography>
                <Typography variant="h6">
                  {metrics.timeToROI} months
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Key Success Factors
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle sx={{ fontSize: 18, color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="High-income demographic presence"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle sx={{ fontSize: 18, color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Limited sophisticated competition"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle sx={{ fontSize: 18, color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Strong growth trajectory"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                </List>
              </Box>
            </Stack>
          </Collapse>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Action Items */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Recommended Actions
          </Typography>
          <Stack spacing={1}>
            <Button
              fullWidth
              variant={selectedActions.includes('call') ? 'contained' : 'outlined'}
              startIcon={<Phone />}
              onClick={() => handleAction('call')}
              size={isMobile ? 'medium' : 'large'}
            >
              Schedule Discovery Call
            </Button>
            <Button
              fullWidth
              variant={selectedActions.includes('email') ? 'contained' : 'outlined'}
              startIcon={<Email />}
              onClick={() => handleAction('email')}
              size={isMobile ? 'medium' : 'large'}
            >
              Send Market Analysis
            </Button>
            <Button
              fullWidth
              variant={selectedActions.includes('demo') ? 'contained' : 'outlined'}
              startIcon={<CalendarToday />}
              onClick={() => handleAction('demo')}
              size={isMobile ? 'medium' : 'large'}
            >
              Book ROI Demo
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Footer */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.5)
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Calculate />}
          onClick={() => {
            onActionTaken?.('calculate-roi');
            onClose();
          }}
        >
          Generate Full ROI Report
        </Button>
      </Box>
    </Box>
  );

  // Mobile drawer vs desktop paper
  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={true}
        onClose={onClose}
        onOpen={() => {}}
        PaperProps={{
          sx: {
            borderRadius: '16px 16px 0 0',
            maxHeight: '90vh'
          }
        }}
      >
        {renderContent()}
      </SwipeableDrawer>
    );
  }

  return (
    <Paper
      elevation={12}
      sx={{
        width: 350,
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: alpha(theme.palette.background.paper, 0.98),
        backdropFilter: 'blur(10px)'
      }}
    >
      {renderContent()}
    </Paper>
  );
};

MetricCalculator.displayName = 'MetricCalculator';export default MetricCalculator;