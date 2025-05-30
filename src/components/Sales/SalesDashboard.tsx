import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Tab,
  Tabs,
  useTheme,
  Paper,
  Button,
  Tooltip,
  Badge,
  Stack,
  Divider,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Phone,
  Email,
  CalendarToday,
  Note,
  LocationOn,
  AttachMoney,
  EmojiEvents,
  Group,
  Assessment,
  Speed,
  Map as MapIcon,
  Notifications,
  Star,
  Warning,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color, subtitle }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          borderLeft: `4px solid ${color}`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar
              sx={{
                backgroundColor: color,
                width: 56,
                height: 56,
              }}
            >
              {icon}
            </Avatar>
            {change !== undefined && (
              <Chip
                icon={change > 0 ? <TrendingUp /> : <TrendingDown />}
                label={`${change > 0 ? '+' : ''}${change}%`}
                size="small"
                sx={{
                  backgroundColor: change > 0 ? theme.palette.success.light : theme.palette.error.light,
                  color: change > 0 ? theme.palette.success.dark : theme.palette.error.dark,
                }}
              />
            )}
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {value}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface AccountCardProps {
  name: string;
  type: string;
  lastVisit: string;
  health: 'good' | 'warning' | 'at-risk';
  revenue: number;
  nextAction: string;
}

const AccountCard: React.FC<AccountCardProps> = ({ name, type, lastVisit, health, revenue, nextAction }) => {
  const theme = useTheme();
  const healthColors = {
    good: theme.palette.success.main,
    warning: theme.palette.warning.main,
    'at-risk': theme.palette.error.main,
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'scale(1.02)',
        },
        transition: 'all 0.2s ease',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {type}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={health}
            sx={{
              backgroundColor: `${healthColors[health]}20`,
              color: healthColors[health],
              fontWeight: 'bold',
            }}
          />
        </Box>
        
        <Stack spacing={1}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Last Visit
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {lastVisit}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Revenue (YTD)
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              ${revenue.toLocaleString()}
            </Typography>
          </Box>
        </Stack>
        
        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" alignItems="center" gap={1}>
          <Warning fontSize="small" color="primary" />
          <Typography variant="body2" color="primary">
            {nextAction}
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="space-around" mt={2}>
          <IconButton size="small" color="primary">
            <Phone fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary">
            <Email fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary">
            <CalendarToday fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary">
            <Note fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

interface OpportunityProps {
  title: string;
  account: string;
  value: number;
  probability: number;
  daysLeft: number;
}

const OpportunityCard: React.FC<OpportunityProps> = ({ title, account, value, probability, daysLeft }) => {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        cursor: 'pointer',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {account}
          </Typography>
          <Box display="flex" gap={2} mt={1}>
            <Chip
              size="small"
              label={`$${(value / 1000).toFixed(0)}k`}
              icon={<AttachMoney fontSize="small" />}
            />
            <Chip
              size="small"
              label={`${probability}% likely`}
              color={probability >= 70 ? 'success' : probability >= 40 ? 'warning' : 'default'}
            />
            <Chip
              size="small"
              label={`${daysLeft}d left`}
              color={daysLeft <= 7 ? 'error' : 'default'}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const SalesDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = useState(0);

  const metrics = [
    {
      title: 'Revenue (QTD)',
      value: '$342,500',
      change: 12,
      icon: <AttachMoney />,
      color: theme.palette.success.main,
      subtitle: '68% of quota',
    },
    {
      title: 'Pipeline Value',
      value: '$1.2M',
      change: 8,
      icon: <Assessment />,
      color: theme.palette.primary.main,
      subtitle: '42 opportunities',
    },
    {
      title: 'Win Rate',
      value: '32%',
      change: -3,
      icon: <EmojiEvents />,
      color: theme.palette.warning.main,
      subtitle: 'Last 30 days',
    },
    {
      title: 'Activities',
      value: '142',
      change: 15,
      icon: <Speed />,
      color: theme.palette.info.main,
      subtitle: 'This week',
    },
  ];

  const topAccounts = [
    {
      name: 'Smile Dental Group',
      type: 'Dental Chain',
      lastVisit: '3 days ago',
      health: 'good' as const,
      revenue: 125000,
      nextAction: 'Follow up on implant systems quote',
    },
    {
      name: 'Aesthetic Med Spa',
      type: 'Medical Spa',
      lastVisit: '2 weeks ago',
      health: 'warning' as const,
      revenue: 85000,
      nextAction: 'Schedule Botox training session',
    },
    {
      name: 'Downtown Dental',
      type: 'Private Practice',
      lastVisit: '1 month ago',
      health: 'at-risk' as const,
      revenue: 45000,
      nextAction: 'Urgent: Address service complaints',
    },
  ];

  const opportunities = [
    {
      title: 'Invisalign System Upgrade',
      account: 'Smile Dental Group',
      value: 85000,
      probability: 80,
      daysLeft: 5,
    },
    {
      title: 'Dermal Filler Package',
      account: 'Beverly Hills Aesthetics',
      value: 45000,
      probability: 60,
      daysLeft: 12,
    },
    {
      title: 'Digital X-Ray System',
      account: 'Family Dental Care',
      value: 120000,
      probability: 40,
      daysLeft: 20,
    },
  ];

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Sales Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, Sarah! Here's your performance overview.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Badge badgeContent={3} color="error">
            <IconButton>
              <Notifications />
            </IconButton>
          </Badge>
          <Button
            variant="contained"
            startIcon={<MapIcon />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            Territory Map
          </Button>
        </Stack>
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={3} mb={4}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_: React.SyntheticEvent, value: number) => setSelectedTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Top Accounts" icon={<Star />} iconPosition="start" />
          <Tab label="Hot Opportunities" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="Territory Insights" icon={<LocationOn />} iconPosition="start" />
          <Tab label="Team Performance" icon={<Group />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {topAccounts.map((account, index) => (
            <Grid item xs={12} md={4} key={index}>
              <AccountCard {...account} />
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTab === 1 && (
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Opportunities Requiring Attention
          </Typography>
          {opportunities.map((opp, index) => (
            <OpportunityCard key={index} {...opp} />
          ))}
          <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
            View All Opportunities
          </Button>
        </Box>
      )}

      {selectedTab === 2 && (
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Territory Performance Map
          </Typography>
          <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              Interactive territory map will be displayed here
            </Typography>
          </Card>
        </Box>
      )}

      {selectedTab === 3 && (
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Team Leaderboard
          </Typography>
          <Card sx={{ p: 3 }}>
            <Typography color="text.secondary">
              Team performance metrics and rankings
            </Typography>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default SalesDashboard;