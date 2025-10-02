import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../lib/contracts';
import { readContract } from '../../lib/contract-wrapper';
import { fetchMetadataFromIPFS, generateDefaultMetadata } from '../../lib/metadata';
import { getTransactionReceipt, getWalletClient } from '../../lib/contract-fallback';

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
  transactionHash?: string; // Transaction that minted this ticket
}

// Hook to fetch user's tickets using contract balance checks only
export const useUserTickets = () => {
  const { address } = useAccount();

  console.log('[useUserTickets] Hook called with address:', address);

  return useQuery({
    queryKey: ['user-tickets', address],
    queryFn: async (): Promise<UserTicket[]> => {
      if (!address) {
        console.log('[useUserTickets] No address provided, returning empty array');
        return [];
      }

      try {
        console.log('[useUserTickets] Starting contract balance check for address:', address);

        // Get tickets by checking contract balances directly
        const tickets = await getTicketsFromContractBalances(address);

        console.log(`[useUserTickets] Found ${tickets.length} tickets`);
        return tickets;
      } catch (error) {
        console.error('[useUserTickets] Error fetching user tickets:', String(error));
        return [];
      }
    },
    enabled: !!address,
    staleTime: 30 * 1000, // 30 seconds - refresh frequently for tickets
  });
};

/**
 * Fallback function to get tickets by checking contract balances
 * This is kept as a backup in case transaction-based approach misses some tickets
 */
async function getTicketsFromContractBalances(address: string): Promise<UserTicket[]> {
  try {
    console.log('[getTicketsFromContractBalances] Starting contract balance check for address:', address);
    // Get all events
    const eventsResponse = await fetch('/api/events');
    if (!eventsResponse.ok) {
      const errorText = await eventsResponse.text();
      console.error('[getTicketsFromContractBalances] Failed to fetch events from API:', eventsResponse.status, errorText);
      return [];
    }

    const allEvents = await eventsResponse.json();
    console.log('[getTicketsFromContractBalances] Found', allEvents.length, 'events');
    console.log('[getTicketsFromContractBalances] Events:', allEvents);
    const allTickets: UserTicket[] = [];

    // Check each event's ticket contract
    for (const event of allEvents) {
      if (!event.ticketContract) {
        console.log(`[getTicketsFromContractBalances] Skipping event ${event.id}: no contract address`);
        continue;
      }

      if (!event.isActive) {
        console.log(`[getTicketsFromContractBalances] Skipping event ${event.id}: event is not active`);
        continue;
      }

      // Validate contract address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(event.ticketContract)) {
        console.error(`[getTicketsFromContractBalances] Invalid contract address for event ${event.id}: ${event.ticketContract}`);
        continue;
      }

      console.log(`[getTicketsFromContractBalances] Checking event ${event.id} (${event.name}) with contract ${event.ticketContract}`);

      try {
        // Get user's balance in this contract
        const balance = await readContract(event.ticketContract as `0x${string}`, 'balanceOf', [address]);
        console.log(`[getTicketsFromContractBalances] Balance for event ${event.id}:`, balance);

        if (!balance || Number(balance) === 0) {
          console.log(`[getTicketsFromContractBalances] No balance for event ${event.id}`);
          continue;
        }

        // Get token IDs using the contract's getOwnerTickets function
        const tokenIds = await readContract(event.ticketContract as `0x${string}`, 'getOwnerTickets', [address]);
        console.log(`[getTicketsFromContractBalances] Found ${tokenIds.length} token IDs for event ${event.id}:`, tokenIds);

        // Create ticket objects
        for (const tokenId of tokenIds) {
          try {
            const isValid = await readContract(event.ticketContract as `0x${string}`, 'isValidTicket', [tokenId]);
            const ticketIsUsed = !isValid;

            let venue = "TBA";
            try {
              if (event.metadataURI) {
                const metadata = await fetchMetadataFromIPFS(event.metadataURI);
                const defaultMetadata = generateDefaultMetadata(event);
                venue = metadata?.venue || defaultMetadata.venue || "TBA";
              }
            } catch (metadataError) {
              console.warn(`Failed to fetch venue for event ${event.id}:`, metadataError);
            }

            allTickets.push({
              tokenId: Number(tokenId),
              eventId: Number(event.id),
              eventName: event.name,
              ticketType: "General Admission",
              purchaseDate: Math.floor(Date.now() / 1000) - 86400, // Approximate
              eventDate: Number(event.startTime),
              venue,
              location: venue,
              isUsed: ticketIsUsed,
              ticketContract: event.ticketContract,
              originalPrice: BigInt(event.ticketPrice || '0')
            });
          } catch (error) {
            console.error(`Error fetching ticket ${tokenId} details:`, String(error));
          }
        }
      } catch (error) {
        console.error(`Error checking event ${event.id}:`, String(error));
      }
    }

    console.log('[getTicketsFromContractBalances] Total tickets found from contracts:', allTickets.length);
    return allTickets;
  } catch (error) {
    console.error('Error in contract balance check:', String(error));
    return [];
  }
}

// Hook to get total tickets sold for an event
export const useEventTicketsSold = (eventId: number, ticketContract?: string) => {
  return useQuery({
    queryKey: ['event-tickets-sold', eventId, ticketContract],
    queryFn: async (): Promise<number> => {
      if (!eventId) return 0;

      try {
        // Try contract-based totalSold (most accurate)
        if (ticketContract) {
          try {
            console.log(`[useEventTicketsSold] Checking contract ${ticketContract} for event ${eventId}`);
            const contractSales = await readContract(ticketContract as `0x${string}`, 'totalSold', []);
            const sales = Number(contractSales);
            console.log(`[useEventTicketsSold] Contract reports ${sales} tickets sold for event ${eventId}`);
            return sales;
          } catch (contractError) {
            console.warn(`[useEventTicketsSold] Contract call failed for event ${eventId}:`, contractError);
          }
        }

        // Fallback: API route
        try {
          console.log(`[useEventTicketsSold] Falling back to API for event ${eventId}`);
          const response = await fetch(`/api/contracts/ticket-sales?contract=${ticketContract || ''}`);
          if (response.ok) {
            const data = await response.json();
            return data.totalSold || 0;
          }
        } catch (apiError) {
          console.warn(`[useEventTicketsSold] API call failed for event ${eventId}:`, apiError);
        }

        console.log(`[useEventTicketsSold] All methods failed for event ${eventId}, returning 0`);
        return 0;
      } catch (error) {
        console.error('Error fetching tickets sold for event:', eventId, String(error));
        return 0;
      }
    },
    enabled: !!eventId,
    staleTime: 30 * 1000, // 30 seconds
  });
};