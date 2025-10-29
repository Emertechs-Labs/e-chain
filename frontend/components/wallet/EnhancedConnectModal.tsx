'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Smartphone, Shield, Wallet, ChevronRight } from 'lucide-react';
import { useEmailAuth } from '@/lib/auth/email-auth';
import { useSocialAuth } from '@/lib/auth/social-auth';
import { useWalletConnection } from '@polymathuniversata/echain-wallet';

interface EnhancedConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export function EnhancedConnectModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onError 
}: EnhancedConnectModalProps) {
  const [step, setStep] = useState<'method' | 'email' | 'social' | 'wallet' | 'success'>('method');
  const [email, setEmail] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  
  const emailAuth = useEmailAuth();
  const socialAuth = useSocialAuth();
  const { connectWallet, isConnected, address } = useWalletConnection();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('method');
      setEmail('');
      setSelectedProvider('');
    }
  }, [isOpen]);

  // Handle successful authentication
  useEffect(() => {
    if (emailAuth.isAuthenticated || socialAuth.isAuthenticated || isConnected) {
      setStep('success');
      onSuccess?.(emailAuth.user || socialAuth.user || { address });
    }
  }, [emailAuth.isAuthenticated, socialAuth.isAuthenticated, isConnected, onSuccess, address]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const result = await emailAuth.sendVerificationEmail(email);
    if (result.success) {
      // In a real implementation, you'd show a verification screen
      // For now, we'll simulate success
      setTimeout(() => {
        emailAuth.createEmbeddedWallet(email);
      }, 1000);
    } else {
      onError?.(result.message);
    }
  };

  const handleSocialAuth = async (providerId: string) => {
    setSelectedProvider(providerId);
    const result = await socialAuth.authenticateWithProvider(providerId);
    if (!result.success) {
      onError?.(result.message);
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
    } catch (error: any) {
      onError?.(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {step === 'method' && 'Connect to Echain'}
            {step === 'email' && 'Email Authentication'}
            {step === 'social' && 'Social Login'}
            {step === 'wallet' && 'Connect Wallet'}
            {step === 'success' && 'Welcome to Echain!'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'method' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Choose your preferred way to connect
              </p>
              
              {/* Email Authentication */}
              <button
                onClick={() => setStep('email')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:shadow-lg transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Email</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Auto-create wallet</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </button>

              {/* Social Authentication */}
              <button
                onClick={() => setStep('social')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl hover:shadow-lg transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Social Login</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Google, Twitter, Discord</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </button>

              {/* Wallet Connection */}
              <button
                onClick={() => setStep('wallet')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-lg transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Connect Wallet</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">MetaMask, Coinbase, etc.</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </button>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              
              {emailAuth.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{emailAuth.error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('method')}
                  className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={emailAuth.isLoading || !email}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {emailAuth.isLoading ? 'Sending...' : 'Send Verification'}
                </button>
              </div>
            </form>
          )}

          {step === 'social' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Choose a social provider to continue
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {socialAuth.providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleSocialAuth(provider.id)}
                    disabled={socialAuth.isLoading}
                    className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                    style={{ borderColor: provider.color }}
                  >
                    <span className="text-2xl mb-2">{provider.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {provider.name}
                    </span>
                  </button>
                ))}
              </div>

              {socialAuth.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{socialAuth.error}</p>
                </div>
              )}

              <button
                onClick={() => setStep('method')}
                className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {step === 'wallet' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Connect your existing wallet
              </p>
              
              <button
                onClick={handleWalletConnect}
                className="w-full flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </button>

              <button
                onClick={() => setStep('method')}
                className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Welcome to Echain!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You're now connected and ready to explore events.
              </p>
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
