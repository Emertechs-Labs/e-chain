'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import components that use wagmi hooks
const MultisigManager = dynamic(() => import('../../../components/MultisigManager').then(mod => ({ default: mod.MultisigManager })), { ssr: false });
const MultisigDashboard = dynamic(() => import('@polymathuniversata/echain-wallet').then(mod => ({ default: mod.MultisigDashboard })), { ssr: false });

import type { HederaProviderConfig, MultisigConfig } from '@polymathuniversata/echain-wallet';

export default function MultisigPage() {
  // Hedera configuration - should be loaded from environment or user settings
  const hederaConfig: HederaProviderConfig = {
    network: 'testnet',
    maxQueryPayment: 100000000, // 1 HBAR in tinybars
    maxTransactionFee: 100000000, // 1 HBAR in tinybars
  };

  // Multisig configuration - should be loaded from user wallet data
  const multisigConfig: MultisigConfig = {
    contractId: process.env.NEXT_PUBLIC_MULTISIG_CONTRACT_ID || '0.0.1234567', // Default test contract
    signers: [
      {
        signerAddress: '0.0.1234567', // Should be loaded from connected wallet
        weight: 1,
        active: true,
      },
    ],
    threshold: 1,
    timelock: 0, // No timelock for immediate execution
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/dashboard" className="text-xl font-bold text-gray-900">
                Echain Wallet
              </a>
            </div>
            <nav className="flex space-x-8">
              <a
                href="/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                Overview
              </a>
              <a
                href="/dashboard/multisig"
                className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700"
              >
                Multisig
              </a>
              <a
                href="/dashboard/transactions"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                Transactions
              </a>
              <a
                href="/dashboard/settings"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                Settings
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Multisig Wallet</h1>
            <p className="mt-2 text-gray-600">
              Manage your Hedera multisig wallets and transactions securely.
            </p>
          </div>

          {/* Custom Multisig Manager */}
          <Suspense fallback={<div className="h-96 bg-gray-200 rounded animate-pulse"></div>}>
            <MultisigManager />
          </Suspense>
          
          {/* Multisig Dashboard Component */}
          <div className="bg-white shadow rounded-lg mt-6">
            <Suspense fallback={<div className="h-96 bg-gray-200 rounded animate-pulse"></div>}>
              <MultisigDashboard
                hederaConfig={hederaConfig}
                multisigConfig={multisigConfig}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}