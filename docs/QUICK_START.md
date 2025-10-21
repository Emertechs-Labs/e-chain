# Echain Repository - Quick Start Guide

**Welcome to Echain!** 🚀  
*Blockchain-based event management platform*

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### System Requirements
- **Node.js:** v18.0.0 or higher
- **npm:** v8.0.0 or higher (comes with Node.js)
- **Git:** Latest version
- **Foundry:** For smart contract development

### Blockchain Development
- **MetaMask** or another Web3 wallet
- **Test ETH** on Base Sepolia or Hedera testnet
- **RPC endpoints** for test networks

---

## 🚀 Quick Start (5 minutes)

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/Talent-Index/Echain.git
cd Echain

# Install dependencies
npm install

# Set up environment
cp frontend/.env.example frontend/.env.local
```

### 2. Configure Environment
Edit `frontend/.env.local`:
```bash
# Required: Add your wallet private key for deployment
PRIVATE_KEY=your_private_key_here

# Required: RPC URLs for test networks
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api

# Optional: External services
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
REDIS_URL=redis://localhost:6379
```

### 3. Deploy Smart Contracts
```bash
# Deploy to Base Sepolia
cd blockchain
npm install
forge install
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast --verify
```

### 4. Start Frontend
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

### 5. Access Application
Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 🏗️ Development Workflow

### Daily Development
```bash
# Start development servers
npm run dev:all

# Run tests
npm test

# Check code quality
npm run lint
npm run type-check
```

### Making Changes
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm test
npm run build

# Commit with conventional format
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name
```

---

## 🧪 Testing

### Run All Tests
```bash
# Smart contract tests
cd blockchain && forge test

# Frontend tests
cd frontend && npm test

# Wallet package tests
cd packages/wallet && npm test
```

### Test Coverage
```bash
# Contract coverage
cd blockchain && forge coverage

# Frontend coverage
cd frontend && npm test -- --coverage
```

---

## 🚀 Deployment

### Staging Deployment
```bash
# Deploy contracts to testnet
npm run deploy:contracts:testnet

# Deploy frontend to staging
npm run deploy:frontend:staging
```

### Production Deployment
```bash
# Deploy contracts to mainnet
npm run deploy:contracts:mainnet

# Deploy frontend to production
npm run deploy:frontend:production
```

---

## 📚 Key Files and Directories

```
Echain/
├── blockchain/           # Smart contracts (Foundry)
│   ├── contracts/        # Solidity source files
│   ├── test/            # Contract tests
│   └── script/          # Deployment scripts
├── frontend/            # Next.js application
│   ├── app/             # App router pages
│   ├── components/      # React components
│   └── lib/             # Utilities and hooks
├── packages/
│   └── wallet/          # Wallet SDK package
├── docs/                # Documentation
└── scripts/             # Utility scripts
```

---

## 🔧 Troubleshooting

### Common Issues

**Build fails with "Cannot resolve module"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Contract deployment fails**
```bash
# Check RPC URL and private key
echo $BASE_SEPOLIA_RPC_URL
echo $PRIVATE_KEY

# Verify network connectivity
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $BASE_SEPOLIA_RPC_URL
```

**Frontend won't start**
```bash
# Check Node.js version
node --version

# Clear Next.js cache
rm -rf frontend/.next
cd frontend && npm run dev
```

**Tests failing**
```bash
# Update dependencies
npm update

# Run tests individually
cd blockchain && forge test --match-path test/EventFactory.t.sol
cd frontend && npm test -- --testPathPattern=EventCard.test.tsx
```

---

## 📖 Documentation

- **[Full Documentation](./docs/README.md)** - Complete setup and usage guide
- **[API Reference](./docs/API_REFERENCE.md)** - API endpoints and usage
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and components
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Security](./docs/SECURITY.md)** - Security measures and audit info

---

## 🆘 Getting Help

### Community Support
- **GitHub Issues:** [Create an issue](https://github.com/Talent-Index/Echain/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Talent-Index/Echain/discussions)
- **Discord:** [Join our community](https://discord.gg/echain)

### Professional Support
- **Security Issues:** security@echain.events
- **Business Inquiries:** business@echain.events
- **Technical Support:** support@echain.events

---

## 🎯 What's Next?

### Immediate Next Steps
1. **Explore the codebase** - Check out key files in each directory
2. **Run the test suite** - Ensure everything works locally
3. **Create your first event** - Test the full user flow
4. **Customize the UI** - Modify components to match your needs

### Learning Resources
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Foundry Book](https://book.getfoundry.sh/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)

### Contributing
We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

---

**Happy coding! 🎉**

*Last updated: January 19, 2025*