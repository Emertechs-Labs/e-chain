# 🖥️ Backend Architecture

<div align="center">

![Backend Architecture](https://img.shields.io/badge/Backend-Architecture-00D4FF?style=for-the-badge&logo=next.js&logoColor=white)
![Next.js API](https://img.shields.io/badge/Next.js-API_Routes-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Serverless](https://img.shields.io/badge/Serverless-Functions-FF6B35?style=for-the-badge&logo=aws&logoColor=white)

**Serverless backend architecture using Next.js API routes**

*Event-driven APIs, real-time WebSockets, and blockchain integration*

[🚀 API Routes](#-api-routes) • [🔗 WebSocket](#-websocket-integration) • [⛓️ Blockchain](#-blockchain-integration) • [💾 Data](#-data-management)

</div>

---

## 🎯 Overview

The Echain backend is built using **Next.js API routes** running on **Vercel serverless functions**. This architecture provides:

- **Serverless Scaling**: Automatic scaling based on demand
- **Edge Computing**: Global CDN with edge function deployment
- **Real-time Communication**: WebSocket support for live updates
- **Blockchain Integration**: Direct RPC calls to Base and Hedera networks
- **Event-Driven Processing**: Webhook handling for transaction events

---

## 🚀 API Routes Structure

### Directory Structure
```
backend/ (integrated in frontend/app/api/)
├── /auth/
│   ├── nonce/route.ts          # SIWE nonce generation
│   ├── verify/route.ts         # Wallet signature verification
│   └── farcaster/
│       ├── verify/route.ts     # Farcaster auth verification
│       └── link/route.ts       # Social account linking
├── /frames/
│   ├── event/[id]/route.ts     # Event discovery frames
│   ├── rsvp/[id]/route.ts      # RSVP interaction frames
│   └── purchase/[id]/route.ts  # Ticket purchase frames
├── /events/
│   ├── route.ts                # Event CRUD operations
│   ├── [id]/route.ts           # Individual event operations
│   └── search/route.ts         # Event search and filtering
├── /tickets/
│   ├── route.ts                # Ticket management
│   ├── [id]/transfer/route.ts  # Ticket transfers
│   └── [id]/checkin/route.ts   # Event check-in
├── /webhooks/
│   ├── coinbase/route.ts       # Coinbase webhook processing
│   └── farcaster/route.ts      # Farcaster event webhooks
└── /ws/
    └── events/route.ts         # WebSocket upgrade endpoint
```

### API Design Principles

#### RESTful Endpoints
```typescript
// Standard CRUD operations
GET  /api/events           # List events
POST /api/events           # Create event
GET  /api/events/[id]      # Get event details
PUT  /api/events/[id]      # Update event
DELETE /api/events/[id]    # Delete event
```

#### Response Format
```typescript
// Consistent API response structure
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

#### Error Handling
```typescript
// Standardized error responses
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
  }
}

// Usage in API routes
export async function GET() {
  try {
    const data = await fetchEvents();
    return Response.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }
    // Handle unexpected errors
    return Response.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
```

---

## 🔗 WebSocket Integration

### Real-time Event Streaming

#### WebSocket Server Setup
```typescript
// lib/websocket/server.ts
import { WebSocketServer } from 'ws';
import { parse } from 'url';

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients = new Map<string, WebSocket>();

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws, request) => {
      const { query } = parse(request.url!, true);
      const userId = query.userId as string;

      this.clients.set(userId, ws);

      ws.on('message', (data) => this.handleMessage(userId, data));
      ws.on('close', () => this.clients.delete(userId));
    });
  }

  private handleMessage(userId: string, data: Buffer) {
    const message = JSON.parse(data.toString());
    // Handle incoming messages
  }

  broadcast(event: string, data: any, userId?: string) {
    const message = JSON.stringify({ event, data, timestamp: Date.now() });

    if (userId) {
      const client = this.clients.get(userId);
      if (client) client.send(message);
    } else {
      this.clients.forEach(client => client.send(message));
    }
  }
}
```

#### WebSocket API Routes
```typescript
// app/api/ws/events/route.ts
import { WebSocketManager } from '@/lib/websocket/server';

export async function GET(request: Request) {
  const upgradeHeader = request.headers.get('upgrade');

  if (upgradeHeader !== 'websocket') {
    return new Response('Expected websocket', { status: 400 });
  }

  // Handle WebSocket upgrade
  const { socket, response } = await handleWebSocketUpgrade(request);

  // Initialize WebSocket connection
  const wsManager = new WebSocketManager();
  wsManager.addClient(socket);

  return response;
}
```

### Event Types

#### Real-time Events
```typescript
// types/websocket.ts
export type WebSocketEvent =
  | 'ticket_sold'
  | 'event_created'
  | 'checkin_complete'
  | 'price_update'
  | 'auction_bid'
  | 'recovery_initiated';

export interface WebSocketMessage {
  event: WebSocketEvent;
  data: any;
  timestamp: number;
  userId?: string;
}
```

#### Event Broadcasting
```typescript
// lib/events/broadcaster.ts
export class EventBroadcaster {
  constructor(private wsManager: WebSocketManager) {}

  async broadcastTicketSale(eventId: string, ticketData: TicketData) {
    await this.wsManager.broadcast('ticket_sold', {
      eventId,
      ticketId: ticketData.id,
      buyer: ticketData.owner,
      price: ticketData.price
    });
  }

  async notifyEventUpdate(eventId: string, updates: EventUpdates) {
    await this.wsManager.broadcast('event_updated', {
      eventId,
      updates,
      timestamp: Date.now()
    }, null); // Broadcast to all users
  }

  async sendUserNotification(userId: string, event: WebSocketEvent, data: any) {
    await this.wsManager.broadcast(event, data, userId);
  }
}
```

---

## ⛓️ Blockchain Integration

### Multi-Chain RPC Client

#### RPC Configuration
```typescript
// lib/rpc/config.ts
export const RPC_CONFIG = {
  base: {
    mainnet: {
      url: 'https://mainnet.base.org',
      chainId: 8453,
      contracts: {
        eventFactory: '0x...',
        marketplace: '0x...'
      }
    },
    testnet: {
      url: 'https://sepolia.base.org',
      chainId: 84532,
      contracts: {
        eventFactory: '0xA97cB40548905B05A67fCD4765438aFBEA4030fc',
        marketplace: '0xD061393A54784da5Fea48CC845163aBc2B11537A'
      }
    }
  },
  hedera: {
    testnet: {
      url: 'https://testnet.hashio.io/api',
      chainId: 296,
      contracts: {
        multisig: '0x...'
      }
    }
  }
};
```

#### Contract Interaction Layer
```typescript
// lib/contracts/client.ts
import { ethers } from 'ethers';
import { EventFactory__factory } from '@/types/contracts';

export class ContractClient {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(network: 'base' | 'hedera', testnet: boolean = true) {
    const config = RPC_CONFIG[network][testnet ? 'testnet' : 'mainnet'];
    this.provider = new ethers.JsonRpcProvider(config.url);
  }

  connectWallet(signer: ethers.Signer) {
    this.signer = signer;
  }

  async createEvent(eventData: EventData) {
    if (!this.signer) throw new Error('Wallet not connected');

    const contract = EventFactory__factory.connect(
      RPC_CONFIG.base.testnet.contracts.eventFactory,
      this.signer
    );

    const tx = await contract.createEvent(
      eventData.name,
      eventData.metadataURI,
      eventData.ticketPrice,
      eventData.maxTickets,
      eventData.startTime,
      eventData.endTime
    );

    return await tx.wait();
  }

  async getEvent(eventId: number) {
    const contract = EventFactory__factory.connect(
      RPC_CONFIG.base.testnet.contracts.eventFactory,
      this.provider
    );

    return await contract.events(eventId);
  }
}
```

### Transaction Monitoring

#### Event Listening
```typescript
// lib/blockchain/listener.ts
import { ContractClient } from './client';

export class BlockchainListener {
  constructor(private contractClient: ContractClient) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const contract = this.contractClient.getContract();

    // Listen for ticket purchases
    contract.on('TicketsPurchased', async (buyer, eventId, quantity, tokenIds) => {
      await this.handleTicketPurchase(buyer, eventId, quantity, tokenIds);
    });

    // Listen for event creation
    contract.on('EventCreated', async (eventId, organizer, ticketContract) => {
      await this.handleEventCreation(eventId, organizer, ticketContract);
    });
  }

  private async handleTicketPurchase(buyer: string, eventId: number, quantity: number, tokenIds: number[]) {
    // Update database
    await updateTicketSales(eventId, quantity);

    // Broadcast real-time update
    await broadcastTicketSale(eventId, { buyer, tokenIds });

    // Send notifications
    await notifyOrganizer(eventId, { type: 'ticket_sold', quantity });
  }
}
```

---

## 💾 Data Management

### Database Schema

#### User Data
```sql
-- User profiles and authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address VARCHAR(42) UNIQUE NOT NULL,
  farcaster_id BIGINT UNIQUE,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Social account linking
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  platform VARCHAR(50) NOT NULL, -- 'farcaster'
  platform_id VARCHAR(255) NOT NULL,
  linked_at TIMESTAMP DEFAULT NOW(),
  recovery_enabled BOOLEAN DEFAULT false
);
```

#### Event Data
```sql
-- Event information
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blockchain_id BIGINT UNIQUE NOT NULL,
  organizer_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  metadata_uri VARCHAR(500),
  ticket_price VARCHAR(78), -- Wei as string
  max_tickets INTEGER NOT NULL,
  sold_tickets INTEGER DEFAULT 0,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ticket ownership
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  token_id BIGINT NOT NULL,
  owner_id UUID REFERENCES users(id),
  purchase_price VARCHAR(78),
  purchase_time TIMESTAMP DEFAULT NOW(),
  checked_in BOOLEAN DEFAULT false,
  transferable BOOLEAN DEFAULT true
);
```

### Data Access Layer

#### Repository Pattern
```typescript
// lib/repositories/eventRepository.ts
export class EventRepository {
  async create(eventData: EventData): Promise<Event> {
    const query = `
      INSERT INTO events (blockchain_id, organizer_id, name, description, ticket_price, max_tickets, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      eventData.blockchainId,
      eventData.organizerId,
      eventData.name,
      eventData.description,
      eventData.ticketPrice,
      eventData.maxTickets,
      eventData.startTime,
      eventData.endTime
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<Event | null> {
    const query = 'SELECT * FROM events WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async updateSoldTickets(eventId: string, additionalSold: number): Promise<void> {
    const query = `
      UPDATE events
      SET sold_tickets = sold_tickets + $2, updated_at = NOW()
      WHERE id = $1
    `;
    await db.query(query, [eventId, additionalSold]);
  }
}
```

#### Caching Strategy
```typescript
// lib/cache/redis.ts
import { Redis } from 'ioredis';

export class CacheManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  async getEvent(eventId: string): Promise<Event | null> {
    const cached = await this.redis.get(`event:${eventId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  }

  async setEvent(eventId: string, event: Event, ttl: number = 300): Promise<void> {
    await this.redis.setex(`event:${eventId}`, ttl, JSON.stringify(event));
  }

  async invalidateEvent(eventId: string): Promise<void> {
    await this.redis.del(`event:${eventId}`);
    await this.redis.del(`event:${eventId}:tickets`);
  }

  async getTicketAvailability(eventId: string): Promise<number> {
    const cached = await this.redis.get(`event:${eventId}:availability`);
    return cached ? parseInt(cached) : -1;
  }

  async updateTicketAvailability(eventId: string, available: number): Promise<void> {
    await this.redis.setex(`event:${eventId}:availability`, 60, available.toString());
  }
}
```

---

## 🔄 Webhook Processing

### Coinbase Webhooks

#### Webhook Verification
```typescript
// app/api/webhooks/coinbase/route.ts
import { verifyCoinbaseWebhook } from '@/lib/webhooks/coinbase';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('X-CC-Webhook-Signature');

  // Verify webhook authenticity
  if (!verifyCoinbaseWebhook(body, signature!)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  // Process based on event type
  switch (event.type) {
    case 'transaction.confirmed':
      await handleTransactionConfirmed(event.data);
      break;
    case 'contract.event':
      await handleContractEvent(event.data);
      break;
  }

  return Response.json({ success: true });
}
```

#### Event Processing
```typescript
// lib/webhooks/handlers.ts
export async function handleContractEvent(eventData: any) {
  const { contractAddress, eventName, args } = eventData;

  switch (eventName) {
    case 'TicketsPurchased':
      await processTicketPurchase(args.buyer, args.eventId, args.quantity);
      break;
    case 'EventCreated':
      await processEventCreation(args.eventId, args.organizer);
      break;
    case 'CheckIn':
      await processCheckIn(args.attendee, args.eventId);
      break;
  }
}

async function processTicketPurchase(buyer: string, eventId: number, quantity: number) {
  // Update database
  await updateTicketSales(eventId, quantity);

  // Update cache
  await cacheManager.invalidateEvent(eventId.toString());

  // Broadcast real-time update
  await eventBroadcaster.broadcastTicketSale(eventId.toString(), {
    buyer,
    quantity,
    timestamp: Date.now()
  });

  // Send email notification
  await sendPurchaseConfirmation(buyer, eventId, quantity);
}
```

---

## 📊 Monitoring & Logging

### Application Monitoring

#### Performance Tracking
```typescript
// lib/monitoring/performance.ts
export class PerformanceMonitor {
  static async trackApiCall(endpoint: string, method: string, duration: number, statusCode: number) {
    await analytics.track('api_call', {
      endpoint,
      method,
      duration,
      status_code: statusCode,
      timestamp: Date.now()
    });
  }

  static async trackBlockchainCall(network: string, method: string, duration: number, success: boolean) {
    await analytics.track('blockchain_call', {
      network,
      method,
      duration,
      success,
      timestamp: Date.now()
    });
  }
}
```

#### Error Tracking
```typescript
// lib/monitoring/errors.ts
import * as Sentry from '@sentry/nextjs';

export class ErrorMonitor {
  static captureApiError(error: Error, context: any) {
    Sentry.captureException(error, {
      tags: {
        component: 'api',
        endpoint: context.endpoint
      },
      extra: context
    });
  }

  static captureBlockchainError(error: Error, context: any) {
    Sentry.captureException(error, {
      tags: {
        component: 'blockchain',
        network: context.network,
        contract: context.contract
      },
      extra: context
    });
  }
}
```

### Health Checks

#### System Health Endpoint
```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.all([
    checkDatabaseConnection(),
    checkRedisConnection(),
    checkBlockchainConnectivity(),
    checkWebSocketServer()
  ]);

  const allHealthy = checks.every(check => check.healthy);

  return Response.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks: checks.reduce((acc, check) => {
      acc[check.name] = check;
      return acc;
    }, {})
  }, { status: allHealthy ? 200 : 503 });
}
```

---

## 🚀 Deployment & Scaling

### Vercel Configuration

#### vercel.json
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1", "sfo1", "fra1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type,Authorization" }
      ]
    }
  ]
}
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Blockchain RPC
BASE_RPC_URL=https://sepolia.base.org
HEDERA_RPC_URL=https://testnet.hashio.io/api

# Webhooks
COINBASE_WEBHOOK_SECRET=...
FARCASTER_WEBHOOK_SECRET=...

# Monitoring
SENTRY_DSN=...
ANALYTICS_KEY=...
```

---

<div align="center">

**🖥️ Backend Architecture - Serverless & Scalable**

*Next.js API routes powering real-time blockchain applications*

*Last Updated: October 2025*

</div></content>
<parameter name="filePath">e:/Polymath Universata/Projects/Echain/docs/backend/README.md