# Echain Environment Setup Guide
**Date:** October 26, 2025
**Status:** Production Environment Configuration

---

## 🎯 **Quick Setup Overview**

Complete these steps in order:

### **Phase 1: RPC Providers (30 minutes)**
1. [Chainstack Setup](#chainstack-setup)
2. [Spectrum Nodes Setup](#spectrum-nodes-setup)
3. [Coinbase Node Setup](#coinbase-node-setup)

### **Phase 2: Monitoring (20 minutes)**
4. [Sentry Setup](#sentry-setup)
5. [Slack Webhook Setup](#slack-webhook-setup)

### **Phase 3: Vercel Deployment (15 minutes)**
6. [Vercel Environment Variables](#vercel-environment-variables)
7. [Validation](#validation)

---

## 🔗 **Detailed Setup Instructions**

### **1. Chainstack Setup** ⏱️ 10 minutes

**Chainstack** provides enterprise-grade RPC infrastructure.

1. **Create Account:**
   - Visit: https://chainstack.com/
   - Sign up for a free account
   - Verify your email

2. **Create Base Network Project:**
   - Click "Create Project" → "Base"
   - Select "Mainnet" network
   - Choose "HTTPS" endpoint type

3. **Get RPC URL:**
   - Copy the HTTPS endpoint URL
   - Format: `https://base-mainnet.core.chainstack.com/YOUR_API_KEY`

4. **Update Environment:**
   ```bash
   BASE_MAINNET_CHAINSTACK_RPC=https://base-mainnet.core.chainstack.com/YOUR_API_KEY
   ```

**Cost:** Free tier available, paid plans start at $19/month

---

### **2. Spectrum Nodes Setup** ⏱️ 10 minutes

**Spectrum Nodes** offers decentralized RPC infrastructure.

1. **Access Service:**
   - Visit: https://spectrumnodes.com/?sPartner=gsd
   - Connect your wallet (MetaMask recommended)

2. **Select Network:**
   - Choose "Base" from network dropdown
   - Select "Mainnet" environment

3. **Get RPC URL:**
   - Copy the provided RPC endpoint
   - Format: `https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY`

4. **Update Environment:**
   ```bash
   BASE_MAINNET_SPECTRUM_RPC=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   ```

**Cost:** Free tier available

---

### **3. Coinbase Node Setup** ⏱️ 10 minutes

**Coinbase Node** provides direct access to Base infrastructure.

1. **Access Developer Platform:**
   - Visit: https://www.coinbase.com/developer-platform/products/base-node
   - Sign in with Coinbase account

2. **Create Project:**
   - Click "Create Project"
   - Enable "Base API"
   - Generate API credentials

3. **Get RPC URL:**
   - Use the provided endpoint
   - Format: `https://api.developer.coinbase.com/rpc/v1/base/YOUR_PROJECT_ID`

4. **Update Environment:**
   ```bash
   BASE_MAINNET_COINBASE_RPC=https://api.developer.coinbase.com/rpc/v1/base/YOUR_PROJECT_ID
   ```

**Cost:** Free tier available

---

### **4. Sentry Setup** ⏱️ 10 minutes

**Sentry** provides error tracking and performance monitoring.

1. **Create Account:**
   - Visit: https://sentry.io/
   - Sign up for free account
   - Choose "Next.js" as your platform

2. **Create Project:**
   - Project name: "Echain Production"
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

### **5. Slack Webhook Setup** ⏱️ 10 minutes

**Slack** will receive beta feedback and system alerts.

1. **Create Slack App:**
   - Visit: https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Name: "Echain Beta Feedback"
   - Select your workspace

2. **Add Webhook:**
   - Go to "Incoming Webhooks" → "Add New Webhook"
   - Select channel: #beta-feedback (create if needed)
   - Copy the Webhook URL

3. **Update Environment:**
   ```bash
   SLACK_FEEDBACK_WEBHOOK_URL=YOUR_SLACK_WEBHOOK_URL_HERE
   ```

**Cost:** Free

---

### **6. Vercel Environment Variables** ⏱️ 15 minutes

**Vercel** hosts your production application.

1. **Access Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your Echain project

2. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Environment: "Production"
   - Add each variable from `.env.production`

3. **Bulk Import (Recommended):**
   - Copy contents of `.env.production`
   - Paste into Vercel's bulk import feature
   - Review and save all variables

4. **Trigger Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - Select "Production" environment

---

### **7. Validation** ⏱️ 5 minutes

**Test your configuration:**

1. **Run Validation Script:**
   ```bash
   cd frontend
   npm run validate:env
   ```

2. **Check Vercel Deployment:**
   - Visit your production URL
   - Check browser console for errors
   - Test basic functionality

3. **Verify Monitoring:**
   - Trigger a test error in your app
   - Check if it appears in Sentry
   - Send a test message to Slack webhook

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
- ✅ Regular security audits

---

## 🚨 **Common Issues & Solutions**

### **RPC Connection Issues:**
- Check API key validity
- Verify network selection (Mainnet vs Testnet)
- Test endpoints in browser

### **Sentry Not Receiving Errors:**
- Verify DSN format
- Check CORS settings
- Ensure proper error boundaries

### **Slack Webhook Not Working:**
- Verify webhook URL format
- Check channel permissions
- Test with curl: `curl -X POST -H 'Content-type: application/json' --data '{"text":"Test"}' YOUR_WEBHOOK_URL`

---

## 📞 **Support & Resources**

### **Documentation:**
- [Base Network Docs](https://docs.base.org/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Sentry Next.js Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

### **Support Channels:**
- Chainstack: support@chainstack.com
- Coinbase: developer-platform@coinbase.com
- Vercel: support@vercel.com
- Sentry: support@sentry.io

---

## ✅ **Completion Checklist**

- [ ] Chainstack RPC configured
- [ ] Spectrum Nodes RPC configured
- [ ] Coinbase RPC configured
- [ ] Sentry DSN obtained
- [ ] Slack webhook created
- [ ] Vercel variables set
- [ ] Validation passed
- [ ] Production deployment successful

---

**Next Step After Completion:** Set up monitoring and alerting infrastructure.

**Need Help?** Contact the development team or open a GitHub issue.

---

**Generated:** October 26, 2025
**Version:** 1.0