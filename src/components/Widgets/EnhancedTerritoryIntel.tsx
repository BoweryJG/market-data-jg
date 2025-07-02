import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Tooltip,
  IconButton,
  useTheme,
  styled,
  Tabs,
  Tab,
  Badge,
  Avatar,
  AvatarGroup,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Map as MapIcon,
  TrendingUp,
  People,
  Star,
  OpenInNew,
  Download,
  LocationOn,
  Assessment,
  Business,
  Instagram,
  LinkedIn,
  YouTube,
  ExpandMore,
  ExpandLess,
  Lock,
  CheckCircle,
  Warning,
  Info,
  Timeline,
  EmojiEvents,
  Speed,
  Groups,
  Insights,
  Public,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { territoryIntelligenceService } from '../../services/territoryIntelligenceService';

// Animations
const pulseGlow = keyframes`
  0%, 100% { opacity: 0.6; box-shadow: 0 0 10px currentColor; }
  50% { opacity: 1; box-shadow: 0 0 20px currentColor, 0 0 40px currentColor; }
`;

const dataFlow = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100%); opacity: 0; }
`;

// Premium Container
const PremiumContainer = styled(Card)(({ theme }) => ({
  position: 'relative',
  background: `linear-gradient(135deg, #1a1a1a 0%, #252525 20%, #1e1e1e 40%, #2a2a2a 60%, #1f1f1f 80%, #1a1a1a 100%)`,
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',
  width: '100%',
  minHeight: '500px',
}));

// Data flow track
const DataFlowTrack = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: '50%',
  width: '2px',
  height: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(159, 88, 250, 0.1)',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '20px',
    background: 'linear-gradient(to bottom, transparent, #9f58fa, transparent)',
    animation: `${dataFlow} 2s linear infinite`,
  },
}));

// Tab Panel
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`territory-tabpanel-${index}`}
      aria-labelledby={`territory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

// Metric Card
const MetricCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    transform: 'translateY(-2px)',
  },
}));

// Provider Card
const ProviderCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  marginBottom: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    transform: 'translateX(4px)',
  },
}));

interface EnhancedTerritoryIntelProps {
  isAuthenticated?: boolean;
  userTerritory?: string;
  subscriptionLevel?: 'basic' | 'premium' | 'enterprise';
}

const EnhancedTerritoryIntel: React.FC<EnhancedTerritoryIntelProps> = ({
  isAuthenticated = false,
  userTerritory = 'NY',
  subscriptionLevel = 'basic',
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');
  const [territoryData, setTerritoryData] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    fetchTerritoryData();
  }, [isAuthenticated, userTerritory, subscriptionLevel]);

  const fetchTerritoryData = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated) {
        // Demo mode data
        setTerritoryData({
          totalProviders: 8000,
          averageKOL: 78,
          topSpecialties: [
            { name: 'Dermatology', count: 3200, growth: 15 },
            { name: 'Plastic Surgery', count: 2800, growth: 12 },
            { name: 'Medical Spa', count: 2000, growth: 22 },
          ],
          marketPotential: 4.2,
          competitiveDensity: 68,
          regions: [
            { name: 'New York', providers: 4200, growth: 18, potential: 92 },
            { name: 'Florida', providers: 3800, growth: 24, potential: 88 },
          ],
        });
        
        setProviders([
          {
            id: 1,
            name: 'Dr. Sarah Johnson',
            specialty: 'Dermatology',
            location: 'Manhattan, NY',
            kolScore: 95,
            followers: { instagram: 125000, linkedin: 8500, youtube: 45000 },
            verified: true,
            ranking: 1,
          },
          {
            id: 2,
            name: 'Dr. Michael Chen',
            specialty: 'Plastic Surgery',
            location: 'Miami, FL',
            kolScore: 92,
            followers: { instagram: 98000, linkedin: 6200, youtube: 32000 },
            verified: true,
            ranking: 2,
          },
        ]);
        
        setInsights([
          {
            type: 'opportunity',
            title: 'High Growth Potential',
            description: 'Medical spa services growing 22% YoY in your territory',
            impact: 'high',
          },
          {
            type: 'warning',
            title: 'Competitive Density',
            description: 'Manhattan showing 85% provider saturation',
            impact: 'medium',
          },
        ]);
      } else {
        // Fetch real data based on subscription
        // Implementation for authenticated users
      }
    } catch (error) {
      console.error('Error fetching territory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <PremiumContainer>
      <DataFlowTrack />
      
      <CardContent sx={{ position: 'relative', p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MapIcon sx={{ color: '#00d4ff', fontSize: 32 }} />
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'Orbitron, monospace',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #00d4ff, #9f58fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Territory Intelligence Hub
              </Typography>
              {!isAuthenticated && (
                <Chip
                  label="DEMO MODE"
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #ff6b35, #ff00aa)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    height: '20px',
                  }}
                />
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" sx={{ color: '#94a3b8' }}>
              <Download />
            </IconButton>
            <IconButton size="small" sx={{ color: '#94a3b8' }}>
              <OpenInNew />
            </IconButton>
          </Box>
        </Box>

        {/* Demo Mode Alert */}
        {!isAuthenticated && (
          <Alert
            severity="info"
            sx={{
              mb: 2,
              background: 'rgba(255, 107, 53, 0.1)',
              border: '1px solid rgba(255, 107, 53, 0.3)',
              '& .MuiAlert-icon': { color: '#ff6b35' },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              🔒 Limited Access: Viewing NY & FL data only
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
              Sign up to unlock data for all 50 states and territories
            </Typography>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            mb: 2,
            '& .MuiTab-root': {
              color: '#94a3b8',
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-selected': {
                color: '#00d4ff',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#00d4ff',
            },
          }}
        >
          <Tab label="Overview" icon={<Assessment />} iconPosition="start" />
          <Tab label="Top Providers" icon={<People />} iconPosition="start" />
          <Tab label="Market Insights" icon={<Insights />} iconPosition="start" />
          <Tab label="Heat Map" icon={<Public />} iconPosition="start" disabled={!isAuthenticated} />
        </Tabs>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {/* Overview Metrics */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
            <MetricCard>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Groups sx={{ color: '#00d4ff' }} />
                <Chip label="+18%" size="small" sx={{ background: '#00d4ff22', color: '#00d4ff' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {territoryData?.totalProviders.toLocaleString() || '8,000'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Active Providers
              </Typography>
            </MetricCard>

            <MetricCard>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <EmojiEvents sx={{ color: '#ffd93d' }} />
                <Chip label="High" size="small" sx={{ background: '#ffd93d22', color: '#ffd93d' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {territoryData?.averageKOL || 78}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Avg. KOL Score
              </Typography>
            </MetricCard>

            <MetricCard>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Speed sx={{ color: '#4bd48e' }} />
                <Chip label="+22%" size="small" sx={{ background: '#4bd48e22', color: '#4bd48e' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ${territoryData?.marketPotential || '4.2'}B
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Market Potential
              </Typography>
            </MetricCard>

            <MetricCard>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Timeline sx={{ color: '#ff6b35' }} />
                <Chip label="Medium" size="small" sx={{ background: '#ff6b3522', color: '#ff6b35' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {territoryData?.competitiveDensity || 68}%
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Market Saturation
              </Typography>
            </MetricCard>
          </Box>

          {/* Regional Breakdown */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                cursor: 'pointer',
              }}
              onClick={() => handleToggleSection('regions')}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Regional Breakdown
              </Typography>
              {expandedSection === 'regions' ? <ExpandLess /> : <ExpandMore />}
            </Box>
            
            <Collapse in={expandedSection === 'regions'}>
              {territoryData?.regions.map((region: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    mb: 1,
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOn sx={{ color: '#00d4ff' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {region.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {region.providers.toLocaleString()} providers
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp sx={{ fontSize: 16, color: '#4bd48e' }} />
                      <Typography variant="body2" sx={{ color: '#4bd48e', fontWeight: 600 }}>
                        +{region.growth}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={region.potential}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#00d4ff',
                        },
                      }}
                    />
                  </Box>
                </Box>
              ))}
              
              {!isAuthenticated && (
                <Box
                  sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                    opacity: 0.6,
                  }}
                >
                  <Lock sx={{ color: '#666', mb: 1 }} />
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    48 more states available with subscription
                  </Typography>
                </Box>
              )}
            </Collapse>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Top Providers */}
          {providers.map((provider) => (
            <ProviderCard key={provider.id}>
              <Badge
                badgeContent={`#${provider.ranking}`}
                sx={{
                  '& .MuiBadge-badge': {
                    background: 'linear-gradient(135deg, #ffd93d, #ff6b35)',
                    color: 'white',
                    fontWeight: 700,
                  },
                }}
              >
                <Avatar sx={{ width: 48, height: 48, background: '#9f58fa' }}>
                  {provider.name.split(' ').map((n: string) => n[0]).join('')}
                </Avatar>
              </Badge>
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {provider.name}
                  </Typography>
                  {provider.verified && <CheckCircle sx={{ fontSize: 16, color: '#00d4ff' }} />}
                </Box>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  {provider.specialty} • {provider.location}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                  <Tooltip title={`Instagram: ${provider.followers.instagram.toLocaleString()}`}>
                    <Chip
                      icon={<Instagram sx={{ fontSize: 14 }} />}
                      label={provider.followers.instagram > 1000 
                        ? `${(provider.followers.instagram / 1000).toFixed(0)}K` 
                        : provider.followers.instagram}
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  </Tooltip>
                  <Tooltip title={`LinkedIn: ${provider.followers.linkedin.toLocaleString()}`}>
                    <Chip
                      icon={<LinkedIn sx={{ fontSize: 14 }} />}
                      label={provider.followers.linkedin > 1000 
                        ? `${(provider.followers.linkedin / 1000).toFixed(0)}K` 
                        : provider.followers.linkedin}
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  </Tooltip>
                  <Tooltip title={`YouTube: ${provider.followers.youtube.toLocaleString()}`}>
                    <Chip
                      icon={<YouTube sx={{ fontSize: 14 }} />}
                      label={provider.followers.youtube > 1000 
                        ? `${(provider.followers.youtube / 1000).toFixed(0)}K` 
                        : provider.followers.youtube}
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #4bd48e, #00d4ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {provider.kolScore}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  KOL Score
                </Typography>
              </Box>
            </ProviderCard>
          ))}
          
          {!isAuthenticated && (
            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #ff6b35, #ff00aa)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff8555, #ff20ca)',
                },
              }}
              onClick={() => navigate('/signup')}
            >
              View All 10,000+ Providers
            </Button>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Market Insights */}
          {insights.map((insight, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                p: 2,
                mb: 2,
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {insight.type === 'opportunity' ? (
                <TrendingUp sx={{ color: '#4bd48e', mt: 0.5 }} />
              ) : (
                <Warning sx={{ color: '#ff6b35', mt: 0.5 }} />
              )}
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {insight.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  {insight.description}
                </Typography>
                <Chip
                  label={`${insight.impact} impact`}
                  size="small"
                  sx={{
                    mt: 1,
                    background: insight.impact === 'high' ? '#4bd48e22' : '#ff6b3522',
                    color: insight.impact === 'high' ? '#4bd48e' : '#ff6b35',
                  }}
                />
              </Box>
            </Box>
          ))}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Heat Map - Locked for demo */}
          <Box
            sx={{
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Lock sx={{ fontSize: 48, color: '#666', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1 }}>
                Interactive Heat Map
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Visualize provider density and market opportunities
              </Typography>
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #9f58fa, #4B96DC)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #a855f7, #60a5fa)',
                  },
                }}
                onClick={() => navigate('/signup')}
              >
                Unlock Full Access
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </CardContent>
    </PremiumContainer>
  );
};

export default EnhancedTerritoryIntel;