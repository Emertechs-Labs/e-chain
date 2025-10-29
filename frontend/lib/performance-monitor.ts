/**
 * Performance Monitoring Utility
 *
 * Tracks RPC performance, IPFS fetch times, and overall data fetching latency
 * to help optimize the Echain platform performance.
 */

interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  lastUpdated: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  private stats = new Map<string, PerformanceStats>();

  // Start tracking an operation
  startOperation(operation: string, metadata?: Record<string, any>): string {
    const id = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const metric: PerformanceMetric = {
      operation,
      startTime: performance.now(),
      success: false,
      metadata
    };

    this.metrics.push({ ...metric, operation: id });
    return id;
  }

  // End tracking an operation
  endOperation(id: string, success: boolean = true, additionalMetadata?: Record<string, any>): void {
    const metric = this.metrics.find(m => m.operation === id);
    if (!metric) return;

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;

    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    this.updateStats(metric);
    this.cleanupOldMetrics();
  }

  // Update rolling statistics
  private updateStats(metric: PerformanceMetric): void {
    const operation = metric.operation.split('-')[0]; // Extract base operation name
    const existing = this.stats.get(operation);

    if (existing) {
      const totalOps = existing.totalOperations + 1;
      const successCount = existing.successfulOperations + (metric.success ? 1 : 0);
      const newAvg = ((existing.averageDuration * existing.totalOperations) + (metric.duration || 0)) / totalOps;

      this.stats.set(operation, {
        totalOperations: totalOps,
        successfulOperations: successCount,
        failedOperations: totalOps - successCount,
        averageDuration: newAvg,
        minDuration: Math.min(existing.minDuration, metric.duration || 0),
        maxDuration: Math.max(existing.maxDuration, metric.duration || 0),
        lastUpdated: Date.now()
      });
    } else {
      this.stats.set(operation, {
        totalOperations: 1,
        successfulOperations: metric.success ? 1 : 0,
        failedOperations: metric.success ? 0 : 1,
        averageDuration: metric.duration || 0,
        minDuration: metric.duration || 0,
        maxDuration: metric.duration || 0,
        lastUpdated: Date.now()
      });
    }
  }

  // Clean up old metrics to prevent memory leaks
  private cleanupOldMetrics(): void {
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Get performance statistics
  getStats(operation?: string): PerformanceStats | Map<string, PerformanceStats> {
    if (operation) {
      return this.stats.get(operation) || {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        lastUpdated: 0
      };
    }
    return new Map(this.stats);
  }

  // Get recent metrics
  getRecentMetrics(limit = 50): PerformanceMetric[] {
    return this.metrics.slice(-limit);
  }

  // Export metrics for analysis
  exportMetrics(): { metrics: PerformanceMetric[]; stats: Record<string, PerformanceStats> } {
    const stats: Record<string, PerformanceStats> = {};
    this.stats.forEach((value, key) => {
      stats[key] = value;
    });

    return {
      metrics: this.metrics,
      stats
    };
  }

  // Reset all metrics (useful for testing)
  reset(): void {
    this.metrics = [];
    this.stats.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions for common operations
export const trackRpcCall = (provider: string) => {
  const id = performanceMonitor.startOperation('rpc_call', { provider });
  return {
    end: (success: boolean, metadata?: Record<string, any>) =>
      performanceMonitor.endOperation(id, success, metadata)
  };
};

export const trackIpfsFetch = (gateway: string) => {
  const id = performanceMonitor.startOperation('ipfs_fetch', { gateway });
  return {
    end: (success: boolean, metadata?: Record<string, any>) =>
      performanceMonitor.endOperation(id, success, metadata)
  };
};

export const trackEventFetch = (eventCount: number) => {
  const id = performanceMonitor.startOperation('event_fetch', { eventCount });
  return {
    end: (success: boolean, metadata?: Record<string, any>) =>
      performanceMonitor.endOperation(id, success, metadata)
  };
};

export const trackMetadataEnrichment = (eventCount: number) => {
  const id = performanceMonitor.startOperation('metadata_enrichment', { eventCount });
  return {
    end: (success: boolean, metadata?: Record<string, any>) =>
      performanceMonitor.endOperation(id, success, metadata)
  };
};

// Performance monitoring hook for React components
export const usePerformanceTracking = () => {
  return {
    trackRpcCall,
    trackIpfsFetch,
    trackEventFetch,
    trackMetadataEnrichment,
    getStats: performanceMonitor.getStats.bind(performanceMonitor),
    getRecentMetrics: performanceMonitor.getRecentMetrics.bind(performanceMonitor)
  };
};