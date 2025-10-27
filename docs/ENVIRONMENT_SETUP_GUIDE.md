# Echain Environment Setup Guide - Beta Launch
**Date:** October 26, 2025
**Status:** Beta Environment Configuration (Base Sepolia Testnet)

---

## 🎯 **Quick Setup Overview**

Complete these steps in order:

### **Phase 1: Core Services (30 minutes)** - REQUIRED FOR BETA
1. [Reown (WalletConnect) Setup](#reown-walletconnect-setup)
2. [Vercel Blob Setup](#vercel-blob-setup)
3. [Security Keys Generation](#security-keys-generation)
4. [Sentry Setup](#sentry-setup)

### **Phase 2: Optional Services (20 minutes)** - RECOMMENDED
5. [Premium RPC Setup](#premium-rpc-setup)
6. [Email Service Setup](#email-service-setup)

### **Phase 3: Vercel Deployment (15 minutes)**
7. [Vercel Environment Variables](#vercel-environment-variables)
8. [Validation](#validation)

---

## 🔑 **Required Environment Variables for Beta**

| Variable | Status | Source | Priority |
|----------|--------|--------|----------|
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | 🔴 Setup Required | Reown Cloud | Critical |
| `BLOB_READ_WRITE_TOKEN` | 🔴 Setup Required | Vercel Blob | Critical |
| `ADMIN_API_KEY` | 🔴 Setup Required | Generate | Critical |
| `JWT_SECRET` | 🔴 Setup Required | Generate | Critical |
| `NEXT_PUBLIC_SENTRY_DSN` | 🔴 Setup Required | Sentry | Critical |
| `NEXT_PUBLIC_BASE_SEPOLIA_CHAINSTACK_RPC` | 🟡 Optional | Chainstack | Recommended |
| `NEXT_PUBLIC_BASE_SEPOLIA_SPECTRUM_RPC` | 🟡 Optional | Spectrum | Recommended |
| `NEXT_PUBLIC_BASE_SEPOLIA_COINBASE_RPC` | 🟡 Optional | Coinbase | Recommended |
| `SENDGRID_API_KEY` | 🟡 Optional | SendGrid | Optional |

---

## 🔗 **Detailed Setup Instructions**

### **1. Reown (WalletConnect) Setup** ⏱️ 5 minutes - REQUIRED

**Reown** (formerly WalletConnect) enables wallet connections.

1. **Create Account:**
   - Visit: https://cloud.reown.com/
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
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
   ```

**Cost:** Free

---

### **2. Vercel Blob Setup** ⏱️ 5 minutes - REQUIRED

**Vercel Blob** provides file storage for event assets.

1. **Access Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your Echain project

2. **Create Blob Store:**
   - Go to Storage tab
   - Click "Blob" → "Create Database"
   - Name: "echain-beta-assets"
   - Region: "Washington D.C (IAD)"

3. **Get Token:**
   - Copy the "BLOB_READ_WRITE_TOKEN"
   - Format: `vercel_blob_...`

4. **Update Environment:**
   ```bash
   BLOB_READ_WRITE_TOKEN=vercel_blob_your_token_here
   ```

**Cost:** Free tier available

---

### **3. Security Keys Generation** ⏱️ 5 minutes - REQUIRED

Generate secure random keys for authentication.

1. **Generate Admin API Key:**
   ```bash
   # 32-character hex string
   openssl rand -hex 32
   # Example output: a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890
   ```

2. **Generate JWT Secret:**
   ```bash
   # 64-character hex string
   openssl rand -hex 64
   # Example output: a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890abcdef1234567890abcdef1234567890abcdef
   ```

3. **Update Environment:**
   ```bash
   ADMIN_API_KEY=your_generated_admin_key
   JWT_SECRET=your_generated_jwt_secret
   ```

---

### **4. Sentry Setup** ⏱️ 10 minutes - REQUIRED

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
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/yyy
   ```

**Cost:** Free tier (5,000 events/month)

---

### **5. Premium RPC Setup** ⏱️ 10 minutes - OPTIONAL

Add premium RPC providers for better performance.

#### **Chainstack Setup:**
1. Visit: https://chainstack.com/
2. Create Base Sepolia project
3. Copy HTTPS endpoint
4. Set: `NEXT_PUBLIC_BASE_SEPOLIA_CHAINSTACK_RPC=https://...`

#### **Spectrum Nodes Setup:**
1. Visit: https://spectrumnodes.com/
2. Select Base Sepolia
3. Copy RPC endpoint
4. Set: `NEXT_PUBLIC_BASE_SEPOLIA_SPECTRUM_RPC=https://...`

#### **Coinbase Node Setup:**
1. Visit: https://www.coinbase.com/developer-platform/products/base-node
2. Create project for Base Sepolia
3. Copy endpoint
4. Set: `NEXT_PUBLIC_BASE_SEPOLIA_COINBASE_RPC=https://...`

---

### **6. Email Service Setup** ⏱️ 5 minutes - OPTIONAL

**SendGrid** handles transactional emails.

1. **Create Account:**
   - Visit: https://sendgrid.com/
   - Sign up for free account

2. **Generate API Key:**
   - Go to Settings → API Keys
   - Create "Echain Beta" API key
   - Copy the key

3. **Update Environment:**
   ```bash
   SENDGRID_API_KEY=SG.your_sendgrid_key_here
   SENDGRID_FROM_EMAIL=noreply@echain.app
   ```

**Cost:** Free tier (100 emails/day)

---

### **7. Vercel Environment Variables** ⏱️ 15 minutes

**Configure production environment variables in Vercel.**

#### **Option A: Vercel Dashboard (Recommended)**

1. **Access Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your Echain project

2. **Add Variables:**
   - Go to Settings → Environment Variables
   - Environment: "Production"
   - Add each required variable

3. **Bulk Setup:**
   ```bash
   # Copy these values to Vercel dashboard
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
   BLOB_READ_WRITE_TOKEN=your_blob_token
   ADMIN_API_KEY=your_admin_key
   JWT_SECRET=your_jwt_secret
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   ```

#### **Option B: Vercel CLI (If Available)**
   ```bash
   vercel env add NEXT_PUBLIC_REOWN_PROJECT_ID production
   vercel env add BLOB_READ_WRITE_TOKEN production
   vercel env add ADMIN_API_KEY production
   vercel env add JWT_SECRET production
   vercel env add NEXT_PUBLIC_SENTRY_DSN production
   ```

4. **Trigger Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - Select "Production" environment

---

### **8. Validation** ⏱️ 5 minutes

**Test your configuration:**

1. **Run Validation Script:**
   ```bash
   cd frontend
   npm run validate:env
   ```

2. **Check Vercel Deployment:**
   - Visit your production URL
   - Check browser console for errors
   - Test wallet connection

3. **Verify Monitoring:**
   - Trigger a test error in your app
   - Check if it appears in Sentry

---

## 🔐 **Security Best Practices**

### **API Key Management:**
- ✅ Never commit secrets to git
- ✅ Use environment variables only
- ✅ Rotate keys regularly
- ✅ Monitor key usage

### **Access Control:**
- ✅ Limit Vercel environment access
- ✅ Use least-privilege for API keys
- ✅ Enable 2FA on all accounts

---

## 🚨 **Common Issues & Solutions**

### **Wallet Connection Issues:**
- Verify Reown Project ID is correct
- Check if Base Sepolia is enabled in project
- Test with MetaMask mobile app

### **Blob Storage Issues:**
- Verify Vercel Blob token format
- Check Vercel project permissions
- Ensure blob store is created

### **Sentry Not Receiving Errors:**
- Verify DSN format
- Check if Sentry is enabled in `next.config.mjs`
- Test with manual error trigger

---

## ✅ **Beta Launch Checklist**

- [ ] Reown Project ID configured
- [ ] Vercel Blob token obtained
- [ ] Security keys generated
- [ ] Sentry DSN set up
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

**Generated:** October 26, 2025
**Version:** 2.0 - Beta Launch Edition