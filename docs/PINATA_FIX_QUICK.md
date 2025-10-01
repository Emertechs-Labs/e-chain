# 🔧 PINATA CSP FIX - Quick Reference

## The Problem
```
❌ Refused to connect to 'https://api.pinata.cloud/pinning/pinFileToIPFS'
❌ Failed to load resource: the server responded with a status of 500 (ticket-sales)
❌ Vercel Blob: No token found
```

## The Solution

### ✅ Step 1: CSP Fixed (Already Done)
Updated `next.config.mjs` to allow Pinata API connections.

### ✅ Step 2: API Fixed (Already Done)
Updated `ticket-sales/route.ts` to use fallback wrapper.

### ⚠️ Step 3: Add Environment Variables (YOU NEED TO DO THIS)

**Quick Add via Vercel CLI:**
```bash
cd "E:/Polymath Universata/Projects/Echain/frontend"

# Add Pinata JWT
npx vercel env add PINATA_JWT
# Paste your Pinata JWT when prompted
# Select: Production, Preview, Development

# Add Blob Token
npx vercel env add BLOB_READ_WRITE_TOKEN
# Paste your Vercel Blob token when prompted
# Select: Production, Preview, Development
```

**Or via Dashboard:**
https://vercel.com → Your Project → Settings → Environment Variables

Add:
- `PINATA_JWT` = your_pinata_jwt_token
- `BLOB_READ_WRITE_TOKEN` = your_vercel_blob_token

### Step 4: Redeploy
```bash
cd "E:/Polymath Universata/Projects/Echain/frontend"
npx vercel --prod
```

## Get API Tokens

### Pinata JWT:
1. https://app.pinata.cloud
2. API Keys → Create New Key
3. Enable "Pinning" permission
4. Copy JWT

### Vercel Blob:
1. https://vercel.com
2. Your Project → Storage → Blob
3. Create store if needed
4. Copy token

---

**After adding tokens and redeploying, all errors will be fixed!** ✅
