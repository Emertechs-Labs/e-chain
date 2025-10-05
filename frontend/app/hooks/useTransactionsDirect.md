# Direct Wallet Transaction Hooks

This file provides direct wallet interaction hooks for blockchain transactions.
These hooks interact directly with smart contracts using wagmi, providing
fast and reliable transaction handling.

## Usage

Use these hooks for all wallet transactions:

```typescript
import { useCreateEventDirect } from './useTransactionsDirect';
import { usePurchaseTicketDirect } from './useTransactionsDirect';
```

These hooks use wagmi's `writeContract` directly for optimal performance and reliability.
