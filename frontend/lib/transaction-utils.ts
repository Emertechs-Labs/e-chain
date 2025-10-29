// Helper utility functions for transaction handling

// Safe stringify that handles BigInt and circular refs for logging
export const safeStringify = (v: any) => {
  try {
    return JSON.stringify(v, (_key, val) => (typeof val === 'bigint' ? val.toString() : val))
  } catch (e) {
    return String(v);
  }
};

// Error handling utility
export const handleTransactionError = (error: any): string => {
  // Handle network errors
  if (error?.message?.includes('Network Error') || error?.message?.includes('CORS')) {
    return 'Network error: Please check your internet connection and try again.';
  }

  // Handle contract execution errors
  if (error?.message?.includes('execution reverted') || error?.message?.includes('revert')) {
    const revertReason = error?.message?.match(/revert reason: (.+)/)?.[1] || 'Transaction would fail';
    return `Transaction failed: ${revertReason}`;
  }

  // Handle insufficient funds
  if (error?.message?.includes('insufficient funds')) {
    return 'Insufficient funds: Please check your wallet balance and try again.';
  }

  // Handle user rejection
  if (error?.message?.includes('user rejected') || error?.message?.includes('User denied')) {
    return 'Transaction cancelled: User rejected the transaction.';
  }

  // Handle network mismatch
  if (error?.message?.includes('network') || error?.message?.includes('chain')) {
    return 'Network error: Please ensure you are connected to the correct network.';
  }

  if (error?.message) {
    return error.message;
  }

  return 'Transaction failed. Please try again.';
};