import { useEffect, useCallback, useRef } from 'react';
import { usePublicClient, useBlockNumber, useWatchContractEvent } from 'wagmi';
import { getBasePublicClient } from './base-rpc-manager';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './contracts';
import { useQueryClient } from '@tanstack/react-query';

interface SyncEvent {
  contract: string;
  event: string;
  args: any[];
  blockNumber: bigint;
  transactionHash: string;
  timestamp: number;
}

interface StateSyncConfig {
  contracts: string[];
  events: string[];
  onEvent?: (event: SyncEvent) => void;
  onError?: (error: Error) => void;
  pollingInterval?: number;
  batchSize?: number;
}

class BaseStateSyncEngine {
  private eventListeners: Map<string, Set<(event: SyncEvent) => void>> = new Map();
  private syncConfigs: Map<string, StateSyncConfig> = new Map();
  private isRunning = false;
  private lastProcessedBlock = 0n;
  private queryClient: any = null;

  constructor(queryClient?: any) {
    this.queryClient = queryClient;
  }

  // Register a sync configuration for a specific component/feature
  registerSync(id: string, config: StateSyncConfig): void {
    this.syncConfigs.set(id, config);
  }

  // Unregister sync configuration
  unregisterSync(id: string): void {
    this.syncConfigs.delete(id);
  }

  // Add event listener
  addEventListener(eventType: string, callback: (event: SyncEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  // Remove event listener
  removeEventListener(eventType: string, callback: (event: SyncEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType);
      }
    }
  }

  // Emit event to all listeners (public method)
  emitEvent(eventType: string, event: SyncEvent): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  // Process contract events
  private async processContractEvents(contractAddress: string, fromBlock: bigint, toBlock: bigint): Promise<void> {
    const client = getBasePublicClient();

    try {
      // Get contract config
      const contractConfig = Object.entries(CONTRACT_ADDRESSES).find(
        ([, addr]) => addr.toLowerCase() === contractAddress.toLowerCase()
      );

      if (!contractConfig) return;

      const [contractName, address] = contractConfig;
      const abi = CONTRACT_ABIS[contractName as keyof typeof CONTRACT_ABIS];

      if (!abi) return;

      // Get all events from the ABI
      const events = abi.filter(item => item.type === 'event');

      for (const event of events) {
        try {
          const logs = await client.getLogs({
            address: address as `0x${string}`,
            event: {
              type: 'event',
              name: event.name,
              inputs: event.inputs
            },
            fromBlock,
            toBlock,
            strict: false
          });

          for (const log of logs) {
            const syncEvent: SyncEvent = {
              contract: contractName,
              event: event.name,
              args: (log as any).args || [],
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              timestamp: Date.now()
            };

            this.emitEvent(`${contractName}:${event.name}`, syncEvent);
            this.emitEvent('all', syncEvent);

            // Invalidate relevant queries
            if (this.queryClient) {
              this.queryClient.invalidateQueries({
                predicate: (query: any) => {
                  return query.queryKey.some((key: string) =>
                    key.includes(contractName.toLowerCase()) ||
                    key.includes(event.name.toLowerCase())
                  );
                }
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to get logs for ${contractName}:${event.name}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error processing contract events for ${contractAddress}:`, error);
    }
  }

  // Start the sync engine
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    const client = getBasePublicClient();

    try {
      // Get current block number
      const currentBlock = await client.getBlockNumber();
      this.lastProcessedBlock = currentBlock;

      // Process historical events if needed (disabled for now to avoid contract issues)
      // const historicalBlocks = 1000n; // Process last 1000 blocks on startup
      // if (currentBlock > historicalBlocks) {
      //   await this.processContractEvents(
      //     CONTRACT_ADDRESSES.EventTicket,
      //     currentBlock - historicalBlocks,
      //     currentBlock
      //   );
      // }

      // Start real-time sync
      this.startRealTimeSync();
    } catch (error) {
      console.error('Failed to start state sync engine:', error);
      this.isRunning = false;
    }
  }

  // Start real-time synchronization
  private startRealTimeSync(): void {
    if (!this.isRunning) return;

    const syncLoop = async () => {
      if (!this.isRunning) return;

      try {
        const client = getBasePublicClient();
        const currentBlock = await client.getBlockNumber();

        if (currentBlock > this.lastProcessedBlock) {
          // Process new blocks
          for (const [contractName, address] of Object.entries(CONTRACT_ADDRESSES)) {
            await this.processContractEvents(
              address,
              this.lastProcessedBlock + 1n,
              currentBlock
            );
          }
        }
      } catch (error) {
        console.error('Error in real-time sync loop:', error);
      }

      // Schedule next sync (every 5 seconds)
      if (this.isRunning) {
        setTimeout(syncLoop, 5000);
      }
    };

    syncLoop();
  }

  // Stop the sync engine
  stop(): void {
    this.isRunning = false;
  }

  // Get sync status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastProcessedBlock: this.lastProcessedBlock.toString(),
      registeredConfigs: Array.from(this.syncConfigs.keys()),
      activeListeners: Array.from(this.eventListeners.keys())
    };
  }
}

// Singleton instance
export const baseStateSync = new BaseStateSyncEngine();

// React hook for using state sync
export function useBaseStateSync(config?: StateSyncConfig) {
  const queryClient = useQueryClient();
  const configRef = useRef(config);

  useEffect(() => {
    if (config) {
      baseStateSync.registerSync(`component-${Math.random()}`, config);
    }

    return () => {
      if (config) {
        // Note: In a real implementation, you'd need to track the ID
        // For now, we'll rely on component unmounting
      }
    };
  }, [config]);

  const emitEvent = useCallback((eventType: string, event: SyncEvent) => {
    baseStateSync.emitEvent(eventType, event);
  }, []);

  return {
    emitEvent,
    status: baseStateSync.getStatus(),
    start: () => baseStateSync.start(),
    stop: () => baseStateSync.stop()
  };
}

// Export types
export type { SyncEvent, StateSyncConfig };