# UI/UX Audit Summary — Natasha

**Date:** 2025-10-25  
**Reviewer:** Cascade (AI)  
**Scope:** Frontend hero + feature sections, design system documents, accessibility guidelines, PWA/mobile experience

## Highlights
- Hero section balances motion + performance by lazy-loading the blockchain animation and gating video backgrounds behind connection/device checks, keeping initial paint light for mobile users.@frontend/app/components/sections/HeroSection.tsx#1-214
- Design docs codify brand gradient tokens (cyan/blue/purple) and accessibility requirements (touch target sizing, WCAG AA), providing a strong reference library for UI implementation.@docs/design/UI_ENHANCEMENT_SUMMARY.md#1-357 @docs/design/ACCESSIBILITY_GUIDELINES.md#1-199
- Trust indicators and CTAs reuse gradient + glassmorphism patterns, which aligns with documented visual hierarchy goals and makes the hero self-contained without duplicating wallet controls.@frontend/app/components/sections/HeroSection.tsx#147-214

## Key UX Risks & Recommendations
1. **Hero copy + CTA saturation** — *Medium*
   - Current hero mixes three CTAs (Explore, Create, Learn) with emoji, which can crowd mobile viewports and dilute primary action focus.
   - **Action:** Establish a single primary CTA for first-time visitors (“Explore Events”), demote the others to secondary inline links, and A/B test copy via Edge Config.

2. **Motion sensitivity support** — *Medium*
   - Framer Motion animations run regardless of `prefers-reduced-motion`, and animated background assets still render when users request less motion.
   - **Action:** Wrap motion variants in a hook that honors reduced-motion and fall back to subtle fades; consider toggling animation props off when `prefers-reduced-motion` is true.

3. **Video background discovery** — *Low*
   - `VideoBackground` fetches HEAD every mount; without caching, slow networks risk repeated HEAD requests on route transitions.
   - **Action:** Cache the HEAD result in local state keyed by URL, or surface it via Edge Config to avoid redundant network checks.

4. **Trust indicator semantics** — *Low*
   - Trust badges rely on color-coded dots; colorblind users may miss meaning even with text.
   - **Action:** Add SR-only descriptors or icons conveying “Decentralized / Immutable” to reinforce meaning.

5. **Mobile nav alignment** — *Info*
   - Design docs mention bottom tab navigation and voice search, but app implementation hasn’t shipped those flows; there’s a gap between documented UX intent and live UI.
   - **Action:** Sync upcoming sprints so mobile nav/voice search designs move from docs to backlog.

## Suggested Next Steps
- Prototype reduced-motion storybook playground to validate animation fallbacks.
- Audit icon/emoji usage to ensure consistent fallback fonts and accessible labels.
- Create acceptance criteria for PWA offline flows and ensure `/wallet-test` route gets real content.

## Open Questions for Natasha
1. Should we introduce a guided onboarding modal for first-time users to explain “Explore vs Create” pathways?
2. Do we have approved assets for the hero video background, or should we default to animation-only for now?
3. How should the design team prioritize mobile bottom navigation and voice search experiments referenced in the docs?

---
*Next review: align with design sprint plan once reduced-motion fixes and CTA hierarchy updates land.*
