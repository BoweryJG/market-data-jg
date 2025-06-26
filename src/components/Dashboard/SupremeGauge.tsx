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
const ChromeBezel = styled(Box)(({ size = 200 }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: size,
  height: size,
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

const DigitalText = styled(Typography)<{ gaugeColor: string }>(({ gaugeColor }) => ({
  fontFamily: "'Orbitron', 'Digital-7', monospace",
  fontSize: '24px',
  fontWeight: 'bold',
  color: gaugeColor,
  textShadow: `
    0 0 10px ${gaugeColor},
    0 0 20px ${gaugeColor}80,
    0 0 30px ${gaugeColor}40
  `,
  letterSpacing: '3px',
  lineHeight: 1,
}));

// Gauge face
const GaugeFace = styled('svg')(({ size = 200 }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: size * 0.9,
  height: size * 0.9,
  zIndex: 1,
}));

// Glass cover overlay
const GlassCover = styled(Box)(({ size = 200 }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: size * 0.85,
  height: size * 0.85,
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

  // Animate value and needle
  useEffect(() => {
    const targetAngle = (value / max) * 180 - 90;
    const startValue = displayValue;
    const startAngle = needleAngle;
    const startTime = Date.now();
    const duration = 1500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeInOutCubic = (t: number) => 
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const easedProgress = easeInOutCubic(progress);

      // Update needle angle
      const currentAngle = startAngle + (targetAngle - startAngle) * easedProgress;
      setNeedleAngle(currentAngle);

      // Update display value
      const currentValue = startValue + (value - startValue) * easedProgress;
      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

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
        <ChromeBezel className="chrome-bezel" size={size}>
          {[...Array(12)].map((_, i) => (
            <Stud key={i} angle={i * 30} />
          ))}
        </ChromeBezel>

        {/* Digital display */}
        <DigitalDisplay>
          <DigitalText gaugeColor={gaugeColor}>
            {displayValue.toString().padStart(3, '0')}{unit}
          </DigitalText>
        </DigitalDisplay>

        {/* Gauge face */}
        <GaugeFace size={size}>
          <defs>
            <radialGradient id={`face-gradient-${label}`}>
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </radialGradient>
            
            <filter id={`needle-glow-${label}`}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Face background */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill={`url(#face-gradient-${label})`}
            stroke="#333"
            strokeWidth="1"
          />

          {/* Tick marks */}
          {[...Array(11)].map((_, i) => {
            const angle = (i / 10) * 180 - 90;
            const radian = (angle * Math.PI) / 180;
            const isMain = i % 2 === 0;
            const tickLength = isMain ? 0.15 : 0.1;
            const innerRadius = 0.35;
            const outerRadius = innerRadius - tickLength;
            
            const x1 = 0.5 + Math.cos(radian) * innerRadius;
            const y1 = 0.5 + Math.sin(radian) * innerRadius;
            const x2 = 0.5 + Math.cos(radian) * outerRadius;
            const y2 = 0.5 + Math.sin(radian) * outerRadius;

            return (
              <g key={i}>
                <line
                  x1={`${x1 * 100}%`}
                  y1={`${y1 * 100}%`}
                  x2={`${x2 * 100}%`}
                  y2={`${y2 * 100}%`}
                  stroke="#fff"
                  strokeWidth={isMain ? 2 : 1}
                  opacity={isMain ? 0.9 : 0.5}
                />
                {isMain && (
                  <text
                    x={`${(0.5 + Math.cos(radian) * (outerRadius - 0.05)) * 100}%`}
                    y={`${(0.5 + Math.sin(radian) * (outerRadius - 0.05)) * 100}%`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="#fff"
                    opacity="0.8"
                    fontWeight="bold"
                  >
                    {Math.round((i / 10) * max)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Center hub */}
          <circle
            cx="50%"
            cy="50%"
            r="5%"
            fill="#2C3E50"
            stroke="#1a1a1a"
            strokeWidth="2"
          />

          {/* Needle */}
          <g
            transform={`rotate(${needleAngle} ${size * 0.45} ${size * 0.45})`}
            style={{
              transformOrigin: 'center',
              transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <polygon
              points={`${size * 0.45},${size * 0.45} ${size * 0.44},${size * 0.25} ${size * 0.46},${size * 0.25}`}
              fill="#ff0000"
              filter={`url(#needle-glow-${label})`}
            />
            <circle
              cx={`${size * 0.45}`}
              cy={`${size * 0.45}`}
              r="3"
              fill="#ff0000"
            />
          </g>

          {/* Brand text */}
          <text
            x="50%"
            y="70%"
            textAnchor="middle"
            fontSize="8"
            fill="#666"
            fontFamily="Arial, sans-serif"
            letterSpacing="1"
            opacity="0.8"
          >
            REPSPHERES
          </text>
        </GaugeFace>

        {/* Glass cover */}
        <GlassCover size={size} />

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