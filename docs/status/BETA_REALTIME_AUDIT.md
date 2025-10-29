# Beta Release Realtime & API Audit (Oct 26, 2025)

## Executive Summary
- **Verdict**: *Beta is conditionally ready* – core flows function, but realtime reliability and operational monitoring must improve before inviting a broad African beta cohort.
- **Confidence Index**: 0.68 (scale 0–1).
- **Key Risks**: Polling-heavy data refresh, unvalidated WebSocket provisioning, missing webhook ingestion path, and incomplete ops guardrails (monitoring, alerting, incident response).

## Evidence Reviewed
| Area | Primary Sources |
| --- | --- |
| Smart contracts | `blockchain/contracts`, prior hardening work (treasury timelock, payout call safety) |
| Frontend data layer | `frontend/app/hooks/useEvents.ts`, `frontend/app/components/RealtimeSubscriptionsClient.tsx`, `frontend/lib/metadata.ts` |
| Realtime infra docs | `docs/integration/README.md`, `docs/frontend/ARCHITECTURE.md`, `docs/BETA_READINESS_SUMMARY.md` |
| Ops & release checklists | `docs/BETA_RELEASE_CHECKLIST.md`, `docs/status/ISSUE_FIXES_SUMMARY.md` |
| Storage & media | `frontend/lib/ipfs.ts`, `frontend/lib/blob.ts`, updated Pinata fallback |

## Findings
### 1. Data freshness relies on long-interval polling
- `useEvents` polls contracts every 30 minutes despite cached results; metadata enrichment adds synchronous HTTP fetches per event. This satisfies low-traffic scenarios but cannot provide near-real-time ticket updates for high-volume African events.
- ChainWatcherClient usage is unclear; no centralized event bus ensures consistency.

### 2. WebSocket path exists but is fragile
- `useRealtimeSubscriptions` is wired in the root layout yet depends on `NEXT_PUBLIC_WS_PROVIDER`. No production config, reconnection capped at 8 attempts, and lack of health reporting. Without the env var, the hook quietly disables realtime updates.
- No persistence or queueing (e.g., for offline clients). Without downstream analytics, missed updates go unnoticed.

### 3. Webhook strategy is undocumented and unimplemented
- Docs state webhook ingestion for marketplace swaps and KYC integrations, but no API handlers exist in `frontend/app/api`. Need explicit `/api/webhooks/*` routes, signature validation, and replay protection.

### 4. Monitoring and alerting incomplete
- BETA checklist marks Sentry/alerts pending. Without telemetry, realtime regressions will slip through beta.

### 5. Storage pipeline now resilient
- Updated Pinata retry + blob fallback is documented and works; must ensure env validation script watches `NEXT_PUBLIC_PINATA_JWT`.

## Recommendations Before Wider Beta
1. **Ship realtime backbone (Sprint 1)**
   - Lock in managed WebSocket provider (Alchemy/QuickNode) with African PoPs.
   - Promote `useRealtimeSubscriptions` to typed module, add auth, reconnection jitter, and instrumentation.
   - Replace long polling in `useEvents` with subscription-fed cache invalidation.
2. **Implement webhook ingestion (Sprint 2)**
   - Define `/api/webhooks/{pinata, payments, marketplace}` with signature verification, idempotency keys, and background queue.
   - Document webhook contracts and failure procedures.
3. **Operationalize monitoring (Sprint 2)**
   - Wire Sentry Release Health, Vercel log drains, on-call alerts, and dashboard.
4. **Beta-readiness checklist updates (Sprint 3)**
   - Incorporate realtime/webhook validation steps, plus African network QA cases (low bandwidth, mobile).

## Beta Release Readiness Verdict
- **Immediate Greenlights**: smart-contract hardening, treasury timelock, Pinata fallback, docs refresh.
- **Blocking Items**: realtime/WebSocket validation, webhook endpoints, monitoring, and end-to-end beta smoke script.
- **Next Step**: adopt the sprint plan (see `docs/development/BETA_REALTIME_ROADMAP.md`).
