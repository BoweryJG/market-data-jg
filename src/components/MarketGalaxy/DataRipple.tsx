import React from 'react';
import { useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface DataRippleProps {
  x: number;
  y: number;
}

const DataRipple: React.FC<DataRippleProps> = ({ x, y }) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 3, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 100,
        height: 100,
        marginLeft: -50,
        marginTop: -50,
        pointerEvents: 'none'
      }}
    >
      {/* Multiple ripple rings */}
      {[0, 0.3, 0.6].map((delay, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ 
            duration: 1.5, 
            delay,
            ease: 'easeOut' 
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `2px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 20px ${theme.palette.primary.main}`
          }}
        />
      ))}

      {/* Center burst effect */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.main} 0%, transparent 70%)`,
          filter: 'blur(10px)'
        }}
      />

      {/* Data particles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 50;
        
        return (
          <motion.div
            key={`particle-${i}`}
            initial={{ 
              x: 0, 
              y: 0,
              scale: 1,
              opacity: 1
            }}
            animate={{ 
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: 0,
              opacity: 0
            }}
            transition={{ 
              duration: 1,
              delay: 0.1,
              ease: 'easeOut'
            }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 4,
              height: 4,
              marginLeft: -2,
              marginTop: -2,
              borderRadius: '50%',
              backgroundColor: theme.palette.secondary.main,
              boxShadow: `0 0 10px ${theme.palette.secondary.main}`
            }}
          />
        );
      })}
    </motion.div>
  );
};


DataRipple.displayName = 'DataRipple';export default DataRipple;