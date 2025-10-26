# Mini Apps: Farcaster Distribution and Base App

Plan and implementation notes for distributing our app as a Base Mini App and Farcaster Frame.

References:
- Mini apps quickstart: https://docs.base.org/mini-apps/quickstart/migrate-existing-apps
- OnchainKit: https://docs.base.org/onchainkit/latest/getting-started/overview
- Base Chain Quickstart: https://docs.base.org/base-chain/quickstart/connecting-to-base

## Migration Outline
1. Inventory routes and capabilities in our Next.js app
2. Add required metadata and Frame endpoints (HTML head with `fc:frame:*` tags)
3. Integrate Coinbase MiniKit (see docs in docs/base-docs/*minikit*.md)
4. Support WalletConnect + Smart Wallet for frictionless auth
5. Host on a stable HTTPS domain with fast TTFB (<200ms)

## Mini App SDK Integration
- **SDK**: @farcaster/miniapp-sdk
- **Installation**: `npm install @farcaster/miniapp-sdk`
- **Ready Trigger**: Call `sdk.actions.ready()` after app loads
- **Manifest**: Host at `https://your-domain.com/.well-known/farcaster.json`

## Manifest Configuration
```json
{
  "accountAssociation": {
    "header": "...",
    "payload": "...",
    "signature": "..."
  },
  "baseBuilder": {
    "ownerAddress": "0x..."
  },
  "miniapp": {
    "version": "1",
    "name": "Echain Events",
    "homeUrl": "https://app.echain.xyz",
    "iconUrl": "https://app.echain.xyz/icon.png",
    "splashImageUrl": "https://app.echain.xyz/splash.png",
    "splashBackgroundColor": "#000000",
    "webhookUrl": "https://app.echain.xyz/api/webhook",
    "subtitle": "Web3 Event Management",
    "description": "Create and attend blockchain-powered events with NFT tickets.",
    "screenshotUrls": [
      "https://app.echain.xyz/screenshot1.png",
      "https://app.echain.xyz/screenshot2.png"
    ],
    "primaryCategory": "social",
    "tags": ["events", "nft", "web3", "blockchain"],
    "heroImageUrl": "https://app.echain.xyz/hero.png",
    "tagline": "Events on Blockchain",
    "ogTitle": "Echain - Web3 Event Platform",
    "ogDescription": "Discover and create blockchain events with NFT tickets.",
    "ogImageUrl": "https://app.echain.xyz/og.png",
    "noindex": false
  }
}
```

## Frame Metadata (Farcaster)
Example Head tags (server-rendered):
```html
<meta property="og:title" content="Echain Event" />
<meta name="fc:frame" content="vNext" />
<meta name="fc:frame:post_url" content="https://app.echain.xyz/api/frame" />
<meta name="fc:frame:image" content="https://app.echain.xyz/og/event.png" />
<meta name="fc:frame:button:1" content="Buy Ticket" />
```

## Base Network Connection
- **Mainnet RPC**: https://mainnet.base.org (rate limited)
- **Testnet RPC**: https://sepolia.base.org (rate limited)
- **Flashblocks**: https://mainnet-preconf.base.org
- **Chain ID**: 8453 (mainnet), 84532 (testnet)
- **Block Explorer**: https://base.blockscout.com/

## Distribution Strategy
- Submit to Base ecosystem directory (see Base docs): https://docs.base.org
- Promote within Farcaster channels; ensure frame latency <1s
- Use OnchainKit components for wallet, transactions, and UX
- Leverage Base app's user base for viral growth

## Performance Optimization
- **Latency Budget**: P99 <1s for frame responses
- **Node Providers**: Use Chainstack or Spectrum for production RPC
- **Caching**: Implement metadata caching
- **CDN**: Vercel Edge Network for global distribution

## Testing
- Validate Frame compatibility with Warpcast dev tools
- Load test frame endpoints for P99 latency
- Test mini app manifest and account association
- Verify Base wallet integration

Verification links:
- Migrate existing apps: https://docs.base.org/mini-apps/quickstart/migrate-existing-apps
- Connecting to Base: https://docs.base.org/base-chain/quickstart/connecting-to-base
