import { Wallet } from '@rainbow-me/rainbowkit';
import { createConnector } from 'wagmi';

export interface FarcasterConnectorOptions {
  projectId?: string;
}

export function farcasterConnector({
  projectId,
}: FarcasterConnectorOptions = {}) {
  return createConnector((config) => ({
    id: 'farcaster',
    name: 'Farcaster',
    type: 'ANNOUNCED',
  // rdns helps RainbowKit/Web3Modal classify/filter custom wallets
  info: { rdns: 'app.farcaster' } as any,
    
    async setup() {
      // Setup handled by AuthKitProvider
    },

    async connect() {
      // Create a promise that resolves when Farcaster auth completes
      return new Promise((resolve, reject) => {
        // Emit custom event for Farcaster authentication
        window.dispatchEvent(new CustomEvent('farcaster-auth-start'));
        
        const handleSuccess = (event: CustomEvent) => {
          window.removeEventListener('farcaster-auth-success', handleSuccess as EventListener);
          window.removeEventListener('farcaster-auth-error', handleError as EventListener);
          
          const address = event.detail?.address || '0x0000000000000000000000000000000000000000';
          resolve({
            accounts: [address],
            chainId: 8453, // Base mainnet
          });
        };
        
        const handleError = (event: CustomEvent) => {
          window.removeEventListener('farcaster-auth-success', handleSuccess as EventListener);
          window.removeEventListener('farcaster-auth-error', handleError as EventListener);
          reject(new Error(event.detail?.error || 'Farcaster authentication failed'));
        };
        
        window.addEventListener('farcaster-auth-success', handleSuccess as EventListener);
        window.addEventListener('farcaster-auth-error', handleError as EventListener);
        
        // Timeout after 30 seconds
        setTimeout(() => {
          window.removeEventListener('farcaster-auth-success', handleSuccess as EventListener);
          window.removeEventListener('farcaster-auth-error', handleError as EventListener);
          reject(new Error('Farcaster authentication timeout'));
        }, 30000);
      });
    },

    async disconnect() {
      window.dispatchEvent(new CustomEvent('farcaster-disconnect'));
    },

    async getAccounts() {
      return ['0x0000000000000000000000000000000000000000'];
    },

    async getChainId() {
      return 8453;
    },

    async getProvider() {
      return null;
    },

    async isAuthorized() {
      return false;
    },

    async switchChain() {
      throw new Error('Chain switching not supported');
    },

    onAccountsChanged() {},
    onChainChanged() {},
    onDisconnect() {},
  }))
}

export const farcasterWallet = (): Wallet => ({
  id: 'farcaster',
  name: 'Farcaster',
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJDMiAxNy41MjMgNi40NzcgMjIgMTIgMjJDMTcuNTIzIDIyIDIyIDE3LjUyMyAyMiAxMkMyMiA2LjQ3NyAxNy41MjMgMiAxMiAyWiIgZmlsbD0iIzg1NDVGRiIvPgo8cGF0aCBkPSJNOCA5SDE2VjE1SDhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
  iconBackground: '#8545FF',
  // Ensure it appears in the "Installed" section for visibility
  installed: true as any,
  downloadUrls: {
    // No downloads needed for social auth
  },
  createConnector: (walletDetails) => {
    const connector = farcasterConnector();

    // RainbowKit expects wallet metadata on the connector instance via rkDetails
    // so we merge anything provided in walletDetails back onto the connector.
    return Object.assign(connector, walletDetails);
  },
});