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
  // Container base styles - Machined Component Design
  container: {
    borderRadius: '16px',
    border: `1px solid ${navbarColors.borderColor}`,
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    background: `
      linear-gradient(135deg, 
        rgba(255,255,255,0.02) 0%, 
        rgba(255,255,255,0) 50%, 
        rgba(0,0,0,0.02) 100%),
      linear-gradient(to right,
        rgba(26, 26, 26, 0.95) 0%,
        rgba(32, 32, 32, 0.92) 20%,
        rgba(30, 30, 30, 0.9) 50%,
        rgba(32, 32, 32, 0.92) 80%,
        rgba(26, 26, 26, 0.95) 100%
      )
    `,
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.6),
      0 2px 8px rgba(0, 0, 0, 0.8),
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -1px 0 rgba(0, 0, 0, 0.5),
      inset 1px 0 0 rgba(255, 255, 255, 0.04),
      inset -1px 0 0 rgba(255, 255, 255, 0.04)
    `,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  
  // Refined metallic screw styles - Swiss precision
  screw: {
    position: 'absolute' as const,
    width: '4px',
    height: '4px',
    background: `radial-gradient(circle at 30% 30%, #f0f0f0 0%, #d8d8d8 10%, #b8b8b8 20%, #999 40%, #777 60%, #555 80%, #333 100%)`,
    borderRadius: '50%',
    boxShadow: `
      inset 0 0.5px 0.5px rgba(255,255,255,0.6),
      inset 0 -0.5px 0.5px rgba(0,0,0,0.4),
      0 0.5px 1px rgba(0,0,0,0.6)
    `,
    border: '0.25px solid rgba(0,0,0,0.15)',
    overflow: 'hidden' as const,
  },
  
  // Phillips head groove styles
  screwGroove: {
    horizontal: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      width: '60%',
      height: '0.5px',
      background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.3) 80%, transparent)',
      transform: 'translate(-50%, -50%)',
    },
    vertical: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      width: '0.5px',
      height: '60%',
      background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.3) 80%, transparent)',
      transform: 'translate(-50%, -50%)',
    },
  },
  
  // Tiny jewel center
  screwJewel: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    width: '1px',
    height: '1px',
    transform: 'translate(-50%, -50%)',
    background: `radial-gradient(circle at center, rgba(0, 255, 255, 0.4), transparent)`,
    borderRadius: '50%',
    pointerEvents: 'none' as const,
  },
  
  // Screw positions - Closer for tighter precision
  screwPositions: {
    topLeft: { top: '8px', left: '8px' },
    topRight: { top: '8px', right: '8px' },
    bottomLeft: { bottom: '8px', left: '8px' },
    bottomRight: { bottom: '8px', right: '8px' },
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

// Premium panel and card styles
export const luxuryPanelStyles = {
  // Base panel with machined edges
  panel: {
    borderRadius: '12px',
    border: `1px solid ${navbarColors.borderColor}`,
    background: `
      linear-gradient(135deg, 
        rgba(255,255,255,0.015) 0%, 
        rgba(255,255,255,0) 50%, 
        rgba(0,0,0,0.015) 100%),
      ${navbarColors.panelDark}
    `,
    boxShadow: `
      0 4px 16px rgba(0, 0, 0, 0.5),
      0 1px 4px rgba(0, 0, 0, 0.7),
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 -1px 0 rgba(0, 0, 0, 0.4),
      inset 1px 0 0 rgba(255, 255, 255, 0.03),
      inset -1px 0 0 rgba(255, 255, 255, 0.03)
    `,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  
  // Card variant with lighter background
  card: {
    borderRadius: '10px',
    border: `1px solid ${navbarColors.borderColor}`,
    background: `
      linear-gradient(135deg, 
        rgba(255,255,255,0.02) 0%, 
        rgba(255,255,255,0) 50%, 
        rgba(0,0,0,0.02) 100%),
      rgba(255, 255, 255, 0.03)
    `,
    boxShadow: `
      0 2px 8px rgba(0, 0, 0, 0.4),
      0 1px 2px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3)
    `,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  
  // Gauge wrapper with deep inset
  gaugeWrapper: {
    borderRadius: '50%',
    background: `
      radial-gradient(circle at 50% 50%, 
        rgba(0,0,0,0.4) 0%, 
        rgba(0,0,0,0.2) 50%, 
        rgba(0,0,0,0) 100%),
      ${navbarColors.panelDarker}
    `,
    boxShadow: `
      inset 0 2px 4px rgba(0, 0, 0, 0.8),
      inset 0 -1px 2px rgba(0, 0, 0, 0.6),
      0 1px 0 rgba(255, 255, 255, 0.04)
    `,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
};

// Utility function to apply premium container styles
export const getPremiumContainerStyles = (isHovered: boolean = false) => ({
  ...navbarStyles.container,
  ...(isHovered ? navbarStyles.hoverState : {}),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
});