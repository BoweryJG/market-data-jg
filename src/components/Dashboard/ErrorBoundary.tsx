import React, { Component, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Warning } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error caught by boundary
    console.error('Dashboard Error:', error);
    console.error('Error Info:', errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 500,
              textAlign: 'center',
              backgroundColor: 'background.paper',
            }}
          >
            <Warning sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              An error occurred while loading the dashboard. Please try refreshing the page.
            </Typography>
            {this.state.error && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2 }}>
                {this.state.error.message}
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{ mr: 2 }}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;