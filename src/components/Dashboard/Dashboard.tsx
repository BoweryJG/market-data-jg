import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  useTheme,
  styled,
  keyframes
} from '@mui/material';
import { 
  Info as InfoIcon,
  OpenInNew as OpenInNewIcon 
} from '@mui/icons-material';
import { supabase } from '../../services/supabaseClient';
import ProcedureDetailsModal from './ProcedureDetailsModal';
import CompanyDetailsModal from './CompanyDetailsModal';
import { TerritoryIntelligenceWidget } from '../Widgets';
import SupremeGauge from './SupremeGauge';

// Premium animations
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

const shimmer = keyframes`
  0% { left: -50%; }
  100% { left: 100%; }
`;

// Premium styled components
const PremiumContainer = styled(Container)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f0f0f 50%, #1e1e1e 75%, #0a0a0a 100%)',
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const PremiumCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(30, 30, 30, 0.9) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-50%',
    width: '50%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent)',
    animation: `${shimmer} 8s linear infinite`,
    pointerEvents: 'none',
  },
}));

const GaugeSection = styled(Box)(({ theme }) => ({
  background: `
    radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(159, 88, 250, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(30, 30, 30, 0.9) 100%)
  `,
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 48%, rgba(0, 212, 255, 0.03) 50%, transparent 52%)',
    backgroundSize: '20px 20px',
    animation: `${dataFlow} 15s linear infinite`,
    pointerEvents: 'none',
  },
}));

// Utility functions
const formatMarketSize = (sizeInMillions: number | null | undefined): string => {
  if (sizeInMillions == null) return 'N/A';
  
  if (sizeInMillions >= 1000) {
    return `${(sizeInMillions / 1000).toFixed(1)}B`;
  } else {
    return `${sizeInMillions.toFixed(0)}M`;
  }
};

const formatGrowthRate = (rate: number | null | undefined): string => {
  if (rate == null) return 'N/A';
  return `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`;
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return 'N/A';
  return `$${amount.toLocaleString()}`;
};

// Interfaces
interface DentalProcedure {
  id: number;
  procedure_name?: string;
  name?: string;
  description?: string;
  category_id?: number;
  category?: string;
  clinical_category?: string;
  market_size_2025_usd_millions?: number;
  yearly_growth_percentage?: number;
  average_cost_usd?: number;
  complexity?: string;
  procedure_duration_min?: number;
  recovery_time_days?: number;
  patient_satisfaction_score?: number;
  cpt_cdt_code?: string;
  [key: string]: any;
}

interface AestheticProcedure {
  id: number;
  procedure_name?: string;
  name?: string;
  description?: string;
  category_id?: number;
  category?: string;
  clinical_category?: string;
  average_cost_usd?: number;
  yearly_growth_percentage?: number;
  downtime?: string;
  number_of_sessions?: number;
  results_duration?: string;
  body_areas_applicable?: string;
  skin_types_applicable?: string;
  patient_satisfaction_score?: number;
  [key: string]: any;
}

interface Company {
  id: number;
  name: string;
  description?: string;
  website?: string;
  headquarters?: string;
  logo_url?: string;
  founded_year?: number;
  ceo?: string;
  employee_count?: number;
  company_category_id?: number;
  key_products?: string;
  market_share_pct?: number;
  revenue?: string;
  [key: string]: any;
}

interface CategoryType {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  applicable_to: 'dental' | 'aesthetic' | 'both';
  description?: string;
  avg_growth_rate?: number;
  market_size_usd_millions?: number;
  icon_name?: string;
  color_code?: string;
  display_order?: number;
  is_featured?: boolean;
  procedure_count?: number;
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [selectedIndustry, setSelectedIndustry] = useState<'dental' | 'aesthetic'>('dental');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Data states
  const [dentalProcedures, setDentalProcedures] = useState<DentalProcedure[]>([]);
  const [aestheticProcedures, setAestheticProcedures] = useState<AestheticProcedure[]>([]);
  const [dentalCompanies, setDentalCompanies] = useState<Company[]>([]);
  const [aestheticCompanies, setAestheticCompanies] = useState<Company[]>([]);
  const [dentalCategories, setDentalCategories] = useState<CategoryType[]>([]);
  const [aestheticCategories, setAestheticCategories] = useState<CategoryType[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Loading states
  const [proceduresLoading, setProceduresLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [selectedProcedure, setSelectedProcedure] = useState<DentalProcedure | AestheticProcedure | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [procedureModalOpen, setProcedureModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  
  // Calculate current procedures based on selected industry and category
  const currentProcedures = useMemo(() => {
    const procedures = selectedIndustry === 'dental' ? dentalProcedures : aestheticProcedures;
    const filtered = selectedCategory
      ? procedures.filter(p => p.category_id === selectedCategory)
      : procedures;
    
    return [...filtered].sort((a, b) => 
      (a.name || a.procedure_name || '').localeCompare(b.name || b.procedure_name || '')
    );
  }, [selectedIndustry, selectedCategory, dentalProcedures, aestheticProcedures]);
  
  // Calculate current companies and categories
  const currentCompanies = useMemo(() => {
    return selectedIndustry === 'dental' ? dentalCompanies : aestheticCompanies;
  }, [selectedIndustry, dentalCompanies, aestheticCompanies]);
  
  const currentCategories = useMemo(() => {
    return selectedIndustry === 'dental' ? dentalCategories : aestheticCategories;
  }, [selectedIndustry, dentalCategories, aestheticCategories]);
  
  // Calculate categories with procedure counts
  const categoriesWithCounts = useMemo(() => {
    const procedures = selectedIndustry === 'dental' ? dentalProcedures : aestheticProcedures;
    const categories = selectedIndustry === 'dental' ? dentalCategories : aestheticCategories;
    
    return categories.map(category => ({
      ...category,
      procedure_count: procedures.filter(p => p.category_id === category.id).length
    }));
  }, [selectedIndustry, dentalCategories, aestheticCategories, dentalProcedures, aestheticProcedures]);

  // Calculate market metrics for gauges
  const marketMetrics = useMemo(() => {
    const totalProcedures = dentalProcedures.length + aestheticProcedures.length;
    const allProcedures = [...dentalProcedures, ...aestheticProcedures];
    
    const totalMarketSize = allProcedures.reduce((sum, p) => 
      sum + (p.market_size_2025_usd_millions || 0), 0);
    
    const avgGrowthRate = allProcedures.length > 0 
      ? allProcedures.reduce((sum, p) => sum + (p.yearly_growth_percentage || 0), 0) / allProcedures.length
      : 0;
    
    const avgCost = allProcedures.length > 0
      ? allProcedures.reduce((sum, p) => sum + (p.average_cost_usd || 0), 0) / allProcedures.length
      : 0;

    return {
      marketSize: totalMarketSize,
      avgGrowth: avgGrowthRate,
      avgCost: avgCost,
      totalProcedures
    };
  }, [dentalProcedures, aestheticProcedures]);
  
  // Event handlers
  const handleIndustryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIndustry(event.target.value as 'dental' | 'aesthetic');
    setSelectedCategory(null);
    setCurrentPage(0);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  // Data fetching functions
  const fetchProcedures = async () => {
    setProceduresLoading(true);
    try {
      const { data: dentalData, error: dentalError } = await supabase
        .from('dental_procedures')
        .select('*')
        .order('name', { ascending: true });
      
      if (dentalError) throw dentalError;
      setDentalProcedures(dentalData || []);

      const { data: aestheticData, error: aestheticError } = await supabase
        .from('aesthetic_procedures')
        .select('*')
        .order('name', { ascending: true });
      
      if (aestheticError) throw aestheticError;
      setAestheticProcedures(aestheticData || []);
    } catch (err: any) {
      console.error('Procedures fetch error:', err);
      setError(`Failed to load procedures: ${err.message}`);
    } finally {
      setProceduresLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const { data: dentalCatData, error: dentalCatError } = await supabase
        .from('dental_procedure_categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (dentalCatError) throw dentalCatError;
      setDentalCategories(dentalCatData || []);

      const { data: aestheticCatData, error: aestheticCatError } = await supabase
        .from('aesthetic_categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (aestheticCatError) throw aestheticCatError;
      setAestheticCategories(aestheticCatData || []);
    } catch (err: any) {
      console.error('Categories fetch error:', err);
      setError(`Failed to load categories: ${err.message}`);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      const { data: dentalData, error: dentalError } = await supabase
        .from('dental_companies')
        .select('*')
        .order('name', { ascending: true });
      
      if (dentalError) throw dentalError;
      setDentalCompanies(dentalData || []);

      const { data: aestheticData, error: aestheticError } = await supabase
        .from('aesthetic_companies')
        .select('*')
        .order('name', { ascending: true });
      
      if (aestheticError) throw aestheticError;
      setAestheticCompanies(aestheticData || []);
    } catch (err: any) {
      console.error('Companies fetch error:', err);
      setError(`Failed to load companies: ${err.message}`);
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchProcedures(),
          fetchCategories(),
          fetchCompanies()
        ]);
      } catch (err: any) {
        console.error('Data fetch error:', err);
        setError(`Failed to load data: ${err.message}`);
      }
    };

    fetchData();
  }, []);

  // Filtered and paginated procedures
  const filteredProcedures = useMemo(() => {
    if (selectedIndustry === 'dental') {
      return selectedCategory
        ? dentalProcedures.filter(p => p.category_id === selectedCategory)
        : dentalProcedures;
    } else {
      return selectedCategory
        ? aestheticProcedures.filter(p => p.category_id === selectedCategory)
        : aestheticProcedures;
    }
  }, [selectedIndustry, selectedCategory, dentalProcedures, aestheticProcedures]);

  const paginatedProcedures = useMemo(() => 
    filteredProcedures.slice(
      currentPage * rowsPerPage,
      (currentPage + 1) * rowsPerPage
    ),
    [filteredProcedures, currentPage, rowsPerPage]
  );

  // Loading state
  if (proceduresLoading || categoriesLoading || companiesLoading) {
    return (
      <PremiumContainer maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress size={60} thickness={4} sx={{ color: '#00d4ff' }} />
          <Typography variant="h6" sx={{ ml: 2, color: '#ffffff' }}>Loading premium dashboard...</Typography>
        </Box>
      </PremiumContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PremiumContainer maxWidth="xl">
        <Alert severity="error" sx={{ my: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#ff6b6b' }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2, backgroundColor: '#00d4ff', '&:hover': { backgroundColor: '#0099cc' } }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </PremiumContainer>
    );
  }

  // Main render
  return (
    <PremiumContainer maxWidth="xl">
      {/* Header */}
      <Typography 
        variant="h4" 
        gutterBottom 
        align="center" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 4,
          background: 'linear-gradient(135deg, #ffffff, #00d4ff, #9f58fa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'Orbitron, monospace'
        }}
      >
        Premium Market Intelligence Dashboard
      </Typography>

      {/* Premium Gauges Section */}
      <GaugeSection>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#ffffff', 
            fontWeight: 'bold', 
            mb: 3, 
            textAlign: 'center',
            fontFamily: 'Orbitron, monospace'
          }}
        >
          Real-Time Market Metrics
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} lg={3}>
            <SupremeGauge
              value={marketMetrics.marketSize}
              max={300000}
              label="Market Size"
              unit="M"
              color="#4bd48e"
              size={180}
              isLive={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <SupremeGauge
              value={marketMetrics.avgGrowth}
              max={30}
              label="Avg Growth"
              unit="%"
              color="#00d4ff"
              size={180}
              isLive={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <SupremeGauge
              value={marketMetrics.avgCost / 1000}
              max={50}
              label="Avg Cost"
              unit="K"
              color="#9f58fa"
              size={180}
              isLive={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <SupremeGauge
              value={marketMetrics.totalProcedures}
              max={300}
              label="Total Procedures"
              unit=""
              color="#ff6b35"
              size={180}
              isLive={true}
            />
          </Grid>
        </Grid>
      </GaugeSection>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Content */}
        <Grid item xs={12} lg={8}>
          {/* Industry Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ color: '#94a3b8', mb: 2 }}>Select Industry</FormLabel>
              <RadioGroup
                row
                aria-label="industry"
                name="industry"
                value={selectedIndustry}
                onChange={handleIndustryChange}
              >
                <FormControlLabel
                  value="dental"
                  control={<Radio sx={{ color: '#4bd48e' }} />}
                  label={<Typography sx={{ color: '#ffffff' }}>Dental</Typography>}
                />
                <FormControlLabel
                  value="aesthetic"
                  control={<Radio sx={{ color: '#9f58fa' }} />}
                  label={<Typography sx={{ color: '#ffffff' }}>Aesthetic</Typography>}
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Beautiful Categories Section */}
          <PremiumCard elevation={12} sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{
                color: '#ffffff',
                fontWeight: 'bold',
                mb: 3
              }}>
                {selectedIndustry === 'dental' ? 'Dental Procedure Categories' : 'Aesthetic Procedure Categories'}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {categoriesWithCounts.map((category) => (
                  <Chip
                    key={category.id}
                    label={`${category.name} (${category.procedure_count || 0})`}
                    onClick={() => handleCategorySelect(category.id)}
                    variant={selectedCategory === category.id ? "filled" : "outlined"}
                    sx={{
                      backgroundColor: selectedCategory === category.id
                        ? (selectedIndustry === 'dental' ? '#4bd48e' : '#9f58fa')
                        : 'rgba(255, 255, 255, 0.05)',
                      color: selectedCategory === category.id ? '#000000' : '#ffffff',
                      borderColor: selectedIndustry === 'dental' ? '#4bd48e' : '#9f58fa',
                      '&:hover': {
                        backgroundColor: selectedCategory === category.id
                          ? (selectedIndustry === 'dental' ? '#4bd48e' : '#9f58fa')
                          : 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                      },
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      height: '40px'
                    }}
                  />
                ))}
                {selectedCategory && (
                  <Chip
                    label="Clear Filter"
                    onClick={() => handleCategorySelect(null)}
                    sx={{
                      backgroundColor: 'rgba(255, 107, 53, 0.2)',
                      color: '#ff6b35',
                      borderColor: '#ff6b35',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 107, 53, 0.3)',
                      }
                    }}
                    variant="outlined"
                  />
                )}
              </Box>
            </CardContent>
          </PremiumCard>

          {/* All Procedures Section */}
          <PremiumCard elevation={12}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Typography variant="h6" sx={{
                  color: '#ffffff',
                  fontWeight: 'bold'
                }}>
                  All Procedures ({currentProcedures.length})
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {selectedCategory ? 'Filtered by category' : 'Showing all procedures'} • Real-time data from Supabase
                </Typography>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{
                backgroundColor: 'transparent',
                maxHeight: 600,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0, 212, 255, 0.5)',
                  borderRadius: '4px',
                },
              }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{
                        backgroundColor: 'rgba(26, 26, 26, 0.95)',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        borderBottom: '1px solid rgba(0, 212, 255, 0.3)'
                      }}>
                        Procedure Name
                      </TableCell>
                      <TableCell sx={{
                        backgroundColor: 'rgba(26, 26, 26, 0.95)',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        borderBottom: '1px solid rgba(0, 212, 255, 0.3)'
                      }}>
                        Category
                      </TableCell>
                      <TableCell sx={{
                        backgroundColor: 'rgba(26, 26, 26, 0.95)',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        borderBottom: '1px solid rgba(0, 212, 255, 0.3)'
                      }}>
                        Market Size
                      </TableCell>
                      <TableCell sx={{
                        backgroundColor: 'rgba(26, 26, 26, 0.95)',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        borderBottom: '1px solid rgba(0, 212, 255, 0.3)'
                      }}>
                        Growth Rate
                      </TableCell>
                      <TableCell sx={{
                        backgroundColor: 'rgba(26, 26, 26, 0.95)',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        borderBottom: '1px solid rgba(0, 212, 255, 0.3)'
                      }}>
                        Avg Cost
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedProcedures.length > 0 ? (
                      paginatedProcedures.map((procedure, index) => (
                        <TableRow
                          key={`${selectedIndustry}-${procedure.id || index}`}
                          hover
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 212, 255, 0.05)',
                              transform: 'translateX(4px)',
                              transition: 'all 0.2s ease'
                            },
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                          }}
                          onClick={() => {
                            setSelectedProcedure(procedure);
                            setProcedureModalOpen(true);
                          }}
                        >
                          <TableCell sx={{ color: '#ffffff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {procedure.name || procedure.procedure_name || 'N/A'}
                              </Typography>
                              <IconButton size="small" sx={{ color: '#00d4ff' }}>
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: '#94a3b8' }}>
                            {procedure.category || procedure.clinical_category || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: '#4bd48e', fontWeight: 'bold' }}>
                            {formatMarketSize(procedure.market_size_2025_usd_millions)}
                          </TableCell>
                          <TableCell sx={{ color: '#9f58fa', fontWeight: 'bold' }}>
                            {formatGrowthRate(procedure.yearly_growth_percentage)}
                          </TableCell>
                          <TableCell sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                            {formatCurrency(procedure.average_cost_usd)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{
                          color: '#94a3b8',
                          py: 4,
                          fontSize: '1.1rem'
                        }}>
                          <Typography>No procedures found</Typography>
                          <Button
                            variant="outlined"
                            sx={{ mt: 2, color: '#00d4ff', borderColor: '#00d4ff' }}
                            onClick={() => window.location.reload()}
                          >
                            Refresh Data
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredProcedures.length}
                page={currentPage}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  color: '#ffffff',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  '& .MuiSelect-icon': { color: '#ffffff' },
                  '& .MuiTablePagination-select': { color: '#ffffff' },
                  '& .MuiTablePagination-displayedRows': { color: '#94a3b8' }
                }}
              />
            </CardContent>
          </PremiumCard>
        </Grid>

        {/* Right Sidebar - Territory Intelligence Widget */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <TerritoryIntelligenceWidget />
          </Box>
        </Grid>
      </Grid>

      {/* Procedure Details Modal */}
      {selectedProcedure && (
        <ProcedureDetailsModal
          open={procedureModalOpen}
          onClose={() => {
            setProcedureModalOpen(false);
            setSelectedProcedure(null);
          }}
          procedure={selectedProcedure}
          industry={selectedIndustry}
        />
      )}
      
      {/* Company Details Modal */}
      {selectedCompany && (
        <CompanyDetailsModal
          open={companyModalOpen}
          onClose={() => {
            setCompanyModalOpen(false);
            setSelectedCompany(null);
          }}
          company={selectedCompany}
          industry={selectedIndustry}
        />
      )}
    </PremiumContainer>
  );
};

export default Dashboard;
