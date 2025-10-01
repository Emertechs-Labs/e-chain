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
        // Get balance of user's tickets
        const balance = await readContract(
          'EventTicket',
          'balanceOf',
          [address]
        );

        if (!balance || Number(balance) === 0) {
          return [];
        }

        // Get tokenIds for each ticket
        const tokenIdsPromises = [];
        for (let i = 0; i < Number(balance); i++) {
          tokenIdsPromises.push(
            readContract(
              'EventTicket',
              'tokenOfOwnerByIndex',
              [address, i]
            )
          );
        }
        const tokenIds = await Promise.all(tokenIdsPromises);

        // Get event data for each ticket
        const ticketsPromises = tokenIds.map(async (tokenId) => {
          try {
            // Get eventId for this ticket
            const eventId = await readContract(
              'EventTicket',
              'ticketToEvent',
              [tokenId]
            );

            // Get event details
            const eventDetails = await readContract(
              'EventFactory',
              'getEventDetails',
              [eventId]
            );

            // Check if ticket is used
            const isUsed = await readContract(
              'EventTicket',
              'isValidTicket',
              [tokenId]
            );
            // isValidTicket returns true if NOT used, so invert it
            const ticketIsUsed = !isUsed;

            // Get event metadata for venue and other details
            let venue = "TBA"; // Default fallback
            let ticketType = "General Admission"; // Default
            
            try {
              if (eventDetails.metadataURI) {
                const metadata = await fetchMetadataFromIPFS(eventDetails.metadataURI);
                const defaultMetadata = generateDefaultMetadata({ 
                  id: Number(eventId), 
                  name: eventDetails.name,
                  organizer: eventDetails.organizer,
                  metadataURI: eventDetails.metadataURI,
                  ticketContract: '',
                  ticketPrice: 0n,
                  maxTickets: 0,
                  startTime: 0,
                  endTime: 0,
                  isActive: true,
                  createdAt: 0
                });
                venue = metadata?.venue || defaultMetadata.venue || "TBA";
              }
            } catch (metadataError) {
              console.warn('Failed to fetch venue from metadata:', metadataError);
            }

            return {
              tokenId: Number(tokenId),
              eventId: Number(eventId),
              eventName: eventDetails.name,
              ticketType: ticketType,
              purchaseDate: Math.floor(Date.now() / 1000) - 86400, // Placeholder - would come from transfer event
              eventDate: Number(eventDetails.startTime),
              venue: venue,
              location: venue, // Use venue as location for marketplace
              isUsed: ticketIsUsed,
              ticketContract: CONTRACT_ADDRESSES.EventTicket,
              originalPrice: BigInt(eventDetails.ticketPrice || '0')
            };
          } catch (error) {
            console.error(`Error fetching ticket ${tokenId} details:`, error);
            return null;
          }
        });

        const tickets = (await Promise.all(ticketsPromises)).filter(Boolean) as UserTicket[];
        return tickets;
      } catch (error) {
        console.error('Error fetching user tickets:', error);
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