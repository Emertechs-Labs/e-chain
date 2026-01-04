# Beta Realtime & API Modernization Roadmap

_Last updated: 2025-10-26_

## Overview
Goal: replace polling-heavy data refresh with resilient realtime delivery (websockets/webhooks) and ship the operational guardrails needed for the Africa-focused beta roll-out.

## Sprint Breakdown (Story Points)

### Sprint 1 — Realtime Backbone (26 pts)
1. **WS Provider Enablement (5 pts)**
   - Select managed WebSocket endpoint (Alchemy/QuickNode) with African PoPs
   - Provision `NEXT_PUBLIC_WS_PROVIDER`, add env validation
2. **Realtime Hook Hardening (8 pts)**
   - Refactor `useRealtimeSubscriptions` into typed module with auth headers, jittered reconnect, instrumentation callbacks (Sentry/console)
   - Fail softly when provider unavailable (UI indicator + alert)
3. **Cache Integration (6 pts)**
   - Wire subscription events to invalidate TanStack caches (events, marketplace, organizer metrics)
   - Remove 30‑min polling in `useEvents`, replace with optimistic updates
4. **Diagnostics & QA (7 pts)**
   - Add feature flag + status component for realtime health
   - Document test cases (lossy network, reconnect, mobile background)

### Sprint 2 — Webhooks & Observability (24 pts)
1. **Webhook Ingestion Layer (9 pts)**
   - Implement `/api/webhooks/{pinata,payments,marketplace}` routes with signature validation & idempotency
   - Persist events (KV/Edge Config) and emit internal events bus
2. **Background Processing (5 pts)**
   - Queue webhook payloads (Next.js queue or external worker)
   - Retry strategy + dead-letter logging
3. **Monitoring Stack (6 pts)**
   - Configure Sentry Release Health, Vercel log drains/alerts, heartbeat monitor for WS/subscription lag
4. **Operations Runbooks (4 pts)**
   - Draft incident response SOP, webhook replay instructions, contact tree

### Sprint 3 — Beta Hardening & QA (20 pts)
1. **Realtime Regression Suite (6 pts)**
   - Add Playwright scenario covering ticket purchase → websocket update
   - Include mobile + low-bandwidth simulation
2. **Africa Beta Scenarios (5 pts)**
   - Document and test country-tier gateways, fallback to polling when realtime fails
   - Validate blob/IPFS retrieval under 2G/3G profiles
3. **Analytics & Feedback Loop (4 pts)**
   - Track realtime success/error metrics, integrate beta feedback modal
4. **Launch Readiness Review (5 pts)**
   - Update `BETA_RELEASE_CHECKLIST.md` & `BETA_READINESS_SUMMARY.md` with new gates
   - Run beta smoke checklist, sign-offs

## Dependencies & Notes
- Pinata/Blob fallback already live (Oct 2025); monitor via Sprint 2 observability work
- Ensure security review for webhook secrets & storage of tokens
- Prefer progressive rollout (feature flag) to protect early beta users

## Deliverables
- Hardened realtime hook + validated WS endpoints
- Webhook ingestion & monitoring stack documented and live
- Updated beta readiness artifacts with realtime criteria
- Sprint demos showing realtime updates without polling reliance
