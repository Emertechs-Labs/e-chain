# Direct Wallet Transaction Hooks (MultiBaas Bypass)

This file provides direct wallet interaction hooks that bypass MultiBaas entirely.
Use these when MultiBaas is unavailable or misconfigured.

## Usage

Replace MultiBaas-based hooks with these direct hooks:

```typescript
// Instead of: useCreateEvent() (uses MultiBaas)
import { useCreateEventDirect } from './useTransactionsDirect';

// Instead of: usePurchaseTicket() (uses MultiBaas)  
import { usePurchaseTicketDirect } from './useTransactionsDirect';
```

These hooks use wagmi's `writeContract` directly, eliminating MultiBaas dependency for writes.
