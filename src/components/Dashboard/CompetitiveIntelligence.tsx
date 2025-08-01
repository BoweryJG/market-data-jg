import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Button,
  Tooltip,
  LinearProgress,
  InputAdornment,
  useTheme
} from '@mui/material';
import {
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  NewReleases as NewsIcon,
  Lightbulb as InnovationIcon,
  AutoAwesome as AIIcon,
  Search as SearchIcon,
  SentimentSatisfied as PositiveIcon,
  SentimentNeutral as NeutralIcon,
  SentimentDissatisfied as NegativeIcon,
  Launch as LaunchIcon,
  Analytics as AnalyticsIcon,
  EmojiEvents as LeaderIcon,
  RocketLaunch as ChallengerIcon,
  Category as NicheIcon
} from '@mui/icons-material';
import { marketIntelligenceService, CompetitiveIntelligence } from '../../services/marketIntelligenceService';
import { supabase } from '../../services/supabaseClient';
import { logger } from '../../services/logging/logger';
import { errorToLogData } from '../../utils/loggerHelpers';


interface CompetitiveIntelligenceProps {
  industry: 'dental' | 'aesthetic';
  companyId?: number;
  onCompanySelect?: (companyId: number) => void;
}

interface Company {
  id: number;
  name: string;
  description?: string;
  website?: string;
  headquarters?: string;
  founded_year?: number;
  employee_count?: number;
  market_share_pct?: number;
  revenue?: string;
}

const CompetitiveIntelligenceComponent: React.FC<CompetitiveIntelligenceProps> = ({
  industry, 
  companyId, 
  onCompanySelect
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [intelligence, setIntelligence] = useState<CompetitiveIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Load companies from database
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const tableName = industry === 'dental' ? 'dental_companies' : 'aesthetic_companies';
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('name');
        
        if (error) throw error;
        setCompanies(data || []);
        
        // If companyId is provided, find and select that company
        if (companyId && data) {
          const company = data.find(c => c.id === companyId);
          if (company) {
            setSelectedCompany(company);
            fetchIntelligence(company);
          }
        }
      } catch (error) {
        logger.error('Failed to load companies:', errorToLogData(error));
        setError('Failed to load companies');
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, [industry, companyId]);

  const fetchIntelligence = async (company: Company) => {
    setLoading(true);
    setError(null);
    
    try {
      const intel = await marketIntelligenceService.getCompetitiveIntelligence(
        company.name,
        industry
      );
      setIntelligence(intel);
    } catch (error) {
      logger.error('Failed to fetch competitive intelligence:', errorToLogData(error));
      setError('Failed to fetch competitive intelligence');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (company: Company | null) => {
    if (company) {
      setSelectedCompany(company);
      fetchIntelligence(company);
      onCompanySelect?.(company.id);
    }
  };

  const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return <PositiveIcon color="success" />;
      case 'neutral': return <NeutralIcon color="warning" />;
      case 'negative': return <NegativeIcon color="error" />;
    }
  };

  const getMarketPositionIcon = (position: string) => {
    if (position.includes('Leader')) return <LeaderIcon color="primary" />;
    if (position.includes('Challenger')) return <ChallengerIcon color="secondary" />;
    return <NicheIcon color="action" />;
  };

  if (loadingCompanies) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex',  alignItems: 'center',  mb: 3 }}>
          <BusinessIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">
            Competitive Intelligence - {industry === 'dental' ? 'Dental' : 'Aesthetic'} Industry
          </Typography>
        </Box>

        {/* Company Selector */}
        <Autocomplete
          options={companies}
          getOptionLabel={(option) => option.name}
          value={selectedCompany}
          onChange={(_event,  newValue) => handleCompanySelect(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select a company to analyze"
              placeholder="Type to search companies..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                )
              }}
            />
          )}
          sx={{ mb: 3 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Analyzing competitive intelligence...</Typography>
          </Box>
        )}

        {selectedCompany && intelligence && !loading && (
          <Grid container spacing={3}>
            {/* Company Overview */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedCompany.name}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    {selectedCompany.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {selectedCompany.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {selectedCompany.founded_year && (
                        <Chip label={`Founded: ${selectedCompany.founded_year}`} size="small" />
                      )}
                      {selectedCompany.employee_count && (
                        <Chip label={`Employees: ${selectedCompany.employee_count.toLocaleString()}`} size="small" />
                      )}
                      {selectedCompany.market_share_pct && (
                        <Chip label={`Market Share: ${selectedCompany.market_share_pct}%`} size="small" color="primary" />
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Market Position
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getMarketPositionIcon(intelligence.insights.marketPosition)}
                          <Typography variant="subtitle1">
                            {intelligence.insights.marketPosition}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Sentiment
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getSentimentIcon(intelligence.insights.sentiment.overall)}
                          <Typography variant="subtitle1">
                            {intelligence.insights.sentiment.overall.charAt(0).toUpperCase() + 
                             intelligence.insights.sentiment.overall.slice(1)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Recent News */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NewsIcon color="primary" />
                  Recent News
                </Typography>
                <List dense>
                  {intelligence.insights.recentNews.length > 0 ? (
                    intelligence.insights.recentNews.map((news,  idx) => (
                      <ListItem 
                        key={idx}
                        component="a"
                        href={news.url}
                        target="_blank"
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <ListItemText
                          primary={news.title}
                          secondary={news.publishedDate ? new Date(news.publishedDate).toLocaleDateString() : news.source}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent news found
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Product Launches */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LaunchIcon color="secondary" />
                  Product Launches
                </Typography>
                <List dense>
                  {intelligence.insights.productLaunches.length > 0 ? (
                    intelligence.insights.productLaunches.map((launch,  idx) => (
                      <ListItem 
                        key={idx}
                        component="a"
                        href={launch.url}
                        target="_blank"
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <ListItemText
                          primary={launch.title}
                          secondary={launch.description}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent product launches found
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Innovations */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InnovationIcon color="primary" />
                  Innovations & Technology
                </Typography>
                {intelligence.insights.innovations.length > 0 ? (
                  <Box sx={{ display: 'flex',  gap: 1,  flexWrap: 'wrap' }}>
                    {intelligence.insights.innovations.map((innovation,  idx) => (
                      <Chip
                        key={idx}
                        label={innovation}
                        variant="outlined"
                        icon={<AIIcon />}
                        sx={{ maxWidth: '100%' }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific innovations detected
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Sentiment Analysis Details */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AnalyticsIcon />
                  Sentiment Analysis
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <PositiveIcon color="success" sx={{ fontSize: 40 }} />
                        <Typography variant="h6">
                          {Math.round(intelligence.insights.sentiment.positive * 100)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Positive
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <NeutralIcon color="warning" sx={{ fontSize: 40 }} />
                        <Typography variant="h6">
                          {Math.round(intelligence.insights.sentiment.neutral * 100)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Neutral
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <NegativeIcon color="error" sx={{ fontSize: 40 }} />
                        <Typography variant="h6">
                          {Math.round(intelligence.insights.sentiment.negative * 100)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Negative
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Overall market sentiment towards {selectedCompany.name} is{' '}
                      <strong>{intelligence.insights.sentiment.overall}</strong>.
                      {intelligence.insights.sentiment.overall === 'positive' && 
                        ' The company is viewed favorably with strong market confidence.'}
                      {intelligence.insights.sentiment.overall === 'neutral' && 
                        ' The market has a balanced view with mixed opinions.'}
                      {intelligence.insights.sentiment.overall === 'negative' && 
                        ' There are concerns that may need addressing.'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Empty State */}
        {!selectedCompany && !loading && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 2
          }}>
            <BusinessIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Select a Company to Analyze
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a company from the dropdown above to view competitive intelligence,
              market position, recent news, and innovation insights.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};


CompetitiveIntelligenceComponent.displayName = 'CompetitiveIntelligenceComponent';export default CompetitiveIntelligenceComponent;
