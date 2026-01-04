# Frontend Architecture Documentation

**Last Updated**: October 26, 2025  
**Framework**: Next.js 15.5.4 with App Router  
**Deployment**: Vercel (https://echain-eight.vercel.app)

## 📁 Application Structure

```
frontend/
├── app/                          # Next.js 15 App Router
│   ├── (routes)/
│   │   ├── events/              # Event browsing and management
│   │   │   ├── page.tsx         # Events listing
│   │   │   ├── create/          # Event creation form
│   │   │   └── [id]/            # Event details & management
│   │   ├── marketplace/         # Secondary ticket market
│   │   │   ├── page.tsx         # Marketplace listings
│   │   │   ├── create/          # Create listing
│   │   │   └── my-listings/     # User listings
│   │   ├── my-tickets/          # User ticket portfolio
│   │   ├── my-events/           # Organizer event dashboard
│   │   ├── organizer/           # Organizer tools
│   │   │   └── approval/        # Verification workflow
│   │   ├── poaps/               # POAP attendance certificates
│   │   └── rewards/             # Loyalty and incentives
│   ├── api/                     # API routes (Next.js 15 Route Handlers)
│   │   ├── events/              # Event data endpoints
│   │   ├── contracts/           # Contract interaction APIs
│   │   ├── poap/                # POAP claim endpoints
│   │   └── marketplace/         # Marketplace APIs
│   ├── components/              # Shared UI components
│   │   ├── events/              # Event-specific components
│   │   ├── layout/              # Layout components
│   │   ├── ui/                  # Generic UI components
│   │   └── sections/            # Page sections
│   └── hooks/                   # Custom React hooks
│       ├── useEvents.ts         # Event data fetching
│       ├── useTickets.ts        # Ticket operations
│       ├── useMarketplace.ts    # Marketplace interactions
│       └── useContract.ts       # Generic contract hook
├── lib/                         # Core utilities and integrations
│   ├── contracts.ts             # Contract addresses & ABIs
│   ├── wagmi.ts                 # Wagmi configuration
│   ├── contract-wrapper.ts      # Contract interaction layer
│   ├── metadata.ts              # IPFS metadata handling
│   ├── base-rpc-manager.ts      # RPC provider management
│   ├── base-state-sync.ts       # Blockchain state synchronization
│   ├── performance-monitor.ts   # Performance tracking
│   ├── ipfs.ts                  # IPFS/Pinata integration
│   ├── blob.ts                  # Vercel Blob storage
│   ├── edge-config.ts           # Vercel Edge Config
│   ├── smart-wallet/            # Coinbase Smart Wallet SDK
│   └── utils.ts                 # Utility functions
├── components/                  # Global components directory
├── public/                      # Static assets
├── styles/                      # Global styles
└── types/                       # TypeScript types

```

## 🔧 Core Technologies

### Framework & Build
- **Next.js**: 15.5.4 (App Router, Turbopack, Server Components)
- **React**: 18.3.1
- **TypeScript**: 5.2.0
- **Tailwind CSS**: 3.4.17

### Web3 Stack
- **Wagmi**: 2.12.0 - React hooks for Ethereum
- **Viem**: 2.17.0 - TypeScript interface for Ethereum
- **RainbowKit**: 2.1.0 - Wallet connection UI
- **OnchainKit**: 1.1.1 - Coinbase Web3 components
- **Ethers**: 6.15.0 - Ethereum library

### State Management
- **TanStack Query**: 5.83.0 - Server state caching
- **React Context**: Theme, wallet, app state

### Storage & Data
- **Vercel Blob**: 2.0.0 - File storage
- **Vercel Edge Config**: 1.4.0 - Configuration
- **Pinata Web3**: 0.5.4 - IPFS integration
- **Better-SQLite3**: 12.4.1 - Local caching

### UI Components
- **Radix UI**: Accessible component primitives
- **Framer Motion**: 12.23.22 - Animations
- **Lucide React**: 0.462.0 - Icons
- **Sonner**: 1.7.4 - Toast notifications
- **QRCode**: 1.5.3 - QR code generation

## 🎣 Custom Hooks Architecture

### Event Hooks (`app/hooks/useEvents.ts`)
```typescript
// Enhanced caching with 10-minute TTL
const CACHE_TTL_EVENTS = 10 * 60 * 1000;
const MAX_RETRIES = 3;

export function useEvents(options?: EventQueryOptions) {
  return useQuery({
    queryKey: ['events', options],
    queryFn: async () => {
      // 1. Check cache
      const cached = getCachedData<Event[]>(cacheKey);
      if (cached) return cached;
      
      // 2. Fetch with retry
      const events = await retryWithBackoff(() =>
        readContract(CONTRACT_ADDRESSES.EventFactory, 'getActiveEvents', [offset, limit])
      );
      
      // 3. Enrich with metadata
      const enriched = await enrichEventsWithMetadata(events);
      
      // 4. Cache result
      setCachedData(cacheKey, enriched, CACHE_TTL_EVENTS);
      
      return enriched;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}
```

### Ticket Hooks (`app/hooks/useTickets.ts`)
- `useUserTickets(address)` - Fetch user's tickets
- `usePurchaseTicket()` - Purchase ticket mutation
- `useTicketDetails(tokenId)` - Individual ticket data
- `useCheckIn(eventId)` - QR code check-in

### Marketplace Hooks (`app/hooks/useMarketplace.ts`)
- `useListings()` - Active marketplace listings
- `useCreateListing()` - Create new listing
- `useBuyListing()` - Purchase from marketplace
- `useCancelListing()` - Cancel own listing

### Contract Hook (`app/hooks/useContract.ts`)
```typescript
// Generic contract interaction hook
export function useContract<T>(
  address: string,
  functionName: string,
  args: any[] = [],
  options?: UseQueryOptions
) {
  return useQuery({
    queryKey: ['contract', address, functionName, ...args],
    queryFn: () => readContract(address, functionName, args),
    ...options
  });
}
```

## 🔗 Contract Integration Layer

### Contract Wrapper (`lib/contract-wrapper.ts`)
Unified interface for contract interactions:

```typescript
export async function readContract(
  address: string,
  functionName: string,
  args: any[] = []
): Promise<any> {
  const contract = new Contract(address, ABI, provider);
  return await performanceMonitor.track(
    `read:${functionName}`,
    () => contract[functionName](...args)
  );
}

export async function writeContract(
  address: string,
  functionName: string,
  args: any[] = [],
  options?: TransactionOptions
): Promise<TransactionReceipt> {
  const signer = await getSigner();
  const contract = new Contract(address, ABI, signer);
  
  // Simulate before sending
  await contract[functionName].staticCall(...args);
  
  const tx = await contract[functionName](...args, options);
  return await tx.wait();
}
```

### Contract Addresses (`lib/contracts.ts`)
```typescript
export const CONTRACT_ADDRESSES = {
  EventFactory: '0xA97cB40548905B05A67fCD4765438aFBEA4030fc',
  EventTicket: '0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C',
  POAPAttendance: '0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33',
  IncentiveManager: '0x1cfDae689817B954b72512bC82f23F35B997617D',
  Marketplace: '0xD061393A54784da5Fea48CC845163aBc2B11537A'
} as const;
```

## 🚀 Performance Optimization

### Caching Strategy (`lib/performance-monitor.ts`)
```typescript
// Multi-layer caching
const eventCache = new Map<string, CachedData>();

// Layer 1: In-memory cache (10-min TTL for events)
// Layer 2: TanStack Query cache (5-min stale time)
// Layer 3: Vercel Edge Config (configuration data)

export const performanceMonitor = {
  track: async (name: string, fn: () => Promise<any>) => {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      console.log(`[Perf] ${name}: ${duration}ms`);
      return result;
    } catch (error) {
      console.error(`[Perf] ${name} failed:`, error);
      throw error;
    }
  }
};
```

### Retry Logic with Exponential Backoff
```typescript
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 500
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};
```

## 🌐 RPC Provider Management

### Base RPC Manager (`lib/base-rpc-manager.ts`)
```typescript
export class BaseRPCManager {
  private providers = [
    { name: 'Chainstack', url: env.CHAINSTACK_RPC },
    { name: 'Spectrum', url: env.SPECTRUM_RPC },
    { name: 'Coinbase', url: env.COINBASE_RPC }
  ];
  
  async getProvider(): Promise<JsonRpcProvider> {
    // Health check and failover logic
    for (const provider of this.providers) {
      if (await this.healthCheck(provider.url)) {
        return new JsonRpcProvider(provider.url);
      }
    }
    throw new Error('No healthy RPC providers available');
  }
}
```

## 📦 Storage Architecture

### IPFS Metadata (`lib/ipfs.ts`)
```typescript
export async function uploadToIPFS(data: any): Promise<string> {
  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT
  });
  
  const result = await pinata.upload.json(data);
  return `ipfs://${result.IpfsHash}`;
}
```

### Vercel Blob Storage (`lib/blob.ts`)
```typescript
import { put, list, del } from '@vercel/blob';

export async function uploadImage(file: File): Promise<string> {
  const blob = await put(`events/${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true
  });
  return blob.url;
}
```

## 🎨 UI Component Architecture

### Component Organization
- **Atomic Design**: Atoms → Molecules → Organisms → Templates
- **Server Components**: Default for static content
- **Client Components**: Interactive elements with 'use client'
- **Shared Components**: Reusable across routes

### Key Components
- `EventCard` - Event display card
- `TicketCard` - NFT ticket display
- `MarketplaceListing` - Marketplace item
- `WalletConnect` - RainbowKit wrapper
- `TransactionButton` - Smart transaction handling
- `QRCodeDisplay` - QR code generator/scanner

## 🔐 Security Patterns

### Environment Validation
```typescript
// Validate required env vars at build time
const requiredEnvVars = [
  'NEXT_PUBLIC_EVENT_FACTORY_ADDRESS',
  'NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

### Transaction Safety
- Pre-flight simulation with `staticCall`
- Error boundaries for transaction flows
- User confirmation before high-value ops
- Gas estimation before submission

## 📊 Analytics Integration

```typescript
import { Analytics } from '@vercel/analytics/react';

// Track page views and custom events
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 🧪 Testing Strategy

### Unit Tests
- React component testing with Jest
- Hook testing with React Testing Library
- Utility function tests

### Integration Tests
- Contract interaction flows
- Wallet connection flows
- End-to-end user journeys

## 🚀 Deployment

**Platform**: Vercel  
**URL**: https://echain-eight.vercel.app  
**Build Command**: `npm run build`  
**Environment**: Production (Base Sepolia)

### Build Optimizations
- Turbopack for faster builds
- Automatic code splitting
- Image optimization
- Edge runtime for API routes

## 📖 References

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Wagmi Documentation](https://wagmi.sh/)
- [OnchainKit Docs](https://docs.base.org/onchainkit/latest/getting-started/overview)
- [RainbowKit Docs](https://www.rainbowkit.com/)
- [TanStack Query](https://tanstack.com/query/latest)
