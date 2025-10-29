# RPC Latency and Throughput Tuning (Base)

Goal: achieve low-latency reads and reliable writes with minimal variance.

Techniques:
- Prefer regional endpoints (same region as Vercel edge/Serverless)
- Use WebSocket for subscriptions; HTTP/2 keep-alive for reads
- Batch JSON-RPC (eth_call, balanceOf) and cache hot reads (SWR/React Query)
- Pre-warm connections, reuse clients, limit cold starts
- Retry with jitter; circuit-breaker and failover providers
- Separate read/write providers; writes via first-party or dedicated nodes

Monitoring:
- Track P50/P95/P99 per method; alert on error-rate spikes
- Compare Chainstack vs Spectrum vs Coinbase Base Node

References:
- Chainstack: https://chainstack.com/
- Spectrum Nodes: https://spectrumnodes.com/?sPartner=gsd&gad_campaignid=22842687298
- Coinbase Base Node: https://www.coinbase.com/developer-platform/products/base-node


## Implementation playbook

1) Pin regions close to users (provider region near Vercel/host).
2) Split read/write RPCs; writes on dedicated or first-party nodes.
3) Enable HTTP keep-alive and connection reuse; prefer HTTP/2.
4) Batch eth_call and cache via SWR/React Query (stale-while-revalidate).
5) Add jittered retries and circuit breaker; fail over across providers.
6) Monitor P50/P95/P99 per method; alert on spikes.

Sample viem client with keep-alive:
```ts
import { createPublicClient, http } from "viem";
export const client = createPublicClient({
  transport: http(process.env.BASE_MAINNET_RPC_URL!, { batch: true, retryCount: 2, timeout: 10_000, fetchOptions: { keepalive: true } })
});
```

APM fields to log: method, status, region, duration_ms, provider.

References:
- Chainstack: https://chainstack.com/
- Spectrum Nodes: https://spectrumnodes.com/?sPartner=gsd&gad_campaignid=22842687298
- Coinbase Base Node: https://www.coinbase.com/developer-platform/products/base-node
