# Bridge API Reference

This document provides comprehensive API reference for Echain's bridge system, including JavaScript SDK methods, REST API endpoints, and WebSocket subscriptions.

## JavaScript SDK

### Installation

```bash
npm install @echain/bridge-sdk
```

### Initialization

```typescript
import { EchainBridge } from '@echain/bridge-sdk';

const bridge = new EchainBridge({
  // Required
  rpcUrl: 'https://mainnet.base.org',
  bridgeContract: '0x1234567890123456789012345678901234567890',

  // Optional
  chainId: 8453, // Base mainnet
  signer: walletSigner,
  apiKey: 'your-api-key', // For enhanced features
  timeout: 30000 // Request timeout in ms
});
```

## Core Methods

### sendMessage

Sends a cross-chain message to execute an action on the destination chain.

```typescript
async sendMessage(params: SendMessageParams): Promise<SendMessageResult>

interface SendMessageParams {
  destChain: string | number;        // Destination chain identifier
  destContract: string;              // Destination contract address
  action: string;                    // Action to perform (PURCHASE_TICKET, CLAIM_POAP, etc.)
  data: any;                         // Action-specific data
  options?: SendMessageOptions;      // Optional parameters
}

interface SendMessageOptions {
  gasLimit?: number;                 // Gas limit for execution
  gasPrice?: string;                 // Gas price (wei)
  value?: string;                    // ETH value to send (wei)
  priority?: 'low' | 'medium' | 'high'; // Transaction priority
}

interface SendMessageResult {
  txHash: string;                    // Transaction hash
  messageId: string;                 // Unique message identifier
  success: boolean;                  // Transaction success status
  gasUsed?: number;                  // Gas used (if available)
  fee?: string;                      // Total fee paid (wei)
}
```

**Example:**
```typescript
const result = await bridge.sendMessage({
  destChain: 'base',
  destContract: '0x...',
  action: 'PURCHASE_TICKET',
  data: {
    eventId: 123,
    quantity: 2,
    userAddress: '0x...'
  },
  options: {
    priority: 'high'
  }
});

console.log('Message sent:', result.messageId);
```

### purchaseTicket

Convenience method for purchasing event tickets across chains.

```typescript
async purchaseTicket(params: PurchaseTicketParams): Promise<PurchaseResult>

interface PurchaseTicketParams {
  eventId: number | string;          // Event identifier
  quantity: number;                  // Number of tickets
  userAddress: string;               // Buyer's address
  fromChain?: string;                // Source chain (auto-detected if not provided)
  paymentToken?: string;             // Token address for payment (default: native)
  options?: PurchaseOptions;         // Additional options
}

interface PurchaseOptions {
  referrer?: string;                 // Referrer address for rewards
  discountCode?: string;             // Discount code
  metadata?: Record<string, any>;    // Additional metadata
}

interface PurchaseResult extends SendMessageResult {
  ticketIds?: string[];              // Minted ticket IDs (if available)
  totalCost?: string;                // Total cost paid
  estimatedDelivery?: number;        // Estimated delivery time (seconds)
}
```

**Example:**
```typescript
const result = await bridge.purchaseTicket({
  eventId: 123,
  quantity: 2,
  userAddress: '0x...',
  fromChain: 'polygon',
  paymentToken: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' // USDC on Polygon
});
```

### claimPOAP

Claims a POAP certificate for event attendance.

```typescript
async claimPOAP(params: ClaimPOAPParams): Promise<ClaimResult>

interface ClaimPOAPParams {
  eventId: number | string;          // Event identifier
  userAddress: string;               // Claimant's address
  proof?: string;                    // Attendance proof (if required)
  fromChain?: string;                // Source chain
}

interface ClaimResult extends SendMessageResult {
  poapId?: string;                   // Minted POAP token ID
  tokenURI?: string;                 // POAP metadata URI
}
```

### bridgeAsset

Bridges assets between chains for payments or transfers.

```typescript
async bridgeAsset(params: BridgeAssetParams): Promise<BridgeResult>

interface BridgeAssetParams {
  amount: string | number;           // Amount to bridge
  fromChain: string;                 // Source chain
  toChain: string;                   // Destination chain
  tokenAddress?: string;             // Token contract (default: native)
  recipient?: string;                // Recipient address (default: sender)
  options?: BridgeOptions;           // Additional options
}

interface BridgeOptions {
  slippage?: number;                 // Slippage tolerance (percentage)
  deadline?: number;                 // Transaction deadline (timestamp)
}

interface BridgeResult extends SendMessageResult {
  bridgeId?: string;                 // Bridge transaction ID
  estimatedArrival?: number;         // Estimated arrival time
  fee?: string;                      // Bridge fee
}
```

## Query Methods

### getMessageStatus

Retrieves the status of a cross-chain message.

```typescript
async getMessageStatus(messageId: string): Promise<MessageStatus>

interface MessageStatus {
  messageId: string;                 // Message identifier
  status: 'pending' | 'sent' | 'received' | 'executed' | 'failed';
  sourceChain: string;               // Source chain
  destChain: string;                 // Destination chain
  txHash?: string;                   // Source transaction hash
  destTxHash?: string;               // Destination transaction hash
  error?: string;                    // Error message (if failed)
  timestamp: number;                 // Last update timestamp
  confirmations?: number;            // Block confirmations
}
```

**Example:**
```typescript
const status = await bridge.getMessageStatus('0x123...');
console.log('Status:', status.status);
```

### getSupportedChains

Returns list of supported blockchain networks.

```typescript
async getSupportedChains(): Promise<ChainInfo[]>

interface ChainInfo {
  id: string;                        // Chain identifier
  name: string;                      // Human-readable name
  chainId: number;                   // Numeric chain ID
  rpcUrl?: string;                   // RPC endpoint
  blockExplorer?: string;            // Block explorer URL
  nativeToken: string;               // Native token symbol
  supportsAssets: boolean;           // Asset bridging support
  supportsMessages: boolean;         // Message passing support
  estimatedFee?: string;             // Estimated bridge fee
  avgConfirmationTime?: number;      // Average confirmation time (seconds)
}
```

### estimateFee

Estimates the cost of a cross-chain operation.

```typescript
async estimateFee(params: EstimateFeeParams): Promise<FeeEstimate>

interface EstimateFeeParams {
  destChain: string;                 // Destination chain
  action: string;                    // Action type
  data?: any;                        // Action data
  options?: EstimateOptions;         // Additional options
}

interface EstimateOptions {
  gasLimit?: number;                 // Custom gas limit
  priority?: 'low' | 'medium' | 'high'; // Fee priority
}

interface FeeEstimate {
  totalFee: string;                  // Total estimated fee (wei)
  breakdown: {
    networkFee: string;              // Network transaction fee
    bridgeFee: string;               // Bridge protocol fee
    gasFee: string;                  // Gas fee
  };
  gasPrice: string;                  // Current gas price
  gasLimit: number;                  // Estimated gas limit
  currency: string;                  // Fee currency
}
```

### getBridgeStats

Retrieves bridge statistics and health metrics.

```typescript
async getBridgeStats(): Promise<BridgeStats>

interface BridgeStats {
  totalMessages: number;             // Total messages processed
  activeMessages: number;            // Currently active messages
  successRate: number;               // Success rate (percentage)
  avgProcessingTime: number;         // Average processing time (seconds)
  totalVolume: string;               // Total volume bridged
  chains: Record<string, ChainStats>; // Per-chain statistics
}

interface ChainStats {
  messages: number;                  // Messages for this chain
  volume: string;                    // Volume for this chain
  successRate: number;               // Success rate for this chain
  avgFee: string;                    // Average fee for this chain
}
```

## Event Subscriptions

### messageStatus

Subscribe to message status updates.

```typescript
bridge.on('messageStatus', (status: MessageStatus) => {
  console.log('Message update:', status);
});

// Unsubscribe
bridge.off('messageStatus');
```

### bridgeActivity

Subscribe to bridge activity events.

```typescript
bridge.on('bridgeActivity', (activity: BridgeActivity) => {
  console.log('Bridge activity:', activity);
});

interface BridgeActivity {
  type: 'message_sent' | 'message_received' | 'asset_bridged';
  chain: string;
  txHash: string;
  timestamp: number;
  details: any;
}
```

## REST API

### Base URL
```
https://api.echain.io/v1/bridge
```

### Authentication
Include API key in header:
```
Authorization: Bearer YOUR_API_KEY
```

### Endpoints

#### POST /messages
Send a cross-chain message.

**Request:**
```json
{
  "destChain": "base",
  "destContract": "0x...",
  "action": "PURCHASE_TICKET",
  "data": {
    "eventId": 123,
    "quantity": 2
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "0x...",
  "txHash": "0x...",
  "estimatedDelivery": 300
}
```

#### GET /messages/{messageId}
Get message status.

**Response:**
```json
{
  "messageId": "0x...",
  "status": "executed",
  "sourceChain": "ethereum",
  "destChain": "base",
  "txHash": "0x...",
  "destTxHash": "0x...",
  "timestamp": 1638360000
}
```

#### GET /chains
Get supported chains.

**Response:**
```json
[
  {
    "id": "ethereum",
    "name": "Ethereum",
    "chainId": 1,
    "supportsAssets": true,
    "estimatedFee": "0.01"
  }
]
```

#### POST /estimate-fee
Estimate bridge fees.

**Request:**
```json
{
  "destChain": "base",
  "action": "PURCHASE_TICKET",
  "data": { "eventId": 123 }
}
```

**Response:**
```json
{
  "totalFee": "0.015",
  "breakdown": {
    "networkFee": "0.01",
    "bridgeFee": "0.005"
  }
}
```

## WebSocket API

### Connection
```javascript
const ws = new WebSocket('wss://ws.echain.io/bridge');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'messages',
    filter: { userAddress: '0x...' }
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

### Message Types

#### message_update
```json
{
  "type": "message_update",
  "messageId": "0x...",
  "status": "executed",
  "timestamp": 1638360000
}
```

#### bridge_stats
```json
{
  "type": "bridge_stats",
  "totalMessages": 15420,
  "successRate": 98.5,
  "avgProcessingTime": 45
}
```

## Error Handling

### Error Codes

| Code | Description |
|------|-------------|
| INVALID_PARAMS | Invalid request parameters |
| CHAIN_NOT_SUPPORTED | Specified chain not supported |
| INSUFFICIENT_FUNDS | Insufficient balance for transaction |
| BRIDGE_PAUSED | Bridge is temporarily paused |
| MESSAGE_EXPIRED | Cross-chain message expired |
| NETWORK_ERROR | Network connectivity issue |
| GAS_ESTIMATION_FAILED | Failed to estimate gas |
| CONTRACT_ERROR | Smart contract execution failed |

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMS",
    "message": "Invalid event ID",
    "details": { "eventId": "must be a number" }
  }
}
```

## Rate Limits

- **SDK Methods**: 100 requests per minute per API key
- **REST API**: 1000 requests per hour per IP
- **WebSocket**: 1000 messages per minute per connection

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638363600
```

## SDK Versions

| Version | Status | Node.js | Browser |
|---------|--------|---------|---------|
| 1.0.x | Current | 16+ | Modern browsers |
| 0.9.x | Deprecated | 14+ | Modern browsers |

## Changelog

### v1.0.0 (October 2025)
- Initial release with full cross-chain support
- Support for Ethereum, Polygon, BSC, and Base
- Message passing and asset bridging
- REST and WebSocket APIs

### Planned Features
- Multi-hop routing
- Enhanced security features
- Additional chain support
- Batch operations