# Base RPC Provider Benchmarks (repeatable, verified)

Purpose: measure and compare RPC latency across providers for Base.

Test targets:
- Chainstack: https://chainstack.com/
- Spectrum Nodes: https://spectrumnodes.com/?sPartner=gsd&gad_campaignid=22842687298
- Coinbase Base Node: https://www.coinbase.com/developer-platform/products/base-node
- Base chain IDs and explorers: https://docs.base.org/base-chain/quickstart/connecting-to-base • https://basescan.org

Environment variables:
- BASE_RPC_URL_CHAINSTACK
- BASE_RPC_URL_SPECTRUM
- BASE_RPC_URL_COINBASE
- ITERS (default 50)

Script (Node.js, viem):
```ts
// scripts/bench-viem.ts
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
const urls = [
  process.env.BASE_RPC_URL_CHAINSTACK!,
  process.env.BASE_RPC_URL_SPECTRUM!,
  process.env.BASE_RPC_URL_COINBASE!,
].filter(Boolean);
const ITERS = Number(process.env.ITERS || 50);

async function bench(url:string){
  const client = createPublicClient({ chain: base, transport: http(url, { batch: true }) });
  const times:number[]=[];
  for(let i=0;i<ITERS;i++){
    const t0 = Date.now();
    await client.getBlockNumber();
    times.push(Date.now()-t0);
  }
  times.sort((a,b)=>a-b);
  const p50 = times[Math.floor(0.5*times.length)];
  const p95 = times[Math.floor(0.95*times.length)-1];
  return { url, ITERS, p50, p95 };
}

(async()=>{
  const results = [] as any[];
  for (const u of urls){ results.push(await bench(u)); }
  console.table(results);
})();
```

Run (PowerShell):
```powershell
$env:ITERS=50
$env:BASE_RPC_URL_CHAINSTACK="https://..."; $env:BASE_RPC_URL_SPECTRUM="https://..."; $env:BASE_RPC_URL_COINBASE="https://..."; node scripts/bench-viem.ts
```

Record results in docs/generated or status reports. Keep provider region constant when comparing.
