# Sentry Configuration for Echain Platform

**Last Updated**: October 26, 2025  
**Status**: Production Ready  
**Official Documentation**: https://docs.sentry.io/platforms/javascript/guides/nextjs/

---

## 🎯 Overview

Comprehensive error tracking and performance monitoring configuration for the Echain platform using Sentry on Base network.

**Sentry Features**:
- Real-time error tracking
- Performance monitoring
- Release tracking
- User feedback
- Custom tags and context

**Official Resources**:
- Sentry Next.js Guide: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Sentry Performance: https://docs.sentry.io/product/performance/
- Sentry Alerts: https://docs.sentry.io/product/alerts/

---

## 📦 Installation

### 1. Install Sentry SDK

```bash
cd frontend
npm install --save @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Reference**: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

### 2. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://[YOUR_KEY]@[YOUR_ORG].ingest.sentry.io/[PROJECT_ID]
SENTRY_ORG=echain
SENTRY_PROJECT=echain-frontend
SENTRY_AUTH_TOKEN=[YOUR_AUTH_TOKEN]

# Optional
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0-beta
```

**Get DSN**: https://sentry.io/settings/[YOUR_ORG]/projects/[PROJECT]/keys/

---

## ⚙️ Configuration Files

### sentry.client.config.ts

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Session Replay
  // Replay sampling lives inside `replayIntegration` (see above)
  // Profiling is enabled via `browserProfilingIntegration`
  
  environment: process.env.SENTRY_ENVIRONMENT || "production",
  release: process.env.SENTRY_RELEASE,
  
  // Integrations
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: [
        "localhost",
        /^https:\/\/.*\.vercel\.app/,
        /^https:\/\/echain\.com/
      ],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
    new Sentry.BrowserProfilingIntegration(),
  ],
  
  // Filter out noise
  ignoreErrors: [
    // Browser extensions
    "Non-Error promise rejection captured",
    // Wallet connection errors (expected)
    "User rejected the request",
    "MetaMask",
  ],
  
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    
    // Add custom context
    event.tags = {
      ...event.tags,
      network: "base-sepolia",
    };
    
    return event;
  },
});
```

**Reference**: https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/

### sentry.server.config.ts

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.SENTRY_ENVIRONMENT || "production",
  release: process.env.SENTRY_RELEASE,
  
  // Server-specific config
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
});
```

### sentry.edge.config.ts

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.SENTRY_ENVIRONMENT || "production",
});
```

### next.config.js Integration

```javascript
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // ... your existing config
};

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "echain",
    project: "echain-frontend",
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }
);
```

**Reference**: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#configure-nextconfigjs

---

## 🎯 Custom Context & Tags

### Smart Contract Interactions

```typescript
// frontend/lib/sentry-helpers.ts
import * as Sentry from "@sentry/nextjs";

export function captureContractError(
  error: Error,
  contractName: string,
  method: string,
  params?: Record<string, any>
) {
  Sentry.withScope((scope) => {
    scope.setTag("contract", contractName);
    scope.setTag("method", method);
    scope.setContext("contract_params", params || {});
    scope.setLevel("error");
    Sentry.captureException(error);
  });
}

export function captureTransaction(
  name: string,
  op: string,
  data?: Record<string, any>
) {
  const transaction = Sentry.startTransaction({ name, op });
  
  if (data) {
    transaction.setData("custom_data", data);
  }
  
  return transaction;
}
```

### Usage in Components

```typescript
// frontend/app/events/create/page.tsx
import { captureContractError, captureTransaction } from "@/lib/sentry-helpers";

async function createEvent(data: EventData) {
  const transaction = captureTransaction(
    "create_event",
    "contract.write",
    { eventName: data.title }
  );
  
  try {
    const tx = await eventFactoryContract.createEvent(data);
    await tx.wait();
    transaction.setStatus("ok");
  } catch (error) {
    captureContractError(
      error as Error,
      "EventFactory",
      "createEvent",
      data
    );
    transaction.setStatus("error");
    throw error;
  } finally {
    transaction.finish();
  }
}
```

---

## 📊 Performance Monitoring

### Custom Instrumentation

```typescript
// frontend/lib/performance.ts
import * as Sentry from "@sentry/nextjs";

export async function measureBlockchainRead<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = Sentry.startTransaction({
    name: `blockchain.read.${name}`,
    op: "blockchain.read",
  });
  
  try {
    const result = await fn();
    transaction.setStatus("ok");
    return result;
  } catch (error) {
    transaction.setStatus("error");
    throw error;
  } finally {
    transaction.finish();
  }
}

export async function measureBlockchainWrite<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = Sentry.startTransaction({
    name: `blockchain.write.${name}`,
    op: "blockchain.write",
  });
  
  try {
    const result = await fn();
    transaction.setStatus("ok");
    return result;
  } catch (error) {
    transaction.setStatus("error");
    throw error;
  } finally {
    transaction.finish();
  }
}
```

**Reference**: https://docs.sentry.io/platforms/javascript/performance/instrumentation/custom-instrumentation/

---

## 🚨 Alert Rules Configuration

### Critical Errors

```yaml
# Sentry Alert Rule: Critical Contract Errors
Name: Critical Smart Contract Errors
Conditions:
  - Event type: error
  - Tags: contract = EventFactory OR TicketMarketplace
  - Level: error
Frequency: Immediately
Actions:
  - Send to: engineering-team@echain.com
  - Slack: #eng-alerts
  - Create GitHub Issue
```

### Performance Degradation

```yaml
# Sentry Alert Rule: Slow Blockchain Reads
Name: Slow Blockchain Operations
Conditions:
  - Transaction duration > 5000ms
  - Operation: blockchain.read OR blockchain.write
Frequency: 15 minutes
Actions:
  - Send to: devops@echain.com
  - Slack: #performance
```

### High Error Rate

```yaml
# Sentry Alert Rule: Error Rate Spike
Name: Error Rate Above Threshold
Conditions:
  - Error count > 100 in 10 minutes
Frequency: 10 minutes
Actions:
  - PagerDuty: on-call-engineer
  - Slack: #incidents
  - Email: team@echain.com
```

**Setup Alerts**: https://sentry.io/organizations/[YOUR_ORG]/alerts/rules/

---

## 🔍 Source Maps & Releases

### Upload Source Maps

```json
{
  "scripts": {
    "build": "next build && sentry-cli sourcemaps upload --org=echain --project=echain-frontend .next/static"
  }
}
```

### Create Release

```bash
# During deployment
export SENTRY_RELEASE=$(git rev-parse --short HEAD)
sentry-cli releases new $SENTRY_RELEASE
sentry-cli releases set-commits $SENTRY_RELEASE --auto
sentry-cli releases finalize $SENTRY_RELEASE
sentry-cli releases deploys $SENTRY_RELEASE new -e production
```

**Reference**: https://docs.sentry.io/product/cli/releases/

---

## 📈 Dashboards

### Custom Dashboard Widgets

1. **Error Rate by Contract**
   - Type: Line chart
   - Query: `event.type:error` grouped by `contract` tag

2. **Transaction Success Rate**
   - Type: Number
   - Query: Success rate of `blockchain.write` operations

3. **Average Response Time**
   - Type: Area chart
   - Query: P95 of all transactions by operation

4. **Top Errors**
   - Type: Table
   - Query: Top 10 errors by count

**Create Dashboard**: https://sentry.io/organizations/[YOUR_ORG]/dashboards/

---

## 🧪 Testing Sentry Integration

```typescript
// Test error capture
import * as Sentry from "@sentry/nextjs";

// Test in browser console
Sentry.captureException(new Error("Test Sentry Integration"));

// Test with message
Sentry.captureMessage("Test message", "info");

// Test performance
const transaction = Sentry.startTransaction({ name: "test", op: "test" });
setTimeout(() => transaction.finish(), 1000);
```

---

## 🔐 Security & Privacy

### PII Filtering

```typescript
Sentry.init({
  beforeSend(event) {
    // Remove wallet addresses
    if (event.user?.id && event.user.id.startsWith("0x")) {
      event.user.id = "***REDACTED***";
    }
    
    // Remove email from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(crumb => ({
        ...crumb,
        data: sanitizeData(crumb.data),
      }));
    }
    
    return event;
  },
});
```

**Reference**: https://docs.sentry.io/platforms/javascript/data-management/sensitive-data/

---

## 📚 Best Practices

1. **Tag Consistently**: Use standard tags (environment, contract, network)
2. **Set User Context**: Help identify affected users
3. **Add Breadcrumbs**: Track user actions leading to errors
4. **Monitor Performance**: Track key user flows
5. **Review Regularly**: Check Sentry weekly for trends
6. **Clean Up**: Archive resolved issues monthly

**Best Practices Guide**: https://docs.sentry.io/product/best-practices/

---

## 🔗 Related Documentation

- [Error Tracking Rules](./ERROR_TRACKING_RULES.md)
- [Performance Alerts](./PERFORMANCE_ALERTS.md)
- [Health Check Endpoints](./HEALTH_CHECKS.md)
- [Status Dashboard](./STATUS_DASHBOARD.md)

---

## ✅ Verification Checklist

- [ ] Sentry SDK installed and configured
- [ ] DSN and environment variables set
- [ ] Source maps uploading correctly
- [ ] Custom tags and context working
- [ ] Alert rules configured
- [ ] Dashboard created
- [ ] PII filtering tested
- [ ] Team notifications configured
- [ ] Integration tested in staging
- [ ] Documentation reviewed

---

**Official Sentry Resources**:
- Main Docs: https://docs.sentry.io/
- Next.js Guide: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Performance: https://docs.sentry.io/product/performance/
- Alerts: https://docs.sentry.io/product/alerts/
- Releases: https://docs.sentry.io/product/releases/
