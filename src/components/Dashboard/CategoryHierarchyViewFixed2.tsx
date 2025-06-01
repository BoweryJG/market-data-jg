import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  LinearProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import ShieldIcon from '@mui/icons-material/Shield';
import BuildIcon from '@mui/icons-material/Build';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import GrassIcon from '@mui/icons-material/Grass';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import StraightenIcon from '@mui/icons-material/Straighten';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ComputerIcon from '@mui/icons-material/Computer';
import FaceIcon from '@mui/icons-material/Face';
import ColorizeIcon from '@mui/icons-material/Colorize';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import GrainIcon from '@mui/icons-material/Grain';
import BrushIcon from '@mui/icons-material/Brush';
import HealingIcon from '@mui/icons-material/Healing';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import CategoryIcon from '@mui/icons-material/Category';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import HubIcon from '@mui/icons-material/Hub';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import type { CategoryHierarchy } from '../../types/index';

// Proper Material UI icons map using actual icon components
const iconMap: Record<string, React.ReactNode> = {
  search: <SearchIcon />,
  shield: <ShieldIcon />,
  build: <BuildIcon />,
  auto_awesome: <AutoAwesomeIcon />,
  medical_services: <MedicalServicesIcon />,
  emoji_nature: <EmojiNatureIcon />,
  grass: <GrassIcon />,
  architecture: <ArchitectureIcon />,
  straighten: <StraightenIcon />,
  add_circle: <AddCircleIcon />,
  computer: <ComputerIcon />,
  face: <FaceIcon />,
  colorize: <ColorizeIcon />,
  accessibility: <AccessibilityIcon />,
  grain: <GrainIcon />,
  brush: <BrushIcon />,
  healing: <HealingIcon />,
  online_prediction: <HealingIcon />,
  flash_on: <FlashOnIcon />,
  dashboard_customize: <DashboardCustomizeIcon />,
  // Subcategories
  wallpaper: <WallpaperIcon />,
  fact_check: <FactCheckIcon />,
  hub: <HubIcon />,
  // Default fallback
  category: <CategoryIcon />,
};

interface CategoryHierarchyViewProps {
  categories: CategoryHierarchy[];
  selectedIndustry: 'dental' | 'aesthetic';
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  loading: boolean;
}

const CategoryHierarchyView: React.FC<CategoryHierarchyViewProps> = ({
  categories,
  selectedIndustry,
  selectedCategory,
  onSelectCategory,
  loading
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  // Filter top-level categories for current industry
  const topLevelCategories = categories.filter(
    cat => cat.parent_id === null && 
    (cat.applicable_to === selectedIndustry || cat.applicable_to === 'both')
  ).sort((a, b) => (a.display_order || 999) - (b.display_order || 999));

  // Find child categories for a parent
  const getChildCategories = (parentId: number) => {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .sort((a, b) => (a.display_order || 999) - (b.display_order || 999));
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Format market size for display
  const formatMarketSize = (sizeInMillions?: number) => {
    if (!sizeInMillions) return 'Unknown';
    if (sizeInMillions >= 1000) {
      return `$${(sizeInMillions / 1000).toFixed(1)}B`;
    }
    return `$${sizeInMillions}M`;
  };

  // Growth indicator component - Fixed to avoid DOM nesting issues
  const GrowthIndicator = ({ growth }: { growth?: number }) => {
    if (!growth) return <span>-</span>;
    
    let color = 'info';
    if (growth > 15) color = 'success';
    else if (growth < 5) color = 'warning';
    
    return (
      <Chip 
        size="small"
        color={color as any}
        label={`${growth.toFixed(1)}%`}
        icon={<TrendingUpIcon fontSize="small" />}
        sx={{ fontSize: '0.8rem' }}
      />
    );
  };

  // Render a category item
  const renderCategoryItem = (category: CategoryHierarchy, level = 0) => {
    const isExpanded = expandedCategories[category.id] || false;
    const isSelected = selectedCategory === category.id;
    const childCategories = getChildCategories(category.id);
    const hasChildren = childCategories.length > 0;
    
    // Get icon from map or use default
    const icon = category.icon_name && iconMap[category.icon_name] 
      ? iconMap[category.icon_name] 
      : iconMap.category;
    
    return (
      <React.Fragment key={category.id}>
        <ListItem 
          button
          selected={isSelected}
          onClick={() => onSelectCategory(category.id)}
          sx={{ 
            pl: 2 + level * 2,
            borderLeft: isSelected ? `4px solid ${category.color_code || '#1976d2'}` : 'none',
            bgcolor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            '&:hover': {
              bgcolor: 'rgba(25, 118, 210, 0.04)',
            }
          }}
        >
          <ListItemIcon sx={{ 
            color: category.color_code || 'inherit',
            minWidth: 36
          }}>
            {icon}
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
                <Typography variant="body1" component="span" sx={{ mr: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {category.name}
                </Typography>
                {category.is_featured && (
                  <Chip
                    size="small"
                    label="Featured"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 'auto', fontSize: '0.7rem', height: 20, flexShrink: 0 }}
                  />
                )}
              </Box>
            }
            // Fixed DOM nesting and layout issues
            secondary={
              <Box component="div" sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1, flexWrap: 'nowrap' }}>
                <Chip 
                  size="small"
                  color={category.avg_growth_rate && category.avg_growth_rate > 15 ? 'success' : (category.avg_growth_rate && category.avg_growth_rate < 5 ? 'warning' : 'info')}
                  label={category.avg_growth_rate ? `${category.avg_growth_rate.toFixed(1)}%` : '-'}
                  icon={<TrendingUpIcon fontSize="small" />}
                  sx={{ fontSize: '0.75rem', flexShrink: 0 }}
                />
                
                <Chip
                  size="small"
                  variant="outlined"
                  label={formatMarketSize(category.market_size_usd_millions)}
                  icon={<MonetizationOnIcon fontSize="small" />}
                  sx={{ fontSize: '0.75rem', flexShrink: 0 }}
                />
              </Box>
            }
            secondaryTypographyProps={{ component: 'div' }} // Fix DOM nesting
            sx={{ overflow: 'hidden' }}
          />
          
          {hasChildren && (
            <IconButton 
              edge="end" 
              size="small"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {childCategories.map(child => renderCategoryItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Card variant="outlined" sx={{ mb: 2, height: '100%' }}>
      <CardContent sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" color="primary">
            Categories
          </Typography>
          <Tooltip title="Categories are organized in a hierarchy with market insights">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Divider sx={{ mb: 1 }} />
        
        {loading ? (
          <Box sx={{ px: 2, py: 1 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Loading categories...
            </Typography>
          </Box>
        ) : (
          <List dense component="nav" sx={{ maxHeight: 500, overflow: 'auto' }}>
            {topLevelCategories.map(category => renderCategoryItem(category))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryHierarchyView;
