/**
 * RPC Performance Monitoring Hook
 * Tracks and displays RPC endpoint performance metrics
 */

import { useState, useEffect } from 'react';
import { getRPCMetrics, getRPCProvider } from '@/lib/providers/rpc-provider';

interface RPCMetrics {
  currentEndpoint: string;
  avgLatency: number;
  successRate: number;
  totalRequests: number;
  recentRequests: number;
}

export function useRPCMetrics(refreshInterval = 5000) {
  const [metrics, setMetrics] = useState<RPCMetrics>({
    currentEndpoint: 'Loading...',
    avgLatency: 0,
    successRate: 100,
    totalRequests: 0,
    recentRequests: 0,
  });

  useEffect(() => {
    const updateMetrics = () => {
      try {
        const currentMetrics = getRPCMetrics();
        setMetrics(currentMetrics);
      } catch (error) {
        console.error('Failed to fetch RPC metrics:', error);
      }
    };

    // Initial fetch
    updateMetrics();

    // Set up interval for updates
    const interval = setInterval(updateMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return metrics;
}

/**
 * Hook to get available RPC endpoints
 */
export function useRPCEndpoints() {
  const [endpoints, setEndpoints] = useState<Array<{ name: string; url: string; priority: number }>>([]);

  useEffect(() => {
    try {
      const network = (process.env.NEXT_PUBLIC_ACTIVE_NETWORK as 'mainnet' | 'sepolia') || 'sepolia';
      const provider = getRPCProvider(network);
      setEndpoints(provider.getEndpoints());
    } catch (error) {
      console.error('Failed to fetch RPC endpoints:', error);
    }
  }, []);

  return endpoints;
}

/**
 * Hook to monitor RPC health status
 */
export function useRPCHealth() {
  const metrics = useRPCMetrics();
  
  const getHealthStatus = () => {
    if (metrics.avgLatency < 100) return 'excellent';
    if (metrics.avgLatency < 200) return 'good';
    if (metrics.avgLatency < 500) return 'fair';
    return 'poor';
  };

  const getHealthColor = () => {
    const status = getHealthStatus();
    switch (status) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'yellow';
      case 'poor': return 'red';
      default: return 'gray';
    }
  };

  return {
    ...metrics,
    status: getHealthStatus(),
    color: getHealthColor(),
    isHealthy: metrics.successRate > 95 && metrics.avgLatency < 200,
  };
}
