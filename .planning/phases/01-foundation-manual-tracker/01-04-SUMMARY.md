---
plan: 01-04
phase: 1
subsystem: notifications-monetization
tags: [push-notifications, pg-cron, pg-net, edge-functions, revenuecat, stripe, settings]
dependency_graph:
  requires: [01-03]
  provides: [push-token-registration, renewal-reminder-pipeline, notification-toggle, monetization-stubs]
  affects: [profiles.expo_push_token, profiles.notification_preferences, sync_jobs, user_entitlements]
tech_stack:
  added: [expo-notifications, pg_cron, pg_net, Expo Push API, Stripe (stub)]
  patterns: [pg-cron-to-pg-net-to-edge-function, expo-push-token-upsert, webhook-stub]
key_files:
  created:
    - subtrackr/apps/mobile/hooks/usePushNotifications.ts
    - subtrackr/apps/mobile/components/settings/NotificationToggle.tsx
    - subtrackr/supabase/migrations/00002_pg_cron_renewal_reminders.sql
    - subtrackr/supabase/functions/send-renewal-reminders/index.ts
    - subtrackr/supabase/functions/revenuecat-webhook/index.ts
    - subtrackr/apps/web/src/app/api/stripe/checkout/route.ts
    - subtrackr/apps/web/src/app/api/stripe/webhook/route.ts
  modified:
    - subtrackr/apps/mobile/app/_layout.tsx
    - subtrackr/apps/mobile/app/(tabs)/settings.tsx
    - subtrackr/.env.example
decisions:
  - "Push token stored in profiles.expo_push_token via hook called from root layout after auth guard"
  - "pg_cron 2-step pattern: queue jobs at 09:00 then invoke Edge Function at 09:01 via pg_net.http_post()"
  - "Stripe npm package install deferred — user geo-restricted (Turkey); route stubs committed for Phase 4 wiring"
  - "PushRegistrar rendered as null-returning component in layout JSX so hook runs within React tree post-auth"
metrics:
  duration: "5 minutes"
  completed_date: "2026-04-05"
  tasks_completed: 2
  tasks_total: 2
  files_created: 7
  files_modified: 3
---

# Phase 1 Plan 04: Notifications + Monetization Hooks Summary

**One-liner:** Push notification pipeline (pg_cron -> sync_jobs -> pg_net -> Edge Function -> Expo Push API) with settings toggle, plus RevenueCat and Stripe webhook stubs for Phase 4 monetization.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 01-04-T01 | Push notification hook, settings toggle, pg_cron migration, send-renewal-reminders Edge Function | 83e252b |
| 01-04-T02 | RevenueCat webhook stub, Stripe Checkout route, Stripe webhook stub, .env.example additions | fe88030 |

## What Was Built

### Push Notification Pipeline

The full pipeline from token registration to notification delivery:

1. **`usePushNotifications.ts`** — On app launch (after auth), requests permission, creates Android `renewal-reminders` channel, calls `getExpoPushTokenAsync`, upserts token to `profiles.expo_push_token`.

2. **`_layout.tsx`** — Adds `<PushRegistrar />` (null-rendering component) inside the QueryClientProvider so the hook runs within the React tree after auth is confirmed.

3. **`NotificationToggle.tsx`** — Settings UI toggle that reads from and writes to `profiles.notification_preferences.renewal_reminders`. Defaults to enabled. Saves immediately on toggle (no Save button).

4. **`00002_pg_cron_renewal_reminders.sql`** — Two cron jobs:
   - `queue-renewal-reminders` (09:00 UTC): inserts `sync_jobs` rows for subscriptions 3 days from renewal, checks `notification_preferences` and `expo_push_token IS NOT NULL`
   - `invoke-send-renewal-reminders` (09:01 UTC): calls `pg_net.http_post()` to invoke the Edge Function

5. **`send-renewal-reminders/index.ts`** — Edge Function that reads pending `renewal_reminder` sync_jobs, sends batched Expo push notifications via `exp.host/--/api/v2/push/send` with copy "[Service Name] renews in 3 days for $[amount].", marks jobs `completed`.

### Monetization Stubs

6. **`revenuecat-webhook/index.ts`** — Validates `REVENUECAT_WEBHOOK_SECRET` auth header, logs event type and `app_user_id`, returns 200. Phase 4 will add `user_entitlements` upsert logic for INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION events.

7. **`stripe/checkout/route.ts`** — Creates Stripe checkout session with `supabase_user_id` in metadata, subscription mode, success/cancel URLs from `NEXT_PUBLIC_APP_URL`.

8. **`stripe/webhook/route.ts`** — Verifies `stripe-signature` via `constructEvent`, logs event type, returns 200 stub. Phase 4 will handle `checkout.session.completed` and `customer.subscription.deleted`.

### Settings Screen

`settings.tsx` fully implemented per UI-SPEC: Notifications section (NotificationToggle), Account section (Sign Out), placeholder Integrations and Subscription sections for future phases.

## Deviations from Plan

### User Decision — Stripe SDK Not Installed

**Found during:** T02 Step B
**Issue:** User is geo-restricted in Turkey and cannot use Stripe payments.
**Resolution:** Route stubs committed as infrastructure code but `pnpm add stripe` skipped per user request. The `stripe` import in the route files will cause a build error if web is built before Phase 4 resolution.
**Tracked:** User will decide between Stripe alternative (LemonSqueezy, Paddle, Gumroad) in Phase 4 planning.
**Files affected:** `subtrackr/apps/web/src/app/api/stripe/checkout/route.ts`, `subtrackr/apps/web/src/app/api/stripe/webhook/route.ts`

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| RevenueCat event handling | `supabase/functions/revenuecat-webhook/index.ts` | Phase 4 — requires RevenueCat project setup and `user_entitlements` write logic |
| Stripe event handling | `apps/web/src/app/api/stripe/webhook/route.ts` | Phase 4 — geo-restriction deferral; payment provider TBD |
| Stripe checkout sessions | `apps/web/src/app/api/stripe/checkout/route.ts` | Phase 4 — payment provider TBD |

These stubs do not block the Phase 1 goal (manual subscription tracker). Push notifications are fully functional as the primary value feature.

## Self-Check: PASSED

All 11 created/modified files verified present on disk. Both task commits (83e252b, fe88030) confirmed in git log.
