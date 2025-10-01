#!/bin/bash

# Production Testing Script for Echain DApp
# Tests the live application at https://echain-eight.vercel.app/

BASE_URL="https://echain-eight.vercel.app"
TIMESTAMP=$(date +%s)
RESULTS_FILE="test_results_$(date +%Y%m%d_%H%M%S).log"

echo "🧪 ECHAIN PRODUCTION TESTING 🧪" | tee $RESULTS_FILE
echo "=================================" | tee -a $RESULTS_FILE
echo "Base URL: $BASE_URL" | tee -a $RESULTS_FILE
echo "Test Time: $(date)" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 1: Basic Health Check
echo "🔍 Test 1: Basic Health Check" | tee -a $RESULTS_FILE
echo "------------------------------" | tee -a $RESULTS_FILE
echo "Testing events API..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  "$BASE_URL/api/events" \
  -H "Accept: application/json" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 2: Contract Version Check
echo "🔍 Test 2: Contract Version Check" | tee -a $RESULTS_FILE
echo "----------------------------------" | tee -a $RESULTS_FILE
echo "Testing EventFactory version..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xA97cB40548905B05A67fCD4765438aFBEA4030fc",
    "contractLabel": "eventfactory",
    "method": "version",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "version-test-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 3: Total Events Count
echo "🔍 Test 3: Total Events Count" | tee -a $RESULTS_FILE
echo "------------------------------" | tee -a $RESULTS_FILE
echo "Testing getTotalEvents..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xA97cB40548905B05A67fCD4765438aFBEA4030fc",
    "contractLabel": "eventfactory", 
    "method": "getTotalEvents",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "total-events-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 4: Platform Fee Check
echo "🔍 Test 4: Platform Fee Check" | tee -a $RESULTS_FILE
echo "------------------------------" | tee -a $RESULTS_FILE
echo "Testing platform fee..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xA97cB40548905B05A67fCD4765438aFBEA4030fc",
    "contractLabel": "eventfactory",
    "method": "platformFee", 
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "platform-fee-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 5: Create Event Transaction
echo "🔍 Test 5: Create Event Transaction" | tee -a $RESULTS_FILE
echo "------------------------------------" | tee -a $RESULTS_FILE
echo "Testing createEvent unsigned transaction..." | tee -a $RESULTS_FILE
START_TIME=$(($(date +%s) + 86400))
END_TIME=$(($(date +%s) + 172800))
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xA97cB40548905B05A67fCD4765438aFBEA4030fc",
    "contractLabel": "eventfactory",
    "method": "createEvent",
    "args": [
      "Test Event via cURL",
      "A test event created via cURL for production testing", 
      "'$START_TIME'",
      "'$END_TIME'",
      "Virtual Location",
      "https://example.com/test-image.jpg",
      100,
      "10000000000000000"
    ],
    "from": "0x5474bA789F5CbD31aea2BcA1939989746242680D",
    "blockchain": "base-sepolia",
    "traceId": "create-event-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 6: Organizer Verification Check
echo "🔍 Test 6: Organizer Verification" | tee -a $RESULTS_FILE
echo "----------------------------------" | tee -a $RESULTS_FILE
echo "Testing organizer verification status..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xA97cB40548905B05A67fCD4765438aFBEA4030fc",
    "contractLabel": "eventfactory",
    "method": "isVerifiedOrganizer",
    "args": ["0x5474bA789F5CbD31aea2BcA1939989746242680D"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "organizer-check-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 7: Storage Services
echo "🔍 Test 7: Storage Services" | tee -a $RESULTS_FILE
echo "----------------------------" | tee -a $RESULTS_FILE
echo "Testing storage services..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  "$BASE_URL/api/storage-test" \
  -H "Accept: application/json" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 8: Error Handling
echo "🔍 Test 8: Error Handling" | tee -a $RESULTS_FILE
echo "--------------------------" | tee -a $RESULTS_FILE
echo "Testing invalid method (should return error)..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xA97cB40548905B05A67fCD4765438aFBEA4030fc",
    "contractLabel": "eventfactory",
    "method": "nonExistentMethod",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "error-test-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

echo "🏁 TESTING COMPLETED!" | tee -a $RESULTS_FILE
echo "======================" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "Review the results above to identify any issues." | tee -a $RESULTS_FILE
echo ""
echo "Next steps:"
echo "1. Review the test results in $RESULTS_FILE"
echo "2. If basic tests pass, run ticket purchase tests"
echo "3. Test POAP functionality"
echo "4. Perform end-to-end testing"