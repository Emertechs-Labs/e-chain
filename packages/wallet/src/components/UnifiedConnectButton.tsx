'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { Wallet } from 'lucide-react';
import { WalletTroubleshooting } from './WalletTroubleshooting';
import { UnifiedConnectModal } from './UnifiedConnectModal';
import { useHederaWallet } from '../hooks/useHederaWallet';

export function UnifiedConnectButton() {
  const { isConnected: ethIsConnected, address: ethAddress } = useAccount();
  const { error: ethError, isPending: ethIsPending } = useConnect();
  const { isConnected: hederaIsConnected, accountId: hederaAccountId, isConnecting: hederaIsConnecting, error: hederaError } = useHederaWallet();

  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Combined connection state
  const isConnected = ethIsConnected || hederaIsConnected;
  const isPending = ethIsPending || hederaIsConnecting;
  const connectionError = ethError || hederaError;

  // Show success message when wallet connects
  useEffect(() => {
    if (ethIsConnected && ethAddress) {
      console.log('[UnifiedConnectButton] Ethereum wallet connected:', ethAddress);
    }
    if (hederaIsConnected && hederaAccountId) {
      console.log('[UnifiedConnectButton] Hedera wallet connected:', hederaAccountId);
    }
  }, [ethIsConnected, ethAddress, hederaIsConnected, hederaAccountId]);

  // Show error when connection fails
  useEffect(() => {
    if (connectionError) {
      setShowTroubleshooting(true);
    }
  }, [connectionError]);

  const handleRetry = () => {
    setShowTroubleshooting(false);
    setShowModal(false);
  };

  const handleHederaWalletConnect = (walletInfo: any) => {
    console.log('[UnifiedConnectButton] Hedera wallet connected:', walletInfo);
    // Additional handling can be added here if needed
  };

  // Format connected account display
  const getConnectedAccountDisplay = () => {
    if (ethIsConnected && ethAddress) {
      return `${ethAddress.substring(0, 6)}...${ethAddress.substring(ethAddress.length - 4)}`;
    }
    if (hederaIsConnected && hederaAccountId) {
      return `${hederaAccountId.substring(0, 6)}...${hederaAccountId.substring(hederaAccountId.length - 4)}`;
    }
    return null;
  };

  const connectedAccount = getConnectedAccountDisplay();

  return (
    <div className="relative echain-connect-button">
      <button
        onClick={() => setShowModal(true)}
        type="button"
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md ${
          isConnected
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-black hover:bg-gray-800 text-white'
        }`}
      >
        {isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Connecting...
          </>
        ) : isConnected ? (
          <>
            <Wallet className="w-4 h-4" />
            {connectedAccount}
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
        onHederaWalletConnect={handleHederaWalletConnect}
      />

      {/* Connection status indicator */}
      {!isConnected && (isPending || connectionError) && (
        <div className="absolute -top-1 -right-1">
          <div className={`w-3 h-3 rounded-full ${isPending ? 'bg-yellow-500 animate-pulse' : connectionError ? 'bg-red-500 animate-pulse' : ''}`} />
        </div>
      )}

      {/* Troubleshooting modal/panel */}
      {showTroubleshooting && (
        <div className="absolute top-full mt-2 right-0 z-50 w-96">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
            <div className="p-4">
              <WalletTroubleshooting
                error={typeof connectionError === 'string' ? connectionError : connectionError?.message || 'Connection failed'}
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