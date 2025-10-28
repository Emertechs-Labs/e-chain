import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
import { http } from 'viem';
import { getRPCProvider } from './providers/rpc-provider';

// Determine active network from environment
const activeNetwork = process.env.NEXT_PUBLIC_ACTIVE_NETWORK || 'sepolia';
const isMainnet = activeNetwork === 'mainnet';

// Initialize RPC provider with failover support - only if not in build mode
const isBuildTime = typeof window === 'undefined' && !process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
const rpcProvider = !isBuildTime ? getRPCProvider(isMainnet ? 'mainnet' : 'sepolia') : null;
const endpoints = rpcProvider ? rpcProvider.getEndpoints() : [];

// Build RPC URL list with priority order
const rpcUrls = endpoints.map(e => e.url).filter(Boolean);

// Custom Base Sepolia configuration with enhanced RPC management
const baseSepoliaWithRPC = {
  ...baseSepolia,
  rpcUrls: {
    default: {
      http: rpcUrls.length > 0 ? rpcUrls : ['https://sepolia.base.org'],
      webSocket: ['wss://sepolia.base.org/ws']
    },
    public: {
      http: ['https://sepolia.base.org'],
      webSocket: ['wss://sepolia.base.org/ws']
    }
  }
};

// Custom Base Mainnet configuration with premium providers
const baseMainnetWithRPC = {
  ...base,
  rpcUrls: {
    default: {
      http: rpcUrls.length > 0 ? rpcUrls : ['https://mainnet.base.org'],
      webSocket: ['wss://mainnet.base.org/ws']
    },
    public: {
      http: ['https://mainnet.base.org'],
      webSocket: ['wss://mainnet.base.org/ws']
    }
  }
};

export const config = getDefaultConfig({
  appName: 'Echain Event Ticketing',
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'placeholder-for-build',
  chains: [isMainnet ? baseMainnetWithRPC : baseSepoliaWithRPC],
  ssr: false, // Disable SSR for Web3 config
});

export const defaultChain = isMainnet ? baseMainnetWithRPC : baseSepoliaWithRPC;
export { rpcProvider };
