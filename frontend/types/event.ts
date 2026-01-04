export interface Event {
  id: number;
  name: string;
  organizer: string;
  ticketContract: string;
  poapContract?: string;
  incentiveContract?: string;
  metadataURI: string;
  ticketPrice: bigint;
  maxTickets: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  createdAt: number;
  // Additional frontend fields (populated from metadata or defaults)
  description?: string;
  image?: string; // IPFS image URL from metadata
  imageUrl?: string; // For backward compatibility
  venue?: string;
  category?: string;
  symbol?: string; // For backward compatibility
  // Formatted dates from metadata
  formattedStartDate?: string;
  formattedEndDate?: string;
  // Additional fields for enhanced events
  tags?: string[];
  isLive?: boolean;
  attendees?: number;
  // Additional event details
  details?: {
    about?: string;
    whatsHappening?: string[];
    prizes?: string[];
    whatYouGet?: string[];
    whoShouldJoin?: string[];
    requirements?: string[];
    schedule?: Array<{
      time: string;
      activity: string;
      description?: string;
    }>;
    speakers?: Array<{
      name: string;
      title: string;
      bio?: string;
      image?: string;
    }>;
    sponsors?: Array<{
      name: string;
      logo?: string;
      website?: string;
    }>;
    hosts?: Array<{
      name: string;
      title?: string;
      organization?: string;
      image?: string;
      role?: string;
      avatar?: string;
    }>;
    registration?: string;
    socialLinks?: {
      website?: string;
      twitter?: string;
      discord?: string;
      telegram?: string;
      linkedin?: string;
    };
  };
}

export interface Ticket {
  tokenId: number;
  owner: string;
  eventId: number;
  isUsed: boolean;
  mintedAt: number;
  usedAt?: number;
  tokenURI?: string;
}

export interface POAPClaim {
  eventId: number;
  attendee: string;
  claimedAt: number;
  tokenId: number;
  signature: string;
}

export interface EventFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: string;
  organizer?: string;
  status?: 'active' | 'ended' | 'upcoming';
}

export interface CreateEventForm {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  venue: string;
  maxTickets: number;
  ticketPrice: string;
  saleEndTime: Date;
  startTime: Date;
  endTime: Date;
  category: string;
}

export interface TicketPurchase {
  eventId: number;
  quantity: number;
  totalPrice: bigint;
  buyer: string;
}
