import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../lib/contracts';
import { readContract } from '../../lib/contract-wrapper';
import { fetchMetadataFromIPFS, generateDefaultMetadata } from '../../lib/metadata';

export interface UserTicket {
  tokenId: number;
  eventId: number;
  eventName: string;
  ticketType: string;
  purchaseDate: number;
  eventDate: number;
  venue: string;
  location?: string; // For marketplace compatibility
  isUsed: boolean;
  ticketContract?: string; // Contract address
  originalPrice?: bigint; // Original ticket price
}

// Hook to fetch user's tickets from the contract
export const useUserTickets = () => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['user-tickets', address],
    queryFn: async (): Promise<UserTicket[]> => {
      if (!address) return [];

      try {
        // First, get all events to know which ticket contracts to check
        console.log('[useUserTickets] Fetching all events to check ticket contracts...');
        const eventsResponse = await fetch('/api/events');
        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch events');
        }
        const allEvents = await eventsResponse.json();
        console.log(`[useUserTickets] Found ${allEvents.length} events to check`);

        const allTickets: UserTicket[] = [];

        // Check each event's ticket contract for user's tickets
        for (const event of allEvents) {
          if (!event.ticketContract || !event.isActive) {
            continue; // Skip events without ticket contracts or inactive events
          }

          try {
            console.log(`[useUserTickets] Checking tickets for event ${event.id} (${event.name}) at contract ${event.ticketContract}`);

            // Get user's balance in this specific ticket contract
            const balance = await readContract(
              event.ticketContract, // Use the specific event's ticket contract address
              'balanceOf',
              [address]
            );

            if (!balance || Number(balance) === 0) {
              console.log(`[useUserTickets] No tickets found for event ${event.id}`);
              continue;
            }

            console.log(`[useUserTickets] Found ${Number(balance)} tickets for event ${event.id}`);

            // Get tokenIds for each ticket in this contract
            const tokenIdsPromises = [];
            for (let i = 0; i < Number(balance); i++) {
              tokenIdsPromises.push(
                readContract(
                  event.ticketContract,
                  'tokenOfOwnerByIndex',
                  [address, i]
                )
              );
            }
            const tokenIds = await Promise.all(tokenIdsPromises);

            // Get ticket details for each token
            const ticketPromises = tokenIds.map(async (tokenId) => {
              try {
                // Check if ticket is used
                const isValid = await readContract(
                  event.ticketContract,
                  'isValidTicket',
                  [tokenId]
                );
                // isValidTicket returns true if NOT used, so invert it
                const ticketIsUsed = !isValid;

                // Get event metadata for venue and other details
                let venue = "TBA"; // Default fallback
                let ticketType = "General Admission"; // Default

                try {
                  if (event.metadataURI) {
                    const metadata = await fetchMetadataFromIPFS(event.metadataURI);
                    const defaultMetadata = generateDefaultMetadata(event);
                    venue = metadata?.venue || defaultMetadata.venue || "TBA";
                  }
                } catch (metadataError) {
                  console.warn(`[useUserTickets] Failed to fetch venue from metadata for event ${event.id}:`, metadataError);
                }

                return {
                  tokenId: Number(tokenId),
                  eventId: Number(event.id),
                  eventName: event.name,
                  ticketType: ticketType,
                  purchaseDate: Math.floor(Date.now() / 1000) - 86400, // Placeholder - would come from transfer event
                  eventDate: Number(event.startTime),
                  venue: venue,
                  location: venue, // Use venue as location for marketplace
                  isUsed: ticketIsUsed,
                  ticketContract: event.ticketContract,
                  originalPrice: BigInt(event.ticketPrice || '0')
                };
              } catch (error) {
                console.error(`[useUserTickets] Error fetching ticket ${tokenId} details for event ${event.id}:`, error);
                return null;
              }
            });

            const eventTickets = (await Promise.all(ticketPromises)).filter(Boolean) as UserTicket[];
            allTickets.push(...eventTickets);
            console.log(`[useUserTickets] Added ${eventTickets.length} tickets from event ${event.id}`);

          } catch (error) {
            console.error(`[useUserTickets] Error checking event ${event.id}:`, error);
            // Continue with other events
          }
        }

        console.log(`[useUserTickets] Total tickets found: ${allTickets.length}`);
        return allTickets;
      } catch (error) {
        console.error('[useUserTickets] Error fetching user tickets:', error);
        return [];
      }
    },
    enabled: !!address,
  });
};

// Hook to get total tickets sold for an event
export const useEventTicketsSold = (eventId: number, ticketContract?: string) => {
  return useQuery({
    queryKey: ['event-tickets-sold', eventId, ticketContract],
    queryFn: async (): Promise<number> => {
      if (!eventId || !ticketContract) return 0;

      try {
        // Use API route instead of direct MultiBaas call
        const response = await fetch(`/api/contracts/ticket-sales?contract=${ticketContract}`);
        if (!response.ok) {
          throw new Error('Failed to fetch ticket sales');
        }
        const data = await response.json();
        return data.totalSold || 0;
      } catch (error) {
        console.error('Error fetching tickets sold for event:', eventId, error);
        return 0;
      }
    },
    enabled: !!eventId && !!ticketContract,
    staleTime: 30 * 1000, // 30 seconds
  });
};