import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
import { http } from 'viem';
import { getRPCProvider } from './providers/rpc-provider';

// Determine active network from environment
const activeNetwork = process.env.NEXT_PUBLIC_ACTIVE_NETWORK || 'sepolia';
const isMainnet = activeNetwork === 'mainnet';

// Initialize RPC provider with failover support - lazy load
let rpcProvider: ReturnType<typeof getRPCProvider> | null = null;

const getRpcProvider = () => {
  if (!rpcProvider) {
    rpcProvider = getRPCProvider(isMainnet ? 'mainnet' : 'sepolia');
  }
  return rpcProvider;
};

// Build RPC URL list with priority order and fallbacks
const getRpcUrls = (): readonly string[] => {
  try {
    const provider = getRpcProvider();
    const endpoints = provider.getEndpoints();
    const urls = endpoints.map(e => e.url).filter(Boolean);

    // Always include public RPC as fallback
    const publicRpc = isMainnet ? 'https://mainnet.base.org' : 'https://sepolia.base.org';
    if (!urls.includes(publicRpc)) {
      urls.push(publicRpc);
    }

    return urls.length > 0 ? urls : [publicRpc];
  } catch (error) {
    console.warn('[WAGMI] Failed to initialize RPC provider, using public RPC:', error);
    // Fallback to public RPC if provider initialization fails
    return [isMainnet ? 'https://mainnet.base.org' : 'https://sepolia.base.org'];
  }
};

// Custom Base Sepolia configuration with enhanced RPC management
const baseSepoliaWithRPC = {
  ...baseSepolia,
  rpcUrls: {
    default: {
      http: getRpcUrls(),
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
      http: getRpcUrls(),
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
  chains: [isMainnet ? base : baseSepolia],
  ssr: false, // Disable SSR for Web3 config
});

export const defaultChain = isMainnet ? base : baseSepolia;
export { rpcProvider };
