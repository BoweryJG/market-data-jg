import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavBarProps {
  onSalesModeToggle?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onSalesModeToggle }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const navContainerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

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
        const sectionTop = section.offsetTop;
        if (window.scrollY >= (sectionTop - 200)) {
          current = section.getAttribute('id') || '';
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    updateThemeColors();
    updateActiveNav();

    return () => window.removeEventListener('scroll', handleScroll);
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
      const jewel = logo.querySelector('circle[fill="url(#jewelGradient)"]');
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const link = e.currentTarget;
    link.style.transform = 'scale(0.95)';
    setTimeout(() => {
      link.style.transform = '';
    }, 100);

    if (href.startsWith('#')) {
      const targetId = href.substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
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
            --nav-height: 60px;
            --scroll-offset: 0px;
        }

        /* Fixed Header Container for Nav */
        .header-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            padding-top: 24px;
        }

        /* Award-Winning Navigation Bar - Floating Bezel Design */
        .nav-container {
            position: relative;
            left: 50%;
            transform: translateX(-50%);
            width: 96vw;
            max-width: 1400px;
            height: var(--nav-height);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            background: linear-gradient(to right,
                rgba(26, 26, 26, 0.95) 0%,
                rgba(30, 30, 30, 0.9) 10%,
                rgba(28, 28, 28, 0.88) 50%,
                rgba(30, 30, 30, 0.9) 90%,
                rgba(26, 26, 26, 0.95) 100%
            );
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 18px;
            box-shadow: 
                0 12px 40px rgba(0, 0, 0, 0.4),
                0 0 20px rgba(var(--gem-shift), 0.08),
                0 2px 10px rgba(0, 0, 0, 0.6),
                inset 0 1px 0 rgba(255, 255, 255, 0.06),
                inset 0 -1px 0 rgba(0, 0, 0, 0.3);
            transform-style: preserve-3d;
            perspective: 1000px;
            transition: all 0.3s ease;
            overflow: hidden;
        }

        /* Edge Mount Indicators */
        .nav-edge {
            position: absolute;
            top: 10px;
            bottom: 10px;
            width: 3px;
            background: linear-gradient(to bottom,
                rgba(var(--gem-impossible), 0.2),
                rgba(var(--gem-shift), 0.1)
            );
            box-shadow: 0 0 8px rgba(var(--gem-shift), 0.15);
            opacity: 0.6;
            z-index: 1;
            transition: all 0.3s ease;
            transform: scaleY(1);
        }

        .left-edge { 
            left: -4px; 
            border-radius: 2px 0 0 2px; 
        }
        
        .right-edge { 
            right: -4px; 
            border-radius: 0 2px 2px 0; 
        }

        /* Hover Reveal Glow Fins */
        .nav-edge::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 80%;
            background: radial-gradient(circle, rgba(var(--gem-deep), 0.4), transparent);
            transform: translate(-50%, -50%);
            opacity: 0.1;
            transition: opacity 0.3s ease;
        }

        .nav-container:hover .nav-edge::after {
            opacity: 0.5;
        }

        .nav-container:hover .nav-edge {
            opacity: 1;
            box-shadow: 0 0 12px rgba(var(--gem-shift), 0.3);
            transform: scaleY(1.1);
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
            transform: translateX(-50%) scale(0.98) translateZ(30px);
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
            animation: glassOscillate 8s ease-in-out infinite;
            transition: background 0.5s ease;
        }

        @keyframes glassOscillate {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.02); }
        }

        /* Advanced Metallic Screws Container */
        .nav-screws {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 2;
        }

        /* Screw Wrapper with Bezel Inset */
        .screw-wrapper {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: radial-gradient(circle at center, 
                rgba(0,0,0,0.3) 0%, 
                rgba(0,0,0,0.15) 40%, 
                transparent 70%
            );
            box-shadow: 
                inset 0 1px 2px rgba(0,0,0,0.5),
                inset 0 -1px 1px rgba(255,255,255,0.1),
                0 1px 1px rgba(255,255,255,0.05);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Advanced Screw with Idle Rotation */
        .screw {
            position: relative;
            width: 5px;
            height: 5px;
            background: 
                radial-gradient(circle at 35% 35%, #e0e0e0 0%, #b8b8b8 15%, #888 40%, #555 70%, #222 100%),
                linear-gradient(135deg, #ccc 0%, #666 100%);
            background-size: 100%, 100%;
            border-radius: 50%;
            box-shadow:
                inset 0 0.5px 1px rgba(255,255,255,0.4),
                inset 0 -0.5px 1px rgba(0,0,0,0.5),
                0 0.5px 2px rgba(0,0,0,0.8),
                0 0 3px rgba(0,0,0,0.3);
            transform: rotate(var(--angle, 10deg));
            border: 0.5px solid rgba(0,0,0,0.2);
            animation: screwWiggle 5s ease-in-out infinite;
        }

        /* Phillips Head Screw Groove */
        .screw::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 70%;
            height: 0.5px;
            background: linear-gradient(90deg, 
                transparent, 
                rgba(0,0,0,0.7) 20%, 
                rgba(0,0,0,0.7) 80%, 
                transparent
            );
            transform: translate(-50%, -50%) rotate(0deg);
            box-shadow: 0 0 1px rgba(255,255,255,0.15);
        }

        /* Cross groove for Phillips head */
        .screw::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0.5px;
            height: 70%;
            background: linear-gradient(180deg, 
                transparent, 
                rgba(0,0,0,0.7) 20%, 
                rgba(0,0,0,0.7) 80%, 
                transparent
            );
            transform: translate(-50%, -50%);
            box-shadow: 0 0 1px rgba(255,255,255,0.15);
        }

        /* Jeweled Center Dot */
        .screw-jewel {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 1.5px;
            height: 1.5px;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle at center, 
                rgba(255,255,255,0.8), 
                rgba(var(--gem-impossible), 0.6), 
                rgba(var(--gem-deep), 0.4), 
                transparent
            );
            border-radius: 50%;
            opacity: 0.7;
            animation: jewelPulse 3s infinite;
        }

        @keyframes jewelPulse {
            0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
        }

        /* Idle Rotation Animation */
        @keyframes screwWiggle {
            0%, 100% { transform: rotate(var(--angle, 10deg)); }
            25% { transform: rotate(calc(var(--angle, 10deg) + 1.5deg)); }
            50% { transform: rotate(calc(var(--angle, 10deg) - 1deg)); }
            75% { transform: rotate(calc(var(--angle, 10deg) + 0.5deg)); }
        }

        /* 4-Point Luxury Bezel - Perfect Mechanical Symmetry */
        .screw-wrapper-top-left { 
            top: 10px; 
            left: 10px; 
            --angle: 10deg;
            animation-delay: 0s; 
        }
        .screw-wrapper-top-right { 
            top: 10px; 
            right: 10px; 
            --angle: 22deg;
            animation-delay: 1.2s; 
        }
        .screw-wrapper-bot-left { 
            bottom: 10px; 
            left: 10px; 
            --angle: -12deg;
            animation-delay: 2.4s; 
        }
        .screw-wrapper-bot-right { 
            bottom: 10px; 
            right: 10px; 
            --angle: 18deg;
            animation-delay: 3.6s; 
        }

        /* Main nav inner - single row */
        .nav-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
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
            width: 36px;
            height: 36px;
            position: relative;
        }

        .nav-logo-icon svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 1px 2px rgba(255,255,255,0.1));
            transition: transform 0.3s ease;
        }

        .nav-logo:hover svg {
            transform: scale(1.08);
        }

        .nav-logo-text {
            font-family: 'Orbitron', monospace;
            font-size: 20px;
            font-weight: 800;
            background: linear-gradient(135deg, var(--purple-primary), var(--blue-accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
        }

        /* Navigation Links */
        .nav-links {
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
            flex: 1;
        }

        .nav-link {
            position: relative;
            padding: 8px 16px;
            border-radius: 10px;
            text-decoration: none;
            color: var(--text-secondary);
            font-size: 13px;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid transparent;
            overflow: hidden;
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
            transform: translateY(-1px);
            box-shadow: 
                0 4px 20px rgba(var(--gem-impossible), 0.2),
                0 0 0 1px rgba(var(--gem-impossible), 0.1) inset;
        }

        /* Icon for nav links */
        .nav-link-icon {
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .nav-link-icon::before {
            content: '';
            position: absolute;
            width: 5px;
            height: 5px;
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

        /* Podcasts Icon */
        .icon-podcasts::before {
            background: var(--pink-accent);
            box-shadow: 0 0 10px var(--pink-accent);
        }

        /* Right Actions */
        .nav-actions {
            display: flex;
            align-items: center;
            gap: 12px;
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
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }

        .nav-more:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(var(--gem-impossible), 0.3);
            transform: translateY(-1px);
        }

        .nav-more-icon {
            display: flex;
            gap: 3px;
            z-index: 1;
        }

        .nav-more-dot {
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: var(--text-secondary);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-more:hover .nav-more-dot {
            background: var(--text-primary);
        }

        /* Mobile */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }
        }
      `}</style>
      
      <div className={`header-container ${scrolled ? 'scrolled' : ''}`}>
        <nav className="nav-container" ref={navContainerRef}>
          {/* Edge Mount Indicators */}
          <div className="nav-edge left-edge"></div>
          <div className="nav-edge right-edge"></div>

          {/* Advanced Metallic Screws with Wrappers */}
          <div className="nav-screws">
            <div className="screw-wrapper screw-wrapper-top-left">
              <div className="screw">
                <div className="screw-jewel"></div>
              </div>
            </div>
            <div className="screw-wrapper screw-wrapper-top-right">
              <div className="screw">
                <div className="screw-jewel"></div>
              </div>
            </div>
            <div className="screw-wrapper screw-wrapper-bot-left">
              <div className="screw">
                <div className="screw-jewel"></div>
              </div>
            </div>
            <div className="screw-wrapper screw-wrapper-bot-right">
              <div className="screw">
                <div className="screw-jewel"></div>
              </div>
            </div>
          </div>

          <div className="nav-inner">
            {/* Identity */}
            <div className="nav-logo" ref={logoRef} onClick={(e) => handleNavClick(e, '/')}>
              <div className="nav-logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                  <defs>
                    <linearGradient id="sphereGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9f58fa" />
                      <stop offset="100%" stopColor="#4B96DC" />
                    </linearGradient>
                    <radialGradient id="jewelGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                      <stop offset="30%" stopColor="#ff00ff" stopOpacity="1" />
                      <stop offset="60%" stopColor="#00ffff" stopOpacity="1" />
                      <stop offset="100%" stopColor="#ff00aa" stopOpacity="0.9" />
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
                  <circle cx="16" cy="4" r="1.5" fill="#9f58fa" filter="url(#glowTrail)">
                    <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="6s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="28" cy="16" r="1.5" fill="#4B96DC" filter="url(#glowTrail)">
                    <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="8s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="16" cy="28" r="1.5" fill="#4bd48e" filter="url(#glowTrail)">
                    <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="10s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
              <span className="nav-logo-text">RepSpheres</span>
            </div>

            {/* Navigation Links */}
            <nav className="nav-links">
              <a href="#market-data" className="nav-link" onClick={(e) => handleNavClick(e, '#market-data')}>
                <span className="nav-link-icon icon-market"></span>
                <span>Market Data</span>
              </a>
              <a href="#canvas" className="nav-link" onClick={(e) => handleNavClick(e, '#canvas')}>
                <span className="nav-link-icon icon-canvas"></span>
                <span>Canvas</span>
              </a>
              <a href="#sphere-os" className="nav-link" onClick={(e) => handleNavClick(e, '#sphere-os')}>
                <span className="nav-link-icon icon-sphere"></span>
                <span>Sphere oS</span>
              </a>
              <a href="#podcasts" className="nav-link" onClick={(e) => handleNavClick(e, '#podcasts')}>
                <span className="nav-link-icon icon-podcasts"></span>
                <span>Podcasts</span>
              </a>
            </nav>

            {/* Right Actions */}
            <div className="nav-actions">
              <a href="#get-started" className="nav-cta" onClick={(e) => handleNavClick(e, '#get-started')}>
                Get Started
              </a>
              <button className="nav-more" aria-label="More options">
                <div className="nav-more-icon">
                  <span className="nav-more-dot"></span>
                  <span className="nav-more-dot"></span>
                  <span className="nav-more-dot"></span>
                </div>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavBar;