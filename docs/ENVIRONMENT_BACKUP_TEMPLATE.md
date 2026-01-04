# Echain Environment Variables Backup
# ⚠️  SENSITIVE - DO NOT COMMIT TO GIT
# 📅 Created: October 26, 2025
# 🎯 Purpose: Secure backup of production environment variables
# 🔒 Store this file encrypted and offline

## 📋 Environment Variables Backup

### Core Production Variables (REQUIRED)
```
NEXT_PUBLIC_REOWN_PROJECT_ID=REPLACE_WITH_YOUR_REOWN_PROJECT_ID
BLOB_READ_WRITE_TOKEN=REPLACE_WITH_YOUR_VERCEL_BLOB_TOKEN
ADMIN_API_KEY=REPLACE_WITH_SECURE_ADMIN_API_KEY
JWT_SECRET=REPLACE_WITH_SECURE_JWT_SECRET
NEXT_PUBLIC_SENTRY_DSN=REPLACE_WITH_YOUR_SENTRY_DSN
```

### Contract Addresses (Base Sepolia Testnet)
```
NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=0xA97cB40548905B05A67fCD4765438aFBEA4030fc
NEXT_PUBLIC_EVENT_TICKET_ADDRESS=0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C
NEXT_PUBLIC_POAP_ADDRESS=0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33
NEXT_PUBLIC_INCENTIVE_ADDRESS=0x1cfDae689817B954b72512bC82f23F35B997617D
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xD061393A54784da5Fea48CC845163aBc2B11537A
```

### Network Configuration
```
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_ACTIVE_NETWORK=sepolia
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
```

### Optional Services (REPLACE placeholders when configured)
```
# Premium RPC Providers
NEXT_PUBLIC_BASE_SEPOLIA_CHAINSTACK_RPC=REPLACE_WITH_CHAINSTACK_RPC_URL
NEXT_PUBLIC_BASE_SEPOLIA_SPECTRUM_RPC=REPLACE_WITH_SPECTRUM_RPC_URL
NEXT_PUBLIC_BASE_SEPOLIA_COINBASE_RPC=REPLACE_WITH_COINBASE_RPC_URL

# Coinbase OnchainKit
NEXT_PUBLIC_ONCHAINKIT_API_KEY=REPLACE_WITH_COINBASE_API_KEY

# Email Service
SENDGRID_API_KEY=REPLACE_WITH_SENDGRID_API_KEY
SENDGRID_FROM_EMAIL=noreply@echain.app

# Social Authentication
GOOGLE_CLIENT_ID=REPLACE_WITH_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=REPLACE_WITH_GOOGLE_CLIENT_SECRET

# Farcaster
NEXT_PUBLIC_FARCASTER_APP_FID=REPLACE_WITH_FARCASTER_APP_FID

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=REPLACE_WITH_GOOGLE_MAPS_API_KEY

# Edge Config
EDGE_CONFIG=REPLACE_WITH_EDGE_CONFIG_ID
```

## 🔐 Security Instructions

1. **Replace all `REPLACE_WITH_*` placeholders** with actual API keys
2. **Encrypt this file** before storing:
   ```bash
   # Using OpenSSL
   openssl enc -aes-256-cbc -salt -in env-backup.txt -out env-backup.enc

   # Using GPG
   gpg -c env-backup.txt
   ```
3. **Store encrypted file** in:
   - Password manager (Bitwarden, LastPass)
   - Encrypted external drive
   - Secure cloud storage (with encryption)
4. **Never store unencrypted** in:
   - Git repositories
   - Email attachments
   - Unencrypted cloud storage
   - Local unencrypted files

## 🔄 Recovery Instructions

1. **Decrypt the backup**:
   ```bash
   # OpenSSL
   openssl enc -d -aes-256-cbc -in env-backup.enc -out env-backup.txt

   # GPG
   gpg env-backup.txt.gpg
   ```
2. **Update Vercel environment variables** using the decrypted values
3. **Run validation**:
   ```bash
   npm run validate:env
   ```

## 📞 Emergency Contacts

If you need to recover these variables and don't have access to the backup:

- **Reown**: Recreate project at https://cloud.reown.com/
- **Vercel Blob**: Regenerate token in Vercel dashboard
- **Sentry**: Get new DSN from Sentry project settings
- **Security Keys**: Generate new ones using `openssl rand -hex 32/64`

## ✅ Verification Checklist

- [ ] All REPLACE_WITH_* placeholders updated with real values
- [ ] File encrypted before storage
- [ ] Encrypted backup stored securely
- [ ] Unencrypted version deleted
- [ ] Recovery instructions tested

---
**⚠️ REMINDER**: This file contains sensitive production credentials.
Handle with extreme care and delete after configuring production environment.