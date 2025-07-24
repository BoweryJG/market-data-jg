import React from 'react';
import { useTheme, Box } from '@mui/material';
import { motion } from 'framer-motion';

interface ParticleFieldProps {
  isPlaying: boolean;
}

const ParticleField: React.FC<ParticleFieldProps> = ({ isPlaying }) => {
  const theme = useTheme();

  // Generate particle positions using CSS
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        background: `radial-gradient(ellipse at center, ${theme.palette.primary.main}15 0%, transparent 70%)`,
      }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.palette.primary.main}80, transparent)`,
            boxShadow: `0 0 ${particle.size * 2}px ${theme.palette.primary.main}40`,
          }}
          animate={isPlaying ? {
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          } : {}}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </Box>
  );
};


ParticleField.displayName = 'ParticleField';export default ParticleField;