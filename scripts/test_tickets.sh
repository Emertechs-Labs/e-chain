#!/bin/bash

# Ticket Purchase Testing Script for Echain DApp
# Tests ticket-related functionality on https://echain-eight.vercel.app/

BASE_URL="https://echain-eight.vercel.app"
TIMESTAMP=$(date +%s)
RESULTS_FILE="ticket_test_results_$(date +%Y%m%d_%H%M%S).log"

# Test wallet addresses
BUYER_ADDRESS="0x742d35Cc6634C0532925a3b8D267F5B8b8a8d3A1"
EVENT_ID="1"  # Adjust this based on available events

echo "🎫 ECHAIN TICKET PURCHASE TESTING 🎫" | tee $RESULTS_FILE
echo "=====================================" | tee -a $RESULTS_FILE
echo "Base URL: $BASE_URL" | tee -a $RESULTS_FILE
echo "Test Time: $(date)" | tee -a $RESULTS_FILE
echo "Event ID: $EVENT_ID" | tee -a $RESULTS_FILE
echo "Buyer Address: $BUYER_ADDRESS" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 1: Get Available Events
echo "📋 Step 1: Get Available Events" | tee -a $RESULTS_FILE
echo "--------------------------------" | tee -a $RESULTS_FILE
echo "Fetching events list..." | tee -a $RESULTS_FILE
EVENTS_RESPONSE=$(curl -s -w "Status: %{http_code}" "$BASE_URL/api/events")
echo "$EVENTS_RESPONSE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 2: Check Ticket Price
echo "💰 Step 2: Check Ticket Price" | tee -a $RESULTS_FILE
echo "------------------------------" | tee -a $RESULTS_FILE
echo "Getting ticket price for event $EVENT_ID..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C",
    "contractLabel": "eventticket",
    "method": "getTicketPrice",
    "args": ["'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "84532",
    "traceId": "ticket-price-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 3: Check Available Tickets
echo "🎟️ Step 3: Check Available Tickets" | tee -a $RESULTS_FILE
echo "-----------------------------------" | tee -a $RESULTS_FILE
echo "Checking available tickets for event $EVENT_ID..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C",
    "contractLabel": "eventticket",
    "method": "getAvailableTickets",
    "args": ["'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "84532",
    "traceId": "available-tickets-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 4: Check Current Ticket Balance
echo "🔢 Step 4: Check Current Ticket Balance" | tee -a $RESULTS_FILE
echo "---------------------------------------" | tee -a $RESULTS_FILE
echo "Checking current ticket balance for $BUYER_ADDRESS..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C",
    "contractLabel": "eventticket",
    "method": "balanceOf",
    "args": ["'$BUYER_ADDRESS'", "'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "84532",
    "traceId": "current-balance-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 5: Generate Purchase Transaction
echo "🛒 Step 5: Generate Purchase Transaction" | tee -a $RESULTS_FILE
echo "----------------------------------------" | tee -a $RESULTS_FILE
echo "Generating unsigned transaction for ticket purchase..." | tee -a $RESULTS_FILE
TICKET_PRICE="10000000000000000"  # 0.01 ETH in wei
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C",
    "contractLabel": "eventticket",
    "method": "purchaseTicket",
    "args": ["'$EVENT_ID'"],
    "from": "'$BUYER_ADDRESS'",
    "value": "'$TICKET_PRICE'",
    "blockchain": "84532",
    "traceId": "purchase-ticket-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 6: Test Batch Purchase
echo "📦 Step 6: Test Batch Purchase" | tee -a $RESULTS_FILE
echo "-------------------------------" | tee -a $RESULTS_FILE
echo "Testing batch ticket purchase (if available)..." | tee -a $RESULTS_FILE
QUANTITY="2"
TOTAL_VALUE=$((2 * 10000000000000000))
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventticket",
    "contractLabel": "eventticket",
    "method": "purchaseTickets",
    "args": ["'$EVENT_ID'", "'$QUANTITY'"],
    "from": "'$BUYER_ADDRESS'",
    "value": "'$TOTAL_VALUE'",
    "blockchain": "eip155-84532",
    "traceId": "batch-purchase-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 7: Check Event Capacity
echo "🏟️ Step 7: Check Event Capacity" | tee -a $RESULTS_FILE
echo "--------------------------------" | tee -a $RESULTS_FILE
echo "Checking event capacity and current attendance..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventticket",
    "contractLabel": "eventticket",
    "method": "getEventCapacity",
    "args": ["'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "event-capacity-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 8: Test Transfer Functionality
echo "🔄 Step 8: Test Transfer Functionality" | tee -a $RESULTS_FILE
echo "--------------------------------------" | tee -a $RESULTS_FILE
echo "Testing ticket transfer functionality..." | tee -a $RESULTS_FILE
RECIPIENT_ADDRESS="0x1234567890123456789012345678901234567890"
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventticket",
    "contractLabel": "eventticket",
    "method": "safeTransferFrom",
    "args": ["'$BUYER_ADDRESS'", "'$RECIPIENT_ADDRESS'", "'$EVENT_ID'", "1", "0x"],
    "from": "'$BUYER_ADDRESS'",
    "blockchain": "eip155-84532",
    "traceId": "transfer-ticket-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 9: Check Event Status
echo "📊 Step 9: Check Event Status" | tee -a $RESULTS_FILE
echo "------------------------------" | tee -a $RESULTS_FILE
echo "Checking event status and details..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventfactory",
    "contractLabel": "eventfactory",
    "method": "getEvent",
    "args": ["'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "event-status-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Step 10: Test Refund Functionality
echo "💸 Step 10: Test Refund Functionality" | tee -a $RESULTS_FILE
echo "--------------------------------------" | tee -a $RESULTS_FILE
echo "Testing ticket refund functionality..." | tee -a $RESULTS_FILE
curl -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventticket",
    "contractLabel": "eventticket",
    "method": "refundTicket",
    "args": ["'$EVENT_ID'"],
    "from": "'$BUYER_ADDRESS'",
    "blockchain": "eip155-84532",
    "traceId": "refund-ticket-'$TIMESTAMP'"
  }' | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

echo "🏁 TICKET TESTING COMPLETED!" | tee -a $RESULTS_FILE
echo "=============================" | tee -a $RESULTS_FILE
echo "Results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo ""
echo "Summary of tests performed:"
echo "✓ Event listing and details"
echo "✓ Ticket pricing information"
echo "✓ Available ticket counts"
echo "✓ Current ticket balances" 
echo "✓ Single ticket purchase"
echo "✓ Batch ticket purchase"
echo "✓ Event capacity checks"
echo "✓ Ticket transfer functionality"
echo "✓ Event status verification"
echo "✓ Refund functionality"
echo ""
echo "Next steps:"
echo "1. Review results in $RESULTS_FILE"
echo "2. Test POAP functionality with: ./test_poap.sh"
echo "3. Perform end-to-end user journey testing"