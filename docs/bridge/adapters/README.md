# Bridge Adapters

This directory contains documentation and implementations for chain-specific adapters that enable Echain's bridge to communicate with different blockchains.

## Adapter Architecture

Each adapter implements the `IChainAdapter` interface and provides blockchain-specific logic for:

- Message sending and receiving
- Fee estimation
- Asset bridging
- Chain configuration

## Base Adapter Interface

```typescript
interface IChainAdapter {
  sendMessage(
    destChainId: number,
    destContract: string,
    payload: Uint8Array,
    messageId: string
  ): Promise<TransactionResult>;

  estimateFee(
    destChainId: number,
    payload: Uint8Array
  ): Promise<bigint>;

  getChainConfig(): ChainConfig;
}
```

## Available Adapters

### Polkadot Adapter
- **File**: `PolkadotAdapter.ts`
- **Chains**: Polkadot parachains, Kusama
- **Protocol**: XCM (Cross-Consensus Messaging)
- **Features**: Native parachain messaging, Snowbridge for Ethereum

### Wormhole Adapter
- **File**: `WormholeAdapter.ts`
- **Chains**: Ethereum, BSC, Polygon, Avalanche, Solana, Terra
- **Protocol**: Wormhole VAA (Verified Action Approval)
- **Features**: Multi-chain asset and message bridging

### LayerZero Adapter
- **File**: `LayerZeroAdapter.ts`
- **Chains**: 20+ chains including Ethereum, BSC, Avalanche, Polygon
- **Protocol**: LayerZero omnichain messaging
- **Features**: Ultra-light nodes, configurable security

### Custom Adapters
- **File**: `CustomAdapter.ts`
- **Chains**: Any blockchain not supported by existing adapters
- **Protocol**: Custom implementation
- **Features**: Full flexibility for unique chains

## Developing New Adapters

### 1. Extend Base Adapter

```typescript
import { BaseChainAdapter } from '../core/BaseChainAdapter';

export class NewChainAdapter extends BaseChainAdapter {
  constructor(chainId: number, rpcUrl: string, bridgeContract: string) {
    super(chainId, rpcUrl, bridgeContract);
  }

  async sendMessage(
    destChainId: number,
    destContract: string,
    payload: Uint8Array,
    messageId: string
  ): Promise<TransactionResult> {
    // Implement chain-specific message sending
  }

  protected getChainName(): string {
    return 'NewChain';
  }

  protected supportsAssets(): boolean {
    return true; // or false
  }
}
```

### 2. Implement Required Methods

#### sendMessage()
Handle the actual cross-chain message transmission using the chain's native protocols.

#### estimateFee()
Calculate the estimated cost for cross-chain operations including:
- Network fees
- Bridge fees
- Gas costs

#### getChainConfig()
Return chain-specific configuration:
- Chain name and ID
- Asset support status
- Message support status

### 3. Register Adapter

```typescript
const bridgeManager = new BridgeManager();
bridgeManager.registerAdapter(
  NEW_CHAIN_ID,
  new NewChainAdapter(rpcUrl, bridgeContract)
);
```

## Testing Adapters

### Unit Tests
```typescript
describe('NewChainAdapter', () => {
  let adapter: NewChainAdapter;

  beforeEach(() => {
    adapter = new NewChainAdapter(CHAIN_ID, RPC_URL, BRIDGE_CONTRACT);
  });

  it('should send message successfully', async () => {
    const result = await adapter.sendMessage(
      DEST_CHAIN_ID,
      DEST_CONTRACT,
      testPayload,
      messageId
    );

    expect(result.txHash).toBeDefined();
  });

  it('should estimate fees accurately', async () => {
    const fee = await adapter.estimateFee(DEST_CHAIN_ID, testPayload);
    expect(fee).toBeGreaterThan(0);
  });
});
```

### Integration Tests
- Test cross-chain message delivery
- Verify asset bridging functionality
- Test error handling and recovery

## Security Considerations

### Message Validation
- Implement proper signature verification
- Use multi-sig for critical operations
- Validate message authenticity

### Asset Security
- Use audited bridge contracts
- Implement proper locking mechanisms
- Monitor for unusual activity

### Rate Limiting
- Implement transaction rate limits
- Monitor for spam attacks
- Use circuit breakers for emergencies

## Performance Optimization

### Batching
Group multiple messages into single transactions to reduce costs.

### Caching
Cache frequently used data like chain configurations and fee estimates.

### Monitoring
Implement comprehensive logging and monitoring for all adapter operations.

## Contributing

1. Follow the adapter development guidelines
2. Include comprehensive tests
3. Update documentation
4. Submit security audit if handling assets
5. Create pull request with detailed description

## Support

For questions about adapter development:
- Check existing adapter implementations
- Review the base adapter interface
- Open an issue for new adapter requests
- Join our Discord developer community