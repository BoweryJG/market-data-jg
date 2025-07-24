import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';
import { logger } from '../../services/logging/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  static displayName = 'GlobalErrorBoundary';
  
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorId } = this.state;
    
    // Log error to monitoring service
    logger.fatal('Global error boundary caught error', {
      errorId,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Report to monitoring service (prepared for Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          errorBoundary: 'global',
          errorId,
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
    
    // Optionally reload the page
    window.location.reload();
  };

  handleReportError = () => {
    const { error, errorId } = this.state;
    
    // Open email client with error details
    const subject = encodeURIComponent(`Error Report: ${errorId}`);
    const body = encodeURIComponent(
      `Error ID: ${errorId}\n\n` +
      `Error Message: ${error?.message || 'Unknown error'}\n\n` +
      `URL: ${window.location.href}\n\n` +
      `Time: ${new Date().toISOString()}\n\n` +
      `Please describe what you were doing when this error occurred:\n\n`
    );
    
    window.open(`mailto:support@repspheres.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const { error, errorId } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 64,
                color: 'error.main',
                marginBottom: 2,
              }}
            />
            
            <Typography variant="h4" gutterBottom>
              Oops! Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              We're sorry, but something unexpected happened. The error has been logged and our team will look into it.
            </Typography>

            {errorId && (
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Error ID: {errorId}
              </Typography>
            )}

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Refresh />}
                onClick={this.handleReset}
              >
                Reload Page
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={this.handleReportError}
              >
                Report Error
              </Button>
            </Stack>

            {isDevelopment && error && (
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  textAlign: 'left',
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Error Details (Development Only):
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                  }}
                >
                  {error.toString()}
                  {error.stack && `\n\nStack trace:\n${error.stack}`}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Type declaration for Sentry
declare global {
  interface Window {
    Sentry: any;
  }
}