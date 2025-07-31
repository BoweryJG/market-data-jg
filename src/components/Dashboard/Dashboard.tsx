import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';

import ProcedureDetailsModal from './ProcedureDetailsModal';
import CompanyDetailsModal from './CompanyDetailsModal';
import { logger } from '../../services/logging/logger';
import { handleUnknownError } from '../../types/errors';
import { SocialLinks } from '../../types/common';
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
import { 
  Info as InfoIcon,
  OpenInNew as OpenInNewIcon 
} from '@mui/icons-material';
import { supabase } from '../../services/supabaseClient';
import { getErrorMessage } from '../../utils/errorUtils';

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
  cpt_cdt_code?: string;
  // Additional dental procedure fields
  market_maturity_stage?: 'Emerging' | 'Growth' | 'Expansion' | 'Mature' | 'Saturated';
  insurance_coverage?: 'full' | 'partial' | 'none';
  regulatory_status?: 'approved' | 'pending' | 'experimental';
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
  // Additional aesthetic procedure fields
  market_maturity_stage?: 'Emerging' | 'Growth' | 'Expansion' | 'Mature' | 'Saturated';
  treatment_area?: string;
  certification_required?: boolean;
}

interface Company {
  id: number;
  name: string;
  description?: string;
  website?: string;
  website_url?: string;
  headquarters?: string;
  logo_url?: string;
  social_links?: SocialLinks;
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
  // Company-specific additional fields
  industry?: 'dental' | 'aesthetic' | 'both';
  ticker_symbol?: string;
  public_company?: boolean;
  annual_revenue_usd?: number;
  founding_location?: string;
  current_valuation_usd?: number;
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

const TabPanel: React.FC<TabPanelProps> = ({ children,  value,  index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

TabPanel.displayName = 'TabPanel';

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
  
  // Modal states
  const [selectedProcedure, setSelectedProcedure] = useState<DentalProcedure | AestheticProcedure | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [procedureModalOpen, setProcedureModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  
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
    return [...filtered].sort((a,  b) => 
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
  const handleIndustryChange = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIndustry(_event.target.checked ? 'aesthetic' : 'dental');
    setSelectedCategory(null);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleChangePage = (_event: unknown,  newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(_event.target.value, 10));
    setCurrentPage(0);
  };

  const handleCompanyPageChange = (_event: unknown,  newPage: number) => {
    setCurrentCompanyPage(newPage);
  };

  const handleCompanyRowsPerPageChange = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setCompaniesRowsPerPage(parseInt(_event.target.value, 10));
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
      
      logger.debug('Dental companies response received', { count: dentalData?.length || 0, hasError: !!dentalError });
      
      if (dentalError) throw dentalError;
      setDentalCompanies(dentalData || []);

      const { data: aestheticData, error: aestheticError } = await supabase
        .from('aesthetic_companies')
        .select('*')
        .order('name', { ascending: true });
      
      logger.debug('Aesthetic companies response received', { count: aestheticData?.length || 0, hasError: !!aestheticError });
      
      if (aestheticError) throw aestheticError;
      setAestheticCompanies(aestheticData || []);
    } catch (err: unknown) {
      const error = handleUnknownError(err);
      logger.error('Companies fetch error', { error: getErrorMessage(err) });
      setError(`Failed to load companies: ${getErrorMessage(err)}`);
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
      
      logger.debug('Dental categories response received', { count: dentalCatData?.length || 0, hasError: !!dentalCatError });
      
      if (dentalCatError) throw dentalCatError;
      setDentalCategories(dentalCatData || []);

      const { data: aestheticCatData, error: aestheticCatError } = await supabase
        .from('aesthetic_categories')
        .select('*')
        .order('name', { ascending: true });
      
      logger.debug('Aesthetic categories response received', { count: aestheticCatData?.length || 0, hasError: !!aestheticCatError });
      
      if (aestheticCatError) throw aestheticCatError;
      setAestheticCategories(aestheticCatData || []);
    } catch (err: unknown) {
      const error = handleUnknownError(err);
      logger.error('Categories fetch error', { error: getErrorMessage(err) });
      setError(`Failed to load categories: ${getErrorMessage(err)}`);
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
      
      logger.debug('Dental procedures response received', { count: dentalData?.length || 0, hasError: !!dentalError });
      
      if (dentalError) throw dentalError;
      setDentalProcedures(dentalData || []);

      const { data: aestheticData, error: aestheticError } = await supabase
        .from('aesthetic_procedures')
        .select('*')
        .order('name', { ascending: true });
      
      logger.debug('Aesthetic procedures response received', { count: aestheticData?.length || 0, hasError: !!aestheticError });
      
      if (aestheticError) throw aestheticError;
      setAestheticProcedures(aestheticData || []);
    } catch (err: unknown) {
      const error = handleUnknownError(err);
      logger.error('Procedures fetch error', { error: getErrorMessage(err) });
      setError(`Failed to load procedures: ${getErrorMessage(err)}`);
    } finally {
      setProceduresLoading(false);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        logger.debug('Starting data fetch');
        await Promise.all([
          fetchProcedures(),
          fetchCategories(),
          fetchCompanies()
        ]);
        logger.info('Data fetch completed', {
          dentalProcedures: dentalProcedures.length,
          aestheticProcedures: aestheticProcedures.length,
          dentalCategories: dentalCategories.length,
          aestheticCategories: aestheticCategories.length,
          dentalCompanies: dentalCompanies.length,
          aestheticCompanies: aestheticCompanies.length
        });
      } catch (err: unknown) {
      const error = handleUnknownError(err);
        logger.error('Data fetch error', { error: getErrorMessage(err) });
        setError(`Failed to load data: ${getErrorMessage(err)}`);
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
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold',  mb: 4 }}>
          Market Intelligence Dashboard
        </Typography>

        {/* Industry Toggle Switch */}
        <Box sx={{ display: 'flex',  justifyContent: 'center',  mb: 4 }}>
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
                <Box sx={{ display: 'flex',  flexWrap: 'wrap',  gap: 1,  mb: 2 }}>
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
                        {selectedIndustry === 'dental' && (
                          <TableCell sx={{ fontWeight: 'bold' }}>CDT Code</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentProcedures.length > 0 ? (
                        currentProcedures.map((procedure, _index) => (
                          <TableRow 
                            key={`${selectedIndustry}-${procedure.id || _index}`} 
                            hover
                            onClick={() => {
                              setSelectedProcedure(procedure);
                              setProcedureModalOpen(true);
                            }}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {procedure.name || procedure.procedure_name || 'N/A'}
                                <IconButton size="small" color="primary">
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
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
                            {selectedIndustry === 'dental' && (
                              <TableCell>{'cpt_cdt_code' in procedure ? procedure.cpt_cdt_code || 'N/A' : 'N/A'}</TableCell>
                            )}
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
                            <TableRow 
                              key={`${selectedIndustry}-${company.id || index}`} 
                              hover
                              onClick={() => {
                                setSelectedCompany(company);
                                setCompanyModalOpen(true);
                              }}
                              sx={{ cursor: 'pointer' }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {company.name || 'N/A'}
                                  <IconButton size="small" color="secondary">
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                              <TableCell>{company.description || 'N/A'}</TableCell>
                              <TableCell>
                                {company.website ? (
                                  <a 
                                    href={company.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
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
    </Container>
  );
};

Dashboard.displayName = 'Dashboard';

export default Dashboard;
