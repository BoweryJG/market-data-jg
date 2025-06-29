import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  useTheme,
  styled,
} from '@mui/material';
import {
  TrendingUp,
  ShowChart,
  AttachMoney,
  Business,
  Assessment,
  Speed,
  Timeline,
  Analytics,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import TerritoryIntelWidget from '../Widgets/TerritoryIntelWidget';

// Kinetic animations
const dataFlow = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100%); opacity: 0; }
`;

const pulseGlow = keyframes`
  0%, 100% {
    opacity: 0.6;
    box-shadow: 0 0 10px currentColor;
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
  }
`;

const ledFlicker = keyframes`
  0%, 100% { opacity: 1; }
  95% { opacity: 0.8; }
`;

// Premium market overview card
const MarketOverviewCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  background: `
    linear-gradient(135deg, #1a1a1a 0%, #252525 20%, #1e1e1e 40%, #2a2a2a 60%, #1f1f1f 80%, #1a1a1a 100%),
    linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.02) 50%, transparent 52%)
  `,
  backgroundSize: '100% 100%, 20px 20px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5)
  `,
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',
}));

// Enhanced metric card with kinetic effects
const MetricCard = styled(Card)<{ accentColor: string }>(({ theme, accentColor }) => ({
  position: 'relative',
  background: 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 50%, #1a1a1a 100%)',
  borderRadius: '12px',
  border: `1px solid ${accentColor}33`,
  boxShadow: `
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 0 20px ${accentColor}22
  `,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `
      0 8px 30px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.08) inset,
      0 0 30px ${accentColor}44
    `,
    border: `1px solid ${accentColor}66`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '2px',
    height: '100%',
    background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)`,
    animation: `${dataFlow} 3s linear infinite`,
  },
}));

// LED indicator for status
const LEDIndicator = styled(Box)<{ color: string }>(({ theme, color }) => ({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: color,
  boxShadow: `0 0 8px ${color}, inset 0 0 2px rgba(0, 0, 0, 0.3)`,
  animation: `${ledFlicker} 3s infinite`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: '30%',
    height: '30%',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    filter: 'blur(1px)',
  },
}));

// Enhanced gauge component
const KineticGauge = styled(Box)<{ value: number; color: string }>(({ theme, value, color }) => ({
  position: 'relative',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  background: `conic-gradient(from 0deg, ${color} 0% ${value}%, rgba(255,255,255,0.1) ${value}% 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${pulseGlow} 3s infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '3px',
    borderRadius: '50%',
    background: '#1a1a1a',
  },
}));

// Categories section with glass effects
const CategoriesSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 50%, #1e1e1e 100%)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '24px',
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-50%',
    width: '50%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent)',
    animation: `${keyframes`
      0% { left: -50%; }
      100% { left: 100%; }
    `} 8s linear infinite`,
    pointerEvents: 'none',
  },
}));

// Mock market data
const mockMarketData = {
  totalValue: 247800000,
  activeDeals: 1847,
  conversionRate: 23.4,
  marketTrend: 8.7,
  categories: [
    { name: 'Enterprise SaaS', deals: 234, value: 89400000, growth: 12.3, color: '#4bd48e' },
    { name: 'Healthcare Tech', deals: 189, value: 67200000, growth: 8.9, color: '#00d4ff' },
    { name: 'FinTech', deals: 156, value: 91200000, growth: 15.6, color: '#9f58fa' },
    { name: 'AI/ML Solutions', deals: 143, value: 78300000, growth: 22.1, color: '#ff6b35' },
    { name: 'Cybersecurity', deals: 98, value: 45600000, growth: 6.8, color: '#ffd93d' },
    { name: 'IoT Platforms', deals: 87, value: 34200000, growth: 18.4, color: '#f53969' },
  ],
  recentActivity: [
    { type: 'deal_closed', company: 'TechCorp Inc', value: 2400000, time: '5 min ago' },
    { type: 'new_lead', company: 'DataSolutions LLC', value: 1800000, time: '12 min ago' },
    { type: 'proposal_sent', company: 'CloudVentures', value: 3100000, time: '18 min ago' },
  ]
};

const EnhancedMarketCommandCenterWithWidget: React.FC = () => {
  const theme = useTheme();
  const [marketData, setMarketData] = useState(mockMarketData);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Orbitron, monospace',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff, #9f58fa, #4B96DC)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Market Command Center
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
          Real-time market intelligence and territory optimization
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Section - Market Overview */}
        <Grid item xs={12} lg={8}>
          {/* Key Metrics Row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <MetricCard accentColor="#4bd48e">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <AttachMoney sx={{ color: '#4bd48e', fontSize: 20 }} />
                    <LEDIndicator color="#4bd48e" />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#4bd48e', fontWeight: 700, fontFamily: 'Orbitron, monospace' }}>
                    {formatCurrency(marketData.totalValue)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Total Pipeline
                  </Typography>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={6} md={3}>
              <MetricCard accentColor="#00d4ff">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Business sx={{ color: '#00d4ff', fontSize: 20 }} />
                    <LEDIndicator color="#00d4ff" />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#00d4ff', fontWeight: 700, fontFamily: 'Orbitron, monospace' }}>
                    {formatNumber(marketData.activeDeals)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Active Deals
                  </Typography>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={6} md={3}>
              <MetricCard accentColor="#9f58fa">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <TrendingUp sx={{ color: '#9f58fa', fontSize: 20 }} />
                    <KineticGauge value={marketData.conversionRate} color="#9f58fa">
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'relative',
                          zIndex: 1,
                          color: '#9f58fa',
                          fontWeight: 'bold',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        {marketData.conversionRate}%
                      </Typography>
                    </KineticGauge>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Conversion Rate
                  </Typography>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={6} md={3}>
              <MetricCard accentColor="#ff6b35">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <ShowChart sx={{ color: '#ff6b35', fontSize: 20 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUp sx={{ color: '#4bd48e', fontSize: 12 }} />
                      <Typography variant="caption" sx={{ color: '#4bd48e', fontWeight: 700 }}>
                        +{marketData.marketTrend}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 700, fontFamily: 'Orbitron, monospace' }}>
                    Trending
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Market Growth
                  </Typography>
                </CardContent>
              </MetricCard>
            </Grid>
          </Grid>

          {/* Categories Section */}
          <CategoriesSection>
            <Typography
              variant="h6"
              sx={{
                color: '#ffffff',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 600,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Assessment sx={{ color: '#9f58fa' }} />
              Market Categories
            </Typography>

            <Grid container spacing={2}>
              {marketData.categories.map((category, index) => (
                <Grid item xs={12} sm={6} md={4} key={category.name}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
                      border: `1px solid ${category.color}33`,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        border: `1px solid ${category.color}66`,
                        boxShadow: `0 4px 20px ${category.color}22`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: category.color,
                            fontWeight: 600,
                            fontSize: '0.85rem',
                          }}
                        >
                          {category.name}
                        </Typography>
                        <Chip
                          label={`+${category.growth}%`}
                          size="small"
                          sx={{
                            background: `${category.color}22`,
                            color: category.color,
                            border: `1px solid ${category.color}44`,
                            fontSize: '0.7rem',
                            height: '20px',
                          }}
                        />
                      </Box>
                      
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#ffffff',
                          fontWeight: 700,
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.9rem',
                          mb: 0.5,
                        }}
                      >
                        {formatCurrency(category.value)}
                      </Typography>
                      
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        {category.deals} active deals
                      </Typography>
                      
                      <LinearProgress
                        variant="determinate"
                        value={(category.deals / marketData.activeDeals) * 100}
                        sx={{
                          mt: 1,
                          height: 3,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: category.color,
                            borderRadius: 2,
                          },
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CategoriesSection>
        </Grid>

        {/* Right Section - Territory Intelligence Widget */}
        <Grid item xs={12} lg={4}>
          <TerritoryIntelWidget />
          
          {/* Recent Activity Card */}
          <MarketOverviewCard sx={{ mt: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#ffffff',
                  fontFamily: 'Orbitron, monospace',
                  fontWeight: 600,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: '0.9rem',
                }}
              >
                <Timeline sx={{ color: '#4bd48e', fontSize: 20 }} />
                Recent Activity
              </Typography>

              {marketData.recentActivity.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    mb: 1,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(159, 88, 250, 0.3)',
                    },
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                      }}
                    >
                      {activity.company}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#4bd48e',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    >
                      {formatCurrency(activity.value)}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#64748b',
                        fontSize: '0.7rem',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </MarketOverviewCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EnhancedMarketCommandCenterWithWidget;