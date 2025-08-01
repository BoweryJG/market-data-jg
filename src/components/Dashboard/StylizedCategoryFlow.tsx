import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Badge,
  Tooltip,
  LinearProgress,
  Grid,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Button,
  Switch,
  FormControlLabel,
  Paper,
  Stack,
  Divider,
  Avatar,
  AvatarGroup,
  styled,
  alpha,
  useTheme,
  keyframes,
  Fade,
  Grow,
  Zoom
} from '@mui/material';
import {
  Category as CategoryIcon,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  ExpandMore,
  ExpandLess,
  LocalFireDepartment,
  AutoAwesome,
  Whatshot,
  BubbleChart,
  Timeline,
  AccountTree,
  Insights,
  Speed,
  AttachMoney,
  Groups,
  Flag,
  AutoMode,
  CheckCircle,
  RadioButtonUnchecked,
  Star,
  StarBorder,
  ElectricBolt,
  Psychology,
  Rocket,
  Warning,
  Info,
  WorkspacePremium,
  EmojiEvents,
  Visibility,
  VisibilityOff,
  Add,
  Remove,
  Circle,
  Square,
  Hexagon,
  FilterList,
  Sort,
  MoreVert,
  Launch,
  CloudSync,
  PlayCircle,
  PauseCircle,
  Settings,
  Bookmark,
  BookmarkBorder,
  Schedule,
  Assignment,
  AssignmentTurnedIn,
  CrisisAlert,
  Lightbulb,
  Science,
  Engineering,
  HealthAndSafety,
  MedicalServices,
  Face,
  SentimentSatisfied,
  MonetizationOn,
  ShowChart,
  DonutLarge,
  PieChart,
  BarChart,
  BubbleChartTwoTone,
  NetworkCheck,
  Hub,
  DeviceHub,
  Spa,
  LocalHospital,
  Healing,
  ColorLens,
  Brush,
  AutoFixHigh,
  FlashOn,
  Bolt,
  PowerSettingsNew,
  Tune
} from '@mui/icons-material';

import { supabase } from '../../services/supabaseClient';

import { logger } from '../../services/logging/logger';
import { errorToLogData } from '../../utils/loggerHelpers';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
`;

const flow = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
  100% { box-shadow: 0 0 5px currentColor; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(-5deg); }
  75% { transform: translateY(5px) rotate(5deg); }
`;

// Styled Components
const CategoryFlowContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.primary.main, 0.05)})`,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
    animation: `${flow} 8s linear infinite`,
  }
}));

const CategoryNode = styled(Card, { shouldForwardProp: (prop) => !['size', 'growth', 'priority'].includes(prop as string) })<{ size?: 'large' | 'medium' | 'small'; growth?: number; priority?: string }>(({ theme, size = 'medium', growth = 0, priority = 'normal' }) => ({
  position: 'relative',
  width: size === 'large' ? 280 : size === 'medium' ? 220 : 180,
  height: size === 'large' ? 180 : size === 'medium' ? 150 : 120,
  cursor: 'pointer',
  overflow: 'visible',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: priority === 'high' ? `${pulse} 2s infinite` : undefined,
  background: `radial-gradient(circle at top right, ${
    growth > 10 ? alpha(theme.palette.success.main, 0.2) :
    growth > 0 ? alpha(theme.palette.info.main, 0.2) :
    alpha(theme.palette.error.main, 0.1)
  }, ${alpha(theme.palette.background.paper, 0.95)})`,
  border: `2px solid ${
    priority === 'high' ? theme.palette.error.main :
    priority === 'medium' ? theme.palette.warning.main :
    alpha(theme.palette.divider, 0.3)
  }`,
  boxShadow: priority === 'high' ? `0 0 20px ${alpha(theme.palette.error.main, 0.4)}` : theme.shadows[3],
  '&:hover': {
    transform: 'translateY(-8px) scale(1.05)',
    boxShadow: theme.shadows[20],
    border: `2px solid ${theme.palette.primary.main}`,
    '& .hover-actions': {
      opacity: 1,
    },
    '& .category-icon': {
      transform: 'rotate(360deg)',
    }
  },
  '& .category-icon': {
    transition: 'transform 0.5s ease',
  }
}));

const ProcedurePill = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 600,
  borderRadius: 12,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: theme.shadows[4],
  }
}));

const ConnectionLine = styled(Box)(({ theme, strength = 0.5 }: any) => ({
  position: 'absolute',
  height: 2,
  background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, strength)}, ${alpha(theme.palette.secondary.main, strength)})`,
  transform: 'translateY(-50%)',
  '&::after': {
    content: '""',
    position: 'absolute',
    right: -8,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 0,
    height: 0,
    borderLeft: `8px solid ${alpha(theme.palette.secondary.main, strength)}`,
    borderTop: '4px solid transparent',
    borderBottom: '4px solid transparent',
  }
}));

const MetricBadge = styled(Badge)(({ theme, trend }: any) => ({
  '& .MuiBadge-badge': {
    background: trend === 'up' ? theme.palette.success.main : 
               trend === 'down' ? theme.palette.error.main : 
               theme.palette.grey[500],
    color: theme.palette.common.white,
    fontWeight: 'bold',
    padding: '0 6px',
    height: 22,
    minWidth: 22,
  }
}));

const GlowingIcon = styled(Box)(({ theme, color = 'primary' }: any) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: alpha(theme.palette[color].main, 0.1),
  color: theme.palette[color].main,
  animation: `${glow} 2s ease-in-out infinite`,
}));

// Interfaces
interface CategoryData {
  id: number;
  name: string;
  parent_id: number | null;
  icon?: string;
  color?: string;
  market_size_usd_millions?: number;
  avg_growth_rate?: number;
  procedures?: ProcedureData[];
  subcategories?: CategoryData[];
  revenue_potential?: number;
  automation_enabled?: boolean;
  priority?: 'high' | 'medium' | 'low';
  trending?: boolean;
  innovation_score?: number;
  competitive_advantage?: string;
  key_players?: string[];
  entry_barriers?: 'high' | 'medium' | 'low';
  is_featured?: boolean;
}

interface ProcedureData {
  id: number;
  name: string;
  category_id: number;
  popularity_score?: number;
  avg_cost?: number;
  growth_rate?: number;
  complexity?: 'low' | 'medium' | 'high';
  reimbursement_rate?: number;
}

const categoryIcons: Record<string, any> = {
  'Diagnostic': MedicalServices,
  'Preventive': HealthAndSafety,
  'Restorative': Healing,
  'Cosmetic': Face,
  'Oral Surgery': LocalHospital,
  'Endodontic': Science,
  'Periodontic': Spa,
  'Prosthodontic': Engineering,
  'Orthodontic': AutoFixHigh,
  'Implantology': Bolt,
  'Digital Dentistry': DeviceHub,
  'Facial Aesthetic': ColorLens,
  'Injectables': Brush,
  'Body': SentimentSatisfied,
  'Skin': Spa,
  'Hair': AutoAwesome,
  'Minimally Invasive': FlashOn,
  'Regenerative': PowerSettingsNew,
  'Lasers': ElectricBolt,
  'default': CategoryIcon
};

const StylizedCategoryFlow: React.FC<{ industry: 'dental' | 'aesthetic' }> = ({ industry }) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [automationMode, setAutomationMode] = useState(false);
  const [viewMode, setViewMode] = useState<'flow' | 'hierarchy' | 'bubble'>('flow');
  const [loading, setLoading] = useState(true);
  
  const theme = useTheme();

  useEffect(() => {
    loadCategoryData();
  }, [industry]);

  const loadCategoryData = async () => {
    setLoading(true);
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from(industry === 'dental' ? 'dental_procedure_categories' : 'aesthetic_categories')
        .select('*')
        .order('display_order');

      // Load procedures
      const { data: proceduresData } = await supabase
        .from(industry === 'dental' ? 'dental_procedures' : 'aesthetic_procedures')
        .select('*');

      // Map procedures to categories
      const categoriesWithProcedures = (categoriesData || []).map(cat => ({
        ...cat,
        procedures: proceduresData?.filter(p => 
          p.category === cat.name || 
          p.category_id === cat.id ||
          p.clinical_category_id === cat.id ||
          p.aesthetic_category_id === cat.id
        ) || [],
        revenue_potential: Math.floor(Math.random() * 5000000) + 1000000,
        automation_enabled: Math.random() > 0.5,
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
        trending: Math.random() > 0.7,
        innovation_score: Math.floor(Math.random() * 100),
        entry_barriers: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
      }));

      // Build hierarchy
      const rootCategories = categoriesWithProcedures.filter(c => !c.parent_id);
      rootCategories.forEach(root => {
        root.subcategories = categoriesWithProcedures.filter(c => c.parent_id === root.id);
      });

      setCategories(rootCategories);
    } catch (error) {
      logger.error('Failed to load categories:', errorToLogData(error));
    } finally {
      setLoading(false);
    }
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

  const getCategoryIcon = (name: string) => {
    const Icon = categoryIcons[name] || categoryIcons.default;
    return Icon;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 10) return theme.palette.success.main;
    if (growth > 0) return theme.palette.info.main;
    return theme.palette.error.main;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const renderCategoryNode = (category: CategoryData, size: 'large' | 'medium' | 'small' = 'medium') => {
    const Icon = getCategoryIcon(category.name);
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategories.has(category.id);
    
    return (
      <CategoryNode
        key={category.id}
        size={size}
        growth={category.avg_growth_rate || 0}
        priority={category.priority}
        onClick={() => toggleCategorySelection(category.id)}
        sx={{
          border: isSelected ? `3px solid ${theme.palette.primary.main}` : undefined,
        }}
      >
        <CardContent sx={{ height: '100%', p: 2, position: 'relative' }}>
          {/* Priority Indicator */}
          {category.priority === 'high' && (
            <Box sx={{ position: 'absolute', top: -10, right: -10 }}>
              <LocalFireDepartment color="error" sx={{ fontSize: 30 }} />
            </Box>
          )}
          
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GlowingIcon color={category.avg_growth_rate! > 5 ? 'success' : 'primary'}>
                <Icon className="category-icon" />
              </GlowingIcon>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                  {category.name}
                </Typography>
                {category.trending && (
                  <Chip 
                    icon={<Whatshot />} 
                    label="Trending" 
                    size="small" 
                    color="error" 
                    sx={{ height: 18, mt: 0.5 }}
                  />
                )}
              </Box>
            </Box>
            
            {/* Automation Toggle */}
            {automationMode && (
              <Switch 
                size="small"
                checked={category.automation_enabled}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </Box>

          {/* Metrics */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Market Size</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                {formatCurrency(category.market_size_usd_millions ? category.market_size_usd_millions * 1000000 : 0)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Growth</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {category.avg_growth_rate! > 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: getGrowthColor(category.avg_growth_rate || 0)
                  }}
                >
                  {Math.abs(category.avg_growth_rate || 0).toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Innovation Score */}
          {category.innovation_score && category.innovation_score > 70 && (
            <LinearProgress 
              variant="determinate" 
              value={category.innovation_score} 
              sx={{ 
                mb: 1, 
                height: 4, 
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }
              }}
            />
          )}

          {/* Procedures Preview */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {category.procedures?.slice(0, 3).map((proc, idx) => (
              <ProcedurePill
                key={proc.id}
                label={proc.name.length > 15 ? proc.name.substring(0, 15) + '...' : proc.name}
                size="small"
                sx={{ 
                  fontSize: '0.7rem',
                  height: 20,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  animation: proc.growth_rate! > 10 ? `${float} 3s ease-in-out infinite` : undefined,
                  animationDelay: `${idx * 0.2}s`
                }}
              />
            ))}
            {category.procedures && category.procedures.length > 3 && (
              <Chip 
                label={`+${category.procedures.length - 3}`} 
                size="small" 
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>

          {/* Hover Actions */}
          <Box 
            className="hover-actions" 
            sx={{ 
              position: 'absolute',
              bottom: 8,
              right: 8,
              opacity: 0,
              transition: 'opacity 0.2s ease',
              display: 'flex',
              gap: 0.5
            }}
          >
            <IconButton size="small" color="primary">
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton size="small" color="secondary">
              <Flag fontSize="small" />
            </IconButton>
            <IconButton size="small">
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>

          {/* Expand/Collapse for subcategories */}
          {category.subcategories && category.subcategories.length > 0 && (
            <IconButton 
              size="small" 
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
              sx={{ position: 'absolute', bottom: 4, left: 4 }}
            >
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </CardContent>
      </CategoryNode>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <CategoryFlowContainer>
      {/* Header Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BubbleChart color="primary" />
            Category Intelligence Map
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {categories.reduce((sum, cat) => sum + (cat.procedures?.length || 0), 0)} procedures across {categories.length} categories
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, val) => val && setViewMode(val)}
            size="small"
          >
            <ToggleButton value="flow">
              <Timeline />
            </ToggleButton>
            <ToggleButton value="hierarchy">
              <AccountTree />
            </ToggleButton>
            <ToggleButton value="bubble">
              <BubbleChart />
            </ToggleButton>
          </ToggleButtonGroup>
          
          <FormControlLabel
            control={
              <Switch 
                checked={automationMode} 
                onChange={(e) => setAutomationMode(e.target.checked)}
                color="secondary"
              />
            }
            label="CRM Mode"
          />
        </Box>
      </Box>

      {/* Selected Categories Actions */}
      {selectedCategories.size > 0 && (
        <Fade in>
          <Paper sx={{ p: 2, mb: 2, background: alpha(theme.palette.primary.main, 0.05) }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2">
                {selectedCategories.size} categories selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" startIcon={<AutoMode />}>
                  Enable Automation
                </Button>
                <Button size="small" startIcon={<Flag />}>
                  Flag for Follow-up
                </Button>
                <Button size="small" startIcon={<CloudSync />}>
                  Sync to CRM
                </Button>
                <Button size="small" color="error" onClick={() => setSelectedCategories(new Set())}>
                  Clear
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Category Flow Visualization */}
      {viewMode === 'flow' && (
        <Box sx={{ position: 'relative', minHeight: 400 }}>
          <Grid container spacing={3}>
            {categories.map((category, idx) => (
              <Grid item xs={12} md={6} lg={4} key={category.id}>
                <Grow in timeout={300 + idx * 100}>
                  <Box>
                    {renderCategoryNode(category, category.is_featured ? 'large' : 'medium')}
                    
                    {/* Subcategories */}
                    <Collapse in={expandedCategories.has(category.id)}>
                      <Box sx={{ ml: 4, mt: 2 }}>
                        <Grid container spacing={2}>
                          {category.subcategories?.map(subcat => (
                            <Grid item xs={12} key={subcat.id}>
                              {renderCategoryNode(subcat, 'small')}
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Collapse>
                  </Box>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Bottom Stats Bar */}
      <Paper sx={{ mt: 3, p: 2, background: alpha(theme.palette.background.default, 0.5) }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney color="success" />
              <Box>
                <Typography variant="caption" color="text.secondary">Total Market Size</Typography>
                <Typography variant="h6" color="success.main">
                  ${(categories.reduce((sum, cat) => sum + (cat.market_size_usd_millions || 0), 0) / 1000).toFixed(1)}B
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary">Avg Growth Rate</Typography>
                <Typography variant="h6" color="primary.main">
                  {(categories.reduce((sum, cat) => sum + (cat.avg_growth_rate || 0), 0) / categories.length).toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome color="warning" />
              <Box>
                <Typography variant="caption" color="text.secondary">High Priority</Typography>
                <Typography variant="h6" color="warning.main">
                  {categories.filter(c => c.priority === 'high').length} categories
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoMode color="secondary" />
              <Box>
                <Typography variant="caption" color="text.secondary">Automated</Typography>
                <Typography variant="h6" color="secondary.main">
                  {categories.filter(c => c.automation_enabled).length} active
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </CategoryFlowContainer>
  );
};

StylizedCategoryFlow.displayName = 'StylizedCategoryFlow';export default StylizedCategoryFlow;