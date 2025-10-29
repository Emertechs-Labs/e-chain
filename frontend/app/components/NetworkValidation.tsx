'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { useState } from 'react';
import { AlertTriangle, Wifi } from 'lucide-react';

const BASE_SEPOLIA_CHAIN_ID = 84532;

interface NetworkValidationProps {
  onNetworkValid?: () => void;
  children?: React.ReactNode;
}

export function NetworkValidation({ onNetworkValid, children }: NetworkValidationProps) {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [isValidating, setIsValidating] = useState(false);

  const isOnCorrectNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;

  const handleSwitchNetwork = async () => {
    try {
      setIsValidating(true);
      await switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID });
      if (onNetworkValid) {
        onNetworkValid();
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
    } finally {
      setIsValidating(false);
    }
  };

  if (isOnCorrectNetwork) {
    return <>{children}</>;
  }

  return (
    <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-orange-400" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">Wrong Network</h3>
      <p className="text-gray-400 mb-4">
        You need to switch to Base Sepolia testnet to purchase tickets.
      </p>
      
      <div className="space-y-3">
        <div className="text-sm text-gray-500">
          <p>Current: {getNetworkName(chainId)}</p>
          <p>Required: Base Sepolia Testnet</p>
        </div>
        
        <button
          onClick={handleSwitchNetwork}
          disabled={isPending || isValidating}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
        >
          <Wifi className="w-4 h-4" />
          {isPending || isValidating ? 'Switching...' : 'Switch to Base Sepolia'}
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Need help? <a href="https://docs.base.org/network-information" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">View setup guide</a></p>
      </div>
    </div>
  );
}

function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 11155111:
      return 'Sepolia Testnet';
    case 8453:
      return 'Base Mainnet';
    case 84532:
      return 'Base Sepolia';
    default:
      return `Network ${chainId}`;
  }
}