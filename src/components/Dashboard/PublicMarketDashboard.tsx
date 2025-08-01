import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Paper,
  Backdrop,
  alpha,
  styled,
} from '@mui/material';
import {
  TrendingUp,
  Lock,
  Visibility,
  Star,
  Login,
  AccountCircle,
} from '@mui/icons-material';
import { QuickLoginModal } from '../Auth/QuickLoginModal';

// Styled components for teaser effects
const BlurredContent = styled(Box)(({ theme }) => ({
  filter: 'blur(4px)',
  transition: 'filter 0.3s ease',
  userSelect: 'none',
  pointerEvents: 'none',
}));

const PremiumOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  backdropFilter: 'blur(2px)',
  borderRadius: theme.shape.borderRadius,
  zIndex: 1,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #7B42F6 30%, #00ffc6 90%)',
  borderRadius: '20px',
  border: 0,
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: '0 3px 5px 2px rgba(123, 66, 246, .3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #6B32E6 30%, #00e6b6 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 10px 2px rgba(123, 66, 246, .4)',
  },
}));

// Sample data for teaser
const sampleProcedures = [
  { name: 'Botox Injections', category: 'Injectable', price: 350, growth: 15.2, volume: 1250 },
  { name: 'Dermal Fillers', category: 'Injectable', price: 650, growth: 12.8, volume: 980 },
  { name: 'Chemical Peels', category: 'Resurfacing', price: 200, growth: 8.5, volume: 750 },
  { name: 'Laser Hair Removal', category: 'Laser', price: 300, growth: 18.3, volume: 650 },
  { name: 'Microneedling', category: 'Resurfacing', price: 250, growth: 22.1, volume: 580 },
  // Rest will be blurred/locked
  { name: 'CoolSculpting', category: 'Body Contouring', price: 1200, growth: 9.7, volume: 420 },
  { name: 'IPL Photofacial', category: 'Laser', price: 400, growth: 6.2, volume: 380 },
  { name: 'Hydrafacial', category: 'Facial', price: 175, growth: 28.4, volume: 920 },
];

const marketStats = [
  { label: 'Total Procedures', value: '2.1M', isBlurred: false },
  { label: 'Market Growth', value: '+15.7%', isBlurred: false },
  { label: 'Avg Revenue/Patient', value: 'XXX', isBlurred: true },
  { label: 'Market Size', value: 'XXX', isBlurred: true },
];

interface PublicMarketDashboardProps {
  onLoginSuccess?: () => void;
}

export const PublicMarketDashboard: React.FC<PublicMarketDashboardProps> = ({
  onLoginSuccess
}) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    onLoginSuccess?.();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Login CTA */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
          Market Intelligence Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Real-time market data and insights for aesthetic procedures
        </Typography>
        
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            maxWidth: 800,
            mx: 'auto',
            background: 'linear-gradient(135deg, rgba(123, 66, 246, 0.1) 0%, rgba(0, 255, 198, 0.1) 100%)',
            border: '1px solid rgba(123, 66, 246, 0.3)',
            color: 'white',
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="body1">
              🚀 Preview mode - Sign in to unlock full market intelligence
            </Typography>
            <GradientButton 
              startIcon={<Login />}
              onClick={handleLoginClick}
            >
              Sign In
            </GradientButton>
          </Box>
        </Alert>
      </Box>

      {/* Market Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {marketStats.map((stat, _index) => (
          <Grid item xs={12} sm={6} md={3} key={_index}>
            <Card sx={{ position: 'relative', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {stat.isBlurred ? 'XXX' : stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                
                {stat.isBlurred && (
                  <PremiumOverlay>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Lock />}
                      onClick={handleLoginClick}
                      sx={{
                        background: 'linear-gradient(45deg, #7B42F6 30%, #00ffc6 90%)',
                      }}
                    >
                      Unlock
                    </Button>
                  </PremiumOverlay>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Top Procedures Table */}
      <Card sx={{ position: 'relative' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp color="primary" />
              <Typography variant="h5" fontWeight="bold">
                Top Market Procedures
              </Typography>
              <Chip 
                label="Preview Mode" 
                size="small" 
                color="warning"
                variant="outlined"
              />
            </Box>
            <GradientButton 
              startIcon={<Star />}
              onClick={handleLoginClick}
            >
              Unlock Full Data
            </GradientButton>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Procedure</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Avg. Price</TableCell>
                <TableCell>Growth Rate</TableCell>
                <TableCell>Monthly Volume</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleProcedures.map((procedure, _index) => (
                <TableRow key={_index}>
                  <TableCell>
                    <Chip 
                      label={`#${_index + 1}`} 
                      color="primary" 
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {_index < 5 ? (
                      <Typography variant="body2" fontWeight="medium">
                        {procedure.name}
                      </Typography>
                    ) : (
                      <BlurredContent>
                        <Typography variant="body2">
                          Premium Procedure
                        </Typography>
                      </BlurredContent>
                    )}
                  </TableCell>
                  <TableCell>{procedure.category}</TableCell>
                  <TableCell>
                    {_index < 5 ? (
                      <Typography variant="body2">
                        ${procedure.price}
                      </Typography>
                    ) : (
                      <BlurredContent>
                        <Typography variant="body2">$XXX</Typography>
                      </BlurredContent>
                    )}
                  </TableCell>
                  <TableCell>
                    {_index < 5 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TrendingUp color="success" fontSize="small" />
                        <Typography variant="body2" color="success.main">
                          +{procedure.growth}%
                        </Typography>
                      </Box>
                    ) : (
                      <BlurredContent>
                        <Typography variant="body2">+XX%</Typography>
                      </BlurredContent>
                    )}
                  </TableCell>
                  <TableCell>
                    {_index < 5 ? (
                      <Typography variant="body2">
                        {procedure.volume}
                      </Typography>
                    ) : (
                      <BlurredContent>
                        <Typography variant="body2">XXX</Typography>
                      </BlurredContent>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Alert 
            severity="info" 
            sx={{ mt: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleLoginClick}
                startIcon={<Visibility />}
              >
                View All
              </Button>
            }
          >
            Showing 5 of 500+ procedures. Sign in to access complete market intelligence, pricing trends, and competitive analysis.
          </Alert>
        </CardContent>
      </Card>

      {/* Bottom CTA */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Paper 
          sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, rgba(123, 66, 246, 0.1) 0%, rgba(0, 255, 198, 0.1) 100%)',
            border: '1px solid rgba(123, 66, 246, 0.3)',
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Ready to unlock full market intelligence?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Get access to 500+ procedures, real-time pricing data, competitive analysis, and territory insights
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<AccountCircle />}
              onClick={handleLoginClick}
              sx={{
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: '#00ffc6',
                  backgroundColor: 'rgba(0,255,198,0.1)'
                }
              }}
            >
              Sign In
            </Button>
            <GradientButton 
              size="large"
              startIcon={<Star />}
              onClick={handleLoginClick}
            >
              Start Free Trial
            </GradientButton>
          </Box>
        </Paper>
      </Box>

      {/* Login Modal */}
      <QuickLoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </Container>
  );
};

PublicMarketDashboard.displayName = 'PublicMarketDashboard';