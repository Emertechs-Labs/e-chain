# MultiBaas 400 Error - Debugging Guide

## Current Status
**Deployed:** https://echain-b2wlu8x47-echain.vercel.app  
**Issue:** Ticket purchases failing with `400 Bad Request` from MultiBaas

## What I Added

### Enhanced Error Logging
Added detailed debugging to `/api/multibaas/unsigned` endpoint to show:
- `addressOrAlias` - What address/alias we're calling
- `contractToCall` - What contract label we're using
- `method` - What function we're calling
- `normalizedArgs` - The arguments being sent
- `from` - The sender address
- `value` - Any ETH value being sent
- `blockchain` - The blockchain parameter
- `fullError` - Complete error response from MultiBaas

## How to Debug

### Step 1: Reproduce the Error
1. Visit: https://echain-b2wlu8x47-echain.vercel.app
2. Try to purchase a ticket
3. Get the 400 error

### Step 2: Check Vercel Logs
```bash
npx vercel logs --prod
```

Or visit: https://vercel.com/echain/echain/logs

Look for: `[DEBUG 400 Error Details]`

### Step 3: Analyze the Output

The log will show exactly what was sent to MultiBaas. Common issues:

#### Issue 1: Wrong Contract Address/Alias
```json
{
  "addressOrAlias": "eventticket",  // Should this be a hex address?
  "contractToCall": "eventticket"
}
```

**Fix:** Check if MultiBaas knows about this alias

#### Issue 2: Wrong Method Signature
```json
{
  "method": "buyTicket",  // Does the ABI have this exact name?
  "normalizedArgs": [1, "0x5474..."]
}
```

**Fix:** Verify method name matches ABI exactly (case-sensitive)

#### Issue 3: Wrong Blockchain Parameter
```json
{
  "blockchain": "base-sepolia"  // Is this the correct chain name in MultiBaas?
}
```

**Fix:** Check MultiBaas configuration for correct chain label

#### Issue 4: Invalid Arguments
```json
{
  "normalizedArgs": ["0x1", "invalid-value"]  // Wrong types?
}
```

**Fix:** Ensure args match ABI parameter types

## Common Solutions

### Solution 1: Use Direct Address Instead of Alias
If MultiBaas doesn't recognize the contract alias, use the hex address:

```typescript
// Instead of:
{ address: "eventticket", contractLabel: "eventticket" }

// Try:
{ address: "0xYourContractAddress", contractLabel: "EventTicket" }
```

### Solution 2: Check MultiBaas Contract Registration
1. Go to MultiBaas dashboard
2. Navigate to Contracts
3. Verify:
   - Contract is deployed
   - ABI is uploaded
   - Method exists in ABI
   - Instance alias matches what you're sending

### Solution 3: Bypass MultiBaas for Writes (Use Direct Wallet)
Since reads have fallback but writes don't, you might want to use wagmi directly:

```typescript
// Instead of using MultiBaas unsigned transaction:
const { writeContract } = useWriteContract();
await writeContract({
  address: ticketContractAddress,
  abi: EventTicketABI,
  functionName: 'buyTicket',
  args: [eventId],
  value: price
});
```

## Expected Log Output

### Successful Call (What we want to see):
```
[app/api/multibaas/unsigned] start (sdk) {
  addressOrAlias: "0xb4a07ce953946936083cd8214070b74a1ac94b3e",
  contractToCall: "eventticket",
  method: "buyTicket",
  normalizedArgs: ["1"],
  from: "0x5474bA789F5CbD31aea2BcA1939989746242680D",
  value: "50000000000000000",
  blockchain: "base-sepolia"
}
[app/api/multibaas/unsigned] sdk result {
  kind: "TransactionToSignResponse",
  tx: { to: "0x...", data: "0x...", value: "..." }
}
```

### Failed Call (What we're seeing):
```
[app/api/multibaas/unsigned] upstream SDK error {
  status: 400,
  data: { error: "..." }
}
[DEBUG 400 Error Details] {
  addressOrAlias: "...",
  contractToCall: "...",
  method: "...",
  fullError: { ... }  ← This will tell us what's wrong
}
```

## Next Steps

After seeing the detailed error logs:

1. **If contract not found:** Register contract in MultiBaas or use direct address
2. **If method not found:** Verify ABI uploaded and method name correct
3. **If invalid args:** Check argument types and encoding
4. **If auth error:** Check MultiBaas API key is set correctly
5. **If all else fails:** Bypass MultiBaas and use wagmi writeContract directly

## Quick Test

To verify MultiBaas is accessible at all:

```bash
curl -X POST https://echain-b2wlu8x47-echain.vercel.app/api/multibaas/unsigned \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xA97cB40548905B05A67fCD4765438aFBEA4030fc",
    "contractLabel": "EventFactory",
    "method": "owner",
    "args": [],
    "from": "0x5474bA789F5CbD31aea2BcA1939989746242680D",
    "blockchain": "base-sepolia"
  }'
```

This should work (read-only method). If this fails, MultiBaas configuration is the issue.

---

*Enhanced debugging deployed: October 1, 2025*
