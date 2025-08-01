import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  Button,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Refresh as RefreshIcon,
  AutoAwesome as AIIcon,
  NewReleases as NewIcon,
  Lightbulb as InnovationIcon,
  Speed as GrowthIcon,
  Warning as WarningIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { marketIntelligenceService, CategorySuggestion } from '../../services/marketIntelligenceService';
import { supabase } from '../../services/supabaseClient';
import { logger } from '../../services/logging/logger';
import { errorToLogData } from '../../utils/loggerHelpers';


interface CategoryInsightsProps {
  industry: 'dental' | 'aesthetic';
  onCategorySelect?: (categoryId: number) => void;
  onNewCategoryDiscovered?: (category: CategorySuggestion) => void;
}

interface EnhancedCategory {
  id: number;
  name: string;
  description?: string;
  market_size_usd_millions?: number;
  avg_growth_rate?: number;
  procedure_count?: number;
  emerging_subcategories?: CategorySuggestion[];
  trend_direction?: 'up' | 'down' | 'stable';
  innovation_score?: number;
  last_updated?: Date;
}

const CategoryInsights: React.FC<CategoryInsightsProps> = ({
  industry,
  onCategorySelect,
  onNewCategoryDiscovered
}) => {
  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  const [emergingCategories, setEmergingCategories] = useState<CategorySuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Load existing categories and enhance with insights
  const loadCategoriesWithInsights = async () => {
    try {
      setError(null);
      
      // Load categories from database
      const tableName = industry === 'dental' 
        ? 'dental_procedure_categories' 
        : 'aesthetic_categories';
      
      const { data: dbCategories, error: dbError } = await supabase
        .from(tableName)
        .select('*')
        .order('name');
      
      if (dbError) throw dbError;
      
      // Enhance each category with market intelligence
      const enhancedCategories = await Promise.all(
        (dbCategories || []).map(async (category) => {
          try {
            // Search for trends and insights about this category
            const insight = await marketIntelligenceService.searchWithIntelligence(
              `${category.name} ${industry} market trends growth innovations`,
              { industry, searchType: 'research', limit: 10 }
            );
            
            // Determine trend direction based on sentiment and growth mentions
            let trendDirection: 'up' | 'down' | 'stable' = 'stable';
            if (insight.sentiment.overall === 'positive' && insight.trends.some(t => t.growth > 5)) {
              trendDirection = 'up';
            } else if (insight.sentiment.overall === 'negative') {
              trendDirection = 'down';
            }
            
            // Calculate innovation score based on technology mentions
            const innovationKeywords = ['AI', 'digital', 'automated', 'smart', 'advanced', 'innovative'];
            const innovationMentions = insight.results.filter(r => 
              innovationKeywords.some(kw => 
                r.title.toLowerCase().includes(kw.toLowerCase()) || 
                r.description.toLowerCase().includes(kw.toLowerCase())
              )
            ).length;
            const innovationScore = Math.min((innovationMentions / insight.results.length) * 100, 100);
            
            return {
              ...category,
              emerging_subcategories: insight.categories.filter(c => c.confidence > 0.5),
              trend_direction: trendDirection,
              innovation_score: innovationScore,
              last_updated: new Date()
            } as EnhancedCategory;
          } catch (error) {
            logger.error(`Failed to enhance category ${category.name}:`, errorToLogData(error));
            return category as EnhancedCategory;
          }
        })
      );
      
      setCategories(enhancedCategories);
      
      // Discover emerging categories
      const emerging = await marketIntelligenceService.discoverEmergingCategories(industry);
      setEmergingCategories(emerging);
      
      // Notify parent about new discoveries
      if (onNewCategoryDiscovered) {
        emerging.forEach(cat => {
          if (cat.confidence > 0.8 && cat.marketPotential === 'high') {
            onNewCategoryDiscovered(cat);
          }
        });
      }
    } catch (error) {
      logger.error('Failed to load category insights:', errorToLogData(error));
      setError('Failed to load category insights. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategoriesWithInsights();
  }, [industry]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCategoriesWithInsights();
  };

  const getTrendIcon = (direction?: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <ArrowUpIcon color="success" />;
      case 'down': return <ArrowDownIcon color="error" />;
      default: return null;
    }
  };

  const getInnovationColor = (score?: number) => {
    if (!score) return 'default';
    if (score > 70) return 'success';
    if (score > 40) return 'warning';
    return 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AIIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Category Intelligence</Typography>
          </Box>
          <Grid container spacing={2}>
            {[1, 2, 3].map(i => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton variant="rectangular" height={150} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AIIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6">
              {industry === 'dental' ? 'Dental' : 'Aesthetic'} Category Intelligence
            </Typography>
          </Box>
          <Tooltip title="Refresh insights">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon className={refreshing ? 'rotating' : ''} />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button size="small" onClick={handleRefresh} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        {/* Emerging Categories Alert */}
        {emergingCategories.length > 0 && (
          <Alert 
            severity="info" 
            icon={<NewIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              {emergingCategories.length} Emerging Categories Detected
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {emergingCategories.slice(0, 5).map((cat, idx) => (
                <Chip
                  key={idx}
                  label={cat.name}
                  size="small"
                  color={getInnovationColor(cat.confidence * 100) as any}
                  icon={<TrendingUpIcon />}
                />
              ))}
            </Box>
          </Alert>
        )}

        {/* Enhanced Category Grid */}
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={12} md={6} lg={4} key={category.id}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    elevation: 4,
                    transform: 'translateY(-2px)',
                    bgcolor: theme.palette.action.hover
                  }
                }}
                onClick={() => onCategorySelect?.(category.id)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {category.name}
                  </Typography>
                  {getTrendIcon(category.trend_direction)}
                </Box>

                {/* Market Size and Growth */}
                {(category.market_size_usd_millions || category.avg_growth_rate) && (
                  <Box sx={{ mb: 2 }}>
                    {category.market_size_usd_millions && (
                      <Typography variant="body2" color="text.secondary">
                        Market Size: ${(category.market_size_usd_millions / 1000).toFixed(1)}B
                      </Typography>
                    )}
                    {category.avg_growth_rate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GrowthIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Growth: {category.avg_growth_rate.toFixed(1)}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Innovation Score */}
                {category.innovation_score !== undefined && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <InnovationIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Innovation Score
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={category.innovation_score}
                      color={getInnovationColor(category.innovation_score) as any}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}

                {/* Emerging Subcategories */}
                {category.emerging_subcategories && category.emerging_subcategories.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Emerging Areas:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {category.emerging_subcategories.slice(0, 3).map((sub, idx) => (
                        <Chip
                          key={idx}
                          label={sub.name}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Procedure Count */}
                {category.procedure_count !== undefined && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {category.procedure_count} procedures
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Market Insights Summary */}
        <Box sx={{ mt: 4, p: 2, bgcolor: theme.palette.background.default, borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon fontSize="small" />
            Market Intelligence Summary
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Total Categories: {categories.length}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Growing Categories: {categories.filter(c => c.trend_direction === 'up').length}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                High Innovation: {categories.filter(c => (c.innovation_score || 0) > 70).length}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Card>
  );
};

CategoryInsights.displayName = 'CategoryInsights';

export default CategoryInsights;
