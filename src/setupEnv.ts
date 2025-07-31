// This file maps REACT_APP_ environment variables to VITE_ environment variables
// This enables compatibility with both Netlify's environment variables and local development

// Set default values that will be overridden if environment variables exist
const env = {
  // Supabase settings - must be provided via environment variables
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  // API URL - must be provided via environment variables
  VITE_API_URL: import.meta.env.VITE_API_URL || '',
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
