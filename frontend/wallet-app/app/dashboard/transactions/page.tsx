'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import { TransactionFilter, type Transaction } from '../../../components/TransactionFilter';

const TransactionHistory = dynamic(() => import('@polymathuniversata/echain-wallet').then(mod => ({ default: mod.TransactionHistory })), { ssr: false });

import type { HederaProviderConfig } from '@polymathuniversata/echain-wallet';

export default function TransactionsPage() {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Hedera configuration - should be loaded from environment or user settings
  const hederaConfig: HederaProviderConfig = {
    network: 'testnet',
    maxQueryPayment: 100000000, // 1 HBAR in tinybars
    maxTransactionFee: 100000000, // 1 HBAR in tinybars
  };

  // Account ID should be loaded from connected wallet
  const accountId = '0.0.1234567'; // Placeholder - should come from wallet connection
  
  // Mock transactions for demonstration
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'send',
      from: '0.0.1234567',
      to: '0.0.7654321',
      amount: '10.50',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'confirmed',
      hash: '0x1234567890abcdef',
      memo: 'Payment for services'
    },
    {
      id: '2',
      type: 'receive',
      from: '0.0.9999999',
      to: '0.0.1234567',
      amount: '25.00',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'confirmed',
      hash: '0xabcdef1234567890'
    },
  ];

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
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                Multisig
              </a>
              <a
                href="/dashboard/transactions"
                className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700"
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
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="mt-2 text-gray-600">
              View and manage your wallet transactions with advanced filtering and search capabilities.
            </p>
          </div>

          {/* Transaction Filter */}
          <TransactionFilter
            transactions={mockTransactions}
            onFilteredResults={setFilteredTransactions}
          />
          
          {/* Transaction History Component */}
          <Suspense fallback={<div className="h-96 bg-gray-200 rounded animate-pulse"></div>}>
            <TransactionHistory
              hederaConfig={hederaConfig}
              accountId={accountId}
            />
          </Suspense>
          
          {/* Filtered Results Count */}
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredTransactions.length} of {mockTransactions.length} transactions
          </div>
        </div>
      </main>
    </div>
  );
}