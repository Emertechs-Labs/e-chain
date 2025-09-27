import { ethers } from "hardhat";
import { EventFactory, EventTicket, IncentiveManager, POAPAttendance } from "../typechain-types";

// Deployment configuration
const DEPLOYMENT_CONFIG = {
  // Platform settings
  PLATFORM_FEE_BPS: 250, // 2.5%
  MAX_TICKET_PRICE: ethers.parseEther("10"), // 10 ETH max per ticket
  
  // Security settings
  EARLY_BIRD_LIMIT: 10,
  
  // Multisig addresses (replace with actual addresses)
  TREASURY_ADDRESS: process.env.TREASURY_ADDRESS || "",
  MULTISIG_ADDRESS: process.env.MULTISIG_ADDRESS || "",
  
  // Testing settings
  CREATE_TEST_EVENT: process.env.NODE_ENV !== "production",
};

async function deployWithVerification() {
  console.log("🚀 Starting Echain Secure Deployment...");
  console.log("===============================================");
  
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address;
  const balance = await ethers.provider.getBalance(deployerAddress);
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 Deployment Information:");
  console.log(`  Network: ${network.name} (${network.chainId})`);
  console.log(`  Deployer: ${deployerAddress}`);
  console.log(`  Balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`  Treasury: ${DEPLOYMENT_CONFIG.TREASURY_ADDRESS || deployerAddress}`);
  console.log("");
  
  // Security check: Ensure we have enough ETH for deployment
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("❌ Insufficient ETH balance for deployment (need at least 0.1 ETH)");
  }
  
  const deploymentResults = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployerAddress,
    timestamp: new Date().toISOString(),
    contracts: {} as any,
    gasUsed: {} as any,
    transactions: [] as any[]
  };
  
  try {
    // 1. Deploy EventTicket Template
    console.log("📋 1/4 Deploying EventTicket Template...");
    const EventTicket = await ethers.getContractFactory("EventTicket");
    const eventTicketTemplate = await EventTicket.deploy();
    await eventTicketTemplate.waitForDeployment();
    
    const ticketAddress = await eventTicketTemplate.getAddress();
    deploymentResults.contracts.EventTicketTemplate = ticketAddress;
    console.log(`✅ EventTicket Template: ${ticketAddress}`);
    
    // 2. Deploy EventFactory
    console.log("\\n🏭 2/4 Deploying EventFactory...");
    const treasuryAddr = DEPLOYMENT_CONFIG.TREASURY_ADDRESS || deployerAddress;
    
    const EventFactory = await ethers.getContractFactory("EventFactory");
    const eventFactory = (await EventFactory.deploy(ticketAddress, treasuryAddr)) as unknown as EventFactory;
    await eventFactory.waitForDeployment();
    
    const factoryAddress = await eventFactory.getAddress();
    deploymentResults.contracts.EventFactory = factoryAddress;
    console.log(`✅ EventFactory: ${factoryAddress}`);
    
    // 3. Deploy POAPAttendance
    console.log("\\n🏆 3/4 Deploying POAPAttendance...");
    const POAPAttendance = await ethers.getContractFactory("POAPAttendance");
    const poapAttendance = await POAPAttendance.deploy(factoryAddress);
    await poapAttendance.waitForDeployment();
    
    const poapAddress = await poapAttendance.getAddress();
    deploymentResults.contracts.POAPAttendance = poapAddress;
    console.log(`✅ POAPAttendance: ${poapAddress}`);
    
    // 4. Deploy IncentiveManager
    console.log("\\n🎁 4/4 Deploying IncentiveManager...");
    const IncentiveManager = await ethers.getContractFactory("IncentiveManager");
    const incentiveManager = await IncentiveManager.deploy(
      factoryAddress,
      ticketAddress, // This is template, will be updated per event
      poapAddress
    );
    await incentiveManager.waitForDeployment();
    
    const incentiveAddress = await incentiveManager.getAddress();
    deploymentResults.contracts.IncentiveManager = incentiveAddress;
    console.log(`✅ IncentiveManager: ${incentiveAddress}`);
    
    // 5. Configure contracts
    console.log("\\n⚙️  Configuring contracts...");
    
    // Set POAP template in factory
    console.log("  - Setting POAP template...");
    await eventFactory.setPOAPTemplate(poapAddress);
    
    // Set Incentive template in factory
    console.log("  - Setting Incentive template...");
    await eventFactory.setIncentiveTemplate(incentiveAddress);
    
    // Set early bird limit in incentive manager
    console.log("  - Setting early bird limit...");
    await incentiveManager.setEarlyBirdLimit(DEPLOYMENT_CONFIG.EARLY_BIRD_LIMIT);
    
    console.log("✅ Configuration completed");
    
    // 6. Verify deployment
    console.log("\\n🔍 Verifying deployment...");
    
    const verificationResults = {
      eventCount: (await eventFactory.eventCount()).toString(),
      platformFee: (await eventFactory.platformFeeBps()).toString(),
      treasury: await eventFactory.treasury(),
      deployer_verified: await eventFactory.isVerifiedOrganizer(deployerAddress),
      poap_template: await eventFactory.poapTemplate(),
      incentive_template: await eventFactory.incentiveTemplate(),
    };
    
    console.log("📊 Verification Results:");
    Object.entries(verificationResults).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });
    
    // 7. Security checks
    console.log("\\n🛡️  Running security checks...");
    
    // Check ownership
    const factoryOwner = await eventFactory.owner();
    const poapOwner = await poapAttendance.owner();
    const incentiveOwner = await incentiveManager.owner();
    
    if (factoryOwner !== deployerAddress) {
      console.warn(`⚠️  WARNING: EventFactory owner mismatch. Expected ${deployerAddress}, got ${factoryOwner}`);
    } else {
      console.log("✅ EventFactory ownership verified");
    }
    
    if (poapOwner !== deployerAddress) {
      console.warn(`⚠️  WARNING: POAPAttendance owner mismatch. Expected ${deployerAddress}, got ${poapOwner}`);
    } else {
      console.log("✅ POAPAttendance ownership verified");
    }
    
    if (incentiveOwner !== deployerAddress) {
      console.warn(`⚠️  WARNING: IncentiveManager owner mismatch. Expected ${deployerAddress}, got ${incentiveOwner}`);
    } else {
      console.log("✅ IncentiveManager ownership verified");
    }
    
    // Test basic functionality
    if (DEPLOYMENT_CONFIG.CREATE_TEST_EVENT) {
      console.log("\\n🧪 Creating test event...");
      
      const testEventTx = await eventFactory.createEvent(
        "Echain Test Event",
        "ipfs://QmTestHash123",
        ethers.parseEther("0.001"), // 0.001 ETH
        10, // Max 10 tickets for testing
        Math.floor(Date.now() / 1000) + 7200, // Start in 2 hours
        Math.floor(Date.now() / 1000) + 14400  // End in 4 hours
      );
      
      const receipt = await testEventTx.wait();
      console.log(`✅ Test event created. Gas used: ${receipt?.gasUsed.toString()}`);
      
      // Verify event creation
      const eventCount = await eventFactory.eventCount();
      if (eventCount > 0) {
        const testEventDetails = await eventFactory.getEvent(1);
        console.log(`📝 Test event details:`);
        console.log(`  - Name: ${testEventDetails.name}`);
        console.log(`  - Ticket Contract: ${testEventDetails.ticketContract}`);
        console.log(`  - Price: ${ethers.formatEther(testEventDetails.ticketPrice)} ETH`);
      }
    }
    
    // 8. Save deployment results
    console.log("\\n💾 Saving deployment results...");
    
    const fs = require('fs');
    const path = require('path');
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentsDir, `deployment-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResults, null, 2));
    
    console.log(`✅ Deployment results saved to: ${deploymentFile}`);
    
    // 9. Generate monitoring script
    generateMonitoringScript(deploymentResults.contracts);
    
    // 10. Print summary
    console.log("\\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("===============================================");
    console.log("📋 Contract Addresses:");
    Object.entries(deploymentResults.contracts).forEach(([name, address]) => {
      console.log(`  ${name}: ${address}`);
    });
    
    console.log("\\n🔗 Next Steps:");
    console.log("1. ✅ Verify contracts on block explorer");
    console.log("2. ✅ Update frontend environment variables");
    console.log("3. ✅ Set up monitoring using generated script");
    console.log("4. ⚠️  Transfer ownership to multisig (CRITICAL for mainnet)");
    console.log("5. ⚠️  Set up emergency procedures");
    console.log("6. ✅ Test all functions on testnet");
    
    if (network.name === "mainnet") {
      console.log("\\n🚨 MAINNET DEPLOYMENT DETECTED!");
      console.log("⚠️  CRITICAL: Transfer ownership to multisig immediately!");
      console.log(`⚠️  CRITICAL: Set platform fee if different from ${DEPLOYMENT_CONFIG.PLATFORM_FEE_BPS} bps`);
    }
    
    return deploymentResults;
    
  } catch (error) {
    console.error("\\n❌ DEPLOYMENT FAILED:", error);
    throw error;
  }
}

function generateMonitoringScript(contracts: any) {
  const monitoringScript = `
// Echain Contract Monitoring Script
// Run this script periodically to monitor contract health

const { ethers } = require("ethers");

const CONTRACTS = ${JSON.stringify(contracts, null, 2)};

const RPC_URL = process.env.RPC_URL || "http://localhost:8545";
const provider = new ethers.JsonRpcProvider(RPC_URL);

async function monitorContracts() {
  console.log("🔍 Monitoring Echain Contracts...");
  console.log("Timestamp:", new Date().toISOString());
  
  try {
    // Check EventFactory
    const eventFactory = new ethers.Contract(
      CONTRACTS.EventFactory,
      ["function eventCount() view returns (uint256)", "function paused() view returns (bool)"],
      provider
    );
    
    const eventCount = await eventFactory.eventCount();
    const isPaused = await eventFactory.paused();
    
    console.log("📊 EventFactory Status:");
    console.log("  - Event Count:", eventCount.toString());
    console.log("  - Paused:", isPaused);
    
    // Check for recent events (last 100 blocks)
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 100);
    
    const filter = eventFactory.filters.EventCreated();
    const events = await eventFactory.queryFilter(filter, fromBlock, currentBlock);
    
    console.log("📝 Recent Events (last 100 blocks):");
    console.log("  - New Events Created:", events.length);
    
    if (events.length > 0) {
      console.log("  - Latest Event ID:", events[events.length - 1].args.eventId.toString());
    }
    
    // Alert conditions
    if (isPaused) {
      console.log("🚨 ALERT: EventFactory is paused!");
    }
    
    if (events.length > 10) {
      console.log("📈 HIGH ACTIVITY: Many events created recently");
    }
    
  } catch (error) {
    console.error("❌ Monitoring failed:", error);
  }
}

// Run monitoring
monitorContracts().catch(console.error);
`;

  const fs = require('fs');
  const path = require('path');
  const monitoringDir = path.join(__dirname, '..', 'monitoring');
  
  if (!fs.existsSync(monitoringDir)) {
    fs.mkdirSync(monitoringDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(monitoringDir, 'monitor.js'), monitoringScript);
  console.log("🖥️  Monitoring script generated at monitoring/monitor.js");
}

// Main execution
async function main() {
  try {
    await deployWithVerification();
  } catch (error) {
    console.error("Deployment process failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { deployWithVerification };
