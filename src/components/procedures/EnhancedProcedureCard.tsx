import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Tooltip,
  LinearProgress,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { EnhancedProcedure, formatMarketSize, getConfidenceColor, getMaturityColor } from '../../types/marketIntelligence';

interface EnhancedProcedureCardProps {
  procedure: EnhancedProcedure;
  onClick?: () => void;
  showProjections?: boolean;
}

export const EnhancedProcedureCard: React.FC<EnhancedProcedureCardProps> = ({
  procedure, 
  onClick, 
  showProjections = false, 
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const growthColor = (procedure.yearly_growth_percentage || 0) > 10 ? 'success' : 
                     (procedure.yearly_growth_percentage || 0) > 5 ? 'warning' : 'error';

  return (
    <Card
      sx={{
        height: expanded ? 'auto' : '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {procedure.procedure_name || procedure.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {procedure.category}
            </Typography>
          </Box>
          <Box display="flex" gap={0.5}>
            {procedure.market_maturity_stage && (
              <Chip
                label={procedure.market_maturity_stage}
                size="small"
                sx={{
                  backgroundColor: getMaturityColor(procedure.market_maturity_stage),
                  color: 'white',
                }}
              />
            )}
            <IconButton size="small" onClick={handleExpandClick}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Key Metrics Grid */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                2025 Market Size
              </Typography>
              <Typography variant="h6">
                {formatMarketSize(procedure.market_size_2025_usd_millions)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Growth Rate
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="h6">
                  {procedure.yearly_growth_percentage?.toFixed(1)}%
                </Typography>
                <TrendingUpIcon color={growthColor} fontSize="small" />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Confidence Score */}
        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Data Confidence
            </Typography>
            <Tooltip title={`Score: ${procedure.market_confidence_score}/10`}>
              <Typography variant="caption">
                {procedure.market_confidence_score}/10
              </Typography>
            </Tooltip>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(procedure.market_confidence_score || 0) * 10}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'grey.300',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getConfidenceColor(procedure.market_confidence_score),
              },
            }}
          />
        </Box>

        {/* Expandable Details */}
        <Collapse in={expanded}>
          <Box mt={3}>
            <Divider sx={{ mb: 2 }} />
            
            {/* 5-Year Projections */}
            {showProjections && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={0.5}>
                  <TimelineIcon fontSize="small" />
                  Market Projections
                </Typography>
                <Grid container spacing={1} mt={1}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">2026</Typography>
                    <Typography variant="body2">{formatMarketSize(procedure.market_size_2026_usd_millions)}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">2028</Typography>
                    <Typography variant="body2">{formatMarketSize(procedure.market_size_2028_usd_millions)}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">2030</Typography>
                    <Typography variant="body2">{formatMarketSize(procedure.market_size_2030_usd_millions)}</Typography>
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" mt={1}>
                  5-Year CAGR: {procedure.cagr_5year?.toFixed(1)}%
                </Typography>
              </Box>
            )}

            {/* Top Manufacturers */}
            {procedure.top_3_device_manufacturers && procedure.top_3_device_manufacturers.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={0.5}>
                  <BusinessIcon fontSize="small" />
                  Key Manufacturers
                </Typography>
                <Box mt={1}>
                  {procedure.top_3_device_manufacturers.map((manufacturer, _index) => (
                    <Chip
                      key={_index}
                      label={manufacturer}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Additional Intelligence */}
            <Grid container spacing={2}>
              {procedure.average_device_price && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Avg Device Price
                  </Typography>
                  <Typography variant="body2">
                    ${procedure.average_device_price.toLocaleString()}
                  </Typography>
                </Grid>
              )}
              {procedure.sales_cycle_days && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Sales Cycle
                  </Typography>
                  <Typography variant="body2">
                    {procedure.sales_cycle_days} days
                  </Typography>
                </Grid>
              )}
              {procedure.reimbursement_trend && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Reimbursement
                  </Typography>
                  <Typography variant="body2">
                    {procedure.reimbursement_trend}
                  </Typography>
                </Grid>
              )}
              {procedure.adoption_curve_stage && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Adoption Stage
                  </Typography>
                  <Typography variant="body2">
                    {procedure.adoption_curve_stage.replace('_', ' ')}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Regional Hotspots */}
            {procedure.regional_hotspots && procedure.regional_hotspots.length > 0 && (
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Regional Hotspots
                </Typography>
                <Typography variant="body2">
                  {procedure.regional_hotspots.join(', ')}
                </Typography>
              </Box>
            )}

            {/* Data Sources */}
            {procedure.data_verification_date && (
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Last verified: {new Date(procedure.data_verification_date).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

EnhancedProcedureCard.displayName = 'EnhancedProcedureCard';

export default EnhancedProcedureCard;