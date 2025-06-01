import React from 'react';
import { Box, Typography } from '@mui/material';

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
  const angle = (percentage / 100) * 180 - 90; // -90 to 90 degrees
  const radius = size / 2 - 20;
  
  return (
    <Box sx={{ 
      position: 'relative', 
      width: size, 
      height: size / 2 + 40,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
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
        
        {/* CENTER POINT */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="8"
          fill="#333"
          stroke="#000"
          strokeWidth="2"
        />
        
        {/* LUXURY NEEDLE - THIN, SLEEK DESIGN */}
        <g transform={`rotate(${angle} ${size / 2} ${size / 2})`}>
          {/* Main needle body - ultra thin like luxury car needle */}
          <path
            d={`M ${size / 2} ${size / 2 - 2} L ${size / 2 + radius - 15} ${size / 2} L ${size / 2} ${size / 2 + 2} Z`}
            fill="url(#needleGradient)"
            stroke="#2C3E50"
            strokeWidth="0.5"
          />
          
          {/* Needle tip - pointed for precision */}
          <circle
            cx={size / 2 + radius - 15}
            cy={size / 2}
            r="2"
            fill="#E74C3C"
            stroke="#C0392B"
            strokeWidth="0.5"
          />
        </g>
        
        {/* LUXURY NEEDLE BASE - ROTATING HUB */}
        <defs>
          <radialGradient id="needleGradient" cx="0%" cy="50%" r="100%">
            <stop offset="0%" stopColor="#E74C3C" />
            <stop offset="50%" stopColor="#C0392B" />
            <stop offset="100%" stopColor="#922B21" />
          </radialGradient>
          
          <radialGradient id="baseGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ECF0F1" />
            <stop offset="50%" stopColor="#BDC3C7" />
            <stop offset="100%" stopColor="#2C3E50" />
          </radialGradient>
        </defs>
        
        {/* Outer ring - luxury finish */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="10"
          fill="url(#baseGradient)"
          stroke="#34495E"
          strokeWidth="1"
        />
        
        {/* Inner hub - precision center */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="6"
          fill="#2C3E50"
          stroke="#1B2631"
          strokeWidth="0.5"
        />
        
        {/* Center jewel - luxury detail */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="2"
          fill="#E74C3C"
          stroke="#C0392B"
          strokeWidth="0.5"
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