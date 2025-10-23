'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base, baseSepolia } from 'wagmi/chains';
import { Toaster } from 'sonner';
// import { ThemeProvider } from '../../lib/theme-provider';
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
    rpcUrl: 'https://sepolia.base.org',
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
  const [mounted, setMounted] = useState(false);
  const [defaultChainValue, setDefaultChainValue] = useState(baseSepolia);

  // Load wagmi config on client side only
  useEffect(() => {
    setMounted(true);
    // Delay config loading to ensure we're on client side
    const loadConfig = async () => {
      try {
        // Only load config if we're on the client side
        if (typeof window !== 'undefined') {
          const walletModule = await import('@polymathuniversata/echain-wallet');
          const wagmiConfig = walletModule.config;
          setWagmiConfig(wagmiConfig);
          setDefaultChainValue(walletModule.defaultChain);
        }
      } catch (error) {
        console.warn('Failed to load wallet config:', error);
        // Fallback to a basic config if SDK fails
        setWagmiConfig(null);
      }
    };
    
    loadConfig();
  }, []);

  const ProviderContent = (
    <>
      {wagmiConfig && mounted ? (
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
          <DynamicOnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={baseSepolia}
          >
            <RainbowKitProvider
              appInfo={{
                appName: 'Echain Wallet',
                learnMoreUrl: 'http://localhost:3000',
              }}
              initialChain={mounted ? defaultChainValue : baseSepolia}
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
            chain={baseSepolia}
          >
            {children}
            <Toaster position="top-right" />
          </DynamicOnchainKitProvider>
        </QueryClientProvider>
      )}
    </>
  );

  // On the client side, wrap with AuthKitProvider. On the server, render without it.
  return (
    <DynamicAuthKitProvider>
      {ProviderContent}
    </DynamicAuthKitProvider>
  );
}