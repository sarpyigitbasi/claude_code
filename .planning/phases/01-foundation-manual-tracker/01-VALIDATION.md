---
phase: 1
slug: foundation-manual-tracker
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-04
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + React Native Testing Library (Expo) |
| **Config file** | `subtrackr/jest.config.js` — Wave 0 installs |
| **Quick run command** | `cd subtrackr && pnpm test --passWithNoTests` |
| **Full suite command** | `cd subtrackr && pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd subtrackr && pnpm test --passWithNoTests`
- **After every plan wave:** Run `cd subtrackr && pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01-01 | 1 | scaffold | structural | `ls subtrackr/apps/mobile subtrackr/apps/web subtrackr/packages/core` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01-01 | 1 | scaffold | structural | `cat subtrackr/pnpm-workspace.yaml` | ❌ W0 | ⬜ pending |
| 1-02-01 | 01-02 | 1 | AUTH-01, AUTH-02 | unit | `pnpm test -- --testPathPattern=auth` | ❌ W0 | ⬜ pending |
| 1-02-02 | 01-02 | 1 | AUTH-03, AUTH-04 | unit | `pnpm test -- --testPathPattern=session` | ❌ W0 | ⬜ pending |
| 1-02-03 | 01-02 | 1 | schema | structural | `supabase db diff --use-migra` | ❌ W0 | ⬜ pending |
| 1-03-01 | 01-03 | 2 | SUB-01, SUB-02 | unit | `pnpm test -- --testPathPattern=subscription` | ❌ W0 | ⬜ pending |
| 1-03-02 | 01-03 | 2 | SUB-03, SUB-04, SUB-05 | unit | `pnpm test -- --testPathPattern=dashboard` | ❌ W0 | ⬜ pending |
| 1-03-03 | 01-03 | 2 | SUB-06 | unit | `pnpm test -- --testPathPattern=archive` | ❌ W0 | ⬜ pending |
| 1-04-01 | 01-04 | 3 | NOTF-01, NOTF-02 | unit | `pnpm test -- --testPathPattern=notification` | ❌ W0 | ⬜ pending |
| 1-04-02 | 01-04 | 3 | monetization | unit | `pnpm test -- --testPathPattern=entitlement` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `subtrackr/packages/core/src/__tests__/auth.test.ts` — stubs for AUTH-01 through AUTH-04
- [ ] `subtrackr/packages/core/src/__tests__/session.test.ts` — stubs for session persistence
- [ ] `subtrackr/packages/core/src/__tests__/subscription.test.ts` — stubs for SUB-01 through SUB-06
- [ ] `subtrackr/packages/core/src/__tests__/dashboard.test.ts` — stubs for dashboard totals
- [ ] `subtrackr/packages/core/src/__tests__/notification.test.ts` — stubs for NOTF-01, NOTF-02
- [ ] `subtrackr/packages/core/src/__tests__/entitlement.test.ts` — stubs for free-tier cap
- [ ] `subtrackr/jest.config.js` — Jest config for monorepo
- [ ] `pnpm add -D jest @testing-library/react-native ts-jest` — test framework install

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Email verification link works end-to-end | AUTH-02 | Requires real email delivery + click | Sign up with real email, click link, verify session starts |
| Push notification received on device | NOTF-01 | Requires real device with APNs/FCM | Build dev client, add subscription with renewal in 3 days, verify push arrives |
| RevenueCat paywall bottom sheet displays | SUB-05 | Requires Dev Build + RevenueCat sandbox | Add 5 subscriptions as free user, attempt 6th, verify paywall slides up |
| Dark mode renders correctly | Success Criteria 5 | Visual/manual only | Toggle system dark mode on iOS + Android, inspect dashboard |
| EAS build compiles successfully | scaffold | Requires EAS account + native build | Run `eas build --platform all --profile development` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
