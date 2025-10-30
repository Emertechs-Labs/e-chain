# Hedera SDKs and APIs

This document provides comprehensive information about Hedera's SDKs and APIs, with focus on JavaScript/TypeScript for Echain Wallet SDK integration.

## Official Consensus Node SDKs

### JavaScript/TypeScript SDK
**Primary SDK for Echain Wallet SDK**

- **Package**: `@hashgraph/sdk`
- **Features**:
  - Complete Hedera API coverage
  - TypeScript support with full type definitions
  - Promise-based async/await API
  - Automatic transaction fee calculation
  - Built-in retry logic and error handling
  - Support for all Hedera services (Consensus, Token, Smart Contracts, File)

- **Installation**:
  ```bash
  npm install @hashgraph/sdk
  ```

- **Key Classes**:
  - `Client`: Main entry point for network interaction
  - `AccountId`, `PrivateKey`, `PublicKey`: Account management
  - `Transaction`: Base class for all transactions
  - `Query`: Base class for network queries

### Java SDK
- **Package**: `com.hedera.hashgraph:sdk`
- **Use Cases**: Enterprise applications, Android development
- **Features**: Full API coverage, synchronous and asynchronous operations

### Go SDK
- **Package**: `github.com/hashgraph/hedera-sdk-go`
- **Use Cases**: Backend services, microservices
- **Features**: Idiomatic Go patterns, context support

### Swift SDK
- **Package**: Via Swift Package Manager
- **Use Cases**: iOS applications, macOS development
- **Features**: Native Swift APIs, Combine framework support

### Rust SDK
- **Package**: `hedera-sdk-rust`
- **Use Cases**: High-performance systems, blockchain infrastructure
- **Features**: Memory safety, zero-cost abstractions

### C++ SDK
- **Package**: Via CMake or vcpkg
- **Use Cases**: Gaming, embedded systems, high-performance applications
- **Features**: Cross-platform support, minimal dependencies

## Community SDKs

### Python SDK
- **Status**: Community maintained
- **Features**: Pythonic API, asyncio support
- **Use Cases**: Data analysis, scripting, backend services

## Serverless SDKs

### DID SDK
- **Purpose**: Decentralized Identity management
- **Features**: DID document creation, verification, resolution
- **Standards**: W3C DID specification compliance

### Serverless APIs
- **Features**: RESTful APIs for common operations
- **Use Cases**: Simple integrations, prototyping
- **Limitations**: Reduced functionality compared to full SDKs

## Development Tools

### Hedera Playground
- **URL**: https://playground.hedera.com
- **Features**:
  - Online IDE for smart contract development
  - Built-in compiler and debugger
  - Test account with HBAR
  - Real-time deployment to testnet

### Contract Builder
- **Features**: No-code smart contract deployment
- **Use Cases**: Simple contracts, prototyping
- **Templates**: Pre-built contract templates

## API Architecture

### Transaction Types
- **ConsensusSubmitMessage**: Submit messages to consensus service
- **TokenCreate**: Create new tokens
- **ContractCreate**: Deploy smart contracts
- **ContractCall**: Execute smart contract functions
- **FileCreate**: Store files on network
- **AccountCreate**: Create new accounts

### Query Types
- **TransactionGetReceipt**: Get transaction confirmation
- **AccountBalanceQuery**: Check account balance
- **ContractCallQuery**: Call view functions
- **TokenInfoQuery**: Get token information
- **FileContentsQuery**: Retrieve file contents

## Network Configuration

### Testnet
```javascript
import { Client, NetworkName } from "@hashgraph/sdk";

const client = Client.forNetwork(NetworkName.Testnet);
```

### Mainnet
```javascript
const client = Client.forNetwork(NetworkName.Mainnet);
```

### Custom Network
```javascript
const client = Client.forNetwork({
  "127.0.0.1:50211": "0.0.3"
});
```

## Authentication and Security

### Account Management
- **ED25519 Keys**: Primary key type for Hedera accounts
- **ECDSA Keys**: Ethereum-compatible keys
- **Multi-signature**: Built-in support for multi-sig accounts
- **Threshold Keys**: Custom threshold requirements

### Transaction Signing
```javascript
// Single signature
transaction.sign(privateKey);

// Multiple signatures
transaction.sign(key1).sign(key2);
```

## Error Handling

### Common Error Types
- `HederaPreCheckStatusError`: Transaction failed pre-check
- `HederaReceiptStatusError`: Transaction failed execution
- `HederaNetworkError`: Network connectivity issues
- `HederaTimeoutError`: Transaction timeout

### Retry Logic
- Automatic retry for transient failures
- Configurable retry policies
- Exponential backoff support

## Performance Optimization

### Batching
```javascript
const transactionList = new TransactionList()
  .addTransaction(tx1)
  .addTransaction(tx2)
  .execute(client);
```

### Query Optimization
- Use mirror nodes for read operations
- Cache frequently accessed data
- Batch multiple queries when possible

## Multisig Implementation Notes

For Echain Wallet SDK multisig support:

1. **Smart Contract Integration**: Use `@hashgraph/smart-contracts` for Solidity development
2. **Transaction Batching**: Group multiple signatures into single transactions
3. **Fee Optimization**: Calculate optimal fees for multi-sig operations
4. **Security**: Implement proper key management and threshold logic
5. **Wallet Integration**: Support HashPack, Blade, and MetaMask multisig flows

## Resources

- [JavaScript SDK Documentation](https://docs.hedera.com/guides/sdks/javascript)
- [SDK Examples](https://github.com/hashgraph/hedera-sdk-js/tree/main/examples)
- [API Reference](https://docs.hedera.com/guides/sdks)