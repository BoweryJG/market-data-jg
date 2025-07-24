import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { logger } from '../src/services/logging/logger';

interface SubscriptionStatus {
  isActive: boolean;
  planId: string;
  features: {
    aiQueries: number | 'unlimited';
    users: number | 'unlimited';
    categories: number | 'unlimited';
    automation: boolean;
    api: boolean;
  };
  usage: {
    aiQueries: number;
    users: number;
    categories: number;
    automationRuns: number;
  };
  limits: {
    aiQueries: number | 'unlimited';
    users: number | 'unlimited';
    categories: number | 'unlimited';
  };
}

interface AccessCheck {
  hasAccess: boolean;
  reason?: string;
  requiresUpgrade?: boolean;
  canPurchase?: boolean;
  price?: number;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/subscription/status');
      setSubscription(data);
    } catch {
      // Default to free tier if error
      setSubscription({
        isActive: false,
        planId: 'free',
        features: {
          aiQueries: 10,
          users: 1,
          categories: 3,
          automation: false,
          api: false
        },
        usage: {
          aiQueries: 0,
          users: 1,
          categories: 0,
          automationRuns: 0
        },
        limits: {
          aiQueries: 10,
          users: 1,
          categories: 3
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = useCallback((feature: string): AccessCheck => {
    if (!subscription) {
      return { hasAccess: false, reason: 'Loading subscription...' };
    }

    if (!subscription.isActive && subscription.planId !== 'free') {
      return { 
        hasAccess: false, 
        reason: 'Subscription inactive',
        requiresUpgrade: true 
      };
    }

    switch (feature) {
      case 'ai_query':
        if (subscription.limits.aiQueries === 'unlimited') {
          return { hasAccess: true };
        }
        if (subscription.usage.aiQueries >= subscription.limits.aiQueries) {
          return {
            hasAccess: false,
            reason: `AI query limit reached (${subscription.limits.aiQueries}/month)`,
            canPurchase: true,
            price: 0.50
          };
        }
        return { hasAccess: true };

      case 'automation':
        if (!subscription.features.automation) {
          return {
            hasAccess: false,
            reason: 'Automation requires Professional plan or higher',
            requiresUpgrade: true
          };
        }
        return { hasAccess: true };

      case 'api':
        if (!subscription.features.api) {
          return {
            hasAccess: false,
            reason: 'API access requires Professional plan or higher',
            requiresUpgrade: true
          };
        }
        return { hasAccess: true };

      case 'category':
        if (subscription.limits.categories === 'unlimited') {
          return { hasAccess: true };
        }
        if (subscription.usage.categories >= subscription.limits.categories) {
          return {
            hasAccess: false,
            reason: `Category limit reached (${subscription.limits.categories} categories)`,
            requiresUpgrade: true
          };
        }
        return { hasAccess: true };

      case 'user':
        if (subscription.limits.users === 'unlimited') {
          return { hasAccess: true };
        }
        if (subscription.usage.users >= subscription.limits.users) {
          return {
            hasAccess: false,
            reason: `User limit reached (${subscription.limits.users} users)`,
            requiresUpgrade: true
          };
        }
        return { hasAccess: true };

      default:
        return { hasAccess: true };
    }
  }, [subscription]);

  const trackUsage = useCallback(async (feature: string, quantity: number = 1) => {
    if (!user) return;

    try {
      await apiClient.post('/subscription/track-usage', {
        feature,
        quantity
      });
      
      // Optimistically update local state
      if (subscription) {
        setSubscription(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            usage: {
              ...prev.usage,
              [feature]: prev.usage[feature as keyof typeof prev.usage] + quantity
            }
          };
        });
      }
    } catch {
      // Failed to track usage
    }
  }, [user, subscription]);

  const purchaseAddon = useCallback(async (addon: string, quantity: number = 1) => {
    try {
      const { data } = await apiClient.post('/subscription/purchase-addon', {
        addon,
        quantity
      });
      
      // Refresh subscription data
      await loadSubscription();
      
      return data;
    } catch (error) {
      logger.error('Failed to purchase addon', { error: error.message });
      throw error;
    }
  }, []);

  const canUseFeature = useCallback((feature: string): boolean => {
    const access = checkAccess(feature);
    return access.hasAccess;
  }, [checkAccess]);

  return {
    subscription,
    loading,
    checkAccess,
    trackUsage,
    purchaseAddon,
    canUseFeature,
    refreshSubscription: loadSubscription
  };
};