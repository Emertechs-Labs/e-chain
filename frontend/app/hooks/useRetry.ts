'use client';

import { useState, useCallback } from 'react';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
}

export interface RetryState {
  isRetrying: boolean;
  attempts: number;
  lastError?: Error;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: () => true,
};

/**
 * Hook for implementing retry logic with exponential backoff
 */
export function useRetry(options: RetryOptions = {}) {
  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempts: 0,
  });

  const executeWithRetry = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
      let lastError: Error;

      for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
        try {
          setState({
            isRetrying: attempt > 1,
            attempts: attempt,
            lastError: undefined,
          });

          const result = await operation();

          // Reset state on success
          setState({
            isRetrying: false,
            attempts: 0,
            lastError: undefined,
          });

          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          // Check if we should retry this error
          if (
            attempt < config.maxAttempts &&
            config.retryCondition(lastError)
          ) {
            // Calculate delay with exponential backoff
            const delay = Math.min(
              config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
              config.maxDelay
            );

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          // No more retries or error shouldn't be retried
          setState({
            isRetrying: false,
            attempts: attempt,
            lastError,
          });

          throw lastError;
        }
      }

      throw lastError!;
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({
      isRetrying: false,
      attempts: 0,
      lastError: undefined,
    });
  }, []);

  return {
    executeWithRetry,
    reset,
    ...state,
  };
}

/**
 * Specialized retry hook for blockchain operations
 */
export function useBlockchainRetry(options: RetryOptions = {}) {
  return useRetry({
    maxAttempts: 3,
    baseDelay: 2000,
    maxDelay: 15000,
    retryCondition: (error) => {
      // Retry on common blockchain errors
      const errorMessage = error.message.toLowerCase();
      return (
        errorMessage.includes('user rejected') === false && // Don't retry user rejections
        errorMessage.includes('nonce too low') === false && // Don't retry nonce errors
        (
          errorMessage.includes('network') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('connection') ||
          errorMessage.includes('rpc')
        )
      );
    },
    ...options,
  });
}

/**
 * Error boundary hook for handling component errors
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    setError(errorObj);

    // Log error for monitoring
    console.error('Handled error:', errorObj);

    // Here you could also send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // reportError(errorObj);
    }
  }, []);

  return {
    error,
    handleError,
    resetError,
    hasError: error !== null,
  };
}
