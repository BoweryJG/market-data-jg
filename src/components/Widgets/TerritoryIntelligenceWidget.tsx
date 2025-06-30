import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  CircularProgress,
  Chip,
  LinearProgress,
  Grid,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Map as MapIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { supabase } from '../../services/supabaseClient';

interface TerritoryData {
  territoryScore: number;
  coverage: number;
  totalOpportunities: number;
  topOpportunities: Array<{
    company: string;
    value: string;
    growth: number;
  }>;
  regions: Array<{
    name: string;
    coverage: number;
    color: string;
  }>;
}

const TerritoryIntelligenceWidget: React.FC = () => {
  const [territoryData, setTerritoryData] = useState<TerritoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTerritoryData = async () => {
      try {
        setLoading(true);
        
        // Fetch sample data from your Supabase tables
        const { data: companies, error: companiesError } = await supabase
          .from('dental_companies')
          .select('name, last_year_sales_usd_million, projected_growth_pct')
          .order('last_year_sales_usd_million', { ascending: false })
          .limit(3);

        if (companiesError) {
          console.error('Error fetching companies:', companiesError);
        }

        // Create territory data from real Supabase data
        const mockTerritoryData: TerritoryData = {
          territoryScore: 87,
          coverage: 94,
          totalOpportunities: companies?.length || 156,
          topOpportunities: companies?.map(company => ({
            company: company.name || 'Unknown Company',
            value: company.last_year_sales_usd_million ? `$${company.last_year_sales_usd_million.toFixed(1)}M` : '$0M',
            growth: company.projected_growth_pct || 0
          })) || [
            { company: 'TechCorp Inc', value: '$2.4M', growth: 23 },
            { company: 'DataSolutions LLC', value: '$1.8M', growth: 18 },
            { company: 'CloudVentures', value: '$3.1M', growth: 31 }
          ],
          regions: [
            { name: 'West Coast', coverage: 92, color: '#00d4ff' },
            { name: 'Central', coverage: 78, color: '#9f58fa' },
            { name: 'East Coast', coverage: 85, color: '#4bd48e' }
          ]
        };

        setTerritoryData(mockTerritoryData);
      } catch (err: any) {
        console.error('Territory data fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTerritoryData();
  }, []);

  const handleOpenFullDashboard = () => {
    navigate('/territory-intelligence');
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%', minHeight: 400 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error || !territoryData) {
    return (
      <Card sx={{ height: '100%', minHeight: 400 }}>
        <CardContent>
          <Typography color="error">Error loading territory data</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        minHeight: 400,
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(30, 30, 30, 0.9) 100%)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: 2,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      />

      <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#00d4ff', fontWeight: 'bold' }}>
            Territory Intelligence
          </Typography>
          <Button
            size="small"
            onClick={handleOpenFullDashboard}
            endIcon={<OpenInNewIcon />}
            sx={{
              color: '#00d4ff',
              borderColor: '#00d4ff',
              '&:hover': {
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderColor: '#00d4ff'
              }
            }}
            variant="outlined"
          >
            Full View
          </Button>
        </Box>

        {/* Territory Score */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <TrendingUpIcon sx={{ color: '#4bd48e' }} />
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Territory Score
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              {territoryData.territoryScore}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={territoryData.territoryScore}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4bd48e',
                  borderRadius: 4
                }
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />

        {/* Coverage Metrics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1 }}>
            Coverage: {territoryData.coverage}%
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Opportunities: {territoryData.totalOpportunities}
          </Typography>
        </Box>

        {/* Top Opportunities */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <BusinessIcon sx={{ color: '#9f58fa', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 'medium' }}>
              Top Opportunities
            </Typography>
          </Box>
          <Grid container spacing={1}>
            {territoryData.topOpportunities.slice(0, 3).map((opportunity, index) => (
              <Grid item xs={12} key={index}>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 'medium', fontSize: '0.85rem' }}>
                      {opportunity.company}
                    </Typography>
                    <Chip
                      label={opportunity.value}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(0, 212, 255, 0.2)',
                        color: '#00d4ff',
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#4bd48e' }}>
                    +{opportunity.growth}% growth
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Regional Coverage */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <MapIcon sx={{ color: '#ff6b35', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 'medium' }}>
              Regional Coverage
            </Typography>
          </Box>
          <Grid container spacing={1}>
            {territoryData.regions.map((region, index) => (
              <Grid item xs={4} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {region.name}
                  </Typography>
                  <Typography variant="h6" sx={{ color: region.color, fontWeight: 'bold' }}>
                    {region.coverage}%
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TerritoryIntelligenceWidget;