'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

// Dynamically import wallet components to prevent SSR issues
const UnifiedConnectButton = dynamic(() => import('@polymathuniversata/echain-wallet').then(mod => ({ default: mod.UnifiedConnectButton })), { ssr: false });
const UnifiedConnectModal = dynamic(() => import('@polymathuniversata/echain-wallet').then(mod => ({ default: mod.UnifiedConnectModal })), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Note: We can't use useAccount here during SSR, so we handle wallet connection
  // through the UnifiedConnectButton component which handles this internally

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Echain Wallet
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Secure multisig wallet for Hedera with advanced features for managing
            digital assets and executing transactions with multiple signers.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Suspense fallback={<div className="h-12 w-40 bg-gray-200 rounded animate-pulse"></div>}>
              <UnifiedConnectButton />
            </Suspense>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              More Options
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multisig Security</h3>
              <p className="text-gray-600">
                Enhanced security with multiple signer requirements for transactions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Transactions</h3>
              <p className="text-gray-600">
                Optimized for speed with Hedera's high-performance network.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Integration</h3>
              <p className="text-gray-600">
                Seamless integration with existing DeFi protocols and dApps.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <UnifiedConnectModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </Suspense>
    </div>
  );
}