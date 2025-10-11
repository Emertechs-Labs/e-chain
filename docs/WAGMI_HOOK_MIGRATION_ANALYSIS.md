# Wagmi Hook Migration Analysis

## Overview

This document analyzes the current usage of direct wagmi hooks in the Echain frontend and provides guidance on when to migrate to SDK hooks versus keeping direct usage.

## Current Wagmi Hook Usage

### Direct Wagmi Imports Found:

#### useAccount (Most Common):
- `frontend/app/my-events/page.tsx`
- `frontend/app/my-tickets/page.tsx`
- `frontend/app/my-events/page.tsx`
- `frontend/app/marketplace/my-listings/page.tsx`
- `frontend/app/marketplace/create/page.tsx`
- `frontend/app/marketplace/ClientMarketplace.tsx`
- `frontend/app/poaps/page.tsx`
- `frontend/app/rewards/page.tsx`
- `frontend/app/recovery/page.tsx`

#### useConnect:
- `frontend/lib/contract-hooks.examples.tsx`
- `frontend/app/components/EnhancedConnectButton.tsx` (legacy)
- `frontend/app/components/UnifiedConnectButton.tsx` (duplicate)

#### Other Hooks:
- `useDisconnect`, `useChainId`, `useSwitchChain` - Various locations

## Migration Decision Framework

### When to Migrate to SDK Hooks:

#### ✅ Migrate Scenarios:
1. **Wallet-centric Components**: Components primarily focused on wallet functionality
2. **Network Switching**: Components that need unified network management
3. **Error Handling**: Components that benefit from SDK-level error handling
4. **Balance Display**: Components showing wallet balances
5. **Transaction Management**: Components handling transaction flows

#### ❌ Keep Direct Wagmi Usage:
1. **Simple State Reading**: Just reading `isConnected`, `address`
2. **Contract Interactions**: Using viem for contract calls
3. **Non-wallet Logic**: Components where wallet is secondary
4. **Performance Critical**: Where SDK overhead isn't justified

## Component Analysis

### High Priority for Migration:

#### Marketplace Components:
```tsx
// Current: Direct wagmi + SDK mix
import { useAccount } from "wagmi";
import { useWalletHelpers } from "@echain/wallet/hooks";

// Potential: Full SDK migration
import { useWalletHelpers } from "@echain/wallet/hooks";
const { address, isConnected, connectWallet, formatEth } = useWalletHelpers();
```

**Benefits**: Unified error handling, consistent network switching

#### Event Pages:
```tsx
// Current: Direct wagmi for account state
import { useAccount } from "wagmi";

// Assessment: Keep direct usage - simple state reading only
```

**Rationale**: These components primarily read account state for conditional rendering.

### Medium Priority for Migration:

#### POAPs, Rewards, Recovery Pages:
- Currently use `useAccount` for basic connectivity checks
- Could benefit from SDK error handling
- Consider migration if wallet-specific features added

### Low Priority for Migration:

#### Contract Examples:
- `frontend/lib/contract-hooks.examples.tsx`
- Pure contract interaction examples
- Keep direct wagmi/viem usage for clarity

## Migration Patterns

### Pattern 1: Replace useAccount with SDK

#### Before:
```tsx
import { useAccount } from "wagmi";

function MyComponent() {
  const { address, isConnected } = useAccount();

  // Component logic
}
```

#### After:
```tsx
import { useWalletHelpers } from "@echain/wallet/hooks";

function MyComponent() {
  const { address, isConnected, connectWallet } = useWalletHelpers();

  // Component logic - now has connectWallet function too
}
```

### Pattern 2: Keep useAccount for Simple Cases

#### Appropriate Usage:
```tsx
import { useAccount } from "wagmi";
import { UnifiedConnectButton } from "@echain/wallet/components";

function MyComponent() {
  const { isConnected } = useAccount();

  return (
    <div>
      {isConnected ? <UserDashboard /> : <UnifiedConnectButton />}
    </div>
  );
}
```

### Pattern 3: Hybrid Approach

#### For Complex Components:
```tsx
import { useAccount } from "wagmi";
import { useWalletHelpers, UnifiedConnectButton } from "@echain/wallet";

function ComplexComponent() {
  const { address } = useAccount(); // Simple state
  const { connectWallet, formatEth, ensureBaseSepoliaNetwork } = useWalletHelpers(); // Complex logic

  // Component logic
}
```

## Implementation Strategy

### Phase 1: Marketplace Migration (High Impact)
1. Update `ClientMarketplace.tsx`
2. Update `my-listings/page.tsx`
3. Update `create/page.tsx`
4. Test marketplace flows

### Phase 2: Event Pages Assessment (Medium Impact)
1. Review current usage in event pages
2. Migrate only if clear benefits
3. Test event creation/purchase flows

### Phase 3: Utility Pages (Low Impact)
1. Migrate POAPs, Rewards, Recovery if needed
2. Focus on user experience improvements

## Testing Strategy

### Unit Tests:
```tsx
// Test SDK hook integration
describe('Marketplace SDK Integration', () => {
  it('should use SDK hooks correctly', () => {
    // Test useWalletHelpers integration
  });
});
```

### Integration Tests:
```tsx
// Test end-to-end wallet flows
describe('Wallet Connection Flow', () => {
  it('should work with SDK components', () => {
    // Test full wallet connection
  });
});
```

### Performance Tests:
- Measure bundle size impact
- Test component render performance
- Verify no memory leaks

## Risk Assessment

### Low Risk Migrations:
- Simple `useAccount` replacements
- Components with clear SDK benefits
- Well-tested SDK functionality

### Medium Risk Migrations:
- Complex components with mixed logic
- Components with custom error handling
- Performance-critical components

### High Risk Migrations:
- Core authentication flows
- Payment/transaction components
- Components with complex state management

## Rollback Strategy

### Component-Level Rollback:
```tsx
// Easy to revert individual components
import { useAccount } from "wagmi"; // Restore direct import
// Remove SDK import
```

### Feature Flag Approach:
```tsx
const USE_SDK_HOOKS = process.env.NEXT_PUBLIC_USE_SDK_HOOKS === 'true';

const walletHelpers = USE_SDK_HOOKS
  ? useWalletHelpers()
  : { address: useAccount().address, connectWallet: () => {} };
```

## Success Metrics

- [ ] No functionality regression
- [ ] Improved error handling where migrated
- [ ] Consistent user experience
- [ ] Bundle size within acceptable limits
- [ ] All tests passing

## Timeline

- **Analysis**: Complete (this document)
- **Phase 1**: 1-2 days
- **Phase 2**: 1-2 days
- **Phase 3**: 1-2 days
- **Testing**: 2-3 days

## Recommendations

1. **Start with Marketplace**: High impact, clear benefits
2. **Keep Simple Cases Direct**: No need to over-engineer
3. **Test Thoroughly**: Wallet functionality is critical
4. **Document Decisions**: Why each component uses direct vs SDK
5. **Monitor Performance**: Ensure no degradation

## Next Steps

1. Begin Phase 1 marketplace migration
2. Create detailed implementation plan for each component
3. Set up testing environment
4. Implement and test incrementally

---

*Analysis Date: October 10, 2025*
*SDK Version: @echain/wallet latest*</content>
<parameter name="filePath">E:/Polymath Universata/Projects/Echain/docs/WAGMI_HOOK_MIGRATION_ANALYSIS.md