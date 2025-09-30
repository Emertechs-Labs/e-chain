"use client";
import React, { useState } from 'react';
import styles from './SignAndSendUnsignedTx.module.css';

type UnsignedTx = {
  kind: string;
  tx: {
    from: string;
    to: string;
    value?: string;
    gas?: number | string;
    gasFeeCap?: string;
    gasTipCap?: string;
    data?: string;
    nonce?: number | string;
    type?: number | string;
  };
  submitted?: boolean;
};

const toHex = (v?: string | number) => {
  if (v === undefined || v === null) return undefined;
  try {
    // Accept either numeric or decimal-string inputs
    const n = BigInt(String(v));
    return '0x' + n.toString(16);
  } catch (e) {
    // If it's already hex, pass through
    const s = String(v);
    if (s.startsWith('0x')) return s;
    return undefined;
  }
};

export default function SignAndSendUnsignedTx({
  payload,
  label = 'Create Event',
  onSubmitted
}: {
  payload: Record<string, any>;
  label?: string;
  onSubmitted?: (txHash: string) => void;
}) {
  const autoStart = (payload as any)?.autoStart as boolean | undefined;
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = React.useCallback(async () => {
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/multibaas/unsigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(JSON.stringify(body));
        setBusy(false);
        return;
      }

      const unsigned: UnsignedTx = body as UnsignedTx;
      if (!unsigned || unsigned.kind !== 'TransactionToSignResponse' || !unsigned.tx) {
        setError('Invalid unsigned tx response');
        setBusy(false);
        return;
      }

      const tx = unsigned.tx;

      const txParams: any = {
        from: tx.from,
        to: tx.to,
      };

      if (tx.data) txParams.data = tx.data;
      if (tx.value) txParams.value = toHex(tx.value);
      if (tx.gas) txParams.gas = toHex(tx.gas);
      if (tx.gasFeeCap) txParams.maxFeePerGas = toHex(tx.gasFeeCap);
      if (tx.gasTipCap) txParams.maxPriorityFeePerGas = toHex(tx.gasTipCap);
      if (tx.nonce !== undefined) txParams.nonce = toHex(tx.nonce);
      if (tx.type !== undefined) txParams.type = toHex(tx.type);

      if (!(window as any).ethereum) {
        setError('No window.ethereum available. Connect a wallet (MetaMask/Rainbow).');
        setBusy(false);
        return;
      }

      // Request the wallet to send the transaction. This will open the wallet UI for signing.
      const eth = (window as any).ethereum;
      // Ensure from matches selected account — wallets typically ignore a different 'from'
      const accounts: string[] = await eth.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        // Try requesting access
        await eth.request({ method: 'eth_requestAccounts' });
      }

      // Send the transaction via the wallet
  const txHash = await eth.request({ method: 'eth_sendTransaction', params: [txParams] });
  const txHashStr = String(txHash);
  setResult(txHashStr);
  if (onSubmitted) onSubmitted(txHashStr);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }, [payload, onSubmitted]);

  // Auto-start signing when component mounts if payload.autoStart is true
  React.useEffect(() => {
    if (payload && (payload.autoStart === true)) {
      // Trigger signing automatically
      // Slight delay to ensure UI has updated
      const t = setTimeout(() => {
        void handle();
      }, 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [payload, handle]);

  return (
    <div>
      <button onClick={handle} disabled={busy} className="btn">
        {busy ? 'Processing…' : label}
      </button>
      {result && (
        <div className={styles.result}>
          Transaction submitted: <code>{result}</code>
        </div>
      )}
      {error && (
        <div className={styles.error}>
          Error: <pre className={styles.error}>{error}</pre>
        </div>
      )}
    </div>
  );
}
