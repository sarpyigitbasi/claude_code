# Phase 1: Foundation + Manual Tracker - Context

**Gathered:** 2026-04-04 (discuss mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a fully functional subscription tracker with manual entry, a clean dashboard, and renewal notifications — no external integrations (Gmail, Plaid, AI) required. Includes monorepo scaffold, auth, full DB schema (including tables for future phases), dashboard, subscription CRUD, push notifications, and RevenueCat/Stripe monetization hooks with free-tier cap enforcement.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout
- **D-01:** Monthly total displayed prominently at top by default; annual toggle to switch view (shows the real cost impact).
- **D-02:** Subscriptions sorted by cost, highest first — surfaces most expensive immediately to drive action.
- **D-03:** Upcoming renewals shown as a horizontal scrollable strip below the total — next 5-7 renewals as chips, quick glance without dominating the screen.

### Onboarding Flow
- **D-04:** After signup + email verification: guided "add your first subscription" prompt — prominent CTA on the dashboard, not a walkthrough. Avoids blank-screen confusion.
- **D-05:** Empty state: friendly illustration + "Add your first subscription" button. Standard pattern that works well.

### Free-Tier Paywall
- **D-06:** When free user tries to add a 6th subscription: paywall bottom sheet slides up — smooth, non-disruptive, explains limit and offers upgrade.
- **D-07:** Persistent usage counter visible to free users: "3 of 5 subscriptions used" — creates healthy upgrade urgency without being annoying.

### Subscription Entry UX
- **D-08:** Add subscription via form with auto-suggest — user types service name, app suggests from logo library (Netflix, Spotify, etc.) and auto-fills known details. Fast and polished.
- **D-09:** Only name + amount are required fields. All other fields (renewal date, frequency, category) are optional — lowest friction to get something on the dashboard.

### Claude's Discretion
- Exact illustration style and empty state artwork
- Loading skeleton design
- Specific animation/transition timing
- Color palette (dark mode auto-follows system setting)
- Error state copy and design
- Category icon set

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Vision, constraints, tech stack decisions, out-of-scope items
- `.planning/REQUIREMENTS.md` — Full v1 requirements (AUTH-01–04, SUB-01–06, NOTF-01–02 for this phase)
- `.planning/ROADMAP.md` — Phase 1 full description, plans (01-01 through 01-04), success criteria, key risks

### Research
- `.planning/research/STACK.md` — React Native (Expo) vs Flutter decision, monorepo structure, Gmail/Plaid/RevenueCat setup patterns, Supabase auth adapter (`expo-secure-store`)
- `.planning/research/FEATURES.md` — Competitor gaps, notification patterns, dashboard IA, free/paid tier split
- `.planning/research/PITFALLS.md` — Privacy requirements, App Store policies, security patterns, token storage
- `.planning/research/ARCHITECTURE.md` — Supabase schema design, evidence tables, RLS policies, Vault for tokens

No external specs or ADRs — all requirements captured above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. No existing components, hooks, or utilities.

### Established Patterns
- None yet — this phase establishes all patterns.

### Integration Points
- Phase 1 creates the full DB schema including tables for future phases (email_evidence, transaction_evidence, detection_feedback, sync_jobs, integrations, user_entitlements). These tables are created empty now and populated in Phases 2-4.
- RevenueCat SDK initialized in Phase 1 with webhook stubs so entitlement-gating is wired from day one. Actual products/pricing configured externally.

</code_context>

<specifics>
## Specific Ideas

- Competitors: Bobby wins on aesthetics, Rocket Money wins on automation. Target: both — beautiful AND automated.
- Dashboard should surface the "wow I spend that much" moment immediately (annual toggle helps with this).
- The app should feel premium from day one — clean, fast, well-designed. This is the foundation for paid conversion.

</specifics>

<deferred>
## Deferred Ideas

- Natural language subscription input ("Netflix $15.99 monthly") — requires AI, planned for Phase 2+
- Shared expenses / family plan splitting — explicitly out of scope (PROJECT.md)
- Cancel guidance and trial tracker — v2 items
- Social features — out of scope

</deferred>

---

*Phase: 01-foundation-manual-tracker*
*Context gathered: 2026-04-04 (discuss mode)*
