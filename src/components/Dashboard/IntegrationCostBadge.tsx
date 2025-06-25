import React from 'react';
import { Box, Chip, Tooltip, Typography, useTheme, alpha } from '@mui/material';
import {
  AttachMoney,
  School,
  Build,
  CheckCircle,
  Search,
  Calculate,
  Help,
  TrendingUp,
} from '@mui/icons-material';

interface IntegrationCostBadgeProps {
  min?: number;
  max?: number;
  equipment_min?: number;
  equipment_max?: number;
  training?: number;
  confidence?: 'verified' | 'researched' | 'calculated' | 'estimated';
  roi_months?: number;
  procedureName?: string;
  averageProcedureCost?: number;
}

export const IntegrationCostBadge: React.FC<IntegrationCostBadgeProps> = ({
  min = 0,
  max = 0,
  equipment_min,
  equipment_max,
  training = 0,
  confidence = 'estimated',
  roi_months,
  procedureName,
  averageProcedureCost,
}) => {
  const theme = useTheme();
  
  // Determine color based on cost range
  const getColor = () => {
    if (max < 50000) return theme.palette.success.main;
    if (max < 150000) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const color = getColor();
  
  // Format cost display
  const formatCost = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };
  
  // Get confidence icon
  const getConfidenceIcon = () => {
    switch (confidence) {
      case 'verified':
        return <CheckCircle sx={{ fontSize: 14 }} />;
      case 'researched':
        return <Search sx={{ fontSize: 14 }} />;
      case 'calculated':
        return <Calculate sx={{ fontSize: 14 }} />;
      default:
        return <Help sx={{ fontSize: 14 }} />;
    }
  };
  
  // Calculate monthly payment estimate
  const monthlyPayment = max > 0 ? Math.round(max / 60) : 0; // 5-year financing
  
  // Calculate break-even volume if procedure cost available
  const breakEvenVolume = averageProcedureCost && averageProcedureCost > 0 
    ? Math.ceil(max / (averageProcedureCost * 0.6)) // Assuming 60% profit margin
    : null;
  
  const tooltipContent = (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Integration Cost Breakdown
      </Typography>
      
      {equipment_min !== undefined && equipment_max !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Build sx={{ fontSize: 16, mr: 1 }} />
          <Typography variant="body2">
            Equipment: {formatCost(equipment_min)} - {formatCost(equipment_max)}
          </Typography>
        </Box>
      )}
      
      {training > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <School sx={{ fontSize: 16, mr: 1 }} />
          <Typography variant="body2">
            Training: {formatCost(training)}
          </Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <AttachMoney sx={{ fontSize: 16, mr: 1 }} />
        <Typography variant="body2">
          Total: {formatCost(min)} - {formatCost(max)}
        </Typography>
      </Box>
      
      {monthlyPayment > 0 && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: theme.palette.text.secondary }}>
          ~{formatCost(monthlyPayment)}/month (60 mo. financing)
        </Typography>
      )}
      
      {roi_months && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <TrendingUp sx={{ fontSize: 16, mr: 1, color: theme.palette.success.main }} />
          <Typography variant="caption" sx={{ color: theme.palette.success.main }}>
            ROI: ~{roi_months} months
          </Typography>
        </Box>
      )}
      
      {breakEvenVolume && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
          Break-even: ~{breakEvenVolume} procedures
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
        {getConfidenceIcon()}
        <Typography variant="caption" sx={{ ml: 0.5, textTransform: 'capitalize' }}>
          {confidence} pricing
        </Typography>
      </Box>
    </Box>
  );
  
  if (min === 0 && max === 0) {
    return (
      <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
        -
      </Typography>
    );
  }
  
  return (
    <Tooltip title={tooltipContent} arrow placement="left">
      <Chip
        label={`${formatCost(min)}-${formatCost(max)}`}
        size="small"
        icon={<AttachMoney sx={{ fontSize: 16 }} />}
        sx={{
          bgcolor: alpha(color, 0.1),
          color: color,
          border: `1px solid ${alpha(color, 0.3)}`,
          fontWeight: 'bold',
          '& .MuiChip-icon': {
            color: color,
          },
          cursor: 'pointer',
          '&:hover': {
            bgcolor: alpha(color, 0.2),
          },
        }}
      />
    </Tooltip>
  );
};

export default IntegrationCostBadge;