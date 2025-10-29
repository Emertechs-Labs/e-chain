#!/bin/bash

# POAP Testing Script for Echain Smart Contracts
# Tests POAP-related functionality using direct contract calls

RPC_URL="https://sepolia.base.org"
TIMESTAMP=$(date +%s)
RESULTS_FILE="poap_test_results_$(date +%Y%m%d_%H%M%S).log"

# Contract addresses
POAP_ADDRESS="0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33"
EVENT_FACTORY_ADDRESS="0xA97cB40548905B05A67fCD4765438aFBEA4030fc"

# Test wallet addresses
USER_ADDRESS="0x742d35Cc6634C0532925a3b8D267F5B8b8a8d3A1"
EVENT_ID="1"

echo "🏆 ECHAIN POAP CONTRACT TESTING 🏆" | tee $RESULTS_FILE
echo "==================================" | tee -a $RESULTS_FILE
echo "RPC URL: $RPC_URL" | tee -a $RESULTS_FILE
echo "Test Time: $(date)" | tee -a $RESULTS_FILE
echo "POAP Contract: $POAP_ADDRESS" | tee -a $RESULTS_FILE
echo "Event Factory: $EVENT_FACTORY_ADDRESS" | tee -a $RESULTS_FILE
echo "User Address: $USER_ADDRESS" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Check if cast is available
if ! command -v cast &> /dev/null; then
    echo "❌ cast (from Foundry) is not installed. Please install Foundry first." | tee -a $RESULTS_FILE
    echo "   Visit: https://book.getfoundry.sh/getting-started/installation" | tee -a $RESULTS_FILE
    exit 1
fi

# Step 1: Check POAP Contract Version
echo "🔍 Step 1: Check POAP Contract Version" | tee -a $RESULTS_FILE
echo "----------------------------------------" | tee -a $RESULTS_FILE
echo "Checking POAP contract version..." | tee -a $RESULTS_FILE
VERSION=$(cast call $POAP_ADDRESS "version()" --rpc-url $RPC_URL)
echo "POAP Contract Version: $VERSION" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 2: Check User's Current POAP Balance
echo "🎖️ Step 2: Check Current POAP Balance" | tee -a $RESULTS_FILE
echo "--------------------------------------" | tee -a $RESULTS_FILE
echo "Checking POAP balance for $USER_ADDRESS..." | tee -a $RESULTS_FILE
BALANCE=$(cast call $POAP_ADDRESS "balanceOf(address)" $USER_ADDRESS --rpc-url $RPC_URL)
echo "POAP Balance: $BALANCE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE
    "args": ["'$USER_ADDRESS'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "84532",
    "traceId": "poap-balance-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 3: Check POAP Claim Eligibility
echo "✅ Step 3: Check POAP Claim Eligibility" | tee -a $RESULTS_FILE
echo "---------------------------------------" | tee -a $RESULTS_FILE
echo "Checking if user can claim POAP for event $EVENT_ID..." | tee -a $RESULTS_FILE
ELIGIBLE=$(cast call $POAP_ADDRESS "canClaimPOAP(address,uint256)" $USER_ADDRESS $EVENT_ID --rpc-url $RPC_URL)
echo "Can Claim POAP: $ELIGIBLE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 4: Check if User Already Has POAP for Event
echo "🏷️ Step 4: Check Existing POAP for Event" | tee -a $RESULTS_FILE
echo "-----------------------------------------" | tee -a $RESULTS_FILE
echo "Checking if user already has POAP for event $EVENT_ID..." | tee -a $RESULTS_FILE
HAS_POAP=$(cast call $POAP_ADDRESS "hasPOAP(address,uint256)" $USER_ADDRESS $EVENT_ID --rpc-url $RPC_URL)
echo "Has POAP: $HAS_POAP" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 5: Check POAP Token URI
echo "🖼️ Step 5: Check POAP Token URI" | tee -a $RESULTS_FILE
echo "--------------------------------" | tee -a $RESULTS_FILE
echo "Checking POAP token URI for event $EVENT_ID..." | tee -a $RESULTS_FILE
TOKEN_URI=$(cast call $POAP_ADDRESS "tokenURI(uint256)" $EVENT_ID --rpc-url $RPC_URL)
echo "Token URI: $TOKEN_URI" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 6: Check Event POAP Total Supply
echo "📊 Step 6: Check Event POAP Total Supply" | tee -a $RESULTS_FILE
echo "----------------------------------------" | tee -a $RESULTS_FILE
echo "Checking total POAP supply for event $EVENT_ID..." | tee -a $RESULTS_FILE
TOTAL_SUPPLY=$(cast call $POAP_ADDRESS "totalSupply(uint256)" $EVENT_ID --rpc-url $RPC_URL)
echo "Total Supply: $TOTAL_SUPPLY" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 7: Check POAP Ownership (if token exists)
echo "👤 Step 7: Check POAP Ownership" | tee -a $RESULTS_FILE
echo "-------------------------------" | tee -a $RESULTS_FILE
echo "Checking who owns the POAP for event $EVENT_ID..." | tee -a $RESULTS_FILE
if [ "$TOTAL_SUPPLY" -gt 0 ]; then
    OWNER=$(cast call $POAP_ADDRESS "ownerOf(uint256)" $EVENT_ID --rpc-url $RPC_URL)
    echo "Owner: $OWNER" | tee -a $RESULTS_FILE
else
    echo "No POAP tokens minted for this event yet" | tee -a $RESULTS_FILE
fi
echo "" | tee -a $RESULTS_FILE

# Step 8: Check Event Attendance Requirements
echo "� Step 8: Check Attendance Requirements" | tee -a $RESULTS_FILE
echo "-----------------------------------------" | tee -a $RESULTS_FILE
echo "Checking attendance requirements for POAP eligibility..." | tee -a $RESULTS_FILE
ATTENDANCE_REQ=$(cast call $POAP_ADDRESS "getAttendanceRequirement(uint256)" $EVENT_ID --rpc-url $RPC_URL)
echo "Attendance Requirement: $ATTENDANCE_REQ" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 9: Check if Event Allows POAP Claims
echo "� Step 9: Check POAP Claim Status" | tee -a $RESULTS_FILE
echo "-----------------------------------" | tee -a $RESULTS_FILE
echo "Checking if event allows POAP claims..." | tee -a $RESULTS_FILE
CLAIM_ENABLED=$(cast call $POAP_ADDRESS "isPOAPClaimEnabled(uint256)" $EVENT_ID --rpc-url $RPC_URL)
echo "POAP Claim Enabled: $CLAIM_ENABLED" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 10: Check Event Details from EventFactory
echo "� Step 10: Check Event Details" | tee -a $RESULTS_FILE
echo "-------------------------------" | tee -a $RESULTS_FILE
echo "Checking event details from EventFactory..." | tee -a $RESULTS_FILE
EVENT_DATA=$(cast call $EVENT_FACTORY_ADDRESS "events(uint256)" $EVENT_ID --rpc-url $RPC_URL)
echo "Event Data: $EVENT_DATA" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

echo "🏁 POAP CONTRACT TESTING COMPLETED!" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo ""
echo "Summary of POAP contract tests performed:"
echo "✓ POAP contract version check"
echo "✓ User POAP balance verification"
echo "✓ Claim eligibility assessment"
echo "✓ Existing POAP ownership check"
echo "✓ Token URI and metadata access"
echo "✓ Total supply verification"
echo "✓ Ownership verification"
echo "✓ Attendance requirements check"
echo "✓ Claim status verification"
echo "✓ Event details verification"
echo ""
echo "Next steps:"
echo "1. Review results in $RESULTS_FILE"
echo "2. Test contract interactions with actual transactions"
echo "3. Verify POAP metadata and images"
echo "4. Test with multiple events and users"