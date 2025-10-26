// Utility for fetching and parsing event metadata from IPFS
import { Event } from '../types/event';
import { performanceMonitor, trackIpfsFetch } from './performance-monitor';

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

// IPFS Gateway URLs (fallback order) - prioritize CORS-friendly ones first
const IPFS_GATEWAYS = [
  'https://cloudflare-ipfs.com/ipfs/',   // CORS-friendly CDN-backed
  'https://ipfs.io/ipfs/',               // Official gateway (CORS-friendly)
  'https://dweb.link/ipfs/',             // CORS-friendly backup
  'https://gateway.ipfs.io/ipfs/',       // Additional CORS-friendly backup
  'https://ipfs.infura.io/ipfs/',        // Infura gateway (CORS-friendly)
  'https://4everland.io/ipfs/',          // Decentralized storage (CORS-friendly)
  'https://hardbin.com/ipfs/',           // Alternative gateway
];

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
  } else if (ipfsUri.includes('/ipfs/')) {
    // Extract hash from HTTP gateway URL (e.g., https://gateway.pinata.cloud/ipfs/bafy...)
    const ipfsMatch = ipfsUri.match(/\/ipfs\/(Qm\w+|baf\w+)/);
    if (ipfsMatch) {
      hash = ipfsMatch[1];
    } else {
      // Assume it's already an HTTP URL
      return ipfsUri;
    }
  } else {
    // Assume it's already an HTTP URL
    return ipfsUri;
  }

  // Use the specified gateway
  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
  return `${gateway}${hash}`;
}

/**
 * Fetch metadata from IPFS with parallel gateway attempts for better performance
 */
export async function fetchMetadataFromIPFS(
  metadataURI: string,
  timeout = 3000, // Reduced timeout for faster parallel attempts
  gatewayStartIndex = 0
): Promise<EventMetadata | null> {
  if (!metadataURI || metadataURI === 'ipfs://placeholder' || metadataURI.includes('placeholder')) {
    return null;
  }

  // Handle blob storage URLs first (fastest)
  if (metadataURI.includes('blob.vercel-storage.com') || metadataURI.includes('public.blob.vercel-storage.com')) {
    try {
      const response = await fetch(metadataURI, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (compatible; Echain/1.0)',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        return null;
      }

      const metadata = await response.json();
      if (metadata && typeof metadata === 'object') {
        return metadata as EventMetadata;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Try multiple IPFS gateways in parallel for better performance
  const gatewaysToTry = IPFS_GATEWAYS.slice(gatewayStartIndex, gatewayStartIndex + 3); // Try first 3 gateways
  const fetchPromises = gatewaysToTry.map(async (gateway, index) => {
    const url = ipfsToHttp(metadataURI, gatewayStartIndex + index);
    const tracker = trackIpfsFetch(gateway.replace('https://', '').replace('/ipfs/', ''));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (compatible; Echain/1.0)',
        },
        mode: 'cors',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        tracker.end(false, { status: response.status, url });
        return null;
      }

      const metadata = await response.json();

      // Validate the metadata has required fields
      if (!metadata || typeof metadata !== 'object') {
        tracker.end(false, { reason: 'invalid_metadata', url });
        return null;
      }

      tracker.end(true, { url, metadataSize: JSON.stringify(metadata).length });
      return metadata as EventMetadata;
    } catch (error) {
      tracker.end(false, {
        error: error instanceof Error ? error.message : String(error),
        url
      });
      return null;
    }
  });

  // Race the promises - return the first successful result
  try {
    const results = await Promise.allSettled(fetchPromises);
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
    }
  } catch {
    // If all parallel attempts fail, continue to fallback
  }

  return null;
}

/**
 * Enrich event data with metadata from IPFS
 */
export async function enrichEventWithMetadata(event: Event): Promise<Event> {
  try {
    // Use retry logic for better reliability
    const metadata = await fetchMetadataWithRetry(event.metadataURI, 1, 5000);

    if (metadata) {
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
            }
          } catch {
            // Silently ignore date parsing errors
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
            }
          } catch {
            // Silently ignore date parsing errors
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
        image: metadata.image ? ipfsToHttp(metadata.image) : event.image,
        organizer: event.organizer, // Keep the blockchain organizer address
      };

      return enrichedEvent;
    } else {
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
 * Get metadata with enhanced error handling and retry logic
 */
export async function fetchMetadataWithRetry(
  metadataURI: string,
  maxRetries = 1,
  timeout = 5000
): Promise<EventMetadata | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff with jitter
        const delayMs = Math.pow(2, attempt) * 500 + Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      const result = await fetchMetadataFromIPFS(metadataURI, timeout, 0);
      if (result) {
        return result;
      }
    } catch {
      // Silently continue to next retry
    }
  }

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
  if (events.length === 0) return [];

  // Process events in larger batches for better performance
  const batchSize = 5; // Increased from 3 to 5
  const enrichedEvents: Event[] = [];

  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);

    const enrichedBatch = await Promise.all(
      batch.map(event => enrichEventWithMetadata(event))
    );
    enrichedEvents.push(...enrichedBatch);

    // Reduced delay between batches for faster processing
    if (i + batchSize < events.length) {
      await new Promise(resolve => setTimeout(resolve, 25)); // Reduced from 50ms
    }
  }

  return enrichedEvents;
}
