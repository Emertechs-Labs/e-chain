# 🚀 Echain Deployment Guide

## Overview

This guide covers the complete deployment process for the Echain blockchain events platform, from local development to production deployment on Base mainnet using Curvegrid MultiBaas.

## 📋 Prerequisites

### Required Tools
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Git**: For version control
- **MetaMask**: For wallet interactions

### Required Accounts
- **Curvegrid Console Account**: [console.curvegrid.com](https://console.curvegrid.com)
- **Reown (WalletConnect) Account**: [cloud.reown.com](https://cloud.reown.com)
- **Base Network Wallet**: With ETH for deployment
- **Pinata Account** (optional): For IPFS pinning

## 🏗️ Infrastructure Setup

### 1. MultiBaas Deployment Setup

#### Create MultiBaas Deployment
1. Sign up at [console.curvegrid.com](https://console.curvegrid.com)
2. Create a new deployment:
   - **Network**: Base Mainnet (or Curvegrid Testnet for development)
   - **Name**: `echain-production`
   - **Region**: Choose closest to your users

#### Configure API Keys
Create three API keys with specific permissions:

1. **Admin Key** (`echain_admin`)
   - Group: `Administrators`
   - Permissions: Full deployment management
   - **⚠️ Keep secure - never expose in frontend**

2. **DApp User Key** (`echain_frontend`)
   - Group: `DApp User`
   - Permissions: Read contract state, create unsigned transactions
   - **✅ Safe for frontend use**

3. **Web3 Proxy Key** (`echain_web3`) - *Curvegrid Testnet only*
   - Option: `Use this key as a public Web3 key`
   - Permissions: RPC access
   - **✅ Safe for frontend use**

#### Configure CORS Origins
Add your frontend URLs to allowed origins:
- Development: `http://localhost:3000`
- Staging: `https://echain-staging.vercel.app`
- Production: `https://echain.app`

### 2. WalletConnect Project Setup

1. Go to [cloud.reown.com](https://cloud.reown.com)
2. Create new project: "Echain Events Platform"
3. Copy the **Project ID**
4. Configure allowed domains in project settings

## 📦 Local Development Setup

### 1. Clone and Install
```bash
git clone https://github.com/your-org/echain.git
cd echain
npm install
```

### 2. Environment Configuration

#### Blockchain Configuration
```bash
cd blockchain
cp deployment-config.template.js deployment-config.development.js
```

Edit `deployment-config.development.js`:
```javascript
module.exports = {
  // Your wallet private key (development only!)
  deployerPrivateKey: "0x1234567890abcdef...", // ⚠️ Never commit this
  
  // MultiBaas deployment URL
  deploymentEndpoint: "https://your-deployment-id.multibaas.com",
  
  // Network configuration
  ethChainID: 2017072401, // Curvegrid Testnet
  // ethChainID: 8453,    // Base Mainnet
  
  // For Curvegrid Testnet
  web3Key: "your_web3_proxy_api_key",
  
  // For Base Mainnet (use instead of web3Key)
  // rpcUrl: "https://mainnet.base.org",
  
  // Admin API key
  adminApiKey: "your_admin_api_key"
};
```

#### Frontend Configuration
```bash
cd frontend
cp .env.template .env.development
```

Edit `.env.development`:
```bash
# WalletConnect
NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=your_reown_project_id

# MultiBaas Configuration
NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL=https://your-deployment-id.multibaas.com
NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY=your_dapp_user_api_key
NEXT_PUBLIC_MULTIBAAS_WEB3_API_KEY=your_web3_proxy_api_key

# Contract Configuration
NEXT_PUBLIC_MULTIBAAS_CHAIN_ID=2017072401
NEXT_PUBLIC_MULTIBAAS_EVENT_FACTORY_LABEL=event_factory
NEXT_PUBLIC_MULTIBAAS_EVENT_FACTORY_ADDRESS=event_factory

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 3. Deploy Smart Contracts

#### Development Deployment
```bash
cd blockchain
npm run deploy:dev
```

This will:
1. Compile all smart contracts
2. Deploy EventFactory to your chosen network
3. Register contracts with MultiBaas
4. Output deployment addresses and transaction hashes

#### Verify Deployment
Check MultiBaas console:
1. Go to **Contracts > On-Chain**
2. Verify `EventFactory` appears in the list
3. Test contract interaction in the MultiBaas interface

### 4. Start Development Servers

#### Backend (Blockchain)
```bash
cd blockchain
npx hardhat node # Optional: Local blockchain
```

#### Frontend
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🌐 Production Deployment

### 1. Base Mainnet Setup

#### Update Network Configuration
Edit `blockchain/deployment-config.production.js`:
```javascript
module.exports = {
  deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY,
  deploymentEndpoint: process.env.MULTIBAAS_PRODUCTION_URL,
  ethChainID: 8453, // Base Mainnet
  rpcUrl: "https://mainnet.base.org",
  adminApiKey: process.env.MULTIBAAS_ADMIN_API_KEY
};
```

#### Environment Variables
Set production environment variables:
```bash
export DEPLOYER_PRIVATE_KEY="0x..."
export MULTIBAAS_PRODUCTION_URL="https://your-prod-deployment.multibaas.com"
export MULTIBAAS_ADMIN_API_KEY="your_prod_admin_key"
```

### 2. Smart Contract Deployment

#### Pre-deployment Checklist
- [ ] Contracts audited by security firm
- [ ] All tests passing (`npm run test`)
- [ ] Gas optimization completed
- [ ] Deployment wallet funded with ETH
- [ ] MultiBaas production deployment configured

#### Deploy to Base Mainnet
```bash
cd blockchain
npm run deploy:production
```

#### Post-deployment Verification
1. **Contract Verification**: Verify source code on BaseScan
2. **Function Testing**: Test all contract functions via MultiBaas
3. **Access Control**: Verify admin permissions are correctly set
4. **Emergency Controls**: Test pause/unpause functionality

### 3. Frontend Deployment

#### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Environment Variables (Vercel)
Configure in Vercel dashboard:
```bash
NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=your_reown_project_id
NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL=https://your-prod-deployment.multibaas.com
NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY=your_prod_dapp_key
NEXT_PUBLIC_MULTIBAAS_CHAIN_ID=8453
NEXT_PUBLIC_MULTIBAAS_EVENT_FACTORY_LABEL=event_factory
```

#### Custom Deployment
For custom hosting (AWS, GCP, etc.):
```bash
cd frontend
npm run build
npm run start
```

### 4. Domain and SSL Setup

#### Custom Domain
1. Configure DNS records to point to your hosting provider
2. Set up SSL certificates (automatic with Vercel)
3. Update CORS settings in MultiBaas to include production domain

## 🔧 Configuration Management

### Environment-Specific Configs

#### Development
```javascript
// blockchain/deployment-config.development.js
module.exports = {
  ethChainID: 2017072401, // Curvegrid Testnet
  web3Key: "dev_web3_key",
  adminApiKey: "dev_admin_key"
};
```

#### Staging
```javascript
// blockchain/deployment-config.staging.js
module.exports = {
  ethChainID: 8453, // Base Mainnet
  rpcUrl: "https://mainnet.base.org",
  adminApiKey: "staging_admin_key"
};
```

#### Production
```javascript
// blockchain/deployment-config.production.js
module.exports = {
  ethChainID: 8453, // Base Mainnet
  rpcUrl: "https://mainnet.base.org",
  adminApiKey: process.env.MULTIBAAS_ADMIN_API_KEY
};
```

### Contract Address Management
Keep track of deployed contract addresses:

```json
{
  "development": {
    "network": "curvegrid-testnet",
    "chainId": 2017072401,
    "contracts": {
      "EventFactory": "0x123...",
      "POAPAttendance": "0x456...",
      "IncentiveManager": "0x789..."
    }
  },
  "production": {
    "network": "base-mainnet",
    "chainId": 8453,
    "contracts": {
      "EventFactory": "0xabc...",
      "POAPAttendance": "0xdef...",
      "IncentiveManager": "0x012..."
    }
  }
}
```

## 🔒 Security Considerations

### Private Key Management
- **Never commit private keys** to version control
- Use environment variables or secure key management services
- Consider using hardware wallets for production deployments
- Implement multi-signature wallets for critical operations

### API Key Security
- Rotate API keys regularly
- Use minimum required permissions for each key
- Monitor API key usage for unusual activity
- Implement rate limiting and abuse detection

### Smart Contract Security
- Complete security audits before mainnet deployment
- Implement emergency pause mechanisms
- Use time-locked upgrades for critical changes
- Monitor contract interactions for suspicious activity

## 📊 Monitoring and Maintenance

### Health Checks
Set up monitoring for:
- **Frontend Uptime**: Service availability
- **API Response Times**: MultiBaas endpoint performance
- **Transaction Success Rates**: Blockchain interaction health
- **Error Rates**: Application and contract errors

### Logging and Analytics
Configure logging for:
- User interactions and behavior
- Transaction failures and errors
- API usage patterns
- Security events and anomalies

### Backup and Recovery
- **Smart Contracts**: Immutable once deployed
- **Frontend Code**: Version control with Git
- **Configuration**: Secure backup of environment variables
- **Analytics Data**: Regular database backups

## 🚨 Troubleshooting

### Common Issues

#### Contract Deployment Fails
```bash
Error: insufficient funds for gas * price + value
```
**Solution**: Ensure deployment wallet has enough ETH for gas fees.

#### Frontend Can't Connect to Contracts
```bash
Error: Contract not found
```
**Solution**: Verify contract addresses in environment variables match deployed contracts.

#### CORS Errors
```bash
Access to fetch blocked by CORS policy
```
**Solution**: Add frontend domain to MultiBaas CORS origins.

#### Transaction Failures
```bash
Error: execution reverted
```
**Solution**: Check contract state and function parameters. Verify user has required permissions/tokens.

### Debug Commands
```bash
# Check contract deployment status
npx hardhat verify --network base 0xContractAddress

# Test MultiBaas connectivity
curl -H "Authorization: Bearer $API_KEY" \
  https://your-deployment.multibaas.com/api/v0/status

# Check frontend build
npm run build && npm run start
```

## 📈 Scaling Considerations

### Performance Optimization
- **Caching**: Implement Redis for frequently accessed data
- **CDN**: Use content delivery networks for static assets
- **Database**: Optimize queries and implement read replicas
- **Load Balancing**: Distribute traffic across multiple instances

### Cost Optimization
- **Gas Optimization**: Use efficient contract patterns
- **Batch Operations**: Group multiple transactions
- **Layer 2**: Consider Polygon or Arbitrum for high-frequency operations
- **IPFS**: Use for large file storage instead of on-chain storage

This deployment guide provides a comprehensive foundation for deploying the Echain platform across different environments while maintaining security and performance best practices.
