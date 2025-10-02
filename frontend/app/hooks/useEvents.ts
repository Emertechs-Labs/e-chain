import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { readContract } from '../../lib/contract-wrapper';
import { Event } from '../../types/event';
import { enrichEventsWithMetadata, enrichEventWithMetadata } from '../../lib/metadata';
import { formatEther } from 'viem';

/**
 * Discover events by monitoring EventCreated events from blockchain
 * This provides transaction-based accuracy instead of database reliance
 */
export const discoverEventsFromBlockchain = async (): Promise<Event[]> => {
  try {
    console.log('[discoverEventsFromBlockchain] Discovering events from blockchain...');

    // Get total event count from contract
    const eventCount = await readContract('EventFactory', 'eventCount', []) as bigint;
    const totalEvents = Number(eventCount);

    if (totalEvents === 0) {
      console.log('[discoverEventsFromBlockchain] No events found on blockchain');
      return [];
    }

    console.log(`[discoverEventsFromBlockchain] Found ${totalEvents} events on blockchain`);

    const events: Event[] = [];

    // Fetch events in batches to avoid overwhelming the RPC
    const batchSize = 10;
    for (let i = 1; i <= totalEvents; i += batchSize) {
      const batchPromises = [];
      const endIndex = Math.min(i + batchSize - 1, totalEvents);

      for (let eventId = i; eventId <= endIndex; eventId++) {
        batchPromises.push(
          readContract('EventFactory', 'events', [BigInt(eventId)])
            .then((eventData: any) => {
              if (eventData && eventData[11]) { // isActive is at index 11
                return {
                  id: Number(eventData[0]), // id
                  name: eventData[5], // name
                  organizer: eventData[1], // organizer
                  ticketContract: eventData[2], // ticketContract
                  poapContract: eventData[3] || undefined, // poapContract
                  incentiveContract: eventData[4] || undefined, // incentiveContract
                  metadataURI: eventData[6], // metadataURI
                  ticketPrice: BigInt(eventData[7]), // ticketPrice
                  maxTickets: Number(eventData[8]), // maxTickets
                  startTime: Number(eventData[9]), // startTime
                  endTime: Number(eventData[10]), // endTime
                  isActive: eventData[11], // isActive
                  createdAt: Number(eventData[12]), // createdAt
                  description: '',
                  venue: '',
                  category: 'General'
                };
              }
              return null;
            })
            .catch((error) => {
              console.warn(`[discoverEventsFromBlockchain] Failed to fetch event ${eventId}:`, error?.message || String(error));
              return null;
            })
        );
      }

      const batchResults = await Promise.all(batchPromises);
      const validEvents = batchResults.filter(e => e !== null) as Event[];
      events.push(...validEvents);

      // Small delay between batches to be respectful to RPC
      if (endIndex < totalEvents) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[discoverEventsFromBlockchain] Successfully discovered ${events.length} active events`);
    return events;
  } catch (error) {
    console.error('[discoverEventsFromBlockchain] Failed to discover events:', String(error));
    return [];
  }
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      console.log('[useEvents] Starting blockchain-based event discovery...');

      try {
        // Get events directly from blockchain (most accurate)
        console.log('[useEvents] Discovering events from blockchain...');
        const blockchainEvents = await discoverEventsFromBlockchain();

        if (blockchainEvents.length > 0) {
          console.log(`[useEvents] Found ${blockchainEvents.length} events on blockchain`);

          // Enrich with metadata
          const enrichedEvents = await enrichEventsWithMetadata(blockchainEvents);
          return enrichedEvents;
        }

        console.warn('[useEvents] No events found on blockchain');
        return [];
      } catch (error) {
        console.error('[useEvents] Error in event discovery:', String(error));
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
        // Get events directly from blockchain
        console.log('[useEventsByOrganizer] Discovering events from blockchain...');
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

            if (eventData[11] && eventData[1].toLowerCase() === targetOrganizer.toLowerCase()) { // isActive at index 11, organizer at index 1
              const event: Event = {
                id: Number(eventData[0]), // id
                name: eventData[5], // name
                organizer: eventData[1], // organizer
                ticketContract: eventData[2], // ticketContract
                poapContract: eventData[3] || undefined, // poapContract
                incentiveContract: eventData[4] || undefined, // incentiveContract
                metadataURI: eventData[6], // metadataURI
                ticketPrice: BigInt(eventData[7]), // ticketPrice
                maxTickets: Number(eventData[8]), // maxTickets
                startTime: Number(eventData[9]), // startTime
                endTime: Number(eventData[10]), // endTime
                isActive: eventData[11], // isActive
                createdAt: Number(eventData[12]), // createdAt
                description: '',
                venue: '',
                category: 'General'
              };
              events.push(event);
            }
          } catch (error) {
            console.warn(`Failed to fetch event ${eventId}:`, String(error));
          }
        }

        console.log('[useEventsByOrganizer] Found events on blockchain:', events.length);
        // Enrich with metadata
        const enrichedEvents = await enrichEventsWithMetadata(events);
        return enrichedEvents;
      } catch (error) {
        console.error('Error fetching organizer events:', String(error));
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
        // Get event directly from blockchain
        console.log('[useEvent] Fetching event from blockchain:', eventId);
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
          id: Number(eventData[0]), // id
          name: eventData[5], // name
          organizer: eventData[1], // organizer
          ticketContract: eventData[2], // ticketContract
          poapContract: eventData[3] || undefined, // poapContract
          incentiveContract: eventData[4] || undefined, // incentiveContract
          metadataURI: eventData[6], // metadataURI
          ticketPrice: BigInt(eventData[7]), // ticketPrice
          maxTickets: Number(eventData[8]), // maxTickets
          startTime: Number(eventData[9]), // startTime
          endTime: Number(eventData[10]), // endTime
          isActive: eventData[11], // isActive
          createdAt: Number(eventData[12]), // createdAt
          description: '',
          venue: '',
          category: 'General'
        };

        console.log('[useEvent] Found event on blockchain:', event.name);
        // Enrich with metadata
        const enrichedEvent = await enrichEventWithMetadata(event);
        return enrichedEvent;
      } catch (error) {
        console.error('Error fetching event:', String(error));
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
        // Get events and aggregate metrics from blockchain
        console.log('[useOrganizerMetrics] Discovering events from blockchain for metrics...');
        const events = await discoverEventsFromBlockchain();
        const organizerEvents = events.filter((event: Event) =>
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

        // Aggregate metrics from blockchain
        let totalTicketsSold = 0;
        let totalRevenue = 0;
        let totalPOAPClaims = 0;

        for (const event of organizerEvents) {
          try {
            if (event.ticketContract) {
              // Get sold tickets from contract
              const soldTickets = await readContract(
                event.ticketContract as `0x${string}`,
                'totalSold',
                []
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
            console.warn(`Failed to fetch metrics for event ${event.id}:`, String(error));
            // Continue with other events
          }
        }

        console.log('[useOrganizerMetrics] Blockchain-based metrics:', {
          totalEvents: organizerEvents.length,
          totalTicketsSold,
          totalRevenue: totalRevenue.toFixed(3),
          totalPOAPClaims
        });

        return {
          totalEvents: organizerEvents.length,
          totalTicketsSold,
          totalRevenue: totalRevenue.toFixed(3),
          totalPOAPClaims
        };
      } catch (error) {
        console.error('Error fetching organizer metrics:', String(error));
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
