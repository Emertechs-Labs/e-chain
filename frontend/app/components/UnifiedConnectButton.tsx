'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Wallet } from 'lucide-react';
import { WalletTroubleshooting } from './WalletTroubleshooting';
import { UnifiedConnectModal } from './UnifiedConnectModal';
import { StatusAPIResponse } from '@farcaster/auth-kit';

export function UnifiedConnectButton() {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { error, isPending } = useConnect();
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [farcasterUser, setFarcasterUser] = useState<StatusAPIResponse | null>(null);

  // Show success message when wallet connects (no automatic redirect)
  useEffect(() => {
    if (isConnected && address) {
      console.log('[UnifiedConnectButton] Wallet connected:', address);
      toast.success('Wallet connected successfully!', {
        duration: 3000,
      });
    }
  }, [isConnected, address]);

  // Handle Farcaster auth success
  useEffect(() => {
    const handleFarcasterSuccess = (event: CustomEvent) => {
      console.log('[UnifiedConnectButton] Farcaster auth success:', event.detail);
      setFarcasterUser(event.detail.user);
      toast.success('Signed in with Farcaster!', {
        duration: 3000,
      });
    };

    const handleFarcasterError = (event: CustomEvent) => {
      console.error('[UnifiedConnectButton] Farcaster auth error:', event.detail);
      toast.error(`Farcaster authentication failed: ${event.detail.error}`, {
        duration: 3000,
      });
    };

    window.addEventListener('farcaster-auth-success', handleFarcasterSuccess as EventListener);
    window.addEventListener('farcaster-auth-error', handleFarcasterError as EventListener);
    return () => {
      window.removeEventListener('farcaster-auth-success', handleFarcasterSuccess as EventListener);
      window.removeEventListener('farcaster-auth-error', handleFarcasterError as EventListener);
    };
  }, []);

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
    // Reset modal state
    setShowModal(false);
  };

  const handleFarcasterSuccess = (user: StatusAPIResponse) => {
    console.log('[UnifiedConnectButton] Farcaster login success:', user);
    setFarcasterUser(user);
    toast.success('Signed in with Farcaster!', {
      duration: 3000,
    });

    // If user has verified addresses, suggest connecting wallet
    if (user.verifications && user.verifications.length > 0) {
      toast.info('Connect your wallet to access all features', {
        duration: 5000,
      });
    }
  };

  return (
    <div className="relative echain-connect-button">
      <button
        onClick={() => setShowModal(true)}
        type="button"
        className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
      >
        {isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            Connect
          </>
        )}
      </button>

      {/* Unified Connect Modal */}
      <UnifiedConnectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Connection status indicator - only show when there's an error or pending state */}
      {!isConnected && (isPending || error) && (
        <div className="absolute -top-1 -right-1">
          <div className={`w-3 h-3 rounded-full ${isPending ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500 animate-pulse' : ''}`} />
        </div>
      )}

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