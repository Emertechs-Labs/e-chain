'use client';

import { useState } from 'react';
import { EnhancedConnectModal } from '@/components/wallet/EnhancedConnectModal';
import { useEmailAuth } from '@/lib/auth/email-auth';
import { useSocialAuth } from '@/lib/auth/social-auth';
import { useSmartWallet } from '@/lib/smart-wallet/smart-wallet-manager';
import { useSessionManager } from '@/lib/session/session-manager';
import { useWalletConnection } from '@polymathuniversata/echain-wallet';

export default function WalletTestPage() {
  const [showModal, setShowModal] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Initialize all wallet hooks
  const emailAuth = useEmailAuth();
  const socialAuth = useSocialAuth();
  const smartWallet = useSmartWallet();
  const sessionManager = useSessionManager();
  const walletConnection = useWalletConnection();

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testEmailAuth = async () => {
    addTestResult('Testing email authentication...');
    try {
      const result = await emailAuth.sendVerificationEmail('test@echain.app');
      addTestResult(`Email auth result: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
    } catch (error: any) {
      addTestResult(`Email auth error: ${error.message}`);
    }
  };

  const testSocialAuth = async () => {
    addTestResult('Testing social authentication...');
    try {
      const result = await socialAuth.authenticateWithProvider('google');
      addTestResult(`Social auth result: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
    } catch (error: any) {
      addTestResult(`Social auth error: ${error.message}`);
    }
  };

  const testSmartWallet = async () => {
    addTestResult('Testing smart wallet creation...');
    try {
      const address = await smartWallet.createSmartWallet('0x1234567890123456789012345678901234567890');
      addTestResult(`Smart wallet created: ${address}`);
    } catch (error: any) {
      addTestResult(`Smart wallet error: ${error.message}`);
    }
  };

  const testSessionManager = async () => {
    addTestResult('Testing session management...');
    try {
      const success = await sessionManager.createSession({
        userId: 'test-user-123',
        walletAddress: '0x1234567890123456789012345678901234567890',
        authMethod: 'email',
        biometricEnabled: false,
      });
      addTestResult(`Session creation: ${success ? 'SUCCESS' : 'FAILED'}`);
    } catch (error: any) {
      addTestResult(`Session error: ${error.message}`);
    }
  };

  const testBiometricAuth = async () => {
    addTestResult('Testing biometric authentication...');
    try {
      const result = await sessionManager.authenticateWithBiometric();
      addTestResult(`Biometric auth: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.error || 'No error'}`);
    } catch (error: any) {
      addTestResult(`Biometric auth error: ${error.message}`);
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
            🧪 Wallet Integration Test Suite
          </h1>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email Auth</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: {emailAuth.isLoading ? 'Loading...' : emailAuth.isAuthenticated ? '✅ Connected' : '❌ Not connected'}
              </p>
              {emailAuth.user && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {emailAuth.user.email}
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Social Auth</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: {socialAuth.isLoading ? 'Loading...' : socialAuth.isAuthenticated ? '✅ Connected' : '❌ Not connected'}
              </p>
              {socialAuth.user && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {socialAuth.user.name}
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Wallet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: {smartWallet.isLoading ? 'Loading...' : smartWallet.address ? '✅ Created' : '❌ Not created'}
              </p>
              {smartWallet.address && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                  {smartWallet.address.slice(0, 10)}...
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Session</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: {sessionManager.isLoading ? 'Loading...' : sessionManager.isAuthenticated ? '✅ Active' : '❌ No session'}
              </p>
              {sessionManager.session && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {sessionManager.session.authMethod}
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Wallet Connection</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: {walletConnection.isConnected ? '✅ Connected' : '❌ Not connected'}
              </p>
              {walletConnection.address && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                  {walletConnection.address.slice(0, 10)}...
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-xl border border-pink-200 dark:border-pink-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Biometric</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Available: {typeof window !== 'undefined' && window.PublicKeyCredential ? '✅ Yes' : '❌ No'}
              </p>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <button
              onClick={testEmailAuth}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Test Email Auth
            </button>
            <button
              onClick={testSocialAuth}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Test Social Auth
            </button>
            <button
              onClick={testSmartWallet}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Test Smart Wallet
            </button>
            <button
              onClick={testSessionManager}
              className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Test Session
            </button>
            <button
              onClick={testBiometricAuth}
              className="px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
            >
              Test Biometric
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all"
            >
              Test Connect Modal
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
        </div>
      </div>

      {/* Enhanced Connect Modal */}
      <EnhancedConnectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(user) => {
          addTestResult(`Connect modal success: ${JSON.stringify(user)}`);
          setShowModal(false);
        }}
        onError={(error) => {
          addTestResult(`Connect modal error: ${error}`);
        }}
      />
    </div>
  );
}
