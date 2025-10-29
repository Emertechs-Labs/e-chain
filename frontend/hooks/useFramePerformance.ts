/**
 * Core Web Vitals monitoring for Frame performance
 * Tracks LCP, FID, CLS, FCP, TTFB for frames
 */

'use client';

import { useEffect, useRef } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface FramePerformanceData {
  lcp?: PerformanceMetric;
  fid?: PerformanceMetric;
  cls?: PerformanceMetric;
  fcp?: PerformanceMetric;
  ttfb?: PerformanceMetric;
  responseTime?: number;
}

/**
 * Hook for tracking Core Web Vitals in Frame context
 */
export function useFramePerformance() {
  const metricsRef = useRef<FramePerformanceData>({});

  useReportWebVitals((metric) => {
    const rating = getRating(metric.name, metric.value);

    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating,
      timestamp: Date.now(),
    };

    // Store metric
    switch (metric.name) {
      case 'LCP':
        metricsRef.current.lcp = performanceMetric;
        break;
      case 'FID':
        metricsRef.current.fid = performanceMetric;
        break;
      case 'CLS':
        metricsRef.current.cls = performanceMetric;
        break;
      case 'FCP':
        metricsRef.current.fcp = performanceMetric;
        break;
      case 'TTFB':
        metricsRef.current.ttfb = performanceMetric;
        break;
    }

    // Send to analytics (if in production)
    if (process.env.NODE_ENV === 'production') {
      sendToAnalytics(performanceMetric);
    }
  });

  return metricsRef.current;
}

/**
 * Measure Frame API response time
 */
export function useFrameResponseTime(eventId: string) {
  useEffect(() => {
    const measureResponseTime = async () => {
      const startTime = performance.now();

      try {
        const response = await fetch(`/api/frames/events/${eventId}`, {
          method: 'HEAD', // HEAD request for timing only
        });

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        // Track P99 target (< 1000ms)
        const metric: PerformanceMetric = {
          name: 'frame-response-time',
          value: responseTime,
          rating: responseTime < 1000 ? 'good' : responseTime < 2500 ? 'needs-improvement' : 'poor',
          timestamp: Date.now(),
        };

        if (process.env.NODE_ENV === 'production') {
          sendToAnalytics(metric);
        }
      } catch (error) {
        console.error('Frame response time measurement failed:', error);
      }
    };

    measureResponseTime();
  }, [eventId]);
}

/**
 * Get rating based on metric thresholds
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'LCP':
      if (value <= 2500) return 'good';
      if (value <= 4000) return 'needs-improvement';
      return 'poor';

    case 'FID':
      if (value <= 100) return 'good';
      if (value <= 300) return 'needs-improvement';
      return 'poor';

    case 'CLS':
      if (value <= 0.1) return 'good';
      if (value <= 0.25) return 'needs-improvement';
      return 'poor';

    case 'FCP':
      if (value <= 1800) return 'good';
      if (value <= 3000) return 'needs-improvement';
      return 'poor';

    case 'TTFB':
      if (value <= 800) return 'good';
      if (value <= 1800) return 'needs-improvement';
      return 'poor';

    default:
      return 'needs-improvement';
  }
}

/**
 * Send metrics to analytics endpoint
 */
async function sendToAnalytics(metric: PerformanceMetric) {
  try {
    // Send to Vercel Analytics or custom endpoint
    await fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    // Silent fail - don't impact user experience
    console.debug('Analytics send failed:', error);
  }
}

/**
 * Performance monitoring component for Frame pages
 */
export function FramePerformanceMonitor({ eventId }: { eventId: string }) {
  useFramePerformance();
  useFrameResponseTime(eventId);

  // Don't render anything - this is just for tracking
  return null;
}
