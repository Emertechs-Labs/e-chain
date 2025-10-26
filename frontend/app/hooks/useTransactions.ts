import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount, useWalletClient, useChainId, useSwitchChain } from 'wagmi';
import { defaultChain } from '../../lib/wagmi';
import { CONTRACT_ADDRESSES } from '../../lib/contracts';
import { uploadTicketMetadata } from '../../lib/ipfs';
import { ethers } from 'ethers';
import { readContract, writeContract, getBalance } from '../../lib/contract-wrapper';
import { addPendingTx } from './useChainWatcher';

// Safe stringify that handles BigInt and circular refs for logging
const safeStringify = (v: any) => {
  try {
    return JSON.parse(
      JSON.stringify(v, (_key, val) => (typeof val === 'bigint' ? val.toString() : val))
    );
  } catch (e) {
    return String(v);
  }
};

// Error handling utility
const handleTransactionError = (error: any): string => {
  // Handle CORS errors
  if (error?.message?.includes('Network Error') || error?.message?.includes('CORS')) {
    return 'Network error: Please check your internet connection and try again.';
  }

  // Handle transaction errors
  if (error?.response?.status === 403) {
    return 'Access denied: Please check your API key configuration.';
  }

  if (error?.response?.status === 401) {
    return 'Unauthorized: Please check your API authentication.';
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Transaction failed. Please try again.';
};

// Helper: convert transaction data to viem/wagmi-friendly format
const formatForWallet = (txData: any, accountAddress: string) => {
  if (!txData) throw new Error('Missing txData');
  // sdk returns the unsigned tx typically under txData.tx or txData
  const raw = txData.tx || txData;
  const formatted: any = { ...raw };

  // Convert value to BigInt if present and not zero
  if (formatted.value) {
    try {
      // value may be hex string or decimal string
      formatted.value = BigInt(formatted.value);
    } catch (e) {
      // fallback: try Number then BigInt
      formatted.value = BigInt(formatted.value || '0');
    }
  }

  // Map legacy gas -> gasLimit
  if (formatted.gas) {
    try {
      formatted.gasLimit = BigInt(formatted.gas);
    } catch (e) {
      // ignore conversion error
      formatted.gasLimit = formatted.gas;
    }
    delete formatted.gas;
  }

  // Map EIP-1559 fields
  if (formatted.gasFeeCap) {
    try {
      formatted.maxFeePerGas = BigInt(formatted.gasFeeCap);
    } catch (e) {
      formatted.maxFeePerGas = formatted.gasFeeCap;
    }
    delete formatted.gasFeeCap;
  }
  if (formatted.gasTipCap) {
    try {
      formatted.maxPriorityFeePerGas = BigInt(formatted.gasTipCap);
    } catch (e) {
      formatted.maxPriorityFeePerGas = formatted.gasTipCap;
    }
    delete formatted.gasTipCap;
  }

  // Remove fields we want wallet to determine
  delete formatted.nonce;
  delete formatted.gasPrice;
  delete formatted.from;
  delete formatted.hash;

  // Attach account for viem wallet client
  if (accountAddress) formatted.account = accountAddress;

  return formatted;
};

// Hook for creating events
export const useCreateEvent = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  return useMutation({
    mutationFn: async (eventData: {
      name: string;
      metadataURI: string;
      ticketPrice: string;
      maxTickets: number;
      startTime: number;
      endTime: number;
    }) => {
      console.log('[useCreateEvent] Mutation started');
      const traceId = Date.now().toString(36);
      console.debug('[useCreateEvent] start', { traceId, eventData: safeStringify(eventData) });
      if (!address) throw new Error('Wallet not connected');

      console.log('[useCreateEvent] Wallet connected, address:', address);

      // Check if on Base Sepolia testnet, switch if not
      console.log('[useCreateEvent] Current chainId:', chainId);
      if (chainId !== 84532) {
        console.log('[useCreateEvent] Switching to Base Sepolia testnet');
        try {
          await switchChain({ chainId: 84532 });
          // Wait a bit for the switch
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('[useCreateEvent] Switched to Base Sepolia');
        } catch (error) {
          console.error('[useCreateEvent] Switch failed:', error);
          throw new Error('Failed to switch to Base Sepolia testnet. Please switch manually.');
        }
      }

      console.log('[useCreateEvent] On correct network, proceeding');

      // Check if organizer is verified, and verify automatically if not
      console.log('[useCreateEvent] Checking organizer verification');
      try {
        const isVerified = await readContract<boolean>('EventFactory', 'isVerifiedOrganizer', [address]);
        console.log('[useCreateEvent] Organizer verification status:', isVerified);

        if (!isVerified) {
          console.log('[useCreateEvent] Organizer not verified, verifying automatically...');
          const verifyTxHash = await writeContract(
            'EventFactory',
            'selfVerifyOrganizer',
            [address],
            {
              account: address,
              value: BigInt('2000000000000000'), // 0.002 ETH
              waitForConfirmation: true,
            }
          );
          console.log('[useCreateEvent] Automatic verification successful:', verifyTxHash);
        }
      } catch (error) {
        console.error('[useCreateEvent] Verification check/attempt failed:', error);
        // Continue with event creation - the contract will enforce verification
      }

      try {
        console.log('[useCreateEvent] Calling writeContract with fallback');
        const txHash = await writeContract(
          'EventFactory',
          'createEvent',
          [
            eventData.name,
            eventData.metadataURI,
            eventData.ticketPrice,
            eventData.maxTickets,
            eventData.startTime,
            eventData.endTime,
          ],
          {
            account: address,
            value: undefined, // No ETH value for event creation
            waitForConfirmation: false,
          }
        );

  console.log('[useCreateEvent] writeContract success, txHash:', txHash);
  try { addPendingTx(txHash as any); } catch (e) { /* ignore */ }

        // Return the transaction hash so callers can track status
        return { txHash };
      } catch (error) {
        console.error('Event creation failed:', {
          traceId,
          error: safeStringify(error),
        });
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: (data) => {
      console.log('[useCreateEvent] Transaction confirmed, invalidating queries', { txHash: data.txHash });
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
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async (purchaseData: {
      eventId: number;
      ticketContract: `0x${string}`;
      ticketPrice: bigint;
      quantity?: number;
      eventData?: {
        name: string;
        description: string;
        venue: string;
        startTime: number;
        endTime: number;
        imageUrl?: string;
      };
    }) => {
      const traceId = Date.now().toString(36);
      console.debug('[usePurchaseTicket] start', { traceId, purchaseData: safeStringify(purchaseData) });
      if (!address) throw new Error('Wallet not connected');

      try {
        // Calculate total cost for the quantity
        const quantity = purchaseData.quantity || 1;
        // Fix BigInt conversion - ensure both values are BigInt before multiplication
        const ticketPriceBigInt = typeof purchaseData.ticketPrice === 'bigint' 
          ? purchaseData.ticketPrice 
          : BigInt(purchaseData.ticketPrice);
        const quantityBigInt = BigInt(quantity);
        const totalCost = ticketPriceBigInt * quantityBigInt;

        // Use writeContract wrapper with automatic fallback
        const options: { account: `0x${string}`; value: bigint; waitForConfirmation: boolean } = { account: address, value: totalCost, waitForConfirmation: false };
  const txHash = await writeContract(purchaseData.ticketContract, 'purchaseTicket', [Number(quantity)], options);

  console.debug('[usePurchaseTicket] transaction sent', { traceId, txHash });
  try { addPendingTx(txHash as any); } catch (e) { /* ignore */ }

        return { txHash, purchaseData };
      } catch (error) {
        console.error('Ticket purchase failed:', { traceId, error: safeStringify(error) });
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: async (data, variables) => {
      // Upload ticket metadata to IPFS after successful purchase
      try {
        if (variables.eventData) {
          const ticketMetadata: {
            name: string;
            description: string;
            eventId: number;
            eventName: string;
            ticketId: number;
            seatNumber?: number;
            tier: string;
            attributes: Array<{
              trait_type: string;
              value: string;
            }>;
            image?: string;
          } = {
            name: `${variables.eventData.name} - Ticket`,
            description: `NFT Ticket for ${variables.eventData.name}\n\n${variables.eventData.description}\n\nVenue: ${variables.eventData.venue}\nStart: ${new Date(variables.eventData.startTime * 1000).toLocaleString()}\nEnd: ${new Date(variables.eventData.endTime * 1000).toLocaleString()}`,
            eventId: variables.eventId,
            eventName: variables.eventData.name,
            ticketId: 0, // Will be set by contract after minting
            seatNumber: undefined, // Assigned by contract
            tier: 'General Admission',
            attributes: [
              { trait_type: 'Event', value: variables.eventData.name },
              { trait_type: 'Venue', value: variables.eventData.venue },
              { trait_type: 'Start Time', value: new Date(variables.eventData.startTime * 1000).toISOString() },
              { trait_type: 'End Time', value: new Date(variables.eventData.endTime * 1000).toISOString() },
              { trait_type: 'Ticket Type', value: 'NFT' },
              { trait_type: 'Transferable', value: 'Yes' },
            ],
          };

          if (variables.eventData.imageUrl) {
            ticketMetadata.image = variables.eventData.imageUrl;
          }

          const metadataResult = await uploadTicketMetadata(ticketMetadata);
          if (metadataResult.success) {
            console.log('Ticket metadata uploaded to IPFS:', metadataResult.url);
          } else {
            console.warn('Failed to upload ticket metadata:', metadataResult.error);
          }
        }
      } catch (error) {
        console.error('Error uploading ticket metadata:', error);
      }

      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      // Invalidate user tickets query to refresh the user's ticket list
      if (address) {
        queryClient.invalidateQueries({ queryKey: ['user-tickets', address] });
      }
    },
    onError: (error) => {
      console.error('Ticket purchase failed:', error);
    },
  });
};

// Hook for claiming POAP
export const useClaimPOAP = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async (claimData: {
      eventId: number;
      poapContract: string;
    }) => {
      const traceId = Date.now().toString(36);
      console.debug('[useClaimPOAP] start', { traceId, claimData: safeStringify(claimData) });
      if (!address) throw new Error('Wallet not connected');

      try {
        // For POAP claiming, we need to get a signature from the backend
        // since the contract requires signature verification
        const response = await fetch('/api/poap/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: claimData.eventId,
            attendeeAddress: address,
            nonce: 0 // For now, using 0 - in production should get from contract
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get POAP claim transaction');
        }

        const unsignedTx = await response.json();

        console.debug('[useClaimPOAP] unsignedTx raw', { traceId, unsignedTx: safeStringify(unsignedTx) });

        const txData = unsignedTx?.tx || unsignedTx;
        const formatted = formatForWallet(txData, address);

        console.debug('[useClaimPOAP] formatted tx ready for wallet', { traceId, formatted: safeStringify(formatted) });

        if (!walletClient) throw new Error('No wallet client available');

        console.debug('[useClaimPOAP] calling walletClient.sendTransaction', { traceId, payload: safeStringify(formatted) });
  const txHash = await walletClient.sendTransaction(formatted as any);

  console.debug('[useClaimPOAP] wallet sendTransaction result', { traceId, txHash });
  try { addPendingTx(txHash as any); } catch (e) { /* ignore */ }

        return { txHash };
      } catch (error) {
        console.error('POAP claim failed:', { traceId, error: safeStringify(error) });
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

// Hook for claiming early bird rewards
export const useClaimEarlyBird = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async (claimData: {
      eventId: number;
      ticketContract: string;
    }) => {
      const traceId = Date.now().toString(36);
      console.debug('[useClaimEarlyBird] start', { traceId, claimData: safeStringify(claimData) });
      if (!address) throw new Error('Wallet not connected');

      try {
        const txHash = await writeContract(
          'IncentiveManager',
          'claimEarlyBird',
          [claimData.eventId, claimData.ticketContract],
          {
            account: address,
            value: undefined,
            waitForConfirmation: false,
          }
        );

        console.debug('[useClaimEarlyBird] transaction sent', { traceId, txHash });
        try { addPendingTx(txHash as any); } catch (e) { /* ignore */ }

        return { txHash };
      } catch (error) {
        console.error('Early bird claim failed:', { traceId, error: safeStringify(error) });
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['early-bird-status', variables.eventId] });
    },
    onError: (error) => {
      console.error('Early bird claim failed:', error);
    },
  });
};

// Hook for generating referral codes
export const useGenerateReferralCode = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async (codeData: {
      code: string;
    }) => {
      const traceId = Date.now().toString(36);
      console.debug('[useGenerateReferralCode] start', { traceId, codeData: safeStringify(codeData) });
      if (!address) throw new Error('Wallet not connected');

      try {
        // Convert string to bytes32
        const codeBytes32 = '0x' + Buffer.from(codeData.code.padEnd(32, '\0')).toString('hex').slice(0, 64);

        const txHash = await writeContract(
          'IncentiveManager',
          'generateReferralCode',
          [codeBytes32],
          {
            account: address,
            value: undefined,
            waitForConfirmation: false,
          }
        );

        console.debug('[useGenerateReferralCode] transaction sent', { traceId, txHash });
        try { addPendingTx(txHash as any); } catch (e) { /* ignore */ }

        return { txHash, code: codeData.code };
      } catch (error) {
        console.error('Referral code generation failed:', { traceId, error: safeStringify(error) });
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-referral-codes'] });
    },
    onError: (error) => {
      console.error('Referral code generation failed:', error);
    },
  });
};

// Hook for claiming loyalty rewards
export const useClaimLoyaltyReward = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async (claimData: {
      threshold: number;
    }) => {
      const traceId = Date.now().toString(36);
      console.debug('[useClaimLoyaltyReward] start', { traceId, claimData: safeStringify(claimData) });
      if (!address) throw new Error('Wallet not connected');

      try {
        const txHash = await writeContract(
          'IncentiveManager',
          'claimLoyaltyReward',
          [claimData.threshold],
          {
            account: address,
            value: undefined,
            waitForConfirmation: false,
          }
        );

        console.debug('[useClaimLoyaltyReward] transaction sent', { traceId, txHash });
        try { addPendingTx(txHash as any); } catch (e) { /* ignore */ }

        return { txHash };
      } catch (error) {
        console.error('Loyalty reward claim failed:', { traceId, error: safeStringify(error) });
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['user-loyalty-points'] });
    },
    onError: (error) => {
      console.error('Loyalty reward claim failed:', error);
    },
  });
};

// Hook for checking organizer verification status
export const useOrganizerVerification = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['organizer-verification', address],
    queryFn: async () => {
      if (!address) return { isVerified: false };

      try {
        const isVerified = await readContract<boolean>('EventFactory', 'isVerifiedOrganizer', [address]);
        return { isVerified };
      } catch (error) {
        console.error('Error checking organizer verification:', error);
        return { isVerified: false };
      }
    },
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for verifying an organizer (self-verification with payment)
export const useVerifyOrganizer = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  return useMutation({
    mutationFn: async () => {
      if (!address) throw new Error('Wallet not connected');
      
      const traceId = Date.now().toString(36);
      console.debug('[useVerifyOrganizer] start', { traceId, address });

      try {
        // Check if wallet client is available (from wagmi)
        if (!walletClient) {
          console.warn('[useVerifyOrganizer] Wagmi wallet client not available, but proceeding with direct client');
        }

        // Check current chain using wagmi's chainId hook
        console.debug('[useVerifyOrganizer] current chain:', chainId);

        if (chainId !== 84532) {
          throw new Error('Please switch to Base Sepolia testnet before proceeding.');
        }

        // Check wallet balance using direct client
        const balance = await getBalance(address, 84532);
        const requiredAmount = BigInt('2000000000000000'); // 0.002 ETH
        console.debug('[useVerifyOrganizer] wallet balance:', balance.toString());
        console.debug('[useVerifyOrganizer] required amount:', requiredAmount.toString());

        if (balance < requiredAmount) {
          throw new Error(`Insufficient balance. You need at least 0.002 ETH, but only have ${Number(balance) / 1e18} ETH.`);
        }

        console.debug('[useVerifyOrganizer] calling writeContract');

        const txHash = await writeContract(
          'EventFactory',
          'selfVerifyOrganizer',
          [address],
          {
            account: address,
            value: requiredAmount,
            waitForConfirmation: true,
          }
        );

        console.debug('[useVerifyOrganizer] transaction sent', { traceId, txHash });
        try { addPendingTx(txHash as any); } catch (e) { /* ignore */ }

        return { txHash };
      } catch (error) {
        console.error('Organizer verification failed:', {
          traceId,
          error: safeStringify(error),
        });
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: () => {
      // Invalidate verification status and related queries
      queryClient.invalidateQueries({ queryKey: ['organizer-verification'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Organizer verification failed:', error);
    },
  });
};

// Hook for claiming incentives (generic wrapper for different incentive types)
export const useClaimIncentives = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async (claimData: {
      eventId?: number;
      incentiveType: 'early-bird' | 'loyalty' | 'referral';
      ticketContract?: string;
    }) => {
      const traceId = Date.now().toString(36);
      console.debug('[useClaimIncentives] start', { traceId, claimData: safeStringify(claimData) });
      if (!address) throw new Error('Wallet not connected');

      try {
        let contractName: keyof typeof CONTRACT_ADDRESSES;
        let method: string;
        let args: any[];

        switch (claimData.incentiveType) {
          case 'early-bird':
            if (!claimData.eventId || !claimData.ticketContract) {
              throw new Error('Event ID and ticket contract required for early bird claims');
            }
            contractName = 'IncentiveManager';
            method = 'claimEarlyBird';
            args = [claimData.eventId, claimData.ticketContract];
            break;

          case 'loyalty':
            contractName = 'IncentiveManager';
            method = 'claimLoyaltyReward';
            args = [10]; // Default threshold
            break;

          case 'referral':
            // Note: Referral claiming might need different implementation
            // For now, we'll assume it's handled via loyalty system
            contractName = 'IncentiveManager';
            method = 'claimLoyaltyReward';
            args = [10];
            break;

          default:
            throw new Error(`Unknown incentive type: ${claimData.incentiveType}`);
        }

        const txHash = await writeContract(
          contractName,
          method,
          args,
          {
            account: address,
            value: undefined,
            waitForConfirmation: false,
          }
        );

        console.debug('[useClaimIncentives] transaction sent', { traceId, txHash });
        try { addPendingTx(txHash as any); } catch (e) { /* ignore */ }

        return { txHash, claimData };
      } catch (error) {
        console.error('Incentive claim failed:', { traceId, error: safeStringify(error) });
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['user-loyalty-points'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-rewards'] });

      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ['early-bird-status', variables.eventId] });
      }
    },
    onError: (error) => {
      console.error('Incentive claim failed:', error);
    },
  });
};

// Hook for fetching ETH price
export const useEthPrice = () => {
  return useQuery({
    queryKey: ['eth-price'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/eth-price');
        if (!response.ok) {
          throw new Error('Failed to fetch ETH price');
        }
        return response.json();
      } catch (error) {
        console.warn('ETH price fetch failed, using fallback:', error);
        // Return fallback data if API fails
        return {
          ethPrice: 2500,
          ethAmountForOneDollar: 1 / 2500,
          lastUpdated: new Date().toISOString(),
          source: 'fallback'
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 2, // Retry failed requests
    retryDelay: 1000, // Wait 1 second before retry
  });
};