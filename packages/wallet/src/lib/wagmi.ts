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
import { baseSepolia } from 'wagmi/chains';
import { baseRPCManager } from '../lib/base-rpc-manager';

const appName = 'Echain Wallet';
const projectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'your-project-id';

// Compose default wallets
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

// For now, only include Base network in wagmi config
// Hedera integration is handled separately via HederaProvider
export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(baseRPCManager.getPublicClient().transport.url || 'https://sepolia.base.org'),
  },
  connectors,
  ssr: true,
});

export { baseSepolia as defaultChain };
export { baseRPCManager };