'use client';

import { createBaseAccountSDK } from '@base-org/account';

export interface BaseAuthResult {
  address: string;
  message: string;
  signature: string;
}

export interface BaseAuthError {
  code: string;
  message: string;
}

export class BaseAuthenticationService {
  private sdk: ReturnType<typeof createBaseAccountSDK>;

  constructor() {
    // Initialize the SDK with config
    this.sdk = createBaseAccountSDK({
      appName: 'Echain Event Ticketing',
      appLogoUrl: 'https://echain.vercel.app/logo.png',
      appChainIds: [8453], // Base Mainnet chain ID
    });
  }

  /**
   * Get the provider from the SDK
   */
  getProvider() {
    return this.sdk.getProvider();
  }

  /**
   * Generate a fresh nonce for authentication
   */
  generateNonce(): string {
    return window.crypto.randomUUID().replace(/-/g, '');
  }

  /**
   * Fetch nonce from backend (recommended for production)
   */
  async fetchNonce(): Promise<string> {
    try {
      const response = await fetch('/api/auth/nonce');
      if (!response.ok) {
        throw new Error('Failed to fetch nonce');
      }
      const data = await response.json();
      return data.nonce;
    } catch (error) {
      console.error('Failed to fetch nonce from backend:', error);
      // Fallback to local generation
      return this.generateNonce();
    }
  }

  /**
   * Switch to Base chain
   */
  async switchToBaseChain(): Promise<void> {
    const provider = this.getProvider();

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base Mainnet - 8453
      });
    } catch (error: any) {
      // If the chain is not added to the wallet, add it
      if (error.code === 4902) {
        await this.addBaseChain();
      } else {
        throw error;
      }
    }
  }

  /**
   * Add Base chain to wallet if not present
   */
  async addBaseChain(): Promise<void> {
    const provider = this.getProvider();

    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x2105',
        chainName: 'Base',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
      }],
    });
  }

  /**
   * Authenticate with Base wallet
   */
  async authenticate(nonce?: string): Promise<BaseAuthResult> {
    const provider = this.getProvider();
    const authNonce = nonce || await this.fetchNonce();

    try {
      // First ensure we're on Base chain
      await this.switchToBaseChain();

      // Connect and authenticate
      const response = await provider.request({
        method: 'wallet_connect',
        params: [{
          version: '1',
          capabilities: {
            signInWithEthereum: {
              nonce: authNonce,
              chainId: '0x2105' // Base Mainnet
            }
          }
        }]
      }) as { accounts: Array<{ address: string; capabilities: { signInWithEthereum: { message: string; signature: string } } }> };

      const { accounts } = response;

      const { address } = accounts[0];
      const { message, signature } = accounts[0].capabilities.signInWithEthereum;

      return {
        address,
        message,
        signature
      };
    } catch (error: any) {
      // Fallback to eth_requestAccounts + personal_sign for wallets that don't support wallet_connect
      if (error.message?.includes('method_not_supported') || error.code === -32601) {
        return await this.fallbackAuthentication(authNonce);
      }
      throw error;
    }
  }

  /**
   * Fallback authentication method for older wallets
   */
  private async fallbackAuthentication(nonce: string): Promise<BaseAuthResult> {
    const provider = this.getProvider();

    // Request accounts
    await provider.request({ method: 'eth_requestAccounts' });

    // Get the connected address
    const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
    const address = accounts[0];

    // Create the SIWE message
    const domain = window.location.hostname;
    const message = `I want to sign in to ${domain} at ${new Date().toISOString()}\n\nSign-In with Ethereum URI: ${domain}\nChain ID: 8453\nNonce: ${nonce}`;

    // Sign the message
    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, address]
    }) as string;

    return {
      address,
      message,
      signature
    };
  }

  /**
   * Verify authentication with backend
   */
  async verifyAuthentication(authResult: BaseAuthResult): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResult)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to verify authentication:', error);
      return false;
    }
  }

  async getConnectedAddress(): Promise<string | null> {
    try {
      const accounts = await this.getProvider().request({ method: 'eth_accounts' }) as string[];
      return accounts[0] || null;
    } catch (error) {
      console.error('Failed to get connected address:', error);
      return null;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    try {
      await this.getProvider().request({ method: 'wallet_disconnect' });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }
}

// Export singleton instance
export const baseAuthService = new BaseAuthenticationService();
