import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useWalletClient, useChainId, useSwitchChain } from 'wagmi';
import { defaultChain } from '../../lib/wagmi';
import { CONTRACT_ADDRESSES } from '../../lib/contracts';
import { uploadTicketMetadata } from '../../lib/ipfs';

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

// Helper to call our server-side proxy that calls MultiBaas to avoid CORS and hide API keys
const callUnsignedTx = async (
  address: string,
  contractLabel: string,
  method: string,
  args: any[] = [],
  from: string,
  value?: string,
  traceId?: string
) => {
  try {
    console.debug('[useTransactions] proxy getUnsignedTransaction request', {
      address,
      contractLabel,
      method,
      args,
      from,
      value,
      traceId,
    });

    const res = await fetch('/api/multibaas/unsigned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, contractLabel, method, args, from, value, traceId }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err: any = new Error(data?.error || `MultiBaas proxy failed with status ${res.status}`);
      err.response = { status: res.status, data };

      // Provide actionable guidance based on common upstream failures
      const guidance: string[] = [];
      if (res.status === 401) guidance.push('401 Unauthorized — check MULTIBAAS_API_KEY value and server env');
      if (res.status === 403) guidance.push('403 Forbidden — check API key permissions (DApp User vs Administrator) and MultiBaas group roles');
      if (res.status === 405) guidance.push('405 Method Not Allowed — ensure proxy calls use the SDK or correct HTTP method/path');
      if (data?.error || data?.message) guidance.push(`Upstream message: ${data?.error || data?.message}`);

      console.error('[useTransactions] proxy getUnsignedTransaction failed:', {
        status: res.status,
        error: data?.error ?? data?.message,
        upstreamBody: data?.body ?? data,
        upstreamStatus: data?.status,
        guidance: guidance.join(' | '),
      });

      throw err;
    }

    console.debug('[useTransactions] proxy getUnsignedTransaction response', { status: res.status, data });

    // MultiBaas SDK previously returned response.data.result, our proxy returns the raw response body
    return data?.result ?? data;
  } catch (err) {
    console.error('[useTransactions] proxy getUnsignedTransaction error:', safeStringify(err));
    throw err;
  }
};

// Error handling utility
const handleTransactionError = (error: any): string => {
  // Handle CORS errors
  if (error?.message?.includes('Network Error') || error?.message?.includes('CORS')) {
    return 'Network error: Please check your internet connection and try again.';
  }

  // Handle MultiBaas API errors
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

// Helper: convert MultiBaas unsigned tx to viem/wagmi-friendly transaction
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

      try {
        console.log('[useCreateEvent] Calling callUnsignedTx');
        const result = await callUnsignedTx(
          CONTRACT_ADDRESSES.EventFactory,
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
          address,
          undefined,
          traceId
        );

        console.log('[useCreateEvent] callUnsignedTx success');
        console.debug('[useCreateEvent] unsignedTx raw', { traceId, unsignedTx: safeStringify(result) });

        const txData = result?.tx || result;
        const formatted = formatForWallet(txData, address);

        console.log('[useCreateEvent] formatted tx, checking walletClient');
        console.debug('[useCreateEvent] formatted tx ready for wallet', { traceId, formatted: safeStringify(formatted) });

        // Ensure wallet client is available then send transaction
        if (!walletClient) {
          console.error('[useCreateEvent] No wallet client available');
          throw new Error('No wallet client available');
        }

        console.log('[useCreateEvent] walletClient available, sending transaction');
        console.log('[useCreateEvent] walletClient.account:', walletClient.account?.address);
        console.log('[useCreateEvent] useAccount address:', address);
        console.debug('[useCreateEvent] calling walletClient.sendTransaction', { traceId, payload: safeStringify(formatted) });
        const txHash = await walletClient.sendTransaction(formatted as any);

        console.log('[useCreateEvent] sendTransaction success, txHash:', txHash);
        console.debug('[useCreateEvent] wallet sendTransaction result', { traceId, txHash });

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
      ticketContract: string;
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
        const result = await callUnsignedTx(
          purchaseData.ticketContract,
          'EventTicket',
          'purchaseTicket',
          [purchaseData.eventId, purchaseData.quantity || 1],
          address,
          purchaseData.ticketPrice.toString(),
          traceId
        );

        console.debug('[usePurchaseTicket] unsignedTx raw', { traceId, unsignedTx: safeStringify(result) });

        const txData = result?.tx || result;
        const formatted = formatForWallet(txData, address);

        console.debug('[usePurchaseTicket] formatted tx ready for wallet', { traceId, formatted: safeStringify(formatted) });

        if (!walletClient) throw new Error('No wallet client available');

        console.debug('[usePurchaseTicket] calling walletClient.sendTransaction', { traceId, payload: safeStringify(formatted) });
        const txHash = await walletClient.sendTransaction(formatted as any);

        console.debug('[usePurchaseTicket] wallet sendTransaction result', { traceId, txHash });

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
        const result = await callUnsignedTx(
          CONTRACT_ADDRESSES.IncentiveManager,
          'IncentiveManager',
          'claimEarlyBird',
          [claimData.eventId, claimData.ticketContract],
          address,
          undefined,
          traceId
        );

        console.debug('[useClaimEarlyBird] unsignedTx raw', { traceId, unsignedTx: safeStringify(result) });

        const txData = result?.tx || result;
        const formatted = formatForWallet(txData, address);

        console.debug('[useClaimEarlyBird] formatted tx ready for wallet', { traceId, formatted: safeStringify(formatted) });

        if (!walletClient) throw new Error('No wallet client available');

        console.debug('[useClaimEarlyBird] calling walletClient.sendTransaction', { traceId, payload: safeStringify(formatted) });
        const txHash = await walletClient.sendTransaction(formatted as any);

        console.debug('[useClaimEarlyBird] wallet sendTransaction result', { traceId, txHash });

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

      // Convert string to bytes32
      const codeBytes32 = '0x' + Buffer.from(codeData.code.padEnd(32, '\0')).toString('hex').slice(0, 64);

      try {
        const result = await callUnsignedTx(
          CONTRACT_ADDRESSES.IncentiveManager,
          'IncentiveManager',
          'generateReferralCode',
          [codeBytes32],
          address,
          undefined,
          traceId
        );

        console.debug('[useGenerateReferralCode] unsignedTx raw', { traceId, unsignedTx: safeStringify(result) });

        const txData = result?.tx || result;
        const formatted = formatForWallet(txData, address);

        console.debug('[useGenerateReferralCode] formatted tx ready for wallet', { traceId, formatted: safeStringify(formatted) });

        if (!walletClient) throw new Error('No wallet client available');

        console.debug('[useGenerateReferralCode] calling walletClient.sendTransaction', { traceId, payload: safeStringify(formatted) });
        const txHash = await walletClient.sendTransaction(formatted as any);

        console.debug('[useGenerateReferralCode] wallet sendTransaction result', { traceId, txHash });

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
        const result = await callUnsignedTx(
          CONTRACT_ADDRESSES.IncentiveManager,
          'IncentiveManager',
          'claimLoyaltyReward',
          [claimData.threshold],
          address,
          undefined,
          traceId
        );

        console.debug('[useClaimLoyaltyReward] unsignedTx raw', { traceId, unsignedTx: safeStringify(result) });

        const txData = result?.tx || result;
        const formatted = formatForWallet(txData, address);

        console.debug('[useClaimLoyaltyReward] formatted tx ready for wallet', { traceId, formatted: safeStringify(formatted) });

        if (!walletClient) throw new Error('No wallet client available');

        console.debug('[useClaimLoyaltyReward] calling walletClient.sendTransaction', { traceId, payload: safeStringify(formatted) });
        const txHash = await walletClient.sendTransaction(formatted as any);

        console.debug('[useClaimLoyaltyReward] wallet sendTransaction result', { traceId, txHash });

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

// Generic hook for claiming incentives
export const useClaimIncentives = () => {
  const { address } = useAccount();
  const walletClient = useWalletClient()?.data;
  const queryClient = useQueryClient();
  const traceId = `claim-incentives-${Date.now()}`;

  return useMutation({
    mutationFn: async (params: { eventId?: number; incentiveType: string; threshold?: number }) => {
      if (!address) throw new Error('No wallet address available');

      const { eventId, incentiveType, threshold } = params;

      try {
        let result;

        switch (incentiveType) {
          case 'early-bird':
            if (!eventId) throw new Error('Event ID required for early bird claim');
            result = await callUnsignedTx(
              CONTRACT_ADDRESSES.IncentiveManager,
              'IncentiveManager',
              'claimEarlyBird',
              [eventId],
              address,
              undefined,
              traceId
            );
            break;

          case 'loyalty':
            if (!threshold) throw new Error('Threshold required for loyalty claim');
            result = await callUnsignedTx(
              CONTRACT_ADDRESSES.IncentiveManager,
              'IncentiveManager',
              'claimLoyaltyReward',
              [threshold],
              address,
              undefined,
              traceId
            );
            break;

          case 'referral':
            result = await callUnsignedTx(
              CONTRACT_ADDRESSES.IncentiveManager,
              'IncentiveManager',
              'claimReferralReward',
              [],
              address,
              undefined,
              traceId
            );
            break;

          default:
            throw new Error(`Unknown incentive type: ${incentiveType}`);
        }

        console.debug('[useClaimIncentives] unsignedTx raw', { traceId, unsignedTx: safeStringify(result) });

        const txData = result?.tx || result;
        const formatted = formatForWallet(txData, address);

        console.debug('[useClaimIncentives] formatted tx ready for wallet', { traceId, formatted: safeStringify(formatted) });

        if (!walletClient) throw new Error('No wallet client available');

        console.debug('[useClaimIncentives] calling walletClient.sendTransaction', { traceId, payload: safeStringify(formatted) });
        const txHash = await walletClient.sendTransaction(formatted as any);

        console.debug('[useClaimIncentives] wallet sendTransaction result', { traceId, txHash });

        return { txHash };
      } catch (error) {
        console.error('Incentive claim failed:', { traceId, error: safeStringify(error) });
        throw new Error(handleTransactionError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['user-loyalty-points'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['early-bird-status'] });
    },
    onError: (error) => {
      console.error('Incentive claim failed:', error);
    },
  });
};