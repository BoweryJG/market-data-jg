import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { CaptureConsole } from '@sentry/integrations';

interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  debug?: boolean;
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
}

export function initializeSentry(config: SentryConfig): void {
  if (!config.dsn) {
    console.warn('Sentry DSN not provided. Skipping Sentry initialization.');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    debug: config.debug || false,
    
    // Performance Monitoring
    integrations: [
      new BrowserTracing({
        // Set tracingOrigins to control what URLs are traced
        tracingOrigins: [
          'localhost',
          'repspheres.com',
          /^\//,
        ],
        // Capture interactions (clicks, scrolls, etc.)
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
      new CaptureConsole({
        levels: ['error', 'warn'],
      }),
    ],
    
    // Performance sample rate
    tracesSampleRate: config.tracesSampleRate || 0.1,
    
    // Session Replay
    replaysSessionSampleRate: config.replaysSessionSampleRate || 0.1,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate || 1.0,
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out non-error events in production
      if (config.environment === 'production' && !hint.originalException) {
        return null;
      }
      
      // Filter out network errors that are expected (e.g., user offline)
      if (hint.originalException instanceof Error) {
        const error = hint.originalException;
        if (
          error.message.includes('Network request failed') ||
          error.message.includes('Failed to fetch')
        ) {
          // Still log but with lower severity
          event.level = 'warning';
        }
      }
      
      // Filter out errors from browser extensions
      if (event.exception?.values?.[0]?.stacktrace?.frames) {
        const frames = event.exception.values[0].stacktrace.frames;
        if (frames.some(frame => 
          frame.filename?.includes('chrome-extension://') ||
          frame.filename?.includes('moz-extension://')
        )) {
          return null;
        }
      }
      
      return event;
    },
    
    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }
      
      // Add more context to navigation breadcrumbs
      if (breadcrumb.category === 'navigation') {
        breadcrumb.data = {
          ...breadcrumb.data,
          timestamp: new Date().toISOString(),
        };
      }
      
      return breadcrumb;
    },
  });
}

// Error boundary component using Sentry
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Profiler for performance monitoring
export const SentryProfiler = Sentry.Profiler;

// Helper functions for manual error reporting
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const captureEvent = Sentry.captureEvent;

// Helper function to add context
export function setSentryContext(key: string, context: Record<string, any>): void {
  Sentry.setContext(key, context);
}

// Helper function to set user
export function setSentryUser(user: { id?: string; email?: string; username?: string; [key: string]: any } | null): void {
  Sentry.setUser(user);
}

// Helper function to add breadcrumb
export function addBreadcrumb(breadcrumb: {
  message?: string;
  type?: string;
  category?: string;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  data?: Record<string, any>;
}): void {
  Sentry.addBreadcrumb(breadcrumb);
}

// Performance monitoring helpers
export function startTransaction(name: string, op: string): any {
  return Sentry.startTransaction({ name, op });
}

export function measurePerformance<T>(
  name: string,
  operation: () => T | Promise<T>
): T | Promise<T> {
  const transaction = startTransaction(name, 'function');
  
  try {
    const result = operation();
    
    if (result instanceof Promise) {
      return result
        .then(value => {
          transaction.setStatus('ok');
          return value;
        })
        .catch(error => {
          transaction.setStatus('internal_error');
          throw error;
        })
        .finally(() => {
          transaction.finish();
        });
    }
    
    transaction.setStatus('ok');
    transaction.finish();
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    transaction.finish();
    throw error;
  }
}

// Import required React Router v6 components
import React from 'react';
import { 
  useLocation, 
  useNavigationType, 
  createRoutesFromChildren, 
  matchRoutes 
} from 'react-router-dom';