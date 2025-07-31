import React from 'react';
import { UnifiedAuthProvider } from '../unified-auth/src/UnifiedAuthContext';

interface UnifiedAuthWrapperProps {
  children: React.ReactNode;
}

export const UnifiedAuthWrapper: React.FC<UnifiedAuthWrapperProps> = ({ children }) => {
  // Check if Supabase is configured
  const hasSupabaseConfig = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  
  // If no Supabase config, render children without auth provider
  if (!hasSupabaseConfig) {
    console.warn('UnifiedAuthWrapper: Supabase not configured, rendering without auth');
    return <>{children}</>;
  }
  
  // UnifiedAuthProvider uses the global supabase instance internally
  return (
    <UnifiedAuthProvider>
      {children}
    </UnifiedAuthProvider>
  );
};

// Re-export hooks for convenience
export { useAuth } from '../unified-auth/src/UnifiedAuthContext';
export { useRepXTier } from '../unified-auth/src/hooks/useRepXTier';
export { useFeatureAccess } from '../unified-auth/src/hooks/useFeatureAccess';