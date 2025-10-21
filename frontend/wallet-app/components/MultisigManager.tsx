'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface Signer {
  address: string;
  weight: number;
  active: boolean;
}

interface MultisigWallet {
  id: string;
  name: string;
  contractId: string;
  signers: Signer[];
  threshold: number;
  balance: string;
  pendingTransactions: number;
}

export function MultisigManager() {
  const { address, isConnected } = useAccount();
  const [wallets, setWallets] = useState<MultisigWallet[]>([
    {
      id: '1',
      name: 'Team Treasury',
      contractId: '0.0.1234567',
      signers: [
        { address: '0.0.1234567', weight: 1, active: true },
        { address: '0.0.1234568', weight: 1, active: true },
        { address: '0.0.1234569', weight: 1, active: true },
      ],
      threshold: 2,
      balance: '1,234.56 HBAR',
      pendingTransactions: 2,
    },
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<MultisigWallet | null>(null);

  // Create wallet form state
  const [walletName, setWalletName] = useState('');
  const [signers, setSigners] = useState<string[]>(['', '']);
  const [threshold, setThreshold] = useState(2);

  const handleAddSigner = () => {
    setSigners([...signers, '']);
  };

  const handleRemoveSigner = (index: number) => {
    setSigners(signers.filter((_, i) => i !== index));
  };

  const handleSignerChange = (index: number, value: string) => {
    const newSigners = [...signers];
    newSigners[index] = value;
    setSigners(newSigners);
  };

  const handleCreateWallet = async () => {
    if (!walletName || signers.some(s => !s) || threshold > signers.length) {
      return;
    }

    // Placeholder for actual multisig wallet creation
    const newWallet: MultisigWallet = {
      id: Date.now().toString(),
      name: walletName,
      contractId: `0.0.${Math.floor(Math.random() * 1000000)}`,
      signers: signers.map(s => ({ address: s, weight: 1, active: true })),
      threshold,
      balance: '0.00 HBAR',
      pendingTransactions: 0,
    };

    setWallets([...wallets, newWallet]);
    setShowCreateForm(false);
    setWalletName('');
    setSigners(['', '']);
    setThreshold(2);
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-yellow-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-yellow-800 font-medium">Wallet Not Connected</p>
        <p className="text-yellow-600 text-sm mt-1">Please connect your wallet to manage multisig wallets</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Multisig Wallets</h2>
          <p className="text-gray-600 mt-1">Manage your multi-signature wallets</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Wallet
        </button>
      </div>

      {/* Create Wallet Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Multisig Wallet</h3>

          {/* Wallet Name */}
          <div className="mb-4">
            <label htmlFor="walletName" className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Name *
            </label>
            <input
              id="walletName"
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="e.g., Team Treasury"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Signers */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signers ({signers.length})
            </label>
            <div className="space-y-3">
              {signers.map((signer, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={signer}
                    onChange={(e) => handleSignerChange(index, e.target.value)}
                    placeholder={`Signer ${index + 1} address (0.0.xxxxx)`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {signers.length > 2 && (
                    <button
                      onClick={() => handleRemoveSigner(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove signer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleAddSigner}
              className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Signer
            </button>
          </div>

          {/* Threshold */}
          <div className="mb-6">
            <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
              Signature Threshold * (out of {signers.length} signers)
            </label>
            <input
              id="threshold"
              type="number"
              min="1"
              max={signers.length}
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum {threshold} signature{threshold > 1 ? 's' : ''} required to execute transactions
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCreateWallet}
              disabled={!walletName || signers.some(s => !s) || threshold > signers.length}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Create Wallet
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Wallet List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedWallet(wallet)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{wallet.name}</h3>
                <p className="text-sm text-gray-500 font-mono mt-1">{wallet.contractId}</p>
              </div>
              {wallet.pendingTransactions > 0 && (
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {wallet.pendingTransactions} pending
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Balance</span>
                <span className="text-lg font-semibold text-gray-900">{wallet.balance}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Signers</span>
                <span className="text-sm font-medium text-gray-900">{wallet.signers.length}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Threshold</span>
                <span className="text-sm font-medium text-gray-900">
                  {wallet.threshold}/{wallet.signers.length}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button className="flex-1 text-sm bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                  View Details
                </button>
                <button className="flex-1 text-sm border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Send Funds
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {wallets.length === 0 && !showCreateForm && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Multisig Wallets</h3>
          <p className="text-gray-600 mb-4">Create your first multisig wallet to get started</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Wallet
          </button>
        </div>
      )}
    </div>
  );
}
