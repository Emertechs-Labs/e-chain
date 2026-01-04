'use client';

import { useState, useCallback } from 'react';

export interface SocialAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export interface SocialAuthResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    walletAddress?: string;
  };
}

export interface SocialAuthState {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    walletAddress?: string;
  } | null;
}

const SUPPORTED_PROVIDERS: SocialAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: '🔵',
    color: '#4285F4',
    enabled: true,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    enabled: true,
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '💬',
    color: '#5865F2',
    enabled: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    color: '#333',
    enabled: true,
  },
  {
    id: 'farcaster',
    name: 'Farcaster',
    icon: '🟣',
    color: '#8B5CF6',
    enabled: true,
  },
];

export function useSocialAuth() {
  const [state, setState] = useState<SocialAuthState>({
    isLoading: false,
    error: null,
    isAuthenticated: false,
    user: null,
  });

  const authenticateWithProvider = useCallback(async (providerId: string): Promise<SocialAuthResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const provider = SUPPORTED_PROVIDERS.find(p => p.id === providerId);
      if (!provider) {
        throw new Error(`Unsupported provider: ${providerId}`);
      }

      // Handle Farcaster separately as it has its own integration
      if (providerId === 'farcaster') {
        return await authenticateWithFarcaster();
      }

      // For other providers, use OAuth flow
      const response = await fetch('/api/auth/social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: providerId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to authenticate with ${provider.name}`);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        user: result.user,
      }));

      return result;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message 
      }));
      return {
        success: false,
        message: error.message,
      };
    }
  }, []);

  const authenticateWithFarcaster = useCallback(async (): Promise<SocialAuthResult> => {
    try {
      // Trigger Farcaster auth modal
      const event = new CustomEvent('farcaster:auth:request');
      window.dispatchEvent(event);

      // Listen for Farcaster auth result
      return new Promise((resolve) => {
        const handleFarcasterAuth = (event: CustomEvent) => {
          window.removeEventListener('farcaster:auth:result', handleFarcasterAuth as EventListener);
          
          if (event.detail.success) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              isAuthenticated: true,
              user: event.detail.user,
            }));
            resolve({
              success: true,
              message: 'Farcaster authentication successful',
              user: event.detail.user,
            });
          } else {
            setState(prev => ({ 
              ...prev, 
              isLoading: false, 
              error: event.detail.message 
            }));
            resolve({
              success: false,
              message: event.detail.message,
            });
          }
        };

        window.addEventListener('farcaster:auth:result', handleFarcasterAuth as EventListener);
      });
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message 
      }));
      return {
        success: false,
        message: error.message,
      };
    }
  }, []);

  const linkWallet = useCallback(async (walletAddress: string): Promise<SocialAuthResult> => {
    if (!state.user) {
      return {
        success: false,
        message: 'No authenticated user to link wallet to',
      };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/wallet/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: state.user.id,
          walletAddress,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to link wallet');
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        user: prev.user ? { ...prev.user, walletAddress } : null,
      }));

      return result;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message 
      }));
      return {
        success: false,
        message: error.message,
      };
    }
  }, [state.user]);

  const logout = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isAuthenticated: false,
      user: null,
    });
  }, []);

  return {
    ...state,
    providers: SUPPORTED_PROVIDERS,
    authenticateWithProvider,
    linkWallet,
    logout,
  };
}
