import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getStandardAuthConfig } from '../utils/crossDomainAuth';

// Get environment variables - Market Data uses VITE_ prefix
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables, using defaults');
}

// Create a single supabase client with standardized configuration
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, getStandardAuthConfig());

// Helper to get the current app URL for redirects
export const getAppUrl = () => {
  const productionUrl = import.meta.env.VITE_APP_URL || 'https://marketdata.repspheres.com';
  
  if (typeof window === 'undefined') {
    // Fallback for server-side rendering
    return productionUrl;
  }
  
  // For localhost development
  if (window.location.hostname === 'localhost') {
    return window.location.origin; // http://localhost:5173
  }
  
  // For production - use environment variable or current origin
  if (window.location.hostname.includes('repspheres.com')) {
    return productionUrl;
  }
  
  // Fallback to current origin
  return window.location.origin;
};

// Get redirect URL for OAuth
export const getRedirectUrl = (returnPath?: string) => {
  const baseUrl = getAppUrl();
  const redirectPath = returnPath || '/auth/callback';
  return `${baseUrl}${redirectPath}`;
};