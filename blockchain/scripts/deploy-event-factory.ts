import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

type MinimalFactory = {
  waitForDeployment?: () => Promise<void>;
  getAddress?: () => Promise<string>;
  eventCount: () => Promise<bigint>;
  isVerifiedOrganizer: (addr: string) => Promise<boolean>;
  platformFeeBps: () => Promise<bigint>;
  treasury: () => Promise<string>;
  createEvent: (...args: unknown[]) => Promise<{ wait: () => Promise<void> }>;
  getEvent: (id: bigint | number | string) => Promise<unknown>;
};

async function main() {
  console.log('🚀 Deploying Echain Event Platform...');

  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying contracts with account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');

  // Deploy EventTicket template first
  console.log('\n📋 Deploying EventTicket template...');
  const EventTicket = await ethers.getContractFactory('EventTicket');
  const eventTicketTemplate = (await EventTicket.deploy()) as unknown as MinimalFactory;
  await eventTicketTemplate.waitForDeployment?.();
  console.log('✅ EventTicket template deployed to:', await eventTicketTemplate.getAddress?.());

  // Set treasury address (for now, use deployer address)
  const treasuryAddress = deployer.address;

  // Deploy EventFactory
  console.log('\n🏭 Deploying EventFactory...');
  const EventFactory = await ethers.getContractFactory('EventFactory');
  // Deploy as a minimally-typed contract to avoid TypeChain mismatches in this script
  const eventFactory = (await EventFactory.deploy(
    await eventTicketTemplate.getAddress?.(),
    treasuryAddress,
  )) as unknown as MinimalFactory;
  await eventFactory.waitForDeployment?.();
  console.log('✅ EventFactory deployed to:', await eventFactory.getAddress?.());

  // Verify deployment
  console.log('\n🔍 Verifying deployment...');
  const eventCount = await eventFactory.eventCount();
  const isDeployerVerified = await eventFactory.isVerifiedOrganizer(deployer.address);
  const platformFee = await eventFactory.platformFeeBps();

  console.log('📊 Initial state:');
  console.log('  - Event count:', eventCount.toString());
  console.log('  - Deployer verified:', isDeployerVerified);
  console.log('  - Platform fee:', platformFee.toString(), 'bps');
  console.log('  - Treasury:', await eventFactory.treasury());

  // Create a test event to verify functionality
  console.log('\n🎪 Creating test event...');
  const testEventTx = await eventFactory.createEvent(
    'Echain Launch Event',
    'ipfs://QmTestMetadata123',
    ethers.parseEther('0.01'),
    100,
    Math.floor(Date.now() / 1000) + 86400,
    Math.floor(Date.now() / 1000) + 86400 + 7200,
  );
  await testEventTx.wait();

  // Read the new event count and fetch the latest event by id
  const updatedCount = await eventFactory.eventCount();
  const eventId = updatedCount; // event IDs start at 1 and eventCount reflects total events

  try {
    const eventDetails: unknown = await eventFactory.getEvent(eventId);
    console.log('✅ Test event created:');
    console.log('  - Event ID:', eventId.toString());

    const asRecord = (v: unknown): Record<string, unknown> | null =>
      v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
    const ed = asRecord(eventDetails);
    if (ed) {
      const nameField = ed['name'];
      let name: string | undefined;
      if (typeof nameField === 'string') {
        name = nameField;
      } else if (typeof ed[5] === 'string') {
        name = ed[5];
      } else {
        name = undefined;
      }
      const ticketPrice = ed['ticketPrice'] ?? ed[7];
      const maxTickets = ed['maxTickets'] ?? ed[8];

      console.log('  - Event name:', name ?? 'N/A');
      if (ticketPrice != null) {
        // Print as-is; this is a best-effort display for debugging
        console.log('  - Ticket price (raw):', ticketPrice);
      } else {
        console.log('  - Ticket price: N/A');
      }
      console.log('  - Max tickets:', maxTickets != null ? maxTickets : 'N/A');
    } else {
      console.log('  - Event details not available (untyped contract response)');
    }
  } catch (err) {
    console.warn('Could not fetch event details after creation:', err);
  }

  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n📋 Contract Addresses:');
  console.log('EventFactory:', await eventFactory.getAddress?.());
  console.log('EventTicket Template:', await eventTicketTemplate.getAddress?.());

  console.log('\n🔗 Next steps:');
  console.log('1. Update frontend environment variables with contract addresses');
  console.log('2. Register contracts with MultiBaas');
  console.log('3. Configure CORS origins in MultiBaas console');
  console.log('4. Deploy POAP and Incentive contracts');

  // Save deployment info to file
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      EventFactory: await eventFactory.getAddress?.(),
      EventTicketTemplate: await eventTicketTemplate.getAddress?.(),
    },
    gasUsed: {
      EventTicket: 'N/A', // Gas usage tracking needs different approach in ethers v6
      EventFactory: 'N/A',
    },
  } as const;

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(path.join(deploymentsDir, `deployment-${Date.now()}.json`), JSON.stringify(deploymentInfo, null, 2));

  console.log('💾 Deployment info saved to deployments directory');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
