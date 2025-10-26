// Performance Monitoring and Alerts
// ==================================
// Track and alert on performance metrics

import * as Sentry from '@sentry/nextjs';

// Performance Thresholds (in milliseconds)
export const PERFORMANCE_THRESHOLDS = {
  // Page Load Metrics
  pageLoad: {
    excellent: 1000,  // < 1s
    good: 2500,       // < 2.5s
    needsImprovement: 4000, // < 4s
    poor: 4000,       // >= 4s
  },
  
  // Core Web Vitals
  lcp: {  // Largest Contentful Paint
    excellent: 2500,
    good: 4000,
    poor: 4000,
  },
  
  fcp: {  // First Contentful Paint
    excellent: 1800,
    good: 3000,
    poor: 3000,
  },
  
  fid: {  // First Input Delay
    excellent: 100,
    good: 300,
    poor: 300,
  },
  
  cls: {  // Cumulative Layout Shift (unitless)
    excellent: 0.1,
    good: 0.25,
    poor: 0.25,
  },
  
  ttfb: { // Time to First Byte
    excellent: 800,
    good: 1800,
    poor: 1800,
  },
  
  // Blockchain-Specific Metrics
  transaction: {
    excellent: 3000,  // < 3s for Base L2
    good: 5000,       // < 5s
    poor: 10000,      // >= 10s
  },
  
  contractRead: {
    excellent: 500,   // < 0.5s
    good: 1000,       // < 1s
    poor: 2000,       // >= 2s
  },
  
  contractWrite: {
    excellent: 3000,  // < 3s
    good: 5000,       // < 5s
    poor: 10000,      // >= 10s
  },
  
  rpcCall: {
    excellent: 200,   // < 200ms
    good: 500,        // < 500ms
    poor: 1000,       // >= 1s
  },
  
  ipfsUpload: {
    excellent: 2000,  // < 2s
    good: 5000,       // < 5s
    poor: 10000,      // >= 10s
  },
};

// Performance Monitoring Class
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();

  // Start performance measurement
  static start(name: string): void {
    this.measurements.set(name, performance.now());
  }

  // End measurement and report
  static end(name: string, tags?: Record<string, string>): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`No start time found for measurement: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(name);

    // Report to Sentry
    this.report(name, duration, tags);

    return duration;
  }

  // Report metric to monitoring
  static report(name: string, value: number, tags?: Record<string, string>): void {
    // Send to Sentry
    if (typeof Sentry !== 'undefined' && Sentry.metrics) {
      Sentry.metrics.distribution(name, value, {
        tags,
        unit: 'millisecond',
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`, tags);
    }
  }

  // Measure async function
  static async measure<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name, tags);
      return result;
    } catch (error) {
      this.end(name, { ...tags, error: 'true' });
      throw error;
    }
  }
}

// Web Vitals Integration
export const reportWebVitals = (metric: any) => {
  const { name, value, rating } = metric;
  
  PerformanceMonitor.report(name.toLowerCase(), value, {
    rating,
  });

  // Alert if poor
  if (rating === 'poor' && typeof Sentry !== 'undefined') {
    Sentry.captureMessage(
      `Poor Web Vital: ${name}`,
      {
        level: 'warning',
        tags: {
          webVital: name,
          rating,
        },
        extra: {
          value,
        },
      }
    );
  }
};

export default PerformanceMonitor;
