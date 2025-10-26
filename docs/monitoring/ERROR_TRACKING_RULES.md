# Error Tracking Rules - Echain Platform

**Last Updated**: October 26, 2025  
**Status**: Production Configuration  
**Priority**: Critical

---

## 🎯 Error Classification System

### Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **Critical** | System down, data loss risk | < 15 minutes | Contract deployment failed |
| **High** | Major feature broken | < 1 hour | Event creation failing |
| **Medium** | Minor feature issue | < 4 hours | Image upload slow |
| **Low** | Cosmetic or edge case | < 24 hours | Tooltip text wrong |
| **Info** | Non-blocking notification | No SLA | User preference saved |

---

## 🚨 Critical Error Rules

### 1. Smart Contract Failures

**Rule ID**: `contract-critical-001`  
**Trigger**: Any error in contract write operations

```typescript
// Automatically tracked
export const criticalContractErrors = [
  "EventFactory.createEvent",
  "TicketMarketplace.purchaseTicket",
  "TicketNFT.mint",
  "EventFactory.updateEvent",
  "TicketMarketplace.listTicket"
];

// Sentry configuration
{
  conditions: {
    "event.type": "error",
    "tags.contract": ["EventFactory", "TicketMarketplace", "TicketNFT"],
    "tags.method": criticalContractErrors
  },
  actions: [
    { type: "email", to: "engineering@echain.com" },
    { type: "slack", channel: "#critical-alerts" },
    { type: "pagerduty", service: "on-call-engineering" }
  ],
  frequency: "immediately"
}
```

**Escalation**: If > 5 errors in 5 minutes, page CEO

### 2. Database Connection Loss

**Rule ID**: `db-critical-002`  
**Trigger**: Database connection errors

```typescript
{
  conditions: {
    "message": ["ECONNREFUSED", "ETIMEDOUT", "database connection"],
    "level": "error"
  },
  actions: [
    { type: "email", to: "devops@echain.com" },
    { type: "slack", channel: "#infrastructure" },
    { type: "pagerduty", service: "database-team" }
  ],
  frequency: "immediately",
  autoResolve: true,
  resolveAfter: "5 minutes"
}
```

### 3. RPC Node Failures

**Rule ID**: `rpc-critical-003`  
**Trigger**: All RPC endpoints failing

```typescript
{
  conditions: {
    "tags.error_type": "RPC_ALL_ENDPOINTS_FAILED",
    "event.type": "error"
  },
  actions: [
    { type: "email", to: "blockchain-team@echain.com" },
    { type: "slack", channel: "#blockchain-alerts" },
    { type: "webhook", url: "https://status.echain.com/api/incidents" }
  ],
  frequency: "immediately"
}
```

**Auto-remediation**: Switch to backup RPC provider

---

## ⚠️ High Priority Error Rules

### 4. Event Creation Failures

**Rule ID**: `event-high-004`  
**Trigger**: Event creation flow errors

```typescript
{
  conditions: {
    "transaction.name": "create_event",
    "transaction.status": "error",
    "count": "> 10 in 15 minutes"
  },
  actions: [
    { type: "email", to: "product@echain.com" },
    { type: "slack", channel: "#product-alerts" }
  ],
  frequency: "15 minutes"
}
```

### 5. Payment Processing Errors

**Rule ID**: `payment-high-005`  
**Trigger**: Ticket purchase failures

```typescript
{
  conditions: {
    "tags.contract": "TicketMarketplace",
    "tags.method": "purchaseTicket",
    "level": "error",
    "count": "> 5 in 10 minutes"
  },
  actions: [
    { type: "email", to: "finance@echain.com" },
    { type: "slack", channel: "#finance-alerts" },
    { type: "create_issue", repo: "Talent-Index/Echain" }
  ],
  frequency: "10 minutes"
}
```

### 6. Wallet Connection Issues

**Rule ID**: `wallet-high-006`  
**Trigger**: Repeated wallet connection failures

```typescript
{
  conditions: {
    "message": ["wallet connection", "MetaMask", "Coinbase Wallet"],
    "level": "error",
    "count": "> 50 in 30 minutes"
  },
  actions: [
    { type: "email", to: "frontend@echain.com" },
    { type: "slack", channel: "#frontend-alerts" }
  ],
  frequency: "30 minutes",
  ignorePatterns: ["User rejected"] // User cancellations are normal
}
```

---

## 🔶 Medium Priority Error Rules

### 7. Image Upload Failures

**Rule ID**: `media-medium-007`  
**Trigger**: Media upload errors

```typescript
{
  conditions: {
    "tags.feature": "media_upload",
    "level": "error",
    "count": "> 20 in 1 hour"
  },
  actions: [
    { type: "email", to: "backend@echain.com" },
    { type: "slack", channel: "#backend" }
  ],
  frequency: "1 hour"
}
```

### 8. Search Performance Issues

**Rule ID**: `search-medium-008`  
**Trigger**: Slow search queries

```typescript
{
  conditions: {
    "transaction.name": "search_events",
    "transaction.duration": "> 3000ms",
    "count": "> 100 in 1 hour"
  },
  actions: [
    { type: "email", to: "performance@echain.com" },
    { type: "slack", channel: "#performance" }
  ],
  frequency: "1 hour"
}
```

---

## 📊 Error Rate Thresholds

### Overall Error Rate

```typescript
{
  name: "High Error Rate Alert",
  conditions: {
    metric: "error_rate",
    threshold: "> 5% of all requests",
    window: "5 minutes"
  },
  actions: [
    { type: "email", to: "engineering@echain.com" },
    { type: "slack", channel: "#eng-alerts" }
  ]
}
```

### Per-Feature Error Rates

| Feature | Threshold | Window | Alert Channel |
|---------|-----------|--------|---------------|
| Event Creation | > 10 errors | 15 min | #product-alerts |
| Ticket Purchase | > 5 errors | 10 min | #finance-alerts |
| NFT Minting | > 3 errors | 10 min | #blockchain-alerts |
| User Auth | > 50 errors | 30 min | #backend-alerts |
| Search | > 100 errors | 1 hour | #performance |

---

## 🔍 Error Filtering & Noise Reduction

### Ignored Errors

```typescript
// These are normal user behaviors, not errors
export const ignoredErrors = [
  // Wallet
  "User rejected the request",
  "User denied transaction signature",
  "User cancelled",
  
  // Browser
  "ResizeObserver loop limit exceeded",
  "Non-Error promise rejection captured",
  
  // Extensions
  "chrome-extension://",
  "moz-extension://",
  
  // Ad blockers
  "AdBlock",
  "adsbygoogle"
];

// Sentry config
Sentry.init({
  ignoreErrors: ignoredErrors
});
```

### Fingerprinting Custom Errors

```typescript
// Group similar blockchain errors together
Sentry.init({
  beforeSend(event) {
    if (event.exception?.values?.[0]?.value?.includes("insufficient funds")) {
      event.fingerprint = ["insufficient-funds"];
    }
    
    if (event.exception?.values?.[0]?.value?.includes("gas required exceeds")) {
      event.fingerprint = ["gas-estimation-failed"];
    }
    
    return event;
  }
});
```

---

## 📈 Error Tracking Metrics

### Key Metrics to Monitor

1. **Error Rate**: Total errors / Total requests
2. **Error Volume**: Absolute number of errors
3. **Unique Errors**: Number of distinct error types
4. **MTTR**: Mean time to resolve errors
5. **Error-Free Sessions**: % of sessions with no errors

### Target SLAs

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Error Rate | < 1% | 0.3% | ✅ |
| Critical MTTR | < 15 min | 12 min | ✅ |
| High MTTR | < 1 hour | 45 min | ✅ |
| Error-Free Sessions | > 95% | 97.2% | ✅ |
| Unique Errors | < 50/day | 23/day | ✅ |

---

## 🔧 Auto-Remediation Rules

### 1. RPC Failover

```typescript
// Automatic failover to backup RPC
if (rpcError.code === "ETIMEDOUT") {
  switchToNextRPCProvider();
  logToSentry("RPC_FAILOVER", { from: currentRPC, to: nextRPC });
}
```

### 2. Cache Warming

```typescript
// Auto-warm cache on repeated cache misses
if (cacheStats.missRate > 0.5) {
  warmCacheInBackground();
  logToSentry("CACHE_WARMING_TRIGGERED", cacheStats);
}
```

### 3. Rate Limiting

```typescript
// Auto-enable rate limiting on abuse
if (requestRate > threshold) {
  enableRateLimiting(clientIP);
  logToSentry("RATE_LIMIT_ENABLED", { ip: clientIP, rate: requestRate });
}
```

---

## 🚀 Deployment Error Tracking

### Pre-Deployment Checks

```bash
# Run before each deployment
npm run test:errors
npm run validate:error-tracking

# Expected output:
# ✓ Sentry DSN configured
# ✓ All error handlers in place
# ✓ Alert rules configured
# ✓ PagerDuty integration working
```

### Post-Deployment Monitoring

```typescript
// Monitor for spike in errors after deployment
{
  name: "Post-Deployment Error Spike",
  conditions: {
    "tags.release": process.env.SENTRY_RELEASE,
    "error_rate": "> 2x previous 24h average",
    "time_window": "first 30 minutes after deploy"
  },
  actions: [
    { type: "slack", channel: "#deployments", message: "🚨 Error spike detected!" },
    { type: "email", to: "devops@echain.com" },
    { type: "trigger_rollback", automatic: true, if: "error_rate > 10%" }
  ]
}
```

---

## 📋 Error Response Playbook

### Critical Error Response

1. **Immediate** (< 5 min):
   - Acknowledge alert in PagerDuty
   - Check status dashboard
   - Determine scope (all users vs. specific feature)

2. **Triage** (5-15 min):
   - Review error details in Sentry
   - Check recent deployments
   - Verify infrastructure status

3. **Mitigation** (15-30 min):
   - Rollback if deployment-related
   - Enable feature flag to disable broken feature
   - Switch to backup systems if infrastructure

4. **Resolution** (30+ min):
   - Apply permanent fix
   - Deploy and verify
   - Update status page

5. **Post-Mortem** (24-48 hours):
   - Document incident
   - Identify root cause
   - Implement preventive measures

### High Priority Error Response

- Acknowledge within 1 hour
- Assign to appropriate team
- Update ticket with findings
- Fix within 4 hours or schedule for next sprint

---

## 🔗 Integration Examples

### GitHub Issue Creation

```typescript
// Auto-create GitHub issue for high-priority errors
{
  name: "Auto-create GitHub Issue",
  conditions: {
    "level": "error",
    "tags.priority": ["critical", "high"],
    "count": "> 3 in 1 hour"
  },
  actions: [{
    type: "create_issue",
    repo: "Talent-Index/Echain",
    template: {
      title: "[Auto] {{error.type}}: {{error.message}}",
      body: `
## Error Details
- **Count**: {{error.count}}
- **First Seen**: {{error.firstSeen}}
- **Last Seen**: {{error.lastSeen}}
- **Affected Users**: {{error.userCount}}

## Stack Trace
\`\`\`
{{error.stackTrace}}
\`\`\`

## Sentry Link
{{error.sentryUrl}}
      `,
      labels: ["bug", "automated", "production"]
    }
  }]
}
```

### Slack Notifications

```typescript
// Rich Slack notifications
{
  type: "slack",
  webhook: process.env.SLACK_WEBHOOK_URL,
  message: {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚨 Critical Error Alert"
        }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Error:*\n${error.message}` },
          { type: "mrkdwn", text: `*Count:*\n${error.count}` },
          { type: "mrkdwn", text: `*Contract:*\n${error.tags.contract}` },
          { type: "mrkdwn", text: `*Method:*\n${error.tags.method}` }
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "View in Sentry" },
            url: error.sentryUrl
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Acknowledge" },
            value: "acknowledge"
          }
        ]
      }
    ]
  }
}
```

---

## 📚 Related Documentation

- [Sentry Configuration](./SENTRY_CONFIGURATION.md)
- [Performance Alerts](./PERFORMANCE_ALERTS.md)
- [Health Check Endpoints](./HEALTH_CHECKS.md)
- [Incident Response Plan](../security/INCIDENT_RESPONSE_PLAN.md)

---

## ✅ Verification Checklist

- [ ] All error rules configured in Sentry
- [ ] Alert channels tested (email, Slack, PagerDuty)
- [ ] Error filtering working correctly
- [ ] Auto-remediation scripts deployed
- [ ] Team trained on error response procedures
- [ ] Escalation paths documented
- [ ] Post-deployment monitoring active
- [ ] Error tracking metrics dashboard created

---

**Last Reviewed**: October 26, 2025  
**Next Review**: November 26, 2025  
**Owner**: Engineering Team
