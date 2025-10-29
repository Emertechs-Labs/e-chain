/**
 * Error Handling Utilities for MiniKit Wallet
 * Provides user-friendly error messages and recovery flows
 */

export enum WalletErrorCode {
  USER_REJECTED = 'USER_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_PARAMS = 'INVALID_PARAMS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  UNKNOWN = 'UNKNOWN',
}

interface WalletError {
  code: WalletErrorCode;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
}

/**
 * Parse wallet error from exception
 */
export function parseWalletError(error: unknown): WalletError {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // User rejected transaction
  if (
    errorMessage.includes('user rejected') ||
    errorMessage.includes('User denied') ||
    errorMessage.includes('canceled')
  ) {
    return {
      code: WalletErrorCode.USER_REJECTED,
      message: errorMessage,
      userMessage: 'Transaction was canceled. Please try again if you want to proceed.',
      recoverable: true,
      retryable: true,
    };
  }

  // Insufficient funds
  if (
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('balance too low')
  ) {
    return {
      code: WalletErrorCode.INSUFFICIENT_FUNDS,
      message: errorMessage,
      userMessage: 'Insufficient funds in your wallet. Please add more ETH to continue.',
      recoverable: true,
      retryable: false,
    };
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection')
  ) {
    return {
      code: WalletErrorCode.NETWORK_ERROR,
      message: errorMessage,
      userMessage: 'Network connection issue. Please check your internet and try again.',
      recoverable: true,
      retryable: true,
    };
  }

  // Invalid parameters
  if (errorMessage.includes('invalid') || errorMessage.includes('malformed')) {
    return {
      code: WalletErrorCode.INVALID_PARAMS,
      message: errorMessage,
      userMessage: 'Invalid transaction parameters. Please refresh and try again.',
      recoverable: false,
      retryable: false,
    };
  }

  // Transaction failed
  if (
    errorMessage.includes('transaction failed') ||
    errorMessage.includes('reverted')
  ) {
    return {
      code: WalletErrorCode.TRANSACTION_FAILED,
      message: errorMessage,
      userMessage: 'Transaction failed. This may be due to network congestion or contract issues.',
      recoverable: true,
      retryable: true,
    };
  }

  // Unsupported chain
  if (errorMessage.includes('chain') || errorMessage.includes('network mismatch')) {
    return {
      code: WalletErrorCode.UNSUPPORTED_CHAIN,
      message: errorMessage,
      userMessage: 'Please switch to Base network to continue.',
      recoverable: true,
      retryable: false,
    };
  }

  // Default unknown error
  return {
    code: WalletErrorCode.UNKNOWN,
    message: errorMessage,
    userMessage: 'An unexpected error occurred. Please try again.',
    recoverable: true,
    retryable: true,
  };
}

/**
 * Format error for user display
 */
export function formatErrorMessage(error: unknown): string {
  const parsed = parseWalletError(error);
  return parsed.userMessage;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const parsed = parseWalletError(error);
  return parsed.retryable;
}

/**
 * Get recovery action for error
 */
export function getRecoveryAction(error: unknown): string | null {
  const parsed = parseWalletError(error);

  switch (parsed.code) {
    case WalletErrorCode.INSUFFICIENT_FUNDS:
      return 'Add ETH to your wallet';
    case WalletErrorCode.UNSUPPORTED_CHAIN:
      return 'Switch to Base network';
    case WalletErrorCode.NETWORK_ERROR:
      return 'Check your internet connection';
    case WalletErrorCode.USER_REJECTED:
      return 'Try the transaction again';
    case WalletErrorCode.TRANSACTION_FAILED:
      return 'Wait a moment and retry';
    default:
      return parsed.retryable ? 'Retry transaction' : null;
  }
}
