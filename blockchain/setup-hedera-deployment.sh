#!/bin/bash

echo "🔧 Echain Hedera Testnet Deployment Setup"
echo "=========================================="

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
echo "   Please ensure you have set the following environment variables in .env:"
echo ""
echo "   Required for Hedera Testnet Deployment:"
echo "   - DEPLOYER_PRIVATE_KEY=0x... (ECDSA private key)"
echo "   - HEDERA_ACCOUNT_ID=0.0.xxxxx (Your Hedera account ID)"
echo ""

# Check if .env file has Hedera config
if grep -q "HEDERA_ACCOUNT_ID" .env; then
    echo "   ✅ Hedera configuration found in .env"
else
    echo "   ❌ Hedera configuration missing in .env"
    echo "   Please update .env with Hedera testnet settings"
    exit 1
fi

# Check if private key is set
if grep -q "DEPLOYER_PRIVATE_KEY=\"\"" .env; then
    echo "   ❌ DEPLOYER_PRIVATE_KEY not set in .env"
    echo "   Please set your Hedera private key"
    exit 1
else
    echo "   ✅ DEPLOYER_PRIVATE_KEY appears to be set"
fi

# Check if account ID is set
if grep -q "HEDERA_ACCOUNT_ID=\"\"" .env; then
    echo "   ❌ HEDERA_ACCOUNT_ID not set in .env"
    echo "   Please set your Hedera account ID"
    exit 1
else
    echo "   ✅ HEDERA_ACCOUNT_ID appears to be set"
fi

echo ""
echo "4. 💰 Funding Requirements:"
echo "   - Ensure your Hedera account has test HBAR"
echo "   - Get test HBAR from: https://portal.hedera.com/faucet"
echo "   - Minimum required: 10 HBAR (recommended: 100 HBAR)"
echo "   - Check balance: https://hashscan.io/#/testnet/accounts/YOUR_ACCOUNT_ID"
echo ""

echo "5. 🌐 Hedera Testnet Network Info:"
echo "   - Chain ID: 296"
echo "   - RPC URL: https://testnet.hashio.io/api"
echo "   - Block Explorer: https://hashscan.io/#/testnet"
echo "   - Faucet: https://portal.hedera.com/faucet"
echo ""

echo "🚀 Ready to Deploy!"
echo ""
echo "To deploy to Hedera testnet, run:"
echo "   npm run deploy:multisig:testnet"
echo ""

# Optional: Check if we can connect to the network
echo "6. 🔍 Network Connectivity Test:"
if command -v curl &> /dev/null; then
    echo "   Testing Hedera testnet RPC..."
    response=$(curl -s -X POST https://testnet.hashio.io/api \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}')

    if echo "$response" | grep -q "0x128"; then
        echo "   ✅ Hedera testnet RPC is accessible"
    else
        echo "   ⚠️  Hedera testnet RPC connectivity issue"
        echo "   Response: $response"
    fi
else
    echo "   ⚠️  curl not available, skipping connectivity test"
fi

echo ""
echo "📚 Additional Resources:"
echo "   - Hedera Developer Docs: https://docs.hedera.com/"
echo "   - HashScan Explorer: https://hashscan.io/#/testnet"
echo "   - Hedera Faucet: https://portal.hedera.com/faucet"
echo "   - Echain Deployment Guide: ../docs/deployment/DEPLOYMENT_CHECKLIST.md"
echo ""

echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "   - Never commit private keys to version control"
echo "   - Use environment variables or secure key management"
echo "   - Test thoroughly on testnet before mainnet deployment"
echo ""