'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base, baseSepolia } from 'viem/chains';
import { http, createConfig } from 'wagmi';
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors';

const queryClient = new QueryClient();

// Privy-compatible Wagmi config
export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Echain',
      appLogoUrl: 'https://echain.app/logo.png',
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export function PrivyWagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clxyz123'}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#2563eb',
          logo: '/logo.png',
        },
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'farcaster'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: baseSepolia,
        supportedChains: [base, baseSepolia],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
