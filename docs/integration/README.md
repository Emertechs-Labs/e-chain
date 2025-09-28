# 🔗 MultiBaas Integration Guide

This guide covers the integration of Curvegrid MultiBaas into the Echain frontend for real-time blockchain data access and contract interactions.

## 📋 Overview

Echain uses Curvegrid MultiBaas as its blockchain abstraction layer, providing:
- REST API access to smart contract functions
- Real-time event monitoring
- Secure API key authentication
- Multi-chain support (currently Base Sepolia testnet)

## 🏗️ Architecture

### Integration Layers

```
Frontend (Next.js + TypeScript)
    ↓
MultiBaas SDK (@curvegrid/multibaas-sdk)
    ↓
MultiBaas API (REST/WebSocket)
    ↓
Blockchain (Base Sepolia)
```

### Key Components

- **MultiBaas SDK**: TypeScript client for API interactions
- **Contract Hooks**: React hooks for blockchain data fetching
- **Type Safety**: Full TypeScript integration with contract ABIs
- **Error Handling**: Graceful fallbacks to mock data

## 🔧 Setup & Configuration

### Environment Variables

Add these to your `.env.development` file:

```env
# Reown (WalletConnect) - Use a valid project ID or fallback for development
NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=demo-project-id-for-development

# MultiBaas Configuration
NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL=https://kwp44rxeifggriyd4hmbjq7dey.multibaas.com
NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU5MDUzNzQxLCJqdGkiOiI3ZmJhM2ZmZS03Y2NhLTRlM2ItODY2Ni00MTJmMDIwMmM0NjkifQ.5xoeq2EUzDE-NNC0R_mrMtQVAG2xWfDRoRz3RNkf_OY
NEXT_PUBLIC_MULTIBAAS_WEB3_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU5MDUzNDYxLCJqdGkiOiJkMDdhZTRjNC00OGQ0LTQ2NDItOTFmOC1iYmRjYjZhMWNkZDQifQ.FBsSW78nyYR_kWSmWYYW3iMqpCozu4L2SFl36Al_gr0

# Network Configuration
NEXT_PUBLIC_MULTIBAAS_CHAIN_ID=84532

# Contract Labels (for MultiBaas)
NEXT_PUBLIC_MULTIBAAS_EVENT_FACTORY_LABEL=event_factory
NEXT_PUBLIC_MULTIBAAS_EVENT_FACTORY_ADDRESS=event_factory

# Contract Addresses (Base Sepolia)
NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=0xbE36039Bfe7f48604F73daD61411459B17fd2e85
NEXT_PUBLIC_EVENT_TICKET_ADDRESS=0x127b53D8f29DcDe4DDfcCb24ad8b88B515D08180
NEXT_PUBLIC_POAP_ADDRESS=0x405061e2ef1F748fA95A1e7725fc1a008e8c2196
NEXT_PUBLIC_INCENTIVE_ADDRESS=0x8290c12f874DF9D03FDadAbE10C7c6321B69Ded9
```

### API Key Setup

1. **Login to MultiBaas**: Access your deployment dashboard
2. **Navigate to API Keys**: Admin → API Keys
3. **Create DApp User Key**:
   - Group: "DApp Users"
   - Permissions: Read access to contracts and events
4. **Copy API Key**: Use in environment variables

## 📚 SDK Integration

### Installation

```bash
npm install @curvegrid/multibaas-sdk
```

### Basic Usage

```typescript
import { Configuration, ContractsApi } from '@curvegrid/multibaas-sdk';

// Configure API client
const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL,
  apiKey: process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY
});

const contractsApi = new ContractsApi(config);

// Call contract function
const result = await contractsApi.callContractFunction(
  'ethereum',                    // chain
  contractAddress,              // addressOrAlias
  'ContractName',               // contract label
  'functionName',               // method
  { args: [arg1, arg2] }        // postMethodArgs
);
```

## 🎣 React Hooks Integration

### Contract Data Fetching

The frontend uses custom React hooks built on top of TanStack Query for efficient data fetching:

```typescript
// lib/multibaas.ts - Core API functions
export const callContractRead = async (
  address: string,
  contractLabel: string,
  method: string,
  args: any[] = []
) => {
  const response = await contractsApi.callContractFunction(
    'ethereum',
    address,
    contractLabel,
    method,
    { args }
  );

  const result = response.data.result;
  if (result.kind === 'MethodCallResponse') {
    return result.output;
  }
  throw new Error('Unexpected response type');
};
```

### Event Hooks

```typescript
// app/hooks/useEvents.ts
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      // Fetch active events from EventFactory contract
      const [eventIds] = await callContractRead(
        CONTRACT_ADDRESSES.EventFactory,
        'EventFactory',
        'getActiveEvents',
        [0, 50] // offset, limit
      );

      // Fetch details for each event
      const events = await Promise.all(
        eventIds.map(id => callContractRead(
          CONTRACT_ADDRESSES.EventFactory,
          'EventFactory',
          'getEvent',
          [id]
        ))
      );

      return events.map(convertContractEventToFrontendEvent);
    }
  });
};
```

## 📋 Contract Methods

### EventFactory Contract

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getActiveEvents` | `uint256 offset, uint256 limit` | `uint256[] eventIds, bool hasMore` | Get paginated active events |
| `getEvent` | `uint256 eventId` | `Event struct` | Get complete event details |
| `getOrganizerEvents` | `address organizer` | `uint256[] eventIds` | Get events by organizer |
| `createEvent` | `string name, string metadataURI, uint256 ticketPrice, uint256 maxTickets, uint256 startTime, uint256 endTime` | `uint256 eventId` | Create new event (write) |

### Event Struct

```solidity
struct Event {
    uint256 id;
    address organizer;
    address ticketContract;
    address poapContract;
    address incentiveContract;
    string name;
    string metadataURI;
    uint256 ticketPrice;
    uint256 maxTickets;
    uint256 startTime;
    uint256 endTime;
    bool isActive;
    uint256 createdAt;
}
```

## 🔄 Data Flow

### Event Listing Flow

1. **Frontend Request**: User visits events page
2. **Hook Execution**: `useEvents()` query triggers
3. **Contract Call**: `getActiveEvents(0, 50)` via MultiBaas API
4. **Data Processing**: Convert contract data to frontend format
5. **UI Update**: Display events with real blockchain data

### Error Handling

```typescript
try {
  const events = await fetchEventsFromContract();
  return events;
} catch (error) {
  console.error('Contract call failed, using mock data:', error);
  return getMockEvents(); // Graceful fallback
}
```

## 🔐 Security Considerations

### API Key Management
- Store API keys securely (environment variables only)
- Use different keys for different environments
- Rotate keys regularly
- Monitor API usage in MultiBaas dashboard

### Rate Limiting
- MultiBaas enforces rate limits per API key
- Implement client-side caching with React Query
- Use optimistic updates for better UX

### Data Validation
- Always validate contract return data
- Handle edge cases (empty arrays, invalid addresses)
- Type-check all contract interactions

## 🧪 Testing

### Unit Tests

```typescript
describe('MultiBaas Integration', () => {
  it('should fetch events from contract', async () => {
    const mockApi = { callContractFunction: vi.fn() };
    mockApi.callContractFunction.mockResolvedValue({
      data: { result: { kind: 'MethodCallResponse', output: [] } }
    });

    const events = await callContractRead(
      '0x...', 'EventFactory', 'getActiveEvents', [0, 10]
    );

    expect(events).toBeDefined();
  });
});
```

### Integration Tests

- Test against testnet contracts
- Verify data consistency between contract and frontend
- Test error scenarios and fallbacks

## 🚀 Deployment

### Environment Setup

1. **MultiBaas Deployment**: Set up your MultiBaas instance
2. **Contract Deployment**: Deploy contracts via Hardhat/MultiBaas
3. **Frontend Config**: Update environment variables
4. **API Keys**: Generate and configure API keys

### Production Checklist

- [ ] MultiBaas deployment configured
- [ ] API keys created and secured
- [ ] Contract addresses updated
- [ ] Environment variables set
- [ ] Error handling implemented
- [ ] Fallback mechanisms tested
- [ ] Rate limiting configured

## 🐛 Troubleshooting

### Common Issues

**API Key Errors**
```
Error: Unauthorized
```
- Check API key is correct and has proper permissions
- Verify key is in "DApp Users" group
- Check MultiBaas deployment URL

**Contract Call Failures**
```
Error: Contract not found
```
- Verify contract is deployed and registered in MultiBaas
- Check contract label matches MultiBaas registration
- Ensure address is correct

**Network Issues**
```
Error: Network timeout
```
- Check MultiBaas service status
- Verify network connectivity
- Check rate limits and back off if needed

### Debug Mode

Enable debug logging:

```typescript
// Add to multibaas.ts
const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL,
  apiKey: process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY,
  // Enable debug logging in development
  ...(process.env.NODE_ENV === 'development' && {
    debug: true
  })
});
```

## 📈 Monitoring & Analytics

### MultiBaas Dashboard
- Monitor API usage and performance
- Track contract interaction metrics
- Set up alerts for errors or high usage

### Frontend Monitoring
- Track contract call success/failure rates
- Monitor response times
- Log fallback usage

## 🔗 Additional Resources

- [MultiBaas Documentation](https://docs.curvegrid.com/)
- [Echain Contract Documentation](../contracts/README.md)
- [API Reference](../api/README.md)
- [Deployment Guide](../deployment/README.md)

## 🤝 Contributing

When adding new contract integrations:

1. Update contract addresses in `lib/contracts.ts`
2. Add new methods to `lib/multibaas.ts`
3. Create/update React hooks in `app/hooks/`
4. Update TypeScript types in `types/`
5. Add tests and documentation
6. Update this integration guide

---

**Need help with MultiBaas integration?** Check the [troubleshooting section](#-troubleshooting) or reach out to the development team.</content>
<parameter name="filePath">e:\Polymath Universata\Projects\Echain\docs\integration\README.md