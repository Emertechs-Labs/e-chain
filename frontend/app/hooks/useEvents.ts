import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Event } from '../../types/event';

// Mock data matching the screenshots
const mockEvents: Event[] = [
  {
    id: 1,
    name: "Web3 Developer Conference 2024",
    symbol: "WEB3DEV24",
    organizer: "0x1234567890123456789012345678901234567890",
    ticketContract: "0x1111111111111111111111111111111111111111",
    maxTickets: 1200,
    ticketPrice: BigInt("100000000000000000"), // 0.1 ETH in wei
    saleEndTime: Math.floor(new Date('2024-03-15T09:00:00').getTime() / 1000),
    isActive: true,
    description: "The premier blockchain development conference featuring the latest in DeFi, NFTs, and decentralized technologies.",
    venue: "San Francisco, CA",
    category: "Early Bird"
  },
  {
    id: 2,
    name: "DeFi Summit: Future of Finance",
    symbol: "DEFI24",
    organizer: "0x2345678901234567890123456789012345678901",
    ticketContract: "0x2222222222222222222222222222222222222222",
    maxTickets: 800,
    ticketPrice: BigInt("80000000000000000"), // 0.08 ETH in wei
    saleEndTime: Math.floor(new Date('2024-03-22T10:00:00').getTime() / 1000),
    isActive: true,
    description: "Explore the cutting-edge developments in decentralized finance with industry leaders and innovators.",
    venue: "New York, NY",
    category: "Verified"
  },
  {
    id: 3,
    name: "NFT Art & Culture Festival",
    symbol: "NFTART24",
    organizer: "0x3456789012345678901234567890123456789012",
    ticketContract: "0x3333333333333333333333333333333333333333",
    maxTickets: 500,
    ticketPrice: BigInt("50000000000000000"), // 0.05 ETH in wei
    saleEndTime: Math.floor(new Date('2024-04-05T14:00:00').getTime() / 1000),
    isActive: true,
    description: "A celebration of digital art, NFT culture, and the creators shaping the metaverse of tomorrow.",
    venue: "Los Angeles, CA",
    category: "Art"
  }
];

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockEvents;
    },
  });
};

export const useEventsByOrganizer = (organizer?: string) => {
  const { address } = useAccount();
  const targetOrganizer = organizer || address;

  return useQuery({
    queryKey: ['events', 'organizer', targetOrganizer],
    queryFn: async (): Promise<Event[]> => {
      // Filter mock events by organizer
      if (!targetOrganizer) return [];
      return mockEvents.filter(event => 
        event.organizer.toLowerCase() === targetOrganizer.toLowerCase()
      );
    },
    enabled: !!targetOrganizer,
  });
};

export const useEvent = (eventId: number) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async (): Promise<Event | null> => {
      // Find mock event by ID
      const event = mockEvents.find(e => e.id === eventId);
      return event || null;
    },
    enabled: !!eventId,
  });
};
