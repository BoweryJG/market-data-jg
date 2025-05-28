import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Tooltip, useTheme, alpha, Chip, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { LocalFireDepartment, AcUnit, WaterDrop } from '@mui/icons-material';

interface HotspotData {
  id: string;
  x: string;
  y: string;
  radius: number;
  intensity: number;
  procedures: string[];
  marketSize: number;
  growth: number;
  label: string;
}

interface BodyHeatmapProps {
  marketData: any;
  onProcedureSelect: (procedure: any) => void;
  activeLayers: string[];
  isAnimating: boolean;
}

const BodyHeatmap: React.FC<BodyHeatmapProps> = ({
  marketData,
  onProcedureSelect,
  activeLayers,
  isAnimating
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(0);

  // Define body hotspots with market data
  const hotspots: HotspotData[] = [
    {
      id: 'face',
      x: '50%',
      y: '15%',
      radius: 60,
      intensity: 0.9,
      procedures: ['Botox', 'Fillers', 'Dental Veneers', 'Teeth Whitening'],
      marketSize: 8500,
      growth: 15.2,
      label: 'Face & Smile'
    },
    {
      id: 'teeth',
      x: '50%',
      y: '20%',
      radius: 40,
      intensity: 0.85,
      procedures: ['Implants', 'Clear Aligners', 'Crowns'],
      marketSize: 12000,
      growth: 8.5,
      label: 'Dental'
    },
    {
      id: 'neck',
      x: '50%',
      y: '30%',
      radius: 35,
      intensity: 0.7,
      procedures: ['Neck Lift', 'Kybella', 'Skin Tightening'],
      marketSize: 2100,
      growth: 12.3,
      label: 'Neck'
    },
    {
      id: 'chest',
      x: '50%',
      y: '45%',
      radius: 50,
      intensity: 0.6,
      procedures: ['Breast Augmentation', 'Male Chest Reduction'],
      marketSize: 4200,
      growth: 6.8,
      label: 'Chest'
    },
    {
      id: 'abdomen',
      x: '50%',
      y: '60%',
      radius: 55,
      intensity: 0.75,
      procedures: ['Liposuction', 'Tummy Tuck', 'CoolSculpting'],
      marketSize: 5600,
      growth: 14.5,
      label: 'Body Contouring'
    },
    {
      id: 'hands',
      x: '30%',
      y: '65%',
      radius: 30,
      intensity: 0.5,
      procedures: ['Hand Rejuvenation', 'Age Spot Removal'],
      marketSize: 800,
      growth: 9.2,
      label: 'Hands'
    },
    {
      id: 'legs',
      x: '45%',
      y: '80%',
      radius: 45,
      intensity: 0.65,
      procedures: ['Spider Vein Treatment', 'Laser Hair Removal'],
      marketSize: 3200,
      growth: 11.5,
      label: 'Legs'
    }
  ];

  // Pulse animation
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setPulseAnimation(prev => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  const getHeatColor = (intensity: number, growth: number) => {
    if (growth > 12) return theme.palette.error.main; // Hot - high growth
    if (growth > 8) return theme.palette.warning.main; // Warm - moderate growth
    return theme.palette.info.main; // Cool - low growth
  };

  const handleSpotClick = (spot: HotspotData) => {
    const procedureData = {
      bodyArea: spot.label,
      procedures: spot.procedures,
      marketSize: spot.marketSize,
      growth: spot.growth,
      intensity: spot.intensity
    };
    onProcedureSelect(procedureData);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '600px' }}>
      {/* Human Body Silhouette */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 400 600"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Body outline */}
        <motion.path
          d="M200 50 C 230 50, 250 70, 250 100 L 250 200 C 280 210, 300 230, 300 250 L 300 350 C 300 380, 280 400, 250 400 L 250 500 C 250 530, 230 550, 200 550 C 170 550, 150 530, 150 500 L 150 400 C 120 400, 100 380, 100 350 L 100 250 C 100 230, 120 210, 150 200 L 150 100 C 150 70, 170 50, 200 50 Z"
          fill="none"
          stroke={alpha(theme.palette.text.primary, 0.2)}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Heat spots */}
        {hotspots.map((spot, index) => {
          const color = getHeatColor(spot.intensity, spot.growth);
          const isHovered = hoveredSpot === spot.id;
          const pulseScale = 1 + Math.sin((pulseAnimation + index * 30) * Math.PI / 180) * 0.1;

          return (
            <g key={spot.id}>
              {/* Outer glow */}
              <motion.circle
                cx={spot.x}
                cy={spot.y}
                r={spot.radius * 1.5}
                fill={`url(#gradient-${spot.id})`}
                opacity={0.3}
                animate={{
                  scale: isAnimating ? pulseScale : 1,
                  opacity: isHovered ? 0.5 : 0.3
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Inner heat spot */}
              <motion.circle
                cx={spot.x}
                cy={spot.y}
                r={spot.radius}
                fill={color}
                opacity={0.6 * spot.intensity}
                style={{ 
                  cursor: 'pointer',
                  filter: `blur(${isHovered ? 0 : 8}px)`
                }}
                whileHover={{ scale: 1.1 }}
                onClick={() => handleSpotClick(spot)}
                onMouseEnter={() => setHoveredSpot(spot.id)}
                onMouseLeave={() => setHoveredSpot(null)}
              />

              {/* Gradient definitions */}
              <defs>
                <radialGradient id={`gradient-${spot.id}`}>
                  <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </radialGradient>
              </defs>
            </g>
          );
        })}
      </svg>

      {/* Hovering tooltip */}
      <AnimatePresence>
        {hoveredSpot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              top: hotspots.find(s => s.id === hoveredSpot)?.y || 0,
              left: hotspots.find(s => s.id === hoveredSpot)?.x || 0,
              transform: 'translate(-50%, -120%)',
              zIndex: 10
            }}
          >
            <Paper
              elevation={8}
              sx={{
                p: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}
            >
              {(() => {
                const spot = hotspots.find(s => s.id === hoveredSpot);
                if (!spot) return null;
                
                return (
                  <>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {spot.label}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6" color="primary">
                        ${(spot.marketSize / 1000).toFixed(1)}B
                      </Typography>
                      <Chip
                        size="small"
                        icon={spot.growth > 12 ? <LocalFireDepartment /> : spot.growth > 8 ? <WaterDrop /> : <AcUnit />}
                        label={`+${spot.growth}%`}
                        color={spot.growth > 12 ? 'error' : spot.growth > 8 ? 'warning' : 'info'}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Top: {spot.procedures.slice(0, 3).join(', ')}
                    </Typography>
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
          position: 'absolute',
          bottom: 16,
          right: 16,
          display: 'flex',
          gap: 2,
          p: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)',
          borderRadius: 2
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <LocalFireDepartment sx={{ color: theme.palette.error.main }} />
          <Typography variant="caption">High Growth (&gt;12%)</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <WaterDrop sx={{ color: theme.palette.warning.main }} />
          <Typography variant="caption">Medium (8-12%)</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <AcUnit sx={{ color: theme.palette.info.main }} />
          <Typography variant="caption">Low (&lt;8%)</Typography>
        </Box>
      </Box>

      {/* Active Layers Indicator */}
      {activeLayers.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Active Layers:
          </Typography>
          {activeLayers.map(layer => (
            <Chip
              key={layer}
              label={layer}
              size="small"
              variant="outlined"
              sx={{ opacity: 0.8 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BodyHeatmap;