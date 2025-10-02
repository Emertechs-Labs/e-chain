"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
// We'll use a lightweight WebSocket JSON-RPC subscription to avoid heavy ethers imports
type JsonRpcLog = {
  address: string;
  topics: string[];
  data: string;
  blockNumber?: string;
  transactionHash?: string;
};
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '../../lib/contracts';
// Use a small ABI decoder. ethers is already a dependency; import only the Interface helper.
import { Interface } from 'ethers';

/**
 * Realtime subscriptions via WebSocket provider (optimal path)
 * - Listens for EventFactory EventCreated logs
 * - Listens for ERC-721 Transfer logs (ticket mints/transfers)
 * - Invalidates React Query caches when relevant events occur
 *
 * Requires env var NEXT_PUBLIC_WS_PROVIDER to be set to a WS RPC endpoint (e.g., Alchemy/Infura/ws)
 * Falls back to no-op if not present.
 */

export default function useRealtimeSubscriptions() {
  const qc = useQueryClient();
  const { address } = useAccount();

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_PROVIDER || (typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_WS_PROVIDER);
    if (!wsUrl) {
      console.debug('[useRealtimeSubscriptions] No WS provider configured - skipping realtime subscriptions');
      return;
    }

    // JSON-RPC WebSocket with ABI-decoding and simple reconnect/backoff
    let ws: WebSocket | null = null;
    let subscriptionIds: string[] = [];
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 8;

    // Prepare decoders from ABIs
    const factoryIface = new Interface(CONTRACT_ABIS.EventFactory as any);
    const ticketIface = new Interface(CONTRACT_ABIS.EventTicket as any);

    const subscribeAll = () => {
      if (!ws) return;
      // Subscribe to EventFactory logs (all topics)
      try {
        const eventFactoryAddress = (CONTRACT_ADDRESSES as any).EventFactory;
        if (eventFactoryAddress) {
          const id = String(Date.now()) + '-eventfactory';
          const payload = {
            jsonrpc: '2.0',
            id,
            method: 'eth_subscribe',
            params: [
              'logs',
              {
                address: eventFactoryAddress,
              },
            ],
          };
          ws.send(JSON.stringify(payload));
          subscriptionIds.push(id);
        }
      } catch (e) {
        console.warn('[useRealtimeSubscriptions] subscribe eventFactory failed', e);
      }

      // Subscribe to all Transfer logs (topic filter)
      try {
        // keccak256("Transfer(address,address,uint256)")
        const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a5c1e6f5';
        const id2 = String(Date.now()) + '-transfer';
        const payload2 = {
          jsonrpc: '2.0',
          id: id2,
          method: 'eth_subscribe',
          params: [
            'logs',
            {
              topics: [transferTopic],
            },
          ],
        };
        ws.send(JSON.stringify(payload2));
        subscriptionIds.push(id2);
      } catch (e) {
        console.warn('[useRealtimeSubscriptions] subscribe transfer failed', e);
      }
    };

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl as string);
      } catch (e) {
        console.warn('[useRealtimeSubscriptions] Failed to open WS', e);
        return;
      }

      ws.onopen = () => {
        console.debug('[useRealtimeSubscriptions] WS connected');
        reconnectAttempts = 0;
        subscribeAll();
        try {
          (window as any).__ECHAIN_WS_STATUS = 'connected';
          window.dispatchEvent(new Event('echain:wsstatus'));
        } catch (e) { /* ignore */ }
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string);
          // Handle subscription event messages
          if (msg.method === 'eth_subscription' && msg.params) {
            const log: JsonRpcLog = msg.params.result as any;

            const eventFactoryAddress = (CONTRACT_ADDRESSES as any).EventFactory;
            try {
              // If log is from EventFactory, try to decode the event using the factory ABI
              if (eventFactoryAddress && log.address?.toLowerCase() === eventFactoryAddress.toLowerCase()) {
                let parsed = null;
                try {
                  parsed = factoryIface.parseLog({ data: log.data, topics: log.topics as any });
                } catch (e) {
                  // parse may fail for non-indexed events or unknown signatures
                  parsed = null;
                }

                // Invalidate global events list always
                qc.invalidateQueries({ queryKey: ['events'] });
                if (address) qc.invalidateQueries({ queryKey: ['events', 'organizer', address] });

                if (parsed && parsed.name === 'EventCreated') {
                  // Typical EventCreated signature: (uint256 eventId, address ticketContract, ...)
                  const eventIdRaw = (parsed.args as any).eventId ?? (parsed.args as any)[0];
                  const eventId = typeof eventIdRaw === 'bigint' ? Number(eventIdRaw) : Number(eventIdRaw || -1);
                  if (!Number.isNaN(eventId) && eventId >= 0) {
                    qc.invalidateQueries({ predicate: (q) => {
                      const key = q.queryKey as any;
                      return key && key[0] === 'event' && Number(key[1]) === eventId;
                    } });
                  }
                }
              }
            } catch (e) {
              console.warn('[useRealtimeSubscriptions] factory log handling failed', e);
            }

            // Handle Transfer logs - topics[1] = from, topics[2] = to (topics are hex strings)
            if (log.topics && log.topics.length >= 3) {
              try {
                // Attempt to parse with EventTicket ABI if we can
                let parsedTransfer = null;
                try {
                  parsedTransfer = ticketIface.parseLog({ data: log.data, topics: log.topics as any });
                } catch (e) {
                  parsedTransfer = null;
                }

                const from = '0x' + log.topics[1].slice(26);
                const to = '0x' + log.topics[2].slice(26);

                if (address && (from.toLowerCase() === address.toLowerCase() || to.toLowerCase() === address.toLowerCase())) {
                  qc.invalidateQueries({ queryKey: ['user-tickets', address] });
                }

                // If parsedTransfer yields a tokenId we can try to invalidate specific event queries as well
                if (parsedTransfer && parsedTransfer.name === 'Transfer') {
                  const tokenIdRaw = (parsedTransfer.args as any).tokenId ?? (parsedTransfer.args as any)[2];
                  // We don't necessarily know the event id from tokenId, so invalidate event lists and marketplace
                  qc.invalidateQueries({ queryKey: ['events'] });
                  qc.invalidateQueries({ queryKey: ['marketplace'] });
                  qc.invalidateQueries({ predicate: (q) => String((q.queryKey as any)[0]) === 'event' });
                } else {
                  // Fallback: generic invalidations
                  qc.invalidateQueries({ queryKey: ['events'] });
                  qc.invalidateQueries({ queryKey: ['marketplace'] });
                }
              } catch (e) {
                console.warn('[useRealtimeSubscriptions] transfer log handling failed', e);
              }
            }
          }
        } catch (e) {
          console.warn('[useRealtimeSubscriptions] ws message parse error', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('[useRealtimeSubscriptions] WS error', e);
      };

      ws.onclose = () => {
        console.debug('[useRealtimeSubscriptions] WS closed');
        ws = null;
        try {
          (window as any).__ECHAIN_WS_STATUS = 'closed';
          window.dispatchEvent(new Event('echain:wsstatus'));
        } catch (e) { /* ignore */ }
        
        // try to reconnect with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
          const wait = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
          reconnectAttempts += 1;
          console.debug(`[useRealtimeSubscriptions] reconnecting in ${wait}ms (attempt ${reconnectAttempts})`);
          setTimeout(() => connect(), wait);
        } else {
          console.debug('[useRealtimeSubscriptions] max reconnect attempts reached, will stop trying');
        }
      };
    };

    connect();

    // Cleanup
    return () => {
      try {
        if (ws) {
          try { ws.close(); } catch (_) {}
        }
      } catch (e) {
        // ignore
      }
    };
  }, [qc, address]);
}
