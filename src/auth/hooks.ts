import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';

/**
 * Hook to get the current user
 */
export const useUser = () => {
  const { user } = useAuth();
  return user;
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { user, loading } = useAuth();
  return { isAuthenticated: !!user, loading };
};

/**
 * Hook to require authentication - redirects if not authenticated
 */
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }, [user, loading, redirectTo]);
  
  return { user, loading };
};

/**
 * Hook to get user profile data from database
 */
export const useUserProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const targetUserId = userId || user?.id;
  
  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }
    
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', targetUserId)
          .single();
          
        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [targetUserId]);
  
  return { profile, loading, error };
};

/**
 * Hook to check if user has specific role or permission
 */
export const useHasRole = (role: string) => {
  const { user } = useAuth();
  const [hasRole, setHasRole] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      setHasRole(false);
      setLoading(false);
      return;
    }
    
    // Check app_metadata for roles
    const roles = user.app_metadata?.roles || [];
    setHasRole(roles.includes(role));
    setLoading(false);
  }, [user, role]);
  
  return { hasRole, loading };
};

/**
 * Hook to manage auth redirects
 */
export const useAuthRedirect = (
  authenticatedRedirect: string = '/dashboard',
  unauthenticatedRedirect: string = '/login'
) => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      if (user && window.location.pathname === '/login') {
        window.location.href = authenticatedRedirect;
      } else if (!user && window.location.pathname !== '/login') {
        window.location.href = unauthenticatedRedirect;
      }
    }
  }, [user, loading, authenticatedRedirect, unauthenticatedRedirect]);
};

/**
 * Hook to get auth session token
 */
export const useAuthToken = () => {
  const { session } = useAuth();
  return session?.access_token || null;
};