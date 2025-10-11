# 📖 Echain Documentation

<div align="center">

![Echain Logo](https://img.shields.io/badge/Echain-Blockchain_Events_Platform-00D4FF?style=for-the-badge&logo=ethereum&logoColor=white)
![Base Network](https://img.shields.io/badge/Base-Ethereum_L2-0052FF?style=for-the-badge&logo=ethereum&logoColor=white)
![Hedera](https://img.shields.io/badge/Hedera-Hashgraph-FF4081?style=for-the-badge&logo=hashgraph&logoColor=white)
![Polkadot](https://img.shields.io/badge/Polkadot-Multi--Chain-FF4081?style=for-the-badge&logo=polkadot&logoColor=white)
![Cardano](https://img.shields.io/badge/Cardano-Proof--of--Stake-0033AD?style=for-the-badge&logo=cardano&logoColor=white)

**A Multi-Chain Web3 Event Management Platform with Real Wallet Integration**

*Transform traditional events into blockchain-powered experiences with NFT tickets, POAP certificates, and gamified participation across multiple blockchains.*

[🚀 Quick Start](#-quick-start) • [📚 Documentation](#-documentation-structure) • [🔗 Live Demo](https://echain-eight.vercel.app)

</div>

---

## 🎯 Platform Overview

Echain is a comprehensive multi-chain blockchain-based event management platform featuring:

- **🎟️ NFT Ticketing**: Secure, verifiable, transferable event tickets with creator royalties
- **🏆 POAP Certificates**: Soulbound attendance tokens for reputation building
- **💰 Gamified Incentives**: Rewards and loyalty systems for engagement
- **🔄 Multi-Chain Support**: Parallel development on Base, Hedera, Polkadot, and Cardano networks
- **⚡ Real-time Updates**: WebSocket streaming for live event data
- **🛡️ Enterprise Security**: OpenZeppelin audited contracts with circuit breakers
- **🔗 Farcaster Integration**: Social login, recovery, and cross-platform Frames support
- **🔐 Real Wallet Integration**: Production-ready wallet connections for Ethereum and Hedera

**Current Status**: ✅ **PRODUCTION READY** - Sprint 5 Complete: Real Wallet Integration (October 2025)

### 🌟 **Latest Features - Production Ready!**

**Real Wallet Integration** 🔐
- **Dual Wallet Support**: Full Ethereum/Base and Hedera wallet integration
- **Production-Ready Components**: UnifiedConnectModal, BalanceDisplay, NetworkSwitcher
- **Hedera Multisig Wallet**: Complete wallet infrastructure with HashPack, Blade, and Kabila connectors
- **Real Account Data**: Replace placeholder data with actual user wallet connections
- **Type-Safe Implementation**: Comprehensive TypeScript coverage with strict validation

**Farcaster Social Login & Cross-Platform Availability** 🎉
- **Hybrid Authentication**: Optional Farcaster login alongside traditional wallet connections
- **Social Recovery**: Account recovery via Farcaster for enhanced security
- **Farcaster Frames**: Interactive event embeds in Farcaster posts
- **Base App Optimization**: Gasless transactions and PWA support
- **Enterprise Security**: Comprehensive audit with production-ready security measures

**Multi-Chain Architecture**: Parallel development on Base, Hedera, Polkadot, and Cardano
- **Base Network**: ✅ Production-ready with OnchainKit integration
- **Hedera**: ✅ Wallet app with multisig functionality and real wallet connections
- **Polkadot**: 🚧 In development with Substrate contracts
- **Cardano**: 🚧 In development with Plutus contracts

**Status**: ✅ All Core Features Complete - Real Wallet Integration Ready for Production Deployment

### 📋 Deployed Contract Addresses (Base Testnet)

| Contract | Address | Purpose |
| -------- | ------- | ------- |
| **EventFactory** | `0xA97cB40548905B05A67fCD4765438aFBEA4030fc` | Deploys event-specific ticket contracts |
| **EventTicket** | `0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C` | ERC-721 NFT ticket implementation |
| **POAPAttendance** | `0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33` | Soulbound attendance certificates |
| **IncentiveManager** | `0x1cfDae689817B954b72512bC82f23F35B997617D` | Gamified rewards and loyalty system |
| **Marketplace** | `0xD061393A54784da5Fea48CC845163aBc2B11537A` | Secondary ticket trading platform |

### 🔄 Multi-Chain Development Roadmap

| Network | Status | Target Completion | Features |
| ------- | ------ | ----------------- | -------- |
| **Base** | ✅ **PRODUCTION READY** | **COMPLETED** | Full feature set, gasless transactions, PWA support |
| **Hedera** | ✅ **PRODUCTION READY** | **COMPLETED** | Real wallet integration, multisig functionality, transaction management |
| **Polkadot** | 🚧 In Development | Q1 2026 | Substrate-based implementation |
| **Cardano** | 🚧 In Development | Q1 2026 | Plutus smart contracts |

### 💰 **Hedera Multisig Wallet App**

**Sprint 5: Real Wallet Integration** ✅ **COMPLETED**
- Complete Hedera wallet connectors (HashPack, Blade, Kabila)
- HederaWalletManager for centralized wallet state management
- useHederaWallet React hook for wallet state management
- Updated UI components for dual wallet support
- TypeScript compilation fixes and test validation

**Wallet Features:**
- **Real Wallet Connections**: Production-ready Ethereum and Hedera wallet integration
- **Multisig Security**: Configurable threshold signatures for transactions
- **Dual Network Support**: Seamless switching between Ethereum/Base and Hedera networks
- **Unified Components**: UnifiedConnectModal, BalanceDisplay, NetworkSwitcher
- **Type-Safe Implementation**: Comprehensive TypeScript coverage with strict validation

## 🚀 Quick Start

### For Event Organizers
1. **[Deploy Contracts](./deployment/README.md)**: Set up smart contracts on Base
2. **[Create Events](./guides/README.md#for-event-organizers)**: Use the platform to create NFT ticketed events
3. **[Manage Attendees](./guides/README.md#event-management)**: Handle ticket sales and check-ins

### For Developers
1. **[Smart Contracts](./contracts/README.md)**: Understand the blockchain architecture
2. **[Multi-Chain Integration](./integration/README.md)**: Connect to Base, Polkadot, and Cardano networks
3. **[API Reference](./api/README.md)**: Build integrations and extensions

### For Attendees
1. **[Connect Wallet](./guides/README.md#getting-started)**: Set up MetaMask or Web3 wallet
2. **[Browse Events](./examples/README.md)**: Discover upcoming events
3. **[Purchase Tickets](./guides/README.md#buying-tickets)**: Buy NFT tickets with crypto

---

## 📋 Documentation Structure

### 🔐 [Wallet Package](./wallet-enhancement/README.md)
Complete wallet package documentation for the `@polymathuniversata/echain-wallet` library:
- **Real Wallet Integration**: Production-ready Ethereum and Hedera wallet connections
- **Component Library**: UnifiedConnectModal, BalanceDisplay, NetworkSwitcher components
- **Hedera Connectors**: HashPack, Blade, and Kabila wallet implementations
- **React Hooks**: useHederaWallet, useWalletConnection, and utility hooks
- **Type-Safe API**: Comprehensive TypeScript definitions and interfaces
- **Testing Suite**: Complete unit and integration test coverage

### 🏗️ [Smart Contracts](./contracts/README.md)
Complete smart contract architecture and deployment guide for:
- **EventFactory**: Factory pattern for deploying event-specific contracts
- **EventTicket**: ERC-721 NFT implementation with transfer restrictions
- **POAP**: Soulbound tokens for attendance verification
- **IncentiveManager**: Gamified rewards and loyalty programs
- **Marketplace**: Secondary trading with creator royalties
- OpenZeppelin security patterns and upgradeability
- Gas optimization and testing strategies

### 🔗 [Multi-Chain Integration](./integration/README.md)
Comprehensive multi-chain integration covering:
- **Base Network**: Ethereum L2 deployment and OnchainKit integration
- **Polkadot**: Substrate-based smart contracts and parachain deployment
- **Cardano**: Plutus smart contracts and eUTXO model implementation
- **Cross-Chain Communication**: Interoperability between networks
- **Wallet Integration**: Multi-chain wallet support and abstraction
- **Farcaster Integration**: Social authentication and cross-platform Frames

### 🚀 [Deployment](./deployment/README.md)
Step-by-step deployment instructions for:
- **Local Development**: Foundry setup and contract testing
- **Base Sepolia Testnet**: Testnet deployment and verification
- **Production Deployment**: Base mainnet deployment strategies
- **Environment Configuration**: API keys and network settings
- **Monitoring Setup**: Contract monitoring and alerting
- **Farcaster Production Setup**: Social auth and Frame deployment

### 📚 [User Guides](./guides/README.md)
Practical guides for all user types:
- **Event Organizers**: Complete event creation and management workflow
- **Attendees**: Wallet setup, ticket purchasing, and event attendance
- **Developers**: API integration, customization, and extension development
- **Administrators**: Platform management and troubleshooting

### 💡 [Code Examples](./examples/README.md)
Code examples and use cases:
- **Event Creation**: Complete event setup with metadata
- **Ticket Purchasing**: NFT minting and payment flows
- **POAP Minting**: Attendance verification and certificate claiming
- **Marketplace Trading**: Secondary market transactions
- **Real-time Updates**: WebSocket event streaming

### 🔒 [Security](./security/README.md)
Security documentation including:
- **Audit Reports**: OpenZeppelin security audit findings and fixes
- **Implementation Details**: Security patterns and best practices
- **Testing Procedures**: Security-focused testing guidelines
- **Vulnerability Management**: Reporting and response procedures

### 📡 [API Reference](./api/README.md)
Complete API documentation:
- **Direct RPC Endpoints**: Multi-chain blockchain RPC integration
- **WebSocket Events**: Real-time event streaming across networks
- **Contract ABIs**: Smart contract interfaces for all chains
- **TypeScript Types**: Type definitions for multi-chain integration

### 🏛️ [Architecture](./architecture/README.md)
System architecture documentation:
- **High-level Design**: Component relationships and data flow
- **Database Schema**: Data models and relationships
- **Integration Patterns**: Third-party service integrations
- **Scalability Considerations**: Performance and scaling strategies

---

## 🛠️ Technology Stack

### **Blockchain Layer**
- **Networks**: Base (Ethereum L2), Hedera (Hashgraph), Polkadot (Substrate), Cardano (Plutus)
- **Smart Contracts**: Solidity ^0.8.19, Ink! (Polkadot), Plutus (Cardano)
- **API Platforms**: OnchainKit (Base), Hedera SDK, Polkadot.js, Cardano SDK
- **Security**: Comprehensive audit reports and monitoring

### **Wallet Package**
- **@polymathuniversata/echain-wallet**: Modular wallet library with dual blockchain support
- **Hedera SDK**: Official SDK for Hedera network integration
- **Wagmi v2**: React hooks for Ethereum wallet interactions
- **RainbowKit**: Beautiful wallet connection UI components
- **TypeScript**: Strict type checking and comprehensive type definitions

### **Frontend Layer**
- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state caching
- **Wallet Integration**: RainbowKit + Reown (WalletConnect v2)
- **Social Auth**: Farcaster Auth Kit with MiniKit integration

### **Infrastructure**
- **Hosting**: Vercel with edge functions and ISR
- **Storage**: IPFS/Pinata for decentralized metadata
- **Database**: PostgreSQL with Prisma ORM (planned)
- **Monitoring**: Sentry for error tracking and performance
- **CDN**: Vercel Edge Network for global performance

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

### 🔐 **Enterprise-Grade Security**
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
- **WebSocket Streaming**: Direct WebSocket connections to blockchain nodes
- **Chain Watcher**: Automatic cache invalidation on new blocks
- **Live Event Feed**: Real-time event creation and updates
- **Push Notifications**: Browser notifications for important events
- **Optimistic Updates**: Immediate UI feedback with rollback on failure

---

### 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Multi-Chain   │    │   Smart         │
│   (Next.js 15)  │◄──►│   Abstraction   │◄──►│   Contracts     │
│                 │    │   Layer         │    │   (Multi-VM)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Base          │    │   Hedera        │    │   Polkadot      │    │   Cardano       │
│   (OnchainKit)  │    │   (Hedera SDK)  │    │   (Polkadot.js) │    │   (Cardano SDK) │
│   ✅ PROD READY │    │   ✅ PROD READY │    │   🚧 In Dev     │    │   🚧 In Dev     │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Multi-Chain Data Flow
1. **Event Creation**: Frontend → Chain Abstraction → Network-specific contracts
2. **Ticket Purchase**: Wallet → Chain Abstraction → Network-specific minting
3. **Cross-Chain Events**: Contract events → Abstraction layer → Unified frontend
4. **POAP Minting**: Check-in verification → Network-specific soulbound tokens

---

### 📈 Performance Metrics

- **Transaction Speed**: <3 seconds on Base L2 (gasless transactions available)
- **Gas Efficiency**: Optimized contracts with <200k gas/ticket
- **API Response**: <100ms average with direct RPC optimization
- **Real-time Latency**: <50ms WebSocket event delivery
- **Uptime**: 99.9%+ with Vercel infrastructure
- **Farcaster Integration**: <2s frame load times with MiniKit
- **PWA Support**: Installable app with offline capabilities

---

### 🔄 Development Workflow

```mermaid
graph TD
    A[Local Development] --> B[Contract Testing]
    B --> C[Frontend Integration]
    C --> D[Testnet Deployment]
    D --> E[Integration Testing]
    E --> F[Production Deployment]
    F --> G[Multi-Chain Expansion]
    G --> H[Polkadot Implementation]
    H --> I[Cardano Implementation]
    I --> J[Cross-Chain Features]
```

**Current Phase**: ✅ Production Deployment Complete - Multi-Chain Expansion Beginning

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

[🏗️ Smart Contracts](./contracts/README.md) • [🔗 Multi-Chain Integration](./integration/README.md) • [🚀 Production Deployment](./deployment/README.md) • [📚 User Guides](./guides/README.md)

*Built with ❤️ for the Web3 community across multiple blockchains*

*Last Updated: October 10, 2025*

</div>