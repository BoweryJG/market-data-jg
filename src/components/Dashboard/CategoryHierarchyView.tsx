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
  Badge,
  Tooltip,
  IconButton,
  Skeleton
} from '@mui/material';
import { keyframes } from '@emotion/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import BuildIcon from '@mui/icons-material/Build';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NatureIcon from '@mui/icons-material/Nature';
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
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import HubIcon from '@mui/icons-material/Hub';
import CategoryIcon from '@mui/icons-material/Category';
import { CategoryHierarchy } from '../../types';

// Material UI icons map with proper MUI components and individual colors
const iconMap: Record<string, React.ReactNode> = {
  search: <SearchIcon sx={{ color: '#1976d2' }} />,
  shield: <SecurityIcon sx={{ color: '#2e7d32' }} />,
  build: <BuildIcon sx={{ color: '#ed6c02' }} />,
  auto_awesome: <AutoAwesomeIcon sx={{ color: '#9c27b0' }} />,
  medical_services: <MedicalServicesIcon sx={{ color: '#d32f2f' }} />,
  emoji_nature: <NatureIcon sx={{ color: '#388e3c' }} />,
  grass: <GrassIcon sx={{ color: '#4caf50' }} />,
  architecture: <ArchitectureIcon sx={{ color: '#795548' }} />,
  straighten: <StraightenIcon sx={{ color: '#607d8b' }} />,
  add_circle: <AddCircleIcon sx={{ color: '#2196f3' }} />,
  computer: <ComputerIcon sx={{ color: '#3f51b5' }} />,
  face: <FaceIcon sx={{ color: '#ff9800' }} />,
  colorize: <ColorizeIcon sx={{ color: '#e91e63' }} />,
  accessibility: <AccessibilityIcon sx={{ color: '#00bcd4' }} />,
  grain: <GrainIcon sx={{ color: '#8bc34a' }} />,
  brush: <BrushIcon sx={{ color: '#ff5722' }} />,
  healing: <HealingIcon sx={{ color: '#4caf50' }} />,
  online_prediction: <OnlinePredictionIcon sx={{ color: '#673ab7' }} />,
  flash_on: <FlashOnIcon sx={{ color: '#ffc107' }} />,
  dashboard_customize: <DashboardCustomizeIcon sx={{ color: '#009688' }} />,
  // Subcategories
  wallpaper: <WallpaperIcon sx={{ color: '#795548' }} />,
  fact_check: <FactCheckIcon sx={{ color: '#4caf50' }} />,
  hub: <HubIcon sx={{ color: '#3f51b5' }} />,
  // Default fallback
  category: <CategoryIcon sx={{ color: '#757575' }} />,
};

interface CategoryHierarchyViewProps {
  categories: CategoryHierarchy[];
  industry: string;
  selectedIndustry: 'dental' | 'aesthetic';
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  loading: boolean;
}

const CategoryHierarchyView: React.FC<CategoryHierarchyViewProps> = ({
  categories,
  industry,
  selectedIndustry,
  selectedCategory,
  onSelectCategory,
  loading
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: none; }
  `;

  const pulse = keyframes`
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(0.96); }
    100% { opacity: 1; transform: scale(1); }
  `;

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

  // Growth indicator component
  const GrowthIndicator = ({ growth }: { growth?: number }) => {
    if (!growth) return <span>-</span>;
    
    let color = '#2196f3'; // info color
    if (growth > 15) color = '#4caf50'; // success color
    else if (growth < 5) color = '#ff9800'; // warning color
    
    return (
      <span style={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        fontSize: '0.8rem',
        color: color,
        fontWeight: 500
      }}>
        <TrendingUpIcon fontSize="small" style={{ marginRight: 4 }} />
        {`${growth.toFixed(1)}%`}
      </span>
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
            position: 'relative',
            pl: 2 + level * 2,
            bgcolor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            opacity: 0,
            transform: 'translateY(4px)',
            animation: `${fadeIn} 0.3s ease forwards`,
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              opacity: 1,
              transform: 'none'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: isSelected ? '4px' : 0,
              backgroundColor: category.color_code || '#1976d2',
              animation: isSelected ? `${pulse} 2s infinite` : 'none',
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none'
              }
            },
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
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" component="span">
                  {category.name}
                </Typography>
                {category.is_featured && (
                  <Chip
                    size="small"
                    label="Featured"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
            }
            secondaryTypographyProps={{ component: 'div' }}
            secondary={
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip title="Growth Rate" placement="top">
                    <span>
                      <GrowthIndicator growth={category.avg_growth_rate} />
                    </span>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip title="Market Size" placement="top">
                    <span>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={formatMarketSize(category.market_size_usd_millions)}
                        icon={<MonetizationOnIcon fontSize="small" />}
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            }
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
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={40}
                animation="wave"
                sx={{ mb: 1, borderRadius: 1 }}
              />
            ))}
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

CategoryHierarchyView.displayName = 'CategoryHierarchyView';

export default CategoryHierarchyView;
