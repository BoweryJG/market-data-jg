import { useCallback } from 'react';
import { logger } from '../services/logging/logger';
import { captureException } from '../services/monitoring/sentry';

interface ErrorHandlerOptions {
  componentName?: string;
  showAlert?: boolean;
  logLevel?: 'warn' | 'error' | 'fatal';
  context?: Record<string, unknown>;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    componentName = 'Unknown Component',
    showAlert = true,
    logLevel = 'error',
    context = {},
  } = options;

  const handleError = useCallback((error: Error | unknown, additionalContext?: Record<string, unknown>) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Combine contexts
    const fullContext = {
      component: componentName,
      ...context,
      ...additionalContext,
    };

    // Log the error
    switch (logLevel) {
      case 'warn':
        logger.warn(`Error in ${componentName}: ${errorObj.message}`, fullContext);
        break;
      case 'fatal':
        logger.fatal(`Fatal error in ${componentName}: ${errorObj.message}`, errorObj, fullContext);
        break;
      default:
        logger.error(`Error in ${componentName}: ${errorObj.message}`, errorObj, fullContext);
    }

    // Report to Sentry
    if (window.Sentry) {
      captureException(errorObj, {
        contexts: {
          component: fullContext,
        },
        tags: {
          component: componentName,
        },
      });
    }

    // Show user alert if requested
    if (showAlert && process.env.NODE_ENV === 'production') {
      // In production, log user-facing error message
      logger.error('User-facing error displayed', { message: 'An error occurred. Please try again or contact support if the issue persists.' });
    }

    // Re-throw in development for better debugging
    if (process.env.NODE_ENV === 'development') {
      throw errorObj;
    }
  }, [componentName, showAlert, logLevel, context]);

  const handleAsyncError = useCallback(async <T,>(
    promise: Promise<T>,
    additionalContext?: Record<string, unknown>
  ): Promise<T | null> => {
    try {
      return await promise;
    } catch (error) {
      handleError(error, additionalContext);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
}

// Type declaration for Sentry
interface SentryInterface {
  captureException: (error: Error, context?: Record<string, unknown>) => void;
  setContext: (key: string, context: Record<string, unknown>) => void;
  setTag: (key: string, value: string) => void;
  withScope: (callback: (scope: unknown) => void) => void;
}

declare global {
  interface Window {
    Sentry: SentryInterface;
  }
}