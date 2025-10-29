# Echain Environment Setup Guide - Beta Launch
**Date:** October 27, 2025
**Status:** Beta Environment Configuration (Base Sepolia Testnet)
**⚠️ SECURITY NOTICE:** This repository is PUBLIC on GitHub. Never commit actual API keys or secrets!

---

## 🚨 **CRITICAL SECURITY WARNING**

### **Public Repository - Never Commit Secrets!**
- ❌ **DO NOT** commit `.env.production` or any file containing real API keys
- ❌ **DO NOT** commit `.env.local` or development environment files with secrets
- ✅ **ONLY** commit `.env.example` with placeholder values
- ✅ Set environment variables in your deployment platform (Vercel, etc.)

**If you accidentally commit secrets:**
1. Immediately rotate all affected API keys
2. Remove the commit from git history
3. Notify the development team

---

## 🎯 **Quick Setup Overview**

Complete these steps in order:

### **Phase 1: Core Services (45 minutes)** - REQUIRED FOR BETA
1. [Base Network Configuration](#base-network-configuration)
2. [Wallet Integration Setup](#wallet-integration-setup)
3. [Coinbase OnchainKit Setup](#coinbase-onchainkit-setup)
4. [Database Configuration](#database-configuration)
5. [Security Keys Generation](#security-keys-generation)
6. [Sentry Setup](#sentry-setup)

### **Phase 2: Optional Services (30 minutes)** - RECOMMENDED
7. [Premium RPC Setup](#premium-rpc-setup)
8. [Email Service Setup](#email-service-setup)
9. [Social Authentication](#social-authentication)
10. [Farcaster Configuration](#farcaster-configuration)
11. [Google Maps Setup](#google-maps-setup)

### **Phase 3: Deployment (15 minutes)**
12. [Environment Variables in Deployment Platform](#environment-variables-in-deployment-platform)
13. [Validation](#validation)

---

## 🔑 **Required Environment Variables for Beta**

| Variable | Status | Source | Priority |
|----------|--------|--------|----------|
| `NEXT_PUBLIC_BASE_RPC_URL` | 🔴 Setup Required | Base Sepolia | Critical |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | 🔴 Setup Required | WalletConnect | Critical |
| `NEXT_PUBLIC_ONCHAINKIT_API_KEY` | 🔴 Setup Required | Coinbase | Critical |
| `DATABASE_URL` | 🔴 Setup Required | Database Provider | Critical |
| `NEXTAUTH_SECRET` | 🔴 Setup Required | Generate | Critical |
| `JWT_SECRET` | 🔴 Setup Required | Generate | Critical |
| `NEXT_PUBLIC_SENTRY_DSN` | 🔴 Setup Required | Sentry | Critical |
| `NEXT_PUBLIC_CHAINSTACK_RPC_URL` | 🟡 Optional | Chainstack | Recommended |
| `RESEND_API_KEY` | 🟡 Optional | Resend | Recommended |
| `GOOGLE_CLIENT_ID` | 🟡 Optional | Google | Optional |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | 🟡 Optional | Google | Optional |

---

## 🔗 **Detailed Setup Instructions**

### **1. Base Network Configuration** ⏱️ 5 minutes - REQUIRED

**Base Sepolia** is our testnet for beta deployment.

1. **Verify Network Details:**
   - RPC URL: `https://sepolia.base.org`
   - Chain ID: `84532`
   - Currency: ETH

2. **Update Environment:**
   ```bash
   NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
   NEXT_PUBLIC_BASE_CHAIN_ID=84532
   ```

**Cost:** Free

---

### **2. Wallet Integration Setup** ⏱️ 10 minutes - REQUIRED

**WalletConnect** enables wallet connections for MetaMask, Rainbow, etc.

1. **Create Account:**
   - Visit: https://cloud.walletconnect.com/
   - Sign up for a free account
   - Verify your email

2. **Create Project:**
   - Click "Create Project"
   - Name: "Echain Beta"
   - Description: "Web3 Event Ticketing Platform"
   - Select networks: Base Sepolia

3. **Get Project ID:**
   - Copy the Project ID from dashboard
   - Format: `abc123...` (32 characters)

4. **Update Environment:**
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=your_project_id_here
   ```

**Cost:** Free

---

### **3. Coinbase OnchainKit Setup** ⏱️ 5 minutes - REQUIRED

**Coinbase OnchainKit** provides enhanced wallet functionality.

1. **Access Coinbase Developer Platform:**
   - Visit: https://www.coinbase.com/developer-platform
   - Sign in with Coinbase account

2. **Create API Key:**
   - Go to API Keys section
   - Create new key for "Echain Beta"
   - Copy the API key

3. **Update Environment:**
   ```bash
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_coinbase_api_key
   ```

**Cost:** Free tier available

---

### **4. Database Configuration** ⏱️ 10 minutes - REQUIRED

**Database** stores user data, events, and transactions.

#### **Option A: Supabase (Recommended)**
1. **Create Account:**
   - Visit: https://supabase.com/
   - Sign up for free account

2. **Create Project:**
   - Project name: "Echain Beta"
   - Database password: Generate secure password
   - Region: Select closest region

3. **Get Connection String:**
   - Go to Settings → Database
   - Copy the connection string
   - Format: `postgresql://user:pass@host:port/db`

4. **Update Environment:**
   ```bash
   DATABASE_URL=your_supabase_connection_string
   ```

#### **Option B: PlanetScale**
1. Visit: https://planetscale.com/
2. Create database
3. Get connection string

#### **Option C: Railway**
1. Visit: https://railway.app/
2. Create PostgreSQL database
3. Get DATABASE_URL

**Cost:** Free tiers available

---

### **5. Security Keys Generation** ⏱️ 5 minutes - REQUIRED

Generate secure random keys for authentication.

1. **Generate NextAuth Secret:**
   ```bash
   # 32-character hex string
   openssl rand -hex 32
   ```

2. **Generate JWT Secret:**
   ```bash
   # 64-character hex string
   openssl rand -hex 64
   ```

3. **Update Environment:**
   ```bash
   NEXTAUTH_SECRET=your_nextauth_secret
   JWT_SECRET=your_jwt_secret
   NEXTAUTH_URL=https://your-vercel-domain.vercel.app
   ```

---

### **6. Sentry Setup** ⏱️ 10 minutes - REQUIRED

**Sentry** provides error tracking and performance monitoring.

1. **Create Account:**
   - Visit: https://sentry.io/
   - Sign up for free account
   - Choose "Next.js" as your platform

2. **Create Project:**
   - Project name: "Echain Beta"
   - Platform: "Next.js"
   - Alert settings: Enable all

3. **Get DSN:**
   - Go to Project Settings → Client Keys
   - Copy the DSN (Data Source Name)
   - Format: `https://xxx@sentry.io/yyy`

4. **Update Environment:**
   ```bash
   SENTRY_AUTH_TOKEN=your_auth_token
   SENTRY_DSN=https://xxx@sentry.io/yyy
   SENTRY_ORG=your_org
   SENTRY_PROJECT=echain-beta
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/yyy
   ```

**Cost:** Free tier (5,000 events/month)

---

### **7. Premium RPC Setup** ⏱️ 10 minutes - OPTIONAL

Add premium RPC providers for better performance.

#### **Chainstack Setup:**
1. Visit: https://chainstack.com/
2. Create Base Sepolia project
3. Copy HTTPS and WebSocket endpoints
4. Set:
   ```bash
   NEXT_PUBLIC_CHAINSTACK_RPC_URL=https://...
   NEXT_PUBLIC_CHAINSTACK_WS_URL=wss://...
   ```

#### **Coinbase Node Setup:**
1. Visit: https://www.coinbase.com/developer-platform/products/base-node
2. Create project for Base Sepolia
3. Copy endpoints
4. Set:
   ```bash
   NEXT_PUBLIC_COINBASE_RPC_URL=https://...
   NEXT_PUBLIC_COINBASE_WS_URL=wss://...
   ```

#### **Spectrum Nodes Setup:**
1. Visit: https://spectrumnodes.com/
2. Select Base Sepolia
3. Copy RPC endpoint
4. Set:
   ```bash
   NEXT_PUBLIC_SPECTRUM_RPC_URL=https://...
   NEXT_PUBLIC_SPECTRUM_WS_URL=wss://...
   ```

#### **RPC Provider Management System:**
The application includes an intelligent RPC provider management system that automatically selects the best available RPC endpoint based on latency and reliability. Configure multiple providers for redundancy:

```bash
# Primary RPC providers (automatically managed)
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASE_RPC_API_KEY=your_base_api_key  # Optional

# Additional providers for failover (optional)
NEXT_PUBLIC_BASE_RPC_BACKUP_1=https://base-sepolia.publicnode.com
NEXT_PUBLIC_BASE_RPC_BACKUP_2=https://base-sepolia.blockpi.network/v1/rpc/public
```

**Note:** The RPC provider management system will automatically:
- Monitor latency and performance
- Switch to backup providers on failure
- Reactivate providers when they recover
- Prioritize faster, more reliable endpoints

---

### **8. Email Service Setup** ⏱️ 5 minutes - OPTIONAL

**Email services** handle transactional emails and notifications.

#### **Resend (Recommended):**
1. **Create Account:**
   - Visit: https://resend.com/
   - Sign up for free account

2. **Generate API Key:**
   - Go to API Keys
   - Create "Echain Beta" key
   - Copy the key

3. **Update Environment:**
   ```bash
   RESEND_API_KEY=your_resend_key
   RESEND_FROM_EMAIL=noreply@echain.app
   ```

#### **SendGrid (Alternative):**
1. Visit: https://sendgrid.com/
2. Create API key
3. Set:
   ```bash
   SENDGRID_API_KEY=your_sendgrid_key
   SENDGRID_FROM_EMAIL=noreply@echain.app
   ```

**Cost:** Free tiers available

---

### **9. Social Authentication** ⏱️ 10 minutes - OPTIONAL

Enable social login options.

#### **Google OAuth:**
1. Visit: https://console.cloud.google.com/
2. Create project "Echain Beta"
3. Enable Google+ API
4. Create OAuth credentials
5. Set authorized redirect URIs
6. Copy Client ID and Secret
7. Set:
   ```bash
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

#### **Discord OAuth:**
1. Visit: https://discord.com/developers/applications
2. Create application "Echain Beta"
3. Go to OAuth2 → General
4. Copy Client ID and Secret
5. Set redirect URI
6. Create webhook for feedback
7. Set:
   ```bash
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
   ```

#### **Twitter OAuth:**
1. Visit: https://developer.twitter.com/
2. Create app "Echain Beta"
3. Copy API keys
4. Set:
   ```bash
   TWITTER_CLIENT_ID=your_twitter_client_id
   TWITTER_CLIENT_SECRET=your_twitter_client_secret
   ```

#### **GitHub OAuth:**
1. Visit: https://github.com/settings/developers
2. Create OAuth App
3. Set callback URL
4. Copy Client ID and Secret
5. Set:
   ```bash
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

---

### **10. Farcaster Configuration** ⏱️ 5 minutes - OPTIONAL

**Farcaster** enables social features.

1. **Get App FID:**
   - Visit Farcaster developer docs
   - Register your app
   - Get App FID

2. **Update Environment:**
   ```bash
   NEXT_PUBLIC_FARCASTER_HUB_URL=https://hub.farcaster.xyz
   NEXT_PUBLIC_FARCASTER_APP_FID=your_app_fid
   ```

---

### **11. Google Maps Setup** ⏱️ 5 minutes - OPTIONAL

**Google Maps** for location features.

1. **Create API Key:**
   - Visit: https://console.cloud.google.com/
   - Enable Maps JavaScript API
   - Create API key

2. **Update Environment:**
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

---

### **12. Environment Variables in Deployment Platform**

**Since this is a PUBLIC repository, environment variables must be set in your deployment platform, NOT in code files.**

#### **For Vercel Deployment:**

1. **Access Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your Echain project

2. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Environment: "Production"
   - Add each required variable from your `.env.production` file

3. **Bulk Import (Recommended):**
   ```bash
   # Copy values from your local .env.production file
   # Paste them individually into Vercel dashboard
   # DO NOT upload the file directly
   ```

#### **For Other Platforms (Netlify, Railway, etc.):**
- Use their respective environment variable configuration sections
- Never commit `.env.production` to the repository

#### **Local Development:**
```bash
# Create .env.local for development (not committed to git)
cp .env.example .env.local
# Edit .env.local with your development keys
```

**Security Reminder:** `.env.local` should be in `.gitignore` and never committed!

---

### **13. Validation** ⏱️ 5 minutes

**Test your configuration:**

1. **Run Validation Script:**
   ```bash
   cd frontend
   npm run validate:env
   ```

2. **Check Deployment:**
   - Visit your production URL
   - Check browser console for errors
   - Test wallet connection

3. **Verify Monitoring:**
   - Trigger a test error in your app
   - Check if it appears in Sentry

---

## 🔐 **Security Best Practices**

### **Public Repository Security:**
- 🚨 **This repository is PUBLIC on GitHub**
- ❌ **NEVER commit `.env.production` or files with real secrets**
- ✅ **ONLY commit `.env.example` with placeholder values**
- ✅ **Set environment variables in deployment platform only**
- ✅ **Use `.env.local` for local development (excluded from git)**

### **API Key Management:**
- ✅ Never commit secrets to git (even private repos can become public)
- ✅ Use environment variables only in deployment platforms
- ✅ Rotate keys regularly if accidentally exposed
- ✅ Monitor key usage in service dashboards

### **Access Control:**
- ✅ Limit deployment platform environment access
- ✅ Use least-privilege for API keys
- ✅ Enable 2FA on all accounts
- ✅ Regularly audit environment variables

### **If Secrets Are Accidentally Committed:**
1. **Immediately rotate all affected keys**
2. **Remove sensitive data from git history:**
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env*' --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push the cleaned history**
4. **Notify team members to re-clone**
5. **Update all deployment environments**

---

## 🚨 **Common Issues & Solutions**

### **Wallet Connection Issues:**
- Verify WalletConnect Project ID is correct
- Check if Base Sepolia is enabled in project
- Test with MetaMask mobile app

### **Database Connection Issues:**
- Verify connection string format
- Check database permissions
- Ensure database is accessible from Vercel

### **Sentry Not Receiving Errors:**
- Verify DSN format
- Check if Sentry is enabled in `next.config.mjs`
- Test with manual error trigger

---

## ✅ **Beta Launch Checklist**

- [ ] Base network configured
- [ ] WalletConnect project set up
- [ ] Coinbase OnchainKit API key obtained
- [ ] Database connection established
- [ ] Security keys generated
- [ ] Sentry monitoring configured
- [ ] Vercel environment variables configured
- [ ] Validation script passes
- [ ] Production deployment successful
- [ ] Wallet connection tested
- [ ] Error monitoring verified

---

## 🎯 **Next Steps After Environment Setup**

1. ✅ **Environment Setup** - Complete
2. 🔄 **Beta Feedback System** - Next Priority
3. 🔄 **Monitoring Setup** - Configure alerts
4. 🔄 **Beta User Management** - User registration

Your Echain platform is now ready for beta deployment! 🚀

---

**Need Help?** Check the troubleshooting section above or contact the development team.

**Generated:** October 27, 2025
**Version:** 3.0 - Comprehensive Beta Launch Edition