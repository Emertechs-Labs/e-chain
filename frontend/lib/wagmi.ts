import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Echain Event Ticketing',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'echain-events-demo-project',
  chains: [baseSepolia],
  ssr: true,
});

export { baseSepolia as defaultChain };
