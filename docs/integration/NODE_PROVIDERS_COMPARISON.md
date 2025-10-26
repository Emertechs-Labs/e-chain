# 🔗 Node Provider Integration Guide

**Last Updated**: October 26, 2025  
**Version**: 1.0.0

---

## Overview

This guide covers integration with multiple RPC node providers for the Base network, ensuring high availability, low latency, and cost-effective blockchain access.

---

## 📊 Provider Comparison Matrix

| Provider | Free Tier | Pricing | Latency | Uptime SLA | Support | Best For |
|----------|-----------|---------|---------|------------|---------|----------|
| **Chainstack** | 3M req/month | $49+/month | <50ms | 99.9% | 24/7 | Production |
| **Spectrum Nodes** | Limited | Custom | <30ms | 99.95% | Premium | Enterprise |
| **Coinbase Node** | 1M req/month | Free-$99/month | <40ms | 99.9% | Business hours | Startups |
| **Base Public RPC** | Unlimited | Free | Variable | No SLA | Community | Development |

---

## 1. Chainstack Integration

### Official Links
- **Website**: https://chainstack.com/
- **Documentation**: https://docs.chainstack.com/
- **Base Support**: https://chainstack.com/build-better-with-base/
- **Dashboard**: https://console.chainstack.com/

### Features
✅ Dedicated nodes with guaranteed performance  
✅ Archive node support for historical data  
✅ Auto-scaling infrastructure  
✅ Built-in load balancing  
✅ WebSocket support for real-time events  
✅ IPFS integration  
✅ Analytics dashboard  

### Setup Guide

#### Step 1: Create Account
```bash
# Sign up at https://console.chainstack.com/user/account/create
```

#### Step 2: Deploy Base Node

1. Navigate to **Networks** → **Deploy a node**
2. Select **Base** network
3. Choose node type:
   - **Shared**: $0/month (limited)
   - **Dedicated**: $49/month (production-ready)
   - **Archive**: $349/month (full historical data)

#### Step 3: Configure Node

```javascript
// chainstack.config.js
module.exports = {
  network: 'base-mainnet',
  nodeType: 'dedicated',
  region: 'us-east-1', // Choose closest to your users
  features: {
    websocket: true,
    archive: false,
    ipfs: false
  }
}
```

#### Step 4: Get RPC Endpoint

After deployment (2-5 minutes):
```
HTTP: https://nd-XXX-XXX-XXX.p2pify.com/YOUR_API_KEY
WSS:  wss://ws-nd-XXX-XXX-XXX.p2pify.com/YOUR_API_KEY
```

#### Step 5: Environment Configuration

```bash
# .env
CHAINSTACK_HTTP_URL=https://nd-XXX-XXX-XXX.p2pify.com/YOUR_API_KEY
CHAINSTACK_WSS_URL=wss://ws-nd-XXX-XXX-XXX.p2pify.com/YOUR_API_KEY
CHAINSTACK_API_KEY=your_api_key_here
```

### Implementation Example

```typescript
// lib/providers/chainstack.ts
import { JsonRpcProvider, WebSocketProvider } from 'ethers';

export class ChainstackProvider {
  private httpProvider: JsonRpcProvider;
  private wsProvider: WebSocketProvider;

  constructor() {
    const httpUrl = process.env.CHAINSTACK_HTTP_URL!;
    const wssUrl = process.env.CHAINSTACK_WSS_URL!;

    this.httpProvider = new JsonRpcProvider(httpUrl);
    this.wsProvider = new WebSocketProvider(wssUrl);
  }

  async getProvider(type: 'http' | 'ws' = 'http') {
    return type === 'http' ? this.httpProvider : this.wsProvider;
  }

  async getBlockNumber(): Promise<number> {
    return await this.httpProvider.getBlockNumber();
  }

  async subscribeToBlocks(callback: (blockNumber: number) => void) {
    this.wsProvider.on('block', callback);
  }

  async cleanup() {
    await this.wsProvider.destroy();
  }
}
```

### Monitoring & Analytics

Chainstack provides a dashboard with:
- Request volume and patterns
- Response times (p50, p95, p99)
- Error rates
- Gas usage analytics

**Access**: https://console.chainstack.com/analytics

---

## 2. Spectrum Nodes Integration

### Official Links
- **Website**: https://spectrumnodes.com/
- **Partner Link**: https://spectrumnodes.com/?sPartner=gsd&gad_campaignid=22842687298
- **Documentation**: https://docs.spectrumnodes.com/
- **Status Page**: https://status.spectrumnodes.com/

### Features
✅ Ultra-low latency (<30ms)  
✅ Geographic load balancing  
✅ DDoS protection  
✅ Custom rate limits  
✅ Priority support  
✅ SLA guarantees  

### Setup Guide

#### Step 1: Register via Partner Link

```bash
# Use partner link for special pricing
https://spectrumnodes.com/?sPartner=gsd&gad_campaignid=22842687298
```

#### Step 2: Choose Plan

| Plan | Requests/Day | Price | Support |
|------|--------------|-------|---------|
| Starter | 100K | Custom | Email |
| Professional | 1M | Custom | Priority |
| Enterprise | Unlimited | Custom | 24/7 |

#### Step 3: API Configuration

```typescript
// lib/providers/spectrum.ts
import axios from 'axios';

export class SpectrumProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.SPECTRUM_API_KEY!;
    this.baseUrl = process.env.SPECTRUM_BASE_URL!;
  }

  async request(method: string, params: any[] = []) {
    const response = await axios.post(
      this.baseUrl,
      {
        jsonrpc: '2.0',
        method,
        params,
        id: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    return response.data.result;
  }

  async getLatestBlock() {
    return await this.request('eth_blockNumber');
  }

  async getBalance(address: string) {
    return await this.request('eth_getBalance', [address, 'latest']);
  }
}
```

### Rate Limiting

```typescript
// lib/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const spectrumRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Custom limit per plan
  message: 'Too many requests from this IP'
});
```

---

## 3. Coinbase Node Integration

### Official Links
- **Product Page**: https://www.coinbase.com/developer-platform/products/base-node
- **Documentation**: https://docs.cdp.coinbase.com/base-node/docs/welcome
- **Getting Started**: https://www.coinbase.com/cloud
- **Dashboard**: https://portal.cdp.coinbase.com/

### Features
✅ Free tier: 1M requests/month  
✅ Native Base integration  
✅ Coinbase ecosystem benefits  
✅ Simple authentication  
✅ Reliable infrastructure  

### Setup Guide

#### Step 1: Create Developer Account

1. Visit https://www.coinbase.com/cloud
2. Sign up with your Coinbase account
3. Navigate to **Base Node** section

#### Step 2: Get API Credentials

```bash
# Create API key at: https://portal.cdp.coinbase.com/access/api
```

You'll receive:
- API Key Name
- API Key
- API Secret

#### Step 3: Environment Setup

```bash
# .env
COINBASE_NODE_URL=https://api.developer.coinbase.com/rpc/v1/base/YOUR_API_KEY
COINBASE_API_KEY=your_api_key
COINBASE_API_SECRET=your_api_secret
```

#### Step 4: Implementation

```typescript
// lib/providers/coinbase.ts
import { JsonRpcProvider } from 'ethers';
import crypto from 'crypto';

export class CoinbaseNodeProvider {
  private provider: JsonRpcProvider;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    const url = process.env.COINBASE_NODE_URL!;
    this.apiKey = process.env.COINBASE_API_KEY!;
    this.apiSecret = process.env.COINBASE_API_SECRET!;
    
    this.provider = new JsonRpcProvider(url);
  }

  // Generate request signature for enhanced security
  private generateSignature(timestamp: number, method: string, path: string): string {
    const message = `${timestamp}${method}${path}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }

  async getProvider() {
    return this.provider;
  }

  async testConnection(): Promise<boolean> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return blockNumber > 0;
    } catch (error) {
      console.error('Coinbase Node connection failed:', error);
      return false;
    }
  }
}
```

### Free Tier Limits

```typescript
// lib/usage-tracker.ts
export class UsageTracker {
  private requestCount = 0;
  private readonly FREE_TIER_LIMIT = 1_000_000; // per month

  trackRequest() {
    this.requestCount++;
    
    if (this.requestCount > this.FREE_TIER_LIMIT * 0.8) {
      console.warn('Approaching Coinbase free tier limit');
    }
  }

  getRemainingRequests(): number {
    return this.FREE_TIER_LIMIT - this.requestCount;
  }
}
```

---

## 4. Base Public RPC

### Official Links
- **Documentation**: https://docs.base.org/base-chain/quickstart/connecting-to-base
- **Network Info**: https://chainlist.org/chain/8453
- **Status**: https://base.statuspage.io/

### Configuration

```typescript
// Base Mainnet
const BASE_MAINNET_RPC = 'https://mainnet.base.org';
const BASE_MAINNET_CHAIN_ID = 8453;

// Base Sepolia (Testnet)
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';
const BASE_SEPOLIA_CHAIN_ID = 84532;
```

### Rate Limits
⚠️ **Public RPC Limitations**:
- No guaranteed uptime
- Variable latency
- Rate limiting (unspecified)
- Best for development only

---

## 5. Multi-Provider Failover Strategy

### Implementation

```typescript
// lib/providers/multi-provider.ts
import { JsonRpcProvider } from 'ethers';

export class MultiProvider {
  private providers: Array<{
    name: string;
    provider: JsonRpcProvider;
    priority: number;
    healthy: boolean;
  }>;

  constructor() {
    this.providers = [
      {
        name: 'Chainstack',
        provider: new JsonRpcProvider(process.env.CHAINSTACK_HTTP_URL!),
        priority: 1,
        healthy: true
      },
      {
        name: 'Spectrum',
        provider: new JsonRpcProvider(process.env.SPECTRUM_BASE_URL!, {
          headers: {
            'Authorization': `Bearer ${process.env.SPECTRUM_API_KEY}`
          }
        }),
        priority: 2,
        healthy: true
      },
      {
        name: 'Coinbase',
        provider: new JsonRpcProvider(process.env.COINBASE_NODE_URL!),
        priority: 3,
        healthy: true
      },
      {
        name: 'Base Public',
        provider: new JsonRpcProvider('https://mainnet.base.org'),
        priority: 4,
        healthy: true
      }
    ];
  }

  async getProvider(): Promise<JsonRpcProvider> {
    // Sort by priority and health
    const available = this.providers
      .filter(p => p.healthy)
      .sort((a, b) => a.priority - b.priority);

    if (available.length === 0) {
      throw new Error('No healthy providers available');
    }

    return available[0].provider;
  }

  async executeWithFailover<T>(
    operation: (provider: JsonRpcProvider) => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    const providers = this.providers
      .filter(p => p.healthy)
      .sort((a, b) => a.priority - b.priority);

    for (let i = 0; i < Math.min(maxRetries, providers.length); i++) {
      try {
        const result = await operation(providers[i].provider);
        return result;
      } catch (error) {
        console.error(`Provider ${providers[i].name} failed:`, error);
        providers[i].healthy = false;
        
        // Try next provider
        if (i === providers.length - 1) {
          throw new Error('All providers failed');
        }
      }
    }

    throw new Error('Operation failed after all retries');
  }

  async healthCheck() {
    for (const provider of this.providers) {
      try {
        await provider.provider.getBlockNumber();
        provider.healthy = true;
      } catch (error) {
        provider.healthy = false;
      }
    }
  }
}
```

### Usage Example

```typescript
// app/api/events/route.ts
import { MultiProvider } from '@/lib/providers/multi-provider';

const multiProvider = new MultiProvider();

export async function GET() {
  try {
    const events = await multiProvider.executeWithFailover(async (provider) => {
      // Your blockchain operation
      const contract = new Contract(EVENT_FACTORY_ADDRESS, ABI, provider);
      return await contract.getAllEvents();
    });

    return Response.json({ events });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
```

---

## 6. Performance Optimization

### Caching Strategy

```typescript
// lib/cache/provider-cache.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 10, // 10 minutes
});

export async function cachedRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached;

  const result = await fetcher();
  cache.set(key, result);
  return result;
}
```

### Request Batching

```typescript
// lib/batch-provider.ts
export class BatchProvider {
  private queue: Array<{
    method: string;
    params: any[];
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private batchTimeout: NodeJS.Timeout | null = null;

  async request(method: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ method, params, resolve, reject });

      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.processBatch(), 50);
      }
    });
  }

  private async processBatch() {
    const batch = this.queue.splice(0);
    this.batchTimeout = null;

    // Send batch request
    // Process responses
    // Resolve/reject promises
  }
}
```

---

## 7. Monitoring & Alerts

### Provider Health Monitoring

```typescript
// lib/monitoring/provider-health.ts
import * as Sentry from '@sentry/nextjs';

export class ProviderHealthMonitor {
  async monitor() {
    const providers = ['chainstack', 'spectrum', 'coinbase', 'public'];
    
    for (const name of providers) {
      const startTime = Date.now();
      
      try {
        await this.checkProvider(name);
        const latency = Date.now() - startTime;
        
        // Log metrics
        Sentry.addBreadcrumb({
          category: 'provider.health',
          message: `${name} healthy`,
          level: 'info',
          data: { latency }
        });
      } catch (error) {
        Sentry.captureException(error, {
          tags: { provider: name },
          level: 'error'
        });
      }
    }
  }
}
```

---

## 8. Cost Optimization

### Request Analysis

```typescript
// Track which operations use most requests
export const requestTracker = {
  getEvents: 0,
  getTickets: 0,
  getPOAPs: 0,
  
  increment(operation: keyof typeof requestTracker) {
    this.operation++;
  },
  
  getStats() {
    return { ...this };
  }
};
```

### Recommended Strategy

1. **Development**: Base Public RPC (free)
2. **Staging**: Coinbase Node free tier (1M req/month)
3. **Production**: Chainstack dedicated ($49/month) + Spectrum failover
4. **Enterprise**: All providers with load balancing

---

## 📊 Quick Reference

| Use Case | Primary | Backup | Cost |
|----------|---------|--------|------|
| Development | Base Public | Coinbase Free | $0 |
| Beta Testing | Coinbase Node | Chainstack Shared | $0-49 |
| Production | Chainstack Dedicated | Spectrum | $49-99 |
| Enterprise | Spectrum Premium | Multiple | Custom |

---

## 🔗 Verified Links

All links in this document were verified on October 26, 2025:

✅ https://chainstack.com/  
✅ https://spectrumnodes.com/?sPartner=gsd&gad_campaignid=22842687298  
✅ https://www.coinbase.com/developer-platform/products/base-node  
✅ https://docs.base.org/base-chain/quickstart/connecting-to-base  

---

**Last Updated**: October 26, 2025  
**Next Review**: November 26, 2025

