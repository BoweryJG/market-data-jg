import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, useTheme, alpha, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, East } from '@mui/icons-material';

interface StreamData {
  from: string;
  to: string;
  value: number;
  type: 'dental' | 'aesthetic';
  growth: number;
}

interface StateNode {
  id: string;
  name: string;
  x: number;
  y: number;
  marketSize: number;
  providerDensity: number;
  population: number;
}

interface VelocityStreamsProps {
  marketData: any;
  selectedState: string;
  onStateSelect: (state: string) => void;
  isAnimating: boolean;
}

const VelocityStreams: React.FC<VelocityStreamsProps> = ({
  marketData,
  selectedState,
  onStateSelect,
  isAnimating
}) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [particles, setParticles] = useState<any[]>([]);

  // Key states with positions
  const stateNodes: StateNode[] = [
    { id: 'ny', name: 'New York', x: 80, y: 20, marketSize: 15200, providerDensity: 68, population: 19500000 },
    { id: 'ca', name: 'California', x: 10, y: 40, marketSize: 23400, providerDensity: 83, population: 39500000 },
    { id: 'tx', name: 'Texas', x: 50, y: 70, marketSize: 16900, providerDensity: 65, population: 29300000 },
    { id: 'fl', name: 'Florida', x: 75, y: 80, marketSize: 15700, providerDensity: 74, population: 23800000 },
    { id: 'il', name: 'Illinois', x: 55, y: 30, marketSize: 8900, providerDensity: 71, population: 12600000 },
    { id: 'pa', name: 'Pennsylvania', x: 75, y: 25, marketSize: 9200, providerDensity: 62, population: 12800000 },
    { id: 'oh', name: 'Ohio', x: 65, y: 35, marketSize: 7800, providerDensity: 58, population: 11700000 },
    { id: 'ga', name: 'Georgia', x: 70, y: 60, marketSize: 6500, providerDensity: 55, population: 10700000 },
    { id: 'nc', name: 'N. Carolina', x: 75, y: 50, marketSize: 6800, providerDensity: 59, population: 10600000 },
    { id: 'mi', name: 'Michigan', x: 60, y: 20, marketSize: 6200, providerDensity: 61, population: 10000000 }
  ];

  // Market flow streams (migration patterns)
  const streams: StreamData[] = [
    { from: 'ny', to: 'fl', value: 2800, type: 'dental', growth: 12.5 },
    { from: 'ny', to: 'fl', value: 1900, type: 'aesthetic', growth: 18.2 },
    { from: 'ca', to: 'tx', value: 1500, type: 'dental', growth: 8.3 },
    { from: 'ca', to: 'tx', value: 1200, type: 'aesthetic', growth: 15.7 },
    { from: 'il', to: 'fl', value: 1100, type: 'dental', growth: 10.2 },
    { from: 'pa', to: 'fl', value: 900, type: 'dental', growth: 9.8 },
    { from: 'oh', to: 'fl', value: 850, type: 'dental', growth: 11.3 },
    { from: 'mi', to: 'fl', value: 750, type: 'dental', growth: 13.1 },
    { from: 'ny', to: 'nc', value: 600, type: 'aesthetic', growth: 14.5 },
    { from: 'ca', to: 'fl', value: 800, type: 'aesthetic', growth: 16.9 }
  ];

  // Initialize particles for stream animation
  useEffect(() => {
    if (isAnimating) {
      const newParticles: any[] = [];
      streams.forEach((stream, index) => {
        const fromNode = stateNodes.find(n => n.id === stream.from);
        const toNode = stateNodes.find(n => n.id === stream.to);
        
        if (fromNode && toNode) {
          // Create particles based on stream value
          const particleCount = Math.floor(stream.value / 500);
          for (let i = 0; i < particleCount; i++) {
            newParticles.push({
              id: `${stream.from}-${stream.to}-${i}`,
              fromX: fromNode.x,
              fromY: fromNode.y,
              toX: toNode.x,
              toY: toNode.y,
              progress: (i / particleCount) * 100,
              speed: 0.5 + Math.random() * 0.5,
              type: stream.type,
              size: 2 + (stream.value / 1000)
            });
          }
        }
      });
      setParticles(newParticles);
    }
  }, [isAnimating]);

  // Animate particles
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        progress: (particle.progress + particle.speed) % 100
      })));
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating]);

  // Draw streams on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw streams
    streams.forEach(stream => {
      const fromNode = stateNodes.find(n => n.id === stream.from);
      const toNode = stateNodes.find(n => n.id === stream.to);
      
      if (fromNode && toNode) {
        const fromX = (fromNode.x / 100) * canvas.width;
        const fromY = (fromNode.y / 100) * canvas.height;
        const toX = (toNode.x / 100) * canvas.width;
        const toY = (toNode.y / 100) * canvas.height;

        // Draw stream path
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        
        // Create curved path
        const controlX = (fromX + toX) / 2;
        const controlY = Math.min(fromY, toY) - 50;
        ctx.quadraticCurveTo(controlX, controlY, toX, toY);
        
        // Style based on type
        ctx.strokeStyle = stream.type === 'dental' 
          ? alpha(theme.palette.primary.main, 0.3)
          : alpha(theme.palette.secondary.main, 0.3);
        ctx.lineWidth = Math.max(2, stream.value / 500);
        ctx.stroke();
      }
    });

    // Draw particles
    particles.forEach(particle => {
      const x = particle.fromX + (particle.toX - particle.fromX) * (particle.progress / 100);
      const y = particle.fromY + (particle.toY - particle.fromY) * (particle.progress / 100);
      
      const canvasX = (x / 100) * canvas.width;
      const canvasY = (y / 100) * canvas.height;

      ctx.beginPath();
      ctx.arc(canvasX, canvasY, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.type === 'dental'
        ? theme.palette.primary.main
        : theme.palette.secondary.main;
      ctx.fill();
    });
  }, [particles, theme]);

  const getStateMetrics = (stateId: string) => {
    const inflow = streams
      .filter(s => s.to === stateId)
      .reduce((sum, s) => sum + s.value, 0);
    const outflow = streams
      .filter(s => s.from === stateId)
      .reduce((sum, s) => sum + s.value, 0);
    const netFlow = inflow - outflow;
    
    return { inflow, outflow, netFlow };
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '600px' }}>
      {/* Background canvas for streams */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />

      {/* State nodes */}
      {stateNodes.map(state => {
        const metrics = getStateMetrics(state.id);
        const isSelected = selectedState === state.id;
        const isHovered = hoveredState === state.id;
        
        return (
          <motion.div
            key={state.id}
            style={{
              position: 'absolute',
              left: `${state.x}%`,
              top: `${state.y}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.1 }}
            onClick={() => onStateSelect(state.id)}
            onMouseEnter={() => setHoveredState(state.id)}
            onMouseLeave={() => setHoveredState(null)}
          >
            <Paper
              elevation={isHovered ? 12 : 4}
              sx={{
                p: 2,
                backgroundColor: isSelected 
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(10px)',
                border: isSelected 
                  ? `2px solid ${theme.palette.primary.main}`
                  : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                minWidth: 120,
                textAlign: 'center'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {state.name}
              </Typography>
              <Typography variant="h6" color="primary">
                ${(state.marketSize / 1000).toFixed(1)}B
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mt={1}>
                {metrics.netFlow > 0 ? (
                  <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
                )}
                <Typography variant="caption" color={metrics.netFlow > 0 ? 'success.main' : 'error.main'}>
                  {metrics.netFlow > 0 ? '+' : ''}{(metrics.netFlow / 1000).toFixed(1)}K
                </Typography>
              </Box>
              {isHovered && (
                <Box mt={1}>
                  <Chip
                    size="small"
                    label={`${state.providerDensity}/100k`}
                    icon={<East />}
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
              )}
            </Paper>
          </motion.div>
        );
      })}

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          display: 'flex',
          gap: 2,
          p: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)',
          borderRadius: 2
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 24,
              height: 3,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1
            }}
          />
          <Typography variant="caption">Dental Market Flow</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 24,
              height: 3,
              backgroundColor: theme.palette.secondary.main,
              borderRadius: 1
            }}
          />
          <Typography variant="caption">Aesthetic Market Flow</Typography>
        </Box>
      </Box>

      {/* Market Flow Summary */}
      <Paper
        elevation={4}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          p: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          minWidth: 200
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          The Florida Effect™
        </Typography>
        <Typography variant="h5" color="primary" gutterBottom>
          +47K/year
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Net patient inflow driving
        </Typography>
        <Typography variant="h6" color="success.main">
          +$2.8B market growth
        </Typography>
      </Paper>
    </Box>
  );
};


VelocityStreams.displayName = 'VelocityStreams';export default VelocityStreams;