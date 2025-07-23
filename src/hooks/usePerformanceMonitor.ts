import { useEffect, useRef, useCallback } from 'react';
import { logger } from '../services/logging/logger';
import { measurePerformance } from '../services/monitoring/sentry';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderDuration: number;
  averageRenderDuration: number;
  totalRenderDuration: number;
  mountTime: number;
  unmountTime?: number;
}

interface UsePerformanceMonitorOptions {
  componentName: string;
  logSlowRenders?: boolean;
  slowRenderThreshold?: number;
  trackMountTime?: boolean;
}

export function usePerformanceMonitor(options: UsePerformanceMonitorOptions) {
  const {
    componentName,
    logSlowRenders = true,
    slowRenderThreshold = 16.67, // One frame at 60fps
    trackMountTime = true,
  } = options;

  const metrics = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderDuration: 0,
    averageRenderDuration: 0,
    totalRenderDuration: 0,
    mountTime: 0,
  });

  const renderStartTime = useRef<number>(0);
  const mountStartTime = useRef<number>(performance.now());

  // Track component mount
  useEffect(() => {
    if (trackMountTime) {
      metrics.current.mountTime = performance.now() - mountStartTime.current;
      
      logger.debug(`Component ${componentName} mounted`, {
        mountTime: `${metrics.current.mountTime.toFixed(2)}ms`,
      });

      // Log slow mount
      if (metrics.current.mountTime > 100) {
        logger.warn(`Slow component mount detected: ${componentName}`, {
          mountTime: `${metrics.current.mountTime.toFixed(2)}ms`,
        });
      }
    }

    return () => {
      metrics.current.unmountTime = performance.now();
      
      // Log component lifecycle summary
      logger.debug(`Component ${componentName} unmounted`, {
        renderCount: metrics.current.renderCount,
        averageRenderDuration: `${metrics.current.averageRenderDuration.toFixed(2)}ms`,
        totalLifetime: `${(metrics.current.unmountTime - mountStartTime.current).toFixed(2)}ms`,
      });
    };
  }, [componentName, trackMountTime]);

  // Track render performance
  useEffect(() => {
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;

    if (renderStartTime.current > 0) {
      metrics.current.renderCount++;
      metrics.current.lastRenderDuration = renderDuration;
      metrics.current.totalRenderDuration += renderDuration;
      metrics.current.averageRenderDuration = 
        metrics.current.totalRenderDuration / metrics.current.renderCount;

      // Log slow renders
      if (logSlowRenders && renderDuration > slowRenderThreshold) {
        logger.warn(`Slow render detected in ${componentName}`, {
          renderDuration: `${renderDuration.toFixed(2)}ms`,
          renderCount: metrics.current.renderCount,
          threshold: `${slowRenderThreshold}ms`,
        });
      }
    }

    renderStartTime.current = performance.now();
  });

  // Measure async operations
  const measureAsync = useCallback(async <T,>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    return measurePerformance(
      `${componentName}.${operationName}`,
      operation
    ) as Promise<T>;
  }, [componentName]);

  // Measure sync operations
  const measureSync = useCallback(<T,>(
    operationName: string,
    operation: () => T
  ): T => {
    const startTime = performance.now();
    
    try {
      const result = operation();
      const duration = performance.now() - startTime;
      
      logger.debug(`${componentName}.${operationName} completed`, {
        duration: `${duration.toFixed(2)}ms`,
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      logger.error(`${componentName}.${operationName} failed`, error as Error, {
        duration: `${duration.toFixed(2)}ms`,
      });
      
      throw error;
    }
  }, [componentName]);

  // Get current metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    return { ...metrics.current };
  }, []);

  // Mark custom performance events
  const mark = useCallback((eventName: string) => {
    performance.mark(`${componentName}-${eventName}`);
    
    logger.debug(`Performance mark: ${componentName}-${eventName}`);
  }, [componentName]);

  // Measure between marks
  const measure = useCallback((measureName: string, startMark: string, endMark?: string) => {
    const fullStartMark = `${componentName}-${startMark}`;
    const fullEndMark = endMark ? `${componentName}-${endMark}` : undefined;
    
    try {
      performance.measure(
        `${componentName}-${measureName}`,
        fullStartMark,
        fullEndMark
      );
      
      const measures = performance.getEntriesByName(`${componentName}-${measureName}`);
      const lastMeasure = measures[measures.length - 1];
      
      logger.debug(`Performance measure: ${componentName}-${measureName}`, {
        duration: `${lastMeasure.duration.toFixed(2)}ms`,
      });
      
      return lastMeasure.duration;
    } catch (error) {
      logger.warn(`Failed to measure performance: ${componentName}-${measureName}`, {
        error: (error as Error).message,
      });
      return 0;
    }
  }, [componentName]);

  return {
    measureAsync,
    measureSync,
    getMetrics,
    mark,
    measure,
  };
}