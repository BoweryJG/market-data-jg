import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, styled, keyframes, Avatar, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../Auth/LoginModal';
import SignupModal from '../Auth/SignupModal';

// Root CSS variables for gem colors
const gemColors = {
  impossible: 'rgb(255, 0, 255)',
  shift: 'rgb(0, 255, 255)',
  deep: 'rgb(255, 0, 170)',
  bgDark: '#0a0a0a',
  bgDarker: '#050505',
  panelDark: '#1a1a1a',
  panelDarker: '#141414',
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
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  glass: 'rgba(255, 255, 255, 0.05)',
  glassHover: 'rgba(255, 255, 255, 0.08)',
  matrixGreen: '#00ff41',
  warningRed: '#ff0040',
  amberNeutral: '#ffaa00',
};

// Animations
const glassOscillate = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.02); }
`;

const screwWiggle = keyframes`
  0%, 100% { transform: rotate(var(--angle, 10deg)); }
  25% { transform: rotate(calc(var(--angle, 10deg) + 1.5deg)); }
  50% { transform: rotate(calc(var(--angle, 10deg) - 1deg)); }
  75% { transform: rotate(calc(var(--angle, 10deg) + 0.5deg)); }
`;

const jewelPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.5); opacity: 0.3; }
`;

const statusUpdate = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.6; color: ${gemColors.textSecondary}; }
`;

const forcefieldRotate = keyframes`
  0% { transform: translate(-50%, -50%) scale(1.15) rotate(0deg); }
  100% { transform: translate(-50%, -50%) scale(1.15) rotate(360deg); }
`;

// Fixed Header Container
const HeaderContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  paddingTop: '24px',
  transition: 'all 0.3s ease',
  '&.scrolled': {
    '& .nav-container': {
      boxShadow: `
        0 16px 50px rgba(0, 0, 0, 0.5),
        0 0 30px ${gemColors.impossible}33,
        0 0 60px ${gemColors.shift}1A,
        0 2px 20px rgba(159, 88, 250, 0.15),
        inset 0 -1px 1px rgba(255,255,255,0.04),
        inset 0 1px 0 rgba(255,255,255,0.08)
      `,
      borderColor: 'rgba(255,255,255,0.12)',
      background: `linear-gradient(to right,
        rgba(26, 26, 26, 0.98) 0%,
        rgba(32, 32, 32, 0.95) 10%,
        rgba(30, 30, 30, 0.92) 50%,
        rgba(32, 32, 32, 0.95) 90%,
        rgba(26, 26, 26, 0.98) 100%
      )`,
      transform: 'translateX(-50%) scale(0.98) translateZ(30px)',
    },
  },
}));

// Navigation Container with Floating Bezel Design
const NavContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '96vw',
  maxWidth: '1400px',
  height: '60px',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  background: `linear-gradient(to right,
    rgba(26, 26, 26, 0.95) 0%,
    rgba(30, 30, 30, 0.9) 10%,
    rgba(28, 28, 28, 0.88) 50%,
    rgba(30, 30, 30, 0.9) 90%,
    rgba(26, 26, 26, 0.95) 100%
  )`,
  border: `1px solid ${gemColors.borderColor}`,
  borderRadius: '18px',
  boxShadow: `
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 20px ${gemColors.shift}14,
    0 2px 10px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3)
  `,
  transformStyle: 'preserve-3d',
  perspective: '1000px',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  
  // Parallax Background Grid
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 50%, ${gemColors.impossible}0D 0%, transparent 50%),
      radial-gradient(circle at 80% 50%, ${gemColors.shift}0D 0%, transparent 50%),
      repeating-linear-gradient(
        0deg,
        transparent 0px,
        transparent 19px,
        rgba(255, 255, 255, 0.01) 20px
      ),
      repeating-linear-gradient(
        90deg,
        transparent 0px,
        transparent 19px,
        rgba(255, 255, 255, 0.01) 20px
      )
    `,
    opacity: 0.5,
    pointerEvents: 'none',
    transition: 'transform 0.1s linear',
  },
  
  // Glass Refraction Overlay
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse at top left, rgba(255,255,255,0.06), transparent 70%),
      radial-gradient(ellipse at bottom right, ${gemColors.impossible}0D, transparent 60%)
    `,
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    opacity: 0.2,
    animation: `${glassOscillate} 8s ease-in-out infinite`,
  },
  
  '&:hover': {
    '& .nav-edge': {
      opacity: 1,
      boxShadow: `0 0 12px ${gemColors.shift}4D`,
      transform: 'scaleY(1.1)',
    },
    '& .nav-edge::after': {
      opacity: 0.5,
    },
  },
}));

// Nav Inner Container
const NavInner = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  position: 'relative',
}));

// Logo Section
const NavLogo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  textDecoration: 'none',
  position: 'relative',
  padding: '8px 16px',
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transformStyle: 'preserve-3d',
  cursor: 'pointer',
  '&:hover': {
    background: `${gemColors.impossible}1A`,
  },
}));

// Navigation Links Container
const NavLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  justifyContent: 'center',
  flex: 1,
}));

// Navigation Link
const NavLink = styled(Button)(({ theme }) => ({
  position: 'relative',
  padding: '8px 16px',
  borderRadius: '10px',
  textDecoration: 'none',
  color: gemColors.textSecondary,
  fontSize: '13px',
  fontWeight: 500,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid transparent',
  overflow: 'hidden',
  textTransform: 'none',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, 
      transparent 0%,
      ${gemColors.impossible}1A 50%,
      transparent 100%
    )`,
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  '&:hover': {
    color: gemColors.textPrimary,
    background: 'rgba(255, 255, 255, 0.05)',
    borderColor: `${gemColors.impossible}4D`,
    transform: 'translateY(-1px)',
    boxShadow: `
      0 4px 20px ${gemColors.impossible}33,
      0 0 0 1px ${gemColors.impossible}1A inset
    `,
    '&::before': {
      transform: 'translateX(100%)',
    },
  },
}));

// Nav Link Icon
const NavLinkIcon = styled(Box)(({ theme }) => ({
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '5px',
    height: '5px',
    background: 'currentColor',
    borderRadius: '50%',
    opacity: 0.6,
    animation: `${pulse} 2s infinite`,
  },
}));

// Right Actions Container
const NavActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}));

// Premium CTA Button - Exact from HTML
const NavCTA = styled(Button)(({ theme }) => ({
  position: 'relative',
  padding: '10px 24px',
  borderRadius: '12px',
  background: `linear-gradient(135deg, ${gemColors.purplePrimary}, ${gemColors.blueAccent})`,
  color: 'white',
  fontWeight: 600,
  fontSize: '14px',
  textDecoration: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  boxShadow: `
    0 4px 20px rgba(159, 88, 250, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset
  `,
  textTransform: 'none',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    border: '2px solid',
    borderColor: `transparent ${gemColors.impossible} transparent ${gemColors.shift}`,
    borderRadius: '12px',
    transform: 'translate(-50%, -50%) scale(1.1)',
    opacity: 0,
    transition: 'all 0.3s ease',
  },
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `
      0 6px 30px rgba(159, 88, 250, 0.4),
      0 0 0 2px rgba(255, 255, 255, 0.2) inset,
      0 0 40px ${gemColors.impossible}4D
    `,
    filter: 'brightness(1.1)',
    '&::after': {
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1.15) rotate(180deg)',
      animation: `${forcefieldRotate} 2s linear infinite`,
    },
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.5s',
  },
  
  '&:hover::before': {
    left: '100%',
  },
}));

// More Menu Button
const NavMore = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
    borderColor: `${gemColors.impossible}4D`,
    transform: 'translateY(-1px)',
  },
}));

// Edge Mount Indicators
const NavEdge = styled(Box)<{ side: 'left' | 'right' }>(({ side }) => ({
  position: 'absolute',
  top: '10px',
  bottom: '10px',
  width: '3px',
  background: `linear-gradient(to bottom, ${gemColors.impossible}33, ${gemColors.shift}1A)`,
  boxShadow: `0 0 8px ${gemColors.shift}26`,
  opacity: 0.6,
  zIndex: 1,
  transition: 'all 0.3s ease',
  transform: 'scaleY(1)',
  ...(side === 'left' ? { left: '-4px', borderRadius: '2px 0 0 2px' } : { right: '-4px', borderRadius: '0 2px 2px 0' }),
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '10px',
    height: '80%',
    background: `radial-gradient(circle, ${gemColors.deep}66, transparent)`,
    transform: 'translate(-50%, -50%)',
    opacity: 0.1,
    transition: 'opacity 0.3s ease',
  },
}));

// Screw Wrapper with Bezel Inset
const ScrewWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: `radial-gradient(circle at center, 
    rgba(0,0,0,0.3) 0%, 
    rgba(0,0,0,0.15) 40%, 
    transparent 70%
  )`,
  boxShadow: `
    inset 0 1px 2px rgba(0,0,0,0.5),
    inset 0 -1px 1px rgba(255,255,255,0.1),
    0 1px 1px rgba(255,255,255,0.05)
  `,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&.screw-wrapper-top-left': { 
    top: '10px', 
    left: '10px',
    '--angle': '10deg',
    animationDelay: '0s',
  },
  '&.screw-wrapper-top-right': { 
    top: '10px', 
    right: '10px',
    '--angle': '22deg',
    animationDelay: '1.2s',
  },
  '&.screw-wrapper-bot-left': { 
    bottom: '10px', 
    left: '10px',
    '--angle': '-12deg',
    animationDelay: '2.4s',
  },
  '&.screw-wrapper-bot-right': { 
    bottom: '10px', 
    right: '10px',
    '--angle': '18deg',
    animationDelay: '3.6s',
  },
}));

// Screw Inner
const ScrewInner = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '5px',
  height: '5px',
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
  transform: 'rotate(var(--angle, 10deg))',
  animation: `${screwWiggle} 5s ease-in-out infinite`,
  
  // Phillips head screw grooves
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.7) 80%, transparent)',
    boxShadow: '0 0 1px rgba(255,255,255,0.15)',
  },
  '&::before': {
    width: '70%',
    height: '0.5px',
    transform: 'translate(-50%, -50%) rotate(0deg)',
  },
  '&::after': {
    width: '0.5px',
    height: '70%',
    transform: 'translate(-50%, -50%)',
  },
}));

// Screw Jewel
const ScrewJewel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '1.5px',
  height: '1.5px',
  transform: 'translate(-50%, -50%)',
  background: `radial-gradient(circle at center, 
    rgba(255,255,255,0.8), 
    ${gemColors.impossible}99, 
    ${gemColors.deep}66, 
    transparent
  )`,
  borderRadius: '50%',
  opacity: 0.7,
  animation: `${jewelPulse} 3s infinite`,
}));

// Telemetry Container
const TelemetryContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: '8px',
  width: '96vw',
  maxWidth: '1400px',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '8px 0',
  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 0%, transparent 100%)',
}));

// Telemetry Rail System
const TelemetryRailSystem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  padding: '0 24px',
}));

// Telemetry Rail Wrapper
const TelemetryRailWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '50vw',
  maxWidth: '600px',
  margin: '0 auto',
  [theme.breakpoints.up('sm')]: { width: '60vw' },
  [theme.breakpoints.up('md')]: { width: '70vw' },
  [theme.breakpoints.up('lg')]: { width: '600px' },
}));

// Telemetry Node - Exact from HTML
const TelemetryNode = styled(Box)(({ theme }) => ({
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  background: `radial-gradient(circle, 
    ${gemColors.impossible}, 
    ${gemColors.deep}CC,
    transparent
  )`,
  boxShadow: `
    0 0 4px ${gemColors.shift}99,
    inset 0 0 1px rgba(255,255,255,0.5)
  `,
  animation: `${jewelPulse} 3s infinite ease-in-out`,
  position: 'relative',
  '&.left': {
    animationDelay: '0s',
  },
  '&.right': {
    animationDelay: '1.5s',
  },
}));

// Telemetry Status
const TelemetryStatus = styled(Typography)(({ theme }) => ({
  fontSize: '8px',
  color: gemColors.textMuted,
  textTransform: 'uppercase',
  fontFamily: "'Orbitron', monospace",
  letterSpacing: '0.4px',
  opacity: 0.4,
  transition: 'all 0.3s ease',
  animation: `${statusUpdate} 8s infinite`,
  textAlign: 'center',
  flexShrink: 0,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
    color: gemColors.impossible,
    textShadow: `0 0 3px ${gemColors.impossible}80`,
  },
}));

const PremiumNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const statusMessages = [
    '⏱ AI SYNC 97%',
    '🔗 NEURAL LINK ACTIVE',
    '⚡ QUANTUM CORE 100%',
    '📊 DATA STREAM LIVE',
    '🛡️ SECURITY OPTIMAL',
    '🌐 NETWORK STABLE',
    '💎 GEMS ALIGNED',
    '🔮 PREDICTION MODE'
  ];

  const getUserInitials = (email: string | undefined) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut();
    handleMenuClose();
    navigate('/');
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <HeaderContainer className={scrolled ? 'scrolled' : ''}>
      <NavContainer className="nav-container">
        {/* Edge Mount Indicators */}
        <NavEdge className="nav-edge" side="left" />
        <NavEdge className="nav-edge" side="right" />
        
        {/* Advanced Metallic Screws with Wrappers */}
        <Box className="nav-screws" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
          <ScrewWrapper className="screw-wrapper-top-left">
            <ScrewInner>
              <ScrewJewel />
            </ScrewInner>
          </ScrewWrapper>
          <ScrewWrapper className="screw-wrapper-top-right">
            <ScrewInner>
              <ScrewJewel />
            </ScrewInner>
          </ScrewWrapper>
          <ScrewWrapper className="screw-wrapper-bot-left">
            <ScrewInner>
              <ScrewJewel />
            </ScrewInner>
          </ScrewWrapper>
          <ScrewWrapper className="screw-wrapper-bot-right">
            <ScrewInner>
              <ScrewJewel />
            </ScrewInner>
          </ScrewWrapper>
        </Box>
        
        <NavInner>
          {/* Logo */}
          <NavLogo onClick={() => navigate('/')}>
            <Box sx={{ width: 36, height: 36, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%">
                <defs>
                  <linearGradient id="sphereGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={gemColors.purplePrimary} />
                    <stop offset="100%" stopColor={gemColors.blueAccent} />
                  </linearGradient>
                  <radialGradient id="jewelGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                    <stop offset="30%" stopColor={gemColors.impossible} stopOpacity="1" />
                    <stop offset="60%" stopColor={gemColors.shift} stopOpacity="1" />
                    <stop offset="100%" stopColor={gemColors.deep} stopOpacity="0.9" />
                  </radialGradient>
                  <filter id="glowTrail">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="16" cy="16" r="12" fill="none" stroke="url(#sphereGradient)" strokeWidth="2" opacity="0.8" />
                <circle cx="16" cy="16" r="8" fill="none" stroke="url(#sphereGradient)" strokeWidth="1.5" opacity="0.5" />
                <circle cx="16" cy="16" r="3" fill="url(#jewelGradient)">
                  <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="16" cy="4" r="1.5" fill={gemColors.purplePrimary} filter="url(#glowTrail)">
                  <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="6s" repeatCount="indefinite"/>
                </circle>
                <circle cx="28" cy="16" r="1.5" fill={gemColors.blueAccent} filter="url(#glowTrail)">
                  <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="8s" repeatCount="indefinite"/>
                </circle>
                <circle cx="16" cy="28" r="1.5" fill={gemColors.greenAccent} filter="url(#glowTrail)">
                  <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="10s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography
                sx={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: '20px',
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${gemColors.purplePrimary}, ${gemColors.blueAccent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.5px',
                  lineHeight: 1,
                }}
              >
                RepSpheres
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: '9px',
                  fontWeight: 600,
                  color: gemColors.textMuted,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  mt: '-2px',
                }}
              >
                Market Data
              </Typography>
            </Box>
          </NavLogo>
          
          {/* Navigation Links */}
          <NavLinks>
            <NavLink onClick={() => navigate('/')}>
              <NavLinkIcon sx={{ '&::before': { backgroundColor: gemColors.greenAccent, boxShadow: `0 0 10px ${gemColors.greenAccent}` } }} />
              <span>Market Data</span>
            </NavLink>
            <NavLink onClick={() => navigate('/canvas')}>
              <NavLinkIcon sx={{ '&::before': { backgroundColor: gemColors.purplePrimary, boxShadow: `0 0 10px ${gemColors.purplePrimary}` } }} />
              <span>Canvas</span>
            </NavLink>
            <NavLink onClick={() => navigate('/sphere-os')}>
              <NavLinkIcon sx={{ '&::before': { backgroundColor: gemColors.blueAccent, boxShadow: `0 0 10px ${gemColors.blueAccent}` } }} />
              <span>Sphere oS</span>
            </NavLink>
            <NavLink onClick={() => navigate('/podcasts')}>
              <NavLinkIcon sx={{ '&::before': { backgroundColor: gemColors.pinkAccent, boxShadow: `0 0 10px ${gemColors.pinkAccent}` } }} />
              <span>Podcasts</span>
            </NavLink>
          </NavLinks>
          
          {/* Right Actions */}
          <NavActions>
            {user ? (
              <>
                <Avatar
                  onClick={handleMenuOpen}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: `linear-gradient(135deg, ${gemColors.purplePrimary}, ${gemColors.blueAccent})`,
                    background: `linear-gradient(135deg, ${gemColors.purplePrimary}, ${gemColors.blueAccent})`,
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 600,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 2px 10px ${gemColors.purplePrimary}33`,
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: `0 4px 20px ${gemColors.purplePrimary}66`,
                    },
                  }}
                >
                  {getUserInitials(user.email)}
                </Avatar>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      bgcolor: gemColors.panelDarker,
                      border: `1px solid ${gemColors.borderColor}`,
                      boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4)`,
                      '& .MuiMenuItem-root': {
                        color: gemColors.textPrimary,
                        fontSize: '14px',
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          bgcolor: gemColors.glassHover,
                        },
                      },
                    },
                  }}
                >
                  <MenuItem disabled sx={{ 
                    fontSize: '12px !important', 
                    color: `${gemColors.textMuted} !important`,
                    borderBottom: `1px solid ${gemColors.borderColor}`,
                    pb: 1,
                    mb: 1,
                  }}>
                    {user.email}
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <NavCTA onClick={() => setSignupModalOpen(true)}>Sign Up</NavCTA>
                <NavCTA 
                  onClick={() => setLoginModalOpen(true)}
                  sx={{
                    background: 'transparent',
                    border: `1px solid ${gemColors.purplePrimary}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${gemColors.purplePrimary}, ${gemColors.blueAccent})`,
                    },
                  }}
                >
                  Login
                </NavCTA>
              </>
            )}
            <NavMore>
              <Box sx={{ display: 'flex', gap: '3px' }}>
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: '3px',
                      height: '3px',
                      borderRadius: '50%',
                      backgroundColor: gemColors.textSecondary,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                ))}
              </Box>
            </NavMore>
          </NavActions>
        </NavInner>
      </NavContainer>
      
      {/* PATCHED TELEMETRY SYSTEM */}
      <TelemetryContainer>
        <TelemetryRailSystem>
          <TelemetryRailWrapper>
            <TelemetryNode className="left" />
            <TelemetryStatus>{statusMessages[statusIndex]}</TelemetryStatus>
            <TelemetryNode className="right" />
          </TelemetryRailWrapper>
        </TelemetryRailSystem>
      </TelemetryContainer>
      
      {/* Auth Modals */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
        onGoogleAuth={() => {
          // OAuth will redirect, modal will close automatically
          setLoginModalOpen(false);
        }}
        onFacebookAuth={() => {
          // OAuth will redirect, modal will close automatically
          setLoginModalOpen(false);
        }}
        onEmailAuth={() => {
          // Switch to email auth modal
          setLoginModalOpen(false);
          // You could open an email/password modal here
        }}
      />
      <SignupModal open={signupModalOpen} onClose={() => setSignupModalOpen(false)} />
    </HeaderContainer>
  );
};

export default PremiumNavbar;