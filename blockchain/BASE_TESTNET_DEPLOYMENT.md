# Base Testnet Deployment Guide

This guide walks you through deploying the Echain smart contracts to Base Sepolia testnet using Curvegrid MultiBaas.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MultiBaas Account** with Base Sepolia network configured
3. **Base Sepolia ETH** for deployment (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))
4. **Deployer wallet** with private key

## Setup Instructions

### 1. Environment Configuration

Copy the template configuration file:
```bash
cp deployment-config.base-testnet.template.js deployment-config.base-testnet.js
```

Set the following environment variables:

```bash
# MultiBaas Configuration
export MULTIBAAS_ENDPOINT="https://your-deployment.multibaas.com"
export MULTIBAAS_WEB3_KEY="your_web3_api_key"
export MULTIBAAS_ADMIN_KEY="your_admin_api_key"

# Deployer Configuration
export DEPLOYER_PRIVATE_KEY="0x..."

# Optional: Custom RPC (defaults to public Base Sepolia RPC)
export BASE_TESTNET_RPC_URL="https://sepolia.base.org"
```

### 2. MultiBaas API Keys

Create API keys in your MultiBaas dashboard:

1. **Web3 API Key**: Navigation bar > Admin > API Keys
   - Must be in the "Web3" group
   - Used for web3 endpoint access

2. **Admin API Key**: Navigation bar > Admin > API Keys  
   - Must be in the "Administrators" group
   - Used for deployment and contract management

### 3. Get Testnet Funds

1. Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Request testnet ETH for your deployer address
3. Minimum required: 0.01 ETH (recommended: 0.05 ETH)

### 4. Run Pre-deployment Checks

```bash
./setup-base-deployment.sh
```

This script will verify:
- Node.js version
- Dependencies installation
- Configuration file existence
- Network connectivity
- Environment setup

## Deployment Commands

### Option 1: Direct Hardhat Deployment

```bash
export HARDHAT_NETWORK=base-testnet
npx hardhat run scripts/deploy-base-testnet.ts --network base-testnet
```

### Option 2: MultiBaas Deployment

```bash
HARDHAT_NETWORK=base-testnet npx hardhat mb-deploy --network base-testnet
```

## Network Information

- **Network Name**: Base Sepolia
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia-explorer.base.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

## Post-Deployment

After successful deployment:

1. **Verify Contracts**: Visit the block explorer links provided in deployment output
2. **Update Frontend**: Copy contract addresses to your frontend configuration
3. **Test Functionality**: Create test events and verify all features work
4. **Monitor**: Set up monitoring for contract events and transactions

## Frontend Configuration

Update your frontend `.env` file with the deployed contract addresses:

```env
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_POAP_ADDRESS=0x...
NEXT_PUBLIC_INCENTIVE_ADDRESS=0x...
```

## Troubleshooting

### Common Issues

1. **Insufficient Balance**: Ensure deployer wallet has enough Base Sepolia ETH
2. **Network Mismatch**: Verify you're connected to Base Sepolia (Chain ID: 84532)
3. **API Key Issues**: Ensure API keys are in correct groups (Web3 and Administrators)
4. **RPC Issues**: Try using a different RPC endpoint if deployment fails

### Support Resources

- [Base Documentation](https://docs.base.org/)
- [MultiBaas Documentation](https://docs.curvegrid.com/)
- [Hardhat Documentation](https://hardhat.org/docs)

## Security Notes

- **Never commit** actual private keys or API keys to git
- Use environment variables for all sensitive configuration
- The `deployment-config.base-testnet.js` file is gitignored for security
- Keep your MultiBaas API keys secure and rotate them regularly
