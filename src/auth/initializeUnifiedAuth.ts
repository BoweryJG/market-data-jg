import { initializeSupabase } from '../unified-auth/src/unifiedSupabase';

export const initializeUnifiedAuth = () => {
  // Initialize Supabase with Market Data environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing required environment variables for unified auth:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    });
    // Don't throw error, just skip initialization
    return;
  }

  initializeSupabase({
    supabaseUrl,
    supabaseAnonKey
  });
};