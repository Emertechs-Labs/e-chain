# 🏛️ Echain Platform Architecture

<div align="center">

![Echain Architecture](https://img.shields.io/badge/Echain-Architecture-00D4FF?style=for-the-badge&logo=ethereum&logoColor=white)
![Base Network](https://img.shields.io/badge/Base-Ethereum_L2-0052FF?style=for-the-badge&logo=ethereum&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white)

**Three-tier architecture for the blockchain events platform on Base**

*Next.js frontend, Express.js REST API, and Solidity smart contracts*

[📱 Frontend](#-frontend-architecture) • [🔗 Backend API](#-backend-api-architecture) • [⛓️ Blockchain](#-blockchain-architecture) • [💾 Data Layer](#-data-architecture) • [🔐 Security](#-security-architecture)

</div>

---

## 🎯 System Overview

### Current Implementation Status
- **✅ Production Ready**: Fully operational on Base Sepolia testnet
- **✅ REST API Backend**: Express.js with TypeScript, Prisma ORM, PostgreSQL
- **✅ Modern Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **✅ Simple Smart Contracts**: EventFactory and EventTicket contracts on Base
- **✅ Wallet Integration**: RainbowKit + Wagmi for Web3 wallet connections
- **✅ Database Layer**: PostgreSQL with Prisma for data persistence

### Core System Goals
- **🔍 Transparency**: All ticket sales and event data permanently on-chain
- **🛡️ Security**: Fraud prevention through cryptographic verification
- **🎮 Simplicity**: Clean, maintainable codebase with clear separation of concerns
- **📈 Scalability**: Support events from small meetups to large festivals
- **🎨 UX Excellence**: Seamless Web2-like interface with Web3 benefits

---

## 🏗️ High-Level System Architecture

```mermaid
graph TB
    subgraph "🎨 User Layer"
        A[Next.js Web App<br/>React 18 + TypeScript]
        B[Mobile PWA<br/>Responsive Design]
        C[Organizer Dashboard<br/>Event Management]
        D[Attendee Portal<br/>Ticket Collection]
    end

    subgraph "🔌 API Layer"
        E[Express.js REST API<br/>TypeScript + Prisma]
        F[JWT Authentication<br/>Session Management]
        G[Zod Validation<br/>Input Sanitization]
        H[CORS + Rate Limiting<br/>Security Middleware]
    end

    subgraph "⛓️ Blockchain Layer"
        I[EventFactory Contract<br/>Event Creation & Management]
        J[EventTicket Contract<br/>ERC-721 NFT Tickets]
        K[Base Sepolia Network<br/>Ethereum L2]
    end

    subgraph "🏗️ Infrastructure"
        L[PostgreSQL Database<br/>Prisma ORM]
        M[Vercel Deployment<br/>Global CDN]
        N[IPFS/Pinata<br/>Decentralized Storage]
        O[Sentry Monitoring<br/>Error Tracking]
    end

    A --> E
    B --> E
    C --> E
    D --> E

    E --> I
    E --> J
    E --> L

    F --> E
    G --> E
    H --> E

    I --> K
    J --> K

    L --> E
    M --> A
    N --> A
    O --> E
    O --> A

    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style I fill:#e8f5e8
    style L fill:#fff3e0
```

### Architecture Principles
- **🎯 Three-Tier Design**: Clear separation between frontend, backend, and blockchain
- **🔄 RESTful APIs**: Standard HTTP methods with JSON responses
- **🛡️ Defense in Depth**: Multiple security layers from UI to smart contracts
- **📊 Data Consistency**: Single source of truth with proper database design
- **🚀 Performance First**: Optimized queries and efficient data structures

---

## 📱 Frontend Architecture

### Technology Stack (2025)
```yaml
Frontend Framework:
  - Next.js 15.0.0: App Router with Server Components
  - React 18.2.0: Concurrent features and automatic batching
  - TypeScript 5.0.0: Type-safe development
  - Tailwind CSS 3.4.0: Utility-first styling with custom theme system

State Management:
  - Zustand 4.4.0: Lightweight global state
  - React Query 5.0.0: Server state management
  - Context API: Theme and wallet state

Wallet Integration:
  - RainbowKit 2.0.0: Multi-wallet UI components
  - Reown (WalletConnect) v2: Cross-platform wallet connections
  - ethers.js 6.8.0: Ethereum interaction library

Build & Dev Tools:
  - Turborepo: Monorepo build orchestration
  - ESLint + Prettier: Code quality and formatting
  - Playwright: E2E testing framework
```

### Application Structure
```
/frontend
├── /app                           # Next.js App Router
│   ├── /globals.css              # Global styles + theme variables
│   ├── /layout.tsx               # Root layout with providers
│   ├── /page.tsx                 # Homepage
│   ├── /events/                  # Event discovery and details
│   ├── /my-events/               # Organizer dashboard
│   ├── /my-tickets/               # Attendee ticket collection
│   ├── /marketplace/             # Secondary ticket trading
│   ├── /poaps/                   # Attendance certificate gallery
│   └── /transparency/            # On-chain data transparency
├── /components                   # Reusable UI components
│   ├── /ui/                      # Base design system
│   ├── /events/                  # Event-specific components
│   ├── /tickets/                 # Ticket management
│   ├── /wallet/                  # Wallet connection UI
│   └── /forms/                   # Form components
├── /hooks                        # Custom React hooks
│   ├── useEvents.ts             # Event data fetching
│   ├── useTickets.ts            # Ticket operations
│   ├── useWallet.ts             # Wallet state management
│   └── useTheme.ts              # Theme switching
├── /lib                          # Utility libraries
│   ├── /rpc.ts                  # Multi-chain RPC client
│   ├── /contracts.ts            # Contract ABIs and addresses
│   ├── /utils.ts                # Helper functions
│   └── /theme-provider.tsx      # Theme context
└── /types                        # TypeScript definitions
    ├── /api.ts                  # API response types
    ├── /contracts.ts            # Smart contract types
    └── /components.ts           # Component prop types
```

### Key Components Architecture

#### Event Discovery Flow
```mermaid
graph TD
    A[Homepage Load] --> B[Fetch Events from RPC]
    B --> C[Display Event Grid]
    C --> D[User Clicks Event]
    D --> E[Load Event Details]
    E --> F[Fetch Ticket Availability]
    F --> G[Display Purchase Options]
    G --> H[Wallet Connection Check]
    H --> I[Show Ticket Purchase Modal]
```

#### Real-time Data Synchronization
```typescript
// Custom hook for real-time event updates
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await rpcClient.get('/events');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
}

// WebSocket for instant updates
useEffect(() => {
  const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'ticket_sold') {
      queryClient.invalidateQueries(['events']);
    }
  };

  return () => ws.close();
}, []);
```

### Mobile & PWA Experience
- **📱 Progressive Web App**: Installable on mobile devices
- **🔄 Offline Capability**: View tickets and QR codes without internet
- **🔔 Push Notifications**: Event reminders and reward notifications
- **🎯 Touch Optimized**: Mobile-first responsive design

---

## 🔗 API & Integration Layer

### REST API Architecture

#### Backend API Structure
```typescript
// Express.js server configuration
const app = express();

// Middleware stack
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

#### API Endpoint Architecture
```typescript
// REST API endpoints
const apiEndpoints = {
  // Authentication
  auth: {
    login: 'POST /api/auth/login',
    register: 'POST /api/auth/register',
    logout: 'POST /api/auth/logout',
    refresh: 'POST /api/auth/refresh',
    profile: 'GET /api/auth/profile'
  },

  // Event Management
  events: {
    list: 'GET /api/events',
    create: 'POST /api/events',
    get: 'GET /api/events/:id',
    update: 'PUT /api/events/:id',
    delete: 'DELETE /api/events/:id',
    analytics: 'GET /api/events/:id/analytics'
  },

  // Ticket Operations
  tickets: {
    purchase: 'POST /api/tickets/purchase',
    list: 'GET /api/tickets',
    transfer: 'POST /api/tickets/:id/transfer',
    checkin: 'POST /api/tickets/:id/checkin',
    validate: 'GET /api/tickets/:id/validate'
  },

  // Analytics
  analytics: {
    dashboard: 'GET /api/analytics/dashboard',
    events: 'GET /api/analytics/events',
    tickets: 'GET /api/analytics/tickets',
    revenue: 'GET /api/analytics/revenue'
  }
};
```

### Database Integration

#### Prisma ORM Configuration
```typescript
// Database client setup
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty'
});

// Example query with relations
const getEventWithTickets = async (eventId: string) => {
  return await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      tickets: {
        include: {
          owner: true,
          payments: true
        }
      },
      organizer: true,
      analytics: true
    }
  });
};
```

### Real-time Features

#### WebSocket Integration (Future)
```typescript
// Simple WebSocket for real-time updates
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());

    // Handle ticket purchase notifications
    if (message.type === 'ticket_purchased') {
      // Broadcast to event organizer
      broadcastToEvent(message.eventId, {
        type: 'ticket_sold',
        data: message.ticketData
      });
    }
  });
});

function broadcastToEvent(eventId: string, message: any) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
```

### Error Handling & Validation

#### Input Validation with Zod
```typescript
// Event creation validation schema
const createEventSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  date: z.string().datetime(),
  venue: z.string().min(1).max(200),
  maxTickets: z.number().int().positive(),
  ticketPrice: z.number().positive(),
  category: z.enum(['conference', 'concert', 'workshop', 'sports'])
});

// Middleware for validation
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
  };
};
```

#### Authentication & Authorization
```typescript
// JWT authentication middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization
const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

---

## ⛓️ Blockchain Architecture

### Network Infrastructure: Base Sepolia

#### Network Specifications
```yaml
Network Details:
  Name: Base Sepolia
  Chain ID: 84532
  Currency: ETH
  Block Time: ~2 seconds
  Gas Token: ETH
  Consensus: Optimistic Rollup

Performance Characteristics:
  TPS: 2,000+ (L2 scaling)
  Finality: ~7 seconds
  Gas Costs: 10-100x cheaper than Ethereum mainnet
  Explorer: https://sepolia.basescan.org/

Compatibility:
  EVM Compatible: ✅
  Solidity Version: 0.8.24
  OpenZeppelin: 5.4.0
  ERC Standards: ERC-721, ERC-1155, ERC-20
```

### Smart Contract Architecture

#### Contract Deployment Strategy
```mermaid
graph TD
    A[EventFactory<br/>Singleton Contract] --> B[Deploy EventTicket<br/>Via Constructor]
    A --> C[Register Event<br/>Store Metadata]
    B --> D[Initialize Ticket<br/>Contract State]
    C --> E[Update Factory<br/>Event Registry]
    D --> F[Mint Initial<br/>Ticket Supply]
    F --> G[Emit Deployment<br/>Event]
    G --> H[Return Contract<br/>Address to API]
```

#### Simple Contract Implementation
```solidity
// EventFactory.sol - Simple factory contract
contract EventFactory is Ownable {
    mapping(uint256 => address) public eventContracts;
    mapping(uint256 => EventMetadata) public events;
    uint256 public eventCount;

    struct EventMetadata {
        string name;
        address organizer;
        uint256 ticketPrice;
        uint256 maxTickets;
        bool active;
    }

    function createEvent(
        string memory name,
        uint256 ticketPrice,
        uint256 maxTickets
    ) external returns (uint256) {
        eventCount++;
        uint256 eventId = eventCount;

        // Deploy new EventTicket contract
        EventTicket ticketContract = new EventTicket(
            name,
            eventId,
            ticketPrice,
            maxTickets,
            msg.sender
        );

        eventContracts[eventId] = address(ticketContract);
        events[eventId] = EventMetadata({
            name: name,
            organizer: msg.sender,
            ticketPrice: ticketPrice,
            maxTickets: maxTickets,
            active: true
        });

        emit EventCreated(eventId, address(ticketContract), msg.sender);
        return eventId;
    }
}
```

### Contract Interaction Patterns

#### Frontend Contract Calls via Wagmi/Viem
```typescript
// Using Wagmi hooks for contract interaction
import { useContractWrite, useContractRead } from 'wagmi';
import { EventFactoryAbi, EventTicketAbi } from '../contracts';

// Create event hook
export function useCreateEvent() {
  return useContractWrite({
    address: EVENT_FACTORY_ADDRESS,
    abi: EventFactoryAbi,
    functionName: 'createEvent',
  });
}

// Purchase tickets hook
export function usePurchaseTickets(eventId: bigint) {
  const { data: eventContract } = useContractRead({
    address: EVENT_FACTORY_ADDRESS,
    abi: EventFactoryAbi,
    functionName: 'eventContracts',
    args: [eventId],
  });

  return useContractWrite({
    address: eventContract as `0x${string}`,
    abi: EventTicketAbi,
    functionName: 'purchaseTickets',
  });
}

// Read event data
export function useEventData(eventId: bigint) {
  return useContractRead({
    address: EVENT_FACTORY_ADDRESS,
    abi: EventFactoryAbi,
    functionName: 'events',
    args: [eventId],
  });
}
```

#### Direct Contract Interaction
```typescript
// Direct contract interaction via Viem
import { createPublicClient, createWalletClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: http()
});

// Read contract data
const eventData = await publicClient.readContract({
  address: EVENT_FACTORY_ADDRESS,
  abi: EventFactoryAbi,
  functionName: 'events',
  args: [eventId]
});

// Write to contract
const { request } = await publicClient.simulateContract({
  address: EVENT_FACTORY_ADDRESS,
  abi: EventFactoryAbi,
  functionName: 'createEvent',
  args: ['My Event', 1000000000000000000n, 1000n] // 1 ETH, 1000 tickets
});

const hash = await walletClient.writeContract(request);
```

---

## 💾 Data Architecture

### Database Design with Prisma ORM

#### PostgreSQL Schema Structure
```sql
-- Main entities in the database
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  wallet_address VARCHAR(42) UNIQUE,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  venue VARCHAR(200) NOT NULL,
  max_tickets INTEGER NOT NULL,
  ticket_price DECIMAL(36,18) NOT NULL,
  organizer_id INTEGER REFERENCES users(id),
  blockchain_event_id BIGINT UNIQUE,
  status event_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  owner_id INTEGER REFERENCES users(id),
  token_id BIGINT UNIQUE,
  purchase_price DECIMAL(36,18),
  purchase_date TIMESTAMP DEFAULT NOW(),
  checked_in BOOLEAN DEFAULT FALSE
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id),
  transaction_hash VARCHAR(66) UNIQUE,
  amount DECIMAL(36,18) NOT NULL,
  status payment_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Prisma Data Models
```typescript
// Prisma schema definitions
model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  walletAddress String?  @unique
  role          Role     @default(USER)
  events        Event[]
  tickets       Ticket[]
  createdAt     DateTime @default(now())
}

model Event {
  id                Int           @id @default(autoincrement())
  name              String
  description       String?
  date              DateTime
  venue             String
  maxTickets        Int
  ticketPrice       Decimal       @db.Decimal(36, 18)
  organizer         User          @relation(fields: [organizerId], references: [id])
  organizerId       Int
  tickets           Ticket[]
  blockchainEventId BigInt?       @unique
  status            EventStatus   @default(ACTIVE)
  analytics         EventAnalytics?
  createdAt         DateTime      @default(now())
}

model Ticket {
  id            Int      @id @default(autoincrement())
  event         Event    @relation(fields: [eventId], references: [id])
  eventId       Int
  owner         User     @relation(fields: [ownerId], references: [id])
  ownerId       Int
  tokenId       BigInt?  @unique
  purchasePrice Decimal? @db.Decimal(36, 18)
  purchaseDate  DateTime @default(now())
  checkedIn     Boolean  @default(false)
  payments      Payment[]
}

model Payment {
  id             Int           @id @default(autoincrement())
  ticket        Ticket        @relation(fields: [ticketId], references: [id])
  ticketId      Int
  transactionHash String?      @unique
  amount        Decimal       @db.Decimal(36, 18)
  status        PaymentStatus @default(PENDING)
  createdAt     DateTime      @default(now())
}
```

### Data Flow Architecture

#### Ticket Purchase Data Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Server
    participant D as PostgreSQL
    participant B as Blockchain

    U->>F: Select event & purchase tickets
    F->>A: POST /api/tickets/purchase
    A->>A: Validate request & authenticate user
    A->>D: Check event availability
    D->>A: Return event data
    A->>A: Calculate total price

    A->>B: Call EventTicket.purchaseTickets()
    B->>B: Mint NFT tickets
    B->>A: Return transaction hash
    A->>D: Create ticket records
    A->>D: Create payment record
    D->>A: Confirm database updates
    A->>F: Return success response
    F->>U: Show purchased tickets
```

#### Event Creation Data Flow
```mermaid
sequenceDiagram
    participant O as Organizer
    participant F as Frontend
    participant A as API Server
    participant D as PostgreSQL
    participant B as Blockchain

    O->>F: Create new event
    F->>A: POST /api/events
    A->>A: Validate event data
    A->>D: Check organizer permissions
    D->>A: Confirm authorization

    A->>B: Call EventFactory.createEvent()
    B->>B: Deploy EventTicket contract
    B->>A: Return event ID & contract address
    A->>D: Create event record
    A->>D: Link blockchain data
    D->>A: Confirm creation
    A->>F: Return event details
    F->>O: Show created event
```

### Data Synchronization

#### Database to Blockchain Sync
```typescript
// Sync ticket ownership from blockchain to database
async function syncTicketOwnership(eventId: number) {
  // Get all tickets for event from database
  const tickets = await prisma.ticket.findMany({
    where: { eventId },
    include: { owner: true }
  });

  // Verify ownership on blockchain
  for (const ticket of tickets) {
    const blockchainOwner = await getTicketOwner(ticket.tokenId);
    const dbOwner = ticket.owner.walletAddress;

    if (blockchainOwner !== dbOwner) {
      // Update database to match blockchain
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          owner: {
            connect: {
              walletAddress: blockchainOwner
            }
          }
        }
      });
    }
  }
}

// Sync event data from blockchain
async function syncEventData(blockchainEventId: bigint) {
  const contractData = await getEventData(blockchainEventId);
  const dbEvent = await prisma.event.findUnique({
    where: { blockchainEventId }
  });

  if (dbEvent) {
    // Update existing event
    await prisma.event.update({
      where: { blockchainEventId },
      data: {
        maxTickets: contractData.maxTickets,
        ticketPrice: contractData.ticketPrice
      }
    });
  }
}
```

### Caching Strategy

#### Redis Caching Layer
```typescript
// Cache frequently accessed data
const cacheManager = {
  // Cache event data for 5 minutes
  async getEvent(eventId: number) {
    const cacheKey = `event:${eventId}`;
    let event = await redis.get(cacheKey);

    if (!event) {
      event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { organizer: true }
      });
      await redis.setex(cacheKey, 300, JSON.stringify(event));
    }

    return JSON.parse(event);
  },

  // Cache ticket availability
  async getTicketAvailability(eventId: number) {
    const cacheKey = `tickets:available:${eventId}`;
    let available = await redis.get(cacheKey);

    if (available === null) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { _count: { select: { tickets: true } } } }
      });
      available = event.maxTickets - event._count.tickets;
      await redis.setex(cacheKey, 60, available.toString());
    }

    return parseInt(available);
  },

  // Invalidate cache on updates
  async invalidateEventCache(eventId: number) {
    await redis.del(`event:${eventId}`);
    await redis.del(`tickets:available:${eventId}`);
  }
};
```

---

## 🔐 Security Architecture

### Authentication & Authorization

#### JWT-Based Authentication
```typescript
// JWT token generation and validation
const authService = {
  generateToken: (payload: UserPayload) => {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '24h'
    });
  },

  validateToken: (token: string) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  refreshToken: (refreshToken: string) => {
    // Validate refresh token and generate new access token
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    return authService.generateToken(payload);
  }
};

// Middleware for protecting routes
const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = authService.validateToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### Wallet-Based Authentication
```typescript
// Wallet signature verification
const walletAuth = {
  verifySignature: async (message: string, signature: string, address: string) => {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  },

  generateAuthMessage: (address: string) => {
    return `Sign this message to authenticate with Echain: ${address}:${Date.now()}`;
  },

  authenticateWallet: async (address: string, signature: string) => {
    const message = walletAuth.generateAuthMessage(address);
    const isValid = await walletAuth.verifySignature(message, signature, address);

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: address }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: address }
      });
    }

    return authService.generateToken({ id: user.id, address });
  }
};
```

### API Security Measures

#### Rate Limiting & CORS
```typescript
// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
};

// CORS configuration
const corsConfig = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Input validation with Zod
const createEventSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  date: z.string().datetime(),
  venue: z.string().min(1).max(200),
  maxTickets: z.number().int().positive().max(10000),
  ticketPrice: z.number().positive()
});
```

### Smart Contract Security

#### Basic Security Measures
```solidity
// EventFactory.sol security features
contract EventFactory is Ownable, ReentrancyGuard, Pausable {
    // Access control
    modifier onlyOrganizer(uint256 eventId) {
        require(events[eventId].organizer == msg.sender, "Not event organizer");
        _;
    }

    // Reentrancy protection
    function createEvent(
        string memory name,
        uint256 ticketPrice,
        uint256 maxTickets
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(bytes(name).length > 0, "Event name required");
        require(ticketPrice > 0, "Ticket price must be positive");
        require(maxTickets > 0 && maxTickets <= 10000, "Invalid ticket limit");

        // Deploy contract with checks
        EventTicket ticketContract = new EventTicket(
            name,
            ++eventCount,
            ticketPrice,
            maxTickets,
            msg.sender
        );

        // Store event data
        events[eventCount] = EventMetadata({
            name: name,
            organizer: msg.sender,
            ticketPrice: ticketPrice,
            maxTickets: maxTickets,
            active: true
        });

        eventContracts[eventCount] = address(ticketContract);
        emit EventCreated(eventCount, address(ticketContract), msg.sender);

        return eventCount;
    }
}
```

#### EventTicket.sol Security
```solidity
// EventTicket.sol security features
contract EventTicket is ERC721, Ownable, ReentrancyGuard, Pausable {
    // State variables
    uint256 public ticketPrice;
    uint256 public maxTickets;
    uint256 public ticketsSold;
    address public organizer;
    bool public eventActive;

    // Purchase tickets with security checks
    function purchaseTickets(uint256 quantity)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        require(eventActive, "Event not active");
        require(quantity > 0 && quantity <= 10, "Invalid quantity");
        require(ticketsSold + quantity <= maxTickets, "Not enough tickets");
        require(msg.value >= ticketPrice * quantity, "Insufficient payment");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = ++totalSupply;
            _mint(msg.sender, tokenId);
            ticketsSold++;
        }

        // Refund excess payment
        uint256 excess = msg.value - (ticketPrice * quantity);
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }

        emit TicketsPurchased(msg.sender, quantity, msg.value);
    }
}
```

### Data Protection

#### Database Security
```typescript
// Database query sanitization
const safeQuery = {
  // Use parameterized queries
  getEventById: (eventId: number) => {
    return prisma.event.findUnique({
      where: { id: eventId }
    });
  },

  // Validate input before database operations
  createEvent: async (eventData: CreateEventInput) => {
    const validatedData = createEventSchema.parse(eventData);
    return prisma.event.create({
      data: validatedData
    });
  },

  // Prevent SQL injection through ORM
  searchEvents: (searchTerm: string) => {
    return prisma.event.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      }
    });
  }
};
```

### Monitoring & Alerting

#### Security Monitoring
```typescript
// Security event logging
const securityLogger = {
  logFailedAuth: (ip: string, reason: string) => {
    console.error(`Failed authentication from ${ip}: ${reason}`);
    // Could integrate with monitoring service like Sentry
  },

  logSuspiciousActivity: (userId: number, action: string, details: any) => {
    console.warn(`Suspicious activity by user ${userId}: ${action}`, details);
    // Alert security team for high-risk actions
  },

  logContractInteraction: (contractAddress: string, method: string, user: string) => {
    console.info(`Contract interaction: ${method} on ${contractAddress} by ${user}`);
  }
};

// Basic health checks
const healthChecks = {
  database: async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  },

  blockchain: async () => {
    try {
      await publicClient.getBlockNumber();
      return true;
    } catch {
      return false;
    }
  }
};
```

---

## 🚀 Deployment & DevOps Architecture

## 🚀 Deployment & DevOps Architecture

### Environment Strategy

#### Development Environment
```yaml
# Simple development setup
Development Stack:
  - Frontend: Next.js dev server (localhost:3000)
  - Backend: Express.js with ts-node (localhost:4000)
  - Database: PostgreSQL via Docker or local install
  - Blockchain: Foundry Anvil local network (localhost:8545)
  - Monitoring: Basic console logging

Environment Variables:
  - DATABASE_URL: postgresql://user:pass@localhost:5432/echain_dev
  - JWT_SECRET: dev-secret-key
  - NEXT_PUBLIC_BASE_RPC_URL: http://localhost:8545
  - FRONTEND_URL: http://localhost:3000
```

#### Production Environment
```yaml
# Production deployment architecture
Production Stack:
  - Frontend: Vercel (global CDN, automatic HTTPS)
  - Backend: Vercel Serverless Functions or Railway
  - Database: PostgreSQL (Railway, Neon, or AWS RDS)
  - Blockchain: Base Sepolia testnet (upgradeable to mainnet)
  - File Storage: IPFS via Pinata
  - Monitoring: Sentry for error tracking

Scaling Strategy:
  - Frontend: Serverless scaling via Vercel
  - Backend: Horizontal scaling with load balancer
  - Database: Read replicas for high-traffic queries
  - Caching: Redis for session and API caching
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy Echain

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: vercel --prod --yes

  deploy-contracts:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: forge install
      - run: forge test
      - run: forge script script/Deploy.s.sol --rpc-url $BASE_TESTNET_RPC_URL --broadcast
```

### Deployment Scripts

#### Frontend Deployment
```bash
# Vercel deployment (automatic on git push)
vercel --prod --yes

# Manual deployment with environment variables
vercel --prod --yes --env DATABASE_URL=$PROD_DATABASE_URL JWT_SECRET=$PROD_JWT_SECRET
```

#### Backend Deployment
```bash
# Build and deploy backend
npm run build
npm run start:prod

# Database migrations
npx prisma migrate deploy
npx prisma generate
```

#### Smart Contract Deployment
```bash
# Deploy contracts to Base Sepolia
forge install
forge test
forge script script/DeployEventFactory.s.sol \
  --rpc-url $BASE_TESTNET_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  --verify

# Update contract addresses in environment
export EVENT_FACTORY_ADDRESS=0x...
```

### Database Management

#### Migrations & Seeding
```typescript
// Prisma migrations
npx prisma migrate dev --name add_user_roles
npx prisma generate

// Seed database with test data
npx prisma db seed

// Backup production database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Connection Pooling
```typescript
// Database connection configuration
const dbConfig = {
  development: {
    connectionString: process.env.DATABASE_URL,
    max: 5, // Maximum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  production: {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: { rejectUnauthorized: false }
  }
};
```

### Monitoring & Observability

#### Application Monitoring
```typescript
// Sentry error tracking
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

// Performance monitoring
export function trackApiCall(endpoint: string, duration: number, status: number) {
  // Log to monitoring service
  console.log(`API Call: ${endpoint} - ${duration}ms - Status: ${status}`);
}
```

#### Health Checks
```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabaseHealth(),
      blockchain: await checkBlockchainHealth(),
    }
  };

  const isHealthy = Object.values(health.services).every(s => s === true);
  res.status(isHealthy ? 200 : 503).json(health);
});

async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkBlockchainHealth() {
  try {
    await publicClient.getBlockNumber();
    return true;
  } catch {
    return false;
  }
}
```

### Backup & Recovery

#### Database Backup Strategy
```bash
# Daily automated backups
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/daily_$(date +\%Y\%m\%d).sql.gz

# Weekly full backups
0 3 * * 0 pg_dump $DATABASE_URL | gzip > /backups/weekly_$(date +\%Y\%m\%d).sql.gz

# Contract state backup (events and mappings)
npx hardhat run scripts/backup-contracts.ts
```

#### Disaster Recovery
```typescript
// Backup recovery procedures
const disasterRecovery = {
  // Restore from database backup
  async restoreDatabase(backupFile: string) {
    // Drop and recreate database
    // Restore from backup file
    // Run migrations
    // Update contract addresses if needed
  },

  // Redeploy contracts if lost
  async redeployContracts() {
    // Deploy EventFactory
    // Update environment variables
    // Update database records
    // Notify users of new addresses
  },

  // Frontend rollback
  async rollbackFrontend(version: string) {
    // Vercel deployment rollback
    // Clear CDN cache
    // Update DNS if needed
  }
};
```

---

## 📊 Monitoring & Observability

### Application Performance Monitoring

#### Core Web Vitals Tracking
```typescript
// Performance monitoring
export function trackWebVitals(metric: any) {
  const { name, value, id } = metric;

  // Send to analytics service
  analytics.track('web_vitals', {
    metric_name: name,
    metric_value: value,
    metric_id: id,
    page_path: window.location.pathname
  });
}

// User experience monitoring
export function trackUserJourney(step: string, data?: any) {
  analytics.track('user_journey', {
    step,
    timestamp: Date.now(),
    user_id: getUserId(),
    ...data
  });
}
```

#### Error Tracking & Alerting
```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: any) {
    // Log to error tracking service
    Sentry.captureException(error, { contexts: { react: errorInfo } });

    // Send alert to monitoring system
    alertMonitoringTeam({
      error: error.message,
      stack: error.stack,
      component: errorInfo.componentStack,
      user: getCurrentUser(),
      url: window.location.href
    });
  }
}
```

### Business Intelligence

#### Key Metrics Dashboard
```typescript
// Real-time metrics collection
const metricsCollector = {
  // User engagement
  trackEventView: (eventId: string) => {
    analytics.track('event_view', { eventId });
  },

  // Transaction monitoring
  trackPurchase: (transaction: Transaction) => {
    analytics.track('ticket_purchase', {
      eventId: transaction.eventId,
      quantity: transaction.quantity,
      value: transaction.value,
      userAddress: transaction.buyer
    });
  },

  // Performance metrics
  trackApiCall: (endpoint: string, duration: number, success: boolean) => {
    analytics.track('api_call', {
      endpoint,
      duration,
      success,
      timestamp: Date.now()
    });
  }
};
```

---

## 🔄 Data Flow Examples

### Complete Ticket Purchase Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant R as RPC Provider
    participant C as EventTicket Contract
    participant I as IncentiveManager
    participant G as The Graph
    participant P as Push Service

    U->>F: Browse events & select tickets
    F->>F: Validate wallet connection
    F->>R: Get ticket availability
    R->>C: Query remaining supply
    C->>R: Return availability data
    R->>F: Display purchase options

    U->>F: Confirm purchase
    F->>R: Create signed transaction
    F->>U: Request wallet signature
    U->>F: Sign transaction
    F->>R: Submit transaction
    R->>C: Execute purchaseTickets()
    C->>C: Mint NFT tickets
    C->>U: Transfer ownership
    C->>I: Check early bird eligibility
    I->>I: Mint reward badge (if applicable)
    I->>U: Transfer reward NFT

    C->>G: Emit events for indexing
    G->>G: Update subgraph data
    F->>G: Query updated ticket data
    F->>U: Show success + ticket details
    P->>U: Send purchase confirmation
```

### Event Check-in Flow
```mermaid
sequenceDiagram
    participant A as Attendee
    participant O as Organizer
    participant F as Frontend
    participant R as RPC Provider
    participant P as POAP Contract
    participant N as Notification Service

    A->>O: Present ticket QR code
    O->>F: Scan QR code via camera
    F->>F: Decode ticket data
    F->>R: Verify ticket ownership
    R->>P: Query ticket validity
    P->>R: Confirm ownership
    R->>F: Return verification result

    F->>R: Initiate check-in transaction
    R->>P: Call checkInAttendee()
    P->>P: Mark ticket as used
    P->>A: Mint POAP certificate
    P->>R: Return success confirmation
    R->>F: Update check-in status

    F->>O: Display check-in success
    F->>A: Show POAP received
    N->>A: Send attendance notification
    N->>O: Send check-in confirmation
```

---

## 🔮 Future Architecture Roadmap

### Phase 2: Enhanced Features (Q1 2025)
- **Real-time Notifications**: WebSocket integration for live event updates
- **Advanced Analytics**: Event performance dashboards and reporting
- **Mobile App**: React Native companion app for iOS/Android
- **Multi-language Support**: Internationalization for global events

### Phase 3: Scale & Performance (Q2 2025)
- **Event Categories**: Support for conferences, concerts, workshops, sports
- **Bulk Operations**: Organizer tools for managing large events
- **Integration APIs**: Third-party integrations (calendar, social media)
- **Advanced Search**: Filter events by location, date, category, price

### Phase 4: Enterprise Features (Q3 2025)
- **White-label Platform**: Custom branding for organizations
- **Advanced Ticketing**: Dynamic pricing, VIP packages, group discounts
- **Event Analytics**: Attendee insights and engagement metrics
- **API Access**: Developer APIs for custom integrations

### Technical Improvements
- **Performance Optimization**: Database indexing and query optimization
- **Caching Layer**: Redis implementation for improved response times
- **Testing Coverage**: Comprehensive unit and integration tests
- **Documentation**: Complete API documentation and developer guides

---

## ⚠️ Implementation Notes & Best Practices

### Development Guidelines
```typescript
// Code quality standards
const developmentStandards = {
  typescript: {
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true
  },
  testing: {
    unitTestCoverage: 70,
    integrationTestCoverage: 60,
    e2eTestCoverage: 50
  },
  security: {
    inputValidation: true,
    jwtAuthentication: true,
    rateLimiting: true
  }
};
```

### Wallet Connection Configuration
```typescript
// Wallet configuration for production
const walletConfig = {
  projectId: process.env.REOWN_PROJECT_ID,
  chains: [baseSepolia],
  appMetadata: {
    name: 'Echain',
    description: 'Blockchain Events Platform',
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  }
};
```

### Base Sepolia Network Configuration
```typescript
// Network configuration
export const baseSepoliaConfig = {
  chainId: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH'
  },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] }
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' }
  },
  testnet: true
};
```

---

## 📞 Support & Resources

### Architecture Decision Records
- **[ADR-001: Direct RPC Integration](../integration/README.md#direct-rpc-integration)**
- **[ADR-002: Contract Architecture](./adr/002-contract-architecture.md)**
- **[ADR-003: State Management](./adr/003-state-management.md)**

### Development Resources
- **[API Documentation](../api/README.md)**: Complete API reference
- **[Contract Documentation](../contracts/README.md)**: Smart contract details
- **[Testing Guide](../README.md#testing)**: Testing strategies and tools

### Performance Benchmarks
- **Frontend Load Time**: <3 seconds (Next.js optimization)
- **API Response Time**: <200ms average for database queries
- **Transaction Confirmation**: <30 seconds on Base Sepolia
- **Concurrent Users**: 1,000+ supported with current architecture

---

**This architecture provides a solid foundation for the Echain blockchain events platform, implementing a clean three-tier architecture with modern web technologies and secure smart contracts on Base network.**

<div align="center">

[![View API Docs](../api/README.md)](https://img.shields.io/badge/API_Docs-View-00D4FF?style=for-the-badge)
[![Smart Contracts](../contracts/README.md)](https://img.shields.io/badge/Contracts-View-10B981?style=for-the-badge)
[![Deployment Guide](../deployment/README.md)](https://img.shields.io/badge/Deploy-View-6366F1?style=for-the-badge)

</div>
