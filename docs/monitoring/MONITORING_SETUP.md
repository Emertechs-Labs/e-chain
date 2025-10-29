# Monitoring and Alerting Setup Guide

**Last Updated:** October 26, 2025  
**Status:** Configuration Ready  
**Estimated Setup Time:** 2-3 hours

## Overview

This guide covers setting up comprehensive monitoring and alerting for the Echain platform using industry-standard tools.

## Table of Contents

1. [Sentry Error Tracking](#sentry-error-tracking)
2. [Performance Monitoring](#performance-monitoring)
3. [Health Check Endpoints](#health-check-endpoints)
4. [Status Dashboard](#status-dashboard)
5. [Alerting Rules](#alerting-rules)

## Sentry Error Tracking

### 1. Account Setup

1. **Create Sentry Account**
   - Visit: https://sentry.io/signup/
   - Select plan: Free tier for beta (up to 5K events/month)
   - Create organization: "Echain"

2. **Create Projects**
   ```
   - echain-frontend (Next.js)
   - echain-backend (Node.js)
   - echain-blockchain (Other)
   ```

3. **Get DSN Keys**
   - Frontend DSN: Project Settings → Client Keys (DSN)
   - Backend DSN: Project Settings → Client Keys (DSN)
   - Save these for environment variables

### 2. Frontend Integration

**Install Sentry SDK:**
```bash
cd frontend
npm install @sentry/nextjs
```

**Create** `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Beta: 100%, Production: 0.1
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  integrations: [
    new Sentry.BrowserTracing({
      // Track all route changes
      tracingOrigins: ["localhost", "echain.app", /^\//],
    }),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Filter out noise
  ignoreErrors: [
    // Browser extensions
    "Non-Error promise rejection captured",
    // Network errors
    "NetworkError",
    "Failed to fetch",
  ],
  
  beforeSend(event, hint) {
    // Don't send in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Filter out wallet connection errors (user-initiated)
    if (event.exception?.values?.[0]?.value?.includes('User rejected')) {
      return null;
    }
    
    return event;
  },
});
```

**Create** `sentry.server.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
```

**Update** `next.config.js`:
```javascript
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // ... existing config
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
  },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "echain",
  project: "echain-frontend",
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
```

**Environment Variables:**
```env
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx # For source map uploads
```

### 3. Backend Integration

**Install Sentry SDK:**
```bash
cd backend
npm install @sentry/node @sentry/profiling-node
```

**Update** `src/server.ts`:
```typescript
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

// Initialize Sentry FIRST
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

// Request handler must be first middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... your routes ...

// Error handler must be before other error middleware
app.use(Sentry.Handlers.errorHandler());

// Custom error handler
app.use(errorHandler);
```

**Enhanced Error Handler** (`src/middleware/errorHandler.ts`):
```typescript
import * as Sentry from "@sentry/node";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log to Winston
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  // Capture in Sentry with context
  Sentry.captureException(err, {
    tags: {
      path: req.path,
      method: req.method,
    },
    user: {
      id: req.user?.id,
      address: req.user?.address,
    },
    extra: {
      body: req.body,
      query: req.query,
      headers: req.headers,
    },
  });
  
  // ... rest of error handler
};
```

**Environment Variables:**
```env
# backend/.env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

## Performance Monitoring

### 1. Custom Instrumentation

**Frontend Performance Tracking:**
```typescript
// lib/monitoring/performance.ts
import * as Sentry from "@sentry/nextjs";

export const trackPerformance = (name: string, duration: number) => {
  Sentry.metrics.distribution(name, duration, {
    unit: 'millisecond',
    tags: { page: window.location.pathname },
  });
};

// Usage in components
useEffect(() => {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    trackPerformance('component_mount', duration);
  };
}, []);
```

**Backend Performance Tracking:**
```typescript
// middleware/performance.ts
import { Request, Response, NextFunction } from 'express';
import * as Sentry from "@sentry/node";

export const performanceMonitor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    Sentry.metrics.distribution('http_request_duration', duration, {
      unit: 'millisecond',
      tags: {
        method: req.method,
        route: req.route?.path || req.path,
        status: res.statusCode.toString(),
      },
    });
    
    // Alert on slow requests
    if (duration > 3000) {
      logger.warn('Slow request detected', {
        path: req.path,
        duration,
        method: req.method,
      });
    }
  });
  
  next();
};
```

### 2. Web Vitals Tracking

**Frontend Web Vitals:**
```typescript
// app/layout.tsx
import { useReportWebVitals } from 'next/web-vitals';
import * as Sentry from "@sentry/nextjs";

export function ReportWebVitals() {
  useReportWebVitals((metric) => {
    Sentry.metrics.distribution(metric.name, metric.value, {
      unit: 'millisecond',
      tags: {
        page: window.location.pathname,
      },
    });
    
    // Log to analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_label: metric.label,
      });
    }
  });
  
  return null;
}
```

## Health Check Endpoints

### 1. Basic Health Check

**Create** `backend/src/routes/health.ts`:
```typescript
import { Router } from 'express';
import { prisma } from '../utils/prisma';
import * as Sentry from "@sentry/node";

const router = Router();

// Basic health check
router.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Detailed health check
router.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      sentry: 'unknown',
      memory: 'unknown',
    },
  };
  
  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = 'healthy';
  } catch (error) {
    health.checks.database = 'unhealthy';
    health.status = 'degraded';
    Sentry.captureException(error);
  }
  
  // Sentry check
  try {
    Sentry.captureMessage('Health check', 'info');
    health.checks.sentry = 'healthy';
  } catch (error) {
    health.checks.sentry = 'unhealthy';
  }
  
  // Memory check
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
  };
  
  if (memUsageMB.heapUsed > 500) {
    health.checks.memory = 'warning';
    health.status = 'degraded';
  } else {
    health.checks.memory = 'healthy';
  }
  
  health.checks.memory = memUsageMB;
  
  res.json(health);
});

// Readiness probe (for Kubernetes)
router.get('/health/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

// Liveness probe (for Kubernetes)
router.get('/health/live', (req, res) => {
  res.json({ alive: true });
});

export default router;
```

### 2. RPC Provider Health Check

**Create** `backend/src/utils/rpcHealth.ts`:
```typescript
import { ethers } from 'ethers';
import * as Sentry from "@sentry/node";

const RPC_PROVIDERS = [
  process.env.BASE_MAINNET_CHAINSTACK_RPC!,
  process.env.BASE_MAINNET_SPECTRUM_RPC!,
  process.env.BASE_MAINNET_COINBASE_RPC!,
];

export async function checkRPCHealth() {
  const results = await Promise.all(
    RPC_PROVIDERS.map(async (rpcUrl, index) => {
      const start = Date.now();
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const blockNumber = await provider.getBlockNumber();
        const latency = Date.now() - start;
        
        return {
          provider: index === 0 ? 'chainstack' : index === 1 ? 'spectrum' : 'coinbase',
          status: 'healthy',
          latency,
          blockNumber,
        };
      } catch (error) {
        Sentry.captureException(error, {
          tags: { rpc_provider: index },
        });
        
        return {
          provider: index === 0 ? 'chainstack' : index === 1 ? 'spectrum' : 'coinbase',
          status: 'unhealthy',
          error: (error as Error).message,
        };
      }
    })
  );
  
  return results;
}

// Add to health endpoint
router.get('/health/rpc', async (req, res) => {
  const rpcHealth = await checkRPCHealth();
  res.json(rpcHealth);
});
```

## Status Dashboard

### Option 1: Sentry Status Page (Free)

1. Go to Sentry → Settings → Status Page
2. Enable public status page
3. Add key services:
   - Frontend Application
   - Backend API
   - Smart Contracts
   - Database
4. Share URL: `https://echain.statuspage.sentry.io`

### Option 2: Custom Status Page

**Create** `frontend/app/status/page.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';

interface HealthStatus {
  frontend: 'operational' | 'degraded' | 'down';
  backend: 'operational' | 'degraded' | 'down';
  database: 'operational' | 'degraded' | 'down';
  blockchain: 'operational' | 'degraded' | 'down';
}

export default function StatusPage() {
  const [status, setStatus] = useState<HealthStatus>({
    frontend: 'operational',
    backend: 'operational',
    database: 'operational',
    blockchain: 'operational',
  });
  
  useEffect(() => {
    async function checkHealth() {
      try {
        // Backend health
        const backendRes = await fetch('/api/health/detailed');
        const backendHealth = await backendRes.json();
        
        setStatus({
          frontend: 'operational',
          backend: backendHealth.status === 'ok' ? 'operational' : 'degraded',
          database: backendHealth.checks.database === 'healthy' ? 'operational' : 'down',
          blockchain: 'operational', // Check RPC providers
        });
      } catch (error) {
        setStatus(prev => ({ ...prev, backend: 'down' }));
      }
    }
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  const getStatusColor = (service: keyof HealthStatus) => {
    switch (status[service]) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Echain System Status</h1>
        
        <div className="space-y-4">
          {Object.entries(status).map(([service, state]) => (
            <div key={service} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold capitalize">{service}</h3>
                  <p className="text-gray-600 capitalize">{state}</p>
                </div>
                <div className={`w-4 h-4 rounded-full ${getStatusColor(service as keyof HealthStatus)}`} />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
```

### Option 3: Third-Party Status Pages

**Recommended: Better Uptime (Free)**
1. Sign up: https://betteruptime.com/
2. Add monitors:
   - HTTP monitor for `https://echain.app/api/health`
   - Port monitor for database
   - SSL certificate monitor
3. Enable status page: `https://status.echain.app`
4. Configure notifications (email, Slack, Discord)

## Alerting Rules

### 1. Sentry Alerts

**Configure in Sentry → Alerts:**

**Critical Alerts** (Slack + Email):
- Error rate > 10 errors/min
- New issue type affecting >100 users
- Performance degradation (P95 latency > 3s)
- Database connection failures

**Warning Alerts** (Email only):
- Error rate > 5 errors/min
- Memory usage > 80%
- Slow database queries (>1s)

**Alert Configuration:**
```yaml
# .sentry/alerts/critical-errors.yaml
name: "Critical Error Rate"
conditions:
  - id: "event_frequency"
    interval: "1m"
    value: 10
actions:
  - id: "slack"
    workspace: "echain"
    channel: "#alerts-critical"
  - id: "email"
    targetType: "Team"
    targetIdentifier: "engineering"
```

### 2. Custom Alert System

**Create** `backend/src/utils/alerts.ts`:
```typescript
import * as Sentry from "@sentry/node";
import { logger } from './logger';

interface Alert {
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export async function sendAlert(alert: Alert) {
  // Log locally
  logger[alert.level === 'critical' ? 'error' : 'warn'](alert.title, {
    message: alert.message,
    ...alert.metadata,
  });
  
  // Send to Sentry
  Sentry.captureMessage(alert.title, {
    level: alert.level === 'critical' ? 'error' : 'warning',
    tags: {
      alert_type: alert.level,
    },
    extra: {
      message: alert.message,
      ...alert.metadata,
    },
  });
  
  // Send to Slack if critical
  if (alert.level === 'critical' && process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 CRITICAL: ${alert.title}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${alert.title}*\n${alert.message}`,
            },
          },
          {
            type: 'section',
            fields: Object.entries(alert.metadata || {}).map(([key, value]) => ({
              type: 'mrkdwn',
              text: `*${key}:* ${value}`,
            })),
          },
        ],
      }),
    });
  }
}

// Usage examples
export const alerts = {
  databaseDown: () => sendAlert({
    level: 'critical',
    title: 'Database Connection Lost',
    message: 'Unable to connect to PostgreSQL database',
  }),
  
  highErrorRate: (rate: number) => sendAlert({
    level: 'warning',
    title: 'High Error Rate Detected',
    message: `Current error rate: ${rate}/min`,
    metadata: { error_rate: rate },
  }),
  
  slowQuery: (query: string, duration: number) => sendAlert({
    level: 'warning',
    title: 'Slow Database Query',
    message: `Query took ${duration}ms`,
    metadata: { query, duration },
  }),
};
```

## Environment Variables Summary

Add these to your deployment environment:

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
SENTRY_ORG=echain
SENTRY_PROJECT_FRONTEND=echain-frontend
SENTRY_PROJECT_BACKEND=echain-backend

# Slack (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# Status Page (optional)
BETTERUPTIME_API_KEY=xxx
```

## Testing Your Setup

### 1. Test Error Tracking

**Frontend:**
```typescript
// Trigger test error
throw new Error('Test Sentry integration');
```

**Backend:**
```bash
curl http://localhost:3001/api/test-error
```

### 2. Test Performance Tracking

```typescript
// Track custom metric
Sentry.metrics.distribution('checkout_duration', 1234, {
  tags: { payment_method: 'crypto' },
});
```

### 3. Test Health Endpoints

```bash
# Basic health
curl http://localhost:3001/api/health

# Detailed health
curl http://localhost:3001/api/health/detailed

# RPC health
curl http://localhost:3001/api/health/rpc
```

### 4. Test Alerting

```typescript
// Trigger alert
import { alerts } from './utils/alerts';
await alerts.highErrorRate(15);
```

## Monitoring Checklist

- [ ] Sentry account created
- [ ] Frontend project configured
- [ ] Backend project configured
- [ ] Source maps uploading
- [ ] Performance monitoring enabled
- [ ] Health endpoints implemented
- [ ] RPC provider monitoring active
- [ ] Status page deployed
- [ ] Alert rules configured
- [ ] Team notifications set up
- [ ] Documentation updated

## Maintenance

### Weekly Tasks
- Review error trends in Sentry
- Check performance metrics
- Verify alert rules are working
- Update status page if needed

### Monthly Tasks
- Review and archive resolved issues
- Analyze performance trends
- Optimize slow queries
- Update monitoring documentation

## Support

**Sentry Documentation:** https://docs.sentry.io/  
**Better Uptime Docs:** https://docs.betteruptime.com/  
**Slack Webhooks:** https://api.slack.com/messaging/webhooks

---

**Last Updated:** October 26, 2025  
**Maintained By:** DevOps Team  
**Questions?** Slack #echain-infrastructure
