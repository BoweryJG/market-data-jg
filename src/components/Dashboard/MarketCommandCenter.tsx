import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FORCE RELOAD - NEEDLE AND ICONS FIXED
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
} from '@mui/material';
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
  // Category icons
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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabaseClient';
import { comprehensiveDataService, ComprehensiveMarketData, TableInfo } from '../../services/comprehensiveDataService';
import SimpleGauge from './SimpleGauge';

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
  const [liveValue, setLiveValue] = useState(value);
  const percentage = Math.min((liveValue / max) * 100, 100);
  const targetAngle = (percentage / 100) * 180 - 90; // -90 to 90 degrees
  
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

  // Luxurious initial spin animation on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasLoaded(true);
      // Spin around a few times then settle to target
      setNeedleRotation(720 + targetAngle); // 2 full rotations + target
      
      // After the dramatic spin, settle to actual target
      setTimeout(() => {
        setNeedleRotation(targetAngle);
      }, 2000);
    }, 300); // Small delay for dramatic effect

    return () => clearTimeout(timer);
  }, [targetAngle]);

  // Update needle when target changes (after initial load)
  useEffect(() => {
    if (hasLoaded) {
      setNeedleRotation(targetAngle);
    }
  }, [targetAngle, hasLoaded]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isHovered) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;
    
    // Calculate angle from center to mouse, constrained to gauge range
    let angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
    
    // Constrain to gauge range (-90 to 90 degrees)
    angle = Math.max(-90, Math.min(90, angle));
    
    // Add spin animation on hover
    setNeedleRotation(angle + (Math.sin(Date.now() * 0.01) * 5)); // Small oscillation
  };

  const handleMouseClick = () => {
    // Add a complete spin effect on click
    setNeedleRotation(needleRotation + 360);
    setTimeout(() => setNeedleRotation(targetAngle), 1000);
  };

  const handleMouseEnterNeedle = () => {
    setIsHovered(true);
    // Start needle spin animation on hover
    const spinAnimation = () => {
      if (isHovered) {
        setNeedleRotation(prev => prev + 2); // Continuous spin
        requestAnimationFrame(spinAnimation);
      }
    };
    requestAnimationFrame(spinAnimation);
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
          
          {/* Gradient for needle */}
          <linearGradient id={`needle-gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2C3E50" />
            <stop offset="30%" stopColor="#34495E" />
            <stop offset="60%" stopColor="#5D6D7E" />
            <stop offset="100%" stopColor="#85929E" />
          </linearGradient>
          
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
        
        {/* FIXED NEEDLE - THICK AND PROPERLY CENTERED */}
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <motion.g
            animate={{ 
              rotate: hasLoaded ? needleRotation : -90,
            }}
            transition={{
              type: "spring",
              stiffness: hasLoaded && !isHovered ? 40 : (isHovered ? 100 : 30),
              damping: hasLoaded && !isHovered ? 25 : (isHovered ? 15 : 18),
              mass: 1.8,
              duration: hasLoaded ? undefined : 3,
            }}
            style={{ 
              transformOrigin: '0px 0px', // FORCE CENTER ANCHOR
            }}
            onMouseEnter={handleMouseEnterNeedle}
            onMouseLeave={handleMouseLeaveNeedle}
          >
            {/* THICK NEEDLE BASE - STARTS AT CENTER (0,0) */}
            <rect
              x="0"
              y="-6"
              width="8"
              height="12"
              fill="#2C3E50"
              stroke="#000"
              strokeWidth="1"
            />
            
            {/* THICK NEEDLE SHAFT - EXTENDS FROM CENTER */}
            <rect
              x="0"
              y="-4"
              width={size / 2 - 20}
              height="8"
              fill="#34495E"
              stroke="#000"
              strokeWidth="1"
            />
            
            {/* NEEDLE TIP */}
            <polygon
              points={`${size / 2 - 20},-4 ${size / 2 - 10},0 ${size / 2 - 20},4`}
              fill="#C0392B"
              stroke="#000"
              strokeWidth="1"
            />
          </motion.g>
        </g>
        
        {/* Center hub with luxury details */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r="8"
          fill="#34495E"
          stroke="#2C3E50"
          strokeWidth="2"
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Inner hub detail */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="5"
          fill="url(#metallic-shine-${label})"
          opacity="0.8"
        />
        
        {/* Center dot */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="2"
          fill={color}
        />
        
        {/* Live indicator pulse */}
        {isLive && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r="12"
            fill="none"
            stroke={theme.palette.success.main}
            strokeWidth="2"
            animate={{
              r: [12, 18, 12],
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
const TerritoryPremiumData: React.FC<{ territories: any[] }> = ({ territories }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`,
        border: `2px solid ${theme.palette.warning.main}`,
        position: 'relative',
        overflow: 'visible',
      }}
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

// Enhanced category icons map for procedures with vibrant MUI icons
const categoryIconMap: Record<string, React.ReactNode> = {
  // Dental categories with vibrant, professional colors
  'Implantology': <Build sx={{ color: '#2196F3', fontSize: 20 }} />,
  'Oral Surgery': <MedicalServices sx={{ color: '#F44336', fontSize: 20 }} />,
  'Orthodontics': <Straighten sx={{ color: '#4CAF50', fontSize: 20 }} />,
  'Periodontics': <Nature sx={{ color: '#8BC34A', fontSize: 20 }} />,
  'Endodontics': <Hub sx={{ color: '#9C27B0', fontSize: 20 }} />,
  'Prosthodontics': <Architecture sx={{ color: '#607D8B', fontSize: 20 }} />,
  'Cosmetic Dentistry': <AutoAwesome sx={{ color: '#FF9800', fontSize: 20 }} />,
  'Digital Dentistry': <Computer sx={{ color: '#3F51B5', fontSize: 20 }} />,
  'Preventive Care': <Shield sx={{ color: '#4CAF50', fontSize: 20 }} />,
  'General Dentistry': <LocalHospital sx={{ color: '#2196F3', fontSize: 20 }} />,
  
  // Aesthetic categories with beautiful, luxurious colors
  'Facial Rejuvenation': <Face sx={{ color: '#E91E63', fontSize: 20 }} />,
  'Body Contouring': <Accessibility sx={{ color: '#9C27B0', fontSize: 20 }} />,
  'Skin Resurfacing': <Grain sx={{ color: '#795548', fontSize: 20 }} />,
  'Injectable Treatments': <Colorize sx={{ color: '#FF5722', fontSize: 20 }} />,
  'Laser Procedures': <FlashOn sx={{ color: '#FF9800', fontSize: 20 }} />,
  'Non-Invasive': <Healing sx={{ color: '#4CAF50', fontSize: 20 }} />,
  'Minimally Invasive': <MedicalServices sx={{ color: '#00BCD4', fontSize: 20 }} />,
  'Aesthetic Medicine': <Brush sx={{ color: '#E91E63', fontSize: 20 }} />,
  'Hair Restoration': <Nature sx={{ color: '#8BC34A', fontSize: 20 }} />,
  'Breast Procedures': <Accessibility sx={{ color: '#9C27B0', fontSize: 20 }} />,
  
  // Additional common categories
  'Dermal Fillers': <Colorize sx={{ color: '#FF5722', fontSize: 20 }} />,
  'Botox': <MedicalServices sx={{ color: '#9C27B0', fontSize: 20 }} />,
  'Teeth Whitening': <AutoAwesome sx={{ color: '#FFC107', fontSize: 20 }} />,
  'Dental Cleaning': <Shield sx={{ color: '#4CAF50', fontSize: 20 }} />,
  'Root Canal': <Hub sx={{ color: '#9C27B0', fontSize: 20 }} />,
  'Dental Procedure': <LocalHospital sx={{ color: '#2196F3', fontSize: 20 }} />,
  'Aesthetic Procedure': <Face sx={{ color: '#E91E63', fontSize: 20 }} />,
  
  // Default fallback with enhanced styling
  'default': <Category sx={{ color: '#9E9E9E', fontSize: 20 }} />,
};

// Market data interfaces
interface Procedure {
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
  const [dataDiscoveryMode, setDataDiscoveryMode] = useState(false);

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
    
    // Set up live data refresh
    const interval = setInterval(() => {
      if (liveData) {
        fetchAllData();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchAllData, liveData]);

  // Get market metrics from comprehensive data with fallback to demo data
  const marketMetrics = useMemo(() => {
    console.log('🔍 MarketMetrics Debug:', { 
      hasMarketData: !!marketData, 
      proceduresLength: marketData?.procedures?.length || 0,
      marketDataStructure: marketData ? Object.keys(marketData) : 'null',
      firstProcedure: marketData?.procedures?.[0],
      marketMetricsStructure: marketData?.marketMetrics
    });
    
    if (!marketData || marketData.procedures.length === 0) {
      console.log('⚠️ Using fallback demo data - no procedures found');
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
    <Box sx={{ p: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)` }}>
      {/* Header with live indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
                <SimpleGauge
                  value={marketMetrics.totalMarketSize}
                  max={50000}
                  label="Market Size"
                  unit="M"
                  color={theme.palette.primary.main}
                  size={150}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <SimpleGauge
                  value={marketMetrics.averageGrowth}
                  max={50}
                  label="Avg Growth"
                  unit="%"
                  color={theme.palette.success.main}
                  size={150}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <SimpleGauge
                  value={marketMetrics.totalProcedures}
                  max={1000}
                  label="Procedures"
                  unit=""
                  color={theme.palette.info.main}
                  size={150}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <SimpleGauge
                  value={marketMetrics.totalCompanies}
                  max={200}
                  label="Companies"
                  unit=""
                  color={theme.palette.warning.main}
                  size={150}
                />
              </motion.div>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TerritoryPremiumData territories={marketData?.territories || []} />
        </Grid>
      </Grid>

      {/* Search and filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search procedures, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <ButtonGroup variant="outlined">
            <Button
              variant={selectedIndustry === 'all' ? 'contained' : 'outlined'}
              onClick={() => setSelectedIndustry('all')}
            >
              All ({marketData?.procedures.length || 0})
            </Button>
            <Button
              variant={selectedIndustry === 'dental' ? 'contained' : 'outlined'}
              onClick={() => setSelectedIndustry('dental')}
            >
              Dental ({marketData?.procedures.filter(p => p.industry === 'dental').length || 0})
            </Button>
            <Button
              variant={selectedIndustry === 'aesthetic' ? 'contained' : 'outlined'}
              onClick={() => setSelectedIndustry('aesthetic')}
            >
              Aesthetic ({marketData?.procedures.filter(p => p.industry === 'aesthetic').length || 0})
            </Button>
          </ButtonGroup>
          
          <FormControlLabel
            control={
              <Switch
                checked={viewMode === 'companies'}
                onChange={(e) => setViewMode(e.target.checked ? 'companies' : 'procedures')}
                color="primary"
              />
            }
            label={viewMode === 'companies' ? 'Companies' : 'Procedures'}
            sx={{ ml: 2 }}
          />
          
          <Typography variant="body2" color="text.secondary">
            Showing {viewMode === 'procedures' ? filteredProcedures.length : filteredCompanies.length} of {viewMode === 'procedures' ? (marketData?.procedures.length || 0) : (marketData?.companies.length || 0)} {viewMode}
          </Typography>
        </Box>
      </Card>

      {/* Enhanced Category Filtering */}
      {viewMode === 'procedures' && marketData?.procedures && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <FilterList sx={{ mr: 1, color: 'primary.main' }} />
            Filter by Category
            {selectedCategory && (
              <Chip 
                label="Clear Filter" 
                size="small" 
                onDelete={() => setSelectedCategory(null)}
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Array.from(new Set(
              marketData.procedures
                .filter(p => selectedIndustry === 'all' || p.industry === selectedIndustry)
                .map(p => p.category || p.normalized_category || p.clinical_category)
                .filter(Boolean)
            )).map((category) => (
              <Chip
                key={category}
                icon={categoryIconMap[category] || categoryIconMap['default']}
                label={category}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                sx={{
                  '& .MuiSvgIcon-root': {
                    fontSize: 18,
                    marginRight: 0.5,
                  },
                  backgroundColor: selectedCategory === category ? theme.palette.primary.main : 'transparent',
                  color: selectedCategory === category ? theme.palette.primary.contrastText : theme.palette.text.primary,
                  border: selectedCategory === category ? 'none' : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    backgroundColor: selectedCategory === category 
                      ? alpha(theme.palette.primary.main, 0.8) 
                      : alpha(theme.palette.primary.main, 0.1),
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s ease',
                  }
                }}
              />
            ))}
          </Box>
        </Card>
      )}

      {/* Procedures/Companies table */}
      <TableContainer component={Paper} sx={{ maxHeight: '60vh' }}>
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
              filteredProcedures.map((procedure) => (
                <TableRow
                  key={procedure.id}
                  hover
                  sx={{
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
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {procedure.procedure_name || procedure.name || 'Unknown Procedure'}
                      </Typography>
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
              filteredCompanies.map((company) => (
                <TableRow
                  key={company.id}
                  hover
                  sx={{
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
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {company.name || company.company_name || 'Unknown Company'}
                      </Typography>
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
    </Box>
  );
};

export default MarketCommandCenter;