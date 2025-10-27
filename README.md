# Echain - Blockchain Event Platform

[![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Base](https://img.shields.io/badge/Base-0052FF?style=for-the-badge&logo=base&logoColor=white)](https://base.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**A Web3-native event management platform built on Base with direct contract integration**

Echain transforms traditional events into blockchain-powered experiences with NFT tickets, POAP certificates, and gamified participation. Built with modern Web3 infrastructure for secure, transparent, and engaging event experiences.

## Deployed Contract Addresses (Base Sepolia)

| Contract | Address | Verified Link |
| -------- | ------- | ------------- |
| EventFactory | `0xA97cB40548905B05A67fCD4765438aFBEA4030fc` | [View on BaseScan](https://sepolia.basescan.org/address/0xA97cB40548905B05A67fCD4765438aFBEA4030fc#code) |
| EventTicket | `0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C` | [View on BaseScan](https://sepolia.basescan.org/address/0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C#code) |
| POAPAttendance | `0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33` | [View on BaseScan](https://sepolia.basescan.org/address/0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33#code) |
| IncentiveManager | `0x1cfDae689817B954b72512bC82f23F35B997617D` | [View on BaseScan](https://sepolia.basescan.org/address/0x1cfDae689817B954b72512bC82f23F35B997617D#code) |
| Marketplace | `0xD061393A54784da5Fea48CC845163aBc2B11537A` | [View on BaseScan](https://sepolia.basescan.org/address/0xD061393A54784da5Fea48CC845163aBc2B11537A#code) |

## Key Features

### NFT Ticketing System
- Secure & verifiable with blockchain-backed proof of ownership
- Transferable with creator royalties on secondary sales
- Dynamic pricing that responds to demand and time decay
- Multi-tier support covering standard, VIP, Early Bird, Student, and Group tickets

### POAP (Proof of Attendance Protocol)
- Soulbound tokens for attendance certificates
- Evolution system upgrades POAPs based on attendance streaks
- Reputation building through verifiable participation history
- Event verification powered by QR codes and signature-based check-ins

### Gamified Incentive Engine
- Loyalty points for attendance and engagement
- Achievement system unlocks badges for key milestones
- Referral program rewards community-driven growth
- Prediction markets let attendees bet on event success with shared rewards

### Enterprise-Grade Security
- OpenZeppelin-audited smart contracts
- Multi-signature administrative controls with timelocks
- Circuit breakers for emergency pause functionality
- Automated fraud detection through behavioral analysis

### Real-Time Experience
- Direct RPC integration for fast blockchain interactions
- Live event feed covering new events and ticket sales
- Push notifications for critical updates
- WebSocket streaming to keep dashboards in sync

**Current Status**: Production-ready on Base Sepolia testnet

## 🔐 Security Notice

**This repository is PUBLIC on GitHub.** 

### Critical Security Guidelines:
- 🚨 **NEVER commit API keys, secrets, or `.env` files containing real credentials**
- ✅ **Use `.env.example` as a template for environment variables**
- ✅ **Set environment variables in your deployment platform (Vercel, Netlify, etc.)**
- ✅ **Use `.env.local` for local development (automatically excluded from git)**

**If you accidentally commit secrets:**
1. Immediately rotate all affected API keys
2. Remove from git history using `git filter-branch`
3. Update deployment platform variables
4. Notify the development team

See [Environment Setup Guide](./docs/ENVIRONMENT_SETUP_GUIDE.md) for secure configuration instructions.

## Technology Stack

### Blockchain Layer
- Network: Base Ethereum L2 for low-cost, fast transactions
- Smart contracts: Solidity 0.8.26 with OpenZeppelin standards
- Tooling: Foundry (Forge, Cast, Anvil) with direct RPC integration
- Security: Continuous monitoring, observability, and guardian safeguards

### Frontend Layer
- Framework: Next.js 15 App Router with TypeScript
- Styling: Tailwind CSS and custom design system primitives
- Data & wallet: Viem, Wagmi, RainbowKit, and Reown (WalletConnect)
- State management: TanStack Query for server state orchestration

### Infrastructure
- Hosting: Vercel with edge functions and CDN distribution
- Storage: IPFS/Pinata for decentralized metadata
- Monitoring: Sentry for error tracking and performance insights
- QA automation: Scripted QA agent workflows across frontend and contracts

## Quick Start Guide

### For Event Organizers
1. Connect your wallet using the top-right button
2. Navigate to the Create Event page
3. Complete the event form and submit
4. Manage live events from the organizer dashboard

### For Attendees
1. Connect your wallet using the top-right button
2. Browse available events on the homepage
3. Purchase tickets with cryptocurrency
4. Access tickets in the My Tickets section

## Documentation

Explore the full documentation set:

- [Smart Contracts](./docs/contracts/README.md)
- [User Guides](./docs/guides/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Security Info](./docs/security/README.md)
- [Integration Guide](./docs/integration/README.md)

## Support & Resources

- Live demo: [https://echain-eight.vercel.app](https://echain-eight.vercel.app)
- Documentation: [./docs/](./docs/) for complete technical references
- Issue tracking: [GitHub Issues](https://github.com/Talent-Index/Echain/issues)
- Community: [Discord Server](https://discord.gg/echain)
- Contact: [support@echain.events](mailto:support@echain.events)

## Development Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git (latest stable)
- Foundry toolchain (`foundryup`, `forge`, `cast`, `anvil`)
- Web3 wallet (MetaMask, Coinbase Wallet, or compatible)
- Base Sepolia ETH for testing transactions

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Talent-Index/Echain.git
   cd Echain
   ```

2. **Install dependencies**
   ```bash
   # Root workspace
   npm install

   # Blockchain workspace
   cd blockchain
   npm install
   cd ..

   # Frontend workspace
   cd frontend
   npm install
   cd ..
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your development keys
   # NEVER commit .env.local to the repository
   ```

4. **Start development services**
   ```bash
   # Terminal 1: Frontend
   cd frontend
   npm run dev

   # Terminal 2: Local blockchain (optional)
   cd blockchain
   anvil
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Local RPC: http://127.0.0.1:8545 (anvil default)

### Environment Configuration

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual development credentials. See the [Environment Setup Guide](./docs/ENVIRONMENT_SETUP_GUIDE.md) for detailed instructions on obtaining and configuring all required API keys and services.

**⚠️ Never commit `.env.local` or any file containing real API keys to the repository.**

## Available Scripts

### Frontend scripts
```bash
cd frontend

# Development
npm run dev             # Start development server
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Testing
npm run test            # Run test suite
npm run test:coverage   # Coverage reports
```

### Blockchain scripts
```bash
cd blockchain

# Development
npm run compile         # forge build
npm run test            # forge test
npm run test:gas        # forge test --gas-report

# Deployment
npm run deploy:events:dev     # Deploy to development RPC
npm run deploy:events:testnet # Deploy to Base Sepolia
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

### Code standards
- TypeScript: Strict type checking enabled
- ESLint: Airbnb config with React rules
- Prettier: Consistent code formatting
- Solidity: Foundry toolchain with OpenZeppelin standards
- Testing: Forge test suite and frontend coverage harness

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Base: for the scalable Ethereum L2 network
- OpenZeppelin: for battle-tested smart contract libraries
- RainbowKit: for seamless wallet integration
- Vercel: for the exceptional hosting platform
- Viem & Wagmi: for robust Ethereum interaction libraries

---

<div align="center">

**Built with love for the Web3 community**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/Talent-Index/Echain)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=flat-square&logo=twitter)](https://twitter.com/echain_events)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?style=flat-square&logo=discord)](https://discord.gg/echain)

**Ready to revolutionize event management with blockchain?**

[Get Started](#quick-start-guide) • [Documentation](./docs/) • [Report Issues](https://github.com/Talent-Index/Echain/issues)

</div>
