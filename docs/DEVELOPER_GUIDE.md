# 🛠️ Echain Developer Guide

**Base-first Web3 Event Management Platform**  
*Direct RPC Architecture • Wallet-Driven UX • Roadmap-Aware*

---

## 📋 Table of Contents

- [🏗️ Project Overview](#-project-overview)
- [📁 Repository Structure](#-repository-structure)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Development Setup](#️-development-setup)
- [🏭 Building & Testing](#-building--testing)
- [🔧 Wallet SDK Development](#-wallet-sdk-development)
- [⚡ Event-Driven Architecture](#-event-driven-architecture)
- [🚢 Deployment](#-deployment)
- [🔍 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)

---

## 🏗️ Project Overview

Echain currently operates with a Base-focused deployment while exploring broader multi-chain capabilities:

- **🎟️ NFT Ticketing**: Live event creation and sales powered by `EventFactory`/`EventTicket` contracts on Base Sepolia.
- **🏆 POAP Certificates**: `POAPAttendance` contract deployed; frontend integration tracked for a future sprint.
- **💰 Incentives**: `IncentiveManager` scaffolding available for experimentation.
- **⚡ Data Access**: Frontend communicates with contracts via direct RPC using `viem`; The Graph/Covalent integrations remain roadmap items.
- **🔐 Wallet UX**: RainbowKit + Wagmi provide Ethereum/Base wallet support; Hedera connectors live in `frontend/wallet-app/` as prototypes.
- **🔗 Farcaster Experiments**: Auth Kit is dynamically loaded and opt-in.

**Current Status**: 🚧 **BETA** – Base Sepolia smart contracts + direct RPC frontend are active; Coinbase webhooks, Redis caching, and multi-chain rollouts are in progress.

### Technology Stack

**Frontend:**
- Next.js 15.5.4 with App Router
- TypeScript with strict type checking
- Tailwind CSS for styling
- TanStack Query for state management

**Blockchain:**
- Solidity ^0.8.19 smart contracts
- Foundry for testing and deployment
- Base Sepolia network (active)
- Hedera connectors and multisig wallet (prototype status)
- **Core contracts**: `EventFactory`, `EventTicket`, (Marketplace prototype)
- **Modules**: `POAPAttendance`, `IncentiveManager`
- OpenZeppelin security patterns

**Event-Driven Infrastructure:**
- Socket.IO utilities for client broadcasting (`/api/websockets`)
- `useRealtimeSubscriptions()` leveraging optional WebSocket RPC providers
- Coinbase CDP webhooks, Redis caching, and indexing integrations are planned but not yet implemented

**Wallet Integration:**
- Wagmi v2 and RainbowKit (primary Base flow)
- Coinbase OnchainKit optional provider
- Experimental Hedera SDK multisig flows in `frontend/wallet-app/`
- `@polymathuniversata/echain-wallet` prototype package
- Strict TypeScript coverage

---

## 📁 Repository Structure

```
Echain/
├── blockchain/           # Smart contracts (Foundry)
│   ├── contracts/        # Solidity source files
│   │   ├── core/         # Main contracts (EventFactory, EventTicket, Marketplace, MultisigWallet)
│   │   ├── interfaces/   # Contract interfaces
│   │   ├── libraries/    # Shared libraries
│   │   └── modules/      # Contract modules (POAPAttendance, IncentiveManager)
│   ├── test/            # Contract tests
│   ├── script/          # Deployment scripts
│   ├── deployments/     # Deployment artifacts
│   └── foundry.toml     # Foundry configuration
├── frontend/            # Next.js application
│   ├── app/             # App router pages (events, marketplace, my-tickets, etc.)
│   │   ├── api/         # API routes for blockchain interactions
│   │   ├── events/      # Event browsing and management
│   │   ├── marketplace/ # Secondary ticket trading
│   │   ├── my-tickets/  # User ticket management
│   │   ├── organizer/   # Event organizer dashboard
│   │   └── poaps/       # POAP certificate management
│   ├── components/      # React components
│   │   ├── ui/          # Reusable UI components (buttons, cards, etc.)
│   │   ├── organizer/   # Organizer-specific components
│   │   └── rewards/     # Rewards and gamification components
│   ├── lib/             # Utilities, middleware, and contract wrappers
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   └── wallet-app/      # Wallet integration components
├── packages/
│   └── wallet/          # Wallet SDK package (@echain/wallet)
│       ├── src/         # Source code
│       ├── dist/        # Built ESM output
│       └── tsup.config.ts # Build configuration
├── docs/                # Documentation
├── scripts/             # Utility scripts
└── package.json         # Workspace configuration
```

### Key Directories Explained

- **`blockchain/`**: Contains all smart contract code, tests, and deployment scripts using Foundry
- **`frontend/`**: Next.js 15 application with App Router, containing the main user interface
- **`packages/wallet/`**: ESM-only wallet SDK package used by the frontend for blockchain interactions
- **`docs/`**: Comprehensive documentation including guides, API references, and architecture docs

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **MetaMask/Wallet**: For blockchain interactions

### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/Talent-Index/Echain.git
cd Echain

# Install all workspace dependencies
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp frontend/.env.example frontend/.env.local

# Edit with your configuration
# Required: RPC URLs, wallet private keys, API keys
```

### 3. Start Development Servers
```bash
# Terminal 1: Frontend development server
cd frontend
npm run dev
# Server runs on http://localhost:3000

# Terminal 2: Blockchain development (optional)
cd blockchain
npm run dev
```

### 4. Run Tests
```bash
# Run all tests
npm test

# Or run specific test suites
cd blockchain && forge test
cd frontend && npm test
```

### 5. Access the Application
Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## ⚙️ Development Setup

### Environment Configuration

Create `frontend/.env.local` with the following variables:

```bash
# Blockchain RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api

# Wallet Configuration
PRIVATE_KEY=your_private_key_for_deployment

# External Services
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
REDIS_URL=redis://localhost:6379

# Application Settings
NEXT_PUBLIC_ENABLE_LOGGING=true
ADMIN_ADDRESSES=0x123...,0x456...
```

### Development Scripts

```bash
# Full development workflow
npm run dev

# Quality assurance checks
npm run qa              # Run all QA checks
npm run qa:lint         # Lint only
npm run qa:test         # Test only
npm run qa:build        # Build checks only

# Individual component development
npm run dev:frontend    # Frontend only
npm run dev:blockchain  # Blockchain only

# Building
npm run build          # Production build
npm run build:all      # Build all components
```

### Code Quality Tools

The project uses several tools to maintain code quality:

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Pre-commit hooks
- **lint-staged**: Selective linting on staged files

---

## 🏭 Building & Testing

### Smart Contract Development

```bash
cd blockchain

# Install dependencies
npm install

# Run tests
forge test

# Run tests with gas reporting
forge test --gas-report

# Run specific test
forge test --match-path test/EventFactory.t.sol

# Build contracts
forge build

# Deploy to testnet
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast --verify
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Wallet Package Development

```bash
cd packages/wallet

# Install dependencies
npm install

# Build package
npm run build

# Run tests
npm test

# Development mode
npm run dev
```

### Quality Assurance

The project includes comprehensive QA automation:

```bash
# Run full QA suite
npm run qa

# Individual QA checks
npm run qa:lint     # Linting and formatting
npm run qa:test     # All test suites
npm run qa:build    # Build verification
npm run qa:security # Security scanning
npm run qa:docs     # Documentation validation
```

---

## 🔧 Wallet SDK Development

The wallet package (`@echain/wallet`) is a critical component that provides type-safe blockchain interactions.

### Package Structure

```
packages/wallet/
├── src/
│   ├── index.ts          # Main exports
│   ├── connectors/       # Wallet connectors
│   ├── hooks/           # React hooks
│   └── types/           # TypeScript definitions
├── dist/                # Built ESM output
├── package.json
└── tsup.config.ts       # Build configuration
```

### ESM-Only Requirements

The wallet SDK must be ESM-only and browser-safe:

**package.json Configuration:**
```json
{
  "name": "@echain/wallet",
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./connectors": "./dist/connectors/index.js"
  }
}
```

**tsup.config.ts Configuration:**
```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'browser',
  bundle: true,
  external: [
    'react',
    'react-dom',
    'wagmi',
    'viem',
    '@hashgraph/sdk',
    // ... other peer dependencies
  ]
});
```

### Key Components

- **Wallet Connectors**: Support for MetaMask, WalletConnect, Coinbase Wallet, and Hedera wallets
- **React Hooks**: `useWalletConnection`, `useHederaWallet`, `useWalletBalance`
- **Type Definitions**: Comprehensive TypeScript interfaces for all blockchain interactions
- **Utility Functions**: Address validation, network switching, transaction helpers

### Testing

```bash
cd packages/wallet

# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Build and verify ESM output
npm run build
# Check dist/ contains clean ESM without require() calls
```

---

## ⚡ Event-Driven Architecture

Echain uses a sophisticated event-driven architecture for real-time updates and efficient data synchronization.

### Core Components

1. **Webhook Integration**
   - Coinbase Developer Platform webhooks for transaction events
   - Serverless webhook processing functions
   - Event indexing and storage

2. **WebSocket Streaming**
   - Socket.io for real-time client connections
   - Live updates without polling
   - Connection management and reconnection logic

3. **Data Indexing**
   - The Graph protocol for complex queries
   - Covalent API for transaction data
   - Efficient data retrieval and caching

4. **Caching Layer**
   - Redis for high-performance caching
   - Cache invalidation strategies
   - Performance optimization

### Development Workflow

```bash
# Start all services for event-driven development
npm run dev:event-driven

# Test webhook endpoints
curl -X POST http://localhost:3000/api/webhooks/transactions \
  -H "Content-Type: application/json" \
  -d '{"event":"transaction.confirmed","data":{...}}'

# Monitor WebSocket connections
# Check browser developer tools Network tab
```

### Architecture Benefits

- **Real-Time Updates**: <100ms latency for event delivery
- **Scalability**: Efficient data synchronization
- **Performance**: Reduced server load through caching
- **Reliability**: Eventual consistency with immediate feedback

---

## 🚢 Deployment

### Environment Setup

1. **Configure Production Environment**
```bash
# Set production environment variables
cp frontend/.env.example frontend/.env.production

# Configure production URLs and secrets
# - Database connections
# - Redis URLs
# - API keys
# - Contract addresses
```

2. **Contract Deployment**
```bash
cd blockchain

# Deploy to Base mainnet
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_MAINNET_RPC_URL \
  --broadcast --verify

# Update frontend with new contract addresses
```

3. **Frontend Deployment**
```bash
cd frontend

# Build for production
npm run build

# Deploy to Vercel/Netlify/hosting platform
npm run deploy
```

### Multi-Chain Deployment

**Base Network (Primary):**
- Production-ready with OnchainKit integration
- Gasless transactions available
- PWA support for mobile experience

**Hedera Network:**
- Real wallet integration with multisig support
- HashPack, Blade, and Kabila wallet connectors
- Optimized for enterprise use cases

### Monitoring Setup

```bash
# Configure monitoring
# - Sentry for error tracking
# - Analytics for user metrics
# - Contract monitoring on Basescan
# - Performance monitoring
```

---

## 🔍 Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Clear all caches and reinstall
rm -rf node_modules package-lock.json
npm install

# For Windows native dependency issues
# Remove node_modules and reinstall
```

**2. Wallet Connection Issues**
```bash
# Check RPC URLs in environment
echo $BASE_SEPOLIA_RPC_URL

# Verify wallet configuration
# Check browser console for connection errors
```

**3. Contract Deployment Issues**
```bash
# Verify private key
echo $PRIVATE_KEY

# Check network connectivity
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $BASE_SEPOLIA_RPC_URL
```

**4. ESM Import Errors**
```bash
# Check wallet package build
cd packages/wallet
npm run build

# Verify dist/ contains clean ESM
grep -r "require(" dist/
# Should return no results
```

**5. WebSocket Connection Issues**
```bash
# Check Socket.io server
# Verify webhook endpoints
# Check Redis connection for caching
```

### Development Best Practices

- **Always run QA checks** before committing
- **Test on multiple networks** during development
- **Use the wallet package** for all blockchain interactions
- **Follow TypeScript strict mode** requirements
- **Keep dependencies updated** and audited

### Getting Help

- **GitHub Issues**: [Report bugs and request features](https://github.com/Talent-Index/Echain/issues)
- **Discord**: [Join the community](https://discord.gg/echain)
- **Documentation**: Check the [docs/](./) directory for detailed guides

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** and test thoroughly
4. **Run QA checks**: `npm run qa`
5. **Commit with conventional format**: `git commit -m "feat: add new feature"`
6. **Create a pull request**

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Follow the configured linting rules
- **Prettier**: Code formatting is automated
- **Testing**: Maintain or improve test coverage
- **Documentation**: Update docs for any API changes

### Commit Convention
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
Examples:
- feat(auth): add wallet signature verification
- fix(api): resolve rate limiting bypass
- docs(readme): update deployment instructions
```

### Testing Requirements
- **Unit Tests**: For all new functions and components
- **Integration Tests**: For API endpoints and contract interactions
- **E2E Tests**: For critical user workflows
- **Coverage**: Maintain >80% coverage across all components

---

## 📚 Additional Resources

- **[API Reference](./api/README.md)**: Complete API documentation
- **[Architecture Guide](./architecture/README.md)**: System design and patterns
- **[Security Guide](./security/README.md)**: Security measures and best practices
- **[Deployment Guide](./deployment/README.md)**: Production deployment instructions
- **[Examples](./examples/README.md)**: Code examples and use cases

---

**Last Updated: October 21, 2025**  
**Version: 2.1 - Full Multi-Chain Implementation**
```

- Build wallet SDK (when working on the SDK):

```bash
cd packages/wallet
npm run build
```

## Wallet SDK development notes
- `packages/wallet` is published in ESM format (`type: "module"`) and uses `tsup` to produce ESM output in `dist/`.
- Important tsup settings used in this repo:
  - `format: ['esm']` (ESM-only output)
  - `platform: 'browser'` (prevent node-style shims)
  - `bundle: true` or `bundle: false` depending on need; prefer `bundle: true` to avoid many small relative imports when distributing within the monorepo.
  - `external` should include peer deps such as `react`, `react-dom`, `@tanstack/react-query`, `wagmi`, `viem`, `@hashgraph/sdk` and other large libs you don't want bundled.
- Exports should be declared in `packages/wallet/package.json` under `exports` to provide module entrypoints such as `.` (root), `./components`, and `./hooks`.

## Troubleshooting (common problems)
### 1) Dynamic require of `react` is not supported (runtime error)
Symptoms: Next.js runtime shows `Dynamic require of "react" is not supported` or stack trace pointing to `use-sync-external-store` shim.
Solution summary implemented in this repo:
- Build the wallet SDK as ESM-only and ensure `platform: 'browser'` in `tsup` to avoid injecting `require` helpers.
- Replace problematic `use-sync-external-store/shim` imports via webpack aliases in `frontend/next.config.mjs` with ESM-compatible shims that use React's built-in `useSyncExternalStore`.
- If transient native `rollup` optional dependency errors appear while building, remove `node_modules` and `package-lock.json` and run `npm install` at the workspace root, then re-run `npm run build` in the package.

### 2) Next.js cannot resolve monorepo package files during build
- Ensure `next.config.mjs` has `experimental.externalDir: true` and `outputFileTracingRoot` pointing to the repo root.
- Add packages that need transpilation to `transpilePackages` in `next.config.mjs` (e.g., `@echain/wallet`, `viem`, `@rainbow-me/rainbowkit`).

## Linting, tests and CI
- Linting and QA are driven by `echain-qa-agent` (a devDependency) — run `npm run qa` from repo root to run QA scripts defined in `scripts/qa-agent.sh`.
- Frontend uses ESLint and TypeScript. Use `npm run lint` or `npm run type-check` in `frontend/`.

## Notes for contributors
- Create a branch off `blockchain` (current working branch in repo).
- When updating the wallet SDK in `packages/wallet`, always run `npm run build` and then test the frontend `npm run build` to validate there are no dynamic require or module resolution issues.

---
End of guide.