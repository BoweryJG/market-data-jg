import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
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
  ButtonGroup,
  useTheme,
  styled,
  alpha,
  keyframes,
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
  Map as MapIcon,
  Assessment,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { comprehensiveDataService, ComprehensiveMarketData } from '../../services/comprehensiveDataService';
import { getCategoryIconConfig } from './CategoryIcons';
import SupremeGauge from './SupremeGauge';
import TerritoryIntelWidget from '../Widgets/TerritoryIntelWidget';
import ProcedureDetailsModal from './ProcedureDetailsModal';
import CompanyDetailsModal from './CompanyDetailsModal';

// Animations
const dataFlow = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100%); opacity: 0; }
`;

const pulseGlow = keyframes`
  0%, 100% {
    opacity: 0.6;
    box-shadow: 0 0 10px currentColor;
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
  }
`;

const ledFlicker = keyframes`
  0%, 100% { opacity: 1; }
  95% { opacity: 0.8; }
`;

const shimmer = keyframes`
  0% { left: -50%; }
  100% { left: 100%; }
`;

// Gem colors matching navbar
const gemColors = {
  impossible: 'rgb(255, 0, 255)',
  shift: 'rgb(0, 255, 255)',
  deep: 'rgb(255, 0, 170)',
  bgDark: '#0a0a0a',
  bgDarker: '#050505',
  panelDark: '#1a1a1a',
  panelDarker: '#141414',
  purplePrimary: '#9f58fa',
  blueAccent: '#4B96DC',
  greenAccent: '#4bd48e',
  pinkAccent: '#f53969',
  orangeAccent: '#ff6b35',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
};

// Premium Container - main dashboard wrapper
const PremiumContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${gemColors.bgDark} 0%, ${gemColors.panelDark} 25%, #0f0f0f 50%, #1e1e1e 75%, ${gemColors.bgDark} 100%)`,
  minHeight: '100vh',
  paddingTop: '140px', // Account for fixed navbar + telemetry
  paddingBottom: theme.spacing(4),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
}));

// Market Overview Card - V2.0 style
const MarketOverviewCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  background: `
    linear-gradient(135deg, #1a1a1a 0%, #252525 20%, #1e1e1e 40%, #2a2a2a 60%, #1f1f1f 80%, #1a1a1a 100%),
    linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.02) 50%, transparent 52%)
  `,
  backgroundSize: '100% 100%, 20px 20px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5)
  `,
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    background: `linear-gradient(45deg, ${gemColors.purplePrimary}, ${gemColors.blueAccent}, ${gemColors.purplePrimary}, ${gemColors.blueAccent})`,
    backgroundSize: '400% 400%',
    borderRadius: '16px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: -1,
  },
  
  '&:hover::before': {
    opacity: 0.1,
  },
}));

// Gauge Container with premium styling
const GaugeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: theme.spacing(3),
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  [theme.breakpoints.down('md')]: {
    '& > div': {
      flex: '1 1 45%',
    },
  },
  [theme.breakpoints.down('sm')]: {
    '& > div': {
      flex: '1 1 100%',
    },
  },
}));

// Category Pills Container
const CategoryContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  overflowX: 'auto',
  overflowY: 'hidden',
  marginBottom: theme.spacing(2),
  '&::-webkit-scrollbar': {
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
    },
  },
}));

// Category Pill
const CategoryPill = styled(Chip)<{ selected?: boolean; categoryColor: string }>(({ theme, selected, categoryColor }) => ({
  background: selected ? alpha(categoryColor, 0.2) : 'rgba(255, 255, 255, 0.05)',
  border: `1px solid ${selected ? categoryColor : 'rgba(255, 255, 255, 0.1)'}`,
  color: selected ? '#fff' : theme.palette.text.secondary,
  fontWeight: selected ? 600 : 400,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    background: alpha(categoryColor, 0.15),
    borderColor: categoryColor,
    transform: 'translateY(-1px)',
  },
  '& .MuiChip-icon': {
    color: categoryColor,
  },
}));

// Search and Filter Bar
const SearchBar = styled(Card)(({ theme }) => ({
  background: 'rgba(26, 26, 26, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backdropFilter: 'blur(10px)',
}));

// Enhanced Table Container
const EnhancedTableContainer = styled(TableContainer)(({ theme }) => ({
  background: 'rgba(26, 26, 26, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  maxHeight: '60vh',
  '& .MuiTable-root': {
    '& .MuiTableHead-root': {
      '& .MuiTableCell-root': {
        background: 'rgba(30, 30, 30, 0.9)',
        borderBottom: `2px solid ${gemColors.purplePrimary}33`,
        fontWeight: 600,
        textTransform: 'uppercase',
        fontSize: '0.75rem',
        letterSpacing: '0.5px',
      },
    },
    '& .MuiTableBody-root': {
      '& .MuiTableRow-root': {
        transition: 'all 0.2s ease',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.02)',
        },
      },
    },
  },
}));

// Territory Intel Container
const TerritoryIntelContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  minHeight: '200px',
  display: 'flex',
  alignItems: 'stretch',
}));

// LED Indicator
const LEDIndicator = styled(Box)<{ color: string }>(({ theme, color }) => ({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: color,
  boxShadow: `0 0 8px ${color}, inset 0 0 2px rgba(0, 0, 0, 0.3)`,
  animation: `${ledFlicker} 3s infinite`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: '30%',
    height: '30%',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    filter: 'blur(1px)',
  },
}));

interface PremiumMarketDashboardProps {}

const PremiumMarketDashboard: React.FC<PremiumMarketDashboardProps> = () => {
  const theme = useTheme();
  const [marketData, setMarketData] = useState<ComprehensiveMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<'all' | 'dental' | 'aesthetic'>('all');
  const [viewMode, setViewMode] = useState<'procedures' | 'companies'>('procedures');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'market_size_2025_usd_millions',
    direction: 'desc',
  });
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isLiveMode, setIsLiveMode] = useState(true);
  
  // Fetch market data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await comprehensiveDataService.getComprehensiveMarketData();
        setMarketData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh data every 30 seconds in live mode
    const interval = isLiveMode ? setInterval(fetchData, 30000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveMode]);
  
  // Filter procedures
  const filteredProcedures = useMemo(() => {
    if (!marketData) return [];
    
    return marketData.procedures.filter(proc => {
      const matchesIndustry = selectedIndustry === 'all' || proc.industry === selectedIndustry;
      const matchesCategory = !selectedCategory || proc.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        proc.procedure_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proc.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesIndustry && matchesCategory && matchesSearch;
    });
  }, [marketData, selectedIndustry, selectedCategory, searchQuery]);
  
  // Filter companies
  const filteredCompanies = useMemo(() => {
    if (!marketData) return [];
    
    return marketData.companies.filter(company => {
      const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
      const matchesSearch = !searchQuery || 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.headquarters.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesIndustry && matchesSearch;
    });
  }, [marketData, selectedIndustry, searchQuery]);
  
  // Get visible categories
  const visibleCategories = useMemo(() => {
    if (!marketData) return [];
    
    return marketData.categories
      .filter(cat => selectedIndustry === 'all' || cat.industry === selectedIndustry)
      .filter(cat => {
        const procedureCount = marketData.procedures
          .filter(p => p.category === cat.name && (selectedIndustry === 'all' || p.industry === selectedIndustry))
          .length;
        return procedureCount > 0;
      });
  }, [marketData, selectedIndustry]);
  
  // Calculate gauge values
  const gaugeValues = useMemo(() => {
    if (!marketData) return { marketSize: 0, avgGrowth: 0, procedures: 0, companies: 0 };
    
    const relevantProcedures = filteredProcedures;
    const relevantCompanies = filteredCompanies;
    
    const marketSize = relevantProcedures.reduce((sum, p) => sum + (p.market_size_2025_usd_millions || 0), 0);
    const avgGrowth = relevantProcedures.length > 0
      ? relevantProcedures.reduce((sum, p) => sum + (p.yearly_growth_percentage || 0), 0) / relevantProcedures.length
      : 0;
    
    return {
      marketSize,
      avgGrowth,
      procedures: relevantProcedures.length,
      companies: relevantCompanies.length,
    };
  }, [filteredProcedures, filteredCompanies, marketData]);
  
  // Sort handler
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };
  
  // Sort data
  const sortedData = useMemo(() => {
    const data = viewMode === 'procedures' ? [...filteredProcedures] : [...filteredCompanies];
    
    return data.sort((a, b) => {
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredProcedures, filteredCompanies, sortConfig, viewMode]);
  
  if (loading) {
    return (
      <PremiumContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress sx={{ color: gemColors.purplePrimary }} />
        </Box>
      </PremiumContainer>
    );
  }
  
  if (error || !marketData) {
    return (
      <PremiumContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography color="error">{error || 'No data available'}</Typography>
        </Box>
      </PremiumContainer>
    );
  }
  
  return (
    <PremiumContainer>
      {/* Market Command Center V2.0 */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={9}>
          <MarketOverviewCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" sx={{ 
                  fontFamily: "'Orbitron', monospace", 
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${gemColors.purplePrimary}, ${gemColors.blueAccent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  US Medical Aesthetics Market 2025-2030
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LEDIndicator color={isLiveMode ? '#00ff00' : '#ff0000'} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isLiveMode}
                        onChange={(e) => setIsLiveMode(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: gemColors.greenAccent,
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: gemColors.greenAccent,
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {isLiveMode ? 'LIVE DATA' : 'STATIC'}
                      </Typography>
                    }
                  />
                </Box>
              </Box>
              
              {/* Supreme Gauges */}
              <GaugeContainer>
                <SupremeGauge
                  value={gaugeValues.marketSize / 1000}
                  max={25}
                  label="Market Size"
                  unit="B"
                  color={gemColors.greenAccent}
                  size={180}
                  isLive={isLiveMode}
                />
                <SupremeGauge
                  value={gaugeValues.avgGrowth}
                  max={20}
                  label="Avg Growth"
                  unit="%"
                  color={gemColors.purplePrimary}
                  size={180}
                  isLive={isLiveMode}
                />
                <SupremeGauge
                  value={gaugeValues.procedures}
                  max={500}
                  label="Procedures"
                  unit=""
                  color={gemColors.blueAccent}
                  size={180}
                  isLive={isLiveMode}
                />
                <SupremeGauge
                  value={gaugeValues.companies}
                  max={1000}
                  label="Companies"
                  unit=""
                  color={gemColors.orangeAccent}
                  size={180}
                  isLive={isLiveMode}
                />
              </GaugeContainer>
            </CardContent>
          </MarketOverviewCard>
        </Grid>
        
        {/* Territory Intelligence Widget */}
        <Grid item xs={12} lg={3}>
          <TerritoryIntelContainer>
            <TerritoryIntelWidget />
          </TerritoryIntelContainer>
        </Grid>
      </Grid>
      
      {/* Inline Category Pills */}
      <CategoryContainer>
        <Chip
          label="All Categories"
          onClick={() => setSelectedCategory(null)}
          sx={{
            background: !selectedCategory ? alpha(gemColors.purplePrimary, 0.2) : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${!selectedCategory ? gemColors.purplePrimary : 'rgba(255, 255, 255, 0.1)'}`,
            color: !selectedCategory ? '#fff' : theme.palette.text.secondary,
            fontWeight: !selectedCategory ? 600 : 400,
          }}
        />
        {visibleCategories.map((category) => {
          const iconConfig = getCategoryIconConfig(category.name);
          const IconComponent = iconConfig.icon;
          const isSelected = selectedCategory === category.name;
          
          return (
            <CategoryPill
              key={category.id}
              label={category.name.replace(' Procedures', '')}
              icon={<IconComponent />}
              onClick={() => setSelectedCategory(isSelected ? null : category.name)}
              selected={isSelected}
              categoryColor={iconConfig.color}
            />
          );
        })}
      </CategoryContainer>
      
      {/* Search and Filter Bar */}
      <SearchBar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder={`Search ${viewMode}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              minWidth: '200px',
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.05)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.08)',
                },
              },
            }}
          />
          
          <ButtonGroup variant="outlined" size="small">
            <Button
              variant={selectedIndustry === 'all' ? 'contained' : 'outlined'}
              onClick={() => setSelectedIndustry('all')}
              sx={{
                background: selectedIndustry === 'all' ? alpha(gemColors.purplePrimary, 0.2) : 'transparent',
                borderColor: gemColors.purplePrimary,
                color: '#fff',
              }}
            >
              All ({marketData.procedures.length})
            </Button>
            <Button
              variant={selectedIndustry === 'dental' ? 'contained' : 'outlined'}
              onClick={() => setSelectedIndustry('dental')}
              sx={{
                background: selectedIndustry === 'dental' ? alpha(gemColors.blueAccent, 0.2) : 'transparent',
                borderColor: gemColors.blueAccent,
                color: '#fff',
              }}
            >
              Dental ({marketData.procedures.filter(p => p.industry === 'dental').length})
            </Button>
            <Button
              variant={selectedIndustry === 'aesthetic' ? 'contained' : 'outlined'}
              onClick={() => setSelectedIndustry('aesthetic')}
              sx={{
                background: selectedIndustry === 'aesthetic' ? alpha(gemColors.pinkAccent, 0.2) : 'transparent',
                borderColor: gemColors.pinkAccent,
                color: '#fff',
              }}
            >
              Aesthetic ({marketData.procedures.filter(p => p.industry === 'aesthetic').length})
            </Button>
          </ButtonGroup>
          
          <FormControlLabel
            control={
              <Switch
                checked={viewMode === 'companies'}
                onChange={(e) => setViewMode(e.target.checked ? 'companies' : 'procedures')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: gemColors.orangeAccent,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: gemColors.orangeAccent,
                  },
                }}
              />
            }
            label={viewMode === 'companies' ? 'Companies' : 'Procedures'}
          />
          
          <Typography variant="body2" color="text.secondary">
            Showing {sortedData.length} of {viewMode === 'procedures' ? marketData.procedures.length : marketData.companies.length} {viewMode}
          </Typography>
        </Box>
      </SearchBar>
      
      {/* Data Table */}
      <EnhancedTableContainer component={Paper}>
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
                      Market Cap
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
                  <TableCell align="center">Type</TableCell>
                  <TableCell align="center">Status</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow
                key={item.id}
                hover
                onClick={() => viewMode === 'procedures' ? setSelectedProcedure(item) : setSelectedCompany(item)}
                sx={{ cursor: 'pointer' }}
              >
                {viewMode === 'procedures' ? (
                  <>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.procedure_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.industry}
                        size="small"
                        sx={{
                          background: item.industry === 'dental' 
                            ? alpha(gemColors.blueAccent, 0.2) 
                            : alpha(gemColors.pinkAccent, 0.2),
                          color: '#fff',
                          border: `1px solid ${item.industry === 'dental' ? gemColors.blueAccent : gemColors.pinkAccent}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {(() => {
                          const iconConfig = getCategoryIconConfig(item.category);
                          const IconComponent = iconConfig.icon;
                          return <IconComponent sx={{ fontSize: 16, color: iconConfig.color }} />;
                        })()}
                        <Typography variant="body2">{item.category}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${item.market_size_2025_usd_millions?.toFixed(1)}M
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {item.yearly_growth_percentage > 10 ? (
                          <TrendingUp sx={{ color: gemColors.greenAccent, fontSize: 16 }} />
                        ) : (
                          <TrendingDown sx={{ color: gemColors.orangeAccent, fontSize: 16 }} />
                        )}
                        <Typography variant="body2">{item.yearly_growth_percentage?.toFixed(1)}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">${item.average_cost_usd?.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((item.yearly_growth_percentage || 0) * 5, 100)}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: gemColors.greenAccent,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <LEDIndicator color={item.yearly_growth_percentage > 10 ? '#00ff00' : '#ffaa00'} />
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.industry}
                        size="small"
                        sx={{
                          background: item.industry === 'dental' 
                            ? alpha(gemColors.blueAccent, 0.2) 
                            : alpha(gemColors.pinkAccent, 0.2),
                          color: '#fff',
                          border: `1px solid ${item.industry === 'dental' ? gemColors.blueAccent : gemColors.pinkAccent}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                        <Typography variant="body2">{item.headquarters}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${item.market_size_2025_usd_billion?.toFixed(2)}B
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {item.yearly_growth_percentage > 10 ? (
                          <TrendingUp sx={{ color: gemColors.greenAccent, fontSize: 16 }} />
                        ) : (
                          <TrendingDown sx={{ color: gemColors.orangeAccent, fontSize: 16 }} />
                        )}
                        <Typography variant="body2">{item.yearly_growth_percentage?.toFixed(1)}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.company_type}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: gemColors.purplePrimary, color: gemColors.purplePrimary }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <LEDIndicator color={item.yearly_growth_percentage > 10 ? '#00ff00' : '#ffaa00'} />
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </EnhancedTableContainer>
      
      {/* Modals */}
      {selectedProcedure && (
        <ProcedureDetailsModal
          procedure={selectedProcedure}
          open={!!selectedProcedure}
          onClose={() => setSelectedProcedure(null)}
        />
      )}
      {selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          open={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </PremiumContainer>
  );
};

export default PremiumMarketDashboard;