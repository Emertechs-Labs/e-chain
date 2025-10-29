# Base Testnet Deployment Guide

This guide walks you through deploying the Echain smart contracts directly to Base Sepolia testnet.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Base Sepolia ETH** for deployment (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))
3. **Deployer wallet** with private key
4. **BaseScan API Key** for contract verification (optional)

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the blockchain directory:

```bash
# Deployer wallet private key (must have Base Sepolia ETH)
DEPLOYER_PRIVATE_KEY="0x..."

# Optional: Custom Base Sepolia RPC URL (defaults to public RPC)
BASE_TESTNET_RPC_URL="https://sepolia.base.org"

# Optional: BaseScan API Key for contract verification
BASESCAN_API_KEY="YOUR_BASESCAN_API_KEY_HERE"
```

### 2. Get Testnet Funds

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

Deploy the contracts directly to Base Sepolia:

```bash
# Set your private key
export PRIVATE_KEY="0x..."

# Deploy EventFactory and related contracts
forge script scripts/DeployEventFactory.s.sol --rpc-url https://sepolia.base.org --private-key $PRIVATE_KEY --broadcast --verify
```

### Alternative Deployment Methods

For more complex deployments, you can also use:

```bash
# Deploy without verification (faster)
forge script scripts/DeployEventFactory.s.sol --rpc-url https://sepolia.base.org --private-key $PRIVATE_KEY --broadcast

# Deploy to local testnet first
forge script scripts/DeployEventFactory.s.sol --rpc-url http://localhost:8545 --private-key $PRIVATE_KEY --broadcast
```

## Network Information

- **Network Name**: Base Sepolia
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
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
3. **RPC Issues**: Try using a different RPC endpoint if deployment fails
4. **Gas Estimation**: Base Sepolia may have variable gas prices

### Support Resources

- [Base Documentation](https://docs.base.org/)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [Echain Deployment Guide](../docs/deployment/DEPLOYMENT_CHECKLIST.md)

## Security Notes

- **Never commit** actual private keys to git
- Use environment variables for all sensitive configuration
- Keep your BaseScan API key secure
- Test all functionality thoroughly before mainnet deployment
