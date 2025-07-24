import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  IconButton, 
  Slider, 
  Tooltip, 
  useTheme,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress
} from '@mui/material';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  PlayArrow, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  ThreeDRotation,
  Timeline,
  Insights,
  TrendingUp,
  TrendingDown,
  AutoAwesome,
  AttachMoney,
  Speed,
  Groups,
  Campaign,
  Schedule,
  Analytics,
  Lightbulb,
  Warning
} from '@mui/icons-material';
import { galaxyDataService, CategoryAggregate, SalesOpportunity, MarketSignal } from '../../services/galaxyDataService';
import ParticleField from './ParticleField';
import CategorySphere from './CategorySphere';
import ConnectionLines from './ConnectionLines';
import DataRipple from './DataRipple';

interface EnhancedCategoryData extends CategoryAggregate {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number };
  color: string;
}

const MarketGalaxyMap: React.FC = () => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<EnhancedCategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EnhancedCategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: -20, y: 0 });
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showConnections, setShowConnections] = useState(true);
  const [ripples, setRipples] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const [industryFilter, setIndustryFilter] = useState<'all' | 'dental' | 'aesthetic'>('all');
  const controls = useAnimation();

  // Calculate category positions in orbital pattern
  const calculateOrbitalPosition = (index: number, total: number, marketSize: number) => {
    const angle = (index / total) * Math.PI * 2;
    const baseRadius = 300;
    const radius = baseRadius + (marketSize / 100) * 30; // Adjusted for real market sizes
    const height = Math.sin(index * 0.5) * 50;
    
    return {
      x: Math.cos(angle) * radius,
      y: height,
      z: Math.sin(angle) * radius
    };
  };

  // Fetch and enrich category data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get category aggregates
        const aggregates = await galaxyDataService.getCategoryAggregates(
          industryFilter === 'all' ? undefined : industryFilter
        );
        
        // Enrich with market intelligence
        const enrichedData = await galaxyDataService.enrichWithMarketIntelligence(aggregates);
        
        // Transform for visualization
        const visualData: EnhancedCategoryData[] = enrichedData.map((cat, index) => ({
          ...cat,
          position: calculateOrbitalPosition(index, enrichedData.length, cat.total_market_size),
          velocity: { 
            x: cat.avg_growth_rate * 0.01, 
            y: cat.innovation_score * 0.001 
          },
          color: cat.trending_direction === 'up' ? theme.palette.success.main : 
                 cat.trending_direction === 'down' ? theme.palette.error.main : 
                 theme.palette.info.main
        }));
        
        setCategories(visualData);
      } catch (err) {
        console.error('Error loading galaxy data:', err);
        setError('Failed to load market data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [theme, industryFilter]);

  // Orbital animation
  useEffect(() => {
    if (isPlaying && !loading) {
      const interval = setInterval(() => {
        setRotation(prev => ({
          ...prev,
          y: (prev.y + 0.5 * timeScale) % 360
        }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPlaying, timeScale, loading]);

  // Handle category click
  const handleCategoryClick = (categoryId: string, event: React.MouseEvent) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      
      // Create ripple effect
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const ripple = {
          id: `ripple-${Date.now()}`,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
        setRipples(prev => [...prev, ripple]);
        
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== ripple.id));
        }, 2000);
      }
    }
  };

  // Calculate market totals
  const marketTotals = useMemo(() => {
    const total = categories.reduce((sum, cat) => sum + cat.total_market_size, 0);
    const avgGrowth = categories.reduce((sum, cat) => sum + cat.avg_growth_rate, 0) / (categories.length || 1);
    const totalOpportunities = categories.reduce((sum, cat) => sum + (cat.sales_opportunities?.length || 0), 0);
    return { total, avgGrowth, totalOpportunities };
  }, [categories]);

  // Render sales actions for selected category
  const renderSalesActions = () => {
    if (!selectedCategory) return null;

    return (
      <Card elevation={6} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Campaign color="primary" />
            Sales Actions
          </Typography>
          
          <Stack spacing={2}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon={<Analytics />}
              onClick={() => console.log('Generate pitch deck for', selectedCategory.name)}
            >
              Generate Pitch Deck
            </Button>
            
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<Groups />}
              onClick={() => console.log('Find decision makers')}
            >
              Find Decision Makers
            </Button>
            
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<Schedule />}
              onClick={() => console.log('Schedule campaign')}
            >
              Schedule Campaign
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // Render opportunities
  const renderOpportunities = (opportunities: SalesOpportunity[]) => {
    return (
      <Card elevation={6} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lightbulb color="warning" />
            Opportunities ({opportunities.length})
          </Typography>
          
          <List dense>
            {opportunities.map((opp) => (
              <ListItem key={opp.id}>
                <ListItemIcon>
                  {opp.type === 'CROSS_SELL' && <AutoAwesome color="primary" />}
                  {opp.type === 'NEW_ACCOUNT' && <Groups color="success" />}
                  {opp.type === 'UPSELL' && <TrendingUp color="info" />}
                </ListItemIcon>
                <ListItemText
                  primary={opp.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {opp.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <AttachMoney fontSize="small" />
                        <Typography variant="caption" color="success.main">
                          ${(opp.potential_revenue / 1000).toFixed(0)}k potential
                        </Typography>
                        <Chip 
                          label={`${(opp.probability * 100).toFixed(0)}% probability`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  // Render market signals
  const renderMarketSignals = (signals: MarketSignal[]) => {
    if (!signals || signals.length === 0) return null;

    return (
      <Card elevation={6}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Speed color="error" />
            Live Market Signals
          </Typography>
          
          <Stack spacing={1}>
            {signals.slice(0, 3).map((signal) => (
              <Alert 
                key={signal.id}
                severity={signal.urgency === 'HIGH' ? 'error' : signal.urgency === 'MEDIUM' ? 'warning' : 'info'}
                action={
                  <Button size="small" onClick={() => window.open(signal.url, '_blank')}>
                    View
                  </Button>
                }
              >
                <Typography variant="subtitle2">{signal.title}</Typography>
                {signal.sales_action && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    Action: {signal.sales_action}
                  </Typography>
                )}
              </Alert>
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        position: 'relative',
        width: '100%',
        height: '80vh',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at center, ${theme.palette.background.default} 0%, ${theme.palette.action.hover} 100%)`,
        perspective: '2000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Background Particle Field */}
      <ParticleField isPlaying={isPlaying} />

      {/* Main Galaxy Container */}
      <motion.div
        animate={{
          rotateX: rotation.x,
          rotateY: rotation.y,
          scale: zoom
        }}
        transition={{ type: 'spring', stiffness: 50 }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Central Market Hub */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) translateZ(0)',
            textAlign: 'center',
            zIndex: 10
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <Paper
              elevation={10}
              sx={{
                p: 4,
                background: `rgba(${theme.palette.mode === 'dark' ? '0,0,0' : '255,255,255'}, 0.9)`,
                backdropFilter: 'blur(10px)',
                border: `2px solid ${theme.palette.primary.main}`,
                borderRadius: '50%',
                width: 200,
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                ${(marketTotals.total / 1000).toFixed(1)}B
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Market
              </Typography>
              <Chip
                icon={<TrendingUp />}
                label={`+${marketTotals.avgGrowth.toFixed(1)}%`}
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                {marketTotals.totalOpportunities} opportunities
              </Typography>
            </Paper>
          </motion.div>
        </Box>

        {/* Connection Lines */}
        {showConnections && (
          <ConnectionLines 
            categories={categories.map(cat => ({
              id: cat.id,
              name: cat.name,
              position: cat.position,
              market_size_usd_millions: cat.total_market_size,
              avg_growth_rate: cat.avg_growth_rate
            }))} 
            selectedCategory={selectedCategory?.id || null} 
          />
        )}

        {/* Category Spheres */}
        {categories.map((category, index) => (
          <CategorySphere
            key={category.id}
            category={{
              ...category,
              market_size_usd_millions: category.total_market_size,
              avg_growth_rate: category.avg_growth_rate,
              innovation_score: category.innovation_score,
              trend_direction: category.trending_direction
            }}
            isSelected={selectedCategory?.id === category.id}
            onClick={handleCategoryClick}
            delay={index * 0.1}
          />
        ))}

        {/* Data Ripples */}
        <AnimatePresence>
          {ripples.map(ripple => (
            <DataRipple key={ripple.id} x={ripple.x} y={ripple.y} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Control Panel */}
      <Paper
        elevation={4}
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          p: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          background: `rgba(${theme.palette.mode === 'dark' ? '0,0,0' : '255,255,255'}, 0.95)`,
          backdropFilter: 'blur(10px)'
        }}
      >
        <IconButton onClick={() => setIsPlaying(!isPlaying)} color="primary">
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>

        <Box sx={{ width: 150 }}>
          <Typography variant="caption" color="text.secondary">Time Scale</Typography>
          <Slider
            value={timeScale}
            onChange={(_: Event, value: number | number[]) => setTimeScale(value as number)}
            min={0.1}
            max={3}
            step={0.1}
            size="small"
          />
        </Box>

        <IconButton onClick={() => setZoom(zoom * 1.2)}>
          <ZoomIn />
        </IconButton>
        <IconButton onClick={() => setZoom(zoom * 0.8)}>
          <ZoomOut />
        </IconButton>

        <Tooltip title="Toggle 3D Rotation">
          <IconButton 
            onClick={() => setRotation(prev => ({ x: prev.x === -20 ? -45 : -20, y: prev.y }))}
            color={rotation.x === -45 ? 'primary' : 'default'}
          >
            <ThreeDRotation />
          </IconButton>
        </Tooltip>

        <Tooltip title="Toggle Connections">
          <IconButton 
            onClick={() => setShowConnections(!showConnections)}
            color={showConnections ? 'primary' : 'default'}
          >
            <Timeline />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Category Details Panel */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            style={{
              position: 'absolute',
              right: 20,
              top: 20,
              width: 350,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <Paper
              elevation={6}
              sx={{
                p: 3,
                background: `rgba(${theme.palette.mode === 'dark' ? '0,0,0' : '255,255,255'}, 0.95)`,
                backdropFilter: 'blur(10px)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {selectedCategory.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={`$${(selectedCategory.total_market_size / 1000).toFixed(1)}B market`}
                      color="primary"
                      size="small"
                    />
                    <Chip 
                      label={`${selectedCategory.procedure_count} procedures`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
                <IconButton onClick={() => setSelectedCategory(null)} size="small">
                  ×
                </IconButton>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Market Metrics */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Growth Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(selectedCategory.avg_growth_rate * 3, 100)}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="primary">
                    +{selectedCategory.avg_growth_rate.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Innovation Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={selectedCategory.innovation_score}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    color="secondary"
                  />
                  <Typography variant="body2" color="secondary">
                    {selectedCategory.innovation_score.toFixed(0)}/100
                  </Typography>
                </Box>
              </Box>

              {/* Sales Actions */}
              {renderSalesActions()}

              {/* Opportunities */}
              {selectedCategory.sales_opportunities && selectedCategory.sales_opportunities.length > 0 && 
                renderOpportunities(selectedCategory.sales_opportunities)}

              {/* Market Signals */}
              {selectedCategory.market_signals && 
                renderMarketSignals(selectedCategory.market_signals)}

              {/* Top Procedures */}
              {selectedCategory.top_procedures && selectedCategory.top_procedures.length > 0 && (
                <Card elevation={6} sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Procedures
                    </Typography>
                    <List dense>
                      {selectedCategory.top_procedures.slice(0, 3).map((proc, idx) => (
                        <ListItem key={proc.id}>
                          <ListItemText
                            primary={`${idx + 1}. ${proc.procedure_name}`}
                            secondary={`$${(proc.market_size_2025_usd_millions / 1000).toFixed(1)}B market`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};


MarketGalaxyMap.displayName = 'MarketGalaxyMap';export default MarketGalaxyMap;