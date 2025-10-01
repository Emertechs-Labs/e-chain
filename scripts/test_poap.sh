#!/bin/bash

# POAP Testing Script for Echain DApp
# Tests POAP-related functionality on https://echain-eight.vercel.app/

BASE_URL="https://echain-eight.vercel.app"
TIMESTAMP=$(date +%s)
RESULTS_FILE="poap_test_results_$(date +%Y%m%d_%H%M%S).log"

# Test wallet addresses
USER_ADDRESS="0x742d35Cc6634C0532925a3b8D267F5B8b8a8d3A1"
EVENT_ID="1"  # Adjust this based on available events

echo "🏆 ECHAIN POAP TESTING 🏆" | tee $RESULTS_FILE
echo "==========================" | tee -a $RESULTS_FILE
echo "Base URL: $BASE_URL" | tee -a $RESULTS_FILE
echo "Test Time: $(date)" | tee -a $RESULTS_FILE
echo "Event ID: $EVENT_ID" | tee -a $RESULTS_FILE
echo "User Address: $USER_ADDRESS" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 1: Check POAP Contract Status
echo "🔍 Step 1: Check POAP Contract Status" | tee -a $RESULTS_FILE
echo "--------------------------------------" | tee -a $RESULTS_FILE
echo "Checking POAP contract version..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33",
    "contractLabel": "poapattendance",
    "method": "version",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "84532",
    "traceId": "poap-version-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 2: Check User's Current POAP Balance
echo "🎖️ Step 2: Check Current POAP Balance" | tee -a $RESULTS_FILE
echo "--------------------------------------" | tee -a $RESULTS_FILE
echo "Checking POAP balance for $USER_ADDRESS..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33",
    "contractLabel": "poapattendance",
    "method": "balanceOf",
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
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33",
    "contractLabel": "poapattendance",
    "method": "canClaimPOAP",
    "args": ["'$USER_ADDRESS'", "'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "84532",
    "traceId": "can-claim-poap-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 4: Check if User Already Has POAP for Event
echo "🏷️ Step 4: Check Existing POAP for Event" | tee -a $RESULTS_FILE
echo "-----------------------------------------" | tee -a $RESULTS_FILE
echo "Checking if user already has POAP for event $EVENT_ID..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "poapattendance",
    "contractLabel": "poapattendance",
    "method": "hasPOAP",
    "args": ["'$USER_ADDRESS'", "'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "has-poap-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 5: Generate POAP Claim Transaction via API
echo "🎁 Step 5: Generate POAP Claim Transaction" | tee -a $RESULTS_FILE
echo "------------------------------------------" | tee -a $RESULTS_FILE
echo "Generating POAP claim transaction via API..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/poap/claim" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "'$EVENT_ID'",
    "userAddress": "'$USER_ADDRESS'",
    "blockchain": "eip155-84532",
    "traceId": "api-claim-poap-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 6: Direct POAP Claim via MultiBaas
echo "🎯 Step 6: Direct POAP Claim Transaction" | tee -a $RESULTS_FILE
echo "----------------------------------------" | tee -a $RESULTS_FILE
echo "Generating direct POAP claim transaction..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33",
    "contractLabel": "poapattendance",
    "method": "claimPOAP",
    "args": ["'$EVENT_ID'"],
    "from": "'$USER_ADDRESS'",
    "blockchain": "84532",
    "traceId": "direct-claim-poap-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 7: Check POAP Token URI
echo "🖼️ Step 7: Check POAP Token URI" | tee -a $RESULTS_FILE
echo "--------------------------------" | tee -a $RESULTS_FILE
echo "Checking POAP token URI for event $EVENT_ID..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "poapattendance",
    "contractLabel": "poapattendance",
    "method": "tokenURI",
    "args": ["'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "poap-token-uri-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 8: Check Event POAP Total Supply
echo "📊 Step 8: Check Event POAP Total Supply" | tee -a $RESULTS_FILE
echo "----------------------------------------" | tee -a $RESULTS_FILE
echo "Checking total POAP supply for event $EVENT_ID..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "poapattendance",
    "contractLabel": "poapattendance",
    "method": "totalSupply",
    "args": ["'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "poap-total-supply-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 9: Check POAP Ownership
echo "👤 Step 9: Check POAP Ownership" | tee -a $RESULTS_FILE
echo "-------------------------------" | tee -a $RESULTS_FILE
echo "Checking who owns the POAP for event $EVENT_ID..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "poapattendance",
    "contractLabel": "poapattendance",
    "method": "ownerOf",
    "args": ["'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "poap-owner-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 10: Check POAP Transfer Functionality
echo "🔄 Step 10: Check POAP Transfer" | tee -a $RESULTS_FILE
echo "-------------------------------" | tee -a $RESULTS_FILE
echo "Testing POAP transfer functionality..." | tee -a $RESULTS_FILE
RECIPIENT_ADDRESS="0x1234567890123456789012345678901234567890"
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "poapattendance",
    "contractLabel": "poapattendance",
    "method": "transferFrom",
    "args": ["'$USER_ADDRESS'", "'$RECIPIENT_ADDRESS'", "'$EVENT_ID'"],
    "from": "'$USER_ADDRESS'",
    "blockchain": "eip155-84532",
    "traceId": "transfer-poap-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 11: Check Event Attendance Requirements
echo "📋 Step 11: Check Attendance Requirements" | tee -a $RESULTS_FILE
echo "-----------------------------------------" | tee -a $RESULTS_FILE
echo "Checking attendance requirements for POAP eligibility..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "poapattendance",
    "contractLabel": "poapattendance",
    "method": "getAttendanceRequirement",
    "args": ["'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "attendance-req-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 12: Check if Event Allows POAP Claims
echo "🔓 Step 12: Check POAP Claim Status" | tee -a $RESULTS_FILE
echo "-----------------------------------" | tee -a $RESULTS_FILE
echo "Checking if event allows POAP claims..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "poapattendance",
    "contractLabel": "poapattendance",
    "method": "isPOAPClaimEnabled",
    "args": ["'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "poap-claim-enabled-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

echo "🏁 POAP TESTING COMPLETED!" | tee -a $RESULTS_FILE
echo "===========================" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo ""
echo "Summary of POAP tests performed:"
echo "✓ POAP contract status check"
echo "✓ User POAP balance verification"
echo "✓ Claim eligibility assessment"
echo "✓ Existing POAP ownership check"
echo "✓ POAP claim transaction generation (API)"
echo "✓ Direct POAP claim transaction"
echo "✓ Token URI and metadata access"
echo "✓ Total supply verification"
echo "✓ Ownership verification"
echo "✓ Transfer functionality testing"
echo "✓ Attendance requirements check"
echo "✓ Claim status verification"
echo ""
echo "Next steps:"
echo "1. Review results in $RESULTS_FILE"
echo "2. Test end-to-end user journey"
echo "3. Verify POAP metadata and images"
echo "4. Test with multiple events and users"