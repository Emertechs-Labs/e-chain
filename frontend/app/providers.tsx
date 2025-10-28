'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';
import { defaultChain } from '../lib/wagmi';
import { Toaster } from 'sonner';
import { config } from '../lib/wagmi';
import { ThemeProvider } from '../lib/theme-provider';
import { GoogleMapsProvider } from './components/maps/GoogleMapsProvider';
import { useState } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import dynamic from 'next/dynamic';

// Dynamically import OnchainKitProvider with SSR disabled
const DynamicOnchainKitProvider = dynamic(
  () => import('@coinbase/onchainkit').then(mod => mod.OnchainKitProvider),
  { ssr: false }
);

// Dynamically import Farcaster's AuthKitProvider with SSR disabled
const AuthKitProvider = dynamic(
  () => import('@farcaster/auth-kit').then(mod => mod.AuthKitProvider),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance once per provider instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  }));

  const farcasterConfig = {
    relay: 'https://relay.farcaster.xyz',
    rpcUrl: 'https://mainnet.base.org',
    domain: 'localhost:3000', // for dev
    siweUri: 'http://localhost:3000/login',
  };

  const ProviderContent = (
    <ThemeProvider defaultTheme="dark" storageKey="echain-theme">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicOnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
          >
            <RainbowKitProvider
              appInfo={{
                appName: 'Echain Event Ticketing',
                learnMoreUrl: 'http://localhost:3000',
              }}
              initialChain={defaultChain}
              showRecentTransactions={true}
            >
              {children}
              <Toaster position="top-right" />
            </RainbowKitProvider>
          </DynamicOnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );

  // On the client side, wrap with AuthKitProvider. On the server, render without it.
  if (typeof window === 'undefined') {
    return ProviderContent;
  }

  return (
    <AuthKitProvider config={farcasterConfig}>
      {ProviderContent}
    </AuthKitProvider>
  );
}
