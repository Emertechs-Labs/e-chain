# Smart Contracts Audit Metadata (Release: Beta to Mainnet)

Populate this file on each release with precise, verifiable data.

Fields schema:
- release_tag: v0.9.0-beta
- repo_commit: <git-sha>
- compiler: solidity ^0.8.x (exact solc version)
- optimizer: enabled, runs: <n>
- network: base mainnet (8453) | base sepolia (84532)
- provider: Chainstack | Spectrum | Coinbase Base Node
- verification_links: BaseScan URLs per contract
- proxy_pattern: UUPS | Transparent
- storage_layout_check: yes/no + link to artifact
- security_reviews: links to internal/external reviews
- test_coverage: % from Foundry unit + invariant tests
- gas_snapshots: link to report

Release Details:
- release_tag: v0.9.0-beta
- repo_commit: preview (current branch)
- compiler: solidity ^0.8.19 (Foundry solc)
- optimizer: enabled, runs: 200
- network: base sepolia (84532) - preparing for base mainnet (8453)
- provider: Chainstack (https://chainstack.com/), Spectrum Nodes (https://spectrumnodes.com/), Coinbase Base Node (https://www.coinbase.com/developer-platform/products/base-node)
- proxy_pattern: UUPS for upgradeable contracts
- storage_layout_check: yes - verified via Foundry storage layout reports
- security_reviews: Internal audit completed, OpenZeppelin patterns used
- test_coverage: 85%+ (Foundry unit tests)
- gas_snapshots: Available in blockchain/test/ directory

Contracts:
- EventFactory
  - proxy: yes (UUPS)
  - implementation: 0xA97cB40548905B05A67fCD4765438aFBEA4030fc
  - proxy/admin: Deployer multisig controlled
  - verified: https://sepolia.basescan.org/address/0xA97cB40548905B05A67fCD4765438aFBEA4030fc
- EventTicket (ERC-721)
  - proxy: no (non-upgradeable)
  - implementation: 0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C
  - verified: https://sepolia.basescan.org/address/0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C
- POAPAttendance (SBT)
  - proxy: no (non-upgradeable)
  - implementation: 0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33
  - verified: https://sepolia.basescan.org/address/0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33
- IncentiveManager
  - proxy: yes (UUPS)
  - implementation: 0x1cfDae689817B954b72512bC82f23F35B997617D
  - verified: https://sepolia.basescan.org/address/0x1cfDae689817B954b72512bC82f23F35B997617D
- Marketplace
  - proxy: yes (UUPS)
  - implementation: 0xD061393A54784da5Fea48CC845163aBc2B11537A
  - verified: https://sepolia.basescan.org/address/0xD061393A54784da5Fea48CC845163aBc2B11537A

Verification references:
- BaseScan: https://basescan.org
- Base Sepolia: https://sepolia.basescan.org

Note: Include exact ABIs committed in /contracts/artifacts and bytecode hashes.

## Node Providers Integration

### Chainstack (https://chainstack.com/)
- **Description**: Fast and Reliable Blockchain Infrastructure Provider supporting 70+ chains including Base
- **Base Support**: Dedicated RPC endpoints for Base mainnet and testnet
- **Features**: 
  - Ultra-fast Transactions: Highest transaction speed on the market with 100% landing rate
  - Global Node Geo-balanced: Ultra-reliable RPC API designed for unbounded performance
  - Dedicated Node: High-performance RPC nodes with flexible deployment and customization
  - Trader Node: Low-latency region-specific RPC endpoints for ultra-fast blockchain operations
  - Unlimited Node Flat-fee: RPS-tiered access for nonstop on-chain performance with unlimited API calls
- **Pricing**: Flexible plans with unlimited RPS options
- **Uptime SLA**: 99.9%+
- **Integration**: Direct RPC endpoint replacement for improved latency
- **Supported Chains**: Ethereum, Solana, TON, Arbitrum, Base, BNB Smart Chain, and 70+ more

### Spectrum Nodes (https://spectrumnodes.com/)
- **Description**: Reliable, Scalable, Secure RPC and API Solutions to 170+ Blockchain Networks
- **Base Support**: Full RPC support for Base network with multi-region fallover
- **Features**: 
  - 99.99% uptime SLA
  - Super fast API response times compared to competitors
  - 24/7 Support via expert team
  - Multi-region fallover for reliability
  - Private infrastructure
- **Packages**:
  - **Free**: 20 RPS, 25M credits/month, 3 networks
  - **Developer**: $35/month, 50 RPS, 100M credits/month, 5 networks, Standard support
  - **Business**: $169/month, 200 RPS, 750M credits/month, All networks, Priority support
  - **Enterprise**: $459/month, 300 RPS, 3B credits/month, All networks, 24/7 support
- **Integration**: Easy integration with popular blockchain frameworks
- **Global Coverage**: Quick response times worldwide

### Coinbase Base Node (https://www.coinbase.com/developer-platform/products/base-node)
- **Description**: Coinbase's official node service for Base network
- **Features**: Official Base RPC endpoints, integrated with Coinbase ecosystem
- **Integration**: Seamless connection for Base mainnet and testnet
- **Note**: Access restricted; use Chainstack or Spectrum for production deployments

## Base Network Connection Details

### Base Mainnet
- **Network Name**: Base Mainnet
- **Chain ID**: 8453
- **RPC Endpoint**: https://mainnet.base.org (rate limited, not for production)
- **Flashblocks RPC**: https://mainnet-preconf.base.org
- **Block Explorer**: https://base.blockscout.com/
- **Currency**: ETH

### Base Testnet (Sepolia)
- **Network Name**: Base Sepolia
- **Chain ID**: 84532
- **RPC Endpoint**: https://sepolia.base.org (rate limited, not for production)
- **Flashblocks RPC**: https://sepolia-preconf.base.org
- **Block Explorer**: https://sepolia-explorer.base.org
- **Currency**: ETH

## Mini Apps and Farcaster Distribution

### Mini Apps Migration (https://docs.base.org/mini-apps/quickstart/migrate-existing-apps)
- **SDK**: @farcaster/miniapp-sdk
- **Integration**: Add SDK, trigger app display with sdk.actions.ready()
- **Manifest**: Host at /.well-known/farcaster.json with account association
- **Features**: Base Account integration, notifications, authentication, navigation
- **Distribution**: Publish to Base app for wider reach

### Base App Distribution Strategy
- **Target**: Farcaster ecosystem users
- **Benefits**: Instant distribution, social features, viral potential
- **Implementation**: Migrate existing app to mini app format
- **Growth**: Leverage Base app's user base for event discovery

## Elasticity for Updates
- **UUPS Pattern**: All upgradeable contracts use UUPS for minimal gas costs
- **Timelock**: Administrative changes require 24-hour delay
- **Storage Layout**: Verified compatibility for future upgrades
- **Multi-Version Support**: Backward compatibility maintained
- **Automated Verification**: Post-deployment checks and invariants


## Verification checklist (links)

- Lock compiler version and optimizer runs; document in metadata.
- Generate and diff storage layout before upgrades.
- Verify on BaseScan and attach constructor args and proxy info.
- Publish ABIs and exact bytecode hashes.

References:
- BaseScan: https://basescan.org • Sepolia: https://sepolia.basescan.org
- OZ Upgrades guide: https://docs.openzeppelin.com/upgrades-plugins/1.x/
- Base connection: https://docs.base.org/base-chain/quickstart/connecting-to-base
- Providers: Chainstack https://chainstack.com/ • Spectrum https://spectrumnodes.com/ • Coinbase Base Node https://www.coinbase.com/developer-platform/products/base-node
