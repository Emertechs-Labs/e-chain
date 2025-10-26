# Base Mainnet Deployment Plan (Beta)

Objective: deploy Echain smart contracts to Base mainnet with rollback and monitoring.

References:
- Base quickstart: https://docs.base.org/base-chain/quickstart/connecting-to-base
- Base explorer: https://basescan.org
- OnchainKit: https://docs.base.org/onchainkit/latest/getting-started/overview

## Prerequisites
- Deployer multisig funded on Base (8453)
- Provider RPC: Chainstack/Spectrum/Coinbase Base Node
- ENV: BASE_MAINNET_RPC_URL, DEPLOYER_PK, ETHERSCAN_API_KEY (BaseScan)

## Steps
1) Freeze commit for release, tag v0.9.0-beta
2) Run static checks (Solc version lock, Slither/Foundry) and gas snapshots
3) Deploy with Foundry or Hardhat to 8453 using multisig execution
4) Verify contracts on BaseScan
5) Initialize roles, timelocks, and pausers
6) Publish addresses/ABIs in docs/contracts and app config
7) Set up monitoring (Sentry, Basescan alerts) and canary checks
8) Run post-deploy test suite against mainnet (read-only invariants)

## Rollback/Hotfix
- Pause via Pausable roles
- Upgrade via UUPS proxies after timelock delay

## Example Verify (Hardhat)
```bash
npx hardhat verify --network base 0xYourProxyAddr "constructorArg1" "arg2"
```

## Addresses and Artifacts
- After deployment, fill docs/audit/SMART_CONTRACT_AUDIT_METADATA.md with mainnet addresses and verification links


## Secrets and environment (verified)

Required for Base mainnet deploy and verification:
- BASE_MAINNET_RPC_URL (provider URL; do not use public rate-limited endpoints)
- DEPLOYER_PK (private key; use multisig for production execution)
- ETHERSCAN_API_KEY (works for BaseScan)
- BASESCAN_API_URL: https://api.basescan.org

Docs:
- Base connection: https://docs.base.org/base-chain/quickstart/connecting-to-base
- BaseScan API: https://docs.basescan.org/
- Providers: Chainstack https://chainstack.com/ • Spectrum https://spectrumnodes.com/ • Coinbase Base Node https://www.coinbase.com/developer-platform/products/base-node
