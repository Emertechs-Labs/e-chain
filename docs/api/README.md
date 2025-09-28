# 🔌 Echain API Documentation

## Overview

The Echain platform provides a comprehensive REST API built on top of Curvegrid MultiBaas, enabling seamless interaction with blockchain smart contracts through traditional HTTP requests. This API abstracts the complexity of blockchain interactions while maintaining the transparency and security benefits of Web3.

## 🚀 Getting Started

### Base URL
```
https://kwp44rxeifggriyd4hmbjq7dey.multibaas.com/api/v0
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
- **Web3 Proxy Key**: Direct blockchain interaction (Base Sepolia testnet)

## 📋 API Endpoints

### Events API

#### Get Active Events
Retrieve paginated list of active events.

```http
GET /chains/ethereum/contracts/event_factory/methods/getActiveEvents
```

**Request Body:**
```json
{
  "args": ["0", "50"]
}
```

**Response:**
```json
{
  "result": {
    "output": [
      [1, 2, 3], // eventIds
      true       // hasMore
    ]
  }
}
```

#### Get Event Details
Retrieve comprehensive event information.

```http
GET /chains/ethereum/contracts/event_factory/methods/getEvent
```

**Request Body:**
```json
{
  "args": ["1"]
}
```

**Response:**
```json
{
  "result": {
    "output": {
      "id": "1",
      "organizer": "0xbE36039Bfe7f48604F73daD61411459B17fd2e85",
      "ticketContract": "0x127b53D8f29DcDe4DDfcCb24ad8b88B515D08180",
      "poapContract": "0x405061e2ef1F748fA95A1e7725fc1a008e8c2196",
      "incentiveContract": "0x8290c12f874DF9D03FDadAbE10C7c6321B69Ded9",
      "name": "Tech Conference 2024",
      "metadataURI": "https://ipfs.io/ipfs/QmHash123...",
      "ticketPrice": "1000000000000000000",
      "maxTickets": "500",
      "startTime": "1735689600",
      "endTime": "1735776000",
      "isActive": true,
      "createdAt": "1735603200"
    }
  }
}
```

#### Create Event
Create a new event and deploy its associated contracts.

```http
POST /chains/ethereum/contracts/event_factory/methods/createEvent
```

**Request Body:**
```json
{
  "args": [
    "Tech Conference 2024",
    "https://ipfs.io/ipfs/QmMetadata123...",
    "1000000000000000000",
    "500",
    "1735689600",
    "1735776000"
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
        "organizer": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9"
      }
    }
  }
}
```

### Tickets API

#### Purchase Tickets
Buy tickets for an event using the EventTicket contract.

```http
POST /chains/ethereum/contracts/event_ticket_1/methods/mintTickets
```

**Request Body:**
```json
{
  "args": [
    "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9", // Buyer address
    "2"                                           // Quantity
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
          "eventId": "1"
        },
        {
          "tokenId": "2",
          "owner": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9",
          "eventId": "1"
        }
      ]
    }
  }
}
```

#### Get Ticket Balance
Check how many tickets an address owns for an event.

```http
GET /chains/ethereum/contracts/event_ticket_1/methods/balanceOf
```

**Request Body:**
```json
{
  "args": ["0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9"]
}
```

**Response:**
```json
{
  "result": {
    "output": "2"
  }
}
```

#### Get Ticket Details
Retrieve information about a specific ticket NFT.

```http
GET /chains/ethereum/contracts/event_ticket_1/methods/tokenURI
```

**Request Body:**
```json
{
  "args": ["1"]
}
```

**Response:**
```json
{
  "result": {
    "output": "https://ipfs.io/ipfs/QmTicket123...",
    "metadata": {
      "name": "Tech Conference 2024 - Ticket #1",
      "description": "Admission ticket for Tech Conference 2024",
      "image": "https://ipfs.io/ipfs/QmImage123...",
      "attributes": [
        {
          "trait_type": "Event",
          "value": "Tech Conference 2024"
        },
        {
          "trait_type": "Event ID",
          "value": "1"
        }
      ]
    }
  }
}
```

### POAP (Proof of Attendance) API

#### Mint POAP
Award a POAP to an attendee for event participation.

```http
POST /chains/ethereum/contracts/poap_1/methods/mintPOAP
```

**Request Body:**
```json
{
  "args": [
    "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9", // Attendee address
    "https://ipfs.io/ipfs/QmPOAPMetadata123..."   // Metadata URI
  ],
  "from": "0xOrganizerAddress..." // Organizer or authorized minter
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
        "recipient": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9",
        "metadataURI": "https://ipfs.io/ipfs/QmPOAPMetadata123..."
      }
    }
  }
}
```

#### Get POAP Balance
Check how many POAPs an address owns.

```http
GET /chains/ethereum/contracts/poap_1/methods/balanceOf
```

**Request Body:**
```json
{
  "args": ["0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9"]
}
```

**Response:**
```json
{
  "result": {
    "output": "3"
  }
}
```

### Marketplace API

#### List Ticket for Sale
List a ticket NFT for sale on the marketplace.

```http
POST /chains/ethereum/contracts/marketplace/methods/listTicket
```

**Request Body:**
```json
{
  "args": [
    "1",                      // Token ID
    "1500000000000000000",    // Price in wei (1.5 ETH)
    "event_ticket_1"          // Contract label
  ],
  "from": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9"
}
```

#### Purchase Listed Ticket
Buy a ticket that's listed on the marketplace.

```http
POST /chains/ethereum/contracts/marketplace/methods/buyTicket
```

**Request Body:**
```json
{
  "args": [
    "1",                      // Listing ID
    "event_ticket_1"          // Contract label
  ],
  "from": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9",
  "value": "1500000000000000000" // Listed price
}
```

#### Get Marketplace Listings
Get all active marketplace listings.

```http
GET /chains/ethereum/contracts/marketplace/methods/getActiveListings
```

**Request Body:**
```json
{
  "args": ["0", "20"] // offset, limit
}
```

## 🔄 WebSocket Events

Subscribe to real-time updates using WebSocket connections.

### Connection
```javascript
const ws = new WebSocket('wss://kwp44rxeifggriyd4hmbjq7dey.multibaas.com/ws');
```

### Event Subscriptions
```json
{
  "action": "subscribe",
  "eventTypes": [
    "TicketMinted",
    "POAPMinted",
    "EventCreated"
  ]
}
```

### Real-time Event Examples
```json
{
  "type": "TicketMinted",
  "data": {
    "contractAddress": "0x127b53D8f29DcDe4DDfcCb24ad8b88B515D08180",
    "tokenId": "1",
    "owner": "0x742d35Cc6635C0532925a3b8D7ba6C4a1e5aF1e9",
    "eventId": "1",
    "timestamp": "1735689600"
  }
}

{
  "type": "EventCreated",
  "data": {
    "eventId": "1",
    "organizer": "0xbE36039Bfe7f48604F73daD61411459B17fd2e85",
    "name": "Tech Conference 2024",
    "timestamp": "1735603200"
  }
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

## � Troubleshooting

### Common Issues

**Reown API 403 Forbidden Errors**
```
Error: 403 Forbidden - Invalid project configuration
```
- **Cause**: Invalid or missing WalletConnect project ID
- **Solution**: Use fallback project ID `demo-project-id-for-development` in development
- **Prevention**: Always configure `NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID` environment variable

**API Key Authentication Errors**
```
Error: Unauthorized
```
- Check API key is correct and has proper permissions
- Verify key is in "DApp Users" group for frontend access
- Ensure MultiBaas deployment URL is correct

**Contract Call Failures**
```
Error: Contract not found
```
- Verify contract is deployed and registered in MultiBaas
- Check contract label matches MultiBaas registration
- Ensure address is correct for Base Sepolia network

**Network Issues**
```
Error: Network timeout
```
- Check MultiBaas service status
- Verify network connectivity
- Check rate limits and back off if needed

## �🛠️ SDK Integration

### JavaScript/TypeScript SDK
```typescript
import { Configuration, ContractsApi } from '@curvegrid/multibaas-sdk';

const config = new Configuration({
  basePath: 'https://kwp44rxeifggriyd4hmbjq7dey.multibaas.com',
  apiKey: process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY
});

const contractsApi = new ContractsApi(config);

// Get active events
const events = await contractsApi.callContractFunction(
  'ethereum',
  'event_factory',
  'EventFactory',
  'getActiveEvents',
  { args: [0, 50] }
);
```

### React Hooks
```typescript
import { useEvents, useTickets, usePOAPs } from '@/app/hooks';

function EventPage({ eventId }: { eventId: string }) {
  const { events, loading } = useEvents();
  const { tickets } = useTickets(eventId);
  const { poaps } = usePOAPs(userAddress);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Events</h1>
      <p>Total Events: {events?.length}</p>
      <p>Your Tickets: {tickets?.length}</p>
      <p>Your POAPs: {poaps?.length}</p>
    </div>
  );
}
```

This API documentation provides comprehensive coverage of all platform capabilities while maintaining ease of use through the MultiBaas abstraction layer.
