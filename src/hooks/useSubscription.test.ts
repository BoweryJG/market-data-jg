import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSubscription } from './useSubscription';
import { useAuth } from '../auth';
import { backendApiClient } from '../services/backendClient';

// Mock dependencies
vi.mock('../auth', () => ({
  useAuth: vi.fn()
}));
vi.mock('../services/backendClient', () => ({
  backendApiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('useSubscription', () => {
  const mockUser = { id: '123', email: 'test@example.com' };
  
  const mockSubscriptionData = {
    isActive: true,
    planId: 'professional',
    features: {
      aiQueries: 1000,
      users: 5,
      categories: 'unlimited' as const,
      automation: true,
      api: true
    },
    usage: {
      aiQueries: 100,
      users: 2,
      categories: 10,
      automationRuns: 50
    },
    limits: {
      aiQueries: 1000,
      users: 5,
      categories: 'unlimited' as const
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    (backendApiClient.get as any).mockResolvedValue(mockSubscriptionData);
    (backendApiClient.post as any).mockResolvedValue({ success: true });
  });

  it('should load subscription data on mount when user is present', async () => {
    const { result } = renderHook(() => useSubscription());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.subscription).toEqual(mockSubscriptionData);
    });

    expect(backendApiClient.get).toHaveBeenCalledWith('/api/subscription/status');
  });

  it('should not load subscription when no user is present', () => {
    (useAuth as any).mockReturnValue({ user: null });
    
    const { result } = renderHook(() => useSubscription());

    expect(backendApiClient.get).not.toHaveBeenCalled();
    expect(result.current.subscription).toBeNull();
  });

  it('should fall back to free tier on error', async () => {
    (backendApiClient.get as any).mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.subscription).toMatchObject({
        isActive: false,
        planId: 'free',
        features: {
          aiQueries: 10,
          users: 1,
          categories: 3,
          automation: false,
          api: false
        }
      });
    });
  });

  describe('checkAccess', () => {
    it('should allow access to features within limits', async () => {
      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const aiAccess = result.current.checkAccess('ai_query');
      expect(aiAccess).toEqual({ hasAccess: true });

      const automationAccess = result.current.checkAccess('automation');
      expect(automationAccess).toEqual({ hasAccess: true });
    });

    it('should deny access when limits are reached', async () => {
      (backendApiClient.get as any).mockResolvedValue({
        ...mockSubscriptionData,
        usage: { ...mockSubscriptionData.usage, aiQueries: 1000 }
      });

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const access = result.current.checkAccess('ai_query');
      expect(access).toMatchObject({
        hasAccess: false,
        reason: 'AI query limit reached (1000/month)',
        canPurchase: true,
        price: 0.50
      });
    });

    it('should handle unlimited features', async () => {
      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const categoryAccess = result.current.checkAccess('category');
      expect(categoryAccess).toEqual({ hasAccess: true });
    });

    it('should require upgrade for features not in plan', async () => {
      (backendApiClient.get as any).mockResolvedValue({
        ...mockSubscriptionData,
        features: { ...mockSubscriptionData.features, automation: false }
      });

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const access = result.current.checkAccess('automation');
      expect(access).toMatchObject({
        hasAccess: false,
        reason: 'Automation requires Professional plan or higher',
        requiresUpgrade: true
      });
    });

    it('should handle inactive subscription', async () => {
      (backendApiClient.get as any).mockResolvedValue({
        ...mockSubscriptionData,
        isActive: false,
        planId: 'professional'
      });

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const access = result.current.checkAccess('ai_query');
      expect(access).toMatchObject({
        hasAccess: false,
        reason: 'Subscription inactive',
        requiresUpgrade: true
      });
    });
  });

  describe('trackUsage', () => {
    it('should track feature usage and update local state', async () => {
      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.trackUsage('aiQueries', 5);
      });

      expect(backendApiClient.post).toHaveBeenCalledWith('/api/subscription/track-usage', {
        feature: 'aiQueries',
        quantity: 5
      });

      expect(result.current.subscription?.usage.aiQueries).toBe(105); // 100 + 5
    });

    it('should not track usage when no user is present', async () => {
      (useAuth as any).mockReturnValue({ user: null });
      
      const { result } = renderHook(() => useSubscription());

      await act(async () => {
        await result.current.trackUsage('aiQueries', 1);
      });

      expect(backendApiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('purchaseAddon', () => {
    it('should purchase addon and refresh subscription', async () => {
      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const purchaseResult = await act(async () => {
        return await result.current.purchaseAddon('ai_queries', 100);
      });

      expect(backendApiClient.post).toHaveBeenCalledWith('/api/subscription/purchase-addon', {
        addon: 'ai_queries',
        quantity: 100
      });

      expect(purchaseResult).toEqual({ success: true });
      
      // Should refresh subscription data
      expect(backendApiClient.get).toHaveBeenCalledTimes(2); // Initial load + refresh
    });

    it('should throw error on purchase failure', async () => {
      (backendApiClient.post as any).mockRejectedValue(new Error('Payment failed'));
      
      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await expect(
        act(async () => {
          await result.current.purchaseAddon('ai_queries', 100);
        })
      ).rejects.toThrow('Payment failed');
    });
  });

  describe('canUseFeature', () => {
    it('should return boolean for feature access', async () => {
      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.canUseFeature('ai_query')).toBe(true);
      expect(result.current.canUseFeature('automation')).toBe(true);
    });

    it('should return false for features beyond limits', async () => {
      (backendApiClient.get as any).mockResolvedValue({
        ...mockSubscriptionData,
        usage: { ...mockSubscriptionData.usage, users: 5 }
      });

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.canUseFeature('user')).toBe(false);
    });
  });

  describe('refreshSubscription', () => {
    it('should reload subscription data', async () => {
      const { result } = renderHook(() => useSubscription());

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Update mock to return different data
      const updatedData = {
        ...mockSubscriptionData,
        usage: { ...mockSubscriptionData.usage, aiQueries: 200 }
      };
      (backendApiClient.get as any).mockResolvedValue(updatedData);

      await act(async () => {
        await result.current.refreshSubscription();
      });

      expect(result.current.subscription?.usage.aiQueries).toBe(200);
      expect(backendApiClient.get).toHaveBeenCalledTimes(2);
    });
  });
});