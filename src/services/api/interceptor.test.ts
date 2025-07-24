import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiInterceptor, fetchWithRetry } from './interceptor';
import { logger } from '../logging/logger';

// Mock the logger
vi.mock('../logging/logger', () => ({
  logger: {
    logRequest: vi.fn(),
    logResponse: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  }
}));

// Mock performance.now()
const mockPerformanceNow = vi.spyOn(performance, 'now');

describe('APIInterceptor', () => {
  let originalFetch: typeof window.fetch;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Store original fetch before interceptor modifies it
    originalFetch = window.fetch;
    // Reset performance.now mock
    mockPerformanceNow.mockReturnValue(1000);
  });

  afterEach(() => {
    // Restore original fetch
    window.fetch = originalFetch;
  });

  describe('fetch interception', () => {
    it('should intercept and log successful requests', async () => {
      const mockResponse = new Response('{"data": "test"}', {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });
      
      window.fetch = vi.fn().mockResolvedValue(mockResponse);
      
      // Trigger interceptor setup
      apiInterceptor.getMetrics(); // This ensures the interceptor is initialized
      
      // Make a request through the intercepted fetch
      const response = await fetch('https://api.example.com/data');
      
      expect(response.status).toBe(200);
      expect(logger.logRequest).toHaveBeenCalledWith(
        'GET',
        'https://api.example.com/data',
        undefined
      );
      expect(logger.logResponse).toHaveBeenCalledWith(
        'GET',
        'https://api.example.com/data',
        200,
        expect.any(Number)
      );
    });

    it('should handle and log server errors', async () => {
      const mockResponse = new Response('Server Error', {
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      window.fetch = vi.fn().mockResolvedValue(mockResponse);
      
      const response = await fetch('https://api.example.com/error', {
        method: 'POST'
      });
      
      expect(response.status).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(
        'Server error on POST https://api.example.com/error',
        expect.any(Error),
        expect.objectContaining({
          status: 500,
          statusText: 'Internal Server Error',
          duration: expect.any(Number)
        })
      );
    });

    it('should handle and log client errors', async () => {
      const mockResponse = new Response('Not Found', {
        status: 404,
        statusText: 'Not Found'
      });
      
      window.fetch = vi.fn().mockResolvedValue(mockResponse);
      
      const response = await fetch('https://api.example.com/notfound');
      
      expect(response.status).toBe(404);
      expect(logger.warn).toHaveBeenCalledWith(
        'Client error on GET https://api.example.com/notfound',
        expect.objectContaining({
          status: 404,
          statusText: 'Not Found',
          duration: expect.any(Number)
        })
      );
    });

    it('should log slow requests', async () => {
      // Mock slow request (>5000ms)
      mockPerformanceNow
        .mockReturnValueOnce(1000) // start time
        .mockReturnValueOnce(7000); // end time (6000ms duration)
      
      const mockResponse = new Response('{"data": "slow"}', {
        status: 200,
        statusText: 'OK'
      });
      
      window.fetch = vi.fn().mockResolvedValue(mockResponse);
      
      await fetch('https://api.example.com/slow');
      
      expect(logger.warn).toHaveBeenCalledWith(
        'Slow request detected: GET https://api.example.com/slow',
        expect.objectContaining({
          duration: '6000ms',
          status: 200
        })
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      window.fetch = vi.fn().mockRejectedValue(networkError);
      
      await expect(fetch('https://api.example.com/network-error')).rejects.toThrow('Network error');
      
      expect(logger.error).toHaveBeenCalledWith(
        'Network error on GET https://api.example.com/network-error',
        networkError,
        expect.objectContaining({
          duration: expect.any(Number),
          errorType: 'Error',
          errorMessage: 'Network error'
        })
      );
    });
  });

  describe('fetchWithRetry', () => {
    beforeEach(() => {
      // Reset fetch mock for each test
      window.fetch = vi.fn();
    });

    it('should retry failed requests with exponential backoff', async () => {
      const mockFetch = window.fetch as any;
      
      // Fail twice, then succeed
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(new Response('Success', { status: 200 }));
      
      const response = await fetchWithRetry({
        url: 'https://api.example.com/retry',
        retries: 2,
      });
      
      expect(response.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Retrying request'),
        expect.objectContaining({
          url: 'https://api.example.com/retry',
          method: 'GET',
          delay: expect.stringMatching(/\d+ms/),
          error: 'Network error'
        })
      );
    });

    it('should not retry client errors (4xx)', async () => {
      const mockFetch = window.fetch as any;
      mockFetch.mockResolvedValueOnce(new Response('Bad Request', { status: 400 }));
      
      const response = await fetchWithRetry({
        url: 'https://api.example.com/bad-request',
        retries: 3,
      });
      
      expect(response.status).toBe(400);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No retries
    });

    it('should throw after all retries fail', async () => {
      const mockFetch = window.fetch as any;
      const error = new Error('Persistent error');
      mockFetch.mockRejectedValue(error);
      
      await expect(
        fetchWithRetry({
          url: 'https://api.example.com/always-fails',
          retries: 2,
        })
      ).rejects.toThrow('Persistent error');
      
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(logger.error).toHaveBeenCalledWith(
        'All retry attempts failed for GET https://api.example.com/always-fails',
        error,
        expect.objectContaining({
          retries: 2,
          timeout: 30000
        })
      );
    });

    it('should respect timeout configuration', async () => {
      const mockFetch = window.fetch as any;
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      await expect(
        fetchWithRetry({
          url: 'https://api.example.com/timeout',
          timeout: 100, // Very short timeout
          retries: 0,
        })
      ).rejects.toThrow();
      
      // Check that AbortController was used
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/timeout',
        expect.objectContaining({
          signal: expect.any(AbortSignal)
        })
      );
    });
  });

  describe('metrics', () => {
    beforeEach(() => {
      // Clear metrics
      apiInterceptor.getMetrics().length = 0;
    });

    it('should track request metrics', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      window.fetch = vi.fn().mockResolvedValue(mockResponse);
      
      await fetch('https://api.example.com/metrics-test');
      
      const metrics = apiInterceptor.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      
      const metric = metrics.find(m => m.url.includes('metrics-test'));
      expect(metric).toMatchObject({
        url: 'https://api.example.com/metrics-test',
        method: 'GET',
        startTime: expect.any(Number),
        endTime: expect.any(Number),
        duration: expect.any(Number),
        status: 200
      });
    });

    it('should filter metrics by URL pattern', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      window.fetch = vi.fn().mockResolvedValue(mockResponse);
      
      // Make multiple requests
      await Promise.all([
        fetch('https://api.example.com/users/1'),
        fetch('https://api.example.com/users/2'),
        fetch('https://api.example.com/posts/1'),
      ]);
      
      const userMetrics = apiInterceptor.getMetricsForUrl('/users/');
      expect(userMetrics.length).toBe(2);
      expect(userMetrics.every(m => m.url.includes('/users/'))).toBe(true);
      
      const regexMetrics = apiInterceptor.getMetricsForUrl(/\/users\/\d+$/);
      expect(regexMetrics.length).toBe(2);
    });

    it('should calculate average response time', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000).mockReturnValueOnce(1100) // 100ms
        .mockReturnValueOnce(2000).mockReturnValueOnce(2300); // 300ms
      
      const mockResponse = new Response('OK', { status: 200 });
      window.fetch = vi.fn().mockResolvedValue(mockResponse);
      
      await fetch('https://api.example.com/avg/1');
      await fetch('https://api.example.com/avg/2');
      
      const avgTime = apiInterceptor.getAverageResponseTime('/avg/');
      expect(avgTime).toBe(200); // (100 + 300) / 2
    });

    it('should calculate error rate', async () => {
      window.fetch = vi.fn()
        .mockResolvedValueOnce(new Response('OK', { status: 200 }))
        .mockResolvedValueOnce(new Response('Error', { status: 500 }))
        .mockResolvedValueOnce(new Response('Not Found', { status: 404 }))
        .mockResolvedValueOnce(new Response('OK', { status: 200 }));
      
      await Promise.all([
        fetch('https://api.example.com/error-rate/1'),
        fetch('https://api.example.com/error-rate/2'),
        fetch('https://api.example.com/error-rate/3'),
        fetch('https://api.example.com/error-rate/4'),
      ]);
      
      const errorRate = apiInterceptor.getErrorRate('/error-rate/');
      expect(errorRate).toBe(50); // 2 errors out of 4 requests = 50%
    });
  });
});