'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface TransactionCreatorProps {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export function TransactionCreator({ onSuccess, onError }: TransactionCreatorProps) {
  const { address, isConnected } = useAccount();
  const [txType, setTxType] = useState<'hbar' | 'token' | 'contract'>('hbar');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [memo, setMemo] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTransaction = async () => {
    if (!isConnected || !address) {
      onError?.('Wallet not connected');
      return;
    }

    if (!recipient || !amount) {
      onError?.('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      // Placeholder for actual transaction creation logic
      // This would integrate with Hedera SDK or wagmi for Ethereum transactions
      console.log('Creating transaction:', {
        type: txType,
        from: address,
        to: recipient,
        amount,
        tokenId,
        memo,
      });

      // Simulate transaction creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      onSuccess?.(mockTxHash);
      
      // Reset form
      setRecipient('');
      setAmount('');
      setTokenId('');
      setMemo('');
    } catch (error) {
      console.error('Transaction creation failed:', error);
      onError?.(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-yellow-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-yellow-800 font-medium">Wallet Not Connected</p>
        <p className="text-yellow-600 text-sm mt-1">Please connect your wallet to create transactions</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Transaction</h3>

        {/* Transaction Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTxType('hbar')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                txType === 'hbar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              HBAR Transfer
            </button>
            <button
              onClick={() => setTxType('token')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                txType === 'token'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Token Transfer
            </button>
            <button
              onClick={() => setTxType('contract')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                txType === 'contract'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Contract Call
            </button>
          </div>
        </div>

        {/* Recipient */}
        <div className="mb-4">
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
            Recipient {txType === 'hbar' ? 'Account ID' : 'Address'} *
          </label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={txType === 'hbar' ? '0.0.1234567' : '0x...'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount *
          </label>
          <div className="relative">
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">
              {txType === 'hbar' ? 'HBAR' : txType === 'token' ? 'TOKENS' : 'ETH'}
            </span>
          </div>
        </div>

        {/* Token ID (only for token transfers) */}
        {txType === 'token' && (
          <div className="mb-4">
            <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 mb-2">
              Token ID *
            </label>
            <input
              id="tokenId"
              type="text"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="0.0.1234567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Memo */}
        <div className="mb-6">
          <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-2">
            Memo (Optional)
          </label>
          <input
            id="memo"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add a note to your transaction"
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">{memo.length}/100 characters</p>
        </div>

        {/* Transaction Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Transaction Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">From:</span>
              <span className="text-gray-900 font-mono text-xs">{address?.substring(0, 10)}...{address?.substring(address.length - 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span className="text-gray-900 font-mono text-xs">{recipient || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="text-gray-900 font-medium">{amount || '0.00'} {txType === 'hbar' ? 'HBAR' : txType === 'token' ? 'TOKENS' : 'ETH'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Est. Fee:</span>
              <span className="text-gray-900">~0.0001 HBAR</span>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateTransaction}
          disabled={isCreating || !recipient || !amount || (txType === 'token' && !tokenId)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isCreating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Transaction...
            </>
          ) : (
            'Create Transaction'
          )}
        </button>
      </div>
    </div>
  );
}
