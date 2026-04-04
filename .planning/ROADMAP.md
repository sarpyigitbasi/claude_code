# Roadmap: SubTrackr

## Overview

SubTrackr ships in six phases, each one building a self-contained layer before the next is added. Phase 1 delivers a fully usable manual subscription tracker — the app can be tested, demoed, and given to beta users before any external API is integrated. Phase 2 bolts on Gmail auto-detection and, critically, submits the Google OAuth verification application (4-8 week external lead time). Phase 3 adds Plaid bank sync, layering a second detection signal on top of the Gmail pipeline and submitting for Plaid production access. Phase 4 completes analytics and monetization. Phase 5 finalizes compliance and prepares App Store submissions. Phase 6 goes live, monitors costs, and tunes retention. Two external processes — Google OAuth verification and Plaid production access — are started during their respective build phases, not at launch, because their lead times would otherwise delay the release by months.

---

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (via `/gsd:insert-phase`)

- [ ] **Phase 1: Foundation + Manual Tracker** - Monorepo, auth, core DB schema, manual subscription entry, dashboard, push notifications, and RevenueCat/Stripe hooks wired
- [ ] **Phase 2: Gmail Auto-Detection** - Gmail OAuth, two-pass LLM extraction pipeline, Cloud Pub/Sub push sync, confidence scoring, and Google verification application submitted
- [ ] **Phase 3: Plaid Bank Sync** - Plaid Link SDK, recurring transaction detection, cross-signal merger/deduplicator, and Plaid production access application submitted
- [ ] **Phase 4: Analytics + Monetization** - Spending charts, full paywall screens, entitlement gating, CSV export, cancellation deep links, and cascade account deletion
- [ ] **Phase 5: Compliance + App Store Prep** - Privacy policy finalized, DPAs signed, Sign in with Apple, Privacy Nutrition Labels, reviewer test credentials
- [ ] **Phase 6: Launch + Retention** - Production access live, App Store + Play Store submissions, AI cost monitoring, and notification tuning

---

## Phase Details

### Phase 1: Foundation + Manual Tracker

**Goal**: Deliver a fully functional subscription tracker with manual entry, a clean dashboard, and renewal notifications — no external integrations required.

**Why here**: Everything downstream depends on the core data model and working auth. The evidence tables, feedback schema, and RLS policies must be established before integrations are layered on. A working manual tracker also de-risks the project: if Gmail or Plaid integration is delayed by external reviews, users can still onboard and get value. Bobby proved users will manually enter subscriptions if the UX is excellent.

**Depends on**: Nothing (first phase)

**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, SUB-01, SUB-02, SUB-03, SUB-04, SUB-05, SUB-06, NOTF-01, NOTF-02

**Success Criteria** (what must be TRUE):
  1. User can sign up with email/password, verify via email link, log in, log out, and return to a live session across app restarts without re-authenticating
  2. User can manually add a subscription (name, amount, billing frequency, category, renewal date) and see it immediately reflected in the dashboard with updated monthly and annual totals
  3. User can edit, categorize, and delete/archive any subscription, and the dashboard totals update in real time
  4. User receives a push notification 3 days before a subscription renewal, including the service name and dollar amount, and can toggle notification preferences on/off
  5. Dashboard renders correctly in both light and dark mode on iOS and Android

**Plans**: TBD (target 4 plans)

Plans:
- [ ] 01-01: Monorepo scaffold — pnpm workspaces, Expo app, Next.js web app, `packages/core` (shared Zod schemas + types), ESLint/Prettier, EAS build config, Supabase project init
- [ ] 01-02: Auth + secure storage — Supabase Auth wired to Expo with `expo-secure-store` adapter, email/password signup with verification, session persistence, RLS enabled on all tables, full DB schema created (profiles, subscriptions, integrations, email_evidence, transaction_evidence, detection_feedback, sync_jobs, user_entitlements)
- [ ] 01-03: Subscription CRUD + dashboard — manual add/edit/delete/archive UI, service logo library (top 150-200 services), category picker, dashboard with monthly total, annual toggle, subscription list sorted by cost, upcoming charges strip (next 5-7 charges by date)
- [ ] 01-04: Notifications + monetization hooks — Expo Push + APNs/FCM charge reminder (3-day warning with service name + amount), notification preference toggle, RevenueCat SDK initialized (Expo Dev Build required — not Expo Go), Stripe Checkout wired on web, `user_entitlements` table populated by webhook stubs, free-tier cap enforced (5 subscriptions)

**Key risks / watch-outs**:
- RevenueCat requires an Expo Development Build. Expo Go will not work. Set up EAS and confirm native build pipeline before starting plan 01-04 or RevenueCat work will be blocked.
- Use `expo-secure-store` as the Supabase auth storage adapter from day one. AsyncStorage tokens appear in unencrypted device backups. Retrofitting this later is painful.
- Create all schema tables (including evidence and feedback tables) in this phase even though they will not be populated until Phase 2. Retrofitting schema after integrations are built causes painful migrations.
- RLS policies must be applied to every user-data table in this phase, not added later.

**UI hint**: yes

---

### Phase 2: Gmail Auto-Detection

**Goal**: Automatically detect subscriptions from a connected Gmail account using a two-pass LLM extraction pipeline, and submit the Google OAuth verification application.

**Why here**: Gmail auto-detection is the product's primary differentiator and the riskiest integration. Building it in isolation (before Plaid) means bugs are diagnosable. The Google OAuth verification application — a manual 4-8 week review — must be submitted the moment this integration is functional. Starting this at launch time means shipping without the feature. The privacy policy must be published before the verification submission, so it is drafted during this phase.

**Depends on**: Phase 1

**Requirements**: INTG-01, INTG-03, INTG-04, AIDET-01, AIDET-03, AIDET-04, AIDET-05, AIDET-06

**Success Criteria** (what must be TRUE):
  1. User sees a prominent data use disclosure screen before the Gmail OAuth consent screen and can grant or deny access; access can be revoked from settings at any time
  2. After connecting Gmail, a background scan runs and presents a list of detected subscriptions with confidence indicators; user can confirm or dismiss each one individually
  3. Confirmed subscriptions appear in the dashboard with the email evidence (subject line, sender, date) visible so the user can evaluate the AI's reasoning
  4. New subscription emails received after onboarding are detected automatically (via Cloud Pub/Sub push) and surfaced for confirmation without user action
  5. Google OAuth verification application has been submitted with a published privacy policy URL, a demo video, and a data-use description

**Plans**: TBD (target 4 plans)

Plans:
- [ ] 02-01: Gmail OAuth + token security — `expo-auth-session` PKCE flow, prominent disclosure screen built before OAuth flow, server-side token exchange Edge Function, Gmail OAuth token stored in Supabase Vault (never on device), integration status and disconnect UI in settings (INTG-03, INTG-04)
- [ ] 02-02: Initial scan pipeline — async batch scan of Gmail history (chunked to stay within Edge Function timeout limits), two-pass LLM extraction (Claude Haiku classifier first, Claude Sonnet on confirmed positives only), Zod validation of all LLM output before DB insertion, `email_evidence` table populated with raw evidence linked to detected subscription record
- [ ] 02-03: Confidence scoring + confirm/dismiss UX — multi-signal scoring (LLM confidence 40%, sender domain signal 20%, frequency signal 15%, Plaid match bonus reserved for Phase 3), thresholds (auto-confirm >0.85, prompt for review 0.60-0.84, queue 0.40-0.59, discard <0.40), confirm/dismiss flow with evidence display, `detection_feedback` table captures user corrections, scan progress indicator
- [ ] 02-04: Ongoing push detection + verification submission — Cloud Pub/Sub infrastructure setup, Gmail watch registration (7-day renewal via pg_cron), `AIDET-06` ongoing auto-detection live, privacy policy drafted and published, Google OAuth verification application submitted with demo video and data-use description

**Key risks / watch-outs**:
- The 4-8 week Google verification timeline is LOW confidence. Verify current timeline at https://support.google.com/cloud/answer/9110914 before committing to a launch date. The verification submission is a Phase 2 deliverable — not a pre-launch task.
- Supabase Edge Function timeout limit is LOW confidence. Verify current limit before designing the chunked scan approach. If the limit is under 60 seconds, a self-chaining approach or an external job queue (Inngest, Trigger.dev) may be required for the initial Gmail scan.
- The privacy policy must be published before the verification application is submitted. Do not defer privacy policy drafting to Phase 5.
- Never auto-confirm a subscription without user review (unless confidence >0.85). False positives are the #1 uninstall trigger in this category. Show source evidence alongside every detection.
- Keep a test user list of up to 100 people during the OAuth Testing period (before verification is approved). Production users cannot connect Gmail until verification is granted.
- Needs `/gsd:research-phase` before planning: Cloud Pub/Sub setup, current Google verification requirements, and Edge Function timeout limits should all be verified against live docs.

**UI hint**: yes

---

### Phase 3: Plaid Bank Sync

**Goal**: Add bank transaction sync as a second auto-detection channel, merge it with Gmail signals into a single canonical subscription record, and obtain Plaid production access.

**Why here**: Plaid builds on the two-pass LLM pipeline and confidence scoring established in Phase 2. The cross-signal merger (combining Gmail + bank data) cannot be built until both pipelines exist. Keeping the integrations sequential makes bugs diagnosable. Plaid production access has a 3-10 business day review lead time — the application must be submitted at the start of this phase while Sandbox development continues.

**Depends on**: Phase 2

**Requirements**: INTG-02, AIDET-02

**Success Criteria** (what must be TRUE):
  1. User can connect a bank account via Plaid Link and see their recurring charges detected and surfaced for confirmation within the app
  2. Subscriptions detected by both Gmail and bank data are merged into a single record (not duplicated), with both evidence sources linked to the canonical subscription
  3. When a bank charge amount differs from the previously recorded amount by more than $0.01, the user sees a price change alert in the dashboard
  4. If a bank connection expires or requires re-authentication, the user sees a clear in-app prompt to reconnect; the app handles `ITEM_LOGIN_REQUIRED` gracefully rather than silently failing
  5. Plaid production access has been applied for and Sandbox testing is passing all webhook scenarios

**Plans**: TBD (target 4 plans)

Plans:
- [ ] 03-01: Plaid Link SDK + token security — verify `react-native-plaid-link-sdk` version compatibility with current Expo SDK before starting, `expo-plaid-link` flow with prominent disclosure screen, server-side Plaid token exchange Edge Function, Plaid access token stored in Supabase Vault (never on device), integration status and disconnect UI extended to cover Plaid (INTG-02, INTG-03, INTG-04 extended), Plaid production access application submitted
- [ ] 03-02: Transaction sync pipeline — `/transactions/sync` cursor-based ongoing sync, `/transactions/recurring` endpoint for primary recurring detection (verify endpoint is included in your Plaid pricing tier before this plan), `transaction_evidence` table populated, Plaid webhook handler (`TRANSACTIONS_SYNC_UPDATES_AVAILABLE`, `ITEM_LOGIN_REQUIRED`, `PENDING_EXPIRATION`, `USER_PERMISSION_REVOKED`)
- [ ] 03-03: Cross-signal merger / deduplicator — merge logic: amount match within $0.01 + merchant fuzzy match above 0.8 similarity + date within 3 days = same subscription, Plaid match bonus added to confidence score (25%), deduplication before any item is surfaced for user confirmation, `AIDET-02` ongoing bank detection live
- [ ] 03-04: Price change detection + bank reconnect UX — charge variance detection (flag if new charge differs from recorded amount), price increase alert display in dashboard, "bank disconnected — reconnect" UX for `ITEM_LOGIN_REQUIRED`, pg_cron daily fallback sync for missed webhooks

**Key risks / watch-outs**:
- Verify that `/transactions/recurring` is included in your Plaid pricing tier at plan setup, not mid-Phase 3. If it is not available, the recurring detection strategy must change before implementation begins.
- Model per-user Plaid cost ($0.30-0.50/month per connected account — verify current pricing with Plaid during the production access application) into pricing before launch. Free-tier users with Plaid connections are a direct ongoing cost.
- Use `/transactions/sync` (cursor-based), not the deprecated `/transactions/get`. Do not stub `ITEM_LOGIN_REQUIRED` — handle it from day one or bank disconnect will surface as silent data staleness.
- Needs `/gsd:research-phase` before planning: `/transactions/recurring` availability by pricing tier, current Plaid production checklist, and Plaid SDK version compatibility with the current Expo SDK.

**UI hint**: yes

---

### Phase 4: Analytics + Monetization

**Goal**: Complete the analytics layer (spending charts, trends, annual warnings) and close the monetization loop (full paywall, entitlement gating on all paid features, CSV export, cascade account deletion).

**Why here**: Analytics require data to be meaningful — two or more months of subscription history need to exist before trend lines are worth showing. Phase 4 is the earliest this data realistically exists. RevenueCat and Stripe were wired in Phase 1; this phase adds the full SKU configuration, paywall screens, and proper entitlement gating for every paid feature. Cascade account deletion is implemented here because it requires calling Plaid `item/remove` and revoking Gmail tokens — dependencies that only exist after Phases 2 and 3.

**Depends on**: Phase 3

**Requirements**: MON-01, MON-02, MON-03, MON-04

**Success Criteria** (what must be TRUE):
  1. Free-tier users see a dashboard limited to 5 subscriptions with a clear paywall prompt; paid users see unlimited subscriptions, full history, and analytics
  2. User can view a category donut chart and a monthly spend trend line (up to 12 months), both gated behind the paid tier
  3. User receives an annual charge warning (at 14-day and 3-day intervals) for subscriptions billed yearly
  4. User can export all subscription data as a CSV (paid tier), and the file downloads correctly on both mobile and web
  5. User can trigger full account deletion and all data is removed — Supabase tables cascade-deleted, Plaid `item/remove` called, Gmail token revoked
  6. Subscription purchase, restore, and cross-device sync work on iOS (RevenueCat/StoreKit), Android (RevenueCat/Play Billing), and web (Stripe Checkout)

**Plans**: TBD (target 4 plans)

Plans:
- [ ] 04-01: Analytics charts — category breakdown donut chart (Entertainment, Productivity, Health, etc.), monthly spend trend line (6-12 months), annual charge early warnings (14-day and 3-day), "subscriptions you forgot about" surface showing detected-but-not-yet-confirmed items
- [ ] 04-02: Full paywall + entitlement gating — RevenueCat SKU configuration (monthly $4.99, annual $39.99), paywall screens with free/paid feature comparison, entitlement gate applied to every paid feature (analytics, unlimited Gmail history, unlimited Plaid connections, price increase alerts, annual warnings, CSV export), Stripe Checkout for web users, conversion trigger: show paywall immediately after user sees first "forgotten subscription"
- [ ] 04-03: RevenueCat + Stripe webhook sync — both webhook handlers update the same `user_entitlements` Supabase table, subscription status syncs across devices (MON-04), restore purchases flow on mobile, web session picks up entitlements from Supabase (no runtime RevenueCat/Stripe query)
- [ ] 04-04: CSV export + cascade deletion + cancellation links — CSV export of all subscription data (paid), full cascade account deletion (Supabase tables + Plaid `item/remove` + Gmail token revocation + RevenueCat/Stripe cancellation), cancellation deep links for top 100 services, model AI processing cost at 1K/10K/100K users and confirm paid tier pricing covers unit economics

**Key risks / watch-outs**:
- Model AI cost per user before finalizing pricing. The $0.30/user onboarding scan estimate is MEDIUM confidence. Instrument token usage from the first production user and set cost alerts before reaching 1,000 MAU.
- Cascade account deletion must be a first-class, tested feature — not an afterthought. GDPR/CCPA requires it. Test the full deletion path (Supabase cascade + Plaid + Gmail + RevenueCat) before App Store submission.
- The conversion trigger — showing the paywall immediately after the user sees their first "forgotten subscription" — is the highest-converting moment in the funnel. The UI flow must be built intentionally, not as an afterthought.

**UI hint**: yes

---

### Phase 5: Compliance + App Store Prep

**Goal**: Finalize the privacy policy, sign all required data processing agreements, add Sign in with Apple, complete App Store metadata, and prepare reviewer test credentials — eliminating all compliance blockers before submission.

**Why here**: Compliance is not a last-minute task. The privacy policy must have been drafted in Phase 2 (required for Gmail verification submission). This phase audits and finalizes everything, adds the Sign in with Apple requirement (mandatory when any third-party OAuth is offered on iOS), fills in Privacy Nutrition Labels and the Google Play Data Safety section accurately, and packages the submission with real test credentials. App Store reviewers will actually exercise the Gmail and Plaid flows — an unprepared submission causes multi-week rejection delays.

**Depends on**: Phase 4

**Requirements**: (All 26 v1 requirements are mapped in Phases 1-4. This phase completes the compliance and distribution prerequisites that gate App Store approval and production access go-live.)

**Success Criteria** (what must be TRUE):
  1. Privacy policy is published at a permanent URL, accurately covers Gmail data use, Plaid's role, AI processing disclosure, raw email body handling (not stored), user data deletion, and includes GDPR/CCPA language
  2. Data Processing Agreements are signed with Supabase, Plaid, Anthropic (or OpenAI), and RevenueCat
  3. Sign in with Apple is implemented and functional on iOS alongside Gmail OAuth login
  4. Apple Privacy Nutrition Labels and Google Play Data Safety section are filled in accurately for financial data and email data collection
  5. A test Gmail account with representative subscription emails and Plaid Sandbox credentials are documented in App Store reviewer notes, and both flows exercise correctly end-to-end

**Plans**: TBD (target 3 plans)

Plans:
- [ ] 05-01: Privacy policy + DPA finalization — audit privacy policy against current data flows (Gmail body not stored, Plaid role, AI vendor disclosure, data retention, deletion rights), publish at permanent URL, sign DPAs with Supabase / Plaid / Anthropic or OpenAI / RevenueCat, confirm GDPR/CCPA thresholds (MEDIUM confidence — verify current thresholds)
- [ ] 05-02: Sign in with Apple + consent flows — implement Sign in with Apple (required by Apple when any third-party login is offered), verify prominent disclosure screens exist before both Gmail and Plaid OAuth flows (Google Play requirement), confirm full account deletion flow is accessible from settings and works end-to-end
- [ ] 05-03: App Store metadata + reviewer prep — Apple Privacy Nutrition Labels (financial data + email data categories declared accurately), Google Play Data Safety section, App Store screenshots and description, test Gmail account with 6+ months of subscription emails prepared, Plaid Sandbox credentials documented, reviewer notes written with step-by-step instructions for exercising Gmail and Plaid flows, Google OAuth verification status confirmed (target: approved before this phase ends)

**Key risks / watch-outs**:
- If Google OAuth verification is not approved by the time Phase 5 ends, Gmail auto-detection cannot be enabled for production users. The mitigation is that the verification application was submitted in Phase 2. If it is still pending, submit the App Store build with Gmail detection in beta-only mode and enable it for production users when verification is granted.
- Do not declare Privacy Nutrition Labels inaccurately to speed up submission. Apple has rejected and removed apps for inaccurate nutrition labels. Declare exactly what data is collected and how it is used.
- Legal review of the privacy policy is recommended if budget allows. GDPR/CCPA specifics are MEDIUM confidence.

---

### Phase 6: Launch + Retention

**Goal**: Go live with production integrations, complete App Store and Play Store submissions, and establish post-launch monitoring for AI costs, notification health, and detection accuracy.

**Why here**: Production Plaid access and Gmail verification must be live before App Store submissions can go to production users (not just beta). This phase executes the submissions and sets up the operational instrumentation that prevents cost overruns and permission loss in the first weeks post-launch.

**Depends on**: Phase 5 (and external: Gmail verification approved + Plaid production access granted)

**Requirements**: (No new v1 requirement IDs. This phase brings all prior requirements to production-live status.)

**Success Criteria** (what must be TRUE):
  1. App is live on the Apple App Store and Google Play Store and can be downloaded by users outside TestFlight/internal testing
  2. Gmail auto-detection works for real production users (not just the 100-user test list) — Google OAuth verification is granted
  3. Plaid bank sync works with real bank accounts in production — Plaid production access is granted
  4. Supabase token usage dashboard, AI cost-per-user metric, and notification opt-out rate are all being monitored with alerts set at defined thresholds
  5. Push notifications are delivering at 9am local time with frequency caps enforced; opt-out rate is below 15% at day 7

**Plans**: TBD (target 3 plans)

Plans:
- [ ] 06-01: Production access go-live — confirm Gmail OAuth verification is granted and enable production scope for all users, confirm Plaid production access is granted and switch from Sandbox to production environment, smoke-test both pipelines with real credentials end-to-end
- [ ] 06-02: App Store + Play Store submission — EAS build for production, App Store submission (iOS) with reviewer credentials, Google Play submission (Android) with reviewer credentials, monitor review status and respond to reviewer questions within 24 hours
- [ ] 06-03: Post-launch monitoring + tuning — Supabase dashboard: token usage, query performance, edge function error rates; AI cost monitoring: cost per user alert at $0.50 threshold (adjust based on actual Phase 4 cost modeling); notification tuning: confirm 9am local time delivery, enforce 1 marketing notification per week hard cap, monitor opt-out rate at days 1/3/7; detection feedback loop: `detection_feedback` table → prompt iteration on false positive patterns

**Key risks / watch-outs**:
- If Gmail verification is still pending at App Store submission time, submit with Gmail detection disabled for unverified production users. Do not delay the App Store submission indefinitely waiting for verification — ship the manual tracker and Plaid sync first.
- AI cost overruns are the most likely financial surprise in the first month. Set cost alerts before launch, not after. One viral week can multiply costs 10x unexpectedly.
- Notification permission loss happens fast in finance apps. Hard cap at 1 marketing notification per week. Charge reminders are functional, not marketing — they are the one notification users want.

---

## Progress

**Execution Order:** 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + Manual Tracker | 0/4 | Not started | - |
| 2. Gmail Auto-Detection | 0/4 | Not started | - |
| 3. Plaid Bank Sync | 0/4 | Not started | - |
| 4. Analytics + Monetization | 0/4 | Not started | - |
| 5. Compliance + App Store Prep | 0/3 | Not started | - |
| 6. Launch + Retention | 0/3 | Not started | - |

---

## Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| SUB-01 | Phase 1 | Pending |
| SUB-02 | Phase 1 | Pending |
| SUB-03 | Phase 1 | Pending |
| SUB-04 | Phase 1 | Pending |
| SUB-05 | Phase 1 | Pending |
| SUB-06 | Phase 1 | Pending |
| NOTF-01 | Phase 1 | Pending |
| NOTF-02 | Phase 1 | Pending |
| INTG-01 | Phase 2 | Pending |
| INTG-03 | Phase 2 | Pending |
| INTG-04 | Phase 2 | Pending |
| AIDET-01 | Phase 2 | Pending |
| AIDET-03 | Phase 2 | Pending |
| AIDET-04 | Phase 2 | Pending |
| AIDET-05 | Phase 2 | Pending |
| AIDET-06 | Phase 2 | Pending |
| INTG-02 | Phase 3 | Pending |
| AIDET-02 | Phase 3 | Pending |
| MON-01 | Phase 4 | Pending |
| MON-02 | Phase 4 | Pending |
| MON-03 | Phase 4 | Pending |
| MON-04 | Phase 4 | Pending |

**v1 Requirements mapped:** 26/26
**Unmapped:** 0

Note: REQUIREMENTS.md states 24 total v1 requirements but the requirement list contains 26 IDs (AUTH x4, INTG x4, AIDET x6, SUB x6, NOTF x2, MON x4). All 26 are mapped. Update the count in REQUIREMENTS.md.

---

## External Dependencies (Fixed Lead Times)

These are not implementation tasks. They are external review processes with fixed timelines that block launch if not started early.

| Dependency | Start In | Lead Time | Blocks |
|------------|----------|-----------|--------|
| Google OAuth verification (gmail.readonly scope) | Phase 2 | 4-8 weeks (LOW confidence — verify) | Gmail auto-detection for production users |
| Plaid production access | Phase 3 (start of) | 3-10 business days | Plaid bank sync for production users |

---

*Roadmap created: 2026-04-04*
*Stack: React Native (Expo) + Next.js + Supabase + Claude API + Plaid + RevenueCat + Stripe*
*Granularity: Standard (6 phases)*
