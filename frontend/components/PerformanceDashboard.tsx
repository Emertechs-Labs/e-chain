/**
 * Performance Dashboard Component
 *
 * Displays real-time performance metrics for the Echain platform
 * including RPC performance, IPFS fetch times, and data fetching latency.
 */

import React, { useState, useEffect } from 'react';
import { performanceMonitor, usePerformanceTracking } from '../lib/performance-monitor';

interface PerformanceStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  lastUpdated: number;
}

const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<Map<string, PerformanceStats>>(new Map());
  const [recentMetrics, setRecentMetrics] = useState<any[]>([]);
  const { getStats, getRecentMetrics } = usePerformanceTracking();

  useEffect(() => {
    const updateStats = () => {
      setStats(getStats());
      setRecentMetrics(getRecentMetrics(20));
    };

    // Update immediately and then every 5 seconds
    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, [getStats, getRecentMetrics]);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getSuccessRate = (stat: PerformanceStats): number => {
    if (stat.totalOperations === 0) return 0;
    return (stat.successfulOperations / stat.totalOperations) * 100;
  };

  const getStatusColor = (successRate: number): string => {
    if (successRate >= 95) return 'text-green-600';
    if (successRate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Dashboard</h2>
        <p className="text-gray-600">Real-time monitoring of Echain platform performance</p>
      </div>

      {/* Performance Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from(stats.entries()).map(([operation, stat]) => {
          const successRate = getSuccessRate(stat);
          return (
            <div key={operation} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                {operation.replace('_', ' ')}
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{stat.totalOperations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className={`font-medium ${getStatusColor(successRate)}`}>
                    {successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Duration:</span>
                  <span className="font-medium">{formatDuration(stat.averageDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Update:</span>
                  <span className="font-medium text-xs">{formatTime(stat.lastUpdated)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Operations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Operations</h3>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Operation</th>
                  <th className="px-4 py-2 text-left">Duration</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {recentMetrics.map((metric, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-2 font-medium capitalize">
                      {metric.operation.split('-')[0].replace('_', ' ')}
                    </td>
                    <td className="px-4 py-2">
                      {metric.duration ? formatDuration(metric.duration) : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        metric.success
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {metric.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {formatTime(metric.startTime)}
                    </td>
                    <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                      {metric.metadata ? JSON.stringify(metric.metadata) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Performance Insights</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• RPC calls should complete under 2 seconds for optimal UX</li>
            <li>• IPFS fetches should complete under 3 seconds</li>
            <li>• Event fetching should maintain 95%+ success rate</li>
            <li>• Metadata enrichment should complete within 5 seconds per batch</li>
          </ul>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Optimization Status</h3>
          <div className="text-sm text-green-800 space-y-1">
            <p>• Multiple RPC providers with load balancing: ✅ Active</p>
            <p>• Parallel IPFS gateway fetching: ✅ Active</p>
            <p>• Enhanced caching (10-15 min TTL): ✅ Active</p>
            <p>• Increased batch sizes (10 calls): ✅ Active</p>
            <p>• Connection pooling: ✅ Active</p>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            const data = performanceMonitor.exportMetrics();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Export Performance Data
        </button>
      </div>
    </div>
  );
};

export default PerformanceDashboard;