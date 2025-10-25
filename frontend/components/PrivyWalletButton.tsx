'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect } from 'react';

export function PrivyWalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  // Auto-connect embedded wallet on auth
  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
      if (embeddedWallet) {
        console.log('Privy embedded wallet ready:', embeddedWallet.address);
      }
    }
  }, [authenticated, wallets]);

  if (!ready) {
    return (
      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
      >
        Connect Wallet
      </button>
    );
  }

  const displayAddress =
    wallets[0]?.address
      ? `${wallets[0].address.slice(0, 6)}...${wallets[0].address.slice(-4)}`
      : user?.email?.address || 'Connected';

  return (
    <div className="flex items-center gap-2">
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm">
        {displayAddress}
      </div>
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}
