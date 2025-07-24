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
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PublicIcon from '@mui/icons-material/Public';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { supabase } from '../../services/supabaseClient';
import { DentalCategory, AestheticCategory, CategoryHierarchy } from '../../types';
import CategoryHierarchyView from './CategoryHierarchyView';
import MarketSizeOverview, { formatMarketSize } from './MarketSizeOverview';
import ProcedureDetailsModal from './ProcedureDetailsModal';

const Dashboard: React.FC = () => {
  // State for procedures and companies
  const [dentalProcedures, setDentalProcedures] = useState<any[]>([]);
  const [aestheticProcedures, setAestheticProcedures] = useState<any[]>([]);
  const [dentalCompanies, setDentalCompanies] = useState<any[]>([]);
  const [aestheticCompanies, setAestheticCompanies] = useState<any[]>([]);
  
  // State for categories - both legacy and new hierarchical system
  const [dentalCategories, setDentalCategories] = useState<DentalCategory[]>([]);
  const [aestheticCategories, setAestheticCategories] = useState<AestheticCategory[]>([]);
  const [categoryHierarchy, setCategoryHierarchy] = useState<CategoryHierarchy[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [companiesLoading, setCompaniesLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [selectedIndustry, setSelectedIndustry] = useState<'dental' | 'aesthetic'>('dental');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<any | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Sorting state
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('name');
  
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

  // Map from category names to hierarchy IDs
  // IMPORTANT: Define all useMemo hooks at the component level, not conditionally
  const dentalCategoryMap = useMemo(() => ({
    'Diagnostic': 1,
    'Preventive': 2,
    'Restorative': 3,
    'Cosmetic': 4,
    'Oral Surgery': 5,
    'Endodontic': 6,
    'Periodontic': 7,
    'Prosthodontic': 8,
    'Orthodontic': 9,
    'Implantology': 10,
    'Sleep Dentistry': 2,
    'Pediatric': 2,
    'Adjunctive': 11
  }), []);

  const aestheticCategoryMap = useMemo(() => ({
    'Facial Aesthetic': 12,
    'Injectables': 13,
    'Body': 14,
    'Skin': 15,
    'Hair': 16,
    'Minimally Invasive': 17,
    'Regenerative': 18,
    'Lasers': 19,
    'Combination': 20,
    'Tech-Enhanced': 17,
    'Face': 12,
    'Breast Procedures': 14
  }), []);

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
      console.log('Category hierarchy response:', { 
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
      console.error('Categories fetch error:', err);
      setError(`Failed to load categories: ${err.message}`);
    } finally {
      setCategoriesLoading(false);
    }
  };

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

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try multiple possible table names with detailed error logging
        console.log('Attempting to fetch dental procedures...');
        let dentalResponse = await supabase.from('dental_procedures').select('*');
        if (dentalResponse.error) {
          console.log('Error with dental_procedures table, trying v_dental_procedures view...');
          dentalResponse = await supabase.from('v_dental_procedures').select('*');
          if (dentalResponse.error) {
            console.log('Error with v_dental_procedures view, trying all_procedures with filtering...');
            dentalResponse = await supabase.from('all_procedures').select('*').eq('industry', 'dental');
          }
        }
        
        console.log('Attempting to fetch aesthetic procedures...');
        let aestheticResponse = await supabase.from('aesthetic_procedures').select('*');
        if (aestheticResponse.error) {
          console.log('Error with aesthetic_procedures table, trying v_aesthetic_procedures view...');
          aestheticResponse = await supabase.from('aesthetic_procedures_view').select('*');
          if (aestheticResponse.error) {
            console.log('Error with aesthetic_procedures_view, trying all_procedures with filtering...');
            aestheticResponse = await supabase.from('all_procedures').select('*').eq('industry', 'aesthetic');
          }
        }
        
        if (dentalResponse.error) throw new Error(`Dental procedures: ${dentalResponse.error.message}`);
        if (aestheticResponse.error) throw new Error(`Aesthetic procedures: ${aestheticResponse.error.message}`);
        
        console.log('Dental data:', dentalResponse.data);
        console.log('Aesthetic data:', aestheticResponse.data);
        
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
        
        console.log(`Loaded ${dentalProcs.length} dental procedures`);
        console.log(`Loaded ${aestheticProcs.length} aesthetic procedures`);
        
        setDentalProcedures(dentalProcs);
        setAestheticProcedures(aestheticProcs);
        
        // Fetch companies and categories
        await fetchCompanies();
        await fetchCategories();
      } catch (e: any) {
        console.error('Error fetching data:', e);
        setError(`Failed to load procedures: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Function to map procedure category to hierarchy ID
  const mapCategoryToHierarchy = (categoryName: string, industry: 'dental' | 'aesthetic'): number | null => {
    if (!categoryName) return null;
    
    const categoryMap = industry === 'dental' ? dentalCategoryMap : aestheticCategoryMap;
    return categoryMap[categoryName as keyof typeof categoryMap] || null;
  };

  // Pagination handlers for procedures
  const handleDentalChangePage = (_: unknown, newPage: number) => {
    setDentalPage(newPage);
  };

  const handleDentalChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDentalRowsPerPage(parseInt(event.target.value, 10));
    setDentalPage(0);
  };

  const handleAestheticChangePage = (_: unknown, newPage: number) => {
    setAestheticPage(newPage);
  };

  const handleAestheticChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAestheticRowsPerPage(parseInt(event.target.value, 10));
    setAestheticPage(0);
  };

  // Pagination handlers for companies
  const handleDentalCompanyChangePage = (_: unknown, newPage: number) => {
    setDentalCompanyPage(newPage);
  };

  const handleDentalCompanyChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDentalCompanyRowsPerPage(parseInt(event.target.value, 10));
    setDentalCompanyPage(0);
  };

  const handleAestheticCompanyChangePage = (_: unknown, newPage: number) => {
    setAestheticCompanyPage(newPage);
  };

  const handleAestheticCompanyChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAestheticCompanyRowsPerPage(parseInt(event.target.value, 10));
    setAestheticCompanyPage(0);
  };

  // Pagination handlers for categories
  const handleDentalCategoryChangePage = (_: unknown, newPage: number) => {
    setDentalCategoryPage(newPage);
  };

  const handleDentalCategoryChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDentalCategoryRowsPerPage(parseInt(event.target.value, 10));
    setDentalCategoryPage(0);
  };

  const handleAestheticCategoryChangePage = (_: unknown, newPage: number) => {
    setAestheticCategoryPage(newPage);
  };

  const handleAestheticCategoryChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAestheticCategoryRowsPerPage(parseInt(event.target.value, 10));
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
  const safeRender = (value: any, isPercent = false, decimalPlaces = 1) => {
    if (value === null || value === undefined || value === '') return '-';
    if (isPercent) {
      const numValue = parseFloat(String(value));
      return isNaN(numValue) ? '-' : `${numValue.toFixed(decimalPlaces)}%`;
    }
    return String(value);
  };

  interface ProcedureCardProps {
    procedure: any;
    industry: 'dental' | 'aesthetic';
  }

  const ProcedureCard: React.FC<ProcedureCardProps> = ({ procedure, industry }) => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold">
          {procedure.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Category: {procedure.category}
        </Typography>
        <Typography variant="body2">
          Avg. Cost: {typeof procedure.average_cost_usd === 'number'
            ? `$${procedure.average_cost_usd.toLocaleString()}`
            : safeRender(procedure.average_cost_usd)}
        </Typography>
        <Typography variant="body2">
          Growth: {safeRender(procedure.yearly_growth_percentage, true)}
        </Typography>
        <Typography variant="body2">
          Market Size: {formatMarketSize(
            typeof procedure.market_size_usd_millions === 'string'
              ? parseFloat(procedure.market_size_usd_millions)
              : procedure.market_size_usd_millions
          )}
        </Typography>
        {industry === 'aesthetic' && (
          <Typography variant="body2">
            Downtime: {procedure.downtime || '-'}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  interface CompanyCardProps {
    company: any;
  }

  const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold">
          {company.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {company.headquarters || '-'}
        </Typography>
        <Typography variant="body2">
          Market Share: {safeRender(company.market_share_pct, true)}
        </Typography>
        <Typography variant="body2">
          Sales: {company.last_year_sales_usd_million
            ? `$${company.last_year_sales_usd_million.toLocaleString()}`
            : '-'}
        </Typography>
        <Typography variant="body2">
          Growth: {safeRender(company.projected_growth_pct, true)}
        </Typography>
      </CardContent>
    </Card>
  );

  // Calculate category distributions for visualization
  const calculateCategoryDistribution = (procedures: any[], categories: any[]) => {
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
      .sort((a, b) => b.count - a.count)
      .map(item => ({
        ...item,
        marketSizeFormatted: item.marketSize ? `$${item.marketSize}M` : 'N/A'
      }));
  };

  // Get filtered procedures based on selected category - FIXED to use category name mapping
  const filteredDentalProcedures = useMemo(() => {
    if (!selectedCategory) return dentalProcedures;
    
    // Filter by mapping the category names to hierarchy IDs
    return dentalProcedures.filter(proc => {
      // First try to match by direct ID
      if (proc.category_id === selectedCategory || proc.procedure_category_id === selectedCategory) {
        return true;
      }
      
      // Then try to match by mapping the category name to hierarchy ID
      const mappedCategoryId = mapCategoryToHierarchy(proc.category, 'dental');
      return mappedCategoryId === selectedCategory;
    });
  }, [dentalProcedures, selectedCategory, dentalCategoryMap]);

  // Same for aesthetic procedures
  const filteredAestheticProcedures = useMemo(() => {
    if (!selectedCategory) return aestheticProcedures;
    
    return aestheticProcedures.filter(proc => {
      // First try to match by direct ID
      if (proc.category_id === selectedCategory || proc.procedure_category_id === selectedCategory) {
        return true;
      }
      
      // Then try to match by mapping the category name to hierarchy ID
      const mappedCategoryId = mapCategoryToHierarchy(proc.category, 'aesthetic');
      return mappedCategoryId === selectedCategory;
    });
  }, [aestheticProcedures, selectedCategory, aestheticCategoryMap]);

  // Sorting functions
  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  type Order = 'asc' | 'desc';

  function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
  ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sorted procedures arrays
  const sortedDentalProcedures = useMemo(() => {
    return stableSort(filteredDentalProcedures, getComparator(order, orderBy));
  }, [filteredDentalProcedures, order, orderBy]);

  const sortedAestheticProcedures = useMemo(() => {
    return stableSort(filteredAestheticProcedures, getComparator(order, orderBy));
  }, [filteredAestheticProcedures, order, orderBy]);

  // Get paginated procedures
  const currentDentalProcedures = useMemo(() => {
    return sortedDentalProcedures.slice(
      dentalPage * dentalRowsPerPage,
      dentalPage * dentalRowsPerPage + dentalRowsPerPage
    );
  }, [sortedDentalProcedures, dentalPage, dentalRowsPerPage]);

  const currentAestheticProcedures = useMemo(() => {
    return sortedAestheticProcedures.slice(
      aestheticPage * aestheticRowsPerPage,
      aestheticPage * aestheticRowsPerPage + aestheticRowsPerPage
    );
  }, [sortedAestheticProcedures, aestheticPage, aestheticRowsPerPage]);

  // Calculate current companies page data
  const currentDentalCompanies = useMemo(() => {
    return dentalCompanies.slice(
      dentalCompanyPage * dentalCompanyRowsPerPage,
      dentalCompanyPage * dentalCompanyRowsPerPage + dentalCompanyRowsPerPage
    );
  }, [dentalCompanies, dentalCompanyPage, dentalCompanyRowsPerPage]);

  const currentAestheticCompanies = useMemo(() => {
    return aestheticCompanies.slice(
      aestheticCompanyPage * aestheticCompanyRowsPerPage,
      aestheticCompanyPage * aestheticCompanyRowsPerPage + aestheticCompanyRowsPerPage
    );
  }, [aestheticCompanies, aestheticCompanyPage, aestheticCompanyRowsPerPage]);

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
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* Procedure Details Modal */}
      <ProcedureDetailsModal
        open={detailsModalOpen}
        procedure={selectedProcedure}
        onClose={() => setDetailsModalOpen(false)}
        industry={selectedIndustry}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" component="div">
          US {selectedIndustry === 'dental' ? 'Dental' : 'Aesthetic'} Market Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, bgcolor: 'rgba(0, 128, 0, 0.1)', px: 2, py: 1, borderRadius: 2, border: '1px solid rgba(0, 128, 0, 0.3)', animation: 'glow 2s infinite' }}>
          <FiberManualRecordIcon sx={{ color: '#00c853', animation: 'pulse 1.5s infinite', mr: 1 }} fontSize="small" />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              LIVE US MARKET INSIGHTS
              <PublicIcon sx={{ ml: 1, color: '#00c853' }} fontSize="small" />
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#00796b', display: 'block', mt: -0.5 }}>
              Real-time data analysis updated every 24 hours
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 0px #00c853; }
          50% { box-shadow: 0 0 8px #00c853; }
          100% { box-shadow: 0 0 0px #00c853; }
        }
      `}</style>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
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

      <MarketSizeOverview 
        dentalProcedures={dentalProcedures}
        aestheticProcedures={aestheticProcedures}
        selectedIndustry={selectedIndustry}
      />
      
      {/* Main content grid */}
      <Grid container spacing={3} direction={{ xs: 'column', md: 'row' }}>
        {/* Left sidebar with categories hierarchy */}
        <Grid item xs={12} md={3}>
          <CategoryHierarchyView
            categories={categoryHierarchy}
            selectedIndustry={selectedIndustry}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            loading={categoriesLoading}
            industry={selectedIndustry}
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
                  {selectedCategory && (
                    <> - {categoryHierarchy.find(c => c.id === selectedCategory)?.name || ''}</>
                  )}
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
              
              {isSmallScreen ? (
                <Box>
                  {(selectedIndustry === 'dental'
                    ? currentDentalProcedures
                    : currentAestheticProcedures).map((proc) => (
                    <ProcedureCard
                      key={proc.id}
                      procedure={proc}
                      industry={selectedIndustry}
                    />
                  ))}

                  {(selectedIndustry === 'dental'
                    ? !currentDentalProcedures.length
                    : !currentAestheticProcedures.length) && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No procedures found
                      {selectedCategory ? ' for the selected category' : ''}
                    </Typography>
                  )}
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'name'}
                          direction={orderBy === 'name' ? order : 'asc'}
                          onClick={() => handleRequestSort('name')}
                        >
                          Procedure Name
                          {orderBy === 'name' ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'category'}
                          direction={orderBy === 'category' ? order : 'asc'}
                          onClick={() => handleRequestSort('category')}
                        >
                          Category
                          {orderBy === 'category' ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={orderBy === 'average_cost_usd'}
                          direction={orderBy === 'average_cost_usd' ? order : 'asc'}
                          onClick={() => handleRequestSort('average_cost_usd')}
                        >
                          Avg. Cost
                          {orderBy === 'average_cost_usd' ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={orderBy === 'yearly_growth_percentage'}
                          direction={orderBy === 'yearly_growth_percentage' ? order : 'asc'}
                          onClick={() => handleRequestSort('yearly_growth_percentage')}
                        >
                          Growth %
                          {orderBy === 'yearly_growth_percentage' ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={orderBy === 'market_size_usd_millions'}
                          direction={orderBy === 'market_size_usd_millions' ? order : 'asc'}
                          onClick={() => handleRequestSort('market_size_usd_millions')}
                        >
                          Market Size (USD M)
                          {orderBy === 'market_size_usd_millions' ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                      {selectedIndustry === 'aesthetic' && (
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'downtime'}
                            direction={orderBy === 'downtime' ? order : 'asc'}
                            onClick={() => handleRequestSort('downtime')}
                          >
                            Downtime
                            {orderBy === 'downtime' ? (
                              <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        </TableCell>
                      )}

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedIndustry === 'dental' ? currentDentalProcedures : currentAestheticProcedures).map((proc) => (
                      <TableRow key={proc.id}>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline', color: 'primary.main' } 
                            }}
                            onClick={() => {
                              setSelectedProcedure(proc);
                              setDetailsModalOpen(true);
                            }}
                          >
                            {proc.name}
                          </Typography>
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
                        <TableCell align="right">
                          {formatMarketSize(typeof proc.market_size_usd_millions === 'string' 
                            ? parseFloat(proc.market_size_usd_millions) 
                            : proc.market_size_usd_millions)}
                        </TableCell>
                        {selectedIndustry === 'aesthetic' && (
                          <TableCell>{(proc as any).downtime || '-'}</TableCell>
                        )}

                      </TableRow>
                    ))}
                    
                    {(selectedIndustry === 'dental' ? !currentDentalProcedures.length : !currentAestheticProcedures.length) && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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
              )}
              
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
              
              {isSmallScreen ? (
                <Box>
                  {(selectedIndustry === 'dental'
                    ? currentDentalCompanies
                    : currentAestheticCompanies).map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}

                  {(selectedIndustry === 'dental'
                    ? !currentDentalCompanies.length
                    : !currentAestheticCompanies.length) && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No companies found
                    </Typography>
                  )}
                </Box>
              ) : (
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
                              : '-'}
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
              )}
              
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
