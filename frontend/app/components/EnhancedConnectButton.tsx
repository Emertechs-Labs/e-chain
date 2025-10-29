'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect } from 'wagmi';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { WalletTroubleshooting } from './WalletTroubleshooting';

export function EnhancedConnectButton() {
  const { isConnected, address } = useAccount();
  const { error, isPending } = useConnect();
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const router = useRouter();

  // Show success message when wallet connects (no automatic redirect)
  useEffect(() => {
    if (isConnected && address) {
      console.log('[EnhancedConnectButton] Wallet connected:', address);
      toast.success('Wallet connected successfully!', {
        duration: 3000,
      });
    }
  }, [isConnected, address]);

  // Show error toast when connection fails
  useEffect(() => {
    if (error) {
      let errorMessage = 'Failed to connect to wallet';

      if (error.message.includes('User rejected')) {
        errorMessage = 'Connection rejected by user';
      } else if (error.message.includes('MetaMask')) {
        errorMessage = 'MetaMask connection failed. Please ensure MetaMask is installed and unlocked.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network connection error. Please check your network settings.';
      }

      toast.error(errorMessage, {
        duration: 5000,
        action: {
          label: 'Get Help',
          onClick: () => setShowTroubleshooting(true),
        },
      });
    }
  }, [error]);

  const handleRetry = () => {
    setShowTroubleshooting(false);
    // RainbowKit handles reconnection automatically
  };

  return (
    <div className="relative">
      <ConnectButton
        showBalance={false}
        accountStatus="avatar"
        chainStatus="icon"
        label="Connect Wallet"
      />

      {/* Connection status indicator */}
      <div className="absolute -top-1 -right-1">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : isPending ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
      </div>

      {/* Troubleshooting modal/panel */}
      {showTroubleshooting && (
        <div className="absolute top-full mt-2 right-0 z-50 w-96">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
            <div className="p-4">
              <WalletTroubleshooting
                error={error?.message || 'Connection failed'}
                onRetry={handleRetry}
              />
              <button
                onClick={() => setShowTroubleshooting(false)}
                className="mt-2 text-gray-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}