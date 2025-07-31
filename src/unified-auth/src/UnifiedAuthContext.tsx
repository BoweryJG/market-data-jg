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
  // This is a placeholder - the actual implementation should be provided by the app
  return <>{children}</>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within UnifiedAuthProvider');
  }
  return context;
};