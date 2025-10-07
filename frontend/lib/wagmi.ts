import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
  braveWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { baseRPCManager } from './base-rpc-manager';

// Custom Base configuration with enhanced RPC management
const baseWithRPC = {
  ...base,
  rpcUrls: {
    default: {
      http: [baseRPCManager.getPublicClient().transport.url || 'https://mainnet.base.org'],
      webSocket: ['wss://mainnet.base.org/ws']
    },
    public: {
      http: [baseRPCManager.getPublicClient().transport.url || 'https://mainnet.base.org'],
      webSocket: ['wss://mainnet.base.org/ws']
    }
  }
};

const appName = 'Echain Event Ticketing';
const projectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'your-project-id';

// Compose default wallets + Farcaster as an extra group
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
        rainbowWallet,
        braveWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName,
    projectId,
  }
);

export const config = createConfig({
  chains: [baseWithRPC],
  transports: {
    [baseWithRPC.id]: http(baseRPCManager.getPublicClient().transport.url || 'https://mainnet.base.org'),
  },
  connectors,
  ssr: true,
});

export { base as defaultChain };
export { baseRPCManager };
