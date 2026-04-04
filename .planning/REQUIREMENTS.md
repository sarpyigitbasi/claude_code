# Requirements: SubTrackr

**Defined:** 2026-04-04
**Core Value:** Automatically find and surface every subscription a user is paying for — zero manual entry.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User receives email verification after signup
- [ ] **AUTH-03**: User can log in and out
- [ ] **AUTH-04**: User session persists across app restarts

### Integrations

- [ ] **INTG-01**: User can connect Gmail account via OAuth (read-only scope)
- [ ] **INTG-02**: User can connect bank account via Plaid
- [ ] **INTG-03**: User can disconnect integrations at any time
- [ ] **INTG-04**: Integration status is visible in settings

### AI Detection

- [ ] **AIDET-01**: AI scans Gmail for subscription-related emails (receipts, billing, renewals)
- [ ] **AIDET-02**: AI scans bank transactions for recurring charges
- [ ] **AIDET-03**: AI extracts: service name, amount, billing frequency, next renewal date
- [ ] **AIDET-04**: Detected subscriptions are presented for user confirmation before saving
- [ ] **AIDET-05**: User can dismiss false positives
- [ ] **AIDET-06**: New charges are auto-detected on an ongoing basis

### Subscriptions

- [ ] **SUB-01**: User can view all active subscriptions in a dashboard
- [ ] **SUB-02**: User can see total monthly and annual spend
- [ ] **SUB-03**: User can manually add a subscription
- [ ] **SUB-04**: User can edit subscription details (name, amount, date, category)
- [ ] **SUB-05**: User can delete/archive a subscription
- [ ] **SUB-06**: User can categorize subscriptions (Entertainment, Productivity, Health, etc.)

### Notifications

- [ ] **NOTF-01**: User receives push notification 3 days before a subscription renews
- [ ] **NOTF-02**: User can configure notification preferences (on/off, timing)

### Monetization

- [ ] **MON-01**: Free tier allows manual tracking only (up to 5 subscriptions)
- [ ] **MON-02**: Paid tier unlocks AI auto-detection and unlimited subscriptions
- [ ] **MON-03**: In-app subscription purchase via RevenueCat (mobile) / Stripe (web)
- [ ] **MON-04**: Subscription status syncs across devices

## v2 Requirements

### Shared Expenses

- **SHARE-01**: User can share a subscription with family/roommates
- **SHARE-02**: Cost is split and tracked per member
- **SHARE-03**: Shared subscriptions visible to all members

### Cancel Guidance

- **CNCL-01**: Step-by-step cancellation instructions per service
- **CNCL-02**: Direct links to cancellation pages

### Trial Tracker

- **TRIAL-01**: User can mark a subscription as a free trial with end date
- **TRIAL-02**: Alert sent before trial converts to paid

### Insights

- **INSGT-01**: AI flags subscriptions not used in 30+ days
- **INSGT-02**: Spending trends over time
- **INSGT-03**: Plain-English monthly summary

## Out of Scope

| Feature | Reason |
|---------|--------|
| Social features | Not core to value proposition |
| Desktop app | Mobile + web covers the use case |
| OAuth login (Google/Apple SSO) | Email/password sufficient for v1 |
| Real-time bank sync | Polling on-demand sufficient for v1 |
| Multi-currency | Adds complexity, defer to v2 |

## Traceability

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

**Coverage:**
- v1 requirements: 26 total (AUTH x4, INTG x4, AIDET x6, SUB x6, NOTF x2, MON x4)
- Mapped to phases: 26
- Unmapped: 0

Note: Phase 5 (Compliance + App Store Prep) and Phase 6 (Launch + Retention) contain no new v1 requirement IDs — they bring all prior requirements to production-live status and satisfy compliance prerequisites for App Store approval.

---
*Requirements defined: 2026-04-04*
*Last updated: 2026-04-04 — traceability updated to match ROADMAP.md phase structure; requirement count corrected to 26*
