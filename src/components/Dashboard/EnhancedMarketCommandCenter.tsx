import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProcedureDetailsModal from './ProcedureDetailsModal';
import PremiumContainer from '../common/PremiumContainer';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  AppBar,
  Toolbar,
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
  Category,
  Info,
  CalendarToday,
  VerifiedUser,
  Warning,
  CheckCircle,
  Error,
  ExpandLess,
  ExpandMore,
  ShowChart,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabaseClient';
import { comprehensiveDataService, ComprehensiveMarketData, TableInfo } from '../../services/comprehensiveDataService';
import { getCategoryIconConfig } from './CategoryIcons';
import SimpleGauge from './SimpleGauge';
import IntegrationCostBadge from './IntegrationCostBadge';
import { getIntegrationCost, estimateIntegrationCost } from '../../services/integrationCostData';

// Enhanced Gauge Component with Confidence Indicator
const EnhancedCockpitGauge: React.FC<{
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  size?: number;
  isLive?: boolean;
  industry?: 'dental' | 'aesthetic' | 'all';
  selectedYear?: number;
  confidence?: number;
  trendData?: number[];
}> = ({ value, max, label, unit, color, size = 120, isLive = false, industry = 'all', selectedYear = 2025, confidence = 85, trendData = [] }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Get confidence color
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const confidenceColor = getConfidenceColor(confidence);
  
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: size + 40, 
        height: size / 2 + 80,
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Confidence Badge */}
      <Tooltip title={`Data Confidence: ${confidence}%`}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            background: alpha(confidenceColor, 0.1),
            border: `1px solid ${alpha(confidenceColor, 0.3)}`,
          }}
        >
          {confidence >= 80 ? <VerifiedUser sx={{ fontSize: 14, color: confidenceColor }} /> :
           confidence >= 60 ? <Warning sx={{ fontSize: 14, color: confidenceColor }} /> :
           <Error sx={{ fontSize: 14, color: confidenceColor }} />}
          <Typography variant="caption" sx={{ color: confidenceColor, fontWeight: 'bold' }}>
            {confidence}%
          </Typography>
        </Box>
      </Tooltip>
      
      {/* Use SimpleGauge */}
      <SimpleGauge
        value={value}
        max={max}
        label={label}
        unit={unit}
        color={color}
        size={size}
      />
      
      {/* Trend Sparkline */}
      {trendData.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.6,
            height: 20,
            opacity: isHovered ? 1 : 0.5,
            transition: 'opacity 0.3s',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 100 20">
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={trendData.map((val, i) => `${(i / (trendData.length - 1)) * 100},${20 - (val / Math.max(...trendData)) * 20}`).join(' ')}
            />
          </svg>
        </Box>
      )}
      
      {/* Year indicator */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: -5,
          left: '50%',
          transform: 'translateX(-50%)',
          color: theme.palette.text.secondary,
          fontSize: 10,
        }}
      >
        {selectedYear}
      </Typography>
    </Box>
  );
};

// Year Selector Component
const YearSelector: React.FC<{
  selectedYear: number;
  onChange: (year: number) => void;
}> = ({ selectedYear, onChange }) => {
  const theme = useTheme();
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CalendarToday sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
      <ButtonGroup size="small" variant="outlined">
        {years.map(year => (
          <Button
            key={year}
            variant={selectedYear === year ? 'contained' : 'outlined'}
            onClick={() => onChange(year)}
            sx={{
              minWidth: 60,
              fontSize: '0.75rem',
              py: 0.5,
            }}
          >
            {year}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

// Compact Categories Component
const CompactCategories: React.FC<{
  categories: any[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  selectedIndustry: 'all' | 'dental' | 'aesthetic';
  procedures: any[];
}> = ({ categories, selectedCategory, onCategorySelect, selectedIndustry, procedures }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  const filteredCategories = categories
    .filter(cat => selectedIndustry === 'all' || cat.industry === selectedIndustry)
    .filter(cat => {
      const procedureCount = procedures
        .filter(p => p.category === cat.name && (selectedIndustry === 'all' || p.industry === selectedIndustry))
        .length;
      return procedureCount > 0;
    })
    .slice(0, expanded ? undefined : 6);
  
  return (
    <PremiumContainer sx={{ height: expanded ? 'auto' : 250, transition: 'height 0.3s', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Categories
          </Typography>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filteredCategories.map((category, index) => {
            const procedureCount = procedures
              .filter(p => p.category === category.name && (selectedIndustry === 'all' || p.industry === selectedIndustry))
              .length;
            const iconConfig = getCategoryIconConfig(category.name);
            const IconComponent = iconConfig.icon;
            
            return (
              <Chip
                key={`${category.id}-${index}`}
                icon={<IconComponent sx={{ fontSize: 16 }} />}
                label={`${category.name} (${procedureCount})`}
                onClick={() => onCategorySelect(selectedCategory === category.name ? null : category.name)}
                sx={{
                  bgcolor: selectedCategory === category.name ? alpha(iconConfig.color, 0.2) : 'transparent',
                  border: `1px solid ${selectedCategory === category.name ? iconConfig.color : alpha(theme.palette.divider, 0.3)}`,
                  '&:hover': {
                    bgcolor: alpha(iconConfig.color, 0.1),
                    borderColor: iconConfig.color,
                  },
                }}
              />
            );
          })}
        </Box>
    </PremiumContainer>
  );
};

// Confidence Badge Component
const ConfidenceBadge: React.FC<{ score?: number }> = ({ score = 75 }) => {
  const theme = useTheme();
  
  const getConfig = (score: number) => {
    if (score >= 80) return { color: theme.palette.success.main, icon: CheckCircle, label: 'High' };
    if (score >= 60) return { color: theme.palette.warning.main, icon: Warning, label: 'Medium' };
    return { color: theme.palette.error.main, icon: Error, label: 'Low' };
  };
  
  const config = getConfig(score);
  const Icon = config.icon;
  
  return (
    <Tooltip title={`Confidence Score: ${score}%`}>
      <Chip
        icon={<Icon sx={{ fontSize: 14 }} />}
        label={`${score}%`}
        size="small"
        sx={{
          height: 20,
          fontSize: '0.7rem',
          bgcolor: alpha(config.color, 0.1),
          color: config.color,
          border: `1px solid ${alpha(config.color, 0.3)}`,
          '& .MuiChip-icon': {
            fontSize: 14,
            marginLeft: '4px',
          },
        }}
      />
    </Tooltip>
  );
};

const EnhancedMarketCommandCenter: React.FC = () => {
  const theme = useTheme();
  const [marketData, setMarketData] = useState<ComprehensiveMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<'all' | 'dental' | 'aesthetic'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [viewMode, setViewMode] = useState<'procedures' | 'companies'>('procedures');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'market_size_2025_usd_millions',
    direction: 'desc',
  });
  const [liveData, setLiveData] = useState(true);
  const [selectedProcedure, setSelectedProcedure] = useState<any | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  // Handle scroll to collapse header
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setHeaderCollapsed(scrollY > 200);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const comprehensiveData = await comprehensiveDataService.getComprehensiveMarketData();
      setMarketData(comprehensiveData);
    } catch (error) {
      console.error('Error fetching comprehensive data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    
    const interval = setInterval(() => {
      if (liveData) {
        fetchAllData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAllData, liveData]);

  // Calculate market metrics with year filtering
  const marketMetrics = useMemo(() => {
    if (!marketData || marketData.procedures.length === 0) {
      return {
        totalMarketSize: 134866,
        averageGrowth: 12.5,
        totalCompanies: 156,
        averageCost: 2850,
        totalProcedures: 367,
      };
    }

    // Filter by industry and calculate for selected year
    const filteredProcedures = marketData.procedures.filter(p => 
      selectedIndustry === 'all' || p.industry === selectedIndustry
    );

    const marketSizeField = `market_size_${selectedYear}_usd_millions`;
    const totalMarketSize = filteredProcedures.reduce((sum, p) => 
      sum + (p[marketSizeField] || p.market_size_2025_usd_millions || 0), 0
    );

    const averageGrowth = filteredProcedures.length > 0
      ? filteredProcedures.reduce((sum, p) => sum + (p.yearly_growth_percentage || 0), 0) / filteredProcedures.length
      : 0;

    const averageCost = filteredProcedures.length > 0
      ? filteredProcedures.reduce((sum, p) => sum + (p.average_cost_usd || 0), 0) / filteredProcedures.length
      : 0;

    const filteredCompanies = marketData.companies.filter(c =>
      selectedIndustry === 'all' || c.industry === selectedIndustry
    );

    return {
      totalMarketSize,
      averageGrowth,
      totalCompanies: filteredCompanies.length,
      averageCost,
      totalProcedures: filteredProcedures.length,
    };
  }, [marketData, selectedIndustry, selectedYear]);

  // Filter procedures
  const filteredProcedures = useMemo(() => {
    const procedures = marketData?.procedures || [];
    
    let filtered = procedures.filter(p => {
      const procedureName = p.procedure_name || p.name || '';
      const category = p.category || p.normalized_category || p.clinical_category || '';
      
      const matchesSearch = procedureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = selectedIndustry === 'all' || p.industry === selectedIndustry;
      const matchesCategory = !selectedCategory || category === selectedCategory;
      
      return matchesSearch && matchesIndustry && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle year-specific market size
      if (sortConfig.key === 'market_size') {
        const field = `market_size_${selectedYear}_usd_millions`;
        aValue = a[field] || a.market_size_2025_usd_millions || 0;
        bValue = b[field] || b.market_size_2025_usd_millions || 0;
      }
      
      // Handle integration cost sorting
      if (sortConfig.key === 'integration_cost') {
        const aName = a.procedure_name || a.name || '';
        const bName = b.procedure_name || b.name || '';
        const aData = getIntegrationCost(aName) || estimateIntegrationCost(a.category || '', 5);
        const bData = getIntegrationCost(bName) || estimateIntegrationCost(b.category || '', 5);
        aValue = aData.max || 0;
        bValue = bData.max || 0;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return sortConfig.direction === 'asc' 
        ? String(aValue || '').localeCompare(String(bValue || ''))
        : String(bValue || '').localeCompare(String(aValue || ''));
    });

    return filtered;
  }, [marketData, searchTerm, selectedIndustry, selectedCategory, sortConfig, selectedYear]);

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
          Loading Enhanced Market Intelligence...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      paddingTop: '120px', // Add space for navbar
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
      padding: '0 1rem', // Add 1rem padding on left and right
    }}>
      <PremiumContainer sx={{ 
        width: '100%',
        maxWidth: '1600px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 120px)',
        p: 0,
      }}>
        {/* Sticky Header */}
        <AppBar 
        position="sticky" 
        color="default" 
        elevation={0}
        sx={{
          transition: 'all 0.3s',
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          boxShadow: 'none',
          borderBottom: headerCollapsed ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
        }}
      >
        <Toolbar sx={{ minHeight: headerCollapsed ? 64 : 'auto', py: headerCollapsed ? 0 : 2 }}>
          <Box sx={{ width: '100%' }}>
            {/* Collapsed State */}
            <Collapse in={headerCollapsed}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Market Command Center
                </Typography>
                
                <TextField
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ flex: 1, maxWidth: 400 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                  }}
                />
                
                <ButtonGroup size="small">
                  <Button
                    variant={selectedIndustry === 'all' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedIndustry('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedIndustry === 'dental' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedIndustry('dental')}
                  >
                    Dental
                  </Button>
                  <Button
                    variant={selectedIndustry === 'aesthetic' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedIndustry('aesthetic')}
                  >
                    Aesthetic
                  </Button>
                </ButtonGroup>
                
                <YearSelector selectedYear={selectedYear} onChange={setSelectedYear} />
                
                {/* Quick Stats */}
                <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                  <Chip
                    icon={<AttachMoney />}
                    label={`$${(marketMetrics.totalMarketSize / 1000).toFixed(1)}B`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    icon={<ShowChart />}
                    label={`${marketMetrics.averageGrowth.toFixed(1)}%`}
                    color="success"
                    size="small"
                  />
                  <Chip
                    icon={<Business />}
                    label={marketMetrics.totalCompanies}
                    color="info"
                    size="small"
                  />
                </Box>
              </Box>
            </Collapse>
            
            {/* Expanded State */}
            <Collapse in={!headerCollapsed}>
              <Box>
                {/* Title Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mr: 2 }}>
                      Enhanced Market Command Center
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
                
                {/* Search and Filters Row */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                  <TextField
                    placeholder="Search procedures, categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                    }}
                    sx={{ minWidth: 400 }}
                  />
                  
                  <ButtonGroup>
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
                  
                  <YearSelector selectedYear={selectedYear} onChange={setSelectedYear} />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={viewMode === 'companies'}
                        onChange={(e) => setViewMode(e.target.checked ? 'companies' : 'procedures')}
                        color="primary"
                      />
                    }
                    label={viewMode === 'companies' ? 'Companies' : 'Procedures'}
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                
                {/* Gauges */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <PremiumContainer sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                        <EnhancedCockpitGauge
                          value={marketMetrics.totalMarketSize}
                          max={200000}
                          label="Market Size"
                          unit="M"
                          color={theme.palette.primary.main}
                          size={140}
                          isLive={liveData}
                          industry={selectedIndustry}
                          selectedYear={selectedYear}
                          confidence={85}
                          trendData={[120000, 125000, 130000, 134866, 140000, 145000]}
                        />
                        <EnhancedCockpitGauge
                          value={marketMetrics.averageGrowth}
                          max={30}
                          label="Avg Growth"
                          unit="%"
                          color={theme.palette.success.main}
                          size={140}
                          isLive={liveData}
                          industry={selectedIndustry}
                          selectedYear={selectedYear}
                          confidence={92}
                          trendData={[10.5, 11.2, 11.8, 12.5, 13.1, 13.8]}
                        />
                        <EnhancedCockpitGauge
                          value={marketMetrics.totalProcedures}
                          max={1000}
                          label="Procedures"
                          unit=""
                          color={theme.palette.info.main}
                          size={140}
                          isLive={liveData}
                          industry={selectedIndustry}
                          selectedYear={selectedYear}
                          confidence={78}
                          trendData={[320, 340, 355, 367, 385, 400]}
                        />
                        <EnhancedCockpitGauge
                          value={marketMetrics.totalCompanies}
                          max={300}
                          label="Companies"
                          unit=""
                          color={theme.palette.warning.main}
                          size={140}
                          isLive={liveData}
                          industry={selectedIndustry}
                          selectedYear={selectedYear}
                          confidence={88}
                          trendData={[140, 145, 150, 156, 162, 170]}
                        />
                      </Box>
                    </PremiumContainer>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <CompactCategories
                      categories={marketData?.categories || []}
                      selectedCategory={selectedCategory}
                      onCategorySelect={setSelectedCategory}
                      selectedIndustry={selectedIndustry}
                      procedures={marketData?.procedures || []}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {/* Data Table */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            maxHeight: '60vh', 
            mt: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
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
                    <TableCell align="center">Confidence</TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortConfig.key === 'market_size'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('market_size')}
                      >
                        Market Size ({selectedYear})
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
                    <TableCell align="right">5-Year CAGR</TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortConfig.key === 'average_cost_usd'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('average_cost_usd')}
                      >
                        Avg Cost
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center">
                      <TableSortLabel
                        active={sortConfig.key === 'integration_cost'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('integration_cost')}
                      >
                        Integration Cost
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center">Status</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Company</TableCell>
                    <TableCell>Industry</TableCell>
                    <TableCell>Headquarters</TableCell>
                    <TableCell align="center">Confidence</TableCell>
                    <TableCell align="right">Market Size</TableCell>
                    <TableCell align="right">Growth %</TableCell>
                    <TableCell align="right">Market Share</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProcedures.map((procedure, index) => {
                const marketSizeField = `market_size_${selectedYear}_usd_millions`;
                const marketSize = procedure[marketSizeField] || procedure.market_size_2025_usd_millions || 0;
                const confidence = procedure.confidence_score || Math.floor(Math.random() * 40) + 60;
                
                // Calculate 5-year CAGR
                const startSize = procedure.market_size_2025_usd_millions || marketSize;
                const endSize = procedure.market_size_2030_usd_millions || marketSize * 1.5;
                const cagr = startSize > 0 ? (Math.pow(endSize / startSize, 1/5) - 1) * 100 : 0;
                
                // Get integration cost data
                const procedureName = procedure.procedure_name || procedure.name || '';
                const integrationData = procedure.integration_cost_min && procedure.integration_cost_max 
                  ? {
                      min: procedure.integration_cost_min,
                      max: procedure.integration_cost_max,
                      equipment_min: procedure.integration_equipment_min,
                      equipment_max: procedure.integration_equipment_max,
                      training: procedure.integration_training_cost,
                      confidence: procedure.integration_confidence,
                      roi_months: procedure.integration_roi_months
                    }
                  : getIntegrationCost(procedureName) || estimateIntegrationCost(procedure.category || '', 5);
                
                return (
                  <TableRow
                    key={`procedure-${procedure.id || index}`}
                    hover
                    onClick={() => {
                      setSelectedProcedure(procedure);
                      setDetailsModalOpen(true);
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {procedure.procedure_name || procedure.name || 'Unknown Procedure'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={procedure.industry === 'dental' ? 'Dental' : 'Aesthetic'}
                        size="small"
                        color={procedure.industry === 'dental' ? 'info' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>{procedure.category || 'General'}</TableCell>
                    <TableCell align="center">
                      <ConfidenceBadge score={confidence} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ${marketSize.toFixed(1)}M
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {(procedure.yearly_growth_percentage || 0) > 0 ? (
                          <TrendingUp sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                        ) : (
                          <TrendingDown sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            color: (procedure.yearly_growth_percentage || 0) > 0 ? theme.palette.success.main : theme.palette.error.main,
                            fontWeight: 'bold',
                          }}
                        >
                          {(procedure.yearly_growth_percentage || 0).toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <ShowChart sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary">
                          {cagr.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ${(procedure.average_cost_usd || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IntegrationCostBadge
                        min={integrationData.min}
                        max={integrationData.max}
                        equipment_min={integrationData.equipment_min}
                        equipment_max={integrationData.equipment_max}
                        training={integrationData.training}
                        confidence={integrationData.confidence}
                        roi_months={integrationData.roi_months}
                        procedureName={procedureName}
                        averageProcedureCost={procedure.average_cost_usd}
                      />
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
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
      {/* Procedure Details Modal */}
      <ProcedureDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedProcedure(null);
        }}
        procedure={selectedProcedure}
        industry={selectedIndustry === 'dental' ? 'dental' : 'aesthetic'}
      />
      </PremiumContainer>
    </Box>
  );
};

export default EnhancedMarketCommandCenter;