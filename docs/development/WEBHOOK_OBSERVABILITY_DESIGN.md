# Sprint 2 Design: Webhooks & Observability

_Last updated: 2025-10-26_

## Objectives
- Establish resilient webhook ingestion aligned with current integrations (Pinata IPFS, payments/Stripe, marketplace).
- Persist webhook payloads using existing Vercel Blob storage (no new infrastructure).
- Standardise HMAC verification keyed by existing environment secrets (`PINATA_JWT`, `BASE_WEBHOOK_SECRET`, payment provider secrets).
- Surface telemetry through Sentry + Vercel Analytics per monitoring docs, respecting Chainstack-first RPC execution.

## Architectural Notes
- **Ingress**: Next.js App Router API routes under `/api/webhooks/*`.
- **Verification**: Shared HMAC verifier (`lib/webhooks.ts`) using SHA-256 and timestamp tolerance.
- **Persistence**: Lightweight archival via existing Vercel Blob buckets (`webhooks/{source}/timestamp.json`).
- **Processing**: Immediate side effects queued via React Query cache invalidation hooks where relevant (e.g., marketplace inventory).
- **Fallback**: On verification failure respond `401`; on processing failure respond `202` with log + Sentry capture.

## Endpoints
| Route | Source | Secret Env | Primary Action |
| --- | --- | --- | --- |
| `/api/webhooks/pinata` | Pinata IPFS Async | `PINATA_WEBHOOK_SECRET` | Refresh metadata caches, persist payload |
| `/api/webhooks/payments` | Stripe/Paystack (per existing docs) | `PAYMENT_WEBHOOK_SECRET` | Update ticket purchase status, emit analytics |
| `/api/webhooks/marketplace` | Internal marketplace events | `BASE_WEBHOOK_SECRET` | Sync marketplace listings, trigger UI cache invalidation |

## Observability Plan
- **Logging**: Structured console logs with `source`, `event`, `status` (visible in Vercel log streams).
- **Sentry Signals**: Emit `trackMessage('webhook.*')` breadcrumbs for Pinata, payments, and marketplace routes; hook alerts into existing Sentry playbooks (`webhook.verification_failed`, `webhook.{provider}.received`).
- **Metrics**: Count webhook invocations via Vercel Analytics custom events and Chainstack RPC latency dashboards described in `docs/monitoring/README.md`.
- **Alerts**: Extend Sentry alert rules to page when verification failures exceed the thresholds already outlined in `ERROR_TRACKING_RULES.md`.
- **Docs Updates**: Amend `VERCEL_DEPLOYMENT_GUIDE.md` & `BETA_RELEASE_CHECKLIST.md` with new env vars and validation steps.

## Implementation Sequence
1. Create shared utilities (`lib/webhooks.ts`) — verification, request parsing, blob persistence.
2. Build individual route handlers with validation + minimal processing (log + TODO inline for integrations).
3. Wire Sentry logging/metrics, update docs, add env validation.
4. QA using documented cURL payloads and ensure Chainstack RPC path unaffected.

## Testing Strategy
- Local `curl` tests with sample payloads (see `/docs/testing/WEBHOOK_PAYLOADS.md` once created).
- Replay of stored blobs during incident forensics.
- Beta smoke test: disable webhook secret to confirm `401` and alerting triggers.
