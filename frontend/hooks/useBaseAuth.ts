'use client';

import { useState, useCallback, useEffect } from 'react';
import { baseAuthService, BaseAuthResult } from '../lib/base-auth-service';
import { toast } from 'sonner';

export interface UseBaseAuthReturn {
  authenticate: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;
  error: string | null;
  generateNonce: () => string;
}

export function useBaseAuth(): UseBaseAuthReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const connectedAddress = await baseAuthService.getConnectedAddress();
      setAddress(connectedAddress);
      setIsConnected(!!connectedAddress);
    } catch (error) {
      console.error('Failed to check connection:', error);
    }
  }, []);

  const authenticate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate or fetch nonce before authentication
      const nonce = baseAuthService.generateNonce();

      // Authenticate with Base wallet
      const authResult: BaseAuthResult = await baseAuthService.authenticate(nonce);

      // Verify with backend
      const verified = await baseAuthService.verifyAuthentication(authResult);

      if (verified) {
        setAddress(authResult.address);
        setIsConnected(true);
        toast.success('Successfully signed in with Base!');
      } else {
        throw new Error('Authentication verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed';
      setError(errorMessage);
      toast.error(errorMessage);

      // If it's a wallet connection error, reset state
      if (errorMessage.includes('User rejected') || errorMessage.includes('cancelled')) {
        setIsConnected(false);
        setAddress(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await baseAuthService.disconnect();
      setIsConnected(false);
      setAddress(null);
      toast.success('Disconnected from Base wallet');
    } catch (error: any) {
      const errorMessage = error.message || 'Disconnect failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateNonce = useCallback(() => {
    return baseAuthService.generateNonce();
  }, []);

  return {
    authenticate,
    disconnect,
    isConnected,
    address,
    isLoading,
    error,
    generateNonce,
  };
}
