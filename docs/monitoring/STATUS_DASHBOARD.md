# Status Dashboard Configuration - Echain Platform

**Last Updated**: October 26, 2025  
**Status**: Production Ready  
**Public URL**: https://status.echain.com

---

## 🎯 Overview

Real-time status dashboard for monitoring Echain platform health, displaying system status, performance metrics, and incident history to users and stakeholders.

**Features**:
- Real-time system status
- Component-level health monitoring
- Performance metrics visualization
- Incident history and updates
- Subscription notifications
- Public API access

---

## 📊 Dashboard Layout

### Homepage Status View

```
┌─────────────────────────────────────────────────────────┐
│                    Echain Status                         │
│                                                          │
│  ●  All Systems Operational                             │
│                                                          │
│  Last updated: 2 minutes ago                            │
│  Uptime: 99.98% (Last 30 days)                          │
└─────────────────────────────────────────────────────────┘

Components
┌──────────────────────────────────────────────────────────┐
│  Platform Services                                       │
│  ──────────────────────────────────────────────────      │
│  ✓ Web Application                           Operational │
│  ✓ API Services                              Operational │
│  ✓ Event Creation                            Operational │
│  ✓ Ticket Purchasing                         Operational │
│  ✓ NFT Minting                               Operational │
│                                                           │
│  Blockchain Infrastructure                                │
│  ──────────────────────────────────────────────────      │
│  ✓ Base Network (Sepolia)                   Operational │
│  ✓ Smart Contracts                           Operational │
│  ✓ RPC Endpoints                             Operational │
│  ✓ Event Indexing                            Operational │
│                                                           │
│  Data Services                                            │
│  ──────────────────────────────────────────────────      │
│  ✓ Database                                  Operational │
│  ✓ Cache Layer                               Operational │
│  ✓ File Storage                              Operational │
│  ✓ Search Service                            Operational │
└──────────────────────────────────────────────────────────┘

Performance Metrics (Last Hour)
┌──────────────────────────────────────────────────────────┐
│  API Response Time         P95: 180ms     Threshold: 500ms│
│  Blockchain Read          P95: 420ms     Threshold: 2s   │
│  Blockchain Write         P95: 2.8s      Threshold: 10s  │
│  Page Load (LCP)          P75: 2.1s      Threshold: 4s   │
└──────────────────────────────────────────────────────────┘

Recent Incidents
┌──────────────────────────────────────────────────────────┐
│  No incidents in the last 7 days                         │
└──────────────────────────────────────────────────────────┘
```

---

## 🏗️ Implementation Options

### Option A: Use Statuspage.io (Recommended)

**Provider**: Atlassian Statuspage  
**URL**: https://statuspage.io/  
**Pricing**: $29-$99/month  
**Pros**: Fully managed, reliable, professional  
**Cons**: Monthly cost

**Setup**:
1. Sign up at https://statuspage.io/
2. Configure components
3. Set up API integrations
4. Add custom domain (status.echain.com)
5. Configure email/SMS notifications

**Integration Example**:
```typescript
// lib/statuspage.ts
const STATUSPAGE_API = "https://api.statuspage.io/v1";
const PAGE_ID = process.env.STATUSPAGE_PAGE_ID;
const API_KEY = process.env.STATUSPAGE_API_KEY;

export async function updateComponentStatus(
  componentId: string,
  status: "operational" | "degraded_performance" | "partial_outage" | "major_outage"
) {
  const response = await fetch(
    `${STATUSPAGE_API}/pages/${PAGE_ID}/components/${componentId}`,
    {
      method: "PATCH",
      headers: {
        "Authorization": `OAuth ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        component: { status }
      })
    }
  );
  
  return response.json();
}

export async function createIncident(incident: {
  name: string;
  status: string;
  impact: string;
  body: string;
}) {
  const response = await fetch(
    `${STATUSPAGE_API}/pages/${PAGE_ID}/incidents`,
    {
      method: "POST",
      headers: {
        "Authorization": `OAuth ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ incident })
    }
  );
  
  return response.json();
}
```

**Docs**: https://developer.statuspage.io/

---

### Option B: Self-Hosted (Cachet)

**Provider**: Cachet HQ  
**URL**: https://cachethq.io/  
**Pricing**: Free (Open Source)  
**Pros**: No ongoing cost, full control  
**Cons**: Requires hosting and maintenance

**Installation**:
```bash
# Using Docker
docker run -d \
  --name=cachet \
  -p 8000:8000 \
  -e APP_KEY=base64:your-key-here \
  -e DB_DRIVER=pgsql \
  -e DB_HOST=your-db-host \
  -e DB_DATABASE=cachet \
  -e DB_USERNAME=cachet \
  -e DB_PASSWORD=your-password \
  cachethq/docker:latest
```

**GitHub**: https://github.com/cachethq/cachet

---

### Option C: Custom Next.js Page (Best for Full Control)

**Pros**: Complete customization, no external dependencies  
**Cons**: More development time

**Implementation**:

```typescript
// app/status/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

interface SystemStatus {
  status: "operational" | "degraded" | "down";
  components: Record<string, ComponentStatus>;
  metrics: PerformanceMetrics;
  incidents: Incident[];
  uptime: UptimeData;
}

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);
  
  async function fetchStatus() {
    try {
      const res = await fetch("/api/status/public");
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return <StatusPageSkeleton />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Echain Status</h1>
          <p className="text-gray-600 mt-2">
            Real-time status and performance monitoring
          </p>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Overall Status */}
        <StatusOverview status={status.status} />
        
        {/* Components */}
        <ComponentsList components={status.components} />
        
        {/* Performance Metrics */}
        <PerformanceCharts metrics={status.metrics} />
        
        {/* Uptime */}
        <UptimeCalendar uptime={status.uptime} />
        
        {/* Incidents */}
        <IncidentHistory incidents={status.incidents} />
        
        {/* Subscribe */}
        <SubscriptionForm />
      </main>
      
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>Status page powered by Echain</p>
          <p className="mt-2">
            <a href="https://docs.base.org/" className="text-blue-600 hover:underline">
              Built on Base
            </a>
            {" • "}
            <a href="/api/status/public" className="text-blue-600 hover:underline">
              API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatusOverview({ status }: { status: string }) {
  const statusConfig = {
    operational: {
      icon: "✓",
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      message: "All Systems Operational"
    },
    degraded: {
      icon: "⚠",
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      message: "Degraded Performance"
    },
    down: {
      icon: "✗",
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      message: "Service Disruption"
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <div className={`${config.bgColor} rounded-lg p-6`}>
      <div className="flex items-center gap-3">
        <div className={`${config.color} w-4 h-4 rounded-full`} />
        <h2 className={`text-2xl font-semibold ${config.textColor}`}>
          {config.message}
        </h2>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Last updated: {new Date().toLocaleString()}
      </p>
    </div>
  );
}

function ComponentsList({ components }: { components: Record<string, any> }) {
  const groups = {
    "Platform Services": [
      { id: "web", name: "Web Application" },
      { id: "api", name: "API Services" },
      { id: "events", name: "Event Creation" },
      { id: "tickets", name: "Ticket Purchasing" },
      { id: "nft", name: "NFT Minting" }
    ],
    "Blockchain Infrastructure": [
      { id: "network", name: "Base Network (Sepolia)" },
      { id: "contracts", name: "Smart Contracts" },
      { id: "rpc", name: "RPC Endpoints" },
      { id: "indexer", name: "Event Indexing" }
    ],
    "Data Services": [
      { id: "database", name: "Database" },
      { id: "cache", name: "Cache Layer" },
      { id: "storage", name: "File Storage" },
      { id: "search", name: "Search Service" }
    ]
  };
  
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <h2 className="text-xl font-semibold">Components</h2>
      
      {Object.entries(groups).map(([groupName, groupComponents]) => (
        <div key={groupName}>
          <h3 className="font-medium text-gray-700 mb-3">{groupName}</h3>
          <div className="space-y-2">
            {groupComponents.map((component) => (
              <ComponentRow
                key={component.id}
                name={component.name}
                status={components[component.id]?.status || "operational"}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ComponentRow({ name, status }: { name: string; status: string }) {
  const statusConfig = {
    operational: { icon: "✓", color: "text-green-600" },
    degraded: { icon: "⚠", color: "text-yellow-600" },
    down: { icon: "✗", color: "text-red-600" }
  };
  
  const config = statusConfig[status] || statusConfig.operational;
  
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-gray-800">{name}</span>
      <span className={`flex items-center gap-2 ${config.color} font-medium`}>
        <span>{config.icon}</span>
        <span className="capitalize">{status}</span>
      </span>
    </div>
  );
}

function PerformanceCharts({ metrics }: { metrics: any }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Performance Metrics (Last Hour)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="API Response Time"
          value={`${metrics.apiResponseTime}ms`}
          threshold="500ms"
          status="good"
        />
        <MetricCard
          title="Blockchain Read"
          value={`${metrics.blockchainRead}ms`}
          threshold="2s"
          status="good"
        />
        <MetricCard
          title="Blockchain Write"
          value={`${metrics.blockchainWrite}s`}
          threshold="10s"
          status="good"
        />
        <MetricCard
          title="Page Load (LCP)"
          value={`${metrics.lcp}s`}
          threshold="4s"
          status="good"
        />
      </div>
    </div>
  );
}

function MetricCard({ title, value, threshold, status }: any) {
  return (
    <div className="border rounded-lg p-4">
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-500">P95</div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Threshold: {threshold}
      </div>
      <div className={`mt-2 h-2 rounded-full ${
        status === "good" ? "bg-green-200" : "bg-yellow-200"
      }`}>
        <div className={`h-full rounded-full ${
          status === "good" ? "bg-green-500" : "bg-yellow-500"
        }`} style={{ width: "60%" }} />
      </div>
    </div>
  );
}

function UptimeCalendar({ uptime }: { uptime: any }) {
  // Last 90 days
  const days = Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (89 - i));
    return {
      date,
      uptime: uptime.daily[date.toISOString().split("T")[0]] || 100
    };
  });
  
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Uptime (Last 90 Days)</h2>
        <span className="text-sm text-gray-600">
          {uptime.overall}% uptime
        </span>
      </div>
      
      <div className="grid grid-cols-90 gap-1">
        {days.map((day, i) => (
          <div
            key={i}
            className={`h-3 rounded-sm ${
              day.uptime >= 99 ? "bg-green-500" :
              day.uptime >= 95 ? "bg-yellow-500" :
              "bg-red-500"
            }`}
            title={`${day.date.toLocaleDateString()}: ${day.uptime}%`}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm" />
          <span>99%+ uptime</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
          <span>95-99% uptime</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm" />
          <span>&lt;95% uptime</span>
        </div>
      </div>
    </div>
  );
}

function IncidentHistory({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Incidents</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No incidents in the last 7 days</p>
          <p className="text-sm mt-2">🎉 Great job, team!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Incidents</h2>
      <div className="space-y-4">
        {incidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  );
}

function SubscriptionForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  
  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      await fetch("/api/status/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      setSubscribed(true);
    } catch (error) {
      alert("Failed to subscribe. Please try again.");
    }
  }
  
  if (subscribed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-medium">
          ✓ Successfully subscribed to status updates!
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-2">Subscribe to Updates</h2>
      <p className="text-gray-600 mb-4">
        Get notified about incidents and scheduled maintenance
      </p>
      
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-4 py-2 border rounded-lg"
          required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
```

---

## 📡 Public API

### GET /api/status/public

```typescript
// app/api/status/public/route.ts
import { NextResponse } from "next/server";
import { getSystemStatus } from "@/lib/status";

export const runtime = "edge";
export const revalidate = 30; // Cache for 30 seconds

export async function GET() {
  const status = await getSystemStatus();
  
  return NextResponse.json(status, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60"
    }
  });
}
```

**Response**:
```json
{
  "status": "operational",
  "timestamp": "2025-10-26T05:00:00.000Z",
  "components": {
    "web": { "status": "operational", "latency": 120 },
    "api": { "status": "operational", "latency": 180 },
    "database": { "status": "operational", "latency": 35 },
    "rpc": { "status": "operational", "latency": 420 }
  },
  "metrics": {
    "apiResponseTime": 180,
    "blockchainRead": 420,
    "blockchainWrite": 2.8,
    "lcp": 2.1
  },
  "uptime": {
    "overall": 99.98,
    "last24h": 100,
    "last7d": 99.95,
    "last30d": 99.98
  },
  "incidents": []
}
```

---

## ✅ Implementation Checklist

- [ ] Choose status page solution (Statuspage.io vs custom)
- [ ] Configure components and groups
- [ ] Set up health check integrations
- [ ] Create performance metrics visualization
- [ ] Implement uptime tracking
- [ ] Build incident management system
- [ ] Add email/SMS notification system
- [ ] Deploy to custom domain (status.echain.com)
- [ ] Test all notification workflows
- [ ] Document runbook for status updates

---

## 🔗 Related Documentation

- [Health Check Endpoints](./HEALTH_CHECKS.md)
- [Sentry Configuration](./SENTRY_CONFIGURATION.md)
- [Incident Response Plan](../security/INCIDENT_RESPONSE_PLAN.md)

---

**Status Dashboard Resources**:
- Statuspage.io: https://statuspage.io/
- Cachet: https://cachethq.io/
- Base Status: https://status.base.org/
