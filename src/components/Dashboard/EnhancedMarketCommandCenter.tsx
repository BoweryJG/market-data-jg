import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProcedureDetailsModal from './ProcedureDetailsModal';
import PremiumContainer from '../common/PremiumContainer';
import SupremeGauge from './SupremeGauge';
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
  PinDrop,
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
// Removed framer-motion for better performance
import { supabase } from '../../services/supabaseClient';
import { comprehensiveDataService, ComprehensiveMarketData, TableInfo } from '../../services/comprehensiveDataService';
import { getCategoryIconConfig } from './CategoryIcons';
import IntegrationCostBadge from './IntegrationCostBadge';
import { getIntegrationCost, estimateIntegrationCost } from '../../services/integrationCostData';

// Removed EnhancedCockpitGauge - using SupremeGauge for exact supremedash replica

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

// Territory data component with premium styling
const TerritoryPremiumData: React.FC<{ territories: any[] }> = ({ territories }) => {
  const theme = useTheme();
  
  return (
    <PremiumContainer
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'visible',
        p: 2,
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
          zIndex: 2,
        }}
      >
        PREMIUM
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <PinDrop sx={{ mr: 1, color: theme.palette.warning.main }} />
        <Typography variant="h6">Territory Intelligence</Typography>
        <Chip
          label="LIVE"
          size="small"
          sx={{
            ml: 1,
            background: theme.palette.success.main,
            color: 'white',
            fontSize: 10,
            opacity: 0.9,
          }}
        />
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
    </PremiumContainer>
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
      padding: '0 2rem', // Increased padding for more space
    }}>
      <PremiumContainer sx={{ 
        width: '100%',
        maxWidth: '1400px', // Same as navbar
        margin: '0 auto',
        minHeight: 'calc(100vh - 120px)',
        p: 0,
      }}>
        {/* Fixed Header for better performance */}
        <AppBar 
        position="fixed" 
        color="default" 
        elevation={0}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          transition: 'all 0.3s',
          backgroundColor: 'transparent',
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
                    <Chip
                      icon={<RadioButtonChecked />}
                      label="LIVE DATA"
                      sx={{
                        background: theme.palette.success.main,
                        color: 'white',
                        fontWeight: 'bold',
                        opacity: 0.95,
                      }}
                    />
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
                        <SupremeGauge
                          value={marketMetrics.totalMarketSize}
                          max={200000}
                          label="Market Size"
                          unit="M"
                          color={theme.palette.primary.main}
                          size={180}
                          isLive={liveData}
                        />
                        <SupremeGauge
                          value={marketMetrics.averageGrowth}
                          max={30}
                          label="Avg Growth"
                          unit="%"
                          color={theme.palette.success.main}
                          size={180}
                          isLive={liveData}
                        />
                        <SupremeGauge
                          value={marketMetrics.totalProcedures}
                          max={1000}
                          label="Procedures"
                          unit=""
                          color={theme.palette.info.main}
                          size={180}
                          isLive={liveData}
                        />
                        <SupremeGauge
                          value={marketMetrics.totalCompanies}
                          max={300}
                          label="Companies"
                          unit=""
                          color={theme.palette.warning.main}
                          size={180}
                          isLive={liveData}
                        />
                      </Box>
                    </PremiumContainer>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TerritoryPremiumData territories={marketData?.territories || []} />
                      <CompactCategories
                        categories={marketData?.categories || []}
                        selectedCategory={selectedCategory}
                        onCategorySelect={setSelectedCategory}
                        selectedIndustry={selectedIndustry}
                        procedures={marketData?.procedures || []}
                      />
                    </Box>
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
                      <Circle sx={{ 
                        color: theme.palette.success.main, 
                        fontSize: 12,
                        opacity: 0.8,
                      }} />
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