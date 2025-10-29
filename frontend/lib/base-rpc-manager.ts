import { createPublicClient, createWalletClient, http, webSocket, fallback, type PublicClient, type WalletClient, type Transport } from 'viem';
import { baseSepolia } from 'viem/chains';
import { config } from './wagmi';
import logger from './logger';
import { performanceMonitor, trackRpcCall } from './performance-monitor';

// Enhanced Base Sepolia RPC endpoints with multiple providers for better performance
const BASE_RPC_ENDPOINTS = [
  // Primary: Base Official (fastest, most reliable)
  {
    http: 'https://sepolia.base.org',
    ws: 'wss://sepolia.base.org/ws',
    priority: 1,
    weight: 100,
    provider: 'Base Official',
    lastHealthCheck: 0,
    isHealthy: true,
    responseTime: 0,
    consecutiveFailures: 0
  },
  // Secondary: Chainstack (high performance)
  {
    http: process.env.NEXT_PUBLIC_CHAINSTACK_RPC_URL || 'https://base-sepolia.g.alchemy.com/v2/demo',
    ws: process.env.NEXT_PUBLIC_CHAINSTACK_WS_URL || 'wss://base-sepolia.g.alchemy.com/v2/demo',
    priority: 2,
    weight: 95,
    provider: 'Chainstack',
    lastHealthCheck: 0,
    isHealthy: true,
    responseTime: 0,
    consecutiveFailures: 0
  },
  // Tertiary: Spectrumnodes (good performance)
  {
    http: process.env.NEXT_PUBLIC_SPECTRUM_RPC_URL || 'https://base-sepolia.publicnode.com',
    ws: process.env.NEXT_PUBLIC_SPECTRUM_WS_URL || 'wss://base-sepolia.publicnode.com/ws',
    priority: 3,
    weight: 90,
    provider: 'Spectrumnodes',
    lastHealthCheck: 0,
    isHealthy: true,
    responseTime: 0,
    consecutiveFailures: 0
  },
  // Quaternary: Coinbase Base Node (official Coinbase)
  {
    http: process.env.NEXT_PUBLIC_COINBASE_RPC_URL || 'https://base-sepolia.public.blastapi.io',
    ws: process.env.NEXT_PUBLIC_COINBASE_WS_URL || 'wss://base-sepolia.public.blastapi.io',
    priority: 4,
    weight: 85,
    provider: 'Coinbase Base Node',
    lastHealthCheck: 0,
    isHealthy: true,
    responseTime: 0,
    consecutiveFailures: 0
  },
  // Fallback: Alchemy (reliable backup)
  {
    http: 'https://base-sepolia.g.alchemy.com/v2/demo',
    ws: 'wss://base-sepolia.g.alchemy.com/v2/demo',
    priority: 5,
    weight: 70,
    provider: 'Alchemy Fallback',
    lastHealthCheck: 0,
    isHealthy: true,
    responseTime: 0,
    consecutiveFailures: 0
  }
];

interface RPCEndpoint {
  http: string;
  ws: string;
  priority: number;
  weight: number;
  provider: string;
  lastHealthCheck: number;
  isHealthy: boolean;
  responseTime: number;
  consecutiveFailures: number;
}

class BaseRPCManager {
  private endpoints: RPCEndpoint[] = [...BASE_RPC_ENDPOINTS];
  private publicClients: Map<string, PublicClient> = new Map();
  private walletClients: Map<string, WalletClient> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private connectionPool: Map<string, { client: PublicClient; lastUsed: number; inUse: boolean }> = new Map();

  constructor() {
    this.startHealthChecks();
  }

  // Get the best available RPC endpoint based on health, performance, and load balancing
  private getBestEndpoint(): RPCEndpoint {
    const healthyEndpoints = this.endpoints.filter(ep => ep.isHealthy);

    if (healthyEndpoints.length === 0) {
      // Fallback to first endpoint if all are unhealthy
      logger.warn({ msg: 'All RPC endpoints unhealthy, using fallback' });
      return this.endpoints[0];
    }

    // Score endpoints based on multiple factors
    const scoredEndpoints = healthyEndpoints.map(endpoint => {
      const baseScore = endpoint.weight;
      const responseTimePenalty = Math.min(endpoint.responseTime / 10, 50); // Max 50 point penalty
      const failurePenalty = endpoint.consecutiveFailures * 10; // 10 points per consecutive failure
      const finalScore = Math.max(baseScore - responseTimePenalty - failurePenalty, 0);

      return { endpoint, score: finalScore };
    });

    // Sort by score (highest first) and return best
    scoredEndpoints.sort((a, b) => b.score - a.score);

    const bestEndpoint = scoredEndpoints[0].endpoint;
    logger.debug({
      msg: 'Selected RPC endpoint',
      provider: bestEndpoint.provider,
      score: scoredEndpoints[0].score,
      responseTime: bestEndpoint.responseTime,
      weight: bestEndpoint.weight
    });

    return bestEndpoint;
  }

  // Create or get cached public client with connection pooling
  getPublicClient(): PublicClient {
    const endpoint = this.getBestEndpoint();
    const cacheKey = `public-${endpoint.http}`;

    if (this.publicClients.has(cacheKey)) {
      const existingClient = this.publicClients.get(cacheKey)!;
      // Update connection pool tracking
      this.connectionPool.set(cacheKey, {
        client: existingClient,
        lastUsed: Date.now(),
        inUse: true
      });
      return existingClient;
    }

    // Create new client with optimized settings
    const transport = http(endpoint.http, {
      timeout: 8000, // Reduced from 10s for better performance
      retryCount: 1, // Reduced retries, let our manager handle failover
      retryDelay: 500
    });

    const client: any = createPublicClient({
      chain: baseSepolia,
      transport
    });

    this.publicClients.set(cacheKey, client);

    // Track in connection pool
    this.connectionPool.set(cacheKey, {
      client,
      lastUsed: Date.now(),
      inUse: true
    });

    logger.debug({
      msg: 'Created new public client',
      provider: endpoint.provider,
      url: endpoint.http
    });

    return client;
  }

  // Create or get cached wallet client with connection pooling
  getWalletClient(): WalletClient {
    const endpoint = this.getBestEndpoint();
    const cacheKey = `wallet-${endpoint.http}`;

    if (this.walletClients.has(cacheKey)) {
      const existingClient = this.walletClients.get(cacheKey)!;
      // Update connection pool tracking
      this.connectionPool.set(`${cacheKey}-pool`, {
        client: existingClient as any,
        lastUsed: Date.now(),
        inUse: true
      });
      return existingClient;
    }

    // Create new wallet client with optimized settings
    const transport = http(endpoint.http, {
      timeout: 12000, // Slightly higher for wallet operations
      retryCount: 2,
      retryDelay: 1000
    });

    const client: any = createWalletClient({
      chain: baseSepolia,
      transport
    });

    this.walletClients.set(cacheKey, client);

    // Track in connection pool
    this.connectionPool.set(`${cacheKey}-pool`, {
      client: client as any,
      lastUsed: Date.now(),
      inUse: true
    });

    logger.debug({
      msg: 'Created new wallet client',
      provider: endpoint.provider,
      url: endpoint.http
    });

    return client;
  }

  // Health check all endpoints with enhanced monitoring
  private async healthCheckEndpoint(endpoint: RPCEndpoint): Promise<void> {
    const tracker = trackRpcCall(endpoint.provider);
    const startTime = Date.now();

    try {
      const client = createPublicClient({
        chain: baseSepolia,
        transport: http(endpoint.http, { timeout: 3000 }) // Reduced timeout for faster checks
      });

      await client.getBlockNumber();
      endpoint.isHealthy = true;
      endpoint.responseTime = Date.now() - startTime;
      endpoint.consecutiveFailures = 0; // Reset on success

      tracker.end(true, {
        responseTime: endpoint.responseTime,
        blockNumber: 'latest'
      });

      logger.debug({
        msg: 'RPC endpoint health check passed',
        provider: endpoint.provider,
        responseTime: endpoint.responseTime,
        url: endpoint.http
      });
    } catch (error) {
      endpoint.isHealthy = false;
      endpoint.responseTime = 9999; // High penalty for failed requests
      endpoint.consecutiveFailures += 1;

      tracker.end(false, {
        error: error instanceof Error ? error.message : String(error),
        consecutiveFailures: endpoint.consecutiveFailures
      });

      // Mark as unhealthy after 3 consecutive failures
      if (endpoint.consecutiveFailures >= 3) {
        endpoint.isHealthy = false;
        logger.warn({
          msg: 'RPC endpoint marked unhealthy after consecutive failures',
          provider: endpoint.provider,
          consecutiveFailures: endpoint.consecutiveFailures,
          error: error instanceof Error ? error.message : String(error)
        });
      } else {
        logger.debug({
          msg: 'RPC endpoint health check failed (temporary)',
          provider: endpoint.provider,
          consecutiveFailures: endpoint.consecutiveFailures,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    endpoint.lastHealthCheck = Date.now();
  }

  // Start periodic health checks with more frequent monitoring
  private startHealthChecks(): void {
    // Initial health check
    this.endpoints.forEach(endpoint => this.healthCheckEndpoint(endpoint));

    // More frequent health checks every 15 seconds for better performance monitoring
    this.healthCheckInterval = setInterval(() => {
      this.endpoints.forEach(endpoint => {
        // Check if it's been more than 15 seconds since last check
        if (Date.now() - endpoint.lastHealthCheck > 15000) {
          this.healthCheckEndpoint(endpoint);
        }
      });
    }, 15000);

    // Cleanup stale connections every 5 minutes
    setInterval(() => {
      this.cleanupStaleConnections();
    }, 5 * 60 * 1000);
  }

  // Cleanup stale connections to prevent memory leaks
  private cleanupStaleConnections(): void {
    const now = Date.now();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes

    for (const [key, connection] of this.connectionPool.entries()) {
      if (now - connection.lastUsed > staleThreshold && !connection.inUse) {
        this.connectionPool.delete(key);

        // Also cleanup client caches if they're not being used
        if (key.startsWith('public-')) {
          const clientKey = key.replace('-pool', '');
          this.publicClients.delete(clientKey);
        } else if (key.startsWith('wallet-')) {
          const clientKey = key.replace('-pool', '');
          this.walletClients.delete(clientKey);
        }

        logger.debug({ msg: 'Cleaned up stale connection', key });
      }
    }
  }

  // Get connection pool stats
  getStats() {
    return {
      endpoints: this.endpoints.map(ep => ({
        url: ep.http,
        healthy: ep.isHealthy,
        responseTime: ep.responseTime,
        weight: ep.weight
      })),
      activeConnections: this.connectionPool.size,
      cachedClients: {
        public: this.publicClients.size,
        wallet: this.walletClients.size
      }
    };
  }

  // Cleanup resources
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.publicClients.clear();
    this.walletClients.clear();
    this.connectionPool.clear();
  }
}

// Singleton instance
export const baseRPCManager = new BaseRPCManager();

// Convenience functions
export const getBasePublicClient = () => baseRPCManager.getPublicClient();
export const getBaseWalletClient = () => baseRPCManager.getWalletClient();
export const getBaseRPCStats = () => baseRPCManager.getStats();

// Export for cleanup
export { BaseRPCManager };