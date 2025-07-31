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
  Psychology as PsychologyIcon
} from '@mui/icons-material';

// Import existing components
import MarketSizeOverview from './MarketSizeOverview';
import CategoryInsights from './CategoryInsights';
import CompetitiveIntelligenceComponent from './CompetitiveIntelligence';
import MarketIntelligenceSearch from '../Search/MarketIntelligenceSearch';

// Import services
import { supabase } from '../../services/supabaseClient';
import { CategorySuggestion } from '../../services/marketIntelligenceService';

// Import the original Dashboard for procedure/company tables
import OriginalDashboard from './Dashboard';
import { logger } from '../services/logging/logger';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children,  value,  index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
  </div>
);

const EnhancedDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [industry, setIndustry] = useState<'dental' | 'aesthetic'>('dental');
  const [searchOpen, setSearchOpen] = useState(false);
  const [newCategoriesCount, setNewCategoriesCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  
  // Data states for MarketSizeOverview
  const [dentalProcedures, setDentalProcedures] = useState<any[]>([]);
  const [aestheticProcedures, setAestheticProcedures] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Load procedures data
  useEffect(() => {
    const loadProcedures = async () => {
      try {
        setDataLoading(true);
        
        const { data: dentalData } = await supabase
          .from('dental_procedures')
          .select('*');
        
        const { data: aestheticData } = await supabase
          .from('aesthetic_procedures')
          .select('*');
        
        setDentalProcedures(dentalData || []);
        setAestheticProcedures(aestheticData || []);
      } catch (error) {
        logger.error('Failed to load procedures:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadProcedures();
  }, []);

  // Handle new category discoveries
  const handleNewCategoryDiscovered = (category: CategorySuggestion) => {
    setNewCategoriesCount(prev => prev + 1);
    
    // Optionally store in database or local state
    logger.info('New category discovered:', category);
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent,  newValue: number) => {
    setTabValue(newValue);
  };

  // Handle industry toggle
  const handleIndustryChange = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setIndustry(_event.target.checked ? 'aesthetic' : 'dental');
    setSelectedCategoryId(null);
    setSelectedCompanyId(null);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Trigger refresh in child components
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4,  mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Market Intelligence Dashboard
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
          AI-Powered Insights for {industry === 'dental' ? 'Dental' : 'Aesthetic'} Industry
        </Typography>
        
        {/* Industry Toggle and Actions */}
        <Box sx={{ 
          display: 'flex',  
          justifyContent: 'center',  
          alignItems: 'center',  
          gap: 2,  
          mt: 3, 
          flexWrap: 'wrap'
        }}>
          <FormControlLabel
            control={
              <Switch
                checked={industry === 'aesthetic'}
                onChange={handleIndustryChange}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex',  alignItems: 'center',  gap: 1 }}>
                <Typography>Dental</Typography>
                <Typography color="text.secondary">/</Typography>
                <Typography>Aesthetic</Typography>
              </Box>
            }
          />
          
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon className={refreshing ? 'rotating' : ''} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="AI-Powered Search">
            <IconButton onClick={() => setSearchOpen(true)} color="primary">
              <Badge badgeContent={newCategoriesCount} color="error">
                <AIIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* New Categories Alert */}
      {newCategoriesCount > 0 && (
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
      )}

      {/* Main Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem'
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DashboardIcon />
                <span>Overview</span>
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                <span>Market Data</span>
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon />
                <span>Competitive Analysis</span>
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
          {/* Market Size Overview */}
          <Grid item xs={12}>
            <MarketSizeOverview 
              dentalProcedures={dentalProcedures}
              aestheticProcedures={aestheticProcedures}
              selectedIndustry={industry}
            />
          </Grid>
          
          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CategoryIcon color="primary" />
                  <Typography variant="h6">Categories</Typography>
                </Box>
                <Typography variant="h3" color="primary">
                  {industry === 'dental' ? '12' : '15'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active market categories
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BusinessIcon color="secondary" />
                  <Typography variant="h6">Companies</Typography>
                </Box>
                <Typography variant="h3" color="secondary">
                  {industry === 'dental' ? '150+' : '200+'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Industry leaders tracked
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUpIcon color="success" />
                  <Typography variant="h6">Growth Rate</Typography>
                </Box>
                <Typography variant="h3" color="success.main">
                  {industry === 'dental' ? '5.2%' : '8.7%'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average annual growth
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* AI Insights Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AIIcon color="primary" />
                  <Typography variant="h6">AI Market Insights</Typography>
                  <Chip label="Live" color="success" size="small" />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Trending Technologies
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {industry === 'dental' ? (
                        <>
                          <Chip label="AI Diagnostics" size="small" />
                          <Chip label="3D Printing" size="small" />
                          <Chip label="Digital Impressions" size="small" />
                          <Chip label="Teledentistry" size="small" />
                        </>
                      ) : (
                        <>
                          <Chip label="Non-Invasive Tech" size="small" />
                          <Chip label="Regenerative Medicine" size="small" />
                          <Chip label="AI Skin Analysis" size="small" />
                          <Chip label="Energy-Based Devices" size="small" />
                        </>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Market Opportunities
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {industry === 'dental' 
                        ? 'Digital dentistry and AI-powered diagnostics show highest growth potential with 15%+ CAGR'
                        : 'Minimally invasive procedures and personalized treatments driving 20%+ growth in key segments'
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <OriginalDashboard />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <CompetitiveIntelligenceComponent
          industry={industry}
          companyId={selectedCompanyId || undefined}
          onCompanySelect={setSelectedCompanyId}
        />
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

      {/* Floating Action Button for Search */}
      <Fab
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
        <AIIcon />
      </Fab>

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

EnhancedDashboard.displayName = 'EnhancedDashboard';export default EnhancedDashboard;
