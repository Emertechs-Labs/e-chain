# SDK Migration Testing Guide

## Overview

This document provides comprehensive testing procedures for validating the SDK migration across all Echain features. Testing ensures no functionality regression while confirming improved wallet integration.

## Testing Categories

### 1. Unit Testing
### 2. Integration Testing
### 3. End-to-End Testing
### 4. Performance Testing
### 5. Cross-Browser Testing

## Pre-Migration Baseline

### Establish Baseline Metrics:
```bash
# Record bundle size
npm run build
ls -lh .next/static/chunks/

# Record test results
npm test -- --coverage --watchAll=false

# Record performance metrics
npm run test:performance
```

### Document Current Behavior:
- Wallet connection flows
- Error messages
- Network switching
- UI consistency

## Phase 1 Testing: Component Replacement

### Test Files:
- `frontend/app/my-events/page.tsx`
- `frontend/app/events/[id]/page.tsx`

### Test Cases:

#### Wallet Connection Tests:
```typescript
describe('UnifiedConnectButton Integration', () => {
  it('should render UnifiedConnectButton in my-events page', () => {
    render(<MyEventsPage />);
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  });

  it('should handle wallet connection successfully', async () => {
    // Mock wallet connection
    // Test UI updates
    // Verify success messages
  });

  it('should display unified error messages', () => {
    // Test error scenarios
    // Verify consistent error UI
  });
});
```

#### Network Switching Tests:
```typescript
describe('Network Switching', () => {
  it('should support Ethereum networks', () => {
    // Test Base Sepolia connection
    // Test mainnet connection
  });

  it('should support Hedera networks', () => {
    // Test Hedera testnet connection
    // Test HashPack integration
    // Test Blade wallet integration
  });
});
```

### Manual Testing Checklist:

#### My-Events Page:
- [ ] Page loads without errors
- [ ] UnifiedConnectButton displays correctly
- [ ] Wallet connection works (MetaMask)
- [ ] Wallet connection works (Hedera wallets)
- [ ] Error handling works
- [ ] Success messages display
- [ ] Network switching works
- [ ] UI remains consistent

#### Event Details Page:
- [ ] Page loads without errors
- [ ] UnifiedConnectButton displays correctly
- [ ] Ticket purchase flow works
- [ ] Wallet connection persists
- [ ] Error states handled properly

## Phase 2 Testing: Code Cleanup

### Build Verification:
```bash
# Test build succeeds
npm run build

# Test TypeScript compilation
npm run type-check

# Test linting passes
npm run lint
```

### Import Resolution Tests:
```typescript
describe('Import Resolution', () => {
  it('should resolve all SDK imports', () => {
    // Test that @echain/wallet imports work
    expect(() => require('@echain/wallet')).not.toThrow();
  });

  it('should not have broken imports', () => {
    // Test that removed components don't break anything
    const { UnifiedConnectButton } = require('@echain/wallet/components');
    expect(UnifiedConnectButton).toBeDefined();
  });
});
```

### Runtime Verification:
- [ ] Application starts without errors
- [ ] No console errors related to missing components
- [ ] All pages load correctly
- [ ] Wallet functionality works

## Phase 3 Testing: Hook Migration

### Hook Integration Tests:
```typescript
describe('SDK Hook Integration', () => {
  it('should provide unified wallet helpers', () => {
    const { result } = renderHook(() => useWalletHelpers(), {
      wrapper: WagmiProvider
    });

    expect(result.current.connectWallet).toBeDefined();
    expect(result.current.formatEth).toBeDefined();
    expect(result.current.ensureBaseSepoliaNetwork).toBeDefined();
  });

  it('should handle network switching', async () => {
    // Test network switching functionality
    // Verify chain changes
    // Test error handling
  });
});
```

### Marketplace-Specific Tests:
```typescript
describe('Marketplace SDK Integration', () => {
  it('should handle wallet connections in marketplace', () => {
    // Test buy button with SDK
    // Test wallet connection prompts
    // Test network validation
  });

  it('should format ETH values correctly', () => {
    const { formatEth } = useWalletHelpers();
    expect(formatEth('1000000000000000000')).toBe('1.00');
  });
});
```

## End-to-End Testing

### Test Scenarios:

#### Complete User Journey:
1. **Landing Page**: User visits site
2. **Wallet Connection**: User connects wallet using UnifiedConnectButton
3. **Network Selection**: User switches networks if needed
4. **Event Browsing**: User browses events
5. **Ticket Purchase**: User purchases tickets
6. **Transaction Confirmation**: User sees transaction success

#### Error Scenarios:
1. **Connection Rejection**: User rejects wallet connection
2. **Network Mismatch**: Wrong network selected
3. **Insufficient Funds**: Not enough balance for purchase
4. **Transaction Failure**: On-chain transaction fails

### E2E Test Scripts:
```typescript
// Playwright e2e test example
test('complete ticket purchase flow', async ({ page }) => {
  await page.goto('/');

  // Connect wallet
  await page.click('button:has-text("Connect Wallet")');
  // Handle wallet connection modal
  // ... continue with flow

  // Verify success
  await expect(page.locator('text=Purchase successful')).toBeVisible();
});
```

## Performance Testing

### Bundle Size Analysis:
```bash
# Before migration
npm run build
ls -lh .next/static/chunks/ > bundle-size-before.txt

# After migration
npm run build
ls -lh .next/static/chunks/ > bundle-size-after.txt

# Compare
diff bundle-size-before.txt bundle-size-after.txt
```

### Runtime Performance:
```typescript
describe('Performance Tests', () => {
  it('should render components quickly', () => {
    const start = performance.now();
    render(<UnifiedConnectButton />);
    const end = performance.now();
    expect(end - start).toBeLessThan(100); // 100ms threshold
  });
});
```

## Cross-Browser Testing

### Supported Browsers:
- [ ] Chrome 100+
- [ ] Firefox 100+
- [ ] Safari 14+
- [ ] Edge 100+
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Wallet Extension Testing:
- [ ] MetaMask (Chrome, Firefox, Edge)
- [ ] Coinbase Wallet
- [ ] Hedera HashPack
- [ ] Hedera Blade

## Regression Testing

### Automated Regression Suite:
```bash
# Run all tests
npm test

# Run wallet-specific tests
npm run test:wallet

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

### Manual Regression Checks:
- [ ] All existing functionality works
- [ ] No new console errors
- [ ] Performance not degraded
- [ ] Bundle size acceptable
- [ ] All wallet connection methods work

## Success Criteria

### Functional Requirements:
- [ ] All wallet connections work (Ethereum + Hedera)
- [ ] Network switching functions correctly
- [ ] Error handling is consistent
- [ ] UI is unified across components
- [ ] No functionality regression

### Quality Requirements:
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Bundle size within 5% of baseline
- [ ] Performance within acceptable limits

### User Experience Requirements:
- [ ] Consistent wallet connection experience
- [ ] Clear error messages
- [ ] Fast loading times
- [ ] Mobile-friendly interface

## Rollback Testing

### Rollback Procedures:
1. **Component Level**: Revert individual component changes
2. **Full Rollback**: Restore all EnhancedConnectButton usage
3. **Feature Flag**: Use environment variables to toggle implementations

### Rollback Validation:
- [ ] System returns to pre-migration state
- [ ] All functionality restored
- [ ] No data loss
- [ ] User sessions maintained

## Monitoring and Reporting

### Post-Migration Monitoring:
- Error tracking (Sentry, LogRocket)
- Performance monitoring (Web Vitals)
- User analytics (connection success rates)
- Support ticket monitoring

### Success Metrics:
- Wallet connection success rate: >95%
- Average connection time: <3 seconds
- Error rate: <2%
- User satisfaction scores

## Timeline

- **Pre-migration**: 1 day (baseline establishment)
- **Phase 1**: 2 days (component testing)
- **Phase 2**: 1 day (cleanup verification)
- **Phase 3**: 2 days (hook integration testing)
- **E2E**: 3 days (comprehensive user journey testing)
- **Performance**: 1 day (optimization and validation)

## Tools and Environments

### Testing Tools:
- Jest + React Testing Library (unit tests)
- Playwright (e2e tests)
- Lighthouse (performance)
- BrowserStack (cross-browser)

### Test Environments:
- Local development
- Staging environment
- Production (canary releases)

---

*Testing Framework Version: October 10, 2025*
*SDK Version: @echain/wallet latest*</content>
<parameter name="filePath">E:/Polymath Universata/Projects/Echain/docs/SDK_MIGRATION_TESTING_GUIDE.md