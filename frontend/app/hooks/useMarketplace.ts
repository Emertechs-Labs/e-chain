import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { handleTransactionError } from '../../lib/transaction-utils';

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
const mockListings: MarketplaceListing[] = [];

// Hook to fetch all marketplace listings
export const useMarketplaceListings = () => {
  return useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: async (): Promise<MarketplaceListing[]> => {
      try {
        // Fetch listings from database API
        const response = await fetch('/api/marketplace');
        if (!response.ok) {
          throw new Error('Failed to fetch marketplace listings');
        }

        const listings = await response.json();

        // If we got listings from the API (even if empty), return them
        // Convert string prices back to BigInt
        return listings.map((listing: any) => ({
          ...listing,
          price: BigInt(listing.price),
          originalPrice: BigInt(listing.originalPrice)
        }));
      } catch (error) {
        console.error('Error fetching marketplace listings:', error);
        // Return empty array instead of mock data when API fails
        return [];
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
        // Fetch user's listings from database API
        const response = await fetch(`/api/marketplace?seller=${targetAddress}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user listings');
        }

        const listings = await response.json();

        // Convert string prices back to BigInt
        return listings.map((listing: any) => ({
          ...listing,
          price: BigInt(listing.price),
          originalPrice: BigInt(listing.originalPrice)
        }));
      } catch (error) {
        console.error('Error fetching user listings:', error);
        return [];
      }
    },
    enabled: !!targetAddress,
  });
};

// Hook to list a ticket for sale
export const useListTicketForSale = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingData: {
      ticketContract: string;
      tokenId: number;
      price: string; // Price in wei as string
      eventId: number;
      eventName: string;
      ticketType: string;
      originalPrice: string;
      eventDate: number;
      location: string;
    }) => {
      if (!address) throw new Error('Wallet not connected');

      try {
        // Generate unique listing ID
        const listingId = `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create listing in database
        const response = await fetch('/api/marketplace', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: listingId,
            tokenId: listingData.tokenId,
            eventId: listingData.eventId,
            eventName: listingData.eventName,
            ticketType: listingData.ticketType,
            price: listingData.price,
            originalPrice: listingData.originalPrice,
            seller: address,
            eventDate: listingData.eventDate,
            location: listingData.location,
            ticketContract: listingData.ticketContract,
            listedAt: Math.floor(Date.now() / 1000),
            active: true
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create marketplace listing');
        }

        const result = await response.json();

        return {
          listingId,
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

  return useMutation({
    mutationFn: async (purchaseData: {
      listingId: string;
      price: string; // Price in wei as string
    }) => {
      if (!address) throw new Error('Wallet not connected');

      try {
        // Mark listing as inactive (sold) in database
        const response = await fetch('/api/marketplace', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: purchaseData.listingId,
            active: false
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update marketplace listing');
        }

        return {
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

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!address) throw new Error('Wallet not connected');

      try {
        // Mark listing as inactive in database
        const response = await fetch('/api/marketplace', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: listingId,
            active: false
          })
        });

        if (!response.ok) {
          throw new Error('Failed to cancel marketplace listing');
        }

        return {
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