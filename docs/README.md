# 📖 Echain Documentation

<div align="center">

![Echain Logo](https://img.shields.io/badge/Echain-Blockchain_Events_Platform-00D4FF?style=for-the-badge&logo=ethereum&logoColor=white)
![Base Network](https://img.shields.io/badge/Base-Ethereum_L2-0052FF?style=for-the-badge&logo=ethereum&logoColor=white)
![Direct RPC](https://img.shields.io/badge/Data_Source-Direct_RPC-FF6B35?style=for-the-badge&logo=graphql&logoColor=white)

**Base-first Web3 Event Management Platform**

*Turn on-chain ticketing concepts into live experiences using Solidity contracts and a Next.js 15 frontend that talks directly to Base Sepolia.*

[🚀 Quick Start](#-quick-start) • [📚 Documentation](#-documentation-structure) • [🔗 Live Demo](https://echain-eight.vercel.app) • [🛠 Developer Guide](./DEVELOPER_GUIDE.md)

</div>

---

## 🎯 Platform Overview

Echain currently ships with a Base-focused implementation and a direct smart-contract integration model:

- **🎟️ NFT Ticketing**: Event creation and ticket sale flows powered by the `EventFactory` and `EventTicket` contracts.
- **🏆 POAP Certificates**: POAP minting flows prepared via deployed `POAPAttendance` contracts (UI integration in progress).
- **💰 Incentive Hooks**: `IncentiveManager` contract available for rewards features (frontend wiring pending).
- **🛡️ Security Foundations**: Contracts lean on OpenZeppelin libraries and Foundry test coverage.
- **🔗 Wallet Experience**: RainbowKit + Wagmi configuration targeting Base wallets, with Farcaster/AuthKit experiments behind feature flags.

**Current Status**: 🚧 **BETA** – direct RPC reads and writes to Base Sepolia are live; webhook/indexer pipelines and multi-chain rollouts remain in development.

### 🌟 Latest Highlights

- **Direct RPC Contract Wrapper**: `frontend/lib/contract-wrapper.ts` standardises reads/writes using `viem`, removing bespoke provider wiring.
- **Realtime Subscriptions (Opt-In)**: `useRealtimeSubscriptions()` consumes a WebSocket RPC endpoint when `NEXT_PUBLIC_WS_PROVIDER` is provided, enabling cache invalidation without polling.
- **Socket.IO Utilities**: `/api/websockets` exposes a lightweight Socket.IO server for manual broadcasts and local testing.
- **Rate Limiting Middleware**: `lib/middleware/rate-limit.ts` offers in-memory throttling with an optional Redis upgrade path.

### 🛣️ Roadmap Snapshot

- **Webhook ingestion (Coinbase CDP)**: ❌ Not yet implemented – currently documented as future work.
- **The Graph / Covalent indexing**: ❌ Planned; all reads presently hit Base directly.
- **Redis-backed caching**: ⚠️ Optional stub exists; production wiring still pending.
- **Hedera / Polkadot / Cardano**: 🔄 Research & contract scaffolding underway; no live deployments or UI hooks today.

### 📋 Deployed Contract Addresses (Base Sepolia)

| Contract | Address | Purpose |
| -------- | ------- | ------- |
| **EventFactory** | `0xA97cB40548905B05A67fCD4765438aFBEA4030fc` | Deploys event-specific ticket contracts |
| **EventTicket** | `0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C` | ERC-721 ticket logic queried directly by the frontend |
| **POAPAttendance** | `0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33` | POAP minting (UI integration upcoming) |
| **IncentiveManager** | `0x1cfDae689817B954b72512bC82f23F35B997617D` | Incentive scaffolding for future releases |
| **Marketplace** | `0xD061393A54784da5Fea48CC845163aBc2B11537A` | Marketplace features under development |

### 🔄 Network Roadmap

| Network | Status | Notes |
| ------- | ------ | ----- |
| **Base** | ✅ Active | Frontend interacts directly with deployed contracts via `viem`.
| **Hedera** | 🧪 Experimental | Wallet SDK experiments live inside `frontend/wallet-app/`; main app integration pending.
| **Polkadot** | 📝 Planned | Contracts and integration guides tracked in `docs/base-docs/`.
| **Cardano** | 📝 Planned | Research-only, no code committed.

### 💡 Wallet Experimentation

- **RainbowKit + Wagmi (Base)**: Production path used throughout `frontend/app/`.
- **Coinbase OnchainKit**: Optional provider available in `app/providers.tsx` for Base-specific UX improvements.
- **Farcaster Auth Kit**: Loaded dynamically; currently opt-in and scoped to onboarding experiments.
- **Hedera Multisig (Prototype)**: Implemented in `frontend/wallet-app/`, awaiting integration with core flows.

## 🚀 Quick Start

### For Event Organizers
1. **[Deploy Contracts](./deployment/README.md)**: Set up smart contracts on Base
2. **[Create Events](./guides/README.md#for-event-organizers)**: Use the platform to create NFT ticketed events
3. **[Manage Attendees](./guides/README.md#event-management)**: Handle ticket sales and check-ins

### For Developers
1. **[Smart Contracts](./contracts/README.md)**: Understand the blockchain architecture
2. **[Event-Driven Integration](./architecture/event-driven/README.md)**: Learn about webhooks and WebSocket architecture
3. **[API Reference](./api/README.md)**: Build integrations and extensions

### For Attendees
1. **[Connect Wallet](./guides/README.md#getting-started)**: Set up MetaMask or Web3 wallet
2. **[Browse Events](./guides/README.md#browsing-events)**: Discover upcoming events
3. **[Purchase Tickets](./guides/README.md#buying-tickets)**: Buy NFT tickets with crypto

---

## 📋 Documentation Structure

### 🔐 [Wallet Package](./wallet-enhancement/README.md)
Documentation for the exploratory `@polymathuniversata/echain-wallet` package, covering connector prototypes, Farcaster experiments, and multisig concepts.

### 🏗️ [Smart Contracts](./contracts/README.md)
Architecture and deployment notes for the Base Sepolia contracts, including `EventFactory`, `EventTicket`, `POAPAttendance`, `IncentiveManager`, and the early `Marketplace` work.

### ⚡ [Event-Driven Architecture](./architecture/event-driven/README.md)
Focuses on the **planned** webhook + indexing pipeline, alongside the currently shipping WebSocket subscription utilities.

### 🔗 [Multi-Chain Integration](./integration/README.md)
Tracks research and design docs for extending beyond Base. Implementations here should be treated as draft guidance until merged into the main app.

### 🚀 [Deployment](./deployment/README.md)
Guides for local development, Base Sepolia deployments, and the configuration required to move towards mainnet.

### 📚 [User Guides](./guides/README.md)
Workflow walkthroughs for organisers and attendees based on the current Base deployment.

### 💡 [Code Examples](./examples/README.md)
Sample snippets demonstrating direct contract reads, metadata enrichment, and WebSocket hooks that are already in the repository.

### 🔒 [Security](./security/README.md)
Security considerations, Foundry test coverage notes, and future audit tracking.

### 📡 [API Reference](./api/README.md)
Details the currently available Next.js API routes (`/api/events`, `/api/contracts/*`, etc.) and the future-facing webhook/indexer endpoints.

### 🏛️ [Architecture](./architecture/README.md)
Explains the live direct-RPC architecture and the roadmap towards fully event-driven, multi-chain infrastructure.

---

## 🛠️ Technology Stack

### **Blockchain Layer**
- **Networks**: Base Sepolia (active), Hedera (prototype), Polkadot/Cardano (research only)
- **Smart Contracts**: Solidity ^0.8.19 with Foundry; additional runtimes planned but not yet integrated.
- **Tooling**: OnchainKit and Wagmi for Base; Hedera SDK experiments in `wallet-app/`.
- **Security**: OpenZeppelin library usage and Foundry-based testing.

### **Event-Driven Infrastructure**
- **Webhooks**: Planned Coinbase CDP integration (not yet deployed).
- **WebSockets**: Socket.IO endpoint for local broadcasting; chain-level subscriptions via optional WebSocket RPC (Alchemy/Chainstack, user-provided).
- **Data Indexing**: Currently direct RPC; The Graph and Covalent integrations tracked as future work.
- **Caching**: In-memory rate limiting shipped; Redis wiring remains optional to configure.
- **Background Processing**: No queue workers today; roadmap item.

### **Wallet Package**
- **@polymathuniversata/echain-wallet**: Experimental package for advanced connectors (Farcaster, Hedera multisig, etc.).
- **Core Frontend**: Uses Wagmi v2 + RainbowKit for Base wallet UX.
- **TypeScript**: Strict mode enforced throughout the app and wallet package.

### **Frontend Layer**
- **Framework**: Next.js 15.5.4 (App Router) with strict TypeScript.
- **Styling**: Tailwind CSS design system.
- **State Management**: TanStack Query orchestrating direct contract reads.
- **Realtime Hooks**: Socket.IO helpers + `useRealtimeSubscriptions()` when a WebSocket RPC is configured.
- **Wallet Integration**: RainbowKit + Wagmi primary flow; Coinbase OnchainKit optional.
- **Social Auth**: Farcaster Auth Kit loaded conditionally for experiments.

### **Infrastructure**
- **Hosting**: Vercel (Next.js) + optional ancillary services.
- **Storage**: IPFS via metadata URIs; Vercel Blob for asset storage (see `frontend/README.md`).
- **Database**: No persistent database today; all state lives on-chain or in metadata.
- **Caching**: Client-side caching via TanStack Query; Redis integration left to deployers.
- **Monitoring**: Sentry hooks available but require configuration.

### **Development Tools**
- **Testing**: Jest, React Testing Library, Foundry (Forge/Anvil)
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **CI/CD**: GitHub Actions with automated testing
- **Documentation**: Markdown with automated deployment

---

## 🌟 Key Features Deep Dive

### 🎟️ **NFT Ticketing System**
- **Cryptographic Security**: Blockchain-backed ownership verification
- **Transferable Assets**: Secondary market with creator royalties (5%)
- **Dynamic Pricing**: Time-based pricing decay and demand adjustment
- **Multi-Tier Support**: Standard, VIP, Early Bird, Student, Group pricing
- **Metadata Standards**: ERC-721 compliant with IPFS storage

### 🏆 **POAP (Proof of Attendance Protocol)**
- **Soulbound Tokens**: ERC-5484 implementation, non-transferable
- **Evolution System**: POAPs upgrade based on attendance history
- **Reputation Building**: Verifiable attendance records for networking
- **Event Verification**: QR code scanning with cryptographic signatures
- **Metadata Rich**: Event details, timestamps, and verification proofs

### 💰 **Gamified Incentive Engine**
- **Loyalty Points**: ERC-20 compatible reward tokens
- **Achievement System**: Unlockable badges and milestones
- **Referral Program**: Multi-level reward distribution
- **Prediction Markets**: Event success betting with payouts
- **Staking Rewards**: Long-term engagement incentives

### 🛡️ **Enterprise-Grade Security**
- **OpenZeppelin Audited**: Battle-tested contract libraries
- **Multi-Signature**: Administrative controls with timelocks
- **Circuit Breakers**: Emergency pause functionality
- **Automated Monitoring**: Real-time security event detection
- **Access Control**: Role-based permissions and restrictions
- **Farcaster Security**: Comprehensive social auth audit and monitoring

### 🌐 **Farcaster Integration**
- **Hybrid Authentication**: Optional social login with wallet fallback
- **Social Recovery**: Account recovery via Farcaster verification
- **Interactive Frames**: Event embeds in Farcaster posts with MiniKit
- **Cross-Platform Reach**: Available on Farcaster clients and Base apps
- **Gasless Transactions**: Coinbase Paymaster integration on Base
- **PWA Support**: Installable app experience on mobile devices

### ⚡ **Real-Time Experience**
- **WebSocket Streaming**: Direct WebSocket connections for live updates
- **Webhook Processing**: Event-driven updates without polling
- **Indexed Queries**: Fast data retrieval via The Graph and Covalent
- **Background Sync**: Efficient data synchronization
- **Push Notifications**: Browser notifications for important events
- **Optimistic Updates**: Immediate UI feedback with rollback on failure

---

### 📊 System Architecture (Current)

```
┌─────────────────────┐           ┌──────────────────────┐
│ Next.js Frontend    │  direct   │ Base Sepolia         │
│ (RainbowKit, viem)  │──────────▶│ Smart Contracts      │
└─────────────────────┘           └──────────────────────┘
         │                                    ▲
         │ optional WebSocket RPC             │
         ▼                                    │
┌─────────────────────┐           ┌───────────┴──────────┐
│ useRealtimeSubscriptions │◄──────│ WebSocket RPC Provider │
└─────────────────────┘           └──────────────────────┘
```

### Planned Event-Driven Flow (Roadmap)
1. Smart contract events → Coinbase CDP webhooks → serverless handler.
2. Handlers persist state (Redis) and broadcast over Socket.IO.
3. The Graph/Covalent provide indexed reads for the frontend.
4. Client invalidates caches and refreshes data automatically.

Until that pipeline lands, the app performs direct contract reads and relies on optional WebSocket RPC subscriptions for cache invalidation.

---

### 📈 Performance Targets (Current vs. Planned)

- **Direct RPC Reads**: Dependent on provider latency (Alchemy/Chainstack recommended).
- **WebSocket Cache Invalidation**: Latency defined by external RPC provider.
- **Webhook / Indexing Metrics**: Not yet applicable – tracked as acceptance criteria for future sprints.

---

### 🔄 Development Workflow (Reality Check)

```mermaid
graph TD
    A[Local Development] --> B[Contract Testing]
    B --> C[Direct RPC Integration]
    C --> D[Testnet Deployment]
    D --> E[Optional WS Subscriptions]
    E --> F[Webhook + Indexing (Roadmap)]
    F --> G[Multi-Network Expansion]
```

**Current Focus**: Delivering webhook/indexer support while hardening the Base-first experience.

---

## 📞 Support & Resources

### **Official Channels**
- **[GitHub Repository](https://github.com/Talent-Index/Echain)**: Source code and issue tracking
- **[Live Demo](https://echain-eight.vercel.app)**: Production application
- **[Base Explorer](https://sepolia.basescan.org/)**: Contract verification and transactions
- **[Polkadot Explorer](https://polkadot.js.org/apps/)**: Polkadot network interactions
- **[Cardano Explorer](https://cardanoscan.io/)**: Cardano blockchain explorer

### **Community**
- **[Discord Server](https://discord.gg/echain)**: Community support and discussions
- **[Twitter](https://twitter.com/echain_events)**: Updates and announcements
- **[Blog](https://blog.echain.events)**: Technical articles and tutorials

### **Developer Resources**
- **[Event-Driven Architecture](./architecture/event-driven/README.md)**: Webhook and WebSocket implementation
- **[API Documentation](./api/README.md)**: Complete integration guide
- **[Code Examples](./examples/README.md)**: Sample implementations
- **[Security Audits](./security/README.md)**: Audit reports and findings

---

## 🤝 Contributing

We welcome contributions from the community! See our [Contributing Guide](../CONTRIBUTING.md) for details.

### **Ways to Contribute**
- **🐛 Bug Reports**: Use GitHub Issues with detailed reproduction steps
- **💡 Feature Requests**: Open discussions for new platform features
- **📝 Documentation**: Improve guides, add examples, fix typos
- **🔧 Code Contributions**: Submit pull requests with tests and documentation
- **🎨 Design**: UI/UX improvements and accessibility enhancements

### **Development Setup**
```bash
git clone https://github.com/Talent-Index/Echain.git
cd Echain
npm install
cd blockchain && npm install
cd ../frontend && npm install
npm run dev
```

---

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/Talent-Index/Echain)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?style=flat-square&logo=discord)](https://discord.gg/echain)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=flat-square&logo=twitter)](https://twitter.com/echain_events)

**🚀 Production Ready - Multi-Chain Web3 Event Platform**

[🏗️ Smart Contracts](./contracts/README.md) • [⚡ Event-Driven Architecture](./architecture/event-driven/README.md) • [🚀 Production Deployment](./deployment/README.md) • [📚 User Guides](./guides/README.md)

*Built with ❤️ for the Web3 community across multiple blockchains*

*Last Updated: October 21, 2025*

</div>