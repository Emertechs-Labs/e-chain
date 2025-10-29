# Farcaster Analytics & Attribution

**Sprint 2, Story 4 (5pts)**  
**Status**: ✅ Complete  
**Date**: October 26, 2025

## Overview
Comprehensive analytics system for tracking Farcaster Frame performance with conversion funnels, viral coefficient calculation, referral attribution, and A/B testing capabilities.

## Implementation

### 1. Enhanced Analytics Hook (`hooks/useFarcasterFrame.ts`)

**New Capabilities**:

#### Conversion Funnel Tracking
5-step funnel with automatic progression tracking:
1. **View** - User sees the event frame
2. **Engage** - User interacts (button click, scroll)
3. **Connect** - User connects wallet
4. **Purchase** - User completes transaction
5. **Share** - User shares the event

**Methods**:
```typescript
trackView(eventId, metadata?)
trackEngage(eventId, engagementType, metadata?)
trackConnect(eventId, walletAddress)
trackPurchase(eventId, value, quantity)
trackShare(eventId, shareType)
```

#### Viral Metrics
Real-time viral growth tracking:
- **Viral Coefficient**: Conversions per share
- **K-Factor**: Viral loop metric (viralCoefficient × shares)
- **Shares Tracking**: Cast, recast, quote tracking
- **Referral Attribution**: FID-based referral tracking

**Method**:
```typescript
const { shares, conversions, viralCoefficient, kFactor } = getViralMetrics(eventId);
```

#### Referral Attribution
Automatic referral tracking via URL parameters:
- `?ref={fid}` - Referrer FID
- `?source={direct|share|recast|quote}` - Traffic source
- `?campaign={id}` - Campaign tracking

**Data Structure**:
```typescript
{
  referrerId: number,
  referrerUsername: string,
  source: 'direct' | 'share' | 'recast' | 'quote',
  campaignId: string
}
```

#### Session Tracking
Unique session IDs for user journey analysis:
- Format: `fs_{timestamp}_{random}`
- Persists across page views
- Links all events in a session

### 2. A/B Testing System (`hooks/useABTest.ts`)

**Features**:
- **Persistent Assignment**: LocalStorage-based variant assignment
- **Weighted Distribution**: Configurable variant weights
- **Traffic Control**: Percentage-based experiment enrollment
- **Conversion Tracking**: Goal-based conversion measurement

**Pre-built Tests**:

#### Frame Button Test
```typescript
const { buttonConfig, trackButtonClick } = useFrameButtonTest(eventId);
// Variants: Control vs Urgent CTA
// Tracks button click conversions
```

#### Price Display Test
```typescript
const { priceConfig, trackPriceView } = usePriceDisplayTest(eventId);
// Variants: ETH only, USD conversion, Discount emphasis
// Tracks price view and purchase correlation
```

**Custom Experiments**:
```typescript
const { variant, trackConversion } = useABTest('experiment_id');
// Load experiment config from API
// Track custom conversion goals
```

### 3. Analytics Tracking Endpoint (`app/api/analytics/track/route.ts`)

**Purpose**: Centralized event collection and distribution

**Features**:
- **Edge Runtime**: Low-latency event processing
- **Multi-destination**: Vercel Analytics, database, third-party
- **Enrichment**: Server-side data (IP, User-Agent, referer)
- **Silent Failures**: Never disrupts user experience

**Payload Structure**:
```typescript
{
  event: string,
  properties: {
    timestamp: number,
    sessionId: string,
    source: 'farcaster-frame',
    referral?: ReferralData,
    variant?: ABTestVariant,
    // Custom properties
  }
}
```

**Integrations**:
- ✅ Vercel Analytics
- ✅ Database storage (Supabase/PostgreSQL)
- ✅ Third-party analytics (Mixpanel, Amplitude, Segment)

### 4. Experiments API (`app/api/experiments/[id]/route.ts`)

**Purpose**: Serve A/B test configurations

**Example Experiments**:

#### Frame Buttons Test
```json
{
  "id": "frame_buttons_default",
  "active": true,
  "traffic": 1.0,
  "variants": [
    {
      "id": "control",
      "weight": 0.5,
      "config": {
        "primaryText": "Get Ticket",
        "primaryColor": "#10b981"
      }
    },
    {
      "id": "variant_a",
      "weight": 0.5,
      "config": {
        "primaryText": "🎟️ Claim Now",
        "primaryColor": "#f59e0b"
      }
    }
  ]
}
```

**Caching**: 5-minute cache for experiment configs

### 5. Analytics Dashboard (`components/analytics/AnalyticsDashboard.tsx`)

**Purpose**: Real-time monitoring interface

**Sections**:

#### Overview Metrics (Top Cards)
- Total Views
- Conversions
- Conversion Rate
- Viral Coefficient

#### Conversion Funnel Visualization
- Step-by-step progression
- Drop-off rates between steps
- Visual progress bars
- Percentage completion

#### Viral Growth Metrics
- Total shares
- Referral conversions
- K-factor calculation
- Viral loop analysis

#### Top Referrers Leaderboard
- Top 5 referring users
- Referral count per user
- Conversion rate per referrer
- FID and username display

**Time Ranges**: 1h, 24h, 7d, 30d with auto-refresh (30s)

### 6. Dashboard API (`app/api/analytics/dashboard/route.ts`)

**Purpose**: Aggregate metrics for dashboard display

**Endpoints**:
- `GET /api/analytics/dashboard?timeRange=24h` - All events
- `GET /api/analytics/dashboard?timeRange=7d&eventId=123` - Specific event

**Response Structure**:
```typescript
{
  overview: DashboardMetrics,
  funnel: FunnelMetrics,
  viral: ViralMetrics
}
```

**Caching**: 30s browser, 60s CDN

### 7. Integration with Frame Components

**TicketPurchase Component**:
```typescript
// Track purchase initiated
trackEngage(eventId, 'purchase_initiated');

// Track wallet connection
trackConnect(eventId, walletAddress);

// Track successful purchase
trackPurchase(eventId, ticketPrice, quantity);
```

**FrameEventPage Component**:
```typescript
// Track page view
trackView(eventId);

// Track share action
trackShare(eventId, 'cast');

// Track engagements
trackEngage(eventId, 'button_click');
```

## Analytics Event Types

### Core Events
- `funnel_view` - Frame viewed
- `funnel_engage` - User interaction
- `funnel_connect` - Wallet connected
- `funnel_purchase` - Purchase completed
- `funnel_share` - Event shared

### Conversion Events
- `conversion_complete` - Full funnel conversion
- `ab_conversion` - A/B test goal achieved

### Viral Events
- `viral_share` - Share with referral link
- `referral_conversion` - Conversion from referral

### A/B Test Events
- `ab_variant_assigned` - User assigned to variant
- `ab_conversion` - Variant conversion tracked

## Metrics & KPIs

### Conversion Funnel Metrics
```typescript
viewToEngageRate = engagements / views
engageToConnectRate = connects / engagements
connectToPurchaseRate = purchases / connects
overallConversionRate = purchases / views
```

### Viral Metrics
```typescript
viralCoefficient = conversions / shares
kFactor = viralCoefficient × averageShares
viralLoopTime = averageTimeToShare + averageTimeToConvert
```

### A/B Test Metrics
```typescript
conversionRate = conversions / assignments
liftOverControl = (variantRate - controlRate) / controlRate
statisticalSignificance = calculatePValue(variantData, controlData)
```

## Usage Examples

### Track Complete User Journey
```typescript
const { 
  trackView, 
  trackEngage, 
  trackConnect, 
  trackPurchase,
  getFunnelSummary 
} = useFarcasterAnalytics();

// Step 1: View
trackView(eventId);

// Step 2: Engage
trackEngage(eventId, 'button_click');

// Step 3: Connect
trackConnect(eventId, walletAddress);

// Step 4: Purchase
trackPurchase(eventId, '0.01', 1);

// Analyze funnel
const summary = getFunnelSummary(eventId);
console.log('Conversion rate:', summary.overallConversionRate);
```

### Implement A/B Test
```typescript
const { variant, trackConversion } = useABTest('frame_buttons_v1');

// Render variant
if (variant?.id === 'variant_a') {
  button.text = '🎟️ Claim Now';
} else {
  button.text = 'Get Ticket';
}

// Track conversion
onClick={() => {
  trackConversion('button_click', 1);
  handlePurchase();
}}
```

### Track Viral Growth
```typescript
const { trackShare, getViralMetrics } = useFarcasterAnalytics();

// User shares event
trackShare(eventId, 'cast');

// Analyze viral performance
const metrics = getViralMetrics(eventId);
console.log('Viral coefficient:', metrics.viralCoefficient);
console.log('K-factor:', metrics.kFactor);
```

## Dashboard Access

Visit `/analytics` to view the comprehensive dashboard with:
- Real-time metrics
- Conversion funnel visualization
- Viral growth tracking
- Top referrers leaderboard
- Time-range filtering

## Integration Checklist

- ✅ Analytics hook with funnel tracking
- ✅ Referral attribution system
- ✅ Viral coefficient calculation
- ✅ A/B testing framework
- ✅ Analytics tracking API
- ✅ Experiments configuration API
- ✅ Dashboard API with aggregated metrics
- ✅ Dashboard UI component
- ✅ Integration with TicketPurchase
- ✅ Integration with FrameEventPage
- ✅ Session tracking
- ✅ Multi-destination event routing

## Production Deployment

### Environment Variables
```bash
# Analytics
VERCEL_ANALYTICS_ID=xxx
ANALYTICS_ENDPOINT=https://analytics.example.com
ANALYTICS_API_KEY=xxx

# Database (for event storage)
DATABASE_URL=postgresql://...
```

### Analytics Destinations
1. **Vercel Analytics** - Real-time web vitals
2. **Database** - Long-term storage and querying
3. **Third-party** - Mixpanel, Amplitude, Segment

### Monitoring
- Event volume: ~1000 events/min expected
- P99 latency: < 50ms for tracking calls
- Silent failures: Errors don't impact UX
- Auto-retry: Failed events queued for retry

## Files Changed

- ✅ `frontend/hooks/useFarcasterFrame.ts` (enhanced with analytics)
- ✅ `frontend/hooks/useABTest.ts` (new - A/B testing)
- ✅ `frontend/app/api/analytics/track/route.ts` (new - event collection)
- ✅ `frontend/app/api/analytics/dashboard/route.ts` (new - metrics API)
- ✅ `frontend/app/api/experiments/[id]/route.ts` (new - A/B config)
- ✅ `frontend/components/analytics/AnalyticsDashboard.tsx` (new - UI)
- ✅ `frontend/app/analytics/page.tsx` (new - dashboard page)
- ✅ `frontend/components/frames/TicketPurchase.tsx` (integrated tracking)
- ✅ `frontend/components/frames/FrameEventPage.tsx` (integrated tracking)

## Success Criteria

- ✅ Conversion funnel tracking (5 steps)
- ✅ Viral coefficient calculation
- ✅ Referral attribution system
- ✅ A/B testing framework
- ✅ Analytics dashboard UI
- ✅ Real-time metrics
- ✅ Multi-destination routing
- ✅ Production-ready architecture

**Story Status**: ✅ COMPLETE

**Sprint 2 Progress**: 36/38 points (95%)
