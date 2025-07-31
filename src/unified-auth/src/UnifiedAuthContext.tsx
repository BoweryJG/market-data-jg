import React, { createContext, useContext, ReactNode } from 'react';
import { supabase } from './unifiedSupabase';

export interface AuthContextType {
  user: any;
  loading: boolean;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Provide a minimal auth context to prevent errors
  const value: AuthContextType = {
    user: null,
    loading: false,
    signInWithProvider: async () => {
      console.warn('Auth not configured');
    },
    signInWithEmail: async () => {
      console.warn('Auth not configured');
    },
    signUpWithEmail: async () => {
      console.warn('Auth not configured');
    },
    signOut: async () => {
      console.warn('Auth not configured');
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within UnifiedAuthProvider');
  }
  return context;
};