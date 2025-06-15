import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useSpring, animated, config } from '@react-spring/web';

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
  const targetAngle = -90 + (percentage / 100) * 180; // Start at -90, sweep to +90
  const radius = size / 2 - 20;
  
  const [isHovered, setIsHovered] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const animationRef = useRef<number>();
  
  // Debug hover state
  useEffect(() => {
    console.log(`Gauge ${label} hover state:`, isHovered);
  }, [isHovered, label]);
  
  // Main needle animation with physics
  const [{ angle }, api] = useSpring(() => ({
    angle: -90,
    config: {
      tension: 40,  // Lower = heavier feel
      friction: 12, // Higher = more damping  
      mass: 2.5,    // Higher = more inertia
      clamp: false  // Allow overshoot
    }
  }));
  
  // Initial load animation sequence
  useEffect(() => {
    if (!hasLoaded) {
      // Delay the animation slightly to ensure component is fully mounted
      const timer = setTimeout(() => {
        // Start from left (-90) and animate to target with overshoot
        api.start({
          from: { angle: -90 },
          to: { angle: targetAngle },
          config: { 
            tension: 50,    // Medium tension for smooth motion
            friction: 8,    // Low friction for nice overshoot
            mass: 1.5,      // Medium mass for responsive feel
            clamp: false    // Allow overshoot for realistic effect
          }
        });
      }, 100); // Small delay to ensure smooth load
      
      setHasLoaded(true);
      return () => clearTimeout(timer);
    } else {
      // Subsequent value changes
      api.start({ 
        angle: targetAngle,
        config: { tension: 40, friction: 12, mass: 2.5 }
      });
    }
  }, [targetAngle, api, hasLoaded]);
  
  // Hover spinning effect
  useEffect(() => {
    if (isHovered) {
      // Continuous spinning on hover
      api.start({
        from: { angle: targetAngle },
        to: { angle: targetAngle + 360 },
        loop: true,
        config: { duration: 2000, easing: t => t } // Linear easing for smooth spin
      });
    } else {
      // Stop spinning and return to target angle
      api.stop();
      api.start({ 
        angle: targetAngle,
        config: { tension: 40, friction: 12, mass: 2.5 }
      });
    }
  }, [isHovered, targetAngle, api]);
  
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r="8"
          fill={`url(#baseGradient-${label})`}
          stroke="#34495E"
          strokeWidth="1"
        />
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r="4"
          fill="#2C3E50"
        />
        
        {/* ANIMATED NEEDLE GROUP - ONLY NEEDLE ROTATES */}
        <animated.g 
          transform={angle.to(a => `rotate(${a} ${size / 2} ${size / 2})`)}
          style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
        >
          {/* Needle with filter */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2 + radius - 10}
            y2={size / 2}
            stroke={`url(#needleGradient-${label})`}
            strokeWidth="2"
            strokeLinecap="round"
            filter={isHovered ? `url(#needleGlow-${label})` : `url(#needleShadow-${label})`}
          />
          
          {/* Needle tip */}
          <circle
            cx={size / 2 + radius - 10}
            cy={size / 2}
            r="2"
            fill="#E74C3C"
            filter={isHovered ? `url(#needleGlow-${label})` : ''}
          />
        </animated.g>
        
        {/* Center cap - on top of everything */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="2"
          fill="#1a1a1a"
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