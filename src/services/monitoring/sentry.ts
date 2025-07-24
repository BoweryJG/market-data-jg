// Sentry stub - Sentry packages are not installed
// To enable real Sentry monitoring, install: @sentry/react @sentry/tracing @sentry/integrations

import React from 'react';
import { logger } from '../logging/logger';

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
  logger.info('Sentry initialization skipped (packages not installed)', {
    environment: config.environment,
    release: config.release,
  });
}

export function captureException(error: Error, context?: Record<string, unknown>): void {
  logger.error('Exception capture skipped (Sentry not installed)', { 
    error: error.message, 
    context 
  });
}

export function captureMessage(message: string, level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info'): void {
  logger.info('Message capture skipped (Sentry not installed)', { message, level });
}

export function setUserContext(user: { id: string; email?: string; [key: string]: unknown }): void {
  logger.debug('User context not set (Sentry not installed)', { userId: user.id });
}

export function clearUserContext(): void {
  logger.debug('User context not cleared (Sentry not installed)');
}

export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  data?: Record<string, unknown>;
}): void {
  logger.debug('Breadcrumb not added (Sentry not installed)', breadcrumb);
}

// Stub components
export const SentryErrorBoundary: React.FC<{ children: React.ReactNode; fallback?: React.ComponentType }> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

export const withSentryRouting = <T extends React.ComponentType<any>>(Component: T): T => {
  return Component;
};