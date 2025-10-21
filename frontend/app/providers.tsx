'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';
import { getConfig, defaultChain } from '@polymathuniversata/echain-wallet';
import { Toaster } from 'sonner';
import { ThemeProvider } from '../lib/theme-provider';
import { useState, useEffect } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import dynamic from 'next/dynamic';

// Dynamically import OnchainKitProvider with SSR disabled
const DynamicOnchainKitProvider = dynamic(
  () => import('@coinbase/onchainkit').then(mod => mod.OnchainKitProvider),
  { ssr: false }
);

// Dynamically import Farcaster's AuthKitProvider with SSR disabled
const AuthKitProvider = dynamic(
  () => import('@farcaster/auth-kit').then(mod => ({ default: mod.AuthKitProvider })),
  { ssr: false }
);

// Client-side only wrapper for AuthKitProvider
function ClientAuthKitProvider({ children }: { children: React.ReactNode }) {
  const farcasterConfig = {
    relay: 'https://relay.farcaster.xyz',
    rpcUrl: 'https://mainnet.base.org',
    domain: 'localhost:3000', // for dev
    siweUri: 'http://localhost:3000/login',
  };

  return (
    <AuthKitProvider config={farcasterConfig}>
      {children}
    </AuthKitProvider>
  );
}

const DynamicAuthKitProvider = dynamic(() => Promise.resolve(ClientAuthKitProvider), {
  ssr: false
});

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

  const [wagmiConfig, setWagmiConfig] = useState<any>(null);

  // Load wagmi config on client side
  useEffect(() => {
    getConfig().then(setWagmiConfig);
  }, []);

  const ProviderContent = (
    <ThemeProvider defaultTheme="dark" storageKey="echain-theme">
      {wagmiConfig ? (
        <WagmiProvider config={wagmiConfig}>
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
      ) : (
        <QueryClientProvider client={queryClient}>
          <DynamicOnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
          >
            {children}
            <Toaster position="top-right" />
          </DynamicOnchainKitProvider>
        </QueryClientProvider>
      )}
    </ThemeProvider>
  );

  // On the client side, wrap with AuthKitProvider. On the server, render without it.
  return (
    <DynamicAuthKitProvider>
      {ProviderContent}
    </DynamicAuthKitProvider>
  );
}
