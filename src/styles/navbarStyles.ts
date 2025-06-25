// Navbar-inspired styling constants extracted from repspheres-navbar-ultimate.html
// These create the premium floating bezel design with metallic screws and glass effects

export const navbarColors = {
  // Background colors
  bgDark: '#0a0a0a',
  bgDarker: '#050505',
  panelDark: '#1a1a1a',
  panelDarker: '#141414',
  
  // Primary colors
  purplePrimary: '#9f58fa',
  purpleDark: '#7e22ce',
  purpleLight: '#a855f7',
  blueAccent: '#4B96DC',
  blueLight: '#60a5fa',
  greenAccent: '#4bd48e',
  greenNeon: '#00ff88',
  pinkAccent: '#f53969',
  orangeAccent: '#ff6b35',
  cyanAccent: '#00d4ff',
  yellowAccent: '#ffd93d',
  
  // Gem colors for special effects
  gemImpossible: 'rgb(255, 0, 255)',
  gemShift: 'rgb(0, 255, 255)',
  gemDeep: 'rgb(255, 0, 170)',
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Border and glass effects
  borderColor: 'rgba(255, 255, 255, 0.1)',
  glass: 'rgba(255, 255, 255, 0.05)',
  glassHover: 'rgba(255, 255, 255, 0.08)',
};

export const navbarStyles = {
  // Container base styles
  container: {
    borderRadius: '18px',
    border: `1px solid ${navbarColors.borderColor}`,
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    background: `linear-gradient(to right,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(30, 30, 30, 0.9) 10%,
      rgba(28, 28, 28, 0.88) 50%,
      rgba(30, 30, 30, 0.9) 90%,
      rgba(26, 26, 26, 0.95) 100%
    )`,
    boxShadow: `
      0 12px 40px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(0, 255, 255, 0.08),
      0 2px 10px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3)
    `,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  
  // Metallic screw styles
  screw: {
    position: 'absolute' as const,
    width: '5.6px',  // Reduced by 30% from 8px
    height: '5.6px', // Reduced by 30% from 8px
    background: `
      radial-gradient(circle at 35% 35%, #e0e0e0 0%, #b8b8b8 15%, #888 40%, #555 70%, #222 100%),
      linear-gradient(135deg, #ccc 0%, #666 100%)
    `,
    backgroundSize: '100%, 100%',
    borderRadius: '50%',
    boxShadow: `
      inset 0 0.5px 1px rgba(255,255,255,0.4),
      inset 0 -0.5px 1px rgba(0,0,0,0.5),
      0 0.5px 2px rgba(0,0,0,0.8),
      0 0 3px rgba(0,0,0,0.3)
    `,
    border: '0.5px solid rgba(0,0,0,0.2)',
  },
  
  // Screw positions
  screwPositions: {
    topLeft: { top: '12px', left: '12px' },
    topRight: { top: '12px', right: '12px' },
    bottomLeft: { bottom: '12px', left: '12px' },
    bottomRight: { bottom: '12px', right: '12px' },
  },
  
  // Edge mount indicator styles
  edgeMount: {
    position: 'absolute' as const,
    top: '10px',
    bottom: '10px',
    width: '3px',
    background: `linear-gradient(to bottom,
      rgba(255, 0, 255, 0.2),
      rgba(0, 255, 255, 0.1)
    )`,
    boxShadow: '0 0 8px rgba(0, 255, 255, 0.15)',
    opacity: 0.6,
    transition: 'all 0.3s ease',
  },
  
  // Glass overlay effect
  glassOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse at top left, rgba(255,255,255,0.06), transparent 70%),
      radial-gradient(ellipse at bottom right, rgba(255, 0, 255, 0.03), transparent 60%)
    `,
    pointerEvents: 'none' as const,
    mixBlendMode: 'screen' as const,
    opacity: 0.2,
  },
  
  // Hover effects
  hoverState: {
    boxShadow: `
      0 16px 50px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(255, 0, 255, 0.12),
      0 0 60px rgba(0, 255, 255, 0.06),
      0 2px 20px rgba(159, 88, 250, 0.15),
      inset 0 -1px 1px rgba(255,255,255,0.04),
      inset 0 1px 0 rgba(255,255,255,0.08)
    `,
    borderColor: 'rgba(255,255,255,0.12)',
  },
};

// Animation keyframes as CSS strings
export const navbarAnimations = {
  glassOscillate: `
    @keyframes glassOscillate {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(1.02); }
    }
  `,
  
  screwGlow: `
    @keyframes screwGlow {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }
  `,
  
  edgeGlow: `
    @keyframes edgeGlow {
      0%, 100% { opacity: 0.6; box-shadow: 0 0 8px rgba(0, 255, 255, 0.15); }
      50% { opacity: 1; box-shadow: 0 0 12px rgba(0, 255, 255, 0.3); }
    }
  `,
};

// Utility function to apply premium container styles
export const getPremiumContainerStyles = (isHovered: boolean = false) => ({
  ...navbarStyles.container,
  ...(isHovered ? navbarStyles.hoverState : {}),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
});