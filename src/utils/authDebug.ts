/**
 * Auth Debug Utility for MarketData
 * Helps diagnose cross-domain authentication issues
 */

import { supabase } from '../auth/supabase';

export async function debugAuth() {
  console.group('🔍 MarketData Auth Debug Info');
  
  // 1. Check current domain
  if (process.env.NODE_ENV === 'development') {
    console.log('Current Domain:', window.location.hostname);
    console.log('Current URL:', window.location.href);
  }
  
  // 2. Check Supabase session
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Session Error:', error);
      }
    } else if (session) {
      console.log('✅ Session found:', {
        user_id: session.user.id,
        email: session.user.email,
        expires_at: new Date(session.expires_at! * 1000).toLocaleString()
      });
    } else {
      console.log('❌ No session found');
    }
  } catch (err) {
    console.error('Failed to get session:', err);
  }
  
  // 3. Check cookies
  console.log('Cookies:', document.cookie);
  
  // 4. Check localStorage
  console.log('LocalStorage auth keys:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('auth') || key.includes('supabase'))) {
      console.log(`  ${key}:`, localStorage.getItem(key)?.substring(0, 50) + '...');
    }
  }
  
  // 5. Check sessionStorage
  console.log('SessionStorage auth keys:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('auth') || key.includes('return') || key.includes('destination'))) {
      console.log(`  ${key}:`, sessionStorage.getItem(key));
    }
  }
  
  console.groupEnd();
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  console.log('💡 Run window.debugAuth() to debug authentication issues');
}