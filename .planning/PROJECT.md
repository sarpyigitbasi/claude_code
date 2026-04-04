# SubTrackr — AI-Powered Subscription Tracker

## What This Is

A mobile-first app (with web version) that automatically detects and manages personal subscriptions using AI. Users connect their Gmail and/or bank account, and the AI scans for subscriptions automatically — zero manual entry. Users get a clean dashboard showing all subscriptions, total spending, and renewal alerts.

## Core Value

Automatically find and surface every subscription a user is paying for — so they can see, manage, and cancel what they don't need, without any manual work.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can sign up and authenticate
- [ ] User can connect Gmail account (OAuth read-only)
- [ ] User can connect bank account (via Plaid)
- [ ] AI scans email/bank and detects subscriptions automatically
- [ ] User can review, confirm, or dismiss detected subscriptions
- [ ] User sees dashboard with all active subscriptions and total monthly spend
- [ ] User receives renewal alerts (push notifications) before charges
- [ ] User can manually add subscriptions
- [ ] User can categorize and organize subscriptions
- [ ] App has subscription-based monetization (free tier + paid plans)

### Out of Scope

- Shared expenses / family splitting — defer to v2 (increases complexity significantly)
- Cancel guidance — defer to v2 (requires per-service maintenance)
- Trial tracker — defer to v2
- Social features — not core to value proposition
- Desktop app — mobile + web is sufficient for v1

## Context

- **Competitors:** Rocket Money (bloated, $12/mo), Bobby (iOS only, manual, no AI), Subtrack (basic, no detection), TrackMySubs (outdated)
- **Our edge:** AI auto-detection from Gmail + bank — the highest friction point competitors don't solve well
- **Target users:** Anyone paying for digital subscriptions — broad, no specific demographic
- **Monetization:** Subscription plans (free tier with limits, paid tier for full AI features)
- **Platform:** Mobile (iOS + Android via React Native or Flutter) + Web

## Constraints

- **Integration:** Gmail API requires Google Cloud Console OAuth setup
- **Integration:** Plaid requires developer account (~$0.30/connection/month in production)
- **AI:** Claude API or OpenAI for subscription parsing/extraction from email/bank data
- **Payments:** Stripe (web) + RevenueCat (mobile) for subscription billing
- **Backend:** Supabase for database, auth, and real-time features
- **Privacy:** Email and bank data are sensitive — must handle with care, clear user consent flows

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| AI auto-detection as core differentiator | Removes #1 friction point (manual entry) that kills competitors | — Pending |
| Gmail + Plaid for data sources | Industry-standard integrations, broad coverage | — Pending |
| Mobile-first with web version | Subscriptions are managed on the go | — Pending |
| Subscription monetization model | Ironic fit — pay to track what you pay | — Pending |

---
*Last updated: 2026-04-04 after initial project definition*
