import React, { useMemo, useState, useEffect } from 'react';
import { keyframes } from '@emotion/react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Chip,
  Tooltip,
  LinearProgress,
  Divider
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PieChartIcon from '@mui/icons-material/PieChart';

interface Procedure {
  id: number;
  name?: string;
  procedure_name?: string;
  category?: string;
  clinical_category?: string;
  yearly_growth_percentage?: number;
  market_size_usd_millions?: number;
  [key: string]: any;
}

interface MarketSizeOverviewProps {
  dentalProcedures: Procedure[];
  aestheticProcedures: Procedure[];
  selectedIndustry: 'dental' | 'aesthetic';
}

// Utility function to format market size
export const formatMarketSize = (sizeInMillions: number | null | undefined): string => {
  if (sizeInMillions == null) return 'N/A';
  
  // For values in billions (1000+ million)
  if (sizeInMillions >= 1000) {
    // Convert to billions with 1 decimal place
    return `$${(sizeInMillions / 1000).toFixed(1)}B`;
  } else {
    // Keep as millions with 1 decimal place
    return `$${sizeInMillions.toFixed(1)}M`;
  }
};

// Enhanced format for detailed display
const formatMarketSizeDetailed = (sizeInMillions: number | null | undefined): string => {
  if (sizeInMillions == null) return 'N/A';
  
  if (sizeInMillions >= 1000) {
    // For values in billions, show both formats
    return `$${(sizeInMillions / 1000).toFixed(1)} billion`;
  } else {
    // For values in millions
    return `$${sizeInMillions.toFixed(1)} million`;
  }
};

// Utility function to format growth rate
const formatGrowthRate = (rate: number | null | undefined): string => {
  if (rate == null) return 'N/A';
  return `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`;
};

// Animation for pulsing effect on progress bars
// Avoid modifying the `transform` property so it doesn't
// interfere with LinearProgress's width calculations
const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
`;

export const MarketSizeOverview: React.FC<MarketSizeOverviewProps> = ({ 
  dentalProcedures,  
  aestheticProcedures,  
  selectedIndustry 
}) => {
  const currentProcedures = useMemo(() => 
    selectedIndustry === 'dental' ? dentalProcedures : aestheticProcedures,
    [selectedIndustry, dentalProcedures, aestheticProcedures]
  );
  
  // Calculate total market size
  const totalMarketSize = useMemo(
    () =>
      currentProcedures.reduce(
        (sum,  p) => sum + (Number(p.market_size_usd_millions) || 0),
        0
      ),
    [currentProcedures]
  );

  // Animated market size that slightly fluctuates
  const [animatedMarketSize, setAnimatedMarketSize] = useState(totalMarketSize);

  useEffect(() => {
    setAnimatedMarketSize(totalMarketSize);
    const id = setInterval(() => {
      setAnimatedMarketSize(totalMarketSize + (Math.random() - 0.5) * 0.1);
    }, 2000);
    return () => clearInterval(id);
  }, [totalMarketSize]);
  
  // Calculate average growth rate
  const averageGrowthRate = useMemo(() => {
    const procedures = currentProcedures.filter(
      p => p.yearly_growth_percentage != null
    );
    if (procedures.length === 0) return null;
    return (
      procedures.reduce(
        (sum,  p) => sum + (Number(p.yearly_growth_percentage) || 0),
        0
      ) / procedures.length
    );
  }, [currentProcedures]);
  
  // Calculate category market sizes
  const categoryMarketSizes = useMemo(() => {
    const categories = new Map<string, number>();
    
    currentProcedures.forEach(p => {
      const category = p.category || p.clinical_category || 'Unknown';
      const size = Number(p.market_size_usd_millions) || 0;
      categories.set(category, (categories.get(category) || 0) + size);
    });
    
    return Array.from(categories.entries())
      .sort((a,  b) => b[1] - a[1])
      .slice(0, 5); // Top 5 categories
  }, [currentProcedures]);

  // Find the largest category for scaling
  const largestCategorySize = categoryMarketSizes.length > 0 ? categoryMarketSizes[0][1] : 0;

  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" gutterBottom>
            Market Size Overview - {selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)} Industry
          </Typography>
          <Tooltip title="Market sizes are shown in millions/billions of US dollars. Data is based on latest industry research.">
            <InfoOutlinedIcon color="action" fontSize="small" />
          </Tooltip>
        </Box>
        
        <Grid container spacing={3}>
          {/* Total Market Size */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', height: '100%', borderRadius: 2 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Total Market Size</Typography>
              </Box>
              <Box display="flex" alignItems="baseline">
                <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                  {formatMarketSize(animatedMarketSize)}
                </Typography>
                <Tooltip title={formatMarketSizeDetailed(animatedMarketSize)}>
                  <InfoOutlinedIcon sx={{ ml: 1, fontSize: '0.9rem', color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Across {currentProcedures.length} procedures
              </Typography>
            </Paper>
          </Grid>
          
          {/* Avg Growth Rate */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', height: '100%', borderRadius: 2 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Average Annual Growth</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                {formatGrowthRate(averageGrowthRate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Year-over-year market expansion
              </Typography>
            </Paper>
          </Grid>
          
          {/* Largest Market */}
          {/* Procedure Count */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', height: '100%', borderRadius: 2 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <PieChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Market Composition</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                {categoryMarketSizes.length} Categories
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {categoryMarketSizes.length > 0 ? `Largest: ${categoryMarketSizes[0][0]}` : 'No categories found'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Category breakdown */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Top Categories by Market Size
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          {categoryMarketSizes.map(([category,  size], index) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2">
                  {category}
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" fontWeight="medium">
                    {formatMarketSize(size)}
                  </Typography>
                  <Tooltip title={formatMarketSizeDetailed(size)}>
                    <InfoOutlinedIcon sx={{ ml: 1, fontSize: '0.9rem', color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(size / largestCategorySize) * 100}
                sx={{
                  height: 8,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: index === 0 ? 'primary.main' :
                             index === 1 ? 'info.main' :
                             index === 2 ? 'success.main' :
                             index === 3 ? 'warning.main' : 'secondary.main',
                     animation: `${pulse} 2s infinite`,
                     '@media (prefers-reduced-motion: reduce)': {
                       animation: 'none'
                     }
                  }
                }}
              />
            </Box>
          ))}
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Note: Market sizes are in US dollars. Source: Latest industry research data, 2025.
        </Typography>
      </CardContent>
    </Card>
  );
};


MarketSizeOverview.displayName = 'MarketSizeOverview';export default MarketSizeOverview;
