'use client';

export default function SettingsPage() {
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
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                Transactions
              </a>
              <a
                href="/dashboard/settings"
                className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700"
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
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">
              Manage your wallet preferences and configuration.
            </p>
          </div>

          {/* Settings Content */}
          <div className="space-y-6">
            {/* Network Settings */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Network Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Network
                    </label>
                    <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500">
                      Base Sepolia Testnet
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Hedera Network
                    </label>
                    <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500">
                      Hedera Testnet
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Security Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="auto-lock"
                      name="auto-lock"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="auto-lock" className="ml-2 block text-sm text-gray-900">
                      Auto-lock wallet after 30 minutes of inactivity
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="biometric"
                      name="biometric"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="biometric" className="ml-2 block text-sm text-gray-900">
                      Enable biometric authentication (when available)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  About
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Wallet Package:</strong> @echain/wallet</p>
                  <p><strong>Network:</strong> Base Sepolia / Hedera Testnet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}