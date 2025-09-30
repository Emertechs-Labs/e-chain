# Curvegrid MultiBaas Integration

This documentation covers how Echain integrates with Curvegrid MultiBaas for blockchain interaction.

## What is MultiBaas?

MultiBaas is a blockchain middleware platform that provides easy-to-use APIs for interacting with smart contracts. It simplifies the process of connecting applications to blockchain networks by handling the complexities of blockchain interactions.

## Integration Documentation

- [Backend Integration](./backendintegration.md) - How our backend services interact with MultiBaas
- [Frontend Integration](./frontendintegration.md) - How our frontend components connect to MultiBaas
- [TypeScript SDK](./typescriptsdk.md) - Using the MultiBaas TypeScript SDK
- [Webhooks](./webhooks.md) - Setting up and handling MultiBaas webhook events

## Key Features Used

1. **API-Based Smart Contract Interaction** - Simplified contract calls without raw ABI handling
2. **User Authentication** - Secure API key management for users and applications
3. **Webhook Events** - Real-time blockchain event monitoring
4. **Address Labels** - Human-readable naming for blockchain addresses
5. **Transaction Management** - Advanced tracking and management of blockchain transactions

## Environment Configuration

To configure MultiBaas in your local environment, set the following variables in your `.env.local`:

```
NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL=your_multibaas_url
NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY=your_dapp_user_api_key
NEXT_PUBLIC_MULTIBAAS_CHAIN_ID=84532
```

For more information about MultiBaas, visit the [official Curvegrid documentation](https://www.curvegrid.com/docs/).