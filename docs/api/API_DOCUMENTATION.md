# Echain API Documentation

## Overview

The Echain API is a comprehensive RESTful service that provides endpoints for decentralized event management, wallet-based authentication, NFT ticketing, cross-chain operations, and advanced analytics. Built with Express.js, TypeScript, and PostgreSQL with blockchain integration.

**Base URL:** 
- Development: `http://localhost:4000/api`
- Staging: `https://staging-api.echain.xyz/api`
- Production: `https://api.echain.xyz/api`

**Version:** 1.0.0 (Beta)  
**Authentication:** JWT Bearer tokens with wallet signature verification  
**Supported Networks:** Ethereum, Polygon, Arbitrum, Optimism  
**OpenAPI Specification:** Available at `/api/docs`

## Table of Contents

1. [Authentication](#authentication)
2. [Events](#events)
3. [Tickets](#tickets)
4. [Analytics](#analytics)
5. [Health Check](#health-check)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Response Formats](#response-formats)
9. [Security](#security)
10. [SDK Examples](#sdk-examples)
11. [Changelog](#changelog)

## Authentication

### Overview
Echain uses wallet-based authentication with JWT tokens and cryptographic signature verification. Users authenticate using their Ethereum-compatible wallet addresses across multiple networks.

**Supported Wallets:** MetaMask, WalletConnect, Coinbase Wallet, Rainbow, Trust Wallet  
**Token Expiry:** 24 hours (configurable)  
**Refresh Token:** 30 days  
**Security:** HMAC SHA-256 signing, signature verification  

### Authentication Flow
1. User connects wallet and signs a message
2. Server verifies signature and wallet ownership
3. JWT token issued with user claims
4. Token included in `Authorization: Bearer <token>` header
5. Automatic token refresh before expiry

### Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json
```

**Description:** Register a new user with wallet address and profile information.

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "email": "user@example.com",
  "username": "myusername",
  "signature": "0x...", // Optional: Signature for verification
  "message": "Welcome to Echain! Nonce: 123456" // Optional: Signed message
}
```

**Validation Rules:**
- `address`: Valid Ethereum address (42 characters, starts with 0x)
- `email`: Valid email format, unique across platform
- `username`: 3-30 characters, alphanumeric and underscores only, unique
- `signature`: Optional 132-character hex string for signature verification
- `message`: Optional message that was signed

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clp123abc456",
      "address": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87",
      "email": "user@example.com",
      "username": "myusername",
      "role": "ATTENDEE",
      "isVerified": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

#### Get User Tickets
```http
GET /api/tickets/my
Authorization: Bearer <token>
```

**Description:** Retrieve all tickets owned by the authenticated user.

**Query Parameters:**
- `status` (enum, optional): Filter by ticket status (VALID, USED, TRANSFERRED, REFUNDED, EXPIRED)
- `eventId` (string, optional): Filter by specific event
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)

**Example Request:**
```http
GET /api/tickets/my?status=VALID&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "clp012jkl345",
        "tokenId": "1001",
        "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
        "owner": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87",
        "status": "VALID",
        "event": {
          "id": "clp123abc456",
          "name": "Tech Conference 2024",
          "startDate": "2024-03-15T09:00:00.000Z",
          "location": "San Francisco, CA",
          "image": "https://cdn.echain.com/events/tech-conf-2024.jpg"
        },
        "ticketType": {
          "id": "clp456def789",
          "name": "General Admission",
          "price": "0.5"
        },
        "qrCode": "https://api.echain.com/tickets/clp012jkl345/qr",
        "purchasedAt": "2024-01-21T16:30:00.000Z",
        "network": "polygon"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

#### Get Ticket Details
```http
GET /api/tickets/:id
Authorization: Bearer <token>
```

**Description:** Get detailed information about a specific ticket. Only accessible by ticket owner, event organizer, or admin.

**Path Parameters:**
- `id` (string, required): Ticket ID (CUID format)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "clp012jkl345",
      "tokenId": "1001",
      "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "owner": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87",
      "status": "VALID",
      "event": {
        "id": "clp123abc456",
        "name": "Tech Conference 2024",
        "description": "Annual technology conference...",
        "startDate": "2024-03-15T09:00:00.000Z",
        "endDate": "2024-03-15T18:00:00.000Z",
        "location": "San Francisco, CA",
        "venue": "Moscone Center",
        "organizer": {
          "id": "clp789def012",
          "username": "techevents"
        }
      },
      "ticketType": {
        "id": "clp456def789",
        "name": "General Admission",
        "price": "0.5",
        "description": "Standard conference access"
      },
      "metadata": {
        "name": "Tech Conference 2024 - General Admission",
        "description": "Ticket for Tech Conference 2024",
        "image": "https://cdn.echain.com/tickets/clp012jkl345.png",
        "attributes": [
          {"trait_type": "Event", "value": "Tech Conference 2024"},
          {"trait_type": "Type", "value": "General Admission"},
          {"trait_type": "Date", "value": "2024-03-15"},
          {"trait_type": "Venue", "value": "Moscone Center"}
        ]
      },
      "qrCode": "https://api.echain.com/tickets/clp012jkl345/qr",
      "purchasedAt": "2024-01-21T16:30:00.000Z",
      "network": "polygon",
      "transferHistory": [
        {
          "from": "0x0000000000000000000000000000000000000000",
          "to": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87",
          "transactionHash": "0xabcdef...",
          "timestamp": "2024-01-21T16:30:00.000Z",
          "type": "MINT"
        }
      ]
    }
  }
}
```

#### Transfer Ticket
```http
POST /api/tickets/:id/transfer
Authorization: Bearer <token>
Content-Type: application/json
```

**Description:** Transfer ticket ownership to another wallet address.

**Path Parameters:**
- `id` (string, required): Ticket ID (CUID format)

**Request Body:**
```json
{
  "toAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "message": "Transferring ticket to friend"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transfer": {
      "id": "clp678pqr901",
      "ticketId": "clp012jkl345",
      "fromAddress": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87",
      "toAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "status": "COMPLETED",
      "transaction": {
        "hash": "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
        "blockNumber": 12345679,
        "gasUsed": "75000"
      },
      "transferredAt": "2024-01-22T10:15:00.000Z"
    }
  }
}
```

#### Verify Ticket
```http
POST /api/tickets/:id/verify
Authorization: Bearer <token>
Content-Type: application/json
```

**Description:** Verify and check-in a ticket for event entry. Only accessible by event organizer or admin.

**Path Parameters:**
- `id` (string, required): Ticket ID (CUID format)

**Request Body:**
```json
{
  "checkInLocation": "Main Entrance",
  "notes": "VIP guest, provide welcome package"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verification": {
      "ticketId": "clp012jkl345",
      "status": "USED",
      "checkInTime": "2024-03-15T08:45:00.000Z",
      "checkInLocation": "Main Entrance",
      "verifiedBy": {
        "id": "clp789def012",
        "username": "techevents"
      },
      "attendee": {
        "address": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87",
        "metadata": {
          "attendeeName": "John Doe",
          "attendeeEmail": "john@example.com"
        }
      }
    }
  }
}
```

**Response (400) - Already Used:**
```json
{
  "success": false,
  "error": {
    "code": "TICKET_ALREADY_USED",
    "message": "Ticket has already been used for check-in",
    "details": {
      "usedAt": "2024-03-15T08:30:00.000Z",
      "checkInLocation": "Main Entrance"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input validation
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid input data",
      "details": [
        {
          "field": "address",
          "message": "Invalid Ethereum address format"
        }
      ]
    }
  }
  ```
- `409 Conflict` - Address or email already registered
  ```json
  {
    "success": false,
    "error": {
      "code": "DUPLICATE_RESOURCE",
      "message": "Address already registered",
      "details": {
        "field": "address",
        "value": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
      }
    }
  }
  ```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json
```

**Description:** Authenticate user with wallet address and optional signature verification.

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "signature": "0x...", // Optional: Signature for enhanced security
  "message": "Login to Echain! Nonce: 789012" // Optional: Signed message
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clp123abc456",
      "address": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87",
      "username": "myusername",
      "email": "user@example.com",
      "role": "ATTENDEE",
      "isVerified": true,
      "lastLoginAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `404 Not Found` - User not found
- `423 Locked` - Account temporarily locked due to failed attempts

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json
```

**Description:** Refresh expired JWT token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Description:** Get current authenticated user profile information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clp123abc456",
      "address": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87",
      "email": "user@example.com",
      "username": "myusername",
      "role": "ATTENDEE",
      "isVerified": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "lastLoginAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Description:** Update user profile information.

**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "bio": "Updated bio information",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clp123abc456",
      "address": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87",
      "email": "newemail@example.com",
      "username": "newusername",
      "bio": "Updated bio information",
      "avatar": "https://example.com/avatar.jpg",
      "role": "ATTENDEE",
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Description:** Logout user and invalidate tokens.

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### User Roles and Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| `ATTENDEE` | Regular user | View events, purchase tickets, manage own profile |
| `ORGANIZER` | Event organizer | All attendee permissions + create/manage events, view analytics |
| `ADMIN` | Platform administrator | All permissions + user management, platform analytics |

### Authentication Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | Valid JWT token required |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `TOKEN_INVALID` | 401 | JWT token is malformed or invalid |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `ACCOUNT_LOCKED` | 423 | Account temporarily locked |
| `SIGNATURE_INVALID` | 400 | Wallet signature verification failed |

## Events

### Overview
Comprehensive event management system supporting multi-chain NFT ticketing, advanced analytics, and cross-chain operations. Events can be created, managed, and monetized across multiple blockchain networks.

**Event Types:** Conference, Concert, Workshop, Meetup, Festival, Sports, Virtual  
**Supported Networks:** Ethereum, Polygon, Arbitrum, Optimism  
**Ticket Types:** NFT-based tickets with metadata and transferability  
**Payment Methods:** ETH, MATIC, USDC, DAI  

### Event Lifecycle
1. **DRAFT** - Event created but not published
2. **PUBLISHED** - Event live and accepting ticket purchases
3. **SOLD_OUT** - All tickets sold
4. **CANCELLED** - Event cancelled, refunds processed
5. **COMPLETED** - Event finished, analytics available

### Endpoints

#### List Events
```http
GET /api/events
```

**Description:** Retrieve paginated list of events with filtering and search capabilities.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1, min: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100, min: 1)
- `search` (string, optional): Search in name, description, location (min: 2 chars)
- `category` (string, optional): Filter by category (tech, music, sports, art, business, education, health, food, travel, other)
- `status` (enum, optional): DRAFT, PUBLISHED, SOLD_OUT, CANCELLED, COMPLETED
- `organizerId` (string, optional): Filter by organizer ID (CUID format)
- `sortBy` (enum, optional): startDate, createdAt, price, ticketsSold, name
- `sortOrder` (enum, optional): asc, desc (default: asc)
- `startDateFrom` (ISO string, optional): Filter events starting after this date
- `startDateTo` (ISO string, optional): Filter events starting before this date
- `priceMin` (number, optional): Minimum ticket price in ETH
- `priceMax` (number, optional): Maximum ticket price in ETH
- `location` (string, optional): Filter by location
- `tags` (string, optional): Comma-separated tags to filter by
- `network` (enum, optional): ethereum, polygon, arbitrum, optimism

**Example Request:**
```http
GET /api/events?page=1&limit=10&search=conference&category=tech&sortBy=startDate&sortOrder=asc&startDateFrom=2024-01-01T00:00:00Z&priceMax=1.0&network=polygon
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "clp123abc456",
        "name": "Tech Conference 2024",
        "description": "Annual technology conference featuring latest innovations",
        "category": "tech",
        "status": "PUBLISHED",
        "startDate": "2024-03-15T09:00:00.000Z",
        "endDate": "2024-03-15T18:00:00.000Z",
        "location": "San Francisco, CA",
        "venue": "Moscone Center",
        "price": "0.5",
        "currency": "ETH",
        "network": "polygon",
        "maxCapacity": 1000,
        "ticketsSold": 750,
        "ticketsAvailable": 250,
        "organizer": {
          "id": "clp789def012",
          "username": "techevents",
          "address": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87"
        },
        "image": "https://cdn.echain.com/events/tech-conf-2024.jpg",
        "tags": ["technology", "innovation", "networking"],
        "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-20T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    },
    "filters": {
      "category": "tech",
      "search": "conference",
      "sortBy": "startDate",
      "sortOrder": "asc"
    }
  }
}
```

#### Create Event
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json
```

**Description:** Create a new event. Requires ORGANIZER or ADMIN role.

**Request Body:**
```json
{
  "name": "Tech Conference 2024",
  "description": "Annual technology conference featuring the latest innovations in AI, blockchain, and web development.",
  "category": "tech",
  "startDate": "2024-03-15T09:00:00.000Z",
  "endDate": "2024-03-15T18:00:00.000Z",
  "location": "San Francisco, CA",
  "venue": "Moscone Center",
  "price": "0.5",
  "currency": "ETH",
  "network": "polygon",
  "maxCapacity": 1000,
  "image": "https://example.com/event-image.jpg",
  "tags": ["technology", "innovation", "networking"],
  "metadata": {
    "speakers": ["John Doe", "Jane Smith"],
    "agenda": "9:00 AM - Registration, 10:00 AM - Keynote...",
    "requirements": "Laptop recommended",
    "parking": "Available on-site"
  },
  "ticketTypes": [
    {
      "name": "General Admission",
      "price": "0.5",
      "quantity": 800,
      "description": "Standard conference access"
    },
    {
      "name": "VIP",
      "price": "1.0",
      "quantity": 200,
      "description": "VIP access with networking dinner"
    }
  ]
}
```

**Validation Rules:**
- `name`: Required, 3-100 characters
- `description`: Required, 10-2000 characters
- `category`: Required, must be valid category
- `startDate`: Required, must be future date
- `endDate`: Required, must be after startDate
- `location`: Required, 3-200 characters
- `price`: Required, positive number, max 1000 ETH
- `maxCapacity`: Required, 1-100000
- `network`: Required, supported network
- `image`: Optional, valid URL
- `tags`: Optional, max 10 tags, each 2-30 characters

**Response (201):**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "clp123abc456",
      "name": "Tech Conference 2024",
      "description": "Annual technology conference featuring the latest innovations in AI, blockchain, and web development.",
      "category": "tech",
      "status": "DRAFT",
      "startDate": "2024-03-15T09:00:00.000Z",
      "endDate": "2024-03-15T18:00:00.000Z",
      "location": "San Francisco, CA",
      "venue": "Moscone Center",
      "price": "0.5",
      "currency": "ETH",
      "network": "polygon",
      "maxCapacity": 1000,
      "ticketsSold": 0,
      "ticketsAvailable": 1000,
      "organizer": {
        "id": "clp789def012",
        "username": "techevents",
        "address": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87"
      },
      "image": "https://example.com/event-image.jpg",
      "tags": ["technology", "innovation", "networking"],
      "contractAddress": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Get Event by ID
```http
GET /api/events/:id
```

**Description:** Retrieve detailed information about a specific event.

**Path Parameters:**
- `id` (string, required): Event ID (CUID format)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "clp123abc456",
      "name": "Tech Conference 2024",
      "description": "Annual technology conference featuring the latest innovations in AI, blockchain, and web development.",
      "category": "tech",
      "status": "PUBLISHED",
      "startDate": "2024-03-15T09:00:00.000Z",
      "endDate": "2024-03-15T18:00:00.000Z",
      "location": "San Francisco, CA",
      "venue": "Moscone Center",
      "price": "0.5",
      "currency": "ETH",
      "network": "polygon",
      "maxCapacity": 1000,
      "ticketsSold": 750,
      "ticketsAvailable": 250,
      "organizer": {
        "id": "clp789def012",
        "username": "techevents",
        "address": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87",
        "email": "organizer@example.com"
      },
      "image": "https://cdn.echain.com/events/tech-conf-2024.jpg",
      "tags": ["technology", "innovation", "networking"],
      "metadata": {
        "speakers": ["John Doe", "Jane Smith"],
        "agenda": "9:00 AM - Registration, 10:00 AM - Keynote...",
        "requirements": "Laptop recommended",
        "parking": "Available on-site"
      },
      "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "ticketTypes": [
        {
          "id": "clp456def789",
          "name": "General Admission",
          "price": "0.5",
          "quantity": 800,
          "sold": 600,
          "available": 200,
          "description": "Standard conference access"
        },
        {
          "id": "clp789ghi012",
          "name": "VIP",
          "price": "1.0",
          "quantity": 200,
          "sold": 150,
          "available": 50,
          "description": "VIP access with networking dinner"
        }
      ],
      "analytics": {
        "views": 2500,
        "uniqueVisitors": 1800,
        "conversionRate": 0.42
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T14:30:00.000Z"
    }
  }
}
```

#### Update Event
```http
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Description:** Update an existing event. Only the event organizer or admin can update.

**Path Parameters:**
- `id` (string, required): Event ID (CUID format)

**Request Body:** (All fields optional, only provided fields will be updated)
```json
{
  "name": "Updated Tech Conference 2024",
  "description": "Updated description with new information...",
  "startDate": "2024-03-16T09:00:00.000Z",
  "endDate": "2024-03-16T18:00:00.000Z",
  "location": "Updated Location",
  "venue": "Updated Venue",
  "price": "0.6",
  "maxCapacity": 1200,
  "image": "https://example.com/updated-image.jpg",
  "tags": ["technology", "innovation", "networking", "ai"],
  "metadata": {
    "speakers": ["John Doe", "Jane Smith", "Bob Johnson"],
    "agenda": "Updated agenda...",
    "requirements": "Updated requirements",
    "parking": "Updated parking info"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "clp123abc456",
      "name": "Updated Tech Conference 2024",
      "description": "Updated description with new information...",
      "updatedAt": "2024-01-21T15:30:00.000Z"
    }
  }
}
```

#### Publish Event
```http
POST /api/events/:id/publish
Authorization: Bearer <token>
```

**Description:** Publish a draft event to make it available for ticket purchases. Deploys smart contract.

**Path Parameters:**
- `id` (string, required): Event ID (CUID format)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "clp123abc456",
      "status": "PUBLISHED",
      "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "publishedAt": "2024-01-21T16:00:00.000Z"
    },
    "transaction": {
      "hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "network": "polygon",
      "gasUsed": "2100000"
    }
  }
}
```

#### Delete Event
```http
DELETE /api/events/:id
Authorization: Bearer <token>
```

**Description:** Delete an event. Only possible if no tickets have been sold.

**Path Parameters:**
- `id` (string, required): Event ID (CUID format)

**Response (200):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Response (400) - Cannot Delete:**
```json
{
  "success": false,
  "error": {
    "code": "EVENT_HAS_TICKETS",
    "message": "Cannot delete event with sold tickets",
    "details": {
      "ticketsSold": 150,
      "refundRequired": true
    }
  }
}
```

## Tickets

### Overview
NFT-based ticket management system with cross-chain support, secure transfers, and comprehensive validation. Each ticket is a unique NFT with metadata and ownership verification.

**Ticket Features:**
- NFT-based tickets with unique metadata
- Cross-chain compatibility (Ethereum, Polygon, Arbitrum, Optimism)
- Secure ownership verification
- Transfer and resale capabilities
- QR code generation for check-in
- Real-time validation and status tracking

**Ticket States:**
- `VALID` - Active ticket ready for use
- `USED` - Ticket has been used for event entry
- `TRANSFERRED` - Ticket ownership has been transferred
- `REFUNDED` - Ticket has been refunded
- `EXPIRED` - Ticket has expired (past event date)

### Endpoints

#### Purchase Ticket
```http
POST /api/tickets/purchase
Authorization: Bearer <token>
Content-Type: application/json
```

**Description:** Purchase tickets for an event. Creates NFT tickets on the specified blockchain.

**Request Body:**
```json
{
  "eventId": "clp123abc456",
  "ticketTypeId": "clp456def789",
  "quantity": 2,
  "paymentMethod": "ETH",
  "network": "polygon",
  "metadata": {
    "attendeeName": "John Doe",
    "attendeeEmail": "john@example.com",
    "specialRequests": "Vegetarian meal"
  }
}
```

**Validation Rules:**
- `eventId`: Required, must be valid published event
- `ticketTypeId`: Required, must be valid ticket type for the event
- `quantity`: Required, 1-10 tickets per transaction
- `paymentMethod`: Required, supported payment method
- `network`: Required, supported blockchain network
- `metadata`: Optional, additional attendee information

**Response (201):**
```json
{
  "success": true,
  "data": {
    "purchase": {
      "id": "clp789ghi012",
      "eventId": "clp123abc456",
      "ticketTypeId": "clp456def789",
      "quantity": 2,
      "totalPrice": "1.0",
      "currency": "ETH",
      "network": "polygon",
      "status": "COMPLETED",
      "transaction": {
        "hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        "blockNumber": 12345678,
        "gasUsed": "150000"
      },
      "tickets": [
        {
          "id": "clp012jkl345",
          "tokenId": "1001",
          "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
          "owner": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87",
          "status": "VALID",
          "qrCode": "https://api.echain.com/tickets/clp012jkl345/qr",
          "metadata": {
            "name": "Tech Conference 2024 - General Admission",
            "description": "Ticket for Tech Conference 2024",
            "image": "https://cdn.echain.com/tickets/clp012jkl345.png",
            "attributes": [
              {"trait_type": "Event", "value": "Tech Conference 2024"},
              {"trait_type": "Type", "value": "General Admission"},
              {"trait_type": "Date", "value": "2024-03-15"},
              {"trait_type": "Venue", "value": "Moscone Center"}
            ]
          }
        },
        {
          "id": "clp345mno678",
          "tokenId": "1002",
          "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
          "owner": "0x742d35cc6634c0532925a3b8d4c9db96590c6c87",
          "status": "VALID",
          "qrCode": "https://api.echain.com/tickets/clp345mno678/qr",
          "metadata": {
            "name": "Tech Conference 2024 - General Admission",
            "description": "Ticket for Tech Conference 2024",
            "image": "https://cdn.echain.com/tickets/clp345mno678.png",
            "attributes": [
              {"trait_type": "Event", "value": "Tech Conference 2024"},
              {"trait_type": "Type", "value": "General Admission"},
              {"trait_type": "Date", "value": "2024-03-15"},
              {"trait_type": "Venue", "value": "Moscone Center"}
            ]
          }
        }
      ],
      "purchasedAt": "2024-01-21T16:30:00.000Z"
    }
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

## Tickets

### Overview
Ticket management for event attendance and verification.

### Endpoints

#### Purchase Ticket
```http
POST /api/tickets
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "eventId": "clp123abc456",
  "quantity": 2,
  "paymentMethod": "ETH",
  "transactionHash": "0x..."
}
```

#### Get User Tickets
```http
GET /api/tickets/my-tickets
Authorization: Bearer <token>
```

#### Verify Ticket
```http
POST /api/tickets/:id/verify
Authorization: Bearer <token>
```

## Analytics

### Overview
Analytics endpoints for event organizers and administrators.

### Endpoints

#### Event Analytics
```http
GET /api/analytics/events/:id
Authorization: Bearer <token>
```

#### Platform Analytics
```http
GET /api/analytics/platform
Authorization: Bearer <token>
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_REQUIRED` - Valid JWT token required
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `DUPLICATE_RESOURCE` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Rate Limiting

### Global Rate Limits
- **General endpoints:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 5 requests per 15 minutes per IP
- **Strict endpoints:** 10 requests per 15 minutes per IP

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    // Optional metadata (pagination, etc.)
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": [] // Optional additional details
  }
}
```

### Pagination Format
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Health Check

### System Health
```http
GET /health
```

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

## SDK Examples

### JavaScript/TypeScript
```javascript
// Initialize API client
const api = new EchainAPI({
  baseURL: 'http://localhost:4000/api',
  token: 'your-jwt-token'
});

// List events
const events = await api.events.list({
  page: 1,
  limit: 10,
  category: 'tech'
});

// Create event
const newEvent = await api.events.create({
  name: 'My Event',
  description: 'Event description...',
  startDate: '2024-06-15T09:00:00.000Z',
  endDate: '2024-06-15T18:00:00.000Z',
  location: 'San Francisco, CA',
  price: '0.1',
  maxCapacity: 100
});
```

### cURL Examples
```bash
# Register user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    "email": "user@example.com",
    "username": "myusername"
  }'

# List events
curl -X GET "http://localhost:4000/api/events?page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"

# Create event
curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "Tech Conference 2024",
    "description": "Annual technology conference...",
    "startDate": "2024-06-15T09:00:00.000Z",
    "endDate": "2024-06-15T18:00:00.000Z",
    "location": "San Francisco, CA",
    "price": "0.1",
    "maxCapacity": 500
  }'
```

## Changelog

### Version 1.0.0
- Initial API release
- Authentication with wallet addresses
- Event CRUD operations
- Ticket management
- Basic analytics
- Rate limiting and security features