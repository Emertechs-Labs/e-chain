# Production Environment Setup Guide

## Overview
This guide covers the production deployment setup for Echain with Farcaster integration, including environment configuration, security settings, and monitoring setup.

## Environment Variables

### Required Production Environment Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Blockchain RPC
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key

# Farcaster Auth Kit
NEXT_PUBLIC_FARCASTER_RELAY=https://relay.farcaster.xyz
NEXT_PUBLIC_FARCASTER_RPC_URL=https://mainnet.optimism.io
FARCASTER_DOMAIN=yourdomain.com
FARCASTER_SIWE_URI=https://yourdomain.com

# Coinbase Onchain Kit
NEXT_PUBLIC_COINBASE_PROJECT_ID=your_coinbase_project_id
COINBASE_API_KEY=your_coinbase_api_key

# Pinata (IPFS)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud

# Monitoring & Security
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
SECURITY_WEBHOOK_URL=https://hooks.slack.com/your/security/webhook

# Analytics
VERCEL_ANALYTICS_ID=your_vercel_analytics_id
```

### Environment-Specific Configurations

#### Production (`NODE_ENV=production`)
- Enable all security headers
- Use production RPC endpoints
- Enable comprehensive logging
- Set strict CSP policies

#### Staging (`NODE_ENV=staging`)
- Similar to production but with test data
- Enable debug logging
- Use testnet RPC endpoints

#### Development (`NODE_ENV=development`)
- Relaxed CSP for development tools
- Enable debug features
- Use local/test RPC endpoints

## Deployment Configuration

### Vercel Deployment

1. **Project Setup**:
   ```bash
   vercel --prod
   ```

2. **Environment Variables**:
   - Set all required environment variables in Vercel dashboard
   - Use encrypted secrets for sensitive data

3. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Node Version: 20.x

### Security Headers Configuration

The following security headers are automatically applied:

- **Content Security Policy**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **Strict-Transport-Security**: Enforces HTTPS (add to Vercel)

### Database Setup

1. **PostgreSQL Database**:
   ```sql
   CREATE DATABASE echain_prod;
   CREATE USER echain_user WITH ENCRYPTED PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE echain_prod TO echain_user;
   ```

2. **Migrations**:
   ```bash
   npm run db:migrate
   ```

## Monitoring Setup

### Application Monitoring

1. **Sentry Setup**:
   ```typescript
   // lib/sentry.ts
   import * as Sentry from '@sentry/nextjs';

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

2. **Custom Metrics**:
   - Authentication success/failure rates
   - Recovery attempt monitoring
   - Frame interaction analytics
   - API response times

### Infrastructure Monitoring

1. **Vercel Analytics**: Built-in performance monitoring
2. **Uptime Monitoring**: Set up external uptime checks
3. **Error Tracking**: Configure error alerting

## Security Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates valid
- [ ] Security headers tested
- [ ] Rate limiting configured
- [ ] Monitoring alerts set up

### Post-Deployment
- [ ] Authentication flows tested
- [ ] Recovery functionality verified
- [ ] Frame interactions working
- [ ] Performance benchmarks met
- [ ] Security scan completed

## Rollback Procedures

### Emergency Rollback
1. **Vercel Rollback**: Use Vercel dashboard to rollback to previous deployment
2. **Database Rollback**: Restore from backup if schema changes
3. **Feature Flags**: Disable problematic features via feature flags

### Gradual Rollback
1. **Canary Deployment**: Roll back gradually using Vercel's traffic splitting
2. **Feature Toggles**: Disable features without full rollback
3. **Database Migrations**: Revert migrations if needed

## Performance Optimization

### Build Optimizations
- Enable Next.js build optimizations
- Configure proper caching headers
- Optimize bundle size

### Runtime Optimizations
- Implement proper caching strategies
- Use CDN for static assets
- Optimize database queries

## Backup and Recovery

### Database Backups
- Daily automated backups
- Point-in-time recovery capability
- Cross-region backup storage

### Application Backups
- Code repository backups
- Configuration backups
- Environment variable backups

## Incident Response

### Alert Configuration
- Set up alerts for:
  - High error rates
  - Authentication failures
  - Performance degradation
  - Security incidents

### Response Team
- Define incident response roles
- Establish communication channels
- Create escalation procedures

## Compliance

### Data Protection
- GDPR compliance for EU users
- Data retention policies
- User data export capabilities

### Security Compliance
- Regular security audits
- Penetration testing
- Compliance certifications

## Maintenance

### Regular Tasks
- Security updates
- Dependency updates
- Performance monitoring
- Log rotation

### Scheduled Maintenance
- Database maintenance
- Security patches
- Infrastructure updates