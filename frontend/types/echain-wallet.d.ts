declare module '@polymathuniversata/echain-wallet' {
  export * from '@polymathuniversata/echain-wallet/dist/index';

  // Main exports
  export function getConfig(): any;
  export const defaultChain: any;
  export function useWalletConnection(): any;
  export function useWalletHelpers(): any;
  export const UnifiedConnectModal: React.ComponentType<any>;

  // Components
  export const UnifiedConnectButton: React.ComponentType<any>;
  export const TransactionHistory: React.ComponentType<any>;
  export const BalanceDisplay: React.ComponentType<any>;
  export const NetworkSwitcher: React.ComponentType<any>;
  export const NetworkBadge: React.ComponentType<any>;
  export const MultisigDashboard: React.ComponentType<any>;

  // Types
  export type HederaProviderConfig = any;
  export type MultisigConfig = any;
  export type HederaNetwork = any;
}

declare module '@polymathuniversata/echain-wallet/components' {
  export const UnifiedConnectButton: React.ComponentType<any>;
  export const UnifiedConnectModal: React.ComponentType<any>;
}

declare module '@polymathuniversata/echain-wallet/hooks' {
  export function useWalletHelpers(): any;
}