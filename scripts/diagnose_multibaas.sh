#!/bin/bash

# MultiBaas Diagnostic Script
# Helps identify the exact blockchain configuration issue

BASE_URL="https://echain-eight.vercel.app"
TIMESTAMP=$(date +%s)

echo "🔍 MULTIBAAS CONFIGURATION DIAGNOSTIC"
echo "====================================="
echo "Base URL: $BASE_URL"
echo "Timestamp: $TIMESTAMP"
echo ""

echo "📋 Step 1: Testing Different Chain Identifiers"
echo "----------------------------------------------"

# List of possible chain identifiers to test
CHAIN_IDENTIFIERS=(
    "84532"
    "base-sepolia"
    "eip155-84532"
    "base-testnet"
    "base"
    ""
)

for chain in "${CHAIN_IDENTIFIERS[@]}"; do
    echo "Testing chain identifier: '$chain'"
    
    if [ -z "$chain" ]; then
        # Test without blockchain parameter
        RESPONSE=$(curl -s -w "Status: %{http_code}" \
            -X POST "$BASE_URL/api/multibaas/unsigned" \
            -H "Content-Type: application/json" \
            -d '{
                "address": "0xA97cB40548905B05A67fCD4765438aFBEA4030fc",
                "contractLabel": "eventfactory",
                "method": "version",
                "args": [],
                "from": "0x0000000000000000000000000000000000000000",
                "traceId": "test-no-blockchain-'$TIMESTAMP'"
            }')
    else
        # Test with blockchain parameter
        RESPONSE=$(curl -s -w "Status: %{http_code}" \
            -X POST "$BASE_URL/api/multibaas/unsigned" \
            -H "Content-Type: application/json" \
            -d '{
                "address": "0xA97cB40548905B05A67fCD4765438aFBEA4030fc",
                "contractLabel": "eventfactory",
                "method": "version",
                "args": [],
                "from": "0x0000000000000000000000000000000000000000",
                "blockchain": "'$chain'",
                "traceId": "test-'$chain'-'$TIMESTAMP'"
            }')
    fi
    
    echo "Response: $RESPONSE"
    echo ""
done

echo "📋 Step 2: Testing Contract Aliases"
echo "-----------------------------------"

# List of possible contract aliases
CONTRACT_ALIASES=(
    "0xA97cB40548905B05A67fCD4765438aFBEA4030fc"
    "eventfactory"
    "EventFactory"
    "0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C"
    "eventticket"
    "0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33"
    "poapattendance"
)

for alias in "${CONTRACT_ALIASES[@]}"; do
    echo "Testing contract alias: '$alias'"
    
    RESPONSE=$(curl -s -w "Status: %{http_code}" \
        -X POST "$BASE_URL/api/multibaas/unsigned" \
        -H "Content-Type: application/json" \
        -d '{
            "address": "'$alias'",
            "contractLabel": "eventfactory",
            "method": "version",
            "args": [],
            "from": "0x0000000000000000000000000000000000000000",
            "traceId": "test-alias-'$alias'-'$TIMESTAMP'"
        }')
    
    echo "Response: $RESPONSE"
    echo ""
done

echo "📋 Step 3: Testing Alternative API Endpoints"
echo "--------------------------------------------"

echo "Testing debug endpoint..."
curl -s "$BASE_URL/api/debug/unsigned-tx?method=version" 2>/dev/null | head -c 300
echo ""

echo "Testing organizer approve endpoint..."
curl -s -X POST "$BASE_URL/api/organizer/approve" \
    -H "Content-Type: application/json" \
    -d '{"organizerAddress": "0x5474bA789F5CbD31aea2BcA1939989746242680D"}' 2>/dev/null | head -c 300
echo ""

echo "📋 Step 4: Environment Variable Check"
echo "--------------------------------------"

echo "Testing configuration exposure..."
curl -s "$BASE_URL/api/debug/unsigned-tx" \
    -H "Accept: application/json" 2>/dev/null | head -c 500
echo ""

echo "📋 Step 5: Direct MultiBaas SDK Test"
echo "------------------------------------"

echo "Testing getUnsignedTransactionForChain variations..."

# Test different chain formats with the getUnsignedTransactionForChain function
CHAIN_FORMATS=(
    "base-sepolia"
    "eip155-84532" 
    "84532"
)

for chain_format in "${CHAIN_FORMATS[@]}"; do
    echo "Testing chain format: '$chain_format'"
    
    RESPONSE=$(curl -s -w "Status: %{http_code}" \
        -X POST "$BASE_URL/api/multibaas/verify-organizer" \
        -H "Content-Type: application/json" \
        -d '{
            "organizerAddress": "0x5474bA789F5CbD31aea2BcA1939989746242680D",
            "blockchain": "'$chain_format'",
            "traceId": "test-verify-'$chain_format'-'$TIMESTAMP'"
        }')
    
    echo "Response: $RESPONSE"
    echo ""
done

echo "🏁 DIAGNOSTIC COMPLETE"
echo "====================="
echo ""
echo "Analysis Tips:"
echo "1. Look for any 200 status responses - those indicate working configurations"
echo "2. Check error messages for clues about the correct chain identifier"
echo "3. If all tests fail with 'blockchain not found', the MultiBaas deployment may need configuration"
echo "4. Compare successful vs failed responses to identify the pattern"
echo ""
echo "Next Steps:"
echo "1. If you find working configurations, update your environment variables"
echo "2. If all fail, check your MultiBaas dashboard for blockchain configuration"
echo "3. Verify contract deployments and aliases in MultiBaas"