# Error Handling and Monitoring Guide

## Overview

This application implements comprehensive error handling and monitoring to ensure reliability and facilitate debugging. The system includes:

- React Error Boundaries for graceful error recovery
- Structured logging with multiple transports
- API request interception and monitoring
- Health check endpoints
- Performance monitoring
- Sentry integration for production error tracking

## Components

### 1. Error Boundaries

#### Global Error Boundary
Wraps the entire application to catch unhandled errors:

```tsx
// In src/main.tsx
<GlobalErrorBoundary>
  <App />
</GlobalErrorBoundary>
```

#### Component Error Boundary
For specific components that might fail:

```tsx
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

<ComponentErrorBoundary componentName="MyComponent">
  <MyComponent />
</ComponentErrorBoundary>
```

Or using the HOC:

```tsx
import { withComponentErrorBoundary } from '@/components/ErrorBoundary';

export default withComponentErrorBoundary(MyComponent, {
  componentName: 'MyComponent',
  onError: (error, errorInfo) => {
    // Custom error handling
  }
});
```

### 2. Logging System

#### Logger Usage

```typescript
import { logger } from '@/services/logging/logger';

// Different log levels
logger.debug('Debug message', { additionalData: 'value' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
logger.fatal('Fatal error', error, { context: 'data' });

// Performance logging
logger.time('operation');
// ... perform operation
logger.timeEnd('operation');

// Set user context
logger.setUserId('user123');
```

#### Log Transports

1. **Console Transport** - Development logging with colored output
2. **LocalStorage Transport** - Persists logs for debugging
3. **Remote Transport** - Sends logs to backend API
4. **Sentry Transport** - Integrates with Sentry for error tracking

### 3. API Monitoring

The API interceptor automatically monitors all fetch requests:

```typescript
import { fetchWithRetry } from '@/services/api/interceptor';

// Automatic retry with exponential backoff
const response = await fetchWithRetry({
  url: '/api/endpoint',
  method: 'POST',
  body: JSON.stringify(data),
  retries: 3,
  timeout: 5000
});
```

### 4. Error Handling Hook

Use the error handler hook in components:

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { handleError, handleAsyncError } = useErrorHandler({
    componentName: 'MyComponent',
    showAlert: true
  });

  const fetchData = async () => {
    const result = await handleAsyncError(
      fetch('/api/data').then(r => r.json()),
      { operation: 'fetchData' }
    );
    
    if (result) {
      // Handle successful result
    }
  };

  try {
    // Some operation
  } catch (error) {
    handleError(error, { context: 'additional info' });
  }
}
```

### 5. Performance Monitoring

Monitor component performance:

```typescript
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

function MyComponent() {
  const { measureAsync, mark, measure } = usePerformanceMonitor({
    componentName: 'MyComponent',
    logSlowRenders: true,
    slowRenderThreshold: 16.67 // 60fps
  });

  const loadData = async () => {
    return measureAsync('loadData', async () => {
      const response = await fetch('/api/data');
      return response.json();
    });
  };

  // Mark custom events
  mark('start-processing');
  // ... do processing
  mark('end-processing');
  const duration = measure('processing', 'start-processing', 'end-processing');
}
```

### 6. Health Check Endpoints

The server provides health check endpoints:

- `GET /health` - Overall system health
- `GET /health/live` - Simple liveness check
- `GET /health/ready` - Readiness check
- `GET /health/check/:name` - Individual service check

Example response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful",
      "duration": "45ms"
    },
    "memory": {
      "status": "healthy",
      "message": "Memory usage is normal",
      "details": {
        "heapUsed": "125 MB",
        "heapTotal": "512 MB",
        "percentage": "24.41%"
      }
    }
  }
}
```

### 7. Monitoring Dashboard

Access the monitoring dashboard at `/monitoring` (requires authentication).

Features:
- Real-time system health status
- Error and warning counts
- API performance metrics
- Recent logs with filtering
- Log export functionality

### 8. Server-Side Logging

The server stores logs in the `./logs` directory with automatic rotation:

- Logs are stored in daily files: `app-YYYY-MM-DD.log`
- Old logs are automatically cleaned up after 30 days
- Access logs via API:
  - `POST /api/logs` - Send logs from client
  - `GET /api/logs?hours=24&level=3` - Retrieve logs
  - `GET /api/logs/stats` - Get log statistics

## Configuration

### Environment Variables

```env
# Sentry Configuration (Optional)
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_API_URL=http://localhost:3001

# Environment
NODE_ENV=production
```

### Sentry Setup

1. Create a Sentry project at https://sentry.io
2. Copy the DSN from project settings
3. Add to `.env` file
4. Deploy with environment variables set

## Best Practices

1. **Always wrap async operations** with error handlers
2. **Use appropriate log levels** - don't log everything as errors
3. **Add context to logs** - include relevant data for debugging
4. **Monitor performance** of critical paths
5. **Test error scenarios** - ensure graceful degradation
6. **Review logs regularly** - look for patterns and issues
7. **Set up alerts** for critical errors in production

## Troubleshooting

### Logs not appearing
- Check browser console for errors
- Verify API endpoint is accessible
- Check localStorage quota isn't exceeded

### Performance issues
- Review slow render warnings in logs
- Check API response times in monitoring
- Use React DevTools Profiler

### Sentry not receiving errors
- Verify DSN is correct
- Check for ad blockers
- Ensure Sentry is initialized before errors occur

## Development Tools

### Debug Commands in Browser Console

```javascript
// Get recent logs
window.logger.getLocalLogs()

// Clear logs
window.logger.clearLocalLogs()

// Get API metrics
window.apiInterceptor.getMetrics()

// Force an error for testing
throw new Error('Test error')
```