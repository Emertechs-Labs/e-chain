import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Event } from '../../types/event';

// Mock data for now since we need the contracts to be deployed first
const mockEvents: Event[] = [
  {
    id: 1,
    name: "Tech Conference 2024",
    symbol: "TECH24",
    organizer: "0x1234567890123456789012345678901234567890",
    ticketContract: "0x1111111111111111111111111111111111111111",
    maxTickets: 500,
    ticketPrice: BigInt("10000000000000000"), // 0.01 ETH in wei
    saleEndTime: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
    isActive: true,
    description: "Annual technology conference featuring the latest innovations",
    venue: "Convention Center",
    category: "Technology"
  },
  {
    id: 2,
    name: "Music Festival",
    symbol: "MUSIC24",
    organizer: "0x2345678901234567890123456789012345678901",
    ticketContract: "0x2222222222222222222222222222222222222222",
    maxTickets: 10000,
    ticketPrice: BigInt("50000000000000000"), // 0.05 ETH in wei
    saleEndTime: Math.floor(Date.now() / 1000) + 86400 * 60, // 60 days from now
    isActive: true,
    description: "Epic music festival with top artists from around the world",
    venue: "Music Park",
    category: "Music"
  },
  {
    id: 3,
    name: "Blockchain Summit",
    symbol: "BLOCK24",
    organizer: "0x3456789012345678901234567890123456789012",
    ticketContract: "0x3333333333333333333333333333333333333333",
    maxTickets: 200,
    ticketPrice: BigInt("20000000000000000"), // 0.02 ETH in wei
    saleEndTime: Math.floor(Date.now() / 1000) + 86400 * 45, // 45 days from now
    isActive: true,
    description: "Learn about the latest blockchain technologies and trends",
    venue: "Innovation Hub",
    category: "Technology"
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
