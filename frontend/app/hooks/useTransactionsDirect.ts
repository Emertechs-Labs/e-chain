/**
 * Direct Wallet Transaction Hooks (No MultiBaas)
 * 
 * These hooks bypass MultiBaas completely and interact directly with contracts
 * using wagmi. Use these when MultiBaas is unavailable or misconfigured.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';

/**
 * Create Event - Direct Wallet Transaction (No MultiBaas)
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
    },
    onError: (error: any) => {
      console.error('[useCreateEventDirect] Failed:', error);
      throw new Error(error?.message || 'Event creation failed');
    },
  });
};

/**
 * Purchase Ticket - Direct Wallet Transaction (No MultiBaas)
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
        eventId: purchaseData.eventId 
      };
    },
    onSuccess: (data) => {
      console.log('[usePurchaseTicketDirect] Success!', data.txHash);
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
