# 🔗 Integration Documentation

<div align="center">

![MultiBaas](https://img.shields.io/badge/Curvegrid_MultiBaas-Integrated-00AEEF?style=for-the-badge&logo=api&logoColor=white)
![RainbowKit](https://img.shields.io/badge/RainbowKit-2.1.3-7B3FE4?style=for-the-badge&logo=walletconnect&logoColor=white)
![Base Sepolia](https://img.shields.io/badge/Base-Sepolia-0052FF?style=for-the-badge&logo=ethereum&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-010101?style=for-the-badge&logo=websocket&logoColor=white)

**Complete integration guide for Echain platform components**

*MultiBaas API • Wallet Integration • Real-time Events • External Services*

[🏗️ Architecture](#-architecture-overview) • [🔧 Setup](#-setup--configuration) • [📚 SDK Integration](#-sdk-integration) • [🎣 React Hooks](#-react-hooks) • [🔄 Real-time Events](#-real-time-events) • [🧪 Testing](#-testing-strategy)

</div>

---

## 🎯 Integration Overview

### Current Implementation Status
- **✅ MultiBaas API**: Fully integrated with REST and WebSocket support
- **✅ Wallet Integration**: RainbowKit + Reown for seamless wallet connections
- **✅ Real-time Events**: WebSocket streaming for live updates
- **✅ Type Safety**: Complete TypeScript integration with contract ABIs
- **✅ Error Handling**: Comprehensive fallback mechanisms and error recovery
- **✅ Production Ready**: Deployed on Base Sepolia with monitoring

## 🎯 Integration Overview

### Current Implementation Status
- **✅ MultiBaas API**: Fully integrated with REST and WebSocket support
- **✅ Wallet Integration**: RainbowKit + Reown for seamless wallet connections
- **✅ Real-time Events**: WebSocket streaming for live updates
- **✅ Type Safety**: Complete TypeScript integration with contract ABIs
- **✅ Error Handling**: Comprehensive fallback mechanisms and error recovery
- **✅ Production Ready**: Deployed on Base Sepolia with monitoring

### Advanced Integration Patterns

#### Circuit Breaker Pattern
```typescript
// lib/circuit-breaker.ts - Advanced error handling
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000,
    private monitoringPeriod = 300000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return this.state;
  }
}
```

#### Request Batching Strategy
```typescript
// lib/batch-requests.ts - Optimize multiple contract calls
export class ContractBatchProcessor {
  private queue: Array<{
    id: string;
    contract: string;
    method: string;
    args: any[];
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private processing = false;
  private batchSize = 10;
  private batchTimeout = 100; // ms

  async addToBatch(
    contract: string,
    method: string,
    args: any[] = []
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = `${Date.now()}-${Math.random()}`;

      this.queue.push({
        id,
        contract,
        method,
        args,
        resolve,
        reject,
      });

      this.scheduleProcessing();
    });
  }

  private scheduleProcessing() {
    if (this.processing) return;

    if (this.queue.length >= this.batchSize) {
      this.processBatch();
    } else {
      setTimeout(() => {
        if (this.queue.length > 0) {
          this.processBatch();
        }
      }, this.batchTimeout);
    }
  }

  private async processBatch() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const batch = this.queue.splice(0, this.batchSize);

    try {
      // Execute batch of contract calls
      const results = await Promise.allSettled(
        batch.map(async (item) => {
          try {
            const result = await multibaasClient.callContract(
              CONTRACT_ADDRESSES[item.contract as keyof typeof CONTRACT_ADDRESSES],
              item.contract,
              item.method,
              item.args
            );
            return { id: item.id, result };
          } catch (error) {
            return { id: item.id, error };
          }
        })
      );

      // Resolve/reject individual promises
      results.forEach((result, index) => {
        const item = batch[index];
        if (result.status === 'fulfilled') {
          if ('error' in result.value) {
            item.reject(result.value.error);
          } else {
            item.resolve(result.value.result);
          }
        } else {
          item.reject(result.reason);
        }
      });
    } finally {
      this.processing = false;

      // Process remaining items if any
      if (this.queue.length > 0) {
        setTimeout(() => this.processBatch(), 0);
      }
    }
  }
}
```

#### Connection Pooling for WebSockets
```typescript
// lib/websocket/pool.ts - WebSocket connection management
export class WebSocketPool {
  private connections: Map<string, WebSocket> = new Map();
  private maxConnections = 5;
  private connectionQueue: Array<{
    url: string;
    resolve: (ws: WebSocket) => void;
    reject: (error: any) => void;
  }> = [];

  async getConnection(url: string): Promise<WebSocket> {
    // Return existing connection if available
    if (this.connections.has(url)) {
      const ws = this.connections.get(url)!;
      if (ws.readyState === WebSocket.OPEN) {
        return ws;
      } else {
        this.connections.delete(url);
      }
    }

    // Check connection limit
    if (this.connections.size >= this.maxConnections) {
      return new Promise((resolve, reject) => {
        this.connectionQueue.push({ url, resolve, reject });
      });
    }

    // Create new connection
    return this.createConnection(url);
  }

  private async createConnection(url: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        this.connections.set(url, ws);
        resolve(ws);

        // Process queued connections
        this.processQueue();
      };

      ws.onerror = (error) => {
        reject(error);
      };

      ws.onclose = () => {
        this.connections.delete(url);
        this.processQueue();
      };
    });
  }

  private processQueue() {
    if (this.connectionQueue.length === 0) return;

    const { url, resolve, reject } = this.connectionQueue.shift()!;

    if (this.connections.size < this.maxConnections) {
      this.createConnection(url).then(resolve).catch(reject);
    } else {
      // Re-queue if still at limit
      this.connectionQueue.unshift({ url, resolve, reject });
    }
  }

  closeAll() {
    for (const ws of this.connections.values()) {
      ws.close();
    }
    this.connections.clear();

    // Reject all queued connections
    for (const { reject } of this.connectionQueue) {
      reject(new Error('Connection pool closed'));
    }
    this.connectionQueue.length = 0;
  }
}
```

### Advanced React Hooks

#### Optimistic Updates Hook
```typescript
// lib/hooks/useOptimisticUpdate.ts - Optimistic UI updates
export function useOptimisticUpdate<T>(
  queryKey: string[],
  updateFn: (currentData: T, newData: Partial<T>) => T
) {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    (newData: Partial<T>, rollbackData?: T) => {
      // Cancel any outgoing refetches
      queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<T>(queryKey);

      // Optimistically update
      queryClient.setQueryData<T>(queryKey, (currentData) => {
        if (!currentData) return currentData;
        return updateFn(currentData, newData);
      });

      // Return rollback function
      return () => {
        queryClient.setQueryData(queryKey, rollbackData || previousData);
      };
    },
    [queryClient, queryKey, updateFn]
  );

  return optimisticUpdate;
}
```

#### Advanced Event Hook with Caching
```typescript
// lib/hooks/useEventWithCache.ts - Cached event management
export function useEventWithCache(eventId: number) {
  const queryClient = useQueryClient();
  const optimisticUpdate = useOptimisticUpdate(
    ['event', eventId],
    (current, updates) => ({ ...current, ...updates })
  );

  const { data: event, ...queryState } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => multibaasClient.callContract(
      CONTRACT_ADDRESSES.EventFactory,
      'EventFactory',
      'getEvent',
      [eventId]
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const updateEvent = useMutation({
    mutationFn: async (updates: Partial<Event>) => {
      // Optimistically update UI
      const rollback = optimisticUpdate(updates);

      try {
        // Make actual contract call
        const result = await multibaasClient.callContract(
          CONTRACT_ADDRESSES.EventFactory,
          'EventFactory',
          'updateEvent',
          [eventId, updates]
        );

        // Update cache with server response
        queryClient.setQueryData(['event', eventId], result);

        return result;
      } catch (error) {
        // Rollback on error
        rollback();
        throw error;
      }
    },
  });

  return {
    event,
    ...queryState,
    updateEvent: updateEvent.mutate,
    isUpdating: updateEvent.isPending,
  };
}
```

#### Infinite Scroll Hook for Events
```typescript
// lib/hooks/useInfiniteEvents.ts - Infinite scroll events
export function useInfiniteEvents(options?: {
  organizer?: string;
  category?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: ['events', 'infinite', options],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await multibaasClient.callContract(
        CONTRACT_ADDRESSES.EventFactory,
        'EventFactory',
        'getEvents',
        [
          pageParam,
          options?.limit || 20,
          options?.organizer || ethers.constants.AddressZero,
          options?.category || ''
        ]
      );

      return {
        events: result.events,
        nextCursor: result.hasMore ? pageParam + (options?.limit || 20) : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
```

### Advanced Error Handling

#### Retry Strategies
```typescript
// lib/retry.ts - Advanced retry logic
export class RetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffFactor?: number;
      retryCondition?: (error: any) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffFactor = 2,
      retryCondition = () => true,
    } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry if condition fails
        if (!retryCondition(error)) {
          throw error;
        }

        // Don't delay on last attempt
        if (attempt === maxAttempts) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt - 1),
          maxDelay
        );

        // Add jitter to prevent thundering herd
        const jitteredDelay = delay * (0.5 + Math.random() * 0.5);

        await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      }
    }

    throw lastError;
  }

  static isRetryableError(error: any): boolean {
    // Retry on network errors
    if (error.code === 'NETWORK_ERROR') return true;

    // Retry on 5xx server errors
    if (error.response?.status >= 500) return true;

    // Retry on rate limiting
    if (error.response?.status === 429) return true;

    // Don't retry on client errors
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return false;
    }

    // Retry on timeout
    if (error.code === 'TIMEOUT') return true;

    return false;
  }
}
```

#### Fallback Mechanisms
```typescript
// lib/fallback.ts - Multi-level fallback system
export class FallbackManager {
  private fallbacks: Array<{
    name: string;
    condition: (error: any) => boolean;
    handler: () => Promise<any>;
  }> = [];

  addFallback(
    name: string,
    condition: (error: any) => boolean,
    handler: () => Promise<any>
  ) {
    this.fallbacks.push({ name, condition, handler });
  }

  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      console.warn(`Primary operation failed${context ? ` for ${context}` : ''}:`, error);

      for (const fallback of this.fallbacks) {
        if (fallback.condition(error)) {
          try {
            console.log(`Attempting fallback: ${fallback.name}`);
            return await fallback.handler();
          } catch (fallbackError) {
            console.warn(`Fallback ${fallback.name} also failed:`, fallbackError);
            continue;
          }
        }
      }

      throw error;
    }
  }
}

// Usage example
const eventFallbacks = new FallbackManager();

// Fallback to cached data
eventFallbacks.addFallback(
  'cached-data',
  (error) => error.code === 'NETWORK_ERROR',
  async () => {
    const cached = localStorage.getItem('events-cache');
    return cached ? JSON.parse(cached) : [];
  }
);

// Fallback to mock data
eventFallbacks.addFallback(
  'mock-data',
  () => true, // Always try as last resort
  async () => {
    return [
      {
        id: 1,
        name: 'Service Temporarily Unavailable',
        ticketPrice: '0',
        maxTickets: 0,
        isActive: false,
      },
    ];
  }
);
```

### Performance Optimization

#### Query Batching and Deduplication
```typescript
// lib/query-batcher.ts - Batch multiple queries
export class QueryBatcher {
  private queryQueue: Map<string, {
    query: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = new Map();

  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly batchDelay = 50; // ms

  async batchQuery<T>(
    key: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // If query already in progress, wait for it
      if (this.queryQueue.has(key)) {
        this.queryQueue.get(key)!.resolve = resolve;
        this.queryQueue.get(key)!.reject = reject;
        return;
      }

      // Add to queue
      this.queryQueue.set(key, {
        query: queryFn,
        resolve,
        reject,
      });

      // Schedule batch execution
      this.scheduleBatch();
    });
  }

  private scheduleBatch() {
    if (this.batchTimeout) return;

    this.batchTimeout = setTimeout(() => {
      this.executeBatch();
    }, this.batchDelay);
  }

  private async executeBatch() {
    const queries = Array.from(this.queryQueue.entries());
    this.queryQueue.clear();
    this.batchTimeout = null;

    // Execute all queries in parallel
    const results = await Promise.allSettled(
      queries.map(([key, { query }]) => query())
    );

    // Resolve/reject promises
    results.forEach((result, index) => {
      const [key, { resolve, reject }] = queries[index];

      if (result.status === 'fulfilled') {
        resolve(result.value);
      } else {
        reject(result.reason);
      }
    });
  }
}
```

#### Memory Management and Cleanup
```typescript
// lib/memory-manager.ts - Memory optimization
export class MemoryManager {
  private static instance: MemoryManager;
  private cache = new Map<string, {
    data: any;
    timestamp: number;
    ttl: number;
  }>();

  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  set(key: string, data: any, ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    this.scheduleCleanup();
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  private scheduleCleanup() {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();

      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > item.ttl) {
          this.cache.delete(key);
        }
      }

      // Clear interval if cache is empty
      if (this.cache.size === 0) {
        if (this.cleanupInterval) {
          clearInterval(this.cleanupInterval);
          this.cleanupInterval = null;
        }
      }
    }, 60 * 1000); // Clean up every minute
  }

  clear() {
    this.cache.clear();
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
```

### Integration Components
```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App Router]
        B[React Components]
        C[Custom Hooks]
        D[TypeScript Types]
    end

    subgraph "Integration Layer"
        E[MultiBaas SDK]
        F[RainbowKit Provider]
        G[WebSocket Client]
        H[Error Boundaries]
    end

    subgraph "Blockchain Layer"
        I[Base Sepolia]
        J[Smart Contracts]
        K[Event Streaming]
    end

    subgraph "External Services"
        L[IPFS Gateway]
        M[The Graph]
        N[Analytics]
    end

    A --> E
    B --> C
    C --> E
    C --> F
    C --> G
    E --> I
    F --> I
    G --> K
    J --> L
    J --> M
    A --> N
```

---

## 🏗️ Architecture Overview

### Multi-Layer Integration Architecture

#### Frontend Integration Layer
```typescript
// lib/providers.tsx - Main provider setup
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowTheme}>
          <ThemeProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

#### API Abstraction Layer
```typescript
// lib/multibaas/client.ts - MultiBaas client configuration
export const multibaasClient = new MultiBaasClient({
  deploymentUrl: process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL!,
  dappUserApiKey: process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY!,
  web3ApiKey: process.env.NEXT_PUBLIC_MULTIBAAS_WEB3_API_KEY!,
  chainId: 84532, // Base Sepolia
});
```

#### Real-time Event Layer
```typescript
// lib/websocket/events.ts - WebSocket event handling
export class EventWebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(eventId?: string) {
    const wsUrl = `${process.env.NEXT_PUBLIC_MULTIBAAS_WS_URL}/events`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleEventMessage(data);
    };

    this.ws.onclose = () => this.handleReconnect();
  }
}
```

### Data Flow Patterns

#### Read Operations (REST API)
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant H as React Hook
    participant M as MultiBaas API
    participant C as Smart Contract

    U->>F: Navigate to events page
    F->>H: useEvents() hook
    H->>M: GET /api/v0/chains/ethereum/contracts/{address}/methods/getActiveEvents
    M->>C: Call contract method
    C->>M: Return event data
    M->>H: JSON response
    H->>F: Formatted events
    F->>U: Display events
```

#### Write Operations (Transaction)
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant W as Wallet
    participant M as MultiBaas
    participant B as Blockchain

    U->>F: Click "Purchase Ticket"
    F->>W: Request signature
    W->>U: Show transaction details
    U->>W: Approve transaction
    W->>M: Submit signed transaction
    M->>B: Broadcast to network
    B->>M: Transaction mined
    M->>F: Transaction receipt
    F->>U: Success confirmation
```

#### Real-time Updates (WebSocket)
```mermaid
sequenceDiagram
    participant F as Frontend
    participant WS as WebSocket
    participant M as MultiBaas
    participant C as Contract

    F->>WS: Connect to event stream
    WS->>M: Subscribe to contract events
    M->>C: Monitor for events
    C->>M: Event emitted
    M->>WS: Send event data
    WS->>F: Update UI in real-time
    F->>F: Show live updates
```

---

## 🔧 Setup & Configuration

### Environment Configuration

#### Required Environment Variables
```env
# ============================================================================
# MULTIBAAS CONFIGURATION
# ============================================================================

# MultiBaas Deployment URL (from your MultiBaas console)
NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL=https://kwp44rxeifggriyd4hmbjq7dey.multibaas.com

# API Keys (generate in MultiBaas console under Admin → API Keys)
NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU5MDUzNzQxLCJqdGkiOiI3ZmJhM2ZmZS03Y2NhLTRlM2ItODY2Ni00MTJmMDIwMmM0NjkifQ.5xoeq2EUzDE-NNC0R_mrMtQVAG2xWfDRoRz3RNkf_OY
NEXT_PUBLIC_MULTIBAAS_WEB3_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU5MDUzNDYxLCJqdGkiOiJkMDdhZTRjNC00OGQ0LTQ2NDItOTFmOC1iYmRjYjZhMWNkZDQifQ.FBsSW78nyYR_kWSmWYYW3iMqpCozu4L2SFl36Al_gr0

# WebSocket URL for real-time events
NEXT_PUBLIC_MULTIBAAS_WS_URL=wss://kwp44rxeifggriyd4hmbjq7dey.multibaas.com

# ============================================================================
# WALLET CONFIGURATION
# ============================================================================

# Reown Project ID (get from https://cloud.reown.com/)
NEXT_PUBLIC_REOWN_PROJECT_ID=your-reown-project-id

# ============================================================================
# CONTRACT ADDRESSES (Base Sepolia)
# ============================================================================

NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=0xbE36039Bfe7f48604F73daD61411459B17fd2e85
NEXT_PUBLIC_INCENTIVE_MANAGER_ADDRESS=0x8290c12f874DF9D03FDadAbE10C7c6321B69Ded9

# ============================================================================
# NETWORK CONFIGURATION
# ============================================================================

NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://sepolia.basescan.org
```

### MultiBaas Setup Steps

#### 1. Create MultiBaas Account
```bash
# Visit https://console.curvegrid.com/
# Sign up for a new account
# Create a new deployment for Base Sepolia
```

#### 2. Deploy Contracts via MultiBaas
```typescript
// scripts/deploy-multibaas.ts
import { MultiBaasClient } from '@curvegrid/multibaas-sdk';

const client = new MultiBaasClient({
  deploymentUrl: process.env.MULTIBAAS_DEPLOYMENT_URL,
  web3ApiKey: process.env.MULTIBAAS_WEB3_API_KEY
});

async function deployContracts() {
  // Deploy EventFactory
  const factoryDeployment = await client.deployContract({
    chain: 'ethereum',
    contractName: 'EventFactory',
    source: 'contracts/core/EventFactory.sol',
    constructorArgs: [],
    label: 'event_factory'
  });

  console.log('EventFactory deployed:', factoryDeployment.address);

  // Deploy IncentiveManager
  const incentiveDeployment = await client.deployContract({
    chain: 'ethereum',
    contractName: 'IncentiveManager',
    source: 'contracts/modules/IncentiveManager.sol',
    constructorArgs: [factoryDeployment.address],
    label: 'incentive_manager'
  });

  console.log('IncentiveManager deployed:', incentiveDeployment.address);
}
```

#### 3. Generate API Keys
```typescript
// In MultiBaas console: Admin → API Keys
const dappUserKey = await client.createApiKey({
  name: 'Echain Frontend',
  group: 'DApp Users',
  permissions: ['read:contracts', 'read:events', 'write:transactions']
});

const web3Key = await client.createApiKey({
  name: 'Echain Web3',
  group: 'Web3 Users',
  permissions: ['write:contracts', 'read:events', 'write:events']
});
```

### Wallet Integration Setup

#### RainbowKit Configuration
```typescript
// lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Echain',
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!,
  chains: [baseSepolia],
  ssr: true,
});
```

#### Theme Integration
```typescript
// lib/rainbow-theme.ts
import { darkTheme, lightTheme } from '@rainbow-me/rainbowkit';

export const getRainbowTheme = (isDark: boolean) =>
  isDark
    ? darkTheme({
        accentColor: '#00D4FF',
        accentColorForeground: 'white',
        borderRadius: 'medium',
      })
    : lightTheme({
        accentColor: '#00D4FF',
        accentColorForeground: 'white',
        borderRadius: 'medium',
      });
```

---

## 📚 SDK Integration

### MultiBaas SDK Installation
```bash
npm install @curvegrid/multibaas-sdk
# or
yarn add @curvegrid/multibaas-sdk
```

### Core Client Setup
```typescript
// lib/multibaas/client.ts
import {
  Configuration,
  ContractsApi,
  EventsApi,
  TransactionsApi
} from '@curvegrid/multibaas-sdk';

export class MultiBaasClient {
  private config: Configuration;
  public contracts: ContractsApi;
  public events: EventsApi;
  public transactions: TransactionsApi;

  constructor(options: {
    deploymentUrl: string;
    dappUserApiKey: string;
    web3ApiKey?: string;
    chainId?: number;
  }) {
    this.config = new Configuration({
      basePath: options.deploymentUrl,
      apiKey: options.dappUserApiKey,
      headers: {
        'X-API-Key': options.dappUserApiKey,
      },
    });

    this.contracts = new ContractsApi(this.config);
    this.events = new EventsApi(this.config);
    this.transactions = new TransactionsApi(this.config);
  }

  // Utility methods
  async callContract(
    address: string,
    contractLabel: string,
    method: string,
    args: any[] = [],
    options?: { from?: string; value?: string }
  ) {
    const response = await this.contracts.callContractFunction(
      'ethereum',
      address,
      contractLabel,
      method,
      {
        args,
        ...options,
      }
    );

    return response.data.result;
  }
}
```

### Contract Interaction Examples

#### Reading Contract Data
```typescript
// Get active events
const events = await multibaasClient.callContract(
  CONTRACT_ADDRESSES.EventFactory,
  'EventFactory',
  'getActiveEvents',
  [0, 50] // offset, limit
);

// Get specific event details
const eventDetails = await multibaasClient.callContract(
  CONTRACT_ADDRESSES.EventFactory,
  'EventFactory',
  'getEvent',
  [eventId]
);
```

#### Writing to Contracts
```typescript
// Create new event
const createEventTx = await multibaasClient.callContract(
  CONTRACT_ADDRESSES.EventFactory,
  'EventFactory',
  'createEvent',
  [
    'Summer Music Festival',
    'ipfs://Qm...',
    ethers.utils.parseEther('0.1'), // 0.1 ETH
    1000, // max tickets
    Math.floor(Date.now() / 1000) + 86400, // tomorrow
    Math.floor(Date.now() / 1000) + 86400 * 2 // day after
  ],
  {
    from: userAddress,
    value: '0' // No ETH sent for creation
  }
);
```

#### Transaction Monitoring
```typescript
// Submit and monitor transaction
const txResponse = await multibaasClient.transactions.submitTransaction({
  chain: 'ethereum',
  from: userAddress,
  to: contractAddress,
  data: encodedFunctionData,
  gasLimit: '200000'
});

// Poll for confirmation
const receipt = await multibaasClient.transactions.getTransactionReceipt(
  'ethereum',
  txResponse.data.txHash
);
```

---

## 🎣 React Hooks

### Custom Hook Architecture
```typescript
// lib/hooks/useContract.ts - Base contract hook
export function useContract<T>(
  address: string,
  contractLabel: string,
  method: string,
  args: any[] = [],
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  return useQuery({
    queryKey: ['contract', address, method, ...args],
    queryFn: () => multibaasClient.callContract(address, contractLabel, method, args),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    retry: (failureCount, error) => {
      // Don't retry on user errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
```

### Event Management Hooks
```typescript
// app/hooks/useEvents.ts
export function useEvents(options?: {
  limit?: number;
  offset?: number;
  organizer?: string;
}) {
  return useContract(
    CONTRACT_ADDRESSES.EventFactory,
    'EventFactory',
    'getActiveEvents',
    [options?.offset ?? 0, options?.limit ?? 20]
  );
}

export function useEvent(eventId: number) {
  return useContract(
    CONTRACT_ADDRESSES.EventFactory,
    'EventFactory',
    'getEvent',
    [eventId],
    {
      enabled: !!eventId,
    }
  );
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: CreateEventParams) => {
      const result = await multibaasClient.callContract(
        CONTRACT_ADDRESSES.EventFactory,
        'EventFactory',
        'createEvent',
        [
          eventData.name,
          eventData.metadataURI,
          eventData.ticketPrice,
          eventData.maxTickets,
          eventData.startTime,
          eventData.endTime,
        ]
      );

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch events
      queryClient.invalidateQueries({ queryKey: ['contract'] });
    },
  });
}
```

### Ticket Management Hooks
```typescript
// app/hooks/useTickets.ts
export function useUserTickets(userAddress?: string) {
  const { address } = useAccount();

  return useContract(
    CONTRACT_ADDRESSES.EventFactory,
    'EventFactory',
    'getUserTickets',
    [userAddress || address],
    {
      enabled: !!(userAddress || address),
    }
  );
}

export function usePurchaseTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      quantity,
      recipient
    }: PurchaseTicketsParams) => {
      // Get ticket price from event
      const event = await multibaasClient.callContract(
        CONTRACT_ADDRESSES.EventFactory,
        'EventFactory',
        'getEvent',
        [eventId]
      );

      const totalCost = BigNumber.from(event.ticketPrice).mul(quantity);

      // Purchase tickets
      const result = await multibaasClient.callContract(
        CONTRACT_ADDRESSES.EventFactory,
        'EventFactory',
        'purchaseTickets',
        [eventId, quantity, recipient],
        {
          value: totalCost.toString(),
        }
      );

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract'] });
    },
  });
}
```

### Incentive System Hooks
```typescript
// app/hooks/useRewards.ts
export function useUserRewards(userAddress?: string) {
  const { address } = useAccount();

  return useContract(
    CONTRACT_ADDRESSES.IncentiveManager,
    'IncentiveManager',
    'getUserRewards',
    [userAddress || address],
    {
      enabled: !!(userAddress || address),
    }
  );
}

export function useClaimReward() {
  return useMutation({
    mutationFn: async (rewardId: string) => {
      return multibaasClient.callContract(
        CONTRACT_ADDRESSES.IncentiveManager,
        'IncentiveManager',
        'claimReward',
        [rewardId]
      );
    },
  });
}
```

---

## 🔄 Real-time Events

### WebSocket Integration
```typescript
// lib/websocket/events.ts
export class EventWebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, (data: any) => void> = new Map();

  connect(options?: { eventId?: string; contractAddress?: string }) {
    const wsUrl = new URL(process.env.NEXT_PUBLIC_MULTIBAAS_WS_URL!);
    wsUrl.pathname = '/events';
    wsUrl.searchParams.set('chain', 'ethereum');

    if (options?.contractAddress) {
      wsUrl.searchParams.set('address', options.contractAddress);
    }

    this.ws = new WebSocket(wsUrl.toString());

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleEventMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleEventMessage(data: any) {
    const eventType = data.eventType;
    const listener = this.listeners.get(eventType);

    if (listener) {
      listener(data);
    }

    // Broadcast to all listeners for this event type
    this.listeners.forEach((callback, key) => {
      if (key === eventType || key === '*') {
        callback(data);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    }
  }

  subscribe(eventType: string, callback: (data: any) => void) {
    this.listeners.set(eventType, callback);
  }

  unsubscribe(eventType: string) {
    this.listeners.delete(eventType);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

### React Hook for Real-time Updates
```typescript
// app/hooks/useWebSocket.ts
export function useWebSocketEvents(eventId?: string) {
  const [events, setEvents] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsManager = useRef<EventWebSocketManager | null>(null);

  useEffect(() => {
    wsManager.current = new EventWebSocketManager();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleEvent = (data: any) => {
      setEvents(prev => [...prev, data]);
    };

    wsManager.current.subscribe('connect', handleConnect);
    wsManager.current.subscribe('disconnect', handleDisconnect);
    wsManager.current.subscribe('TicketsPurchased', handleEvent);
    wsManager.current.subscribe('EventCreated', handleEvent);

    wsManager.current.connect({ eventId });

    return () => {
      wsManager.current?.disconnect();
    };
  }, [eventId]);

  return { events, isConnected };
}
```

### Event Types and Handling
```typescript
// types/events.ts
export interface ContractEvent {
  eventType: string;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  logIndex: number;
  timestamp: number;
  eventData: Record<string, any>;
}

export interface TicketsPurchasedEvent extends ContractEvent {
  eventType: 'TicketsPurchased';
  eventData: {
    buyer: string;
    eventId: number;
    quantity: number;
    totalCost: string;
    tokenIds: number[];
  };
}

export interface EventCreatedEvent extends ContractEvent {
  eventType: 'EventCreated';
  eventData: {
    eventId: number;
    organizer: string;
    name: string;
    ticketPrice: string;
    maxTickets: number;
  };
}

// Event handler utilities
export const eventHandlers = {
  TicketsPurchased: (event: TicketsPurchasedEvent) => {
    console.log(`Tickets purchased: ${event.eventData.quantity} for event ${event.eventData.eventId}`);
    // Update UI, show notifications, etc.
  },

  EventCreated: (event: EventCreatedEvent) => {
    console.log(`New event created: ${event.eventData.name}`);
    // Refresh events list, show success message, etc.
  },
};
```

---

## 🧪 Testing Strategy

### Unit Testing
```typescript
// __tests__/hooks/useEvents.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvents } from '@/hooks/useEvents';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useEvents', () => {
  it('should fetch events successfully', async () => {
    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    // Mock API error
    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
```

### Integration Testing
```typescript
// __tests__/integration/multibaas.test.ts
describe('MultiBaas Integration', () => {
  let client: MultiBaasClient;

  beforeAll(() => {
    client = new MultiBaasClient({
      deploymentUrl: process.env.TEST_MULTIBAAS_URL!,
      dappUserApiKey: process.env.TEST_API_KEY!,
    });
  });

  it('should call contract read function', async () => {
    const result = await client.callContract(
      TEST_CONTRACT_ADDRESS,
      'TestContract',
      'getValue'
    );

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should handle contract write operations', async () => {
    const txResult = await client.callContract(
      TEST_CONTRACT_ADDRESS,
      'TestContract',
      'setValue',
      ['42'],
      { from: TEST_WALLET_ADDRESS }
    );

    expect(txResult).toHaveProperty('transactionHash');
  });
});
```

### E2E Testing
```typescript
// e2e/events.spec.ts
import { test, expect } from '@playwright/test';

test('should create and display event', async ({ page }) => {
  // Connect wallet
  await page.goto('/events/create');
  await page.click('[data-testid="connect-wallet"]');
  await page.click('[data-testid="metamask-wallet"]');

  // Fill event form
  await page.fill('[data-testid="event-name"]', 'Test Event');
  await page.fill('[data-testid="ticket-price"]', '0.1');
  await page.fill('[data-testid="max-tickets"]', '100');

  // Submit form
  await page.click('[data-testid="create-event"]');

  // Verify event appears in list
  await page.goto('/events');
  await expect(page.locator('text=Test Event')).toBeVisible();
});
```

### Mock Data for Testing
```typescript
// lib/mocks/contractData.ts
export const mockEvents = [
  {
    id: 1,
    organizer: '0x1234...',
    name: 'Summer Music Festival',
    ticketPrice: '100000000000000000', // 0.1 ETH
    maxTickets: 1000,
    soldTickets: 150,
    startTime: Date.now() + 86400000,
    endTime: Date.now() + 172800000,
    isActive: true,
  },
];

export const mockUserTickets = [
  {
    tokenId: 1,
    eventId: 1,
    purchaseTime: Date.now(),
    checkedIn: false,
  },
];
```

---

## 🔒 Security Considerations

### API Key Security
```typescript
// Secure key management
export const getSecureApiKey = () => {
  // Never expose keys in client-side code
  if (typeof window !== 'undefined') {
    throw new Error('API keys should not be accessed on client side');
  }

  return process.env.MULTIBAAS_DAPP_USER_API_KEY;
};
```

### Input Validation
```typescript
// Contract input validation
export const validateEventCreation = (data: CreateEventParams) => {
  if (!data.name || data.name.length < 3) {
    throw new Error('Event name must be at least 3 characters');
  }

  if (data.ticketPrice <= 0) {
    throw new Error('Ticket price must be greater than 0');
  }

  if (data.maxTickets <= 0 || data.maxTickets > 10000) {
    throw new Error('Max tickets must be between 1 and 10,000');
  }

  if (data.startTime <= Date.now()) {
    throw new Error('Event start time must be in the future');
  }
};
```

### Rate Limiting
```typescript
// Client-side rate limiting
export class RateLimiter {
  private requests: number[] = [];
  private maxRequests = 10;
  private windowMs = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(
      time => now - time < this.windowMs
    );

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }
}
```

### Error Handling
```typescript
// Comprehensive error handling
export const handleContractError = (error: any) => {
  if (error.response?.status === 401) {
    throw new Error('Authentication failed. Please check your API key.');
  }

  if (error.response?.status === 429) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  if (error.response?.data?.error?.message) {
    throw new Error(`Contract error: ${error.response.data.error.message}`);
  }

  throw new Error('An unexpected error occurred. Please try again.');
};
```

---

## 📊 Monitoring & Analytics

### Performance Monitoring
```typescript
// lib/monitoring.ts
export const monitorContractCall = async (
  contractName: string,
  methodName: string,
  callFn: () => Promise<any>
) => {
  const startTime = Date.now();

  try {
    const result = await callFn();
    const duration = Date.now() - startTime;

    // Log successful call
    console.log(`Contract call ${contractName}.${methodName} took ${duration}ms`);

    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'contract_call', {
        contract: contractName,
        method: methodName,
        duration,
        success: true,
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log failed call
    console.error(`Contract call ${contractName}.${methodName} failed after ${duration}ms:`, error);

    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'contract_call', {
        contract: contractName,
        method: methodName,
        duration,
        success: false,
        error: error.message,
      });
    }

    throw error;
  }
};
```

### MultiBaas Dashboard Monitoring
- **API Usage**: Monitor request counts and response times
- **Error Rates**: Track failed contract calls and error types
- **Gas Usage**: Monitor transaction costs and optimization opportunities
- **Event Streaming**: Track WebSocket connection health and message volumes

---

## 🚀 Deployment & Production

### Production Environment Setup
```bash
# 1. Environment variables
cp .env.example .env.production
# Edit with production values

# 2. Build application
npm run build

# 3. Deploy to Vercel/Netlify
npm run deploy

# 4. Verify integrations
npm run test:integration
```

### Health Checks
```typescript
// lib/health.ts
export const healthChecks = {
  async multibaas() {
    try {
      await multibaasClient.callContract(
        CONTRACT_ADDRESSES.EventFactory,
        'EventFactory',
        'getActiveEvents',
        [0, 1]
      );
      return { status: 'healthy', latency: 0 };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },

  async websocket() {
    return new Promise((resolve) => {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_MULTIBAAS_WS_URL!);
      const timeout = setTimeout(() => {
        ws.close();
        resolve({ status: 'unhealthy', error: 'Connection timeout' });
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve({ status: 'healthy' });
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        resolve({ status: 'unhealthy', error: 'Connection failed' });
      };
    });
  },
};
```

### Troubleshooting Guide

#### Common Issues

**WebSocket Connection Issues**
```typescript
// Check network connectivity
const testConnection = async () => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL!);
    return response.ok;
  } catch {
    return false;
  }
};
```

**API Rate Limiting**
```typescript
// Implement exponential backoff
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};
```

**Contract Call Failures**
```typescript
// Debug contract calls
const debugContractCall = async (
  address: string,
  method: string,
  args: any[]
) => {
  console.log('Calling contract:', {
    address,
    method,
    args,
    network: 'Base Sepolia',
    timestamp: new Date().toISOString(),
  });

  try {
    const result = await multibaasClient.callContract(address, 'ContractLabel', method, args);
    console.log('Contract call successful:', result);
    return result;
  } catch (error) {
    console.error('Contract call failed:', {
      error: error.message,
      address,
      method,
      args,
    });
    throw error;
  }
};
```

---

## 📞 Support & Resources

### Documentation Links
- **[MultiBaas Docs](https://docs.curvegrid.com/)**: Official API documentation
- **[RainbowKit Docs](https://www.rainbowkit.com/)**: Wallet integration guide
- **[Wagmi Docs](https://wagmi.sh/)**: React hooks for Ethereum
- **[Base Docs](https://docs.base.org/)**: Network-specific information

### Development Resources
- **[Echain Contracts](../contracts/README.md)**: Smart contract documentation
- **[API Reference](../api/README.md)**: REST API endpoints
- **[Testing Guide](../testing/README.md)**: Comprehensive testing strategies

### Community Support
- **Discord**: Join our developer community
- **GitHub Issues**: Report bugs and request features
- **Documentation PRs**: Contribute to our docs

---

**This integration documentation provides the complete technical foundation for connecting all Echain platform components, ensuring reliable, secure, and performant blockchain interactions.**

<div align="center">

[![MultiBaas](https://img.shields.io/badge/Curvegrid_MultiBaas-Integrated-00AEEF?style=for-the-badge&logo=api&logoColor=white)](https://docs.curvegrid.com/)
[![RainbowKit](https://img.shields.io/badge/RainbowKit-Connected-7B3FE4?style=for-the-badge&logo=walletconnect&logoColor=white)](https://www.rainbowkit.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Streaming-010101?style=for-the-badge&logo=websocket&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![Base Sepolia](https://img.shields.io/badge/Base-Sepolia-Deployed-0052FF?style=for-the-badge&logo=ethereum&logoColor=white)](https://sepolia.basescan.org/)

</div></content>
<parameter name="filePath">e:\Polymath Universata\Projects\Echain\docs\integration\README.md