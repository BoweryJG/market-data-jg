import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, Button, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess, Refresh } from '@mui/icons-material';
import { logger } from '../../services/logging/logger';

interface Props {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
  onError?: (_error: Error,  errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  prevResetKeys?: Array<string | number>;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      prevResetKeys: props.resetKeys,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    // Reset error boundary when resetKeys change
    if (
      props.resetKeys &&
      state.prevResetKeys &&
      props.resetKeys.some((key, index) => key !== state.prevResetKeys?.[index])
    ) {
      return {
        hasError: false,
        error: null,
        errorInfo: null,
        prevResetKeys: props.resetKeys,
      };
    }
    return null;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName = 'Unknown', onError } = this.props;
    
    // Log error with component context
    logger.error(`Component error in ${componentName}`, {
      component: componentName,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
    });

    // Update state
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Report to monitoring service (prepared for Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          errorBoundary: 'component',
          component: componentName,
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback, componentName = 'This component', showDetails: showDetailsProp = true } = this.props;

    if (hasError) {
      if (fallback) {
        return <>{fallback}</>;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <Alert 
          severity="error"
          action={
            <>
              <Button
                color="inherit"
                size="small"
                onClick={this.handleReset}
                startIcon={<Refresh />}
              >
                Retry
              </Button>
              {showDetailsProp && isDevelopment && (
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={this.toggleDetails}
                >
                  {showDetails ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
            </>
          }
        >
          <AlertTitle>Error in {componentName}</AlertTitle>
          {error?.message || 'An unexpected error occurred'}
          
          {showDetailsProp && isDevelopment && (
            <Collapse in={showDetails}>
              <pre style={{
                marginTop: 8,
                padding: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: 4,
                fontSize: '0.75rem',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {error?.stack}
                {errorInfo?.componentStack && (
                  <>
                    {'\n\nComponent Stack:'}
                    {errorInfo.componentStack}
                  </>
                )}
              </pre>
            </Collapse>
          )}
        </Alert>
      );
    }

    return children;
  }
}

// Higher-order component for easier usage
export function withComponentErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (_props: P) => (
    <ComponentErrorBoundary {...errorBoundaryProps}>
      <Component {..._props} />
    </ComponentErrorBoundary>
  );

  WrappedComponent.displayName = `withComponentErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Sentry type declaration removed - using the one from useErrorHandler.ts