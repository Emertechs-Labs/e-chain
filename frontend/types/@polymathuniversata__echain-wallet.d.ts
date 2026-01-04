declare module '@polymathuniversata/echain-wallet' {
  import { ReactNode } from 'react';

  export interface WalletConnection {
    address?: string;
    isConnected: boolean;
    isConnecting: boolean;
    error?: Error;
    connectWallet: () => Promise<void>;
    disconnect: () => Promise<void>;
  }

  export interface UseWalletConnectionReturn extends WalletConnection {}

  export function useWalletConnection(): UseWalletConnectionReturn;

  export interface WalletProviderProps {
    children: ReactNode;
    projectId?: string;
  }

  export function WalletProvider(props: WalletProviderProps): ReactNode;
}
