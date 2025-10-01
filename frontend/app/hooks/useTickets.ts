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

// Local storage key for user's ticket transactions
const TICKET_TRANSACTIONS_KEY = 'user_ticket_transactions';

/**
 * Store a successful ticket purchase transaction for later retrieval
 */
export const storeTicketTransaction = (transactionHash: string, eventId: number, ticketContract: string, quantity: number, userAddress: string) => {
  try {
    const stored = localStorage.getItem(TICKET_TRANSACTIONS_KEY);
    const transactions = stored ? JSON.parse(stored) : [];

    transactions.push({
      transactionHash,
      eventId,
      ticketContract,
      quantity,
      userAddress,
      timestamp: Date.now(),
      processed: false // Will be marked as processed after extracting token IDs
    });

    localStorage.setItem(TICKET_TRANSACTIONS_KEY, JSON.stringify(transactions));
    console.log(`[storeTicketTransaction] Stored transaction ${transactionHash} for ${quantity} tickets`);
  } catch (error) {
    console.error('[storeTicketTransaction] Failed to store transaction:', error);
  }
};

/**
 * Get stored ticket transactions for the current user
 */
export const getStoredTicketTransactions = () => {
  try {
    const stored = localStorage.getItem(TICKET_TRANSACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[getStoredTicketTransactions] Failed to retrieve transactions:', error);
    return [];
  }
};

/**
 * Extract token IDs from a ticket purchase transaction by checking balance changes
 */
export const extractTokenIdsFromTransaction = async (
  transactionHash: string, 
  ticketContract: string, 
  userAddress: string,
  expectedQuantity: number
): Promise<number[]> => {
  try {
    console.log(`[extractTokenIdsFromTransaction] Extracting ${expectedQuantity} token IDs from ${transactionHash} for user ${userAddress}`);

    // Wait a bit for the transaction to be fully processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the user's current balance in the ticket contract      
    const currentBalance = await readContract(ticketContract as `0x${string}`, 'balanceOf', [userAddress]);
    const balance = Number(currentBalance);

    if (balance === 0) {
      console.warn(`[extractTokenIdsFromTransaction] User has no tickets in contract ${ticketContract}`);
      return [];
    }

    console.log(`[extractTokenIdsFromTransaction] User has ${balance} tickets in contract ${ticketContract}`);

    // Get all token IDs owned by the user
    const tokenIdsPromises = [];
    for (let i = 0; i < balance; i++) {
      tokenIdsPromises.push(
        readContract(ticketContract as `0x${string}`, 'tokenOfOwnerByIndex', [userAddress, i])
      );
    }

    const allTokenIds = await Promise.all(tokenIdsPromises);
    const tokenIds = allTokenIds.map(id => Number(id)).sort((a, b) => b - a); // Sort descending (newest first)

    // Take the most recent N tokens (where N = expected quantity)
    // This assumes the most recently minted tokens are from this transaction
    const newTokenIds = tokenIds.slice(0, expectedQuantity);

    console.log(`[extractTokenIdsFromTransaction] Extracted token IDs:`, newTokenIds);
    return newTokenIds;
  } catch (error) {
    console.error(`[extractTokenIdsFromTransaction] Failed to extract token IDs from ${transactionHash}:`, String(error));
    return [];
  }
};

/**
 * Process stored transactions to extract and cache token IDs
 */
export const processStoredTicketTransactions = async (userAddress: string): Promise<UserTicket[]> => {
  const transactions = getStoredTicketTransactions();
  console.log('[processStoredTicketTransactions] Retrieved transactions from storage:', transactions);
  const processedTickets: UserTicket[] = [];

  for (const tx of transactions) {
    if (tx.processed) continue; // Already processed

    try {
      console.log(`[processStoredTicketTransactions] Processing transaction ${tx.transactionHash}`);

      // Extract token IDs from the transaction
      const tokenIds = await extractTokenIdsFromTransaction(tx.transactionHash, tx.ticketContract, userAddress, tx.quantity);

      if (tokenIds.length > 0) {
        // Get event details
        const eventDetails = await readContract('EventFactory', 'getEventDetails', [tx.eventId]);

        // Create ticket objects
        for (const tokenId of tokenIds) {
          // Check if ticket is still valid/owned by user
          try {
            const isValid = await readContract(tx.ticketContract as `0x${string}`, 'isValidTicket', [tokenId]);
            const ticketIsUsed = !isValid;

            // Get venue from metadata
            let venue = "TBA";
            try {
              if (eventDetails.metadataURI) {
                const metadata = await fetchMetadataFromIPFS(eventDetails.metadataURI);
                const defaultMetadata = generateDefaultMetadata({
                  id: Number(tx.eventId),
                  name: eventDetails.name,
                  organizer: eventDetails.organizer,
                  metadataURI: eventDetails.metadataURI,
                  ticketContract: tx.ticketContract,
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
              console.warn(`[processStoredTicketTransactions] Failed to fetch venue for event ${tx.eventId}:`, metadataError);
            }

            processedTickets.push({
              tokenId,
              eventId: tx.eventId,
              eventName: eventDetails.name,
              ticketType: "General Admission",
              purchaseDate: Math.floor(tx.timestamp / 1000),
              eventDate: Number(eventDetails.startTime),
              venue,
              location: venue,
              isUsed: ticketIsUsed,
              ticketContract: tx.ticketContract,
              originalPrice: BigInt(eventDetails.ticketPrice || '0'),
              transactionHash: tx.transactionHash
            });
          } catch (ticketError) {
            console.warn(`[processStoredTicketTransactions] Failed to get details for token ${tokenId}:`, ticketError);
          }
        }

        // Mark transaction as processed
        tx.processed = true;
      }
    } catch (error) {
      console.error(`[processStoredTicketTransactions] Failed to process transaction ${tx.transactionHash}:`, String(error));
    }
  }

  // Update stored transactions
  localStorage.setItem(TICKET_TRANSACTIONS_KEY, JSON.stringify(transactions));

  console.log(`[processStoredTicketTransactions] Processed ${processedTickets.length} tickets from stored transactions`);
  return processedTickets;
};

// Hook to fetch user's tickets using transaction-based approach
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
        console.log('[useUserTickets] Starting transaction-based ticket retrieval for address:', address);

        // First, try to get tickets from stored transactions
        const transactionTickets = await processStoredTicketTransactions(address);

        // Also do a fallback check of all contracts (in case some tickets weren't captured by transactions)
        console.log('[useUserTickets] Performing fallback contract balance check...');
        const contractTickets = await getTicketsFromContractBalances(address);

        // Merge and deduplicate tickets
        const allTickets = [...transactionTickets];
        const existingTokenIds = new Set(transactionTickets.map(t => `${t.ticketContract}-${t.tokenId}`));

        for (const ticket of contractTickets) {
          const ticketKey = `${ticket.ticketContract}-${ticket.tokenId}`;
          if (!existingTokenIds.has(ticketKey)) {
            allTickets.push(ticket);
          }
        }

        console.log(`[useUserTickets] Total tickets found: ${allTickets.length} (${transactionTickets.length} from transactions, ${contractTickets.length} from contracts)`);
        return allTickets;
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

        // Get token IDs
        const tokenIdsPromises = [];
        for (let i = 0; i < Number(balance); i++) {
          tokenIdsPromises.push(
            readContract(event.ticketContract as `0x${string}`, 'tokenOfOwnerByIndex', [address, i])
          );
        }
        const tokenIds = await Promise.all(tokenIdsPromises);

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

// Local storage key for ticket sales transactions
const TICKET_SALES_KEY = 'ticket_sales_transactions';

/**
 * Store ticket purchase transaction for sales analytics
 */
export const storeTicketSaleTransaction = (eventId: number, quantity: number, transactionHash: string) => {
  try {
    const stored = localStorage.getItem(TICKET_SALES_KEY);
    const sales = stored ? JSON.parse(stored) : [];

    sales.push({
      eventId,
      quantity,
      transactionHash,
      timestamp: Date.now()
    });

    localStorage.setItem(TICKET_SALES_KEY, JSON.stringify(sales));
    console.log(`[storeTicketSaleTransaction] Stored sale: ${quantity} tickets for event ${eventId}`);
  } catch (error) {
    console.error('[storeTicketSaleTransaction] Failed to store sale:', error);
  }
};

/**
 * Get total tickets sold for an event from stored transactions
 */
export const getEventTicketsSoldFromTransactions = (eventId: number): number => {
  try {
    const stored = localStorage.getItem(TICKET_SALES_KEY);
    if (!stored) return 0;

    const sales = JSON.parse(stored);
    const eventSales = sales.filter((sale: any) => sale.eventId === eventId);
    const totalSold = eventSales.reduce((sum: number, sale: any) => sum + sale.quantity, 0);

    console.log(`[getEventTicketsSoldFromTransactions] Event ${eventId} sold ${totalSold} tickets from ${eventSales.length} transactions`);
    return totalSold;
  } catch (error) {
    console.error('[getEventTicketsSoldFromTransactions] Failed to get sales:', error);
    return 0;
  }
};

// Hook to get total tickets sold for an event
export const useEventTicketsSold = (eventId: number, ticketContract?: string) => {
  return useQuery({
    queryKey: ['event-tickets-sold', eventId, ticketContract],
    queryFn: async (): Promise<number> => {
      if (!eventId) return 0;

      try {
        // First, try transaction-based sales tracking (most accurate)
        const transactionSales = getEventTicketsSoldFromTransactions(eventId);
        if (transactionSales > 0) {
          console.log(`[useEventTicketsSold] Found ${transactionSales} tickets sold from transactions for event ${eventId}`);
          return transactionSales;
        }

        // Fallback: Try contract-based totalSold (less accurate but real-time)
        if (ticketContract) {
          try {
            console.log(`[useEventTicketsSold] No transaction data, checking contract ${ticketContract} for event ${eventId}`);
            const contractSales = await readContract(ticketContract as `0x${string}`, 'totalSold', []);
            const sales = Number(contractSales);
            console.log(`[useEventTicketsSold] Contract reports ${sales} tickets sold for event ${eventId}`);
            return sales;
          } catch (contractError) {
            console.warn(`[useEventTicketsSold] Contract call failed for event ${eventId}:`, contractError);
          }
        }

        // Final fallback: API route (least accurate)
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