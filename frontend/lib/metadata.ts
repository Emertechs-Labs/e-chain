// Utility for fetching and parsing event metadata from IPFS
import { Event } from '../types/event';

export interface EventMetadata {
  name?: string;
  description?: string;
  image?: string;
  venue?: string;
  organizer?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// IPFS Gateway URLs (fallback order) - prioritize faster/reliable ones first
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/', // Fast and reliable
  'https://cloudflare-ipfs.com/ipfs/',   // CDN-backed
  'https://ipfs.io/ipfs/',               // Official gateway
  'https://dweb.link/ipfs/',             // Backup
  'https://gateway.ipfs.io/ipfs/'        // Additional backup
];

// Local storage key for cached metadata
const METADATA_CACHE_KEY = 'ipfs_metadata_cache';
const METADATA_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedMetadata {
  metadata: EventMetadata;
  timestamp: number;
  uri: string;
}

/**
 * Get cached metadata from localStorage
 */
function getCachedMetadata(uri: string): EventMetadata | null {
  try {
    const stored = localStorage.getItem(METADATA_CACHE_KEY);
    if (!stored) return null;

    const cache: CachedMetadata[] = JSON.parse(stored);
    const cached = cache.find(item => item.uri === uri);

    if (cached && (Date.now() - cached.timestamp) < METADATA_CACHE_DURATION) {
      console.log(`[getCachedMetadata] Using cached metadata for ${uri}`);
      return cached.metadata;
    }

    // Remove expired cache entry
    if (cached) {
      const updatedCache = cache.filter(item => item.uri !== uri);
      localStorage.setItem(METADATA_CACHE_KEY, JSON.stringify(updatedCache));
    }

    return null;
  } catch (error) {
    console.warn('[getCachedMetadata] Failed to retrieve cached metadata:', error);
    return null;
  }
}

/**
 * Cache metadata in localStorage
 */
function setCachedMetadata(uri: string, metadata: EventMetadata): void {
  try {
    const stored = localStorage.getItem(METADATA_CACHE_KEY);
    const cache: CachedMetadata[] = stored ? JSON.parse(stored) : [];

    // Remove existing entry for this URI
    const filteredCache = cache.filter(item => item.uri !== uri);

    // Add new entry
    filteredCache.push({
      uri,
      metadata,
      timestamp: Date.now()
    });

    // Keep only the most recent 100 entries to avoid storage bloat
    const trimmedCache = filteredCache.slice(-100);

    localStorage.setItem(METADATA_CACHE_KEY, JSON.stringify(trimmedCache));
    console.log(`[setCachedMetadata] Cached metadata for ${uri}`);
  } catch (error) {
    console.warn('[setCachedMetadata] Failed to cache metadata:', error);
  }
}

/**
 * Convert IPFS URI to HTTP URL using available gateways
 */
export function ipfsToHttp(ipfsUri: string, gatewayIndex = 0): string {
  if (!ipfsUri) return '';
  
  // Handle different IPFS URI formats
  let hash = ipfsUri;
  if (ipfsUri.startsWith('ipfs://')) {
    hash = ipfsUri.slice(7);
  } else if (ipfsUri.startsWith('Qm') || ipfsUri.startsWith('baf')) {
    // Already a hash
    hash = ipfsUri;
  } else {
    // Assume it's already an HTTP URL
    return ipfsUri;
  }
  
  // Use the specified gateway
  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
  return `${gateway}${hash}`;
}

/**
 * Fetch metadata from IPFS with fallback gateways, caching, and blob storage support
 */
export async function fetchMetadataFromIPFS(
  metadataURI: string,
  timeout = 8000, // Increased timeout for better reliability
  useCache = true
): Promise<EventMetadata | null> {
  if (!metadataURI || metadataURI === 'ipfs://placeholder' || metadataURI.includes('placeholder')) {
    console.log(`[fetchMetadataFromIPFS] Skipping placeholder URI: ${metadataURI}`);
    return null;
  }

  // Check cache first
  if (useCache) {
    const cached = getCachedMetadata(metadataURI);
    if (cached) {
      return cached;
    }
  }

  console.log(`[fetchMetadataFromIPFS] Fetching metadata from URI: ${metadataURI}`);
  
  // Check if it's a blob storage URL (Vercel Blob)
  if (metadataURI.includes('blob.vercel-storage.com') || metadataURI.includes('public.blob.vercel-storage.com')) {
    try {
      console.log(`[fetchMetadataFromIPFS] Fetching from blob storage: ${metadataURI}`);
      const response = await fetch(metadataURI, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache' // Ensure fresh data
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const metadata = await response.json();
      console.log(`[fetchMetadataFromIPFS] Successfully fetched metadata from blob storage:`, metadata);
      
      // Cache the result
      if (useCache) {
        setCachedMetadata(metadataURI, metadata);
      }
      
      return metadata as EventMetadata;
    } catch (error) {
      console.error(`[fetchMetadataFromIPFS] Blob storage fetch failed:`, error);
      return null;
    }
  }

  // Try each IPFS gateway until one works
  for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
    try {
      const url = ipfsToHttp(metadataURI, i);
      console.log(`[fetchMetadataFromIPFS] Trying gateway ${i + 1}: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache' // Ensure fresh data
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const metadata = await response.json();
      console.log(`[fetchMetadataFromIPFS] Successfully fetched metadata from gateway ${i + 1}:`, metadata);
      
      // Validate the metadata has required fields
      if (!metadata || typeof metadata !== 'object') {
        console.warn(`[fetchMetadataFromIPFS] Invalid metadata format from gateway ${i + 1}`);
        continue;
      }
      
      // Cache the result
      if (useCache) {
        setCachedMetadata(metadataURI, metadata);
      }
      
      return metadata as EventMetadata;
    } catch (error) {
      console.warn(`[fetchMetadataFromIPFS] Gateway ${i + 1} failed:`, error instanceof Error ? error.message : error);
      
      // If this was the last gateway, return null
      if (i === IPFS_GATEWAYS.length - 1) {
        console.error(`[fetchMetadataFromIPFS] All gateways failed for URI: ${metadataURI}`);
        return null;
      }
      
      // Add a small delay before trying the next gateway
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return null;
}

/**
 * Enrich event data with metadata from IPFS
 */
export async function enrichEventWithMetadata(event: Event): Promise<Event> {
  try {
    console.log(`[enrichEventWithMetadata] Starting enrichment for event ${event.id} with metadataURI: ${event.metadataURI}`);
    
    // Use retry logic for better reliability
    const metadata = await fetchMetadataWithRetry(event.metadataURI, 2, 8000);
    
    if (metadata) {
      console.log(`[enrichEventWithMetadata] Successfully fetched metadata for event ${event.id}:`, metadata);
      
      // Extract formatted dates from attributes if available
      let formattedStartDate = '';
      let formattedEndDate = '';
      
      if (metadata.attributes) {
        const startDateAttr = metadata.attributes.find(attr => 
          attr.trait_type === 'Start Date' || attr.trait_type === 'Event Date' || attr.trait_type?.toLowerCase().includes('start')
        );
        const endDateAttr = metadata.attributes.find(attr => 
          attr.trait_type === 'End Date' || attr.trait_type?.toLowerCase().includes('end')
        );
        
        if (startDateAttr?.value) {
          try {
            const startDate = new Date(startDateAttr.value as string);
            if (!isNaN(startDate.getTime())) {
              formattedStartDate = startDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              console.log(`[enrichEventWithMetadata] Extracted formatted start date: ${formattedStartDate}`);
            }
          } catch (error) {
            console.warn('Failed to parse start date from metadata:', error);
          }
        }
        
        if (endDateAttr?.value) {
          try {
            const endDate = new Date(endDateAttr.value as string);
            if (!isNaN(endDate.getTime())) {
              formattedEndDate = endDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              console.log(`[enrichEventWithMetadata] Extracted formatted end date: ${formattedEndDate}`);
            }
          } catch (error) {
            console.warn('Failed to parse end date from metadata:', error);
          }
        }
      }
      
      const enrichedEvent = {
        ...event,
        // Override with metadata if available, otherwise keep existing values
        description: metadata.description || event.description || '',
        venue: metadata.venue || event.venue || '',
        category: metadata.category || event.category || 'General',
        // Add formatted dates if extracted from metadata
        formattedStartDate,
        formattedEndDate,
        // Add any additional metadata as needed
        image: metadata.image,
        organizer: event.organizer, // Keep the blockchain organizer address
      };
      
      console.log(`[enrichEventWithMetadata] Enriched event ${event.id} with venue: "${enrichedEvent.venue}", image: "${enrichedEvent.image}"`);
      return enrichedEvent;
    } else {
      console.log(`[enrichEventWithMetadata] No metadata found for event ${event.id}, using defaults`);
      // Generate default metadata if IPFS fails
      const defaultMetadata = generateDefaultMetadata(event);
      return {
        ...event,
        description: defaultMetadata.description,
        venue: defaultMetadata.venue,
        category: defaultMetadata.category,
      };
    }
  } catch (error) {
    console.error(`[enrichEventWithMetadata] Failed to enrich event ${event.id}:`, error);
    // Return event with defaults if enrichment fails completely
    const defaultMetadata = generateDefaultMetadata(event);
    return {
      ...event,
      description: defaultMetadata.description,
      venue: defaultMetadata.venue,
      category: defaultMetadata.category,
    };
  }
}

/**
 * Clear expired metadata cache entries
 */
export function clearExpiredMetadataCache(): void {
  try {
    const stored = localStorage.getItem(METADATA_CACHE_KEY);
    if (!stored) return;

    const cache: CachedMetadata[] = JSON.parse(stored);
    const now = Date.now();
    const validCache = cache.filter(item => (now - item.timestamp) < METADATA_CACHE_DURATION);

    if (validCache.length !== cache.length) {
      localStorage.setItem(METADATA_CACHE_KEY, JSON.stringify(validCache));
      console.log(`[clearExpiredMetadataCache] Cleared ${cache.length - validCache.length} expired cache entries`);
    }
  } catch (error) {
    console.warn('[clearExpiredMetadataCache] Failed to clear expired cache:', error);
  }
}

/**
 * Preload metadata for multiple URIs to improve performance
 */
export async function preloadMetadata(uris: string[]): Promise<void> {
  console.log(`[preloadMetadata] Preloading metadata for ${uris.length} URIs...`);
  
  // Clear expired cache first
  clearExpiredMetadataCache();
  
  // Process in small batches to avoid overwhelming IPFS gateways
  const batchSize = 2;
  for (let i = 0; i < uris.length; i += batchSize) {
    const batch = uris.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (uri) => {
        // Only fetch if not already cached
        if (!getCachedMetadata(uri)) {
          try {
            await fetchMetadataFromIPFS(uri, 5000, true);
          } catch (error) {
            console.warn(`[preloadMetadata] Failed to preload ${uri}:`, error);
          }
        }
      })
    );
    
    // Small delay between batches
    if (i + batchSize < uris.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  console.log(`[preloadMetadata] Finished preloading metadata`);
}

/**
 * Get metadata with enhanced error handling and retry logic
 */
export async function fetchMetadataWithRetry(
  metadataURI: string,
  maxRetries = 2,
  timeout = 8000
): Promise<EventMetadata | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[fetchMetadataWithRetry] Retry attempt ${attempt} for ${metadataURI}`);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
      
      const result = await fetchMetadataFromIPFS(metadataURI, timeout, true);
      if (result) {
        return result;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[fetchMetadataWithRetry] Attempt ${attempt + 1} failed:`, lastError.message);
    }
  }
  
  console.error(`[fetchMetadataWithRetry] All ${maxRetries + 1} attempts failed for ${metadataURI}:`, lastError?.message);
  return null;
}

/**
 * Get organizer name from metadata or address
 */
export function getOrganizerDisplayName(event: Event, metadata?: EventMetadata): string {
  // Check if metadata has organizer name
  if (metadata?.organizer) {
    return metadata.organizer;
  }
  
  // Try to extract name from event description/name
  const eventName = event.name.toLowerCase();
  if (eventName.includes('blockchain events')) return 'BlockchainEvents LLC';
  if (eventName.includes('defi')) return 'DeFi Foundation';
  if (eventName.includes('nft')) return 'NFT Collective';
  if (eventName.includes('web3')) return 'Web3 Society';
  if (eventName.includes('crypto')) return 'Crypto Conference Group';
  
  // Default fallback - truncate the organizer address
  const address = event.organizer;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Parse timestamp to readable date string
 */
export function formatEventDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get event status based on current time
 */
export function getEventStatus(event: Event): 'upcoming' | 'live' | 'ended' {
  const now = Date.now() / 1000;
  if (now < event.startTime) return 'upcoming';
  if (now >= event.startTime && now <= event.endTime) return 'live';
  return 'ended';
}

/**
 * Generate default metadata for events without IPFS metadata
 */
export function generateDefaultMetadata(event: Event): EventMetadata {
  const defaultDescriptions = [
    "Join us for an innovative blockchain conference featuring the latest developments in decentralized technology.",
    "Experience cutting-edge presentations from industry leaders and pioneers in the blockchain space.",
    "Network with fellow enthusiasts and professionals shaping the future of decentralized finance.",
    "Discover groundbreaking projects and technologies that are revolutionizing digital assets.",
    "Learn from experts about the latest trends in NFTs, DeFi, and Web3 development.",
  ];
  
  const defaultVenues = [
    "San Francisco, CA",
    "New York, NY", 
    "Los Angeles, CA",
    "Austin, TX",
    "Miami, FL",
    "Denver, CO",
    "Seattle, WA"
  ];
  
  const defaultCategories = [
    "Conference",
    "Workshop", 
    "Networking",
    "Summit",
    "Meetup"
  ];
  
  // Use event ID to deterministically select defaults
  const descriptionIndex = event.id % defaultDescriptions.length;
  const venueIndex = event.id % defaultVenues.length; 
  const categoryIndex = event.id % defaultCategories.length;
  
  return {
    name: event.name,
    description: defaultDescriptions[descriptionIndex],
    venue: defaultVenues[venueIndex],
    category: defaultCategories[categoryIndex],
    organizer: getOrganizerDisplayName(event),
    attributes: [
      { trait_type: "Event Type", value: defaultCategories[categoryIndex] },
      { trait_type: "Max Attendees", value: event.maxTickets },
      { trait_type: "Ticket Price", value: `${Number(event.ticketPrice) / 1e18} ETH` }
    ]
  };
}

/**
 * Batch enrich multiple events with metadata
 */
export async function enrichEventsWithMetadata(events: Event[]): Promise<Event[]> {
  console.log(`[enrichEventsWithMetadata] Enriching ${events.length} events with metadata...`);
  
  if (events.length === 0) return [];
  
  // Clear expired cache entries first
  clearExpiredMetadataCache();
  
  // Extract URIs for preloading (skip placeholders)
  const validUris = events
    .map(event => event.metadataURI)
    .filter(uri => uri && !uri.includes('placeholder') && uri !== 'ipfs://placeholder');
  
  // Preload metadata in background for better performance
  if (validUris.length > 0) {
    preloadMetadata(validUris).catch(error => {
      console.warn('[enrichEventsWithMetadata] Metadata preloading failed:', error);
    });
  }
  
  // Process events in smaller batches to avoid overwhelming IPFS gateways
  const batchSize = 2; // Reduced batch size for better reliability
  const enrichedEvents: Event[] = [];
  
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    console.log(`[enrichEventsWithMetadata] Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(events.length/batchSize)} (${batch.length} events)`);
    
    const enrichedBatch = await Promise.all(
      batch.map(event => enrichEventWithMetadata(event))
    );
    enrichedEvents.push(...enrichedBatch);
    
    // Slightly longer delay between batches to be more respectful to IPFS gateways
    if (i + batchSize < events.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`[enrichEventsWithMetadata] Successfully enriched ${enrichedEvents.length} events`);
  return enrichedEvents;
}