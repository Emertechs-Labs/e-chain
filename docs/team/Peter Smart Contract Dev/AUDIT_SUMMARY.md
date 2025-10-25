# Smart Contract Audit Summary — Peter

**Date:** 2025-10-25  
**Reviewer:** Cascade (AI)  
**Scope:** `blockchain/contracts` (core + modules), supporting security docs

## Highlights
- `EventFactory` now deploys ticket contracts with deterministic CREATE2 salts and immediate initialization, eliminating the race window noted in earlier security docs.@blockchain/contracts/core/EventFactory.sol#L175-L207
- Ticket sales route platform fees to treasury and track organizer balances for withdrawal, aligning with revenue model expectations.@blockchain/contracts/core/EventTicket.sol#L164-L213
- POAP attendance tokens enforce soulbound semantics via `_update` safeguards and signature-gated minting, providing verifiable on-chain attendance proofs.@blockchain/contracts/modules/POAPAttendance.sol#L61-L119

## Key Risks & Recommendations
1. **Treasury change timelock bypass** — *Medium*
   - `setTreasury` remains callable for instant treasury swaps even though a timelocked flow is implemented, letting a compromised owner (or stolen key) skip the delay.@blockchain/contracts/core/EventFactory.sol#L523-L585
   - **Action:** Remove or restrict `setTreasury`, forcing `proposeTreasuryChange` + `executeTreasuryChange` use, and add regression tests.

2. **Payment forwarding via `transfer`** — *Medium*
   - Ticket purchases forward platform fees with `transfer`, which can revert if the treasury ever becomes a contract needing >2300 gas.@blockchain/contracts/core/EventTicket.sol#L164-L189
   - **Action:** Switch to `call{value: …}` with revert checks to future-proof payouts and document expected gas usage.

3. **Early-bird reward gaming** — *Medium*
   - Early bird logic only checks aggregate ticket count, so organizers or bots can mint small batches across events to farm rewards without meaningful sales.@blockchain/contracts/modules/IncentiveManager.sol#L70-L133
   - **Action:** Track purchaser ordering per event, enforce minimum ticket price / supply, and add replay-resistant purchase proofs before minting rewards.

4. **Organizer self-verification Sybil risk** — *Low*
   - Anyone can become a “verified organizer” for 0.002 ETH; there are no KYC hooks or admin review.@blockchain/contracts/core/EventFactory.sol#L485-L512
   - **Action:** Introduce allowlist/approval queue or on-chain reputation before assigning organizer privileges.

5. **Legacy audit documentation drift** — *Info*
   - `docs/security/COMPREHENSIVE_BLOCKCHAIN_SECURITY_AUDIT.md` still flags the CREATE clone race condition as unresolved, which no longer reflects the code.
   - **Action:** Update the document to reflect current mitigations so auditors align on real risk posture.

## Suggested Tests / Follow-ups
- Add Foundry tests covering the treasury update timelock workflow and asserting `setTreasury` is either removed or restricted.
- Extend ticket purchase tests to cover treasury contracts with complex fallback logic once `call` is adopted.
- Build property/fuzz tests for `claimEarlyBird` to prove resistance against sybil batch purchases.
- Document organizer onboarding requirements (off-chain SOP) and surface warnings in frontend tooling.

## Open Questions for Peter
1. Do we need multi-sig ownership on `EventFactory` to reduce single-key risk when adjusting treasury or platform fee?
2. Should we lock royalties after ticket sales begin, or enforce a cooldown/timelock on `setRoyaltyInfo` changes?@blockchain/contracts/core/EventTicket.sol#L398-L407
3. Is a Chainlink (or equivalent) price feed planned for USD-denominated ticket price caps to avoid ETH volatility issues?@blockchain/contracts/core/EventFactory.sol#L155-L167

---
*Next review: coordinate with security team after treasury/ticket payment fixes land and documentation is refreshed.*
