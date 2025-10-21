/**
 * Hedera Wallet Dashboard
 * Main dashboard with balance, transactions, and network switching
 */

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import components that use wagmi hooks to prevent SSR issues
const BalanceDisplay = dynamic(() => import('@polymathuniversata/echain-wallet').then(mod => ({ default: mod.BalanceDisplay })), { ssr: false });
const TransactionHistory = dynamic(() => import('@polymathuniversata/echain-wallet').then(mod => ({ default: mod.TransactionHistory })), { ssr: false });
const NetworkSwitcher = dynamic(() => import('@polymathuniversata/echain-wallet').then(mod => ({ default: mod.NetworkSwitcher })), { ssr: false });
const NetworkBadge = dynamic(() => import('@polymathuniversata/echain-wallet').then(mod => ({ default: mod.NetworkBadge })), { ssr: false });
const TransactionCreator = dynamic(() => import('../../components/TransactionCreator').then(mod => ({ default: mod.TransactionCreator })), { ssr: false });

import { useState } from 'react';
import Link from 'next/link';
import type { HederaNetwork } from '@polymathuniversata/echain-wallet';
import { toast, Toaster } from 'sonner';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateTx, setShowCreateTx] = useState(false);
  
  // Network state
  const [network, setNetwork] = useState<HederaNetwork>('testnet');
  
  // Account ID (this would come from wallet connection)
  const [accountId] = useState('0.0.1234567'); // Placeholder
  
  // Transaction handlers
  const handleTxSuccess = (txHash: string) => {
    toast.success('Transaction created successfully!', {
      description: `Hash: ${txHash.substring(0, 10)}...`,
      duration: 5000,
    });
    setShowCreateTx(false);
  };
  
  const handleTxError = (error: string) => {
    toast.error('Transaction failed', {
      description: error,
      duration: 5000,
    });
  };
  
  // Hedera config
  const hederaConfig = {
    network,
    operatorId: accountId,
  };

  const handleNetworkChange = (networkId: string, networkType: 'ethereum' | 'hedera') => {
    if (networkType === 'hedera') {
      // Extract Hedera network from network ID (e.g., 'hedera-testnet' -> 'testnet')
      const hederaNetwork = networkId.replace('hedera-', '') as HederaNetwork;
      setNetwork(hederaNetwork);
      console.log('Network changed to:', hederaNetwork);
    } else {
      console.log('Ethereum network selected:', networkId);
      // For now, keep current Hedera network when switching to Ethereum
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', href: '/dashboard' },
    { id: 'multisig', label: 'Multisig', href: '/dashboard/multisig' },
    { id: 'transactions', label: 'Transactions', href: '/dashboard/transactions' },
    { id: 'settings', label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Echain Wallet
              </Link>
            </div>
            <nav className="flex space-x-4">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Link>
              ))}
              <Suspense fallback={<div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>}>
                <NetworkBadge network={network} />
              </Suspense>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Network Switcher */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-12 bg-gray-200 rounded animate-pulse"></div>}>
            <NetworkSwitcher
              currentNetwork={network}
              onNetworkChange={handleNetworkChange}
              showLabel={true}
            />
          </Suspense>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowCreateTx(!showCreateTx)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Transaction
          </button>
          <Link
            href="/dashboard/multisig"
            className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Manage Multisig
          </Link>
        </div>
        
        {/* Transaction Creator */}
        {showCreateTx && (
          <div className="mb-6">
            <TransactionCreator
              onSuccess={handleTxSuccess}
              onError={handleTxError}
            />
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Balance Display */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="h-48 bg-gray-200 rounded animate-pulse"></div>}>
              <BalanceDisplay
                config={hederaConfig}
                accountId={accountId}
                autoRefresh={true}
                refreshInterval={10000}
                onBalanceUpdate={(balance, tokens) => {
                  console.log('Balance updated:', balance, tokens);
                }}
              />
            </Suspense>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">--</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">--</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">--%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">-- HBAR</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-6">
          <Suspense fallback={<div className="h-96 bg-gray-200 rounded animate-pulse"></div>}>
            <TransactionHistory
              hederaConfig={hederaConfig}
              accountId={accountId}
            />
          </Suspense>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Getting Started</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Connect your Hedera wallet using the button above</li>
                  <li>View your real-time HBAR and token balances</li>
                  <li>Monitor your transaction history with advanced filtering</li>
                  <li>Switch between testnet, mainnet, and previewnet networks</li>
                  <li>All data updates automatically every 10 seconds</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}