import React, { useState, useEffect } from 'react';
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
  Paper,
  Button,
  Tooltip,
  Badge,
  Stack,
  Divider,
  useTheme,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Collapse,
  Fade,
  Skeleton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress,
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
  AutoAwesome,
  Psychology,
  Timer,
  LocalHospital,
  ShoppingCart,
  CompareArrows,
  Timeline,
  AccountBalance,
  Lightbulb,
  FlashOn,
  NavigateNext,
  Visibility,
  Schedule,
  CheckCircle,
  Cancel,
  PriorityHigh,
  TrendingFlat,
  Insights,
  Bookmark,
  Share,
  MoreVert,
  Search,
  FilterList,
  CloudUpload,
  Calculate,
  CreditCard,
  LocalOffer,
  Gavel,
  NewReleases,
  Person,
  Business,
  ChatBubble,
  DirectionsCar,
  Coffee,
  Restaurant,
  SportsGolf,
  EventAvailable,
  ReceiptLong,
  Analytics,
  WorkspacePremium,
  Groups,
  Inventory,
  MedicalServices,
  Psychology as BrainIcon,
  AutoGraph,
  Bolt,
  WbSunny,
  NightsStay,
  FiberManualRecord,
  ArrowUpward,
  ArrowDownward,
  HelpOutline,
  PlayArrow,
  Close,
  Add,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha } from '@mui/material/styles';

// AI Insights Engine Component
const AIInsightCard: React.FC<{
  title: string;
  insight: string;
  action: string;
  urgency: 'high' | 'medium' | 'low';
  confidence: number;
  onAction: () => void;
}> = ({ title, insight, action, urgency, confidence, onAction }) => {
  const theme = useTheme();
  const urgencyColors = {
    high: theme.palette.error.main,
    medium: theme.palette.warning.main,
    low: theme.palette.info.main,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderLeft: `4px solid ${urgencyColors[urgency]}`,
          backgroundColor: alpha(urgencyColors[urgency], 0.05),
          '&:hover': {
            boxShadow: theme.shadows[3],
          },
        }}
      >
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar
            sx={{
              backgroundColor: urgencyColors[urgency],
              width: 40,
              height: 40,
            }}
          >
            <AutoAwesome />
          </Avatar>
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {insight}
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Chip
                size="small"
                label={`${confidence}% confidence`}
                icon={<Psychology fontSize="small" />}
              />
              <Button
                size="small"
                variant="contained"
                onClick={onAction}
                sx={{
                  backgroundColor: urgencyColors[urgency],
                  '&:hover': {
                    backgroundColor: urgencyColors[urgency],
                    filter: 'brightness(0.9)',
                  },
                }}
              >
                {action}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

// Morning Briefing Component
const MorningBriefing: React.FC = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);

  const briefingItems = [
    {
      icon: <FlashOn />,
      title: "3 Hot Leads Today",
      description: "Dr. Martinez at Smile Dental is actively researching implant systems",
      action: "View Leads",
      color: theme.palette.error.main,
    },
    {
      icon: <AccountBalance />,
      title: "Q4 Budget Alert",
      description: "5 practices in your territory have unspent Q4 budgets",
      action: "Target Now",
      color: theme.palette.success.main,
    },
    {
      icon: <CompareArrows />,
      title: "Competitor Move",
      description: "DentalCorp launched new pricing in your territory",
      action: "See Details",
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Card
      sx={{
        mb: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <WbSunny />
            <Typography variant="h6" fontWeight="bold">
              Your Morning Briefing
            </Typography>
            <Chip
              size="small"
              label={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'white' }}
          >
            {expanded ? <Close /> : <PlayArrow />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Stack spacing={2}>
            {briefingItems.map((item, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{
                      backgroundColor: item.color,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {item.description}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  >
                    {item.action}
                  </Button>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
};

// Smart Territory Prioritization
const TerritoryPrioritization: React.FC = () => {
  const theme = useTheme();
  
  const priorityVisits = [
    {
      practice: "Elite Dental Associates",
      score: 95,
      reasons: ["High purchase intent", "Budget available", "Decision maker engaged"],
      distance: "12 min",
      bestTime: "2:00 PM",
      products: ["Implant Systems", "Digital Scanners"],
      revenue: "$125k potential",
    },
    {
      practice: "Aesthetic Medical Center",
      score: 87,
      reasons: ["Competitor contract expiring", "New location opening", "Growing rapidly"],
      distance: "25 min",
      bestTime: "10:30 AM",
      products: ["Dermal Fillers", "Laser Equipment"],
      revenue: "$85k potential",
    },
    {
      practice: "Family Dental Care",
      score: 76,
      reasons: ["Service issues resolved", "Renewal coming up", "Expansion plans"],
      distance: "18 min",
      bestTime: "3:30 PM",
      products: ["Maintenance Contracts", "Supplies"],
      revenue: "$45k potential",
    },
  ];

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <BrainIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              AI-Optimized Visit Schedule
            </Typography>
          </Box>
          <Chip
            label="If you only visit 3 practices today"
            color="primary"
            icon={<Lightbulb />}
          />
        </Box>

        <Stack spacing={2}>
          {priorityVisits.map((visit, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${visit.score}%`,
                  height: '100%',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  zIndex: 0,
                }}
              />
              
              <Box position="relative" zIndex={1}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        width: 56,
                        height: 56,
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {visit.practice}
                      </Typography>
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip
                          size="small"
                          label={`Score: ${visit.score}`}
                          color="primary"
                        />
                        <Chip
                          size="small"
                          label={visit.revenue}
                          icon={<AttachMoney fontSize="small" />}
                          color="success"
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Stack alignItems="flex-end" spacing={0.5}>
                    <Chip
                      size="small"
                      label={visit.distance}
                      icon={<DirectionsCar fontSize="small" />}
                    />
                    <Chip
                      size="small"
                      label={visit.bestTime}
                      icon={<Schedule fontSize="small" />}
                      color="secondary"
                    />
                  </Stack>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Why visit today:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {visit.reasons.map((reason, i) => (
                      <Chip
                        key={i}
                        size="small"
                        label={reason}
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Box>

                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Target Products:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {visit.products.join(', ')}
                    </Typography>
                  </Box>
                  
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined">
                      Prep Visit
                    </Button>
                    <Button size="small" variant="contained">
                      Start Route
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<MapIcon />}
          sx={{ mt: 2 }}
        >
          View Full Territory Map
        </Button>
      </CardContent>
    </Card>
  );
};

// Real-time Opportunity Alerts
const OpportunityAlerts: React.FC = () => {
  const theme = useTheme();
  const [showAll, setShowAll] = useState(false);

  const alerts = [
    {
      type: 'search',
      icon: <Search />,
      message: "Dr. Smith searched for 'implant systems' on supplier website",
      time: '2 min ago',
      action: 'Call Now',
      urgent: true,
    },
    {
      type: 'budget',
      icon: <AccountBalance />,
      message: "Q4 budget released at Riverside Dental ($150k)",
      time: '1 hour ago',
      action: 'Schedule Meeting',
      urgent: true,
    },
    {
      type: 'competitor',
      icon: <CompareArrows />,
      message: "Competitor contract expires next month at 3 accounts",
      time: '3 hours ago',
      action: 'View Accounts',
      urgent: false,
    },
    {
      type: 'procedure',
      icon: <TrendingUp />,
      message: "Botox procedures up 40% at Aesthetic Plus this month",
      time: '5 hours ago',
      action: 'Send Info',
      urgent: false,
    },
    {
      type: 'insurance',
      icon: <CreditCard />,
      message: "New reimbursement codes approved for laser treatments",
      time: 'Yesterday',
      action: 'Alert Clients',
      urgent: false,
    },
  ];

  const visibleAlerts = showAll ? alerts : alerts.slice(0, 3);

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Badge badgeContent={alerts.filter(a => a.urgent).length} color="error">
              <Notifications color="primary" />
            </Badge>
            <Typography variant="h6" fontWeight="bold">
              Live Opportunity Feed
            </Typography>
          </Box>
          <FormControlLabel
            control={<Switch size="small" defaultChecked />}
            label="Auto-refresh"
            sx={{ m: 0 }}
          />
        </Box>

        <Stack spacing={1}>
          <AnimatePresence>
            {visibleAlerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Paper
                  sx={{
                    p: 1.5,
                    backgroundColor: alert.urgent ? alpha(theme.palette.error.main, 0.05) : 'transparent',
                    border: `1px solid ${alert.urgent ? theme.palette.error.light : theme.palette.divider}`,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                      sx={{
                        backgroundColor: alert.urgent ? theme.palette.error.main : theme.palette.grey[200],
                        width: 36,
                        height: 36,
                      }}
                    >
                      {alert.icon}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2">
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {alert.time}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant={alert.urgent ? "contained" : "outlined"}
                      color={alert.urgent ? "error" : "primary"}
                    >
                      {alert.action}
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </Stack>

        {alerts.length > 3 && (
          <Button
            fullWidth
            size="small"
            onClick={() => setShowAll(!showAll)}
            sx={{ mt: 2 }}
          >
            {showAll ? 'Show Less' : `View ${alerts.length - 3} More Alerts`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Predictive Deal Scoring
const PredictiveDealScoring: React.FC = () => {
  const theme = useTheme();

  const deals = [
    {
      account: "Premier Dental Group",
      product: "Digital Imaging Suite",
      value: 185000,
      currentStage: "Negotiation",
      predictedClose: 92,
      daysToClose: 8,
      keyFactors: ["Budget approved", "Decision maker engaged", "Competitor eliminated"],
      nextAction: "Send final contract",
      risk: null,
    },
    {
      account: "City Medical Spa",
      product: "Laser Equipment Package",
      value: 125000,
      currentStage: "Proposal",
      predictedClose: 67,
      daysToClose: 21,
      keyFactors: ["Strong ROI case", "Multiple stakeholders", "Financing needed"],
      nextAction: "Schedule finance meeting",
      risk: "Competitor offering lower price",
    },
    {
      account: "Suburban Dental",
      product: "Maintenance Contract Renewal",
      value: 45000,
      currentStage: "Qualification",
      predictedClose: 43,
      daysToClose: 35,
      keyFactors: ["Past service issues", "New decision maker", "Budget constraints"],
      nextAction: "Address service concerns",
      risk: "Considering switching vendors",
    },
  ];

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <AutoGraph color="primary" />
            <Typography variant="h6" fontWeight="bold">
              AI Deal Predictions
            </Typography>
          </Box>
          <Chip
            label="Updated hourly"
            size="small"
            icon={<Timer fontSize="small" />}
          />
        </Box>

        <Stack spacing={2}>
          {deals.map((deal, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {deal.account}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {deal.product} • ${(deal.value / 1000).toFixed(0)}k
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress
                      variant="determinate"
                      value={deal.predictedClose}
                      size={40}
                      thickness={4}
                      sx={{
                        color: deal.predictedClose >= 70 ? theme.palette.success.main :
                               deal.predictedClose >= 40 ? theme.palette.warning.main :
                               theme.palette.error.main,
                      }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {deal.predictedClose}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        close probability
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box mb={2}>
                <Box display="flex" gap={1} mb={1}>
                  <Chip
                    size="small"
                    label={deal.currentStage}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={`${deal.daysToClose} days to close`}
                    icon={<Schedule fontSize="small" />}
                  />
                </Box>

                {deal.risk && (
                  <Alert severity="warning" sx={{ py: 0.5, mt: 1 }}>
                    <Typography variant="caption">{deal.risk}</Typography>
                  </Alert>
                )}
              </Box>

              <Box mb={2}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Success Factors:
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {deal.keyFactors.map((factor, i) => (
                    <Chip
                      key={i}
                      size="small"
                      label={factor}
                      icon={<CheckCircle fontSize="small" />}
                      sx={{
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.dark,
                        '& .MuiChip-icon': {
                          color: theme.palette.success.main,
                        },
                        mb: 0.5,
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={1}>
                  <Bolt color="primary" fontSize="small" />
                  <Typography variant="body2" color="primary" fontWeight="medium">
                    {deal.nextAction}
                  </Typography>
                </Box>
                <Button size="small" variant="contained">
                  Take Action
                </Button>
              </Box>
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Commission Calculator Widget
const CommissionCalculator: React.FC = () => {
  const theme = useTheme();
  const [showCalculator, setShowCalculator] = useState(false);

  const currentNumbers = {
    mtdRevenue: 342500,
    quotaAttainment: 68,
    currentCommission: 18750,
    projectedCommission: 28500,
    nextTier: 75,
    nextTierBonus: 5000,
  };

  return (
    <>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
          color: 'white',
          cursor: 'pointer',
        }}
        onClick={() => setShowCalculator(!showCalculator)}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Commission Tracker
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                ${currentNumbers.currentCommission.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Projected: ${currentNumbers.projectedCommission.toLocaleString()}
              </Typography>
            </Box>
            <Box textAlign="center">
              <CircularProgress
                variant="determinate"
                value={currentNumbers.quotaAttainment}
                size={80}
                thickness={6}
                sx={{
                  color: 'white',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {currentNumbers.quotaAttainment}% of quota
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.3)' }} />

          <Alert
            severity="info"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white',
              },
            }}
          >
            <Typography variant="body2">
              <strong>${((currentNumbers.nextTier - currentNumbers.quotaAttainment) * 342500 / 68).toFixed(0)}</strong> more 
              to reach {currentNumbers.nextTier}% tier (+${currentNumbers.nextTierBonus.toLocaleString()} bonus)
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={showCalculator}
        onClose={() => setShowCalculator(false)}
        PaperProps={{
          sx: { width: 400, p: 3 },
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Commission Calculator
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Model different scenarios to maximize your earnings
        </Typography>
        {/* Calculator UI would go here */}
      </Drawer>
    </>
  );
};

// Main Dashboard Component
const ActionableSalesDashboard: React.FC = () => {
  const theme = useTheme();
  const [selectedView, setSelectedView] = useState<'daily' | 'insights' | 'pipeline'>('daily');
  const [aiEnabled, setAiEnabled] = useState(true);

  // Quick action buttons for mobile
  const quickActions = [
    { icon: <Phone />, label: 'Call', color: theme.palette.primary.main },
    { icon: <Email />, label: 'Email', color: theme.palette.secondary.main },
    { icon: <CalendarToday />, label: 'Schedule', color: theme.palette.success.main },
    { icon: <Note />, label: 'Note', color: theme.palette.warning.main },
    { icon: <Calculate />, label: 'Quote', color: theme.palette.info.main },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Sales Intelligence Hub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tuesday, March 14 • Territory: West Coast
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="AI Assistant"
              sx={{ m: 0 }}
            />
            <Badge badgeContent={7} color="error">
              <IconButton>
                <Notifications />
              </IconButton>
            </Badge>
            <IconButton>
              <MoreVert />
            </IconButton>
          </Stack>
        </Box>

        {/* View Tabs */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Chip
            label="Daily Actions"
            icon={<Bolt />}
            onClick={() => setSelectedView('daily')}
            color={selectedView === 'daily' ? 'primary' : 'default'}
            variant={selectedView === 'daily' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Market Insights"
            icon={<Insights />}
            onClick={() => setSelectedView('insights')}
            color={selectedView === 'insights' ? 'primary' : 'default'}
            variant={selectedView === 'insights' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Pipeline AI"
            icon={<Timeline />}
            onClick={() => setSelectedView('pipeline')}
            color={selectedView === 'pipeline' ? 'primary' : 'default'}
            variant={selectedView === 'pipeline' ? 'filled' : 'outlined'}
          />
        </Stack>
      </Paper>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {aiEnabled && (
          <Fade in={aiEnabled}>
            <Box mb={3}>
              <MorningBriefing />
            </Box>
          </Fade>
        )}

        <Grid container spacing={3}>
          {/* Left Column - Primary Actions */}
          <Grid item xs={12} md={8}>
            {selectedView === 'daily' && (
              <Stack spacing={3}>
                <TerritoryPrioritization />
                <OpportunityAlerts />
              </Stack>
            )}

            {selectedView === 'insights' && (
              <Stack spacing={3}>
                {/* Market Intelligence Cards */}
                <AIInsightCard
                  title="Procedure Volume Spike"
                  insight="Invisalign procedures up 45% in your territory this month. 3 practices showing high interest but haven't purchased yet."
                  action="View Practices"
                  urgency="high"
                  confidence={89}
                  onAction={() => {}}
                />
                <AIInsightCard
                  title="Competitive Threat"
                  insight="SmileDirect launching aggressive pricing campaign. 5 of your accounts have been contacted."
                  action="Create Counter-offer"
                  urgency="medium"
                  confidence={76}
                  onAction={() => {}}
                />
                <AIInsightCard
                  title="Cross-sell Opportunity"
                  insight="Practices using your implant systems have 3x higher satisfaction. 8 accounts prime for upsell."
                  action="Generate List"
                  urgency="low"
                  confidence={92}
                  onAction={() => {}}
                />
              </Stack>
            )}

            {selectedView === 'pipeline' && (
              <PredictiveDealScoring />
            )}
          </Grid>

          {/* Right Column - Supporting Info */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <CommissionCalculator />
              
              {/* Quick Stats */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Today&apos;s Performance
                  </Typography>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Calls Made
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" fontWeight="bold">
                          12/15
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={80}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Meetings Scheduled
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        4
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Pipeline Added
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        $47k
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Peer Benchmarking */}
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Groups color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Team Ranking
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        backgroundColor: theme.palette.warning.main,
                        fontSize: '2rem',
                        fontWeight: 'bold',
                      }}
                    >
                      #3
                    </Avatar>
                  </Box>
                  <Typography variant="body2" color="text.secondary" align="center" paragraph>
                    You&apos;re in the top 15% of reps this quarter
                  </Typography>
                  <Button fullWidth variant="outlined" size="small">
                    View Full Leaderboard
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Floating Action Button for Mobile */}
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
        icon={<SpeedDialIcon />}
      >
        {quickActions.map((action) => (
          <SpeedDialAction
            key={action.label}
            icon={action.icon}
            tooltipTitle={action.label}
            sx={{
              backgroundColor: action.color,
              color: 'white',
              '&:hover': {
                backgroundColor: action.color,
                filter: 'brightness(0.9)',
              },
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default ActionableSalesDashboard;