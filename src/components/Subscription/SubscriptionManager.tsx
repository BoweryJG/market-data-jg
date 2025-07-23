import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Divider,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
  styled,
  alpha,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Star,
  Rocket,
  EmojiEvents as Crown,
  TrendingUp,
  Speed,
  AutoAwesome,
  Lock,
  LockOpen,
  Payment,
  CreditCard,
  Receipt,
  Timeline,
  BarChart,
  Warning,
  Info,
  CheckCircleOutline,
  RadioButtonUnchecked,
  Upgrade,
  Download,
  CloudSync,
  Support,
  School,
  Groups,
  Api,
  AutoMode,
  Category,
  Analytics,
  ElectricBolt,
  WorkspacePremium
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../../auth';
import { backendApiClient } from '../../services/backendClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

// Styled components
const PlanCard = styled(Card)<{ selected?: boolean; popular?: boolean }>(({ theme, selected, popular }) => ({
  position: 'relative',
  height: '100%',
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  transition: 'all 0.3s ease',
  overflow: 'visible',
  ...(popular && {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[8],
    '&::before': {
      content: '"MOST POPULAR"',
      position: 'absolute',
      top: -12,
      left: '50%',
      transform: 'translateX(-50%)',
      background: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      padding: '4px 16px',
      borderRadius: 16,
      fontSize: '0.75rem',
      fontWeight: 'bold',
    }
  }),
  '&:hover': {
    transform: popular ? 'scale(1.07)' : 'scale(1.02)',
    boxShadow: theme.shadows[12],
    border: `2px solid ${theme.palette.primary.main}`,
  }
}));

const UsageBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

interface Plan {
  id: string;
  name: string;
  price: number | string;
  interval: string;
  features: {
    users: number | string;
    aiQueries: number | string;
    categories: number | string;
    automation: boolean;
    api: boolean;
    support: string;
    training: boolean;
    analytics: string;
  };
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    interval: 'month',
    features: {
      users: 1,
      aiQueries: 100,
      categories: 5,
      automation: false,
      api: false,
      support: 'Email',
      training: false,
      analytics: 'Basic'
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 299,
    interval: 'month',
    features: {
      users: 5,
      aiQueries: 1000,
      categories: 'Unlimited',
      automation: true,
      api: true,
      support: 'Priority',
      training: true,
      analytics: 'Advanced'
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    interval: 'month',
    features: {
      users: 'Unlimited',
      aiQueries: 'Unlimited',
      categories: 'Unlimited',
      automation: true,
      api: true,
      support: 'Dedicated',
      training: true,
      analytics: 'Custom'
    }
  }
];

const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [currentPlan, setCurrentPlan] = useState<string>('starter');
  const [usage, setUsage] = useState({
    aiQueries: { used: 45, limit: 100 },
    users: { used: 1, limit: 1 },
    categories: { used: 3, limit: 5 },
    automationRuns: { used: 0, limit: 0 }
  });
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      const [subscription, usageData, history] = await Promise.all([
        backendApiClient.get('/api/subscription'),
        backendApiClient.get('/api/subscription/usage'),
        backendApiClient.get('/api/subscription/billing-history')
      ]);
      
      setCurrentPlan(subscription.planId || 'starter');
      setUsage(usageData);
      setBillingHistory(history);
    } catch (error) {
      // Failed to load subscription data
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === 'enterprise') {
      window.location.href = 'mailto:sales@repspheres.com?subject=Enterprise Plan Inquiry';
      return;
    }
    
    setSelectedPlan(planId);
    setUpgradeDialogOpen(true);
  };

  const processUpgrade = async () => {
    if (!selectedPlan) return;
    
    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');
      
      // Create checkout session
      const data = await backendApiClient.post('/api/subscription/create-checkout', {
        planId: selectedPlan,
        userId: user?.id
      });
      
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });
      
      if (error) {
        // Stripe redirect error occurred
      }
    } catch (error) {
      // Upgrade failed
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const data = await backendApiClient.post('/api/subscription/portal');
      window.location.href = data.url;
    } catch (error) {
      // Failed to open billing portal
    }
  };

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, React.ReactElement> = {
      users: <Groups />,
      aiQueries: <AutoAwesome />,
      categories: <Category />,
      automation: <AutoMode />,
      api: <Api />,
      support: <Support />,
      training: <School />,
      analytics: <Analytics />
    };
    return icons[feature] || <CheckCircle />;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return theme.palette.error.main;
    if (percentage >= 75) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Current Plan Overview */}
      <Paper sx={{ p: 3, mb: 4, background: alpha(theme.palette.primary.main, 0.05) }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <WorkspacePremium sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {plans.find(p => p.id === currentPlan)?.name} Plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Next billing date: December 14, 2024
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="outlined" 
              startIcon={<Payment />}
              onClick={handleManageBilling}
            >
              Manage Billing
            </Button>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {/* AI Queries Usage */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">AI Queries</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {usage.aiQueries.used} / {usage.aiQueries.limit}
                  </Typography>
                </Box>
                <UsageBar 
                  variant="determinate" 
                  value={(usage.aiQueries.used / usage.aiQueries.limit) * 100}
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getUsageColor((usage.aiQueries.used / usage.aiQueries.limit) * 100)
                    }
                  }}
                />
              </Box>
              
              {/* Categories Usage */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Active Categories</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {usage.categories.used} / {usage.categories.limit}
                  </Typography>
                </Box>
                <UsageBar 
                  variant="determinate" 
                  value={(usage.categories.used / usage.categories.limit) * 100}
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Pricing Plans */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Choose Your Plan
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <PlanCard 
              selected={plan.id === currentPlan}
              popular={plan.popular}
            >
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Plan Header */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  {plan.id === 'starter' && <Rocket sx={{ fontSize: 48, color: theme.palette.info.main }} />}
                  {plan.id === 'professional' && <Star sx={{ fontSize: 48, color: theme.palette.warning.main }} />}
                  {plan.id === 'enterprise' && <Crown sx={{ fontSize: 48, color: theme.palette.secondary.main }} />}
                  
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2 }}>
                    {plan.name}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {typeof plan.price === 'number' ? (
                      <>
                        <Typography variant="h3" component="span" sx={{ fontWeight: 'bold' }}>
                          ${plan.price}
                        </Typography>
                        <Typography variant="h6" component="span" color="text.secondary">
                          /{plan.interval}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {plan.price}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Features List */}
                <List sx={{ flex: 1 }}>
                  <ListItem>
                    <ListItemIcon>{getFeatureIcon('users')}</ListItemIcon>
                    <ListItemText 
                      primary={`${plan.features.users} ${typeof plan.features.users === 'number' ? 'User' : 'Users'}`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>{getFeatureIcon('aiQueries')}</ListItemIcon>
                    <ListItemText 
                      primary={`${plan.features.aiQueries} AI Queries/month`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>{getFeatureIcon('categories')}</ListItemIcon>
                    <ListItemText 
                      primary={`${plan.features.categories} Categories`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      {plan.features.automation ? <CheckCircleOutline color="success" /> : <Cancel color="disabled" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Sales Automation"
                      secondary={plan.features.automation ? 'Included' : 'Not available'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      {plan.features.api ? <CheckCircleOutline color="success" /> : <Cancel color="disabled" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="API Access"
                      secondary={plan.features.api ? 'Full access' : 'Not available'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>{getFeatureIcon('support')}</ListItemIcon>
                    <ListItemText 
                      primary={`${plan.features.support} Support`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>{getFeatureIcon('analytics')}</ListItemIcon>
                    <ListItemText 
                      primary={`${plan.features.analytics} Analytics`}
                    />
                  </ListItem>
                </List>

                {/* Action Button */}
                <Box sx={{ mt: 'auto', pt: 2 }}>
                  {plan.id === currentPlan ? (
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      fullWidth 
                      variant={plan.popular ? "contained" : "outlined"}
                      onClick={() => handleUpgrade(plan.id)}
                      startIcon={<Upgrade />}
                    >
                      {plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                    </Button>
                  )}
                </Box>
              </CardContent>
            </PlanCard>
          </Grid>
        ))}
      </Grid>

      {/* Usage-Based Pricing */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ElectricBolt color="warning" />
          Pay As You Go
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Need more? Purchase additional resources without upgrading your plan
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2">Extra AI Queries</Typography>
                <Typography variant="h6">$0.50/query</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2">Automation Runs</Typography>
                <Typography variant="h6">$2.00/run</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2">Premium Reports</Typography>
                <Typography variant="h6">$5.00/report</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2">API Calls</Typography>
                <Typography variant="h6">$0.10/call</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Billing History */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Receipt />
          Billing History
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Professional Plan - November 2024"
              secondary="Paid on Nov 14, 2024"
            />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              $299.00
            </Typography>
            <IconButton size="small" sx={{ ml: 2 }}>
              <Download />
            </IconButton>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Additional AI Queries (150)"
              secondary="Paid on Nov 8, 2024"
            />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              $75.00
            </Typography>
            <IconButton size="small" sx={{ ml: 2 }}>
              <Download />
            </IconButton>
          </ListItem>
        </List>
      </Paper>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)}>
        <DialogTitle>Upgrade to {plans.find(p => p.id === selectedPlan)?.name}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Your plan will be upgraded immediately and you&apos;ll be charged a prorated amount.
          </Alert>
          <Typography variant="body2">
            By upgrading, you&apos;ll get access to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="All features in your current plan" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Increased limits and quotas" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Priority support" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={processUpgrade}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CreditCard />}
          >
            Confirm Upgrade
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionManager;