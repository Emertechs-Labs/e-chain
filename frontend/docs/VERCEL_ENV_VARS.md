# Vercel Environment Variables (deploy-ready instructions)

This document lists the environment variables required for production realtime subscriptions and optional test automation.

Required for realtime WebSocket subscriptions

- NEXT_PUBLIC_WS_PROVIDER
  - Description: A WebSocket RPC URL for the chain provider (e.g., Alchemy / Infura / QuickNode). Must be a wss:// URL.
  - Example: `wss://eth-sepolia.g.alchemy.com/v2/your-alchemy-key` (replace with Base Sepolia WS endpoint)
  - Purpose: Enables `useRealtimeSubscriptions` to open a JSON-RPC WebSocket and receive logs (EventFactory events, Transfer events).

Optional (for server- or CI-driven E2E tests)

- E2E_RPC_URL
  - Description: HTTP RPC URL used by automated Node scripts/tests (e.g., https://rpc.example.com)
  - Example: `https://rpc.base-sepolia.example/your-key`

# Vercel environment variables

Concise, deploy-ready instructions for environment variables the frontend needs to enable realtime, optional automated E2E runs, and multi-chain RPC connections.

## Required for realtime (high priority)

- NEXT_PUBLIC_WS_PROVIDER
  - Description: A wss:// JSON-RPC WebSocket endpoint for the chain you deploy to (e.g. Base Sepolia).
  - Example values (replace <KEY> with your provider key):
    - Alchemy: `wss://eth-base-sepolia.g.alchemy.com/v2/<KEY>`
    - Infura: `wss://sepolia.infura.io/ws/v3/<KEY>`
    - QuickNode/Ankr/Chainstack: provider-specific wss:// endpoints
  - Action: Set this value for Preview and Production so the realtime hook runs on deploys.

## Optional (for automated E2E in CI or Vercel)

- E2E_PRIVATE_KEY (optional, keep secret)
  - Description: A testnet private key used only for CI/E2E automation. DO NOT use production keys or real-money wallets.

- E2E_RPC_URL (optional)
  - Description: HTTPS RPC URL used by the E2E script when sending transactions (if you run full automated purchases). If using a WS-enabled RPC for realtime, set NEXT_PUBLIC_WS_PROVIDER separately.

## Optional (multi-chain RPC configuration)

- Multi-chain RPC URLs and API keys
  - Used for connecting to Base, Polkadot, and Cardano networks directly. Required for full multi-chain functionality across all supported blockchains.

---

## How to add these in the Vercel web UI (recommended)

1. In Vercel, go to your Project → Settings → Environment Variables.
2. Click "Add" and enter the Name (for example `NEXT_PUBLIC_WS_PROVIDER`) and the Value (the wss:// endpoint).
3. Set the Environment to both "Preview" and "Production" (or whichever you need) and click "Save".
4. Repeat for any optional variables (`E2E_PRIVATE_KEY`, `E2E_RPC_URL`, multi-chain RPC URLs).
5. After adding env vars, trigger a redeploy (either by pushing to the repo branch or clicking "Redeploy" in Vercel) so the new variables are applied.

## How to add these via Vercel CLI (interactive)

Note: the CLI will prompt for values:

```bash
npx vercel env add NEXT_PUBLIC_WS_PROVIDER production
npx vercel env add NEXT_PUBLIC_WS_PROVIDER preview
```

If you prefer a single-shot interactive add for other vars:

```bash
npx vercel env add E2E_PRIVATE_KEY preview
npx vercel env add E2E_RPC_URL preview
```

The CLI flow will ask you to paste the value and choose the environment.

## Quick verification checklist (after redeploy)

1. Visit the deployed app.
2. Open browser DevTools → Console.
3. Look for the realtime status flag in the page context:
   - `window.__ECHAIN_WS_STATUS` should be set and become `connected` when the WS connects.
   - The app also dispatches a DOM event `echain:wsstatus` when the status changes — you can listen for it in the console for debugging.
4. The small Realtime badge (top-right) should appear and show "connected" when working.
5. Perform a test interaction (create/purchase a ticket from a test wallet on the same network). The UI should update without a manual page reload if everything is wired correctly.

Additional manual checks:

- Inspect localStorage for `pending_txs` during purchases — the chain watcher polls this key and resolves receipts.
- If realtime isn't connecting, confirm the WS URL is correct and reachable from Vercel (some hosted RPC providers limit allowed origins or require subscription plans).

## Run the E2E script locally (dry-run & full)

Dry-run (read-only checks) — no private key required:

```bash
export NEXT_PUBLIC_WS_PROVIDER="wss://..."
npx tsx ./scripts/e2e-purchase-test.mjs
```

Full run (will send txs) — only if you have a testnet key with funds. Be careful and use a throwaway test account:

```bash
export E2E_PRIVATE_KEY="<YOUR_TESTNET_PRIVATE_KEY>"
export E2E_RPC_URL="https://your-rpc-provider.example"
export NEXT_PUBLIC_WS_PROVIDER="wss://your-ws-rpc.example"
npx tsx ./scripts/e2e-purchase-test.mjs
```

## Security notes

- Never store production private keys in plaintext. Use Vercel's encrypted environment variables and rotate keys frequently.
- Limit E2E keys to testnets and accounts with only small amounts of test tokens.

If you want, I can also prepare a small CI workflow (GitHub Actions) that sets the envs from repository secrets and runs the E2E check against a Preview deployment. Tell me if you'd like that and whether to proceed.
