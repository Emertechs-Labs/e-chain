# Elastic Upgrade Strategy (Base Mainnet)

Goal: enable safe, iterative upgrades with minimal downtime and audited change control.

Approach:
- UUPS proxies with OZ Upgradeable; admin via timelocked multisig
- Strict storage layout checks (Foundry `storageLayout`, `forge inspect`)
- Semantic versioning for contracts and ABIs
- Feature flags for toggling risky features
- Dark-launch new features gated by roles
- Backward-compatible events to preserve indexers

Process:
1) Author change RFC with risk assessment
2) Run slither/static-analyzers + differential tests
3) Dry-run upgrade on Base Sepolia with identical procedure
4) Queue upgrade in timelock, observe 24h
5) Execute upgrade during low-traffic window
6) Post-upgrade invariants and smoke tests

References:
- OpenZeppelin Upgrades: https://docs.openzeppelin.com/upgrades-plugins/1.x/
- Base chain info: https://docs.base.org/base-chain/quickstart/connecting-to-base
