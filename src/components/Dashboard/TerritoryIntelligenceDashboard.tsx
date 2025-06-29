import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  styled,
  alpha,
} from '@mui/material';
import {
  LocationOn,
  TrendingUp,
  People,
  Star,
  Instagram,
  LinkedIn,
  YouTube,
  Assessment,
  Lock,
  LockOpen,
  Map as MapIcon,
  Business,
  AttachMoney,
  Visibility,
  VisibilityOff,
  OpenInNew,
  LocalHospital,
  MonetizationOn,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import PremiumContainer from '../common/PremiumContainer';
import { navbarColors } from '../../styles/navbarStyles';
import { supabase } from '../../services/supabaseClient';

// Animations
const mapPulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const influenceGlow = keyframes`
  0%, 100% { box-shadow: 0 0 8px rgba(255, 0, 255, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 0, 255, 0.6); }
`;

const premiumShimmer = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

// Styled Components
const TerritoryCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(navbarColors.panelDark, 0.95)} 0%,
    ${alpha(navbarColors.panelDarker, 0.9)} 100%)`,
  border: `1px solid ${navbarColors.borderColor}`,
  borderRadius: '16px',
  backdropFilter: 'blur(20px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 32px ${alpha(navbarColors.purplePrimary, 0.2)}`,
  },
}));

const InfluenceLeaderCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(navbarColors.gemDeep, 0.1)} 0%,
    ${alpha(navbarColors.gemImpossible, 0.05)} 100%)`,
  border: `1px solid ${alpha(navbarColors.gemImpossible, 0.3)}`,
  borderRadius: '12px',
  padding: theme.spacing(2),
  animation: `${influenceGlow} 3s ease-in-out infinite`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(navbarColors.gemImpossible, 0.1)}, transparent)`,
    animation: `${premiumShimmer} 2s infinite`,
  },
}));

const PremiumBlur = styled(Box)(({ theme }) => ({
  filter: 'blur(3px)',
  transition: 'filter 0.3s ease',
  position: 'relative',
  '&::after': {
    content: '"🔒 Premium"',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: navbarColors.gemImpossible,
    fontWeight: 'bold',
    fontSize: '0.9rem',
    background: alpha(navbarColors.bgDark, 0.9),
    padding: '4px 12px',
    borderRadius: '20px',
    border: `1px solid ${navbarColors.gemImpossible}`,
    filter: 'none',
    pointerEvents: 'none',
  },
}));

const GeographicHeatmap = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '200px',
  background: `linear-gradient(45deg,
    ${alpha(navbarColors.blueAccent, 0.1)} 0%,
    ${alpha(navbarColors.greenAccent, 0.15)} 25%,
    ${alpha(navbarColors.yellowAccent, 0.2)} 50%,
    ${alpha(navbarColors.orangeAccent, 0.25)} 75%,
    ${alpha(navbarColors.pinkAccent, 0.3)} 100%)`,
  borderRadius: '12px',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${mapPulse} 4s ease-in-out infinite`,
}));

// Types
interface TerritoryData {
  id: string;
  name: string;
  state: string;
  providerCount: number;
  influenceScore: number;
  marketSize: number;
  growthRate: number;
  opportunityScore: number;
  topInfluencers: InfluenceLeader[];
  competitiveDensity: number;
  avgRevenue: number;
}

interface InfluenceLeader {
  id: string;
  name: string;
  specialty: string;
  kolScore: number;
  instagramFollowers: number;
  linkedinConnections: number;
  youtubeSubscribers: number;
  realselfRating: number;
  location: string;
  verified: boolean;
}

interface TerritoryIntelligenceDashboardProps {
  isPremium?: boolean;
  selectedTerritory?: string;
  onTerritorySelect?: (territory: string) => void;
}

const TerritoryIntelligenceDashboard: React.FC<TerritoryIntelligenceDashboardProps> = ({
  isPremium = false,
  selectedTerritory = 'florida',
  onTerritorySelect,
}) => {
  const theme = useTheme();
  const [territories, setTerritories] = useState<TerritoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'influencers' | 'opportunities'>('overview');
  const [showPreview, setShowPreview] = useState(!isPremium);

  // Mock data for demonstration - replace with real Supabase queries
  const mockTerritoryData: TerritoryData[] = [
    {
      id: 'florida',
      name: 'Florida',
      state: 'FL',
      providerCount: 2847,
      influenceScore: 85,
      marketSize: 2.4e9,
      growthRate: 12.3,
      opportunityScore: 92,
      competitiveDensity: 68,
      avgRevenue: 485000,
      topInfluencers: [
        {
          id: '1',
          name: 'Dr. Sarah Martinez',
          specialty: 'Aesthetic Dentistry',
          kolScore: 94,
          instagramFollowers: 287000,
          linkedinConnections: 15600,
          youtubeSubscribers: 45200,
          realselfRating: 4.9,
          location: 'Miami, FL',
          verified: true,
        },
        {
          id: '2',
          name: 'Dr. Michael Chen',
          specialty: 'Orthodontics',
          kolScore: 89,
          instagramFollowers: 156000,
          linkedinConnections: 12800,
          youtubeSubscribers: 28900,
          realselfRating: 4.8,
          location: 'Tampa, FL',
          verified: true,
        },
        {
          id: '3',
          name: 'Dr. Jennifer Williams',
          specialty: 'Oral Surgery',
          kolScore: 87,
          instagramFollowers: 94000,
          linkedinConnections: 9200,
          youtubeSubscribers: 31500,
          realselfRating: 4.9,
          location: 'Orlando, FL',
          verified: false,
        },
      ],
    },
  ];

  useEffect(() => {
    const fetchTerritoryData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual Supabase queries
        // const { data: providerData } = await supabase
        //   .from('provider_market_insights')
        //   .select('*')
        //   .eq('state', selectedTerritory.toUpperCase());
        
        // For now, use mock data
        setTerritories(mockTerritoryData);
      } catch (error) {
        console.error('Error fetching territory data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerritoryData();
  }, [selectedTerritory]);

  const currentTerritory = territories.find(t => t.id === selectedTerritory) || territories[0];

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const renderInfluenceLeader = (leader: InfluenceLeader, index: number, isBlurred: boolean = false) => {
    const content = (
      <InfluenceLeaderCard>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: leader.verified ? navbarColors.greenAccent : navbarColors.orangeAccent,
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            {leader.verified ? <Star /> : <LocalHospital />}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" color={navbarColors.textPrimary} fontWeight="bold">
              {leader.name}
            </Typography>
            <Typography variant="body2" color={navbarColors.textSecondary}>
              {leader.specialty} • {leader.location}
            </Typography>
          </Box>
          <Chip
            label={`KOL: ${leader.kolScore}`}
            size="small"
            sx={{
              bgcolor: alpha(navbarColors.gemImpossible, 0.2),
              color: navbarColors.gemImpossible,
              fontWeight: 'bold',
            }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <Instagram sx={{ color: navbarColors.pinkAccent, mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color={navbarColors.textPrimary}>
                {(leader.instagramFollowers / 1000).toFixed(0)}K
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <LinkedIn sx={{ color: navbarColors.blueAccent, mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color={navbarColors.textPrimary}>
                {(leader.linkedinConnections / 1000).toFixed(1)}K
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <YouTube sx={{ color: navbarColors.orangeAccent, mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color={navbarColors.textPrimary}>
                {(leader.youtubeSubscribers / 1000).toFixed(0)}K
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <Star sx={{ color: navbarColors.yellowAccent, mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color={navbarColors.textPrimary}>
                {leader.realselfRating}/5.0
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </InfluenceLeaderCard>
    );

    return isBlurred ? <PremiumBlur key={leader.id}>{content}</PremiumBlur> : content;
  };

  if (loading) {
    return (
      <PremiumContainer>
        <Box p={3}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography color={navbarColors.textSecondary}>
            Loading territory intelligence data...
          </Typography>
        </Box>
      </PremiumContainer>
    );
  }

  return (
    <PremiumContainer>
      <Box p={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" color={navbarColors.textPrimary} fontWeight="bold" mb={1}>
              Territory Intelligence
            </Typography>
            <Typography variant="body1" color={navbarColors.textSecondary}>
              Geographic market insights & provider influence analysis
            </Typography>
          </Box>
          
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: navbarColors.textSecondary }}>Territory</InputLabel>
              <Select
                value={selectedTerritory}
                onChange={(e) => onTerritorySelect?.(e.target.value)}
                sx={{
                  color: navbarColors.textPrimary,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: navbarColors.borderColor,
                  },
                }}
              >
                <MenuItem value="florida">Florida</MenuItem>
                <MenuItem value="california">California</MenuItem>
                <MenuItem value="texas">Texas</MenuItem>
                <MenuItem value="new-york">New York</MenuItem>
              </Select>
            </FormControl>

            {!isPremium && (
              <Button
                variant="contained"
                startIcon={<Lock />}
                sx={{
                  bgcolor: navbarColors.gemImpossible,
                  color: 'white',
                  '&:hover': { bgcolor: navbarColors.gemDeep },
                }}
              >
                Upgrade to Premium
              </Button>
            )}
          </Box>
        </Box>

        {/* Territory Overview */}
        {currentTerritory && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={8}>
              <TerritoryCard>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" color={navbarColors.textPrimary} fontWeight="bold">
                      {currentTerritory.name} Market Overview
                    </Typography>
                    <Chip
                      label={`Opportunity Score: ${currentTerritory.opportunityScore}`}
                      sx={{
                        bgcolor: alpha(navbarColors.greenAccent, 0.2),
                        color: navbarColors.greenAccent,
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>

                  <GeographicHeatmap>
                    <Box textAlign="center">
                      <MapIcon sx={{ fontSize: 48, color: navbarColors.blueAccent, mb: 1 }} />
                      <Typography variant="h6" color={navbarColors.textPrimary}>
                        Provider Density Heatmap
                      </Typography>
                      <Typography variant="body2" color={navbarColors.textSecondary}>
                        {currentTerritory.providerCount} Active Providers
                      </Typography>
                    </Box>
                  </GeographicHeatmap>

                  <Grid container spacing={2} mt={2}>
                    <Grid item xs={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color={navbarColors.greenAccent} fontWeight="bold">
                          {formatNumber(currentTerritory.marketSize)}
                        </Typography>
                        <Typography variant="body2" color={navbarColors.textSecondary}>
                          Market Size
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color={navbarColors.blueAccent} fontWeight="bold">
                          {currentTerritory.growthRate}%
                        </Typography>
                        <Typography variant="body2" color={navbarColors.textSecondary}>
                          Growth Rate
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color={navbarColors.purplePrimary} fontWeight="bold">
                          {currentTerritory.influenceScore}
                        </Typography>
                        <Typography variant="body2" color={navbarColors.textSecondary}>
                          Influence Score
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color={navbarColors.orangeAccent} fontWeight="bold">
                          {formatNumber(currentTerritory.avgRevenue)}
                        </Typography>
                        <Typography variant="body2" color={navbarColors.textSecondary}>
                          Avg Revenue
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </TerritoryCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <TerritoryCard sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color={navbarColors.textPrimary} fontWeight="bold" mb={2}>
                    Territory Metrics
                  </Typography>
                  
                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color={navbarColors.textSecondary}>
                        Market Saturation
                      </Typography>
                      <Typography variant="body2" color={navbarColors.textPrimary}>
                        {currentTerritory.competitiveDensity}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={currentTerritory.competitiveDensity}
                      sx={{
                        bgcolor: alpha(navbarColors.borderColor, 0.3),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: currentTerritory.competitiveDensity > 70 
                            ? navbarColors.orangeAccent 
                            : navbarColors.greenAccent,
                        },
                      }}
                    />
                  </Box>

                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color={navbarColors.textSecondary}>
                        Growth Momentum
                      </Typography>
                      <Typography variant="body2" color={navbarColors.textPrimary}>
                        {currentTerritory.growthRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(currentTerritory.growthRate * 5, 100)}
                      sx={{
                        bgcolor: alpha(navbarColors.borderColor, 0.3),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: navbarColors.blueAccent,
                        },
                      }}
                    />
                  </Box>

                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color={navbarColors.textSecondary}>
                        Influence Penetration
                      </Typography>
                      <Typography variant="body2" color={navbarColors.textPrimary}>
                        {currentTerritory.influenceScore}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={currentTerritory.influenceScore}
                      sx={{
                        bgcolor: alpha(navbarColors.borderColor, 0.3),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: navbarColors.gemImpossible,
                        },
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Assessment />}
                    sx={{
                      borderColor: navbarColors.borderColor,
                      color: navbarColors.textPrimary,
                      '&:hover': {
                        borderColor: navbarColors.purplePrimary,
                        bgcolor: alpha(navbarColors.purplePrimary, 0.1),
                      },
                    }}
                  >
                    Detailed Analytics
                  </Button>
                </CardContent>
              </TerritoryCard>
            </Grid>
          </Grid>
        )}

        {/* Influence Leaders Section */}
        <TerritoryCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" color={navbarColors.textPrimary} fontWeight="bold">
                Top Influence Leaders
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {!isPremium && (
                  <Tooltip title="Premium feature - Limited preview">
                    <IconButton size="small">
                      <Lock sx={{ color: navbarColors.gemImpossible }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Button
                  size="small"
                  variant="text"
                  endIcon={<OpenInNew />}
                  sx={{ color: navbarColors.blueAccent }}
                >
                  View All
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {currentTerritory?.topInfluencers.map((leader, index) => (
                <Grid item xs={12} md={4} key={leader.id}>
                  {renderInfluenceLeader(leader, index, !isPremium && index > 0)}
                </Grid>
              ))}
            </Grid>

            {!isPremium && (
              <Box mt={3} textAlign="center">
                <Typography variant="body2" color={navbarColors.textSecondary} mb={2}>
                  Unlock complete influence leader profiles and territory analytics
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<MonetizationOn />}
                  sx={{
                    bgcolor: navbarColors.gemImpossible,
                    color: 'white',
                    '&:hover': { bgcolor: navbarColors.gemDeep },
                    px: 4,
                  }}
                >
                  Upgrade to Premium Territory Intelligence
                </Button>
              </Box>
            )}
          </CardContent>
        </TerritoryCard>
      </Box>
    </PremiumContainer>
  );
};

export default TerritoryIntelligenceDashboard;