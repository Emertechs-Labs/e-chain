'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect } from 'wagmi';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { WalletTroubleshooting } from './WalletTroubleshooting';
import Image from 'next/image';

export function EnhancedConnectButton() {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { error, isPending } = useConnect();
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const router = useRouter();
  const [farcasterUser, setFarcasterUser] = useState<any>(null);

  // Show success message when wallet connects (no automatic redirect)
  useEffect(() => {
    if (isConnected && address) {
      console.log('[EnhancedConnectButton] Wallet connected:', address);
      toast.success('Wallet connected successfully!', {
        duration: 3000,
      });
    }
  }, [isConnected, address]);

  // Auto-connect wallet if Farcaster user has linked addresses
  useEffect(() => {
    if (farcasterUser && farcasterUser.addresses && farcasterUser.addresses.length > 0 && !isConnected) {
      // This will be handled in the unified modal
      console.log('[EnhancedConnectButton] Farcaster user detected with addresses:', farcasterUser.addresses);
    }
  }, [farcasterUser, isConnected]);

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
    <div className="relative echain-connect-button">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <div className="flex gap-3">
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-2"
                      >
                        {isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Connect'
                        )}
                      </button>
                    </div>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-400 transition-all duration-200"
                    >
                      Wrong network
                    </button>
                  );
                }

                return (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      {chain.hasIcon && chain.iconUrl && (
                        <div className="chain-icon-wrapper bg-slate-600">
                          <Image
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            width={24}
                            height={24}
                            className="chain-icon"
                          />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white font-medium"
                    >
                      {account.displayName}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>

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