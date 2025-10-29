"use client";

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { readContract, getBlockNumber, getTransactionReceipt } from '../../lib/contract-wrapper';

type PendingTx = {
  hash: `0x${string}`;
  addedAt: number;
};

const PENDING_TX_KEY = 'pending_txs';

function getPendingTxs(): PendingTx[] {
  try {
    const raw = localStorage.getItem(PENDING_TX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PendingTx[];
  } catch (_) {
    return [];
  }
}

function setPendingTxs(txs: PendingTx[]) {
  try {
    localStorage.setItem(PENDING_TX_KEY, JSON.stringify(txs));
  } catch (_) {}
}

/**
 * Call this to register a pending transaction hash (optional convenience)
 */
export function addPendingTx(hash: `0x${string}`) {
  try {
    const txs = getPendingTxs();
    txs.push({ hash, addedAt: Date.now() });
    setPendingTxs(txs);
  } catch (_) {}
}

/**
 * Hook: watches chain changes and invalidates React Query caches.
 * - polls block number
 * - polls EventFactory.eventCount and invalidates ['events'] when increased
 * - invalidates ['user-tickets', address] for connected users
 * - polls pending tx receipts and invalidates caches upon confirmation
 */
export default function useChainWatcher(pollIntervalMs: number = 10_000) {
  const { address } = useAccount();
  const qc = useQueryClient();
  const lastBlockRef = useRef<bigint | null>(null);
  const lastEventCountRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkPendingTxs() {
      try {
        const pending = getPendingTxs();
        if (pending.length === 0) return;

        const remaining: PendingTx[] = [];
        for (const tx of pending) {
          try {
            const receipt = await getTransactionReceipt(tx.hash as any);
            if (receipt && (receipt.blockNumber || receipt.status !== undefined)) {
              // Tx confirmed/failed — invalidate relevant queries
              console.log('[useChainWatcher] Pending tx confirmed:', tx.hash);
              // Invalidate events list
              qc.invalidateQueries({ queryKey: ['events'] });
              // Invalidate user tickets for this address
              if (address) qc.invalidateQueries({ queryKey: ['user-tickets', address] });
              // Invalidate individual event queries by predicate
              qc.invalidateQueries({ predicate: (query) => String((query.queryKey as any)[0]) === 'event' });
            } else {
              remaining.push(tx);
            }
          } catch (err) {
            // Keep tx in pending if error checking
            remaining.push(tx);
          }
        }

        setPendingTxs(remaining);
      } catch (e) {
        console.warn('[useChainWatcher] checkPendingTxs error', e);
      }
    }

    async function poll() {
      try {
        const block = await getBlockNumber();
        if (!mounted) return;

        if (lastBlockRef.current === null) {
          lastBlockRef.current = block;
        } else if (block !== lastBlockRef.current) {
          lastBlockRef.current = block;

          // Check EventFactory eventCount
          try {
            const eventCountRaw = await readContract('EventFactory', 'eventCount', []);
            const eventCount = typeof eventCountRaw === 'bigint' ? Number(eventCountRaw) : Number(eventCountRaw || 0);

            if (lastEventCountRef.current === null) {
              lastEventCountRef.current = eventCount;
            } else if (eventCount > lastEventCountRef.current) {
              console.log('[useChainWatcher] New events detected, invalidating events query');
              lastEventCountRef.current = eventCount;
              qc.invalidateQueries({ queryKey: ['events'] });
            }
          } catch (e) {
            // If eventCount check fails, still proceed to invalidate user-specific caches
            console.warn('[useChainWatcher] Failed to read eventCount', e);
          }

          // Invalidate user-specific ticket queries
          if (address) {
            qc.invalidateQueries({ queryKey: ['user-tickets', address] });
          } else {
            // Invalidate global user-tickets queries if any
            qc.invalidateQueries({ predicate: (query) => String((query.queryKey as any)[0]) === 'user-tickets' });
          }

          // Check pending txs
          await checkPendingTxs();
        }
      } catch (err) {
        console.warn('[useChainWatcher] poll error', err);
      }
    }

    // Initial run
    poll();

    const id = setInterval(() => {
      poll();
    }, pollIntervalMs);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [qc, address, pollIntervalMs]);
}
