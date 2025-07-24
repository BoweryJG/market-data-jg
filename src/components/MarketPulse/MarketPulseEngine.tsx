import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Stack,
  Fab,
  Zoom,
  Card,
  CardContent,
  Button,
  Badge,
  Grid
} from '@mui/material';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Favorite,
  Timeline,
  Speed,
  TrendingUp,
  LocationOn,
  AttachMoney,
  Group,
  Psychology,
  Insights,
  AutoAwesome,
  PlayArrow,
  Pause,
  Layers,
  FilterAlt,
  ZoomIn,
  ZoomOut,
  ThreeDRotation,
  WaterDrop,
  LocalFireDepartment,
  AcUnit
} from '@mui/icons-material';
import BodyHeatmap from './BodyHeatmap';
import VelocityStreams from './VelocityStreams';
import OpportunityRadar from './OpportunityRadar';
import MetricCalculator from './MetricCalculator';
import { marketPulseService } from '../../services/marketPulseService';

interface MarketPulseEngineProps {
  onProcedureSelect?: (procedure: any) => void;
  onOpportunityIdentified?: (opportunity: any) => void;
}

const MarketPulseEngine: React.FC<MarketPulseEngineProps> = ({
  onProcedureSelect,
  onOpportunityIdentified
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedView, setSelectedView] = useState<'body' | 'streams' | 'radar'>('body');
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<number>(2025);
  const [activeLayers, setActiveLayers] = useState<string[]>(['demographics', 'procedures']);
  const [pulseRate, setPulseRate] = useState<number>(60); // Market pulse BPM
  const controls = useAnimation();

  // Unique metrics calculation
  const uniqueMetrics = useMemo(() => {
    if (!marketData) return null;
    
    return {
      marketVelocity: marketPulseService.calculateMarketVelocity(marketData),
      convergenceIndex: marketPulseService.calculateConvergenceIndex(marketData),
      opportunityGap: marketPulseService.calculateOpportunityGap(marketData),
      revenuePerMinute: marketPulseService.calculateRevenuePerMinute(marketData),
      floridaEffect: marketPulseService.calculateFloridaEffect(marketData),
      pulseRate: pulseRate
    };
  }, [marketData, pulseRate]);

  // Load market data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await marketPulseService.getMarketPulseData({
          state: selectedState,
          year: timeRange
        });
        setMarketData(data);
        
        // Calculate market pulse rate based on growth velocity
        const velocity = data.metrics?.averageGrowthRate || 5;
        setPulseRate(Math.min(120, 60 + velocity * 4));
      } catch (error) {
        console.error('Error loading market data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedState, timeRange]);

  // Heartbeat animation
  useEffect(() => {
    if (isPlaying) {
      const beatDuration = 60000 / pulseRate; // Convert BPM to milliseconds
      const interval = setInterval(() => {
        controls.start({
          scale: [1, 1.05, 1],
          transition: { duration: 0.3 }
        });
      }, beatDuration);
      return () => clearInterval(interval);
    }
  }, [isPlaying, pulseRate, controls]);

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: string | null) => {
    if (newView !== null) {
      setSelectedView(newView as 'body' | 'streams' | 'radar');
    }
  };

  const handleLayerToggle = (layer: string) => {
    setActiveLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer)
        : [...prev, layer]
    );
  };

  const renderMetricCard = (
    title: string, 
    value: string | number, 
    icon: React.ReactNode, 
    color: string,
    subtitle?: string
  ) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.02)} 100%)`,
          borderTop: `3px solid ${color}`,
          cursor: 'pointer',
          '&:hover': {
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Box sx={{ color, display: 'flex' }}>
              {icon}
            </Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight="bold" color={color}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderVisualization = () => {
    switch (selectedView) {
      case 'body':
        return (
          <BodyHeatmap
            marketData={marketData}
            onProcedureSelect={setSelectedProcedure}
            activeLayers={activeLayers}
            isAnimating={isPlaying}
          />
        );
      case 'streams':
        return (
          <VelocityStreams
            marketData={marketData}
            selectedState={selectedState}
            onStateSelect={setSelectedState}
            isAnimating={isPlaying}
          />
        );
      case 'radar':
        return (
          <OpportunityRadar
            marketData={marketData}
            onOpportunityClick={onOpportunityIdentified}
            radius={50}
            isAnimating={isPlaying}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box ref={containerRef} sx={{ width: '100%', minHeight: '90vh', position: 'relative' }}>
      {/* Header with Pulse Indicator */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <motion.div animate={controls}>
            <Favorite 
              sx={{ 
                fontSize: 48, 
                color: theme.palette.error.main,
                filter: `drop-shadow(0 0 20px ${alpha(theme.palette.error.main, 0.5)})`
              }} 
            />
          </motion.div>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Market Pulse Engine™
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Real-time market vitals • {pulseRate} BPM • ${uniqueMetrics?.revenuePerMinute || 0}/min
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <IconButton onClick={() => setIsPlaying(!isPlaying)} size="large">
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Box>
        </Box>

        {/* Unique Metrics Dashboard */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            {renderMetricCard(
              'Market Velocity',
              uniqueMetrics?.marketVelocity?.score || '0',
              <Speed />,
              theme.palette.primary.main,
              uniqueMetrics?.marketVelocity?.trend
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            {renderMetricCard(
              'Convergence Index',
              `${uniqueMetrics?.convergenceIndex || 0}%`,
              <Psychology />,
              theme.palette.secondary.main,
              'Dental + Aesthetic overlap'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            {renderMetricCard(
              'Opportunity Gap',
              uniqueMetrics?.opportunityGap?.score || '0',
              <AutoAwesome />,
              theme.palette.warning.main,
              `${uniqueMetrics?.opportunityGap?.locations || 0} locations`
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            {renderMetricCard(
              'Revenue/Minute',
              `$${uniqueMetrics?.revenuePerMinute || 0}`,
              <AttachMoney />,
              theme.palette.success.main,
              'Per provider minute'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            {renderMetricCard(
              'Florida Effect',
              `+${uniqueMetrics?.floridaEffect?.impact || 0}%`,
              <WaterDrop />,
              theme.palette.info.main,
              'Migration impact'
            )}
          </Grid>
        </Grid>
      </Box>

      {/* View Selector */}
      <Box display="flex" justifyContent="center" mb={3}>
        <ToggleButtonGroup
          value={selectedView}
          exclusive
          onChange={handleViewChange}
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)'
          }}
        >
          <ToggleButton value="body" sx={{ px: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Group />
              <Typography>Body Map</Typography>
            </Stack>
          </ToggleButton>
          <ToggleButton value="streams" sx={{ px: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Timeline />
              <Typography>Velocity Streams</Typography>
            </Stack>
          </ToggleButton>
          <ToggleButton value="radar" sx={{ px: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOn />
              <Typography>Opportunity Radar</Typography>
            </Stack>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Main Visualization Area */}
      <Paper 
        elevation={0}
        sx={{ 
          position: 'relative',
          minHeight: '600px',
          background: `radial-gradient(ellipse at center, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 70%)`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
          overflow: 'hidden',
          p: 3
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedView}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%' }}
          >
            {renderVisualization()}
          </motion.div>
        </AnimatePresence>

        {/* Layer Controls */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Tooltip title="Toggle Layers">
            <Fab
              size="small"
              color="primary"
              onClick={() => {}}
              sx={{ boxShadow: theme.shadows[8] }}
            >
              <Layers />
            </Fab>
          </Tooltip>
          {['demographics', 'technology', 'competition', 'insurance'].map((layer) => (
            <Zoom in={true} key={layer}>
              <Chip
                label={layer}
                size="small"
                onClick={() => handleLayerToggle(layer)}
                color={activeLayers.includes(layer) ? 'primary' : 'default'}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            </Zoom>
          ))}
        </Box>

        {/* Time Machine Slider */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            p: 2,
            borderRadius: 2,
            boxShadow: theme.shadows[8]
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Time Machine
          </Typography>
          <Slider
            value={timeRange}
            onChange={(_: Event, value: number | number[]) => setTimeRange(value as number)}
            min={2020}
            max={2030}
            marks={[
              { value: 2020, label: '2020' },
              { value: 2025, label: '2025' },
              { value: 2030, label: '2030' }
            ]}
            valueLabelDisplay="on"
            sx={{
              '& .MuiSlider-thumb': {
                backgroundColor: theme.palette.primary.main,
                border: '2px solid white',
                '&:hover': {
                  boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`
                }
              }
            }}
          />
        </Box>
      </Paper>

      {/* Selected Procedure Details */}
      <AnimatePresence>
        {selectedProcedure && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            style={{
              position: 'fixed',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 350,
              zIndex: 1000
            }}
          >
            <MetricCalculator
              procedure={selectedProcedure}
              marketData={marketData}
              onClose={() => setSelectedProcedure(null)}
              onActionTaken={onProcedureSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};


MarketPulseEngine.displayName = 'MarketPulseEngine';export default MarketPulseEngine;