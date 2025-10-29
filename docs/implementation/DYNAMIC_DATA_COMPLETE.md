# Dynamic Data System Implementation - Complete Documentation

**Last Updated**: October 26, 2025  
**Status**: ✅ Implemented  
**Version**: 1.0.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Integration with Base Network](#integration-with-base-network)
7. [Testing Guide](#testing-guide)
8. [Deployment](#deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🎯 Overview

### What We Built

A complete dynamic data system for Echain that replaces static content with database-backed, real-time data:

- **Pricing Management**: Dynamic pricing tiers stored in SQLite database
- **Platform Statistics**: Real-time blockchain and database metrics with caching
- **FAQ System**: Searchable, categorized FAQs with full-text search
- **Content Management**: Blog/news system ready for implementation

### Key Features

- ✅ Database-backed content management
- ✅ RESTful API endpoints
- ✅ Response caching (5-minute TTL)
- ✅ Full-text search for FAQs
- ✅ Server-side rendering (Next.js)
- ✅ Type-safe TypeScript implementation
- ✅ Better-sqlite3 for performance
- ✅ Seeded with production-ready data

---

## 🏗️ Architecture

### Technology Stack

```
Frontend:
├── Next.js 14+ (App Router)
├── React Server Components
├── TypeScript
├── Tailwind CSS
└── Client Components for interactivity

Database:
├── better-sqlite3 (SQLite)
├── WAL mode for concurrency
├── FTS5 for full-text search
└── JSON columns for flexible data

API Layer:
├── Next.js API Routes
├── Edge Runtime (where applicable)
├── Response caching
└── Rate limiting ready

Blockchain Integration:
├── viem for Base network
├── Multiple RPC providers (Chainstack, Spectrum, Base)
├── Automatic fallback
└── Error handling & retries
```

### Data Flow

```
User Request → Next.js Page (SSR)
              ↓
          API Route
              ↓
      Check Cache (5min TTL)
              ↓
      Query SQLite Database
              ↓
      Format & Serialize Response
              ↓
      Return JSON + Cache Headers
              ↓
    Render in Client Component
```

---

## 🗄️ Database Schema

### Location
`frontend/lib/database.ts`

### Tables Created

#### 1. pricing_tiers
```sql
CREATE TABLE pricing_tiers (
  id TEXT PRIMARY KEY,                    -- tier-{timestamp}
  name TEXT NOT NULL,                     -- "Free", "Starter", etc.
  description TEXT,                       -- Plan description
  price_monthly REAL,                     -- Monthly price in USD
  price_yearly REAL,                      -- Yearly price in USD
  features_json TEXT NOT NULL,            -- JSON array of features
  limits_json TEXT NOT NULL,              -- JSON object of limits
  badge TEXT,                             -- "Popular", "Best Value", etc.
  is_active BOOLEAN DEFAULT 1,            -- Soft delete flag
  sort_order INTEGER DEFAULT 0,           -- Display order
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_tiers_active 
ON pricing_tiers(is_active, sort_order);
```

**Initial Data**: 4 tiers (Free, Starter, Professional, Enterprise)

#### 2. platform_statistics
```sql
CREATE TABLE platform_statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL UNIQUE,       -- e.g., "platform_stats"
  metric_value TEXT NOT NULL,             -- JSON stringified stats
  last_calculated DATETIME DEFAULT CURRENT_TIMESTAMP,
  calculation_duration_ms INTEGER         -- Performance tracking
);

CREATE INDEX idx_platform_statistics_calculated 
ON platform_statistics(last_calculated);
```

**Caching Strategy**: 5-minute TTL for expensive blockchain queries

#### 3. faqs
```sql
CREATE TABLE faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,                 -- "General", "Events", etc.
  tags_json TEXT,                         -- JSON array of tags
  helpful_count INTEGER DEFAULT 0,        -- Upvotes
  not_helpful_count INTEGER DEFAULT 0,    -- Downvotes
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faqs_category ON faqs(category, is_active);

-- Full-text search table
CREATE VIRTUAL TABLE faqs_fts USING fts5(
  question, answer, 
  content=faqs, 
  content_rowid=rowid
);
```

**Initial Data**: 5 common FAQs

#### 4. content_posts
```sql
CREATE TABLE content_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  tags_json TEXT,
  featured_image TEXT,
  is_published BOOLEAN DEFAULT 0,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_posts_slug ON content_posts(slug);
CREATE INDEX idx_content_posts_published 
ON content_posts(is_published, published_at DESC);
```

---

## 🔌 API Endpoints

### 1. Pricing API

#### GET /api/pricing
Fetch all active pricing tiers

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "Free",
      "description": "Perfect for getting started",
      "priceMonthly": 0,
      "priceYearly": 0,
      "features": ["Up to 5 events/month", "..."],
      "limits": {
        "eventsPerMonth": 5,
        "ticketsPerEvent": 100,
        "storageGB": 1
      },
      "badge": null,
      "isActive": true,
      "sortOrder": 0
    }
  ],
  "timestamp": "2025-10-26T12:00:00.000Z",
  "cached": false
}
```

**Cache-Control**: `public, s-maxage=300, stale-while-revalidate=600`

#### POST /api/pricing
Create new pricing tier (Admin only)

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "name": "Custom Plan",
  "description": "Custom description",
  "priceMonthly": 199,
  "priceYearly": 1990,
  "features": ["Feature 1", "Feature 2"],
  "limits": {
    "eventsPerMonth": 100,
    "ticketsPerEvent": 10000,
    "storageGB": 500
  },
  "badge": "Enterprise"
}
```

### 2. Statistics API

#### GET /api/statistics
Fetch platform-wide statistics with blockchain data

**Response**:
```json
{
  "success": true,
  "data": {
    "totalEvents": 1234,
    "totalTicketsSold": 45678,
    "totalRevenue": "123.4567",
    "totalRevenueUSD": 0,
    "activeEvents": 89,
    "activeUsers": 567,
    "platformFees": "3.0864",
    "blockNumber": "12345678",
    "networkStatus": "healthy",
    "rpcProvider": "Chainstack",
    "lastUpdated": "2025-10-26T12:00:00.000Z",
    "calculationDurationMs": 156,
    "cached": false
  }
}
```

**Headers**:
- `X-Cache-Status`: HIT or MISS
- `X-Cache-Age`: Age in seconds (if HIT)

#### POST /api/statistics/refresh
Force refresh statistics (Admin only)

### 3. FAQ API

#### GET /api/faq
Fetch FAQs with optional filtering

**Query Parameters**:
- `category` (optional): Filter by category
- `search` (optional): Full-text search

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "faq-1",
      "question": "What is Echain?",
      "answer": "Echain is a Web3-native...",
      "category": "General",
      "tags": ["platform", "web3"],
      "helpfulCount": 45,
      "notHelpfulCount": 2,
      "isActive": true
    }
  ],
  "meta": {
    "total": 5,
    "categories": ["General", "Events", "Wallet", "Pricing", "Tickets"],
    "filters": {
      "category": null,
      "search": null
    }
  }
}
```

#### POST /api/faq
Create new FAQ (Admin only)

---

## 🎨 Frontend Components

### 1. Pricing Page
**File**: `frontend/app/pricing/page.tsx`

**Features**:
- Server-side rendering
- ISR with 5-minute revalidation
- Responsive grid layout
- Platform fee transparency

### 2. PricingCards Component
**File**: `frontend/app/pricing/components/PricingCards.tsx`

**Features**:
- Client-side billing toggle (monthly/yearly)
- Badge highlighting (Popular, Best Value)
- Feature list with checkmarks
- Usage limits display
- Responsive 1-2-4 column grid
- Hover animations

**Props**:
```typescript
interface PricingCardsProps {
  tiers: PricingTier[];
}
```

---

## 🌐 Integration with Base Network

### RPC Provider Priority

1. **Chainstack** (Primary)
   - URL: `https://chainstack.com/`
   - Features: High-performance, reliable, DDoS protection
   - Setup: `CHAINSTACK_RPC_URL` environment variable

2. **Spectrum Nodes** (Secondary)
   - URL: `https://spectrumnodes.com/`
   - Features: Load balancing, automatic failover
   - Setup: `SPECTRUM_RPC_URL` environment variable

3. **Coinbase Base Node** (Tertiary)
   - URL: `https://www.coinbase.com/developer-platform/products/base-node`
   - Features: Direct from Coinbase, optimized for Base
   - Setup: `COINBASE_BASE_NODE_URL` environment variable

4. **Base Public RPC** (Fallback)
   - URL: `https://mainnet.base.org`
   - Free tier, rate-limited

### Configuration

```typescript
// frontend/app/api/statistics/route.ts
function getBaseRpcUrl(): string {
  if (process.env.CHAINSTACK_RPC_URL) {
    return process.env.CHAINSTACK_RPC_URL;
  }
  if (process.env.SPECTRUM_RPC_URL) {
    return process.env.SPECTRUM_RPC_URL;
  }
  if (process.env.COINBASE_BASE_NODE_URL) {
    return process.env.COINBASE_BASE_NODE_URL;
  }
  return process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
}
```

### Retry Logic

```typescript
const client = createPublicClient({
  chain: base,
  transport: http(getBaseRpcUrl(), {
    timeout: 10_000,        // 10 second timeout
    retryCount: 3,          // Retry 3 times
    retryDelay: 1000,       // 1 second between retries
  }),
});
```

---

## 🧪 Testing Guide

### Manual Testing

#### 1. Test Pricing API
```bash
curl http://localhost:3000/api/pricing
```

Expected: 4 pricing tiers

#### 2. Test Statistics API
```bash
curl http://localhost:3000/api/statistics
```

Expected: Platform metrics with blockchain data

#### 3. Test FAQ API
```bash
# Get all FAQs
curl http://localhost:3000/api/faq

# Filter by category
curl "http://localhost:3000/api/faq?category=General"

# Search
curl "http://localhost:3000/api/faq?search=wallet"
```

#### 4. Test Pricing Page
Visit: `http://localhost:3000/pricing`

Expected: 
- 4 pricing cards displayed
- Monthly/Yearly toggle works
- All features and limits shown
- Responsive on mobile

### Automated Testing

**TODO**: Create test files:
- `frontend/__tests__/api/pricing.test.ts`
- `frontend/__tests__/api/statistics.test.ts`
- `frontend/__tests__/api/faq.test.ts`
- `frontend/__tests__/pricing-page.test.tsx`

---

## 🚀 Deployment

### Environment Variables

```bash
# .env.local
DATABASE_PATH=/path/to/data/echain.db
NEXT_PUBLIC_APP_URL=https://echain.app

# RPC Providers (in order of priority)
CHAINSTACK_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
SPECTRUM_RPC_URL=https://base.spectrumnodes.com/YOUR_KEY
COINBASE_BASE_NODE_URL=https://api.developer.coinbase.com/rpc/v1/base/YOUR_KEY
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

### Database Setup

```bash
# Database will auto-initialize on first run
# Location: data/echain.db (created automatically)

# To manually initialize:
node -e "require('./frontend/lib/database.ts').getDatabase()"
```

### Production Deployment

1. **Build**:
```bash
cd frontend
npm run build
```

2. **Ensure database directory is writable**:
```bash
mkdir -p data
chmod 755 data
```

3. **Start**:
```bash
npm start
```

### Vercel Deployment

⚠️ **Important**: Vercel has read-only filesystem.

**Option 1**: Use Vercel Postgres
**Option 2**: Use external SQLite service (Turso, LiteFS)
**Option 3**: Deploy to VPS/container (Recommended for beta)

---

## 📊 Monitoring & Maintenance

### Performance Metrics

Monitor these metrics:
- API response times (target: <200ms p95)
- Cache hit rate (target: >80%)
- Database query duration
- RPC call success rate

### Logs to Watch

```typescript
// Logged automatically:
- ✅ Seeded pricing tiers
- ✅ Seeded FAQs
- ⚠️ RPC fallback to backup provider
- ❌ Failed to fetch statistics
```

### Maintenance Tasks

**Daily**:
- Check error logs
- Monitor cache performance

**Weekly**:
- Review pricing tiers
- Update FAQs based on support tickets
- Check database size

**Monthly**:
- Vacuum database: `VACUUM;`
- Update statistics schema if needed
- Review and optimize slow queries

---

## 📚 Related Resources

### Documentation
- [Static vs Dynamic Data Report](../analysis/STATIC_VS_DYNAMIC_DATA_REPORT.md)
- [API Documentation](../api/README.md)
- [Beta Release Checklist](../BETA_RELEASE_CHECKLIST.md)

### External Resources
- [Base Documentation](https://docs.base.org/base-chain/quickstart/connecting-to-base)
- [Chainstack Base RPC](https://chainstack.com/)
- [Spectrum Nodes](https://spectrumnodes.com/)
- [Coinbase Developer Platform](https://www.coinbase.com/developer-platform/products/base-node)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3/wiki)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)

---

## ✅ Implementation Checklist

### Completed
- [x] Database schema design
- [x] Database initialization with seeding
- [x] Pricing API (GET, POST)
- [x] Statistics API with blockchain integration
- [x] FAQ API with full-text search
- [x] Pricing page with dynamic data
- [x] PricingCards component with toggle
- [x] RPC provider fallback system
- [x] Response caching
- [x] TypeScript types
- [x] Documentation

### To Do
- [ ] Admin authentication for POST endpoints
- [ ] Rate limiting middleware
- [ ] Automated tests
- [ ] FAQ voting endpoints
- [ ] Blog/content pages
- [ ] Admin dashboard for content management
- [ ] Monitoring dashboard
- [ ] Production database migration

---

**Status**: 🟢 Ready for testing and beta deployment

**Next Steps**:
1. Test all endpoints locally
2. Set up RPC provider accounts (Chainstack recommended)
3. Deploy to staging environment
4. Run load tests
5. Deploy to production

