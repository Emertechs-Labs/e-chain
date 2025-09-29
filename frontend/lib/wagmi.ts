import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Echain Event Ticketing',
  projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'demo-project-id-for-development',
  chains: [baseSepolia],
  ssr: true,
  // Optimize polling and connection settings
  pollingInterval: 4000,
  // Add batch configuration for better performance
  batch: {
    multicall: true,
  },
  // Enable wallet connection caching
  cacheTime: 2000,
});

export { baseSepolia as defaultChain };
