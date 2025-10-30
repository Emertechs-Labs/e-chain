'use client';

import { useConnect, useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';
import { base } from 'wagmi/chains';

export function useBaseAuth() {
  const { connect, isPending: isConnecting } = useConnect();
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const authenticate = async () => {
    try {
      // Connect using Coinbase Wallet
      connect({
        connector: coinbaseWallet({
          appName: 'Echain Event Ticketing',
          appLogoUrl: 'https://echain.vercel.app/logo.png',
        }),
      });

      // If already connected but on wrong chain, switch to Base
      if (isConnected && chainId !== base.id) {
        switchChain({ chainId: base.id });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  const isLoading = isConnecting;

  return {
    authenticate,
    disconnect,
    isConnected,
    address,
    isLoading,
  };
}