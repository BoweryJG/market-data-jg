import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  Button,
  ButtonGroup,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  FormControlLabel,
  Switch,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  styled,
} from '@mui/material';
import {
  Search,
  TrendingUp,
  ShowChart,
  AttachMoney,
  Business,
  Assessment,
  Circle,
  Download,
  RadioButtonChecked,
  Refresh,
  Warning,
  CheckCircle,
  Info,
  OpenInNew,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import YearSelector from './YearSelector';
import { getEstimatedMarketData } from '../../services/marketDataEstimator';
import type { EstimatedMarketData, EstimatedProcedure } from '../../services/marketDataEstimator';
import PremiumContainer from '../common/PremiumContainer';
import IntegrationCalculator from './IntegrationCalculator';
import ProcedureDetailsModal from './ProcedureDetailsModal';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`;

const PulsingDot = styled(Circle)(({ theme }) => ({
  animation: `${pulseAnimation} 2s ease-in-out infinite`,
}));

interface IntegrationData {
  upfront_cost: number;
  ongoing_cost: number;
  commission_percentage: number;
  projected_revenue: number;
  roi_percentage: number;
  roi_months: number;
}

const calculateIntegrationData = (
  averageProcedureCost: number,
  growthRate: number,
  proceduresPerMonth: number = 50
): IntegrationData => {
  const upfrontCost = 15000 + Math.random() * 10000;
  const ongoingCost = 2000 + Math.random() * 1000;
  const commissionPercentage = 12 + Math.random() * 3;
  const monthlyRevenue = proceduresPerMonth * averageProcedureCost * (commissionPercentage / 100);
  const yearlyRevenue = monthlyRevenue * 12 * (1 + growthRate / 100);
  const totalCost = upfrontCost + (ongoingCost * 12);
  const netRevenue = yearlyRevenue - totalCost;
  const roiPercentage = (netRevenue / totalCost) * 100;
  const roiMonths = Math.ceil(totalCost / monthlyRevenue);

  return {
    upfront_cost: Math.round(upfrontCost),
    ongoing_cost: Math.round(ongoingCost),
    commission_percentage: Math.round(commissionPercentage * 10) / 10,
    projected_revenue: Math.round(yearlyRevenue),
    roi_percentage: Math.round(roiPercentage),
    roi_months: roiMonths,
  };
};

const EnhancedMarketCommandCenter: React.FC = () => {
  const theme = useTheme();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<'all' | 'dental' | 'aesthetic'>('all');
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<EstimatedMarketData | null>(null);
  const [liveData, setLiveData] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<EstimatedProcedure | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setHeaderCollapsed(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const data = getEstimatedMarketData(selectedYear);
        setMarketData(data);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error loading market data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedYear]);

  useEffect(() => {
    if (liveData) {
      const interval = setInterval(() => {
        if (marketData) {
          const updatedData = { ...marketData };
          updatedData.procedures = updatedData.procedures.map(proc => ({
            ...proc,
            market_size_usd: proc.market_size_usd * (0.98 + Math.random() * 0.04),
            growth_rate: proc.growth_rate + (Math.random() - 0.5) * 0.5,
          }));
          setMarketData(updatedData);
          setLastUpdate(new Date());
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [liveData, marketData]);

  const filteredProcedures = useMemo(() => {
    if (!marketData) return [];
    
    return marketData.procedures.filter(proc => {
      const matchesSearch = searchTerm === '' || 
        proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesIndustry = selectedIndustry === 'all' || proc.industry === selectedIndustry;
      
      return matchesSearch && matchesIndustry;
    });
  }, [marketData, searchTerm, selectedIndustry]);

  const marketMetrics = useMemo(() => {
    const procedures = selectedIndustry === 'all' 
      ? marketData?.procedures || []
      : marketData?.procedures.filter(p => p.industry === selectedIndustry) || [];
    
    const totalMarketSize = procedures.reduce((sum, proc) => sum + proc.market_size_usd, 0);
    const averageGrowth = procedures.length > 0
      ? procedures.reduce((sum, proc) => sum + proc.growth_rate, 0) / procedures.length
      : 0;
    const totalCompanies = procedures.reduce((sum, proc) => sum + proc.top_companies.length, 0);
    
    return {
      totalMarketSize,
      averageGrowth,
      totalCompanies,
      procedureCount: procedures.length,
    };
  }, [marketData, selectedIndustry]);

  const handleRefresh = () => {
    const loadData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const data = getEstimatedMarketData(selectedYear);
        setMarketData(data);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error loading market data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  };

  const handleProcedureClick = (procedure: EstimatedProcedure) => {
    setSelectedProcedure(procedure);
    setDetailsModalOpen(true);
  };

  const formatMarketSize = (size: number): string => {
    if (size >= 1e9) return `$${(size / 1e9).toFixed(2)}B`;
    if (size >= 1e6) return `$${(size / 1e6).toFixed(2)}M`;
    return `$${(size / 1e3).toFixed(2)}K`;
  };

  return (
    <PremiumContainer sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header with gradient background */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: 'linear-gradient(135deg, #2A2635 0%, #1A1625 100%)',
            borderRadius: headerCollapsed ? '8px' : '16px 16px 0 0',
            transition: 'all 0.3s ease',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(159, 88, 250, 0.1) 50%, transparent 70%)',
              animation: 'scan 4s ease-in-out infinite',
              pointerEvents: 'none',
            },
            '@keyframes scan': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' },
            },
          }}
        >
          <Toolbar sx={{ minHeight: headerCollapsed ? 64 : 'auto', py: headerCollapsed ? 1 : 2 }}>
            <Box sx={{ width: '100%' }}>
              {/* Collapsed State */}
              <Collapse in={headerCollapsed}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    fontFamily: "'Orbitron', monospace",
                    letterSpacing: '-0.5px',
                    flexShrink: 0,
                  }}>
                    Medical Device Sales Intelligence
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
                      <Typography variant="h3" sx={{ 
                        fontWeight: 'bold', 
                        mr: 2,
                        fontFamily: "'Orbitron', monospace",
                        letterSpacing: '-0.5px',
                        background: 'linear-gradient(135deg, #9f58fa 0%, #4B96DC 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>
                        Medical Device Sales Intelligence 2025-30
                      </Typography>
                      <Chip
                        icon={<RadioButtonChecked />}
                        label={liveData ? "LIVE" : "STATIC"}
                        color={liveData ? "success" : "default"}
                        sx={{ 
                          fontWeight: 'bold',
                          animation: liveData ? `${pulseAnimation} 2s ease-in-out infinite` : 'none',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Last updated: {lastUpdate.toLocaleTimeString()}
                      </Typography>
                      <Tooltip title="Refresh data">
                        <IconButton onClick={handleRefresh} size="small">
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export data">
                        <IconButton size="small">
                          <Download />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {/* Controls Row */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mb: 3,
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}>
                    <TextField
                      placeholder="Search procedures, categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                      }}
                      sx={{ maxWidth: { xs: '100%', md: 500 } }}
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
                          checked={liveData}
                          onChange={(e) => setLiveData(e.target.checked)}
                          color="success"
                        />
                      }
                      label="Live Updates"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                  
                  {/* Market Overview Cards */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
                    <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #2A2635 0%, #1A1625 100%)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AttachMoney sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="subtitle2" color="text.secondary">Total Market Size</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        ${(marketMetrics.totalMarketSize / 1e9).toFixed(2)}B
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedYear} Projection
                      </Typography>
                    </Paper>
                    
                    <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #2A2635 0%, #1A1625 100%)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingUp sx={{ mr: 1, color: theme.palette.success.main }} />
                        <Typography variant="subtitle2" color="text.secondary">Average Growth</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                        {marketMetrics.averageGrowth.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        YoY CAGR
                      </Typography>
                    </Paper>
                    
                    <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #2A2635 0%, #1A1625 100%)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Assessment sx={{ mr: 1, color: theme.palette.info.main }} />
                        <Typography variant="subtitle2" color="text.secondary">Active Procedures</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {marketMetrics.procedureCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tracked Categories
                      </Typography>
                    </Paper>
                    
                    <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #2A2635 0%, #1A1625 100%)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Business sx={{ mr: 1, color: theme.palette.warning.main }} />
                        <Typography variant="subtitle2" color="text.secondary">Top Companies</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {marketMetrics.totalCompanies}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Market Leaders
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </Collapse>
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3, backgroundColor: theme.palette.background.default }}>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          {/* Alerts */}
          {liveData && (
            <Alert 
              severity="info" 
              icon={<Info />}
              sx={{ mb: 2 }}
            >
              Live data updates are enabled. Market values refresh every 5 seconds with simulated real-time changes.
            </Alert>
          )}
          
          {/* Data Table */}
          <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 400px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Procedure</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Market Size ({selectedYear})</TableCell>
                  <TableCell align="right">Growth Rate</TableCell>
                  <TableCell align="right">Avg. Cost</TableCell>
                  <TableCell>Top Companies</TableCell>
                  <TableCell align="center">ROI Analysis</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProcedures.map((procedure, index) => {
                  const integrationData = calculateIntegrationData(
                    procedure.average_cost_usd,
                    procedure.growth_rate
                  );
                  const procedureName = `${procedure.name} (${procedure.industry})`;
                  
                  return (
                    <TableRow 
                      key={`${procedure.name}-${procedure.industry}-${index}`}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleProcedureClick(procedure)}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {procedure.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {procedure.industry === 'dental' ? '🦷' : '💉'} {procedure.industry}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={procedure.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatMarketSize(procedure.market_size_usd)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <TrendingUp sx={{ fontSize: 16, mr: 0.5, color: procedure.growth_rate > 10 ? theme.palette.success.main : theme.palette.text.secondary }} />
                          <Typography 
                            variant="body2" 
                            color={procedure.growth_rate > 10 ? 'success.main' : 'text.primary'}
                            sx={{ fontWeight: procedure.growth_rate > 10 ? 'bold' : 'normal' }}
                          >
                            {procedure.growth_rate.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${procedure.average_cost_usd.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {procedure.top_companies.slice(0, 3).map((company, idx) => (
                            <Chip
                              key={idx}
                              label={company}
                              size="small"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                          {procedure.top_companies.length > 3 && (
                            <Chip
                              label={`+${procedure.top_companies.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IntegrationCalculator
                          upfrontCost={integrationData.upfront_cost}
                          ongoingCost={integrationData.ongoing_cost}
                          commissionPercentage={integrationData.commission_percentage}
                          projectedRevenue={integrationData.projected_revenue}
                          roi_percentage={integrationData.roi_percentage}
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
      </Box>
    </PremiumContainer>
  );
};

export default EnhancedMarketCommandCenter;