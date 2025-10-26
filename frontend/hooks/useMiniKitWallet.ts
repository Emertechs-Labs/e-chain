/**
 * MiniKit Smart Wallet Integration
 * Handles wallet connections, transactions, and signing within Farcaster frames
 */

'use client';

import { useState, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useMiniApp } from '@/components/providers/MiniAppProvider';

interface WalletState {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}

interface TransactionParams {
  to: string;
  value?: bigint;
  data?: `0x${string}`;
}

interface SignMessageParams {
  message: string;
}

export function useMiniKitWallet() {
  const { isInFrame, user } = useMiniApp();
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnecting: false,
    isConnected: false,
    error: null,
  });

  /**
   * Connect to MiniKit Smart Wallet
   * Prompts user for wallet connection within frame
   */
  const connectWallet = useCallback(async () => {
    if (!isInFrame) {
      setWalletState((prev) => ({
        ...prev,
        error: 'Wallet connection only available in Farcaster frames',
      }));
      return null;
    }

    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request wallet connection through SDK
      const result = await sdk.wallet.ethProvider.request({
        method: 'eth_requestAccounts',
      });

      const address = result[0];

      setWalletState({
        address,
        isConnecting: false,
        isConnected: true,
        error: null,
      });

      return address;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setWalletState({
        address: null,
        isConnecting: false,
        isConnected: false,
        error: errorMessage,
      });
      return null;
    }
  }, [isInFrame]);

  /**
   * Send transaction through MiniKit wallet
   * Handles ticket purchases, event registrations, etc.
   */
  const sendTransaction = useCallback(
    async (params: TransactionParams) => {
      if (!walletState.isConnected || !walletState.address) {
        throw new Error('Wallet not connected');
      }

      try {
        const txHash = await sdk.wallet.ethProvider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: walletState.address as `0x${string}`,
              to: params.to as `0x${string}`,
              value: params.value ? `0x${params.value.toString(16)}` : undefined,
              data: params.data,
            },
          ],
        });

        return txHash as string;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
        throw new Error(errorMessage);
      }
    },
    [walletState.isConnected, walletState.address]
  );

  /**
   * Sign message with MiniKit wallet
   * For authentication, verification, etc.
   */
  const signMessage = useCallback(
    async (params: SignMessageParams) => {
      if (!walletState.isConnected || !walletState.address) {
        throw new Error('Wallet not connected');
      }

      try {
        const signature = await sdk.wallet.ethProvider.request({
          method: 'personal_sign',
          params: [params.message as `0x${string}`, walletState.address as `0x${string}`],
        });

        return signature as string;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Signing failed';
        throw new Error(errorMessage);
      }
    },
    [walletState.isConnected, walletState.address]
  );

  /**
   * Get current chain ID
   */
  const getChainId = useCallback(async () => {
    try {
      const chainId = await sdk.wallet.ethProvider.request({
        method: 'eth_chainId',
      });
      return parseInt(chainId as string, 16);
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      return null;
    }
  }, []);

  /**
   * Switch to specific chain
   */
  const switchChain = useCallback(async (chainId: number) => {
    try {
      await sdk.wallet.ethProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      return true;
    } catch (error) {
      console.error('Failed to switch chain:', error);
      return false;
    }
  }, []);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    setWalletState({
      address: null,
      isConnecting: false,
      isConnected: false,
      error: null,
    });
  }, []);

  return {
    // State
    address: walletState.address,
    isConnecting: walletState.isConnecting,
    isConnected: walletState.isConnected,
    error: walletState.error,
    isInFrame,
    user,

    // Actions
    connectWallet,
    sendTransaction,
    signMessage,
    getChainId,
    switchChain,
    disconnect,
  };
}
