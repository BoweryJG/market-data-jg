import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  Badge,
  Chip,
  LinearProgress,
  CircularProgress,
  Fade,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  styled,
  alpha,
  useTheme,
  keyframes,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  Stack,
  Divider,
  useMediaQuery
} from '@mui/material';
import {
  Category as CategoryIcon,
  TrendingUp,
  TrendingDown,
  FiberManualRecord,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Flag,
  AutoMode,
  Visibility,
  VisibilityOff,
  Assessment,
  MonetizationOn,
  Groups,
  Speed,
  Whatshot,
  Star,
  LocalFireDepartment,
  BubbleChart,
  Timeline,
  PieChart,
  BarChart,
  DonutLarge,
  Insights,
  Psychology,
  ElectricBolt,
  Rocket,
  AutoAwesome,
  Sync,
  Settings,
  FilterList,
  Sort,
  DashboardCustomize,
  CrisisAlert,
  AttachMoney,
  TrendingFlat
} from '@mui/icons-material';

import { supabase } from '../../services/supabaseClient';

import { logger } from '../../services/logging/logger';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 162, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 162, 255, 0.8), 0 0 30px rgba(0, 162, 255, 0.6); }
  100% { box-shadow: 0 0 5px rgba(0, 162, 255, 0.5); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// Styled components
const CompactCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  }
}));

const CategoryCard = styled(Card, { shouldForwardProp: (prop) => prop !== 'growth' })<{ growth: number }>(({ theme, growth }) => ({
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(
    growth > 5 ? theme.palette.success.main : growth < 0 ? theme.palette.error.main : theme.palette.info.main,
    0.1
  )})`,
  border: `1px solid ${alpha(
    growth > 5 ? theme.palette.success.main : growth < 0 ? theme.palette.error.main : theme.palette.info.main,
    0.3
  )}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[8],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: theme.shape.borderRadius,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: -1,
  },
  '&:hover::before': {
    opacity: growth > 5 ? 1 : 0.5,
    animation: `${pulse} 2s infinite`,
  }
}));

const MetricBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  background: alpha(theme.palette.background.default, 0.5),
  '& .metric-value': {
    fontWeight: 'bold',
    fontSize: '1.2rem',
  }
}));

const TrendChip = styled(Chip, { shouldForwardProp: (prop) => prop !== 'trend' })<{ trend: 'up' | 'down' | 'flat' }>(({ theme, trend }) => ({
  fontWeight: 'bold',
  '& .MuiChip-icon': {
    color: 'inherit',
  },
  ...(trend === 'up' && {
    background: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  }),
  ...(trend === 'down' && {
    background: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  }),
  ...(trend === 'flat' && {
    background: alpha(theme.palette.info.main, 0.1),
    color: theme.palette.info.main,
    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
  }),
}));

// Enhanced interfaces
interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  market_size_usd_millions?: number;
  avg_growth_rate?: number;
  icon_name?: string;
  color_code?: string;
  is_featured?: boolean;
  procedure_count?: number;
  revenue_potential?: number;
  sales_priority?: 'high' | 'medium' | 'low';
  automation_enabled?: boolean;
  last_activity?: string;
  opportunities?: number;
  win_rate?: number;
}

interface Procedure {
  id: number;
  name: string;
  category?: string;
  category_id?: number;
  popularity_score?: number;
  market_trend?: string;
  avg_cost?: number;
  growth_rate?: number;
}

interface SalesMetric {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const CompactSalesDashboard: React.FC = () => {
  const [industry, setIndustry] = useState<'dental' | 'aesthetic'>('dental');
  const [salesMode, setSalesMode] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'revenue_potential', direction: 'desc' });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'hierarchy'>('grid');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadEnhancedData();
  }, [industry]);

  const loadEnhancedData = async () => {
    setLoading(true);
    try {
      // Load categories with enhanced sales data
      const { data: categoriesData } = await supabase
        .from(industry === 'dental' ? 'dental_procedure_categories' : 'aesthetic_categories')
        .select('*');

      // Load procedures with categories
      const { data: proceduresData } = await supabase
        .from(industry === 'dental' ? 'dental_procedures' : 'aesthetic_procedures')
        .select('*');

      // Enhance categories with sales metrics
      const enhancedCategories = await enhanceCategoriesWithSalesData(categoriesData || []);
      const enhancedProcedures = await enhanceProceduresWithMarketData(proceduresData || []);

      setCategories(enhancedCategories);
      setProcedures(enhancedProcedures);
    } catch (error) {
      logger.error('Failed to load data:', { error });
    } finally {
      setLoading(false);
    }
  };

  const enhanceCategoriesWithSalesData = async (cats: any[]): Promise<Category[]> => {
    return cats.map(cat => ({
      ...cat,
      procedure_count: Math.floor(Math.random() * 50) + 10,
      revenue_potential: Math.floor(Math.random() * 5000000) + 1000000,
      sales_priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
      automation_enabled: Math.random() > 0.5,
      opportunities: Math.floor(Math.random() * 100) + 20,
      win_rate: Math.floor(Math.random() * 30) + 50,
    }));
  };

  const enhanceProceduresWithMarketData = async (procs: any[]): Promise<Procedure[]> => {
    return procs.map(proc => ({
      ...proc,
      popularity_score: Math.floor(Math.random() * 100),
      market_trend: ['growing', 'stable', 'declining'][Math.floor(Math.random() * 3)],
      avg_cost: Math.floor(Math.random() * 50000) + 1000,
      growth_rate: (Math.random() * 20) - 5,
    }));
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleCategorySelection = (categoryId: number) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing': return <TrendingUp />;
      case 'declining': return <TrendingDown />;
      default: return <TrendingFlat />;
    }
  };

  const salesMetrics: SalesMetric[] = [
    {
      label: 'Pipeline Value',
      value: '$2.4M',
      change: 12,
      icon: <AttachMoney />,
      color: theme.palette.success.main
    },
    {
      label: 'Active Opportunities',
      value: 156,
      change: -5,
      icon: <CrisisAlert />,
      color: theme.palette.warning.main
    },
    {
      label: 'Win Rate',
      value: '68%',
      change: 8,
      icon: <Speed />,
      color: theme.palette.info.main
    },
    {
      label: 'Automation Active',
      value: 23,
      change: 15,
      icon: <AutoMode />,
      color: theme.palette.secondary.main
    }
  ];

  const topCategories = useMemo(() => {
    return [...categories]
      .sort((a, b) => (b.revenue_potential || 0) - (a.revenue_potential || 0))
      .slice(0, 5);
  }, [categories]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      default: return theme.palette.info.main;
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Paper sx={{ p: 2, height: 120 }}>
                <CircularProgress size={40} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
      {/* Compact Header with Controls */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Sales Intelligence Hub
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={salesMode}
                onChange={(e) => setSalesMode(e.target.checked)}
                color="secondary"
              />
            }
            label="CRM Mode"
          />
          <ToggleButtonGroup
            value={industry}
            exclusive
            onChange={(e, val) => val && setIndustry(val)}
            size="small"
          >
            <ToggleButton value="dental">Dental</ToggleButton>
            <ToggleButton value="aesthetic">Aesthetic</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, val) => val && setViewMode(val)}
            size="small"
          >
            <ToggleButton value="grid"><BubbleChart /></ToggleButton>
            <ToggleButton value="list"><BarChart /></ToggleButton>
            <ToggleButton value="hierarchy"><DonutLarge /></ToggleButton>
          </ToggleButtonGroup>
          <IconButton onClick={() => setFilterDrawerOpen(true)} size="small">
            <FilterList />
          </IconButton>
        </Box>
      </Box>

      {/* Compact Sales Metrics Row */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {salesMetrics.map((metric, idx) => (
          <Grid item xs={6} md={3} key={idx}>
            <CompactCard sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {metric.label}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: metric.color }}>
                    {metric.value}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <IconButton size="small" sx={{ color: metric.color }}>
                    {metric.icon}
                  </IconButton>
                  <TrendChip
                    size="small"
                    trend={metric.change > 0 ? 'up' : metric.change < 0 ? 'down' : 'flat'}
                    icon={getTrendIcon(metric.change > 0 ? 'growing' : metric.change < 0 ? 'declining' : 'stable')}
                    label={`${Math.abs(metric.change)}%`}
                  />
                </Box>
              </Box>
            </CompactCard>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={2}>
        {/* Categories Section - Left Side */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '600px', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" />
                Category Performance
              </Typography>
              <Chip 
                label={`${selectedCategories.size} selected`} 
                size="small" 
                color="primary"
                onDelete={() => setSelectedCategories(new Set())}
              />
            </Box>

            {viewMode === 'grid' && (
              <Grid container spacing={1.5}>
                {categories.map((category) => (
                  <Grid item xs={12} sm={6} key={category.id}>
                    <CategoryCard 
                      growth={category.avg_growth_rate || 0}
                      onClick={() => toggleCategorySelection(category.id)}
                      sx={{ 
                        p: 1.5,
                        border: selectedCategories.has(category.id) ? `2px solid ${theme.palette.primary.main}` : undefined
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {category.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                            <Chip 
                              size="small" 
                              label={`${category.procedure_count} proc`}
                              sx={{ height: 20 }}
                            />
                            <Chip 
                              size="small" 
                              label={formatCurrency(category.revenue_potential || 0)}
                              color="success"
                              sx={{ height: 20 }}
                            />
                            {category.is_featured && <Star fontSize="small" color="warning" />}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <CircularProgress
                            variant="determinate"
                            value={category.win_rate || 0}
                            size={40}
                            thickness={4}
                            color={category.win_rate! > 70 ? 'success' : 'warning'}
                          />
                          <Typography variant="caption" sx={{ mt: 0.5 }}>
                            {category.win_rate}%
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <MetricBox>
                          <LocalFireDepartment 
                            fontSize="small" 
                            sx={{ color: getPriorityColor(category.sales_priority || 'low') }}
                          />
                          <Typography variant="caption" sx={{ textTransform: 'uppercase' }}>
                            {category.sales_priority}
                          </Typography>
                        </MetricBox>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {category.automation_enabled && (
                            <Tooltip title="Automation Enabled">
                              <AutoMode fontSize="small" color="secondary" />
                            </Tooltip>
                          )}
                          {salesMode && (
                            <IconButton 
                              size="small"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                // Add to CRM action
                              }}
                            >
                              <Flag fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </CategoryCard>
                  </Grid>
                ))}
              </Grid>
            )}

            {viewMode === 'list' && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Procedures</TableCell>
                      <TableCell align="right">Win Rate</TableCell>
                      <TableCell align="right">Priority</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow 
                        key={category.id}
                        selected={selectedCategories.has(category.id)}
                        onClick={() => toggleCategorySelection(category.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {category.is_featured && <Star fontSize="small" color="warning" />}
                            <Typography variant="body2">{category.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(category.revenue_potential || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{category.procedure_count}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${category.win_rate}%`} 
                            size="small"
                            color={category.win_rate! > 70 ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={category.sales_priority} 
                            size="small"
                            sx={{ 
                              backgroundColor: alpha(getPriorityColor(category.sales_priority || 'low'), 0.1),
                              color: getPriorityColor(category.sales_priority || 'low')
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            {category.automation_enabled && <AutoMode fontSize="small" color="secondary" />}
                            <IconButton size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Right Side - Top Categories & Quick Actions */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            {/* Top Revenue Categories */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Whatshot color="error" />
                Hot Categories
              </Typography>
              <List dense>
                {topCategories.map((cat, idx) => (
                  <ListItem key={cat.id}>
                    <ListItemIcon>
                      <Badge badgeContent={idx + 1} color="primary">
                        <ElectricBolt color="warning" />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={cat.name}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip label={formatCurrency(cat.revenue_potential || 0)} size="small" color="success" />
                          <Chip label={`${cat.opportunities} opps`} size="small" />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <TrendChip
                        size="small"
                        trend={cat.avg_growth_rate! > 0 ? 'up' : 'down'}
                        icon={getTrendIcon(cat.avg_growth_rate! > 0 ? 'growing' : 'declining')}
                        label={`${Math.abs(cat.avg_growth_rate || 0).toFixed(1)}%`}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Quick Actions for Sales Mode */}
            {salesMode && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rocket color="secondary" />
                  Quick Actions
                </Typography>
                <Stack spacing={1}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<AutoAwesome />}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Generate Territory Report
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<Sync />}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Sync to CRM
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<Psychology />}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    AI Recommendations
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<Flag />}
                    sx={{ justifyContent: 'flex-start' }}
                    disabled={selectedCategories.size === 0}
                  >
                    Flag {selectedCategories.size} Categories
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* Market Insights */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Insights color="info" />
                Real-time Insights
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <FiberManualRecord sx={{ fontSize: 8, color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Digital workflows trending up 23%" 
                    secondary="High opportunity in tech-forward practices"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FiberManualRecord sx={{ fontSize: 8, color: theme.palette.warning.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Minimally invasive gaining traction" 
                    secondary="15% YoY growth in aesthetic sector"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FiberManualRecord sx={{ fontSize: 8, color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Price sensitivity in elective procedures" 
                    secondary="Consider value bundles"
                  />
                </ListItem>
              </List>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 300, p: 2 } }}
      >
        <Typography variant="h6" gutterBottom>
          Filters & Settings
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Priority Filter
            </Typography>
            <ToggleButtonGroup
              value={['high', 'medium', 'low']}
              onChange={() => {}}
              size="small"
              fullWidth
            >
              <ToggleButton value="high">High</ToggleButton>
              <ToggleButton value="medium">Med</ToggleButton>
              <ToggleButton value="low">Low</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Revenue Range
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined">$0-1M</Button>
              <Button size="small" variant="outlined">$1-5M</Button>
              <Button size="small" variant="outlined">$5M+</Button>
            </Stack>
          </Box>

          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Show Automated Only"
          />
          <FormControlLabel
            control={<Switch />}
            label="Featured Categories"
          />
        </Stack>

        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Button fullWidth variant="contained">
            Apply Filters
          </Button>
        </Box>
      </Drawer>

      {/* Floating Speed Dial for Sales Actions */}
      {salesMode && (
        <SpeedDial
          ariaLabel="Sales actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<AutoMode />}
            tooltipTitle="Automate Categories"
            onClick={() => {}}
          />
          <SpeedDialAction
            icon={<Assessment />}
            tooltipTitle="Generate Report"
            onClick={() => {}}
          />
          <SpeedDialAction
            icon={<Groups />}
            tooltipTitle="Team View"
            onClick={() => {}}
          />
        </SpeedDial>
      )}
    </Container>
  );
};

CompactSalesDashboard.displayName = 'CompactSalesDashboard';export default CompactSalesDashboard;