# EnhancedConnectButton to UnifiedConnectButton Migration

## Overview

This guide provides step-by-step instructions for replacing `EnhancedConnectButton` with `UnifiedConnectButton` from the `@echain/wallet` SDK.

## Current Usage Analysis

### Files Using EnhancedConnectButton:
1. `frontend/app/my-events/page.tsx` - Line 7 import, Line 195 usage
2. `frontend/app/events/[id]/page.tsx` - Line 17 import, Line 426 usage

### Files Importing but Not Using:
1. `frontend/app/components/layout/Header.tsx` - Import present but `UnifiedConnectButton` used instead

## Implementation Steps

### Step 1: Update my-events/page.tsx

#### Current Code (Lines 1-10):
```tsx
"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { EnhancedConnectButton } from "../components/EnhancedConnectButton";
import { useEventsByOrganizer, useOrganizerMetrics } from "../hooks/useEvents";
```

#### Updated Code:
```tsx
"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { UnifiedConnectButton } from '@echain/wallet/components';
import { useEventsByOrganizer, useOrganizerMetrics } from "../hooks/useEvents";
```

#### Current Usage (Around Line 195):
```tsx
            <EnhancedConnectButton />
```

#### Updated Usage:
```tsx
            <UnifiedConnectButton />
```

### Step 2: Update events/[id]/page.tsx

#### Current Code (Lines 15-20):
```tsx
import { useAccount } from "wagmi";
import { useEventDetails, useTicketPurchase } from "../../hooks/useEvents";
import { EnhancedConnectButton } from "../../components/EnhancedConnectButton";
import { readContract } from "../../../lib/contract-wrapper";
```

#### Updated Code:
```tsx
import { useAccount } from "wagmi";
import { useEventDetails, useTicketPurchase } from "../../hooks/useEvents";
import { UnifiedConnectButton } from '@echain/wallet/components';
import { readContract } from "../../../lib/contract-wrapper";
```

#### Current Usage (Around Line 426):
```tsx
                      <EnhancedConnectButton />
```

#### Updated Usage:
```tsx
                      <UnifiedConnectButton />
```

### Step 3: Clean Up Header.tsx Import

#### Current Code (Lines 1-10):
```tsx
'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { EnhancedConnectButton } from '../EnhancedConnectButton';
import { UnifiedConnectButton } from '@echain/wallet/components';
```

#### Updated Code:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UnifiedConnectButton } from '@echain/wallet/components';
```

## Feature Comparison

### EnhancedConnectButton Features:
- ✅ Basic wallet connection
- ✅ RainbowKit integration
- ✅ Error handling
- ✅ Farcaster integration
- ❌ Hedera wallet support
- ❌ Unified error messages
- ❌ Network switching integration

### UnifiedConnectButton Features:
- ✅ Basic wallet connection
- ✅ RainbowKit integration
- ✅ Error handling
- ✅ Farcaster integration
- ✅ **Hedera wallet support**
- ✅ **Unified error messages**
- ✅ **Network switching integration**
- ✅ **Consistent UI across app**

## Testing Checklist

### Pre-Implementation:
- [ ] Test current wallet connection flow in my-events page
- [ ] Test current wallet connection flow in event details page
- [ ] Verify error handling works
- [ ] Confirm Farcaster integration works

### Post-Implementation:
- [ ] Test UnifiedConnectButton in my-events page
- [ ] Test UnifiedConnectButton in event details page
- [ ] Verify Hedera wallet connection works
- [ ] Test network switching functionality
- [ ] Confirm unified error messages
- [ ] Test Farcaster integration still works
- [ ] Verify UI consistency

### Cross-Browser Testing:
- [ ] Chrome with MetaMask
- [ ] Firefox with MetaMask
- [ ] Safari with MetaMask
- [ ] Mobile browsers
- [ ] Test Hedera wallet connections

## Rollback Instructions

If issues occur, revert changes:

### my-events/page.tsx:
```tsx
// Revert import
import { EnhancedConnectButton } from "../components/EnhancedConnectButton";

// Revert usage
<EnhancedConnectButton />
```

### events/[id]/page.tsx:
```tsx
// Revert import
import { EnhancedConnectButton } from "../../components/EnhancedConnectButton";

// Revert usage
<EnhancedConnectButton />
```

## Expected Benefits

1. **Unified Experience**: Consistent wallet connection UI across all pages
2. **Hedera Support**: Native Hedera wallet integration
3. **Better Error Handling**: SDK-level error management
4. **Network Switching**: Built-in network switching capabilities
5. **Maintenance**: Single component to maintain instead of multiple

## Code Quality Checks

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All imports resolve correctly
- [ ] Bundle size impact assessed
- [ ] Performance impact tested

## Documentation Updates Needed

- [ ] Update component usage documentation
- [ ] Update troubleshooting guides
- [ ] Update developer onboarding docs
- [ ] Update API documentation if needed

---

*Implementation Date: October 10, 2025*
*SDK Version: @echain/wallet latest*</content>
<parameter name="filePath">E:/Polymath Universata/Projects/Echain/docs/ENHANCED_CONNECT_BUTTON_MIGRATION.md