# 🔌 Echain API Documentation

## Overview

The Echain platform provides a comprehensive REST API built on top of Curvegrid MultiBaas, enabling seamless interaction with blockchain smart contracts through traditional HTTP requests. This API abstracts the complexity of blockchain interactions while maintaining the transparency and security benefits of Web3.

## 🚀 Getting Started

### Base URL
```
https://<your-deployment-id>.multibaas.com/api/v0
```

### Authentication
All API requests require authentication using API keys:

```http
Authorization: Bearer <your-api-key>
Content-Type: application/json
```

### API Key Types
- **Admin Key**: Full platform management (deployment only)
- **DApp User Key**: Read-only access for frontend applications
- **Web3 Proxy Key**: Direct blockchain interaction (Curvegrid Testnet only)

## 📋 API Endpoints

### Events API

#### Create Event
Create a new event and deploy its ticketing contract.

```http
POST /contracts/event_factory/methods/createEvent
```

**Request Body:**
```json
{
  "args": [
    "Tech Conference 2024",     // Event name
    "1000000000000000000",      // Ticket price in wei (1 ETH)
    "500",                      // Maximum tickets
    "1735689600",               // Event timestamp
    "QmHash123...",             // IPFS metadata hash
    "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9" // Organizer address
  ],
  "from": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9"
}
```

**Response:**
```json
{
  "result": {
    "transactionHash": "0xabc123...",
    "blockNumber": 12345,
    "gasUsed": "2100000",
    "events": {
      "EventCreated": {
        "eventId": "1",
        "ticketContract": "0x456def...",
        "organizer": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9"
      }
    }
  }
}
```

#### Get Event Details
Retrieve comprehensive event information.

```http
GET /contracts/event_factory/methods/getEvent?args=["1"]
```

**Response:**
```json
{
  "result": {
    "output": {
      "eventId": "1",
      "name": "Tech Conference 2024",
      "organizer": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9",
      "ticketContract": "0x456def...",
      "ticketPrice": "1000000000000000000",
      "maxTickets": "500",
      "ticketsSold": "150",
      "eventDate": "1735689600",
      "metadataHash": "QmHash123...",
      "isActive": true
    }
  }
}
```

#### List Events
Get paginated list of all events.

```http
GET /contracts/event_factory/methods/getAllEvents?args=["0", "10"]
```

**Query Parameters:**
- `offset`: Starting index (default: 0)
- `limit`: Number of events to return (max: 100)

### Tickets API

#### Purchase Tickets
Buy tickets for an event.

```http
POST /contracts/event_ticket_1/methods/mintTickets
```

**Request Body:**
```json
{
  "args": [
    "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9", // Buyer address
    "2",                                              // Quantity
    ["A1", "A2"]                                     // Seat assignments
  ],
  "from": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9",
  "value": "2000000000000000000" // 2 ETH total
}
```

**Response:**
```json
{
  "result": {
    "transactionHash": "0xdef456...",
    "events": {
      "TicketMinted": [
        {
          "tokenId": "1",
          "owner": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9",
          "seatNumber": "A1"
        },
        {
          "tokenId": "2",
          "owner": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9",
          "seatNumber": "A2"
        }
      ],
      "EarlyBirdReward": {
        "recipient": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9",
        "position": "3",
        "badgeId": "early_bird_bronze"
      }
    }
  }
}
```

#### Get Ticket Details
Retrieve information about a specific ticket NFT.

```http
GET /contracts/event_ticket_1/methods/tokenURI?args=["1"]
```

**Response:**
```json
{
  "result": {
    "output": "https://ipfs.io/ipfs/QmTicket123...",
    "metadata": {
      "name": "Tech Conference 2024 - Seat A1",
      "description": "Admission ticket for Tech Conference 2024",
      "image": "https://ipfs.io/ipfs/QmImage123...",
      "attributes": [
        {
          "trait_type": "Event",
          "value": "Tech Conference 2024"
        },
        {
          "trait_type": "Seat",
          "value": "A1"
        },
        {
          "trait_type": "Date",
          "value": "2024-12-31"
        }
      ]
    }
  }
}
```

#### Verify Ticket Ownership
Check if an address owns a valid ticket for an event.

```http
GET /contracts/event_ticket_1/methods/balanceOf?args=["0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9"]
```

### POAP (Proof of Attendance) API

#### Check In Attendee
Mark an attendee as present and mint POAP.

```http
POST /contracts/poap_attendance/methods/checkIn
```

**Request Body:**
```json
{
  "args": [
    "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9", // Attendee address
    "1",                                              // Event ID
    "0xsignature123...",                             // Check-in signature
    "QmPOAPHash123..."                               // POAP metadata hash
  ],
  "from": "0xOrganizerAddress..." // Organizer or authorized checker
}
```

**Response:**
```json
{
  "result": {
    "transactionHash": "0x789abc...",
    "events": {
      "POAPMinted": {
        "tokenId": "42",
        "attendee": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9",
        "eventId": "1",
        "timestamp": "1735689600"
      }
    }
  }
}
```

#### Get Attendance History
Retrieve all POAPs owned by an address.

```http
GET /contracts/poap_attendance/methods/getAttendanceHistory?args=["0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9"]
```

**Response:**
```json
{
  "result": {
    "output": [
      {
        "tokenId": "42",
        "eventId": "1",
        "eventName": "Tech Conference 2024",
        "timestamp": "1735689600",
        "metadataURI": "https://ipfs.io/ipfs/QmPOAP123..."
      }
    ]
  }
}
```

### Incentives API

#### Get User Rewards
Retrieve all rewards and achievements for a user.

```http
GET /contracts/incentive_manager/methods/getUserRewards?args=["0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9"]
```

**Response:**
```json
{
  "result": {
    "output": {
      "loyaltyPoints": "2500",
      "badges": [
        {
          "badgeId": "early_bird_bronze",
          "eventId": "1",
          "mintedAt": "1735689600",
          "rarity": "common"
        },
        {
          "badgeId": "loyal_attendee_silver",
          "eventCount": "5",
          "mintedAt": "1735689700",
          "rarity": "rare"
        }
      ],
      "achievements": [
        {
          "achievementId": "first_event",
          "unlockedAt": "1735689600",
          "reward": "100 loyalty points"
        }
      ]
    }
  }
}
```

#### Claim Referral Reward
Process referral rewards for successful referrals.

```http
POST /contracts/incentive_manager/methods/claimReferralReward
```

**Request Body:**
```json
{
  "args": [
    "0xReferrerAddress...",  // Person who made referral
    "0xRefereeAddress...",   // Person who was referred
    "1",                     // Event ID
    "0xProof123..."          // Referral proof signature
  ],
  "from": "0xReferrerAddress..."
}
```

## 🔄 WebSocket Events

Subscribe to real-time updates using WebSocket connections.

### Connection
```javascript
const ws = new WebSocket('wss://your-deployment.multibaas.com/ws');
```

### Event Subscriptions
```json
{
  "action": "subscribe",
  "eventTypes": [
    "TicketPurchased",
    "POAPMinted",
    "RewardEarned",
    "EventCreated"
  ]
}
```

### Real-time Event Examples
```json
{
  "type": "TicketPurchased",
  "data": {
    "eventId": "1",
    "buyer": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9",
    "quantity": "2",
    "totalPrice": "2000000000000000000",
    "timestamp": "1735689600"
  }
}

{
  "type": "RewardEarned",
  "data": {
    "recipient": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9",
    "rewardType": "early_bird_badge",
    "eventId": "1",
    "position": "5"
  }
}
```

## 📊 Analytics API

### Event Analytics
Get detailed analytics for event performance.

```http
GET /analytics/events/1
```

**Response:**
```json
{
  "eventId": "1",
  "ticketsSold": 150,
  "totalRevenue": "150000000000000000000",
  "attendanceRate": 0.92,
  "salesByDay": [
    {"date": "2024-12-01", "tickets": 25},
    {"date": "2024-12-02", "tickets": 45},
    {"date": "2024-12-03", "tickets": 80}
  ],
  "rewardsDistributed": {
    "earlyBird": 10,
    "loyaltyPoints": 15000,
    "referralRewards": 5
  }
}
```

### Platform Analytics
Get overall platform metrics.

```http
GET /analytics/platform
```

**Response:**
```json
{
  "totalEvents": 42,
  "totalTicketsSold": 5240,
  "totalRevenue": "5240000000000000000000",
  "activeUsers": 1250,
  "totalPOAPsIssued": 4820,
  "averageAttendanceRate": 0.89
}
```

## 🔐 Security & Rate Limiting

### Rate Limits
- **DApp User API**: 100 requests/minute
- **Admin API**: 1000 requests/minute
- **WebSocket**: 50 messages/minute

### Error Responses
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "retryAfter": 60
  }
}

{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Transaction would exceed available balance",
    "required": "2000000000000000000",
    "available": "1500000000000000000"
  }
}
```

## 🛠️ SDK Integration

### JavaScript/TypeScript SDK
```typescript
import { EchainSDK } from '@echain/sdk';

const echain = new EchainSDK({
  apiKey: process.env.MULTIBAAS_API_KEY,
  network: 'base-mainnet'
});

// Create event
const event = await echain.events.create({
  name: 'My Event',
  ticketPrice: '1000000000000000000',
  maxTickets: 100,
  date: new Date('2024-12-31')
});

// Purchase tickets
const tickets = await echain.tickets.purchase(event.id, {
  quantity: 2,
  buyer: '0x...'
});
```

### React Hooks
```typescript
import { useEvent, useTickets, usePOAPs } from '@echain/react-hooks';

function EventPage({ eventId }: { eventId: string }) {
  const { event, loading } = useEvent(eventId);
  const { tickets } = useTickets(eventId);
  const { poaps } = usePOAPs(userAddress);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{event.name}</h1>
      <p>Tickets sold: {tickets.length}</p>
      <p>Your POAPs: {poaps.length}</p>
    </div>
  );
}
```

This API documentation provides comprehensive coverage of all platform capabilities while maintaining ease of use through the MultiBaas abstraction layer.
