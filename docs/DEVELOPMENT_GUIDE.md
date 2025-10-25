# 🛠️ Echain Development Guide

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Development Environment](#-development-environment)
3. [Project Structure](#-project-structure)
4. [Code Standards](#-code-standards)
5. [Testing Guidelines](#-testing-guidelines)
6. [Security Best Practices](#-security-best-practices)
7. [Performance Optimization](#-performance-optimization)
8. [Deployment Process](#-deployment-process)
9. [Troubleshooting](#-troubleshooting)
10. [Contributing](#-contributing)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git (latest stable)
- Foundry toolchain (`foundryup`, `forge`, `cast`, `anvil`)
- Web3 wallet (MetaMask, Coinbase Wallet, or compatible)

### Installation
```bash
# Clone the repository
git clone https://github.com/Talent-Index/Echain.git
cd Echain

# Install dependencies
npm install

# Install blockchain dependencies
cd blockchain
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Development Setup
```bash
# Start local blockchain (Terminal 1)
cd blockchain
anvil

# Start frontend development server (Terminal 2)
cd frontend
npm run dev

# Run tests (Terminal 3)
npm run test:all
```

---

## 🏗️ Development Environment

### Environment Configuration

#### Frontend Environment
```bash
# Copy environment template
cp frontend/.env.example frontend/.env.local

# Required environment variables
NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=your_reown_project_id
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

#### Blockchain Environment
```bash
# Copy deployment configuration
cp blockchain/deployment-config.template.js blockchain/deployment-config.development.js

# Set environment variables
export DEPLOYER_PRIVATE_KEY="0x..."
export BASE_RPC_URL="https://sepolia.base.org"
export TREASURY_ADDRESS="0x..."
```

### Development Tools

#### Required Tools
- **Foundry**: Smart contract development and testing
- **Vercel CLI**: Frontend deployment
- **Git**: Version control
- **VS Code**: Recommended IDE with extensions

#### Recommended VS Code Extensions
- Solidity
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- GitLens
- ESLint
- Prettier

---

## 📁 Project Structure

```
Echain/
├── blockchain/                 # Smart contracts and blockchain code
│   ├── contracts/             # Solidity smart contracts
│   ├── test/                 # Foundry test files
│   ├── scripts/              # Deployment scripts
│   └── lib/                  # Dependencies and libraries
├── frontend/                  # Next.js frontend application
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── lib/                  # Utility functions and hooks
│   ├── types/                # TypeScript type definitions
│   └── tests/                # Frontend test files
├── docs/                     # Documentation
│   ├── architecture/         # System architecture docs
│   ├── security/             # Security documentation
│   ├── deployment/           # Deployment guides
│   └── guides/               # User guides
└── scripts/                  # Build and deployment scripts
```

### Key Directories

#### `blockchain/`
- **contracts/**: Smart contract source code
- **test/**: Foundry test files
- **scripts/**: Deployment and utility scripts
- **lib/**: OpenZeppelin and other dependencies

#### `frontend/`
- **app/**: Next.js app router pages
- **components/**: Reusable React components
- **lib/**: Utility functions and custom hooks
- **types/**: TypeScript type definitions

#### `docs/`
- **architecture/**: System design documentation
- **security/**: Security audit reports and fixes
- **deployment/**: Deployment guides and checklists
- **guides/**: User and developer guides

---

## 📝 Code Standards

### TypeScript Standards
- **Strict Mode**: Enabled for all TypeScript files
- **Type Safety**: All functions must have proper type annotations
- **Interface Definitions**: Use interfaces for object shapes
- **Generic Types**: Use generics for reusable components

### React Standards
- **Functional Components**: Use functional components with hooks
- **Component Structure**: Follow consistent component structure
- **Props Interface**: Define interfaces for all component props
- **Custom Hooks**: Extract reusable logic into custom hooks

### Solidity Standards
- **OpenZeppelin**: Use OpenZeppelin contracts for security
- **Access Control**: Implement proper access control patterns
- **Events**: Emit events for all state changes
- **Documentation**: Use NatSpec for all public functions

### Code Style
- **ESLint**: Follow ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add comments for complex logic

---

## 🧪 Testing Guidelines

### Smart Contract Testing
```bash
# Run all tests
cd blockchain
forge test

# Run specific test file
forge test --match-path test/EventFactory.t.sol

# Run tests with gas reporting
forge test --gas-report

# Run tests with coverage
forge coverage
```

### Frontend Testing
```bash
# Run unit tests
cd frontend
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### Test Coverage Requirements
- **Unit Tests**: 80%+ coverage for critical functions
- **Integration Tests**: All major user flows covered
- **Security Tests**: All critical vulnerabilities tested
- **Performance Tests**: Load testing with 1000+ users

---

## 🔒 Security Best Practices

### Smart Contract Security
- **Access Control**: Implement proper access control patterns
- **Reentrancy Protection**: Use ReentrancyGuard for external calls
- **Input Validation**: Validate all inputs and parameters
- **Safe Math**: Use SafeMath or Solidity 0.8+ for arithmetic
- **Events**: Emit events for all state changes

### Frontend Security
- **Input Sanitization**: Sanitize all user inputs
- **XSS Prevention**: Use proper escaping and validation
- **CSRF Protection**: Implement CSRF tokens
- **Environment Variables**: Never expose sensitive data

### General Security
- **Dependency Updates**: Keep all dependencies updated
- **Security Audits**: Regular security audits
- **Code Reviews**: All code must be reviewed
- **Access Control**: Implement proper access controls

---

## ⚡ Performance Optimization

### Frontend Performance
- **Bundle Size**: Keep bundle size under 50MB
- **Code Splitting**: Use dynamic imports for large components
- **Caching**: Implement aggressive caching strategies
- **Images**: Optimize images and use appropriate formats
- **Lazy Loading**: Implement lazy loading for non-critical components

### Blockchain Performance
- **Gas Optimization**: Optimize gas usage for all functions
- **Batch Operations**: Use batch operations when possible
- **Storage Optimization**: Optimize storage patterns
- **Event Indexing**: Use proper event indexing

### Database Performance
- **Indexing**: Create proper database indexes
- **Query Optimization**: Optimize database queries
- **Connection Pooling**: Use connection pooling
- **Caching**: Implement database caching

---

## 🚀 Deployment Process

### Development Deployment
```bash
# Deploy to local blockchain
cd blockchain
anvil
forge script scripts/DeployEventFactory.s.sol --fork-url http://127.0.0.1:8545

# Deploy frontend to Vercel
cd frontend
vercel --prod
```

### Staging Deployment
```bash
# Deploy to testnet
cd blockchain
forge script scripts/DeployEventFactory.s.sol --rpc-url https://sepolia.base.org --broadcast

# Deploy frontend to staging
cd frontend
vercel --target staging
```

### Production Deployment
```bash
# Deploy to mainnet
cd blockchain
forge script scripts/DeployEventFactory.s.sol --rpc-url https://mainnet.base.org --broadcast

# Deploy frontend to production
cd frontend
vercel --prod
```

---

## 🔧 Troubleshooting

### Common Issues

#### Smart Contract Issues
- **Compilation Errors**: Check Solidity version and imports
- **Deployment Failures**: Verify RPC URL and private key
- **Function Call Errors**: Check ABI and function signatures

#### Frontend Issues
- **Build Failures**: Check TypeScript errors and dependencies
- **Runtime Errors**: Check console for error messages
- **Wallet Connection**: Verify wallet configuration

#### Deployment Issues
- **Environment Variables**: Check all required variables are set
- **Network Issues**: Verify RPC URL and network configuration
- **Permission Issues**: Check file permissions and access

### Debugging Tools
- **Foundry**: Use `forge test --debug` for debugging
- **Browser DevTools**: Use browser developer tools
- **Vercel Logs**: Check Vercel function logs
- **Block Explorer**: Use BaseScan for transaction debugging

---

## 🤝 Contributing

### Development Workflow
1. **Fork Repository**: Fork the repository on GitHub
2. **Create Branch**: Create a feature branch
3. **Make Changes**: Implement your changes
4. **Test Changes**: Run all tests
5. **Submit PR**: Submit a pull request

### Pull Request Guidelines
- **Description**: Provide clear description of changes
- **Tests**: Include tests for new functionality
- **Documentation**: Update documentation if needed
- **Code Review**: Address all review comments

### Code Review Process
- **Automated Checks**: All automated checks must pass
- **Manual Review**: At least one manual review required
- **Security Review**: Security-sensitive changes require security review
- **Performance Review**: Performance-sensitive changes require performance review

---

## 📞 Support

### Getting Help
- **Documentation**: Check the docs/ directory
- **GitHub Issues**: Create an issue for bugs or feature requests
- **Discord**: Join the Discord server for community support
- **Email**: Contact the development team

### Reporting Issues
- **Bug Reports**: Use GitHub Issues with detailed reproduction steps
- **Security Issues**: Report security issues privately
- **Feature Requests**: Use GitHub Discussions for feature requests

---

**Development Guide Version:** 1.0.0  
**Last Updated:** January 2025  
**Maintained By:** Echain Development Team

---

*This development guide provides comprehensive information for developing on the Echain platform. For additional help, refer to the documentation in the docs/ directory or contact the development team.*
