# Base Node Providers and Connectivity Options

This guide lists vetted Base network node providers, connection options, and performance tips. All links are included for verification.

References:
- Chainstack: https://chainstack.com/
- Spectrum Nodes: https://spectrumnodes.com/?sPartner=gsd&gad_campaignid=22842687298
- Coinbase Developer Platform – Base Node: https://www.coinbase.com/developer-platform/products/base-node
- Base docs – Connecting to Base: https://docs.base.org/base-chain/quickstart/connecting-to-base
- Base mainnet explorer: https://basescan.org
- Base Sepolia explorer: https://sepolia.basescan.org

## Official RPC Endpoints

Base recommends using a reliable node provider. Public endpoints are available for development but may be rate-limited:
- Base mainnet chain ID: 8453
- Base Sepolia testnet chain ID: 84532
- Docs: https://docs.base.org/base-chain/quickstart/connecting-to-base

## Provider Comparison (high level)

- Chainstack
  - Global regions, dedicated/shared nodes, Archive, Trace, WebSocket
  - Per-project access tokens, private endpoints, autoscaling
  - Pricing and regions: https://chainstack.com/

- Spectrum Nodes
  - Base endpoints with WebSocket and HTTPS, multi-region
  - Includes partner referral program
  - Details: https://spectrumnodes.com/?sPartner=gsd&gad_campaignid=22842687298

- Coinbase Base Node (CDP)
  - First-party node access via Coinbase Developer Platform
  - Integrates with CDP SDK and Coinbase accounts
  - Product: https://www.coinbase.com/developer-platform/products/base-node

## Recommended Network Config

Hardhat example:
```ts
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  networks: {
    base: {
      chainId: 8453,
      url: process.env.BASE_MAINNET_RPC_URL!, // e.g. Chainstack/Spectrum/Coinbase
      accounts: [process.env.DEPLOYER_PK!],
    },
    baseSepolia: {
      chainId: 84532,
      url: process.env.BASE_SEPOLIA_RPC_URL!,
      accounts: [process.env.DEPLOYER_PK!],
    },
  },
};
export default config;
```

Foundry example:
```toml
[rpc_endpoints]
base = "${BASE_MAINNET_RPC_URL}"
base_sepolia = "${BASE_SEPOLIA_RPC_URL}"

[profile.default]
eth_rpc_url = "${BASE_SEPOLIA_RPC_URL}"
```

## Endpoint Setup Snippets

Chainstack (example):
- Create a project, add Base network, generate HTTPS and WSS endpoints
- Docs: https://chainstack.com/

Spectrum Nodes (example):
- Sign up, select Base, copy HTTPS/WSS URL, restrict by IP when possible
- Docs: https://spectrumnodes.com/?sPartner=gsd&gad_campaignid=22842687298

Coinbase Base Node:
- Enable Base Node in CDP, create API key, use HTTPS URL in server-side code
- Product: https://www.coinbase.com/developer-platform/products/base-node

## Verification Links
- Network details and chain IDs: https://docs.base.org/base-chain/quickstart/connecting-to-base
- Base explorer: https://basescan.org
- Base Sepolia explorer: https://sepolia.basescan.org


## Latency Benchmarking (verified)

Use this repeatable script to measure P50/P95 latency per provider.

Node.js script (ethers v6):
```ts
// scripts/rpc-bench.ts
import { JsonRpcProvider } from "ethers";
const url = process.env.RPC_URL!; // set to provider RPC
const iters = Number(process.env.ITERS || 20);
const p = new JsonRpcProvider(url);

async function main() {
  const times:number[] = [];
  for (let i=0;i<iters;i++){
    const start = Date.now();
    await p.send("eth_blockNumber", []);
    times.push(Date.now()-start);
  }
  times.sort((a,b)=>a-b);
  const p50 = times[Math.floor(0.5*times.length)];
  const p95 = times[Math.floor(0.95*times.length)-1];
  console.log(JSON.stringify({ url, iters, p50, p95, samples: times }));
}
main();
```

Run (PowerShell):
```powershell
$env:ITERS=50
$env:RPC_URL="https://YOUR-PROVIDER-URL"; node scripts/rpc-bench.ts
```

Test with:
- Chainstack: https://chainstack.com/
- Spectrum Nodes: https://spectrumnodes.com/?sPartner=gsd&gad_campaignid=22842687298
- Coinbase Base Node: https://www.coinbase.com/developer-platform/products/base-node
- Base chain IDs: https://docs.base.org/base-chain/quickstart/connecting-to-base
