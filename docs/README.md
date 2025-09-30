# 📖 Echain Documentation

<div align="center">

![Echain Logo](https://img.shields.io/badge/Echain-Blockchain_Events_Platform-00D4FF?style=for-the-badge&logo=ethereum&logoColor=white)
![Base Network](https://img.shields.io/badge/Base-Ethereum_L2-0052FF?style=for-the-badge&logo=ethereum&logoColor=white)
![MultiBaas](https://img.shields.io/badge/Curvegrid_MultiBaas-API_Platform-00AEEF?style=for-the-badge&logo=api&logoColor=white)

**A Web3-native event management platform built on Base using Curvegrid MultiBaas**

*Transform traditional events into blockchain-powered experiences with NFT tickets, POAP certificates, and gamified participation.*

[🚀 Quick Start](#-quick-start) • [📚 Documentation](#-documentation-structure)

</div>

---

## 🎯 Platform Overview

Echain is a comprehensive blockchain-based event management platform featuring:

- **NFT Ticketing**: Secure, verifiable, transferable event tickets
- **POAP Certificates**: Soulbound attendance tokens for reputation building
- **Gamified Incentives**: Rewards and loyalty systems for engagement
- **MultiBaas Integration**: Seamless blockchain API abstraction
- **Real-time Updates**: WebSocket streaming for live event data

**Current Status**: ✅ Production-ready on Base Sepolia testnet

---

## 🚀 Quick Start

### For Event Organizers
1. **[Deploy Contracts](./deployment/README.md)**: Set up smart contracts on Base
2. **[Create Events](./guides/README.md#for-event-organizers)**: Use the platform to create NFT ticketed events
3. **[Manage Attendees](./guides/README.md#event-management)**: Handle ticket sales and check-ins

### For Developers
1. **[Smart Contracts](./contracts/README.md)**: Understand the blockchain architecture
2. **[MultiBaas Integration](./integration/README.md)**: Connect to blockchain APIs
3. **[API Reference](./api/README.md)**: Build integrations and extensions

### For Attendees
1. **[Connect Wallet](./guides/README.md#getting-started)**: Set up MetaMask or Web3 wallet
2. **[Browse Events](./examples/README.md)**: Discover upcoming events
3. **[Purchase Tickets](./guides/README.md#buying-tickets)**: Buy NFT tickets with crypto

---

## 📋 Documentation Structure

### 🏗️ [Smart Contracts](./contracts/README.md)
Complete smart contract architecture and deployment guide for:
- EventFactory, EventTicket, POAP, and IncentiveManager contracts
- OpenZeppelin security patterns and upgradeability
- Gas optimization and testing strategies

### 🔗 [MultiBaas Integration](./integration/README.md)
Comprehensive CurveGrid MultiBaas integration covering:
- API setup and configuration
- React hooks for blockchain data
- Real-time WebSocket streaming
- Security best practices

### 🚀 [Deployment](./deployment/README.md)
Step-by-step deployment instructions for:
- Local development setup
- Base Sepolia testnet deployment
- Production deployment on Base mainnet
- Environment configuration

### 📚 [User Guides](./guides/README.md)
Practical guides for all user types:
- Event organizers and attendees
- Developers and administrators
- Integration and customization

### 💡 [Examples](./examples/README.md)
Code examples and use cases:
- Real-world event scenarios
- API integration patterns
- Smart contract implementations

### 🔒 [Security](./security/README.md)
Security documentation including:
- Audit reports and findings
- Implementation of security fixes
- Testing procedures and guidelines

---

## 🛠️ Technology Stack

**Blockchain Layer:**
- Base Ethereum L2 network
- Solidity smart contracts with OpenZeppelin
- CurveGrid MultiBaas API platform

**Frontend Layer:**
- Next.js 15 with TypeScript
- RainbowKit + Reown wallet integration
- Tailwind CSS with custom design system

**Infrastructure:**
- Vercel for frontend hosting
- IPFS for decentralized storage
- WebSocket for real-time updates

---

## 🌟 Key Features

- **🎟️ NFT Ticketing**: Blockchain-verified tickets with creator royalties
- **🏆 POAP System**: Soulbound attendance certificates
- **💰 Incentive Engine**: Gamified rewards and loyalty programs
- **🔄 Real-time Sync**: Live updates via WebSocket streaming
- **🛡️ Security First**: OpenZeppelin audited contracts
- **📱 Mobile Ready**: PWA support for mobile access

---

## 📞 Support & Resources

- **[GitHub Repository](https://github.com/Talent-Index/Echain)**: Source code and issues
- **[MultiBaas Console](https://console.curvegrid.com/)**: Blockchain API management
- **[Base Explorer](https://sepolia.basescan.org/)**: Contract verification
- **[Discord Community](https://discord.gg/echain)**: Community support

---

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/Talent-Index/Echain)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?style=flat-square&logo=discord)](https://discord.gg/echain)

**Ready to revolutionize event management with blockchain?**

[Get Started with Smart Contracts](./contracts/README.md) • [MultiBaas Integration](./integration/README.md) • [Deploy to Base](./deployment/README.md)

</div>