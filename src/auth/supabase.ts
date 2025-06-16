import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getStandardAuthConfig } from '../utils/crossDomainAuth';

// Get environment variables with fallbacks for development
// Market Insights uses VITE_ prefix
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client with standardized configuration
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, getStandardAuthConfig());

// Helper to get the current app URL for redirects
export const getAppUrl = () => {
  if (typeof window === 'undefined') {
    // Fallback for server-side rendering
    return 'https://marketdata.repspheres.com';
  }
  
  // For localhost development
  if (window.location.hostname === 'localhost') {
    return window.location.origin; // http://localhost:5173
  }
  
  // For production - force the market data subdomain
  if (window.location.hostname.includes('repspheres.com')) {
    return 'https://marketdata.repspheres.com';
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