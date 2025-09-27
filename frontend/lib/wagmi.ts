import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

// Configure chains
export const config = getDefaultConfig({
  appName: 'Echain',
  projectId: 'echain-ticketing', // Replace with your WalletConnect project ID
  chains: [baseSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export { baseSepolia as defaultChain };
