# Multi-Chain Production Testing Guide for Echain DApp

This guide provides step-by-step instructions for testing your Echain DApp across multiple blockchain networks (Base, Polkadot, Cardano) to ensure everything is working correctly before final deployment.

## Prerequisites

- Node.js 18+ installed
- Network-specific API keys and RPC endpoints configured
- Contract addresses for deployed smart contracts on each network
- Multi-chain wallet support (MetaMask, Polkadot extension, Cardano wallets)
- Testnet tokens for each supported network

## Step 1: Configure Multi-Chain Environment Variables

Create or update your `.env.local` file in the `frontend` directory with production values for all networks:

```bash
# Base Network Configuration
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_base_api_key
NEXT_PUBLIC_BASE_EVENT_FACTORY=0xYourBaseEventFactoryAddress
NEXT_PUBLIC_BASE_EVENT_TICKET=0xYourBaseEventTicketAddress
NEXT_PUBLIC_BASE_POAP=0xYourBasePoapAddress
NEXT_PUBLIC_BASE_INCENTIVE=0xYourBaseIncentiveAddress

# Polkadot Network Configuration
NEXT_PUBLIC_POLKADOT_RPC_URL=wss://rpc.polkadot.io
NEXT_PUBLIC_POLKADOT_EVENT_FACTORY=YourPolkadotContractAddress
NEXT_PUBLIC_POLKADOT_EVENT_TICKET=YourPolkadotTicketAddress
NEXT_PUBLIC_POLKADOT_POAP=YourPolkadotPoapAddress
NEXT_PUBLIC_POLKADOT_INCENTIVE=YourPolkadotIncentiveAddress

# Cardano Network Configuration
NEXT_PUBLIC_CARDANO_RPC_URL=https://cardano-mainnet.blockfrost.io/api/v0
NEXT_PUBLIC_CARDANO_PROJECT_ID=your_blockfrost_project_id
NEXT_PUBLIC_CARDANO_EVENT_FACTORY=YourCardanoScriptAddress
NEXT_PUBLIC_CARDANO_EVENT_TICKET=YourCardanoTicketScript
NEXT_PUBLIC_CARDANO_POAP=YourCardanoPoapScript
NEXT_PUBLIC_CARDANO_INCENTIVE=YourCardanoIncentiveScript

# Cross-Chain Configuration
NEXT_PUBLIC_BRIDGE_API_KEY=your_bridge_api_key
NEXT_PUBLIC_DEFAULT_NETWORK=base
```

## Step 2: Run Multi-Chain Automated Tests

We've provided comprehensive testing scripts for all supported networks:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies if needed
npm install

# Run multi-chain integration tests
npm run test:multi-chain

# Run network-specific tests
npm run test:base        # Test Base network integration
npm run test:polkadot    # Test Polkadot network integration
npm run test:cardano     # Test Cardano network integration
```

These scripts will:
1. Test connections to all blockchain networks
2. Validate contract deployments and interactions
3. Test cross-chain bridge functionality
4. Verify wallet integrations across networks
5. Run comprehensive end-to-end test suites

## Step 3: Test with Multi-Chain Development Server

Start your Next.js development server with multi-chain support:

```bash
# Start the development server
npm run dev
```

Once the server is running, visit http://localhost:3000 and test features across all networks:

### Multi-Chain Testing Checklist:

1. **Network Selection & Switching**
   - [ ] Switch between Base, Polkadot, and Cardano networks
   - [ ] Verify network-specific UI updates (logos, colors, features)
   - [ ] Test wallet reconnection when switching networks

2. **Wallet Connections**
   - [ ] Connect MetaMask for Base network
   - [ ] Connect Polkadot extension for Polkadot network
   - [ ] Connect Cardano wallet for Cardano network
   - [ ] Verify multi-chain wallet address display

3. **Read Operations (All Networks)**
   - [ ] Load events list - should display events from selected network
   - [ ] Check event details - should load network-specific data
   - [ ] View ticket information - should display correct network data

4. **Write Operations (Network-Specific)**
   - [ ] Create events on Base (OnchainKit integration)
   - [ ] Create events on Polkadot (Substrate contracts)
   - [ ] Create events on Cardano (Plutus contracts)
   - [ ] Purchase tickets on each network
   - [ ] Claim POAPs on each network

5. **Cross-Chain Features**
   - [ ] Test asset bridging between networks
   - [ ] Verify cross-chain referral system
   - [ ] Test unified rewards dashboard

## Step 4: Test Network-Specific Explorers

1. **Base Network**: Verify contracts on [BaseScan](https://basescan.org/)
2. **Polkadot Network**: Verify contracts on [Polkadot Explorer](https://polkadot.js.org/apps/)
3. **Cardano Network**: Verify scripts on [Cardano Explorer](https://cardanoscan.io/)

## Step 5: Verify Cross-Chain Bridge Integration

1. Test asset transfers between networks using the bridge interface
2. Verify bridge transaction status and confirmations
3. Test cross-chain event attendance verification
4. Validate unified reward claiming across networks

## Step 6: Perform Full Multi-Chain End-to-End Tests

Complete user journeys on each network:

### Base Network Journey:
1. Connect MetaMask wallet
2. Create an event using OnchainKit
3. Purchase ticket with ETH
4. Claim POAP using MiniKit
5. Bridge assets to Polkadot

### Polkadot Network Journey:
1. Connect Polkadot extension
2. Create parachain event
3. Purchase ticket with DOT
4. Claim substrate-based POAP
5. Participate in staking rewards

### Cardano Network Journey:
1. Connect Cardano wallet
2. Create Plutus-based event
3. Purchase ticket with ADA
4. Claim eUTXO-based POAP
5. Use Hydra for fast transactions

## Troubleshooting

### Network-Specific Issues:

1. **Base Network Errors**
   - Check OnchainKit API key and permissions
   - Verify Base RPC endpoint connectivity
   - Check MiniKit configuration and Farcaster setup

2. **Polkadot Network Errors**
   - Verify Polkadot.js extension installation
   - Check parachain RPC endpoint
   - Validate substrate contract deployments

3. **Cardano Network Errors**
   - Verify Cardano wallet connection
   - Check Blockfrost API key and rate limits
   - Validate Plutus script deployments

4. **Cross-Chain Bridge Issues**
   - Check bridge API key and endpoints
   - Verify bridge contract deployments
   - Test bridge transaction monitoring

### Debug Tools:

- Use browser DevTools Network tab for API calls
- Check console for network-specific error messages
- Run individual network test scripts for isolation
- Use network explorers to verify transaction status
- Test bridge APIs directly for connectivity

## Final Multi-Chain Checklist

Before production release, verify:

- [ ] All multi-chain automated tests pass
- [ ] Manual UI testing successful on all networks
- [ ] Contract interactions work on each network
- [ ] Cross-chain bridge functionality verified
- [ ] Wallet integrations working across all networks
- [ ] Network switching seamless and error-free
- [ ] Unified user experience maintained

## Multi-Chain Performance Benchmarks

- **Base Network**: <3 seconds transaction time
- **Polkadot Network**: <12 seconds parachain transaction
- **Cardano Network**: <5 minutes eUTXO transaction
- **Cross-Chain Bridge**: <10 minutes asset transfer
- **Network Switching**: <2 seconds UI update

## Support

If you encounter issues, please:
1. Check network-specific documentation in `docs/base-docs/`, `docs/polkadot/`, `docs/cardano/`
2. Review error messages and network explorer details
3. Test individual networks in isolation
4. Consult network-specific documentation:
   - Base: https://docs.base.org/
   - Polkadot: https://docs.substrate.io/
   - Cardano: https://docs.cardano.org/