import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { callContractWrite } from '../../lib/multibaas';
import { CONTRACT_ADDRESSES } from '../../lib/contracts';

// Error handling utility
const handleTransactionError = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'Transaction failed. Please try again.';
};

// Hook for creating events
export const useCreateEvent = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: {
      name: string;
      metadataURI: string;
      ticketPrice: string;
      maxTickets: number;
      startTime: number;
      endTime: number;
    }) => {
      if (!address) throw new Error('Wallet not connected');

      try {
        const result = await callContractWrite(
          CONTRACT_ADDRESSES.EventFactory,
          'EventFactory',
          'createEvent',
          [
            eventData.name,
            eventData.metadataURI,
            eventData.ticketPrice,
            eventData.maxTickets,
            eventData.startTime,
            eventData.endTime
          ]
        );
        return result;
      } catch (error) {
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      if (address) {
        queryClient.invalidateQueries({ queryKey: ['events', 'organizer', address] });
      }
    },
    onError: (error) => {
      console.error('Event creation failed:', error);
    },
  });
};

// Hook for purchasing tickets
export const usePurchaseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseData: {
      eventId: number;
      ticketContract: string;
      ticketPrice: bigint;
      quantity?: number;
    }) => {
      try {
        const result = await callContractWrite(
          purchaseData.ticketContract,
          'EventTicket',
          'purchaseTicket',
          [purchaseData.eventId, purchaseData.quantity || 1],
          purchaseData.ticketPrice.toString()
        );
        return result;
      } catch (error) {
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Ticket purchase failed:', error);
    },
  });
};

// Hook for claiming POAP
export const useClaimPOAP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimData: {
      eventId: number;
      poapContract: string;
    }) => {
      try {
        const result = await callContractWrite(
          claimData.poapContract,
          'POAPAttendance',
          'claimAttendance',
          [claimData.eventId]
        );
        return result;
      } catch (error) {
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-poaps'] });
    },
    onError: (error) => {
      console.error('POAP claim failed:', error);
    },
  });
};