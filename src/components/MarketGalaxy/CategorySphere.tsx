import React from 'react';
import { Box, Paper, Typography, Chip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingFlat,
  AutoAwesome,
  Lightbulb
} from '@mui/icons-material';

interface CategorySphereProps {
  category: {
    id: string;
    name: string;
    market_size_usd_millions: number;
    avg_growth_rate: number;
    innovation_score: number;
    trend_direction: 'up' | 'down' | 'stable';
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number };
    color: string;
  };
  isSelected: boolean;
  onClick: (categoryId: string, _event: React.MouseEvent) => void;
  delay: number;
}

const CategorySphere: React.FC<CategorySphereProps> = ({ 
  category,  
  isSelected,  
  onClick,  
  delay 
}) => {
  const theme = useTheme();

  // Calculate sphere size based on market size
  const sphereSize = Math.min(Math.max(50, category.market_size_usd_millions / 100), 150);
  
  // Calculate glow intensity based on growth rate
  const glowIntensity = Math.abs(category.avg_growth_rate) / 20;
  
  // Get trend icon
  const getTrendIcon = () => {
    switch (category.trend_direction) {
      case 'up': return <TrendingUp />;
      case 'down': return <TrendingDown />;
      default: return <TrendingFlat />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: category.position.x,
        y: category.position.y,
        z: category.position.z
      }}
      transition={{ 
        delay, 
        duration: 0.8,
        type: 'spring',
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.1,
        transition: { duration: 0.2 }
      }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        transformStyle: 'preserve-3d'
      }}
      onClick={(e) => onClick(category.id, e)}
    >
      <Box
        sx={{
          position: 'relative',
          width: sphereSize,
          height: sphereSize,
          cursor: 'pointer'
        }}
      >
        {/* Outer glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${category.color}40 0%, transparent 70%)`,
            filter: `blur(${glowIntensity * 10}px)`,
            transform: 'scale(1.5)'
          }}
        />

        {/* Main sphere */}
        <Paper
          elevation={isSelected ? 20 : 10}
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${theme.palette.mode === 'dark' ? '#333' : '#fff'}, ${category.color})`,
            border: `2px solid ${category.color}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '10%',
              left: '20%',
              width: '30%',
              height: '30%',
              background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(3px)'
            }
          }}
        >
          {/* Category name */}
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 'bold',
              textAlign: 'center',
              px: 1,
              color: theme.palette.getContrastText(category.color)
            }}
          >
            {category.name}
          </Typography>

          {/* Market size */}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.getContrastText(category.color)
            }}
          >
            ${(category.market_size_usd_millions / 1000).toFixed(1)}B
          </Typography>

          {/* Growth indicator */}
          <Chip
            icon={getTrendIcon()}
            label={`${category.avg_growth_rate > 0 ? '+' : ''}${category.avg_growth_rate.toFixed(1)}%`}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 5,
              backgroundColor: `${category.color}CC`,
              color: theme.palette.getContrastText(category.color),
              '& .MuiChip-icon': {
                color: 'inherit'
              }
            }}
          />

          {/* Innovation indicator */}
          {category.innovation_score > 70 && (
            <motion.div
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                position: 'absolute',
                top: 5,
                right: 5
              }}
            >
              <AutoAwesome 
                sx={{ 
                  fontSize: 16,
                  color: '#FFD700'
                }} 
              />
            </motion.div>
          )}
        </Paper>

        {/* Orbital rings for high-growth categories */}
        {category.avg_growth_rate > 10 && (
          <motion.div
            animate={{
              rotateZ: 360
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              top: '-10%',
              left: '-10%',
              borderRadius: '50%',
              border: `1px solid ${category.color}40`,
              borderTopColor: category.color,
              borderRightColor: category.color
            }}
          />
        )}

        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              width: '150%',
              height: '150%',
              top: '-25%',
              left: '-25%',
              borderRadius: '50%',
              border: `3px solid ${category.color}`,
              boxShadow: `0 0 20px ${category.color}`
            }}
          />
        )}
      </Box>
    </motion.div>
  );
};

CategorySphere.displayName = 'CategorySphere';

export default CategorySphere;