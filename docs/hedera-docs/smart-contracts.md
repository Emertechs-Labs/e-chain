# Hedera Smart Contracts

This document covers smart contract development on Hedera, with specific focus on multisig wallet implementation.

## Smart Contract Service Overview

Hedera's Smart Contract Service provides full Ethereum Virtual Machine (EVM) compatibility, allowing developers to deploy and execute Solidity smart contracts.

## Solidity Support

### Supported Versions
- **Solidity 0.8.x**: Latest stable versions supported
- **EVM Version**: Cancun (latest Ethereum hard fork)
- **Optimizations**: Full optimizer support

### Language Features
- **All Solidity syntax**: Complete language support
- **Libraries**: External library linking
- **Inheritance**: Multiple inheritance patterns
- **Modifiers**: Function modifiers for access control
- **Events**: Event logging and monitoring

## Development Environment

### Required Tools
```json
{
  "dependencies": {
    "@hashgraph/smart-contracts": "^0.1.0",
    "@openzeppelin/contracts": "^5.0.0",
    "hardhat": "^2.19.0"
  }
}
```

### Hardhat Configuration
```javascript
require("@hashgraph/hardhat-hedera");

module.exports = {
  solidity: "0.8.26",
  networks: {
    hedera: {
      url: "https://testnet.hashio.io/api",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### Foundry Configuration
```toml
[profile.default]
src = "contracts"
out = "artifacts"
libs = ["lib"]

[rpc_endpoints]
hedera_testnet = "https://testnet.hashio.io/api"
```

## Contract Deployment

### Deployment Process
1. **Compile contracts** using Solidity compiler
2. **Estimate gas costs** for deployment
3. **Sign deployment transaction** with private key
4. **Submit to network** via JSON-RPC Relay
5. **Verify deployment** and get contract address

### Deployment Script Example
```javascript
const { ethers } = require("hardhat");

async function main() {
  const MultisigWallet = await ethers.getContractFactory("MultisigWallet");
  const contract = await MultisigWallet.deploy(requiredConfirmations, owners);
  await contract.deployed();

  console.log("MultisigWallet deployed to:", contract.address);
}
```

## Precompiled Contracts

Hedera provides several precompiled contracts for optimized cryptographic operations:

### ECDSA Operations
```solidity
// secp256k1 signature verification
function ecdsaVerify(bytes32 hash, bytes signature, bytes publicKey) external returns (bool);
```

### ED25519 Operations
```solidity
// Ed25519 signature verification
function ed25519Verify(bytes32 hash, bytes signature, bytes publicKey) external returns (bool);
```

### Cryptographic Hashing
```solidity
// SHA-256, SHA-384, SHA-512, Keccak-256
function sha256(bytes memory data) external returns (bytes32);
function keccak256(bytes memory data) external returns (bytes32);
```

### Pseudo-Random Number Generation
```solidity
// CSPRNG for randomness
function prng() external returns (uint256);
```

## Multisig Contract Architecture

### Core Components

#### 1. Proposal System
```solidity
struct Proposal {
    address to;
    uint256 value;
    bytes data;
    uint256 confirmations;
    bool executed;
    uint256 timestamp;
}
```

#### 2. Access Control
```solidity
modifier onlyOwner() {
    require(isOwner[msg.sender], "Not an owner");
    _;
}

modifier notExecuted(uint256 proposalId) {
    require(!proposals[proposalId].executed, "Already executed");
    _;
}
```

#### 3. Confirmation Logic
```solidity
function confirmProposal(uint256 proposalId) external onlyOwner notExecuted(proposalId) {
    require(!confirmations[proposalId][msg.sender], "Already confirmed");

    confirmations[proposalId][msg.sender] = true;
    proposals[proposalId].confirmations++;

    emit ProposalConfirmed(proposalId, msg.sender);

    if (proposals[proposalId].confirmations >= requiredConfirmations) {
        executeProposal(proposalId);
    }
}
```

#### 4. Execution Logic
```solidity
function executeProposal(uint256 proposalId) internal notExecuted(proposalId) {
    Proposal storage proposal = proposals[proposalId];
    require(proposal.confirmations >= requiredConfirmations, "Not enough confirmations");

    proposal.executed = true;
    proposal.timestamp = block.timestamp;

    (bool success,) = proposal.to.call{value: proposal.value}(proposal.data);
    require(success, "Execution failed");

    emit ProposalExecuted(proposalId);
}
```

### Security Features

#### Reentrancy Protection
```solidity
modifier nonReentrant() {
    require(!locked, "Reentrant call");
    locked = true;
    _;
    locked = false;
}
```

#### Timelock Functionality
```solidity
function queueProposal(uint256 proposalId) external onlyOwner {
    require(proposals[proposalId].confirmations >= requiredConfirmations, "Not confirmed");
    queuedProposals[proposalId] = block.timestamp + timelockDelay;
}

function executeQueuedProposal(uint256 proposalId) external {
    require(block.timestamp >= queuedProposals[proposalId], "Timelock not expired");
    require(queuedProposals[proposalId] != 0, "Not queued");

    executeProposal(proposalId);
    delete queuedProposals[proposalId];
}
```

#### Emergency Functions
```solidity
function pause() external onlyOwner {
    _pause();
}

function unpause() external onlyOwner {
    _unpause();
}
```

## Gas Optimization

### Storage Optimization
- **Pack variables**: Use uint8, uint16, etc. when possible
- **Short-circuiting**: Order conditions by likelihood
- **Delete unused data**: Remove mappings when no longer needed

### Function Optimization
- **External over public**: Use external for large parameters
- **Memory vs storage**: Minimize storage operations
- **Loop optimization**: Unroll small loops, cache array lengths

### Contract Size Optimization
- **Library usage**: Extract common code to libraries
- **Contract splitting**: Split large contracts when necessary
- **Dead code elimination**: Remove unused functions

## Testing Strategy

### Unit Tests
```javascript
describe("MultisigWallet", function () {
  it("Should submit proposal", async function () {
    const { multisig, owner1 } = await loadFixture(deployFixture);

    await expect(multisig.connect(owner1).submitProposal(target.address, 0, data))
      .to.emit(multisig, "ProposalSubmitted");
  });
});
```

### Integration Tests
- **Cross-contract calls**: Test interactions between contracts
- **Token transfers**: Test HBAR and HTS token operations
- **Precompile usage**: Test cryptographic operations

### Gas Tests
```javascript
it("Should not exceed gas limit", async function () {
  const tx = await multisig.executeProposal(proposalId);
  const receipt = await tx.wait();

  expect(receipt.gasUsed).to.be.lessThan(300000);
});
```

## Deployment and Verification

### Contract Verification
```javascript
// Using Hardhat
await hre.run("verify:verify", {
  address: contractAddress,
  constructorArguments: [arg1, arg2],
});
```

### Source Code Storage
- **IPFS**: Store contract source code on IPFS
- **Hedera File Service**: Store ABIs and metadata
- **Contract registry**: Maintain deployment records

## Monitoring and Maintenance

### Event Monitoring
```javascript
contract.on("ProposalSubmitted", (proposalId, proposer) => {
  console.log(`Proposal ${proposalId} submitted by ${proposer}`);
});
```

### Upgrade Patterns
- **Proxy patterns**: Use upgradeable contracts
- **Migration scripts**: Handle state transitions
- **Version management**: Track contract versions

## Best Practices

### Security
- **Input validation**: Validate all inputs
- **Access control**: Implement proper permissions
- **Overflow protection**: Use SafeMath or Solidity 0.8+
- **Audit regularly**: Conduct security audits

### Performance
- **Gas optimization**: Minimize transaction costs
- **Caching**: Cache expensive operations
- **Batching**: Group multiple operations

### Maintainability
- **Documentation**: Document all functions and events
- **Testing**: Comprehensive test coverage
- **Code review**: Peer review all changes

## Resources

- [Smart Contracts Documentation](https://docs.hedera.com/guides/sdks/smart-contracts)
- [Solidity Documentation](https://docs.soliditylang.org)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Hardhat Documentation](https://hardhat.org/docs)