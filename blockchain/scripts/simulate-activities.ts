import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import type { EventFactory, EventTicket, POAPAttendance, IncentiveManager } from '../../frontend/lib/typechain-types';
import type { EventLog } from 'ethers';

async function simulateEchainActivities() {
  console.log('🚀 Starting Echain Smart Contract Simulation\n');

  // Get signers
  const [owner, organizer, user1, user2, user3] = await ethers.getSigners();
  console.log('👥 Users initialized:');
  console.log(`  Owner: ${owner.address}`);
  console.log(`  Organizer: ${organizer.address}`);
  console.log(`  User1: ${user1.address}`);
  console.log(`  User2: ${user2.address}`);
  console.log(`  User3: ${user3.address}\n`);

  // Deploy contracts
  console.log('📦 Deploying contracts...');

  // First deploy EventTicket template
  const EventTicketTemplate = await ethers.getContractFactory('EventTicket');
  const eventTicketTemplate = await EventTicketTemplate.deploy();
  await eventTicketTemplate.waitForDeployment();
  console.log(`✅ EventTicket Template deployed at: ${await eventTicketTemplate.getAddress()}`);

  // Deploy EventFactory with template and treasury
  const EventFactory = await ethers.getContractFactory('EventFactory');
  const eventFactory = (await EventFactory.deploy(
    await eventTicketTemplate.getAddress(),
    owner.address, // Use owner as treasury for simplicity
  )) as unknown as EventFactory;
  await eventFactory.waitForDeployment();
  console.log(`✅ EventFactory deployed at: ${await eventFactory.getAddress()}`);

  // Deploy POAP template
  const POAPAttendanceFactory = await ethers.getContractFactory('POAPAttendance');
  const poapTemplate = (await POAPAttendanceFactory.deploy(
    await eventFactory.getAddress(),
  )) as unknown as POAPAttendance;
  await poapTemplate.waitForDeployment();
  console.log(`✅ POAP Template deployed at: ${await poapTemplate.getAddress()}`);

  // Deploy IncentiveManager template
  const IncentiveManagerFactory = await ethers.getContractFactory('IncentiveManager');
  const incentiveTemplate = (await IncentiveManagerFactory.deploy(
    await eventFactory.getAddress(),
    await eventTicketTemplate.getAddress(),
    await poapTemplate.getAddress(),
  )) as unknown as IncentiveManager;
  await incentiveTemplate.waitForDeployment();
  console.log(`✅ IncentiveManager Template deployed at: ${await incentiveTemplate.getAddress()}\n`);

  // Initialize EventFactory with templates
  await eventFactory.connect(owner).setPOAPTemplate(await poapTemplate.getAddress());
  await eventFactory.connect(owner).setIncentiveTemplate(await incentiveTemplate.getAddress());
  console.log('✅ Templates configured in EventFactory\n');

  // Organizer verification process
  console.log('🎫 Organizer Verification Process:');
  const verificationFee = await eventFactory.ORGANIZER_VERIFICATION_FEE();
  console.log(`  Verification fee: ${ethers.formatEther(verificationFee)} ETH`);

  const initialOrganizerBalance = await ethers.provider.getBalance(organizer.address);
  console.log(`  Organizer initial balance: ${ethers.formatEther(initialOrganizerBalance)} ETH`);

  await eventFactory.connect(organizer).selfVerifyOrganizer(organizer.address, { value: verificationFee });
  console.log('✅ Organizer verified successfully');

  const finalOrganizerBalance = await ethers.provider.getBalance(organizer.address);
  console.log(`  Organizer final balance: ${ethers.formatEther(finalOrganizerBalance)} ETH\n`);

  // Event creation
  console.log('🎪 Event Creation Process:');

  const currentBlockTime = await time.latest();
  const eventStartTime = currentBlockTime + 7200; // 2 hours from now (increased from 1 hour)
  const eventEndTime = eventStartTime + 7200; // 2 hours duration
  const ticketPrice = ethers.parseEther('0.1'); // 0.1 ETH per ticket
  const maxTickets = 100;

  console.log(`  Event details:`);
  console.log(`    Name: "Summer Music Festival 2025"`);
  console.log(`    Start: ${new Date(eventStartTime * 1000).toLocaleString()}`);
  console.log(`    End: ${new Date(eventEndTime * 1000).toLocaleString()}`);
  console.log(`    Price: ${ethers.formatEther(ticketPrice)} ETH`);
  console.log(`    Max tickets: ${maxTickets}`);

  const createTx = await eventFactory
    .connect(organizer)
    .createEvent(
      'Summer Music Festival 2025',
      'ipfs://event-metadata-hash',
      ticketPrice,
      maxTickets,
      eventStartTime,
      eventEndTime,
    );

  const receipt = await createTx.wait();
  const eventCreatedEvent = receipt?.logs.find((log) => 'fragment' in log && log.fragment?.name === 'EventCreated') as
    | EventLog
    | undefined;
  const eventId = eventCreatedEvent?.args?.[0] as bigint;

  if (!eventId) {
    throw new Error('Event creation failed - no event ID found');
  }

  console.log(`✅ Event created with ID: ${eventId}`);

  // Get event details
  const eventDetails = await eventFactory.events(eventId);
  console.log(`  Event contract: ${eventDetails.ticketContract}`);
  console.log(`  POAP contract: ${eventDetails.poapContract}`);
  console.log(`  Incentive contract: ${eventDetails.incentiveContract}\n`);

  // Get contract instances
  const EventTicket = (await ethers.getContractAt(
    'EventTicket',
    eventDetails.ticketContract,
  )) as unknown as EventTicket;

  // Ticket purchasing simulation
  console.log('🎫 Ticket Purchasing Simulation:');

  // User1 buys 1 ticket (within default limit)
  console.log(`  User1 (${user1.address}) purchasing 1 ticket...`);
  const user1InitialBalance = await ethers.provider.getBalance(user1.address);
  console.log(`    Initial balance: ${ethers.formatEther(user1InitialBalance)} ETH`);

  await EventTicket.connect(user1).purchaseTicket(1, { value: ticketPrice });
  console.log('    ✅ Purchase successful');

  const user1FinalBalance = await ethers.provider.getBalance(user1.address);
  console.log(`    Final balance: ${ethers.formatEther(user1FinalBalance)} ETH`);
  console.log(`    Tickets owned: ${await EventTicket.balanceOf(user1.address)}\n`);

  // User2 buys 1 ticket
  console.log(`  User2 (${user2.address}) purchasing 1 ticket...`);
  await EventTicket.connect(user2).purchaseTicket(1, { value: ticketPrice });
  console.log('    ✅ Purchase successful');
  console.log(`    Tickets owned: ${await EventTicket.balanceOf(user2.address)}\n`);

  // User3 buys 1 ticket
  console.log(`  User3 (${user3.address}) purchasing 1 ticket...`);
  await EventTicket.connect(user3).purchaseTicket(1, { value: ticketPrice });
  console.log('    ✅ Purchase successful');
  console.log(`    Tickets owned: ${await EventTicket.balanceOf(user3.address)}\n`);

  // Check total sold and treasury
  console.log('📊 Event Statistics:');
  console.log(`  Total tickets sold: ${await EventTicket.totalSold()}`);
  console.log(`  Remaining tickets: ${maxTickets - Number(await EventTicket.totalSold())}`);

  const finalTreasuryBalance = await ethers.provider.getBalance(await eventFactory.treasury());
  console.log(`  Treasury balance: ${ethers.formatEther(finalTreasuryBalance)} ETH\n`);

  // Simulate event completion and POAP minting
  console.log('🎭 Event Completion & Basic Validation:');

  // Fast forward time to after event end
  await time.increaseTo(eventEndTime + 3600); // 1 hour after event ends
  console.log('  ⏰ Time advanced to after event completion');

  // Check ticket ownership
  console.log('\n  Final Ticket Balances:');
  console.log(`    User1: ${await EventTicket.balanceOf(user1.address)} tickets`);
  console.log(`    User2: ${await EventTicket.balanceOf(user2.address)} tickets`);
  console.log(`    User3: ${await EventTicket.balanceOf(user3.address)} tickets`);

  // Check total statistics
  console.log(`\n  📊 Event Statistics:`);
  console.log(`    Total tickets sold: ${await EventTicket.totalSold()}`);
  console.log(`    Remaining tickets: ${maxTickets - Number(await EventTicket.totalSold())}`);
  console.log(`    Event active status: ${(await eventFactory.events(eventId)).isActive}`);

  const treasuryBalance = await ethers.provider.getBalance(await eventFactory.treasury());
  console.log(`    Treasury balance: ${ethers.formatEther(treasuryBalance)} ETH\n`);

  // Platform fee calculation
  console.log('\n💸 Platform Fee Summary:');
  const platformFee = await eventFactory.platformFeeBps();
  const totalRevenue = ticketPrice * 3n; // 3 tickets sold
  const expectedFee = (totalRevenue * platformFee) / 10000n; // Fee is in basis points
  console.log(`  Platform fee rate: ${platformFee / 100n}%`);
  console.log(`  Total revenue: ${ethers.formatEther(totalRevenue)} ETH`);
  console.log(`  Platform fee collected: ${ethers.formatEther(expectedFee)} ETH`);

  console.log('\n🎉 Simulation completed successfully!');
  console.log('Smart contract activities demonstrated:');
  console.log('  ✅ Contract deployment');
  console.log('  ✅ Organizer verification');
  console.log('  ✅ Event creation');
  console.log('  ✅ Multi-user ticket purchasing');
  console.log('  ✅ Treasury and fee management');
  console.log('  ✅ Event lifecycle management');
}

// Execute simulation
if (require.main === module) {
  simulateEchainActivities()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Simulation failed:', error);
      process.exit(1);
    });
}

export { simulateEchainActivities };
