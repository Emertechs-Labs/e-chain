# Bridge Integration Guide

This guide provides comprehensive instructions for integrating Echain's bridge system into applications, including frontend integration, backend API usage, and cross-chain development.

## Quick Start

### Prerequisites
- Node.js 16+
- Web3 wallet (MetaMask, WalletConnect, etc.)
- Basic understanding of cross-chain concepts

### Installation
```bash
npm install @echain/bridge-sdk
# or
yarn add @echain/bridge-sdk
```

### Basic Usage
```typescript
import { EchainBridge } from '@echain/bridge-sdk';

const bridge = new EchainBridge({
  rpcUrl: 'https://mainnet.base.org',
  bridgeContract: '0x...',
});

// Purchase ticket from Ethereum
const result = await bridge.purchaseTicket({
  eventId: 123,
  quantity: 2,
  fromChain: 'ethereum',
  paymentToken: 'ETH'
});

console.log('Transaction:', result.txHash);
```

## Frontend Integration

### React Hook Integration

```typescript
import { useEchainBridge } from '@echain/bridge-sdk/react';

function TicketPurchase({ eventId }) {
  const { purchaseTicket, isLoading, error } = useEchainBridge();

  const handlePurchase = async () => {
    try {
      const result = await purchaseTicket({
        eventId,
        quantity: 1,
        fromChain: 'polygon' // or 'ethereum', 'bsc', etc.
      });

      console.log('Purchase successful:', result);
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  };

  return (
    <button onClick={handlePurchase} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Buy Ticket'}
    </button>
  );
}
```

### Wallet Connection

```typescript
import { useConnect, useAccount } from 'wagmi';
import { EchainBridge } from '@echain/bridge-sdk';

function BridgeInterface() {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const [bridge, setBridge] = useState(null);

  useEffect(() => {
    if (isConnected && address) {
      const bridgeInstance = new EchainBridge({
        signer: address,
        chainId: 1 // Ethereum mainnet
      });
      setBridge(bridgeInstance);
    }
  }, [isConnected, address]);

  return (
    <div>
      {!isConnected ? (
        connectors.map((connector) => (
          <button key={connector.id} onClick={() => connect({ connector })}>
            Connect {connector.name}
          </button>
        ))
      ) : (
        <BridgeOperations bridge={bridge} />
      )}
    </div>
  );
}
```

### Cross-Chain Transaction Status

```typescript
import { useBridgeTransaction } from '@echain/bridge-sdk/react';

function TransactionStatus({ txHash }) {
  const { status, confirmations, error } = useBridgeTransaction(txHash);

  return (
    <div className="transaction-status">
      <h3>Transaction Status</h3>
      <p>Status: {status}</p>
      <p>Confirmations: {confirmations}</p>
      {error && <p className="error">Error: {error.message}</p>}

      {status === 'pending' && <div className="loading-spinner" />}
      {status === 'confirmed' && <div className="success-icon" />}
    </div>
  );
}
```

## Backend Integration

### Node.js API Usage

```typescript
const { EchainBridge } = require('@echain/bridge-sdk');

class TicketService {
  constructor() {
    this.bridge = new EchainBridge({
      privateKey: process.env.BRIDGE_PRIVATE_KEY,
      rpcUrl: process.env.BASE_RPC_URL
    });
  }

  async processCrossChainPurchase(purchaseData) {
    const { eventId, quantity, userAddress, sourceChain } = purchaseData;

    // Validate purchase
    const event = await this.getEvent(eventId);
    const totalCost = event.ticketPrice * quantity;

    // Execute cross-chain purchase
    const result = await this.bridge.sendMessage({
      destChain: 'base',
      destContract: process.env.EVENT_FACTORY_ADDRESS,
      action: 'PURCHASE_TICKET',
      data: {
        eventId,
        quantity,
        userAddress,
        totalCost
      }
    });

    return result;
  }

  async getEvent(eventId) {
    // Fetch event data from your database or API
    return await Event.findById(eventId);
  }
}
```

### Express.js API Endpoint

```typescript
const express = require('express');
const { EchainBridge } = require('@echain/bridge-sdk');

const app = express();
const bridge = new EchainBridge({
  privateKey: process.env.BRIDGE_PRIVATE_KEY
});

app.post('/api/purchase-ticket', async (req, res) => {
  try {
    const { eventId, quantity, userAddress, sourceChain } = req.body;

    // Process the cross-chain purchase
    const result = await bridge.purchaseTicket({
      eventId,
      quantity,
      userAddress,
      sourceChain
    });

    res.json({
      success: true,
      transactionHash: result.txHash,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/bridge-status/:messageId', async (req, res) => {
  try {
    const status = await bridge.getMessageStatus(req.params.messageId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Bridge API server running on port 3000');
});
```

## Chain-Specific Integration

### Ethereum/Polygon/BSC Integration

```typescript
import { ethers } from 'ethers';
import { EchainBridge } from '@echain/bridge-sdk';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const bridge = new EchainBridge({
  signer,
  chainId: 1, // Ethereum mainnet
  supportedChains: [1, 137, 56] // ETH, Polygon, BSC
});

// Purchase with different tokens
const purchaseWithUSDC = await bridge.purchaseTicket({
  eventId: 123,
  quantity: 1,
  paymentToken: '0xA0b86a33E6441e88C5F2712C3E9b74F5b8F1E8b9' // USDC on Ethereum
});
```

### Polkadot Integration

```typescript
import { ApiPromise, WsProvider } from '@polkadot/api';
import { EchainBridge } from '@echain/bridge-sdk';

const wsProvider = new WsProvider('wss://rpc.polkadot.io');
const api = await ApiPromise.create({ provider: wsProvider });

const bridge = new EchainBridge({
  polkadotApi: api,
  chainId: 0, // Polkadot
  signer: polkadotSigner
});

// Send message to Base via Polkadot
const result = await bridge.sendMessage({
  destChain: 'base',
  destContract: BASE_BRIDGE_ADDRESS,
  action: 'CLAIM_POAP',
  data: { eventId: 456, userAddress: polkadotAddress }
});
```

### Solana Integration

```typescript
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { EchainBridge } from '@echain/bridge-sdk';

const connection = new Connection('https://api.mainnet.solana.com');
const keypair = Keypair.fromSecretKey(secretKey);

const bridge = new EchainBridge({
  solanaConnection: connection,
  signer: keypair,
  chainId: 101 // Solana mainnet
});

// Bridge SOL to Base for ticket purchase
const result = await bridge.bridgeAsset({
  amount: 1, // 1 SOL
  fromChain: 'solana',
  toChain: 'base',
  recipient: baseAddress
});
```

## Error Handling

### Common Error Patterns

```typescript
try {
  const result = await bridge.purchaseTicket(purchaseData);
} catch (error) {
  switch (error.code) {
    case 'INSUFFICIENT_FUNDS':
      // Handle insufficient balance
      showError('Insufficient funds for transaction');
      break;

    case 'CHAIN_NOT_SUPPORTED':
      // Handle unsupported chain
      showError('Selected chain is not supported');
      break;

    case 'BRIDGE_PAUSED':
      // Handle bridge maintenance
      showError('Bridge is temporarily paused');
      break;

    case 'INVALID_PARAMETERS':
      // Handle validation errors
      showError('Invalid purchase parameters');
      break;

    default:
      // Handle unknown errors
      showError('Transaction failed. Please try again.');
      console.error('Bridge error:', error);
  }
}
```

### Retry Logic

```typescript
async function purchaseWithRetry(purchaseData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await bridge.purchaseTicket(purchaseData);
      return result;
    } catch (error) {
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function isRetryableError(error) {
  return ['NETWORK_ERROR', 'TIMEOUT', 'GAS_ESTIMATION_FAILED'].includes(error.code);
}
```

## Testing

### Unit Testing

```typescript
import { EchainBridge } from '@echain/bridge-sdk';
import { MockProvider } from '@ethereum/waffle';

describe('EchainBridge', () => {
  let bridge: EchainBridge;
  let mockProvider: MockProvider;

  beforeEach(() => {
    mockProvider = new MockProvider();
    bridge = new EchainBridge({
      provider: mockProvider,
      chainId: 1
    });
  });

  it('should purchase ticket successfully', async () => {
    const result = await bridge.purchaseTicket({
      eventId: 123,
      quantity: 1
    });

    expect(result.txHash).toBeDefined();
    expect(result.success).toBe(true);
  });
});
```

### Integration Testing

```typescript
describe('Cross-Chain Integration', () => {
  it('should complete full cross-chain flow', async () => {
    // Setup test environment
    const testnetBridge = new EchainBridge({
      rpcUrl: 'https://goerli.base.org',
      chainId: 84531 // Base Goerli
    });

    // Execute purchase
    const purchase = await testnetBridge.purchaseTicket({
      eventId: 1,
      quantity: 1,
      fromChain: 'goerli'
    });

    // Wait for confirmation
    await purchase.wait();

    // Verify on destination chain
    const status = await testnetBridge.getMessageStatus(purchase.messageId);
    expect(status.status).toBe('executed');
  });
});
```

## Best Practices

### Performance Optimization
- Batch multiple operations when possible
- Cache frequently used data
- Use appropriate gas limits
- Monitor transaction costs

### User Experience
- Provide clear fee estimates
- Show transaction progress
- Handle network switching gracefully
- Offer multiple payment options

### Security
- Validate all inputs
- Use secure key management
- Implement rate limiting
- Monitor for suspicious activity

### Error Recovery
- Implement transaction retry logic
- Provide clear error messages
- Offer manual intervention options
- Log all errors for debugging

## Troubleshooting

### Common Issues

#### Transaction Stuck
```typescript
// Check transaction status
const status = await bridge.getTransactionStatus(txHash);
if (status === 'stuck') {
  // Speed up with higher gas price
  await bridge.speedUpTransaction(txHash, { gasPrice: higherGasPrice });
}
```

#### Bridge Paused
```typescript
// Check bridge status
const isPaused = await bridge.isPaused();
if (isPaused) {
  // Show maintenance message
  showMessage('Bridge is under maintenance. Please try again later.');
}
```

#### Insufficient Liquidity
```typescript
// Check available liquidity
const liquidity = await bridge.getLiquidity(sourceChain, destChain);
if (liquidity < requiredAmount) {
  showError('Insufficient bridge liquidity. Please try a smaller amount.');
}
```

## Support

### Documentation
- [API Reference](./apis/README.md)
- [Adapter Documentation](../adapters/README.md)
- [Security Guide](../security/README.md)

### Community
- **Discord**: #integration-support
- **GitHub Issues**: For bug reports and feature requests
- **Stack Overflow**: Tag questions with `echain-bridge`

### Enterprise Support
- **Email**: enterprise@echain.io
- **Dedicated Slack Channel**: For enterprise customers
- **24/7 Support**: Available for production deployments