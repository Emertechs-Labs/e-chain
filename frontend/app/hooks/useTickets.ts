import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../lib/contracts';
import { callContractRead } from '../../lib/multibaas';

export interface UserTicket {
  tokenId: number;
  eventId: number;
  eventName: string;
  ticketType: string;
  purchaseDate: number;
  eventDate: number;
  venue: string;
  isUsed: boolean;
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
        const balance = await callContractRead(
          CONTRACT_ADDRESSES.EventTicket,
          'eventticket',
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
            callContractRead(
              CONTRACT_ADDRESSES.EventTicket,
              'eventticket',
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
            const eventId = await callContractRead(
              CONTRACT_ADDRESSES.EventTicket,
              'eventticket',
              'ticketToEvent',
              [tokenId]
            );

            // Get event details
            const eventDetails = await callContractRead(
              CONTRACT_ADDRESSES.EventFactory,
              'eventfactory',
              'events',
              [eventId]
            );

            // Check if ticket is used
            const isUsed = await callContractRead(
              CONTRACT_ADDRESSES.EventTicket,
              'eventticket',
              'isUsedTicket',
              [tokenId]
            );

            return {
              tokenId: Number(tokenId),
              eventId: Number(eventId),
              eventName: eventDetails.name,
              ticketType: "General Admission", // Default - would ideally come from ticket metadata
              purchaseDate: Math.floor(Date.now() / 1000) - 86400, // Placeholder - would come from transfer event
              eventDate: Number(eventDetails.startTime),
              venue: "Base Chain Arena", // Placeholder - would come from event metadata
              isUsed: Boolean(isUsed)
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