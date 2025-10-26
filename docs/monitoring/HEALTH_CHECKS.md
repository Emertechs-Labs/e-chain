# Health Check Endpoints - Echain Platform

**Last Updated**: October 26, 2025  
**Status**: Production Ready  
**Priority**: Critical

---

## 🎯 Overview

Comprehensive health monitoring endpoints for the Echain platform to ensure system reliability and quick incident detection.

**Purpose**:
- Monitor system health in real-time
- Enable automated monitoring and alerting
- Support load balancer health checks
- Provide status page data
- Enable proactive incident response

---

## 🔍 Health Check Endpoints

### 1. Overall System Health

**Endpoint**: `GET /api/health`  
**Purpose**: Quick system health check  
**Timeout**: 5 seconds  
**Cache**: No cache

**Response** (Healthy):
```json
{
  "status": "healthy",
  "timestamp": "2025-10-26T05:00:00.000Z",
  "version": "1.0.0-beta",
  "uptime": 3600000,
  "checks": {
    "database": "healthy",
    "rpc": "healthy",
    "cache": "healthy"
  }
}
```

**Response** (Unhealthy):
```json
{
  "status": "unhealthy",
  "timestamp": "2025-10-26T05:00:00.000Z",
  "version": "1.0.0-beta",
  "uptime": 3600000,
  "checks": {
    "database": "healthy",
    "rpc": "degraded",
    "cache": "down"
  },
  "errors": [
    {
      "component": "rpc",
      "message": "Primary RPC endpoint responding slowly (>2s)"
    },
    {
      "component": "cache",
      "message": "Redis connection failed"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: System fully operational
- `503 Service Unavailable`: System degraded or down

**Implementation**:
```typescript
// frontend/app/api/health/route.ts
import { NextResponse } from "next/server";
import { checkDatabase } from "@/lib/health/database";
import { checkRPC } from "@/lib/health/rpc";
import { checkCache } from "@/lib/health/cache";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const checks: any = {};
  const errors: any[] = [];
  
  // Run all health checks in parallel with timeout
  const results = await Promise.allSettled([
    Promise.race([
      checkDatabase(),
      timeout(2000, "database")
    ]),
    Promise.race([
      checkRPC(),
      timeout(2000, "rpc")
    ]),
    Promise.race([
      checkCache(),
      timeout(2000, "cache")
    ])
  ]);
  
  // Process results
  const [dbResult, rpcResult, cacheResult] = results;
  
  checks.database = processResult(dbResult, "database", errors);
  checks.rpc = processResult(rpcResult, "rpc", errors);
  checks.cache = processResult(cacheResult, "cache", errors);
  
  // Determine overall status
  const status = errors.length === 0 ? "healthy" :
    Object.values(checks).includes("down") ? "unhealthy" : "degraded";
  
  const response = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0-beta",
    uptime: process.uptime() * 1000,
    responseTime: Date.now() - startTime,
    checks,
    ...(errors.length > 0 && { errors })
  };
  
  return NextResponse.json(
    response,
    { status: status === "healthy" ? 200 : 503 }
  );
}

function processResult(result: any, component: string, errors: any[]) {
  if (result.status === "fulfilled") {
    return result.value;
  } else {
    errors.push({
      component,
      message: result.reason?.message || "Check failed"
    });
    return "down";
  }
}

function timeout(ms: number, component: string) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${component} check timed out`)), ms)
  );
}
```

---

### 2. Detailed Health Report

**Endpoint**: `GET /api/health/detailed`  
**Purpose**: Comprehensive system diagnostics  
**Timeout**: 30 seconds  
**Cache**: 10 seconds

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-26T05:00:00.000Z",
  "version": "1.0.0-beta",
  "components": {
    "database": {
      "status": "healthy",
      "latency": 15,
      "connections": {
        "active": 5,
        "max": 100
      },
      "lastCheck": "2025-10-26T05:00:00.000Z"
    },
    "rpc": {
      "status": "healthy",
      "providers": [
        {
          "name": "chainstack",
          "status": "healthy",
          "latency": 120,
          "url": "https://chainstack.com/"
        },
        {
          "name": "spectrum",
          "status": "healthy",
          "latency": 150,
          "url": "https://spectrumnodes.com/"
        },
        {
          "name": "coinbase",
          "status": "healthy",
          "latency": 110,
          "url": "https://www.coinbase.com/developer-platform/products/base-node"
        }
      ],
      "active": "coinbase",
      "failoverCount": 0
    },
    "cache": {
      "status": "healthy",
      "hitRate": 0.85,
      "memory": {
        "used": "128MB",
        "max": "512MB"
      }
    },
    "blockchain": {
      "network": "base-sepolia",
      "blockNumber": 12345678,
      "chainId": 84532,
      "contracts": {
        "EventFactory": {
          "address": "0x...",
          "status": "deployed",
          "version": "1.0.0"
        },
        "TicketMarketplace": {
          "address": "0x...",
          "status": "deployed",
          "version": "1.0.0"
        }
      }
    },
    "storage": {
      "status": "healthy",
      "provider": "vercel-blob",
      "quota": {
        "used": "2.5GB",
        "limit": "100GB"
      }
    }
  },
  "metrics": {
    "requestsPerMinute": 150,
    "errorRate": 0.003,
    "avgResponseTime": 180
  }
}
```

**Implementation**:
```typescript
// frontend/app/api/health/detailed/route.ts
import { NextResponse } from "next/server";
import { getDetailedHealth } from "@/lib/health/detailed";

export const runtime = "nodejs";
export const revalidate = 10; // Cache for 10 seconds

export async function GET() {
  try {
    const healthData = await getDetailedHealth();
    
    return NextResponse.json(healthData, {
      status: healthData.status === "healthy" ? 200 : 503,
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to retrieve health data",
        error: error.message
      },
      { status: 500 }
    );
  }
}
```

---

### 3. Database Health

**Endpoint**: `GET /api/health/database`  
**Purpose**: Database-specific health check

```typescript
// lib/health/database.ts
import { db } from "@/lib/database";

export async function checkDatabase(): Promise<string> {
  try {
    const startTime = Date.now();
    
    // Simple query to test connection
    await db.execute("SELECT 1");
    
    const latency = Date.now() - startTime;
    
    if (latency > 500) {
      return "degraded";
    }
    
    return "healthy";
  } catch (error) {
    console.error("Database health check failed:", error);
    return "down";
  }
}

export async function getDetailedDatabaseHealth() {
  try {
    const startTime = Date.now();
    
    // Get connection pool stats
    const poolStats = await db.execute(`
      SELECT 
        numbackends as active_connections,
        datconnlimit as max_connections
      FROM pg_stat_database 
      WHERE datname = current_database()
    `);
    
    const latency = Date.now() - startTime;
    
    return {
      status: latency < 500 ? "healthy" : "degraded",
      latency,
      connections: {
        active: poolStats.rows[0]?.active_connections || 0,
        max: poolStats.rows[0]?.max_connections || 100
      },
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: "down",
      error: error.message,
      lastCheck: new Date().toISOString()
    };
  }
}
```

---

### 4. RPC Provider Health

**Endpoint**: `GET /api/health/rpc`  
**Purpose**: Blockchain RPC provider status

```typescript
// lib/health/rpc.ts
import { ethers } from "ethers";

const RPC_PROVIDERS = [
  {
    name: "chainstack",
    url: process.env.CHAINSTACK_RPC_URL,
    docs: "https://chainstack.com/"
  },
  {
    name: "spectrum",
    url: process.env.SPECTRUM_RPC_URL,
    docs: "https://spectrumnodes.com/"
  },
  {
    name: "coinbase",
    url: process.env.COINBASE_NODE_URL,
    docs: "https://www.coinbase.com/developer-platform/products/base-node"
  },
  {
    name: "base-public",
    url: "https://sepolia.base.org",
    docs: "https://docs.base.org/base-chain/quickstart/connecting-to-base"
  }
];

export async function checkRPC(): Promise<string> {
  try {
    const currentProvider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL
    );
    
    const startTime = Date.now();
    await currentProvider.getBlockNumber();
    const latency = Date.now() - startTime;
    
    if (latency > 2000) return "degraded";
    if (latency > 5000) return "down";
    
    return "healthy";
  } catch (error) {
    return "down";
  }
}

export async function getDetailedRPCHealth() {
  const results = await Promise.allSettled(
    RPC_PROVIDERS.map(async (provider) => {
      const rpc = new ethers.JsonRpcProvider(provider.url);
      const startTime = Date.now();
      
      try {
        await rpc.getBlockNumber();
        const latency = Date.now() - startTime;
        
        return {
          name: provider.name,
          status: latency < 2000 ? "healthy" : "degraded",
          latency,
          url: provider.docs
        };
      } catch (error) {
        return {
          name: provider.name,
          status: "down",
          error: error.message,
          url: provider.docs
        };
      }
    })
  );
  
  const providers = results.map((r) =>
    r.status === "fulfilled" ? r.value : r.reason
  );
  
  const healthyCount = providers.filter((p) => p.status === "healthy").length;
  const status = healthyCount > 0 ? "healthy" : "down";
  
  return {
    status,
    providers,
    active: process.env.NEXT_PUBLIC_RPC_PROVIDER_NAME || "unknown",
    failoverCount: 0 // Track this in state
  };
}
```

---

### 5. Smart Contract Health

**Endpoint**: `GET /api/health/contracts`  
**Purpose**: Verify smart contract deployment and accessibility

```typescript
// lib/health/contracts.ts
import { ethers } from "ethers";
import eventFactoryABI from "@/lib/abis/EventFactory.json";
import marketplaceABI from "@/lib/abis/TicketMarketplace.json";

const CONTRACTS = {
  EventFactory: {
    address: process.env.NEXT_PUBLIC_EVENT_FACTORY_ADDRESS,
    abi: eventFactoryABI
  },
  TicketMarketplace: {
    address: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS,
    abi: marketplaceABI
  }
};

export async function checkContracts() {
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL
  );
  
  const results: any = {};
  
  for (const [name, config] of Object.entries(CONTRACTS)) {
    try {
      const contract = new ethers.Contract(
        config.address,
        config.abi,
        provider
      );
      
      // Try to read a simple view function
      const code = await provider.getCode(config.address);
      
      if (code === "0x") {
        results[name] = {
          address: config.address,
          status: "not_deployed",
          error: "No bytecode at address"
        };
      } else {
        results[name] = {
          address: config.address,
          status: "deployed",
          version: "1.0.0"
        };
      }
    } catch (error) {
      results[name] = {
        address: config.address,
        status: "error",
        error: error.message
      };
    }
  }
  
  const allHealthy = Object.values(results).every(
    (r: any) => r.status === "deployed"
  );
  
  return {
    status: allHealthy ? "healthy" : "degraded",
    contracts: results
  };
}
```

---

## 🚨 Monitoring Integration

### Uptime Monitoring (UptimeRobot)

Configure at: https://uptimerobot.com/

```
Monitor Type: HTTP(s)
URL: https://your-domain.com/api/health
Interval: 5 minutes
Alert Contacts: engineering@echain.com
HTTP Method: GET
Expected Response: 200
```

### Automated Health Checks

```bash
# scripts/health-check.sh
#!/bin/bash

HEALTH_URL="https://your-domain.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
  echo "✓ System healthy"
  exit 0
else
  echo "✗ System unhealthy (HTTP $RESPONSE)"
  # Send alert
  curl -X POST $SLACK_WEBHOOK \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"🚨 Health check failed! Status: $RESPONSE\"}"
  exit 1
fi
```

**Cron Schedule**:
```cron
# Check every 5 minutes
*/5 * * * * /path/to/health-check.sh
```

---

## 📊 Health Dashboard

### Status Page Configuration

Use status page service (e.g., https://statuspage.io/) or build custom:

```typescript
// app/status/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function StatusPage() {
  const [health, setHealth] = useState(null);
  
  useEffect(() => {
    async function fetchHealth() {
      const res = await fetch("/api/health/detailed");
      const data = await res.json();
      setHealth(data);
    }
    
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  if (!health) return <div>Loading...</div>;
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">System Status</h1>
      
      <div className={`p-4 rounded-lg mb-8 ${
        health.status === "healthy" ? "bg-green-100" : "bg-red-100"
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            health.status === "healthy" ? "bg-green-500" : "bg-red-500"
          }`} />
          <span className="font-semibold">
            {health.status === "healthy" ? "All Systems Operational" : "System Issues Detected"}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.entries(health.components).map(([name, component]: any) => (
          <div key={name} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold capitalize">{name}</h3>
              <StatusBadge status={component.status} />
            </div>
            {component.latency && (
              <p className="text-sm text-gray-600 mt-2">
                Latency: {component.latency}ms
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    healthy: "bg-green-100 text-green-800",
    degraded: "bg-yellow-100 text-yellow-800",
    down: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm ${colors[status]}`}>
      {status}
    </span>
  );
}
```

---

## 🔔 Alert Configuration

### PagerDuty Integration

```typescript
// lib/alerts/pagerduty.ts
export async function triggerPagerDutyAlert(incident: any) {
  const response = await fetch("https://events.pagerduty.com/v2/enqueue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token token=${process.env.PAGERDUTY_API_KEY}`
    },
    body: JSON.stringify({
      routing_key: process.env.PAGERDUTY_ROUTING_KEY,
      event_action: "trigger",
      payload: {
        summary: incident.summary,
        severity: incident.severity,
        source: "echain-health-check",
        component: incident.component,
        custom_details: incident.details
      }
    })
  });
  
  return response.json();
}
```

### Slack Notifications

```typescript
// lib/alerts/slack.ts
export async function sendSlackAlert(message: string, severity: string) {
  const colors = {
    critical: "#dc2626",
    warning: "#eab308",
    info: "#3b82f6"
  };
  
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attachments: [{
        color: colors[severity] || colors.info,
        title: "Health Check Alert",
        text: message,
        footer: "Echain Monitoring",
        ts: Math.floor(Date.now() / 1000)
      }]
    })
  });
}
```

---

## ✅ Implementation Checklist

- [ ] All health check endpoints created
- [ ] Database health monitoring configured
- [ ] RPC provider health checks implemented
- [ ] Smart contract verification working
- [ ] Health dashboard deployed
- [ ] Uptime monitoring configured (UptimeRobot/Pingdom)
- [ ] Alert integrations tested (Slack/PagerDuty)
- [ ] Cron jobs scheduled
- [ ] Status page live
- [ ] Documentation complete

---

## 🔗 Related Documentation

- [Sentry Configuration](./SENTRY_CONFIGURATION.md)
- [Error Tracking Rules](./ERROR_TRACKING_RULES.md)
- [Performance Alerts](./PERFORMANCE_ALERTS.md)
- [Incident Response Plan](../security/INCIDENT_RESPONSE_PLAN.md)

---

**Health Monitoring Resources**:
- Uptime Robot: https://uptimerobot.com/
- StatusPage.io: https://statuspage.io/
- PagerDuty: https://www.pagerduty.com/
- Base Network Status: https://status.base.org/
