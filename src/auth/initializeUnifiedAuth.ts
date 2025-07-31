import { initializeSupabase } from '../unified-auth/src/unifiedSupabase';

export const initializeUnifiedAuth = () => {
  // Initialize Supabase with Market Data environment variables
  initializeSupabase({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL!,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!
  });
};