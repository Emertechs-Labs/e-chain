'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
  braveWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';
import { useState, useEffect } from 'react';

const appName = 'Echain Wallet';
const projectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'your-project-id';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
        rainbowWallet,
        braveWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName,
    projectId,
  }
);

const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  connectors,
  ssr: true,
});

export function Providers({ children }: { children: any }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a loading state or null during SSR
    return <div className="sr-only">{children}</div>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}