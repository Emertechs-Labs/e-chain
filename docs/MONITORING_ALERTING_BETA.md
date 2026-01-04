# Echain Monitoring & Alerting Setup

**Version**: 1.0
**Last Updated**: October 27, 2025
**Platform**: Web3 Event Platform on Base Sepolia

## Overview

This document outlines the monitoring and alerting configuration for the Echain platform, ensuring 24/7 visibility into system health, performance, and security.

## Health Check Endpoints

### Primary Health Check
**URL**: `https://echain-eight.vercel.app/api/health`
**Method**: GET
**Expected Response**: HTTP 200 (healthy) or 503 (issues)

**Response Format**:
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2025-10-27T10:00:00.000Z",
  "uptime": 3600,
  "version": "abc123...",
  "environment": "production",
  "checks": {
    "environment": {
      "status": "healthy",
      "message": "All required environment variables present",
      "responseTime": 5,
      "lastChecked": "2025-10-27T10:00:00.000Z"
    },
    "rpcProvider": {
      "status": "healthy",
      "message": "RPC provider accessible",
      "responseTime": 150,
      "lastChecked": "2025-10-27T10:00:00.000Z"
    },
    "contracts": {
      "status": "healthy",
      "message": "Contract configuration valid",
      "responseTime": 2,
      "lastChecked": "2025-10-27T10:00:00.000Z"
    }
  }
}
```

## Monitoring Tools Configuration

### Vercel Analytics
**Status**: ✅ Configured
**Dashboard**: Vercel Dashboard > Analytics
**Metrics**:
- Page views and unique visitors
- Core Web Vitals (FCP, LCP, CLS, FID, TTFB)
- Real User Monitoring (RUM)
- Error tracking

### Sentry Error Tracking
**Status**: ✅ Configured
**Dashboard**: https://sentry.io/projects/echain
**Configuration**:
- Client-side error tracking
- Server-side error tracking
- Edge runtime error tracking
- Performance monitoring
- Release tracking

**Alert Rules**:
1. **Critical Errors**: Any unhandled error in production
2. **Performance Issues**: Slow transactions (>5s)
3. **Webhook Failures**: Discord/email notification failures
4. **Contract Interaction Errors**: Failed blockchain calls

## Blockchain Monitoring

### Contract Event Monitoring
**Status**: 🔧 Needs Implementation
**Required Events to Monitor**:

#### EventFactory Contract
- `EventCreated`: New event creation
- `EventUpdated`: Event modifications
- `OwnershipTransferred`: Contract ownership changes

#### EventTicket Contract
- `Transfer`: Ticket NFT transfers
- `TicketPurchased`: Successful ticket sales
- `TicketRefunded`: Refund transactions

#### POAPAttendance Contract
- `POAPClaimed`: Attendance token claims
- `POAPTransferred`: POAP token transfers

#### IncentiveManager Contract
- `RewardClaimed`: User reward claims
- `ReferralBonus`: Referral bonus distributions

### RPC Provider Monitoring
**Current Setup**: Multi-provider failover
**Providers**:
1. Chainstack (Primary)
2. Coinbase (Secondary)
3. Spectrum (Tertiary)
4. Base Official (Fallback)

**Monitoring Points**:
- Response time (<500ms target)
- Success rate (>99.9% target)
- Error rate tracking
- Automatic failover triggers

## Uptime Monitoring Setup

### Recommended External Monitors

#### UptimeRobot (Free Tier)
**Monitors to Create**:
1. **Main Application**: `https://echain-eight.vercel.app`
   - Monitoring interval: 5 minutes
   - Alert on: 2 consecutive failures

2. **Health Check API**: `https://echain-eight.vercel.app/api/health`
   - Monitoring interval: 5 minutes
   - Alert on: 2 consecutive failures

3. **Beta Registration**: `https://echain-eight.vercel.app/beta-registration`
   - Monitoring interval: 15 minutes
   - Alert on: 3 consecutive failures

#### Status Page Setup
**Recommended**: Use Statuspage.io or similar
**Components to Monitor**:
- Web Application
- API Endpoints
- Wallet Integration
- Blockchain Connectivity
- Database (if applicable)

## Alert Configuration

### Discord Webhooks
**Status**: ✅ Configured for beta feedback
**Channels**:
- `#beta-feedback`: User feedback and bug reports
- `#alerts-critical`: System alerts and outages
- `#alerts-performance`: Performance degradation

### Email Alerts
**Status**: 🔧 Needs Configuration
**Recipients**:
- Dev team: dev@echain.com
- Product: product@echain.com
- Security: security@echain.com

**Alert Types**:
- System downtime (>5 minutes)
- High error rates (>5% in 5 minutes)
- Security incidents
- Performance degradation

## Performance Monitoring

### Core Web Vitals Targets
- **FCP** (First Contentful Paint): <1.5s
- **LCP** (Largest Contentful Paint): <2.5s
- **CLS** (Cumulative Layout Shift): <0.1
- **FID** (First Input Delay): <100ms
- **TTFB** (Time to First Byte): <600ms

### Custom Metrics
- **Transaction Success Rate**: >99%
- **Wallet Connection Time**: <3s
- **Event Load Time**: <2s
- **Ticket Purchase Completion**: <10s

## Security Monitoring

### Rate Limiting Alerts
- Per-endpoint rate limit violations
- Suspicious IP patterns
- Failed authentication attempts

### Contract Security
- Monitor for unusual contract interactions
- Alert on failed transactions
- Track gas usage patterns

## Incident Response

### Alert Escalation
1. **Level 1**: Discord alerts (immediate)
2. **Level 2**: Email alerts (5 minutes)
3. **Level 3**: Phone/SMS (15 minutes, critical only)

### Response Times
- **Critical**: <15 minutes
- **High**: <1 hour
- **Medium**: <4 hours
- **Low**: <24 hours

## Logging Configuration

### Application Logs
**Levels**: ERROR, WARN, INFO, DEBUG
**Retention**: 30 days
**Storage**: Vercel logs + external aggregation

### Blockchain Logs
**Events**: All contract events
**Storage**: The Graph protocol (future)
**Retention**: Permanent (on-chain)

## Dashboard Setup

### Vercel Dashboard
- Real-time metrics
- Deployment status
- Error tracking
- Performance insights

### Sentry Dashboard
- Error grouping and trends
- Performance metrics
- Release tracking
- User impact analysis

### Custom Dashboard (Future)
- Contract interaction metrics
- User engagement stats
- Revenue tracking
- System health overview

## Beta Monitoring Priorities

### Week 1 Focus
- Application uptime and response times
- Wallet connection success rates
- Event creation/purchase flows
- User feedback collection

### Week 2-4 Focus
- Performance optimization
- Error rate reduction
- User engagement metrics
- Feature usage analytics

## Implementation Checklist

### Immediate (This Week)
- [x] Health check endpoint active
- [x] Sentry error tracking configured
- [x] Vercel Analytics enabled
- [ ] Set up UptimeRobot monitoring
- [ ] Configure Discord alert webhooks
- [ ] Create status page

### Short Term (Next 2 Weeks)
- [ ] Implement contract event monitoring
- [ ] Set up performance alerting
- [ ] Configure email notifications
- [ ] Create incident response playbook

### Long Term (Beta Phase)
- [ ] Implement The Graph indexing
- [ ] Set up advanced analytics
- [ ] Create custom monitoring dashboard
- [ ] Implement predictive alerting

## Contact Information

**Monitoring Setup**: dev@echain.com
**Incident Response**: oncall@echain.com
**Security Issues**: security@echain.com

---

*This monitoring setup ensures comprehensive visibility into the Echain platform's health and performance during the beta phase.*