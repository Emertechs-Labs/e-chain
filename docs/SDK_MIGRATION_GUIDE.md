# SDK Migration Implementation Guide

## Overview

This document provides a comprehensive guide for migrating all Echain features to use the unified `@echain/wallet` SDK. The migration addresses legacy components and direct wagmi usage to ensure consistent wallet functionality across the entire application.

## Current Issues Identified

### 1. Legacy EnhancedConnectButton Usage
- **Location**: `frontend/app/my-events/page.tsx`, `frontend/app/events/[id]/page.tsx`
- **Issue**: Still using `EnhancedConnectButton` instead of `UnifiedConnectButton` from SDK
- **Impact**: Inconsistent user experience, duplicate code maintenance

### 2. Duplicate Local Components
- **Location**: `frontend/app/components/UnifiedConnectButton.tsx`, `frontend/app/components/UnifiedConnectModal.tsx`
- **Issue**: Local implementations not being used, potential confusion
- **Impact**: Code duplication, maintenance overhead

### 3. Direct Wagmi Hook Usage
- **Location**: Various components using `useAccount`, `useConnect` directly
- **Issue**: Bypassing SDK abstraction layer
- **Impact**: Inconsistent error handling, missing SDK features

## Migration Strategy

### Phase 1: Component Replacement (High Priority)
Replace legacy components with SDK equivalents.

### Phase 2: Code Cleanup (Medium Priority)
Remove duplicate and unused components.

### Phase 3: Hook Migration (Low Priority)
Migrate direct wagmi usage to SDK hooks where beneficial.

## Implementation Details

### Phase 1: EnhancedConnectButton Replacement

#### Files to Update:
- `frontend/app/my-events/page.tsx`
- `frontend/app/events/[id]/page.tsx`

#### Current Code:
```tsx
import { EnhancedConnectButton } from "../components/EnhancedConnectButton";

// In component:
<EnhancedConnectButton />
```

#### Updated Code:
```tsx
import { UnifiedConnectButton } from '@echain/wallet/components';

// In component:
<UnifiedConnectButton />
```

#### Benefits:
- Consistent UI/UX across all wallet connections
- Automatic Hedera + Ethereum support
- Built-in error handling and troubleshooting
- Single source of truth for wallet connection logic

### Phase 2: Duplicate Component Removal

#### Files to Remove:
- `frontend/app/components/UnifiedConnectButton.tsx`
- `frontend/app/components/UnifiedConnectModal.tsx`

#### Verification Steps:
1. Confirm no imports from these local files
2. Search codebase for any references
3. Remove files after verification

### Phase 3: Wagmi Hook Migration

#### When to Migrate:
- When component needs SDK-specific features (network switching, balance display)
- When component benefits from unified error handling
- When component is wallet-centric

#### When to Keep Direct Usage:
- Simple account state reading (`useAccount` for address/status)
- Contract interactions (viem usage)
- Non-wallet related functionality

#### Migration Example:
```tsx
// Before (direct wagmi)
import { useAccount, useConnect } from 'wagmi';

// After (SDK)
import { useWalletHelpers } from '@echain/wallet/hooks';
import { useAccount } from 'wagmi'; // Keep for simple state
```

## Testing Strategy

### Pre-Migration Testing:
1. Test all wallet connection flows
2. Verify error handling works
3. Confirm network switching functionality
4. Test on both Ethereum and Hedera networks

### Post-Migration Testing:
1. Repeat all pre-migration tests
2. Verify no functionality regression
3. Test unified error messages
4. Confirm consistent UI behavior

### Automated Testing:
```bash
# Run wallet-specific tests
npm test -- --testPathPattern=wallet

# Run integration tests
npm run test:integration

# Run e2e tests for wallet flows
npm run test:e2e:wallet
```

## Rollback Plan

If issues arise during migration:

1. **Immediate Rollback**: Revert component imports to previous versions
2. **Gradual Rollback**: Keep both implementations, toggle via feature flag
3. **Partial Rollback**: Only rollback problematic components

## Success Criteria

- [ ] All `EnhancedConnectButton` usage replaced with `UnifiedConnectButton`
- [ ] Duplicate local components removed
- [ ] No direct wagmi imports in wallet-centric components
- [ ] All wallet connection flows work consistently
- [ ] Error handling is unified across components
- [ ] Network switching works on all pages
- [ ] No functionality regression

## Timeline

- **Phase 1**: 1-2 days (Component replacement)
- **Phase 2**: 0.5 days (Code cleanup)
- **Phase 3**: 2-3 days (Hook migration, if needed)
- **Testing**: 1-2 days (Comprehensive testing)

## Risk Assessment

- **Low Risk**: Component replacement (straightforward import change)
- **Medium Risk**: Hook migration (may require logic changes)
- **Low Risk**: Code cleanup (removing unused files)

## Dependencies

- `@echain/wallet` package must be installed and functional
- All SDK components must be properly exported
- Testing environment must be available

## Next Steps

1. Start with Phase 1 implementation
2. Test each component replacement
3. Move to Phase 2 cleanup
4. Evaluate Phase 3 based on needs
5. Final comprehensive testing

---

*This document will be updated as implementation progresses.*</content>
<parameter name="filePath">E:/Polymath Universata/Projects/Echain/docs/SDK_MIGRATION_GUIDE.md