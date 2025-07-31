import React from 'react';
import { UnifiedAuthProvider } from '../unified-auth/src/UnifiedAuthContext';

interface UnifiedAuthWrapperProps {
  children: React.ReactNode;
}

export const UnifiedAuthWrapper: React.FC<UnifiedAuthWrapperProps> = ({ children }) => {
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