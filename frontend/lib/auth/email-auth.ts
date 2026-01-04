'use client';

import { useState, useCallback } from 'react';

export interface EmailAuthConfig {
  apiKey: string;
  baseUrl: string;
}

export interface EmailAuthResult {
  success: boolean;
  message: string;
  token?: string;
  walletAddress?: string;
}

export interface EmailAuthState {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  user: {
    email: string;
    walletAddress?: string;
  } | null;
}

export function useEmailAuth(config?: EmailAuthConfig) {
  const [state, setState] = useState<EmailAuthState>({
    isLoading: false,
    error: null,
    isAuthenticated: false,
    user: null,
  });

  const sendVerificationEmail = useCallback(async (email: string): Promise<EmailAuthResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send verification email');
      }

      setState(prev => ({ ...prev, isLoading: false }));
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

  const verifyEmailToken = useCallback(async (token: string): Promise<EmailAuthResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/email/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Invalid verification token');
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        user: {
          email: result.email,
          walletAddress: result.walletAddress,
        },
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

  const createEmbeddedWallet = useCallback(async (email: string): Promise<EmailAuthResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create embedded wallet');
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        user: {
          email,
          walletAddress: result.walletAddress,
        },
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
    sendVerificationEmail,
    verifyEmailToken,
    createEmbeddedWallet,
    logout,
  };
}
