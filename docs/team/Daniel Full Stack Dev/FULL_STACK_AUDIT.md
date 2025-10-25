# Full Stack Audit Summary — Daniel

**Date:** 2025-10-25  
**Reviewer:** Cascade (AI)  
**Scope:** Frontend Next.js app, integration hooks, RPC utilities, test scaffolding, core architecture docs

## Highlights
- App shell composes shared providers (React Query, Wagmi, RainbowKit, theming) once at the root, keeping wallet + data state synchronized across routes.@frontend/app/layout.tsx#1-65 @frontend/app/providers.tsx#1-44
- Event discovery hook batches on-chain reads and enriches metadata, providing an opinionated Web3-first data flow without duplicating storage infrastructure.@frontend/app/hooks/useEvents.ts#1-182
- Base RPC manager tracks multiple endpoints with basic health checks and weighted selection, offering resilience against flaky RPC providers.@frontend/lib/base-rpc-manager.ts#1-193

## Key Risks & Recommendations
1. **Expensive event scans for large catalogs** — *Medium*
   - `discoverEventsFromBlockchain` loops across every event ID sequentially (batch size 10) and enriches each with metadata, which will scale poorly as events grow beyond a few hundred.@frontend/app/hooks/useEvents.ts#12-84
   - **Action:** Add pagination support in the contract/API layer and cache metadata responses (e.g., edge config + incremental revalidation) so the UI can request slices instead of full scans.

2. **Missing backend/API abstractions** — *Medium*
   - `backend/` currently houses QA artifacts only; there’s no deployed REST/Graph API translating contract data for the frontend. All routes call blockchain RPCs directly, introducing tight coupling and latent security/perf risks.@backend/test-qa#1-1 @frontend/app/api/events/route.ts#1-48
   - **Action:** Stand up an API layer (Edge functions or Node service) that aggregates event/ticket data, applies access control, and exposes cached responses to the frontend.

3. **Testing harness is illustrative only** — *Medium*
   - `tests/integration.test.ts` mocks blockchain behavior with a custom runner but never integrates with actual wallet providers or the app’s hooks, limiting regression confidence.@frontend/tests/integration.test.ts#1-399
   - **Action:** Replace with Playwright/Cypress UI flows plus Viem-powered contract mocks, and wire into CI so PRs exercise real user journeys.

4. **RPC manager lacks observability hooks** — *Low*
   - Health checks run quietly and only log to console; there’s no telemetry exported for the dashboard/alerts if all endpoints degrade.@frontend/lib/base-rpc-manager.ts#118-170
   - **Action:** Emit structured events (e.g., to DataDog or a lightweight status endpoint) so DevOps gets signal before user requests fail.

5. **Wallet provider UX fallback** — *Info*
   - Providers default `learnMoreUrl` to `http://localhost:3000`, which is awkward in production builds; no copy encourages users to install supported wallets.@frontend/app/providers.tsx#24-40
   - **Action:** Update metadata per environment (Edge Config) and extend the wallet button copy to cover Privy + email flows.

## Suggested Next Steps
- Introduce server actions or API routes that prefetch event slices and cache results (SWR or React Query prefetch) to keep initial page loads under 1s.
- Add smoke Playwright scripts for wallet connect, event browse, and ticket purchase flows before cutting preview releases.
- Document fallback UX for offline/PWA mode and ensure `/wallet-test` has automated coverage once populated.

## Open Questions for Daniel
1. Should we delegate blockchain reads to a Graph/Indexing service (e.g., The Graph) to reduce RPC throughput and support richer queries?@docs/architecture/README.md#20-198
2. Do we plan to re-enable a backend service (Supabase/Hasura/etc.) or continue contract-only reads, and how will we enforce rate limits in that model?
3. What’s the roadmap for Privy wallet integration—should we flesh out `frontend/app/wallet-test/` with guided QA steps and add corresponding docs?@frontend/app/wallet-test#1-1

---
*Next review: revisit once API caching + integration tests are in place and the backend story is clarified.*
