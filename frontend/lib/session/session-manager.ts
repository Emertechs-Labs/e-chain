'use client';

import { useState, useCallback, useEffect } from 'react';

export interface SessionData {
  userId: string;
  walletAddress: string;
  authMethod: 'email' | 'social' | 'wallet';
  timestamp: number;
  expiresAt: number;
  biometricEnabled: boolean;
}

export interface SessionState {
  isAuthenticated: boolean;
  session: SessionData | null;
  isLoading: boolean;
  error: string | null;
}

const SESSION_KEY = 'echain_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useSessionManager() {
  const [state, setState] = useState<SessionState>({
    isAuthenticated: false,
    session: null,
    isLoading: true,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = useCallback(async () => {
    try {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (!storedSession) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const session: SessionData = JSON.parse(storedSession);
      const now = Date.now();

      if (now > session.expiresAt) {
        // Session expired
        localStorage.removeItem(SESSION_KEY);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Check if biometric authentication is required
      if (session.biometricEnabled) {
        const biometricResult = await authenticateWithBiometric();
        if (!biometricResult.success) {
          // Biometric authentication failed, clear session
          localStorage.removeItem(SESSION_KEY);
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }
      }

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        session,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  }, []);

  const createSession = useCallback(async (sessionData: Omit<SessionData, 'timestamp' | 'expiresAt'>): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const now = Date.now();
      const session: SessionData = {
        ...sessionData,
        timestamp: now,
        expiresAt: now + SESSION_DURATION,
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        session,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      return false;
    }
  }, []);

  const authenticateWithBiometric = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        return { success: false, error: 'Biometric authentication not supported' };
      }

      // Check if biometric authentication is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        return { success: false, error: 'Biometric authentication not available' };
      }

      // Create credential request options
      const credentialRequestOptions: CredentialRequestOptions = {
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          userVerification: 'required',
          timeout: 60000,
        },
      };

      // Request biometric authentication
      const credential = await navigator.credentials.get(credentialRequestOptions);
      
      if (credential) {
        return { success: true };
      } else {
        return { success: false, error: 'Biometric authentication failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const enableBiometricAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('Biometric authentication not supported');
      }

      // Check if biometric authentication is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        throw new Error('Biometric authentication not available');
      }

      // Create credential creation options
      const credentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: 'Echain',
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(32),
            name: 'Echain User',
            displayName: 'Echain User',
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      };

      // Create biometric credential
      const credential = await navigator.credentials.create(credentialCreationOptions);
      
      if (credential) {
        // Update session to enable biometric authentication
        if (state.session) {
          const updatedSession = { ...state.session, biometricEnabled: true };
          localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
          
          setState(prev => ({
            ...prev,
            session: updatedSession,
          }));
        }
        
        return true;
      } else {
        throw new Error('Failed to create biometric credential');
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
      }));
      return false;
    }
  }, [state.session]);

  const disableBiometricAuth = useCallback(() => {
    if (state.session) {
      const updatedSession = { ...state.session, biometricEnabled: false };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      
      setState(prev => ({
        ...prev,
        session: updatedSession,
      }));
    }
  }, [state.session]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!state.session) {
      return false;
    }

    try {
      const now = Date.now();
      const updatedSession = {
        ...state.session,
        timestamp: now,
        expiresAt: now + SESSION_DURATION,
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      
      setState(prev => ({
        ...prev,
        session: updatedSession,
      }));

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
      }));
      return false;
    }
  }, [state.session]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setState({
      isAuthenticated: false,
      session: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const getSessionTimeRemaining = useCallback((): number => {
    if (!state.session) return 0;
    return Math.max(0, state.session.expiresAt - Date.now());
  }, [state.session]);

  const isSessionExpiring = useCallback((): boolean => {
    const timeRemaining = getSessionTimeRemaining();
    const oneHour = 60 * 60 * 1000;
    return timeRemaining < oneHour && timeRemaining > 0;
  }, [getSessionTimeRemaining]);

  return {
    ...state,
    createSession,
    authenticateWithBiometric,
    enableBiometricAuth,
    disableBiometricAuth,
    refreshSession,
    clearSession,
    getSessionTimeRemaining,
    isSessionExpiring,
  };
}
