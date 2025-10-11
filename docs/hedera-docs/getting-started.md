# Getting Started with Hedera Multisig

This guide provides a step-by-step walkthrough for implementing Hedera multisig support in the Echain Wallet SDK.

## Prerequisites

### System Requirements
- Node.js 18+ and npm
- Git
- Hedera test account with HBAR

### Hedera Account Setup
1. **Create Hedera Account**
   ```bash
   # Visit https://portal.hedera.com/
   # Create a new account on testnet
   # Fund with test HBAR from faucet
   ```

2. **Generate Keys**
   ```javascript
   import { PrivateKey, PublicKey } from "@hashgraph/sdk";

   const privateKey = PrivateKey.generateED25519();
   const publicKey = privateKey.publicKey;

   console.log("Private Key:", privateKey.toString());
   console.log("Public Key:", publicKey.toString());
   console.log("Account ID format:", `0.0.${publicKey.toAccountId(0, 0).num}`);
   ```

## Project Setup

### 1. Initialize Blockchain Package
```bash
cd blockchain
npm init -y
```

### 2. Install Dependencies
```bash
npm install @hashgraph/sdk @hashgraph/smart-contracts @openzeppelin/contracts
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @hashgraph/hardhat-hedera
```

### 3. Configure Hardhat
```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("@hashgraph/hardhat-hedera");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.26",
  networks: {
    hedera: {
      url: "https://testnet.hashio.io/api",
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  hedera: {
    gasLimit: 800000
  }
};
```

### 4. Configure Foundry (Alternative)
```toml
# foundry.toml
[profile.default]
src = "contracts"
out = "artifacts"
libs = ["lib"]

[rpc_endpoints]
hedera_testnet = "https://testnet.hashio.io/api"
```

## Multisig Contract Implementation

### 1. Create Interface
```solidity
// contracts/interfaces/IMultisigWallet.sol
pragma solidity ^0.8.26;

interface IMultisigWallet {
    event ProposalSubmitted(uint256 indexed proposalId, address indexed proposer, address indexed target, uint256 value, bytes data);
    event ProposalConfirmed(uint256 indexed proposalId, address indexed confirmer);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalRejected(uint256 indexed proposalId, address indexed rejector);
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    event ThresholdChanged(uint256 oldThreshold, uint256 newThreshold);

    function submitProposal(address target, uint256 value, bytes calldata data) external returns (uint256);
    function confirmProposal(uint256 proposalId) external;
    function rejectProposal(uint256 proposalId) external;
    function executeProposal(uint256 proposalId) external;
    function addSigner(address signer) external;
    function removeSigner(address signer) external;
    function changeThreshold(uint256 newThreshold) external;
    function getProposal(uint256 proposalId) external view returns (address target, uint256 value, bytes memory data, uint256 confirmations, uint256 rejectionCount, bool executed, uint256 timestamp);
    function isSigner(address account) external view returns (bool);
    function getSigners() external view returns (address[] memory);
    function getThreshold() external view returns (uint256);
    function getProposalCount() external view returns (uint256);
}
```

### 2. Implement Core Contract
```solidity
// contracts/core/MultisigWallet.sol
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IMultisigWallet.sol";

contract MultisigWallet is IMultisigWallet, Ownable, Pausable, ReentrancyGuard {
    struct Proposal {
        address target;
        uint256 value;
        bytes data;
        uint256 confirmations;
        uint256 rejectionCount;
        bool executed;
        uint256 timestamp;
        mapping(address => bool) hasConfirmed;
        mapping(address => bool) hasRejected;
    }

    address[] public signers;
    mapping(address => bool) public isSigner;
    uint256 public threshold;
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    modifier onlySigner() {
        require(isSigner[msg.sender], "Not a signer");
        _;
    }

    modifier proposalExists(uint256 proposalId) {
        require(proposalId < proposalCount, "Proposal does not exist");
        _;
    }

    modifier notExecuted(uint256 proposalId) {
        require(!proposals[proposalId].executed, "Proposal already executed");
        _;
    }

    modifier notConfirmed(uint256 proposalId) {
        require(!proposals[proposalId].hasConfirmed[msg.sender], "Already confirmed");
        _;
    }

    modifier notRejected(uint256 proposalId) {
        require(!proposals[proposalId].hasRejected[msg.sender], "Already rejected");
        _;
    }

    constructor(uint256 _threshold, address[] memory _signers) {
        require(_threshold > 0, "Threshold must be greater than 0");
        require(_signers.length >= _threshold, "Not enough signers");
        require(_signers.length > 0, "At least one signer required");

        threshold = _threshold;
        for (uint256 i = 0; i < _signers.length; i++) {
            require(_signers[i] != address(0), "Invalid signer address");
            require(!isSigner[_signers[i]], "Duplicate signer");
            signers.push(_signers[i]);
            isSigner[_signers[i]] = true;
        }

        transferOwnership(msg.sender);
    }

    function submitProposal(address target, uint256 value, bytes calldata data)
        external
        override
        onlySigner
        whenNotPaused
        returns (uint256)
    {
        require(target != address(0), "Invalid target address");

        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.target = target;
        proposal.value = value;
        proposal.data = data;
        proposal.timestamp = block.timestamp;

        emit ProposalSubmitted(proposalId, msg.sender, target, value, data);
        return proposalId;
    }

    function confirmProposal(uint256 proposalId)
        external
        override
        onlySigner
        proposalExists(proposalId)
        notExecuted(proposalId)
        notConfirmed(proposalId)
        whenNotPaused
    {
        Proposal storage proposal = proposals[proposalId];
        proposal.hasConfirmed[msg.sender] = true;
        proposal.confirmations++;

        emit ProposalConfirmed(proposalId, msg.sender);

        if (proposal.confirmations >= threshold) {
            _executeProposal(proposalId);
        }
    }

    function rejectProposal(uint256 proposalId)
        external
        override
        onlySigner
        proposalExists(proposalId)
        notExecuted(proposalId)
        notRejected(proposalId)
        whenNotPaused
    {
        Proposal storage proposal = proposals[proposalId];
        proposal.hasRejected[msg.sender] = true;
        proposal.rejectionCount++;

        emit ProposalRejected(proposalId, msg.sender);

        // Optional: Auto-reject if majority rejects
        if (proposal.rejectionCount > signers.length - threshold) {
            // Proposal effectively rejected
        }
    }

    function executeProposal(uint256 proposalId)
        external
        override
        proposalExists(proposalId)
        notExecuted(proposalId)
        whenNotPaused
        nonReentrant
    {
        require(proposals[proposalId].confirmations >= threshold, "Insufficient confirmations");
        _executeProposal(proposalId);
    }

    function _executeProposal(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;
        proposal.timestamp = block.timestamp;

        (bool success, ) = proposal.target.call{value: proposal.value}(proposal.data);
        require(success, "Execution failed");

        emit ProposalExecuted(proposalId);
    }

    function addSigner(address signer)
        external
        override
        onlyOwner
        whenNotPaused
    {
        require(signer != address(0), "Invalid signer address");
        require(!isSigner[signer], "Already a signer");

        signers.push(signer);
        isSigner[signer] = true;

        emit SignerAdded(signer);
    }

    function removeSigner(address signer)
        external
        override
        onlyOwner
        whenNotPaused
    {
        require(isSigner[signer], "Not a signer");
        require(signers.length > threshold, "Cannot remove signer below threshold");

        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == signer) {
                signers[i] = signers[signers.length - 1];
                signers.pop();
                break;
            }
        }
        isSigner[signer] = false;

        emit SignerRemoved(signer);
    }

    function changeThreshold(uint256 newThreshold)
        external
        override
        onlyOwner
        whenNotPaused
    {
        require(newThreshold > 0, "Threshold must be greater than 0");
        require(newThreshold <= signers.length, "Threshold cannot exceed signer count");

        uint256 oldThreshold = threshold;
        threshold = newThreshold;

        emit ThresholdChanged(oldThreshold, newThreshold);
    }

    function getProposal(uint256 proposalId)
        external
        view
        override
        proposalExists(proposalId)
        returns (address, uint256, bytes memory, uint256, uint256, bool, uint256)
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.target,
            proposal.value,
            proposal.data,
            proposal.confirmations,
            proposal.rejectionCount,
            proposal.executed,
            proposal.timestamp
        );
    }

    function getSigners() external view override returns (address[] memory) {
        return signers;
    }

    function getThreshold() external view override returns (uint256) {
        return threshold;
    }

    function getProposalCount() external view override returns (uint256) {
        return proposalCount;
    }

    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Allow contract to receive HBAR
    receive() external payable {}
}
```

## Deployment

### 1. Create Deployment Script
```javascript
// scripts/deploy-multisig.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const MultisigWallet = await ethers.getContractFactory("MultisigWallet");

  // Example signers - replace with actual addresses
  const signers = [
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44f",
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44g"
  ];
  const threshold = 2;

  const multisig = await MultisigWallet.deploy(threshold, signers);
  await multisig.deployed();

  console.log("MultisigWallet deployed to:", multisig.address);
  console.log("Signers:", signers);
  console.log("Threshold:", threshold);

  // Save deployment info
  const fs = require("fs");
  const deployment = {
    address: multisig.address,
    signers: signers,
    threshold: threshold,
    network: network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync("deployments/multisig.json", JSON.stringify(deployment, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 2. Deploy Contract
```bash
# Set environment variables
export PRIVATE_KEY="your-private-key-here"

# Deploy to testnet
npx hardhat run scripts/deploy-multisig.js --network hedera
```

## Testing

### 1. Create Test File
```javascript
// test/MultisigWallet.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultisigWallet", function () {
  let multisig, owner, signer1, signer2, signer3, nonSigner;

  beforeEach(async function () {
    [owner, signer1, signer2, signer3, nonSigner] = await ethers.getSigners();

    const MultisigWallet = await ethers.getContractFactory("MultisigWallet");
    multisig = await MultisigWallet.deploy(2, [signer1.address, signer2.address, signer3.address]);
    await multisig.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct threshold", async function () {
      expect(await multisig.getThreshold()).to.equal(2);
    });

    it("Should set the correct signers", async function () {
      const signers = await multisig.getSigners();
      expect(signers).to.have.lengthOf(3);
      expect(signers).to.include(signer1.address);
      expect(signers).to.include(signer2.address);
      expect(signers).to.include(signer3.address);
    });
  });

  describe("Proposal Submission", function () {
    it("Should allow signer to submit proposal", async function () {
      await expect(multisig.connect(signer1).submitProposal(
        signer2.address,
        ethers.utils.parseEther("1"),
        "0x"
      )).to.emit(multisig, "ProposalSubmitted");
    });

    it("Should not allow non-signer to submit proposal", async function () {
      await expect(multisig.connect(nonSigner).submitProposal(
        signer2.address,
        ethers.utils.parseEther("1"),
        "0x"
      )).to.be.revertedWith("Not a signer");
    });
  });

  describe("Proposal Confirmation", function () {
    let proposalId;

    beforeEach(async function () {
      const tx = await multisig.connect(signer1).submitProposal(
        signer2.address,
        ethers.utils.parseEther("1"),
        "0x"
      );
      const receipt = await tx.wait();
      proposalId = receipt.events[0].args.proposalId;
    });

    it("Should allow signer to confirm proposal", async function () {
      await expect(multisig.connect(signer1).confirmProposal(proposalId))
        .to.emit(multisig, "ProposalConfirmed");
    });

    it("Should execute proposal when threshold reached", async function () {
      await multisig.connect(signer1).confirmProposal(proposalId);
      await expect(multisig.connect(signer2).confirmProposal(proposalId))
        .to.emit(multisig, "ProposalExecuted");
    });
  });

  describe("Signer Management", function () {
    it("Should allow owner to add signer", async function () {
      await expect(multisig.addSigner(nonSigner.address))
        .to.emit(multisig, "SignerAdded");

      expect(await multisig.isSigner(nonSigner.address)).to.be.true;
    });

    it("Should allow owner to remove signer", async function () {
      await expect(multisig.removeSigner(signer3.address))
        .to.emit(multisig, "SignerRemoved");

      expect(await multisig.isSigner(signer3.address)).to.be.false;
    });
  });
});
```

### 2. Run Tests
```bash
npx hardhat test
```

## Wallet SDK Integration

### 1. Create Multisig Service
```typescript
// frontend/lib/services/multisig.service.ts
import { Client, ContractExecuteTransaction, ContractCallQuery } from "@hashgraph/sdk";

export class MultisigService {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async submitProposal(
    contractId: string,
    target: string,
    value: number,
    data: Uint8Array
  ): Promise<number> {
    const contractExecTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setFunction("submitProposal", [target, value, data])
      .setGas(800000);

    const response = await contractExecTx.execute(this.client);
    const receipt = await response.getReceipt(this.client);

    // Extract proposal ID from transaction (would need event parsing)
    return 0; // Placeholder - implement event parsing
  }

  async confirmProposal(contractId: string, proposalId: number): Promise<void> {
    const contractExecTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setFunction("confirmProposal", [proposalId])
      .setGas(800000);

    await contractExecTx.execute(this.client);
  }

  async getProposal(contractId: string, proposalId: number) {
    const contractQuery = new ContractCallQuery()
      .setContractId(contractId)
      .setFunction("getProposal", [proposalId])
      .setGas(800000);

    const result = await contractQuery.execute(this.client);
    return {
      target: result.getAddress(0),
      value: result.getUint256(1),
      data: result.getBytes(2),
      confirmations: result.getUint256(3),
      executed: result.getBool(5)
    };
  }
}
```

### 2. Create React Hook
```typescript
// frontend/hooks/useMultisig.ts
import { useState, useEffect } from 'react';
import { MultisigService } from '../lib/services/multisig.service';

export interface Proposal {
  id: number;
  target: string;
  value: string;
  data: string;
  confirmations: number;
  executed: boolean;
}

export function useMultisig(contractId: string) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [multisigService] = useState(() => new MultisigService(client));

  const submitProposal = async (target: string, value: string, data: string) => {
    setLoading(true);
    try {
      const proposalId = await multisigService.submitProposal(
        contractId,
        target,
        parseFloat(value),
        new Uint8Array(Buffer.from(data, 'hex'))
      );
      // Refresh proposals
      await loadProposals();
    } finally {
      setLoading(false);
    }
  };

  const confirmProposal = async (proposalId: number) => {
    setLoading(true);
    try {
      await multisigService.confirmProposal(contractId, proposalId);
      await loadProposals();
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async () => {
    // Implementation for loading proposals
  };

  return {
    proposals,
    loading,
    submitProposal,
    confirmProposal
  };
}
```

## Next Steps

1. **Complete Testing**: Run comprehensive test suite
2. **Security Audit**: Conduct security review
3. **UI Development**: Build wallet interface components
4. **Integration Testing**: Test with HashPack and other wallets
5. **Documentation**: Update SDK documentation
6. **Production Deployment**: Deploy to mainnet

## Troubleshooting

### Common Issues

**Contract Deployment Fails**
- Check HBAR balance
- Verify network configuration
- Ensure correct constructor parameters

**Transaction Reverts**
- Check signer permissions
- Verify proposal parameters
- Ensure sufficient confirmations

**SDK Connection Issues**
- Verify network endpoints
- Check API keys and credentials
- Confirm account has HBAR balance

### Getting Help

- [Hedera Developer Discord](https://discord.gg/hedera)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/hedera)
- [GitHub Issues](https://github.com/hashgraph/hedera-sdk-js/issues)

## Resources

- [Complete Hedera Documentation](https://docs.hedera.com)
- [Multisig Contract Examples](https://github.com/hashgraph/hedera-smart-contracts)
- [Echain Wallet SDK Documentation](../README.md)