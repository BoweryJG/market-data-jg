/**
 * Auth Debug Utility for MarketData
 * Helps diagnose cross-domain authentication issues
 */

import { supabase } from '../auth/supabase';
import { logger } from '../services/logging/logger';
import { getErrorMessage } from './errorUtils';

export async function debugAuth() {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('=== MarketData Auth Debug Info ===');
  }
  
  // 1. Check current domain
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Current location', { domain: window.location.hostname, url: window.location.href });
  }
  
  // 2. Check Supabase session
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Session Error', { error: getErrorMessage(error) });
      }
    } else if (session && process.env.NODE_ENV === 'development') {
      logger.debug('Session found', {
        user_id: session.user.id,
        email: session.user.email,
        expires_at: new Date(session.expires_at! * 1000).toLocaleString()
      });
    } else if (process.env.NODE_ENV === 'development') {
      logger.debug('No session found');
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Failed to get session', { error: getErrorMessage(err) });
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    // 3. Check cookies
    logger.debug('Cookies present', { cookieCount: document.cookie.split(';').length });
    
    // 4. Check localStorage
    logger.debug('LocalStorage auth keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('supabase'))) {
        logger.debug(`LocalStorage key: ${key}`, { preview: localStorage.getItem(key)?.substring(0, 50) + '...' });
      }
    }
    
    // 5. Check sessionStorage
    logger.debug('SessionStorage auth keys:');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('auth') || key.includes('return') || key.includes('destination'))) {
        logger.debug(`SessionStorage key: ${key}`, { value: sessionStorage.getItem(key) });
      }
    }
    
    logger.debug('=== Auth Debug Info Complete ===');
  }
}

// Make it available globally
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugAuth = debugAuth;
  logger.info('Debug utility available at window.debugAuth()');
}