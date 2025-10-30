'use client';

import { useState } from 'react';
import { UnifiedConnectModal } from '@echain/wallet';

export const dynamic = 'force-dynamic';

export default function TestModalPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">Test New Privy-Style Connect Modal</h1>
        <p className="text-gray-400">Click the button below to test the redesigned wallet connection modal</p>
        
        <button
          onClick={() => {
            console.log('Opening modal...');
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-200"
        >
          Open Unified Connect Modal
        </button>

        <div className="mt-8 p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Modal State</h2>
          <p className="text-gray-400">
            Modal Open: <span className={showModal ? 'text-green-400' : 'text-red-400'}>{showModal ? 'Yes' : 'No'}</span>
          </p>
        </div>

        <UnifiedConnectModal
          isOpen={showModal}
          onClose={() => {
            console.log('Closing modal...');
            setShowModal(false);
          }}
        />
      </div>
    </div>
  );
}
