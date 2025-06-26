import React from 'react';
import { Box, Chip, Tooltip, Typography, useTheme, alpha } from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  Calculate,
  Speed,
} from '@mui/icons-material';

interface IntegrationCalculatorProps {
  upfrontCost: number;
  ongoingCost: number;
  commissionPercentage: number;
  projectedRevenue: number;
  roi_percentage: number;
  roi_months: number;
  procedureName: string;
  averageProcedureCost: number;
}

const IntegrationCalculator: React.FC<IntegrationCalculatorProps> = ({
  upfrontCost,
  ongoingCost,
  commissionPercentage,
  projectedRevenue,
  roi_percentage,
  roi_months,
  procedureName,
  averageProcedureCost,
}) => {
  const theme = useTheme();
  
  const getROIColor = () => {
    if (roi_percentage > 150) return theme.palette.success.main;
    if (roi_percentage > 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const roiColor = getROIColor();
  
  return (
    <Tooltip
      title={
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Integration ROI Analysis
          </Typography>
          <Typography variant="caption" display="block">
            Procedure: {procedureName}
          </Typography>
          <Typography variant="caption" display="block">
            Avg Cost: ${averageProcedureCost.toLocaleString()}
          </Typography>
          <Box sx={{ mt: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`, pt: 1 }}>
            <Typography variant="caption" display="block">
              Upfront: ${upfrontCost.toLocaleString()}
            </Typography>
            <Typography variant="caption" display="block">
              Monthly: ${ongoingCost.toLocaleString()}
            </Typography>
            <Typography variant="caption" display="block">
              Commission: {commissionPercentage}%
            </Typography>
          </Box>
          <Box sx={{ mt: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`, pt: 1 }}>
            <Typography variant="caption" display="block" sx={{ color: roiColor }}>
              Projected Revenue: ${projectedRevenue.toLocaleString()}/yr
            </Typography>
            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
              ROI: {roi_percentage}% in {roi_months} months
            </Typography>
          </Box>
        </Box>
      }
      placement="left"
      arrow
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Chip
          icon={<TrendingUp sx={{ fontSize: 14 }} />}
          label={`${roi_percentage}%`}
          size="small"
          sx={{
            bgcolor: alpha(roiColor, 0.1),
            color: roiColor,
            border: `1px solid ${alpha(roiColor, 0.3)}`,
            fontWeight: 'bold',
            fontSize: '0.75rem',
          }}
        />
        <Chip
          icon={<Speed sx={{ fontSize: 14 }} />}
          label={`${roi_months}mo`}
          size="small"
          variant="outlined"
          sx={{
            fontSize: '0.7rem',
          }}
        />
      </Box>
    </Tooltip>
  );
};

export default IntegrationCalculator;