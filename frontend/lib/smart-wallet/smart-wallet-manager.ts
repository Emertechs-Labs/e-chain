'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPublicClient, http, parseEther, formatEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';

export interface SmartWalletConfig {
  chainId: number;
  rpcUrl: string;
  factoryAddress: string;
  entryPointAddress: string;
  paymasterAddress?: string;
}

export interface SmartWalletState {
  address: string | null;
  isDeployed: boolean;
  balance: string;
  isGasless: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
}

const DEFAULT_CONFIG: SmartWalletConfig = {
  chainId: baseSepolia.id,
  rpcUrl: 'https://sepolia.base.org',
  factoryAddress: '0x9406Cc6185a346906296840746125a0E44976454', // Base Sepolia Account Factory
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // EntryPoint v0.6.0
  paymasterAddress: '0x0000000000000000000000000000000000000000', // No paymaster by default
};

export function useSmartWallet(config: Partial<SmartWalletConfig> = {}) {
  const [state, setState] = useState<SmartWalletState>({
    address: null,
    isDeployed: false,
    balance: '0',
    isGasless: false,
    isLoading: false,
    error: null,
  });

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const publicClient = createPublicClient({
    chain: finalConfig.chainId === base.id ? base : baseSepolia,
    transport: http(finalConfig.rpcUrl),
  });

  const createSmartWallet = useCallback(async (ownerAddress: string): Promise<string> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // In a real implementation, you would:
      // 1. Call the Account Factory to create a new smart wallet
      // 2. Deploy the smart wallet contract
      // 3. Set up the owner and any initial configuration
      
      // For now, we'll simulate the process
      const smartWalletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      setState(prev => ({
        ...prev,
        address: smartWalletAddress,
        isDeployed: true,
        isLoading: false,
      }));

      return smartWalletAddress;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, [finalConfig]);

  const checkDeploymentStatus = useCallback(async (address: string): Promise<boolean> => {
    try {
      const code = await publicClient.getCode({ address: address as `0x${string}` });
      return code !== '0x';
    } catch {
      return false;
    }
  }, [publicClient]);

  const getBalance = useCallback(async (address: string): Promise<string> => {
    try {
      const balance = await publicClient.getBalance({ address: address as `0x${string}` });
      return formatEther(balance);
    } catch (error: any) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }, [publicClient]);

  const sendTransaction = useCallback(async (txRequest: TransactionRequest): Promise<string> => {
    if (!state.address) {
      throw new Error('No smart wallet address available');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // In a real implementation, you would:
      // 1. Create a UserOperation
      // 2. Sign it with the owner's private key
      // 3. Submit it to a bundler
      // 4. Wait for the transaction to be mined
      
      // For now, we'll simulate the transaction
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));

      return txHash;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, [state.address]);

  const enableGaslessTransactions = useCallback(async (): Promise<boolean> => {
    if (!state.address) {
      throw new Error('No smart wallet address available');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // In a real implementation, you would:
      // 1. Check if a paymaster is available
      // 2. Configure the smart wallet to use the paymaster
      // 3. Set up gasless transaction capabilities
      
      setState(prev => ({
        ...prev,
        isGasless: true,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      return false;
    }
  }, [state.address]);

  const sendGaslessTransaction = useCallback(async (txRequest: TransactionRequest): Promise<string> => {
    if (!state.isGasless) {
      throw new Error('Gasless transactions not enabled');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // In a real implementation, you would:
      // 1. Create a UserOperation with paymaster data
      // 2. Sign it with the owner's private key
      // 3. Submit it to a bundler with gasless configuration
      // 4. The paymaster will cover the gas costs
      
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));

      return txHash;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, [state.isGasless]);

  // Update balance when address changes
  useEffect(() => {
    if (state.address) {
      getBalance(state.address).then(balance => {
        setState(prev => ({ ...prev, balance }));
      });
    }
  }, [state.address, getBalance]);

  return {
    ...state,
    createSmartWallet,
    checkDeploymentStatus,
    sendTransaction,
    enableGaslessTransactions,
    sendGaslessTransaction,
    config: finalConfig,
  };
}
