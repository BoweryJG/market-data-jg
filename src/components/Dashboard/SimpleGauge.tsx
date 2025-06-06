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
  
  // Continuous pulsation
  const [{ pulsate }, pulsateApi] = useSpring(() => ({
    from: { pulsate: 0 },
    to: { pulsate: 1 },
    loop: true,
    config: { duration: 3000 }
  }));
  
  // Initial load animation sequence
  useEffect(() => {
    if (!hasLoaded) {
      // Step 1: Quick spin to 270 (full revolution)
      api.start({
        angle: 270,
        config: { tension: 100, friction: 10, mass: 1 },
        onRest: () => {
          // Step 2: Settle to actual value with heavy physics
          api.start({
            angle: targetAngle,
            config: { tension: 30, friction: 15, mass: 3 }
          });
        }
      });
      setHasLoaded(true);
    } else {
      // Subsequent value changes
      api.start({ angle: targetAngle });
    }
  }, [targetAngle, api, hasLoaded]);
  
  // Hover vibration effect
  useEffect(() => {
    if (isHovered) {
      const vibrate = () => {
        api.start({
          angle: targetAngle + (Math.random() - 0.5) * 4, // ±2° vibration
          config: { tension: 300, friction: 10 }
        });
        animationRef.current = requestAnimationFrame(vibrate);
      };
      vibrate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      api.start({ angle: targetAngle });
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered, targetAngle, api]);
  
  // Calculate pulsation offset
  const pulseOffset = pulsate.to(p => Math.sin(p * Math.PI * 2) * 0.5);
  
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
      <svg width={size} height={size / 2 + 20}>
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
          transform={angle.to(a => 
            `rotate(${a + pulseOffset.get()} ${size / 2} ${size / 2})`
          )}
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