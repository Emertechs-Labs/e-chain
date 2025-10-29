#!/bin/bash

# Production POAP Testing Script for Echain Smart Contracts
# Tests POAP (Proof of Attendance Protocol) functionality using direct contract calls

RPC_URL="https://sepolia.base.org"
TIMESTAMP=$(date +%s)
RESULTS_FILE="poap_test_results_$(date +%Y%m%d_%H%M%S).log"

echo "🏆 ECHAIN POAP CONTRACT TESTING 🏆" | tee $RESULTS_FILE
echo "==================================" | tee -a $RESULTS_FILE
echo "RPC URL: $RPC_URL" | tee -a $RESULTS_FILE
echo "Test Time: $(date)" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Check if cast is available
if ! command -v cast &> /dev/null; then
    echo "❌ cast (from Foundry) is not installed. Please install Foundry first." | tee -a $RESULTS_FILE
    echo "   Visit: https://book.getfoundry.sh/getting-started/installation" | tee -a $RESULTS_FILE
    exit 1
fi

# POAP Contract Address (from your deployment)
POAP_CONTRACT="0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33"
USER_ADDRESS="0x5474bA789F5CbD31aea2BcA1939989746242680D"

# Test 1: Check POAP Contract Info
echo "🔍 Test 1: Check POAP Contract Info" | tee -a $RESULTS_FILE
echo "------------------------------------" | tee -a $RESULTS_FILE
echo "Testing POAP contract basic info..." | tee -a $RESULTS_FILE
NAME=$(cast call $POAP_CONTRACT "name()" --rpc-url $RPC_URL)
echo "POAP Contract Name: $NAME" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 2: Check POAP Symbol
echo "🔍 Test 2: Check POAP Symbol" | tee -a $RESULTS_FILE
echo "-----------------------------" | tee -a $RESULTS_FILE
echo "Getting POAP contract symbol..." | tee -a $RESULTS_FILE
SYMBOL=$(cast call $POAP_CONTRACT "symbol()" --rpc-url $RPC_URL)
echo "POAP Contract Symbol: $SYMBOL" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE
    "blockchain": "base-sepolia",
    "traceId": "poap-symbol-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 3: Check Total POAP Supply
echo "🔍 Test 3: Check Total POAP Supply" | tee -a $RESULTS_FILE
echo "-----------------------------------" | tee -a $RESULTS_FILE
echo "Getting total POAP supply..." | tee -a $RESULTS_FILE
TOTAL_SUPPLY=$(cast call $POAP_CONTRACT "totalSupply()" --rpc-url $RPC_URL)
echo "Total POAP Supply: $TOTAL_SUPPLY" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 4: Check User POAP Balance
echo "🔍 Test 4: Check User POAP Balance" | tee -a $RESULTS_FILE
echo "-----------------------------------" | tee -a $RESULTS_FILE
echo "Checking user POAP balance..." | tee -a $RESULTS_FILE
BALANCE=$(cast call $POAP_CONTRACT "balanceOf(address)" $USER_ADDRESS --rpc-url $RPC_URL)
echo "User POAP Balance: $BALANCE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 5: Test Event Claim Eligibility
echo "🔍 Test 5: Test Event Claim Eligibility" | tee -a $RESULTS_FILE
echo "----------------------------------------" | tee -a $RESULTS_FILE
echo "Testing POAP claim eligibility for event 1..." | tee -a $RESULTS_FILE
CAN_CLAIM=$(cast call $POAP_CONTRACT "canClaimPOAP(address,uint256)" $USER_ADDRESS 1 --rpc-url $RPC_URL)
echo "Can Claim POAP for Event 1: $CAN_CLAIM" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 6: Check POAP Metadata
echo "🔍 Test 6: Check POAP Metadata" | tee -a $RESULTS_FILE
echo "-------------------------------" | tee -a $RESULTS_FILE
echo "Getting POAP token metadata for token ID 1..." | tee -a $RESULTS_FILE
TOKEN_URI=$(cast call $POAP_CONTRACT "tokenURI(uint256)" 1 --rpc-url $RPC_URL)
echo "Token URI for ID 1: $TOKEN_URI" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 7: Check POAP Ownership
echo "🔍 Test 7: Check POAP Ownership" | tee -a $RESULTS_FILE
echo "--------------------------------" | tee -a $RESULTS_FILE
echo "Checking ownership of POAP token ID 1..." | tee -a $RESULTS_FILE
if [ "$TOTAL_SUPPLY" -gt 0 ]; then
    OWNER=$(cast call $POAP_CONTRACT "ownerOf(uint256)" 1 --rpc-url $RPC_URL)
    echo "Owner of Token ID 1: $OWNER" | tee -a $RESULTS_FILE
else
    echo "No POAP tokens minted yet" | tee -a $RESULTS_FILE
fi
echo "" | tee -a $RESULTS_FILE

echo "🏁 POAP CONTRACT TESTING COMPLETED!" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "POAP contract tested: $POAP_CONTRACT" | tee -a $RESULTS_FILE
echo "User address tested: $USER_ADDRESS" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE
echo "Note: These are contract read operations. Actual POAP claiming requires" | tee -a $RESULTS_FILE
echo "the user to have attended the event and possess valid tickets." | tee -a $RESULTS_FILE