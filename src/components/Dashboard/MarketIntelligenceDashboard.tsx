import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { supabase } from '../../services/supabaseClient';
import { EnhancedProcedure, formatMarketSize, getMaturityColor } from '../../types/marketIntelligence';
import EnhancedProcedureCard from '../procedures/EnhancedProcedureCard';
import { logger } from '../services/logging/logger';


interface MarketIntelligenceDashboardProps {
  industry: 'dental' | 'aesthetic' | 'both';
}

type SortField = 'market_size' | 'growth_rate' | 'confidence' | 'name';
type SortOrder = 'asc' | 'desc';

export const MarketIntelligenceDashboard: React.FC<MarketIntelligenceDashboardProps> = ({ industry }) => {
  const [procedures, setProcedures] = useState<EnhancedProcedure[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<EnhancedProcedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [maturityFilter, setMaturityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('market_size');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Fetch procedures with all new fields
  useEffect(() => {
    fetchEnhancedProcedures();
  }, [industry]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...procedures];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        (p.procedure_name || p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Maturity filter
    if (maturityFilter !== 'all') {
      filtered = filtered.filter(p => p.market_maturity_stage === maturityFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortField) {
        case 'market_size':
          aValue = a.market_size_2025_usd_millions || 0;
          bValue = b.market_size_2025_usd_millions || 0;
          break;
        case 'growth_rate':
          aValue = a.yearly_growth_percentage || 0;
          bValue = b.yearly_growth_percentage || 0;
          break;
        case 'confidence':
          aValue = a.market_confidence_score || 0;
          bValue = b.market_confidence_score || 0;
          break;
        case 'name':
          aValue = (a.procedure_name || a.name || '').toLowerCase();
          bValue = (b.procedure_name || b.name || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredProcedures(filtered);
  }, [procedures, searchTerm, maturityFilter, sortField, sortOrder]);

  const fetchEnhancedProcedures = async () => {
    setLoading(true);
    try {
      const tables = industry === 'both' 
        ? ['aesthetic_procedures', 'dental_procedures']
        : [industry === 'aesthetic' ? 'aesthetic_procedures' : 'dental_procedures'];

      const allProcedures: EnhancedProcedure[] = [];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order('market_size_2025_usd_millions', { ascending: false });

        if (error) throw error;
        if (data) {
          allProcedures.push(...data.map(p => ({
            ...p,
            industry: table.includes('aesthetic') ? 'aesthetic' : 'dental'
          })));
        }
      }

      setProcedures(allProcedures);
    } catch (error) {
      logger.error('Error fetching procedures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Calculate summary statistics
  const stats = {
    totalMarketSize: procedures.reduce((sum, p) => sum + (p.market_size_2025_usd_millions || 0), 0),
    avgGrowthRate: procedures.reduce((sum, p) => sum + (p.yearly_growth_percentage || 0), 0) / procedures.length,
    highGrowthCount: procedures.filter(p => (p.yearly_growth_percentage || 0) > 15).length,
    avgConfidence: procedures.reduce((sum, p) => sum + (p.market_confidence_score || 0), 0) / procedures.length,
  };

  return (
    <Box>
      {/* Header Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AssessmentIcon color="primary" />
                <Typography variant="h6">Total Market</Typography>
              </Box>
              <Typography variant="h4">{formatMarketSize(stats.totalMarketSize)}</Typography>
              <Typography variant="caption" color="text.secondary">
                2025 Combined Market Size
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUpIcon color="success" />
                <Typography variant="h6">Avg Growth</Typography>
              </Box>
              <Typography variant="h4">{stats.avgGrowthRate.toFixed(1)}%</Typography>
              <Typography variant="caption" color="text.secondary">
                Average Annual Growth Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TimelineIcon color="warning" />
                <Typography variant="h6">High Growth</Typography>
              </Box>
              <Typography variant="h4">{stats.highGrowthCount}</Typography>
              <Typography variant="caption" color="text.secondary">
                Procedures with &gt;15% Growth
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <BusinessIcon color="info" />
                <Typography variant="h6">Data Quality</Typography>
              </Box>
              <Typography variant="h4">{stats.avgConfidence.toFixed(1)}/10</Typography>
              <Typography variant="caption" color="text.secondary">
                Average Confidence Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search procedures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Market Maturity</InputLabel>
              <Select
                value={maturityFilter}
                onChange={(e) => setMaturityFilter(e.target.value)}
                label="Market Maturity"
              >
                <MenuItem value="all">All Stages</MenuItem>
                <MenuItem value="Emerging">Emerging</MenuItem>
                <MenuItem value="Growth">Growth</MenuItem>
                <MenuItem value="Expansion">Expansion</MenuItem>
                <MenuItem value="Mature">Mature</MenuItem>
                <MenuItem value="Saturated">Saturated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                label="Sort By"
              >
                <MenuItem value="market_size">Market Size</MenuItem>
                <MenuItem value="growth_rate">Growth Rate</MenuItem>
                <MenuItem value="confidence">Confidence Score</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              fullWidth
            >
              <ToggleButton value="cards">Cards</ToggleButton>
              <ToggleButton value="table">Table</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      <Typography variant="body2" color="text.secondary" mb={2}>
        Showing {filteredProcedures.length} of {procedures.length} procedures
      </Typography>

      {viewMode === 'cards' ? (
        <Grid container spacing={3}>
          {filteredProcedures.map((procedure) => (
            <Grid item xs={12} md={6} lg={4} key={procedure.id}>
              <EnhancedProcedureCard 
                procedure={procedure} 
                showProjections={true}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortOrder : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Procedure
                  </TableSortLabel>
                </TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Maturity</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'market_size'}
                    direction={sortField === 'market_size' ? sortOrder : 'asc'}
                    onClick={() => handleSort('market_size')}
                  >
                    2025 Market
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">2030 Market</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'growth_rate'}
                    direction={sortField === 'growth_rate' ? sortOrder : 'asc'}
                    onClick={() => handleSort('growth_rate')}
                  >
                    Growth %
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">5Y CAGR</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'confidence'}
                    direction={sortField === 'confidence' ? sortOrder : 'asc'}
                    onClick={() => handleSort('confidence')}
                  >
                    Confidence
                  </TableSortLabel>
                </TableCell>
                <TableCell>Top Manufacturers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProcedures.map((procedure) => (
                <TableRow key={procedure.id} hover>
                  <TableCell>{procedure.procedure_name || procedure.name}</TableCell>
                  <TableCell>{procedure.category}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell align="right">
                    {formatMarketSize(procedure.market_size_2025_usd_millions)}
                  </TableCell>
                  <TableCell align="right">
                    {formatMarketSize(procedure.market_size_2030_usd_millions)}
                  </TableCell>
                  <TableCell align="right">
                    {procedure.yearly_growth_percentage?.toFixed(1)}%
                  </TableCell>
                  <TableCell align="right">
                    {procedure.cagr_5year?.toFixed(1)}%
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={`${procedure.data_source_quality || 'Standard'} quality`}>
                      <span>{procedure.market_confidence_score}/10</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {procedure.top_3_device_manufacturers?.slice(0, 2).join(', ')}
                    {procedure.top_3_device_manufacturers && procedure.top_3_device_manufacturers.length > 2 && '...'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};


MarketIntelligenceDashboard.displayName = 'MarketIntelligenceDashboard';export default MarketIntelligenceDashboard;