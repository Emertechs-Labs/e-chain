import { useQuery } from '@tanstack/react-query';
import { Event } from '../../types/event';
import { useEvent } from './useEvents';
import { getMockEventById, isMockEvent } from '../../lib/mockEvents';

/**
 * Hook that fetches either a blockchain event or a mock event based on ID
 */
export function useCombinedEvent(eventId: number) {
  // Check if it's a mock event
  const isMock = isMockEvent(eventId);
  
  // Fetch blockchain event (will be disabled if it's a mock event)
  const blockchainEventQuery = useEvent(eventId);
  
  // Fetch mock event
  const mockEventQuery = useQuery({
    queryKey: ['mock-event', eventId],
    queryFn: async (): Promise<Event | null> => {
      if (!isMock) return null;
      
      const mockEvent = getMockEventById(eventId);
      if (!mockEvent) return null;
      
      // Return the mock event with all required Event fields
      return {
        id: mockEvent.id!,
        name: mockEvent.name!,
        organizer: mockEvent.organizer!,
        ticketContract: mockEvent.ticketContract || "0x0000000000000000000000000000000000000000",
        metadataURI: mockEvent.metadataURI || "",
        ticketPrice: mockEvent.ticketPrice || BigInt(0),
        maxTickets: mockEvent.maxTickets || 100,
        startTime: mockEvent.startTime || 0,
        endTime: mockEvent.endTime || 0,
        isActive: mockEvent.isActive !== undefined ? mockEvent.isActive : true,
        createdAt: mockEvent.createdAt || Date.now() / 1000,
        ...mockEvent
      } as Event;
    },
    enabled: isMock,
    staleTime: Infinity, // Mock data doesn't change
  });
  
  // Return the appropriate data
  if (isMock) {
    return {
      data: mockEventQuery.data,
      isLoading: mockEventQuery.isLoading,
      error: mockEventQuery.error,
      refetch: mockEventQuery.refetch
    };
  }
  
  return {
    data: blockchainEventQuery.data,
    isLoading: blockchainEventQuery.isLoading,
    error: blockchainEventQuery.error,
    refetch: blockchainEventQuery.refetch
  };
}
