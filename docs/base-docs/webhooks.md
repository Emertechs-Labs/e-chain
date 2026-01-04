# Mini Apps & Tools

## Mini Apps Overview

Mini Apps are lightweight, social-native apps that launch instantly when tapped in social feeds and messaging apps. They eliminate the friction of traditional app stores by running as web applications with zero installation requirements.

### Why Mini Apps?

**Beyond the App Store Model:**
- **Discovery**: Distributed through social feeds instead of app stores
- **Frictionless**: Launch instantly with one tap, no downloads required
- **Viral Distribution**: Built-in social sharing and friend networks
- **Higher Conversion**: No app installs, seed phrases, or network switches

**For Users:**
- Instant engagement without downloads
- Social activities with friends (games, coordination, commerce)
- Built-in friend networks and social context

**For Builders:**
- **User Acquisition**: Organic distribution through social feeds
- **Engagement**: Friend groups and live activity feeds
- **Viral Growth**: Every interaction becomes potential distribution

### What You Can Build

- **Games & Entertainment**: Multiplayer games with real-time competition
- **Shopping & Commerce**: Social commerce experiences
- **Social Coordination**: Group activities and event planning
- **Creative & Learning**: Collaborative experiences

### Mini Apps vs Traditional Apps

| Aspect | Traditional Apps | Mini Apps |
|--------|------------------|-----------|
| Discovery | App store algorithms | Social feeds and friends |
| Installation | Required downloads | Zero friction |
| Distribution | Paid advertising | Viral sharing |
| User Acquisition | Expensive campaigns | Organic social growth |
| Social Features | Must be built from scratch | Built into the platform |

## MiniKit - The Official SDK

MiniKit is the official SDK for building Mini Apps that work seamlessly across Base App and other Farcaster clients.

### Key Features

- **Seamless Integration**: Part of OnchainKit with shared providers
- **Social-Native**: Built for Farcaster's frame-based architecture
- **Wallet Abstraction**: Simplified wallet connections and transactions
- **Cross-Client**: Works across Base App, Farcaster, and other clients

### Architecture

MiniKit consists of three main components:

1. **OnchainKitProvider**: React context with MiniKit configuration
2. **Hooks**: React hooks for frame interactions and social features
3. **CLI Tools**: Command-line utilities for project scaffolding

### Getting Started

#### New Mini App

```bash
npx create-onchain --mini
```

#### Existing App Integration

```tsx
import { OnchainKitProvider } from '@coinbase/onchainkit';

<OnchainKitProvider
  chain={base}
  miniKit={{
    enabled: true,
    autoConnect: true,
  }}
>
  {children}
</OnchainKitProvider>
```

### Key Hooks

- `useMiniKit()`: Access frame context and user data
- `useComposeCast()`: Share content to Farcaster
- `useOpenUrl()`: Navigate to external URLs
- `useAuthenticate()`: Verify user identity
- `useNotification()`: Send push notifications

## Base Ecosystem Tools

### Node Providers

Base offers multiple RPC node providers for reliable blockchain access:

#### Popular Providers

- **Coinbase Developer Platform (CDP)**: Free tier with rate limits
- **Alchemy**: Enhanced APIs with SDKs and hosted nodes
- **QuickNode**: Free Discover Plan with add-on options
- **Chainstack**: High-performing nodes with archive access
- **Tenderly Web3 Gateway**: Developer tooling and monitoring

#### Supported Networks

All providers support:
- Base Mainnet
- Base Sepolia (Testnet)

### Block Explorers

Multiple block explorers provide transaction monitoring and contract verification:

#### Available Explorers

- **BaseScan**: Official Etherscan for Base
- **Blockscout**: Open-source explorer with contract verification
- **Routescan**: Multi-chain Superchain explorer
- **DexGuru**: Advanced transaction analysis
- **Tenderly Explorer**: Smart contract debugging and gas optimization

### Data Indexers

Access historical and real-time blockchain data through various indexing solutions:

#### Popular Indexers

- **The Graph**: Decentralized indexing with GraphQL queries
- **Covalent**: Unified API for 100+ blockchains
- **SubQuery**: Custom APIs for Base and other chains
- **Envio**: Hyper-speed historical data syncing
- **Flair**: Real-time custom data indexing

#### Key Features

- **Real-time Data**: Live transaction and event monitoring
- **Historical Access**: Complete blockchain history
- **Enriched Data**: Metadata, analytics, and cross-chain insights
- **GraphQL APIs**: Flexible data querying
- **Custom Indexing**: Build tailored data pipelines

### Development Tools

#### Foundry

```bash
forge init
forge create ./src/Counter.sol:Counter --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer
```

#### Viem (Node.js)

```javascript
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

export const walletClient = createWalletClient({
  chain: base,
  transport: http(process.env.BASE_MAINNET_RPC_URL)
});
```

#### Thirdweb

```bash
npx thirdweb create --template
```

### Testing & Debugging

- **Tenderly**: Smart contract simulation and debugging
- **Base Sepolia**: Official testnet with faucets
- **Anvil Network**: Local development environment
- **Anvil**: Foundry's local Ethereum node

## Next Steps

- [Mini Apps Quickstart](https://docs.base.org/mini-apps/quickstart/)
- [MiniKit Documentation](https://docs.base.org/mini-apps/technical-reference/minikit/)
- [Base Tools Overview](https://docs.base.org/base-chain/tools/)
- [Node Providers](https://docs.base.org/base-chain/tools/node-providers)
- [Block Explorers](https://docs.base.org/base-chain/tools/block-explorers)
- [Data Indexers](https://docs.base.org/base-chain/tools/data-indexers)