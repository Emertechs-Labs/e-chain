"use client";

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Interface } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '../../lib/contracts';

type JsonRpcLog = {
  address: string;
  topics: string[];
  data: string;
  blockNumber?: string;
  transactionHash?: string;
};

type RealtimeStatus = 'disabled' | 'connecting' | 'connected' | 'closed' | 'error';

const STATUS_EVENT = 'echain:wsstatus';
const STATUS_KEY = '__ECHAIN_WS_STATUS';
const MAX_RECONNECT_ATTEMPTS = 12;
const BASE_RECONNECT_DELAY_MS = 1000;

const hasWindow = typeof window !== 'undefined';

const sentryCapture = (message: string, level: 'info' | 'warning' | 'error', extra?: Record<string, unknown>) => {
  try {
    if (hasWindow && (window as any).Sentry?.captureMessage) {
      (window as any).Sentry.captureMessage(message, {
        level,
        extra,
      });
    }
  } catch (_) {
    // ignore sentry failures
  }
};

const emitStatus = (status: RealtimeStatus, meta?: Record<string, unknown>) => {
  if (!hasWindow) return;
  (window as any)[STATUS_KEY] = status;
  if (meta) {
    (window as any).__ECHAIN_WS_LAST_META = meta;
  }
  window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail: { status, meta } }));
};

const log = (level: 'info' | 'warn' | 'error', message: string, extra?: Record<string, unknown>) => {
  const prefix = '[useRealtimeSubscriptions]';
  if (level === 'info') {
    console.info(prefix, message, extra ?? '');
  } else if (level === 'warn') {
    console.warn(prefix, message, extra ?? '');
  } else {
    console.error(prefix, message, extra ?? '');
  }
  sentryCapture(`${prefix} ${message}`, level === 'error' ? 'error' : level === 'warn' ? 'warning' : 'info', extra);
};

const computeBackoffDelay = (attempt: number) => {
  const exponential = Math.min(30000, BASE_RECONNECT_DELAY_MS * Math.pow(2, attempt));
  const jitter = 1 + Math.random() * 0.35; // add up to 35% jitter
  return Math.floor(exponential * jitter);
};

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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const manualCloseRef = useRef(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_PROVIDER;

    if (!wsUrl) {
      emitStatus('disabled');
      log('warn', 'No NEXT_PUBLIC_WS_PROVIDER configured; realtime subscriptions disabled');
      return;
    }

    emitStatus('connecting', { endpoint: wsUrl });

    let active = true;

    const factoryIface = new Interface(CONTRACT_ABIS.EventFactory as any);
    const ticketIface = new Interface(CONTRACT_ABIS.EventTicket as any);

    const clearReconnect = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    const scheduleReconnect = (reason: string) => {
      if (!active) return;
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        emitStatus('error', { reason: 'max_retries', endpoint: wsUrl });
        log('error', 'Max websocket reconnect attempts reached; giving up', { endpoint: wsUrl, reason });
        return;
      }

      const attempt = reconnectAttemptsRef.current;
      const delay = computeBackoffDelay(attempt);
      reconnectAttemptsRef.current += 1;
      emitStatus('connecting', { attempt: reconnectAttemptsRef.current, delay });
      log('warn', 'Scheduling websocket reconnect', { attempt: reconnectAttemptsRef.current, delay, reason });

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connect();
      }, delay);
    };

    const handleMessage = (factoryIfaceInstance: Interface, ticketIfaceInstance: Interface) => (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data as string);
        if (msg.method === 'eth_subscription' && msg.params) {
          const logPayload: JsonRpcLog = msg.params.result as any;

          const eventFactoryAddress = (CONTRACT_ADDRESSES as any).EventFactory;
          if (eventFactoryAddress && logPayload.address?.toLowerCase() === eventFactoryAddress.toLowerCase()) {
            try {
              let parsed: any = null;
              try {
                parsed = factoryIfaceInstance.parseLog({ data: logPayload.data, topics: logPayload.topics as any });
              } catch (_) {
                parsed = null;
              }

              qc.invalidateQueries({ queryKey: ['events'] });
              if (address) {
                qc.invalidateQueries({ queryKey: ['events', 'organizer', address] });
              }

              if (parsed && parsed.name === 'EventCreated') {
                const rawEventId = (parsed.args as any).eventId ?? (parsed.args as any)[0];
                const eventId = typeof rawEventId === 'bigint' ? Number(rawEventId) : Number(rawEventId ?? -1);
                if (!Number.isNaN(eventId) && eventId >= 0) {
                  qc.invalidateQueries({ predicate: (query) => {
                    const key = query.queryKey as any;
                    return key && key[0] === 'event' && Number(key[1]) === eventId;
                  } });
                }
              }
            } catch (error) {
              log('warn', 'Failed to handle EventFactory log', { error: (error as Error)?.message });
            }
          }

          if (logPayload.topics && logPayload.topics.length >= 3) {
            try {
              let parsedTransfer: any = null;
              try {
                parsedTransfer = ticketIfaceInstance.parseLog({ data: logPayload.data, topics: logPayload.topics as any });
              } catch (_) {
                parsedTransfer = null;
              }

              const from = '0x' + logPayload.topics[1].slice(26);
              const to = '0x' + logPayload.topics[2].slice(26);

              if (address && (from.toLowerCase() === address.toLowerCase() || to.toLowerCase() === address.toLowerCase())) {
                qc.invalidateQueries({ queryKey: ['user-tickets', address] });
              }

              if (parsedTransfer && parsedTransfer.name === 'Transfer') {
                qc.invalidateQueries({ queryKey: ['events'] });
                qc.invalidateQueries({ queryKey: ['marketplace'] });
                qc.invalidateQueries({ predicate: (query) => String((query.queryKey as any)[0]) === 'event' });
              } else {
                qc.invalidateQueries({ queryKey: ['events'] });
                qc.invalidateQueries({ queryKey: ['marketplace'] });
              }
            } catch (error) {
              log('warn', 'Failed to handle Transfer log', { error: (error as Error)?.message });
            }
          }
        }
      } catch (error) {
        log('warn', 'Failed to parse websocket message', { error: (error as Error)?.message });
      }
    };

    const connect = () => {
      if (!active) return;

      clearReconnect();

      try {
        emitStatus('connecting', { endpoint: wsUrl, attempt: reconnectAttemptsRef.current });
        log('info', 'Opening websocket connection', { endpoint: wsUrl, attempt: reconnectAttemptsRef.current });
        wsRef.current = new WebSocket(wsUrl);
      } catch (error) {
        log('error', 'Failed to instantiate websocket', { error: (error as Error)?.message, endpoint: wsUrl });
        scheduleReconnect('instantiate_error');
        return;
      }

      const ws = wsRef.current;
      if (!ws) return;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        emitStatus('connected', { endpoint: wsUrl });
        log('info', 'Websocket connected', { endpoint: wsUrl });

        try {
          const eventFactoryAddress = (CONTRACT_ADDRESSES as any).EventFactory;
          if (eventFactoryAddress) {
            ws.send(JSON.stringify({
              jsonrpc: '2.0',
              id: `${Date.now()}-eventfactory`,
              method: 'eth_subscribe',
              params: [
                'logs',
                {
                  address: eventFactoryAddress,
                },
              ],
            }));
          }

          const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a5c1e6f5';
          ws.send(JSON.stringify({
            jsonrpc: '2.0',
            id: `${Date.now()}-transfer`,
            method: 'eth_subscribe',
            params: [
              'logs',
              {
                topics: [transferTopic],
              },
            ],
          }));
        } catch (error) {
          log('warn', 'Failed to send subscription payload', { error: (error as Error)?.message });
        }
      };

      ws.onmessage = handleMessage(factoryIface, ticketIface);

      ws.onerror = (event) => {
        emitStatus('error', { endpoint: wsUrl, event });
        log('warn', 'Websocket encountered error', { endpoint: wsUrl, event });
      };

      ws.onclose = (event) => {
        wsRef.current = null;
        if (manualCloseRef.current || !active) {
          emitStatus('closed', { code: event.code, reason: event.reason });
          log('info', 'Websocket closed', { code: event.code, reason: event.reason });
          return;
        }

        emitStatus('closed', { code: event.code, reason: event.reason });
        log('warn', 'Websocket closed unexpectedly', { code: event.code, reason: event.reason });
        scheduleReconnect('socket_closed');
      };
    };

    connect();

    // Cleanup
    return () => {
      active = false;
      manualCloseRef.current = true;
      clearReconnect();
      const socket = wsRef.current;
      if (socket) {
        try {
          socket.close();
        } catch (_) {
          // ignore
        }
      }
      wsRef.current = null;
      emitStatus('closed');
    };
  }, [qc, address]);
}
