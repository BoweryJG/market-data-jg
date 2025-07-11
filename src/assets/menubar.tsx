import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

interface NavBarProps {
  onSalesModeToggle?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onSalesModeToggle }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [statusIndex, setStatusIndex] = useState(0);
  const navContainerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY * 0.05;
      document.documentElement.style.setProperty('--scroll-offset', `${offset}px`);
      
      setScrolled(window.scrollY > 50);
      
      updateThemeColors();
      updateActiveNav();
    };

    const updateThemeColors = () => {
      const y = window.scrollY;
      const windowHeight = window.innerHeight;
      const root = document.documentElement;
      const body = document.body;
      
      const section = Math.floor(y / windowHeight);
      
      const themes = [
        { impossible: '255, 0, 255', shift: '0, 255, 255', deep: '255, 0, 170' },
        { impossible: '77, 212, 142', shift: '255, 170, 0', deep: '0, 255, 136' },
        { impossible: '255, 107, 53', shift: '255, 204, 224', deep: '245, 57, 105' },
        { impossible: '75, 150, 220', shift: '159, 88, 250', deep: '0, 212, 255' },
        { impossible: '245, 57, 105', shift: '255, 0, 255', deep: '159, 88, 250' }
      ];
      
      const currentTheme = themes[Math.min(section, themes.length - 1)];
      
      root.style.setProperty('--gem-impossible', `rgb(${currentTheme.impossible})`);
      root.style.setProperty('--gem-shift', `rgb(${currentTheme.shift})`);
      root.style.setProperty('--gem-deep', `rgb(${currentTheme.deep})`);
      
      body.style.setProperty('--gem-impossible', currentTheme.impossible);
      body.style.setProperty('--gem-shift', currentTheme.shift);
      body.style.setProperty('--gem-deep', currentTheme.deep);
    };

    const updateActiveNav = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(section => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= (sectionTop - 200)) {
          current = section.getAttribute('id') || '';
        }
      });
      setActiveSection(current);
    };

    // Initialize GSAP animations
    const initKineticAnimations = () => {
      // Enhanced logo jewel rotation and scale
      const logoJewel = document.querySelector('.logo-jewel');
      if (logoJewel) {
        gsap.set(logoJewel, { transformOrigin: "center" });
        
        // Continuous rotation
        gsap.to(logoJewel, {
          rotation: 360,
          duration: 8,
          ease: "none",
          repeat: -1
        });
        
        // Pulsing scale effect
        gsap.to(logoJewel, {
          scale: 1.15,
          duration: 2,
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1
        });
      }

      // Animate nav links entrance
      const navLinks = document.querySelectorAll('.nav-link');
      gsap.fromTo(navLinks,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)"
        }
      );

      // Enhanced logo hover effects
      const logo = document.querySelector('.nav-logo');
      if (logo) {
        logo.addEventListener('mouseenter', () => {
          const jewel = logo.querySelector('.logo-jewel');
          if (jewel) {
            gsap.to(jewel, {
              scale: 1.3,
              duration: 0.3,
              ease: "back.out(1.7)"
            });
          }
        });

        logo.addEventListener('mouseleave', () => {
          const jewel = logo.querySelector('.logo-jewel');
          if (jewel) {
            gsap.to(jewel, {
              scale: 1.15,
              duration: 0.3,
              ease: "power2.out"
            });
          }
        });
      }
    };

    const updateLogoColor = () => {
      const logoJewel = document.querySelector('.logo-jewel');
      const activeLink = document.querySelector('.nav-link.active');
      
      if (logoJewel && activeLink) {
        const icon = activeLink.querySelector('.nav-link-icon');
        if (icon?.classList.contains('icon-market')) {
          (logoJewel as SVGElement).style.fill = 'url(#marketGradient)';
        } else if (icon?.classList.contains('icon-canvas')) {
          (logoJewel as SVGElement).style.fill = 'url(#canvasGradient)';
        } else if (icon?.classList.contains('icon-sphere')) {
          (logoJewel as SVGElement).style.fill = 'url(#sphereGradient)';
        } else {
          (logoJewel as SVGElement).style.fill = 'url(#navJewelGradient)';
        }
      }
    };

    // Enhanced scroll handler with logo color updates
    const enhancedHandleScroll = () => {
      const offset = window.scrollY * 0.05;
      document.documentElement.style.setProperty('--scroll-offset', `${offset}px`);
      
      setScrolled(window.scrollY > 50);
      
      updateThemeColors();
      updateActiveNav();
      updateLogoColor();
    };

    // Initialize animations after component mounts
    setTimeout(() => {
      initKineticAnimations();
    }, 500);

    window.addEventListener('scroll', enhancedHandleScroll);
    updateThemeColors();
    updateActiveNav();

    return () => window.removeEventListener('scroll', enhancedHandleScroll);
  }, []);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = logo.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (y / rect.height) * 10;
      const rotateY = -(x / rect.width) * 10;
      logo.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      logo.style.transform = '';
    };

    const handleMouseEnter = () => {
      const jewel = logo.querySelector('.logo-jewel');
      if (jewel) {
        (jewel as SVGElement).style.filter = 'brightness(1.5)';
        setTimeout(() => {
          (jewel as SVGElement).style.filter = '';
        }, 150);
      }
    };

    logo.addEventListener('mousemove', handleMouseMove);
    logo.addEventListener('mouseleave', handleMouseLeave);
    logo.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      logo.removeEventListener('mousemove', handleMouseMove);
      logo.removeEventListener('mouseleave', handleMouseLeave);
      logo.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [statusMessages.length]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const link = e.currentTarget;
    
    // Smooth click animation with GSAP
    gsap.to(link, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(link, {
          scale: 1,
          duration: 0.1,
          ease: "back.out(1.7)"
        });
      }
    });

    if (href.startsWith('#')) {
      const targetId = href.substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        // Smooth GSAP scroll instead of browser scroll
        gsap.to(window, {
          duration: 1.5,
          scrollTo: { y: target, offsetY: 100 },
          ease: "power2.inOut"
        });
      }
    } else if (href.startsWith('http')) {
      window.open(href, '_blank');
    } else {
      navigate(href);
    }
  };

  return (
    <>
      <style>{`
        :root {
            --bg-dark: #0a0a0a;
            --bg-darker: #050505;
            --panel-dark: #1a1a1a;
            --panel-darker: #141414;
            --purple-primary: #9f58fa;
            --purple-dark: #7e22ce;
            --purple-light: #a855f7;
            --blue-accent: #4B96DC;
            --blue-light: #60a5fa;
            --green-accent: #4bd48e;
            --green-neon: #00ff88;
            --pink-accent: #f53969;
            --orange-accent: #ff6b35;
            --cyan-accent: #00d4ff;
            --yellow-accent: #ffd93d;
            --text-primary: #ffffff;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
            --border-color: rgba(255, 255, 255, 0.1);
            --glass: rgba(255, 255, 255, 0.05);
            --glass-hover: rgba(255, 255, 255, 0.08);
            --matrix-green: #00ff41;
            --warning-red: #ff0040;
            --amber-neutral: #ffaa00;
            --gem-impossible: #ff00ff;
            --gem-shift: #00ffff;
            --gem-deep: #ff00aa;
            --nav-height: 80px;
            --scroll-offset: 0px;
        }

        /* Fixed Header Container for Nav */
        .header-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            padding-top: 12px;
        }

        /* Award-Winning Navigation Bar - Machined Component Design */
        .nav-container {
            position: relative;
            left: 50%;
            transform: translateX(-50%);
            width: 96vw;
            max-width: 1400px;
            height: var(--nav-height);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            background: 
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
                );
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            box-shadow: 
                /* Outer shadows for depth */
                0 8px 32px rgba(0, 0, 0, 0.6),
                0 2px 8px rgba(0, 0, 0, 0.8),
                /* Inner bevels for machined edge */
                inset 0 1px 0 rgba(255, 255, 255, 0.08),
                inset 0 -1px 0 rgba(0, 0, 0, 0.5),
                inset 1px 0 0 rgba(255, 255, 255, 0.04),
                inset -1px 0 0 rgba(255, 255, 255, 0.04);
            transform-style: preserve-3d;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }

        /* Parallax Background Grid */
        .nav-container::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: 
                radial-gradient(circle at 20% 50%, rgba(var(--gem-impossible), 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(var(--gem-shift), 0.03) 0%, transparent 50%),
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
                );
            opacity: 0.5;
            transform: translateY(var(--scroll-offset));
            pointer-events: none;
            transition: transform 0.1s linear;
        }

        /* Enhanced Float on Scroll */
        .header-container.scrolled .nav-container {
            box-shadow:
                0 16px 50px rgba(0, 0, 0, 0.5),
                0 0 30px rgba(var(--gem-impossible), 0.12),
                0 0 60px rgba(var(--gem-shift), 0.06),
                0 2px 20px rgba(159, 88, 250, 0.15),
                inset 0 -1px 1px rgba(255,255,255,0.04),
                inset 0 1px 0 rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.12);
            background: linear-gradient(to right,
                rgba(26, 26, 26, 0.98) 0%,
                rgba(32, 32, 32, 0.95) 10%,
                rgba(30, 30, 30, 0.92) 50%,
                rgba(32, 32, 32, 0.95) 90%,
                rgba(26, 26, 26, 0.98) 100%
            );
            transform: translateX(-50%) scale(0.98);
        }

        /* Glass Refraction Overlay */
        .nav-container::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0; 
            right: 0; 
            bottom: 0;
            background: 
                radial-gradient(ellipse at top left, rgba(255,255,255,0.06), transparent 70%),
                radial-gradient(ellipse at bottom right, rgba(var(--gem-impossible), 0.03), transparent 60%);
            pointer-events: none;
            mix-blend-mode: screen;
            opacity: 0.2;
            transition: background 0.5s ease;
        }

        /* Metallic Screws */
        .nav-screws {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 2;
        }

        .screw {
            position: absolute;
            width: 4px;
            height: 4px;
            background: 
                radial-gradient(circle at 30% 30%, #f0f0f0 0%, #d8d8d8 10%, #b8b8b8 20%, #999 40%, #777 60%, #555 80%, #333 100%);
            border-radius: 50%;
            box-shadow:
                inset 0 0.5px 0.5px rgba(255,255,255,0.6),
                inset 0 -0.5px 0.5px rgba(0,0,0,0.4),
                0 0.5px 1px rgba(0,0,0,0.6);
            border: 0.25px solid rgba(0,0,0,0.15);
            position: relative;
            overflow: hidden;
        }

        /* Phillips head groove */
        .screw::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 60%;
            height: 0.5px;
            background: linear-gradient(to right, transparent, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.3) 80%, transparent);
            transform: translate(-50%, -50%);
        }

        .screw::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0.5px;
            height: 60%;
            background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.3) 80%, transparent);
            transform: translate(-50%, -50%);
        }

        /* Tiny jewel center */
        .screw-jewel {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 1px;
            height: 1px;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle at center, rgba(var(--gem-shift), 0.4), transparent);
            border-radius: 50%;
            pointer-events: none;
        }

        /* 4-Point Luxury Bezel - Perfect Mechanical Symmetry */
        .screw-top-left { 
            top: 8px; 
            left: 8px; 
        }
        .screw-top-right { 
            top: 8px; 
            right: 8px; 
        }
        .screw-bot-left { 
            bottom: 8px; 
            left: 8px; 
        }
        .screw-bot-right { 
            bottom: 8px; 
            right: 8px; 
        }

        .nav-inner {
            height: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
        }

        /* Logo Section with 3D Tilt */
        .nav-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            position: relative;
            padding: 8px 16px;
            border-radius: 12px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform-style: preserve-3d;
        }

        .nav-logo:hover {
            background: rgba(var(--gem-impossible), 0.1);
        }

        .nav-logo-icon {
            width: 40px;
            height: 40px;
            position: relative;
        }

        /* Animated Jewel Core in Logo */
        @keyframes gemPulse {
            0%, 100% { 
                transform: scale(1) rotate(0deg);
                filter: brightness(1) hue-rotate(0deg);
            }
            25% { 
                transform: scale(1.2) rotate(90deg);
                filter: brightness(1.3) hue-rotate(30deg);
            }
            50% { 
                transform: scale(1.1) rotate(180deg);
                filter: brightness(1.5) hue-rotate(60deg);
            }
            75% { 
                transform: scale(1.15) rotate(270deg);
                filter: brightness(1.2) hue-rotate(90deg);
            }
        }

        .logo-jewel {
            animation: gemPulse 4s infinite, logoRotate 8s linear infinite;
            transform-origin: center;
            transition: fill 0.5s ease;
            position: relative;
            filter: drop-shadow(0 0 8px rgba(var(--gem-impossible), 0.5));
        }

        @keyframes logoRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Quantum Flicker Effect */
        .logo-jewel-wrapper {
            position: relative;
            display: inline-block;
        }

        .quantum-flicker {
            position: absolute;
            inset: -2px;
            border-radius: 50%;
            background: conic-gradient(from 0deg, var(--gem-impossible), transparent 30%, var(--gem-shift));
            mix-blend-mode: color-dodge;
            opacity: 0.05;
            animation: flickerGrid 1.6s infinite;
            pointer-events: none;
        }

        @keyframes flickerGrid {
            0%, 100% { opacity: 0.05; transform: scale(1) rotate(0deg); }
            25% { opacity: 0.08; transform: scale(1.05) rotate(90deg); }
            50% { opacity: 0.12; transform: scale(1.08) rotate(180deg); }
            75% { opacity: 0.08; transform: scale(1.05) rotate(270deg); }
        }

        .nav-logo-text {
            font-family: 'Orbitron', monospace;
            font-size: 22px;
            font-weight: 800;
            background: linear-gradient(135deg, var(--purple-primary), var(--blue-accent), var(--gem-impossible));
            background-size: 200% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
            animation: textShimmer 3s ease-in-out infinite;
        }

        @keyframes textShimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }

        /* Nav Rail Container - Now on its own line */
        .nav-rail-container {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 300px;
            margin-top: 8px;
            z-index: 1;
        }

        /* Dynamic Power Rail */
        .nav-rail {
            flex: 1;
            height: 2px;
            margin: 0 16px;
            background: linear-gradient(90deg,
                transparent,
                rgba(var(--gem-shift), 0.35),
                rgba(var(--gem-impossible), 0.45),
                rgba(var(--gem-shift), 0.35),
                transparent);
            background-size: 200% 100%;
            box-shadow: 0 0 8px rgba(var(--gem-impossible), 0.4);
            animation: pulseRail 4s infinite ease-in-out, railFlow 3s infinite linear;
            border-radius: 2px;
            position: relative;
            overflow: hidden;
        }

        @keyframes railFlow {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        /* Data flow effect on rail */
        .nav-rail::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, 
                transparent,
                rgba(var(--gem-shift), 0.5),
                transparent
            );
            animation: railFlow 3s infinite linear;
        }

        @keyframes railFlow {
            0% { left: -100%; }
            100% { left: 200%; }
        }

        @keyframes pulseRail {
            0%, 100% { opacity: 0.3; transform: scaleX(1); }
            50% { opacity: 0.7; transform: scaleX(1.05); }
        }

        /* Power Nodes */
        .rail-node {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: radial-gradient(circle, 
                rgba(var(--gem-impossible), 1), 
                rgba(var(--gem-deep), 0.8),
                transparent
            );
            box-shadow: 
                0 0 6px rgba(var(--gem-shift), 0.8),
                inset 0 0 2px rgba(255,255,255,0.5);
            animation: nodePulse 3s infinite ease-in-out;
            position: relative;
        }

        .rail-node::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 50%;
            background: radial-gradient(circle, 
                transparent 30%,
                rgba(var(--gem-shift), 0.2)
            );
            animation: nodeRing 2s infinite ease-in-out;
        }

        @keyframes nodePulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.3); opacity: 1; }
        }

        @keyframes nodeRing {
            0%, 100% { transform: scale(1); opacity: 0; }
            50% { transform: scale(1.5); opacity: 1; }
        }

        .rail-node.left { margin-right: 8px; }
        .rail-node.right { margin-left: 8px; }

        /* System Status Display - Reduced by 20% and more subtle */
        .nav-status {
            font-size: 8.8px;
            color: var(--text-muted);
            letter-spacing: 0.4px;
            text-transform: uppercase;
            opacity: 0.5;
            padding: 0 12px;
            font-family: 'Orbitron', monospace;
            white-space: nowrap;
            transition: all 0.3s ease;
            animation: statusUpdate 8s infinite;
        }

        @keyframes statusUpdate {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.7; color: var(--text-secondary); }
        }

        .nav-status:hover {
            opacity: 0.8;
            color: var(--gem-impossible);
            text-shadow: 0 0 3px rgba(var(--gem-impossible), 0.3);
        }

        /* Navigation Links */
        .nav-links {
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: flex-end;
            margin-right: 20px;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .nav-link {
            position: relative;
            padding: 10px 20px;
            border-radius: 12px;
            text-decoration: none;
            color: var(--text-secondary);
            font-size: 14px;
            font-weight: 500;
            font-family: 'Orbitron', monospace;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid transparent;
            overflow: hidden;
            transform-style: preserve-3d;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .nav-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, 
                transparent 0%,
                rgba(var(--gem-impossible), 0.1) 50%,
                transparent 100%
            );
            transform: translateX(-100%);
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link:hover::before {
            transform: translateX(100%);
        }

        .nav-link:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(var(--gem-impossible), 0.3);
            transform: translateY(-2px);
            box-shadow: 
                0 4px 20px rgba(var(--gem-impossible), 0.2),
                0 0 0 1px rgba(var(--gem-impossible), 0.1) inset;
        }

        /* Laser Target Active Indicator */
        .nav-link.active {
            color: var(--text-primary);
            background: linear-gradient(135deg, 
                rgba(var(--gem-impossible), 0.15) 0%,
                rgba(var(--gem-shift), 0.15) 100%
            );
            border-color: rgba(var(--gem-impossible), 0.4);
            box-shadow: 
                0 0 20px rgba(var(--gem-impossible), 0.3),
                0 0 0 1px rgba(var(--gem-impossible), 0.2) inset;
        }

        .nav-link.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 10%;
            width: 80%;
            height: 2px;
            background: linear-gradient(to right, 
                transparent,
                var(--gem-impossible) 20%,
                var(--gem-shift) 50%,
                var(--gem-impossible) 80%,
                transparent
            );
            animation: laserSweep 1.5s infinite linear;
            box-shadow: 0 0 10px var(--gem-impossible);
        }

        @keyframes laserSweep {
            0% { 
                filter: brightness(1);
                transform: scaleX(0.8);
            }
            50% { 
                filter: brightness(1.5);
                transform: scaleX(1);
            }
            100% { 
                filter: brightness(1);
                transform: scaleX(0.8);
            }
        }

        /* Icon for nav links */
        .nav-link-icon {
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .nav-link-icon::before {
            content: '';
            position: absolute;
            width: 6px;
            height: 6px;
            background: currentColor;
            border-radius: 50%;
            opacity: 0.6;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.5); opacity: 0.3; }
        }

        /* Market Data Icon */
        .icon-market::before {
            background: var(--green-accent);
            box-shadow: 0 0 10px var(--green-accent);
        }

        /* Canvas Icon */
        .icon-canvas::before {
            background: var(--purple-primary);
            box-shadow: 0 0 10px var(--purple-primary);
        }

        /* Sphere OS Icon */
        .icon-sphere::before {
            background: var(--blue-accent);
            box-shadow: 0 0 10px var(--blue-accent);
        }

        /* Territory Icon */
        .icon-territory::before {
            background: var(--cyan-accent);
            box-shadow: 0 0 10px var(--cyan-accent);
        }

        /* Podcasts Icon */
        .icon-podcasts::before {
            background: var(--pink-accent);
            box-shadow: 0 0 10px var(--pink-accent);
        }

        /* Right Actions */
        .nav-actions {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        /* Premium CTA Button with Forcefield */
        .nav-cta {
            position: relative;
            padding: 10px 24px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--purple-primary), var(--blue-accent));
            color: white;
            font-weight: 600;
            font-size: 14px;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            box-shadow: 
                0 4px 20px rgba(159, 88, 250, 0.3),
                0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        }

        /* Forcefield Ring */
        .nav-cta::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            border: 2px solid;
            border-color: transparent var(--gem-impossible) transparent var(--gem-shift);
            border-radius: 12px;
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0;
            transition: all 0.3s ease;
        }

        .nav-cta:hover::after {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.15) rotate(180deg);
            animation: forcefieldRotate 2s linear infinite;
        }

        @keyframes forcefieldRotate {
            0% { transform: translate(-50%, -50%) scale(1.15) rotate(0deg); }
            100% { transform: translate(-50%, -50%) scale(1.15) rotate(360deg); }
        }

        .nav-cta::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg,
                transparent,
                rgba(255, 255, 255, 0.3),
                transparent
            );
            transition: left 0.5s;
        }

        .nav-cta:hover::before {
            left: 100%;
        }

        .nav-cta:hover {
            transform: translateY(-2px);
            box-shadow: 
                0 6px 30px rgba(159, 88, 250, 0.4),
                0 0 0 2px rgba(255, 255, 255, 0.2) inset,
                0 0 40px rgba(255, 0, 255, 0.3);
            filter: brightness(1.1);
        }

        /* More Menu with Radar Animation */
        .nav-more {
            position: relative;
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }

        .nav-more::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(var(--gem-impossible), 0.05) 0%, transparent 70%);
            animation: flickerRadar 3s infinite;
            pointer-events: none;
        }

        @keyframes flickerRadar {
            0%, 100% { 
                opacity: 0.2; 
                transform: scale(1); 
            }
            50% { 
                opacity: 0.4; 
                transform: scale(1.5); 
            }
        }

        .nav-more:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(var(--gem-impossible), 0.3);
            transform: translateY(-2px);
        }

        .nav-more-icon {
            display: flex;
            gap: 3px;
            z-index: 1;
        }

        .nav-more-dot {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: var(--text-secondary);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-more:hover .nav-more-dot {
            background: var(--text-primary);
        }

        .nav-more:hover .nav-more-dot:nth-child(1) {
            transform: translateX(-2px);
        }

        .nav-more:hover .nav-more-dot:nth-child(3) {
            transform: translateX(2px);
        }

        /* Responsive Breakpoints - Items disappear one by one */
        
        /* Hide Podcasts first at 1024px */
        @media (max-width: 1024px) {
            .nav-link[href="/podcasts"] {
                display: none;
            }
        }
        
        /* Hide CRM at 920px */
        @media (max-width: 920px) {
            .nav-link[href="/crm"] {
                display: none;
            }
        }
        
        /* Hide Canvas at 820px */
        @media (max-width: 820px) {
            .nav-link[href="/canvas"] {
                display: none;
            }
        }
        
        /* Hide Market Data and show only hamburger at 720px */
        @media (max-width: 720px) {
            .nav-links {
                display: none;
            }
        }
        
        /* Further mobile adjustments */
        @media (max-width: 768px) {
            .nav-rail-container {
                margin: 0 10px;
            }

            .nav-status {
                font-size: 9px;
                padding: 0 8px;
            }
        }
      `}</style>
      <div className={`header-container ${scrolled ? 'scrolled' : ''}`}>
        <nav className="nav-container" ref={navContainerRef}>
          {/* Metallic Screws - 4-Point Luxury Bezel */}
          <div className="nav-screws">
            <div className="screw screw-top-left"><div className="screw-jewel"></div></div>
            <div className="screw screw-top-right"><div className="screw-jewel"></div></div>
            <div className="screw screw-bot-left"><div className="screw-jewel"></div></div>
            <div className="screw screw-bot-right"><div className="screw-jewel"></div></div>
          </div>

          <div className="nav-inner">
            {/* Logo with Animated Jewel Core */}
            <a href="#" className="nav-logo" ref={logoRef} onClick={(e) => handleNavClick(e, '/')}>
              <div className="nav-logo-icon">
                <div className="logo-jewel-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style={{ position: 'relative', zIndex: 1 }}>
                    <defs>
                      <linearGradient id="navSphereGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#9f58fa', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#4B96DC', stopOpacity: 1 }} />
                      </linearGradient>
                      <radialGradient id="navCenterGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.8 }} />
                        <stop offset="50%" style={{ stopColor: '#9f58fa', stopOpacity: 0.5 }} />
                        <stop offset="100%" style={{ stopColor: '#4B96DC', stopOpacity: 0 }} />
                      </radialGradient>
                      <radialGradient id="navJewelGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style={{ stopColor: '#ff00ff', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#ff00aa', stopOpacity: 0.8 }} />
                        <stop offset="100%" style={{ stopColor: '#00ffff', stopOpacity: 0.6 }} />
                      </radialGradient>
                      <radialGradient id="marketGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style={{ stopColor: '#4bd48e', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#00ff88', stopOpacity: 0.6 }} />
                      </radialGradient>
                      <radialGradient id="canvasGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style={{ stopColor: '#9f58fa', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 0.6 }} />
                      </radialGradient>
                      <radialGradient id="sphereGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style={{ stopColor: '#4B96DC', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#60a5fa', stopOpacity: 0.6 }} />
                      </radialGradient>
                    </defs>
                    
                    {/* Outer sphere ring */}
                    <circle cx="16" cy="16" r="12" fill="none" stroke="url(#navSphereGradient)" strokeWidth="2" opacity="0.8"/>
                    
                    {/* Inner sphere ring */}
                    <circle cx="16" cy="16" r="8" fill="none" stroke="url(#navSphereGradient)" strokeWidth="1.5" opacity="0.6"/>
                    
                    {/* Center glow */}
                    <circle cx="16" cy="16" r="6" fill="url(#navCenterGlow)" opacity="0.8"/>
                    
                    {/* Animated Jewel Core */}
                    <circle cx="16" cy="16" r="3" fill="url(#navJewelGradient)" className="logo-jewel">
                      <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    
                    {/* Orbital dots representing network nodes */}
                    <circle cx="16" cy="4" r="1.5" fill="#9f58fa"/>
                    <circle cx="28" cy="16" r="1.5" fill="#4B96DC"/>
                    <circle cx="16" cy="28" r="1.5" fill="#4bd48e"/>
                    <circle cx="4" cy="16" r="1.5" fill="#00d4ff"/>
                  </svg>
                  <div className="quantum-flicker"></div>
                </div>
              </div>
              <span className="nav-logo-text">RepSpheres</span>
            </a>

            {/* Navigation Links */}
            <nav className="nav-links">
              <a
                href="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '/')}
              >
                <span className="nav-link-icon icon-market"></span>
                <span>Market Data</span>
              </a>
              <a
                href="/canvas"
                className={`nav-link ${location.pathname === '/canvas' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '/canvas')}
              >
                <span className="nav-link-icon icon-canvas"></span>
                <span>Canvas</span>
              </a>
              <a
                href="/podcasts"
                className={`nav-link ${location.pathname === '/podcasts' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '/podcasts')}
              >
                <span className="nav-link-icon icon-podcasts"></span>
                <span>Podcasts</span>
              </a>
              <a
                href="/crm"
                className={`nav-link ${location.pathname === '/crm' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '/crm')}
              >
                <span className="nav-link-icon icon-sphere"></span>
                <span>CRM</span>
              </a>
            </nav>

            {/* Right Actions */}
            <div className="nav-actions">
              <a href="#get-started" className="nav-cta" onClick={(e) => onSalesModeToggle?.()}>Sales Mode</a>
              <button className="nav-more" aria-label="More options">
                <div className="nav-more-icon">
                  <span className="nav-more-dot"></span>
                  <span className="nav-more-dot"></span>
                  <span className="nav-more-dot"></span>
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Nav Rail with Power Nodes - Now on its own line */}
          <div className="nav-rail-container">
            <div className="rail-node left"></div>
            <div className="nav-rail"></div>
            <div className="nav-status" style={{ opacity: statusIndex === 0 ? 1 : 0.8 }}>
              {statusMessages[statusIndex]}
            </div>
            <div className="rail-node right"></div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavBar;