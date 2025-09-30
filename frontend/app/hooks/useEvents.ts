import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { config } from '../../lib/wagmi';
import { Event } from '../../types/event';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';

// Mock data matching the contract Event struct
const mockEvents: Event[] = [
  {
    id: 1,
    name: "Web3 Developer Conference 2024",
    organizer: "0x1234567890123456789012345678901234567890",
    ticketContract: "0x1111111111111111111111111111111111111111",
    metadataURI: "ipfs://QmWeb3Dev2024",
    ticketPrice: BigInt("100000000000000000"), // 0.1 ETH in wei
    maxTickets: 1200,
    startTime: Math.floor(new Date('2024-03-15T09:00:00').getTime() / 1000),
    endTime: Math.floor(new Date('2024-03-15T17:00:00').getTime() / 1000),
    isActive: true,
    createdAt: Math.floor(new Date('2024-01-01T00:00:00').getTime() / 1000),
    description: "The premier blockchain development conference featuring the latest in DeFi, NFTs, and decentralized technologies.",
    venue: "San Francisco, CA",
    category: "Early Bird"
  },
  {
    id: 2,
    name: "DeFi Summit: Future of Finance",
    organizer: "0x2345678901234567890123456789012345678901",
    ticketContract: "0x2222222222222222222222222222222222222222",
    metadataURI: "ipfs://QmDefiSummit2024",
    ticketPrice: BigInt("80000000000000000"), // 0.08 ETH in wei
    maxTickets: 800,
    startTime: Math.floor(new Date('2024-03-22T10:00:00').getTime() / 1000),
    endTime: Math.floor(new Date('2024-03-22T18:00:00').getTime() / 1000),
    isActive: true,
    createdAt: Math.floor(new Date('2024-01-15T00:00:00').getTime() / 1000),
    description: "Explore the cutting-edge developments in decentralized finance with industry leaders and innovators.",
    venue: "New York, NY",
    category: "Verified"
  },
  {
    id: 3,
    name: "NFT Art & Culture Festival",
    organizer: "0x3456789012345678901234567890123456789012",
    ticketContract: "0x3333333333333333333333333333333333333333",
    metadataURI: "ipfs://QmNFTFestival2024",
    ticketPrice: BigInt("50000000000000000"), // 0.05 ETH in wei
    maxTickets: 500,
    startTime: Math.floor(new Date('2024-04-05T14:00:00').getTime() / 1000),
    endTime: Math.floor(new Date('2024-04-05T22:00:00').getTime() / 1000),
    isActive: true,
    createdAt: Math.floor(new Date('2024-02-01T00:00:00').getTime() / 1000),
    description: "A celebration of digital art, NFT culture, and the creators shaping the metaverse of tomorrow.",
    venue: "Los Angeles, CA",
    category: "Art"
  }
];

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      console.log('[useEvents] Fetching events from contract...');
      try {
        // Get total event count to validate event IDs
        const eventCount = await readContract(config, {
          address: CONTRACT_ADDRESSES.EventFactory as `0x${string}`,
          abi: CONTRACT_ABIS.EventFactory,
          functionName: 'eventCount',
          args: []
        }) as bigint;

        console.log('[useEvents] Total event count:', Number(eventCount));

        // Fetch all events and filter active ones (since getActiveEvents may be unreliable)
        const events: Event[] = [];
        for (let eventId = 1; eventId <= Number(eventCount); eventId++) {
          try {
            const eventData = await readContract(config, {
              address: CONTRACT_ADDRESSES.EventFactory as `0x${string}`,
              abi: CONTRACT_ABIS.EventFactory,
              functionName: 'getEventDetails',
              args: [BigInt(eventId)]
            }) as any;

            // Only include active events
            if (eventData.isActive) {
              const event: Event = {
                id: Number(eventData.id),
                name: eventData.name,
                organizer: eventData.organizer,
                ticketContract: eventData.ticketContract,
                poapContract: eventData.poapContract || undefined,
                incentiveContract: eventData.incentiveContract || undefined,
                metadataURI: eventData.metadataURI,
                ticketPrice: BigInt(eventData.ticketPrice),
                maxTickets: Number(eventData.maxTickets),
                startTime: Number(eventData.startTime),
                endTime: Number(eventData.endTime),
                isActive: eventData.isActive,
                createdAt: Number(eventData.createdAt),
                // Additional fields can be parsed from metadataURI if needed
                description: '',
                venue: '',
                category: 'General'
              };
              events.push(event);
            }
          } catch (error) {
            // Silently skip failed event fetches (expected for non-existent events)
          }
        }

        console.log('[useEvents] Successfully fetched events:', events.length);

        // If no events were fetched from contract, fall back to mock data
        if (events.length === 0) {
          console.log('[useEvents] No events found on contract, using mock data');
          return mockEvents;
        }

        return events;
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to mock data if contract call fails
        console.log('[useEvents] Falling back to mock data');
        return mockEvents;
      }
    },
    // Set stale time to prevent excessive refetching
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useEventsByOrganizer = (organizer?: string) => {
  const { address } = useAccount();
  const targetOrganizer = organizer || address;

  return useQuery({
    queryKey: ['events', 'organizer', targetOrganizer],
    queryFn: async (): Promise<Event[]> => {
      if (!targetOrganizer) return [];

      try {
        // Get total event count to validate event IDs
        const eventCount = await readContract(config, {
          address: CONTRACT_ADDRESSES.EventFactory as `0x${string}`,
          abi: CONTRACT_ABIS.EventFactory,
          functionName: 'eventCount',
          args: []
        }) as bigint;

        // Fetch all events and filter by organizer and active status
        const events: Event[] = [];
        for (let eventId = 1; eventId <= Number(eventCount); eventId++) {
          try {
            const eventData = await readContract(config, {
              address: CONTRACT_ADDRESSES.EventFactory as `0x${string}`,
              abi: CONTRACT_ABIS.EventFactory,
              functionName: 'getEventDetails',
              args: [BigInt(eventId)]
            }) as any;

            // Only include active events owned by this organizer
            if (eventData.isActive && eventData.organizer.toLowerCase() === targetOrganizer.toLowerCase()) {
              const event: Event = {
                id: Number(eventData.id),
                name: eventData.name,
                organizer: eventData.organizer,
                ticketContract: eventData.ticketContract,
                poapContract: eventData.poapContract || undefined,
                incentiveContract: eventData.incentiveContract || undefined,
                metadataURI: eventData.metadataURI,
                ticketPrice: BigInt(eventData.ticketPrice),
                maxTickets: Number(eventData.maxTickets),
                startTime: Number(eventData.startTime),
                endTime: Number(eventData.endTime),
                isActive: eventData.isActive,
                createdAt: Number(eventData.createdAt),
                description: '',
                venue: '',
                category: 'General'
              };
              events.push(event);
            }
          } catch (error) {
            // Silently skip failed event fetches
          }
        }

        // If no events were fetched from contract, fall back to mock data
        if (events.length === 0) {
          console.log('[useEventsByOrganizer] No events found on contract, using mock data');
          return mockEvents.filter(event => 
            event.organizer.toLowerCase() === targetOrganizer.toLowerCase()
          );
        }

        return events;
      } catch (error) {
        console.error('Error fetching organizer events:', error);
        // Fallback to mock data filtered by organizer
        return mockEvents.filter(event => 
          event.organizer.toLowerCase() === targetOrganizer.toLowerCase()
        );
      }
    },
    enabled: !!targetOrganizer,
  });
};

export const useEvent = (eventId: number) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async (): Promise<Event | null> => {
      if (!eventId) return null;

      try {
        // Get total event count to validate event ID
        const eventCount = await readContract(config, {
          address: CONTRACT_ADDRESSES.EventFactory as `0x${string}`,
          abi: CONTRACT_ABIS.EventFactory,
          functionName: 'eventCount',
          args: []
        }) as bigint;

        // Validate eventId
        if (Number(eventId) <= 0 || Number(eventId) > Number(eventCount)) {
          console.warn(`[useEvent] Invalid event ID ${eventId}, eventCount: ${Number(eventCount)}`);
          return null;
        }

        const eventData = await readContract(config, {
          address: CONTRACT_ADDRESSES.EventFactory as `0x${string}`,
          abi: CONTRACT_ABIS.EventFactory,
          functionName: 'getEventDetails',
          args: [BigInt(eventId)]
        }) as any;

        // Convert contract data to Event interface
        const event: Event = {
          id: Number(eventData.id),
          name: eventData.name,
          organizer: eventData.organizer,
          ticketContract: eventData.ticketContract,
          poapContract: eventData.poapContract || undefined,
          incentiveContract: eventData.incentiveContract || undefined,
          metadataURI: eventData.metadataURI,
          ticketPrice: BigInt(eventData.ticketPrice),
          maxTickets: Number(eventData.maxTickets),
          startTime: Number(eventData.startTime),
          endTime: Number(eventData.endTime),
          isActive: eventData.isActive,
          createdAt: Number(eventData.createdAt),
          description: '',
          venue: '',
          category: 'General'
        };

        return event;
      } catch (error) {
        console.error('Error fetching event:', error);
        // Fallback to mock data
        const event = mockEvents.find(e => e.id === eventId);
        return event || null;
      }
    },
    enabled: !!eventId,
  });
};
