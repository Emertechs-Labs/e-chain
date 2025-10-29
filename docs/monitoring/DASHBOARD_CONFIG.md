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
        unit: "score"
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

### Infrastructure Metrics

```yaml
  - name: "Infrastructure Health"
    panels:
      - title: "CPU Usage"
        type: "graph"
        metrics:
          - "system.cpu.usage{service=api}"
          - "system.cpu.usage{service=blockchain-indexer}"
          - "system.cpu.usage{service=frontend}"
        unit: "percent"
        thresholds:
          warning: 70
          critical: 85
          
      - title: "Memory Usage"
        type: "graph"
        metrics:
          - "system.memory.usage{service=api}"
          - "system.memory.usage{service=blockchain-indexer}"
          - "system.memory.usage{service=frontend}"
        unit: "percent"
        thresholds:
          warning: 75
          critical: 90
          
      - title: "Disk Usage"
        type: "graph"
        metrics:
          - "system.disk.usage{service=api}"
          - "system.disk.usage{service=blockchain-indexer}"
          - "system.disk.usage{service=database}"
        unit: "percent"
        thresholds:
          warning: 80
          critical: 90
          
      - title: "Network Traffic"
        type: "graph"
        metrics:
          - "system.network.in.bytes"
          - "system.network.out.bytes"
        unit: "bytes/sec"
```

### Business Metrics

```yaml
  - name: "Business KPIs"
    panels:
      - title: "Active Users (DAU/WAU/MAU)"
        type: "graph"
        metrics:
          - "business.users.active.daily"
          - "business.users.active.weekly"
          - "business.users.active.monthly"
        unit: "count"
        
      - title: "New User Registrations"
        type: "graph"
        metrics:
          - "business.users.new"
        unit: "count/day"
        
      - title: "Transaction Volume"
        type: "graph"
        metrics:
          - "business.transactions.volume"
        unit: "count"
        
      - title: "Revenue"
        type: "graph"
        metrics:
          - "business.revenue.daily"
        unit: "USD"
```

## Dashboard Implementation Guide

### Setup Instructions

1. **Prerequisites**:
   - Grafana v9.5+ or DataDog account
   - Prometheus for metrics collection
   - OpenTelemetry collector configured

2. **Installation Steps**:

   ```bash
   # Deploy Grafana using Helm
   helm repo add grafana https://grafana.github.io/helm-charts
   helm install grafana grafana/grafana -f grafana-values.yaml
   
   # Deploy Prometheus
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm install prometheus prometheus-community/prometheus -f prometheus-values.yaml
   ```

3. **Dashboard Import**:
   - Navigate to Grafana UI (default: http://localhost:3000)
   - Go to Dashboards > Import
   - Upload the JSON files from `/monitoring/dashboards/`

### Metric Collection Configuration

1. **Application Metrics**:
   - Instrument your application with OpenTelemetry SDK
   - Configure the OpenTelemetry collector to scrape metrics

   ```yaml
   # otel-collector-config.yaml
   receivers:
     otlp:
       protocols:
         grpc:
           endpoint: 0.0.0.0:4317
         http:
           endpoint: 0.0.0.0:4318
   
   processors:
     batch:
       timeout: 1s
   
   exporters:
     prometheus:
       endpoint: 0.0.0.0:8889
   
   service:
     pipelines:
       metrics:
         receivers: [otlp]
         processors: [batch]
         exporters: [prometheus]
   ```

2. **Infrastructure Metrics**:
   - Deploy node_exporter on each server
   - Configure Prometheus to scrape node_exporter endpoints

3. **Web Vitals Collection**:
   - Implement web-vitals JS library in frontend
   - Send metrics to backend API endpoint
   - Forward to OpenTelemetry collector

### Alert Configuration

1. **Setup Alert Rules**:
   - Navigate to Alerting > Alert Rules in Grafana
   - Create rules based on thresholds defined in dashboards
   - Configure notification channels (Slack, Email, PagerDuty)

2. **Example Alert Rule**:

   ```yaml
   # High Error Rate Alert
   name: HighErrorRate
   expr: http_server_errors_rate > 5
   for: 5m
   labels:
     severity: critical
   annotations:
     summary: "High error rate detected"
     description: "Error rate is {{ $value }}%, which exceeds the critical threshold (5%)"
   ```

### Dashboard Maintenance

1. **Regular Updates**:
   - Review dashboard performance monthly
   - Add new metrics as features are developed
   - Adjust thresholds based on operational experience

2. **Version Control**:
   - Export dashboard JSON files to `/monitoring/dashboards/`
   - Commit changes to version control
   - Document significant changes in CHANGELOG.md

3. **Access Control**:
   - Configure read-only access for developers
   - Admin access for DevOps team
   - Viewer access for stakeholders

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
