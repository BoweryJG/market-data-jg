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
        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`,
        border: `2px solid ${theme.palette.warning.main}`,
        position: 'relative',
        overflow: 'visible',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8],
        }
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          background: theme.palette.warning.main,
          color: 'white',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: 12,
          fontWeight: 'bold',
        }}
      >
        PREMIUM
      </Box>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PinDrop sx={{ mr: 1, color: theme.palette.warning.main }} />
          <Typography variant="h6">Territory Intelligence</Typography>
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
                sx={{ background: theme.palette.warning.main, color: 'white' }}
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
                height: 4,
                backgroundColor: alpha(theme.palette.warning.main, 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.palette.warning.main,
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
  const [dataDiscoveryMode, setDataDiscoveryMode] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [procedureModalOpen, setProcedureModalOpen] = useState(false);
  const [territoryModalOpen, setTerritoryModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);

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

  // Handle scroll for sticky search bar with smooth transition
  const [scrollOpacity, setScrollOpacity] = useState(1);
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsSearchSticky(scrollY > 250); // Make sticky after scrolling past header
      
      // Calculate opacity for smooth fade
      if (scrollY < 150) {
        setScrollOpacity(1);
      } else if (scrollY >= 150 && scrollY <= 250) {
        // Smooth fade between 150px and 250px
        const opacity = 1 - ((scrollY - 150) / 100);
        setScrollOpacity(opacity);
      } else {
        setScrollOpacity(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
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
      
      const matchesSearch = procedureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = selectedIndustry === 'all' || p.industry === selectedIndustry;
      const matchesCategory = !selectedCategory || 
        category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        p.category === selectedCategory ||
        p.normalized_category === selectedCategory ||
        p.clinical_category === selectedCategory;
      return matchesSearch && matchesIndustry && matchesCategory;
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
      overflow: 'visible'
    }}>
      {/* Header with live indicator */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        opacity: scrollOpacity,
        transform: `scale(${0.9 + (scrollOpacity * 0.1)})`,
        transformOrigin: 'top left',
        transition: 'none', // Real-time updates
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mr: 2 }}>
            Market Command Center v2.0
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
          opacity: scrollOpacity,
          transform: `translateY(${(1 - scrollOpacity) * -20}px) scale(${0.95 + (scrollOpacity * 0.05)})`,
          transition: 'none', // Smooth real-time updates instead of CSS transition
          visibility: scrollOpacity === 0 ? 'hidden' : 'visible',
          height: scrollOpacity === 0 ? 0 : 'auto',
          overflow: 'hidden',
          mb: scrollOpacity === 0 ? 0 : 4,
          pointerEvents: scrollOpacity < 0.5 ? 'none' : 'auto',
        }}
      >
        <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, background: alpha(theme.palette.background.paper, 0.95) }}>
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
              <TerritoryPremiumData 
                territories={marketData?.territories || []} 
                onClick={() => setTerritoryModalOpen(true)}
              />
            
            {/* Compact Category Filter */}
            {viewMode === 'procedures' && marketData?.categories && (
                  <Card sx={{ p: 2 }}>
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
            )}
          </Box>
        </Grid>
      </Grid>
      </Box>

      {/* Search and filters */}
      <Card sx={{ 
        p: isSearchSticky ? 1 : 2, 
        mb: isSearchSticky ? 1 : 3,
        position: isSearchSticky ? 'sticky' : 'relative',
        top: isSearchSticky ? 64 : 0, // Below navbar
        zIndex: isSearchSticky ? 1100 : 1,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isSearchSticky ? theme.shadows[8] : theme.shadows[1],
        background: isSearchSticky 
          ? alpha(theme.palette.background.paper, 0.98)
          : theme.palette.background.paper,
        backdropFilter: isSearchSticky ? 'blur(10px)' : 'none',
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: isSearchSticky ? 1 : 2, 
          alignItems: 'center', 
          flexWrap: isSearchSticky ? 'nowrap' : 'wrap',
          justifyContent: isSearchSticky ? 'space-between' : 'flex-start'
        }}>
          <TextField
            placeholder={isSearchSticky ? "Search..." : "Search procedures, categories..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size={isSearchSticky ? "small" : "medium"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={isSearchSticky ? 18 : 20} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: isSearchSticky ? 200 : 300,
              flexGrow: isSearchSticky ? 0 : 1,
              maxWidth: isSearchSticky ? 250 : 400
            }}
          />
          
          <ButtonGroup variant="outlined" size={isSearchSticky ? "small" : "medium"}>
            <Button
              variant={selectedIndustry === 'all' ? 'contained' : 'outlined'}
              onClick={() => setSelectedIndustry('all')}
              sx={{ px: isSearchSticky ? 1 : 2 }}
            >
              {isSearchSticky ? 'All' : `All (${marketData?.procedures.length || 0})`}
            </Button>
            <Button
              variant={selectedIndustry === 'dental' ? 'contained' : 'outlined'}
              onClick={() => setSelectedIndustry('dental')}
              sx={{ px: isSearchSticky ? 1 : 2 }}
            >
              {isSearchSticky ? 'Dental' : `Dental (${marketData?.procedures.filter(p => p.industry === 'dental').length || 0})`}
            </Button>
            <Button
              variant={selectedIndustry === 'aesthetic' ? 'contained' : 'outlined'}
              onClick={() => setSelectedIndustry('aesthetic')}
              sx={{ px: isSearchSticky ? 1 : 2 }}
            >
              {isSearchSticky ? 'Aesthetic' : `Aesthetic (${marketData?.procedures.filter(p => p.industry === 'aesthetic').length || 0})`}
            </Button>
          </ButtonGroup>
          
          <FormControlLabel
            control={
              <Switch
                checked={viewMode === 'companies'}
                onChange={(e) => setViewMode(e.target.checked ? 'companies' : 'procedures')}
                color="primary"
                size={isSearchSticky ? "small" : "medium"}
              />
            }
            label={isSearchSticky ? (viewMode === 'companies' ? 'Co.' : 'Proc.') : (viewMode === 'companies' ? 'Companies' : 'Procedures')}
            sx={{ 
              ml: isSearchSticky ? 1 : 2,
              '& .MuiFormControlLabel-label': {
                fontSize: isSearchSticky ? '0.85rem' : '1rem'
              }
            }}
          />
          
          {!isSearchSticky && (
            <Typography variant="body2" color="text.secondary">
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
          transition: 'all 0.3s ease'
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
              filteredProcedures.map((procedure, index) => (
                <TableRow
                  key={`procedure-${procedure.id || index}-${procedure.procedure_name || 'unknown'}`}
                  hover
                  onClick={() => {
                    setSelectedProcedure(procedure);
                    setProcedureModalOpen(true);
                  }}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MedicalServices 
                        sx={{ 
                          mr: 1, 
                          color: procedure.industry === 'dental' ? theme.palette.info.main : theme.palette.secondary.main 
                        }} 
                      />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                          {procedure.procedure_name || procedure.name || 'Unknown Procedure'}
                        </Typography>
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
                      color={procedure.industry === 'dental' ? 'info' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>{procedure.category || procedure.normalized_category || procedure.clinical_category || (procedure.industry === 'dental' ? 'Dental Procedure' : procedure.industry === 'aesthetic' ? 'Aesthetic Procedure' : 'General')}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ${(procedure.market_size_2025_usd_millions || procedure.market_size_usd_millions || 0).toLocaleString()}M
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {(procedure.yearly_growth_percentage || procedure.growth_rate || 0) > 0 ? (
                        <TrendingUp sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                      ) : (
                        <TrendingDown sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: (procedure.yearly_growth_percentage || procedure.growth_rate || 0) > 0 ? theme.palette.success.main : theme.palette.error.main,
                          fontWeight: 'bold',
                        }}
                      >
                        {(procedure.yearly_growth_percentage || procedure.growth_rate || 0).toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      ${(procedure.average_cost_usd || 0).toLocaleString()}
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
              ))
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
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.05),
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
            height: '90vh',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Territory Intelligence Dashboard
          </Typography>
          <IconButton onClick={() => setTerritoryModalOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
            <EnhancedTerritoryIntelligence />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MarketCommandCenter;