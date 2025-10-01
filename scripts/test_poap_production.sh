#!/bin/bash

# Production POAP Testing Script for Echain DApp
# Tests POAP (Proof of Attendance Protocol) functionality

BASE_URL="https://echain-eight.vercel.app"
TIMESTAMP=$(date +%s)
RESULTS_FILE="poap_test_results_$(date +%Y%m%d_%H%M%S).log"

echo "🏆 ECHAIN POAP TESTING 🏆" | tee $RESULTS_FILE
echo "=========================" | tee -a $RESULTS_FILE
echo "Base URL: $BASE_URL" | tee -a $RESULTS_FILE
echo "Test Time: $(date)" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# POAP Contract Address (from your deployment)
POAP_CONTRACT="0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33"
USER_ADDRESS="0x5474bA789F5CbD31aea2BcA1939989746242680D"

# Test 1: Check POAP Contract Info
echo "🔍 Test 1: Check POAP Contract Info" | tee -a $RESULTS_FILE
echo "------------------------------------" | tee -a $RESULTS_FILE
echo "Testing POAP contract basic info..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$POAP_CONTRACT'",
    "contractLabel": "poapattendance",
    "method": "name",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "poap-name-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 2: Check POAP Symbol
echo "🔍 Test 2: Check POAP Symbol" | tee -a $RESULTS_FILE
echo "-----------------------------" | tee -a $RESULTS_FILE
echo "Getting POAP contract symbol..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$POAP_CONTRACT'",
    "contractLabel": "poapattendance",
    "method": "symbol",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "poap-symbol-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 3: Check Total POAP Supply
echo "🔍 Test 3: Check Total POAP Supply" | tee -a $RESULTS_FILE
echo "-----------------------------------" | tee -a $RESULTS_FILE
echo "Getting total POAP supply..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$POAP_CONTRACT'",
    "contractLabel": "poapattendance",
    "method": "totalSupply",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "poap-total-supply-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 4: Check User POAP Balance
echo "🔍 Test 4: Check User POAP Balance" | tee -a $RESULTS_FILE
echo "-----------------------------------" | tee -a $RESULTS_FILE
echo "Checking user POAP balance..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$POAP_CONTRACT'",
    "contractLabel": "poapattendance",
    "method": "balanceOf",
    "args": ["'$USER_ADDRESS'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "poap-user-balance-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 5: Test Event Claim Eligibility
echo "🔍 Test 5: Test Event Claim Eligibility" | tee -a $RESULTS_FILE
echo "----------------------------------------" | tee -a $RESULTS_FILE
echo "Testing POAP claim eligibility for event 1..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$POAP_CONTRACT'",
    "contractLabel": "poapattendance",
    "method": "canClaimPOAP",
    "args": ["'$USER_ADDRESS'", 1],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "poap-can-claim-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 6: Generate POAP Claim Transaction
echo "🔍 Test 6: Generate POAP Claim Transaction" | tee -a $RESULTS_FILE
echo "-------------------------------------------" | tee -a $RESULTS_FILE
echo "Generating unsigned POAP claim transaction..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$POAP_CONTRACT'",
    "contractLabel": "poapattendance",
    "method": "claimPOAP",
    "args": [1],
    "from": "'$USER_ADDRESS'",
    "blockchain": "base-sepolia",
    "traceId": "poap-claim-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 7: Check POAP Metadata
echo "🔍 Test 7: Check POAP Metadata" | tee -a $RESULTS_FILE
echo "-------------------------------" | tee -a $RESULTS_FILE
echo "Getting POAP token metadata for token ID 1..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$POAP_CONTRACT'",
    "contractLabel": "poapattendance",
    "method": "tokenURI",
    "args": [1],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "poap-metadata-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 8: API Endpoint Test
echo "🔍 Test 8: POAP API Endpoint Test" | tee -a $RESULTS_FILE
echo "----------------------------------" | tee -a $RESULTS_FILE
echo "Testing POAP claim API endpoint..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/poap/claim" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "userAddress": "'$USER_ADDRESS'",
    "poapContract": "'$POAP_CONTRACT'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

echo "🏁 POAP TESTING COMPLETED!" | tee -a $RESULTS_FILE
echo "===========================" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "POAP contract tested: $POAP_CONTRACT" | tee -a $RESULTS_FILE
echo "User address tested: $USER_ADDRESS" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE
echo "Note: These are test transactions. Actual POAP claiming requires" | tee -a $RESULTS_FILE
echo "the user to have attended the event and possess valid tickets." | tee -a $RESULTS_FILE