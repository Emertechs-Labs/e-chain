/**
 * React Hooks for Contract Interaction
 *
 * Easy-to-use hooks for reading and writing to smart contracts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { readContract, writeContract, simulateWrite, type WriteCallOptions } from './contract-wrapper';
import type { CONTRACT_ADDRESSES } from './contracts';

/**
 * Hook for reading contract data with automatic refetch
 */
export function useContractRead<T = any>(
  contractName: keyof typeof CONTRACT_ADDRESSES | null,
  functionName: string | null,
  args: any[] = [],
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { enabled = true, refetchInterval } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const argsKey = JSON.stringify(args);

  const fetchData = useCallback(async () => {
    if (!contractName || !functionName || !enabled) return;

    try {
      const isFirstLoad = data === null;
      if (isFirstLoad) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      
      setError(null);

      const result = await readContract<T>(
        contractName,
        functionName,
        args
      );

      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('Contract read error:', err);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractName, functionName, argsKey, enabled]);

  useEffect(() => {
    fetchData();

    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  return {
    data,
    error,
    isLoading,
    isRefetching,
    refetch: fetchData,
  };
}

/**
 * Hook for writing to contracts with transaction state
 */
export function useContractWrite(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  functionName: string,
  options: {
    waitForConfirmation?: boolean;
    onSuccess?: (txHash: `0x${string}`) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { address } = useAccount();
  const { waitForConfirmation = true, onSuccess, onError } = options;

  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const write = useCallback(
    async (args: any[] = [], value?: bigint) => {
      if (!address) {
        const err = new Error('Wallet not connected');
        setError(err);
        onError?.(err);
        return;
      }

      try {
        setIsPending(true);
        setIsConfirming(false);
        setIsConfirmed(false);
        setError(null);
        setTxHash(null);

        const hash = await writeContract(
          contractName,
          functionName,
          args,
          {
            account: address,
            value,
            waitForConfirmation: false, // We'll handle this manually
          }
        );

        setTxHash(hash);
        setIsPending(false);

        if (waitForConfirmation) {
          setIsConfirming(true);
          
          // Import waitForTransaction
          const { waitForTransaction } = await import('./contract-fallback');
          await waitForTransaction(hash);
          
          setIsConfirming(false);
          setIsConfirmed(true);
        }

        onSuccess?.(hash);
        return hash;
      } catch (err) {
        const error = err as Error;
        setError(error);
        setIsPending(false);
        setIsConfirming(false);
        onError?.(error);
        throw error;
      }
    },
    [address, contractName, functionName, waitForConfirmation, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setIsPending(false);
    setIsConfirming(false);
    setIsConfirmed(false);
    setError(null);
    setTxHash(null);
  }, []);

  return {
    write,
    reset,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    txHash,
  };
}

/**
 * Hook for simulating contract writes before executing
 */
export function useContractSimulate(
  contractName: keyof typeof CONTRACT_ADDRESSES | null,
  functionName: string | null
) {
  const { address } = useAccount();
  
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<any>(null);

  const simulate = useCallback(
    async (args: any[] = [], value?: bigint) => {
      if (!contractName || !functionName) {
        throw new Error('Contract name and function name required');
      }

      if (!address) {
        throw new Error('Wallet not connected');
      }

      try {
        setIsPending(true);
        setError(null);
        setResult(null);

        const simulationResult = await simulateWrite(
          contractName,
          functionName,
          args,
          { account: address, value }
        );

        setResult(simulationResult);
        return simulationResult;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [contractName, functionName, address]
  );

  return {
    simulate,
    isPending,
    error,
    result,
  };
}

// Export types
export type { WriteCallOptions };
