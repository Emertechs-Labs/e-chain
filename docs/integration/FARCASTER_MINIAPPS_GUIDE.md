# 📱 Farcaster Mini Apps & Distribution Strategy

**Last Updated**: October 26, 2025  
**Version**: 1.0.0

---

## Overview

This guide covers integrating Echain with Farcaster's Mini Apps ecosystem and leveraging the Base app for distribution, enabling social-first event discovery and Web3-native attendee engagement.

---

## 🎯 Why Farcaster Mini Apps?

### Benefits
✅ **Social Distribution**: Reach Farcaster's growing user base  
✅ **Native Web3 Integration**: Built-in wallet connectivity  
✅ **Viral Discovery**: Social sharing and frames  
✅ **Low Friction**: Seamless in-app experience  
✅ **Base Ecosystem**: Aligned with Base blockchain  

### Key Metrics
- **Farcaster Users**: 350K+ registered (October 2025)
- **Daily Active**: 50K+ casts/day
- **Base Integration**: Native support
- **Frame Engagement**: 15% interaction rate

---

## 📚 Official Documentation

### Verified Resources

1. **Base Mini Apps Documentation**
   - **URL**: https://docs.base.org/mini-apps/
   - **Quickstart**: https://docs.base.org/mini-apps/quickstart/
   - **Status**: ✅ Verified October 26, 2025

2. **Migration Guide for Existing Apps**
   - **URL**: https://docs.base.org/mini-apps/quickstart/migrate-existing-apps
   - **Purpose**: Convert Next.js app to Mini App
   - **Status**: ✅ Verified October 26, 2025

3. **Farcaster Developer Docs**
   - **URL**: https://docs.farcaster.xyz/
   - **Frames Spec**: https://docs.farcaster.xyz/reference/frames/spec
   - **Status**: ✅ Verified October 26, 2025

4. **Base Distribution**
   - **URL**: https://www.base.org/
   - **App Directory**: https://www.base.org/ecosystem
   - **Status**: ✅ Verified October 26, 2025

---

## 🚀 Implementation Guide

### Phase 1: Add Frame Metadata (Week 1)

#### Step 1.1: Install Dependencies

```bash
npm install @coinbase/onchainkit
npm install viem@2.x
```

#### Step 1.2: Create Frame Metadata

```typescript
// app/events/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getEventById } from '@/lib/events';

export const runtime = 'edge';
export const alt = 'Event Details';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0052FF',
          backgroundImage: 'linear-gradient(to bottom, #0052FF, #0041CC)',
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}>
          <h1 style={{ fontSize: 60, color: 'white', margin: 0 }}>
            {event.title}
          </h1>
          <p style={{ fontSize: 30, color: '#E6F0FF', margin: 0 }}>
            {new Date(event.startDate).toLocaleDateString()}
          </p>
          <p style={{ fontSize: 24, color: '#CCE0FF', margin: 0 }}>
            {event.ticketsAvailable} tickets available
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

#### Step 1.3: Add Frame Metadata to Layout

```typescript
// app/events/[id]/layout.tsx
import { Metadata } from 'next';
import { getEventById } from '@/lib/events';

export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  const event = await getEventById(params.id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://echain-eight.vercel.app';
  const eventUrl = `${baseUrl}/events/${params.id}`;

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [`${eventUrl}/opengraph-image`],
    },
    other: {
      // Farcaster Frame metadata
      'fc:frame': 'vNext',
      'fc:frame:image': `${eventUrl}/opengraph-image`,
      'fc:frame:button:1': 'View Event',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': eventUrl,
      'fc:frame:button:2': 'Buy Ticket',
      'fc:frame:button:2:action': 'tx',
      'fc:frame:button:2:target': `${baseUrl}/api/frame/buy-ticket/${params.id}`,
      'fc:frame:post_url': `${baseUrl}/api/frame/callback`,
    },
  };
}
```

#### Step 1.4: Frame API Endpoints

```typescript
// app/api/frame/buy-ticket/[eventId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { encodeAbiParameters, parseAbiParameters } from 'viem';
import { EVENT_TICKET_ADDRESS, EVENT_TICKET_ABI } from '@/lib/contracts';

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await req.json();
    const { fid, address } = body.untrustedData;

    // Get event details
    const event = await getEventById(params.eventId);

    // Encode transaction data
    const calldata = encodeAbiParameters(
      parseAbiParameters('uint256, address'),
      [BigInt(params.eventId), address]
    );

    return NextResponse.json({
      chainId: `eip155:${process.env.NEXT_PUBLIC_CHAIN_ID}`,
      method: 'eth_sendTransaction',
      params: {
        abi: EVENT_TICKET_ABI,
        to: EVENT_TICKET_ADDRESS,
        data: calldata,
        value: event.ticketPrice.toString(),
      },
    });
  } catch (error) {
    console.error('Frame transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
```

### Phase 2: Migrate to Mini App (Week 2-3)

#### Step 2.1: Install Minikit

**Reference**: https://docs.base.org/mini-apps/quickstart/migrate-existing-apps

```bash
npm install @worldcoin/minikit-js
```

#### Step 2.2: Create Mini App Manifest

```typescript
// public/minikit.json
{
  "name": "Echain Events",
  "short_name": "Echain",
  "description": "Decentralized event management on Base",
  "version": "1.0.0",
  "minikit_version": "0.1.0",
  "app_id": "echain-events",
  "theme_color": "#0052FF",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "scope": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "permissions": [
    "wallet",
    "identity",
    "notifications"
  ],
  "capabilities": {
    "wallet": {
      "chains": [8453],
      "methods": ["eth_sendTransaction", "personal_sign"]
    }
  }
}
```

#### Step 2.3: Initialize Minikit

```typescript
// app/providers/minikit-provider.tsx
'use client';

import { useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

export function MinikitProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    MiniKit.install({
      appId: process.env.NEXT_PUBLIC_MINIKIT_APP_ID!,
      debug: process.env.NODE_ENV === 'development',
    });
  }, []);

  return <>{children}</>;
}
```

#### Step 2.4: Add Minikit to Root Layout

```typescript
// app/layout.tsx
import { MinikitProvider } from './providers/minikit-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/minikit.json" />
      </head>
      <body>
        <MinikitProvider>
          {children}
        </MinikitProvider>
      </body>
    </html>
  );
}
```

#### Step 2.5: Use Minikit Wallet

```typescript
// components/BuyTicketButton.tsx
'use client';

import { MiniKit } from '@worldcoin/minikit-js';
import { useState } from 'react';

export function BuyTicketButton({ eventId, price }: { 
  eventId: string; 
  price: bigint; 
}) {
  const [loading, setLoading] = useState(false);

  const handleBuyTicket = async () => {
    setLoading(true);
    
    try {
      // Check if in Mini App context
      if (!MiniKit.isInstalled()) {
        alert('Please open this in the Farcaster app');
        return;
      }

      // Request transaction
      const result = await MiniKit.commandsAsync.sendTransaction({
        transaction: [{
          address: EVENT_TICKET_ADDRESS,
          abi: EVENT_TICKET_ABI,
          functionName: 'mintTicket',
          args: [BigInt(eventId)],
          value: price,
        }],
      });

      if (result.status === 'success') {
        alert('Ticket purchased successfully!');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuyTicket}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg"
    >
      {loading ? 'Processing...' : 'Buy Ticket'}
    </button>
  );
}
```

### Phase 3: Environment Configuration (Week 3)

#### Step 3.1: Environment Variables

```bash
# .env.local

# Minikit Configuration
NEXT_PUBLIC_MINIKIT_APP_ID=echain-events
MINIKIT_CLIENT_SECRET=your_client_secret_here

# Farcaster Configuration
NEXT_PUBLIC_FARCASTER_HUB_URL=https://hub.farcaster.xyz
FARCASTER_APP_FID=your_app_fid_here
FARCASTER_SIGNER_UUID=your_signer_uuid_here

# Frame Configuration
NEXT_PUBLIC_FRAME_URL=https://echain-eight.vercel.app
FRAME_SECRET=your_frame_secret_here

# Base Configuration
NEXT_PUBLIC_BASE_URL=https://echain-eight.vercel.app
NEXT_PUBLIC_CHAIN_ID=8453
```

#### Step 3.2: Validate Configuration

```typescript
// scripts/validate-minikit-config.ts
import { z } from 'zod';

const configSchema = z.object({
  NEXT_PUBLIC_MINIKIT_APP_ID: z.string().min(1),
  MINIKIT_CLIENT_SECRET: z.string().min(1),
  NEXT_PUBLIC_FARCASTER_HUB_URL: z.string().url(),
  FARCASTER_APP_FID: z.string().min(1),
  NEXT_PUBLIC_FRAME_URL: z.string().url(),
  FRAME_SECRET: z.string().min(32),
});

try {
  configSchema.parse(process.env);
  console.log('✅ Minikit configuration valid');
} catch (error) {
  console.error('❌ Invalid Minikit configuration:', error);
  process.exit(1);
}
```

### Phase 4: Testing & Deployment (Week 4)

#### Step 4.1: Test in Farcaster App

1. **Install Warpcast** (Farcaster client): https://warpcast.com/
2. **Create test account**
3. **Share frame link** in a test cast
4. **Verify frame rendering** and buttons
5. **Test transaction flow**

#### Step 4.2: Frame Validator

Use official validator: https://warpcast.com/~/developers/frames

```typescript
// Test your frame metadata
const frameUrl = 'https://echain-eight.vercel.app/events/1';
// Paste in validator to check compliance
```

#### Step 4.3: Deploy to Production

```bash
# Ensure environment variables are set in Vercel
vercel env add NEXT_PUBLIC_MINIKIT_APP_ID production
vercel env add MINIKIT_CLIENT_SECRET production
# ... add all required vars

# Deploy
vercel --prod
```

---

## 📊 Distribution Strategy

### 1. Base Ecosystem Directory

**Submit to Base App Directory**:
- **URL**: https://www.base.org/ecosystem
- **Process**: https://base.org/submit

#### Submission Checklist
- [ ] Complete Base integration (contracts deployed)
- [ ] Mini App functional
- [ ] Frame metadata verified
- [ ] Logo and screenshots prepared
- [ ] Description and categories
- [ ] Social media links

### 2. Farcaster Discovery

**Channels to Target**:
- `/base` - Base blockchain community
- `/events` - Event discovery
- `/web3` - Web3 enthusiasts
- `/nfts` - NFT collectors

**Strategy**:
```typescript
// Auto-post new events to Farcaster
export async function postEventToFarcaster(event: Event) {
  const cast = {
    text: `🎟️ New event on Echain!\n\n${event.title}\n📅 ${event.date}\n🎫 ${event.ticketsAvailable} tickets\n\nView & buy tickets:`,
    embeds: [{
      url: `https://echain-eight.vercel.app/events/${event.id}`
    }],
    channel: 'events',
  };

  // Post via Farcaster API
  await fetch('https://api.farcaster.xyz/v2/casts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FARCASTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cast),
  });
}
```

### 3. Frame Virality Features

```typescript
// components/ShareFrame.tsx
export function ShareFrame({ eventId }: { eventId: string }) {
  const shareUrl = `https://echain-eight.vercel.app/events/${eventId}`;
  
  const shareToFarcaster = () => {
    const castText = encodeURIComponent('Check out this event on Echain! 🎟️');
    const warpcastUrl = `https://warpcast.com/~/compose?text=${castText}&embeds[]=${encodeURIComponent(shareUrl)}`;
    window.open(warpcastUrl, '_blank');
  };

  return (
    <button onClick={shareToFarcaster}>
      Share on Farcaster
    </button>
  );
}
```

### 4. Incentivize Sharing

```solidity
// contracts/IncentiveManager.sol
function rewardReferral(address referrer, uint256 eventId) external {
    // Award POAP or tokens to users who share events
    require(hasSharedEvent[referrer][eventId], "Not shared");
    
    // Mint reward
    rewardToken.mint(referrer, SHARE_REWARD_AMOUNT);
}
```

---

## 🎯 Success Metrics

### Track These KPIs

```typescript
// lib/analytics/frame-metrics.ts
export interface FrameMetrics {
  impressions: number;          // Frame views
  clicks: number;                // Button clicks
  transactions: number;          // Completed purchases
  shares: number;                // Recasts
  conversionRate: number;        // Clicks / Impressions
  averageTicketsSold: number;    // Per event
}

export async function trackFrameEvent(
  eventType: 'impression' | 'click' | 'transaction' | 'share',
  eventId: string,
  userId: string
) {
  await db.frameMetrics.create({
    data: {
      eventType,
      eventId,
      userId,
      timestamp: new Date(),
    },
  });
}
```

### Success Targets (3 Months)

| Metric | Target | Actual |
|--------|--------|--------|
| Frame Impressions | 50K | - |
| Click-Through Rate | 10% | - |
| Transactions | 1K | - |
| Farcaster Followers | 1K | - |
| Events Created | 100 | - |

---

## 🔧 Troubleshooting

### Common Issues

#### Frame Not Rendering

**Issue**: Frame metadata not showing in Farcaster  
**Solution**:
```bash
# Validate metadata
curl -I https://echain-eight.vercel.app/events/1
# Check for fc:frame headers

# Use Frame Validator
https://warpcast.com/~/developers/frames
```

#### Transaction Failing

**Issue**: Minikit transaction not completing  
**Solution**:
```typescript
// Add error handling
try {
  const result = await MiniKit.commandsAsync.sendTransaction({...});
  if (result.status === 'error') {
    console.error('Transaction error:', result.error);
    // Show user-friendly message
  }
} catch (error) {
  // Handle rejection
}
```

#### Wallet Not Connecting

**Issue**: Minikit not detecting wallet  
**Solution**:
```typescript
// Check Minikit installation
if (!MiniKit.isInstalled()) {
  // Show fallback UI
  return <FallbackWalletConnect />;
}
```

---

## 📋 Checklist for Launch

### Pre-Launch
- [ ] Frame metadata implemented on all event pages
- [ ] Frame validated with official tool
- [ ] Minikit manifest created and tested
- [ ] Environment variables configured
- [ ] Transaction flow tested end-to-end
- [ ] Analytics tracking implemented

### Launch Day
- [ ] Submit to Base ecosystem directory
- [ ] Post announcement on Farcaster
- [ ] Share in relevant channels (/base, /events)
- [ ] Monitor frame impressions and clicks
- [ ] Respond to user feedback

### Post-Launch (Week 1)
- [ ] Analyze metrics
- [ ] A/B test frame images
- [ ] Optimize conversion funnel
- [ ] Engage with early users
- [ ] Iterate based on feedback

---

## 🔗 Verified External Links

All links verified on October 26, 2025:

✅ **Base Mini Apps**: https://docs.base.org/mini-apps/  
✅ **Migration Guide**: https://docs.base.org/mini-apps/quickstart/migrate-existing-apps  
✅ **Farcaster Docs**: https://docs.farcaster.xyz/  
✅ **Frame Spec**: https://docs.farcaster.xyz/reference/frames/spec  
✅ **Base Ecosystem**: https://www.base.org/ecosystem  
✅ **Warpcast**: https://warpcast.com/  
✅ **Frame Validator**: https://warpcast.com/~/developers/frames  

---

## 📚 Additional Resources

- **Minikit Examples**: https://github.com/worldcoin/minikit-examples
- **Farcaster Frames Gallery**: https://www.farcaster.gallery/
- **Base Developer Discord**: https://discord.gg/buildonbase
- **Warpcast Developers**: https://warpcast.com/~/developers

---

**Implementation Timeline**: 4 weeks  
**Effort**: Medium  
**Impact**: High  
**Priority**: High for Beta Release

**Last Updated**: October 26, 2025  
**Next Review**: November 26, 2025

