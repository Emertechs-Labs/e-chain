// Helper utility functions for transaction handling

// Helper to call our server-side proxy that calls MultiBaas to avoid CORS and hide API keys
export const callUnsignedTx = async (
  address: string,
  contractLabel: string,
  method: string,
  args: any[] = [],
  from: string,
  value?: string,
  traceId?: string
) => {
  try {
    console.debug('[callUnsignedTx] proxy request', {
      address,
      contractLabel,
      method,
      args,
      from,
      value,
      traceId,
    });

    const res = await fetch('/api/multibaas/unsigned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, contractLabel, method, args, from, value, traceId }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err: any = new Error(data?.error || `MultiBaas proxy failed with status ${res.status}`);
      err.response = { status: res.status, data };

      // Provide actionable guidance based on common upstream failures
      const guidance: string[] = [];
      if (res.status === 401) guidance.push('401 Unauthorized — check MULTIBAAS_API_KEY value and server env');
      if (res.status === 403) guidance.push('403 Forbidden — check API key permissions (DApp User vs Administrator) and MultiBaas group roles');
      if (res.status === 405) guidance.push('405 Method Not Allowed — ensure proxy calls use the SDK or correct HTTP method/path');
      if (data?.error || data?.message) guidance.push(`Upstream message: ${data?.error || data?.message}`);

      console.error('[callUnsignedTx] proxy failed:', {
        status: res.status,
        error: data?.error ?? data?.message,
        upstreamBody: data?.body ?? data,
        upstreamStatus: data?.status,
        guidance: guidance.join(' | '),
      });

      throw err;
    }

    console.debug('[callUnsignedTx] proxy response', { status: res.status, data });
    return data?.result ?? data;
  } catch (err) {
    console.error('[callUnsignedTx] proxy error:', safeStringify(err));
    throw err;
  }
};

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
  // Handle CORS errors
  if (error?.message?.includes('Network Error') || error?.message?.includes('CORS')) {
    return 'Network error: Please check your internet connection and try again.';
  }

  // Handle MultiBaas API errors
  if (error?.response?.status === 403) {
    return 'Access denied: Please check your API key configuration.';
  }

  if (error?.response?.status === 401) {
    return 'Unauthorized: Please check your API authentication.';
  }

  if (error?.response?.status === 400 && error?.response?.data?.body?.error === 'execution reverted') {
    const revertReason = error.response.data.body.error_data?.message || 'Transaction would fail';
    return `Transaction would fail: ${revertReason}`;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Transaction failed. Please try again.';
};

// Helper: convert MultiBaas unsigned tx to viem/wagmi-friendly transaction
export const formatForWallet = (txData: any, accountAddress: string) => {
  if (!txData) throw new Error('Missing txData');
  // sdk returns the unsigned tx typically under txData.tx or txData
  const raw = txData.tx || txData;
  const formatted: any = { ...raw };

  // Convert value to BigInt if present and not zero
  if (formatted.value) {
    try {
      // value may be hex string or decimal string
      formatted.value = BigInt(formatted.value);
    } catch (e) {
      // fallback: try Number then BigInt
      formatted.value = BigInt(formatted.value || '0');
    }
  }

  // Map legacy gas -> gasLimit
  if (formatted.gas) {
    try {
      formatted.gasLimit = BigInt(formatted.gas);
    } catch (e) {
      // ignore conversion error
      formatted.gasLimit = formatted.gas;
    }
    delete formatted.gas;
  }

  // Map EIP-1559 fields
  if (formatted.gasFeeCap) {
    try {
      formatted.maxFeePerGas = BigInt(formatted.gasFeeCap);
    } catch (e) {
      formatted.maxFeePerGas = formatted.gasFeeCap;
    }
    delete formatted.gasFeeCap;
  }
  if (formatted.gasTipCap) {
    try {
      formatted.maxPriorityFeePerGas = BigInt(formatted.gasTipCap);
    } catch (e) {
      formatted.maxPriorityFeePerGas = formatted.gasTipCap;
    }
    delete formatted.gasTipCap;
  }

  // Remove fields we want wallet to determine
  delete formatted.nonce;
  delete formatted.gasPrice;
  delete formatted.from;
  delete formatted.hash;

  // Attach account for viem wallet client
  if (accountAddress) formatted.account = accountAddress;

  return formatted;
};