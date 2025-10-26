import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { readContract } from '../../lib/contract-wrapper';
import { Event } from '../../types/event';
import { enrichEventsWithMetadata, enrichEventWithMetadata } from '../../lib/metadata';
import { formatEther } from 'viem';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { performanceMonitor, trackEventFetch, trackMetadataEnrichment } from '../../lib/performance-monitor';

// Cache layer for events with TTL
const eventCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL_EVENTS = 10 * 60 * 1000; // Increased to 10 minutes
const CACHE_TTL_METRICS = 5 * 60 * 1000; // Increased to 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 500; // Reduced base delay

// Enhanced caching utilities
const getCachedData = <T>(key: string): T | null => {
  const cached = eventCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log(`[Cache] Hit for key: ${key}`);
    return cached.data as T;
  }
  if (cached) {
    console.log(`[Cache] Expired for key: ${key}`);
    eventCache.delete(key);
  }
  return null;
};

const setCachedData = <T>(key: string, data: T, ttl: number = CACHE_TTL_EVENTS): void => {
  eventCache.set(key, { data, timestamp: Date.now(), ttl });
  console.log(`[Cache] Set for key: ${key}, TTL: ${ttl}ms`);
};

// Exponential backoff retry utility
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY_BASE
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`[Retry] Attempt failed, retrying in ${delay}ms. Retries left: ${retries - 1}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Optimized multicall for batch contract reads
const multicallContractReads = async (contractCalls: any[]): Promise<any[]> => {
  try {
    console.log(`[Multicall] Batching ${contractCalls.length} contract reads...`);
    
    // For now, we'll implement batching with controlled concurrency
    const batchSize = 10; // Increased from 5 to 10 for better throughput
    const results: any[] = [];
    
    for (let i = 0; i < contractCalls.length; i += batchSize) {
      const batch = contractCalls.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (call, index) => {
        try {
          // Skip calls to zero address contracts
          if (call.contract === '0x0000000000000000000000000000000000000000' || 
              call.contract === '0x0000000000000000000000000000000000000000') {
            console.log(`[Multicall] Skipping zero address contract call for ${call.functionName}`);
            return { success: false, error: 'Zero address contract', result: 0, index: i + index };
          }
          
          const result = await retryWithBackoff(() => 
            readContract(call.contract || 'EventFactory', call.functionName, call.args || [])
          );
          return { success: true, result, index: i + index };
        } catch (error) {
          console.warn(`[Multicall] Failed call ${i + index}:`, error);
          return { success: false, error, index: i + index };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Smaller delay between batches for faster processing
      if (i + batchSize < contractCalls.length) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Reduced from 200ms
      }
    }
    
    return results;
  } catch (error) {
    console.error('[Multicall] Batch operation failed:', error);
    throw error;
  }
};
/**
 * Optimized event discovery with caching and batch processing
 * This provides transaction-based accuracy with improved performance
 */
export const discoverEventsFromBlockchain = async (): Promise<Event[]> => {
  const cacheKey = 'blockchain-events';
  const tracker = trackEventFetch(0); // Will update with actual count later

  // Check cache first
  const cached = getCachedData<Event[]>(cacheKey);
  if (cached) {
    tracker.end(true, { cached: true, eventCount: cached.length });
    return cached;
  }

  try {
    // Get total event count with retry
    const eventCount = await retryWithBackoff(async () =>
      await readContract('EventFactory', 'eventCount', [])
    ) as bigint;

    const totalEvents = Number(eventCount);

    if (totalEvents === 0) {
      setCachedData(cacheKey, [], CACHE_TTL_EVENTS);
      tracker.end(true, { eventCount: 0 });
      return [];
    }

    // Prepare batch calls for all events
    const eventCalls = [];
    for (let eventId = 1; eventId <= totalEvents; eventId++) {
      eventCalls.push({
        contract: 'EventFactory',
        functionName: 'events',
        args: [BigInt(eventId)],
        eventId
      });
    }

    // Execute batch with optimized concurrency
    const batchResults = await multicallContractReads(eventCalls);

    const events: Event[] = [];

    batchResults.forEach((result) => {
      if (result.success && result.result && result.result[11]) { // isActive check
        const eventData = result.result;
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
    });

    // Cache the results
    setCachedData(cacheKey, events, CACHE_TTL_EVENTS);
    tracker.end(true, { eventCount: events.length, batchCalls: eventCalls.length });
    return events;

  } catch (error) {
    // Return cached data if available, even if expired
    const staleCache = eventCache.get(cacheKey);
    if (staleCache) {
      tracker.end(true, { cached: true, stale: true, eventCount: staleCache.data.length });
      return staleCache.data as Event[];
    }

    tracker.end(false, { error: error instanceof Error ? error.message : String(error) });
    return [];
  }
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      try {
        // Get events with caching and retry logic
        const blockchainEvents = await discoverEventsFromBlockchain();

        if (blockchainEvents.length > 0) {
          // Enrich with metadata
          const enrichmentTracker = trackMetadataEnrichment(blockchainEvents.length);
          const enrichedEvents = await enrichEventsWithMetadata(blockchainEvents);
          enrichmentTracker.end(true, { enrichedCount: enrichedEvents.length });
          return enrichedEvents;
        }

        return [];
      } catch (error) {
        return [];
      }
    },
    // Increased stale time with optimized refetching
    staleTime: 15 * 60 * 1000, // Increased to 15 minutes
    gcTime: 45 * 60 * 1000, // Increased to 45 minutes
    // Enhanced retry logic
    retry: (failureCount, error) => {
      if (failureCount < 3) {
        console.log(`[useEvents] Retrying after failure ${failureCount + 1}/3`);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
};

export const useEventsByOrganizer = (organizer?: string) => {
  const { address } = useAccount();
  const targetOrganizer = organizer || address;

  return useQuery({
    queryKey: ['events', 'organizer', targetOrganizer],
    queryFn: async (): Promise<Event[]> => {
      if (!targetOrganizer) return [];

      const cacheKey = `organizer-events-${targetOrganizer.toLowerCase()}`;

      // Check cache first
      const cached = getCachedData<Event[]>(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        // Use cached blockchain events to avoid redundant calls
        const allEvents = await discoverEventsFromBlockchain();

        // Filter events by organizer
        const organizerEvents = allEvents.filter((event: Event) =>
          event.organizer.toLowerCase() === targetOrganizer.toLowerCase()
        );

        // Enrich with metadata
        const enrichedEvents = await enrichEventsWithMetadata(organizerEvents);

        // Cache the results
        setCachedData(cacheKey, enrichedEvents, CACHE_TTL_EVENTS);

        return enrichedEvents;
      } catch (error) {
        // Return stale cache if available
        const staleCache = eventCache.get(cacheKey);
        if (staleCache) {
          return staleCache.data as Event[];
        }

        return [];
      }
    },
    enabled: !!targetOrganizer,
    staleTime: 12 * 60 * 1000, // Increased to 12 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 10000),
  });
};

export const useEvent = (eventId: number) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async (): Promise<Event | null> => {
      if (!eventId) return null;

      const cacheKey = `single-event-${eventId}`;
      
      // Check cache first
      const cached = getCachedData<Event>(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        // Get event with optimized retry logic
        console.log('[useEvent] Fetching event from blockchain:', eventId);
        
        const [eventCount, eventData] = await Promise.all([
          retryWithBackoff(() => readContract('EventFactory', 'eventCount', [])),
          retryWithBackoff(() => readContract('EventFactory', 'events', [BigInt(eventId)]))
        ]);

        // Validate eventId
        if (Number(eventId) <= 0 || Number(eventId) > Number(eventCount)) {
          console.warn(`[useEvent] Invalid event ID ${eventId}, eventCount: ${Number(eventCount)}`);
          return null;
        }

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
        
        // Cache the result
        setCachedData(cacheKey, enrichedEvent, CACHE_TTL_EVENTS);
        
        return enrichedEvent;
      } catch (error) {
        console.error('Error fetching event:', String(error));
        
        // Return stale cache if available
        const staleCache = eventCache.get(cacheKey);
        if (staleCache) {
          return staleCache.data as Event;
        }
        
        return null;
      }
    },
    enabled: !!eventId,
    staleTime: 12 * 60 * 1000, // Increased to 12 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1500 * 2 ** attemptIndex, 20000),
  });
};

// Hook to get aggregated metrics for all events by an organizer with optimized performance
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

      const cacheKey = `metrics-${targetOrganizer.toLowerCase()}`;
      
      // Check cache first
      const cached = getCachedData<any>(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        // Use cached events to avoid redundant blockchain calls
        console.log('[useOrganizerMetrics] Getting metrics using cached events...');
        const allEvents = await discoverEventsFromBlockchain();
        const organizerEvents = allEvents.filter((event: Event) =>
          event.organizer.toLowerCase() === targetOrganizer.toLowerCase()
        );

        if (organizerEvents.length === 0) {
          const emptyMetrics = {
            totalEvents: 0,
            totalTicketsSold: 0,
            totalRevenue: '0',
            totalPOAPClaims: 0
          };
          setCachedData(cacheKey, emptyMetrics, CACHE_TTL_METRICS);
          return emptyMetrics;
        }

        // Batch ticket contract reads for better performance
        const ticketCalls = organizerEvents
          .filter(event => event.ticketContract)
          .map(event => ({
            contract: event.ticketContract,
            functionName: 'totalSold',
            args: [],
            eventId: event.id
          }));

        let totalTicketsSold = 0;
        let totalRevenue = 0;
        let totalPOAPClaims = 0;

        if (ticketCalls.length > 0) {
          console.log(`[useOrganizerMetrics] Batching ${ticketCalls.length} ticket contract reads...`);
          
          const batchResults = await multicallContractReads(ticketCalls);
          
          batchResults.forEach((result, index) => {
            if (result.success) {
              const soldTicketsNum = Number(result.result);
              totalTicketsSold += soldTicketsNum;

              // Find corresponding event for revenue calculation
              const event = organizerEvents.find(e => e.ticketContract === ticketCalls[index]?.contract);
              if (event) {
                const ticketPrice = Number(formatEther(event.ticketPrice));
                totalRevenue += soldTicketsNum * ticketPrice;
                
                // Estimate POAP claims (70% claim rate)
                totalPOAPClaims += Math.floor(soldTicketsNum * 0.7);
              }
            }
          });
        }

        const metrics = {
          totalEvents: organizerEvents.length,
          totalTicketsSold,
          totalRevenue: totalRevenue.toFixed(3),
          totalPOAPClaims
        };

        console.log('[useOrganizerMetrics] Optimized metrics:', metrics);
        
        // Cache the metrics
        setCachedData(cacheKey, metrics, CACHE_TTL_METRICS);
        
        return metrics;
      } catch (error) {
        console.error('Error fetching organizer metrics:', String(error));
        
        // Return stale cache if available
        const staleCache = eventCache.get(cacheKey);
        if (staleCache) {
          return staleCache.data;
        }
        
        return {
          totalEvents: 0,
          totalTicketsSold: 0,
          totalRevenue: '0',
          totalPOAPClaims: 0
        };
      }
    },
    enabled: !!targetOrganizer,
    staleTime: 8 * 60 * 1000, // Increased to 8 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(3000 * 2 ** attemptIndex, 15000),
  });
};
