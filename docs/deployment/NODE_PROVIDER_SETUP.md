# Node Provider Setup Guide

## Overview

Echain uses premium RPC node providers to ensure optimal performance, reliability, and low latency for Base network interactions. This guide covers setup for Chainstack, Spectrum Nodes, and Coinbase Node.

## Why Premium Node Providers?

**Public RPC Issues:**
- Rate limiting (requests throttled)
- High latency (>1s response times)
- Unreliable uptime
- No SLA guarantees

**Premium Provider Benefits:**
- <100ms latency
- 99.99% uptime SLA
- No rate limits
- Dedicated infrastructure
- WebSocket support
- Advanced analytics

## Recommended Providers

### 1. Chainstack (Primary - Recommended)

**Website:** https://chainstack.com/

**Features:**
- 70+ supported chains
- Ultra-fast transactions
- Elastic nodes (auto-scaling)
- Global infrastructure
- 24/7 support

**Setup:**

1. Create account at https://console.chainstack.com/user/account/create
2. Navigate to "Deploy a node" → Select "Base" → Choose plan
3. Copy your RPC endpoint URL

**Pricing:**
- Growth: $49/month (100M requests)
- Business: $299/month (1B requests)
- Enterprise: Custom pricing

**Configuration:**
```bash
# .env.local
NEXT_PUBLIC_BASE_MAINNET_CHAINSTACK_RPC="https://base-mainnet.core.chainstack.com/YOUR_API_KEY"
NEXT_PUBLIC_BASE_SEPOLIA_CHAINSTACK_RPC="https://base-sepolia.core.chainstack.com/YOUR_API_KEY"
```

### 2. Spectrum Nodes (Secondary - Backup)

**Website:** https://spectrumnodes.com/

**Features:**
- 99.99% uptime guarantee
- Competitive pricing
- Fast response times
- Easy setup
- Multiple chain support

**Setup:**

1. Sign up at https://spectrumnodes.com/?sPartner=gsd
2. Select "Base Mainnet" or "Base Sepolia"
3. Choose your plan and get endpoint

**Pricing:**
- Starter: $35/month
- Pro: $99/month
- Enterprise: Custom

**Configuration:**
```bash
# .env.local
NEXT_PUBLIC_BASE_MAINNET_SPECTRUM_RPC="https://base-mainnet.spectrumnodes.com/YOUR_API_KEY"
NEXT_PUBLIC_BASE_SEPOLIA_SPECTRUM_RPC="https://base-sepolia.spectrumnodes.com/YOUR_API_KEY"
```

### 3. Coinbase Node (Tertiary - Fallback)

**Website:** https://www.coinbase.com/developer-platform/products/base-node

**Features:**
- Official Coinbase infrastructure
- Optimized for Base network
- Integrated with Coinbase ecosystem
- Free tier available
- WebSocket support

**Setup:**

1. Visit https://portal.cdp.coinbase.com/
2. Create API key for Base network
3. Copy RPC endpoint

**Pricing:**
- Free: 3M requests/month
- Standard: $49/month (10M requests)
- Advanced: Custom pricing

**Configuration:**
```bash
# .env.local
NEXT_PUBLIC_BASE_MAINNET_COINBASE_RPC="https://api.developer.coinbase.com/rpc/v1/base/YOUR_API_KEY"
NEXT_PUBLIC_BASE_SEPOLIA_COINBASE_RPC="https://api.developer.coinbase.com/rpc/v1/base-sepolia/YOUR_API_KEY"
```

## Quick Start Setup

### 1. Frontend Configuration

Copy `frontend/.env.example` to `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` and add your RPC endpoints:

```bash
# Primary provider (Chainstack)
NEXT_PUBLIC_BASE_MAINNET_CHAINSTACK_RPC="your_chainstack_mainnet_url"
NEXT_PUBLIC_BASE_SEPOLIA_CHAINSTACK_RPC="your_chainstack_sepolia_url"

# Secondary provider (Spectrum)
NEXT_PUBLIC_BASE_MAINNET_SPECTRUM_RPC="your_spectrum_mainnet_url"
NEXT_PUBLIC_BASE_SEPOLIA_SPECTRUM_RPC="your_spectrum_sepolia_url"

# Tertiary provider (Coinbase)
NEXT_PUBLIC_BASE_MAINNET_COINBASE_RPC="your_coinbase_mainnet_url"
NEXT_PUBLIC_BASE_SEPOLIA_COINBASE_RPC="your_coinbase_sepolia_url"

# Set active network
NEXT_PUBLIC_ACTIVE_NETWORK="sepolia" # or "mainnet"
```

### 2. Blockchain Configuration

Create `blockchain/.env` for deployment:

```bash
# Deployment wallet
PRIVATE_KEY="your_private_key_here"

# BaseScan verification
BASESCAN_API_KEY="your_basescan_api_key"

# RPC endpoints (same as frontend)
BASE_MAINNET_CHAINSTACK_RPC="your_chainstack_mainnet_url"
BASE_MAINNET_SPECTRUM_RPC="your_spectrum_mainnet_url"
BASE_MAINNET_COINBASE_RPC="your_coinbase_mainnet_url"

BASE_SEPOLIA_CHAINSTACK_RPC="your_chainstack_sepolia_url"
BASE_SEPOLIA_SPECTRUM_RPC="your_spectrum_sepolia_url"
BASE_SEPOLIA_COINBASE_RPC="your_coinbase_sepolia_url"
```

### 3. Verify Setup

Test your RPC endpoints:

```bash
# Test mainnet endpoint
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  YOUR_RPC_ENDPOINT

# Should return: {"jsonrpc":"2.0","id":1,"result":"0x..."}
```

Run the RPC latency test:

```bash
cd blockchain
forge test --match-test testRPCEndpointLatency -vv
```

## Failover Configuration

Echain automatically handles failover between providers. Priority order:

1. **Chainstack** (Primary) - Fastest, most reliable
2. **Spectrum Nodes** (Secondary) - Backup for failover
3. **Coinbase** (Tertiary) - Additional redundancy
4. **Public RPC** (Last Resort) - Rate-limited fallback

The system automatically:
- Monitors latency of each endpoint
- Switches to fastest available provider
- Falls back if primary provider fails
- Logs performance metrics

## Performance Monitoring

### View RPC Metrics

Add the RPC monitoring component to your dashboard:

```tsx
import { useRPCMetrics } from '@/hooks/useRPCMetrics';

function Dashboard() {
  const metrics = useRPCMetrics();

  return (
    <div>
      <h3>RPC Performance</h3>
      <p>Provider: {metrics.currentEndpoint}</p>
      <p>Latency: {metrics.avgLatency}ms</p>
      <p>Success Rate: {metrics.successRate}%</p>
    </div>
  );
}
```

### Monitor in Production

The RPC manager automatically tracks:
- Average latency (target: <100ms)
- Success rate (target: >99%)
- Request count
- Failover events

## Troubleshooting

### High Latency (>200ms)

**Possible causes:**
- Provider experiencing issues
- Network connectivity problems
- Geographic distance to nodes

**Solutions:**
1. Check provider status page
2. Switch to different provider
3. Contact provider support
4. Add more backup providers

### Connection Failures

**Symptoms:**
- "Failed to fetch" errors
- Timeout errors
- 401/403 status codes

**Solutions:**
1. Verify API key is correct
2. Check endpoint URL format
3. Ensure sufficient balance/credits
4. Review rate limits

### Rate Limiting

**Symptoms:**
- 429 status codes
- "Too many requests" errors

**Solutions:**
1. Upgrade to higher tier plan
2. Implement request caching
3. Use multiple providers for load balancing
4. Contact provider for limit increase

## Best Practices

### Security

- ✅ **Never commit** `.env.local` or `.env` files
- ✅ **Use environment variables** for all sensitive data
- ✅ **Rotate API keys** regularly
- ✅ **Use separate keys** for development/production
- ❌ **Don't expose** RPC URLs in client-side code (use NEXT_PUBLIC_ prefix wisely)

### Performance

- ✅ **Use premium providers** for production
- ✅ **Configure multiple providers** for redundancy
- ✅ **Monitor latency** regularly
- ✅ **Cache frequently accessed data**
- ✅ **Use WebSockets** for real-time updates

### Cost Optimization

- Use **free tiers** for development
- Use **Sepolia testnet** for testing
- Implement **request caching** to reduce calls
- Monitor **usage analytics** to optimize
- Set **budget alerts** to avoid overages

## Production Checklist

Before deploying to mainnet:

- [ ] Premium provider account created (Chainstack/Spectrum/Coinbase)
- [ ] API keys generated and tested
- [ ] Environment variables configured
- [ ] Backup providers configured
- [ ] Latency tests passing (<100ms)
- [ ] Failover tested and working
- [ ] Monitoring dashboard set up
- [ ] Budget alerts configured
- [ ] API keys rotated and secured
- [ ] Documentation updated with endpoints

## Support

### Provider Support Channels

**Chainstack:**
- Docs: https://docs.chainstack.com/
- Support: support@chainstack.com
- Discord: https://discord.gg/chainstack

**Spectrum Nodes:**
- Docs: https://docs.spectrumnodes.com/
- Support: support@spectrumnodes.com
- Telegram: https://t.me/spectrumnodes

**Coinbase:**
- Docs: https://docs.cdp.coinbase.com/
- Support: https://support.coinbase.com/
- Developer Forum: https://github.com/coinbase/

### Echain Support

For issues with Echain's RPC integration:
- GitHub Issues: https://github.com/Emertechs-Labs/Echain/issues
- Documentation: See `/docs` directory

## Appendix

### Example .env.local (Complete)

```bash
# === RPC Providers ===
NEXT_PUBLIC_BASE_MAINNET_CHAINSTACK_RPC="https://base-mainnet.core.chainstack.com/abc123"
NEXT_PUBLIC_BASE_SEPOLIA_CHAINSTACK_RPC="https://base-sepolia.core.chainstack.com/abc123"
NEXT_PUBLIC_BASE_MAINNET_SPECTRUM_RPC="https://base-mainnet.spectrumnodes.com/xyz789"
NEXT_PUBLIC_BASE_SEPOLIA_SPECTRUM_RPC="https://base-sepolia.spectrumnodes.com/xyz789"
NEXT_PUBLIC_BASE_MAINNET_COINBASE_RPC="https://api.developer.coinbase.com/rpc/v1/base/def456"
NEXT_PUBLIC_BASE_SEPOLIA_COINBASE_RPC="https://api.developer.coinbase.com/rpc/v1/base-sepolia/def456"

# === Network Config ===
NEXT_PUBLIC_ACTIVE_NETWORK="mainnet"
NEXT_PUBLIC_CHAIN_ID="8453"

# === Contracts ===
NEXT_PUBLIC_EVENT_FACTORY_ADDRESS="0x..."
NEXT_PUBLIC_EVENT_TICKET_ADDRESS="0x..."
NEXT_PUBLIC_POAP_ADDRESS="0x..."

# === WalletConnect ===
NEXT_PUBLIC_REOWN_PROJECT_ID="your_reown_id"

# === Storage ===
BLOB_READ_WRITE_TOKEN="vercel_blob_token"
PINATA_JWT="pinata_jwt_token"
```

### Testing RPC Performance Script

```bash
#!/bin/bash
# test-rpc-performance.sh

ENDPOINTS=(
  "https://base-mainnet.core.chainstack.com/YOUR_KEY"
  "https://base-mainnet.spectrumnodes.com/YOUR_KEY"
  "https://api.developer.coinbase.com/rpc/v1/base/YOUR_KEY"
  "https://mainnet.base.org"
)

for endpoint in "${ENDPOINTS[@]}"; do
  echo "Testing: $endpoint"
  
  time=$(curl -o /dev/null -s -w '%{time_total}' \
    -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    "$endpoint")
  
  echo "Latency: ${time}s"
  echo "---"
done
```

Make executable and run:
```bash
chmod +x test-rpc-performance.sh
./test-rpc-performance.sh
```

---

**Last Updated:** October 26, 2025
**Version:** 1.0.0
