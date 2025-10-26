# Monitoring Dashboard Configuration
# ===================================
# Grafana/DataDog/custom dashboard configuration

## Dashboard Overview

This configuration defines the monitoring dashboards for Echain platform.
Compatible with: Grafana, DataDog, New Relic, or custom solutions.

## Metrics to Track

### Application Performance Metrics

```yaml
dashboards:
  - name: "Application Performance"
    panels:
      - title: "Response Time (P50, P95, P99)"
        type: "graph"
        metrics:
          - "http.server.duration{percentile=50}"
          - "http.server.duration{percentile=95}"
          - "http.server.duration{percentile=99}"
        unit: "milliseconds"
        
      - title: "Request Rate"
        type: "graph"
        metrics:
          - "http.server.requests.count"
        unit: "req/s"
        
      - title: "Error Rate"
        type: "graph"
        metrics:
          - "http.server.errors.rate"
        unit: "percent"
        thresholds:
          warning: 1  # 1% error rate
          critical: 5  # 5% error rate
```

### Blockchain Performance

```yaml
  - name: "Blockchain Operations"
    panels:
      - title: "Transaction Processing Time"
        type: "graph"
        metrics:
          - "blockchain.transaction.duration{op=purchase}"
          - "blockchain.transaction.duration{op=create_event}"
          - "blockchain.transaction.duration{op=claim_poap}"
        unit: "seconds"
        thresholds:
          warning: 5   # 5 seconds
          critical: 10  # 10 seconds
          
      - title: "Contract Call Success Rate"
        type: "stat"
        metrics:
          - "blockchain.contract.success.rate"
        unit: "percent"
        thresholds:
          critical: 95  # Alert if below 95%
          
      - title: "RPC Provider Health"
        type: "status"
        metrics:
          - "rpc.provider.health{provider=chainstack}"
          - "rpc.provider.health{provider=spectrum}"
          - "rpc.provider.health{provider=coinbase}"
        
      - title: "Gas Usage"
        type: "graph"
        metrics:
          - "blockchain.gas.used"
        unit: "gwei"
```

### Web Vitals

```yaml
  - name: "User Experience"
    panels:
      - title: "Largest Contentful Paint (LCP)"
        type: "graph"
        metrics:
          - "webvital.lcp{percentile=75}"
        unit: "milliseconds"
        thresholds:
          good: 2500
          needs_improvement: 4000
          
      - title: "First Input Delay (FID)"
        type: "graph"
        metrics:
          - "webvital.fid{percentile=75}"
        unit: "milliseconds"
        thresholds:
          good: 100
          needs_improvement: 300
          
      - title: "Cumulative Layout Shift (CLS)"
        type: "graph"
        metrics:
          - "webvital.cls{percentile=75}"
        thresholds:
          good: 0.1
          needs_improvement: 0.25
          
      - title: "Time to First Byte (TTFB)"
        type: "graph"
        metrics:
          - "webvital.ttfb{percentile=75}"
        unit: "milliseconds"
        thresholds:
          good: 800
          needs_improvement: 1800
```

## Alert Definitions

### Critical Alerts

```yaml
alerts:
  - name: "High Error Rate"
    condition: "errors.rate > 5%"
    duration: "5m"
    severity: "critical"
    channels: ["slack", "pagerduty", "email"]
    
  - name: "RPC Provider Down"
    condition: "rpc.provider.health == 0"
    duration: "1m"
    severity: "critical"
    channels: ["slack", "pagerduty"]
    
  - name: "Contract Call Failure Spike"
    condition: "blockchain.contract.failures > 10"
    duration: "5m"
    severity: "critical"
    channels: ["slack", "email"]
```

## Query Examples

### Grafana PromQL

```promql
# Average response time
avg(http_request_duration_seconds{job="echain-frontend"}) by (route)

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Transaction success rate
sum(rate(blockchain_transaction_total{status="success"}[5m])) / sum(rate(blockchain_transaction_total[5m]))
```

## Status Page Integration

Public status page: https://status.echain.xyz
- Real-time system status
- Incident history
- Scheduled maintenance
