# 🚀 Vercel Deployment Guide for Echain

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Integration**: Connect your GitHub account to Vercel
3. **MultiBaas Setup**: Ensure your MultiBaas deployment is configured
4. **Reown Project**: Create a project at [cloud.reown.com](https://cloud.reown.com)

## Environment Variables Setup

### 1. In Vercel Dashboard

Go to your project settings → Environment Variables and add:

```bash
# MultiBaas Configuration
NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL=https://your-deployment.multibaas.com
NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY=your_dapp_user_api_key
NEXT_PUBLIC_MULTIBAAS_WEB3_API_KEY=your_web3_api_key
NEXT_PUBLIC_MULTIBAAS_CHAIN_ID=84532

# Contract Addresses (Base Sepolia)
NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=0xbE36039Bfe7f48604F73daD61411459B17fd2e85
NEXT_PUBLIC_EVENT_TICKET_ADDRESS=0x127b53D8f29DcDe4DDfcCb24ad8b88B515D08180
NEXT_PUBLIC_POAP_ADDRESS=0x405061e2ef1F748fA95A1e7725fc1a008e8c2196
NEXT_PUBLIC_INCENTIVE_ADDRESS=0x8290c12f874DF9D03FDadAbE10C7c6321B69Ded9

# Wallet Configuration
NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=your_reown_project_id

# Webhook Security
MULTIBAAS_WEBHOOK_SECRET=your_webhook_secret
```

### 2. MultiBaas Webhook Configuration

Configure webhooks in MultiBaas to point to your Vercel deployment:

```
Webhook URL: https://your-app.vercel.app/api/events
Secret: your_webhook_secret
Events: event.emitted (EventCreated)
```

## Deployment Steps

### Option 1: GitHub Integration (Recommended)

1. **Connect Repository**:
   - Go to Vercel dashboard
   - Click "Add New..." → "Project"
   - Import your `Talent-Index/Echain` repository
   - Select the `frontend` directory as root

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)

3. **Environment Variables**: Add all variables from above

4. **Deploy**: Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Link project (first time only)
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL
vercel env add NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY
# ... add all other variables

# Deploy
vercel --prod
```

## Post-Deployment Configuration

### 1. Update MultiBaas Webhooks

After deployment, update your webhook URLs to point to the production Vercel URLs:

```bash
Production URL: https://your-app.vercel.app/api/events
```

### 2. Domain Configuration (Optional)

- Go to Project Settings → Domains
- Add your custom domain
- Configure DNS records as instructed

### 3. Environment-Specific Builds

Vercel automatically creates different builds for:
- Production: `https://your-app.vercel.app`
- Preview: `https://your-app-git-branch.vercel.app` (per PR)
- Development: Local development

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files to Git
- ✅ Use Vercel's encrypted environment variables
- ✅ Rotate API keys regularly
- ✅ Use different keys for different environments

### 2. API Security
- ✅ Validate webhook signatures in production
- ✅ Use HTTPS-only for all API calls
- ✅ Implement rate limiting on API routes
- ✅ Sanitize all user inputs

### 3. Database Security
- ✅ Use connection pooling for SQLite
- ✅ Implement proper error handling
- ✅ Never expose database files publicly
- ✅ Regular backup strategy

## Monitoring & Maintenance

### 1. Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor Core Web Vitals
- Track function execution times

### 2. Error Tracking
```typescript
// Add to your app for error monitoring
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### 3. Performance Monitoring
- Use Vercel's built-in performance insights
- Monitor API response times
- Set up alerts for failed deployments

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all environment variables are set
   - Ensure `ethers` dependency is installed
   - Verify TypeScript compilation

2. **API Errors**:
   - Check MultiBaas API keys are correct
   - Verify webhook URLs are updated
   - Check Vercel function logs

3. **Database Issues**:
   - SQLite file permissions in serverless environment
   - Connection pooling configuration
   - Migration scripts for schema changes

### Logs & Debugging

```bash
# View Vercel function logs
vercel logs

# View build logs in dashboard
# Go to Deployments → View Logs

# Debug locally
npm run dev
```

## Scaling Considerations

### 1. Database Migration
For production scale, consider migrating from SQLite to:
- PostgreSQL on Vercel Postgres
- PlanetScale
- Supabase

### 2. CDN & Caching
- Vercel automatically handles CDN distribution
- Implement proper cache headers for static assets
- Use Next.js ISR for dynamic content

### 3. API Rate Limiting
```typescript
// Add to API routes
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Backup & Recovery

### 1. Code Repository
- All code is safely stored in GitHub
- Use GitHub Actions for automated testing
- Implement proper branching strategy

### 2. Database Backups
- SQLite files are ephemeral in serverless
- Implement regular data exports
- Consider database migration for persistence

### 3. Configuration Backups
- Document all environment variables
- Keep deployment scripts versioned
- Regular security audits

---

## 🚀 Deployment Checklist

- [ ] Vercel account created and connected to GitHub
- [ ] Repository imported with correct root directory (`frontend`)
- [ ] All environment variables configured
- [ ] MultiBaas webhooks updated with production URLs
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate verified
- [ ] Initial deployment successful
- [ ] API endpoints tested
- [ ] Webhook functionality verified
- [ ] Performance monitoring enabled
- [ ] Error tracking configured

**Your Echain platform is now live and ready to handle blockchain event ticketing! 🎉**