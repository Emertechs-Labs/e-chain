# Beta Release Readiness Plan

**Date:** 2025-10-25  
**Prepared by:** Cascade (AI)  
**Audience:** Engineering leadership, product, QA, design

## 1. Objective
Deliver a production-ready beta on Base Sepolia with confidence in security, performance, UX, and support operations while laying groundwork for mainnet launch.

## 2. Current Posture (Snapshot)
- **Smart Contracts:** CREATE2 fix shipped; treasury governance and payout patterns still medium risk.@docs/team/Peter Smart Contract Dev/AUDIT_SUMMARY.md#12-39
- **Application Stack:** Frontend depends on direct RPC scans, limited testing automation.@docs/team/Daniel Full Stack Dev/FULL_STACK_AUDIT.md#1-42
- **UX & Accessibility:** Motion controls and CTA hierarchy gaps remain.@docs/team/Natasha Frontend UI-UX/UX_AUDIT_SUMMARY.md#1-39
- **QA & Tooling:** QA logs flag potential secrets and inconsistent Solidity formatting, causing noise.@docs/qalog.md#17-142
- **Docs Alignment:** Legacy audit statements still claim all smart-contract risks resolved, causing drift.@docs/AUDIT_SUMMARY.md#41-205

## 3. Workstreams & Deliverables
### 3.1 Smart Contract Governance & Security
- Deprecate or restrict `setTreasury`; enforce timelock-only updates.
- Replace `transfer` with `call{value:}` for treasury payouts and add regression tests.
- Harden IncentiveManager early-bird logic against sybil/gaming.
- Update security docs to reflect new mitigations and open risks.

**Owner:** Peter (Smart Contract Dev)  
**Target Completion:** 2025-11-15  
**Dependencies:** Treasury governance decision from leadership, test coverage updates.

### 3.2 Application Data & Testing Infrastructure
- Stand up API/cache layer to paginate events and abstract RPC access.
- Implement metadata caching (Edge Config/Blob) and event pagination in frontend.
- Replace mock integration tests with Playwright E2E suite (wallet connect, browse, purchase).
- Emit Base RPC health telemetry and alerts.

**Owner:** Daniel (Full Stack Dev)  
**Target Completion:** API layer 2025-11-10, Playwright suite 2025-11-20  
**Dependencies:** Leadership approval for API project, DevOps for monitoring stack.

### 3.3 UX & Accessibility Alignment
- Simplify hero CTA hierarchy (single primary action, secondary links).
- Implement `prefers-reduced-motion` fallbacks across hero animations.
- Add icons/SR-only labels for trust indicators; finalize hero video strategy.
- Document mobile nav/voice-search roadmap to sync design vs. implementation.

**Owner:** Natasha (Frontend UI/UX)  
**Target Completion:** 2025-11-12  
**Dependencies:** Frontend engineering coordination for animation hooks.

### 3.4 Leadership & QA Operations
- Convene cross-team “beta readiness” war room; confirm shared remediation plan.
- Resolve QA secret-scan noise and Solidity formatter instability.
- Establish observability requirements for RPC and wallet flows; integrate with dashboards.
- Align top-level docs (README, AUDIT_SUMMARY, security) with current risks and actions.

**Owner:** Ancestor (Lead Engineer)  
**Target Completion:** War room kickoff by 2025-11-03; tooling fixes by 2025-11-10; documentation updates by 2025-11-07.  
**Dependencies:** QA/DevOps support, documentation team bandwidth.

### 3.5 Beta Operations & Support
- Implement beta user onboarding flow (registration, invite management).
- Stand up feedback collection channels (in-app, Discord form, or survey).
- Define support playbook (triage, escalation, fix pipeline) for beta testers.
- Configure monitoring/alerting (Sentry, RPC metrics, wallet error tracking) with on-call rotation.

**Owner:** Ancestor (coordination) with support team  
**Target Completion:** 2025-11-14  
**Dependencies:** Completion of workstreams 3.1–3.4, product ops involvement.

## 4. Milestones & Timeline
| Date | Milestone | Exit Criteria |
|------|-----------|---------------|
| 2025-11-26 | War Room Kickoff | Cross-team plan signed off; tracking in TASKS/ISSUES per team. |
| 2025-12-03 | Security/App Foundations | Treasury fix PR merged, API service scaffold deployed to staging, QA noise triaged. |
| 2025-12-10 | UX & Support Readiness | Reduced-motion updates live, CTA adjustments deployed, support playbook drafted. |
| 2025-12-17 | Beta Candidate Build | Playwright suite passing in CI, observability metrics active, docs updated. |
| 2025-12-22 | Beta Launch Go/No-Go | Checklist review with leadership; beta invite wave prepared. |

## 5. Success Metrics
- **Security:** No medium-or-higher contract issues open; timelock workflow enforced.
- **Stability:** Beta build passes full CI (unit + Playwright) and RPC health dashboards show <1% failed calls.
- **UX:** Motion accessibility tests pass; mobile hero CTA interaction drop-off reduced in analytics.
- **Ops:** QA suite runs clean (no false-positive secret alerts); support SLAs defined and monitored.
- **Documentation:** Top-level docs and team logs reference latest fixes and remaining follow-ups.

## 6. Risk Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Treasury governance slip | High | Assign dedicated security reviewer; block beta go-live on completion. |
| API/cache delivery delay | High | Break into incremental milestones (read-only cache first); add temporary rate limiting to RPC usage. |
| Reduced-motion support underestimated | Medium | Scope initial pass to hero + global animation hook; expand post-beta if needed. |
| QA tooling fixes stalled | Medium | Escalate to DevOps; schedule focused working session before 2025-11-05. |
| Support load under-resourced | Medium | Predefine intake channels; allocate on-call rotation before beta invites. |

## 7. Reporting & Communication
- Weekly leadership sync using team TASKS/ISSUES and this plan as agenda.  
- Update `BETA_RELEASE_ASSESSMENT.md` once milestones close to reflect new readiness posture.  
- Maintain change log in `docs/CHANGELOG.md` (to be created) for traceable updates.

---
*Document to be revisited at each milestone or if new critical findings emerge.*
