# Echain Repository - Quick Start Guide

## 🚀 Getting Started

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Emertechs-Labs/Echain.git
   cd Echain
   git checkout blockchain
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install blockchain dependencies
   cd blockchain
   npm install
   cd ..
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   
   # Install wallet package dependencies
   cd packages/wallet
   npm install
   cd ../..
   
   # Install wallet app dependencies
   cd wallet-app
   npm install
   cd ..
   ```

3. **Configure Environment Variables**

   **For Blockchain:**
   ```bash
   cd blockchain
   cp .env.example .env
   # Edit .env and add your private key and API keys
   ```

   **For Frontend:**
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local and add your WalletConnect project ID
   ```

---

## 🔑 Required Credentials

### Blockchain Development
- **DEPLOYER_PRIVATE_KEY**: Your wallet private key (get testnet ETH from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))
- **BASESCAN_API_KEY**: Get from [BaseScan](https://basescan.org/myapikey)

### Frontend Development
- **NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID**: Get from [WalletConnect Cloud](https://cloud.walletconnect.com/)

---

## 💻 Development Commands

### Blockchain
```bash
cd blockchain

# Compile contracts
forge build

# Run tests
forge test

# Run tests with gas reporting
forge test --gas-report

# Deploy to Base Sepolia testnet
forge script scripts/DeployMultisigWallet.s.sol --rpc-url $BASE_TESTNET_RPC_URL --broadcast --verify
```

### Frontend
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm test
```

### Wallet Package
```bash
cd packages/wallet

# Build the package
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

### Wallet App
```bash
cd wallet-app

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
Echain/
├── blockchain/          # Smart contracts (Foundry)
│   ├── contracts/       # Solidity contracts
│   ├── scripts/         # Deployment scripts
│   ├── test/           # Contract tests
│   └── .env.example    # Environment template
│
├── frontend/           # Main Next.js application
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utility functions
│
├── packages/
│   └── wallet/        # Reusable wallet package
│       ├── src/       # Package source code
│       └── tests/     # Package tests
│
├── wallet-app/        # Standalone wallet application
│   ├── app/          # Next.js pages
│   └── components/   # App components
│
└── docs/             # Project documentation
```

---

## 🔄 Git Workflow

### Create a New Feature Branch
```bash
git checkout blockchain
git pull origin blockchain
git checkout -b feature/your-feature-name
```

### Make Changes and Commit
```bash
git add .
git commit -m "feat: description of your changes"
```

### Push Changes
```bash
git push origin feature/your-feature-name
```

### Create Pull Request
1. Go to GitHub
2. Create a Pull Request to merge into `blockchain` branch
3. Request review from team members

---

## 🧪 Testing Guidelines

### Before Committing
1. Run all tests: `npm test` (in relevant directory)
2. Check linting: `npm run lint`
3. Build the project: `npm run build`
4. Verify no errors

### Blockchain Testing
```bash
cd blockchain
forge test -vvv  # Verbose output for debugging
```

### Frontend Testing
```bash
cd frontend
npm test
```

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution:** Run `npm install` in the affected directory

### Issue: Git conflicts with line endings
**Solution:** The `.gitattributes` file handles this automatically. Ensure you've pulled latest changes.

### Issue: Environment variables not loading
**Solution:** 
- Ensure `.env` or `.env.local` exists
- Check file naming (frontend uses `.env.local`)
- Restart your development server

### Issue: Blockchain deployment fails
**Solution:**
- Verify you have testnet ETH in your wallet
- Check your `DEPLOYER_PRIVATE_KEY` is correct
- Ensure RPC URL is accessible

---

## 📚 Documentation

- **Blockchain Deployment:** `blockchain/BASE_TESTNET_DEPLOYMENT.md`
- **SDK Migration:** `docs/SDK_MIGRATION_GUIDE.md`
- **Wallet Enhancement:** `docs/wallet-enhancement/README.md`
- **Beta Testing:** `docs/BETA_TESTING_FRAMEWORK.md`
- **Hedera Docs:** `docs/hedera-docs/README.md`

---

## 🔐 Security Reminders

- ⚠️ **NEVER** commit `.env` files with real credentials
- ⚠️ **NEVER** commit private keys to git
- ⚠️ **ALWAYS** use `.env.example` for templates
- ⚠️ **ALWAYS** review changes before pushing

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit a pull request

---

## 📞 Support

- **GitHub Issues:** Report bugs and request features
- **Documentation:** Check the `docs/` directory
- **Team Contact:** Reach out to the development team

---

## 📋 Checklist for New Team Members

- [ ] Clone repository
- [ ] Install dependencies (`npm install` in all directories)
- [ ] Copy `.env.example` files and configure
- [ ] Get testnet ETH from faucet
- [ ] Get WalletConnect Project ID
- [ ] Get BaseScan API key
- [ ] Run tests to verify setup
- [ ] Read documentation in `docs/`
- [ ] Familiarize yourself with git workflow
- [ ] Join team communication channels

---

**Happy Coding! 🚀**
