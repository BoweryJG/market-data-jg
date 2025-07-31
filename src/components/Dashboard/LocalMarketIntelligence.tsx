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
} from 'lucide-react';
import { providerDataService, ProviderLocation, MarketTerritory, ProviderEquipment } from '../../services/providerDataService';
import { logger } from '../services/logging/logger';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(_props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`local-market-tabpanel-${index}`}
      aria-labelledby={`local-market-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function LocalMarketIntelligence() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTerritory, setSelectedTerritory] = useState<string>('');
  const [territories, setTerritories] = useState<MarketTerritory[]>([]);
  const [providers, setProviders] = useState<ProviderLocation[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderLocation | null>(null);
  const [providerEquipment, setProviderEquipment] = useState<ProviderEquipment[]>([]);
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  useEffect(() => {
    loadTerritories();
  }, []);

  useEffect(() => {
    if (selectedTerritory) {
      loadProvidersByTerritory();
    }
  }, [selectedTerritory]);

  const loadTerritories = async () => {
    setLoading(true);
    try {
      const data = await providerDataService.getMarketTerritories('NY');
      setTerritories(data);
      if (data.length > 0) {
        setSelectedTerritory(data[0].name);
      }
    } catch (error) {
      logger.error('Error loading territories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProvidersByTerritory = async () => {
    const territory = territories.find(t => t.name === selectedTerritory);
    if (!territory) return;

    try {
      const data = await providerDataService.getProvidersByTerritory(territory.city, territory.state);
      setProviders(data);
    } catch (error) {
      logger.error('Error loading providers:', error);
    }
  };

  const handleProviderClick = async (provider: ProviderLocation) => {
    setSelectedProvider(provider);
    setShowProviderDialog(true);
    
    // Load equipment data
    const equipment = await providerDataService.getProviderEquipment(provider.id);
    setProviderEquipment(equipment);
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: value >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getOpportunityColor = (score?: number) => {
    if (!score) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = !searchQuery || 
      provider.provider_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.practice_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = industryFilter === 'all' || provider.industry === industryFilter;
    
    return matchesSearch && matchesIndustry;
  });

  const currentTerritory = territories.find(t => t.name === selectedTerritory);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MapPin size={28} />
        Local Market Intelligence
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ borderBottom: 1,  borderColor: 'divider',  mb: 3 }}>
            <Tabs value={activeTab} onChange={(e,  v) => setActiveTab(v)}>
              <Tab label="Territory Overview" />
              <Tab label="Provider Directory" />
              <Tab label="Market Opportunities" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Territory</InputLabel>
              <Select
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e.target.value)}
                label="Select Territory"
              >
                {territories.map((territory) => (
                  <MenuItem key={territory.id} value={territory.name}>
                    {territory.name} - Opportunity Score: {territory.opportunity_score}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {currentTerritory && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Market Size
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency((currentTerritory.market_size_dental || 0) + (currentTerritory.market_size_aesthetic || 0))}
                      </Typography>
                      <Box display="flex" gap={2} mt={1}>
                        <Chip
                          label={`Dental: ${formatCurrency(currentTerritory.market_size_dental)}`}
                          size="small"
                          color="primary"
                        />
                        <Chip
                          label={`Aesthetic: ${formatCurrency(currentTerritory.market_size_aesthetic)}`}
                          size="small"
                          color="secondary"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Growth Rate
                      </Typography>
                      <Typography variant="h4">
                        {currentTerritory.growth_rate_annual?.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Annual growth rate
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(currentTerritory.growth_rate_annual || 0, 100)}
                        sx={{ mt: 2 }}
                        color={currentTerritory.growth_rate_annual! > 10 ? 'success' : 'primary'}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Opportunity Score
                      </Typography>
                      <Typography variant="h4">
                        {currentTerritory.opportunity_score}/100
                      </Typography>
                      <Chip
                        label={currentTerritory.competition_level}
                        size="small"
                        color={getOpportunityColor(currentTerritory.opportunity_score) as any}
                        sx={{ mt: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Competition: {currentTerritory.competition_level}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Territory Demographics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography color="text.secondary">Population</Typography>
                          <Typography variant="h6">
                            {currentTerritory.population?.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography color="text.secondary">Median Income</Typography>
                          <Typography variant="h6">
                            {formatCurrency(currentTerritory.median_income)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography color="text.secondary">Provider Density</Typography>
                          <Typography variant="h6">
                            {currentTerritory.provider_density?.toFixed(1)} per 10k
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography color="text.secondary">Aesthetic Index</Typography>
                          <Typography variant="h6">
                            {currentTerritory.aesthetic_spending_index}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box display="flex" gap={2} mb={3}>
              <TextField
                placeholder="Search providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  label="Industry"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="dental">Dental</MenuItem>
                  <MenuItem value="aesthetic">Aesthetic</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Grid container spacing={2}>
              {filteredProviders.map((provider) => (
                <Grid item xs={12} md={6} key={provider.id}>
                  <Card
                    sx={{ cursor: 'pointer',  '&:hover': { boxShadow: 3 } }}
                    onClick={() => handleProviderClick(provider)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box>
                          <Typography variant="h6">
                            {provider.provider_name}
                          </Typography>
                          {provider.practice_name && (
                            <Typography variant="body2" color="text.secondary">
                              {provider.practice_name}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            {provider.address}, {provider.city}, {provider.state} {provider.zip_code}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Rating value={provider.rating || 0} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            ({provider.review_count})
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                        <Chip
                          label={provider.industry}
                          size="small"
                          color={provider.industry === 'dental' ? 'primary' : 'secondary'}
                        />
                        <Chip
                          label={`Growth: ${provider.growth_potential_score}/100`}
                          size="small"
                          color={getOpportunityColor(provider.growth_potential_score) as any}
                          icon={<TrendingUp size={16} />}
                        />
                        {provider.tech_adoption_score && (
                          <Chip
                            label={`Tech: ${provider.tech_adoption_score}/100`}
                            size="small"
                            icon={<Settings size={16} />}
                          />
                        )}
                      </Box>

                      {provider.specialties && provider.specialties.length > 0 && (
                        <Box mt={1}>
                          {provider.specialties.slice(0, 3).map((specialty,  idx) => (
                            <Chip
                              key={idx}
                              label={specialty}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Alert severity="info" sx={{ mb: 3 }}>
              AI-powered market opportunities based on growth potential, equipment needs, and territory dynamics
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Target size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                      High Growth Providers
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Provider</TableCell>
                            <TableCell>Score</TableCell>
                            <TableCell>Revenue</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {providers
                            .filter(p => p.growth_potential_score && p.growth_potential_score >= 75)
                            .sort((a,  b) => (b.growth_potential_score || 0) - (a.growth_potential_score || 0))
                            .slice(0, 5)
                            .map((provider) => (
                              <TableRow
                                key={provider.id}
                                hover
                                onClick={() => handleProviderClick(provider)}
                                sx={{ cursor: 'pointer' }}
                              >
                                <TableCell>{provider.provider_name}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={provider.growth_potential_score}
                                    size="small"
                                    color={getOpportunityColor(provider.growth_potential_score) as any}
                                  />
                                </TableCell>
                                <TableCell>{formatCurrency(provider.annual_revenue_estimate)}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <AlertCircle size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                      Equipment Replacement Opportunities
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Providers with equipment due for replacement in next 6 months
                    </Typography>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Feature coming soon: Track equipment lifecycle and predict replacement needs
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </>
      )}

      {/* Provider Detail Dialog */}
      <Dialog
        open={showProviderDialog}
        onClose={() => setShowProviderDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProvider && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{selectedProvider.provider_name}</Typography>
                <Rating value={selectedProvider.rating || 0} readOnly />
              </Box>
              {selectedProvider.practice_name && (
                <Typography variant="body2" color="text.secondary">
                  {selectedProvider.practice_name}
                </Typography>
              )}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Contact Information</Typography>
                  <Stack spacing={1} mt={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MapPin size={16} />
                      <Typography variant="body2">
                        {selectedProvider.address}, {selectedProvider.city}, {selectedProvider.state} {selectedProvider.zip_code}
                      </Typography>
                    </Box>
                    {selectedProvider.phone && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Phone size={16} />
                        <Typography variant="body2">{selectedProvider.phone}</Typography>
                      </Box>
                    )}
                    {selectedProvider.website && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Globe size={16} />
                        <Typography variant="body2">
                          <a href={selectedProvider.website} target="_blank" rel="noopener noreferrer">
                            {selectedProvider.website}
                          </a>
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Business Metrics</Typography>
                  <Stack spacing={1} mt={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Annual Revenue:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(selectedProvider.annual_revenue_estimate)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Monthly Patients:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {selectedProvider.patient_volume_monthly || 'N/A'}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Years in Practice:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {selectedProvider.years_in_practice || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Specialties & Services</Typography>
                  <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                    {selectedProvider.specialties?.map((specialty,  idx) => (
                      <Chip key={idx} label={specialty} size="small" />
                    ))}
                  </Box>
                </Grid>

                {providerEquipment.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Equipment</Typography>
                    <TableContainer sx={{ mt: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell>Brand/Model</TableCell>
                            <TableCell>Purchase Date</TableCell>
                            <TableCell>Replacement Due</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {providerEquipment.map((equip) => (
                            <TableRow key={equip.id}>
                              <TableCell>{equip.equipment_category}</TableCell>
                              <TableCell>{equip.brand} {equip.model}</TableCell>
                              <TableCell>{equip.purchase_date ? new Date(equip.purchase_date).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell>{equip.replacement_due ? new Date(equip.replacement_due).toLocaleDateString() : 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowProviderDialog(false)}>Close</Button>
              <Button variant="contained" startIcon={<Briefcase size={16} />}>
                Add to Pipeline
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

LocalMarketIntelligence.displayName = 'LocalMarketIntelligence';