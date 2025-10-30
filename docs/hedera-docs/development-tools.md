# Hedera Development Tools

This document covers development tools and resources available for Hedera integration, with focus on multisig wallet development.

## Core Development Tools

### Hedera SDKs

**Official SDK Collection**

#### JavaScript/TypeScript SDK
```javascript
import {
  Client,
  AccountId,
  PrivateKey,
  ContractCreateTransaction,
  ContractExecuteTransaction
} from "@hashgraph/sdk";

// Initialize client
const client = Client.forTestnet();
client.setOperator(accountId, privateKey);

// Deploy multisig contract
const contractTx = new ContractCreateTransaction()
  .setBytecode(contractBytecode)
  .setConstructorParameters(params)
  .setGas(1000000);

const response = await contractTx.execute(client);
const receipt = await response.getReceipt(client);
console.log("Contract deployed at:", receipt.contractId);
```

#### Smart Contracts SDK
```javascript
import {
  ContractService,
  ContractCreateTransaction,
  ContractExecuteTransaction
} from "@hashgraph/smart-contracts";

// Enhanced smart contract operations
const contractService = new ContractService(client);

const result = await contractService.callContractFunction(
  contractId,
  "submitProposal",
  [targetAddress, amount, data]
);
```

### Development Frameworks

#### Hardhat
**Ethereum Development Environment for Hedera**

```javascript
// hardhat.config.js
require("@hashgraph/hardhat-hedera");

module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hedera: {
      url: "https://testnet.hashio.io/api",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000
    }
  },
  hedera: {
    consensus: true,
    tokens: true,
    files: true
  }
};
```

**Hardhat Tasks for Multisig**
```javascript
// tasks/deploy-multisig.js
task("deploy-multisig", "Deploy multisig wallet contract")
  .addParam("owners", "Comma-separated list of owner addresses")
  .addParam("threshold", "Required confirmations")
  .setAction(async (taskArgs) => {
    const MultisigWallet = await ethers.getContractFactory("MultisigWallet");
    const owners = taskArgs.owners.split(",");
    const contract = await MultisigWallet.deploy(taskArgs.threshold, owners);
    await contract.deployed();
    console.log("MultisigWallet deployed to:", contract.address);
  });
```

#### Foundry
**Rust-based Ethereum Development Framework**

```toml
# foundry.toml
[profile.default]
src = "contracts"
out = "artifacts"
libs = ["lib"]
solc_version = "0.8.26"

[fmt]
line_length = 100
tab_width = 4

[rpc_endpoints]
hedera_testnet = "https://testnet.hashio.io/api"
hedera_mainnet = "https://mainnet.hashio.io/api"
```

**Foundry Script for Deployment**
```solidity
// scripts/DeployMultisigWallet.s.sol
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../contracts/MultisigWallet.sol";

contract DeployMultisigWallet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address[] memory owners = new address[](3);
        owners[0] = vm.envAddress("OWNER_1");
        owners[1] = vm.envAddress("OWNER_2");
        owners[2] = vm.envAddress("OWNER_3");

        MultisigWallet multisig = new MultisigWallet(2, owners);

        vm.stopBroadcast();

        console.log("MultisigWallet deployed at:", address(multisig));
    }
}
```

## Testing Frameworks

### Hardhat Testing
```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultisigWallet", function () {
  let multisig, owner1, owner2, owner3;

  beforeEach(async function () {
    [owner1, owner2, owner3] = await ethers.getSigners();
    const MultisigWallet = await ethers.getContractFactory("MultisigWallet");
    multisig = await MultisigWallet.deploy(2, [owner1.address, owner2.address, owner3.address]);
  });

  it("Should submit proposal", async function () {
    await expect(multisig.connect(owner1).submitProposal(
      owner2.address,
      ethers.utils.parseEther("1"),
      "0x"
    )).to.emit(multisig, "ProposalSubmitted");
  });

  it("Should execute proposal with sufficient confirmations", async function () {
    const tx = await multisig.connect(owner1).submitProposal(
      owner2.address,
      ethers.utils.parseEther("1"),
      "0x"
    );
    const receipt = await tx.wait();
    const proposalId = receipt.events[0].args.proposalId;

    await multisig.connect(owner1).confirmProposal(proposalId);
    await multisig.connect(owner2).confirmProposal(proposalId);

    await expect(multisig.executeProposal(proposalId))
      .to.emit(multisig, "ProposalExecuted");
  });
});
```

### Foundry Testing
```solidity
// test/MultisigWallet.t.sol
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/MultisigWallet.sol";

contract MultisigWalletTest is Test {
    MultisigWallet multisig;
    address[] owners;
    address owner1 = address(0x1);
    address owner2 = address(0x2);
    address owner3 = address(0x3);

    function setUp() public {
        owners = [owner1, owner2, owner3];
        multisig = new MultisigWallet(2, owners);
    }

    function testSubmitProposal() public {
        vm.prank(owner1);
        vm.expectEmit(true, true, true, true);
        emit ProposalSubmitted(0, owner1, address(this), 0, "0x");
        multisig.submitProposal(address(this), 0, "0x");
    }

    function testExecuteProposal() public {
        vm.prank(owner1);
        uint256 proposalId = multisig.submitProposal(address(this), 0, "0x");

        vm.prank(owner1);
        multisig.confirmProposal(proposalId);

        vm.prank(owner2);
        multisig.confirmProposal(proposalId);

        vm.expectEmit(true, true, true, true);
        emit ProposalExecuted(proposalId);
        multisig.executeProposal(proposalId);
    }
}
```

## Development Environments

### Hedera Playground
**Online IDE for Smart Contract Development**

- **Features**:
  - Built-in Solidity editor
  - Real-time compilation
  - Test account with HBAR
  - Direct deployment to testnet
  - Interactive debugging

- **Multisig Development**:
  - Template contracts available
  - One-click deployment
  - Built-in testing environment
  - Collaboration features

### Local Development Setup

**Complete Local Environment**

```bash
# Install dependencies
npm install @hashgraph/sdk @hashgraph/smart-contracts hardhat

# Initialize Hardhat project
npx hardhat init

# Add Hedera network configuration
# Configure hardhat.config.js as shown above

# Create multisig contract
# Implement MultisigWallet.sol

# Write tests
# Run test suite
npx hardhat test
```

## Monitoring and Debugging

### Mirror Nodes
**Read-Only Access to Network Data**

```javascript
import { MirrorNodeClient } from "@hashgraph/mirror-node";

// Initialize client
const mirrorClient = new MirrorNodeClient("https://testnet.mirrornode.hedera.com");

// Get contract results
const results = await mirrorClient.getContractResults(contractId);

// Get transaction details
const transaction = await mirrorClient.getTransaction(txId);

// Monitor contract events
const events = await mirrorClient.getContractEvents(contractId, {
  "event.name": "ProposalSubmitted"
});
```

### Contract Debugging

**Debugging Tools and Techniques**

```javascript
// Enable debug logging
const client = Client.forTestnet().setLogger(new Logger(LogLevel.Debug));

// Add debug events to contract
event Debug(string message, uint256 value);

// Use in contract functions
emit Debug("Proposal submitted", proposalId);

// Monitor with mirror nodes
const debugEvents = await mirrorClient.getContractEvents(contractId, {
  "event.name": "Debug"
});
```

## Deployment Tools

### Contract Deployment Scripts

**Automated Deployment Pipeline**

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Compile contracts
  await hre.run("compile");

  // Deploy multisig contract
  const MultisigWallet = await hre.ethers.getContractFactory("MultisigWallet");
  const owners = process.env.OWNERS.split(",");
  const threshold = parseInt(process.env.THRESHOLD);

  const multisig = await MultisigWallet.deploy(threshold, owners);
  await multisig.deployed();

  console.log("MultisigWallet deployed to:", multisig.address);

  // Verify contract
  await hre.run("verify:verify", {
    address: multisig.address,
    constructorArguments: [threshold, owners]
  });

  // Save deployment info
  const deployment = {
    address: multisig.address,
    owners: owners,
    threshold: threshold,
    network: hre.network.name,
    timestamp: Date.now()
  };

  fs.writeFileSync("deployments/latest.json", JSON.stringify(deployment, null, 2));
}
```

### Continuous Integration

**CI/CD Pipeline for Multisig Contracts**

```yaml
# .github/workflows/deploy.yml
name: Deploy Multisig Contract

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx hardhat test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx hardhat run scripts/deploy.js --network hedera
```

## Performance Optimization

### Gas Optimization Tools

**Contract Size and Gas Analysis**

```javascript
// Check contract size
const contractSize = await hre.ethers.provider.getCode(contractAddress);
console.log("Contract size:", contractSize.length / 2 - 1, "bytes");

// Estimate gas for functions
const gasEstimate = await multisig.estimateGas.submitProposal(target, value, data);
console.log("Gas estimate:", gasEstimate.toString());
```

### Profiling Tools

**Performance Analysis**

```javascript
// Use Tenderly for contract profiling
const tenderly = new Tenderly({
  project: "echain-multisig",
  username: "your-username"
});

// Simulate transaction
const simulation = await tenderly.simulate({
  network_id: "296", // Hedera testnet
  from: signer.address,
  to: multisig.address,
  input: multisig.interface.encodeFunctionData("executeProposal", [proposalId])
});

console.log("Gas used:", simulation.gas_used);
console.log("Execution trace:", simulation.trace);
```

## Security Tools

### Static Analysis

**Automated Security Scanning**

```bash
# Install Slither
pip install slither-analyzer

# Run analysis
slither contracts/MultisigWallet.sol

# Check for vulnerabilities
slither-check-upgradeability contracts/MultisigWallet.sol
```

### Fuzzing

**Property-Based Testing**

```solidity
// test/MultisigFuzz.t.sol
contract MultisigFuzzTest is Test {
    MultisigWallet multisig;
    address[] owners;

    function setUp() public {
        owners = [address(0x1), address(0x2), address(0x3)];
        multisig = new MultisigWallet(2, owners);
    }

    function testFuzzSubmitProposal(
        address target,
        uint96 value,
        bytes calldata data
    ) public {
        vm.assume(target != address(0));
        vm.assume(value > 0);

        vm.prank(owners[0]);
        uint256 proposalId = multisig.submitProposal(target, value, data);

        (
            address proposalTarget,
            uint256 proposalValue,
            bytes memory proposalData,
            ,
            bool executed
        ) = multisig.getProposal(proposalId);

        assertEq(proposalTarget, target);
        assertEq(proposalValue, value);
        assertEq(proposalData, data);
        assertFalse(executed);
    }
}
```

## Resources

- [Hedera Developer Documentation](https://docs.hedera.com/guides)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Foundry Book](https://book.getfoundry.sh)
- [Hedera Playground](https://playground.hedera.com)
- [Mirror Node API](https://docs.hedera.com/guides/sdks/mirror-node-api)