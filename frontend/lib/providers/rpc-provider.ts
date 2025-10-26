/**
 * RPC Provider with Failover and Latency Monitoring
 * Implements intelligent routing to premium node providers (Chainstack, Spectrum, Coinbase)
 * with automatic failover and performance tracking.
 */

interface RPCEndpoint {
  name: string;
  url: string;
  priority: number;
  maxLatency: number; // ms
}

interface LatencyMetrics {
  endpoint: string;
  latency: number;
  timestamp: number;
  success: boolean;
}

class RPCProviderManager {
  private endpoints: RPCEndpoint[] = [];
  private latencyHistory: LatencyMetrics[] = [];
  private maxHistorySize = 100;
  private currentEndpoint: RPCEndpoint | null = null;

  constructor(network: 'mainnet' | 'sepolia') {
    this.initializeEndpoints(network);
  }

  private initializeEndpoints(network: 'mainnet' | 'sepolia') {
    const prefix = network === 'mainnet' ? 'BASE_MAINNET' : 'BASE_SEPOLIA';

    // Priority order: Chainstack > Spectrum > Coinbase > Public
    const endpoints: RPCEndpoint[] = [
      {
        name: 'Chainstack',
        url: process.env[`NEXT_PUBLIC_${prefix}_CHAINSTACK_RPC`] || '',
        priority: 1,
        maxLatency: 100, // Target <100ms
      },
      {
        name: 'Spectrum Nodes',
        url: process.env[`NEXT_PUBLIC_${prefix}_SPECTRUM_RPC`] || '',
        priority: 2,
        maxLatency: 150,
      },
      {
        name: 'Coinbase',
        url: process.env[`NEXT_PUBLIC_${prefix}_COINBASE_RPC`] || '',
        priority: 3,
        maxLatency: 200,
      },
      {
        name: 'Public RPC',
        url: process.env[`NEXT_PUBLIC_${prefix}_RPC_URL`] || '',
        priority: 4,
        maxLatency: 1000, // Fallback, higher tolerance
      },
    ];

    // Filter out endpoints without URLs
    this.endpoints = endpoints
      .filter((e) => e.url && e.url.length > 0)
      .sort((a, b) => a.priority - b.priority);

    if (this.endpoints.length === 0) {
      throw new Error(`No RPC endpoints configured for ${network}`);
    }

    this.currentEndpoint = this.endpoints[0];
  }

  /**
   * Get the best available RPC endpoint based on performance metrics
   */
  public async getBestEndpoint(): Promise<string> {
    // If we don't have latency data yet, use priority order
    if (this.latencyHistory.length < 10) {
      return this.currentEndpoint?.url || this.endpoints[0].url;
    }

    // Calculate average latency for each endpoint over last 20 requests
    const recentMetrics = this.latencyHistory.slice(-20);
    const endpointStats = new Map<string, { avgLatency: number; successRate: number }>();

    this.endpoints.forEach((endpoint) => {
      const metrics = recentMetrics.filter((m) => m.endpoint === endpoint.name);
      if (metrics.length === 0) return;

      const avgLatency = metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length;
      const successRate = metrics.filter((m) => m.success).length / metrics.length;

      endpointStats.set(endpoint.name, { avgLatency, successRate });
    });

    // Find endpoint with best performance (lowest latency + high success rate)
    let bestEndpoint = this.currentEndpoint;
    let bestScore = Infinity;

    this.endpoints.forEach((endpoint) => {
      const stats = endpointStats.get(endpoint.name);
      if (!stats) return;

      // Score = latency * (2 - successRate)
      // Lower is better, penalties for failures
      const score = stats.avgLatency * (2 - stats.successRate);

      if (score < bestScore && stats.avgLatency < endpoint.maxLatency) {
        bestScore = score;
        bestEndpoint = endpoint;
      }
    });

    this.currentEndpoint = bestEndpoint;
    return bestEndpoint?.url || this.endpoints[0].url;
  }

  /**
   * Record latency metric for monitoring
   */
  public recordLatency(endpointName: string, latency: number, success: boolean) {
    this.latencyHistory.push({
      endpoint: endpointName,
      latency,
      timestamp: Date.now(),
      success,
    });

    // Trim history to max size
    if (this.latencyHistory.length > this.maxHistorySize) {
      this.latencyHistory = this.latencyHistory.slice(-this.maxHistorySize);
    }

    // Log performance issues
    const endpoint = this.endpoints.find((e) => e.name === endpointName);
    if (endpoint && latency > endpoint.maxLatency) {
      console.warn(
        `[RPC] ${endpointName} latency ${latency}ms exceeds target ${endpoint.maxLatency}ms`
      );
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics() {
    const recent = this.latencyHistory.slice(-20);
    const avgLatency = recent.reduce((sum, m) => sum + m.latency, 0) / (recent.length || 1);
    const successRate = recent.filter((m) => m.success).length / (recent.length || 1);

    return {
      currentEndpoint: this.currentEndpoint?.name || 'Unknown',
      avgLatency: Math.round(avgLatency),
      successRate: Math.round(successRate * 100),
      totalRequests: this.latencyHistory.length,
      recentRequests: recent.length,
    };
  }

  /**
   * Get all available endpoints
   */
  public getEndpoints(): RPCEndpoint[] {
    return [...this.endpoints];
  }

  /**
   * Force failover to next available endpoint
   */
  public async failover(): Promise<string> {
    const currentIndex = this.endpoints.findIndex(
      (e) => e.name === this.currentEndpoint?.name
    );
    const nextIndex = (currentIndex + 1) % this.endpoints.length;
    this.currentEndpoint = this.endpoints[nextIndex];

    console.warn(`[RPC] Failing over to ${this.currentEndpoint.name}`);
    return this.currentEndpoint.url;
  }
}

// Singleton instances for mainnet and sepolia
let mainnetProvider: RPCProviderManager | null = null;
let sepoliaProvider: RPCProviderManager | null = null;

/**
 * Get RPC provider for specified network
 */
export function getRPCProvider(network: 'mainnet' | 'sepolia'): RPCProviderManager {
  if (network === 'mainnet') {
    if (!mainnetProvider) {
      mainnetProvider = new RPCProviderManager('mainnet');
    }
    return mainnetProvider;
  } else {
    if (!sepoliaProvider) {
      sepoliaProvider = new RPCProviderManager('sepolia');
    }
    return sepoliaProvider;
  }
}

/**
 * Get best RPC URL for current network
 */
export async function getBestRPCUrl(): Promise<string> {
  const network = (process.env.NEXT_PUBLIC_ACTIVE_NETWORK as 'mainnet' | 'sepolia') || 'sepolia';
  const provider = getRPCProvider(network);
  return provider.getBestEndpoint();
}

/**
 * Record RPC request metrics
 */
export function recordRPCMetrics(latency: number, success: boolean) {
  const network = (process.env.NEXT_PUBLIC_ACTIVE_NETWORK as 'mainnet' | 'sepolia') || 'sepolia';
  const provider = getRPCProvider(network);
  provider.recordLatency(provider.getMetrics().currentEndpoint, latency, success);
}

/**
 * Get current RPC performance metrics
 */
export function getRPCMetrics() {
  const network = (process.env.NEXT_PUBLIC_ACTIVE_NETWORK as 'mainnet' | 'sepolia') || 'sepolia';
  const provider = getRPCProvider(network);
  return provider.getMetrics();
}

export default RPCProviderManager;
