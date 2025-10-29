# Performance Alerts - Echain Platform

**Last Updated**: October 26, 2025  
**Status**: Production Configuration  
**Official Docs**: https://docs.sentry.io/product/performance/

---

## 🎯 Performance Monitoring Overview

Comprehensive performance tracking for the Echain platform with focus on blockchain operations, API latency, and user experience metrics.

**Key Metrics**:
- Transaction duration
- API response times
- Blockchain read/write latency
- Database query performance
- Frontend rendering time

**Tools**:
- Sentry Performance: https://docs.sentry.io/product/performance/
- Vercel Analytics: https://vercel.com/analytics
- Web Vitals: https://web.dev/vitals/

---

## 📊 Performance Baselines

### Current Performance Targets

| Metric | Target | Warning | Critical | Current |
|--------|--------|---------|----------|---------|
| **API Response** | < 200ms | > 500ms | > 1000ms | 180ms |
| **Blockchain Read** | < 500ms | > 2000ms | > 5000ms | 420ms |
| **Blockchain Write** | < 3000ms | > 10000ms | > 30000ms | 2800ms |
| **Page Load (FCP)** | < 1.5s | > 2.5s | > 4s | 1.2s |
| **Page Load (LCP)** | < 2.5s | > 4s | > 6s | 2.1s |
| **Database Query** | < 50ms | > 200ms | > 500ms | 35ms |
| **Image Upload** | < 2s | > 5s | > 10s | 1.8s |

**Reference**: https://web.dev/vitals/#core-web-vitals

---

## 🚨 Performance Alert Rules

### 1. Slow API Endpoints

**Alert ID**: `perf-api-001`  
**Trigger**: API response time > 1000ms

```typescript
// Sentry Performance Alert
{
  name: "Slow API Response Time",
  conditions: {
    "transaction.duration": "> 1000ms",
    "transaction.op": "http.server",
    "percentile": "p95",
    "window": "15 minutes"
  },
  filters: {
    "transaction.name": [
      "/api/events",
      "/api/tickets",
      "/api/marketplace"
    ]
  },
  actions: [
    { type: "email", to: "backend@echain.com" },
    { type: "slack", channel: "#performance" }
  ],
  frequency: "15 minutes"
}
```

**Troubleshooting**:
1. Check database query performance
2. Verify RPC node response times
3. Review caching effectiveness
4. Check for N+1 queries

### 2. Slow Blockchain Reads

**Alert ID**: `perf-blockchain-002`  
**Trigger**: Blockchain read operations > 5000ms

```typescript
{
  name: "Slow Blockchain Read Operations",
  conditions: {
    "transaction.name": "blockchain.read.*",
    "transaction.duration": "> 5000ms",
    "count": "> 10 in 15 minutes"
  },
  actions: [
    { type: "email", to: "blockchain-team@echain.com" },
    { type: "slack", channel: "#blockchain-performance" },
    { type: "webhook", url: "https://api.echain.com/rpc/failover" }
  ],
  frequency: "15 minutes",
  autoRemediation: {
    action: "switchRPCProvider",
    threshold: "50% of requests slow"
  }
}
```

**Auto-remediation**:
```typescript
// lib/rpc-manager.ts
export async function handleSlowRPCPerformance() {
  const providers = getRPCProviders();
  const currentProvider = getCurrentProvider();
  
  // Test all providers
  const healthChecks = await Promise.all(
    providers.map(p => testRPCLatency(p))
  );
  
  // Switch to fastest
  const fastest = healthChecks.sort((a, b) => a.latency - b.latency)[0];
  
  if (fastest.provider !== currentProvider) {
    await switchRPCProvider(fastest.provider);
    
    // Log to Sentry
    Sentry.captureMessage("RPC Provider Switched", {
      level: "warning",
      extra: {
        from: currentProvider,
        to: fastest.provider,
        reason: "performance_degradation",
        oldLatency: currentProvider.latency,
        newLatency: fastest.latency
      }
    });
  }
}
```

**RPC Provider Comparison**:
- Chainstack: https://chainstack.com/pricing/
- Spectrum Nodes: https://spectrumnodes.com/
- Coinbase Node: https://www.coinbase.com/developer-platform/products/base-node
- Base Public RPC: https://docs.base.org/base-chain/quickstart/connecting-to-base

### 3. Slow Blockchain Writes

**Alert ID**: `perf-blockchain-003`  
**Trigger**: Transaction confirmation > 30 seconds

```typescript
{
  name: "Slow Transaction Confirmations",
  conditions: {
    "transaction.name": "blockchain.write.*",
    "transaction.duration": "> 30000ms",
    "count": "> 5 in 30 minutes"
  },
  actions: [
    { type: "email", to: "devops@echain.com" },
    { type: "slack", channel: "#blockchain-alerts" }
  ],
  frequency: "30 minutes"
}
```

**Optimization Steps**:
1. Check gas price settings
2. Review transaction priority
3. Verify network congestion
4. Consider using Flashbots/MEV protection

### 4. Poor Core Web Vitals

**Alert ID**: `perf-frontend-004`  
**Trigger**: LCP > 4s or CLS > 0.25

```typescript
{
  name: "Poor Core Web Vitals",
  conditions: {
    metric: "LCP",
    value: "> 4000ms",
    percentile: "p75",
    window: "1 hour"
  },
  OR: {
    metric: "CLS",
    value: "> 0.25",
    percentile: "p75",
    window: "1 hour"
  },
  actions: [
    { type: "email", to: "frontend@echain.com" },
    { type: "slack", channel: "#frontend-performance" }
  ],
  frequency: "1 hour"
}
```

**Reference**: https://web.dev/vitals/

---

## 📈 Performance Monitoring Setup

### Frontend Performance Tracking

```typescript
// frontend/lib/performance-monitor.ts
import * as Sentry from "@sentry/nextjs";
import { getCLS, getFCP, getFID, getLCP, getTTFB } from "web-vitals";

export function initPerformanceMonitoring() {
  // Track Core Web Vitals
  getCLS((metric) => sendToSentry(metric));
  getFCP((metric) => sendToSentry(metric));
  getFID((metric) => sendToSentry(metric));
  getLCP((metric) => sendToSentry(metric));
  getTTFB((metric) => sendToSentry(metric));
}

function sendToSentry(metric: any) {
  const transaction = Sentry.startTransaction({
    name: `web-vital-${metric.name}`,
    op: "web-vital"
  });
  
  transaction.setMeasurement(metric.name, metric.value, metric.unit);
  transaction.setData("rating", metric.rating);
  transaction.finish();
}

// Track custom metrics
export function trackPageLoad(pageName: string) {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    
    Sentry.startTransaction({
      name: `page-load-${pageName}`,
      op: "page-load"
    }).setMeasurement("duration", duration, "millisecond").finish();
  };
}
```

**Usage**:
```typescript
// app/events/page.tsx
"use client";

import { trackPageLoad } from "@/lib/performance-monitor";
import { useEffect } from "react";

export default function EventsPage() {
  useEffect(() => {
    const endTracking = trackPageLoad("events");
    return endTracking;
  }, []);
  
  // ... component code
}
```

### API Performance Tracking

```typescript
// backend/middleware/performance.ts
import * as Sentry from "@sentry/node";

export function performanceMiddleware(req, res, next) {
  const transaction = Sentry.startTransaction({
    name: `${req.method} ${req.path}`,
    op: "http.server"
  });
  
  req.sentryTransaction = transaction;
  const startTime = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    
    transaction.setHttpStatus(res.statusCode);
    transaction.setData("duration", duration);
    transaction.setData("method", req.method);
    transaction.setData("path", req.path);
    
    // Add custom tags
    transaction.setTag("endpoint", req.path);
    transaction.setTag("status_code", res.statusCode);
    
    transaction.finish();
    
    // Alert if slow
    if (duration > 1000) {
      Sentry.captureMessage("Slow API Response", {
        level: "warning",
        extra: {
          endpoint: req.path,
          duration,
          method: req.method
        }
      });
    }
  });
  
  next();
}
```

### Blockchain Performance Tracking

```typescript
// lib/blockchain-monitor.ts
import * as Sentry from "@sentry/nextjs";

export async function monitoredBlockchainRead<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = Sentry.startTransaction({
    name: `blockchain.read.${operation}`,
    op: "blockchain.read"
  });
  
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    transaction.setMeasurement("duration", duration, "millisecond");
    transaction.setStatus("ok");
    
    // Log slow reads
    if (duration > 2000) {
      console.warn(`Slow blockchain read: ${operation} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    transaction.setStatus("internal_error");
    throw error;
  } finally {
    transaction.finish();
  }
}

export async function monitoredBlockchainWrite<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = Sentry.startTransaction({
    name: `blockchain.write.${operation}`,
    op: "blockchain.write"
  });
  
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    transaction.setMeasurement("duration", duration, "millisecond");
    transaction.setMeasurement("gas_used", result.gasUsed, "gas");
    transaction.setStatus("ok");
    
    return result;
  } catch (error) {
    transaction.setStatus("internal_error");
    throw error;
  } finally {
    transaction.finish();
  }
}
```

---

## 🔍 Performance Debugging

### Identify Slow Queries

```sql
-- Database performance monitoring
SELECT 
  query,
  calls,
  total_time / calls as avg_time_ms,
  min_time,
  max_time
FROM pg_stat_statements
WHERE total_time / calls > 100 -- Queries over 100ms
ORDER BY total_time DESC
LIMIT 20;
```

### RPC Provider Benchmarking

```typescript
// scripts/benchmark-rpc.ts
import { ethers } from "ethers";

const providers = [
  {
    name: "Chainstack",
    url: process.env.CHAINSTACK_RPC_URL,
    docs: "https://chainstack.com/"
  },
  {
    name: "Spectrum Nodes",
    url: process.env.SPECTRUM_RPC_URL,
    docs: "https://spectrumnodes.com/"
  },
  {
    name: "Coinbase Node",
    url: process.env.COINBASE_NODE_URL,
    docs: "https://www.coinbase.com/developer-platform/products/base-node"
  },
  {
    name: "Base Public",
    url: "https://mainnet.base.org",
    docs: "https://docs.base.org/base-chain/quickstart/connecting-to-base"
  }
];

async function benchmarkProvider(provider: any) {
  const rpc = new ethers.JsonRpcProvider(provider.url);
  const tests = [];
  
  // Test 1: Get block number
  const start1 = Date.now();
  await rpc.getBlockNumber();
  tests.push({ test: "getBlockNumber", duration: Date.now() - start1 });
  
  // Test 2: Get balance
  const start2 = Date.now();
  await rpc.getBalance("0x0000000000000000000000000000000000000000");
  tests.push({ test: "getBalance", duration: Date.now() - start2 });
  
  // Test 3: Call contract
  const start3 = Date.now();
  await rpc.call({
    to: "0x1234567890123456789012345678901234567890",
    data: "0x18160ddd" // totalSupply()
  });
  tests.push({ test: "contractCall", duration: Date.now() - start3 });
  
  const avgLatency = tests.reduce((sum, t) => sum + t.duration, 0) / tests.length;
  
  return {
    provider: provider.name,
    url: provider.url,
    docs: provider.docs,
    avgLatency,
    tests
  };
}

async function runBenchmarks() {
  console.log("🚀 Benchmarking RPC Providers...\n");
  
  for (const provider of providers) {
    try {
      const result = await benchmarkProvider(provider);
      console.log(`\n✓ ${result.provider} (${result.avgLatency.toFixed(0)}ms avg)`);
      console.log(`  Docs: ${result.docs}`);
      result.tests.forEach(t => {
        console.log(`  ${t.test}: ${t.duration}ms`);
      });
    } catch (error) {
      console.error(`✗ ${provider.name}: ${error.message}`);
    }
  }
}

runBenchmarks();
```

**Run benchmark**:
```bash
npm run benchmark:rpc
```

---

## 📊 Performance Dashboards

### Sentry Performance Dashboard

Create dashboard at: https://sentry.io/organizations/echain/dashboards/

**Widgets**:

1. **API Response Time (P95)**
   ```
   Query: transaction.duration
   Filter: transaction.op:http.server
   Visualization: Line chart
   Grouping: transaction.name
   ```

2. **Blockchain Operation Latency**
   ```
   Query: transaction.duration
   Filter: transaction.op:blockchain.*
   Visualization: Area chart
   Grouping: transaction.op
   ```

3. **Slow Transaction Count**
   ```
   Query: count()
   Filter: transaction.duration:>1000
   Visualization: Big number
   ```

4. **Core Web Vitals**
   ```
   Query: measurements.lcp, measurements.fcp, measurements.cls
   Visualization: Multi-line chart
   ```

### Vercel Analytics

Enable at: https://vercel.com/dashboard/analytics

**Key Metrics**:
- Real User Monitoring (RUM)
- Core Web Vitals
- Page load performance
- Geographic distribution

---

## 🎯 Optimization Strategies

### 1. Caching Strategy

```typescript
// lib/cache-config.ts
export const cacheConfig = {
  // Short cache for dynamic data
  events: {
    ttl: 60, // 1 minute
    staleWhileRevalidate: 300 // 5 minutes
  },
  
  // Medium cache for semi-static data
  eventDetails: {
    ttl: 300, // 5 minutes
    staleWhileRevalidate: 3600 // 1 hour
  },
  
  // Long cache for static data
  contractABI: {
    ttl: 86400, // 24 hours
    staleWhileRevalidate: 604800 // 7 days
  },
  
  // Blockchain data with block-based invalidation
  blockchainData: {
    ttl: 12, // 12 seconds (1 block on Base)
    revalidateOnNewBlock: true
  }
};
```

### 2. Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_events_date ON events(event_date DESC);
CREATE INDEX idx_events_organizer ON events(organizer_address);
CREATE INDEX idx_tickets_event ON tickets(event_id, owner_address);

-- Materialized view for statistics
CREATE MATERIALIZED VIEW event_statistics AS
SELECT 
  event_id,
  COUNT(DISTINCT buyer_address) as unique_buyers,
  SUM(amount) as total_revenue,
  COUNT(*) as ticket_count
FROM ticket_sales
GROUP BY event_id;

-- Refresh every 5 minutes
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-stats', '*/5 * * * *', 'REFRESH MATERIALIZED VIEW event_statistics');
```

### 3. Frontend Optimization

```typescript
// next.config.js
module.exports = {
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96]
  },
  
  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      };
    }
    return config;
  }
};
```

---

## ✅ Performance Checklist

### Pre-Beta Launch

- [ ] All performance alerts configured
- [ ] Baseline metrics established
- [ ] RPC providers benchmarked
- [ ] Database queries optimized
- [ ] Caching strategy implemented
- [ ] Core Web Vitals passing (> 75)
- [ ] Load testing completed
- [ ] Performance dashboard created
- [ ] Auto-remediation scripts deployed
- [ ] Team trained on performance monitoring

### Ongoing Monitoring

- [ ] Review performance dashboard daily
- [ ] Analyze slow queries weekly
- [ ] Benchmark RPC providers monthly
- [ ] Update performance targets quarterly
- [ ] Conduct load tests before major releases

---

## 🔗 Related Documentation

- [Sentry Configuration](./SENTRY_CONFIGURATION.md)
- [Error Tracking Rules](./ERROR_TRACKING_RULES.md)
- [Health Check Endpoints](./HEALTH_CHECKS.md)
- [RPC Provider Guide](../infrastructure/RPC_PROVIDERS.md)

---

**Performance Resources**:
- Web Vitals: https://web.dev/vitals/
- Sentry Performance: https://docs.sentry.io/product/performance/
- Vercel Analytics: https://vercel.com/docs/analytics
- Base Network Status: https://status.base.org/
