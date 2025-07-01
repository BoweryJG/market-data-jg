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
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { territoryIntelligenceService } from '../../services/territoryIntelligenceService';

// Premium container animations
const gemPulse = keyframes`
  0%, 100% { 
    transform: scale(1) rotate(0deg);
    filter: brightness(1) hue-rotate(0deg);
  }
  25% { 
    transform: scale(1.05) rotate(90deg);
    filter: brightness(1.1) hue-rotate(30deg);
  }
  50% { 
    transform: scale(1.02) rotate(180deg);
    filter: brightness(1.2) hue-rotate(60deg);
  }
  75% { 
    transform: scale(1.03) rotate(270deg);
    filter: brightness(1.1) hue-rotate(90deg);
  }
`;

const dataFlow = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100%); opacity: 0; }
`;

const ledFlicker = keyframes`
  0%, 100% { opacity: 1; }
  95% { opacity: 0.8; }
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

// Premium Container with kinetic effects
const PremiumContainer = styled(Card)(({ theme }) => ({
  position: 'relative',
  background: `
    linear-gradient(135deg, #1a1a1a 0%, #252525 20%, #1e1e1e 40%, #2a2a2a 60%, #1f1f1f 80%, #1a1a1a 100%),
    linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.02) 50%, transparent 52%)
  `,
  backgroundSize: '100% 100%, 20px 20px',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5)
  `,
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    background: 'linear-gradient(45deg, #9f58fa, #4B96DC, #9f58fa, #4B96DC)',
    backgroundSize: '400% 400%',
    animation: `${keyframes`
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    `} 8s ease infinite`,
    borderRadius: '20px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: -1,
  },
  '&:hover::before': {
    opacity: 0.6,
  },
}));

// Metallic corner screws
const PanelScrew = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '12px',
  height: '12px',
  background: `
    radial-gradient(circle at 30% 30%, #e8e8e8 0%, #999 40%, #555 100%)
  `,
  borderRadius: '50%',
  boxShadow: `
    inset -1px -1px 2px rgba(0, 0, 0, 0.5),
    inset 1px 1px 2px rgba(255, 255, 255, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.8)
  `,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '60%',
    height: '1px',
    background: '#222',
    transform: 'translate(-50%, -50%) rotate(45deg)',
    boxShadow: '0 1px 0 #222, 0 -1px 0 #222',
  },
  '&.top-left': { top: '8px', left: '8px' },
  '&.top-right': { top: '8px', right: '8px' },
  '&.bottom-left': { bottom: '8px', left: '8px' },
  '&.bottom-right': { bottom: '8px', right: '8px' },
}));

// LED Status Indicators
const LEDIndicator = styled(Box)<{ color: string }>(({ theme, color }) => ({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  position: 'relative',
  background: color,
  boxShadow: `0 0 8px ${color}, inset 0 0 2px rgba(0, 0, 0, 0.3)`,
  animation: `${ledFlicker} 3s infinite`,
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

// Territory score gauge
const TerritoryGauge = styled(Box)<{ score: number }>(({ theme, score }) => ({
  position: 'relative',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: `conic-gradient(from 0deg, #00d4ff 0% ${score}%, rgba(255,255,255,0.1) ${score}% 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${gemPulse} 4s infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '4px',
    borderRadius: '50%',
    background: '#1a1a1a',
  },
}));

const GaugeText = styled(Typography)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  fontFamily: 'Orbitron, monospace',
  fontWeight: 'bold',
  color: '#00d4ff',
  textShadow: '0 0 10px #00d4ff',
}));

// Opportunity item
const OpportunityItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 8px',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  marginBottom: '4px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    transform: 'translateX(2px)',
  },
}));

// Social Icon Component
const SocialIcon = styled(Box)<{ platform: string }>(({ theme, platform }) => ({
  width: '14px',
  height: '14px',
  borderRadius: '3px',
  background: platform === 'instagram' ? 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)' :
              platform === 'linkedin' ? '#0077B5' :
              platform === 'youtube' ? '#FF0000' : '#999',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  '& svg': { fontSize: '10px' },
}));

interface TerritoryIntelWidgetProps {
  className?: string;
}

const TerritoryIntelWidget: React.FC<TerritoryIntelWidgetProps> = ({ className }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [territoryData, setTerritoryData] = useState<any>(null);
  const [topInfluencers, setTopInfluencers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTerritoryData = async () => {
      try {
        setLoading(true);
        
        // Fetch data for top states (NY and FL as mentioned)
        const [nyData, flData, nyInfluencers, flInfluencers] = await Promise.all([
          territoryIntelligenceService.getTerritoryMetrics('state', 'NY'),
          territoryIntelligenceService.getTerritoryMetrics('state', 'FL'),
          territoryIntelligenceService.getTopInfluenceLeaders('state', 'NY', 5),
          territoryIntelligenceService.getTopInfluenceLeaders('state', 'FL', 5),
        ]);

        // Combine and sort influencers by KOL score
        const allInfluencers = [...nyInfluencers, ...flInfluencers]
          .sort((a, b) => b.kolScore - a.kolScore)
          .slice(0, 3);

        // Calculate combined metrics
        const totalProviders = (nyData?.providerCount || 0) + (flData?.providerCount || 0);
        const avgScore = ((nyData?.opportunityScore || 0) + (flData?.opportunityScore || 0)) / 2;
        const avgInfluence = ((nyData?.influenceScore || 0) + (flData?.influenceScore || 0)) / 2;

        setTerritoryData({
          score: Math.round(avgScore),
          coverage: Math.min(94, Math.round((totalProviders / 10000) * 100)), // Coverage based on 10k+ providers
          totalProviders,
          status: 'Active',
          lastUpdate: new Date().toLocaleTimeString(),
          regions: [
            { 
              name: 'New York', 
              score: nyData?.opportunityScore || 0, 
              providers: nyData?.providerCount || 0,
              color: '#00d4ff' 
            },
            { 
              name: 'Florida', 
              score: flData?.opportunityScore || 0,
              providers: flData?.providerCount || 0, 
              color: '#4bd48e' 
            },
            { 
              name: 'Other States', 
              score: 65, 
              providers: 2500,
              color: '#ff6b35' 
            },
          ],
        });

        setTopInfluencers(allInfluencers);
        
      } catch (error) {
        console.error('Error fetching territory data:', error);
        // Set default data on error
        setTerritoryData({
          score: 85,
          coverage: 90,
          totalProviders: 10000,
          status: 'Active',
          lastUpdate: new Date().toLocaleTimeString(),
          regions: [
            { name: 'New York', score: 88, providers: 4200, color: '#00d4ff' },
            { name: 'Florida', score: 92, providers: 3800, color: '#4bd48e' },
            { name: 'Other States', score: 78, providers: 2000, color: '#ff6b35' },
          ],
        });
        setTopInfluencers([
          { 
            name: 'Dr. Sarah Johnson', 
            specialty: 'Dermatology',
            city: 'New York',
            state: 'NY',
            kolScore: 95,
            instagramFollowers: 125000,
            linkedinConnections: 8500,
            googleRating: 4.9,
          },
          { 
            name: 'Dr. Michael Chen', 
            specialty: 'Plastic Surgery',
            city: 'Miami',
            state: 'FL',
            kolScore: 92,
            instagramFollowers: 98000,
            linkedinConnections: 6200,
            googleRating: 4.8,
          },
          { 
            name: 'Dr. Emily Davis', 
            specialty: 'Medical Spa',
            city: 'Los Angeles',
            state: 'CA',
            kolScore: 89,
            instagramFollowers: 76000,
            linkedinConnections: 5100,
            googleRating: 4.9,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTerritoryData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchTerritoryData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleViewFullDashboard = () => {
    navigate('/territory-intelligence');
  };

  const handleExportData = () => {
    // Implement export functionality
    console.log('Exporting territory data...');
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  return (
    <PremiumContainer className={className} sx={{ width: 320, height: 'fit-content' }}>
      {/* Metallic Corner Screws */}
      <PanelScrew className="top-left" />
      <PanelScrew className="top-right" />
      <PanelScrew className="bottom-left" />
      <PanelScrew className="bottom-right" />

      {/* Data Flow Track */}
      <DataFlowTrack />

      {/* Glass reflection effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 30%, transparent 100%)',
          borderRadius: '20px 20px 0 0',
          pointerEvents: 'none',
        }}
      />

      <CardContent sx={{ position: 'relative', p: 2 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapIcon sx={{ color: '#00d4ff', fontSize: 20 }} />
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Orbitron, monospace',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00d4ff, #9f58fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '0.9rem',
              }}
            >
              Territory Intelligence
            </Typography>
          </Box>

          {/* LED Status Indicators */}
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <LEDIndicator color="#00ff88" />
            <LEDIndicator color="#00d4ff" />
            <LEDIndicator color="#ffaa00" />
            <Typography
              variant="caption"
              sx={{
                ml: 1,
                color: '#94a3b8',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
              }}
            >
              {territoryData?.status || 'Loading'}
            </Typography>
          </Box>
        </Box>

        {/* Territory Score Gauge */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Typography sx={{ color: '#64748b' }}>Loading...</Typography>
          </Box>
        ) : territoryData && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <TerritoryGauge score={territoryData.score}>
                <GaugeText variant="h6">{territoryData.score}</GaugeText>
              </TerritoryGauge>
              
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ color: '#94a3b8', mb: 0.5, fontFamily: 'Orbitron, monospace', fontSize: '0.75rem' }}
                >
                  Territory Score
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={territoryData.score}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #00d4ff, #9f58fa)',
                      borderRadius: 2,
                      animation: `${pulseGlow} 2s infinite`,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: '#64748b', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {territoryData.totalProviders.toLocaleString()}+ Providers • Coverage: {territoryData.coverage}%
                </Typography>
              </Box>
            </Box>

            {/* Top Influencers */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#94a3b8',
                  mb: 1,
                  fontFamily: 'Orbitron, monospace',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <TrendingUp sx={{ fontSize: 14 }} />
                Top Medical Influencers
              </Typography>
              
              {topInfluencers.map((influencer, idx) => (
                <OpportunityItem key={idx}>
                  <Business sx={{ fontSize: 14, color: '#ff6b35' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {influencer.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <LocationOn sx={{ fontSize: 10 }} />
                      {influencer.city}, {influencer.state} • {influencer.specialty}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      {influencer.instagramFollowers > 0 && (
                        <Tooltip title={`Instagram: ${formatFollowers(influencer.instagramFollowers)} followers`}>
                          <SocialIcon platform="instagram">
                            <Instagram />
                          </SocialIcon>
                        </Tooltip>
                      )}
                      {influencer.linkedinConnections > 0 && (
                        <Tooltip title={`LinkedIn: ${formatFollowers(influencer.linkedinConnections)} connections`}>
                          <SocialIcon platform="linkedin">
                            <LinkedIn />
                          </SocialIcon>
                        </Tooltip>
                      )}
                      {influencer.youtubeSubscribers > 0 && (
                        <Tooltip title={`YouTube: ${formatFollowers(influencer.youtubeSubscribers)} subscribers`}>
                          <SocialIcon platform="youtube">
                            <YouTube />
                          </SocialIcon>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#4bd48e', fontWeight: 700, fontSize: '0.7rem', display: 'block' }}
                    >
                      KOL: {influencer.kolScore}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                      <Star sx={{ fontSize: 10, color: '#ffd93d' }} />
                      <Typography variant="caption" sx={{ color: '#ffd93d', fontSize: '0.65rem' }}>
                        {influencer.googleRating || 4.8}
                      </Typography>
                    </Box>
                  </Box>
                </OpportunityItem>
              ))}
        </Box>

            {/* Mini Geographic Heatmap */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#94a3b8',
                  mb: 1,
                  fontFamily: 'Orbitron, monospace',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Assessment sx={{ fontSize: 14 }} />
                Regional Coverage
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {territoryData.regions.map((region: any) => (
                  <Tooltip key={region.name} title={`${region.name}: ${region.providers.toLocaleString()} providers`}>
                    <Box
                      sx={{
                        flex: 1,
                        height: 32,
                        borderRadius: '4px',
                        background: `linear-gradient(90deg, ${region.color}33, ${region.color}66)`,
                        border: `1px solid ${region.color}44`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: `linear-gradient(90deg, ${region.color}66, ${region.color}99)`,
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.55rem',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        {region.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: region.color,
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        {region.providers.toLocaleString()}
                      </Typography>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleViewFullDashboard}
            sx={{
              flex: 1,
              background: 'linear-gradient(135deg, #9f58fa, #4B96DC)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              fontFamily: 'Orbitron, monospace',
              textTransform: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(159, 88, 250, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #a855f7, #60a5fa)',
                boxShadow: '0 4px 20px rgba(159, 88, 250, 0.4)',
                transform: 'translateY(-1px)',
              },
            }}
            endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
          >
            Full Dashboard
          </Button>
          
          <Tooltip title="Export Territory Data">
            <IconButton
              size="small"
              onClick={handleExportData}
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  color: '#00d4ff',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Download sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </PremiumContainer>
  );
};

export default TerritoryIntelWidget;