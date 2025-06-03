// This file maps REACT_APP_ environment variables to VITE_ environment variables
// This enables compatibility with both Netlify's environment variables and local development

// Set default values that will be overridden if environment variables exist
const env = {
  // Supabase settings - use same approach as CRM project
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://cbopynuvhcymbumjnvay.supabase.co',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU',
  // API URL
  VITE_API_URL: 'https://osbackend-zl1h.onrender.com',
};

// Map REACT_APP_ variables to VITE_ variables for backward compatibility
if (import.meta.env.REACT_APP_SUPABASE_URL) {
  env.VITE_SUPABASE_URL = import.meta.env.REACT_APP_SUPABASE_URL;
}

if (import.meta.env.REACT_APP_SUPABASE_ANON_KEY) {
  env.VITE_SUPABASE_ANON_KEY = import.meta.env.REACT_APP_SUPABASE_ANON_KEY;
}

if (import.meta.env.REACT_APP_API_URL) {
  env.VITE_API_URL = import.meta.env.REACT_APP_API_URL;
}

// Export the environment variables
export default env;
