import React, { useState, useEffect, useMemo } from 'react';
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
import { DentalCategory, AestheticCategory, CategoryHierarchy, DentalProcedure as DentalProcedureType, AestheticProcedure as AestheticProcedureType, Company as CompanyType } from '../../types';
import CategoryHierarchyView from './CategoryHierarchyView';
import { logger } from '../../services/logging/logger';


const Dashboard: React.FC = () => {
  // State for procedures and companies
  const [dentalProcedures, setDentalProcedures] = useState<DentalProcedureType[]>([]);
  const [aestheticProcedures, setAestheticProcedures] = useState<AestheticProcedureType[]>([]);
  const [dentalCompanies, setDentalCompanies] = useState<CompanyType[]>([]);
  const [aestheticCompanies, setAestheticCompanies] = useState<CompanyType[]>([]);
  
  // State for categories - both legacy and new hierarchical system
  const [dentalCategories, setDentalCategories] = useState<DentalCategory[]>([]);
  const [aestheticCategories, setAestheticCategories] = useState<AestheticCategory[]>([]);
  
  // New hierarchical category system
  const [categoryHierarchy, setCategoryHierarchy] = useState<CategoryHierarchy[]>([]);
  
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

  // Fetch categories from the new hierarchical system
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      // Fetch the complete category hierarchy
      const { data: hierarchyData, error: hierarchyError } = await supabase
        .from('category_hierarchy')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (hierarchyError) throw hierarchyError;
      logger.info('Category hierarchy response:', { 
        count: hierarchyData?.length || 0, 
        data: hierarchyData 
      });
      
      setCategoryHierarchy(hierarchyData || []);
      
      // Process the hierarchy data to also populate the legacy category states
      // This ensures backward compatibility with existing code
      const dentalCats = hierarchyData
        ?.filter(cat => cat.applicable_to === 'dental' || cat.applicable_to === 'both')
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          market_size_usd_millions: cat.market_size_usd_millions,
          avg_growth_rate: cat.avg_growth_rate
        })) || [];
      
      const aestheticCats = hierarchyData
        ?.filter(cat => cat.applicable_to === 'aesthetic' || cat.applicable_to === 'both')
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          market_size_usd_millions: cat.market_size_usd_millions,
          avg_growth_rate: cat.avg_growth_rate
        })) || [];
      
      setDentalCategories(dentalCats);
      setAestheticCategories(aestheticCats);
      
    } catch (err: any) {
      logger.error('Categories fetch error:', err);
      
      // Fallback to legacy category tables if the new system fails
      try {
        logger.info('Falling back to legacy category tables...');
        
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
        
      } catch (fallbackErr: any) {
        setError(`Failed to load categories: ${fallbackErr.message}`);
      }
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
          yearly_growth_percentage: proc.yearly_growth_percentage || proc.growth_rate || 0
        }));
        
        const aestheticProcs = (aestheticResponse.data || []).map(proc => ({
          ...proc,
          id: proc.id || Math.random(),
          name: proc.procedure_name || proc.name || proc.title || '',
          category: proc.category || proc.procedure_category || '',
          average_cost_usd: proc.average_cost_usd || proc.cost || proc.cost_range || 0,
          yearly_growth_percentage: proc.yearly_growth_percentage || proc.trend_score || 0,
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
    return Array.from(categoryMap.values())
      .sort((a,  b) => b.count - a.count)
      .map(item => ({
        ...item,
        marketSizeFormatted: item.marketSize ? `$${item.marketSize}M` : 'N/A'
      }));
  };

  // Get filtered procedures based on selected category
  const filteredDentalProcedures = useMemo(() => {
    if (!selectedCategory) return dentalProcedures;
    return dentalProcedures.filter(proc => 
      proc.category_id === selectedCategory || 
      proc.procedure_category_id === selectedCategory
    );
  }, [dentalProcedures, selectedCategory]);

  const filteredAestheticProcedures = useMemo(() => {
    if (!selectedCategory) return aestheticProcedures;
    return aestheticProcedures.filter(proc => 
      proc.category_id === selectedCategory || 
      proc.procedure_category_id === selectedCategory
    );
  }, [aestheticProcedures, selectedCategory]);

  // Calculate current page data
  const currentDentalProcedures = filteredDentalProcedures.slice(
    dentalPage * dentalRowsPerPage,
    dentalPage * dentalRowsPerPage + dentalRowsPerPage
  );

  const currentAestheticProcedures = filteredAestheticProcedures.slice(
    aestheticPage * aestheticRowsPerPage,
    aestheticPage * aestheticRowsPerPage + aestheticRowsPerPage
  );

  // Calculate current companies page data
  const currentDentalCompanies = dentalCompanies.slice(
    dentalCompanyPage * dentalCompanyRowsPerPage,
    dentalCompanyPage * dentalCompanyRowsPerPage + dentalCompanyRowsPerPage
  );

  const currentAestheticCompanies = aestheticCompanies.slice(
    aestheticCompanyPage * aestheticCompanyRowsPerPage,
    aestheticCompanyPage * aestheticCompanyRowsPerPage + aestheticCompanyRowsPerPage
  );
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4,  mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        {selectedIndustry === 'dental' ? 'Dental' : 'Aesthetic'} Procedures Dashboard
      </Typography>
      
      <Box sx={{ mb: 3,  display: 'flex',  alignItems: 'center' }}>
        <Typography component="span" sx={{ mr: 1 }}>Dental</Typography>
        <Switch
          checked={selectedIndustry === 'aesthetic'}
          onChange={(e) => {
            setSelectedIndustry(e.target.checked ? 'aesthetic' : 'dental');
            setSelectedCategory(null);
          }}
          color="primary"
        />
        <Typography component="span" sx={{ ml: 1 }}>Aesthetic</Typography>
      </Box>
      
      {/* Main content grid */}
      <Grid container spacing={3}>
        {/* Left sidebar with categories hierarchy */}
        <Grid item xs={12} md={3}>
          <CategoryHierarchyView
            categories={categoryHierarchy}
            selectedIndustry={selectedIndustry}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            loading={categoriesLoading}
            industry={selectedIndustry} // Added missing industry prop
          />
        </Grid>
        
        {/* Main content area */}
        <Grid item xs={12} md={9}>
          {/* Procedures section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  {selectedIndustry === 'dental' ? 'Dental' : 'Aesthetic'} Procedures
                  {selectedCategory && 
                    ` - ${selectedIndustry === 'dental' 
                      ? dentalCategories.find(c => c.id === selectedCategory)?.name 
                      : aestheticCategories.find(c => c.id === selectedCategory)?.name
                    }`
                  }
                </Typography>
                
                {selectedCategory && (
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => setSelectedCategory(null)}
                  >
                    Clear Filter
                  </Button>
                )}
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Procedure Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Avg. Cost</TableCell>
                      <TableCell align="right">Growth %</TableCell>
                      {selectedIndustry === 'aesthetic' && (
                        <TableCell>Downtime</TableCell>
                      )}
                      {selectedIndustry === 'dental' && (
                        <TableCell>Clinical Category</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedIndustry === 'dental' ? currentDentalProcedures : currentAestheticProcedures).map((proc) => (
                      <TableRow key={proc.id}>
                        <TableCell>
                          <Tooltip title={proc.description || 'No description available'}>
                            <Typography variant="body2">{proc.name}</Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{proc.category}</TableCell>
                        <TableCell align="right">
                          {typeof proc.average_cost_usd === 'number' 
                            ? `$${proc.average_cost_usd.toLocaleString()}`
                            : safeRender(proc.average_cost_usd)
                          }
                        </TableCell>
                        <TableCell align="right">
                          {safeRender(proc.yearly_growth_percentage, true)}
                        </TableCell>
                        {selectedIndustry === 'aesthetic' && (
                          <TableCell>{(proc as any).downtime || '-'}</TableCell>
                        )}
                        {selectedIndustry === 'dental' && (
                          <TableCell>{(proc as any).clinical_category || '-'}</TableCell>
                        )}
                      </TableRow>
                    ))}
                    
                    {(selectedIndustry === 'dental' ? !currentDentalProcedures.length : !currentAestheticProcedures.length) && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No procedures found
                            {selectedCategory ? ' for the selected category' : ''}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={selectedIndustry === 'dental' 
                  ? filteredDentalProcedures.length 
                  : filteredAestheticProcedures.length
                }
                rowsPerPage={selectedIndustry === 'dental' ? dentalRowsPerPage : aestheticRowsPerPage}
                page={selectedIndustry === 'dental' ? dentalPage : aestheticPage}
                onPageChange={selectedIndustry === 'dental' ? handleDentalChangePage : handleAestheticChangePage}
                onRowsPerPageChange={selectedIndustry === 'dental' 
                  ? handleDentalChangeRowsPerPage 
                  : handleAestheticChangeRowsPerPage
                }
              />
            </CardContent>
          </Card>
          
          {/* Companies section */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                {selectedIndustry === 'dental' ? 'Dental' : 'Aesthetic'} Companies
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Company Name</TableCell>
                      <TableCell>Headquarters</TableCell>
                      <TableCell align="right">Market Share %</TableCell>
                      <TableCell align="right">Sales ($M)</TableCell>
                      <TableCell align="right">Growth %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedIndustry === 'dental' ? currentDentalCompanies : currentAestheticCompanies).map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <Tooltip title={company.description || 'No description available'}>
                            <Typography variant="body2">{company.name}</Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{company.headquarters || '-'}</TableCell>
                        <TableCell align="right">{safeRender(company.market_share_pct, true)}</TableCell>
                        <TableCell align="right">
                          {company.last_year_sales_usd_million 
                            ? `$${company.last_year_sales_usd_million.toLocaleString()}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell align="right">
                          {safeRender(company.projected_growth_pct, true)}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {(selectedIndustry === 'dental' ? !currentDentalCompanies.length : !currentAestheticCompanies.length) && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No companies found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={selectedIndustry === 'dental' 
                  ? dentalCompanies.length 
                  : aestheticCompanies.length
                }
                rowsPerPage={selectedIndustry === 'dental' 
                  ? dentalCompanyRowsPerPage 
                  : aestheticCompanyRowsPerPage
                }
                page={selectedIndustry === 'dental' ? dentalCompanyPage : aestheticCompanyPage}
                onPageChange={selectedIndustry === 'dental' 
                  ? handleDentalCompanyChangePage 
                  : handleAestheticCompanyChangePage
                }
                onRowsPerPageChange={selectedIndustry === 'dental' 
                  ? handleDentalCompanyChangeRowsPerPage 
                  : handleAestheticCompanyChangeRowsPerPage
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};


Dashboard.displayName = 'Dashboard';export default Dashboard;
