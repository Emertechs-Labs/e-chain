# Cross-Chain Deployment Guide

**Last Updated**: October 28, 2025  
**Status**: Production Ready

## Overview

This guide provides instructions for deploying and managing Echain across multiple blockchain networks, ensuring consistent functionality and data synchronization between chains.

## Supported Networks

| Network | Status | Contract Address | Explorer Link |
|---------|--------|-----------------|---------------|
| Base Mainnet | ✅ Production | 0x7C3a1B78125A3ac5D802A92761D2c4837EDb6103 | [View on BaseScan](https://basescan.org/address/0x7C3a1B78125A3ac5D802A92761D2c4837EDb6103) |
| Polkadot Rococo | ✅ Testnet | 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty | [View on Subscan](https://rococo.subscan.io/account/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty) |
| Cardano Preview | ✅ Testnet | addr1qxck5qz8r638qj9f4mwlh23zy9qr5xh2vvjd0gwnzdmreaf3rnk6jrp7xkmegv6m6dj5g8cg47hx8mdzc56x6y6esyqnzpvz3 | [View on Cardanoscan](https://preview.cardanoscan.io/address/addr1qxck5qz8r638qj9f4mwlh23zy9qr5xh2vvjd0gwnzdmreaf3rnk6jrp7xkmegv6m6dj5g8cg47hx8mdzc56x6y6esyqnzpvz3) |

## Cross-Chain Architecture

Echain uses a hub-and-spoke model with Base as the primary chain:

```
                  ┌─────────────┐
                  │             │
           ┌──────►   Cardano   ├──────┐
           │      │             │      │
           │      └─────────────┘      │
           │                           │
┌──────────┴───┐                 ┌─────┴──────────┐
│              │                 │                │
│     Base     ◄─────────────────►   Polkadot    │
│  (Primary)   │                 │                │
│              │                 │                │
└──────────────┘                 └────────────────┘
```

## Deployment Steps

### 1. Base Mainnet Deployment (Primary)

```bash
# Deploy core contracts to Base
cd contracts
npx hardhat run scripts/deploy-base.js --network base-mainnet

# Verify contracts on BaseScan
npx hardhat verify --network base-mainnet <CONTRACT_ADDRESS>
```

### 2. Secondary Chain Deployment

```bash
# Deploy to Polkadot Rococo
cd substrate
cargo build --release
./target/release/echain-node --chain=rococo-local --validator

# Deploy to Cardano Preview
cd cardano
cardano-cli transaction build \
  --tx-in <TX_IN> \
  --tx-out <ADDRESS>+<LOVELACE> \
  --change-address <CHANGE_ADDRESS> \
  --out-file tx.raw \
  --testnet-magic 1
```

### 3. Cross-Chain Bridge Configuration

```bash
# Configure Axelar bridge for Base <> Polkadot
cd bridge
npm run configure:axelar -- --source base --destination polkadot

# Configure Wormhole for Base <> Cardano
npm run configure:wormhole -- --source base --destination cardano
```

## Synchronization Strategy

Echain uses a combination of:

1. **Event Mirroring**: Events created on Base are mirrored to other chains
2. **State Synchronization**: Daily state snapshots ensure consistency
3. **Cross-Chain Messaging**: Axelar and Wormhole for cross-chain communication

## Monitoring Cross-Chain Operations

Monitor cross-chain operations using our unified dashboard:

```
https://monitor.echain.network/cross-chain
```

Key metrics to monitor:
- Bridge transaction success rate
- Cross-chain latency
- State synchronization status
- Gas costs per operation

## Troubleshooting

### Common Issues

1. **Transaction Stuck in Bridge**
   - Check bridge explorer status
   - Verify relayer health
   - Contact bridge support if persists > 1 hour

2. **State Inconsistency**
   - Run manual sync: `npm run force-sync --network <CHAIN_NAME>`
   - Verify contract state matches primary chain

3. **High Gas Costs**
   - Batch operations when possible
   - Use gas optimization settings in config

## Emergency Procedures

In case of critical issues:

1. Pause cross-chain operations: `npm run pause-bridge`
2. Contact on-call engineer: +1-555-123-4567
3. Follow incident response plan in `/docs/security/INCIDENT_RESPONSE.md`

## Maintenance Schedule

| Operation | Frequency | Duration | Impact |
|-----------|-----------|----------|--------|
| Bridge Updates | Monthly | 2-4 hours | Delayed cross-chain txs |
| State Sync | Daily | 10-15 mins | Read-only during sync |
| Full Audit | Quarterly | 1 week | None (parallel audit) |

## Conclusion

This cross-chain deployment architecture enables Echain to operate seamlessly across multiple blockchain networks while maintaining data consistency and operational reliability.

For detailed network-specific guides, refer to:
- [BASE_INTEGRATION_GUIDE.md](./BASE_INTEGRATION_GUIDE.md)
- [POLKADOT_INTEGRATION_GUIDE.md](./POLKADOT_INTEGRATION_GUIDE.md)
- [CARDANO_INTEGRATION_GUIDE.md](./CARDANO_INTEGRATION_GUIDE.md)