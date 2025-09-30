# 🔗 Echain - Blockchain Event Platform

**A Web3-native event management platform built on Base using Curvegrid MultiBaas**

Echain transforms traditional events into blockchain-powered experiences with NFT tickets, POAP certificates, and gamified participation.

## 📋 Deployed Contract Addresses (Base Sepolia)

| Contract | Address |
| -------- | ------- |
| EventFactory | `0xA97cB40548905B05A67fCD4765438aFBEA4030fc` |
| EventTicket | `0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C` |
| POAPAttendance | `0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33` |
| IncentiveManager | `0x1cfDae689817B954b72512bC82f23F35B997617D` |
| Marketplace | `0xD061393A54784da5Fea48CC845163aBc2B11537A` |

## 🎯 Key Features

- **🎟️ NFT Ticketing**: Secure, verifiable, transferable event tickets with creator royalties
- **🏆 POAP System**: Attendance certificates for reputation building
- **💰 Incentive Engine**: Rewards and loyalty programs
- **🔐 Security First**: OpenZeppelin audited smart contracts

**Current Status**: ✅ Production-ready on Base Sepolia testnet

## 🛠️ Technology Stack

- **Blockchain**: Base (Ethereum L2), Solidity, MultiBaas API
- **Frontend**: Next.js, TypeScript, RainbowKit, Tailwind CSS
- **Infrastructure**: Vercel, IPFS storage

## 🚀 Quick Start Guide

### For Event Organizers

1. Connect your wallet using the button in the top-right corner
2. Navigate to the "Create Event" page
3. Complete the event details and submit
4. Manage your events from the dashboard

### For Attendees

1. Connect your wallet using the button in the top-right corner
2. Browse available events on the homepage
3. Purchase tickets with cryptocurrency
4. Access your tickets in the "My Tickets" section

## 📚 Documentation

For more detailed information, explore our documentation:

- [Smart Contracts](./docs/contracts/README.md)
- [User Guides](./docs/guides/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Security Info](./docs/security/README.md)

## 📞 Support & Resources

- [GitHub Repository](https://github.com/Talent-Index/Echain)
- [Base Explorer](https://sepolia.basescan.org/)

## 💻 Development Setup

### Prerequisites

- Node.js and npm
- Git
- MetaMask or compatible wallet
- Base Sepolia testnet ETH (for creating/buying tickets)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Talent-Index/Echain.git
   cd Echain
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   cd frontend
   npm run dev
   ```

4. Open your browser at http://localhost:3000

## 🔧 Environment Configuration

Create a `.env.local` file in the frontend directory with:

```
NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=your_reown_project_id_here
NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL=your_multibaas_url
NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY=your_dapp_user_api_key
NEXT_PUBLIC_MULTIBAAS_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=0xA97cB40548905B05A67fCD4765438aFBEA4030fc
```

For more information on advanced setup and configuration options, please refer to our [development documentation](./docs/deployment/README.md).
