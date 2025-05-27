import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box, Paper, Typography, Chip, IconButton, Slider, Tooltip, useTheme } from '@mui/material';
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
  TrendingDown
} from '@mui/icons-material';
import { categoryMapping } from '../Dashboard/CategoryMapping';
import { supabase } from '../../services/supabaseClient';
import ParticleField from './ParticleField';
import CategorySphere from './CategorySphere';
import ConnectionLines from './ConnectionLines';
import DataRipple from './DataRipple';

interface CategoryData {
  id: string;
  name: string;
  market_size_usd_millions: number;
  avg_growth_rate: number;
  innovation_score: number;
  trend_direction: 'up' | 'down' | 'stable';
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number };
  color: string;
  subcategories?: CategoryData[];
}

const MarketGalaxyMap: React.FC = () => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: -20, y: 0 });
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showConnections, setShowConnections] = useState(true);
  const [ripples, setRipples] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const controls = useAnimation();

  // Calculate category positions in orbital pattern
  const calculateOrbitalPosition = (index: number, total: number, marketSize: number) => {
    const angle = (index / total) * Math.PI * 2;
    const baseRadius = 300;
    const radius = baseRadius + (marketSize / 1000) * 50; // Larger markets orbit further
    const height = Math.sin(index * 0.5) * 50; // Varying heights for depth
    
    return {
      x: Math.cos(angle) * radius,
      y: height,
      z: Math.sin(angle) * radius
    };
  };

  // Fetch category data
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('category_hierarchy')
        .select('*')
        .order('market_size_usd_millions', { ascending: false });

      if (data && !error) {
        const formattedData = data.map((cat, index) => ({
          ...cat,
          position: calculateOrbitalPosition(index, data.length, cat.market_size_usd_millions),
          velocity: { 
            x: (cat.avg_growth_rate || 0) * 0.01, 
            y: (cat.innovation_score || 50) * 0.001 
          },
          color: cat.trend_direction === 'up' ? theme.palette.success.main : 
                 cat.trend_direction === 'down' ? theme.palette.error.main : 
                 theme.palette.info.main
        }));
        setCategories(formattedData);
      }
    };

    fetchCategories();
  }, [theme]);

  // Orbital animation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setRotation(prev => ({
          ...prev,
          y: (prev.y + 0.5 * timeScale) % 360
        }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPlaying, timeScale]);

  // Handle category click
  const handleCategoryClick = (categoryId: string, event: React.MouseEvent) => {
    setSelectedCategory(categoryId);
    
    // Create ripple effect
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const ripple = {
        id: `ripple-${Date.now()}`,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      setRipples(prev => [...prev, ripple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== ripple.id));
      }, 2000);
    }
  };

  // Calculate market totals for center display
  const marketTotals = useMemo(() => {
    const total = categories.reduce((sum, cat) => sum + cat.market_size_usd_millions, 0);
    const avgGrowth = categories.reduce((sum, cat) => sum + (cat.avg_growth_rate || 0), 0) / categories.length;
    return { total, avgGrowth };
  }, [categories]);

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
            </Paper>
          </motion.div>
        </Box>

        {/* Connection Lines */}
        {showConnections && (
          <ConnectionLines categories={categories} selectedCategory={selectedCategory} />
        )}

        {/* Category Spheres */}
        {categories.map((category, index) => (
          <CategorySphere
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
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
            onChange={(_, value) => setTimeScale(value as number)}
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
              width: 300
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
              {/* Category details content */}
              <Typography variant="h6">
                {categories.find(c => c.id === selectedCategory)?.name}
              </Typography>
              {/* Add more details here */}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default MarketGalaxyMap;