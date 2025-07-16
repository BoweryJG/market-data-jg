import React, { useEffect, useRef, useState } from 'react';
import { useTheme, Box, Typography } from '@mui/material';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

interface ParticleFieldProps {
  isPlaying: boolean;
}

const ParticleField: React.FC<ParticleFieldProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const [canvasSupported, setCanvasSupported] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for canvas support
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
      if (!ctx) {
        console.warn('Canvas 2D context not supported');
        setCanvasSupported(false);
        return;
      }
    } catch (error) {
      console.error('Error getting canvas context:', error);
      setCanvasSupported(false);
      return;
    }

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const particleCount = 200;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() * 60 + (theme.palette.mode === 'dark' ? 200 : 20)
    }));

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;
      
      try {
        ctx.fillStyle = theme.palette.mode === 'dark' 
          ? 'rgba(0, 0, 0, 0.05)' 
          : 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach(particle => {
        // Update position
        if (isPlaying) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // Wrap around edges
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;
        }

        // Calculate perspective scale
        const scale = 1000 / (1000 + particle.z);
        const x = (particle.x - canvas.width / 2) * scale + canvas.width / 2;
        const y = (particle.y - canvas.height / 2) * scale + canvas.height / 2;
        const size = particle.size * scale;

          // Draw particle with glow effect
          try {
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 50%, ${particle.opacity})`);
            gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 50%, ${particle.opacity * 0.5})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size * 3, 0, Math.PI * 2);
            ctx.fill();

            // Draw core
            ctx.fillStyle = `hsla(${particle.hue}, 100%, 70%, ${particle.opacity * 2})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          } catch (drawError) {
            // Fallback to simple circle if gradient fails
            ctx.fillStyle = `hsla(${particle.hue}, 70%, 50%, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }

          // Pulse effect
          if (isPlaying) {
            particle.opacity = 0.1 + Math.sin(Date.now() * 0.001 + particle.x) * 0.1;
          }
        });
      } catch (animationError) {
        console.error('Error in particle animation:', animationError);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, theme]);

  if (!canvasSupported) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(ellipse at center, ${theme.palette.primary.main}20 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            opacity: 0.6,
            textAlign: 'center',
            color: theme.palette.text.secondary
          }}
        >
          3D Effects Unavailable
        </Typography>
      </Box>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    />
  );
};

export default ParticleField;