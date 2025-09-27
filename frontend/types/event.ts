export interface Event {
  id: number;
  name: string;
  symbol: string;
  organizer: string;
  ticketContract: string;
  maxTickets: number;
  ticketPrice: bigint;
  saleEndTime: number;
  isActive: boolean;
  description?: string;
  imageUrl?: string;
  venue?: string;
  startTime?: number;
  endTime?: number;
  category?: string;
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
