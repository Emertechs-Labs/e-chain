#!/bin/bash

echo "🔧 Echain Base Testnet Deployment Setup"
echo "======================================="

# Check if we're in the blockchain directory
if [ ! -f "foundry.toml" ]; then
    echo "❌ Please run this script from the blockchain directory"
    exit 1
fi

echo "📋 Pre-deployment Checklist:"
echo ""

# Check Node.js version
echo "1. 📦 Checking Node.js version..."
node_version=$(node --version)
echo "   Node.js version: $node_version"

# Check if dependencies are installed
echo ""
echo "2. 📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ⚠️  Dependencies not found. Installing..."
    npm install
fi

# Check for environment variables
echo ""
echo "3. 🔑 Environment Configuration:"
echo "   Please ensure you have set the following environment variables:"
echo ""
echo "   Required for Direct Base Sepolia Deployment:"
echo "   - DEPLOYER_PRIVATE_KEY=0x..."
echo ""
echo "   Optional (will use Base Sepolia public RPC if not set):"
echo "   - BASE_TESTNET_RPC_URL=https://sepolia.base.org"
echo ""

# Check if config file exists
if [ -f "deployment-config.base-testnet.js" ]; then
    echo "   ✅ Base testnet configuration file exists"
else
    echo "   ❌ Base testnet configuration file missing"
    exit 1
fi

echo ""
echo "4. 💰 Funding Requirements:"
echo "   - Ensure your deployer wallet has Base Sepolia ETH"
echo "   - Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
echo "   - Minimum required: 0.01 ETH (recommended: 0.05 ETH)"
echo ""

echo "5. 🌐 Base Sepolia Network Info:"
echo "   - Chain ID: 84532"
echo "   - RPC URL: https://sepolia.base.org"
echo "   - Block Explorer: https://sepolia-explorer.base.org"
echo ""

echo "🚀 Ready to Deploy!"
echo ""
echo "To deploy to Base testnet, run:"
echo "   export PRIVATE_KEY=0x..."
echo "   forge script scripts/DeployEventFactory.s.sol --rpc-url https://sepolia.base.org --private-key \$PRIVATE_KEY --broadcast --verify"
echo ""

# Optional: Check if we can connect to the network
echo "6. 🔍 Network Connectivity Test:"
if command -v curl &> /dev/null; then
    echo "   Testing Base Sepolia RPC..."
    response=$(curl -s -X POST https://sepolia.base.org \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}')
    
    if echo "$response" | grep -q "0x14a34"; then
        echo "   ✅ Base Sepolia RPC is accessible"
    else
        echo "   ⚠️  Base Sepolia RPC connectivity issue"
    fi
else
    echo "   ⚠️  curl not available, skipping connectivity test"
fi

echo ""
echo "📚 Additional Resources:"
echo "   - Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
echo "   - Base Docs: https://docs.base.org/"
echo "   - Echain Deployment Guide: ../docs/deployment/DEPLOYMENT_CHECKLIST.md"
echo ""
