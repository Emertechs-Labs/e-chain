/**
 * Direct Wallet Transaction Hooks
 *
 * These hooks interact directly with smart contracts using wagmi,
 * providing fast and reliable transaction handling.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { generateVerificationQR, uploadVerificationData, uploadTicketMetadata, VerificationData } from '../../lib/ipfs';
import { readContract } from '../../lib/contract-wrapper';

/**
 * Create Event - Direct Wallet Transaction
 */
export const useCreateEventDirect = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  return useMutation({
    mutationFn: async (eventData: {
      name: string;
      metadataURI: string;
      ticketPrice: string; // in ETH
      maxTickets: number;
      startTime: number;
      endTime: number;
    }) => {
      if (!address) throw new Error('Wallet not connected');

      // Ensure on Base Sepolia
      if (chainId !== 84532) {
        await switchChain({ chainId: 84532 });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('[useCreateEventDirect] Creating event:', {
        name: eventData.name,
        ticketPrice: eventData.ticketPrice,
        maxTickets: eventData.maxTickets
      });

      // Call contract directly via wagmi
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.EventFactory as `0x${string}`,
        abi: CONTRACT_ABIS.EventFactory,
        functionName: 'createEvent',
        args: [
          eventData.name,
          eventData.metadataURI,
          parseEther(eventData.ticketPrice), // Convert ETH to wei
          BigInt(eventData.maxTickets),
          BigInt(eventData.startTime),
          BigInt(eventData.endTime),
        ],
      });

      console.log('[useCreateEventDirect] Transaction sent:', hash);
      return { txHash: hash };
    },
    onSuccess: (data) => {
      console.log('[useCreateEventDirect] Success!', data.txHash);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      if (address) {
        queryClient.invalidateQueries({ queryKey: ['events', 'organizer', address] });
      }

      // Store event creation in transaction cache for faster discovery
      // Note: We don't have the event ID yet, it will be discovered via blockchain polling
      console.log('[useCreateEventDirect] Event creation transaction stored, will be discovered via blockchain');
    },
    onError: (error: any) => {
      console.error('[useCreateEventDirect] Failed:', error);
      throw new Error(error?.message || 'Event creation failed');
    },
  });
};

/**
 * Purchase Ticket - Direct Wallet Transaction
 */
export const usePurchaseTicketDirect = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  return useMutation({
    mutationFn: async (purchaseData: {
      eventId: number;
      ticketContract: string;
      ticketPrice: bigint | string | number;
      quantity?: number;
    }) => {
      if (!address) throw new Error('Wallet not connected');

      // Ensure on Base Sepolia
      if (chainId !== 84532) {
        await switchChain({ chainId: 84532 });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Convert to BigInt explicitly
      const quantityBigInt = BigInt(purchaseData.quantity || 1);
      const ticketPriceBigInt = typeof purchaseData.ticketPrice === 'bigint' 
        ? purchaseData.ticketPrice 
        : BigInt(purchaseData.ticketPrice);
      const totalCost = ticketPriceBigInt * quantityBigInt;

      console.log('[usePurchaseTicketDirect] Purchasing ticket:', {
        contract: purchaseData.ticketContract,
        quantity: quantityBigInt.toString(),
        ticketPrice: ticketPriceBigInt.toString(),
        totalCost: totalCost.toString()
      });

      // Call contract directly via wagmi
      const hash = await writeContractAsync({
        address: purchaseData.ticketContract as `0x${string}`,
        abi: CONTRACT_ABIS.EventTicket,
        functionName: 'purchaseTicket',
        args: [quantityBigInt],
        value: totalCost, // Send ETH payment
      });

      console.log('[usePurchaseTicketDirect] Transaction sent:', hash);
      return { 
        txHash: hash,
        eventId: purchaseData.eventId,
        ticketContract: purchaseData.ticketContract,
        quantity: purchaseData.quantity || 1
      };
    },
    onSuccess: async (data) => {
      console.log('[usePurchaseTicketDirect] Success!', data.txHash);
      
      // Generate QR code for transaction verification
      try {
        const verificationData: VerificationData = {
          eventId: data.eventId,
          eventName: 'Event Ticket Purchase', // Will be updated with actual event name
          organizer: address || 'Unknown',
          transactionHash: data.txHash,
          blockNumber: 0, // Will be fetched from transaction receipt
          timestamp: Math.floor(Date.now() / 1000),
          attendeeAddress: address,
        };

        // Generate QR code asynchronously (don't block the success flow)
        generateVerificationQR(verificationData).then(qrCode => {
          console.log('[usePurchaseTicketDirect] QR code generated for transaction:', data.txHash);
          // QR code can be stored in local storage or sent to backend for later retrieval
          localStorage.setItem(`qr-${data.txHash}`, qrCode);
        }).catch(error => {
          console.warn('[usePurchaseTicketDirect] Failed to generate QR code:', error);
        });

        // Generate ticket metadata for each purchased ticket
        // Note: In production, this would need to be done by the organizer or through a backend service
        // since setting token URIs requires the organizer's permission
        setTimeout(async () => {
          try {
            // Get event details to include in ticket metadata
            const eventDetails = await readContract('EventFactory', 'getEventDetails', [data.eventId]);
            
            // For each ticket that was purchased, generate metadata
            // This is a simplified version - in production you'd need to track which tokenIds were minted
            const ticketMetadata = {
              name: `Ticket for ${eventDetails.name}`,
              description: `NFT ticket for ${eventDetails.name} - ${eventDetails.description || 'An amazing blockchain event'}`,
              image: eventDetails.metadataURI || 'ipfs://placeholder-ticket-image', // Event poster
              eventId: data.eventId,
              eventName: eventDetails.name,
              ticketId: 0, // Would need to be set per ticket
              seatNumber: 0, // General admission
              tier: 'General Admission',
              attributes: [
                { trait_type: 'Event', value: eventDetails.name },
                { trait_type: 'Ticket Type', value: 'General Admission' },
                { trait_type: 'Transferable', value: 'Yes' },
                { trait_type: 'Event Date', value: new Date(Number(eventDetails.startTime) * 1000).toISOString().split('T')[0] },
                { trait_type: 'Venue', value: 'TBA' }, // Would need to be fetched from metadata
              ],
            };

            const metadataResult = await uploadTicketMetadata(ticketMetadata);
            if (metadataResult.success) {
              console.log('[usePurchaseTicketDirect] Ticket metadata uploaded:', metadataResult.url);
              // In production, you'd call setTokenURI for each tokenId here
              // This requires organizer permission, so it would be done server-side
            } else {
              console.warn('[usePurchaseTicketDirect] Failed to upload ticket metadata:', metadataResult.error);
            }
          } catch (error) {
            console.error('[usePurchaseTicketDirect] Error generating ticket metadata:', error);
          }
        }, 200); // Small delay to ensure transaction is processed
      } catch (error) {
        console.warn('[usePurchaseTicketDirect] Error preparing QR code data:', error);
      }

      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['event-tickets-sold', data.eventId] });
      if (address) {
        queryClient.invalidateQueries({ queryKey: ['user-tickets', address] });
      }
    },
    onError: (error: any) => {
      console.error('[usePurchaseTicketDirect] Failed:', error);
      
      // Parse common errors
      let errorMessage = 'Ticket purchase failed';
      if (error?.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to purchase ticket';
      } else if (error?.message?.includes('Exceeds maximum supply')) {
        errorMessage = 'Event is sold out';
      } else if (error?.message?.includes('Exceeds max tickets per address')) {
        errorMessage = 'You have reached the maximum tickets allowed per address';
      } else if (error?.message?.includes('user rejected')) {
        errorMessage = 'Transaction cancelled by user';
      }
      
      throw new Error(errorMessage);
    },
  });
};

/**
 * Hook to wait for transaction confirmation
 */
export const useWaitForTransaction = (hash?: `0x${string}`) => {
  return useWaitForTransactionReceipt({
    hash,
  });
};
