import { logger } from '../logging/logger';

interface RequestConfig extends RequestInit {
  url: string;
  retries?: number;
  timeout?: number;
}

interface RequestMetrics {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  error?: Error;
}

class APIInterceptor {
  private static instance: APIInterceptor | null = null;
  private metrics: Map<string, RequestMetrics> = new Map();

  private constructor() {
    this.setupInterceptor();
  }

  static getInstance(): APIInterceptor {
    if (!APIInterceptor.instance) {
      APIInterceptor.instance = new APIInterceptor();
    }
    return APIInterceptor.instance;
  }

  private setupInterceptor(): void {
    // Store original fetch
    const originalFetch = window.fetch;

    // Override global fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || 'GET';
      const requestId = `${method}-${url}-${Date.now()}`;

      // Start metrics
      const metrics: RequestMetrics = {
        url,
        method,
        startTime: performance.now(),
      };
      this.metrics.set(requestId, metrics);

      // Log request
      logger.logRequest(method, url, init);

      try {
        // Add default timeout if not specified
        const controller = new AbortController();
        const timeoutMs = 30000; // 30 seconds default
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await originalFetch(input, {
          ...init,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Update metrics
        metrics.endTime = performance.now();
        metrics.duration = metrics.endTime - metrics.startTime;
        metrics.status = response.status;

        // Log response
        logger.logResponse(method, url, response.status, metrics.duration);

        // Check for errors
        if (!response.ok) {
          const error = new Error(`HTTP Error ${response.status}: ${response.statusText}`);
          metrics.error = error;

          // Log error responses
          if (response.status >= 500) {
            logger.error(`Server error on ${method} ${url}`, error, {
              status: response.status,
              statusText: response.statusText,
              duration: metrics.duration,
            });
          } else if (response.status >= 400) {
            logger.warn(`Client error on ${method} ${url}`, {
              status: response.status,
              statusText: response.statusText,
              duration: metrics.duration,
            });
          }
        }

        // Add performance monitoring for slow requests
        if (metrics.duration > 5000) {
          logger.warn(`Slow request detected: ${method} ${url}`, {
            duration: `${metrics.duration}ms`,
            status: response.status,
          });
        }

        return response;
      } catch (error) {
        metrics.endTime = performance.now();
        metrics.duration = metrics.endTime - metrics.startTime;
        metrics.error = error as Error;

        // Log network errors
        logger.error(`Network error on ${method} ${url}`, error as Error, {
          duration: metrics.duration,
          errorType: (error as Error).name,
          errorMessage: (error as Error).message,
        });

        throw error;
      } finally {
        // Clean up metrics after a delay
        setTimeout(() => {
          this.metrics.delete(requestId);
        }, 60000); // Keep metrics for 1 minute
      }
    };
  }

  // Enhanced fetch with retry logic
  async fetchWithRetry(config: RequestConfig): Promise<Response> {
    const { url, retries = 3, timeout = 30000, ...fetchOptions } = config;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return response;
        }

        // Don't retry client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return response;
        }

        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on abort
        if ((error as Error).name === 'AbortError') {
          throw error;
        }
      }

      // Log retry attempt
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
        logger.info(`Retrying request (attempt ${attempt + 1}/${retries})`, {
          url,
          method: fetchOptions.method || 'GET',
          delay: `${delay}ms`,
          error: lastError?.message,
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    logger.error(`All retry attempts failed for ${fetchOptions.method || 'GET'} ${url}`, lastError!, {
      retries,
      timeout,
    });

    throw lastError;
  }

  // Get current metrics
  getMetrics(): RequestMetrics[] {
    return Array.from(this.metrics.values());
  }

  // Get metrics for specific URL pattern
  getMetricsForUrl(urlPattern: string | RegExp): RequestMetrics[] {
    return this.getMetrics().filter(metric => {
      if (typeof urlPattern === 'string') {
        return metric.url.includes(urlPattern);
      }
      return urlPattern.test(metric.url);
    });
  }

  // Calculate average response time for a URL pattern
  getAverageResponseTime(urlPattern: string | RegExp): number {
    const metrics = this.getMetricsForUrl(urlPattern).filter(m => m.duration);
    if (metrics.length === 0) return 0;

    const totalDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalDuration / metrics.length;
  }

  // Get error rate for a URL pattern
  getErrorRate(urlPattern: string | RegExp): number {
    const metrics = this.getMetricsForUrl(urlPattern);
    if (metrics.length === 0) return 0;

    const errors = metrics.filter(m => m.error || (m.status && m.status >= 400));
    return (errors.length / metrics.length) * 100;
  }
}

// Create and export singleton instance
export const apiInterceptor = APIInterceptor.getInstance();

// Export enhanced fetch function
export const fetchWithRetry = (config: RequestConfig) => apiInterceptor.fetchWithRetry(config);

// Export types
export type { RequestConfig, RequestMetrics };