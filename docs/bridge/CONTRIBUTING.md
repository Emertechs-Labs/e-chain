# Contributing to Echain Bridge

Thank you for your interest in contributing to Echain's bridge system! This document provides guidelines for contributors.

## Ways to Contribute

### 1. Code Contributions
- **Adapter Development**: Build adapters for new blockchains
- **SDK Improvements**: Enhance the JavaScript SDK
- **Security Enhancements**: Implement additional security measures
- **Documentation**: Improve documentation and guides

### 2. Testing
- **Unit Tests**: Add test coverage for new features
- **Integration Tests**: Test cross-chain functionality
- **Security Testing**: Perform security assessments

### 3. Research
- **New Chains**: Research and document new blockchain integrations
- **Protocol Improvements**: Suggest improvements to bridge protocols
- **Performance Optimization**: Optimize bridge performance

### 4. Community Support
- **Issue Triage**: Help manage GitHub issues
- **User Support**: Assist users in Discord/Forum
- **Documentation**: Create tutorials and examples

## Development Setup

### Prerequisites
- Node.js 18+
- Git
- Docker (for testing)
- Access to testnet RPC endpoints

### Local Setup
```bash
# Clone the repository
git clone https://github.com/Talent-Index/Echain.git
cd Echain

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run tests
npm test

# Start development server
npm run dev
```

### Environment Configuration
```bash
# Required
BASE_RPC_URL=https://mainnet.base.org
BRIDGE_CONTRACT_ADDRESS=0x...

# Optional
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key_for_testing
```

## Development Workflow

### 1. Choose an Issue
- Check [GitHub Issues](https://github.com/Talent-Index/Echain/issues) for bridge-related tasks
- Look for issues labeled `bridge`, `cross-chain`, or `adapter`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch
```bash
git checkout -b feature/bridge-adapter-solana
# or
git checkout -b fix/bridge-fee-calculation
```

### 3. Implement Changes
- Follow the existing code style
- Add comprehensive tests
- Update documentation
- Ensure backward compatibility

### 4. Testing
```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run security tests
npm run test:security

# Run all tests
npm test
```

### 5. Submit Pull Request
- Ensure all tests pass
- Update CHANGELOG.md if needed
- Provide clear description of changes
- Reference related issues

## Code Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Solidity
- Follow Solidity style guide
- Use OpenZeppelin contracts where possible
- Include NatSpec documentation
- Implement comprehensive tests

### Documentation
- Use Markdown for documentation
- Keep README files up to date
- Include code examples
- Document breaking changes

## Adapter Development Guidelines

### 1. Interface Compliance
Ensure your adapter implements the `IChainAdapter` interface:

```typescript
interface IChainAdapter {
  sendMessage(params: SendMessageParams): Promise<SendMessageResult>;
  estimateFee(params: EstimateFeeParams): Promise<FeeEstimate>;
  getChainConfig(): ChainConfig;
}
```

### 2. Error Handling
- Use custom error classes
- Provide meaningful error messages
- Handle network failures gracefully
- Implement retry logic where appropriate

### 3. Security
- Never log sensitive information
- Validate all inputs
- Use secure key management
- Follow security best practices

### 4. Testing
- Test with mainnet forking
- Cover edge cases
- Test error conditions
- Include performance tests

### 5. Documentation
- Document adapter capabilities
- Provide configuration examples
- Include troubleshooting guides
- Update main documentation

## Security Considerations

### For Contributors
- **Never commit private keys** or sensitive data
- **Report security issues** through proper channels
- **Follow responsible disclosure** for vulnerabilities
- **Use secure coding practices**

### Security Checklist
- [ ] Input validation on all user inputs
- [ ] Proper error handling without information leakage
- [ ] Secure key management
- [ ] Protection against common attacks (reentrancy, overflow, etc.)
- [ ] Comprehensive test coverage
- [ ] Security audit for significant changes

## Review Process

### Automated Checks
- CI/CD pipeline runs on all PRs
- Code quality checks (ESLint, Prettier)
- Security scanning (npm audit, Snyk)
- Test coverage requirements (80% minimum)

### Manual Review
- Code review by maintainers
- Security review for critical changes
- Documentation review
- Integration testing

### Approval Requirements
- All automated checks pass
- At least one maintainer approval
- Security review for bridge-related changes
- Documentation updates

## Communication

### Channels
- **GitHub Issues/PRs**: For code-related discussions
- **Discord**: For general questions and community support
- **Security Issues**: security@echain.io (encrypted)

### Getting Help
- Check existing documentation first
- Search GitHub issues for similar problems
- Ask in Discord #development channel
- Create a new issue for bugs/features

## Recognition

Contributors are recognized through:
- GitHub contributor statistics
- Mention in release notes
- Contributor badges
- Potential token rewards (future)

## License

By contributing to Echain, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Code of Conduct

Please follow our [Code of Conduct](https://github.com/Talent-Index/Echain/blob/main/CODE_OF_CONDUCT.md) in all interactions.

---

Thank you for contributing to Echain's bridge system! Your efforts help make cross-chain event ticketing a reality.