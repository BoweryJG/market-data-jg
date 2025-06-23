import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';

interface SimpleGaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  size?: number;
}

const SimpleGauge: React.FC<SimpleGaugeProps> = ({ 
  value, 
  max, 
  label, 
  unit, 
  color, 
  size = 150 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = size / 2 - 20;
  
  const [isHovered, setIsHovered] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const controls = useAnimation();
  
  // Calculate the final rotation based on value (0-100)
  // -90 degrees is the starting position, +90 is the end position (180 degree sweep)
  const calculateRotation = (val: number) => {
    const percent = Math.min((val / max) * 100, 100);
    return -90 + (percent / 100) * 180;
  };
  
  // Initial load animation with 3 spins then land
  useEffect(() => {
    if (!hasLoaded) {
      const finalRotation = calculateRotation(value);
      // Delay slightly to ensure smooth mount
      const timer = setTimeout(() => {
        controls.start({
          rotate: 1080 + finalRotation, // 3 full spins + final position
          transition: {
            duration: 1.8,
            ease: [0.17, 0.67, 0.83, 0.67], // elastic-like easing
          },
        });
      }, 100);
      
      setHasLoaded(true);
      return () => clearTimeout(timer);
    } else {
      // Subsequent value changes - direct animation to new position
      const finalRotation = calculateRotation(value);
      controls.start({
        rotate: finalRotation,
        transition: {
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
        },
      });
    }
  }, [value, max, hasLoaded, controls]);
  
  // Hover effect - gentle wobble
  useEffect(() => {
    if (isHovered) {
      const currentRotation = calculateRotation(value);
      controls.start({
        rotate: [currentRotation, currentRotation + 5, currentRotation - 5, currentRotation],
        transition: {
          duration: 0.4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      });
    } else {
      // Return to normal position
      controls.stop();
      const finalRotation = calculateRotation(value);
      controls.start({
        rotate: finalRotation,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      });
    }
  }, [isHovered, value, max, controls]);
  
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: size, 
        height: size / 2 + 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Simple SVG Gauge */}
      <svg 
        width={size} 
        height={size / 2 + 20}
        style={{ pointerEvents: 'all' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background arc */}
        <path
          d={`M 20 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Progress arc */}
        <path
          d={`M 20 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 3.14159 * radius / 100} ${3.14159 * radius}`}
        />
        
        {/* GRADIENTS */}
        <defs>
          <radialGradient id={`needleGradient-${label}`} cx="0%" cy="50%" r="100%">
            <stop offset="0%" stopColor="#E74C3C" />
            <stop offset="50%" stopColor="#C0392B" />
            <stop offset="100%" stopColor="#922B21" />
          </radialGradient>
          
          <radialGradient id={`baseGradient-${label}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ECF0F1" />
            <stop offset="50%" stopColor="#BDC3C7" />
            <stop offset="100%" stopColor="#2C3E50" />
          </radialGradient>
          
          {/* Needle shadow filter */}
          <filter id={`needleShadow-${label}`}>
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3"/>
          </filter>
          
          {/* Hover glow */}
          <filter id={`needleGlow-${label}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* STATIC CENTER BASE - OUTSIDE ROTATING GROUP */}
        {/* Outer ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="12"
          fill={`url(#baseGradient-${label})`}
          stroke="#2C3E50"
          strokeWidth="2"
        />
        
        {/* Inner circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="8"
          fill="#34495E"
          stroke="#2C3E50"
          strokeWidth="1"
        />
        
        {/* ANIMATED NEEDLE GROUP - ONLY NEEDLE ROTATES */}
        <motion.g 
          animate={controls}
          initial={{ rotate: -90 }}
          style={{ 
            transformOrigin: `${size / 2}px ${size / 2}px`,
          }}
        >
          {/* Needle shaft */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2}
            y2={size / 2 - radius + 15}
            stroke={`url(#needleGradient-${label})`}
            strokeWidth="3"
            strokeLinecap="round"
            filter={isHovered ? `url(#needleGlow-${label})` : `url(#needleShadow-${label})`}
          />
          
          {/* Needle tip pointer */}
          <polygon
            points={`${size / 2 - 3},${size / 2 - radius + 20} ${size / 2},${size / 2 - radius + 10} ${size / 2 + 3},${size / 2 - radius + 20}`}
            fill="#E74C3C"
            filter={isHovered ? `url(#needleGlow-${label})` : ''}
          />
        </motion.g>
        
        {/* Center cap - on top of everything */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="5"
          fill="#1a1a1a"
          stroke="#E74C3C"
          strokeWidth="1"
        />
        
        {/* Invisible hover area covering entire gauge */}
        <rect
          x="0"
          y="0"
          width={size}
          height={size / 2 + 20}
          fill="transparent"
          style={{ cursor: 'pointer' }}
        />
      </svg>
      
      {/* Value display */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color }}>
          {unit === 'M' ? `$${(value / 1000).toFixed(1)}B` : 
           unit === '%' ? `${value.toFixed(1)}%` :
           value.toLocaleString()}{unit === 'M' || unit === '%' ? '' : unit}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

export default SimpleGauge;