import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack,
  useTheme,
  useMediaQuery,
  Paper,
  alpha,
  Fab,
  Zoom
} from '@mui/material';
import { 
  Dashboard, 
  TrendingUp, 
  Assessment,
  People
} from '@mui/icons-material';
import { MarketPulseEngine } from '../components/MarketPulse';
import { useNavigate } from 'react-router-dom';

const MarketPulsePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [trackedProcedures, setTrackedProcedures] = useState<any[]>([]);

  const handleProcedureSelect = (procedure: any) => {
    setSelectedProcedure(procedure);
    // Add to CRM tracking
    if (!trackedProcedures.find(p => p.bodyArea === procedure.bodyArea)) {
      setTrackedProcedures([...trackedProcedures, { 
        ...procedure, 
        trackedAt: new Date().toISOString(),
        status: 'active'
      }]);
    }
  };

  const handleOpportunityIdentified = (opportunity: any) => {
    // Navigate to sales dashboard with opportunity data
    navigate('/sales', { state: { opportunity } });
  };

  return (
    <Container maxWidth={false} sx={{ py: isMobile ? 2 : 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack 
          direction={isMobile ? 'column' : 'row'} 
          justifyContent="space-between" 
          alignItems={isMobile ? 'stretch' : 'center'}
          spacing={2}
        >
          <Box>
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" gutterBottom>
              Market Intelligence Hub
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Live market vitals and opportunity detection powered by exclusive data
            </Typography>
          </Box>
          
          <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Dashboard />}
              onClick={() => navigate('/dashboard')}
              fullWidth={isMobile}
            >
              Classic View
            </Button>
            <Button
              variant="contained"
              startIcon={<People />}
              onClick={() => navigate('/sales')}
              fullWidth={isMobile}
            >
              Sales Mode
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Main Market Pulse Engine */}
      <MarketPulseEngine
        onProcedureSelect={handleProcedureSelect}
        onOpportunityIdentified={handleOpportunityIdentified}
      />

      {/* Tracked Procedures (CRM Integration) */}
      {trackedProcedures.length > 0 && (
        <Paper
          elevation={4}
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment />
            Tracked Procedures ({trackedProcedures.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            These procedures are being monitored for growth and sales opportunities
          </Typography>
          
          <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mt: 2 }} flexWrap="wrap">
            {trackedProcedures.map((proc, _index) => (
              <Paper
                key={_index}
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
                onClick={() => setSelectedProcedure(proc)}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {proc.bodyArea}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${(proc.marketSize / 1000).toFixed(1)}B • +{proc.growth}%
                </Typography>
                <Typography variant="caption" color="primary">
                  {proc.procedures.length} procedures
                </Typography>
              </Paper>
            ))}
          </Stack>
          
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            startIcon={<TrendingUp />}
            onClick={() => navigate('/sales', { state: { trackedProcedures } })}
          >
            Generate Sales Report for Tracked Procedures
          </Button>
        </Paper>
      )}

      {/* Mobile FAB for quick actions */}
      {isMobile && (
        <Zoom in={true}>
          <Fab
            color="primary"
            sx={{
              position: 'fixed', 
              bottom: 16, 
              right: 16, 
              zIndex: 1000
            }}
            onClick={() => navigate('/sales')}
          >
            <People />
          </Fab>
        </Zoom>
      )}
    </Container>
  );
};

MarketPulsePage.displayName = 'MarketPulsePage';

export default MarketPulsePage;