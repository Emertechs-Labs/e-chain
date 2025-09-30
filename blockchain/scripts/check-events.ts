import { ethers } from 'ethers';

// Contract addresses from Base Sepolia deployment
const CONTRACT_ADDRESSES = {
  EventFactory: '0xbE36039Bfe7f48604F73daD61411459B17fd2e85',
};

// EventFactory ABI (minimal for querying)
const EVENT_FACTORY_ABI = [
  'function eventCount() external view returns (uint256)',
  'function getOrganizerEvents(address organizer) external view returns (uint256[] memory)',
  'function getEventDetails(uint256 eventId) external view returns (tuple(uint256 id, address organizer, address ticketContract, address poapContract, address incentiveContract, string name, string metadataURI, uint256 ticketPrice, uint256 maxTickets, uint256 startTime, uint256 endTime, bool isActive, uint256 createdAt) memory)',
];

interface EventDetails {
  id: bigint;
  organizer: string;
  ticketContract: string;
  poapContract: string;
  incentiveContract: string;
  name: string;
  metadataURI: string;
  ticketPrice: bigint;
  maxTickets: bigint;
  startTime: bigint;
  endTime: bigint;
  isActive: boolean;
  createdAt: bigint;
}

async function checkEvents(organizerAddress: string) {
  console.log('🔍 Checking events for organizer on Base Sepolia...');

  // Setup provider
  const rpcUrl = process.env.BASE_TESTNET_RPC_URL || 'https://sepolia.base.org';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  console.log(`📋 Checking organizer: ${organizerAddress}`);

  // Connect to EventFactory contract
  const eventFactory = new ethers.Contract(CONTRACT_ADDRESSES.EventFactory, EVENT_FACTORY_ABI, provider);

  try {
    // Get total event count
    const eventCount: bigint = (await eventFactory.eventCount()) as bigint;
    console.log(`📊 Total events created: ${eventCount.toString()}`);

    // Get organizer's events
    const organizerEvents: bigint[] = (await eventFactory.getOrganizerEvents(organizerAddress)) as bigint[];
    console.log(`👤 Organizer's events: ${organizerEvents.length} events`);
    console.log(`   Event IDs: ${organizerEvents.map((id: bigint) => id.toString()).join(', ')}`);

    // Get details of each event
    for (const eventId of organizerEvents) {
      try {
        const eventDetails: EventDetails = (await eventFactory.getEventDetails(eventId)) as EventDetails;
        console.log(`\n📅 Event ${eventId.toString()}:`);
        console.log(`   Name: ${eventDetails.name}`);
        console.log(`   Organizer: ${eventDetails.organizer}`);
        console.log(`   Ticket Contract: ${eventDetails.ticketContract}`);
        console.log(`   Active: ${eventDetails.isActive}`);
        console.log(`   Created: ${new Date(Number(eventDetails.createdAt) * 1000).toISOString()}`);
      } catch (error) {
        console.error(`❌ Error fetching event ${eventId.toString()}:`, (error as Error).message);
      }
    }
  } catch (error) {
    console.error('❌ Error checking events:', (error as Error).message);
  }
}

// Main execution
const organizerAddress = process.argv[2] || '0x5474bA789F5CbD31aea2BcA1939989746242680D';
if (!organizerAddress.startsWith('0x') || organizerAddress.length !== 42) {
  console.error('Invalid Ethereum address format');
  process.exit(1);
}

checkEvents(organizerAddress)
  .then(() => {
    console.log('\n✅ Event check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Event check failed:', error);
    process.exit(1);
  });
