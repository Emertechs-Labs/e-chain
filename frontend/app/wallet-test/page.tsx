'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useContractRead } from 'wagmi';
import { readContract } from '@/lib/contract-wrapper';

export default function WalletTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testWalletConnection = () => {
    addTestResult('Testing wallet connection...');
    if (isConnected && address) {
      addTestResult(`✅ Wallet connected: ${address}`);
      addTestResult(`Balance: ${balance?.formatted} ${balance?.symbol}`);
    } else {
      addTestResult('❌ Wallet not connected');
    }
  };

  const testContractRead = async () => {
    addTestResult('Testing contract read...');
    try {
      const count = await readContract('EventFactory', 'eventCount', []);
      addTestResult(`✅ Contract read successful: ${count} events`);
    } catch (error: any) {
      addTestResult(`❌ Contract read failed: ${error.message}`);
    }
  };

  const testNetworkConnection = () => {
    addTestResult('Testing network connection...');
    if (typeof window !== 'undefined' && window.ethereum) {
      addTestResult('✅ Ethereum provider available');
    } else {
      addTestResult('❌ No Ethereum provider');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            🧪 Wallet Connection Test Suite
          </h1>

          {/* Wallet Status */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Wallet Status</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status: {isConnected ? '✅ Connected' : '❌ Not connected'}
                </p>
                {address && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                    {address}
                  </p>
                )}
                {balance && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Balance: {balance.formatted} {balance.symbol}
                  </p>
                )}
              </div>
              <ConnectButton />
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={testWalletConnection}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Test Wallet Connection
            </button>
            <button
              onClick={testContractRead}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Test Contract Read
            </button>
            <button
              onClick={testNetworkConnection}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Test Network
            </button>
          </div>

          {/* Test Results */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Test Results</h3>
              <button
                onClick={clearResults}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">No test results yet. Click a test button above.</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Testing Instructions</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Connect your wallet using the RainbowKit button above</li>
              <li>• Test wallet connection to verify address and balance</li>
              <li>• Test contract read to verify blockchain connectivity</li>
              <li>• Test network to verify Ethereum provider availability</li>
              <li>• All tests should show ✅ success when wallet is properly connected</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
