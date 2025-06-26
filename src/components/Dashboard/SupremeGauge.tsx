import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface SupremeGaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
  size?: number;
  isLive?: boolean;
}

const GaugeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  cursor: 'pointer',
  userSelect: 'none',
  perspective: '1000px',
  transformStyle: 'preserve-3d',
  '&:hover': {
    '& .gauge-main': {
      transform: 'translateZ(10px) rotateX(-2deg)',
    },
    '& .chrome-bezel': {
      boxShadow: `
        0 20px 40px rgba(0,0,0,0.6),
        0 0 60px rgba(0,0,0,0.4),
        inset 0 0 20px rgba(255,255,255,0.1)
      `,
    },
  },
}));

// Chrome cylindrical bezel
const ChromeBezel = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$size',
})<{ $size?: number }>(({ $size = 200 }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: $size,
  height: $size,
  borderRadius: '50%',
  background: `
    conic-gradient(
      from 0deg at 50% 50%,
      #e8e8e8 0deg,
      #c0c0c0 30deg,
      #808080 60deg,
      #606060 90deg,
      #808080 120deg,
      #c0c0c0 150deg,
      #e8e8e8 180deg,
      #c0c0c0 210deg,
      #808080 240deg,
      #606060 270deg,
      #808080 300deg,
      #c0c0c0 330deg,
      #e8e8e8 360deg
    )
  `,
  boxShadow: `
    0 10px 30px rgba(0,0,0,0.5),
    0 0 40px rgba(0,0,0,0.3),
    inset 0 0 15px rgba(255,255,255,0.1),
    inset 0 -5px 10px rgba(0,0,0,0.3)
  `,
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '5%',
    left: '5%',
    right: '5%',
    bottom: '5%',
    borderRadius: '50%',
    background: '#1a1a1a',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
  },
}));

// Decorative studs around the bezel
const Stud = styled(Box)<{ angle: number }>(({ angle }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: `radial-gradient(circle at 30% 30%, #f0f0f0, #808080)`,
  boxShadow: `
    0 1px 3px rgba(0,0,0,0.5),
    inset 0 -1px 2px rgba(0,0,0,0.3)
  `,
  transform: `
    translate(-50%, -50%)
    rotate(${angle}deg)
    translateY(-48%)
  `,
}));

// Digital LED display
const DigitalDisplay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '20%',
  left: '50%',
  transform: 'translateX(-50%)',
  background: '#000',
  border: '2px solid #333',
  borderRadius: '4px',
  padding: '6px 12px',
  boxShadow: `
    inset 0 2px 8px rgba(0,0,0,0.9),
    0 2px 4px rgba(0,0,0,0.5)
  `,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
    borderRadius: '2px',
    pointerEvents: 'none',
  },
}));

const DigitalText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== '$gaugeColor',
})<{ $gaugeColor: string }>(({ $gaugeColor }) => ({
  fontFamily: "'Orbitron', 'Digital-7', monospace",
  fontSize: '24px',
  fontWeight: 'bold',
  color: $gaugeColor,
  textShadow: `
    0 0 10px ${$gaugeColor},
    0 0 20px ${$gaugeColor}80,
    0 0 30px ${$gaugeColor}40
  `,
  letterSpacing: '3px',
  lineHeight: 1,
}));

// Gauge face with proper viewBox
const GaugeFace = styled('svg', {
  shouldForwardProp: (prop) => prop !== '$size',
})<{ $size?: number }>(({ $size = 200 }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: $size * 0.9,
  height: $size * 0.9,
  zIndex: 1,
}));

// Glass cover overlay
const GlassCover = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$size',
})<{ $size?: number }>(({ $size = 200 }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: $size * 0.85,
  height: $size * 0.85,
  borderRadius: '50%',
  background: `
    radial-gradient(
      ellipse at 30% 30%,
      rgba(255,255,255,0.3) 0%,
      rgba(255,255,255,0.1) 20%,
      rgba(255,255,255,0.05) 40%,
      transparent 70%
    )
  `,
  pointerEvents: 'none',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '60%',
    left: '10%',
    right: '10%',
    bottom: '10%',
    borderRadius: '50%',
    background: `
      radial-gradient(
        ellipse at 50% 100%,
        rgba(255,255,255,0.1) 0%,
        transparent 50%
      )
    `,
  },
}));

const SupremeGauge: React.FC<SupremeGaugeProps> = ({
  value,
  max,
  label,
  unit,
  color,
  size = 200,
  isLive = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [needleAngle, setNeedleAngle] = useState(-90);
  const animationRef = useRef<number>();

  // Calculate dynamic color based on value
  const getGaugeColor = () => {
    if (color) return color;
    const percentage = (value / max) * 100;
    if (percentage > 80) return '#00ff00';
    if (percentage > 60) return '#ffff00';
    if (percentage > 40) return '#ff9900';
    return '#ff0000';
  };

  const gaugeColor = getGaugeColor();

  // Kinetic needle animation with luxury watch physics
  useEffect(() => {
    const targetAngle = (value / max) * 180 - 90;
    const startValue = displayValue;
    const startTime = Date.now();
    
    // Luxury watch kinetic animation: 2-3 full spins + settle
    const spinRounds = 2 + Math.floor(Math.random() * 2); // 2-3 spins
    const spinTarget = (360 * spinRounds) + targetAngle;
    
    // Phase 1: Multi-revolution spin (mechanical momentum)
    const spinDuration = 2000;
    const settleDuration = 1200;
    
    const animateKinetic = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < spinDuration) {
        // Spinning phase with mechanical momentum
        const progress = elapsed / spinDuration;
        const easeOut = 1 - Math.pow(1 - progress, 3); // Deceleration
        
        const currentAngle = -90 + (spinTarget + 90) * easeOut;
        setNeedleAngle(currentAngle);
        
        // Update value during spin
        const currentValue = startValue + (value - startValue) * progress;
        setDisplayValue(Math.round(currentValue));
        
        animationRef.current = requestAnimationFrame(animateKinetic);
      } else if (elapsed < spinDuration + settleDuration) {
        // Settlement phase with elastic bounce
        const settleProgress = (elapsed - spinDuration) / settleDuration;
        const elasticOut = 1 - Math.pow(2, -10 * settleProgress) * Math.cos((settleProgress * 10 - 0.75) * (2 * Math.PI) / 3);
        
        const overshoot = 15; // Degrees of overshoot
        const settleAngle = spinTarget + overshoot * (1 - elasticOut);
        const finalAngle = targetAngle + (settleAngle - targetAngle) * (1 - elasticOut);
        
        setNeedleAngle(finalAngle);
        setDisplayValue(value);
        
        if (settleProgress < 1) {
          animationRef.current = requestAnimationFrame(animateKinetic);
        } else {
          setNeedleAngle(targetAngle); // Ensure final position
        }
      }
    };

    // Start the kinetic animation
    animateKinetic();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, max]);

  const handleClick = () => {
    // Spin animation on click
    const startAngle = needleAngle;
    const startTime = Date.now();
    const duration = 1000;

    const spin = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentAngle = startAngle + 360 * progress;
      setNeedleAngle(currentAngle % 360);

      if (progress < 1) {
        requestAnimationFrame(spin);
      } else {
        setNeedleAngle((value / max) * 180 - 90);
      }
    };

    spin();
  };

  return (
    <GaugeContainer onClick={handleClick}>
      <Box
        className="gauge-main"
        sx={{
          position: 'relative',
          width: size,
          height: size,
          transition: 'transform 0.3s ease',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Chrome bezel with studs */}
        <ChromeBezel className="chrome-bezel" $size={size}>
          {[...Array(12)].map((_, i) => (
            <Stud key={i} angle={i * 30} />
          ))}
        </ChromeBezel>

        {/* Digital display */}
        <DigitalDisplay>
          <DigitalText $gaugeColor={gaugeColor}>
            {displayValue.toString().padStart(3, '0')}{unit}
          </DigitalText>
        </DigitalDisplay>

        {/* Gauge face */}
        <GaugeFace $size={size} viewBox="0 0 100 100">
          <defs>
            <radialGradient id={`face-gradient-${label}`}>
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="30%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </radialGradient>
            
            <linearGradient id={`needle-gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E8E8E8" />
              <stop offset="30%" stopColor="#C0C0C0" />
              <stop offset="70%" stopColor="#A0A0A0" />
              <stop offset="100%" stopColor="#808080" />
            </linearGradient>
            
            <radialGradient id={`jewel-gradient-${label}`}>
              <stop offset="0%" stopColor={gaugeColor} />
              <stop offset="30%" stopColor="#4A90E2" />
              <stop offset="70%" stopColor="#2E5C8A" />
              <stop offset="100%" stopColor="#1A365D" />
            </radialGradient>
            
            <filter id={`needle-glow-${label}`}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id={`jewel-glow-${label}`}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
              <feColorMatrix values="1 0 0 0 0  0 0 1 0 0  0 0 0 1 0  0 0 0 1 0"/>
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <linearGradient id={`zone-gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#FFC107" stopOpacity="0.3" />
              <stop offset="85%" stopColor="#FF5722" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Gauge background with zones */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill={`url(#face-gradient-${label})`}
            stroke="#333"
            strokeWidth="0.5"
          />
          
          {/* Color zones arc */}
          <path
            d="M 15 50 A 35 35 0 0 1 85 50"
            fill="none"
            stroke={`url(#zone-gradient-${label})`}
            strokeWidth="6"
            opacity="0.6"
          />

          {/* Outer rim */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#555"
            strokeWidth="1"
            opacity="0.8"
          />

          {/* Tick marks - Major and Minor */}
          {[...Array(21)].map((_, i) => {
            const angle = (i / 20) * 180 - 90; // 21 ticks for 180 degrees
            const radian = (angle * Math.PI) / 180;
            const isMajor = i % 4 === 0; // Every 4th tick is major
            const isMiddle = i % 2 === 0 && !isMajor; // Every 2nd (but not major) is middle
            
            let tickLength, strokeWidth, opacity, color;
            if (isMajor) {
              tickLength = 8;
              strokeWidth = 2;
              opacity = 1;
              color = "#fff";
            } else if (isMiddle) {
              tickLength = 5;
              strokeWidth = 1.5;
              opacity = 0.8;
              color = "#ccc";
            } else {
              tickLength = 3;
              strokeWidth = 1;
              opacity = 0.6;
              color = "#999";
            }
            
            const outerRadius = 42;
            const innerRadius = outerRadius - tickLength;
            
            const x1 = 50 + Math.cos(radian) * outerRadius;
            const y1 = 50 + Math.sin(radian) * outerRadius;
            const x2 = 50 + Math.cos(radian) * innerRadius;
            const y2 = 50 + Math.sin(radian) * innerRadius;

            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                />
                {isMajor && (
                  <text
                    x={50 + Math.cos(radian) * (innerRadius - 4)}
                    y={50 + Math.sin(radian) * (innerRadius - 4)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="4"
                    fill="#fff"
                    opacity="0.9"
                    fontWeight="bold"
                    fontFamily="'Orbitron', monospace"
                  >
                    {Math.round((i / 20) * max)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Center hub with gradient */}
          <circle
            cx="50"
            cy="50"
            r="4"
            fill="#2C3E50"
            stroke="#1a1a1a"
            strokeWidth="1"
          />
          <circle
            cx="50"
            cy="50"
            r="2"
            fill="#34495E"
            opacity="0.8"
          />

          {/* Needle - Luxury Watch Design */}
          <g
            transform={`rotate(${needleAngle} 50 50)`}
            style={{
              transition: needleAngle === (value / max) * 180 - 90 ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {/* Needle shadow for depth */}
            <polygon
              points="50,50 48,18 52,18 50.5,48"
              fill="#000"
              opacity="0.4"
              transform="translate(1, 1)"
            />
            
            {/* Chrome needle shaft - tapered from 10px base to 1px tip */}
            <polygon
              points="50,50 47,20 53,20 51,48"
              fill={`url(#needle-gradient-${label})`}
              filter={`url(#needle-glow-${label})`}
              stroke="#C0C0C0"
              strokeWidth="0.3"
            />
            
            {/* Chrome highlight strip */}
            <polygon
              points="50,50 48.5,20 49.5,20 49.5,48"
              fill="rgba(255,255,255,0.6)"
              opacity="0.8"
            />
            
            {/* Needle tip - sharp precision point */}
            <polygon
              points="50,20 48.5,22 51.5,22"
              fill="#E8E8E8"
              stroke="#C0C0C0"
              strokeWidth="0.2"
            />
            
            {/* Jeweled center cap - luxury watch style */}
            <circle
              cx="50"
              cy="50"
              r="3"
              fill={`url(#jewel-gradient-${label})`}
              stroke="#C0C0C0"
              strokeWidth="0.5"
              filter={`url(#jewel-glow-${label})`}
            />
            
            {/* Inner jewel highlight */}
            <circle
              cx="50"
              cy="50"
              r="1.5"
              fill="rgba(255,255,255,0.4)"
              opacity="0.8"
            />
          </g>

          {/* Brand text */}
          <text
            x="50"
            y="75"
            textAnchor="middle"
            fontSize="3"
            fill="#666"
            fontFamily="'Orbitron', monospace"
            letterSpacing="0.5"
            opacity="0.8"
            fontWeight="bold"
          >
            REPSPHERES
          </text>
          
          {/* Premium indicator */}
          <text
            x="50"
            y="80"
            textAnchor="middle"
            fontSize="2"
            fill={gaugeColor}
            fontFamily="'Orbitron', monospace"
            letterSpacing="0.3"
            opacity="0.6"
          >
            SUPREME
          </text>
        </GaugeFace>

        {/* Glass cover */}
        <GlassCover $size={size} />

        {/* Label */}
        <Typography
          sx={{
            position: 'absolute',
            bottom: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '14px',
            color: '#fff',
            textShadow: '0 0 10px rgba(255,255,255,0.5)',
          }}
        >
          {label}
        </Typography>

        {/* Live indicator */}
        {isLive && (
          <Box
            sx={{
              position: 'absolute',
              top: 15,
              right: 15,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#00ff00',
              boxShadow: '0 0 10px #00ff00',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.3 },
              },
            }}
          />
        )}
      </Box>
    </GaugeContainer>
  );
};

export default SupremeGauge;