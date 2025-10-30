'use client';

import React, { useState, useEffect } from 'react';
import { SignInButton } from '@farcaster/auth-kit';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';
import Link from 'next/link';

const RecoveryPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [farcasterUser, setFarcasterUser] = useState<any>(null);
  const [recoveryStep, setRecoveryStep] = useState<'signin' | 'verify' | 'success' | 'failed'>('signin');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFarcasterSignIn = (user: any) => {
    setFarcasterUser(user);
    setRecoveryStep('verify');
  };

  const handleVerifyRecovery = async () => {
    if (!farcasterUser || !address) return;

    setIsVerifying(true);
    try {
      // Generate nonce for this recovery attempt
      const nonce = `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = Date.now();

      const message = `Recover access to Echain account\n\nUsername: ${farcasterUser.username}\nFID: ${farcasterUser.fid}\nAddresses: ${farcasterUser.addresses?.join(', ') || address}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

      // Sign the message with the connected wallet
      const signature = await (window as any).ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // Send to backend for validation
      const response = await fetch('/api/recovery/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          farcasterUsername: farcasterUser.username,
          fid: farcasterUser.fid,
          addresses: farcasterUser.addresses || [address],
          signature,
          message,
          nonce,
          timestamp,
        }),
      });

      const result = await response.json();

      if (response.ok && result.valid) {
        // Recovery successful
        setRecoveryStep('success');
        toast.success('Account recovery successful! You can now access your events.');
        // Here, you could update local storage or redirect
      } else {
        setRecoveryStep('failed');
        toast.error(result.error || 'Recovery failed: Verification unsuccessful.');
      }
    } catch (error) {
      console.error('Recovery verification failed:', error);
      setRecoveryStep('failed');
      toast.error('Recovery verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Account Recovery</h1>
          <p className="text-gray-400 text-sm">
            Use your Farcaster account to recover access to your Echain events and assets.
          </p>
        </div>

        {recoveryStep === 'signin' && (
          <div className="text-center">
            <p className="text-gray-300 mb-4">First, sign in with your Farcaster account:</p>
            <SignInButton onSuccess={handleFarcasterSignIn} />
          </div>
        )}

        {recoveryStep === 'verify' && farcasterUser && (
          <div className="text-center">
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <p className="text-white font-medium">@{farcasterUser.username}</p>
              <p className="text-gray-400 text-sm">Farcaster ID: {farcasterUser.fid}</p>
            </div>
            <p className="text-gray-300 mb-4">
              Linked addresses: {farcasterUser.addresses?.join(', ') || 'None'}
            </p>
            <button
              onClick={handleVerifyRecovery}
              disabled={isVerifying}
              className="w-full bg-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Recovery'}
            </button>
          </div>
        )}

        {recoveryStep === 'success' && (
          <div className="text-center">
            <div className="text-green-400 text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-white mb-2">Recovery Successful!</h2>
            <p className="text-gray-300 mb-6">
              You have successfully recovered access to your account.
            </p>
            <Link
              href="/my-events"
              className="bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
            >
              Go to My Events
            </Link>
          </div>
        )}

        {recoveryStep === 'failed' && (
          <div className="text-center">
            <div className="text-red-400 text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-white mb-2">Recovery Failed</h2>
            <p className="text-gray-300 mb-6">
              We couldn&apos;t verify your account ownership. Please ensure your wallet is linked to this Farcaster account.
            </p>
            <button
              onClick={() => setRecoveryStep('signin')}
              className="bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-500 transition-colors mr-2"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
            >
              Go Home
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPage;