import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  InputAdornment,
  Box,
  Chip,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  LinearProgress,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  Lightbulb as LightbulbIcon,
  Analytics as AnalyticsIcon,
  SentimentSatisfied as PositiveIcon,
  SentimentNeutral as NeutralIcon,
  SentimentDissatisfied as NegativeIcon,
  AutoAwesome as AIIcon,
  LocalOffer as TagIcon,
  CalendarToday as DateIcon,
  Language as SourceIcon
} from '@mui/icons-material';
import { marketIntelligenceService, MarketInsight, SearchResult, CategorySuggestion } from '../../services/marketIntelligenceService';
import { useDebounce } from '../../hooks/useDebounce';

interface MarketIntelligenceSearchProps {
  open: boolean;
  onClose: () => void;
  initialIndustry?: 'dental' | 'aesthetic';
  onCategoryDiscovered?: (category: CategorySuggestion) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
  </div>
);

const MarketIntelligenceSearch: React.FC<MarketIntelligenceSearchProps> = ({
  open,
  onClose,
  initialIndustry = 'dental',
  onCategoryDiscovered
}) => {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState<'dental' | 'aesthetic'>(initialIndustry);
  const [searchType, setSearchType] = useState<'general' | 'news' | 'research' | 'competitive'>('general');
  const [loading, setLoading] = useState(false);
  const [marketInsight, setMarketInsight] = useState<MarketInsight | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Generate search suggestions based on industry
  useEffect(() => {
    if (debouncedQuery.length > 2) {
      const industrySuggestions = industry === 'dental' 
        ? [
            `${debouncedQuery} dental technology`,
            `${debouncedQuery} dental market growth`,
            `${debouncedQuery} dental innovations`,
            `${debouncedQuery} dental procedures`,
            `${debouncedQuery} dental equipment`
          ]
        : [
            `${debouncedQuery} aesthetic procedures`,
            `${debouncedQuery} cosmetic treatments`,
            `${debouncedQuery} aesthetic technology`,
            `${debouncedQuery} beauty innovations`,
            `${debouncedQuery} minimally invasive`
          ];
      setSuggestions(industrySuggestions);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, industry]);

  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const insight = await marketIntelligenceService.searchWithIntelligence(finalQuery, {
        industry,
        searchType,
        limit: 20,
        includeAnalytics: true
      });
      
      setMarketInsight(insight);
      setTabValue(0); // Reset to results tab
      
      // Notify parent about discovered categories
      if (onCategoryDiscovered && insight.categories.length > 0) {
        insight.categories.forEach(cat => {
          if (cat.confidence > 0.7) {
            onCategoryDiscovered(cat);
          }
        });
      }
    } catch (err) {
      console.error('Market intelligence search failed:', err);
      setError('Failed to perform search. Please try again.');
      setMarketInsight(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return <PositiveIcon color="success" />;
      case 'neutral': return <NeutralIcon color="warning" />;
      case 'negative': return <NegativeIcon color="error" />;
    }
  };

  const getMarketPotentialColor = (potential: 'high' | 'medium' | 'low') => {
    switch (potential) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon color="primary" />
          <Typography variant="h6">Market Intelligence Search</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          {/* Industry Toggle */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Industry:</Typography>
            <ToggleButtonGroup
              value={industry}
              exclusive
              onChange={(e, value) => value && setIndustry(value)}
              size="small"
            >
              <ToggleButton value="dental">Dental</ToggleButton>
              <ToggleButton value="aesthetic">Aesthetic</ToggleButton>
            </ToggleButtonGroup>
            
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>Type:</Typography>
            <ToggleButtonGroup
              value={searchType}
              exclusive
              onChange={(e, value) => value && setSearchType(value)}
              size="small"
            >
              <ToggleButton value="general">General</ToggleButton>
              <ToggleButton value="news">News</ToggleButton>
              <ToggleButton value="research">Research</ToggleButton>
              <ToggleButton value="competitive">Competitive</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Search Input */}
          <Autocomplete
            freeSolo
            options={suggestions}
            value={query}
            onInputChange={(event, newValue) => setQuery(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                placeholder={`Search ${industry} market intelligence...`}
                onKeyDown={handleKeyDown}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <AIIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => handleSearch()} 
                        edge="end" 
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={20} /> : <SearchIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />

          {/* Quick Search Chips */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Quick searches:
            </Typography>
            {industry === 'dental' ? (
              <>
                <Chip 
                  label="AI in Dentistry" 
                  size="small" 
                  onClick={() => handleSearch('AI artificial intelligence dentistry')}
                />
                <Chip 
                  label="Digital Dentistry Trends" 
                  size="small" 
                  onClick={() => handleSearch('digital dentistry trends 2025')}
                />
                <Chip 
                  label="Emerging Technologies" 
                  size="small" 
                  onClick={() => handleSearch('emerging dental technologies innovations')}
                />
              </>
            ) : (
              <>
                <Chip 
                  label="Non-Invasive Trends" 
                  size="small" 
                  onClick={() => handleSearch('non-invasive aesthetic procedures trends')}
                />
                <Chip 
                  label="Regenerative Aesthetics" 
                  size="small" 
                  onClick={() => handleSearch('regenerative medicine aesthetics')}
                />
                <Chip 
                  label="Beauty Tech Innovations" 
                  size="small" 
                  onClick={() => handleSearch('beauty technology innovations 2025')}
                />
              </>
            )}
          </Box>
        </Box>

        {/* Results Section */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {marketInsight && (
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Tabs 
              value={tabValue} 
              onChange={(e: React.SyntheticEvent, v: number) => setTabValue(v)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab 
                label={
                  <Badge badgeContent={marketInsight.results.length} color="primary">
                    Results
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={marketInsight.trends.length} color="secondary">
                    Trends
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={marketInsight.categories.length} color="success">
                    Categories
                  </Badge>
                } 
              />
              <Tab label="Analytics" />
            </Tabs>

            {/* Results Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ height: 'calc(90vh - 300px)', overflow: 'auto' }}>
                <List>
                  {marketInsight.results.map((result, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem 
                        component="a" 
                        href={result.url} 
                        target="_blank"
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">{result.title}</Typography>
                              {result.relevanceScore > 0.8 && (
                                <Chip label="Highly Relevant" size="small" color="primary" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {result.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {result.category && (
                                  <Chip 
                                    icon={<CategoryIcon />} 
                                    label={result.category} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                )}
                                {result.tags?.map((tag, i) => (
                                  <Chip 
                                    key={i}
                                    icon={<TagIcon />} 
                                    label={tag} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                ))}
                                {result.source && (
                                  <Chip 
                                    icon={<SourceIcon />} 
                                    label={result.source} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                )}
                                {result.publishedDate && (
                                  <Chip 
                                    icon={<DateIcon />} 
                                    label={new Date(result.publishedDate).toLocaleDateString()} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < marketInsight.results.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            </TabPanel>

            {/* Trends Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ height: 'calc(90vh - 300px)', overflow: 'auto' }}>
                <Grid container spacing={2}>
                  {marketInsight.trends.map((trend, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <TrendingUpIcon color="primary" />
                            <Typography variant="h6">{trend.term}</Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Growth Rate
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h4" color="primary">
                                {trend.growth}%
                              </Typography>
                              <TrendingUpIcon color="success" />
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={`Volume: ${trend.volume}`} size="small" />
                            <Chip label={trend.category} size="small" color="primary" />
                            <Chip label={trend.timeframe} size="small" variant="outlined" />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </TabPanel>

            {/* Categories Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ height: 'calc(90vh - 300px)', overflow: 'auto' }}>
                <Grid container spacing={2}>
                  {marketInsight.categories.map((category, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <CategoryIcon color="primary" />
                            <Typography variant="h6">{category.name}</Typography>
                            <Chip 
                              label={category.marketPotential} 
                              size="small" 
                              color={getMarketPotentialColor(category.marketPotential)}
                            />
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Confidence Score
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={category.confidence * 100} 
                                sx={{ flex: 1, height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="body2">
                                {Math.round(category.confidence * 100)}%
                              </Typography>
                            </Box>
                          </Box>
                          {category.parentCategory && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Parent: {category.parentCategory}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {category.relatedTerms.map((term, i) => (
                              <Chip 
                                key={i}
                                label={term} 
                                size="small" 
                                variant="outlined"
                                onClick={() => handleSearch(term)}
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ height: 'calc(90vh - 300px)', overflow: 'auto' }}>
                <Grid container spacing={3}>
                  {/* Sentiment Analysis */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Market Sentiment Analysis
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 3 }}>
                          {getSentimentIcon(marketInsight.sentiment.overall)}
                          <Typography variant="h4" sx={{ ml: 2 }}>
                            {marketInsight.sentiment.overall.charAt(0).toUpperCase() + 
                             marketInsight.sentiment.overall.slice(1)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <PositiveIcon color="success" />
                            <Typography variant="body2">
                              {Math.round(marketInsight.sentiment.positive * 100)}%
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <NeutralIcon color="warning" />
                            <Typography variant="body2">
                              {Math.round(marketInsight.sentiment.neutral * 100)}%
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <NegativeIcon color="error" />
                            <Typography variant="body2">
                              {Math.round(marketInsight.sentiment.negative * 100)}%
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Search Insights */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Search Insights
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <SearchIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Query"
                              secondary={marketInsight.query}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <BusinessIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Industry"
                              secondary={industry.charAt(0).toUpperCase() + industry.slice(1)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <AnalyticsIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Results Found"
                              secondary={marketInsight.results.length}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <LightbulbIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Categories Discovered"
                              secondary={marketInsight.categories.length}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Top Sources */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Top Information Sources
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {Array.from(new Set(marketInsight.results.map(r => r.source)))
                            .filter(Boolean)
                            .slice(0, 10)
                            .map((source, idx) => (
                              <Chip 
                                key={idx}
                                label={source} 
                                variant="outlined"
                                icon={<SourceIcon />}
                              />
                            ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !marketInsight && !error && (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            p: 4
          }}>
            <AIIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Discover Market Intelligence
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 500 }}>
              Search for procedures, companies, technologies, or market trends. 
              Our AI-powered search analyzes real-time data to provide insights, 
              discover emerging categories, and identify growth opportunities.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

MarketIntelligenceSearch.displayName = 'MarketIntelligenceSearch';

export default MarketIntelligenceSearch;
