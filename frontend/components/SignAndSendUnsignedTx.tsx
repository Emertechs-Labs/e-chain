"use client";
import React, { useState } from 'react';
import { writeContract } from '../lib/contract-wrapper';
import styles from './SignAndSendUnsignedTx.module.css';

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
  const [hasStarted, setHasStarted] = useState(false); // Prevent duplicate auto-start

  const handle = React.useCallback(async () => {
    // Prevent duplicate calls
    if (busy || result) {
      console.log('[SignAndSendUnsignedTx] Ignoring duplicate call - already busy or completed');
      return;
    }

    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const { address, contractLabel, method, args, from, value } = payload;

      // Use direct contract write
      const txHash = await writeContract(
        address || contractLabel, // Use address if provided, otherwise contractLabel
        method,
        args || [],
        {
          account: from as `0x${string}`,
          value: value ? BigInt(value) : undefined,
          waitForConfirmation: false, // Don't wait here, just return hash
        }
      );

      console.log('[SignAndSendUnsignedTx] Transaction submitted:', txHash);
      setResult(txHash);
      if (onSubmitted) onSubmitted(txHash);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }, [payload, onSubmitted, busy, result]);

  // Auto-start signing when component mounts if payload.autoStart is true
  React.useEffect(() => {
    if (payload && (payload.autoStart === true) && !hasStarted && !busy && !result) {
      console.log('[SignAndSendUnsignedTx] Auto-starting transaction');
      setHasStarted(true);
      // Slight delay to ensure UI has updated
      const t = setTimeout(() => {
        void handle();
      }, 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [payload, handle, hasStarted, busy, result]);

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
