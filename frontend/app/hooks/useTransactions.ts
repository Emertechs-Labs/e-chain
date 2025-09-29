import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useWalletClient } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../lib/contracts';

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

  return useMutation({
    mutationFn: async (eventData: {
      name: string;
      metadataURI: string;
      ticketPrice: string;
      maxTickets: number;
      startTime: number;
      endTime: number;
    }) => {
      const traceId = Date.now().toString(36);
      console.debug('[useCreateEvent] start', { traceId, eventData: safeStringify(eventData) });
      if (!address) throw new Error('Wallet not connected');

      try {
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

        console.debug('[useCreateEvent] unsignedTx raw', { traceId, unsignedTx: safeStringify(result) });

        const txData = result?.tx || result;
        const formatted = formatForWallet(txData, address);

        console.debug('[useCreateEvent] formatted tx ready for wallet', { traceId, formatted: safeStringify(formatted) });

        // Ensure wallet client is available then send transaction
        if (!walletClient) throw new Error('No wallet client available');

        console.debug('[useCreateEvent] calling walletClient.sendTransaction', { traceId, payload: safeStringify(formatted) });
        const txHash = await walletClient.sendTransaction(formatted as any);

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
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async (purchaseData: {
      eventId: number;
      ticketContract: string;
      ticketPrice: bigint;
      quantity?: number;
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

        return { txHash };
      } catch (error) {
        console.error('Ticket purchase failed:', { traceId, error: safeStringify(error) });
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
        const result = await callUnsignedTx(
          claimData.poapContract,
          'POAPAttendance',
          'claimAttendance',
          [claimData.eventId],
          address,
          undefined,
          traceId
        );

        console.debug('[useClaimPOAP] unsignedTx raw', { traceId, unsignedTx: safeStringify(result) });

        const txData = result?.tx || result;
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