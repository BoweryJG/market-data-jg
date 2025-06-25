import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface HTMLGaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  size?: number;
  isLive?: boolean;
}

const GaugeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const ChromeBezel = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '115%',
  height: '115%',
  borderRadius: '50%',
  background: 'conic-gradient(from 0deg at 50% 50%, #e0e0e0 0deg, #b8b8b8 45deg, #666 90deg, #888 135deg, #b8b8b8 180deg, #e0e0e0 225deg, #888 270deg, #666 315deg, #e0e0e0 360deg)',
  boxShadow: `
    inset 0 0 20px rgba(0,0,0,0.3),
    0 5px 20px rgba(0,0,0,0.4),
    0 0 30px rgba(0,0,0,0.2)
  `,
});

const GlassCover = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95%',
  height: '95%',
  borderRadius: '50%',
  background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.05) 60%, transparent 100%)',
  pointerEvents: 'none',
});

const DigitalDisplay = styled(Box)({
  position: 'absolute',
  top: '25%',
  left: '50%',
  transform: 'translateX(-50%)',
  background: '#000',
  border: '2px solid #333',
  borderRadius: '4px',
  padding: '4px 8px',
  boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.8)',
});

const DigitalValue = styled(Typography)<{ gaugeColor: string }>(({ gaugeColor }) => ({
  fontFamily: 'monospace',
  fontSize: '18px',
  fontWeight: 'bold',
  color: gaugeColor,
  textShadow: `0 0 10px ${gaugeColor}`,
  letterSpacing: '2px',
}));

const HTMLGauge: React.FC<HTMLGaugeProps> = ({
  value,
  max,
  label,
  unit,
  color,
  size = 140,
  isLive = false,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [needleAngle, setNeedleAngle] = useState(-90);
  const [isSpinning, setIsSpinning] = useState(false);
  const needleRef = useRef<SVGGElement>(null);

  // Calculate needle angle
  const targetAngle = (value / max) * 180 - 90;

  // Animate needle on value change
  useEffect(() => {
    const animationDuration = isSpinning ? 1000 : 1500;
    const startAngle = needleAngle;
    const startTime = Date.now();
    const startValue = displayValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Easing function
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const easedProgress = easeInOutCubic(progress);

      // Update needle angle
      const currentAngle = startAngle + (targetAngle - startAngle) * easedProgress;
      setNeedleAngle(currentAngle);

      // Update display value
      const currentValue = startValue + (value - startValue) * easedProgress;
      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
      }
    };

    animate();
  }, [value, max]);

  // Initial animation on mount
  useEffect(() => {
    const initialDelay = Math.random() * 500 + 300;
    setTimeout(() => {
      setNeedleAngle(targetAngle);
      setDisplayValue(value);
    }, initialDelay);
  }, []);

  const handleClick = () => {
    if (!isSpinning) {
      setIsSpinning(true);
      setNeedleAngle(needleAngle + 360);
    }
  };

  // Dynamic color based on value percentage
  const getGaugeColor = () => {
    const percentage = (value / max) * 100;
    if (percentage > 80) return '#00ff00';
    if (percentage > 60) return '#ffd700';
    if (percentage > 40) return '#ff9900';
    return '#ff4444';
  };

  const gaugeColor = getGaugeColor();

  return (
    <GaugeContainer onClick={handleClick}>
      <ChromeBezel />
      
      <svg width={size} height={size} style={{ position: 'relative', zIndex: 1 }}>
        <defs>
          {/* Gradient for gauge face */}
          <radialGradient id={`face-gradient-${label}`}>
            <stop offset="0%" stopColor="#f5f5f5" />
            <stop offset="100%" stopColor="#e0e0e0" />
          </radialGradient>
          
          {/* Needle gradient */}
          <linearGradient id={`needle-gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff0000" />
            <stop offset="50%" stopColor="#cc0000" />
            <stop offset="100%" stopColor="#880000" />
          </linearGradient>
          
          {/* Needle shadow */}
          <filter id={`needle-shadow-${label}`}>
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Gauge face */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          fill={`url(#face-gradient-${label})`}
          stroke="#ccc"
          strokeWidth="1"
        />

        {/* Tick marks */}
        {Array.from({ length: 11 }, (_, i) => {
          const angle = (i / 10) * 180 - 90;
          const radian = (angle * Math.PI) / 180;
          const isMain = i % 2 === 0;
          const tickLength = isMain ? 15 : 10;
          const innerRadius = size / 2 - 20;
          const outerRadius = innerRadius - tickLength;
          
          const x1 = size / 2 + Math.cos(radian) * innerRadius;
          const y1 = size / 2 + Math.sin(radian) * innerRadius;
          const x2 = size / 2 + Math.cos(radian) * outerRadius;
          const y2 = size / 2 + Math.sin(radian) * outerRadius;

          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#333"
                strokeWidth={isMain ? 2 : 1}
              />
              {isMain && (
                <text
                  x={size / 2 + Math.cos(radian) * (outerRadius - 10)}
                  y={size / 2 + Math.sin(radian) * (outerRadius - 10)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#333"
                  fontWeight="bold"
                >
                  {Math.round((i / 10) * max)}
                </text>
              )}
            </g>
          );
        })}

        {/* Needle */}
        <g
          ref={needleRef}
          transform={`rotate(${needleAngle} ${size / 2} ${size / 2})`}
          style={{
            transition: isSpinning ? 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Needle body */}
          <polygon
            points={`${size / 2 - 2},${size / 2} ${size / 2 + 2},${size / 2} ${size / 2 + 1},${size / 2 - 50} ${size / 2 - 1},${size / 2 - 50}`}
            fill={`url(#needle-gradient-${label})`}
            filter={`url(#needle-shadow-${label})`}
          />
          
          {/* Needle tip */}
          <polygon
            points={`${size / 2 - 1},${size / 2 - 50} ${size / 2 + 1},${size / 2 - 50} ${size / 2},${size / 2 - 55}`}
            fill="#ff0000"
          />
        </g>

        {/* Center hub */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="12"
          fill="#2C3E50"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r="8"
          fill="#34495E"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r="4"
          fill="#ff0000"
        />

        {/* Brand text */}
        <text
          x={size / 2}
          y={size - 25}
          textAnchor="middle"
          fontSize="8"
          fill="#666"
          fontFamily="Arial, sans-serif"
          letterSpacing="1"
        >
          REPSPHERES
        </text>
      </svg>

      {/* Digital display */}
      <DigitalDisplay>
        <DigitalValue gaugeColor={gaugeColor}>
          {displayValue.toString().padStart(2, '0')}{unit}
        </DigitalValue>
      </DigitalDisplay>

      {/* Label */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: 5,
          left: '50%',
          transform: 'translateX(-50%)',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontSize: '11px',
          color: '#333',
        }}
      >
        {label}
      </Typography>

      {/* Live indicator */}
      {isLive && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 6,
            height: 6,
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

      <GlassCover />
    </GaugeContainer>
  );
};

export default HTMLGauge;