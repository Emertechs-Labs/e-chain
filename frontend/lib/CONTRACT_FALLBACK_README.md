# Smart Contract Fallback System

## Overview

This system provides **automatic fallback** from MultiBaas to direct blockchain interaction, ensuring your app stays functional even if MultiBaas is down or unavailable.

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Your Application Code                 │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│        contract-wrapper.ts (Unified API)        │
│  - Tries MultiBaas first (analytics, caching)   │
│  - Falls back to direct if MultiBaas fails      │
└─────────────┬───────────────┬───────────────────┘
              │               │
              ▼               ▼
    ┌─────────────┐  ┌──────────────────┐
    │ multibaas.ts│  │contract-fallback.ts│
    │  (Primary)  │  │   (Fallback)      │
    └──────┬──────┘  └────────┬──────────┘
           │                  │
           ▼                  ▼
    ┌────────────┐     ┌────────────┐
    │ MultiBaas  │     │ Blockchain │
    │    API     │     │   (viem)   │
    └────────────┘     └────────────┘
```

## Key Features

### ✅ Automatic Fallback
- Tries MultiBaas first for better analytics and caching
- Automatically falls back to direct blockchain calls if MultiBaas fails
- Transparent to your application code

### ✅ Same API Surface
- `readContract()` - Read contract data
- `writeContract()` - Write to contract
- `simulateWrite()` - Simulate transaction before sending
- Works identically whether using MultiBaas or direct

### ✅ Flexible Configuration
```typescript
// Try MultiBaas with fallback (default)
await readContract('EventFactory', 'events', [eventId]);

// Direct-only (skip MultiBaas)
await readContract('EventFactory', 'events', [eventId], {
  useMultiBaas: false
});

// MultiBaas-only (no fallback)
await readContract('EventFactory', 'events', [eventId], {
  skipFallback: true
});
```

### ✅ Health Monitoring
```typescript
import { checkMultiBaasHealth, getFallbackMode } from '@/lib/contract-wrapper';

const mode = getFallbackMode(); // 'multibaas' | 'direct' | 'both'
const isHealthy = await checkMultiBaasHealth(); // true/false
```

## Usage Examples

### Reading Contract Data

```typescript
import { readContract } from '@/lib/contract-wrapper';

// Get event details
const eventData = await readContract(
  'EventFactory',  // Contract name
  'events',        // Function name
  [eventId],       // Arguments
  {
    useMultiBaas: true,  // Try MultiBaas first (default)
    skipFallback: false, // Allow fallback (default)
  }
);

console.log(eventData);
```

### Writing to Contract

```typescript
import { writeContract } from '@/lib/contract-wrapper';

// Purchase tickets
const txHash = await writeContract(
  'EventTicket',
  'purchaseTickets',
  [eventId, quantity],
  {
    account: userAddress,           // Required: user's wallet address
    value: ticketPrice * quantity,  // Optional: ETH to send
    waitForConfirmation: true,      // Optional: wait for mining
  }
);

console.log('Transaction:', txHash);
```

### Simulating Before Writing

```typescript
import { simulateWrite, writeContract } from '@/lib/contract-wrapper';

// First simulate to check if it will work
try {
  await simulateWrite(
    'EventTicket',
    'purchaseTickets',
    [eventId, quantity],
    {
      account: userAddress,
      value: totalCost,
    }
  );
  
  console.log('Simulation passed!');
  
  // Now execute for real
  const txHash = await writeContract(/* ... */);
} catch (error) {
  console.error('Transaction would fail:', error);
}
```

## Files Overview

### 1. `contract-fallback.ts`
**Direct blockchain interaction** using viem.

Functions:
- `directContractRead()` - Read from contract
- `directContractWrite()` - Write to contract
- `simulateContractWrite()` - Simulate transaction
- `waitForTransaction()` - Wait for confirmation
- `getTransactionReceipt()` - Get receipt
- `isContract()` - Check if address is contract
- `getBlockNumber()` - Get current block
- `getBalance()` - Get address balance

### 2. `contract-wrapper.ts`
**Unified API** with automatic fallback logic.

Functions:
- `readContract()` - Read with fallback
- `writeContract()` - Write with fallback
- `simulateWrite()` - Simulate write
- `checkMultiBaasHealth()` - Health check
- `getFallbackMode()` - Get current mode
- `isMultiBaasAvailable()` - Check availability

### 3. `contract-wrapper.examples.ts`
**Usage examples** showing common patterns.

## When to Use Each Mode

### MultiBaas Primary (Default)
**Best for:** Production apps where you want analytics

```typescript
await readContract('EventFactory', 'events', [eventId]);
// Tries MultiBaas → Falls back to direct
```

**Pros:**
- Analytics and event tracking
- Better caching
- Rate limiting protection
- Enhanced security

**Cons:**
- Single point of failure (mitigated by fallback)
- Extra network hop

### Direct Only
**Best for:** Development, when MultiBaas is down, or for simple reads

```typescript
await readContract('EventFactory', 'events', [eventId], {
  useMultiBaas: false
});
// Direct to blockchain
```

**Pros:**
- Faster (no extra hop)
- No dependencies
- Works offline (with local node)

**Cons:**
- No analytics
- No caching
- Direct RPC rate limits

### MultiBaas Only (No Fallback)
**Best for:** Testing MultiBaas configuration

```typescript
await readContract('EventFactory', 'events', [eventId], {
  skipFallback: true
});
// Fails if MultiBaas is down
```

## Error Handling

The wrapper automatically handles:
- Network failures
- MultiBaas downtime
- Rate limiting
- Invalid responses

Example with custom error handling:

```typescript
try {
  const data = await readContract('EventFactory', 'events', [eventId]);
  return data;
} catch (error) {
  if (error.message.includes('MultiBaas')) {
    console.log('MultiBaas failed, but fallback also failed');
  }
  throw error;
}
```

## Environment Variables

### MultiBaas (Optional - enables primary mode)
```env
NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL=https://your-deployment.multibaas.com
MULTIBAAS_API_KEY=your-api-key
NEXT_PUBLIC_MULTIBAAS_CHAIN=base-sepolia
NEXT_PUBLIC_MULTIBAAS_CHAIN_ID=84532
```

### Blockchain RPC (Required for fallback)
The fallback uses viem's default RPC endpoints. For production, you may want to configure custom RPC:

```typescript
// In contract-fallback.ts, modify getPublicClient:
return createPublicClient({
  chain,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL), // Custom RPC
});
```

## Migration Guide

### Before (MultiBaas only):
```typescript
import { callContractRead } from '@/lib/multibaas';

const data = await callContractRead(
  CONTRACT_ADDRESSES.EventFactory,
  'EventFactory',
  'events',
  [eventId]
);
```

### After (With Fallback):
```typescript
import { readContract } from '@/lib/contract-wrapper';

const data = await readContract(
  'EventFactory',
  'events',
  [eventId]
);
```

**Benefits:**
- ✅ Shorter, cleaner code
- ✅ Automatic fallback
- ✅ Better error handling
- ✅ Same functionality

## Testing

### Test MultiBaas Mode
```typescript
// Set environment variables for MultiBaas
const data = await readContract('EventFactory', 'events', [1n]);
```

### Test Direct Mode
```typescript
// Unset MultiBaas env vars, or:
const data = await readContract('EventFactory', 'events', [1n], {
  useMultiBaas: false
});
```

### Test Fallback
```typescript
// Set invalid MultiBaas credentials
// Should fail over to direct automatically
const data = await readContract('EventFactory', 'events', [1n]);
```

## Performance Considerations

### Read Operations
- **MultiBaas:** ~200-500ms (includes API hop)
- **Direct:** ~100-200ms (blockchain only)
- **Fallback:** ~300-700ms (retry delay)

### Write Operations
- **MultiBaas:** Generates unsigned tx (you sign)
- **Direct:** Signs and sends immediately
- Both require wallet interaction

## Security Notes

1. **Private Keys:** Never exposed - wallet handles signing
2. **API Keys:** MultiBaas keys only used server-side
3. **Contract Addresses:** Hardcoded and verified
4. **ABIs:** Generated from verified contracts

## Troubleshooting

### "MultiBaas not available"
- Check environment variables
- Verify API key permissions
- Check network connectivity

### "Wallet not available"
- Ensure MetaMask/wallet is installed
- Check if user is connected
- Verify correct network

### "Contract call failed"
- Check contract address is correct
- Verify function name and arguments
- Ensure user has sufficient balance
- Check gas limits

## Future Enhancements

- [ ] Retry logic with exponential backoff
- [ ] Circuit breaker pattern
- [ ] Performance metrics
- [ ] Automatic RPC failover
- [ ] Cache layer for reads
- [ ] Batch operations
- [ ] WebSocket support for events

## Support

For issues or questions:
1. Check the examples in `contract-wrapper.examples.ts`
2. Enable debug logging: `localStorage.setItem('debug', 'contract:*')`
3. Check MultiBaas dashboard for API status
4. Review blockchain explorer for transaction status
