import React, { useState, useEffect, useMemo } from 'react';
import MarketSizeOverview from './MarketSizeOverview';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Alert,
  Switch,
  TablePagination,
  Button,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { supabase } from '../../services/supabaseClient';
import { DentalCategory, AestheticCategory } from '../../types';
import { logger } from '../../services/logging/logger';


// Define interfaces based on the actual database schema
interface DentalProcedure {
  id: number;
  procedure_name?: string;
  name?: string;
  description?: string;
  expanded_description?: string;
  category_id?: number;
  category?: string;
  procedure_category_id?: number;
  clinical_category?: string;
  clinical_category_id?: number;
  market_size_2025_usd_millions?: number;
  yearly_growth_percentage?: number;
  average_cost_usd?: number;
  complexity?: string;
  procedure_duration_min?: number;
  recovery_time_days?: number;
  patient_satisfaction_score?: number;
  risks?: string;
  contraindications?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface AestheticProcedure {
  id: number;
  procedure_name?: string;
  name?: string;
  description?: string;
  category?: string;
  category_id?: number;
  clinical_category?: string;
  average_cost_usd?: number;
  yearly_growth_percentage?: number;
  downtime?: string;
  number_of_sessions?: number;
  results_duration?: string;
  body_areas_applicable?: string;
  skin_types_applicable?: string;
  patient_satisfaction_score?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface Company {
  id: number;
  name: string;
  description?: string;
  website?: string;
  website_url?: string;
  headquarters?: string;
  logo_url?: string;
  social_links?: any;
  founded_year?: number;
  ceo?: string;
  employee_count?: number;
  num_employees?: number;
  company_category_id?: number;
  dental_category_id?: number;
  aesthetic_category_id?: number;
  key_products?: string;
  specialties?: string[];
  products?: string[];
  market_share_pct?: number;
  market_size_2025_usd_billion?: number;
  projected_growth_pct?: number;
  revenue?: string;
  last_year_sales_usd_million?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  // State for procedures and companies
  const [dentalProcedures, setDentalProcedures] = useState<DentalProcedure[]>([]);
  const [aestheticProcedures, setAestheticProcedures] = useState<AestheticProcedure[]>([]);
  const [dentalCompanies, setDentalCompanies] = useState<Company[]>([]);
  const [aestheticCompanies, setAestheticCompanies] = useState<Company[]>([]);
  
  // State for categories
  const [dentalCategories, setDentalCategories] = useState<DentalCategory[]>([]);
  const [aestheticCategories, setAestheticCategories] = useState<AestheticCategory[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [companiesLoading, setCompaniesLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [selectedIndustry, setSelectedIndustry] = useState<'dental' | 'aesthetic'>('dental');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Pagination state for procedures
  const [dentalPage, setDentalPage] = useState(0);
  const [dentalRowsPerPage, setDentalRowsPerPage] = useState(10);
  const [aestheticPage, setAestheticPage] = useState(0);
  const [aestheticRowsPerPage, setAestheticRowsPerPage] = useState(10);
  
  // Pagination state for companies
  const [dentalCompanyPage, setDentalCompanyPage] = useState(0);
  const [dentalCompanyRowsPerPage, setDentalCompanyRowsPerPage] = useState(10);
  const [aestheticCompanyPage, setAestheticCompanyPage] = useState(0);
  const [aestheticCompanyRowsPerPage, setAestheticCompanyRowsPerPage] = useState(10);
  
  // Pagination state for categories
  const [dentalCategoryPage, setDentalCategoryPage] = useState(0);
  const [dentalCategoryRowsPerPage, setDentalCategoryRowsPerPage] = useState(5);
  const [aestheticCategoryPage, setAestheticCategoryPage] = useState(0);
  const [aestheticCategoryRowsPerPage, setAestheticCategoryRowsPerPage] = useState(5);

  // Fetch companies
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
      setError(`Failed to load companies: ${err.message}`);
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Fetch categories
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
      setError(`Failed to load categories: ${err.message}`);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try multiple possible table names with detailed error logging
        logger.info('Attempting to fetch dental procedures...');
        let dentalResponse = await supabase.from('dental_procedures').select('*');
        if (dentalResponse.error) {
          logger.info('Error with dental_procedures table, trying v_dental_procedures view...');
          dentalResponse = await supabase.from('v_dental_procedures').select('*');
          if (dentalResponse.error) {
            logger.info('Error with v_dental_procedures view, trying all_procedures with filtering...');
            dentalResponse = await supabase.from('all_procedures').select('*').eq('industry', 'dental');
          }
        }
        
        logger.info('Attempting to fetch aesthetic procedures...');
        let aestheticResponse = await supabase.from('aesthetic_procedures').select('*');
        if (aestheticResponse.error) {
          logger.info('Error with aesthetic_procedures table, trying v_aesthetic_procedures view...');
          aestheticResponse = await supabase.from('aesthetic_procedures_view').select('*');
          if (aestheticResponse.error) {
            logger.info('Error with aesthetic_procedures_view, trying all_procedures with filtering...');
            aestheticResponse = await supabase.from('all_procedures').select('*').eq('industry', 'aesthetic');
          }
        }
        
        if (dentalResponse.error) throw new Error(`Dental procedures: ${dentalResponse.error.message}`);
        if (aestheticResponse.error) throw new Error(`Aesthetic procedures: ${aestheticResponse.error.message}`);
        
        logger.info('Dental data:', { data: dentalResponse.data });
        logger.info('Aesthetic data:', { data: aestheticResponse.data });
        
        const dentalProcs = (dentalResponse.data || []).map(proc => ({
          ...proc,
          id: proc.id || Math.random(),
          name: proc.procedure_name || proc.name || proc.title || '',
          category: proc.category || proc.procedure_category || '',
          clinical_category: proc.clinical_category || proc.specialty || '',
          average_cost_usd: proc.average_cost_usd || proc.cost || proc.price || 0,
          yearly_growth_percentage: proc.yearly_growth_percentage || proc.growth_rate || 0,
          market_size_usd_millions: proc.market_size_usd_millions || 0
        }));
        
        const aestheticProcs = (aestheticResponse.data || []).map(proc => ({
          ...proc,
          id: proc.id || Math.random(),
          name: proc.procedure_name || proc.name || proc.title || '',
          category: proc.category || proc.procedure_category || '',
          average_cost_usd: proc.average_cost_usd || proc.cost || proc.cost_range || 0,
          yearly_growth_percentage: proc.yearly_growth_percentage || proc.trend_score || 0,
          market_size_usd_millions: proc.market_size_usd_millions || 0,
          downtime: proc.downtime || '',
          body_areas_applicable: proc.body_areas_applicable || proc.body_area || ''
        }));
        
        logger.info(`Loaded ${dentalProcs.length} dental procedures`);
        logger.info(`Loaded ${aestheticProcs.length} aesthetic procedures`);
        
        setDentalProcedures(dentalProcs);
        setAestheticProcedures(aestheticProcs);
        
        // Fetch companies and categories
        await fetchCompanies();
        await fetchCategories();
      } catch (e: any) {
        logger.error('Error fetching data:', e);
        setError(`Failed to load procedures: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Pagination handlers for procedures
  const handleDentalChangePage = (_: unknown,  newPage: number) => {
    setDentalPage(newPage);
  };

  const handleDentalChangeRowsPerPage = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setDentalRowsPerPage(parseInt(_event.target.value, 10));
    setDentalPage(0);
  };

  const handleAestheticChangePage = (_: unknown,  newPage: number) => {
    setAestheticPage(newPage);
  };

  const handleAestheticChangeRowsPerPage = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setAestheticRowsPerPage(parseInt(_event.target.value, 10));
    setAestheticPage(0);
  };

  // Pagination handlers for companies
  const handleDentalCompanyChangePage = (_: unknown,  newPage: number) => {
    setDentalCompanyPage(newPage);
  };

  const handleDentalCompanyChangeRowsPerPage = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setDentalCompanyRowsPerPage(parseInt(_event.target.value, 10));
    setDentalCompanyPage(0);
  };

  const handleAestheticCompanyChangePage = (_: unknown,  newPage: number) => {
    setAestheticCompanyPage(newPage);
  };

  const handleAestheticCompanyChangeRowsPerPage = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setAestheticCompanyRowsPerPage(parseInt(_event.target.value, 10));
    setAestheticCompanyPage(0);
  };

  // Pagination handlers for categories
  const handleDentalCategoryChangePage = (_: unknown,  newPage: number) => {
    setDentalCategoryPage(newPage);
  };

  const handleDentalCategoryChangeRowsPerPage = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setDentalCategoryRowsPerPage(parseInt(_event.target.value, 10));
    setDentalCategoryPage(0);
  };

  const handleAestheticCategoryChangePage = (_: unknown,  newPage: number) => {
    setAestheticCategoryPage(newPage);
  };

  const handleAestheticCategoryChangeRowsPerPage = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setAestheticCategoryRowsPerPage(parseInt(_event.target.value, 10));
    setAestheticCategoryPage(0);
  };

  // State for sorting
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'name',
    direction: 'asc'
  });

  // Handle category selection
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    // Reset pagination when changing category filter
    if (selectedIndustry === 'dental') {
      setDentalPage(0);
    } else {
      setAestheticPage(0);
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort procedures based on sort configuration
  const sortProcedures = (procedures: any[]) => {
    if (!sortConfig.field) return procedures;
    
    return [...procedures].sort((a,  b) => {
      let aValue = a[sortConfig.field];
      let bValue = b[sortConfig.field];
      
      // Handle nested fields
      if (sortConfig.field === 'category') {
        aValue = a.category || '';
        bValue = b.category || '';
      } else if (sortConfig.field === 'clinical_category') {
        aValue = a.clinical_category || '';
        bValue = b.clinical_category || '';
      } else if (sortConfig.field === 'market_size') {
        aValue = a.market_size_2025_usd_millions || 0;
        bValue = b.market_size_2025_usd_millions || 0;
      }
      
      // Convert to string if not already
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      // Handle numeric comparisons
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string comparisons
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (aString < bString) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aString > bString) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Safe rendering function for any field
  const safeRender = (value: any,  isPercent = false,  decimalPlaces = 1) => {
    if (value === null || value === undefined || value === '') return '-';
    if (isPercent) {
      const numValue = parseFloat(String(value));
      return isNaN(numValue) ? '-' : `${numValue.toFixed(decimalPlaces)}%`;
    }
    return String(value);
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading all procedures...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  // Calculate category distributions for visualization
  const calculateCategoryDistribution = (procedures: any[],  categories: any[]) => {
    // Create a map to count procedures by category
    const categoryMap = new Map<number, { count: number, name: string, marketSize: number }>();
    
    // Initialize with all categories
    categories.forEach(cat => {
      categoryMap.set(cat.id, { 
        count: 0, 
        name: cat.name, 
        marketSize: cat.market_size_usd_millions || 0 
      });
    });
    
    // Count procedures by category
    procedures.forEach(proc => {
      const catId = proc.category_id || proc.procedure_category_id;
      if (catId && categoryMap.has(catId)) {
        const current = categoryMap.get(catId)!;
        categoryMap.set(catId, { 
          ...current, 
          count: current.count + 1 
        });
      }
    });
    
    // Convert to array and sort by count (descending)
    return Array.from(categoryMap.entries())
      .map(([id,  data]) => ({ id, ...data }))
      .sort((a,  b) => b.count - a.count)
      .slice(0, 10); // Top 10 categories
  };
  
  // Memoize category distributions to avoid recalculation on every render
  const dentalCategoryDistribution = useMemo(() => 
    calculateCategoryDistribution(dentalProcedures, dentalCategories),
    [dentalProcedures, dentalCategories]
  );
  
  const aestheticCategoryDistribution = useMemo(() => 
    calculateCategoryDistribution(aestheticProcedures, aestheticCategories),
    [aestheticProcedures, aestheticCategories]
  );
  
  // Get the maximum count for scaling the visualization
  const maxDentalCount = dentalCategoryDistribution.length > 0 
    ? dentalCategoryDistribution[0].count 
    : 1;
    
  const maxAestheticCount = aestheticCategoryDistribution.length > 0 
    ? aestheticCategoryDistribution[0].count 
    : 1;
  
  // Filter procedures by selected category
  const filteredDentalProcedures = selectedCategory && selectedIndustry === 'dental'
    ? dentalProcedures.filter(p => p.category_id === selectedCategory || p.procedure_category_id === selectedCategory)
    : dentalProcedures;
    
  const filteredAestheticProcedures = selectedCategory && selectedIndustry === 'aesthetic'
    ? aestheticProcedures.filter(p => p.category_id === selectedCategory)
    : aestheticProcedures;
    
  // Sort the filtered procedures
  const sortedDentalProcedures = useMemo(() => 
    sortProcedures(filteredDentalProcedures),
    [filteredDentalProcedures, sortConfig]
  );

  const sortedAestheticProcedures = useMemo(() => 
    sortProcedures(filteredAestheticProcedures),
    [filteredAestheticProcedures, sortConfig]
  );

  // Get paginated records
  const paginatedDentalProcedures = sortedDentalProcedures.slice(
    dentalPage * dentalRowsPerPage,
    dentalPage * dentalRowsPerPage + dentalRowsPerPage
  );

  const paginatedAestheticProcedures = sortedAestheticProcedures.slice(
    aestheticPage * aestheticRowsPerPage,
    aestheticPage * aestheticRowsPerPage + aestheticRowsPerPage
  );
  
  // Helper component for sortable table headers
  const SortableTableHeader = ({ field,  children,  align = 'left' }: { field: string; children: React.ReactNode,  align?: 'left' | 'right' | 'center' }) => {
    const isActive = sortConfig.field === field;
    return (
      <TableCell 
        align={align as any}
        sx={{ 
          fontWeight: 'bold',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
        onClick={() => handleSort(field)}
      >
        <Box display="flex" alignItems="center" justifyContent={align === 'right' ? 'flex-end' : 'flex-start'}>
          {children}
          {isActive && (
            <span style={{ marginLeft: 4 }}>
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </Box>
      </TableCell>
    );
  };
  
  const paginatedDentalCategories = dentalCategories.slice(
    dentalCategoryPage * dentalCategoryRowsPerPage,
    dentalCategoryPage * dentalCategoryRowsPerPage + dentalCategoryRowsPerPage
  );
  
  const paginatedAestheticCategories = aestheticCategories.slice(
    aestheticCategoryPage * aestheticCategoryRowsPerPage,
    aestheticCategoryPage * aestheticCategoryRowsPerPage + aestheticCategoryRowsPerPage
  );

  const paginatedDentalCompanies = dentalCompanies.slice(
    dentalCompanyPage * dentalCompanyRowsPerPage,
    dentalCompanyPage * dentalCompanyRowsPerPage + dentalCompanyRowsPerPage
  );

  const paginatedAestheticCompanies = aestheticCompanies.slice(
    aestheticCompanyPage * aestheticCompanyRowsPerPage,
    aestheticCompanyPage * aestheticCompanyRowsPerPage + aestheticCompanyRowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold',  mb: 4 }}>
        Market Intelligence Dashboard
      </Typography>

      {/* Industry Toggle Switch */}
      <Box sx={{ display: 'flex',  justifyContent: 'center',  mb: 4 }}>
        <Card elevation={3} sx={{ px: 4,  py: 2,  borderRadius: 2 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: selectedIndustry === 'dental' ? 'bold' : 'normal', 
                  color: selectedIndustry === 'dental' ? '#2196f3' : 'text.secondary'
                }}
              >
                Dental
              </Typography>
            </Grid>
            <Grid item>
              <Switch
                checked={selectedIndustry === 'aesthetic'}
                onChange={(e) => setSelectedIndustry(e.target.checked ? 'aesthetic' : 'dental')}
                color="primary"
              />
            </Grid>
            <Grid item>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: selectedIndustry === 'aesthetic' ? 'bold' : 'normal',
                  color: selectedIndustry === 'aesthetic' ? '#f50057' : 'text.secondary'
                }}
              >
                Aesthetic
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Selected Category Summary - Only shown when a category is selected */}
      {selectedCategory && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card elevation={3} sx={{ bgcolor: selectedIndustry === 'dental' ? '#e3f2fd' : '#fce4ec' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedIndustry === 'dental' 
                    ? `Dental Category: ${dentalCategories.find(c => c.id === selectedCategory)?.name}` 
                    : `Aesthetic Category: ${aestheticCategories.find(c => c.id === selectedCategory)?.name}`}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Market Size</Typography>
                        <Typography variant="h5">
                          {selectedIndustry === 'dental' 
                            ? `$${(dentalCategories.find(c => c.id === selectedCategory)?.market_size_usd_millions || 0).toLocaleString()}M` 
                            : `$${(aestheticCategories.find(c => c.id === selectedCategory)?.market_size_usd_millions || 0).toLocaleString()}M`}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Growth Rate</Typography>
                        <Typography variant="h5">
                          {selectedIndustry === 'dental' 
                            ? `${(dentalCategories.find(c => c.id === selectedCategory)?.yearly_growth_percentage || 0).toFixed(1)}%` 
                            : `${(aestheticCategories.find(c => c.id === selectedCategory)?.yearly_growth_percentage || 0).toFixed(1)}%`}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Procedure Count</Typography>
                        <Typography variant="h5">
                          {selectedIndustry === 'dental' 
                            ? filteredDentalProcedures.length 
                            : filteredAestheticProcedures.length}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Category Distribution Visualization */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedIndustry === 'dental' ? 'Dental Category Distribution' : 'Aesthetic Category Distribution'}
              </Typography>
              {categoriesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {selectedIndustry === 'dental' ? (
                    dentalCategoryDistribution.length > 0 ? (
                      dentalCategoryDistribution.map((category) => (
                        <Box 
                          key={category.id} 
                          sx={{ 
                            mb: 1.5, 
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.9,
                              '& .MuiLinearProgress-root': {
                                boxShadow: '0 0 5px rgba(33, 150, 243, 0.5)'
                              }
                            }
                          }}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            // Scroll to procedures section
                            document.getElementById('procedures-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Tooltip title={`${category.count} procedures - Click to filter`}>
                              <Typography variant="body2" sx={{ fontWeight: selectedCategory === category.id ? 'bold' : 'normal' }}>
                                {category.name} 
                                {selectedCategory === category.id && (
                                  <Chip 
                                    size="small" 
                                    label="Selected" 
                                    color="primary" 
                                    sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} 
                                  />
                                )}
                              </Typography>
                            </Tooltip>
                            <Typography variant="body2" color="text.secondary">
                              {category.count} ({((category.count / dentalProcedures.length) * 100).toFixed(1)}%)
                            </Typography>
                          </Box>
                          <Tooltip title={`Market size: $${category.marketSize.toLocaleString()}M - Click to filter`}>
                            <LinearProgress 
                              variant="determinate" 
                              value={(category.count / maxDentalCount) * 100} 
                              sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                backgroundColor: '#e3f2fd',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: selectedCategory === category.id ? '#1565c0' : '#2196f3'
                                },
                                ...(selectedCategory === category.id && {
                                  boxShadow: '0 0 8px rgba(33, 150, 243, 0.7)'
                                })
                              }}
                            />
                          </Tooltip>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No dental categories data available
                      </Typography>
                    )
                  ) : (
                    aestheticCategoryDistribution.length > 0 ? (
                      aestheticCategoryDistribution.map((category) => (
                        <Box 
                          key={category.id} 
                          sx={{ 
                            mb: 1.5, 
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.9,
                              '& .MuiLinearProgress-root': {
                                boxShadow: '0 0 5px rgba(245, 0, 87, 0.5)'
                              }
                            }
                          }}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            // Scroll to procedures section
                            document.getElementById('procedures-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Tooltip title={`${category.count} procedures - Click to filter`}>
                              <Typography variant="body2" sx={{ fontWeight: selectedCategory === category.id ? 'bold' : 'normal' }}>
                                {category.name}
                                {selectedCategory === category.id && (
                                  <Chip 
                                    size="small" 
                                    label="Selected" 
                                    color="secondary" 
                                    sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} 
                                  />
                                )}
                              </Typography>
                            </Tooltip>
                            <Typography variant="body2" color="text.secondary">
                              {category.count} ({((category.count / aestheticProcedures.length) * 100).toFixed(1)}%)
                            </Typography>
                          </Box>
                          <Tooltip title={`Market size: $${category.marketSize.toLocaleString()}M - Click to filter`}>
                            <LinearProgress 
                              variant="determinate" 
                              value={(category.count / maxAestheticCount) * 100} 
                              sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                backgroundColor: '#fce4ec',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: selectedCategory === category.id ? '#c51162' : '#f50057'
                                },
                                ...(selectedCategory === category.id && {
                                  boxShadow: '0 0 8px rgba(245, 0, 87, 0.7)'
                                })
                              }}
                            />
                          </Tooltip>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No aesthetic categories data available
                      </Typography>
                    )
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Market Size Overview Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <MarketSizeOverview
            dentalProcedures={dentalProcedures}
            aestheticProcedures={aestheticProcedures}
            selectedIndustry={selectedIndustry}
          />
        </Grid>
      </Grid>
      
      {/* Categories Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedIndustry === 'dental' ? 'Dental Procedure Categories' : 'Aesthetic Procedure Categories'}
              </Typography>
              {categoriesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex',  flexWrap: 'wrap',  gap: 1,  mb: 2 }}>
                    {selectedIndustry === 'dental' ? 
                      paginatedDentalCategories.map((category) => (
                        <Chip 
                          key={category.id}
                          label={`${category.name} (${category.procedure_count || 0})`}
                          onClick={() => handleCategorySelect(category.id)}
                          color={selectedCategory === category.id ? "primary" : "default"}
                          variant={selectedCategory === category.id ? "filled" : "outlined"}
                          sx={{ m: 0.5 }}
                        />
                      )) : 
                      paginatedAestheticCategories.map((category) => (
                        <Chip 
                          key={category.id}
                          label={`${category.name} (${category.procedure_count || 0})`}
                          onClick={() => handleCategorySelect(category.id)}
                          color={selectedCategory === category.id ? "primary" : "default"}
                          variant={selectedCategory === category.id ? "filled" : "outlined"}
                          sx={{ m: 0.5 }}
                        />
                      ))
                    }
                    {selectedCategory && (
                      <Chip 
                        label="Clear Filter"
                        onClick={() => handleCategorySelect(null)}
                        color="secondary"
                        sx={{ m: 0.5 }}
                      />
                    )}
                  </Box>
                  <TablePagination
                    component="div"
                    count={selectedIndustry === 'dental' ? dentalCategories.length : aestheticCategories.length}
                    page={selectedIndustry === 'dental' ? dentalCategoryPage : aestheticCategoryPage}
                    onPageChange={selectedIndustry === 'dental' ? handleDentalCategoryChangePage : handleAestheticCategoryChangePage}
                    rowsPerPage={selectedIndustry === 'dental' ? dentalCategoryRowsPerPage : aestheticCategoryRowsPerPage}
                    onRowsPerPageChange={selectedIndustry === 'dental' ? handleDentalCategoryChangeRowsPerPage : handleAestheticCategoryChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Procedures Section */}
      <Grid container spacing={3} sx={{ mb: 4 }} id="procedures-section">
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedIndustry === 'dental' ? 'Dental Procedures' : 'Aesthetic Procedures'}
                {selectedCategory && selectedIndustry === 'dental' && (
                  <Typography variant="subtitle2" component="span" sx={{ ml: 1 }}>
                    (Filtered by: {dentalCategories.find(c => c.id === selectedCategory)?.name})
                  </Typography>
                )}
                {selectedCategory && selectedIndustry === 'aesthetic' && (
                  <Typography variant="subtitle2" component="span" sx={{ ml: 1 }}>
                    (Filtered by: {aestheticCategories.find(c => c.id === selectedCategory)?.name})
                  </Typography>
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedIndustry === 'dental' ? 
                  `${filteredDentalProcedures.length} procedures across ${dentalCategories.length} categories` : 
                  `${filteredAestheticProcedures.length} procedures across ${aestheticCategories.length} categories`
                }
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <SortableTableHeader field="name">Name</SortableTableHeader>
                      <SortableTableHeader field="category">Category</SortableTableHeader>
                      {selectedIndustry === 'dental' && (
                        <SortableTableHeader field="clinical_category">Clinical Category</SortableTableHeader>
                      )}
                      <SortableTableHeader field="average_cost_usd" align="right">Avg. Cost</SortableTableHeader>
                      <SortableTableHeader field="yearly_growth_percentage" align="right">Growth Rate</SortableTableHeader>
                      <SortableTableHeader field="market_size" align="right">Market Size</SortableTableHeader>
                      {selectedIndustry === 'dental' ? (
                        <>
                          <SortableTableHeader field="complexity">Complexity</SortableTableHeader>
                          <SortableTableHeader field="patient_satisfaction_score">Satisfaction</SortableTableHeader>
                        </>
                      ) : (
                        <>
                          <SortableTableHeader field="downtime">Downtime</SortableTableHeader>
                          <SortableTableHeader field="body_areas_applicable">Body Area</SortableTableHeader>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedIndustry === 'dental' ? (
                      paginatedDentalProcedures.map((procedure, _index) => (
                        <TableRow key={`dental-${procedure.id || _index}`} hover>
                          <TableCell>{safeRender(procedure.name)}</TableCell>
                          <TableCell>{safeRender(procedure.category)}</TableCell>
                          <TableCell>{safeRender(procedure.clinical_category)}</TableCell>
                          <TableCell align="right">
                            {procedure.average_cost_usd ? `$${procedure.average_cost_usd.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell align="right">{safeRender(procedure.yearly_growth_percentage, true)}</TableCell>
                          <TableCell align="right">
                            {procedure.market_size_2025_usd_millions 
                              ? `$${procedure.market_size_2025_usd_millions.toLocaleString()}M` 
                              : '-'}
                          </TableCell>
                          <TableCell>{safeRender(procedure.complexity)}</TableCell>
                          <TableCell>{safeRender(procedure.patient_satisfaction_score)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      paginatedAestheticProcedures.map((procedure, _index) => (
                        <TableRow key={`aesthetic-${procedure.id || _index}`} hover>
                          <TableCell>{safeRender(procedure.name)}</TableCell>
                          <TableCell>{safeRender(procedure.category)}</TableCell>
                          <TableCell align="right">
                            {procedure.average_cost_usd ? `$${procedure.average_cost_usd.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell align="right">{safeRender(procedure.yearly_growth_percentage, true)}</TableCell>
                          <TableCell align="right">
                            {procedure.market_size_2025_usd_millions 
                              ? `$${procedure.market_size_2025_usd_millions.toLocaleString()}M` 
                              : '-'}
                          </TableCell>
                          <TableCell>{safeRender(procedure.downtime)}</TableCell>
                          <TableCell>{safeRender(procedure.body_areas_applicable)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 20, 50, 100]}
                component="div"
                count={selectedIndustry === 'dental' ? filteredDentalProcedures.length : filteredAestheticProcedures.length}
                rowsPerPage={selectedIndustry === 'dental' ? dentalRowsPerPage : aestheticRowsPerPage}
                page={selectedIndustry === 'dental' ? dentalPage : aestheticPage}
                onPageChange={selectedIndustry === 'dental' ? handleDentalChangePage : handleAestheticChangePage}
                onRowsPerPageChange={selectedIndustry === 'dental' ? handleDentalChangeRowsPerPage : handleAestheticChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Companies Section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedIndustry === 'dental' ? 'Dental Companies' : 'Aesthetic Companies'}
              </Typography>
              {companiesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper} elevation={0}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Website</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Market Share</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(selectedIndustry === 'dental' ? paginatedDentalCompanies : paginatedAestheticCompanies)
                          .map((company, _index) => (
                            <TableRow key={`${selectedIndustry}-company-${company.id || _index}`} hover>
                              <TableCell>{company.name || 'N/A'}</TableCell>
                              <TableCell>{company.description || 'N/A'}</TableCell>
                              <TableCell>
                                {company.website ? (
                                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                                    {company.website}
                                  </a>
                                ) : 'N/A'}
                              </TableCell>
                              <TableCell>{safeRender(company.market_share_pct, true)}</TableCell>
                              <TableCell>{company.revenue || safeRender(company.last_year_sales_usd_million)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[10, 20, 40, 100]}
                    component="div"
                    count={selectedIndustry === 'dental' ? dentalCompanies.length : aestheticCompanies.length}
                    rowsPerPage={selectedIndustry === 'dental' ? dentalCompanyRowsPerPage : aestheticCompanyRowsPerPage}
                    page={selectedIndustry === 'dental' ? dentalCompanyPage : aestheticCompanyPage}
                    onPageChange={selectedIndustry === 'dental' ? handleDentalCompanyChangePage : handleAestheticCompanyChangePage}
                    onRowsPerPageChange={selectedIndustry === 'dental' ? handleDentalCompanyChangeRowsPerPage : handleAestheticCompanyChangeRowsPerPage}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};


Dashboard.displayName = 'Dashboard';export default Dashboard;
