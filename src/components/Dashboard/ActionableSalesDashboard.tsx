import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  CircularProgress,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Stack,
  Alert,
  AlertTitle,
  Tab,
  Tabs,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  styled,
  alpha,
  useTheme,
  keyframes,
  Skeleton,
  Switch,
  FormControlLabel,
  Rating,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
  Grow,
  Zoom
} from '@mui/material';
import {
  LocalFireDepartment,
  TrendingUp,
  AttachMoney,
  Phone,
  Email,
  LocationOn,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  Info,
  Star,
  StarBorder,
  Timer,
  Groups,
  Person,
  Business,
  Category,
  Whatshot,
  ElectricBolt,
  Psychology,
  AutoAwesome,
  Rocket,
  Flag,
  BookmarkBorder,
  Bookmark,
  NavigateNext,
  ExpandMore,
  ExpandLess,
  WorkspacePremium,
  EmojiEvents,
  CardGiftcard,
  Timeline as TimelineIcon,
  CalendarToday,
  NotificationsActive,
  Speed,
  Assessment,
  TrendingDown,
  AccountBalance,
  ReceiptLong,
  Lightbulb,
  ThumbUp,
  AccessTime,
  DirectionsCar,
  Coffee,
  Restaurant,
  MedicalServices,
  CurrencyExchange,
  Celebration,
  SportsScore,
  Visibility,
  Chat,
  Note,
  CloudSync,
  CheckCircleOutline,
  RadioButtonUnchecked,
  Search,
  FilterList,
  Map,
  Dashboard,
  Insights,
  AutoMode,
  PlayCircle,
  PauseCircle,
  SkipNext,
  Replay,
  VolumeUp,
  Mic,
  PhotoCamera,
  AttachFile,
  Send,
  Archive,
  Delete,
  Share,
  MoreVert,
  Settings
} from '@mui/icons-material';

import { supabase } from '../../services/supabaseClient';
import * as braveSearchService from '../../services/braveSearchService';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 123, 255, 0.8), 0 0 30px rgba(0, 123, 255, 0.6); }
  100% { box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); }
`;

// Styled Components
const HotLeadCard = styled(Card, { shouldForwardProp: (prop) => prop !== 'priority' })<{ priority: 'hot' | 'warm' | 'cold' }>(({ theme, priority }) => ({
  position: 'relative',
  overflow: 'visible',
  background: priority === 'hot' 
    ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.1)})`
    : priority === 'warm'
    ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.success.main, 0.1)})`
    : alpha(theme.palette.background.paper, 0.9),
  border: `2px solid ${
    priority === 'hot' ? theme.palette.error.main 
    : priority === 'warm' ? theme.palette.warning.main 
    : theme.palette.divider
  }`,
  ...(priority === 'hot' && {
    animation: `${pulse} 2s infinite`,
    '&::before': {
      content: '"🔥"',
      position: 'absolute',
      top: -10,
      right: -10,
      fontSize: '24px',
      animation: `${pulse} 1s infinite`,
    }
  }),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: theme.shadows[20],
  }
}));

const MetricCard = styled(Card, { shouldForwardProp: (prop) => prop !== 'trend' })<{ trend?: 'up' | 'down' }>(({ theme, trend }) => ({
  height: '100%',
  background: trend === 'up' 
    ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)}, ${alpha(theme.palette.success.light, 0.1)})`
    : trend === 'down'
    ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)}, ${alpha(theme.palette.error.light, 0.1)})`
    : theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 20px',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  }
}));

const LiveIndicator = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  '& .live-dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.error.main,
    animation: `${pulse} 1.5s infinite`,
  }
}));

const CommissionProgress = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 40,
  background: alpha(theme.palette.primary.main, 0.1),
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  '& .progress-bar': {
    height: '100%',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    transition: 'width 0.5s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: theme.spacing(2),
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
  },
  '& .milestone': {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    background: theme.palette.divider,
    '&::after': {
      content: 'attr(data-label)',
      position: 'absolute',
      bottom: -20,
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '0.75rem',
      color: theme.palette.text.secondary,
      whiteSpace: 'nowrap',
    }
  }
}));

// Interfaces
interface Lead {
  id: string;
  practice: string;
  doctor: string;
  priority: 'hot' | 'warm' | 'cold';
  score: number;
  reason: string;
  nextAction: string;
  value: number;
  lastContact: string;
  category: string;
  signal: string;
  timeToClose: number;
  competitors?: string[];
  avatar?: string;
  specialties?: string[];
  patientVolume?: number;
  decisionTimeframe?: string;
}

interface OpportunityAlert {
  id: string;
  type: 'search' | 'budget' | 'competitor' | 'expansion' | 'risk';
  title: string;
  description: string;
  action: string;
  timestamp: Date;
  value?: number;
  urgent?: boolean;
}

interface DailyTarget {
  visits: number;
  calls: number;
  emails: number;
  demos: number;
  completed: {
    visits: number;
    calls: number;
    emails: number;
    demos: number;
  };
}

interface Commission {
  current: number;
  target: number;
  nextTier: number;
  nextTierBonus: number;
  ytd: number;
  projected: number;
}

const ActionableSalesDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [routeOptimized, setRouteOptimized] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    briefing: true,
    opportunities: true,
    activities: false,
    insights: false
  });
  
  const theme = useTheme();

  // Mock data - in production, this would come from your backend
  const hotLeads: Lead[] = [
    {
      id: '1',
      practice: 'Advanced Dental Care',
      doctor: 'Dr. Sarah Martinez',
      priority: 'hot',
      score: 92,
      reason: 'Actively researching implant systems - viewed 5 competitor sites yesterday',
      nextAction: 'Call within 2 hours - mention the new Zimmer Biomet special',
      value: 125000,
      lastContact: '3 days ago',
      category: 'Implants',
      signal: 'Web activity spike',
      timeToClose: 14,
      competitors: ['Nobel Biocare', 'Straumann'],
      specialties: ['Oral Surgery', 'Prosthodontics'],
      patientVolume: 1200,
      decisionTimeframe: 'This quarter'
    },
    {
      id: '2',
      practice: 'Smile Innovations',
      doctor: 'Dr. James Chen',
      priority: 'hot',
      score: 88,
      reason: 'Budget approved for Q4 - $200K allocated for new equipment',
      nextAction: 'Schedule demo this week - bring the portable scanner',
      value: 200000,
      lastContact: '1 week ago',
      category: 'Digital Workflow',
      signal: 'Budget release',
      timeToClose: 21,
      specialties: ['General Dentistry', 'Cosmetic'],
      patientVolume: 2500,
      decisionTimeframe: 'Next 30 days'
    },
    {
      id: '3',
      practice: 'Aesthetic Excellence',
      doctor: 'Dr. Emily Johnson',
      priority: 'warm',
      score: 75,
      reason: 'Competitor contract expires next month - dissatisfied with support',
      nextAction: 'Send competitive comparison + schedule lunch meeting',
      value: 85000,
      lastContact: '2 weeks ago',
      category: 'Lasers',
      signal: 'Contract expiration',
      timeToClose: 35,
      competitors: ['Cutera', 'Candela'],
      specialties: ['Dermatology', 'Med Spa'],
      patientVolume: 800
    }
  ];

  const opportunityAlerts: OpportunityAlert[] = [
    {
      id: '1',
      type: 'search',
      title: 'Dr. Martinez searching "implant systems comparison"',
      description: 'Viewed Nobel Biocare and Straumann sites. Spent 12 min on pricing pages.',
      action: 'Call now',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      value: 125000,
      urgent: true
    },
    {
      id: '2',
      type: 'budget',
      title: 'Q4 budgets released - 12 practices in territory',
      description: '$1.2M total available budget identified across your accounts',
      action: 'View list',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      value: 1200000
    },
    {
      id: '3',
      type: 'competitor',
      title: 'Nobel Biocare announced 15% price increase',
      description: 'Effective Jan 1st - opportunity to position our value prop',
      action: 'Get talk track',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      id: '4',
      type: 'expansion',
      title: 'Smile Innovations adding 2 new operatories',
      description: 'Construction starts next month - perfect timing for equipment package',
      action: 'Schedule visit',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
      value: 300000
    }
  ];

  const dailyTargets: DailyTarget = {
    visits: 4,
    calls: 12,
    emails: 20,
    demos: 2,
    completed: {
      visits: 1,
      calls: 5,
      emails: 8,
      demos: 0
    }
  };

  const commission: Commission = {
    current: 142500,
    target: 150000,
    nextTier: 150000,
    nextTierBonus: 5000,
    ytd: 285000,
    projected: 340000
  };

  const topCompetitors = [
    { name: 'Nobel Biocare', wins: 23, losses: 12, trend: 'up' },
    { name: 'Straumann', wins: 18, losses: 15, trend: 'down' },
    { name: 'Zimmer Biomet', wins: 31, losses: 8, trend: 'up' }
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'search': return <Search color="error" />;
      case 'budget': return <AccountBalance color="success" />;
      case 'competitor': return <Groups color="warning" />;
      case 'expansion': return <Business color="info" />;
      case 'risk': return <Warning color="error" />;
      default: return <Info />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return theme.palette.success.main;
    if (percent >= 75) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 2, position: 'relative' }}>
      {/* Header with Live Status */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rocket color="primary" />
            Sales Command Center
            <LiveIndicator>
              <span className="live-dot" />
              <Typography variant="caption" color="error">LIVE</Typography>
            </LiveIndicator>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Thursday, Nov 14 • Territory: West Coast • {hotLeads.filter(l => l.priority === 'hot').length} hot leads active
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControlLabel
            control={<Switch checked={voiceEnabled} onChange={(e) => setVoiceEnabled(e.target.checked)} />}
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Mic fontSize="small" /> Voice</Box>}
          />
          <IconButton color="primary">
            <Map />
          </IconButton>
          <IconButton>
            <Settings />
          </IconButton>
        </Box>
      </Box>

      {/* Commission Tracker - Always Visible */}
      <Card sx={{ mb: 2, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <CardContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney color="primary" />
                Commission Tracker
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${(commission.nextTier - commission.current).toLocaleString()} to next tier = ${commission.nextTierBonus.toLocaleString()} bonus
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                ${commission.current.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                YTD: ${commission.ytd.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <CommissionProgress>
            <Box 
              className="progress-bar" 
              sx={{ width: `${(commission.current / commission.nextTier) * 100}%` }}
            >
              {Math.round((commission.current / commission.nextTier) * 100)}%
            </Box>
            <Box className="milestone" style={{ left: '50%' }} data-label="$75K" />
            <Box className="milestone" style={{ left: '100%' }} data-label="$150K" />
          </CommissionProgress>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(e: React.SyntheticEvent, v: number) => setActiveTab(v)} variant="fullWidth">
          <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Dashboard /> Today's Plan</Box>} />
          <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Whatshot /> Hot Leads</Box>} />
          <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Timeline /> Pipeline</Box>} />
          <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Insights /> Intelligence</Box>} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Fade in={activeTab === 0}>
          <Grid container spacing={2}>
            {/* Morning Briefing */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Coffee color="primary" />
                      Morning Briefing
                    </Typography>
                    <IconButton size="small" onClick={() => toggleSection('briefing')}>
                      {expandedSections.briefing ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  <Collapse in={expandedSections.briefing}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Alert severity="success" icon={<EmojiEvents />}>
                          <AlertTitle>Yesterday's Win</AlertTitle>
                          Closed Smile Innovations - $125K deal! 🎉
                        </Alert>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Alert severity="warning" icon={<Timer />}>
                          <AlertTitle>Time Sensitive</AlertTitle>
                          3 contracts expire this month - action needed
                        </Alert>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Alert severity="info" icon={<Lightbulb />}>
                          <AlertTitle>Pro Tip</AlertTitle>
                          Best time to visit Dr. Chen: 2-4 PM (after procedures)
                        </Alert>
                      </Grid>
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>

            {/* Today's Activities */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleOutline color="primary" />
                    Today's Activities
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(dailyTargets.completed).map(([key, value]) => (
                      <Grid item xs={6} md={3} key={key}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {key}
                          </Typography>
                          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <CircularProgress
                              variant="determinate"
                              value={(value / (dailyTargets as any)[key]) * 100}
                              size={60}
                              thickness={4}
                              sx={{ color: getProgressColor((value / (dailyTargets as any)[key]) * 100) }}
                            />
                            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography variant="caption" component="div" color="text.secondary">
                                {value}/{(dailyTargets as any)[key]}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {/* Optimized Route */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Optimized route saves 47 min • Next: Advanced Dental Care (12 min away)
                    </Typography>
                    <Button
                      variant={routeOptimized ? "outlined" : "contained"}
                      size="small"
                      startIcon={<DirectionsCar />}
                      onClick={() => setRouteOptimized(!routeOptimized)}
                    >
                      {routeOptimized ? 'View Route' : 'Start Navigation'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* AI Suggestions */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Psychology color="secondary" />
                    AI Says
                  </Typography>
                  <Stack spacing={2}>
                    <Paper sx={{ p: 2, background: alpha(theme.palette.secondary.main, 0.05) }}>
                      <Typography variant="subtitle2" gutterBottom color="secondary">
                        🎯 Focus on These Today:
                      </Typography>
                      <Typography variant="body2">
                        1. Dr. Martinez - Call before 11 AM
                      </Typography>
                      <Typography variant="body2">
                        2. Bring iPad for Smile Innovations demo
                      </Typography>
                      <Typography variant="body2">
                        3. Mention Nobel price increase to fence-sitters
                      </Typography>
                    </Paper>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AutoAwesome />}
                      sx={{ borderStyle: 'dashed' }}
                    >
                      Get More Suggestions
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Live Opportunity Feed */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NotificationsActive color="error" />
                      Live Opportunity Feed
                      <Chip label="4 new" size="small" color="error" />
                    </Typography>
                    <IconButton size="small" onClick={() => toggleSection('opportunities')}>
                      {expandedSections.opportunities ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  <Collapse in={expandedSections.opportunities}>
                    <List>
                      {opportunityAlerts.map((alert, index) => (
                        <React.Fragment key={alert.id}>
                          {index > 0 && <Divider />}
                          <ListItem 
                            sx={{ 
                              py: 2,
                              animation: alert.urgent ? `${slideIn} 0.5s ease` : undefined,
                              background: alert.urgent ? alpha(theme.palette.error.main, 0.05) : undefined
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: alert.urgent ? 'error.main' : 'primary.main' }}>
                                {getAlertIcon(alert.type)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle2">{alert.title}</Typography>
                                  {alert.urgent && <LocalFireDepartment color="error" fontSize="small" />}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {alert.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <AccessTime fontSize="small" color="action" />
                                    <Typography variant="caption" color="text.secondary">
                                      {formatTimeAgo(alert.timestamp)}
                                    </Typography>
                                    {alert.value && (
                                      <>
                                        <Typography variant="caption" color="text.secondary">•</Typography>
                                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                                          ${alert.value.toLocaleString()}
                                        </Typography>
                                      </>
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <ActionButton
                                variant={alert.urgent ? "contained" : "outlined"}
                                size="small"
                                color={alert.urgent ? "error" : "primary"}
                              >
                                {alert.action}
                              </ActionButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}

      {activeTab === 1 && (
        <Fade in={activeTab === 1}>
          <Grid container spacing={2}>
            {/* Hot Leads Priority List */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalFireDepartment color="error" />
                If you only visit 3 practices today, visit these:
              </Typography>
            </Grid>
            
            {hotLeads.map((lead, index) => (
              <Grid item xs={12} key={lead.id}>
                <Zoom in style={{ transitionDelay: `${index * 100}ms` }}>
                  <HotLeadCard 
                    priority={lead.priority}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Box>
                              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {lead.practice}
                                <Chip 
                                  label={`${lead.score}% close probability`}
                                  size="small"
                                  color={lead.priority === 'hot' ? 'error' : lead.priority === 'warm' ? 'warning' : 'default'}
                                />
                              </Typography>
                              <Typography variant="subtitle2" color="text.secondary">
                                {lead.doctor} • {lead.specialties?.join(', ')} • {lead.patientVolume} patients/year
                              </Typography>
                            </Box>
                            <Chip 
                              label={`$${(lead.value / 1000).toFixed(0)}K`}
                              color="success"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Box>
                          
                          <Alert 
                            severity={lead.priority === 'hot' ? 'error' : 'warning'} 
                            icon={<ElectricBolt />}
                            sx={{ mb: 1 }}
                          >
                            {lead.reason}
                          </Alert>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Category fontSize="small" color="action" />
                              {lead.category}
                            </Typography>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Timer fontSize="small" color="action" />
                              Close in {lead.timeToClose} days
                            </Typography>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Schedule fontSize="small" color="action" />
                              Last: {lead.lastContact}
                            </Typography>
                            {lead.competitors && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Groups fontSize="small" color="action" />
                                vs. {lead.competitors.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Alert severity="info" sx={{ py: 0.5 }}>
                              <Typography variant="subtitle2">Next Action:</Typography>
                              <Typography variant="body2">{lead.nextAction}</Typography>
                            </Alert>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <ActionButton
                                variant="contained"
                                size="small"
                                startIcon={<Phone />}
                                fullWidth
                              >
                                Call Now
                              </ActionButton>
                              <ActionButton
                                variant="outlined"
                                size="small"
                                startIcon={<Email />}
                                fullWidth
                              >
                                Email
                              </ActionButton>
                              <IconButton color="primary" size="small">
                                <MoreVert />
                              </IconButton>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </HotLeadCard>
                </Zoom>
              </Grid>
            ))}

            {/* Quick Stats */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <MetricCard trend="up">
                    <CardContent>
                      <Typography variant="h4" color="success.main">87%</Typography>
                      <Typography variant="body2" color="text.secondary">Win Rate (30d)</Typography>
                      <Chip label="+12% vs last month" size="small" color="success" sx={{ mt: 1 }} />
                    </CardContent>
                  </MetricCard>
                </Grid>
                <Grid item xs={6} md={3}>
                  <MetricCard>
                    <CardContent>
                      <Typography variant="h4">14</Typography>
                      <Typography variant="body2" color="text.secondary">Avg Days to Close</Typography>
                      <Chip label="3 days faster" size="small" sx={{ mt: 1 }} />
                    </CardContent>
                  </MetricCard>
                </Grid>
                <Grid item xs={6} md={3}>
                  <MetricCard trend="up">
                    <CardContent>
                      <Typography variant="h4" color="primary">$2.4M</Typography>
                      <Typography variant="body2" color="text.secondary">Pipeline Value</Typography>
                      <Chip label="23 opportunities" size="small" sx={{ mt: 1 }} />
                    </CardContent>
                  </MetricCard>
                </Grid>
                <Grid item xs={6} md={3}>
                  <MetricCard>
                    <CardContent>
                      <Typography variant="h4">#2</Typography>
                      <Typography variant="body2" color="text.secondary">Team Ranking</Typography>
                      <Chip label="Top 10%" size="small" color="success" sx={{ mt: 1 }} />
                    </CardContent>
                  </MetricCard>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Mic />}
          tooltipTitle="Voice Note"
          onClick={() => {}}
        />
        <SpeedDialAction
          icon={<PhotoCamera />}
          tooltipTitle="Scan Card"
          onClick={() => {}}
        />
        <SpeedDialAction
          icon={<Note />}
          tooltipTitle="Quick Note"
          onClick={() => {}}
        />
        <SpeedDialAction
          icon={<CheckCircle />}
          tooltipTitle="Log Activity"
          onClick={() => {}}
        />
      </SpeedDial>

      {/* Lead Detail Dialog */}
      <Dialog 
        open={!!selectedLead} 
        onClose={() => setSelectedLead(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedLead && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedLead.practice}</Typography>
                <Chip label={`$${(selectedLead.value / 1000).toFixed(0)}K opportunity`} color="success" />
              </Box>
            </DialogTitle>
            <DialogContent>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <Phone />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Call to discuss implant options"
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Mention Zimmer Biomet promotion and Nobel price increase
                        </Typography>
                        <Typography variant="caption" color="primary">Today</Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Business />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="In-person demo"
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Bring sample kit and iPad for virtual surgery planning
                        </Typography>
                        <Typography variant="caption" color="primary">Tomorrow</Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircle />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Close deal"
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Finance options ready, implementation team on standby
                        </Typography>
                        <Typography variant="caption" color="primary">Next Week</Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedLead(null)}>Close</Button>
              <Button variant="contained" startIcon={<PlayCircle />}>
                Start Call Script
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ActionableSalesDashboard;