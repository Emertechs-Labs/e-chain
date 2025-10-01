#!/bin/bash

# Production Ticket Purchase Testing Script for Echain DApp
# Tests ticket purchasing functionality with real contract interactions

BASE_URL="https://echain-eight.vercel.app"
TIMESTAMP=$(date +%s)
RESULTS_FILE="ticket_test_results_$(date +%Y%m%d_%H%M%S).log"

echo "🎫 ECHAIN TICKET PURCHASE TESTING 🎫" | tee $RESULTS_FILE
echo "======================================" | tee -a $RESULTS_FILE
echo "Base URL: $BASE_URL" | tee -a $RESULTS_FILE
echo "Test Time: $(date)" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 1: Get First Available Event
echo "🔍 Test 1: Get Available Events" | tee -a $RESULTS_FILE
echo "--------------------------------" | tee -a $RESULTS_FILE
echo "Fetching events list..." | tee -a $RESULTS_FILE
EVENTS_RESPONSE=$(curl -s "$BASE_URL/api/events")
echo "Events response: $EVENTS_RESPONSE" | tee -a $RESULTS_FILE

# Extract first event ID and ticket contract
EVENT_ID=$(echo $EVENTS_RESPONSE | jq -r '.[0].id // empty')
TICKET_CONTRACT=$(echo $EVENTS_RESPONSE | jq -r '.[0].ticketContract // empty')
EVENT_NAME=$(echo $EVENTS_RESPONSE | jq -r '.[0].name // empty')

if [ -z "$EVENT_ID" ] || [ "$EVENT_ID" = "null" ]; then
    echo "❌ No events found. Cannot proceed with ticket tests." | tee -a $RESULTS_FILE
    exit 1
fi

echo "✅ Found Event ID: $EVENT_ID" | tee -a $RESULTS_FILE
echo "✅ Event Name: $EVENT_NAME" | tee -a $RESULTS_FILE
echo "✅ Ticket Contract: $TICKET_CONTRACT" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 2: Check Ticket Price
echo "🔍 Test 2: Check Ticket Price" | tee -a $RESULTS_FILE
echo "------------------------------" | tee -a $RESULTS_FILE
echo "Getting ticket price for event $EVENT_ID..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$TICKET_CONTRACT'",
    "contractLabel": "eventticket",
    "method": "ticketPrice",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "ticket-price-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 3: Check Available Tickets
echo "🔍 Test 3: Check Available Tickets" | tee -a $RESULTS_FILE
echo "-----------------------------------" | tee -a $RESULTS_FILE
echo "Getting available tickets count..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$TICKET_CONTRACT'",
    "contractLabel": "eventticket",
    "method": "getAvailableTickets",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "available-tickets-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 4: Check Total Supply
echo "🔍 Test 4: Check Total Ticket Supply" | tee -a $RESULTS_FILE
echo "-------------------------------------" | tee -a $RESULTS_FILE
echo "Getting total ticket supply..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$TICKET_CONTRACT'",
    "contractLabel": "eventticket",
    "method": "totalSupply",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "total-supply-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 5: Generate Purchase Transaction
echo "🔍 Test 5: Generate Purchase Transaction" | tee -a $RESULTS_FILE
echo "----------------------------------------" | tee -a $RESULTS_FILE
echo "Generating unsigned purchase transaction..." | tee -a $RESULTS_FILE
BUYER_ADDRESS="0x5474bA789F5CbD31aea2BcA1939989746242680D"
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$TICKET_CONTRACT'",
    "contractLabel": "eventticket",
    "method": "purchaseTicket",
    "args": ["'$BUYER_ADDRESS'", 1],
    "from": "'$BUYER_ADDRESS'",
    "blockchain": "base-sepolia",
    "traceId": "purchase-ticket-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 6: Check User Balance
echo "🔍 Test 6: Check User Ticket Balance" | tee -a $RESULTS_FILE
echo "-------------------------------------" | tee -a $RESULTS_FILE
echo "Checking user ticket balance..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$TICKET_CONTRACT'",
    "contractLabel": "eventticket",
    "method": "balanceOf",
    "args": ["'$BUYER_ADDRESS'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "user-balance-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 7: Check Event Info
echo "🔍 Test 7: Check Event Information" | tee -a $RESULTS_FILE
echo "-----------------------------------" | tee -a $RESULTS_FILE
echo "Getting detailed event information..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$TICKET_CONTRACT'",
    "contractLabel": "eventticket",
    "method": "getEventInfo",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "base-sepolia",
    "traceId": "event-info-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Test 8: Batch Purchase Transaction
echo "🔍 Test 8: Batch Purchase Transaction" | tee -a $RESULTS_FILE
echo "--------------------------------------" | tee -a $RESULTS_FILE
echo "Generating batch purchase transaction for 3 tickets..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "'$TICKET_CONTRACT'",
    "contractLabel": "eventticket",
    "method": "purchaseTicket",
    "args": ["'$BUYER_ADDRESS'", 3],
    "from": "'$BUYER_ADDRESS'",
    "blockchain": "base-sepolia",
    "traceId": "batch-purchase-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

echo "🏁 TICKET TESTING COMPLETED!" | tee -a $RESULTS_FILE
echo "=============================" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "Event tested: $EVENT_NAME (ID: $EVENT_ID)" | tee -a $RESULTS_FILE
echo "Ticket contract: $TICKET_CONTRACT" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE
echo "Note: These are unsigned transactions. To actually purchase tickets," | tee -a $RESULTS_FILE
echo "you would need to sign and broadcast these transactions on-chain." | tee -a $RESULTS_FILE