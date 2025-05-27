import React, { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface ConnectionLinesProps {
  categories: Array<{
    id: string;
    name: string;
    position: { x: number; y: number; z: number };
    market_size_usd_millions: number;
    avg_growth_rate: number;
  }>;
  selectedCategory: string | null;
}

const ConnectionLines: React.FC<ConnectionLinesProps> = ({ categories, selectedCategory }) => {
  const theme = useTheme();

  // Calculate connections based on market correlation
  const connections = useMemo(() => {
    const links: Array<{ from: number; to: number; strength: number }> = [];
    
    categories.forEach((cat1, i) => {
      categories.forEach((cat2, j) => {
        if (i < j) {
          // Calculate connection strength based on growth rate similarity
          const growthDiff = Math.abs(cat1.avg_growth_rate - cat2.avg_growth_rate);
          const strength = Math.max(0, 1 - growthDiff / 20);
          
          // Only show strong connections
          if (strength > 0.7 || 
              (selectedCategory && (cat1.id === selectedCategory || cat2.id === selectedCategory))) {
            links.push({ from: i, to: j, strength });
          }
        }
      });
    });
    
    return links;
  }, [categories, selectedCategory]);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
      viewBox="-500 -500 1000 1000"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Gradient definitions for connections */}
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.8" />
          <stop offset="50%" stopColor={theme.palette.secondary.main} stopOpacity="0.5" />
          <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity="0.8" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {connections.map((connection, index) => {
        const from = categories[connection.from];
        const to = categories[connection.to];
        
        // Convert 3D positions to 2D
        const fromX = from.position.x;
        const fromY = from.position.y;
        const toX = to.position.x;
        const toY = to.position.y;

        // Calculate control points for curved path
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        const distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
        const curve = distance * 0.2;

        const isHighlighted = selectedCategory && 
          (from.id === selectedCategory || to.id === selectedCategory);

        return (
          <motion.g key={index}>
            {/* Connection path */}
            <motion.path
              d={`M ${fromX} ${fromY} Q ${midX} ${midY - curve} ${toX} ${toY}`}
              fill="none"
              stroke="url(#connectionGradient)"
              strokeWidth={isHighlighted ? 3 : connection.strength * 2}
              opacity={isHighlighted ? 1 : connection.strength * 0.3}
              filter={isHighlighted ? "url(#glow)" : undefined}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: isHighlighted ? 1 : connection.strength * 0.3 
              }}
              transition={{ 
                duration: 1.5, 
                delay: index * 0.05,
                ease: 'easeInOut'
              }}
            />

            {/* Animated particle along path - removed due to SVG limitations */}

            {/* Pulse at connection points */}
            {isHighlighted && (
              <>
                <motion.circle
                  cx={fromX}
                  cy={fromY}
                  r="5"
                  fill={theme.palette.primary.main}
                  opacity="0.8"
                  animate={{
                    r: [5, 15, 5],
                    opacity: [0.8, 0.2, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
                <motion.circle
                  cx={toX}
                  cy={toY}
                  r="5"
                  fill={theme.palette.primary.main}
                  opacity="0.8"
                  animate={{
                    r: [5, 15, 5],
                    opacity: [0.8, 0.2, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1
                  }}
                />
              </>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
};

export default ConnectionLines;