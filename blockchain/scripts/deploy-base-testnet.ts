import { ethers } from "hardhat";
import { EventFactory, EventTicket, IncentiveManager, POAPAttendance } from "../typechain-types";

async function main() {
  console.log("🚀 Starting Echain deployment to Base Testnet...");
  console.log("===============================================");
  
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address;
  const balance = await ethers.provider.getBalance(deployerAddress);
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 Deployment Information:");
  console.log(`  Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`  Deployer: ${deployerAddress}`);
  console.log(`  Balance: ${ethers.formatEther(balance)} ETH`);
  console.log("");
  
  // Verify we're on Base Sepolia testnet
  if (network.chainId !== 84532n) {
    throw new Error(`❌ Wrong network! Expected Base Sepolia (84532), got ${network.chainId}`);
  }
  
  // Security check: Ensure we have enough ETH for deployment
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("❌ Insufficient ETH balance for deployment (need at least 0.01 ETH)");
  }
  
  const deploymentResults = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployerAddress,
    timestamp: new Date().toISOString(),
    contracts: {} as Record<string, string>,
    gasUsed: {} as Record<string, string>,
    blockExplorer: "https://sepolia-explorer.base.org"
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
    console.log("\n🏭 2/4 Deploying EventFactory...");
    const EventFactory = await ethers.getContractFactory("EventFactory");
    const eventFactory = await EventFactory.deploy(ticketAddress, deployerAddress) as unknown as EventFactory;
    await eventFactory.waitForDeployment();
    
    const factoryAddress = await eventFactory.getAddress();
    deploymentResults.contracts.EventFactory = factoryAddress;
    console.log(`✅ EventFactory: ${factoryAddress}`);
    
    // 3. Deploy POAPAttendance
    console.log("\n🏆 3/4 Deploying POAPAttendance...");
    const POAPAttendance = await ethers.getContractFactory("POAPAttendance");
    const poapAttendance = await POAPAttendance.deploy(factoryAddress) as unknown as POAPAttendance;
    await poapAttendance.waitForDeployment();
    
    const poapAddress = await poapAttendance.getAddress();
    deploymentResults.contracts.POAPAttendance = poapAddress;
    console.log(`✅ POAPAttendance: ${poapAddress}`);
    
    // 4. Deploy IncentiveManager
    console.log("\n🎁 4/4 Deploying IncentiveManager...");
    const IncentiveManager = await ethers.getContractFactory("IncentiveManager");
    const incentiveManager = await IncentiveManager.deploy(
      factoryAddress,
      ticketAddress,
      poapAddress
    ) as unknown as IncentiveManager;
    await incentiveManager.waitForDeployment();
    
    const incentiveAddress = await incentiveManager.getAddress();
    deploymentResults.contracts.IncentiveManager = incentiveAddress;
    console.log(`✅ IncentiveManager: ${incentiveAddress}`);
    
    // 5. Configure contracts
    console.log("\n⚙️  Configuring contracts...");
    
    // Set POAP template in factory
    console.log("  - Setting POAP template...");
    const setPoapTx = await eventFactory.setPOAPTemplate(poapAddress);
    await setPoapTx.wait();
    
    // Set Incentive template in factory
    console.log("  - Setting Incentive template...");
    const setIncentiveTx = await eventFactory.setIncentiveTemplate(incentiveAddress);
    await setIncentiveTx.wait();
    
    console.log("✅ Configuration completed");
    
    // 6. Verify deployment
    console.log("\n🔍 Verifying deployment...");
    
    const eventCount = await eventFactory.eventCount();
    const treasury = await eventFactory.treasury();
    const poapTemplate = await eventFactory.poapTemplate();
    const incentiveTemplate = await eventFactory.incentiveTemplate();
    
    console.log("📊 Verification Results:");
    console.log(`  - Event Count: ${eventCount.toString()}`);
    console.log(`  - Treasury: ${treasury}`);
    console.log(`  - POAP Template: ${poapTemplate}`);
    console.log(`  - Incentive Template: ${incentiveTemplate}`);
    
    // 7. Save deployment results
    console.log("\n💾 Saving deployment results...");
    
    const fs = require('fs');
    const path = require('path');
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentsDir, `base-testnet-deployment-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResults, null, 2));
    
    console.log(`✅ Deployment results saved to: ${deploymentFile}`);
    
    // 8. Print summary
    console.log("\n🎉 BASE TESTNET DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("===============================================");
    console.log("📋 Contract Addresses:");
    Object.entries(deploymentResults.contracts).forEach(([name, address]) => {
      console.log(`  ${name}: ${address}`);
      console.log(`  🔗 ${deploymentResults.blockExplorer}/address/${address}`);
    });
    
    console.log("\n🔗 Next Steps:");
    console.log("1. ✅ Verify contracts on Base Sepolia explorer");
    console.log("2. ✅ Update frontend environment variables");
    console.log("3. ✅ Test contract functionality on testnet");
    console.log("4. ✅ Set up monitoring and alerts");
    console.log("5. ✅ Document deployment for team");
    
    console.log("\n📱 Frontend Configuration:");
    console.log("Update your frontend .env file with:");
    console.log(`NEXT_PUBLIC_CHAIN_ID=84532`);
    console.log(`NEXT_PUBLIC_RPC_URL=https://sepolia.base.org`);
    console.log(`NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=${factoryAddress}`);
    console.log(`NEXT_PUBLIC_POAP_ADDRESS=${poapAddress}`);
    console.log(`NEXT_PUBLIC_INCENTIVE_ADDRESS=${incentiveAddress}`);
    
    return deploymentResults;
    
  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED:", error);
    throw error;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
