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

// IPFS Gateway URLs (fallback order)
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
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
  } else {
    // Assume it's already an HTTP URL
    return ipfsUri;
  }
  
  // Use the specified gateway
  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
  return `${gateway}${hash}`;
}

/**
 * Fetch metadata from IPFS with fallback gateways and blob storage support
 */
export async function fetchMetadataFromIPFS(
  metadataURI: string,
  timeout = 5000
): Promise<EventMetadata | null> {
  if (!metadataURI || metadataURI === 'ipfs://placeholder' || metadataURI.includes('placeholder')) {
    return null;
  }

  // Check if it's a blob storage URL (Vercel Blob)
  if (metadataURI.includes('blob.vercel-storage.com') || metadataURI.includes('public.blob.vercel-storage.com')) {
    try {
      console.log(`[fetchMetadataFromIPFS] Fetching from blob storage: ${metadataURI}`);
      const response = await fetch(metadataURI, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const metadata = await response.json();
      console.log(`[fetchMetadataFromIPFS] Successfully fetched metadata from blob storage:`, metadata);
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
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const metadata = await response.json();
      console.log(`[fetchMetadataFromIPFS] Successfully fetched metadata from gateway ${i + 1}:`, metadata);
      
      return metadata as EventMetadata;
    } catch (error) {
      console.warn(`[fetchMetadataFromIPFS] Gateway ${i + 1} failed:`, error instanceof Error ? error.message : error);
      
      // If this was the last gateway, return null
      if (i === IPFS_GATEWAYS.length - 1) {
        console.error(`[fetchMetadataFromIPFS] All gateways failed for URI: ${metadataURI}`);
        return null;
      }
    }
  }
  
  return null;
}

/**
 * Enrich event data with metadata from IPFS
 */
export async function enrichEventWithMetadata(event: Event): Promise<Event> {
  try {
    const metadata = await fetchMetadataFromIPFS(event.metadataURI);
    
    if (metadata) {
      return {
        ...event,
        // Override with metadata if available, otherwise keep existing values
        description: metadata.description || event.description || '',
        venue: metadata.venue || event.venue || '',
        category: metadata.category || event.category || 'General',
        // Add any additional metadata as needed
        image: metadata.image,
        organizer: event.organizer, // Keep the blockchain organizer address
      };
    }
    
    return event;
  } catch (error) {
    console.error(`[enrichEventWithMetadata] Failed to enrich event ${event.id}:`, error);
    return event;
  }
}

/**
 * Batch enrich multiple events with metadata
 */
export async function enrichEventsWithMetadata(events: Event[]): Promise<Event[]> {
  console.log(`[enrichEventsWithMetadata] Enriching ${events.length} events with metadata...`);
  
  // Process events in parallel but limit concurrency to avoid overwhelming IPFS gateways
  const batchSize = 3;
  const enrichedEvents: Event[] = [];
  
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    const enrichedBatch = await Promise.all(
      batch.map(event => enrichEventWithMetadata(event))
    );
    enrichedEvents.push(...enrichedBatch);
    
    // Small delay between batches to be nice to IPFS gateways
    if (i + batchSize < events.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`[enrichEventsWithMetadata] Successfully enriched ${enrichedEvents.length} events`);
  return enrichedEvents;
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