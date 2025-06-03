import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Backdrop,
  styled,
  alpha
} from '@mui/material';
import {
  Lock,
  Upgrade,
  CreditCard,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';

const BlurredContent = styled(Box)(({ theme }) => ({
  filter: 'blur(8px)',
  pointerEvents: 'none',
  userSelect: 'none',
  position: 'relative'
}));

const OverlayCard = styled(Card)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 10,
  minWidth: 400,
  textAlign: 'center',
  background: alpha(theme.palette.background.paper, 0.98),
  backdropFilter: 'blur(10px)',
  border: `2px solid ${theme.palette.primary.main}`,
}));

interface SubscriptionGateProps {
  feature: string;
  children: React.ReactNode;
  showUpgradePrompt?: boolean;
  customMessage?: string;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  feature,
  children,
  showUpgradePrompt = true,
  customMessage
}) => {
  const { checkAccess, purchaseAddon } = useSubscription();
  const navigate = useNavigate();
  const access = checkAccess(feature);

  if (access.hasAccess) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  const handlePurchase = async () => {
    try {
      await purchaseAddon(feature);
      // Refresh the page or component
      window.location.reload();
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <BlurredContent>
        {children}
      </BlurredContent>
      
      <OverlayCard>
        <CardContent sx={{ p: 4 }}>
          <Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Premium Feature
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {customMessage || access.reason}
          </Typography>
          
          {access.requiresUpgrade && showUpgradePrompt && (
            <>
              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <AlertTitle>Unlock with Professional Plan</AlertTitle>
                Get unlimited access to this feature and much more for just $299/month
              </Alert>
              
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<Upgrade />}
                onClick={handleUpgrade}
                sx={{ mb: 2 }}
              >
                Upgrade Now
              </Button>
            </>
          )}
          
          {access.canPurchase && access.price && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Or purchase one-time access
              </Typography>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<CreditCard />}
                onClick={handlePurchase}
              >
                Buy for ${access.price}
              </Button>
            </>
          )}
        </CardContent>
      </OverlayCard>
    </Box>
  );
};

// Usage example component
export const PremiumFeatureExample: React.FC = () => {
  const { subscription, trackUsage } = useSubscription();

  const handleAIQuery = async () => {
    // Track usage when feature is used
    await trackUsage('aiQueries');
    
    // Perform the AI query
    console.log('Performing AI query...');
  };

  return (
    <SubscriptionGate feature="ai_query">
      <Card>
        <CardContent>
          <Typography variant="h6">AI Market Analysis</Typography>
          <Button onClick={handleAIQuery}>
            Run Analysis
          </Button>
          
          {subscription && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              {subscription.usage.aiQueries} / {subscription.limits.aiQueries} queries used
            </Typography>
          )}
        </CardContent>
      </Card>
    </SubscriptionGate>
  );
};