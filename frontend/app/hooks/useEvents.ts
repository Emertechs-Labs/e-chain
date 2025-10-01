import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { readContract } from '../../lib/contract-wrapper';
import { Event } from '../../types/event';
import { enrichEventsWithMetadata, enrichEventWithMetadata } from '../../lib/metadata';
import { formatEther } from 'viem';

// Local storage key for cached events from transactions
const EVENTS_CACHE_KEY = 'events_transaction_cache';

/**
 * Store events discovered from EventCreated transactions
 */
export const storeEventFromTransaction = (eventData: {
  id: number;
  name: string;
  organizer: string;
  ticketContract: string;
  metadataURI: string;
  ticketPrice: string;
  maxTickets: number;
  startTime: number;
  endTime: number;
  transactionHash: string;
}) => {
  try {
    const stored = localStorage.getItem(EVENTS_CACHE_KEY);
    const events = stored ? JSON.parse(stored) : [];

    // Check if event already exists
    const existingIndex = events.findIndex((e: any) => e.id === eventData.id);
    if (existingIndex >= 0) {
      // Update existing event
      events[existingIndex] = { ...eventData, lastUpdated: Date.now() };
    } else {
      // Add new event
      events.push({ ...eventData, lastUpdated: Date.now() });
    }

    localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(events));
    console.log(`[storeEventFromTransaction] Stored/updated event ${eventData.id}: ${eventData.name}`);
  } catch (error) {
    console.error('[storeEventFromTransaction] Failed to store event:', error);
  }
};

/**
 * Get cached events from transaction monitoring
 */
export const getCachedEvents = (): Event[] => {
  try {
    const stored = localStorage.getItem(EVENTS_CACHE_KEY);
    if (!stored) return [];

    const events = JSON.parse(stored);
    return events.map((e: any) => ({
      id: e.id,
      name: e.name,
      organizer: e.organizer,
      ticketContract: e.ticketContract,
      poapContract: e.poapContract || undefined,
      incentiveContract: e.incentiveContract || undefined,
      metadataURI: e.metadataURI,
      ticketPrice: BigInt(e.ticketPrice),
      maxTickets: e.maxTickets,
      startTime: e.startTime,
      endTime: e.endTime,
      isActive: true, // Assume active unless we have transaction data showing otherwise
      createdAt: e.createdAt || Math.floor(Date.now() / 1000),
      description: '',
      venue: '',
      category: 'General'
    }));
  } catch (error) {
    console.error('[getCachedEvents] Failed to retrieve cached events:', error);
    return [];
  }
};

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
              if (eventData && eventData.isActive) {
                return {
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
      console.log('[useEvents] Starting transaction-based event discovery...');

      try {
        // First, try blockchain-based event discovery (most accurate)
        console.log('[useEvents] Attempting blockchain event discovery...');
        const blockchainEvents = await discoverEventsFromBlockchain();

        if (blockchainEvents.length > 0) {
          console.log(`[useEvents] Found ${blockchainEvents.length} events on blockchain`);

          // Enrich with metadata and cache locally
          const enrichedEvents = await enrichEventsWithMetadata(blockchainEvents);

          // Cache events locally for faster subsequent loads
          for (const event of enrichedEvents) {
            storeEventFromTransaction({
              id: event.id,
              name: event.name,
              organizer: event.organizer,
              ticketContract: event.ticketContract,
              metadataURI: event.metadataURI,
              ticketPrice: event.ticketPrice.toString(),
              maxTickets: event.maxTickets,
              startTime: event.startTime,
              endTime: event.endTime,
              transactionHash: '' // We don't have the creation tx hash here
            });
          }

          return enrichedEvents;
        }

        // Fallback 1: Try cached events from local storage
        console.log('[useEvents] No blockchain events found, trying local cache...');
        const cachedEvents = getCachedEvents();
        if (cachedEvents.length > 0) {
          console.log(`[useEvents] Found ${cachedEvents.length} cached events`);
          const enrichedEvents = await enrichEventsWithMetadata(cachedEvents);
          return enrichedEvents;
        }

        // Fallback 2: Try database API (least accurate but fastest)
        console.log('[useEvents] No cached events, falling back to database API...');
        const response = await fetch('/api/events');
        if (response.ok) {
          const dbEvents = await response.json();
          console.log(`[useEvents] Found ${dbEvents.length} events in database`);
          const enrichedEvents = await enrichEventsWithMetadata(dbEvents);
          return enrichedEvents;
        }

        console.warn('[useEvents] All event discovery methods failed');
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
        console.error('Error fetching event:', String(error));
        return null;
      }
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get organizer metrics from transaction-based data
 */
export const getOrganizerMetricsFromTransactions = (organizerAddress: string) => {
  try {
    const stored = localStorage.getItem('ticket_sales_transactions');
    if (!stored) {
      return {
        totalTicketsSold: 0,
        totalRevenue: '0',
        totalEvents: 0
      };
    }

    const sales = JSON.parse(stored);
    const organizerEvents = new Set<number>();
    let totalTicketsSold = 0;
    let totalRevenue = 0;

    // Get events by this organizer to calculate metrics
    const events = getCachedEvents();
    const organizerEventIds = events
      .filter(event => event.organizer.toLowerCase() === organizerAddress.toLowerCase())
      .map(event => event.id);

    // Aggregate sales for organizer's events
    for (const sale of sales) {
      if (organizerEventIds.includes(sale.eventId)) {
        organizerEvents.add(sale.eventId);
        totalTicketsSold += sale.quantity;

        // Get ticket price for revenue calculation
        const event = events.find(e => e.id === sale.eventId);
        if (event) {
          const ticketPrice = Number(formatEther(event.ticketPrice));
          totalRevenue += sale.quantity * ticketPrice;
        }
      }
    }

    return {
      totalTicketsSold,
      totalRevenue: totalRevenue.toFixed(3),
      totalEvents: organizerEvents.size
    };
  } catch (error) {
    console.error('[getOrganizerMetricsFromTransactions] Failed to get metrics:', error);
    return {
      totalTicketsSold: 0,
      totalRevenue: '0',
      totalEvents: 0
    };
  }
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
        // First, try transaction-based metrics (most accurate)
        console.log('[useOrganizerMetrics] Trying transaction-based metrics...');
        const transactionMetrics = getOrganizerMetricsFromTransactions(targetOrganizer);

        if (transactionMetrics.totalEvents > 0 || transactionMetrics.totalTicketsSold > 0) {
          console.log('[useOrganizerMetrics] Found transaction-based metrics:', transactionMetrics);

          // Estimate POAP claims (70% claim rate)
          const totalPOAPClaims = Math.floor(transactionMetrics.totalTicketsSold * 0.7);

          return {
            totalEvents: transactionMetrics.totalEvents,
            totalTicketsSold: transactionMetrics.totalTicketsSold,
            totalRevenue: transactionMetrics.totalRevenue,
            totalPOAPClaims
          };
        }

        // Fallback: Get events and aggregate from blockchain (less accurate)
        console.log('[useOrganizerMetrics] No transaction data, falling back to blockchain aggregation...');
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
