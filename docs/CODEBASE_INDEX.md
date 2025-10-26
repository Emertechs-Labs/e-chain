# Echain Codebase Documentation Index (Synchronized)

**Last Updated**: October 26, 2025  
**Codebase Version**: v1.0.0 (Beta Release)

## 📁 Repository Structure

```
Echain/
├── frontend/              # Next.js 15 App Router application
│   ├── app/              # App routes and pages
│   │   ├── events/       # Event browsing and creation
│   │   ├── marketplace/  # NFT ticket secondary market
│   │   ├── my-tickets/   # User ticket management
│   │   ├── organizer/    # Event organizer dashboard
│   │   ├── poaps/        # POAP attendance certificates
│   │   └── api/          # API routes
│   ├── components/       # Reusable React components
│   ├── lib/             # Core utilities and integrations
│   │   ├── contracts.ts              # Contract addresses & ABIs
│   │   ├── wagmi.ts                  # Wallet configuration
│   │   ├── contract-wrapper.ts       # Contract interaction layer
│   │   ├── metadata.ts               # IPFS metadata handling
│   │   ├── base-rpc-manager.ts       # RPC provider management
│   │   ├── base-state-sync.ts        # Blockchain state sync
│   │   ├── performance-monitor.ts    # Performance tracking
│   │   └── smart-wallet/            # Coinbase Smart Wallet
│   └── hooks/           # Custom React hooks
│       ├── useEvents.ts             # Event data fetching
│       ├── useTickets.ts            # Ticket operations
│       └── useContract.ts           # Generic contract hook
├── blockchain/           # Foundry smart contract workspace
│   ├── contracts/       # Solidity smart contracts
│   │   ├── core/        # Core protocol contracts
│   │   │   ├── EventFactory.sol     # Event creation factory
│   │   │   ├── EventTicket.sol      # ERC-721 ticket NFT
│   │   │   └── Marketplace.sol      # Secondary marketplace
│   │   ├── modules/     # Protocol modules
│   │   │   ├── IncentiveManager.sol # Rewards & loyalty
│   │   │   └── POAPAttendance.sol   # Attendance certificates
│   │   ├── interfaces/  # Contract interfaces
│   │   └── libraries/   # Shared utilities
│   ├── scripts/         # Deployment scripts
│   ├── test/           # Foundry test suite
│   └── deployments/    # Deployment artifacts
├── docs/               # Comprehensive documentation
│   ├── integration/    # Integration guides
│   ├── deployment/     # Deployment documentation
│   ├── audit/          # Security audits
│   ├── base-docs/      # Base network documentation
│   ├── frontend/       # Frontend architecture
│   ├── guides/         # User guides
│   ├── monitoring/     # Monitoring & alerting
│   └── status/         # Project status & PMF
├── packages/           # Shared packages
│   └── wallet/         # Wallet package
├── tools/             # Development tools
└── scripts/           # Build and automation scripts
```

## 🔗 Contract Deployments (Base Sepolia)

**Network**: Base Sepolia Testnet  
**Chain ID**: 84532  
**RPC URL**: https://sepolia.base.org  
**Explorer**: https://sepolia.basescan.org

### Verified Contracts

| Contract | Address | Verification Link |
|----------|---------|------------------|
| **EventFactory** | `0xA97cB40548905B05A67fCD4765438aFBEA4030fc` | [View](https://sepolia.basescan.org/address/0xA97cB40548905B05A67fCD4765438aFBEA4030fc#code) |
| **EventTicket** | `0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C` | [View](https://sepolia.basescan.org/address/0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C#code) |
| **POAPAttendance** | `0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33` | [View](https://sepolia.basescan.org/address/0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33#code) |
| **IncentiveManager** | `0x1cfDae689817B954b72512bC82f23F35B997617D` | [View](https://sepolia.basescan.org/address/0x1cfDae689817B954b72512bC82f23F35B997617D#code) |
| **Marketplace** | `0xD061393A54784da5Fea48CC845163aBc2B11537A` | [View](https://sepolia.basescan.org/address/0xD061393A54784da5Fea48CC845163aBc2B11537A#code) |

**Deployer Address**: `0x5474bA789F5CbD31aea2BcA1939989746242680D`

## 🛠️ Tech Stack

### Frontend (Next.js 15)
- **Framework**: Next.js 15.5.4 with App Router & Turbopack
- **Language**: TypeScript 5.2
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: TanStack Query 5.83
- **Web3 Integration**:
  - Wagmi 2.12.0
  - Viem 2.17.0
  - RainbowKit 2.1.0
  - OnchainKit 1.1.1 (Coinbase)
  - Ethers 6.15.0
- **Storage**:
  - Vercel Blob 2.0.0
  - Vercel Edge Config 1.4.0
  - Pinata Web3 0.5.4 (IPFS)
- **UI Components**:
  - Radix UI
  - Framer Motion 12.23.22
  - Lucide React 0.462.0
  - Sonner (toasts)
- **Analytics**: Vercel Analytics 1.5.0
- **Maps**: Google Maps JS API Loader 2.0.1

### Blockchain (Foundry)
- **Framework**: Foundry (Forge, Cast, Anvil)
- **Language**: Solidity ^0.8.19
- **Libraries**:
  - OpenZeppelin Contracts 5.4.0
  - OpenZeppelin Upgradeable 5.4.0
- **Development**:
  - Solhint 5.0.4
  - Prettier Plugin Solidity 1.4.2
  - Husky 9.1.7 (Git hooks)

### Root Dependencies
- **CDP SDK**: @coinbase/cdp-sdk 1.38.4
- **Polkadot API**: polkadot-api 1.19.2
- **QA Agent**: echain-qa-agent 2.1.5

## 📋 Key Features Implementation

### 1. Event Management
- **Files**: `frontend/app/events/`, `blockchain/contracts/core/EventFactory.sol`
- **Features**:
  - Create events with NFT tickets
  - Event browsing and discovery
  - Organizer dashboard
  - Real-time event updates via WebSocket

### 2. NFT Ticketing
- **Files**: `frontend/app/my-tickets/`, `blockchain/contracts/core/EventTicket.sol`
- **Features**:
  - ERC-721 compliant tickets
  - QR code generation for check-in
  - Transfer controls
  - Metadata on IPFS

### 3. Marketplace
- **Files**: `frontend/app/marketplace/`, `blockchain/contracts/core/Marketplace.sol`
- **Features**:
  - Secondary ticket trading
  - 5% creator royalties
  - Listing management
  - Price discovery

### 4. POAP System
- **Files**: `frontend/app/poaps/`, `blockchain/contracts/modules/POAPAttendance.sol`
- **Features**:
  - Soulbound attendance certificates
  - QR code claim verification
  - Evolution based on attendance history
  - Reputation building

### 5. Rewards & Incentives
- **Files**: `blockchain/contracts/modules/IncentiveManager.sol`
- **Features**:
  - Loyalty points system
  - Achievement unlocks
  - Referral rewards
  - Prediction markets

### 6. Wallet Integration
- **Files**: `frontend/lib/wagmi.ts`, `frontend/lib/smart-wallet/`
- **Features**:
  - RainbowKit connection
  - Coinbase Smart Wallet
  - Multi-wallet support
  - Session management

### 7. Performance Optimization
- **Files**: `frontend/lib/performance-monitor.ts`, `frontend/app/hooks/useEvents.ts`
- **Features**:
  - Advanced caching (10-min TTL)
  - Exponential backoff retry
  - Request batching
  - Performance tracking
  - Circuit breaker pattern

### 8. RPC Management
- **Files**: `frontend/lib/base-rpc-manager.ts`
- **Features**:
  - Multi-provider support (Chainstack, Spectrum, Coinbase)
  - Automatic failover
  - Health checks
  - Latency monitoring

## 🔐 Security Features

### Smart Contracts
- ✅ OpenZeppelin security patterns
- ✅ Reentrancy guards
- ✅ Access control (Ownable, roles)
- ✅ Pausable functionality
- ✅ UUPS upgradeable proxies
- ✅ Timelock governance (24-hour delay)
- ✅ Verified on BaseScan

### Frontend
- ✅ Environment variable validation
- ✅ Input sanitization
- ✅ Transaction simulation before execution
- ✅ Error boundaries
- ✅ Rate limiting
- ✅ Secure API routes

## 📊 Performance Benchmarks

### RPC Latency (P50/P95)
- **Chainstack**: TBD (see `docs/integration/NODE_PROVIDER_BENCHMARKS.md`)
- **Spectrum Nodes**: TBD
- **Coinbase Base Node**: TBD

### Transaction Times
- **Event Creation**: ~3-5 seconds
- **Ticket Purchase**: ~2-3 seconds
- **POAP Claim**: ~2-3 seconds

### Caching
- **Event Data**: 10-minute TTL
- **Metrics**: 5-minute TTL
- **Max Retries**: 3 with exponential backoff

## 🧪 Testing Strategy

### Smart Contracts
- **Framework**: Foundry (Forge)
- **Coverage**: 85%+
- **Test Files**: `blockchain/test/`
- **Commands**:
  - `npm run test` - Run all tests
  - `npm run test:gas` - Gas reports
  - `npm run test:fork` - Fork tests

### Frontend
- **Framework**: Jest + React Testing Library
- **Test Files**: `frontend/tests/`
- **Coverage Target**: 80%+

### QA Automation
- **Tool**: echain-qa-agent 2.1.5
- **Commands**:
  - `npm run qa` - Full QA suite
  - `npm run qa:lint` - Linting only
  - `npm run qa:test` - Tests only
  - `npm run qa:security` - Security checks

## 📖 Documentation References

## 📚 **Documentation Index**

### **NEW: Complete Project Deliverables**
- **[Complete Tasks Summary](./COMPLETE_TASKS_SUMMARY.md)** - ALL 6 priority tasks completed ✅
- **[Beta Readiness Summary](./BETA_READINESS_SUMMARY.md)** - 99% ready for beta launch
- **[Beta Release Checklist](./BETA_RELEASE_CHECKLIST.md)** - Comprehensive launch checklist

### **Testing & QA**
- **[E2E Testing Guide](./testing/E2E_TESTING_GUIDE.md)** - 31 Playwright tests
- **[Test Helpers](../frontend/tests/fixtures/test-helpers.ts)** - Reusable test utilities

### **API Documentation**
- **[Complete API Reference](./api/API_DOCUMENTATION.md)** - All endpoints documented
- **[API Examples](./api/API_DOCUMENTATION.md#requestresponse-examples)** - Code samples

### **User Guides**
- **[Beta User Onboarding](./guides/BETA_USER_ONBOARDING.md)** - User getting started guide
- **[Beta User Management](./guides/BETA_USER_MANAGEMENT.md)** - Admin management guide

### **Security & Operations**
- **[Incident Response Plan](./security/INCIDENT_RESPONSE_PLAN.md)** - Complete security procedures
- **[Security Procedures](./security/SECURITY_PROCEDURES.md)** - Best practices
- **[Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)** - Automated deployment

### **Monitoring & Alerting**
- **[Monitoring Setup](./monitoring/README.md)** - Sentry, performance, health checks
- **[Dashboard Configuration](./monitoring/DASHBOARD_CONFIG.md)** - Grafana/DataDog
- **[Monitoring Completion Report](./monitoring/COMPLETION_REPORT.md)** - Setup summary

### **Architecture & Development**
- **[Frontend Architecture](./frontend/ARCHITECTURE.md)** - Technical architecture
- **[Codebase Index](./CODEBASE_INDEX.md)** - Complete codebase map
- **[Agile Sprint Plan](./development/AGILE_SPRINT_PLAN_BETA.md)** - Sprint planning

### **Analysis & Reports**
- **[Static vs Dynamic Data Report](./analysis/STATIC_VS_DYNAMIC_DATA_REPORT.md)** - NEW ✨ Comprehensive analysis
- **[No Static Data Implementation](./status/NO_STATIC_DATA_IMPLEMENTATION.md)** - Previous cleanup summary

### External Links
- **Chainstack**: https://chainstack.com/
- **Spectrum Nodes**: https://spectrumnodes.com/?sPartner=gsd&gad_campaignid=22842687298
- **Coinbase Base Node**: https://www.coinbase.com/developer-platform/products/base-node
- **Base Docs**: https://docs.base.org/base-chain/quickstart/connecting-to-base
- **Mini Apps**: https://docs.base.org/mini-apps/quickstart/migrate-existing-apps
- **OnchainKit**: https://docs.base.org/onchainkit/latest/getting-started/overview
- **BaseScan**: https://basescan.org
- **Base Sepolia**: https://sepolia.basescan.org

## 🚀 Deployment Status

### Current Environment
- **Frontend**: Deployed on Vercel at https://echain-eight.vercel.app
- **Blockchain**: Base Sepolia Testnet
- **Status**: Beta Testing

### Next Steps
1. **Sprint 1**: Mainnet readiness (node providers, deployment pipeline)
2. **Sprint 2**: Mini apps distribution (Farcaster integration)
3. **Sprint 3**: Upgrades and monitoring (UUPS, SLOs)

## 🔄 Update Frequency

This index should be updated:
- ✅ After contract deployments
- ✅ After major feature releases
- ✅ After dependency updates
- ✅ Weekly during active development
- ✅ Before beta/mainnet launches

## 📞 Support

- **GitHub**: https://github.com/Talent-Index/Echain
- **Docs**: See `docs/README.md` for comprehensive guides
- **Issues**: Report via GitHub Issues
- **Team Docs**: See `docs/team/` for role-specific documentation
