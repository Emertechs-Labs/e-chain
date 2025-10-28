'use client';

import { useEffect, useMemo, useState } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { X, Users, Wallet, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface UnifiedConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UnifiedConnectModal({ isOpen, onClose }: UnifiedConnectModalProps) {
  const { isConnected } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const [email, setEmail] = useState('');
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [hasUsedFarcaster, setHasUsedFarcaster] = useState(false);

  // All hooks must be at the top before any conditional logic
  const walletOptions = useMemo(() => {
    const map = new Map<string, (typeof connectors)[number]>();
    connectors.forEach((connector) => {
      map.set(connector.name, connector);
    });
    return Array.from(map.values());
  }, [connectors]);

  // All useEffect hooks must be at the top before any conditional logic
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Check if user has used Farcaster before (from localStorage)
  useEffect(() => {
    const farcasterUsed = localStorage.getItem('echain-farcaster-used');
    setHasUsedFarcaster(!!farcasterUsed);
  }, []);

  if (!isOpen) return null;

  const connectorDescriptions: Record<string, string> = {
    metaMask: 'Browser extension',
    walletConnect: 'Mobile & desktop',
    injected: 'Browser wallet', 
    coinbaseWallet: 'Coinbase wallet',
    brave: 'Brave browser',
    safe: 'Safe wallet',
  };

  const getConnectorIcon = (connector: (typeof connectors)[number]) => {
    // Custom icons for better display
    const iconMap: Record<string, string> = {
      metaMask: '🦊',
      coinbaseWallet: '🔵', 
      walletConnect: '🔗',
      brave: '🦁',
      safe: '🛡️',
      injected: '💳',
    };

    return iconMap[connector.id] || '💼';
  };

  const getConnectorDescription = (connector: (typeof connectors)[number]) => {
    if (connectorDescriptions[connector.id]) {
      return connectorDescriptions[connector.id];
    }

    if (connector.type) {
      return connector.type
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/(^|\s)\w/g, (match) => match.toUpperCase());
    }

    return 'Wallet connection';
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleWalletConnect = (connector: any) => {
    connect({ connector });
    onClose();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Handle email authentication logic here
      console.log('Email login:', email);
      // For now, just show success
      onClose();
    }
  };

  const handleContinueWithWallet = () => {
    setShowWalletOptions(true);
  };

  const handleBackToLogin = () => {
    setShowWalletOptions(false);
  };

  const handleFarcasterAuth = () => {
    localStorage.setItem('echain-farcaster-used', 'true');
    window.dispatchEvent(new CustomEvent('farcaster-auth-start'));
    onClose();
  };

  if (!showWalletOptions) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 min-h-screen"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 pt-12">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Log in or sign up</h2>

            {/* Auth Options */}
            <div className="space-y-4">
              {/* Farcaster */}
              <button
                onClick={handleFarcasterAuth}
                className="w-full flex items-center justify-between p-4 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-900">Farcaster</span>
                  {hasUsedFarcaster && (
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">Recent</span>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full p-4 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!email.trim()}
                  className="w-full bg-black text-white p-4 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Submit
                </button>
              </form>

              {/* Continue with Wallet */}
              <button
                onClick={handleContinueWithWallet}
                className="w-full flex items-center justify-between p-4 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">Continue with a wallet</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>

            {/* Passkey Link */}
            <div className="text-center mt-6">
              <button className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors">
                I have a passkey
              </button>
            </div>
          </div>

          {/* Footer with Login Method Icons */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-center gap-4">
              {/* Farcaster Icon */}
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              {/* Email Icon */}
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              {/* Wallet Icon */}
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wallet Selection View
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 min-h-screen"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={handleBackToLogin}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Go back to login options"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              {error.message.includes('User rejected') 
                ? 'Connection was rejected. Please try again.' 
                : 'Failed to connect. Please check if your wallet is installed and unlocked.'}
            </p>
          </div>
        )}

        {/* Wallet Options */}
        <div className="p-6 space-y-3">
          {walletOptions.map((connector) => (
            <button
              key={connector.id}
              onClick={() => handleWalletConnect(connector)}
              disabled={isPending}
              className="w-full flex items-center justify-between p-4 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  {connector.icon ? (
                    <Image
                      src={connector.icon}
                      alt={connector.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <Wallet className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{connector.name}</div>
                  <div className="text-sm text-gray-500">
                    {getConnectorDescription(connector)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer with Wallet Icons */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {walletOptions.slice(0, 6).map((connector) => (
              <div key={connector.id} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                {connector.icon ? (
                  <Image
                    src={connector.icon}
                    alt={connector.name}
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  <Wallet className="w-3 h-3 text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}