import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import MarketSizeOverview from './MarketSizeOverview';
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
  LinearProgress,
  Tooltip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Divider,
  Alert,
  Button,
  Tabs,
  Tab,
  IconButton,
  Switch,
  useTheme,
  useMediaQuery as muiUseMediaQuery
} from '@mui/material';
import { supabase } from '../../services/supabaseClient';

// Utility function to format market size (millions/billions)
const formatMarketSize = (sizeInMillions: number | null | undefined): string => {
  if (sizeInMillions == null) return 'N/A';
  
  if (sizeInMillions >= 1000) {
    return `$${(sizeInMillions / 1000).toFixed(1)}B`;
  } else {
    return `$${sizeInMillions.toFixed(0)}M`;
  }
};

// Utility function to format growth rate
const formatGrowthRate = (rate: number | null | undefined): string => {
  if (rate == null) return 'N/A';
  return `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`;
};

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
  created_at?: string;
  updated_at?: string;
  procedure_count?: number;
  children?: CategoryType[];
  level?: number;
  isExpanded?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

function a11yProps(index: number) {
  return { id: `tab-${index}`, 'aria-controls': `tabpanel-${index}` };
}

const Dashboard: React.FC = () => {
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
  
  // Pagination for procedures
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Pagination for companies
  const [currentCompanyPage, setCurrentCompanyPage] = useState(0);
  const [companiesRowsPerPage, setCompaniesRowsPerPage] = useState(10);
  
  // Loading states
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [proceduresLoading, setProceduresLoading] = useState(true);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  
  // Derived states
  const theme = useTheme();
  const isMobile = muiUseMediaQuery(theme.breakpoints.down('md'));
  
  // Calculate current procedures based on selected industry and category
  const currentProcedures = useMemo(() => {
    const procedures = selectedIndustry === 'dental' ? dentalProcedures : aestheticProcedures;
    const filtered = selectedCategory
      ? procedures.filter(p => p.category_id === selectedCategory)
      : procedures;
    
    // Sort by name for consistent ordering
    return [...filtered].sort((a, b) => 
      (a.name || a.procedure_name || '').localeCompare(b.name || b.procedure_name || '')
    );
  }, [selectedIndustry, selectedCategory, dentalProcedures, aestheticProcedures]);
  
  // Calculate current companies based on selected industry
  const currentCompanies = useMemo(() => {
    return selectedIndustry === 'dental' ? dentalCompanies : aestheticCompanies;
  }, [selectedIndustry, dentalCompanies, aestheticCompanies]);
  
  // Calculate current categories based on selected industry
  const currentCategories = useMemo(() => {
    return selectedIndustry === 'dental' ? dentalCategories : aestheticCategories;
  }, [selectedIndustry, dentalCategories, aestheticCategories]);
  
  // Calculate procedure counts for categories
  const categoriesWithCounts = useMemo(() => {
    const procedures = selectedIndustry === 'dental' ? dentalProcedures : aestheticProcedures;
    const categories = selectedIndustry === 'dental' ? dentalCategories : aestheticCategories;
    
    return categories.map(category => ({
      ...category,
      procedure_count: procedures.filter(p => p.category_id === category.id).length
    }));
  }, [selectedIndustry, dentalCategories, aestheticCategories, dentalProcedures, aestheticProcedures]);
  
  // Event handlers
  const handleIndustryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIndustry(event.target.checked ? 'aesthetic' : 'dental');
    setSelectedCategory(null);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleCompanyPageChange = (event: unknown, newPage: number) => {
    setCurrentCompanyPage(newPage);
  };

  const handleCompanyRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompaniesRowsPerPage(parseInt(event.target.value, 10));
    setCurrentCompanyPage(0);
  };

  // Fetch companies data
  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      const { data: dentalData, error: dentalError } = await supabase
        .from('dental_companies')
        .select('*')
        .order('name', { ascending: true });
      
      console.log('Dental companies response:', { count: dentalData?.length || 0, data: dentalData, error: dentalError });
      
      if (dentalError) throw dentalError;
      setDentalCompanies(dentalData || []);

      const { data: aestheticData, error: aestheticError } = await supabase
        .from('aesthetic_companies')
        .select('*')
        .order('name', { ascending: true });
      
      console.log('Aesthetic companies response:', { count: aestheticData?.length || 0, data: aestheticData, error: aestheticError });
      
      if (aestheticError) throw aestheticError;
      setAestheticCompanies(aestheticData || []);
    } catch (err: any) {
      console.error('Companies fetch error:', err);
      setError(`Failed to load companies: ${err.message}`);
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Fetch categories data
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const { data: dentalCatData, error: dentalCatError } = await supabase
        .from('dental_procedure_categories')
        .select('*')
        .order('name', { ascending: true });
      
      console.log('Dental categories response:', { count: dentalCatData?.length || 0, data: dentalCatData, error: dentalCatError });
      
      if (dentalCatError) throw dentalCatError;
      setDentalCategories(dentalCatData || []);

      const { data: aestheticCatData, error: aestheticCatError } = await supabase
        .from('aesthetic_categories')
        .select('*')
        .order('name', { ascending: true });
      
      console.log('Aesthetic categories response:', { count: aestheticCatData?.length || 0, data: aestheticCatData, error: aestheticCatError });
      
      if (aestheticCatError) throw aestheticCatError;
      setAestheticCategories(aestheticCatData || []);
    } catch (err: any) {
      console.error('Categories fetch error:', err);
      setError(`Failed to load categories: ${err.message}`);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch procedures data
  const fetchProcedures = async () => {
    setProceduresLoading(true);
    try {
      const { data: dentalData, error: dentalError } = await supabase
        .from('dental_procedures')
        .select('*')
        .order('name', { ascending: true });
      
      console.log('Dental procedures response:', { count: dentalData?.length || 0, data: dentalData, error: dentalError });
      
      if (dentalError) throw dentalError;
      setDentalProcedures(dentalData || []);

      const { data: aestheticData, error: aestheticError } = await supabase
        .from('aesthetic_procedures')
        .select('*')
        .order('name', { ascending: true });
      
      console.log('Aesthetic procedures response:', { count: aestheticData?.length || 0, data: aestheticData, error: aestheticError });
      
      if (aestheticError) throw aestheticError;
      setAestheticProcedures(aestheticData || []);
    } catch (err: any) {
      console.error('Procedures fetch error:', err);
      setError(`Failed to load procedures: ${err.message}`);
    } finally {
      setProceduresLoading(false);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting data fetch...');
        await Promise.all([
          fetchProcedures(),
          fetchCategories(),
          fetchCompanies()
        ]);
        console.log('Data fetch completed', {
          dentalProcedures: dentalProcedures.length,
          aestheticProcedures: aestheticProcedures.length,
          dentalCategories: dentalCategories.length,
          aestheticCategories: aestheticCategories.length,
          dentalCompanies: dentalCompanies.length,
          aestheticCompanies: aestheticCompanies.length
        });
      } catch (err: any) {
        console.error('Data fetch error:', err);
        setError(`Failed to load data: ${err.message}`);
      }
    };

    fetchData();
  }, []);

  // Filter procedures based on selected category
  const filteredProcedures = useMemo(() => {
    if (selectedIndustry === 'dental') {
      return selectedCategory
        ? dentalProcedures.filter(p => 
            p.category_id === selectedCategory || 
            p.procedure_category_id === selectedCategory
          )
        : dentalProcedures;
    } else {
      return selectedCategory
        ? aestheticProcedures.filter(p => p.category_id === selectedCategory)
        : aestheticProcedures;
    }
  }, [selectedIndustry, selectedCategory, dentalProcedures, aestheticProcedures]);

  // Get paginated records
  const paginatedProcedures = useMemo(() => 
    filteredProcedures.slice(
      currentPage * rowsPerPage,
      (currentPage + 1) * rowsPerPage
    ),
    [filteredProcedures, currentPage, rowsPerPage]
  );

  const paginatedCompanies = useMemo(() => 
    currentCompanies.slice(
      currentCompanyPage * companiesRowsPerPage,
      (currentCompanyPage + 1) * companiesRowsPerPage
    ),
    [currentCompanies, currentCompanyPage, companiesRowsPerPage]
  );

  // Loading state
  if (proceduresLoading || categoriesLoading || companiesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading data...</Typography>
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

  // Main render
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ 
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
          Market Intelligence Dashboard
        </Typography>

        {/* Industry Toggle Switch */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Select Industry</FormLabel>
            <RadioGroup
              row
              aria-label="industry"
              name="industry"
              value={selectedIndustry}
              onChange={handleIndustryChange}
            >
              <FormControlLabel value="dental" control={<Radio />} label="Dental" />
              <FormControlLabel value="aesthetic" control={<Radio />} label="Aesthetic" />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* Categories Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedIndustry === 'dental' ? 'Dental Procedure Categories' : 'Aesthetic Procedure Categories'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {currentCategories.map((category) => (
                    <Chip 
                      key={category.id}
                      label={`${category.name} (${category.procedure_count || 0})`}
                      onClick={() => handleCategorySelect(category.id)}
                      color={selectedCategory === category.id ? 'primary' : 'default'}
                      variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                  {selectedCategory && (
                    <Chip 
                      label="Clear Filter"
                      onClick={() => handleCategorySelect(null)}
                      color="secondary"
                      variant="outlined"
                      sx={{ m: 0.5 }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Procedures Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedIndustry === 'dental' ? 'Dental Procedures' : 'Aesthetic Procedures'}
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Average Cost</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Growth Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentProcedures.length > 0 ? (
                        currentProcedures.map((procedure, index) => (
                          <TableRow key={`${selectedIndustry}-${procedure.id || index}`} hover>
                            <TableCell>{procedure.name || procedure.procedure_name || 'N/A'}</TableCell>
                            <TableCell>
                              {procedure.description && procedure.description.length > 100 
                                ? `${procedure.description.substring(0, 100)}...`
                                : procedure.description || 'N/A'}
                            </TableCell>
                            <TableCell>{procedure.category || 'N/A'}</TableCell>
                            <TableCell>
                              {procedure.average_cost_usd !== undefined 
                                ? `$${Number(procedure.average_cost_usd).toLocaleString()}` 
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {procedure.yearly_growth_percentage !== undefined 
                                ? `${procedure.yearly_growth_percentage}%` 
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body1" color="error" sx={{ py: 2 }}>
                              No {selectedIndustry} procedures found. Please check console for errors.
                            </Typography>
                            <Button 
                              variant="contained" 
                              color="primary" 
                              onClick={() => window.location.reload()}
                              sx={{ mt: 1 }}
                            >
                              Reload Dashboard
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={currentProcedures.length}
                  page={currentPage}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Companies Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedIndustry === 'dental' ? 'Dental Companies' : 'Aesthetic Companies'}
                </Typography>
                {companiesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <CircularProgress size={40} thickness={4} />
                    <Typography variant="body1" sx={{ ml: 2 }}>Loading {selectedIndustry} companies...</Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Website</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedCompanies.map((company: Company, index: number) => (
                            <TableRow key={`${selectedIndustry}-${company.id || index}`} hover>
                              <TableCell>{company.name || 'N/A'}</TableCell>
                              <TableCell>{company.description || 'N/A'}</TableCell>
                              <TableCell>
                                {company.website ? (
                                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                                    {company.website.replace(/^https?:\/\//i, '')}
                                  </a>
                                ) : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      component="div"
                      count={currentCompanies.length}
                      page={currentCompanyPage}
                      onPageChange={handleCompanyPageChange}
                      rowsPerPage={companiesRowsPerPage}
                      onRowsPerPageChange={handleCompanyRowsPerPageChange}
                      rowsPerPageOptions={[5, 10, 25]}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
