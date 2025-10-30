# Hedera Wallet Integrations

This document covers wallet integrations available for Hedera, with focus on multisig wallet support for the Echain Wallet SDK.

## Official Wallets

### HashPack
**Official Hedera Wallet**

- **Features**:
  - Native Hedera support with HBAR and HTS tokens
  - Built-in multisig wallet creation and management
  - Hardware wallet integration (Ledger, Trezor)
  - dApp browser for decentralized applications
  - Multi-signature transaction support
  - Batch transaction processing

- **Multisig Capabilities**:
  - Create multisig accounts with custom thresholds
  - Add/remove signers dynamically
  - Approve transactions individually or in batches
  - Time-locked executions
  - Emergency recovery mechanisms

- **Integration APIs**:
  - WalletConnect protocol support
  - Direct SDK integration
  - Transaction signing APIs
  - Account management APIs

- **Platforms**: iOS, Android, Web Extension

### Blade
**Multi-Chain Wallet with Hedera Support**

- **Features**:
  - Support for 40+ blockchains including Hedera
  - Native multisig functionality
  - Hardware wallet support
  - DeFi integration
  - NFT marketplace

- **Hedera-Specific Features**:
  - HBAR and HTS token management
  - Smart contract interactions
  - Consensus service integration
  - File service operations

- **Multisig Support**:
  - Multi-chain multisig accounts
  - Cross-chain transaction approval
  - Threshold-based execution
  - Multi-device signing

## Third-Party Wallets

### MetaMask
**Via JSON-RPC Relay**

- **Integration Method**: Snaps or JSON-RPC Relay
- **Features**:
  - Ethereum-compatible interface
  - Smart contract interactions
  - Token management
  - dApp connections

- **Hedera Support**:
  - JSON-RPC Relay integration
  - HBAR as native currency
  - HTS token support
  - Smart contract deployment/calling

- **Multisig Considerations**:
  - Use with multisig smart contracts
  - Transaction batching support
  - Custom network configuration

### Kabila
**Mobile-First Hedera Wallet**

- **Features**:
  - Mobile-optimized interface
  - HBAR and token management
  - Smart contract interactions
  - Biometric authentication

- **Multisig Support**:
  - Mobile multisig approvals
  - Push notifications for pending transactions
  - QR code transaction sharing

### Magic Link
**Passwordless Authentication**

- **Features**:
  - Email/SMS-based authentication
  - No seed phrase management
  - Multi-device synchronization
  - Social login options

- **Hedera Integration**:
  - Custodial wallet service
  - Smart contract interactions
  - Token transfers

## Wallet SDK Integration

### WalletConnect Protocol

**Standard Protocol for dApp-Wallet Communication**

```javascript
import { WalletConnect } from '@walletconnect/web3wallet';

// Initialize WalletConnect
const web3wallet = await WalletConnect.init({
  core: new Core({
    projectId: 'your-project-id'
  }),
  metadata: {
    name: 'Echain Wallet SDK',
    description: 'Multisig wallet for Hedera',
    url: 'https://echain.com',
    icons: ['https://echain.com/icon.png']
  }
});

// Handle session proposals
web3wallet.on('session_proposal', async (event) => {
  // Handle multisig wallet connection
  const session = await web3wallet.approveSession({
    id: event.id,
    namespaces: {
      hedera: {
        accounts: [`hedera:testnet:${accountId}`],
        methods: ['hedera_signTransaction', 'hedera_signMessage'],
        events: ['chainChanged', 'accountsChanged']
      }
    }
  });
});
```

### Direct SDK Integration

**For Native Hedera Wallets**

```javascript
import { HashPackConnector } from '@echain/wallet-sdk';

// Initialize connector
const connector = new HashPackConnector({
  appMetadata: {
    name: 'Echain Multisig',
    description: 'Secure multisig wallet',
    icon: 'icon-url'
  }
});

// Connect wallet
const connection = await connector.connect();

// Create multisig transaction
const multisigTx = await connector.createMultisigTransaction({
  to: '0.0.12345',
  value: '100000000', // 1 HBAR
  data: '0x',
  signers: ['0.0.11111', '0.0.22222', '0.0.33333'],
  threshold: 2
});

// Sign with connected wallet
const signedTx = await connector.signTransaction(multisigTx);
```

## Multisig Wallet Architecture

### Smart Contract Integration

**Multisig Wallet Contract Interface**

```solidity
interface IMultisigWallet {
    function submitProposal(address to, uint256 value, bytes calldata data) external returns (uint256);
    function confirmProposal(uint256 proposalId) external;
    function executeProposal(uint256 proposalId) external;
    function getProposal(uint256 proposalId) external view returns (
        address to,
        uint256 value,
        bytes memory data,
        uint256 confirmations,
        bool executed
    );
    function addSigner(address signer) external;
    function removeSigner(address signer) external;
    function changeThreshold(uint256 newThreshold) external;
}
```

### Transaction Flow

**Complete Multisig Transaction Process**

1. **Proposal Creation**
   - User creates transaction proposal
   - Smart contract stores proposal details
   - Event emitted for signer notification

2. **Signer Approval**
   - Signers review proposal details
   - Individual approvals collected
   - Threshold checking performed

3. **Execution**
   - Once threshold reached, execution triggered
   - Transaction submitted to network
   - Confirmation and finality achieved

### Security Considerations

**Multi-Layer Security**

- **Key Management**: Secure private key storage
- **Transaction Validation**: Verify all transaction parameters
- **Signer Authentication**: Multi-factor authentication
- **Audit Trails**: Complete transaction history
- **Emergency Controls**: Pause and emergency functions

## Hardware Wallet Support

### Ledger Integration

**Ledger Nano S/X Support**

- **Supported Operations**:
  - HBAR transfers
  - HTS token operations
  - Smart contract interactions
  - Multisig transaction signing

- **Integration Libraries**:
  ```javascript
  import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
  import Hedera from "@ledgerhq/hw-app-hedera";

  const transport = await TransportWebUSB.create();
  const hedera = new Hedera(transport);

  const signature = await hedera.signTransaction(
    "testnet",
    accountId,
    transactionBytes
  );
  ```

### Trezor Integration

**Trezor Model T Support**

- **Features**:
  - Native Hedera app
  - Multisig account support
  - Secure transaction signing
  - PIN and passphrase protection

## Mobile Integration

### React Native Support

**Cross-Platform Mobile Development**

```javascript
import { HederaWallet } from '@echain/react-native-wallet';

// Initialize wallet
const wallet = new HederaWallet({
  network: 'testnet',
  appId: 'echain-multisig'
});

// Connect to mobile wallet
const connection = await wallet.connect({
  preferredWallet: 'hashpack' // or 'blade', 'kabila'
});

// Handle multisig operations
const proposal = await wallet.submitMultisigProposal({
  to: recipient,
  value: amount,
  signers: signerAddresses,
  threshold: 2
});
```

### Deep Linking

**Mobile Wallet Deep Links**

```
hashpack://multisig/approve?proposalId=123&contractId=0.0.45678
blade://sign?tx=0x1234567890abcdef
kabila://confirm?sessionId=abc123
```

## Testing and Validation

### Multisig Testing Scenarios

**Comprehensive Test Coverage**

- **Single Signer Approval**: Basic functionality
- **Multiple Signer Approval**: Threshold logic
- **Rejection Scenarios**: Insufficient approvals
- **Execution Validation**: Successful transaction completion
- **Security Tests**: Attempted unauthorized operations

### Integration Testing

**End-to-End Wallet Testing**

```javascript
describe('Multisig Wallet Integration', () => {
  it('should complete full multisig flow', async () => {
    // Setup wallets and contract
    const wallets = await setupTestWallets(3);
    const contract = await deployMultisigContract(wallets, 2);

    // Submit proposal
    const proposalId = await contract.submitProposal(target, value, data);

    // Approve with 2 wallets
    await contract.connect(wallets[0]).confirmProposal(proposalId);
    await contract.connect(wallets[1]).confirmProposal(proposalId);

    // Execute transaction
    await expect(contract.executeProposal(proposalId))
      .to.emit(contract, 'ProposalExecuted');
  });
});
```

## Best Practices

### User Experience
- **Clear Status Indicators**: Show approval progress
- **Push Notifications**: Alert users of pending approvals
- **QR Code Sharing**: Easy transaction sharing
- **Batch Operations**: Group multiple approvals

### Security
- **Cold Storage**: Keep majority keys offline
- **Regular Rotation**: Rotate signer keys periodically
- **Backup Procedures**: Secure backup of multisig configurations
- **Audit Logging**: Complete transaction audit trails

### Performance
- **Gas Optimization**: Minimize transaction costs
- **Caching**: Cache wallet state and balances
- **Batch Processing**: Group multiple operations

## Resources

- [HashPack Documentation](https://hashpack.app/docs)
- [Blade Documentation](https://bladewallet.io/docs)
- [WalletConnect Documentation](https://docs.walletconnect.com)
- [Ledger Hedera App](https://www.ledger.com/hedera)
- [Trezor Hedera Integration](https://trezor.io/hedera)