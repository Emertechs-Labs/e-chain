import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { readContract } from '../../lib/contract-wrapper';
import { Event } from '../../types/event';
import { enrichEventsWithMetadata, enrichEventWithMetadata } from '../../lib/metadata';
import { formatEther } from 'viem';

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      console.log('[useEvents] Fetching events from API...');
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const events = await response.json();
        console.log('[useEvents] Fetched events from API:', events.length);

        // Enrich events with metadata from IPFS
        if (events.length > 0) {
          console.log('[useEvents] Enriching events with metadata...');
          const enrichedEvents = await enrichEventsWithMetadata(events);
          return enrichedEvents;
        }

        return events;
      } catch (error) {
        console.error('Error fetching events from API:', error);
        // Return empty array instead of mock data
        return [];
      }
    },
    // Set stale time to prevent excessive refetching
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
        // First try to get events from database (faster)
        console.log('[useEventsByOrganizer] Trying database first...');
        const dbResponse = await fetch('/api/events');
        if (dbResponse.ok) {
          const allEvents = await dbResponse.json();
          const organizerEvents = allEvents.filter((event: Event) =>
            event.organizer.toLowerCase() === targetOrganizer.toLowerCase()
          );
          if (organizerEvents.length > 0) {
            console.log('[useEventsByOrganizer] Found events in database:', organizerEvents.length);
            // Enrich with metadata
            const enrichedEvents = await enrichEventsWithMetadata(organizerEvents);
            return enrichedEvents;
          }
        }

        // Fallback to blockchain if no events in database
        console.log('[useEventsByOrganizer] No events in database, checking blockchain...');
        const eventCount = await readContract(
          'EventFactory',
          'eventCount',
          []
        ) as bigint;

        const events: Event[] = [];
        for (let eventId = 1; eventId <= Number(eventCount); eventId++) {
          try {
            const eventData = await readContract(
              'EventFactory',
              'events',
              [BigInt(eventId)]
            ) as any;

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
            console.warn(`Failed to fetch event ${eventId}:`, error);
          }
        }

        console.log('[useEventsByOrganizer] Found events on blockchain:', events.length);
        // Enrich with metadata
        const enrichedEvents = await enrichEventsWithMetadata(events);
        return enrichedEvents;
      } catch (error) {
        console.error('Error fetching organizer events:', error);
        return [];
      }
    },
    enabled: !!targetOrganizer,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEvent = (eventId: number) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async (): Promise<Event | null> => {
      if (!eventId) return null;

      try {
        // First try to get event from database (faster and includes webhook data)
        console.log('[useEvent] Trying database first for event:', eventId);
        const dbResponse = await fetch('/api/events');
        if (dbResponse.ok) {
          const allEvents = await dbResponse.json();
          const event = allEvents.find((e: Event) => e.id === eventId);
          if (event) {
            console.log('[useEvent] Found event in database:', event.name);
            // Enrich with metadata
            const enrichedEvent = await enrichEventWithMetadata(event);
            return enrichedEvent;
          }
        }

        // Fallback to blockchain if not in database
        console.log('[useEvent] Event not in database, checking blockchain for event:', eventId);
        const eventCount = await readContract(
          'EventFactory',
          'eventCount',
          []
        ) as bigint;

        // Validate eventId
        if (Number(eventId) <= 0 || Number(eventId) > Number(eventCount)) {
          console.warn(`[useEvent] Invalid event ID ${eventId}, eventCount: ${Number(eventCount)}`);
          return null;
        }

        const eventData = await readContract(
          'EventFactory',
          'events',
          [BigInt(eventId)]
        ) as any;

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

        console.log('[useEvent] Found event on blockchain:', event.name);
        // Enrich with metadata
        const enrichedEvent = await enrichEventWithMetadata(event);
        return enrichedEvent;
      } catch (error) {
        console.error('Error fetching event:', error);
        return null;
      }
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get aggregated metrics for all events by an organizer
export const useOrganizerMetrics = (organizer?: string) => {
  const { address } = useAccount();
  const targetOrganizer = organizer || address;

  return useQuery({
    queryKey: ['organizer-metrics', targetOrganizer],
    queryFn: async () => {
      if (!targetOrganizer) {
        return {
          totalEvents: 0,
          totalTicketsSold: 0,
          totalRevenue: '0',
          totalPOAPClaims: 0
        };
      }

      try {
        // Get all events by this organizer
        const eventsResponse = await fetch('/api/events');
        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch events');
        }

        const allEvents = await eventsResponse.json();
        const organizerEvents = allEvents.filter((event: Event) =>
          event.organizer.toLowerCase() === targetOrganizer.toLowerCase()
        );

        if (organizerEvents.length === 0) {
          return {
            totalEvents: 0,
            totalTicketsSold: 0,
            totalRevenue: '0',
            totalPOAPClaims: 0
          };
        }

        // Aggregate real metrics from blockchain
        let totalTicketsSold = 0;
        let totalRevenue = 0;
        let totalPOAPClaims = 0;

        for (const event of organizerEvents) {
          try {
            if (event.ticketContract) {
              // Get real sold tickets from blockchain
              const soldTickets = await readContract(
                'EventTicket',
                'totalSold',
                [],
                event.ticketContract
              );

              const soldTicketsNum = Number(soldTickets);
              totalTicketsSold += soldTicketsNum;

              // Calculate revenue
              const ticketPrice = Number(formatEther(event.ticketPrice));
              totalRevenue += soldTicketsNum * ticketPrice;

              // Estimate POAP claims (70% claim rate)
              totalPOAPClaims += Math.floor(soldTicketsNum * 0.7);
            }
          } catch (error) {
            console.warn(`Failed to fetch metrics for event ${event.id}:`, error);
            // Continue with other events
          }
        }

        return {
          totalEvents: organizerEvents.length,
          totalTicketsSold,
          totalRevenue: totalRevenue.toFixed(3),
          totalPOAPClaims
        };
      } catch (error) {
        console.error('Error fetching organizer metrics:', error);
        return {
          totalEvents: 0,
          totalTicketsSold: 0,
          totalRevenue: '0',
          totalPOAPClaims: 0
        };
      }
    },
    enabled: !!targetOrganizer,
    staleTime: 2 * 60 * 1000, // 2 minutes - refresh more frequently for metrics
  });
};
