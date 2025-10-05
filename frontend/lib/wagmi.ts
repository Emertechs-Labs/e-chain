import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';
import { baseRPCManager } from './base-rpc-manager';

// Custom Base Sepolia configuration with enhanced RPC management
const baseSepoliaWithRPC = {
  ...baseSepolia,
  rpcUrls: {
    default: {
      http: [baseRPCManager.getPublicClient().transport.url || 'https://sepolia.base.org'],
      webSocket: ['wss://sepolia.base.org/ws']
    },
    public: {
      http: [baseRPCManager.getPublicClient().transport.url || 'https://sepolia.base.org'],
      webSocket: ['wss://sepolia.base.org/ws']
    }
  }
};

export const config = getDefaultConfig({
  appName: 'Echain Event Ticketing',
  projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'your-project-id',
  chains: [baseSepoliaWithRPC],
  ssr: true,
});

export { baseSepolia as defaultChain };
export { baseRPCManager };
