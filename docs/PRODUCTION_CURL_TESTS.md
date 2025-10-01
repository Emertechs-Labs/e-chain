# Production Testing with cURL - Echain DApp

Testing the live Echain DApp at https://echain-eight.vercel.app/ using cURL commands.

## Test Environment
- **Production URL**: https://echain-eight.vercel.app/
- **Network**: Base Sepolia Testnet (Chain ID: 84532)
- **Date**: October 1, 2025

## 1. Basic Health Check

### Test API Availability
```bash
curl -X GET "https://echain-eight.vercel.app/api/health" \
  -H "Content-Type: application/json" \
  -v
```

### Test Debug Endpoint (if available)
```bash
curl -X GET "https://echain-eight.vercel.app/api/debug/unsigned-tx?method=version" \
  -H "Content-Type: application/json" \
  -v
```

## 2. Events API Testing

### List All Events
```bash
curl -X GET "https://echain-eight.vercel.app/api/events" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -v
```

### Get Specific Event Details
```bash
# Replace {eventId} with actual event ID from the list above
curl -X GET "https://echain-eight.vercel.app/api/events/1" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -v
```

### Test Event Creation (Unsigned Transaction)
```bash
curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xA97cB40548905B05A67fCD4765438aFBEA4030fc",
    "contractLabel": "eventfactory", 
    "method": "createEvent",
    "args": [
      "Test Event via cURL",
      "A test event created via cURL for production testing",
      "'$(($(date +%s) + 86400))'",
      "'$(($(date +%s) + 172800))'",
      "Virtual Location",
      "https://example.com/test-image.jpg",
      100,
      "10000000000000000"
    ],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "84532",
    "traceId": "curl-test-'$(date +%s)'"
  }' \
  -v
```

## 3. Contract Read Operations Testing

### Check EventFactory Version
```bash
curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventfactory",
    "contractLabel": "eventfactory",
    "method": "version",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "version-check-'$(date +%s)'"
  }' \
  -v
```

### Check Total Events Count
```bash
curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventfactory",
    "contractLabel": "eventfactory",
    "method": "getTotalEvents",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "total-events-'$(date +%s)'"
  }' \
  -v
```

### Check Platform Fee
```bash
curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventfactory",
    "contractLabel": "eventfactory",
    "method": "platformFee",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "platform-fee-'$(date +%s)'"
  }' \
  -v
```

## 4. Organizer Verification Testing

### Check if Address is Verified Organizer
```bash
# Replace with actual organizer address
ORGANIZER_ADDRESS="0x5474bA789F5CbD31aea2BcA1939989746242680D"

curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventfactory",
    "contractLabel": "eventfactory",
    "method": "isVerifiedOrganizer",
    "args": ["'$ORGANIZER_ADDRESS'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "organizer-check-'$(date +%s)'"
  }' \
  -v
```

### Test Organizer Self-Verification (Unsigned Transaction)
```bash
curl -X POST "https://echain-eight.vercel.app/api/multibaas/verify-organizer" \
  -H "Content-Type: application/json" \
  -d '{
    "organizerAddress": "'$ORGANIZER_ADDRESS'",
    "blockchain": "eip155-84532",
    "traceId": "self-verify-'$(date +%s)'"
  }' \
  -v
```

## 5. Ticket Purchase Testing

### Get Event Ticket Price
```bash
# Replace {eventId} with actual event ID
EVENT_ID="1"

curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventticket",
    "contractLabel": "eventticket",
    "method": "getTicketPrice",
    "args": ["'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "ticket-price-'$(date +%s)'"
  }' \
  -v
```

### Check Available Tickets
```bash
curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventticket",
    "contractLabel": "eventticket",
    "method": "getAvailableTickets",
    "args": ["'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "available-tickets-'$(date +%s)'"
  }' \
  -v
```

### Generate Ticket Purchase Transaction
```bash
BUYER_ADDRESS="0x742d35Cc6634C0532925a3b8D267F5B8b8a8d3A1"
TICKET_PRICE="10000000000000000"  # 0.01 ETH in wei

curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventticket",
    "contractLabel": "eventticket",
    "method": "purchaseTicket",
    "args": ["'$EVENT_ID'"],
    "from": "'$BUYER_ADDRESS'",
    "value": "'$TICKET_PRICE'",
    "blockchain": "eip155-84532",
    "traceId": "purchase-ticket-'$(date +%s)'"
  }' \
  -v
```

### Check User Ticket Balance
```bash
curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventticket",
    "contractLabel": "eventticket",
    "method": "balanceOf",
    "args": ["'$BUYER_ADDRESS'", "'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "ticket-balance-'$(date +%s)'"
  }' \
  -v
```

## 6. POAP Testing

### Check if User Can Claim POAP
```bash
curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "poapattendance",
    "contractLabel": "poapattendance",
    "method": "canClaimPOAP",
    "args": ["'$BUYER_ADDRESS'", "'$EVENT_ID'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "can-claim-poap-'$(date +%s)'"
  }' \
  -v
```

### Generate POAP Claim Transaction
```bash
curl -X POST "https://echain-eight.vercel.app/api/poap/claim" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "'$EVENT_ID'",
    "userAddress": "'$BUYER_ADDRESS'",
    "blockchain": "eip155-84532",
    "traceId": "claim-poap-'$(date +%s)'"
  }' \
  -v
```

### Check POAP Balance
```bash
curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "poapattendance",
    "contractLabel": "poapattendance",
    "method": "balanceOf",
    "args": ["'$BUYER_ADDRESS'"],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "poap-balance-'$(date +%s)'"
  }' \
  -v
```

## 7. Storage Services Testing

### Test Storage Status
```bash
curl -X GET "https://echain-eight.vercel.app/api/storage-test" \
  -H "Content-Type: application/json" \
  -v
```

### Test Database Connection
```bash
curl -X GET "https://echain-eight.vercel.app/storage" \
  -H "Accept: text/html,application/json" \
  -v
```

## 8. Error Handling Testing

### Test Invalid Contract Method
```bash
curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventfactory",
    "contractLabel": "eventfactory",
    "method": "nonExistentMethod",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "error-test-'$(date +%s)'"
  }' \
  -v
```

### Test Invalid Address Format
```bash
curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "invalid-address",
    "contractLabel": "eventfactory",
    "method": "version",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532",
    "traceId": "error-address-'$(date +%s)'"
  }' \
  -v
```

## 9. Performance Testing

### Test Multiple Concurrent Requests
```bash
# Run multiple requests simultaneously
for i in {1..5}; do
  curl -X POST "https://echain-eight.vercel.app/api/multibaas/unsigned" \
    -H "Content-Type: application/json" \
    -d '{
      "address": "eventfactory",
      "contractLabel": "eventfactory",
      "method": "getTotalEvents",
      "args": [],
      "from": "0x0000000000000000000000000000000000000000",
      "blockchain": "eip155-84532",
      "traceId": "concurrent-'$i'-'$(date +%s)'"
    }' \
    -w "Request $i: %{time_total}s\n" \
    -s -o /dev/null &
done
wait
```

## Test Results Template

Create a file to track your test results:

```bash
# Create test results file
cat > production_test_results.md << 'EOF'
# Production Test Results - $(date)

## Basic Health Check
- [ ] API Health: PASS/FAIL
- [ ] Debug Endpoint: PASS/FAIL

## Events API
- [ ] List Events: PASS/FAIL
- [ ] Get Event Details: PASS/FAIL
- [ ] Create Event (unsigned tx): PASS/FAIL

## Contract Operations
- [ ] Version Check: PASS/FAIL
- [ ] Total Events: PASS/FAIL
- [ ] Platform Fee: PASS/FAIL

## Organizer Functions
- [ ] Check Verification Status: PASS/FAIL
- [ ] Self-Verification: PASS/FAIL

## Ticket Operations
- [ ] Get Ticket Price: PASS/FAIL
- [ ] Check Available Tickets: PASS/FAIL
- [ ] Purchase Ticket (unsigned tx): PASS/FAIL
- [ ] Check Ticket Balance: PASS/FAIL

## POAP Functions
- [ ] Check POAP Eligibility: PASS/FAIL
- [ ] Claim POAP: PASS/FAIL
- [ ] Check POAP Balance: PASS/FAIL

## Storage Services
- [ ] Storage Test: PASS/FAIL
- [ ] Database Connection: PASS/FAIL

## Error Handling
- [ ] Invalid Method: PASS/FAIL
- [ ] Invalid Address: PASS/FAIL

## Performance
- [ ] Response Times: PASS/FAIL
- [ ] Concurrent Requests: PASS/FAIL

## Issues Found
[List any issues discovered during testing]

## Next Steps
[Actions to take based on test results]
EOF
```

## Quick Test Script

Save this as `quick_prod_test.sh` for rapid testing:

```bash
#!/bin/bash
echo "🧪 Quick Production Test for Echain DApp"
echo "========================================="

BASE_URL="https://echain-eight.vercel.app"

echo "1. Testing API health..."
curl -s "$BASE_URL/api/events" | head -c 100

echo -e "\n2. Testing contract version..."
curl -s -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventfactory",
    "contractLabel": "eventfactory",
    "method": "version",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532"
  }' | head -c 200

echo -e "\n3. Testing total events..."
curl -s -X POST "$BASE_URL/api/multibaas/unsigned" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "eventfactory", 
    "contractLabel": "eventfactory",
    "method": "getTotalEvents",
    "args": [],
    "from": "0x0000000000000000000000000000000000000000",
    "blockchain": "eip155-84532"
  }' | head -c 200

echo -e "\n\n✅ Quick test completed!"
```

Run the quick test with:
```bash
chmod +x quick_prod_test.sh
./quick_prod_test.sh
```

Start with these tests and let me know the results. We'll then move on to more specific ticket purchase and POAP testing based on what we discover!