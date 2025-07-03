import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js'; // Added Session
import { supabase } from '../services/supabaseClient';
import apiClient from '../services/api-client'; // Import the apiClient

export type SubscriptionLevel = 'free' | 'basic' | 'professional' | 'enterprise';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  territory?: string;
  subscription_level: SubscriptionLevel;
  subscription_expires?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  subscriptionLevel: SubscriptionLevel;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscriptionLevel, setSubscriptionLevel] = useState<SubscriptionLevel>('free');
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, userEmail?: string) => {
    console.log('🔍 Fetching user profile for:', userId, userEmail);
    try {
      // First try to get existing profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('📊 Profile fetch result:', { profile, error });

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const newProfile: Partial<UserProfile> = {
          id: userId,
          email: userEmail || '',
          subscription_level: 'free',
          created_at: new Date().toISOString(),
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([newProfile])
          .select()
          .single();

        if (!createError && createdProfile) {
          console.log('✨ Created new profile:', createdProfile);
          setUserProfile(createdProfile);
          setSubscriptionLevel(createdProfile.subscription_level || 'free');
        } else if (createError) {
          console.error('❌ Error creating profile:', createError);
        }
      } else if (profile) {
        console.log('✅ Setting user profile:', profile);
        console.log('💎 Subscription level:', profile.subscription_level);
        setUserProfile(profile);
        setSubscriptionLevel(profile.subscription_level || 'free');
      } else {
        console.log('⚠️ No profile found and no error - this is unusual');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Default to free tier if profile fetch fails
      setSubscriptionLevel('free');
    }
  };

  useEffect(() => {
    const setAuthHeader = async (session: Session | null) => {
      setLoading(true);
      if (session && session.access_token) {
        apiClient.setAuthToken(session.access_token);
        setUser(session.user);
        await fetchUserProfile(session.user.id, session.user.email);
      } else {
        apiClient.clearAuthToken();
        setUser(null);
        setUserProfile(null);
        setSubscriptionLevel('free');
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      console.log('Initial session:', session?.user?.email);
      setAuthHeader(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setAuthHeader(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    await supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    apiClient.clearAuthToken(); // Explicitly clear token on sign out
  };

  const isAuthenticated = !!user && !loading;
  
  // Debug log authentication state
  useEffect(() => {
    console.log('🔐 Auth State:', {
      isAuthenticated,
      user: user?.email,
      loading,
      subscriptionLevel,
      userProfile: userProfile?.email
    });
  }, [isAuthenticated, user, loading, subscriptionLevel, userProfile]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile,
      subscriptionLevel,
      loading,
      signUp, 
      signIn, 
      signOut,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
