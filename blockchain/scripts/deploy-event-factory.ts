import { ethers } from "hardhat";
import { EventFactory } from "../typechain-types";

async function main() {
  console.log("🚀 Deploying Echain Event Platform...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy EventTicket template first
  console.log("\n📋 Deploying EventTicket template...");
  const EventTicket = await ethers.getContractFactory("EventTicket");
  const eventTicketTemplate = await EventTicket.deploy();
  await eventTicketTemplate.waitForDeployment();
  console.log("✅ EventTicket template deployed to:", await eventTicketTemplate.getAddress());

  // Set treasury address (for now, use deployer address)
  const treasuryAddress = deployer.address;

  // Deploy EventFactory
  console.log("\n🏭 Deploying EventFactory...");
  const EventFactory = await ethers.getContractFactory("EventFactory");
  const eventFactory = await EventFactory.deploy(
    await eventTicketTemplate.getAddress(),
    treasuryAddress
  ) as EventFactory;
  await eventFactory.waitForDeployment();
  console.log("✅ EventFactory deployed to:", await eventFactory.getAddress());

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const eventCount = await eventFactory.eventCount();
  const isDeployerVerified = await eventFactory.isVerifiedOrganizer(deployer.address);
  const platformFee = await eventFactory.platformFeeBps();
  
  console.log("📊 Initial state:");
  console.log("  - Event count:", eventCount.toString());
  console.log("  - Deployer verified:", isDeployerVerified);
  console.log("  - Platform fee:", platformFee.toString(), "bps");
  console.log("  - Treasury:", await eventFactory.treasury());

  // Create a test event to verify functionality
  console.log("\n🎪 Creating test event...");
  const testEventTx = await eventFactory.createEvent(
    "Echain Launch Event",
    "ipfs://QmTestMetadata123", // Placeholder IPFS hash
    ethers.parseEther("0.01"), // 0.01 ETH per ticket
    100, // Max 100 tickets
    Math.floor(Date.now() / 1000) + 86400, // Start in 24 hours
    Math.floor(Date.now() / 1000) + 86400 + 7200 // End 2 hours after start
  );
  
  const receipt = await testEventTx.wait();
  const eventCreatedEvent = receipt.events?.find(e => e.event === 'EventCreated');
  
  if (eventCreatedEvent) {
    const eventId = eventCreatedEvent.args?.eventId;
    const ticketContract = eventCreatedEvent.args?.ticketContract;
    
    console.log("✅ Test event created:");
    console.log("  - Event ID:", eventId.toString());
    console.log("  - Ticket contract:", ticketContract);
    
    // Get event details
    const eventDetails = await eventFactory.getEvent(eventId);
    console.log("  - Event name:", eventDetails.name);
    console.log("  - Ticket price:", ethers.formatEther(eventDetails.ticketPrice), "ETH");
    console.log("  - Max tickets:", eventDetails.maxTickets.toString());
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("EventFactory:", await eventFactory.getAddress());
  console.log("EventTicket Template:", await eventTicketTemplate.getAddress());
  
  console.log("\n🔗 Next steps:");
  console.log("1. Update frontend environment variables with contract addresses");
  console.log("2. Register contracts with MultiBaas");
  console.log("3. Configure CORS origins in MultiBaas console");
  console.log("4. Deploy POAP and Incentive contracts");

  // Save deployment info to file
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      EventFactory: await eventFactory.getAddress(),
      EventTicketTemplate: await eventTicketTemplate.getAddress()
    },
    gasUsed: {
      EventTicket: "N/A", // Gas usage tracking needs different approach in ethers v6
      EventFactory: "N/A"
    }
  };

  const fs = require('fs');
  const path = require('path');
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `deployment-${Date.now()}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 Deployment info saved to deployments directory");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
