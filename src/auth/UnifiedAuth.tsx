// Unified Auth exports for Market Data app
export { 
  UnifiedAuthProvider as AuthProvider,
  AuthContext
} from '../../../repconnect/shared/auth/UnifiedAuthContext';

export { useAuth } from '../../../repconnect/shared/auth/useAuth';

export type { AuthContextType } from '../../../repconnect/shared/auth/AuthContextType';

// Re-export all auth utilities
export * from '../../../repconnect/shared/auth/unifiedSupabase';