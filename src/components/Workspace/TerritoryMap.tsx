import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Grid,
  Avatar,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Map as MapIcon,
  LocationOn,
  Business,
  TrendingUp,
  AttachMoney,
  People,
  Warning,
  CheckCircle,
  RadioButtonUnchecked,
  Circle,
  Layers,
  FilterList
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Account {
  id: string;
  name: string;
  type: 'customer' | 'prospect' | 'competitor' | 'opportunity';
  location: { lat: number; lng: number };
  revenue: number;
  procedures: string[];
  status: 'active' | 'at-risk' | 'growth' | 'new';
  lastContact?: Date;
  nextAction?: string;
}

interface TerritoryStats {
  totalAccounts: number;
  totalRevenue: number;
  marketPenetration: number;
  growthRate: number;
  atRiskAccounts: number;
  topOpportunity: string;
}

const TerritoryMap: React.FC = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'prospect' | 'opportunity'>('all');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [territoryStats, setTerritoryStats] = useState<TerritoryStats>({
    totalAccounts: 124,
    totalRevenue: 8.5,
    marketPenetration: 42,
    growthRate: 18.5,
    atRiskAccounts: 3,
    topOpportunity: 'Digital Dentistry expansion in Miami'
  });

  // Mock account data
  const accounts: Account[] = [
    {
      id: '1',
      name: 'Elite Dental Partners',
      type: 'customer',
      location: { lat: 25.7617, lng: -80.1918 }, // Miami
      revenue: 2500000,
      procedures: ['Implants', 'Orthodontics', 'Cosmetic'],
      status: 'active',
      lastContact: new Date('2024-01-15'),
      nextAction: 'Quarterly review scheduled'
    },
    {
      id: '2',
      name: 'Aesthetic Excellence Group',
      type: 'customer',
      location: { lat: 25.7825, lng: -80.2221 },
      revenue: 1800000,
      procedures: ['Injectables', 'Body Contouring'],
      status: 'growth',
      lastContact: new Date('2024-01-10'),
      nextAction: 'Upsell laser equipment'
    },
    {
      id: '3',
      name: 'Smile Innovations',
      type: 'prospect',
      location: { lat: 25.7489, lng: -80.2586 },
      revenue: 0,
      procedures: ['Orthodontics'],
      status: 'new',
      nextAction: 'Initial demo scheduled'
    },
    {
      id: '4',
      name: 'Miami Beach Aesthetics',
      type: 'customer',
      location: { lat: 25.7907, lng: -80.1300 },
      revenue: 950000,
      procedures: ['Fillers', 'Botox'],
      status: 'at-risk',
      lastContact: new Date('2023-12-01'),
      nextAction: 'Urgent: Retention call needed'
    },
    {
      id: '5',
      name: 'Coral Gables Dental',
      type: 'opportunity',
      location: { lat: 25.7211, lng: -80.2684 },
      revenue: 0,
      procedures: ['Digital Dentistry'],
      status: 'new',
      nextAction: 'High potential for CAD/CAM systems'
    }
  ];

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'customer':
        return <Business sx={{ color: theme.palette.success.main }} />;
      case 'prospect':
        return <RadioButtonUnchecked sx={{ color: theme.palette.info.main }} />;
      case 'competitor':
        return <Warning sx={{ color: theme.palette.error.main }} />;
      case 'opportunity':
        return <TrendingUp sx={{ color: theme.palette.warning.main }} />;
    }
  };

  const getStatusColor = (status: Account['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'at-risk': return 'error';
      case 'growth': return 'warning';
      case 'new': return 'info';
      default: return 'default';
    }
  };

  const filteredAccounts = accounts.filter(account => 
    filterType === 'all' || account.type === filterType
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      {/* Header Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Accounts
              </Typography>
              <Typography variant="h4">{territoryStats.totalAccounts}</Typography>
              <Chip
                size="small"
                label="+12 this month"
                color="success"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Territory Revenue
              </Typography>
              <Typography variant="h4">${territoryStats.totalRevenue}M</Typography>
              <LinearProgress
                variant="determinate"
                value={territoryStats.growthRate * 3}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Market Penetration
              </Typography>
              <Typography variant="h4">{territoryStats.marketPenetration}%</Typography>
              <Typography variant="caption" color="text.secondary">
                58% opportunity remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ backgroundColor: theme.palette.warning.light }}>
            <CardContent>
              <Typography variant="subtitle2">
                At-Risk Accounts
              </Typography>
              <Typography variant="h4">{territoryStats.atRiskAccounts}</Typography>
              <Button size="small" sx={{ mt: 1 }}>
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, value) => value && setViewMode(value)}
        >
          <ToggleButton value="map">
            <MapIcon sx={{ mr: 1 }} /> Map View
          </ToggleButton>
          <ToggleButton value="list">
            <FilterList sx={{ mr: 1 }} /> List View
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" spacing={1}>
          <Chip
            label="All"
            onClick={() => setFilterType('all')}
            color={filterType === 'all' ? 'primary' : 'default'}
          />
          <Chip
            label="Customers"
            onClick={() => setFilterType('customer')}
            color={filterType === 'customer' ? 'primary' : 'default'}
            icon={<CheckCircle />}
          />
          <Chip
            label="Prospects"
            onClick={() => setFilterType('prospect')}
            color={filterType === 'prospect' ? 'primary' : 'default'}
            icon={<RadioButtonUnchecked />}
          />
          <Chip
            label="Opportunities"
            onClick={() => setFilterType('opportunity')}
            color={filterType === 'opportunity' ? 'primary' : 'default'}
            icon={<TrendingUp />}
          />
        </Stack>
      </Box>

      {/* Main Content */}
      <Paper sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {viewMode === 'map' ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[200]} 100%)`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Simple Map Placeholder */}
            <Box sx={{ position: 'relative', width: '80%', height: '80%' }}>
              <Typography
                variant="h6"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'text.secondary',
                  textAlign: 'center'
                }}
              >
                Miami-Dade Territory
              </Typography>

              {/* Plot Accounts */}
              {filteredAccounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    position: 'absolute',
                    left: `${20 + (account.location.lng + 80.3) * 500}%`,
                    top: `${80 - (account.location.lat - 25.7) * 500}%`,
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedAccount(account)}
                >
                  <Tooltip title={account.name}>
                    <Avatar
                      sx={{
                        backgroundColor: account.status === 'at-risk' 
                          ? theme.palette.error.main 
                          : theme.palette.background.paper,
                        border: `2px solid ${theme.palette.divider}`,
                        width: account.type === 'customer' ? 48 : 40,
                        height: account.type === 'customer' ? 48 : 40,
                        boxShadow: selectedAccount?.id === account.id ? 4 : 1
                      }}
                    >
                      {getAccountIcon(account.type)}
                    </Avatar>
                  </Tooltip>
                </motion.div>
              ))}

              {/* Selected Account Details */}
              {selectedAccount && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    zIndex: 10
                  }}
                >
                  <Card elevation={4}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{selectedAccount.name}</Typography>
                        <Chip
                          label={selectedAccount.status}
                          size="small"
                          color={getStatusColor(selectedAccount.status)}
                        />
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Type
                          </Typography>
                          <Typography variant="body2">
                            {selectedAccount.type.charAt(0).toUpperCase() + selectedAccount.type.slice(1)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Revenue
                          </Typography>
                          <Typography variant="body2">
                            ${(selectedAccount.revenue / 1000000).toFixed(1)}M
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            Procedures
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            {selectedAccount.procedures.map(proc => (
                              <Chip key={proc} label={proc} size="small" />
                            ))}
                          </Stack>
                        </Grid>
                        {selectedAccount.nextAction && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Next Action
                            </Typography>
                            <Typography variant="body2" color="primary">
                              {selectedAccount.nextAction}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained">
                          View Details
                        </Button>
                        <Button size="small" variant="outlined">
                          Schedule Activity
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Stack spacing={2}>
              {filteredAccounts.map((account) => (
                <Card key={account.id} sx={{ cursor: 'pointer' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar>{getAccountIcon(account.type)}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1">{account.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {account.procedures.join(' • ')}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6">
                          ${(account.revenue / 1000000).toFixed(1)}M
                        </Typography>
                        <Chip
                          label={account.status}
                          size="small"
                          color={getStatusColor(account.status)}
                        />
                      </Box>
                    </Box>
                    {account.nextAction && (
                      <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                        → {account.nextAction}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};


TerritoryMap.displayName = 'TerritoryMap';export default TerritoryMap;