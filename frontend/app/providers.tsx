'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { defaultChain } from '../lib/wagmi';
import { Toaster } from 'sonner';
import { config } from '../lib/wagmi';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import { GoogleMapsProvider } from './components/maps/GoogleMapsProvider';
import { useState } from 'react';
import '@rainbow-me/rainbowkit/styles.css';

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

  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            appInfo={{
              appName: 'Echain Event Ticketing',
              learnMoreUrl: 'http://localhost:3000',
            }}
            initialChain={defaultChain.id}
            showRecentTransactions={true}
          >
            <GoogleMapsProvider>
              {children}
              <Toaster position="top-right" />
            </GoogleMapsProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
