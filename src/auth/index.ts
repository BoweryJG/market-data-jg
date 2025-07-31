// Main auth exports - this is what other apps will import
export { useAuth } from './UnifiedAuthWrapper';
export { AuthProvider } from './AuthContext'; // Keep for backward compatibility
export { supabase, getAppUrl, getRedirectUrl } from './supabase';
export * from './hooks';
export * from './guards';
export * from './types';
export * from './redirect';