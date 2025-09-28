import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Echain Event Ticketing',
  projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'demo-project-id-for-development',
  chains: [baseSepolia],
  ssr: true,
});

export { baseSepolia as defaultChain };
