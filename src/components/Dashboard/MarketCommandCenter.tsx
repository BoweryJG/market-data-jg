import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FORCE RELOAD v2.0 - CATEGORY ICONS FIXED WITH MUI COLORS - DEPLOYED AT: ${new Date().toISOString()}
import ProcedureDetailsModal from './ProcedureDetailsModal';
import CompanyDetailsModal from './CompanyDetailsModal';
import EnhancedTerritoryIntelligence from './EnhancedTerritoryIntelligence';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  useTheme,
  alpha,
  LinearProgress,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  ButtonGroup,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  Menu,
  MenuItem,
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Close from '@mui/icons-material/Close';
import {
  TrendingUp,
  TrendingDown,
  Search,
  FilterList,
  LocationOn,
  AttachMoney,
  Speed,
  Business,
  MedicalServices,
  Analytics,
  FlashOn,
  Visibility,
  Star,
  LocalHospital,
  AccountBalance,
  Timer,
  EmojiEvents,
  RadioButtonChecked,
  Circle,
  FiberManualRecord,
  MonetizationOn,
  PinDrop,
  // Category icons - comprehensive set
  Build,
  Straighten,
  Nature,
  Hub,
  Architecture,
  AutoAwesome,
  Computer,
  Shield,
  Face,
  Accessibility,
  Grain,
  Colorize,
  Healing,
  Brush,
  Category,
  Spa,
  FitnessCenter,
  Psychology,
  Engineering,
  // Enhanced medical & aesthetic icons
  Biotech,
  Science,
  Vaccines,
  Medication,
  SelfImprovement,
  FaceRetouchingNatural,
  HealthAndSafety,
  MonitorHeart,
  VisibilityOff,
  CameraAlt,
  Palette,
  Bathtub,
  WbSunny,
  Waves,
  Diamond,
  AutoFixHigh,
  Flare,
  MedicalInformation,
  LocalPharmacy,
  Mood,
  SentimentVerySatisfied,
  // Icons for compact mode
  FilterAlt,
  SwapHoriz,
  ArrowDropDown,
  AllInclusive,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabaseClient';
import { comprehensiveDataService, ComprehensiveMarketData, TableInfo } from '../../services/comprehensiveDataService';
import SimpleGauge from './SimpleGauge';
import { getCategoryIconConfig } from './CategoryIcons';

// Luxury automotive-style gauge component with physics-based needle
const CockpitGauge: React.FC<{
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  size?: number;
  isLive?: boolean;
  industry?: 'dental' | 'aesthetic' | 'all';
}> = ({ value, max, label, unit, color, size = 120, isLive = false, industry = 'all' }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [needleRotation, setNeedleRotation] = useState(-90); // Start at leftmost position
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [liveValue, setLiveValue] = useState(value);
  const percentage = Math.min((liveValue / max) * 100, 100);
  const targetAngle = (percentage / 100) * 180 - 90; // -90 to 90 degrees
  
  // Live gauge with real Supabase data
  // Values: Market Size (~134K), Growth (~12%), Procedures (367), Companies (85)
  
  // Live data fetching effect for all gauge types
  useEffect(() => {
    if (isLive) {
      const fetchLiveData = async () => {
        try {
          const data = await comprehensiveDataService.getComprehensiveMarketData();
          let industrySpecificValue = 0;
          
          // Calculate industry-specific values based on label
          switch (label) {
            case 'Market Size':
              if (industry === 'dental') {
                industrySpecificValue = data.procedures
                  .filter(p => p.industry === 'dental')
                  .reduce((sum, p) => sum + (p.market_size_2025_usd_millions || 0), 0);
              } else if (industry === 'aesthetic') {
                industrySpecificValue = data.procedures
                  .filter(p => p.industry === 'aesthetic')
                  .reduce((sum, p) => sum + (p.market_size_2025_usd_millions || 0), 0);
              } else {
                industrySpecificValue = data.marketMetrics.totalMarketSize;
              }
              break;
              
            case 'Avg Growth':
              if (industry === 'dental') {
                const dentalProcedures = data.procedures.filter(p => p.industry === 'dental');
                industrySpecificValue = dentalProcedures.length > 0
                  ? dentalProcedures.reduce((sum, p) => sum + (p.yearly_growth_percentage || 0), 0) / dentalProcedures.length
                  : 0;
              } else if (industry === 'aesthetic') {
                const aestheticProcedures = data.procedures.filter(p => p.industry === 'aesthetic');
                industrySpecificValue = aestheticProcedures.length > 0
                  ? aestheticProcedures.reduce((sum, p) => sum + (p.yearly_growth_percentage || 0), 0) / aestheticProcedures.length
                  : 0;
              } else {
                industrySpecificValue = data.marketMetrics.averageGrowth;
              }
              break;
              
            case 'Procedures':
              if (industry === 'dental') {
                industrySpecificValue = data.procedures.filter(p => p.industry === 'dental').length;
              } else if (industry === 'aesthetic') {
                industrySpecificValue = data.procedures.filter(p => p.industry === 'aesthetic').length;
              } else {
                industrySpecificValue = data.marketMetrics.totalProcedures;
              }
              break;
              
            case 'Companies':
              if (industry === 'dental') {
                industrySpecificValue = data.companies.filter(c => c.industry === 'dental').length;
              } else if (industry === 'aesthetic') {
                industrySpecificValue = data.companies.filter(c => c.industry === 'aesthetic').length;
              } else {
                industrySpecificValue = data.marketMetrics.totalCompanies;
              }
              break;
              
            default:
              industrySpecificValue = value; // Fallback to original value
          }
          
          setLiveValue(industrySpecificValue);
        } catch (error) {
          console.error('Failed to fetch live gauge data:', error);
        }
      };
      
      fetchLiveData();
      const interval = setInterval(fetchLiveData, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [isLive, label, industry, value]);

  // DRAMATIC NEEDLE STARTUP ANIMATION - Each gauge spins differently
  useEffect(() => {
    // Different delay and spin patterns for each gauge type
    const getSpinConfig = () => {
      switch (label) {
        case 'Market Size':
          return { delay: 300, spins: 3.5, speed: 2500 }; // Fast and dramatic
        case 'Avg Growth':
          return { delay: 800, spins: 2.8, speed: 2200 }; // Medium speed
        case 'Procedures':
          return { delay: 1300, spins: 4.2, speed: 2800 }; // Lots of spins
        case 'Companies':
          return { delay: 1800, spins: 1.9, speed: 1800 }; // Slower and elegant
        default:
          return { delay: 500, spins: 2.5, speed: 2000 };
      }
    };

    const { delay, spins, speed } = getSpinConfig();
    
    const startAnimation = setTimeout(() => {
      setIsSpinning(true);
      // Dramatic spinning phase
      setNeedleRotation(-90 + (spins * 360)); // Multiple full rotations
      
      // After spinning, settle to actual value
      const settleTimer = setTimeout(() => {
        setIsSpinning(false);
        setHasLoaded(true);
        setNeedleRotation(targetAngle);
      }, speed);

      return () => clearTimeout(settleTimer);
    }, delay);

    return () => clearTimeout(startAnimation);
  }, []); // Only run once on mount

  // Update needle when target changes (after initial load)
  useEffect(() => {
    if (hasLoaded) {
      setNeedleRotation(targetAngle);
    }
  }, [targetAngle, hasLoaded, liveValue]); // Add liveValue dependency

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    // Disabled mouse tracking to prevent erratic needle movement
    // Needle will only move based on value changes and animations
    return;
  };

  const handleMouseClick = () => {
    // Add a complete spin effect on click
    setNeedleRotation(needleRotation + 360);
    setTimeout(() => setNeedleRotation(targetAngle), 1000);
  };

  const handleMouseEnterNeedle = () => {
    setIsHovered(true);
    // Simply highlight on hover, don't spin continuously
  };

  const handleMouseLeaveNeedle = () => {
    setIsHovered(false);
    // Return to target position
    setNeedleRotation(targetAngle);
  };

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: size, 
        height: size / 2 + 40,
        cursor: 'pointer',
        willChange: 'transform',
        '&:hover': {
          transform: 'scale(1.02)',
          transition: 'transform 0.2s ease',
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleMouseClick}
    >
      {/* Gauge background with luxury styling */}
      <svg width={size} height={size / 2 + 20} style={{ position: 'absolute', top: 0 }}>
        <defs>
          {/* Gradient for gauge background */}
          <linearGradient id={`gauge-bg-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={alpha(theme.palette.error.main, 0.4)} />
            <stop offset="30%" stopColor={alpha(theme.palette.warning.main, 0.4)} />
            <stop offset="70%" stopColor={alpha(theme.palette.success.main, 0.4)} />
            <stop offset="100%" stopColor={alpha(theme.palette.success.main, 0.6)} />
          </linearGradient>
          
          {/* LUXURY NEEDLE GRADIENTS - CARTIER STYLE */}
          <linearGradient id="luxury-needle-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2C3E50" />
            <stop offset="30%" stopColor="#34495E" />
            <stop offset="70%" stopColor="#5D6D7E" />
            <stop offset="100%" stopColor="#85929E" />
          </linearGradient>
          
          {/* CHROME TIP GRADIENT */}
          <radialGradient id="chrome-tip-gradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F8F9FA" />
            <stop offset="30%" stopColor="#ECF0F1" />
            <stop offset="70%" stopColor="#BDC3C7" />
            <stop offset="100%" stopColor="#95A5A6" />
          </radialGradient>
          
          {/* BASE GRADIENT */}
          <radialGradient id="base-gradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ECF0F1" />
            <stop offset="50%" stopColor="#BDC3C7" />
            <stop offset="100%" stopColor="#2C3E50" />
          </radialGradient>
          
          {/* Shadow filter */}
          <filter id={`needle-shadow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.3)" />
          </filter>
          
          {/* Metallic shine gradient */}
          <linearGradient id={`metallic-shine-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="70%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
          </linearGradient>
        </defs>
        
        {/* Outer ring for luxury feel */}
        <path
          d={`M 10 ${size / 2} A ${size / 2 - 10} ${size / 2 - 10} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke={alpha(theme.palette.text.primary, 0.1)}
          strokeWidth="2"
        />
        
        {/* Main gauge track */}
        <path
          d={`M 15 ${size / 2} A ${size / 2 - 15} ${size / 2 - 15} 0 0 1 ${size - 15} ${size / 2}`}
          fill="none"
          stroke={`url(#gauge-bg-${label})`}
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Tick marks for luxury automotive feel */}
        {Array.from({ length: 9 }, (_, i) => {
          const tickAngle = (-90 + (i * 22.5)) * (Math.PI / 180);
          const innerRadius = size / 2 - 25;
          const outerRadius = size / 2 - (i % 2 === 0 ? 35 : 30);
          const x1 = size / 2 + Math.cos(tickAngle) * innerRadius;
          const y1 = size / 2 + Math.sin(tickAngle) * innerRadius;
          const x2 = size / 2 + Math.cos(tickAngle) * outerRadius;
          const y2 = size / 2 + Math.sin(tickAngle) * outerRadius;
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={alpha(theme.palette.text.primary, 0.6)}
              strokeWidth={i % 2 === 0 ? "2" : "1"}
              strokeLinecap="round"
            />
          );
        })}
        
        {/* PULSATING LIVE ANCHOR POINT */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={12}
          fill="rgba(231, 76, 60, 0.2)"
          stroke="#E74C3C"
          strokeWidth="2"
          animate={{
            scale: isLive ? [1, 1.3, 1] : 1,
            opacity: isLive ? [0.3, 0.8, 0.3] : 0.5,
          }}
          transition={{
            duration: 2,
            repeat: isLive ? Infinity : 0,
            ease: "easeInOut"
          }}
        />

        {/* NEEDLE ROTATES FROM GAUGE CENTER (GLOWING DOT) */}
        <g 
          transform={`rotate(${hasLoaded || isSpinning ? needleRotation : -90} ${size / 2} ${size / 2})`}
          style={{
            transition: isSpinning 
              ? `transform ${2.5}s cubic-bezier(0.25, 0.46, 0.45, 0.94)` // Smooth spin
              : hasLoaded 
                ? 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' // Bouncy settle
                : 'none'
          }}
          onMouseEnter={handleMouseEnterNeedle}
          onMouseLeave={handleMouseLeaveNeedle}
        >
          {/* FIXED LUXURY NEEDLE - PROPERLY ANCHORED AT CENTER */}
          <g>
            {/* Needle body - starts from center and extends outward */}
            <path
              d={`M ${size / 2 - 2} ${size / 2} L ${size / 2 + (size / 2 - 25)} ${size / 2 - 1} L ${size / 2 + (size / 2 - 25)} ${size / 2 + 1} L ${size / 2 + 2} ${size / 2} Z`}
              fill="url(#luxury-needle-gradient)"
              stroke="#2C3E50"
              strokeWidth="0.5"
              filter={`url(#needle-shadow-${label})`}
            />
            
            {/* Chrome tip */}
            <path
              d={`M ${size / 2 + (size / 2 - 25)} ${size / 2 - 1} L ${size / 2 + (size / 2 - 15)} ${size / 2} L ${size / 2 + (size / 2 - 25)} ${size / 2 + 1} Z`}
              fill="url(#chrome-tip-gradient)"
              stroke="#BDC3C7"
              strokeWidth="0.3"
            />
            
            {/* Center cap to hide needle base */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r="3"
              fill="#2C3E50"
            />
          </g>
        </g>

        {/* FIXED CENTER HUB - PROPERLY COVERS NEEDLE BASE */}
        <g>
          {/* Outer ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r="10"
            fill="url(#base-gradient)"
            stroke="#34495E"
            strokeWidth="1.5"
          />
          
          {/* Middle ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r="7"
            fill="#34495E"
            stroke="#2C3E50"
            strokeWidth="1"
          />
          
          {/* Inner metallic detail */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r="5"
            fill={`url(#metallic-shine-${label})`}
            opacity="0.9"
          />
          
          {/* Center dot */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r="3"
            fill={color}
            stroke="#000"
            strokeWidth="0.5"
          />
        </g>
        
        {/* Live indicator pulse */}
        {isLive && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={12}
            fill="none"
            stroke={theme.palette.success.main}
            strokeWidth="2"
            style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 0.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </svg>
      
      {/* Clean integrated value display */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 5,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
            color,
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            fontSize: '1.2rem',
          }}
        >
          {unit === 'M' ? `$${(liveValue / 1000).toFixed(1)}B` : 
           unit === '%' ? `${liveValue.toFixed(1)}%` :
           liveValue.toLocaleString()}{unit === 'M' || unit === '%' ? '' : unit}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
          }}
        >
          {label}
        </Typography>
        {isLive && (
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 4,
              marginTop: 2,
            }}
          >
            <FiberManualRecord sx={{ fontSize: 6, color: theme.palette.success.main }} />
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: 8,
                fontWeight: 'bold',
                color: theme.palette.success.main,
                letterSpacing: '0.5px',
              }}
            >
              LIVE
            </Typography>
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

// Territory data component with premium styling
const TerritoryPremiumData: React.FC<{ territories: any[]; onClick: () => void }> = ({ territories, onClick }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(147, 51, 234, 0.12) 35%, rgba(59, 130, 246, 0.08) 70%, rgba(6, 182, 212, 0.05) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        position: 'relative',
        overflow: 'visible',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 8px 32px rgba(6, 182, 212, 0.15), 0 0 20px rgba(147, 51, 234, 0.08)',
        '&:hover': {
          transform: 'translateY(-3px) scale(1.01)',
          boxShadow: '0 12px 40px rgba(6, 182, 212, 0.25), 0 0 30px rgba(147, 51, 234, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.5)',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(147, 51, 234, 0.15) 35%, rgba(59, 130, 246, 0.12) 70%, rgba(6, 182, 212, 0.08) 100%)',
        }
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          background: 'linear-gradient(135deg, #06B6D4 0%, #9333EA 50%, #3B82F6 100%)',
          color: 'white',
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          fontSize: 12,
          fontWeight: 'bold',
          boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4), 0 0 12px rgba(147, 51, 234, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
        }}
      >
        PREMIUM
      </Box>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PinDrop sx={{ 
            mr: 1, 
            color: '#06B6D4',
            fontSize: 28,
            filter: 'drop-shadow(0 2px 4px rgba(6, 182, 212, 0.3))'
          }} />
          <Typography variant="h6" sx={{ 
            background: 'linear-gradient(135deg, #06B6D4, #9333EA)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}>
            Territory Intelligence
          </Typography>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ marginLeft: 8 }}
          >
            <Chip
              label="LIVE"
              size="small"
              sx={{
                background: theme.palette.success.main,
                color: 'white',
                fontSize: 10,
              }}
            />
          </motion.div>
          <Typography 
            variant="caption" 
            sx={{ 
              ml: 'auto', 
              color: theme.palette.text.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            Click to open
            <ExpandMore sx={{ fontSize: 16 }} />
          </Typography>
        </Box>
        
        {territories.map((territory, index) => (
          <Box key={index} sx={{ mb: 2, p: 1, background: alpha(theme.palette.background.paper, 0.5), borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {territory.name}
              </Typography>
              <Chip
                label={`$${territory.marketSize}M`}
                size="small"
                sx={{ 
                  background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {territory.procedures} procedures • {territory.companies} companies
            </Typography>
            <LinearProgress
              variant="determinate"
              value={territory.saturation}
              sx={{
                mt: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                  borderRadius: 3,
                  boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)'
                },
              }}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

// Category icons are now handled in CategoryIcons.tsx for better modularity

interface ProcedureWithMetrics {
  id: string;
  procedure_name: string;
  industry: 'dental' | 'aesthetic';
  category: string;
  market_size_2025_usd_millions: number;
  yearly_growth_percentage: number;
  average_cost_usd: number;
  popularity_score: number;
  trending_score: number;
  demand_score: number;
  complexity: string;
  regional_popularity: any;
}

interface Company {
  id: string;
  name: string;
  industry: 'dental' | 'aesthetic';
  market_cap: number;
  procedures_offered: string[];
  territories: string[];
}

interface Category {
  id: string;
  name: string;
  market_size_usd_millions: number;
  growth_rate: number;
  procedure_count: number;
}

const MarketCommandCenter: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [marketData, setMarketData] = useState<ComprehensiveMarketData | null>(null);
  const [discoveredTables, setDiscoveredTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<'all' | 'dental' | 'aesthetic'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'procedures' | 'companies'>('procedures');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'market_size_2025_usd_millions',
    direction: 'desc',
  });
  const [liveData, setLiveData] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dataDiscoveryMode, setDataDiscoveryMode] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [procedureModalOpen, setProcedureModalOpen] = useState(false);
  const [territoryModalOpen, setTerritoryModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);

  // Fetch all comprehensive data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🚀 Loading comprehensive market data...');
      
      // Get comprehensive market data
      const comprehensiveData = await comprehensiveDataService.getComprehensiveMarketData();
      setMarketData(comprehensiveData);

      // Discover all tables if in discovery mode
      if (dataDiscoveryMode) {
        console.log('🔍 Discovering all database tables...');
        const tables = await comprehensiveDataService.discoverAllTables();
        setDiscoveredTables(tables);
        console.log(`✅ Discovered ${tables.length} tables`);
      }

    } catch (error) {
      console.error('Error fetching comprehensive data:', error);
    } finally {
      setLoading(false);
    }
  }, [dataDiscoveryMode]);

  useEffect(() => {
    fetchAllData();
    
    // Test specific tables for debugging
    comprehensiveDataService.testSpecificTables().then(result => {
      console.log('🧪 Table test result:', result);
    });
  }, []); // Only run once on mount

  // Separate effect for live data refresh
  useEffect(() => {
    if (!liveData) return;
    
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [liveData, fetchAllData]);

  // Luxury progressive scroll handling with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          
          // Binary sticky state for search bar (keeps existing behavior)
          setIsSearchSticky(scrollY > 100);
          
          // Progressive scroll for luxury transitions (0 to 1 over 300px)
          const rawProgress = Math.min(Math.max((scrollY - 50) / 300, 0), 1);
          setScrollProgress(rawProgress);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Get market metrics from comprehensive data with fallback to demo data
  const marketMetrics = useMemo(() => {
    console.log('🔍 MarketMetrics Debug:', { 
      hasMarketData: !!marketData, 
      proceduresLength: marketData?.procedures?.length || 0,
      marketDataStructure: marketData ? Object.keys(marketData) : 'null',
      firstProcedure: marketData?.procedures?.[0],
      marketMetricsStructure: marketData?.marketMetrics
    });
    
    if (!marketData || !marketData.procedures || marketData.procedures.length === 0) {
      // Only log warning if loading is complete but no data found
      if (marketData !== null && marketData?.procedures?.length === 0) {
        console.log('⚠️ Using fallback demo data - no procedures found');
      }
      // Return demo data when database is unavailable
      return {
        totalMarketSize: 134866, // $134.9B
        averageGrowth: 12.5,     // 12.5%
        totalCompanies: 156,     // 156 companies
        averageCost: 2850,       // $2,850 average
        totalProcedures: 367,    // 367 procedures
      };
    }

    const averageCost = marketData.procedures.length > 0
      ? marketData.procedures.reduce((sum, p) => sum + (p.average_cost_usd || 0), 0) / marketData.procedures.length
      : 0;

    return {
      ...marketData.marketMetrics,
      averageCost,
    };
  }, [marketData]);

  // Filter and sort procedures with fallback demo data
  const filteredProcedures = useMemo(() => {
    const procedures = marketData?.procedures || [
      // Demo data for when database is unavailable
      {
        id: '1',
        procedure_name: 'Dental Implant Placement',
        industry: 'dental',
        category: 'Implantology',
        market_size_2025_usd_millions: 8500,
        yearly_growth_percentage: 7.2,
        average_cost_usd: 3500,
        trending_score: 85,
        popularity_score: 88,
      },
      {
        id: '2',
        procedure_name: 'Botox Injection',
        industry: 'aesthetic',
        category: 'Non-Invasive',
        market_size_2025_usd_millions: 6200,
        yearly_growth_percentage: 12.8,
        average_cost_usd: 450,
        trending_score: 92,
        popularity_score: 95,
      },
      {
        id: '3',
        procedure_name: 'Teeth Whitening',
        industry: 'dental',
        category: 'Cosmetic Dentistry',
        market_size_2025_usd_millions: 4800,
        yearly_growth_percentage: 5.4,
        average_cost_usd: 280,
        trending_score: 76,
        popularity_score: 82,
      },
      {
        id: '4',
        procedure_name: 'Dermal Fillers',
        industry: 'aesthetic',
        category: 'Non-Invasive',
        market_size_2025_usd_millions: 7100,
        yearly_growth_percentage: 15.2,
        average_cost_usd: 650,
        trending_score: 89,
        popularity_score: 91,
      },
      {
        id: '5',
        procedure_name: 'Root Canal Treatment',
        industry: 'dental',
        category: 'Endodontics',
        market_size_2025_usd_millions: 3200,
        yearly_growth_percentage: 3.1,
        average_cost_usd: 1200,
        trending_score: 65,
        popularity_score: 70,
      }
    ];
    
    let filtered = procedures.filter(p => {
      const procedureName = p.procedure_name || p.name || '';
      const category = p.category || p.normalized_category || p.clinical_category || '';
      
      // Filter out procedures with both 0 market size and 0 growth (likely incomplete data)
      const marketSize = p.market_size_2025_usd_millions || p.market_size_usd_millions || 0;
      const growthRate = p.yearly_growth_percentage || p.growth_rate || 0;
      const hasValidData = marketSize > 0 || growthRate > 0;
      
      const matchesSearch = procedureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = selectedIndustry === 'all' || p.industry === selectedIndustry;
      const matchesCategory = !selectedCategory || 
        category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        p.category === selectedCategory ||
        p.normalized_category === selectedCategory ||
        p.clinical_category === selectedCategory;
      return hasValidData && matchesSearch && matchesIndustry && matchesCategory;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return sortConfig.direction === 'asc' 
        ? String(aValue || '').localeCompare(String(bValue || ''))
        : String(bValue || '').localeCompare(String(aValue || ''));
    });

    return filtered;
  }, [marketData, searchTerm, selectedIndustry, selectedCategory, sortConfig]);

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    const companies = marketData?.companies || [];
    
    return companies
      .filter(company => {
        const matchesSearch = !searchTerm || 
          company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.specialties?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
          company.key_products?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
        
        return matchesSearch && matchesIndustry;
      })
      .sort((a, b) => {
        const aVal = a[sortConfig.key as keyof typeof a] || 0;
        const bVal = b[sortConfig.key as keyof typeof b] || 0;
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return sortConfig.direction === 'asc' 
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      });
  }, [marketData, searchTerm, selectedIndustry, selectedCategory, sortConfig]);

  // Luxury easing and transition calculations
  const luxuryEase = useMemo(() => (t: number) => {
    // Smooth step function for premium automotive feel
    return t * t * (3 - 2 * t);
  }, []);

  const scrollTransitions = useMemo(() => {
    const easedProgress = luxuryEase(scrollProgress);
    
    return {
      // Gauges (most prominent, fade slowest)
      gauges: {
        opacity: 1 - (easedProgress * 0.4), // 1 → 0.6
        scale: 1 - (easedProgress * 0.08), // 1 → 0.92
        translateY: -(easedProgress * 10), // 0 → -10px
        transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
      },
      // Categories (medium fade)
      categories: {
        opacity: 1 - (easedProgress * 0.6), // 1 → 0.4
        scale: 1 - (easedProgress * 0.12), // 1 → 0.88
        translateY: -(easedProgress * 15), // 0 → -15px
        transition: 'all 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      // Territory Intelligence (most fade)
      territory: {
        opacity: 1 - (easedProgress * 0.7), // 1 → 0.3
        scale: 1 - (easedProgress * 0.15), // 1 → 0.85
        translateY: -(easedProgress * 20), // 0 → -20px
        transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      // Table (smooth upward movement, no opacity change)
      table: {
        translateY: -(easedProgress * 30), // 0 → -30px
        transition: 'transform 1.0s cubic-bezier(0.23, 1, 0.32, 1)',
      }
    };
  }, [scrollProgress, luxuryEase]);

  // Premium procedure styling system (CPU-efficient)
  const getProcedureTier = useCallback((procedure: any) => {
    const marketSize = procedure.market_size_2025_usd_millions || 0;
    const growthRate = procedure.yearly_growth_percentage || 0;
    const avgCost = procedure.average_cost_usd || 0;
    
    if (marketSize >= 5000 || avgCost >= 10000) return 'platinum';
    if (marketSize >= 1000 || avgCost >= 5000 || growthRate >= 15) return 'gold';
    if (growthRate >= 8 || avgCost >= 2000) return 'silver';
    return 'standard';
  }, []);

  const getTierStyling = useCallback((tier: string, industry: string) => {
    const isAesthetic = industry === 'aesthetic';
    
    const tierStyles = {
      platinum: {
        background: isAesthetic 
          ? 'linear-gradient(135deg, #92400E 0%, #DC2626 25%, #BE123C 50%, #A21CAF 100%)'
          : 'linear-gradient(135deg, #065F46 0%, #0891B2 25%, #1E40AF 50%, #7C3AED 100%)',
        baseColor: isAesthetic ? '#DC2626' : '#0891B2', // Base color for alpha function
        border: `2px solid ${isAesthetic ? 'rgba(220, 38, 38, 0.6)' : 'rgba(8, 145, 178, 0.6)'}`,
        boxShadow: `
          0 8px 32px ${isAesthetic ? 'rgba(220, 38, 38, 0.3)' : 'rgba(8, 145, 178, 0.3)'},
          0 0 0 1px rgba(255, 255, 255, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `,
        backdropFilter: 'blur(20px)',
      },
      gold: {
        background: isAesthetic
          ? 'linear-gradient(135deg, #D97706 0%, #EA580C 25%, #EC4899 75%, #BE185D 100%)'
          : 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 25%, #0891B2 75%, #059669 100%)',
        baseColor: isAesthetic ? '#EA580C' : '#1E40AF', // Base color for alpha function
        border: `2px solid ${isAesthetic ? 'rgba(217, 119, 6, 0.5)' : 'rgba(30, 64, 175, 0.5)'}`,
        boxShadow: `
          0 6px 24px ${isAesthetic ? 'rgba(217, 119, 6, 0.25)' : 'rgba(30, 64, 175, 0.25)'},
          0 0 0 1px rgba(255, 255, 255, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.15)
        `,
        backdropFilter: 'blur(16px)',
      },
      silver: {
        background: isAesthetic
          ? 'linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #EF4444 100%)'
          : 'linear-gradient(135deg, #0891B2 0%, #06B6D4 50%, #3B82F6 100%)',
        baseColor: isAesthetic ? '#F97316' : '#0891B2', // Base color for alpha function
        border: `1px solid ${isAesthetic ? 'rgba(245, 158, 11, 0.4)' : 'rgba(8, 145, 178, 0.4)'}`,
        boxShadow: `
          0 4px 16px ${isAesthetic ? 'rgba(245, 158, 11, 0.2)' : 'rgba(8, 145, 178, 0.2)'},
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        backdropFilter: 'blur(12px)',
      },
      standard: {
        background: isAesthetic
          ? 'linear-gradient(135deg, #374151 0%, #4B5563 50%, #6B7280 100%)'
          : 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #4B5563 100%)',
        baseColor: isAesthetic ? '#4B5563' : '#374151', // Base color for alpha function
        border: '1px solid rgba(75, 85, 99, 0.3)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(8px)',
      }
    };

    return tierStyles[tier as keyof typeof tierStyles] || tierStyles.standard;
  }, []);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Market Intelligence...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Decorative Screws for Market Command Center */}
      <Box sx={{
        position: 'absolute',
        top: 20,
        left: 20,
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #e0e0e0 0%, #b8b8b8 15%, #888 40%, #555 70%, #222 100%)',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.8)',
        zIndex: 10,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '70%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.7) 80%, transparent)',
          transform: 'translate(-50%, -50%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '1px',
          height: '70%',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.7) 80%, transparent)',
          transform: 'translate(-50%, -50%)',
        }
      }} />
      <Box sx={{
        position: 'absolute',
        top: 20,
        right: 20,
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #e0e0e0 0%, #b8b8b8 15%, #888 40%, #555 70%, #222 100%)',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.8)',
        zIndex: 10,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '70%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.7) 80%, transparent)',
          transform: 'translate(-50%, -50%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '1px',
          height: '70%',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.7) 80%, transparent)',
          transform: 'translate(-50%, -50%)',
        }
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #e0e0e0 0%, #b8b8b8 15%, #888 40%, #555 70%, #222 100%)',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.8)',
        zIndex: 10,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '70%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.7) 80%, transparent)',
          transform: 'translate(-50%, -50%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '1px',
          height: '70%',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.7) 80%, transparent)',
          transform: 'translate(-50%, -50%)',
        }
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #e0e0e0 0%, #b8b8b8 15%, #888 40%, #555 70%, #222 100%)',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.8)',
        zIndex: 10,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '70%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.7) 80%, transparent)',
          transform: 'translate(-50%, -50%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '1px',
          height: '70%',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.7) 80%, transparent)',
          transform: 'translate(-50%, -50%)',
        }
      }} />
      {/* Header with live indicator */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mr: 2 }}>
            Market Command Center
          </Typography>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Chip
              icon={<RadioButtonChecked />}
              label="LIVE DATA"
              sx={{
                background: theme.palette.success.main,
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </motion.div>
        </Box>
        
        <FormControlLabel
          control={
            <Switch
              checked={liveData}
              onChange={(e) => setLiveData(e.target.checked)}
              color="success"
            />
          }
          label="Live Updates"
        />
      </Box>

      {/* Cockpit-style gauges */}
      <Box
        sx={{
          mb: 4,
          opacity: scrollTransitions.gauges.opacity,
          transform: `translateY(${scrollTransitions.gauges.translateY}px) scale(${scrollTransitions.gauges.scale})`,
          transition: scrollTransitions.gauges.transition,
          pointerEvents: scrollTransitions.gauges.opacity < 0.3 ? 'none' : 'auto',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            p: 3, 
            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
            borderRadius: '20px',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            boxShadow: `
              0 16px 50px ${alpha(theme.palette.common.black, 0.25)},
              0 0 30px ${alpha(theme.palette.primary.main, 0.1)},
              inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
            `,
            backdropFilter: 'blur(20px)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, 
                ${theme.palette.primary.main} 0%, 
                ${theme.palette.secondary.main} 33%, 
                ${theme.palette.success.main} 66%,
                ${theme.palette.warning.main} 100%
              )`,
              borderRadius: '20px 20px 0 0',
              opacity: 0.8,
            }
          }}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              Market Intelligence Dashboard
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 3, py: 2 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <CockpitGauge
                  value={marketMetrics.totalMarketSize}
                  max={200000}
                  label="Market Size"
                  unit="M"
                  color={theme.palette.primary.main}
                  size={150}
                  isLive={liveData}
                  industry={selectedIndustry === 'all' ? 'all' : selectedIndustry}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <CockpitGauge
                  value={marketMetrics.averageGrowth}
                  max={50}
                  label="Avg Growth"
                  unit="%"
                  color={theme.palette.success.main}
                  size={150}
                  isLive={liveData}
                  industry={selectedIndustry === 'all' ? 'all' : selectedIndustry}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <CockpitGauge
                  value={marketMetrics.totalProcedures}
                  max={1000}
                  label="Procedures"
                  unit=""
                  color={theme.palette.info.main}
                  size={150}
                  isLive={liveData}
                  industry={selectedIndustry === 'all' ? 'all' : selectedIndustry}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <CockpitGauge
                  value={marketMetrics.totalCompanies}
                  max={200}
                  label="Companies"
                  unit=""
                  color={theme.palette.warning.main}
                  size={150}
                  isLive={liveData}
                  industry={selectedIndustry === 'all' ? 'all' : selectedIndustry}
                />
              </motion.div>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                sx={{
                  opacity: scrollTransitions.territory.opacity,
                  transform: `translateY(${scrollTransitions.territory.translateY}px) scale(${scrollTransitions.territory.scale})`,
                  transition: scrollTransitions.territory.transition,
                }}
              >
                <TerritoryPremiumData 
                  territories={marketData?.territories || []} 
                  onClick={() => setTerritoryModalOpen(true)}
                />
              </Box>
            
            {/* Compact Category Filter */}
            {viewMode === 'procedures' && marketData?.categories && (
              <Box
                sx={{
                  opacity: scrollTransitions.categories.opacity,
                  transform: `translateY(${scrollTransitions.categories.translateY}px) scale(${scrollTransitions.categories.scale})`,
                  transition: scrollTransitions.categories.transition,
                }}
              >
                  <Card sx={{ 
                    p: 2,
                    borderRadius: '16px',
                    background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                    boxShadow: `
                      0 12px 40px ${alpha(theme.palette.common.black, 0.2)},
                      0 0 20px ${alpha(theme.palette.primary.main, 0.08)},
                      inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
                    `,
                    backdropFilter: 'blur(20px)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: `linear-gradient(90deg, 
                        ${alpha(theme.palette.primary.main, 0.6)} 0%, 
                        ${alpha(theme.palette.secondary.main, 0.6)} 50%, 
                        ${alpha(theme.palette.success.main, 0.6)} 100%
                      )`,
                      borderRadius: '16px 16px 0 0',
                      opacity: 0.8,
                    }
                  }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <Category sx={{ mr: 0.5, fontSize: 18 }} />
                      Categories
                  {selectedCategory && (
                    <Chip 
                      label="Clear" 
                      size="small" 
                      onDelete={() => setSelectedCategory(null)}
                      sx={{ ml: 'auto', height: 20, fontSize: 11 }}
                    />
                  )}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {marketData.categories
                    .filter(cat => (selectedIndustry === 'all' || cat.applicable_to === selectedIndustry || cat.industry === selectedIndustry) && 
                                   cat.parent_id === null) // Only show parent categories since procedures link to these
                    .slice(0, showAllCategories ? undefined : 8) // Show all or top 8 categories
                    .map((category) => {
                      const procedureCount = marketData.procedures
                        .filter(p => {
                          // Match against multiple possible category fields
                          const matchesCategory = p.category === category.name || 
                                                p.clinical_category === category.name ||
                                                p.normalized_category === category.name ||
                                                p.category_hierarchy_id === category.id ||
                                                p.clinical_category_id === category.id ||
                                                // Also check if procedure has a hierarchy_category object
                                                (p.hierarchy_category && p.hierarchy_category.id === category.id) ||
                                                (p.hierarchy_category && p.hierarchy_category.name === category.name);
                          const matchesIndustry = selectedIndustry === 'all' || p.industry === selectedIndustry;
                          return matchesCategory && matchesIndustry;
                        })
                        .length;
                      const iconConfig = getCategoryIconConfig(category.name);
                      const IconComponent = iconConfig.icon;
                      
                      // Debug only once to avoid spam
                      if (procedureCount === 0 && marketData.procedures.length > 0 && category.name === 'Imaging') {
                        console.log('🔍 CATEGORY MATCHING ANALYSIS:');
                        console.log('Looking for:', category.name, 'ID:', category.id, 'Parent ID:', category.parent_id);
                        
                        // Check if any procedures match this category
                        const matchingProcedures = marketData.procedures.filter(p => 
                          p.category_hierarchy_id === category.id || 
                          p.category === category.name ||
                          (p.hierarchy_category && p.hierarchy_category.id === category.id)
                        );
                        console.log('Procedures directly matching this category:', matchingProcedures.length);
                        
                        // Check if procedures are linked to parent category instead
                        const parentMatches = marketData.procedures.filter(p => 
                          p.category_hierarchy_id === category.parent_id
                        );
                        console.log('Procedures matching parent category ID', category.parent_id + ':', parentMatches.length);
                        
                        // Show unique category_hierarchy_ids in procedures
                        const uniqueCategoryIds = [...new Set(marketData.procedures.map(p => p.category_hierarchy_id))];
                        console.log('All unique category_hierarchy_ids in procedures:', uniqueCategoryIds.sort((a, b) => a - b));
                      }
                      
                      return (
                        <Chip
                          key={`cat-${category.id}`}
                          label={`${category.name} (${procedureCount})`}
                          size="small"
                          icon={<IconComponent sx={{ fontSize: 16 }} />}
                          onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                          variant={selectedCategory === category.name ? "filled" : "outlined"}
                          sx={{
                            fontSize: 11,
                            height: 24,
                            '& .MuiChip-icon': {
                              color: iconConfig.color,
                              fontSize: 16,
                            },
                            borderColor: selectedCategory === category.name ? 'primary.main' : 'divider',
                            bgcolor: selectedCategory === category.name ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                          }}
                        />
                      );
                    })}
                </Box>
                {marketData.categories.length > 8 && (
                  <Button
                    size="small"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    sx={{ 
                      mt: 1, 
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 1
                    }}
                    endIcon={showAllCategories ? <ExpandLess /> : <ExpandMore />}
                  >
                    {showAllCategories 
                      ? 'Show less' 
                      : `+${marketData.categories.length - 8} more categories`
                    }
                  </Button>
                )}
              </Card>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
      </Box>

      {/* Search and filters - Always sticky */}
      <Card sx={{ 
        p: isSearchSticky ? (isMobile ? 0.5 : 0.75) : 1.5, 
        mb: 2,
        position: 'sticky',
        top: isSearchSticky ? 64 : 'auto', // Stick to navbar when scrolled
        zIndex: 1100,
        transition: 'all 0.3s ease',
        boxShadow: isSearchSticky ? theme.shadows[8] : theme.shadows[2],
        background: alpha(theme.palette.background.paper, 0.98),
        backdropFilter: 'blur(10px)',
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: isSearchSticky ? 1 : 2, 
          alignItems: 'center', 
          flexWrap: isSearchSticky && isMobile ? 'nowrap' : 'wrap',
          justifyContent: 'flex-start'
        }}>
          <TextField
            placeholder={isSearchSticky && isMobile ? "Search..." : "Search procedures, categories..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size={isSearchSticky ? "small" : "medium"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: isSearchSticky ? 18 : 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: isMobile ? (isSearchSticky ? 120 : 200) : 300,
              flexGrow: 1,
              maxWidth: isSearchSticky && isMobile ? 200 : 400,
              '& .MuiInputBase-input': {
                fontSize: isSearchSticky ? '0.875rem' : '1rem',
              }
            }}
          />
          
          {/* Industry Filter - Compact on scroll */}
          {isSearchSticky && (isMobile || isTablet) ? (
            <>
              <Tooltip title="Filter by industry">
                <IconButton
                  onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                  size="small"
                  sx={{ 
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: selectedIndustry !== 'all' ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                  }}
                >
                  <Badge 
                    badgeContent={selectedIndustry === 'all' ? 0 : 1} 
                    color="primary"
                    variant="dot"
                  >
                    <FilterAlt sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={filterMenuAnchor}
                open={Boolean(filterMenuAnchor)}
                onClose={() => setFilterMenuAnchor(null)}
              >
                <MenuItem 
                  onClick={() => { setSelectedIndustry('all'); setFilterMenuAnchor(null); }}
                  selected={selectedIndustry === 'all'}
                >
                  <AllInclusive sx={{ mr: 1, fontSize: 18 }} />
                  All ({marketData?.procedures.length || 0})
                </MenuItem>
                <MenuItem 
                  onClick={() => { setSelectedIndustry('dental'); setFilterMenuAnchor(null); }}
                  selected={selectedIndustry === 'dental'}
                >
                  <MedicalServices sx={{ mr: 1, fontSize: 18 }} />
                  Dental ({marketData?.procedures.filter(p => p.industry === 'dental').length || 0})
                </MenuItem>
                <MenuItem 
                  onClick={() => { setSelectedIndustry('aesthetic'); setFilterMenuAnchor(null); }}
                  selected={selectedIndustry === 'aesthetic'}
                >
                  <Spa sx={{ mr: 1, fontSize: 18 }} />
                  Aesthetic ({marketData?.procedures.filter(p => p.industry === 'aesthetic').length || 0})
                </MenuItem>
              </Menu>
            </>
          ) : (
            <ButtonGroup variant="outlined" size={isSearchSticky ? "small" : "medium"}>
              <Button
                variant={selectedIndustry === 'all' ? 'contained' : 'outlined'}
                onClick={() => setSelectedIndustry('all')}
                sx={{ 
                  px: isSearchSticky ? 1 : 2,
                  fontSize: isSearchSticky ? '0.75rem' : '0.875rem',
                  minWidth: isSearchSticky ? 'auto' : undefined
                }}
              >
                {isSearchSticky && !isMobile ? 'All' : `All (${marketData?.procedures.length || 0})`}
              </Button>
              <Button
                variant={selectedIndustry === 'dental' ? 'contained' : 'outlined'}
                onClick={() => setSelectedIndustry('dental')}
                sx={{ 
                  px: isSearchSticky ? 1 : 2,
                  fontSize: isSearchSticky ? '0.75rem' : '0.875rem',
                  minWidth: isSearchSticky ? 'auto' : undefined
                }}
              >
                {isSearchSticky && !isMobile ? 'Dental' : `Dental (${marketData?.procedures.filter(p => p.industry === 'dental').length || 0})`}
              </Button>
              <Button
                variant={selectedIndustry === 'aesthetic' ? 'contained' : 'outlined'}
                onClick={() => setSelectedIndustry('aesthetic')}
                sx={{ 
                  px: isSearchSticky ? 1 : 2,
                  fontSize: isSearchSticky ? '0.75rem' : '0.875rem',
                  minWidth: isSearchSticky ? 'auto' : undefined
                }}
              >
                {isSearchSticky && !isMobile ? 'Aesthetic' : `Aesthetic (${marketData?.procedures.filter(p => p.industry === 'aesthetic').length || 0})`}
              </Button>
            </ButtonGroup>
          )}
          
          {/* View Mode Toggle - Icon button when compact */}
          {isSearchSticky && isMobile ? (
            <Tooltip title={`Switch to ${viewMode === 'companies' ? 'Procedures' : 'Companies'}`}>
              <IconButton
                onClick={() => setViewMode(viewMode === 'companies' ? 'procedures' : 'companies')}
                size="small"
                sx={{ 
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: viewMode === 'companies' ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                }}
              >
                <SwapHoriz sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          ) : (
            <FormControlLabel
              control={
                <Switch
                  checked={viewMode === 'companies'}
                  onChange={(e) => setViewMode(e.target.checked ? 'companies' : 'procedures')}
                  color="primary"
                  size={isSearchSticky ? "small" : "medium"}
                />
              }
              label={viewMode === 'companies' ? 'Companies' : 'Procedures'}
              sx={{ 
                ml: isSearchSticky ? 0 : 2,
                '& .MuiFormControlLabel-label': {
                  fontSize: isSearchSticky ? '0.875rem' : '1rem'
                }
              }}
            />
          )}
          
          {/* Results count - Hide on mobile when scrolled */}
          {(!isSearchSticky || !isMobile) && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: isSearchSticky ? '0.75rem' : '0.875rem',
                display: isSearchSticky && isTablet ? 'none' : 'block'
              }}
            >
              Showing {viewMode === 'procedures' ? filteredProcedures.length : filteredCompanies.length} of {viewMode === 'procedures' ? (marketData?.procedures.length || 0) : (marketData?.companies.length || 0)} {viewMode}
            </Typography>
          )}
        </Box>
      </Card>


      {/* Procedures/Companies table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          overflow: 'auto',
          borderRadius: '20px',
          background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: `
            0 20px 60px ${alpha(theme.palette.common.black, 0.3)},
            0 0 40px ${alpha(theme.palette.primary.main, 0.1)},
            inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
          `,
          position: 'relative',
          transform: `translateY(${scrollTransitions.table.translateY}px)`,
          transition: scrollTransitions.table.transition,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, 
              ${theme.palette.primary.main} 0%, 
              ${theme.palette.secondary.main} 50%, 
              ${theme.palette.success.main} 100%
            )`,
            borderRadius: '20px 20px 0 0',
            opacity: 0.8,
          },
          '&::-webkit-scrollbar': {
            width: '12px',
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.background.default, 0.3),
            borderRadius: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: '6px',
            border: `2px solid ${alpha(theme.palette.background.paper, 0.5)}`,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            }
          }
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {viewMode === 'procedures' ? (
                <>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'procedure_name'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('procedure_name')}
                    >
                      Procedure
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortConfig.key === 'market_size_2025_usd_millions'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('market_size_2025_usd_millions')}
                    >
                      Market Size
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortConfig.key === 'yearly_growth_percentage'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('yearly_growth_percentage')}
                    >
                      Growth %
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={sortConfig.key === 'market_maturity_stage'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('market_maturity_stage')}
                    >
                      Maturity
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortConfig.key === 'average_cost_usd'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('average_cost_usd')}
                    >
                      Avg Cost
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Trending</TableCell>
                  <TableCell align="center">Status</TableCell>
                </>
              ) : (
                <>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'name'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('name')}
                    >
                      Company
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Headquarters</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortConfig.key === 'market_size_2025_usd_billion'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('market_size_2025_usd_billion')}
                    >
                      Market Size ($B)
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortConfig.key === 'projected_growth_pct'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('projected_growth_pct')}
                    >
                      Growth %
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortConfig.key === 'last_year_sales_usd_million'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('last_year_sales_usd_million')}
                    >
                      Sales ($M)
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Market Share %</TableCell>
                  <TableCell align="center">Status</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {viewMode === 'procedures' ? (
              filteredProcedures.map((procedure, index) => {
                const tier = getProcedureTier(procedure);
                const tierStyle = getTierStyling(tier, procedure.industry);
                
                return (
                <TableRow
                  key={`procedure-${procedure.id || index}-${procedure.procedure_name || 'unknown'}`}
                  hover
                  onClick={() => {
                    console.log('Procedure clicked:', procedure);
                    setSelectedProcedure(procedure);
                    setProcedureModalOpen(true);
                    console.log('Modal state set - selectedProcedure:', procedure, 'modalOpen:', true);
                  }}
                  sx={{
                    cursor: 'pointer',
                    position: 'relative',
                    background: alpha(tierStyle.baseColor || '#374151', 0.1),
                    borderLeft: `4px solid ${tierStyle.border.split(' ')[2]}`,
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    '&:hover': {
                      background: tierStyle.background,
                      transform: 'translateY(-3px) scale(1.005)',
                      boxShadow: tierStyle.boxShadow,
                      border: tierStyle.border,
                      borderRadius: '12px',
                      backdropFilter: tierStyle.backdropFilter,
                      '& .MuiTableCell-root': {
                        color: tier !== 'standard' ? '#FFFFFF' : 'inherit',
                        fontWeight: tier === 'platinum' ? 600 : tier === 'gold' ? 500 : 'inherit',
                      }
                    },
                    '& .tier-indicator': {
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover .tier-indicator': {
                      opacity: 1,
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <MedicalServices 
                        sx={{ 
                          mr: 1, 
                          color: procedure.industry === 'dental' ? theme.palette.info.main : theme.palette.secondary.main,
                          fontSize: tier === 'platinum' ? 28 : tier === 'gold' ? 24 : 20,
                          filter: tier !== 'standard' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
                        }} 
                      />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: tier === 'platinum' ? 700 : tier === 'gold' ? 600 : 'bold',
                              color: theme.palette.primary.main,
                              fontSize: tier === 'platinum' ? '1.1rem' : '1rem',
                              textShadow: tier !== 'standard' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                            }}
                          >
                            {procedure.procedure_name || procedure.name || 'Unknown Procedure'}
                          </Typography>
                          {tier !== 'standard' && (
                            <Chip
                              label={tier.toUpperCase()}
                              size="small"
                              className="tier-indicator"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                background: tier === 'platinum' 
                                  ? 'linear-gradient(45deg, #FFD700, #FFA500)'
                                  : tier === 'gold'
                                  ? 'linear-gradient(45deg, #C0C0C0, #E6E6FA)'
                                  : 'linear-gradient(45deg, #CD7F32, #D2691E)',
                                color: '#000',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                '& .MuiChip-label': {
                                  textShadow: '0 1px 2px rgba(255,255,255,0.5)'
                                }
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Click for detailed insights
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={procedure.industry === 'dental' ? 'Dental' : procedure.industry === 'aesthetic' ? 'Aesthetic' : 'Unknown'}
                      size="small"
                      sx={{
                        background: procedure.industry === 'dental' 
                          ? 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)'
                          : procedure.industry === 'aesthetic'
                          ? 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)'
                          : 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
                        color: 'white',
                        fontWeight: 600,
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(8px)',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{procedure.category || procedure.normalized_category || procedure.clinical_category || (procedure.industry === 'dental' ? 'Dental Procedure' : procedure.industry === 'aesthetic' ? 'Aesthetic Procedure' : 'General')}</TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: tier === 'platinum' ? 700 : tier === 'gold' ? 600 : 'bold',
                        fontSize: tier === 'platinum' ? '1.1rem' : '1rem',
                        background: tier === 'platinum' 
                          ? 'linear-gradient(45deg, #FFD700, #FFA500)'
                          : tier === 'gold'
                          ? 'linear-gradient(45deg, #C0C0C0, #E6E6FA)'
                          : 'inherit',
                        backgroundClip: tier !== 'standard' ? 'text' : 'inherit',
                        WebkitBackgroundClip: tier !== 'standard' ? 'text' : 'inherit',
                        WebkitTextFillColor: tier !== 'standard' ? 'transparent' : 'inherit',
                        textShadow: tier !== 'standard' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                      }}
                    >
                      {(() => {
                        const marketSize = procedure.market_size_2025_usd_millions || procedure.market_size_usd_millions || 0;
                        if (marketSize >= 1000) {
                          return `$${(marketSize / 1000).toFixed(1)}B`;
                        }
                        return `$${marketSize.toFixed(1)}M`;
                      })()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {(procedure.yearly_growth_percentage || procedure.growth_rate || 0) > 0 ? (
                        <TrendingUp sx={{ 
                          color: theme.palette.success.main, 
                          mr: 0.5,
                          fontSize: tier === 'platinum' ? 24 : tier === 'gold' ? 22 : 20,
                          filter: tier !== 'standard' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
                        }} />
                      ) : (
                        <TrendingDown sx={{ 
                          color: theme.palette.error.main, 
                          mr: 0.5,
                          fontSize: tier === 'platinum' ? 24 : tier === 'gold' ? 22 : 20
                        }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: (procedure.yearly_growth_percentage || procedure.growth_rate || 0) > 0 ? theme.palette.success.main : theme.palette.error.main,
                          fontWeight: tier === 'platinum' ? 700 : tier === 'gold' ? 600 : 'bold',
                          fontSize: tier === 'platinum' ? '1.1rem' : '1rem',
                          textShadow: tier !== 'standard' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                        }}
                      >
                        {(procedure.yearly_growth_percentage || procedure.growth_rate || 0).toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={procedure.market_maturity_stage || 'N/A'}
                      size="small"
                      color={
                        procedure.market_maturity_stage === 'Emerging' ? 'success' :
                        procedure.market_maturity_stage === 'Growth' ? 'primary' :
                        procedure.market_maturity_stage === 'Expansion' ? 'info' :
                        procedure.market_maturity_stage === 'Mature' ? 'warning' :
                        procedure.market_maturity_stage === 'Saturated' ? 'error' :
                        'default'
                      }
                      sx={{
                        fontWeight: 'bold',
                        minWidth: 80
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      ${(procedure.average_cost_usd || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <LinearProgress
                        variant="determinate"
                        value={procedure.trending_score || procedure.popularity_score || 0}
                        sx={{
                          width: 60,
                          mr: 1,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: (procedure.trending_score || procedure.popularity_score || 0) > 70 ? theme.palette.success.main : theme.palette.warning.main,
                          },
                        }}
                      />
                      <Typography variant="caption">
                        {procedure.trending_score || procedure.popularity_score || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Circle sx={{ color: theme.palette.success.main, fontSize: 12 }} />
                    </motion.div>
                  </TableCell>
                </TableRow>
                );
              })
            ) : (
              filteredCompanies.map((company, index) => (
                <TableRow
                  key={`company-${company.id || index}-${company.name || company.company_name || 'unknown'}`}
                  hover
                  onClick={() => {
                    setSelectedCompany(company);
                    setCompanyModalOpen(true);
                  }}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.primary.main, 0.08)} 0%, 
                        ${alpha(theme.palette.secondary.main, 0.06)} 50%,
                        ${alpha(theme.palette.success.main, 0.04)} 100%
                      )`,
                      transform: 'translateY(-2px) scale(1.002)',
                      boxShadow: `
                        0 8px 25px ${alpha(theme.palette.primary.main, 0.2)},
                        0 0 20px ${alpha(theme.palette.primary.main, 0.1)},
                        inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
                      `,
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Business 
                        sx={{ 
                          mr: 1, 
                          color: company.industry === 'dental' ? theme.palette.info.main : theme.palette.secondary.main 
                        }} 
                      />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                          {company.name || company.company_name || 'Unknown Company'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Click for company details
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={company.industry === 'dental' ? 'Dental' : company.industry === 'aesthetic' ? 'Aesthetic' : 'Unknown'}
                      size="small"
                      color={company.industry === 'dental' ? 'info' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>{company.headquarters || '-'}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ${(company.market_size_2025_usd_billion || company.market_size_usd_billions || 0).toFixed(1)}B
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {(company.projected_growth_pct || 0) > 0 ? (
                        <TrendingUp sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                      ) : (
                        <TrendingDown sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: (company.projected_growth_pct || 0) > 0 ? theme.palette.success.main : theme.palette.error.main,
                          fontWeight: 'bold',
                        }}
                      >
                        {(company.projected_growth_pct || 0).toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      ${(company.last_year_sales_usd_million || 0).toLocaleString()}M
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {(company.market_share_pct || 0).toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Circle sx={{ color: theme.palette.success.main, fontSize: 12 }} />
                    </motion.div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modals for detailed views */}
      {selectedProcedure && (
        <ProcedureDetailsModal
          open={procedureModalOpen}
          onClose={() => {
            setProcedureModalOpen(false);
            setSelectedProcedure(null);
          }}
          procedure={selectedProcedure}
          industry={selectedProcedure.industry as 'dental' | 'aesthetic'}
        />
      )}

      {selectedCompany && (
        <CompanyDetailsModal
          open={companyModalOpen}
          onClose={() => {
            setCompanyModalOpen(false);
            setSelectedCompany(null);
          }}
          company={selectedCompany}
          industry="dental"
        />
      )}

      {/* Territory Intelligence Modal */}
      <Dialog
        open={territoryModalOpen}
        onClose={() => setTerritoryModalOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: '92vh',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
          minHeight: 'auto'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Territory Intelligence Dashboard
          </Typography>
          <IconButton onClick={() => setTerritoryModalOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent 
          sx={{ 
            p: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              flex: 1,
              overflow: 'auto',
              height: '100%',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0,0,0,0.05)',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(0,0,0,0.3)',
                }
              }
            }}
          >
            <Box sx={{ p: 3, minHeight: '100%' }}>
              <EnhancedTerritoryIntelligence />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MarketCommandCenter;