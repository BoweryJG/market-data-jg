import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
  Fab,
  Badge,
  Alert,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  Chip,
  LinearProgress,
  CircularProgress,
  Skeleton,
  Slide,
  Zoom,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Drawer,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  styled,
  keyframes,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AIIcon,
  Refresh as RefreshIcon,
  NewReleases as NewIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Insights as InsightsIcon,
  Settings as ControlPanelIcon,
  TableChart as TableIcon,
  Launch as LaunchIcon,
  Whatshot as WhatshotIcon,
  Psychology as PsychologyIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  TrendingDown as TrendingDownIcon,
  Circle as CircleIcon,
  Star as StarIcon
} from '@mui/icons-material';

// Import existing components
import MarketSizeOverview from './MarketSizeOverview';
import CategoryInsights from './CategoryInsights';
import CompetitiveIntelligenceComponent from './CompetitiveIntelligence';
import MarketIntelligenceSearch from '../Search/MarketIntelligenceSearch';

// Import services
import { supabase } from '../../services/supabaseClient';
import { marketIntelligenceService, CategorySuggestion } from '../../services/marketIntelligenceService';
import { braveSearchService } from '../../services/braveSearchService';

// Animation keyframes
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(64, 224, 208, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(64, 224, 208, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(64, 224, 208, 0);
  }
`;

const glow = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(64, 224, 208, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(64, 224, 208, 0.8), 0 0 30px rgba(64, 224, 208, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(64, 224, 208, 0.5);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Styled components
const AnimatedCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-5px) scale(1.02)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
  },
}));

const PulsingChip = styled(Chip)(({ theme }) => ({
  animation: `${pulse} 2s infinite`,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  fontWeight: 'bold',
}));

const GlowingFab = styled(Fab)(({ theme }) => ({
  animation: `${glow} 2s ease-in-out infinite alternate`,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
}));

const LiveDataIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& .pulse-dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.success.main,
    animation: `${pulse} 1s infinite`,
  },
}));

const FloatingMetric = styled(Box)(({ theme }) => ({
  animation: `${float} 3s ease-in-out infinite`,
  animationDelay: 'var(--delay, 0s)',
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && (
      <Fade in={value === index} timeout={500}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
      </Fade>
    )}
  </div>
);

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface EnhancedProcedure {
  id: number;
  name: string;
  category: string;
  category_id?: number;
  market_size?: number;
  growth_rate?: number;
  popularity_score?: number;
  market_trend?: string;
  cost_range?: string;
  complexity_level?: string;
  last_updated?: string;
}

const EnhancedMarketDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [industry, setIndustry] = useState<'dental' | 'aesthetic'>('dental');
  const [searchOpen, setSearchOpen] = useState(false);
  const [newCategoriesCount, setNewCategoriesCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [controlPanelOpen, setControlPanelOpen] = useState(false);
  const [salesModeActive, setSalesModeActive] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  
  // Data states
  const [dentalProcedures, setDentalProcedures] = useState<EnhancedProcedure[]>([]);
  const [aestheticProcedures, setAestheticProcedures] = useState<EnhancedProcedure[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [marketInsights, setMarketInsights] = useState<any[]>([]);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Load enhanced data
  useEffect(() => {
    const loadEnhancedData = async () => {
      try {
        setDataLoading(true);
        
        // Load procedures with simple queries (no joins)
        const { data: dentalData } = await supabase
          .from('dental_procedures')
          .select('*');
        
        const { data: aestheticData } = await supabase
          .from('aesthetic_procedures')
          .select('*');

        // Load categories with procedure counts
        const { data: categoriesData } = await supabase
          .from(industry === 'dental' ? 'dental_procedure_categories' : 'aesthetic_categories')
          .select('*');

        // Load companies
        const { data: companiesData } = await supabase
          .from(industry === 'dental' ? 'dental_companies' : 'aesthetic_companies')
          .select('*');
        
        // Enhance procedures with market intelligence
        const enhancedDental = await enhanceProceduresWithMarketData(dentalData || []);
        const enhancedAesthetic = await enhanceProceduresWithMarketData(aestheticData || []);
        
        setDentalProcedures(enhancedDental);
        setAestheticProcedures(enhancedAesthetic);
        setCategories(categoriesData || []);
        setCompanies(companiesData || []);
        
        // Load real-time market insights
        await loadRealTimeInsights();
        
      } catch (error) {
        console.error('Failed to load enhanced data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadEnhancedData();
  }, [industry]);

  // Enhance procedures with market intelligence data
  const enhanceProceduresWithMarketData = async (procedures: any[]): Promise<EnhancedProcedure[]> => {
    const enhanced = await Promise.all(
      procedures.map(async (procedure) => {
        try {
          // Get real-time market insights for each procedure
          const insights = await braveSearchService.searchWithIntelligence(
            `${procedure.name} market trends statistics`,
            { count: 5 }
          );
          
          return {
            ...procedure,
            market_trend: extractMarketTrend(insights),
            popularity_score: calculatePopularityScore(insights),
            last_updated: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Failed to enhance procedure ${procedure.name}:`, error);
          return procedure;
        }
      })
    );
    
    return enhanced;
  };

  const extractMarketTrend = (insights: any[]): string => {
    if (!insights || !Array.isArray(insights)) return 'stable';
    
    const trendKeywords = {
      growing: ['growth', 'increase', 'rising', 'surge', 'boom'],
      declining: ['decline', 'decrease', 'fall', 'drop', 'reduction'],
      stable: ['stable', 'steady', 'consistent', 'maintain']
    };
    
    const text = insights.map(i => i.description || '').join(' ').toLowerCase();
    
    for (const [trend, keywords] of Object.entries(trendKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return trend;
      }
    }
    
    return 'stable';
  };

  const calculatePopularityScore = (insights: any[]): number => {
    if (!insights || !Array.isArray(insights)) return 50;
    
    // Base score on number of insights and their relevance
    const baseScore = Math.min(insights.length * 10, 100);
    const relevanceBonus = insights.reduce((sum, insight) => {
      return sum + (insight.relevance_score || 0.5) * 20;
    }, 0) / insights.length;
    
    return Math.round(Math.min(baseScore + relevanceBonus, 100));
  };

  const loadRealTimeInsights = async () => {
    try {
      const queries = industry === 'dental' 
        ? ['dental technology trends 2025', 'digital dentistry market', 'AI in dentistry']
        : ['aesthetic medicine trends 2025', 'non-invasive procedures', 'beauty technology'];
      
      const insights = await Promise.all(
        queries.map(async (query) => {
          try {
            const results = await braveSearchService.search(query, 10);
            return { query, results, timestamp: new Date() };
          } catch (error) {
            console.error(`Failed to load insights for ${query}:`, error);
            return { query, results: [], timestamp: new Date() };
          }
        })
      );
      
      setMarketInsights(insights);
      
      // Update real-time data summary
      setRealTimeData({
        totalInsights: insights.reduce((sum, i) => sum + i.results.length, 0),
        lastUpdated: new Date(),
        trendingTopics: extractTrendingTopics(insights)
      });
      
    } catch (error) {
      console.error('Failed to load real-time insights:', error);
    }
  };

  const extractTrendingTopics = (insights: any[]): string[] => {
    const topics = new Set<string>();
    insights.forEach(insight => {
      insight.results.forEach((result: any) => {
        const title = result.title?.toLowerCase() || '';
        ['AI', 'digital', 'technology', 'innovation', 'growth', 'market'].forEach(keyword => {
          if (title.includes(keyword)) {
            topics.add(keyword);
          }
        });
      });
    });
    return Array.from(topics).slice(0, 5);
  };

  // Enhanced sorting for tables
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProcedures = useMemo(() => {
    const procedures = industry === 'dental' ? dentalProcedures : aestheticProcedures;
    if (!sortConfig.key) return procedures;

    return [...procedures].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof EnhancedProcedure];
      const bVal = b[sortConfig.key as keyof EnhancedProcedure];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }, [dentalProcedures, aestheticProcedures, industry, sortConfig]);

  // Handle new category discoveries
  const handleNewCategoryDiscovered = (category: CategorySuggestion) => {
    setNewCategoriesCount(prev => prev + 1);
    console.log('New category discovered:', category);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle industry toggle
  const handleIndustryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIndustry(event.target.checked ? 'aesthetic' : 'dental');
    setSelectedCategoryId(null);
    setSelectedCompanyId(null);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRealTimeInsights();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing': return <TrendingUpIcon color="success" />;
      case 'declining': return <TrendingDownIcon color="error" />;
      default: return <CircleIcon color="info" />;
    }
  };

  const getPopularityColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'error';
  };

  if (dataLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h3" gutterBottom sx={{ 
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}>
              Market Intelligence Hub
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Real-time insights for {industry === 'dental' ? 'Dental' : 'Aesthetic'} Industry
            </Typography>
          </Box>
          
          {realTimeData && (
            <LiveDataIndicator>
              <div className="pulse-dot" />
              <Typography variant="body2" color="success.main">
                Live Data • {realTimeData.totalInsights} insights
              </Typography>
            </LiveDataIndicator>
          )}
        </Box>
        
        {/* Control Bar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: 2,
          p: 2,
          borderRadius: 2,
          background: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={industry === 'aesthetic'}
                  onChange={handleIndustryChange}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Dental</Typography>
                  <Typography color="text.secondary">/</Typography>
                  <Typography>Aesthetic</Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={salesModeActive}
                  onChange={(e) => setSalesModeActive(e.target.checked)}
                  color="secondary"
                />
              }
              label="Sales Mode"
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <RefreshIcon className={refreshing ? 'rotating' : ''} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="AI Search">
              <IconButton onClick={() => setSearchOpen(true)} color="primary">
                <Badge badgeContent={newCategoriesCount} color="error">
                  <AIIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Control Panel">
              <IconButton onClick={() => setControlPanelOpen(true)} color="secondary">
                <ControlPanelIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Trending Topics Bar */}
      {realTimeData?.trendingTopics && (
        <Slide direction="down" in={!!realTimeData} timeout={500}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WhatshotIcon color="error" />
              <Typography variant="h6">Trending Now</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {realTimeData.trendingTopics.map((topic: string, idx: number) => (
                <PulsingChip
                  key={topic}
                  label={topic}
                  size="small"
                  style={{ animationDelay: `${idx * 0.2}s` }}
                />
              ))}
            </Box>
          </Box>
        </Slide>
      )}

      {/* New Categories Alert */}
      {newCategoriesCount > 0 && (
        <Zoom in={newCategoriesCount > 0}>
          <Alert 
            severity="info" 
            icon={<NewIcon />}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => setNewCategoriesCount(0)}
              >
                Dismiss
              </Button>
            }
            sx={{ mb: 3 }}
          >
            {newCategoriesCount} new market categories discovered through AI analysis!
          </Alert>
        </Zoom>
      )}

      {/* Enhanced Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
              '&.Mui-selected': {
                background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              }
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon />
                <span>Live Dashboard</span>
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TableIcon />
                <span>Enhanced Data</span>
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon />
                <span>AI Insights</span>
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon />
                <span>Category Intelligence</span>
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Enhanced Market Overview */}
          <Grid item xs={12}>
            <MarketSizeOverview 
              dentalProcedures={dentalProcedures}
              aestheticProcedures={aestheticProcedures}
              selectedIndustry={industry}
            />
          </Grid>
          
          {/* Live Metrics with Animations */}
          <Grid item xs={12} md={3}>
            <FloatingMetric style={{ '--delay': '0s' } as any}>
              <AnimatedCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CategoryIcon color="primary" />
                    <Typography variant="h6">Active Categories</Typography>
                  </Box>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    {categories.length}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={85} 
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    85% market coverage
                  </Typography>
                </CardContent>
              </AnimatedCard>
            </FloatingMetric>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FloatingMetric style={{ '--delay': '0.2s' } as any}>
              <AnimatedCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessIcon color="secondary" />
                    <Typography variant="h6">Companies</Typography>
                  </Box>
                  <Typography variant="h3" color="secondary" sx={{ fontWeight: 'bold' }}>
                    {companies.length}+
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip label="Leaders" size="small" color="success" />
                    <Chip label="Emerging" size="small" color="warning" />
                  </Box>
                </CardContent>
              </AnimatedCard>
            </FloatingMetric>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FloatingMetric style={{ '--delay': '0.4s' } as any}>
              <AnimatedCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AnalyticsIcon color="success" />
                    <Typography variant="h6">Growth Rate</Typography>
                  </Box>
                  <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {industry === 'dental' ? '5.2%' : '8.7%'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <TrendingUpIcon color="success" />
                    <Typography variant="body2" color="success.main">
                      Above industry average
                    </Typography>
                  </Box>
                </CardContent>
              </AnimatedCard>
            </FloatingMetric>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FloatingMetric style={{ '--delay': '0.6s' } as any}>
              <AnimatedCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <InsightsIcon color="info" />
                    <Typography variant="h6">AI Insights</Typography>
                  </Box>
                  <Typography variant="h3" color="info.main" sx={{ fontWeight: 'bold' }}>
                    {realTimeData?.totalInsights || 0}
                  </Typography>
                  <LiveDataIndicator sx={{ mt: 1 }}>
                    <div className="pulse-dot" />
                    <Typography variant="body2" color="success.main">
                      Real-time
                    </Typography>
                  </LiveDataIndicator>
                </CardContent>
              </AnimatedCard>
            </FloatingMetric>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Enhanced Data Table */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Enhanced {industry === 'dental' ? 'Dental' : 'Aesthetic'} Procedures
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Click column headers to sort • Real-time market intelligence included
          </Typography>
        </Box>
        
        <TableContainer component={Paper} sx={{ 
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          overflow: 'hidden'
        }}>
          <Table>
            <TableHead sx={{ 
              background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})` 
            }}>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'name'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('name')}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Procedure Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'category'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('category')}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortConfig.key === 'popularity_score'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('popularity_score')}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Popularity
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortConfig.key === 'market_trend'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('market_trend')}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Market Trend
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Growth Rate</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProcedures.map((procedure, index) => (
                <TableRow 
                  key={procedure.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      transform: 'scale(1.01)',
                      transition: 'all 0.2s'
                    },
                    cursor: 'pointer'
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {procedure.name}
                      </Typography>
                      {procedure.popularity_score && procedure.popularity_score > 80 && (
                        <StarIcon color="warning" fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={procedure.category} 
                      size="small" 
                      variant="outlined"
                      onClick={() => setSelectedCategoryId(procedure.category_id || null)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <CircularProgress
                        variant="determinate"
                        value={procedure.popularity_score || 50}
                        size={30}
                        color={getPopularityColor(procedure.popularity_score || 50)}
                      />
                      <Typography variant="body2">
                        {procedure.popularity_score || 50}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {getTrendIcon(procedure.market_trend || 'stable')}
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {procedure.market_trend || 'stable'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={`${procedure.growth_rate || 0}%`}
                      size="small"
                      color={(procedure.growth_rate || 0) > 5 ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton size="small" color="primary">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {salesModeActive && (
                      <Tooltip title="Add to CRM">
                        <IconButton size="small" color="secondary">
                          <LaunchIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Market Intelligence Panel */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AnimatedCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <PsychologyIcon color="primary" />
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    AI Market Intelligence
                  </Typography>
                  <LiveDataIndicator>
                    <div className="pulse-dot" />
                    <Typography variant="body2" color="success.main">
                      Live Analysis
                    </Typography>
                  </LiveDataIndicator>
                </Box>
                
                <Grid container spacing={2}>
                  {marketInsights.map((insight, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {insight.query}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {insight.results.length} insights found
                          </Typography>
                          <List dense>
                            {insight.results.slice(0, 3).map((result: any, i: number) => (
                              <ListItem key={i} sx={{ px: 0 }}>
                                <ListItemIcon>
                                  <CircleIcon sx={{ fontSize: 8 }} color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={result.title}
                                  secondary={result.description?.substring(0, 100) + '...'}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                  secondaryTypographyProps={{ variant: 'caption' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </AnimatedCard>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <CategoryInsights
          industry={industry}
          onCategorySelect={setSelectedCategoryId}
          onNewCategoryDiscovered={handleNewCategoryDiscovered}
        />
      </TabPanel>

      {/* AI Search Dialog */}
      <MarketIntelligenceSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        initialIndustry={industry}
        onCategoryDiscovered={handleNewCategoryDiscovered}
      />

      {/* Sales Mode Control Panel */}
      <Drawer
        anchor="right"
        open={controlPanelOpen}
        onClose={() => setControlPanelOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            p: 2,
          },
        }}
      >
        <Typography variant="h6" gutterBottom>
          Control Panel
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Export Options
          </Typography>
          <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
            Export to CRM
          </Button>
          <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
            Generate Report
          </Button>
          <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
            Schedule Analysis
          </Button>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Real-time Settings
          </Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Auto-refresh data"
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Live notifications"
          />
          <FormControlLabel
            control={<Switch />}
            label="Advanced analytics"
          />
        </Box>
      </Drawer>

      {/* Enhanced Floating Action Button */}
      <GlowingFab
        color="primary"
        aria-label="AI Search"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => setSearchOpen(true)}
      >
        <Badge badgeContent={newCategoriesCount} color="error">
          <AIIcon />
        </Badge>
      </GlowingFab>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Container>
  );
};

export default EnhancedMarketDashboard;