import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Tooltip,
  Rating,
  Stack,
  Divider,
  useTheme,
  alpha,
  Fade,
  Grow,
  Avatar,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
} from '@mui/material';
import {
  MapPin,
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  Phone,
  Globe,
  Star,
  Settings,
  Calendar,
  AlertCircle,
  Target,
  Briefcase,
  Activity,
  BarChart3,
  Map,
  Filter,
  Download,
  Eye,
  Mail,
  Shield,
  Clock,
  Award,
  Zap,
  ChevronRight,
  Navigation,
  Database,
  Brain,
  Sparkles,
} from 'lucide-react';
import { providerDataService } from '../../services/providerDataService';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

// Mock data for NY/FL territories
const NY_FL_DATA = {
  NY: {
    totalProviders: 1847,
    medspas: 367,
    dentalPractices: 1480,
    marketValue: '$782M',
    growthRate: 12.8,
    topZipCodes: [
      { zip: '10021', providers: 89, marketShare: 4.8 },
      { zip: '10023', providers: 76, marketShare: 4.1 },
      { zip: '10028', providers: 71, marketShare: 3.8 },
      { zip: '11201', providers: 68, marketShare: 3.7 },
      { zip: '10016', providers: 65, marketShare: 3.5 },
    ],
    opportunities: [
      { type: 'High Growth', count: 23, value: '$12.4M' },
      { type: 'Underserved', count: 17, value: '$8.2M' },
      { type: 'Tech Upgrade', count: 45, value: '$22.1M' },
    ],
    demographics: {
      avgIncome: '$98,400',
      population: '8.3M',
      density: '412/sq mi',
    }
  },
  FL: {
    totalProviders: 2134,
    medspas: 523,
    dentalPractices: 1611,
    marketValue: '$923M',
    growthRate: 15.2,
    topZipCodes: [
      { zip: '33139', providers: 102, marketShare: 4.8 },
      { zip: '33480', providers: 94, marketShare: 4.4 },
      { zip: '33432', providers: 87, marketShare: 4.1 },
      { zip: '33316', providers: 82, marketShare: 3.8 },
      { zip: '34108', providers: 78, marketShare: 3.7 },
    ],
    opportunities: [
      { type: 'High Growth', count: 31, value: '$18.7M' },
      { type: 'Underserved', count: 24, value: '$14.3M' },
      { type: 'Tech Upgrade', count: 67, value: '$31.2M' },
    ],
    demographics: {
      avgIncome: '$87,200',
      population: '21.8M',
      density: '384/sq mi',
    }
  }
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`territory-tabpanel-${index}`}
      aria-labelledby={`territory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EnhancedTerritoryIntelligence() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTerritory, setSelectedTerritory] = useState<'NY' | 'FL'>('NY');
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'analytics'>('analytics');
  const [loading, setLoading] = useState(false);
  const [showProviderDetails, setShowProviderDetails] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  
  const territoryData = NY_FL_DATA[selectedTerritory];
  
  // Animated counters
  const [{ number }, api] = useSpring(() => ({
    from: { number: 0 },
    number: territoryData.totalProviders,
    config: { duration: 1000 }
  }));
  
  useEffect(() => {
    api.start({ number: territoryData.totalProviders });
  }, [selectedTerritory, api, territoryData.totalProviders]);

  const handleTerritoryChange = (event: React.MouseEvent<HTMLElement>, newTerritory: 'NY' | 'FL' | null) => {
    if (newTerritory) {
      setSelectedTerritory(newTerritory);
    }
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'map' | 'list' | 'analytics' | null) => {
    if (newMode) {
      setViewMode(newMode);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with Territory Toggle */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Territory Intelligence
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time market insights for {selectedTerritory === 'NY' ? 'New York' : 'Florida'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={selectedTerritory}
            exclusive
            onChange={handleTerritoryChange}
            size="small"
          >
            <ToggleButton value="NY" sx={{ px: 3 }}>
              <MapPin size={16} style={{ marginRight: 8 }} />
              New York
            </ToggleButton>
            <ToggleButton value="FL" sx={{ px: 3 }}>
              <MapPin size={16} style={{ marginRight: 8 }} />
              Florida
            </ToggleButton>
          </ToggleButtonGroup>
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="analytics">
              <BarChart3 size={16} />
            </ToggleButton>
            <ToggleButton value="map">
              <Map size={16} />
            </ToggleButton>
            <ToggleButton value="list">
              <Filter size={16} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Grow in timeout={500}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Total Providers
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      <animated.span>
                        {number.to(n => Math.floor(n).toLocaleString())}
                      </animated.span>
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Chip label={`${territoryData.medspas} Medspas`} size="small" color="primary" />
                      <Chip label={`${territoryData.dentalPractices} Dental`} size="small" />
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <Building2 />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} md={3}>
          <Grow in timeout={700}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Market Value
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {territoryData.marketValue}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <TrendingUp size={16} color={theme.palette.success.main} />
                      <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                        +{territoryData.growthRate}% YoY
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                    <DollarSign />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} md={3}>
          <Grow in timeout={900}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Opportunities
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {territoryData.opportunities.reduce((sum, opp) => sum + opp.count, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Worth {territoryData.opportunities.reduce((sum, opp) => sum + parseFloat(opp.value.replace('$', '').replace('M', '')), 0).toFixed(1)}M
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                    <Target />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} md={3}>
          <Grow in timeout={1100}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Demographics
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {territoryData.demographics.population}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Income: {territoryData.demographics.avgIncome}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                    <Users />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label="Market Overview" icon={<BarChart3 size={20} />} iconPosition="start" />
            <Tab label="Top Opportunities" icon={<Target size={20} />} iconPosition="start" />
            <Tab label="Provider Directory" icon={<Building2 size={20} />} iconPosition="start" />
            <Tab label="Territory Insights" icon={<Brain size={20} />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Market Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Top ZIP Codes by Provider Density
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ZIP Code</TableCell>
                      <TableCell align="right">Providers</TableCell>
                      <TableCell align="right">Market Share</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {territoryData.topZipCodes.map((zip) => (
                      <TableRow key={zip.zip} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MapPin size={16} />
                            {zip.zip}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={zip.providers} size="small" />
                        </TableCell>
                        <TableCell align="right">{zip.marketShare}%</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <Eye size={16} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Opportunity Breakdown
              </Typography>
              {territoryData.opportunities.map((opp, index) => (
                <Card key={index} sx={{ mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {opp.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {opp.count} opportunities identified
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="primary">
                          {opp.value}
                        </Typography>
                        <Chip 
                          label="View All" 
                          size="small" 
                          clickable
                          icon={<ChevronRight size={14} />}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Top Opportunities Tab */}
        <TabPanel value={activeTab} index={1}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2">
              AI-Powered Opportunity Detection
            </Typography>
            <Typography variant="body2">
              Our system has identified {territoryData.opportunities.reduce((sum, opp) => sum + opp.count, 0)} high-value opportunities in your territory based on market gaps, growth patterns, and provider capabilities.
            </Typography>
          </Alert>
          
          <Grid container spacing={2}>
            {['High Growth Markets', 'Underserved Areas', 'Technology Upgrades'].map((category, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    width: 100, 
                    height: 100,
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                  }} />
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {idx === 0 ? <Zap /> : idx === 1 ? <Navigation /> : <Shield />}
                      </Avatar>
                      <Typography variant="h6">{category}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {idx === 0 && "Practices experiencing rapid patient growth exceeding capacity"}
                      {idx === 1 && "Geographic areas with high demand but limited provider access"}
                      {idx === 2 && "Providers using outdated systems ready for modernization"}
                    </Typography>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      endIcon={<ChevronRight />}
                      sx={{ mt: 2 }}
                    >
                      Explore Opportunities
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Provider Directory Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search providers..."
              variant="outlined"
              size="small"
              sx={{ flexGrow: 1, maxWidth: 400 }}
              InputProps={{
                startAdornment: <Eye size={20} style={{ marginRight: 8, opacity: 0.5 }} />
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Provider Type</InputLabel>
              <Select label="Provider Type" defaultValue="all">
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="medspa">Med Spas</MenuItem>
                <MenuItem value="dental">Dental Practices</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<Download />}>
              Export Data
            </Button>
          </Box>
          
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>{territoryData.totalProviders.toLocaleString()}</strong> verified providers in {selectedTerritory} with complete contact information and business intelligence.
            </Typography>
          </Alert>
          
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Provider directory with advanced filtering and real-time data updates
          </Typography>
        </TabPanel>

        {/* Territory Insights Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Market Intelligence Summary
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                        <Sparkles color={theme.palette.success.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">High Growth Momentum</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedTerritory} market growing {territoryData.growthRate}% annually, outpacing national average by 3.2%
                        </Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                        <Database color={theme.palette.info.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">Data Coverage</Typography>
                        <Typography variant="body2" color="text.secondary">
                          98.7% provider coverage with verified contact information updated weekly
                        </Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                        <Award color={theme.palette.warning.main} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">Competitive Advantage</Typography>
                        <Typography variant="body2" color="text.secondary">
                          First-mover advantage in 43% of identified opportunity zones
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button fullWidth variant="contained" startIcon={<Download />}>
                  Download Full Report
                </Button>
                <Button fullWidth variant="outlined" startIcon={<Mail />}>
                  Schedule Territory Review
                </Button>
                <Button fullWidth variant="outlined" startIcon={<Settings />}>
                  Configure Alerts
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  );
}