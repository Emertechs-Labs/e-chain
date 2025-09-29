import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Event } from '../../types/event';
import { callContractRead } from '../../lib/multibaas';
import { CONTRACT_ADDRESSES } from '../../lib/contracts';

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
      try {
        // Get active events from contract (first 50 events)
        const [eventIds] = await callContractRead(
          CONTRACT_ADDRESSES.EventFactory,
          'EventFactory',
          'getActiveEvents',
          [0, 50] // offset 0, limit 50
        );

        // Fetch details for each event
        const events: Event[] = [];
        for (const eventId of eventIds) {
          try {
            const eventData = await callContractRead(
              CONTRACT_ADDRESSES.EventFactory,
              'EventFactory',
              'getEventDetails',
              [eventId]
            );

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
              // Additional fields can be parsed from metadataURI if needed
              description: '',
              venue: '',
              category: 'General'
            };
            events.push(event);
          } catch (error) {
            console.error(`Error fetching event ${eventId}:`, error);
          }
        }

        return events;
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to mock data if contract call fails
        return mockEvents;
      }
    },
    // Disable automatic fetching on mount to prevent connection issues
    enabled: false,
    // Set stale time to prevent refetching
    staleTime: 5 * 60 * 1000, // 5 minutes
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
        // Get event IDs for this organizer
        const eventIds = await callContractRead(
          CONTRACT_ADDRESSES.EventFactory,
          'EventFactory',
          'getOrganizerEvents',
          [targetOrganizer]
        );

        // Fetch details for each event
        const events: Event[] = [];
        for (const eventId of eventIds) {
          try {
            const eventData = await callContractRead(
              CONTRACT_ADDRESSES.EventFactory,
              'EventFactory',
              'getEventDetails',
              [eventId]
            );

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
            events.push(event);
          } catch (error) {
            console.error(`Error fetching event ${eventId}:`, error);
          }
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
        const eventData = await callContractRead(
          CONTRACT_ADDRESSES.EventFactory,
          'EventFactory',
          'getEventDetails',
          [eventId]
        );

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
