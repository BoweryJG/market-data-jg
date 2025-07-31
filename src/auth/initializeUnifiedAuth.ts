import { initializeSupabase } from '../unified-auth/src/unifiedSupabase';

export const initializeUnifiedAuth = () => {
  // Initialize Supabase with Market Data environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing required environment variables for unified auth:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      env: import.meta.env
    });
    // Don't initialize if missing, but don't break the app
    return;
  }

  try {
    initializeSupabase({
      supabaseUrl,
      supabaseAnonKey
    });
  } catch (error) {
    console.error('Failed to initialize unified auth:', error);
  }
};