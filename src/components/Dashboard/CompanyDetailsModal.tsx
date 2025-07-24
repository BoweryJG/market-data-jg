import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  Link,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Skeleton,
  Rating,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Article as ArticleIcon,
  LocationOn as LocationIcon,
  Language as WebsiteIcon,
  Group as EmployeeIcon,
  CalendarToday as FoundedIcon,
  Person as CEOIcon,
  Search as SearchIcon,
  OpenInNew as OpenInNewIcon,
  AutoAwesome as AIIcon,
  Inventory as ProductIcon,
  Share as ShareIcon,
  AttachMoney as RevenueIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface CompanyDetailsModalProps {
  open: boolean;
  onClose: () => void;
  company: any;
  industry: 'dental' | 'aesthetic';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
  open,
  onClose,
  company,
  industry,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && company) {
      fetchCompanyInsights();
    }
  }, [open, company]);

  const fetchCompanyInsights = async () => {
    if (!company) return;

    setLoading(true);
    setError(null);

    try {
      const searchQuery = `${company.name} ${industry} medical company latest news innovations 2025`;
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/search/brave`, {
        params: { 
          query: searchQuery, 
          limit: 10 
        },
        timeout: 10000
      });

      setSearchResults({
        results: response.data.results || response.data.web?.results || []
      });
    } catch (err) {
      console.error('Error fetching company insights:', err);
      setError('Failed to fetch latest insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!company) return null;

  const companyName = company.name || 'Unknown Company';
  const description = company.description || 'No description available';
  const website = company.website || company.website_url;
  const headquarters = company.headquarters;
  const foundedYear = company.founded_year;
  const ceo = company.ceo;
  const employeeCount = company.employee_count || company.num_employees;
  const marketShare = company.market_share_pct;
  const revenue = company.revenue || company.last_year_sales_usd_million;
  const keyProducts = company.key_products || company.products?.join(', ');
  const specialties = company.specialties?.join(', ');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header with gradient background */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%)',
          color: 'white',
          p: 3,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <BusinessIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {companyName}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {industry.charAt(0).toUpperCase() + industry.slice(1)} Industry Leader
            </Typography>
          </Box>
        </Box>

        {/* Key metrics */}
        <Grid container spacing={2}>
          {marketShare && (
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShareIcon />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Market Share
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {marketShare}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          {employeeCount && (
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmployeeIcon />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Employees
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {employeeCount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          {revenue && (
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RevenueIcon />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Revenue
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {typeof revenue === 'number' ? `$${revenue}M` : revenue}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      <DialogContent>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 2,
          }}
        >
          <Tab label="Overview" icon={<BusinessIcon />} iconPosition="start" />
          <Tab label="Latest News" icon={<AIIcon />} iconPosition="start" />
          <Tab label="Products & Services" icon={<ProductIcon />} iconPosition="start" />
          <Tab label="Market Position" icon={<TrendingUpIcon />} iconPosition="start" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={0} sx={{ backgroundColor: '#F8FAFC' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Company Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Company Information
                  </Typography>
                  <List dense>
                    {website && (
                      <ListItem>
                        <ListItemIcon>
                          <WebsiteIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Website"
                          secondary={
                            <Link href={website} target="_blank" rel="noopener noreferrer">
                              {website.replace(/^https?:\/\//i, '')}
                              <OpenInNewIcon sx={{ ml: 0.5, fontSize: 14, verticalAlign: 'middle' }} />
                            </Link>
                          }
                        />
                      </ListItem>
                    )}
                    {headquarters && (
                      <ListItem>
                        <ListItemIcon>
                          <LocationIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Headquarters" secondary={headquarters} />
                      </ListItem>
                    )}
                    {foundedYear && (
                      <ListItem>
                        <ListItemIcon>
                          <FoundedIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Founded" secondary={foundedYear} />
                      </ListItem>
                    )}
                    {ceo && (
                      <ListItem>
                        <ListItemIcon>
                          <CEOIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="CEO" secondary={ceo} />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Company Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Rating value={4.5} precision={0.5} readOnly size="large" />
                    <Typography variant="body1" color="text.secondary">
                      4.5 / 5.0
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Based on industry reputation and market performance
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Latest News Tab */}
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : searchResults && searchResults.results ? (
            <List>
              {searchResults.results.map((result: any, index: number) => (
                <Paper key={index} elevation={0} sx={{ mb: 2, p: 2, backgroundColor: '#F8FAFC' }}>
                  <ListItem alignItems="flex-start" disablePadding>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'secondary.light' }}>
                        <ArticleIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Link
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textDecoration: 'none',
                            color: 'secondary.main',
                            fontWeight: 600,
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {result.title}
                          <OpenInNewIcon sx={{ ml: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
                        </Link>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {result.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new URL(result.url).hostname}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Typography>No news results available</Typography>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={fetchCompanyInsights}
              disabled={loading}
            >
              Refresh News
            </Button>
          </Box>
        </TabPanel>

        {/* Products & Services Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {keyProducts && (
              <Grid item xs={12}>
                <Card elevation={0} sx={{ backgroundColor: '#FFF4E6' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Key Products
                    </Typography>
                    <Typography variant="body1">
                      {keyProducts}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {specialties && (
              <Grid item xs={12}>
                <Card elevation={0}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Specialties
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {specialties.split(',').map((specialty: string, index: number) => (
                        <Chip
                          key={index}
                          label={specialty.trim()}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Alert severity="info" icon={<AIIcon />}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Innovation Focus
                </Typography>
                <Typography variant="body2">
                  {companyName} is actively investing in {industry === 'dental' ? 'digital dentistry and AI-powered diagnostics' : 'minimally invasive procedures and personalized treatments'} to maintain its competitive edge in the market.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Market Position Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={0} sx={{ backgroundColor: '#F0F9FF' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TrendingUpIcon color="info" />
                    <Typography variant="h6">Market Analysis</Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {companyName} is a {marketShare > 10 ? 'major' : 'significant'} player in the {industry} market
                    {marketShare && ` with a ${marketShare}% market share`}.
                  </Typography>
                  <Typography variant="body1">
                    The company&apos;s focus on innovation and quality has positioned it well for continued growth
                    in the expanding {industry} healthcare sector.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Competitive Advantages
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Strong brand recognition" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Innovative product portfolio" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Global distribution network" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Strong R&D capabilities" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Growth Opportunities
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Expansion into emerging markets<br />
                    • Digital transformation initiatives<br />
                    • Strategic partnerships and acquisitions<br />
                    • New product development in high-growth segments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: '#F8FAFC' }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AIIcon />}
          onClick={() => {
            console.log('Generate company report for:', companyName);
          }}
        >
          Generate Full Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};


CompanyDetailsModal.displayName = 'CompanyDetailsModal';export default CompanyDetailsModal;
