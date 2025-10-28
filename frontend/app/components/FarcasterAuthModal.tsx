'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';

// Dynamically import SignInButton from @farcaster/auth-kit
const SignInButton = dynamic(
  () => import('@farcaster/auth-kit').then(mod => mod.SignInButton),
  { ssr: false }
);

// Use StatusAPIResponse type from auth-kit
interface StatusAPIResponse {
  custody?: string;
  verifications?: string[];
  [key: string]: any;
}

function FarcasterAuthModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleFarcasterAuthStart = () => {
      console.log('[FarcasterAuthModal] Opening Farcaster auth modal');
      setIsOpen(true);
    };

    const handleFarcasterDisconnect = () => {
      console.log('[FarcasterAuthModal] Closing Farcaster auth modal');
      setIsOpen(false);
    };

    window.addEventListener('farcaster-auth-start', handleFarcasterAuthStart);
    window.addEventListener('farcaster-disconnect', handleFarcasterDisconnect);

    return () => {
      window.removeEventListener('farcaster-auth-start', handleFarcasterAuthStart);
      window.removeEventListener('farcaster-disconnect', handleFarcasterDisconnect);
    };
  }, []);

  const handleFarcasterSuccess = (response: StatusAPIResponse) => {
    console.log('[FarcasterAuthModal] Farcaster authentication successful:', response);
    
    // Close modal
    setIsOpen(false);
    
    // Emit success event with the verified address
    window.dispatchEvent(new CustomEvent('farcaster-auth-success', {
      detail: { 
        address: response.verifications?.[0] || response.custody || null,
        user: response 
      }
    }));
  };

  const handleFarcasterError = (error?: Error) => {
    console.error('[FarcasterAuthModal] Farcaster authentication error:', error);
    
    // Close modal
    setIsOpen(false);
    
    // Emit error event
    window.dispatchEvent(new CustomEvent('farcaster-auth-error', {
      detail: { error: error?.message || 'Authentication failed' }
    }));
  };

  const handleClose = () => {
    setIsOpen(false);
    // Emit error to cancel the connection attempt
    window.dispatchEvent(new CustomEvent('farcaster-auth-error', {
      detail: { error: 'User cancelled authentication' }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md mx-4 my-8 shadow-lg overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Sign in with Farcaster</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">FC</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Connect with Farcaster</h3>
            <p className="text-gray-400 text-sm">
              Sign in with your Farcaster account to access social features and connect your linked wallets.
            </p>
          </div>

          <div className="flex justify-center">
            <SignInButton
              onSuccess={handleFarcasterSuccess}
              onError={handleFarcasterError}
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-cyan-400 hover:text-cyan-300">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { FarcasterAuthModal };
export default FarcasterAuthModal;