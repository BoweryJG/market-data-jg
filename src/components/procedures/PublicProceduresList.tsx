import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  Paper,
  Skeleton,
  alpha,
  styled,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Search,
  TrendingUp,
  Lock,
  Star,
  Login,
  AttachMoney,
  ExpandMore,
  ExpandLess,
  LocalHospital,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { QuickLoginModal } from '../Auth/QuickLoginModal';
import { supabase } from '../../services/supabaseClient';
import { logger } from '../services/logging/logger';


// Styled components
const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #7B42F6 30%, #00ffc6 90%)',
  borderRadius: '20px',
  border: 0,
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: '0 3px 5px 2px rgba(123, 66, 246, .3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #6B32E6 30%, #00e6b6 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 10px 2px rgba(123, 66, 246, .4)',
  },
}));

const CategoryCard = styled(Card,  {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ theme,  expanded }) => ({
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  },
  ...(expanded && {
    boxShadow: '0 8px 16px rgba(123, 66, 246, 0.2)',
  }),
}));

interface Procedure {
  id: string;
  name: string;
  category_name: string;
  avg_price: number;
  market_size: number;
  growth_rate: number;
  description?: string;
}

interface Category {
  name: string;
  procedure_count: number;
  avg_price: number;
  total_market_size: number;
  procedures: Procedure[];
}

export const PublicProceduresList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPublicProcedures();
  }, []);

  const fetchPublicProcedures = async () => {
    try {
      // Fetch procedures grouped by category
      const { data, error } = await supabase
        .from('procedures')
        .select('id, name, category_name, avg_price, market_size, growth_rate, description')
        .order('market_size', { ascending: false });

      if (error) throw error;

      // Group procedures by category
      const categoryMap = new Map<string, Category>();
      
      data?.forEach((proc: Procedure) => {
        const categoryName = proc.category_name || 'Other';
        
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            name: categoryName,
            procedure_count: 0,
            avg_price: 0,
            total_market_size: 0,
            procedures: [],
          });
        }
        
        const category = categoryMap.get(categoryName)!;
        category.procedures.push(proc);
        category.procedure_count++;
        category.total_market_size += proc.market_size || 0;
        category.avg_price = (category.avg_price * (category.procedure_count - 1) + proc.avg_price) / category.procedure_count;
      });

      // Convert to array and sort by market size
      const categoriesArray = Array.from(categoryMap.values())
        .sort((a,  b) => b.total_market_size - a.total_market_size);

      setCategories(categoriesArray);
    } catch (error) {
      logger.error('Error fetching procedures:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.procedures.some(proc => 
      proc.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMarketSize = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return formatCurrency(value);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
          Aesthetic Procedures Market Intelligence
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Explore market data for aesthetic and cosmetic procedures
        </Typography>
        
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            maxWidth: 800,
            mx: 'auto',
            background: 'linear-gradient(135deg, rgba(123, 66, 246, 0.1) 0%, rgba(0, 255, 198, 0.1) 100%)',
            border: '1px solid rgba(123, 66, 246, 0.3)',
            color: 'white',
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="body1">
              🔓 Public view - Sign in for detailed analytics and pricing insights
            </Typography>
            <GradientButton 
              startIcon={<Login />}
              onClick={() => setLoginModalOpen(true)}
              size="small"
            >
              Sign In
            </GradientButton>
          </Box>
        </Alert>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search procedures or categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '25px',
              backgroundColor: alpha('#ffffff', 0.1),
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.15),
              },
            },
          }}
        />
      </Box>

      {/* Categories Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1,  2,  3,  4].map((i) => (
            <Grid item xs={12} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.name);
            const topProcedures = category.procedures.slice(0, 3);
            const remainingCount = category.procedures.length - 3;
            
            return (
              <Grid item xs={12} key={category.name}>
                <CategoryCard expanded={isExpanded}>
                  <CardContent onClick={() => toggleCategory(category.name)}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon color="primary" />
                        <Typography variant="h5" fontWeight="bold">
                          {category.name}
                        </Typography>
                        <Chip 
                          label={`${category.procedure_count} procedures`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <IconButton>
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Market Size
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formatMarketSize(category.total_market_size)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Average Price
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formatCurrency(category.avg_price)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Top Procedure
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {topProcedures[0]?.name || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Top 3 Procedures Preview */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Popular Procedures:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {topProcedures.map((proc) => (
                          <Chip
                            key={proc.id}
                            label={`${proc.name} (${formatCurrency(proc.avg_price)})`}
                            size="small"
                            icon={<AttachMoney />}
                          />
                        ))}
                        {remainingCount > 0 && (
                          <Chip
                            label={`+${remainingCount} more`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>

                  {/* Expanded Procedures List */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Paper sx={{ p: 2, backgroundColor: alpha('#ffffff', 0.05) }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                          All Procedures in {category.name}
                        </Typography>
                        <Grid container spacing={2}>
                          {category.procedures.map((proc, _index) => (
                            <Grid item xs={12} sm={6} md={4} key={proc.id}>
                              <Box
                                sx={{
                                  p: 2,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  backgroundColor: alpha('#ffffff', 0.03),
                                  ...(index >= 5 && {
                                    opacity: 0.6,
                                    position: 'relative',
                                  }),
                                }}
                              >
                                <Typography variant="subtitle2" fontWeight="medium">
                                  {proc.name}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Price: {index < 5 ? formatCurrency(proc.avg_price) : '***'}
                                  </Typography>
                                  {proc.growth_rate && (
                                    <Chip
                                      label={index < 5 ? `+${proc.growth_rate}%` : '+**%'}
                                      size="small"
                                      color="success"
                                      icon={<TrendingUp />}
                                    />
                                  )}
                                </Box>
                                {index >= 5 && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                    }}
                                  >
                                    <Lock fontSize="small" />
                                  </Box>
                                )}
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                        {category.procedures.length > 5 && (
                          <Alert 
                            severity="info" 
                            sx={{ mt: 2 }}
                            action={
                              <Button 
                                color="inherit" 
                                size="small" 
                                onClick={() => setLoginModalOpen(true)}
                                startIcon={<Star />}
                              >
                                Unlock All
                              </Button>
                            }
                          >
                            Sign in to view detailed pricing and analytics for all procedures
                          </Alert>
                        )}
                      </Paper>
                    </Box>
                  </Collapse>
                </CategoryCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Bottom CTA */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Paper 
          sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, rgba(123, 66, 246, 0.1) 0%, rgba(0, 255, 198, 0.1) 100%)',
            border: '1px solid rgba(123, 66, 246, 0.3)',
          }}
        >
          <LocalHospital sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Get Full Market Intelligence Access
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Unlock detailed analytics, pricing trends, competitive insights, and territory data for 500+ procedures
          </Typography>
          <GradientButton 
            size="large"
            startIcon={<Star />}
            onClick={() => setLoginModalOpen(true)}
          >
            Start Free Trial
          </GradientButton>
        </Paper>
      </Box>

      {/* Login Modal */}
      <QuickLoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </Container>
  );
};

PublicProceduresList.displayName = 'PublicProceduresList';