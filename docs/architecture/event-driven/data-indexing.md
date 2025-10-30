# 📊 Data Indexing Integration

<div align="center">

![The Graph](https://img.shields.io/badge/The_Graph-Protocol-6747ED?style=for-the-badge&logo=thegraph&logoColor=white)
![Covalent](https://img.shields.io/badge/Covalent-API-00D4FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjIwQzE0IDIxLjEgMTMuMSAyMiAxMiAyMkMxMC45IDIyIDEwIDIxLjEgMTAgMjBWMTRDMTAgMi45IDEwLjkgMiAxMiAyWk0xMiA1QzEwLjkgNSA5LjEgOSA5VjE5QzkgMjAuMSAxMC45IDIxIDEyIDIxQzEzLjEgMjEgMTQgMjAuMSAxNCAxOVY5QzE0IDguOSA5LjEgOCA5IDVDOSA0LjkgOS45IDUgMTIgNVoiIGZpbGw9IiMwMEQ0RkYiLz4KPC9zdmc+Cg==)
![Chainstack](https://img.shields.io/badge/Chainstack-Web3-0052FF?style=for-the-badge&logo=ethereum&logoColor=white)

**Replace RPC Calls: Fast, Cached Blockchain Data Access**

*Eliminate direct smart contract reads with indexed queries and optimized node access.*

[📋 Overview](#-overview) • [🔗 The Graph](#-the-graph) • [📈 Covalent](#-covalent) • [⚡ Chainstack](#-chainstack) • [🚀 Implementation](#-implementation)

</div>

---

## 🎯 Overview

Data indexing replaces expensive, slow direct RPC calls to smart contracts with fast, cached database queries. This architecture provides:

- **🚫 No Direct RPC Calls**: Replace contract reads with indexed data
- **⚡ Sub-Second Queries**: Fast data retrieval from optimized databases
- **📊 Rich Analytics**: Cross-chain data aggregation and insights
- **🔄 Auto-Sync**: Automatic data synchronization with blockchain state
- **🗄️ Smart Caching**: Multi-layer caching for optimal performance

### Performance Comparison

| Method | Response Time | Cost per Query | Reliability | Use Case |
|--------|---------------|----------------|-------------|----------|
| **Direct RPC** | 2-10 seconds | High | Low (rate limits) | ❌ Avoid |
| **The Graph** | <200ms | Low | High (decentralized) | Complex queries |
| **Covalent** | <500ms | Medium | High (centralized) | Cross-chain data |
| **Chainstack** | <100ms | Medium | High (optimized nodes) | Fast RPC calls |

---

## 🔗 The Graph Integration

### Subgraph Architecture

**Purpose**: Decentralized indexing for complex queries and relationships.

#### Schema Design

```graphql
# subgraph/schema.graphql
type Event @entity {
  id: ID!
  creator: Bytes!
  title: String!
  description: String!
  startTime: BigInt!
  endTime: BigInt!
  maxTickets: BigInt!
  ticketPrice: BigInt!
  ticketsSold: BigInt!
  revenue: BigInt!
  status: String!
  category: String!
  location: String
  imageUrl: String
  createdAt: BigInt!
  updatedAt: BigInt!

  # Derived fields
  tickets: [Ticket!]! @derivedFrom(field: "event")
  transactions: [Transaction!]! @derivedFrom(field: "event")
}

type Ticket @entity {
  id: ID!
  event: Event!
  tokenId: BigInt!
  owner: Bytes!
  originalOwner: Bytes!
  ticketType: String!
  price: BigInt!
  purchasePrice: BigInt!
  isUsed: Boolean!
  usedAt: BigInt
  createdAt: BigInt!
  updatedAt: BigInt!

  # Relationships
  transfers: [Transfer!]! @derivedFrom(field: "ticket")
}

type Transfer @entity {
  id: ID!
  ticket: Ticket!
  from: Bytes!
  to: Bytes!
  transactionHash: Bytes!
  blockNumber: BigInt!
  timestamp: BigInt!
}

type Transaction @entity {
  id: ID!
  event: Event
  ticket: Ticket
  from: Bytes!
  to: Bytes!
  value: BigInt!
  transactionType: String!
  gasUsed: BigInt!
  gasPrice: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
}
```

#### Event Handlers

```typescript
// subgraph/src/event-factory.ts
import { EventCreated, EventUpdated, TicketPurchased } from '../generated/EventFactory/EventFactory';
import { Event, Ticket, Transaction } from '../generated/schema';

export function handleEventCreated(event: EventCreated): void {
  let eventEntity = new Event(event.params.eventId.toString());

  eventEntity.creator = event.params.creator;
  eventEntity.title = event.params.title;
  eventEntity.description = event.params.description;
  eventEntity.startTime = event.params.startTime;
  eventEntity.endTime = event.params.endTime;
  eventEntity.maxTickets = event.params.maxTickets;
  eventEntity.ticketPrice = event.params.ticketPrice;
  eventEntity.ticketsSold = new BigInt(0);
  eventEntity.revenue = new BigInt(0);
  eventEntity.status = 'active';
  eventEntity.createdAt = event.block.timestamp;
  eventEntity.updatedAt = event.block.timestamp;

  eventEntity.save();
}

export function handleTicketPurchased(event: TicketPurchased): void {
  // Update event statistics
  let eventEntity = Event.load(event.params.eventId.toString());
  if (eventEntity) {
    eventEntity.ticketsSold = eventEntity.ticketsSold.plus(new BigInt(1));
    eventEntity.revenue = eventEntity.revenue.plus(event.params.price);
    eventEntity.save();
  }

  // Create ticket entity
  let ticket = new Ticket(event.params.ticketId.toString());
  ticket.event = event.params.eventId.toString();
  ticket.tokenId = event.params.ticketId;
  ticket.owner = event.params.buyer;
  ticket.originalOwner = event.params.buyer;
  ticket.ticketType = 'standard';
  ticket.price = event.params.price;
  ticket.purchasePrice = event.params.price;
  ticket.isUsed = false;
  ticket.createdAt = event.block.timestamp;
  ticket.updatedAt = event.block.timestamp;

  ticket.save();

  // Create transaction record
  let transaction = new Transaction(event.transaction.hash.toHexString());
  transaction.event = event.params.eventId.toString();
  transaction.ticket = event.params.ticketId.toString();
  transaction.from = event.params.seller;
  transaction.to = event.params.buyer;
  transaction.value = event.params.price;
  transaction.transactionType = 'ticket_purchase';
  transaction.gasUsed = event.transaction.gasUsed;
  transaction.gasPrice = event.transaction.gasPrice;
  transaction.timestamp = event.block.timestamp;
  transaction.blockNumber = event.block.number;

  transaction.save();
}
```

#### Query Implementation

```typescript
// lib/queries/thegraph.ts
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.THE_GRAPH_ENDPOINT,
  cache: new InMemoryCache({
    typePolicies: {
      Event: {
        fields: {
          tickets: {
            merge(existing, incoming) {
              return incoming;
            }
          }
        }
      }
    }
  })
});

// Event queries
export const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    event(id: $id) {
      id
      creator
      title
      description
      startTime
      endTime
      maxTickets
      ticketPrice
      ticketsSold
      revenue
      status
      category
      location
      imageUrl
      createdAt
      updatedAt
      tickets {
        id
        tokenId
        owner
        ticketType
        price
        isUsed
      }
    }
  }
`;

export const GET_EVENTS = gql`
  query GetEvents(
    $first: Int = 10,
    $skip: Int = 0,
    $orderBy: Event_orderBy = createdAt,
    $orderDirection: OrderDirection = desc,
    $where: Event_filter
  ) {
    events(
      first: $first,
      skip: $skip,
      orderBy: $orderBy,
      orderDirection: $orderDirection,
      where: $where
    ) {
      id
      title
      description
      startTime
      endTime
      ticketPrice
      ticketsSold
      maxTickets
      category
      location
      imageUrl
      createdAt
    }
  }
`;

// Ticket queries
export const GET_USER_TICKETS = gql`
  query GetUserTickets($owner: Bytes!, $first: Int = 50) {
    tickets(where: { owner: $owner }, first: $first, orderBy: createdAt, orderDirection: desc) {
      id
      tokenId
      owner
      ticketType
      price
      isUsed
      usedAt
      createdAt
      event {
        id
        title
        description
        startTime
        endTime
        location
        imageUrl
      }
      transfers {
        id
        from
        to
        timestamp
      }
    }
  }
`;

export const GET_EVENT_TICKETS = gql`
  query GetEventTickets($eventId: ID!, $first: Int = 100) {
    tickets(where: { event: $eventId }, first: $first, orderBy: createdAt) {
      id
      tokenId
      owner
      ticketType
      price
      isUsed
      createdAt
    }
  }
`;

// Analytics queries
export const GET_EVENT_ANALYTICS = gql`
  query GetEventAnalytics($eventId: ID!) {
    event(id: $eventId) {
      id
      ticketsSold
      revenue
      tickets {
        id
        price
        createdAt
        transfers {
          id
          timestamp
        }
      }
      transactions {
        id
        value
        transactionType
        timestamp
      }
    }
  }
`;

// Query functions
export async function getEvent(eventId: string) {
  try {
    const { data } = await client.query({
      query: GET_EVENT,
      variables: { id: eventId }
    });

    return data.event;
  } catch (error) {
    console.error('Error fetching event from The Graph:', error);
    throw error;
  }
}

export async function getEvents(options: {
  first?: number;
  skip?: number;
  category?: string;
  status?: string;
  creator?: string;
} = {}) {
  try {
    const where: any = {};
    if (options.category) where.category = options.category;
    if (options.status) where.status = options.status;
    if (options.creator) where.creator = options.creator;

    const { data } = await client.query({
      query: GET_EVENTS,
      variables: {
        first: options.first || 10,
        skip: options.skip || 0,
        where
      }
    });

    return data.events;
  } catch (error) {
    console.error('Error fetching events from The Graph:', error);
    throw error;
  }
}

export async function getUserTickets(owner: string) {
  try {
    const { data } = await client.query({
      query: GET_USER_TICKETS,
      variables: { owner }
    });

    return data.tickets;
  } catch (error) {
    console.error('Error fetching user tickets from The Graph:', error);
    throw error;
  }
}

export async function getEventAnalytics(eventId: string) {
  try {
    const { data } = await client.query({
      query: GET_EVENT_ANALYTICS,
      variables: { id: eventId }
    });

    return data.event;
  } catch (error) {
    console.error('Error fetching event analytics from The Graph:', error);
    throw error;
  }
}
```

---

## 📈 Covalent Integration

### Cross-Chain Data Access

**Purpose**: Unified API for multi-chain data with rich analytics and historical data.

#### Configuration

```typescript
// lib/config/covalent.ts
export const covalentConfig = {
  apiKey: process.env.COVALENT_API_KEY,
  baseUrl: 'https://api.covalenthq.com/v1',
  chains: {
    base: 8453,
    ethereum: 1,
    polygon: 137,
    arbitrum: 42161
  },
  rateLimits: {
    requestsPerSecond: 5,
    requestsPerMinute: 300
  }
};
```

#### Client Implementation

```typescript
// lib/covalent/client.ts
import { CovalentClient } from '@covalenthq/client-sdk';

export class CovalentService {
  private client: CovalentClient;

  constructor(apiKey: string) {
    this.client = new CovalentClient(apiKey);
  }

  // Transaction history
  async getTransactionHistory(
    chainId: number,
    address: string,
    options: {
      pageSize?: number;
      pageNumber?: number;
      blockSignedAtAsc?: boolean;
      noLogs?: boolean;
    } = {}
  ) {
    try {
      const response = await this.client.TransactionService.getAllTransactionsForAddress(
        chainId.toString(),
        address,
        {
          pageSize: options.pageSize || 100,
          pageNumber: options.pageNumber || 0,
          blockSignedAtAsc: options.blockSignedAtAsc || false,
          noLogs: options.noLogs || false
        }
      );

      return response.data.transactions;
    } catch (error) {
      console.error('Covalent transaction history error:', error);
      throw error;
    }
  }

  // Token balances
  async getTokenBalances(
    chainId: number,
    address: string,
    options: {
      nft?: boolean;
      noNftFetch?: boolean;
    } = {}
  ) {
    try {
      const response = await this.client.BalanceService.getTokenBalancesForWalletAddress(
        chainId.toString(),
        address,
        {
          nft: options.nft || false,
          noNftFetch: options.noNftFetch || false
        }
      );

      return response.data.items;
    } catch (error) {
      console.error('Covalent token balances error:', error);
      throw error;
    }
  }

  // NFT metadata
  async getNFTMetadata(
    chainId: number,
    contractAddress: string,
    tokenId: string
  ) {
    try {
      const response = await this.client.NftService.getNftMetadataForGivenContractAddressNftId(
        chainId.toString(),
        contractAddress,
        tokenId
      );

      return response.data.items[0];
    } catch (error) {
      console.error('Covalent NFT metadata error:', error);
      throw error;
    }
  }

  // Contract logs
  async getContractLogs(
    chainId: number,
    contractAddress: string,
    options: {
      startingBlock?: number;
      endingBlock?: number;
      pageSize?: number;
    } = {}
  ) {
    try {
      const response = await this.client.BaseService.getLogEventsByContractAddress(
        chainId.toString(),
        contractAddress,
        {
          startingBlock: options.startingBlock,
          endingBlock: options.endingBlock,
          pageSize: options.pageSize || 1000
        }
      );

      return response.data.items;
    } catch (error) {
      console.error('Covalent contract logs error:', error);
      throw error;
    }
  }

  // Block height
  async getBlockHeight(chainId: number) {
    try {
      const response = await this.client.BaseService.getBlockHeight(
        chainId.toString()
      );

      return response.data.items[0].height;
    } catch (error) {
      console.error('Covalent block height error:', error);
      throw error;
    }
  }
}
```

#### Analytics Queries

```typescript
// lib/covalent/analytics.ts
import { CovalentService } from './client';

export class CovalentAnalytics {
  constructor(private covalent: CovalentService) {}

  // Portfolio analytics
  async getPortfolioAnalytics(address: string, chainIds: number[] = [8453, 1, 137]) {
    const portfolios = await Promise.all(
      chainIds.map(chainId => this.covalent.getTokenBalances(chainId, address))
    );

    return {
      totalValue: this.calculateTotalValue(portfolios),
      assets: this.aggregateAssets(portfolios),
      chains: chainIds,
      lastUpdated: new Date().toISOString()
    };
  }

  // Transaction analytics
  async getTransactionAnalytics(
    address: string,
    chainId: number,
    days: number = 30
  ) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const transactions = await this.covalent.getTransactionHistory(chainId, address, {
      pageSize: 1000
    });

    const filteredTxs = transactions.filter(tx =>
      new Date(tx.block_signed_at) >= startDate
    );

    return {
      totalTransactions: filteredTxs.length,
      totalVolume: this.calculateTransactionVolume(filteredTxs),
      averageTransaction: this.calculateAverageTransaction(filteredTxs),
      transactionTypes: this.categorizeTransactions(filteredTxs),
      period: { start: startDate, end: endDate }
    };
  }

  // NFT portfolio
  async getNFTPortfolio(address: string, chainIds: number[] = [8453, 1, 137]) {
    const nftBalances = await Promise.all(
      chainIds.map(chainId =>
        this.covalent.getTokenBalances(chainId, address, { nft: true })
      )
    );

    const nfts = nftBalances.flat().filter(token => token.type === 'nft');

    // Enrich with metadata
    const enrichedNFTs = await Promise.all(
      nfts.map(async (nft) => {
        try {
          const metadata = await this.covalent.getNFTMetadata(
            parseInt(nft.contract_address),
            nft.contract_ticker_symbol // This might need adjustment based on Covalent API
          );
          return { ...nft, metadata };
        } catch (error) {
          return nft;
        }
      })
    );

    return {
      totalNFTs: enrichedNFTs.length,
      collections: this.groupByCollection(enrichedNFTs),
      floorPrices: await this.getFloorPrices(enrichedNFTs),
      lastUpdated: new Date().toISOString()
    };
  }

  private calculateTotalValue(portfolios: any[]): number {
    return portfolios.flat().reduce((total, token) => {
      return total + (parseFloat(token.quote || '0') * parseFloat(token.balance || '0'));
    }, 0);
  }

  private aggregateAssets(portfolios: any[]): any[] {
    const assetMap = new Map();

    portfolios.flat().forEach(token => {
      const key = `${token.contract_address}-${token.contract_ticker_symbol}`;
      if (assetMap.has(key)) {
        const existing = assetMap.get(key);
        existing.balance = (parseFloat(existing.balance) + parseFloat(token.balance || '0')).toString();
      } else {
        assetMap.set(key, { ...token });
      }
    });

    return Array.from(assetMap.values());
  }

  private calculateTransactionVolume(transactions: any[]): number {
    return transactions.reduce((total, tx) => {
      return total + parseFloat(tx.value || '0');
    }, 0);
  }

  private calculateAverageTransaction(transactions: any[]): number {
    if (transactions.length === 0) return 0;
    return this.calculateTransactionVolume(transactions) / transactions.length;
  }

  private categorizeTransactions(transactions: any[]): Record<string, number> {
    const categories: Record<string, number> = {};

    transactions.forEach(tx => {
      const category = this.categorizeTransaction(tx);
      categories[category] = (categories[category] || 0) + 1;
    });

    return categories;
  }

  private categorizeTransaction(tx: any): string {
    // Simple categorization logic
    if (tx.to === tx.from) return 'self';
    if (tx.value && parseFloat(tx.value) > 0) return 'transfer';
    if (tx.log_events?.length > 0) return 'contract_interaction';
    return 'other';
  }

  private groupByCollection(nfts: any[]): Record<string, any[]> {
    const collections: Record<string, any[]> = {};

    nfts.forEach(nft => {
      const collection = nft.contract_name || nft.contract_address;
      if (!collections[collection]) {
        collections[collection] = [];
      }
      collections[collection].push(nft);
    });

    return collections;
  }

  private async getFloorPrices(nfts: any[]): Promise<Record<string, number>> {
    // This would integrate with additional NFT marketplace APIs
    // For now, return placeholder
    const floorPrices: Record<string, number> = {};

    // In a real implementation, you'd fetch from OpenSea, LooksRare, etc.
    for (const nft of nfts) {
      const collection = nft.contract_name || nft.contract_address;
      if (!floorPrices[collection]) {
        floorPrices[collection] = Math.random() * 10; // Placeholder
      }
    }

    return floorPrices;
  }
}
```

---

## ⚡ Chainstack Integration

### Optimized Node Access

**Purpose**: High-performance RPC node with advanced features and analytics.

#### Configuration

```typescript
// lib/config/chainstack.ts
export const chainstackConfig = {
  base: {
    mainnet: {
      https: process.env.CHAINSTACK_BASE_MAINNET_HTTPS,
      wss: process.env.CHAINSTACK_BASE_MAINNET_WSS
    },
    sepolia: {
      https: process.env.CHAINSTACK_BASE_SEPOLIA_HTTPS,
      wss: process.env.CHAINSTACK_BASE_SEPOLIA_WSS
    }
  },
  features: {
    archive: true,
    tracing: true,
    debug: true
  },
  rateLimits: {
    requestsPerSecond: 100,
    concurrentRequests: 50
  }
};
```

#### Client Implementation

```typescript
// lib/chainstack/client.ts
import { ethers } from 'ethers';
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers';

export class ChainstackService {
  private httpProvider: JsonRpcProvider;
  private wsProvider: WebSocketProvider;
  private requestQueue: Map<string, { resolve: Function; reject: Function }> = new Map();

  constructor(network: 'mainnet' | 'sepolia' = 'sepolia') {
    const config = chainstackConfig.base[network];

    // HTTP provider for regular RPC calls
    this.httpProvider = new ethers.providers.JsonRpcProvider(config.https);

    // WebSocket provider for real-time updates
    this.wsProvider = new ethers.providers.WebSocketProvider(config.wss);

    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners() {
    this.wsProvider.on('block', (blockNumber) => {
      console.log('New block:', blockNumber);
      // Handle new block events
    });

    this.wsProvider.on('error', (error) => {
      console.error('WebSocket error:', error);
      // Handle reconnection logic
    });

    this.wsProvider.on('close', () => {
      console.log('WebSocket closed, attempting reconnection...');
      setTimeout(() => this.reconnect(), 5000);
    });
  }

  private async reconnect() {
    try {
      await this.wsProvider.connect();
      console.log('WebSocket reconnected');
    } catch (error) {
      console.error('WebSocket reconnection failed:', error);
    }
  }

  // Optimized contract calls with caching
  async callContract(
    contractAddress: string,
    abi: any[],
    method: string,
    params: any[] = [],
    options: {
      blockTag?: string | number;
      cache?: boolean;
      ttl?: number;
    } = {}
  ) {
    const cacheKey = `contract:${contractAddress}:${method}:${JSON.stringify(params)}`;

    // Check cache first
    if (options.cache) {
      const cached = await this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const contract = new ethers.Contract(contractAddress, abi, this.httpProvider);
      const result = await contract[method](...params, { blockTag: options.blockTag });

      // Cache the result
      if (options.cache) {
        await this.setCache(cacheKey, result, options.ttl || 300);
      }

      return result;
    } catch (error) {
      console.error(`Contract call error (${method}):`, error);
      throw error;
    }
  }

  // Batch multiple calls for efficiency
  async batchCall(calls: Array<{
    contractAddress: string;
    abi: any[];
    method: string;
    params?: any[];
  }>) {
    const batch = calls.map(call => ({
      id: Math.random().toString(36),
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{
        to: call.contractAddress,
        data: this.encodeFunctionData(call.abi, call.method, call.params || [])
      }, 'latest']
    }));

    try {
      const responses = await this.sendBatch(batch);
      return responses.map((response: any, index: number) => {
        if (response.error) throw response.error;
        return this.decodeResult(calls[index].abi, calls[index].method, response.result);
      });
    } catch (error) {
      console.error('Batch call error:', error);
      throw error;
    }
  }

  // Subscribe to contract events
  subscribeToEvents(
    contractAddress: string,
    abi: any[],
    eventName: string,
    callback: (event: any) => void
  ) {
    const contract = new ethers.Contract(contractAddress, abi, this.wsProvider);

    contract.on(eventName, (...args) => {
      const event = args[args.length - 1]; // Last argument is the event object
      callback({
        eventName,
        args: args.slice(0, -1),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.logIndex
      });
    });

    return () => {
      contract.removeAllListeners(eventName);
    };
  }

  // Get transaction receipt with retry logic
  async getTransactionReceipt(txHash: string, retries: number = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const receipt = await this.httpProvider.getTransactionReceipt(txHash);
        if (receipt) return receipt;

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
      } catch (error) {
        console.error(`Transaction receipt attempt ${i + 1} failed:`, error);
      }
    }

    throw new Error(`Failed to get transaction receipt after ${retries} attempts`);
  }

  // Get gas price with fallback
  async getGasPrice(): Promise<ethers.BigNumber> {
    try {
      return await this.httpProvider.getGasPrice();
    } catch (error) {
      // Fallback to manual estimation
      console.warn('Gas price estimation failed, using fallback');
      return ethers.utils.parseUnits('50', 'gwei');
    }
  }

  // Estimate gas with safety margin
  async estimateGas(tx: any): Promise<ethers.BigNumber> {
    try {
      const estimate = await this.httpProvider.estimateGas(tx);
      // Add 20% safety margin
      return estimate.mul(120).div(100);
    } catch (error) {
      console.error('Gas estimation failed:', error);
      // Fallback estimate
      return ethers.BigNumber.from(200000);
    }
  }

  private encodeFunctionData(abi: any[], method: string, params: any[]): string {
    const iface = new ethers.utils.Interface(abi);
    return iface.encodeFunctionData(method, params);
  }

  private decodeResult(abi: any[], method: string, data: string): any {
    const iface = new ethers.utils.Interface(abi);
    return iface.decodeFunctionResult(method, data);
  }

  private async sendBatch(batch: any[]): Promise<any[]> {
    const response = await this.httpProvider.send('eth_batch', [batch]);
    return response;
  }

  private async getCache(key: string): Promise<any> {
    // Implement Redis cache lookup
    return null; // Placeholder
  }

  private async setCache(key: string, value: any, ttl: number): Promise<void> {
    // Implement Redis cache storage
  }
}
```

---

## 🚀 Implementation

### Data Access Layer

```typescript
// lib/data/index.ts
import { getEvent as getEventFromGraph } from '@/lib/queries/thegraph';
import { CovalentService } from '@/lib/covalent/client';
import { ChainstackService } from '@/lib/chainstack/client';

export class DataAccessLayer {
  private graphEnabled: boolean;
  private covalentEnabled: boolean;
  private chainstackEnabled: boolean;

  constructor() {
    this.graphEnabled = !!process.env.THE_GRAPH_ENDPOINT;
    this.covalentEnabled = !!process.env.COVALENT_API_KEY;
    this.chainstackEnabled = !!process.env.CHAINSTACK_BASE_SEPOLIA_HTTPS;
  }

  // Primary data access - try indexed data first, fallback to RPC
  async getEvent(eventId: string) {
    // Try The Graph first (fastest for complex queries)
    if (this.graphEnabled) {
      try {
        const event = await getEventFromGraph(eventId);
        if (event) return this.enrichEventData(event, 'graph');
      } catch (error) {
        console.warn('The Graph query failed:', error);
      }
    }

    // Fallback to Chainstack RPC
    if (this.chainstackEnabled) {
      try {
        const chainstack = new ChainstackService();
        const event = await this.getEventFromChain(eventId, chainstack);
        return this.enrichEventData(event, 'chainstack');
      } catch (error) {
        console.warn('Chainstack query failed:', error);
      }
    }

    throw new Error('All data sources failed');
  }

  // Analytics data - use Covalent for cross-chain insights
  async getUserAnalytics(userAddress: string) {
    if (!this.covalentEnabled) {
      throw new Error('Covalent not configured');
    }

    const covalent = new CovalentService(process.env.COVALENT_API_KEY!);

    const [portfolio, transactions] = await Promise.all([
      covalent.getTokenBalances(8453, userAddress), // Base
      covalent.getTransactionHistory(8453, userAddress, { pageSize: 100 })
    ]);

    return {
      portfolio: this.processPortfolioData(portfolio),
      transactions: this.processTransactionData(transactions),
      lastUpdated: new Date().toISOString()
    };
  }

  // Real-time data - use WebSocket subscriptions
  subscribeToEventUpdates(eventId: string, callback: (update: any) => void) {
    if (!this.chainstackEnabled) {
      throw new Error('Chainstack not configured for real-time updates');
    }

    const chainstack = new ChainstackService();

    // Subscribe to Transfer events for tickets
    const unsubscribeTransfer = chainstack.subscribeToEvents(
      process.env.EVENT_CONTRACT_ADDRESS!,
      EVENT_ABI,
      'Transfer',
      (event) => {
        if (this.isEventTicket(event.args.tokenId, eventId)) {
          callback({
            type: 'ticket_transfer',
            ticketId: event.args.tokenId.toString(),
            from: event.args.from,
            to: event.args.to,
            transactionHash: event.transactionHash
          });
        }
      }
    );

    // Subscribe to event-specific contract events
    const unsubscribePurchase = chainstack.subscribeToEvents(
      process.env.EVENT_CONTRACT_ADDRESS!,
      EVENT_ABI,
      'TicketPurchased',
      (event) => {
        if (event.args.eventId.toString() === eventId) {
          callback({
            type: 'ticket_purchased',
            eventId,
            ticketId: event.args.ticketId.toString(),
            buyer: event.args.buyer,
            price: event.args.price.toString()
          });
        }
      }
    );

    return () => {
      unsubscribeTransfer();
      unsubscribePurchase();
    };
  }

  private async getEventFromChain(eventId: string, chainstack: ChainstackService) {
    // Direct contract calls as fallback
    const eventData = await chainstack.callContract(
      process.env.EVENT_CONTRACT_ADDRESS!,
      EVENT_ABI,
      'getEvent',
      [eventId],
      { cache: true, ttl: 60 }
    );

    return {
      id: eventId,
      creator: eventData.creator,
      title: eventData.title,
      description: eventData.description,
      startTime: eventData.startTime.toString(),
      endTime: eventData.endTime.toString(),
      maxTickets: eventData.maxTickets.toString(),
      ticketPrice: eventData.ticketPrice.toString(),
      ticketsSold: eventData.ticketsSold.toString()
    };
  }

  private enrichEventData(event: any, source: string) {
    return {
      ...event,
      _metadata: {
        source,
        fetchedAt: new Date().toISOString(),
        ttl: source === 'graph' ? 300 : 60 // 5 min for Graph, 1 min for RPC
      }
    };
  }

  private processPortfolioData(portfolio: any[]) {
    return portfolio.map(token => ({
      contractAddress: token.contract_address,
      symbol: token.contract_ticker_symbol,
      name: token.contract_name,
      balance: token.balance,
      decimals: token.contract_decimals,
      quote: token.quote,
      quoteRate: token.quote_rate,
      logo: token.logo_url
    }));
  }

  private processTransactionData(transactions: any[]) {
    return transactions.map(tx => ({
      hash: tx.tx_hash,
      blockHeight: tx.block_height,
      timestamp: tx.block_signed_at,
      from: tx.from_address,
      to: tx.to_address,
      value: tx.value,
      gasSpent: tx.gas_spent,
      gasPrice: tx.gas_price,
      successful: tx.successful,
      logs: tx.log_events?.map((log: any) => ({
        address: log.sender_address,
        topics: log.raw_log_topics,
        data: log.raw_log_data
      }))
    }));
  }

  private isEventTicket(tokenId: any, eventId: string): boolean {
    // Implement logic to check if token belongs to event
    // This might require additional contract calls or cached mappings
    return true; // Placeholder
  }
}
```

### Frontend Integration

```typescript
// hooks/useEventData.ts
import { useQuery } from '@tanstack/react-query';
import { DataAccessLayer } from '@/lib/data';
import { useWebSocket } from './useWebSocket';

const dataLayer = new DataAccessLayer();

export function useEventData(eventId: string) {
  // WebSocket for real-time updates
  useWebSocket(eventId);

  // Query with smart caching
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => dataLayer.getEvent(eventId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
}

// Analytics hook
export function useUserAnalytics(userAddress: string) {
  return useQuery({
    queryKey: ['user-analytics', userAddress],
    queryFn: () => dataLayer.getUserAnalytics(userAddress),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!userAddress
  });
}

// Real-time subscription hook
export function useEventSubscription(eventId: string) {
  return useQuery({
    queryKey: ['event-subscription', eventId],
    queryFn: () => {
      return new Promise(() => {}); // Never resolves, keeps subscription active
    },
    enabled: false, // Manual control
    onMount: () => {
      const unsubscribe = dataLayer.subscribeToEventUpdates(eventId, (update) => {
        // Handle real-time updates
        queryClient.invalidateQueries(['event', eventId]);
      });

      return unsubscribe;
    }
  });
}
```

### Performance Monitoring

```typescript
// lib/monitoring/data-performance.ts
export class DataPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  recordQueryTime(source: string, queryType: string, duration: number) {
    const key = `${source}-${queryType}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const times = this.metrics.get(key)!;
    times.push(duration);

    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }

  getAverageQueryTime(source: string, queryType: string): number {
    const key = `${source}-${queryType}`;
    const times = this.metrics.get(key) || [];
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  getQuerySuccessRate(source: string, queryType: string): number {
    // Implement success/failure tracking
    return 0.95; // Placeholder
  }

  getPerformanceReport() {
    return {
      theGraph: {
        eventQuery: this.getAverageQueryTime('graph', 'event'),
        ticketQuery: this.getAverageQueryTime('graph', 'tickets'),
        successRate: this.getQuerySuccessRate('graph', 'all')
      },
      covalent: {
        balanceQuery: this.getAverageQueryTime('covalent', 'balances'),
        transactionQuery: this.getAverageQueryTime('covalent', 'transactions'),
        successRate: this.getQuerySuccessRate('covalent', 'all')
      },
      chainstack: {
        contractCall: this.getAverageQueryTime('chainstack', 'contract'),
        batchCall: this.getAverageQueryTime('chainstack', 'batch'),
        successRate: this.getQuerySuccessRate('chainstack', 'all')
      }
    };
  }
}
```

---

## 📋 Best Practices

### Query Optimization

1. **Use indexed fields** in The Graph queries for fast lookups
2. **Implement pagination** for large result sets
3. **Cache frequently accessed data** with appropriate TTL
4. **Batch multiple queries** when possible
5. **Use specific filters** to reduce data transfer

### Error Handling

1. **Implement fallback chains** (Graph → Covalent → Chainstack → RPC)
2. **Set appropriate timeouts** for different query types
3. **Handle rate limits** gracefully with exponential backoff
4. **Cache error responses** temporarily to prevent repeated failures
5. **Log all errors** with context for debugging

### Cost Optimization

1. **Choose the right service** for each use case:
   - The Graph: Complex queries, relationships
   - Covalent: Cross-chain analytics, historical data
   - Chainstack: Fast RPC calls, real-time subscriptions
2. **Implement query result caching** to reduce API calls
3. **Use batch operations** when available
4. **Monitor usage** and set up alerts for cost spikes
5. **Optimize query frequency** based on data freshness requirements

### Data Consistency

1. **Implement data validation** across different sources
2. **Use checksums** to detect data corruption
3. **Handle blockchain reorgs** appropriately
4. **Implement data refresh** strategies for stale data
5. **Maintain data lineage** for audit trails

---

<div align="center">

**📊 Data Indexing - Fast, Cached Blockchain Data Access**

[🔗 The Graph](#-the-graph) • [📈 Covalent](#-covalent) • [⚡ Chainstack](#-chainstack) • [🚀 Implementation](#-implementation)

*Replace expensive RPC calls with indexed queries for instant data retrieval*

</div>