# Sprint 3 Planning: Backend & Smart Contracts

## Overview
**Sprint Duration**: 2 weeks (Feb 3 - Feb 16, 2025)  
**Total Story Points**: 35  
**Theme**: Production-ready backend with smart contract integration and payment processing

---

## Sprint Goal
Build a production-ready backend API, deploy Event NFT contracts to Base mainnet, implement payment processing, and prepare for public beta launch.

---

## User Stories

### Story 1: Backend Event Management API (8 points)
**Priority**: High  
**Dependencies**: None

**Description**:
Build a RESTful API for event management with PostgreSQL database integration. Support full CRUD operations for events with organizer authentication and authorization.

**Acceptance Criteria**:
- ✅ PostgreSQL database with Prisma ORM
- ✅ Event schema with fields: id, name, description, startDate, endDate, location, price, maxCapacity, organizerId
- ✅ REST endpoints:
  - `GET /api/events` - List events with pagination, filtering, search
  - `POST /api/events` - Create event (authenticated organizers only)
  - `GET /api/events/:id` - Get event details with ticket availability
  - `PUT /api/events/:id` - Update event (organizer only)
  - `DELETE /api/events/:id` - Delete/cancel event (organizer only)
- ✅ JWT authentication with role-based access (organizer, attendee, admin)
- ✅ Input validation with Zod schemas
- ✅ Error handling with proper status codes
- ✅ API documentation with OpenAPI/Swagger
- ✅ Test suite with integration tests

**Technical Implementation**:
```typescript
// Prisma Schema
model Event {
  id          String   @id @default(cuid())
  name        String
  description String
  startDate   DateTime
  endDate     DateTime
  location    String
  price       Decimal
  maxCapacity Int
  organizerId String
  organizer   User     @relation(fields: [organizerId], references: [id])
  tickets     Ticket[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id        String   @id @default(cuid())
  address   String   @unique
  email     String?  @unique
  role      Role     @default(ATTENDEE)
  events    Event[]  @relation("Organizer")
  tickets   Ticket[]
  createdAt DateTime @default(now())
}

enum Role {
  ATTENDEE
  ORGANIZER
  ADMIN
}

model Ticket {
  id        String   @id @default(cuid())
  eventId   String
  event     Event    @relation(fields: [eventId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  tokenId   Int
  txHash    String
  status    TicketStatus @default(ACTIVE)
  createdAt DateTime @default(now())
}

enum TicketStatus {
  ACTIVE
  TRANSFERRED
  REFUNDED
}
```

**API Routes**:
```typescript
// backend/src/routes/events.ts
router.get('/events', listEvents);        // Public, paginated
router.post('/events', auth, createEvent); // Organizer only
router.get('/events/:id', getEvent);      // Public
router.put('/events/:id', auth, updateEvent); // Organizer only
router.delete('/events/:id', auth, deleteEvent); // Organizer only
```

**Files to Create**:
- `backend/package.json` - Dependencies (Express, Prisma, Zod, JWT)
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/server.ts` - Express server setup
- `backend/src/routes/events.ts` - Event CRUD endpoints
- `backend/src/middleware/auth.ts` - JWT authentication
- `backend/src/middleware/validation.ts` - Zod validation middleware
- `backend/src/services/eventService.ts` - Business logic
- `backend/tests/events.test.ts` - Integration tests
- `backend/.env.example` - Environment variables template
- `docs/api/EVENT_API.md` - API documentation

**Estimated Time**: 2-3 days

---

### Story 2: Smart Contract Integration (13 points)
**Priority**: Critical  
**Dependencies**: None (can run parallel with Story 1)

**Description**:
Deploy Event NFT contract to Base mainnet with ERC-721 ticket minting, transfer logic, and royalty support. Integrate contract with frontend for ticket purchases.

**Acceptance Criteria**:
- ✅ EventTicketNFT.sol contract with ERC-721 + ERC-2981 (royalties)
- ✅ Minting logic with event ID, token metadata URI
- ✅ Transfer restrictions (non-transferable until event ends, optional)
- ✅ Batch minting for multiple tickets
- ✅ Owner/organizer controls (pause, unpause, withdraw)
- ✅ Royalty configuration (5% to platform, 5% to organizer)
- ✅ Comprehensive test suite (Foundry)
- ✅ Gas optimization (<100k gas per mint)
- ✅ BaseScan verification on mainnet
- ✅ Frontend integration hooks

**Smart Contract**:
```solidity
// contracts/core/EventTicketNFT.sol
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract EventTicketNFT is ERC721, ERC2981, Ownable, Pausable {
    struct EventInfo {
        uint256 eventId;
        uint256 maxCapacity;
        uint256 ticketsSold;
        uint256 price;
        address organizer;
        bool active;
    }

    mapping(uint256 => EventInfo) public events;
    mapping(uint256 => string) private _tokenURIs;
    uint256 private _nextTokenId;

    event EventCreated(uint256 indexed eventId, address indexed organizer, uint256 maxCapacity, uint256 price);
    event TicketMinted(uint256 indexed eventId, uint256 indexed tokenId, address indexed buyer);
    event TicketBatchMinted(uint256 indexed eventId, uint256[] tokenIds, address indexed buyer);

    constructor() ERC721("Event Ticket", "ETIX") {
        _setDefaultRoyalty(owner(), 500); // 5% platform fee
    }

    function createEvent(
        uint256 eventId,
        uint256 maxCapacity,
        uint256 price,
        address organizer
    ) external onlyOwner {
        require(events[eventId].eventId == 0, "Event already exists");
        events[eventId] = EventInfo({
            eventId: eventId,
            maxCapacity: maxCapacity,
            ticketsSold: 0,
            price: price,
            organizer: organizer,
            active: true
        });
        emit EventCreated(eventId, organizer, maxCapacity, price);
    }

    function mintTicket(uint256 eventId, address to, string memory tokenURI) 
        external 
        payable 
        whenNotPaused 
        returns (uint256) 
    {
        EventInfo storage eventInfo = events[eventId];
        require(eventInfo.active, "Event not active");
        require(eventInfo.ticketsSold < eventInfo.maxCapacity, "Event sold out");
        require(msg.value >= eventInfo.price, "Insufficient payment");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        eventInfo.ticketsSold++;

        // Set per-token royalty (5% to organizer)
        _setTokenRoyalty(tokenId, eventInfo.organizer, 500);

        emit TicketMinted(eventId, tokenId, to);
        return tokenId;
    }

    function batchMintTickets(
        uint256 eventId,
        address to,
        uint256 quantity,
        string[] memory tokenURIs
    ) external payable whenNotPaused returns (uint256[] memory) {
        require(quantity > 0 && quantity <= 10, "Invalid quantity");
        require(tokenURIs.length == quantity, "URI count mismatch");

        EventInfo storage eventInfo = events[eventId];
        require(eventInfo.active, "Event not active");
        require(eventInfo.ticketsSold + quantity <= eventInfo.maxCapacity, "Exceeds capacity");
        require(msg.value >= eventInfo.price * quantity, "Insufficient payment");

        uint256[] memory tokenIds = new uint256[](quantity);
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            _setTokenRoyalty(tokenId, eventInfo.organizer, 500);
            tokenIds[i] = tokenId;
        }
        eventInfo.ticketsSold += quantity;

        emit TicketBatchMinted(eventId, tokenIds, to);
        return tokenIds;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Override required for ERC2981
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC2981) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}
```

**Frontend Integration**:
```typescript
// frontend/lib/contracts/event-nft.ts
import { useContractWrite, useContractRead } from 'wagmi';
import { parseEther } from 'viem';

export function useMintTicket() {
  return useContractWrite({
    address: EVENT_NFT_ADDRESS,
    abi: EventTicketNFT_ABI,
    functionName: 'mintTicket',
  });
}

export function useBatchMintTickets() {
  return useContractWrite({
    address: EVENT_NFT_ADDRESS,
    abi: EventTicketNFT_ABI,
    functionName: 'batchMintTickets',
  });
}

export function useEventInfo(eventId: string) {
  return useContractRead({
    address: EVENT_NFT_ADDRESS,
    abi: EventTicketNFT_ABI,
    functionName: 'events',
    args: [BigInt(eventId)],
  });
}
```

**Files to Create**:
- `blockchain/contracts/core/EventTicketNFT.sol` - Main contract
- `blockchain/test/EventTicketNFT.t.sol` - Comprehensive tests
- `blockchain/scripts/deploy-event-nft.ts` - Deployment script
- `blockchain/scripts/verify-event-nft.ts` - BaseScan verification
- `frontend/lib/contracts/event-nft.ts` - Contract hooks
- `frontend/lib/contracts/abis/EventTicketNFT.json` - Contract ABI
- `docs/contracts/EVENT_NFT.md` - Contract documentation

**Estimated Time**: 4-5 days

---

### Story 3: Payment Processing (8 points)
**Priority**: High  
**Dependencies**: Story 2 (Smart Contract Integration)

**Description**:
Implement ETH payment handling with transaction confirmation, escrow for ticket purchases, refund mechanism, and revenue tracking.

**Acceptance Criteria**:
- ✅ Payment flow: User pays → Funds held in escrow → Ticket minted → Funds released
- ✅ Transaction confirmation with block confirmations (3+ blocks)
- ✅ Refund mechanism for cancelled events
- ✅ Revenue tracking per event and organizer
- ✅ Withdrawal function for organizers
- ✅ Platform fee calculation (5% of ticket price)
- ✅ Gas estimation and error handling
- ✅ Payment status tracking (pending, confirmed, failed, refunded)

**Payment Processor Contract**:
```solidity
// contracts/core/PaymentProcessor.sol
pragma solidity ^0.8.20;

import "./EventTicketNFT.sol";

contract PaymentProcessor {
    EventTicketNFT public ticketNFT;
    uint256 public constant PLATFORM_FEE_BPS = 500; // 5%
    
    mapping(bytes32 => Payment) public payments;
    mapping(uint256 => uint256) public eventRevenue;
    mapping(address => uint256) public organizerBalance;

    struct Payment {
        uint256 eventId;
        address buyer;
        uint256 quantity;
        uint256 amount;
        PaymentStatus status;
        uint256 timestamp;
    }

    enum PaymentStatus {
        PENDING,
        CONFIRMED,
        FAILED,
        REFUNDED
    }

    event PaymentReceived(bytes32 indexed paymentId, uint256 indexed eventId, address indexed buyer, uint256 amount);
    event PaymentConfirmed(bytes32 indexed paymentId);
    event Refund(bytes32 indexed paymentId, address indexed buyer, uint256 amount);

    function purchaseTickets(uint256 eventId, uint256 quantity, string[] memory tokenURIs) 
        external 
        payable 
        returns (bytes32) 
    {
        bytes32 paymentId = keccak256(abi.encodePacked(msg.sender, eventId, block.timestamp));
        
        payments[paymentId] = Payment({
            eventId: eventId,
            buyer: msg.sender,
            quantity: quantity,
            amount: msg.value,
            status: PaymentStatus.PENDING,
            timestamp: block.timestamp
        });

        // Mint tickets via NFT contract
        uint256[] memory tokenIds = ticketNFT.batchMintTickets{value: msg.value}(
            eventId,
            msg.sender,
            quantity,
            tokenURIs
        );

        // Calculate fees
        uint256 platformFee = (msg.value * PLATFORM_FEE_BPS) / 10000;
        uint256 organizerAmount = msg.value - platformFee;

        // Track revenue
        eventRevenue[eventId] += msg.value;
        
        // Get organizer from NFT contract and credit their balance
        (,,,, address organizer,) = ticketNFT.events(eventId);
        organizerBalance[organizer] += organizerAmount;

        payments[paymentId].status = PaymentStatus.CONFIRMED;

        emit PaymentReceived(paymentId, eventId, msg.sender, msg.value);
        emit PaymentConfirmed(paymentId);

        return paymentId;
    }

    function refund(bytes32 paymentId) external {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.CONFIRMED, "Invalid payment");
        require(msg.sender == payment.buyer, "Not buyer");

        // Check if event is cancelled (would need to add this to NFT contract)
        payment.status = PaymentStatus.REFUNDED;
        
        payable(payment.buyer).transfer(payment.amount);
        emit Refund(paymentId, payment.buyer, payment.amount);
    }

    function withdrawEarnings() external {
        uint256 balance = organizerBalance[msg.sender];
        require(balance > 0, "No balance");
        
        organizerBalance[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
    }
}
```

**Frontend Payment Hook**:
```typescript
// frontend/hooks/usePayment.ts
export function useTicketPurchase() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'confirmed' | 'error'>('idle');
  const { write: purchaseTickets } = useContractWrite({
    address: PAYMENT_PROCESSOR_ADDRESS,
    abi: PaymentProcessor_ABI,
    functionName: 'purchaseTickets',
  });

  const purchase = async (eventId: string, quantity: number, price: bigint) => {
    setStatus('pending');
    try {
      const tx = await purchaseTickets({
        args: [BigInt(eventId), quantity, generateTokenURIs(quantity)],
        value: price * BigInt(quantity),
      });

      // Wait for confirmations
      await waitForTransaction({ hash: tx.hash, confirmations: 3 });
      
      setStatus('confirmed');
      return tx.hash;
    } catch (error) {
      setStatus('error');
      throw error;
    }
  };

  return { purchase, status };
}
```

**Files to Create**:
- `blockchain/contracts/core/PaymentProcessor.sol` - Payment contract
- `blockchain/test/PaymentProcessor.t.sol` - Payment tests
- `frontend/hooks/usePayment.ts` - Payment hooks
- `backend/src/services/payment.ts` - Payment tracking service
- `docs/contracts/PAYMENT_PROCESSOR.md` - Payment documentation

**Estimated Time**: 3 days

---

### Story 4: Production Deployment (6 points)
**Priority**: Critical  
**Dependencies**: Stories 1, 2, 3

**Description**:
Deploy all components to production environment on Base mainnet with proper monitoring, error tracking, and documentation.

**Acceptance Criteria**:
- ✅ Base mainnet contract deployment with verified contracts
- ✅ Production environment variables configured
- ✅ PostgreSQL database provisioned and migrated
- ✅ Frontend deployed to Vercel with production domain
- ✅ Backend API deployed (Railway/Render/AWS)
- ✅ Monitoring setup (Sentry for errors, Datadog/Grafana for metrics)
- ✅ CI/CD pipeline updated for mainnet deployment
- ✅ Deployment runbook documentation
- ✅ Rollback procedures documented
- ✅ Health check endpoints

**Infrastructure**:
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm run test:frontend
          npm run test:backend
          forge test

  deploy-contracts:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Base Mainnet
        run: forge script scripts/deploy-event-nft.ts --rpc-url $BASE_RPC --broadcast --verify

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy API to Railway
        run: railway up

  deploy-frontend:
    needs: [deploy-contracts, deploy-backend]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod
```

**Environment Configuration**:
```bash
# .env.production
# Database
DATABASE_URL=postgresql://user:pass@production-db:5432/echain

# Base Mainnet
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
EVENT_NFT_ADDRESS=0x...
PAYMENT_PROCESSOR_ADDRESS=0x...

# API
NEXT_PUBLIC_API_URL=https://api.echain.app
JWT_SECRET=...

# Monitoring
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...

# Node Providers
CHAINSTACK_API_KEY=...
SPECTRUM_API_KEY=...
COINBASE_RPC_URL=...
```

**Monitoring Setup**:
```typescript
// Sentry error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    database: await prisma.$queryRaw`SELECT 1`,
  });
});
```

**Files to Create**:
- `.env.production` - Production environment variables
- `.github/workflows/deploy-production.yml` - Production deployment workflow
- `docs/deployment/DEPLOYMENT_GUIDE.md` - Step-by-step deployment guide
- `docs/deployment/ROLLBACK_PROCEDURES.md` - Emergency rollback procedures
- `backend/src/health.ts` - Health check endpoints
- `scripts/production-setup.sh` - Production setup automation

**Estimated Time**: 2 days

---

## Sprint Metrics

### Velocity Planning
- **Sprint 1**: 32 points (completed)
- **Sprint 2**: 38 points (completed)
- **Sprint 3**: 35 points (planned)
- **Average Velocity**: 35 points/sprint

### Risk Assessment

**High Risk**:
- Smart contract deployment to mainnet (irreversible)
- Payment processing bugs could lose user funds
- Database migration in production

**Mitigation**:
- Comprehensive contract testing on Base Sepolia testnet first
- Multi-sig wallet for contract ownership
- Payment escrow mechanism
- Database backups before migration
- Gradual rollout with feature flags

### Dependencies

```
Story 1 (Backend API) ─┐
                       ├──> Story 4 (Production)
Story 2 (Contracts) ───┤
                       │
Story 3 (Payments) ────┘
```

**Parallel Work**:
- Stories 1 & 2 can be developed simultaneously
- Story 3 requires Story 2 completion
- Story 4 requires all stories complete

---

## Definition of Done

Each story is considered complete when:
- ✅ Code implemented and passes all tests
- ✅ Test coverage >80% for new code
- ✅ Security review completed (for contracts and payment logic)
- ✅ Documentation written (API docs, deployment guides)
- ✅ Code reviewed and approved by at least one team member
- ✅ Deployed to staging environment and tested
- ✅ Performance metrics meet targets
- ✅ No critical or high-severity bugs

---

## Technical Debt to Address

From previous sprints:
- [ ] Replace in-memory rate limit store with Redis
- [ ] Enable Farcaster Hub API frame message verification
- [ ] Add integration tests for Frame endpoints
- [ ] Set up error monitoring (Sentry)

New items to track:
- [ ] Database query optimization (add indexes)
- [ ] API response caching (Redis)
- [ ] Contract upgrade mechanism (proxy pattern)
- [ ] Automated backup procedures

---

## Sprint Schedule

### Week 1 (Feb 3-9)
- **Day 1-2**: Story 1 (Backend API) kickoff
- **Day 1-3**: Story 2 (Smart Contracts) development
- **Day 3-4**: Story 1 completion and testing
- **Day 4-5**: Story 3 (Payment Processing) kickoff

### Week 2 (Feb 10-16)
- **Day 6-7**: Story 3 completion
- **Day 8-9**: Story 2 mainnet deployment
- **Day 10-11**: Story 4 (Production Deployment)
- **Day 12**: Sprint review and retrospective

---

## Success Criteria

Sprint 3 is successful if:
- ✅ Backend API handles 1000+ requests/min
- ✅ Smart contracts deployed to Base mainnet with verified code
- ✅ Payment processing has 0 failed transactions in testing
- ✅ Production deployment completes with <5min downtime
- ✅ All critical monitoring alerts configured
- ✅ Documentation complete for operations team

---

## Post-Sprint Goals

After Sprint 3, we will have:
- ✅ Fully functional event management platform
- ✅ NFT ticket minting on Base mainnet
- ✅ Payment processing with escrow
- ✅ Production-ready deployment
- ✅ Monitoring and observability

**Next Steps** (Sprint 4+):
- Public beta launch with limited users
- Marketing campaign for Farcaster Frame
- User feedback collection
- Feature iterations based on PMF metrics
- Scale infrastructure for 10K+ concurrent users

---

**Sprint Start**: February 3, 2025  
**Sprint End**: February 16, 2025  
**Team**: 1 full-stack developer + AI pair programmer (Claude Sonnet 4.5)  
**Prepared**: October 26, 2024
