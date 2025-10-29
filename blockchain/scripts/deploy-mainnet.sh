#!/bin/bash

# Base Mainnet Deployment Script with Premium Node Providers
# Deploys Echain contracts to Base Mainnet with verification and monitoring

set -e

echo "🚀 Echain Base Mainnet Deployment"
echo "=================================="
echo ""

# Check for required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set"
    exit 1
fi

if [ -z "$BASESCAN_API_KEY" ]; then
    echo "❌ Error: BASESCAN_API_KEY not set"
    exit 1
fi

# Determine which RPC to use (priority: Chainstack > Spectrum > Coinbase > Public)
if [ -n "$BASE_MAINNET_CHAINSTACK_RPC" ]; then
    RPC_URL="$BASE_MAINNET_CHAINSTACK_RPC"
    PROVIDER="Chainstack"
elif [ -n "$BASE_MAINNET_SPECTRUM_RPC" ]; then
    RPC_URL="$BASE_MAINNET_SPECTRUM_RPC"
    PROVIDER="Spectrum Nodes"
elif [ -n "$BASE_MAINNET_COINBASE_RPC" ]; then
    RPC_URL="$BASE_MAINNET_COINBASE_RPC"
    PROVIDER="Coinbase"
else
    RPC_URL="https://mainnet.base.org"
    PROVIDER="Public RPC (Warning: Rate limited)"
fi

echo "📡 Using RPC Provider: $PROVIDER"
echo "🔗 RPC URL: ${RPC_URL:0:30}..."
echo ""

# Test RPC connection
echo "🔍 Testing RPC connection..."
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    "$RPC_URL" || echo "999")

RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc)
echo "⏱️  RPC Latency: ${RESPONSE_MS}ms"

if (( $(echo "$RESPONSE_MS > 1000" | bc -l) )); then
    echo "⚠️  Warning: High latency detected. Consider using premium provider."
fi
echo ""

# Deploy contracts
echo "📝 Deploying contracts to Base Mainnet..."
echo ""

# Deploy using Forge with the selected RPC
forge script scripts/DeployEventFactory.s.sol:DeployEventFactory \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify \
    --etherscan-api-key "$BASESCAN_API_KEY" \
    -vvvv

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
else
    echo ""
    echo "❌ Deployment failed!"
    exit 1
fi

# Extract deployment addresses from broadcast
BROADCAST_FILE="broadcast/DeployEventFactory.s.sol/8453/run-latest.json"

if [ -f "$BROADCAST_FILE" ]; then
    echo ""
    echo "📋 Extracting deployment addresses..."
    
    # Parse JSON and extract addresses (requires jq)
    if command -v jq &> /dev/null; then
        EVENT_FACTORY=$(jq -r '.transactions[] | select(.contractName == "EventFactory") | .contractAddress' "$BROADCAST_FILE")
        
        echo ""
        echo "📍 Deployed Contract Addresses:"
        echo "================================"
        echo "EventFactory: $EVENT_FACTORY"
        echo ""
        echo "🔍 Verify on BaseScan:"
        echo "https://basescan.org/address/$EVENT_FACTORY"
        echo ""
        
        # Save deployment info
        TIMESTAMP=$(date +%s%3N)
        DEPLOYMENT_FILE="deployments/base-mainnet-deployment-$TIMESTAMP.json"
        
        cat > "$DEPLOYMENT_FILE" <<EOF
{
  "network": "base-mainnet",
  "chainId": 8453,
  "timestamp": $TIMESTAMP,
  "provider": "$PROVIDER",
  "rpcLatency": "${RESPONSE_MS}ms",
  "contracts": {
    "EventFactory": "$EVENT_FACTORY"
  },
  "verification": {
    "basescan": "https://basescan.org/address/$EVENT_FACTORY"
  }
}
EOF
        
        echo "💾 Deployment info saved to: $DEPLOYMENT_FILE"
        echo ""
    else
        echo "⚠️  Warning: jq not installed. Cannot extract addresses automatically."
        echo "   Install jq to enable automatic address extraction."
    fi
fi

# Post-deployment validation
echo "🔍 Running post-deployment checks..."
echo ""

# Test contract call
cast call "$EVENT_FACTORY" "owner()(address)" --rpc-url "$RPC_URL"

if [ $? -eq 0 ]; then
    echo "✅ Contract is callable and verified"
else
    echo "⚠️  Warning: Contract call test failed"
fi

echo ""
echo "✨ Deployment Complete!"
echo ""
echo "Next Steps:"
echo "1. Update frontend .env.local with new contract addresses"
echo "2. Test contract functions on BaseScan"
echo "3. Monitor RPC performance in production"
echo "4. Enable monitoring alerts for contract events"
echo ""
