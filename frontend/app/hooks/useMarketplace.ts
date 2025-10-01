import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useWalletClient, useChainId, useSwitchChain } from 'wagmi';
import { readContract as readContractWagmi } from 'wagmi/actions';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../../lib/contracts';
import { config } from '../../lib/wagmi';
import { readContract } from '../../lib/contract-wrapper';
import { formatForWallet, callUnsignedTx, handleTransactionError } from '../../lib/transaction-utils';

export interface MarketplaceListing {
  id: string;
  tokenId: number;
  eventId: number;
  eventName: string;
  ticketType: string;
  price: bigint;
  originalPrice: bigint;
  seller: string;
  eventDate: number;
  location: string;
  verified: boolean;
  ticketContract: string;
  listedAt: number;
  active: boolean;
}

// Mock marketplace listings for fallback/testing
const mockListings: MarketplaceListing[] = [
  {
    id: "1",
    tokenId: 1,
    eventId: 1,
    eventName: "Web3 Developer Conference 2024",
    ticketType: "VIP Access",
    price: BigInt("150000000000000000"), // 0.15 ETH
    originalPrice: BigInt("100000000000000000"), // 0.1 ETH
    seller: "0x1234567890123456789012345678901234567890",
    eventDate: Math.floor(new Date('2024-03-15T09:00:00').getTime() / 1000),
    location: "San Francisco, CA",
    verified: true,
    ticketContract: CONTRACT_ADDRESSES.EventTicket,
    listedAt: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    active: true
  },
  {
    id: "2",
    tokenId: 2,
    eventId: 2,
    eventName: "DeFi Summit: Future of Finance",
    ticketType: "General Admission",
    price: BigInt("120000000000000000"), // 0.12 ETH
    originalPrice: BigInt("80000000000000000"), // 0.08 ETH
    seller: "0x2345678901234567890123456789012345678901",
    eventDate: Math.floor(new Date('2024-03-22T10:00:00').getTime() / 1000),
    location: "New York, NY",
    verified: true,
    ticketContract: CONTRACT_ADDRESSES.EventTicket,
    listedAt: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
    active: true
  },
  {
    id: "3",
    tokenId: 3,
    eventId: 3,
    eventName: "NFT Art & Culture Festival",
    ticketType: "Artist Pass",
    price: BigInt("80000000000000000"), // 0.08 ETH
    originalPrice: BigInt("50000000000000000"), // 0.05 ETH
    seller: "0x3456789012345678901234567890123456789012",
    eventDate: Math.floor(new Date('2024-04-05T14:00:00').getTime() / 1000),
    location: "Los Angeles, CA",
    verified: false,
    ticketContract: CONTRACT_ADDRESSES.EventTicket,
    listedAt: Math.floor(Date.now() / 1000) - 259200, // 3 days ago
    active: true
  }
];

// Fetch listing details from blockchain with enriched metadata
async function fetchListingDetails(listingId: string): Promise<MarketplaceListing> {
  try {
    // First get raw listing data from contract
    const rawListing = await readContract(
      'Marketplace',
      'getListing',
      [listingId]
    );
    
    // Get event ID and metadata from ticket contract
    const eventId = await readContract(
      'EventTicket',
      'ticketToEvent',
      [rawListing.tokenId]
    );
    
    // Get event details from factory
    const eventDetails = await readContract(
      'EventFactory',
      'getEventDetails',
      [eventId]
    );
    
    // Calculate original price (ticket face value)
    const originalPrice = await readContract(
      'EventFactory',
      'events',
      [eventId]
    );
    
    // Format listing for UI
    const listing: MarketplaceListing = {
      id: listingId,
      tokenId: Number(rawListing.tokenId),
      eventId: Number(eventId),
      eventName: eventDetails.name,
      ticketType: "General Admission", // Default, would be from ticket metadata ideally
      price: BigInt(rawListing.price),
      originalPrice: BigInt(originalPrice.ticketPrice),
      seller: rawListing.seller,
      eventDate: Number(eventDetails.startTime),
      location: "On-chain Event", // Would come from metadata ideally
      verified: true, // All tickets from our contracts are verified
      ticketContract: rawListing.ticketContract,
      listedAt: Number(rawListing.listedAt),
      active: rawListing.active
    };
    
    return listing;
  } catch (error) {
    console.error("Error fetching listing details:", error);
    throw error;
  }
}

// Hook to fetch all marketplace listings
export const useMarketplaceListings = () => {
  return useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: async (): Promise<MarketplaceListing[]> => {
      try {
        // First try to query listing IDs from contract
        const result = await readContract(
          'Marketplace',
          'getActiveListings',
          [CONTRACT_ADDRESSES.EventTicket, 0, 100] // Query for our primary ticket contract
        );
        
        const listingIds = result?.listingIds || [];
        
        if (listingIds.length === 0) {
          console.log('No active listings found, using mock data');
          return mockListings;
        }
        
        // Fetch details for each listing
        const listingsPromises = listingIds.map((id: string) => fetchListingDetails(id));
        const listings = await Promise.all(listingsPromises);
        
        return listings.filter(listing => listing.active);
      } catch (error) {
        console.error('Error fetching marketplace listings:', error);
        // Fallback to mock data on error
        return mockListings;
      }
    },
    // Cache for a short period since marketplace is dynamic
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook for user's listings
export const useUserListings = (userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  return useQuery({
    queryKey: ['marketplace-listings', 'user', targetAddress],
    queryFn: async (): Promise<MarketplaceListing[]> => {
      if (!targetAddress) return [];

      try {
        // Query all listings and filter by seller
        const allListings = await readContract(
          'Marketplace',
          'getActiveListings',
          [CONTRACT_ADDRESSES.EventTicket, 0, 100]
        );
        
        const listingIds = allListings?.listingIds || [];
        
        if (listingIds.length === 0) {
          return mockListings.filter(listing => 
            listing.seller.toLowerCase() === targetAddress.toLowerCase()
          );
        }
        
        // Fetch details and filter by seller
        const listingsPromises = listingIds.map((id: string) => fetchListingDetails(id));
        const allListingDetails = await Promise.all(listingsPromises);
        
        return allListingDetails.filter((listing: MarketplaceListing) => 
          listing.active && 
          listing.seller.toLowerCase() === targetAddress.toLowerCase()
        );
      } catch (error) {
        console.error('Error fetching user listings:', error);
        return mockListings.filter(listing => 
          listing.seller.toLowerCase() === targetAddress.toLowerCase()
        );
      }
    },
    enabled: !!targetAddress,
  });
};

// Hook to list a ticket for sale
export const useListTicketForSale = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  return useMutation({
    mutationFn: async (listingData: {
      ticketContract: string;
      tokenId: number;
      price: string; // Price in wei as string
    }) => {
      if (!address) throw new Error('Wallet not connected');

      // Check if on Base Sepolia testnet, switch if not
      if (chainId !== 84532) {
        try {
          await switchChain({ chainId: 84532 });
          // Wait for the switch
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          throw new Error('Failed to switch to Base Sepolia testnet. Please switch manually.');
        }
      }

      try {
        // First approve marketplace to transfer the NFT
        const approveResult = await callUnsignedTx(
          listingData.ticketContract,
          'eventticket',
          'approve',
          [CONTRACT_ADDRESSES.Marketplace, listingData.tokenId],
          address
        );

        const approveTxData = approveResult?.tx || approveResult;
        const formattedApprove = formatForWallet(approveTxData, address);

        if (!walletClient) {
          throw new Error('No wallet client available');
        }

        // Send approval transaction
        const approveTxHash = await walletClient.sendTransaction(formattedApprove as any);
        
        // Wait for approval to be confirmed
        await new Promise(resolve => setTimeout(resolve, 5000)); // Simple wait, would use proper confirmation in production
        
        // Now list the ticket
        const listingResult = await callUnsignedTx(
          CONTRACT_ADDRESSES.Marketplace,
          'marketplace',
          'listTicket',
          [listingData.ticketContract, listingData.tokenId, listingData.price],
          address
        );
        
        const listingTxData = listingResult?.tx || listingResult;
        const formattedListing = formatForWallet(listingTxData, address);
        
        // Send listing transaction
        const listingTxHash = await walletClient.sendTransaction(formattedListing as any);
        
        return { 
          approveTxHash,
          listingTxHash,
          tokenId: listingData.tokenId
        };
      } catch (error) {
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings', 'user', address] });
    },
  });
};

// Hook to buy a ticket from marketplace
export const useBuyMarketplaceTicket = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  return useMutation({
    mutationFn: async (purchaseData: {
      listingId: string;
      price: string; // Price in wei as string
    }) => {
      if (!address) throw new Error('Wallet not connected');

      // Check if on Base Sepolia testnet, switch if not
      if (chainId !== 84532) {
        try {
          await switchChain({ chainId: 84532 });
          // Wait for the switch
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          throw new Error('Failed to switch to Base Sepolia testnet. Please switch manually.');
        }
      }

      try {
        // Call buyTicket function with value
        const result = await callUnsignedTx(
          CONTRACT_ADDRESSES.Marketplace,
          'marketplace',
          'buyTicket',
          [purchaseData.listingId],
          address,
          purchaseData.price // Send exact price
        );
        
        const txData = result?.tx || result;
        const formatted = formatForWallet(txData, address);
        
        if (!walletClient) {
          throw new Error('No wallet client available');
        }
        
        // Send transaction
        const txHash = await walletClient.sendTransaction(formatted as any);
        
        return { 
          txHash,
          listingId: purchaseData.listingId
        };
      } catch (error) {
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
    },
  });
};

// Hook to cancel a listing
export const useCancelMarketplaceListing = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!address) throw new Error('Wallet not connected');

      try {
        const result = await callUnsignedTx(
          CONTRACT_ADDRESSES.Marketplace,
          'marketplace',
          'cancelListing',
          [listingId],
          address
        );
        
        const txData = result?.tx || result;
        const formatted = formatForWallet(txData, address);
        
        if (!walletClient) {
          throw new Error('No wallet client available');
        }
        
        const txHash = await walletClient.sendTransaction(formatted as any);
        
        return { 
          txHash,
          listingId
        };
      } catch (error) {
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings', 'user', address] });
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
    },
  });
};