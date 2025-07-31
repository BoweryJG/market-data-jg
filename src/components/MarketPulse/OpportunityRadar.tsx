import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  alpha, 
  Paper, 
  Chip,
  useMediaQuery,
  IconButton,
  Slider,
  Stack,
  Grid,
  Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MyLocation, 
  LocationOn, 
  ZoomIn, 
  ZoomOut,
  Speed,
  Group,
  AttachMoney,
  TrendingUp 
} from '@mui/icons-material';

interface OpportunityData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'underserved' | 'high-growth' | 'competitive-gap';
  score: number;
  details: {
    population: number;
    providers: number;
    avgRevenue: number;
    growthRate: number;
  };
}

interface OpportunityRadarProps {
  marketData: any;
  onOpportunityClick?: (opportunity: OpportunityData) => void;
  radius: number;
  isAnimating: boolean;
}

const OpportunityRadar: React.FC<OpportunityRadarProps> = ({
  marketData, 
  onOpportunityClick, 
  radius = 50, 
  isAnimating
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [radarRadius, setRadarRadius] = useState(radius);
  const [scanAngle, setScanAngle] = useState(0);

  // Mock center location (user's location)
  const centerLocation = { lat: 28.5383, lng: -81.3792 }; // Orlando, FL

  // Generate opportunity data based on market gaps
  const opportunities: OpportunityData[] = useMemo(() => [
    {
      id: 'opp1',
      name: 'Kissimmee Expansion',
      lat: 28.2920,
      lng: -81.4076,
      type: 'underserved',
      score: 92,
      details: {
        population: 72000,
        providers: 12,
        avgRevenue: 450000,
        growthRate: 18.5
      }
    },
    {
      id: 'opp2',
      name: 'Winter Park Premium',
      lat: 28.6000,
      lng: -81.3392,
      type: 'high-growth',
      score: 88,
      details: {
        population: 31000,
        providers: 45,
        avgRevenue: 780000,
        growthRate: 15.2
      }
    },
    {
      id: 'opp3',
      name: 'Lake Mary Tech Gap',
      lat: 28.7589,
      lng: -81.3176,
      type: 'competitive-gap',
      score: 85,
      details: {
        population: 16000,
        providers: 22,
        avgRevenue: 620000,
        growthRate: 12.8
      }
    },
    {
      id: 'opp4',
      name: 'Altamonte Springs',
      lat: 28.6612,
      lng: -81.3656,
      type: 'underserved',
      score: 79,
      details: {
        population: 46000,
        providers: 18,
        avgRevenue: 520000,
        growthRate: 14.1
      }
    },
    {
      id: 'opp5',
      name: 'Oviedo Growth Zone',
      lat: 28.6700,
      lng: -81.2081,
      type: 'high-growth',
      score: 76,
      details: {
        population: 41000,
        providers: 25,
        avgRevenue: 580000,
        growthRate: 16.7
      }
    }
  ], []);

  // Radar scanning animation
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setScanAngle(prev => (prev + 2) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  const getOpportunityColor = (type: string) => {
    switch (type) {
      case 'underserved':
        return theme.palette.warning.main;
      case 'high-growth':
        return theme.palette.success.main;
      case 'competitive-gap':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const calculateDistance = (lat: number,  lng: number) => {
    // Simplified distance calculation for demo
    const dx = lat - centerLocation.lat;
    const dy = lng - centerLocation.lng;
    return Math.sqrt(dx * dx + dy * dy) * 69; // Convert to approximate miles
  };

  const calculatePosition = (lat: number,  lng: number,  containerSize: number) => {
    const distance = calculateDistance(lat, lng);
    const angle = Math.atan2(lng - centerLocation.lng, lat - centerLocation.lat);
    const scaledDistance = (distance / radarRadius) * (containerSize / 2 - 50);
    
    return {
      x: containerSize / 2 + scaledDistance * Math.cos(angle),
      y: containerSize / 2 + scaledDistance * Math.sin(angle)
    };
  };

  // Mobile-optimized touch handlers
  const handleOpportunitySelect = (opportunity: OpportunityData) => {
    setSelectedOpportunity(opportunity.id);
    if (onOpportunityClick) {
      onOpportunityClick(opportunity);
    }
  };

  const containerSize = isMobile ? 300 : isTablet ? 400 : 500;

  return (
    <Box sx={{ position: 'relative',  width: '100%',  height: '100%' }}>
      {/* Mobile Controls */}
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          mb: 2, 
          justifyContent: 'center', 
          flexWrap: 'wrap'
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton 
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
            size={isMobile ? "small" : "medium"}
          >
            <ZoomOut />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'center' }}>
            {Math.round(zoomLevel * 100)}%
          </Typography>
          <IconButton 
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
            size={isMobile ? "small" : "medium"}
          >
            <ZoomIn />
          </IconButton>
        </Stack>
        
        <Box sx={{ width: isMobile ? '100%' : 200, mt: isMobile ? 1 : 0 }}>
          <Typography variant="caption" gutterBottom>
            Scan Radius: {radarRadius} miles
          </Typography>
          <Slider
            value={radarRadius}
            onChange={(_: Event,  value: number | number[]) => setRadarRadius(value as number)}
            min={10}
            max={100}
            size="small"
          />
        </Box>
      </Stack>

      {/* Radar Display */}
      <Box
        sx={{
          position: 'relative',
          width: containerSize,
          height: containerSize,
          margin: '0 auto',
          overflow: 'hidden'
        }}
      >
        <svg
          width={containerSize}
          height={containerSize}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Radar rings */}
          {[1, 0.75, 0.5, 0.25].map((scale, _index) => (
            <circle
              key={_index}
              cx={containerSize / 2}
              cy={containerSize / 2}
              r={(containerSize / 2 - 20) * scale * zoomLevel}
              fill="none"
              stroke={alpha(theme.palette.primary.main, 0.2)}
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          ))}

          {/* Scanning beam */}
          {isAnimating && (
            <motion.line
              x1={containerSize / 2}
              y1={containerSize / 2}
              x2={containerSize / 2 + (containerSize / 2 - 20) * Math.cos(scanAngle * Math.PI / 180) * zoomLevel}
              y2={containerSize / 2 + (containerSize / 2 - 20) * Math.sin(scanAngle * Math.PI / 180) * zoomLevel}
              stroke={alpha(theme.palette.primary.main, 0.5)}
              strokeWidth="2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Scanning trail */}
          {isAnimating && (
            <defs>
              <radialGradient id="scanGradient">
                <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.3" />
                <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity="0" />
              </radialGradient>
            </defs>
          )}
          {isAnimating && (
            <motion.path
              d={`M ${containerSize / 2} ${containerSize / 2} 
                  L ${containerSize / 2 + (containerSize / 2 - 20) * Math.cos((scanAngle - 30) * Math.PI / 180) * zoomLevel} 
                    ${containerSize / 2 + (containerSize / 2 - 20) * Math.sin((scanAngle - 30) * Math.PI / 180) * zoomLevel}
                  A ${(containerSize / 2 - 20) * zoomLevel} ${(containerSize / 2 - 20) * zoomLevel} 0 0 1 
                    ${containerSize / 2 + (containerSize / 2 - 20) * Math.cos(scanAngle * Math.PI / 180) * zoomLevel} 
                    ${containerSize / 2 + (containerSize / 2 - 20) * Math.sin(scanAngle * Math.PI / 180) * zoomLevel}
                  Z`}
              fill="url(#scanGradient)"
              opacity={0.3}
            />
          )}
        </svg>

        {/* Center point (user location) */}
        <motion.div
          style={{
            position: 'absolute',
            left: containerSize / 2,
            top: containerSize / 2,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <MyLocation 
            sx={{ 
              fontSize: isMobile ? 24 : 32,
              color: theme.palette.error.main,
              filter: `drop-shadow(0 0 10px ${alpha(theme.palette.error.main, 0.5)})`
            }} 
          />
        </motion.div>

        {/* Opportunity markers */}
        {opportunities.map((opp) => {
          const pos = calculatePosition(opp.lat, opp.lng, containerSize);
          const distance = calculateDistance(opp.lat, opp.lng);
          
          if (distance > radarRadius) return null;

          return (
            <motion.div
              key={opp.id}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: selectedOpportunity === opp.id ? 10 : 1
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: selectedOpportunity === opp.id ? 1.5 : 1,
                opacity: 1 
              }}
              whileHover={{ scale: 1.2 }}
              onClick={() => handleOpportunitySelect(opp)}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: isMobile ? 40 : 50,
                  height: isMobile ? 40 : 50,
                  borderRadius: '50%',
                  backgroundColor: alpha(getOpportunityColor(opp.type), 0.2),
                  border: `2px solid ${getOpportunityColor(opp.type)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography 
                  variant={isMobile ? "caption" : "body2"} 
                  fontWeight="bold"
                  color={getOpportunityColor(opp.type)}
                >
                  {opp.score}
                </Typography>
              </Box>
            </motion.div>
          );
        })}
      </Box>

      {/* Mobile-optimized opportunity details */}
      <AnimatePresence>
        {selectedOpportunity && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{
              position: isMobile ? 'fixed' : 'absolute',
              bottom: isMobile ? 0 : 16,
              left: isMobile ? 0 : 16,
              right: isMobile ? 0 : 'auto',
              zIndex: 1000
            }}
          >
            <Paper
              elevation={8}
              sx={{
                p: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.98),
                backdropFilter: 'blur(10px)',
                borderRadius: isMobile ? '16px 16px 0 0' : 2,
                maxWidth: isMobile ? '100%' : 300
              }}
            >
              {(() => {
                const opp = opportunities.find(o => o.id === selectedOpportunity);
                if (!opp) return null;

                return (
                  <>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {opp.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={opp.type.replace('-', ' ')}
                          sx={{ 
                            backgroundColor: alpha(getOpportunityColor(opp.type), 0.2),
                            color: getOpportunityColor(opp.type),
                            mt: 0.5
                          }}
                        />
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={() => setSelectedOpportunity(null)}
                      >
                        ×
                      </IconButton>
                    </Box>

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Stack spacing={0.5}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Group sx={{ fontSize: 16 }} />
                            <Typography variant="caption" color="text.secondary">
                              Population
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="medium">
                            {opp.details.population.toLocaleString()}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={0.5}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <LocationOn sx={{ fontSize: 16 }} />
                            <Typography variant="caption" color="text.secondary">
                              Providers
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="medium">
                            {opp.details.providers}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={0.5}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <AttachMoney sx={{ fontSize: 16 }} />
                            <Typography variant="caption" color="text.secondary">
                              Avg Revenue
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="medium">
                            ${(opp.details.avgRevenue / 1000).toFixed(0)}k
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={0.5}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <TrendingUp sx={{ fontSize: 16 }} />
                            <Typography variant="caption" color="text.secondary">
                              Growth
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            +{opp.details.growthRate}%
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>

                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => onOpportunityClick?.(opp)}
                    >
                      Analyze Opportunity
                    </Button>
                  </>
                );
              })()}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <Box
        sx={{
          position: isMobile ? 'relative' : 'absolute',
          bottom: isMobile ? 'auto' : 16,
          right: isMobile ? 'auto' : 16,
          mt: isMobile ? 2 : 0,
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          gap: 1,
          p: 1.5,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'center' : 'flex-start'
        }}
      >
        <Chip
          size="small"
          icon={<Speed />}
          label="Underserved"
          sx={{ 
            backgroundColor: alpha(theme.palette.warning.main, 0.2),
            color: theme.palette.warning.main 
          }}
        />
        <Chip
          size="small"
          icon={<TrendingUp />}
          label="High Growth"
          sx={{ 
            backgroundColor: alpha(theme.palette.success.main, 0.2),
            color: theme.palette.success.main 
          }}
        />
        <Chip
          size="small"
          icon={<Group />}
          label="Tech Gap"
          sx={{ 
            backgroundColor: alpha(theme.palette.info.main, 0.2),
            color: theme.palette.info.main 
          }}
        />
      </Box>
    </Box>
  );
};


OpportunityRadar.displayName = 'OpportunityRadar';export default OpportunityRadar;