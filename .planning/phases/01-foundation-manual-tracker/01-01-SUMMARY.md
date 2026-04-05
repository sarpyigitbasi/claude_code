---
phase: 01-foundation-manual-tracker
plan: "01"
subsystem: infra
tags: [pnpm, monorepo, expo, react-native, next.js, supabase, zod, jest, ts-jest, larsgesecurestore]

# Dependency graph
requires: []
provides:
  - pnpm monorepo with apps/* and packages/* workspaces
  - Expo mobile app scaffold (@subtrackr/mobile) with expo-router, react-native-purchases, tanstack/react-query
  - Next.js web app scaffold (@subtrackr/web) with Tailwind, @supabase/ssr
  - Shared @subtrackr/core package with Zod schemas (subscription, profile)
  - @subtrackr/supabase package with LargeSecureStore AES-256 adapter (AUTH-04)
  - Supabase local project (supabase/config.toml)
  - Wave 0 Jest test infrastructure — 6 suites, 32 it.todo stubs, exits 0
affects: [01-02, 01-03, 01-04, all subsequent plans]

# Tech tracking
tech-stack:
  added:
    - pnpm@10 (workspace manager)
    - expo@54 with expo-router, expo-secure-store, expo-notifications, expo-dev-client
    - react-native-purchases@9 (RevenueCat)
    - @tanstack/react-query@5
    - zustand@5
    - nativewind@4
    - next@16 with App Router, Tailwind@4
    - @supabase/supabase-js@2, @supabase/ssr
    - @stripe/stripe-js
    - zod@3 (core schemas)
    - jest@30, ts-jest@29 (test runner)
    - eslint@10 with typescript-eslint@8
    - prettier@3
    - aes-js@3 (encryption for LargeSecureStore)
  patterns:
    - LargeSecureStore: AES-256 key in expo-secure-store, encrypted payload in AsyncStorage
    - Monorepo workspace deps: @subtrackr/core@workspace:* pattern
    - Wave 0 test stubs: it.todo blocks that register with Jest but don't fail
    - RevenueCat init in root _layout.tsx useEffect (before any navigation renders)

key-files:
  created:
    - subtrackr/pnpm-workspace.yaml
    - subtrackr/package.json
    - subtrackr/.eslintrc.js
    - subtrackr/.prettierrc
    - subtrackr/.env.example
    - subtrackr/apps/mobile/package.json
    - subtrackr/apps/mobile/app.json
    - subtrackr/apps/mobile/app/_layout.tsx
    - subtrackr/apps/web/package.json
    - subtrackr/packages/core/package.json
    - subtrackr/packages/core/jest.config.js
    - subtrackr/packages/core/tsconfig.json
    - subtrackr/packages/core/src/index.ts
    - subtrackr/packages/core/src/schemas/subscription.schema.ts
    - subtrackr/packages/core/src/schemas/profile.schema.ts
    - subtrackr/packages/core/src/types/index.ts
    - subtrackr/packages/core/src/__tests__/auth.test.ts
    - subtrackr/packages/core/src/__tests__/session.test.ts
    - subtrackr/packages/core/src/__tests__/subscription.test.ts
    - subtrackr/packages/core/src/__tests__/dashboard.test.ts
    - subtrackr/packages/core/src/__tests__/notification.test.ts
    - subtrackr/packages/core/src/__tests__/entitlement.test.ts
    - subtrackr/packages/supabase/package.json
    - subtrackr/packages/supabase/client.ts
    - subtrackr/supabase/config.toml
  modified: []

key-decisions:
  - "LargeSecureStore is the only correct storage adapter for Supabase auth in Expo — prevents silent session truncation when tokens exceed expo-secure-store 2048-byte limit"
  - "Wave 0 test stubs use it.todo (not skip/xtest) — they register with Jest so the runner counts them as pending, not absent, and Jest exits 0"
  - "pnpm install requires -w flag at workspace root to install devDependencies there"
  - "expo-secure-store + AsyncStorage hybrid: encryption key (small) in SecureStore, encrypted session payload (large) in AsyncStorage"
  - "RevenueCat Purchases.configure() called in root _layout.tsx useEffect before navigation mounts"

patterns-established:
  - "LargeSecureStore pattern: all Supabase auth sessions in Expo use AES-256 hybrid storage"
  - "Workspace deps: use @subtrackr/pkg@workspace:* format in all cross-package dependencies"
  - "Test infrastructure: core package uses ts-jest with testEnvironment: node — no React Native deps in pure business logic tests"

requirements-completed: [AUTH-04]

# Metrics
duration: 15min
completed: "2026-04-05"
---

# Phase 01 Plan 01: Monorepo Scaffold + Shared Core + Supabase Init Summary

**pnpm monorepo with Expo mobile + Next.js web apps, Zod shared schemas, LargeSecureStore AES-256 Supabase auth adapter (AUTH-04), and Wave 0 Jest infrastructure (6 suites, 32 todos, exits 0)**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-05T07:36:21Z
- **Completed:** 2026-04-05T07:51:40Z
- **Tasks:** 4 (T00, T01, T02, T03)
- **Files modified:** 30+

## Accomplishments

- Wave 0 test infrastructure: jest + ts-jest configured in @subtrackr/core, 6 test stub files with 32 `it.todo` entries covering all requirement areas — Jest exits 0
- Monorepo root: pnpm-workspace.yaml, package.json with `pnpm -r run test`, ESLint + Prettier config, .env.example with all required env vars
- Expo mobile app (@subtrackr/mobile): all required dependencies installed, app.json with expo-router + expo-secure-store + expo-notifications plugins, root `_layout.tsx` with RevenueCat `Purchases.configure()` and `QueryClientProvider`
- Next.js web app (@subtrackr/web): TypeScript + Tailwind App Router scaffold with @supabase/ssr, @stripe/stripe-js, @tanstack/react-query
- Shared @subtrackr/core schemas: `createSubscriptionSchema`, `updateSubscriptionSchema`, `billingFrequencyEnum`, `subscriptionStatusEnum`, `notificationPreferencesSchema`, and full TypeScript interfaces
- @subtrackr/supabase package with full LargeSecureStore adapter: AES-256 key in SecureStore, encrypted session in AsyncStorage — critical for AUTH-04
- Supabase local project initialized (`supabase init` → config.toml)
- All workspaces linked: `pnpm install` from monorepo root exits 0

## Task Commits

Each task was committed atomically:

1. **T00: Wave 0 test infrastructure + Jest stubs** - `b760a69` (feat)
2. **T01: Monorepo root with pnpm workspaces, ESLint, Prettier** - `ab02582` (feat)
3. **T02: Expo mobile app + Next.js web app scaffolds** - `71f54d7` (feat)
4. **T03: Shared core schemas, LargeSecureStore supabase package, Supabase init** - `e480adc` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `subtrackr/pnpm-workspace.yaml` - Workspace config linking apps/* and packages/*
- `subtrackr/package.json` - Root scripts including `pnpm -r run test`
- `subtrackr/.eslintrc.js` - ESLint with typescript-eslint + prettier
- `subtrackr/.prettierrc` - Prettier: semi:false, singleQuote:true, trailingComma:all
- `subtrackr/.env.example` - All required environment variable placeholders
- `subtrackr/apps/mobile/package.json` - @subtrackr/mobile with all React Native deps
- `subtrackr/apps/mobile/app.json` - scheme:subtrackr, expo-router, expo-secure-store, expo-notifications plugins
- `subtrackr/apps/mobile/app/_layout.tsx` - Root layout: QueryClientProvider + RevenueCat init
- `subtrackr/apps/web/package.json` - @subtrackr/web with @supabase/ssr, @stripe/stripe-js
- `subtrackr/packages/core/jest.config.js` - ts-jest preset, testEnvironment:node
- `subtrackr/packages/core/tsconfig.json` - TypeScript strict config for core package
- `subtrackr/packages/core/src/schemas/subscription.schema.ts` - All subscription Zod schemas
- `subtrackr/packages/core/src/schemas/profile.schema.ts` - Profile and notification preference schemas
- `subtrackr/packages/core/src/index.ts` - Re-exports all schemas
- `subtrackr/packages/core/src/types/index.ts` - Placeholder for Supabase-generated types (Plan 01-02)
- `subtrackr/packages/core/src/__tests__/*.test.ts` - 6 Wave 0 test stub files
- `subtrackr/packages/supabase/client.ts` - LargeSecureStore adapter + Supabase client + createWebClient
- `subtrackr/packages/supabase/package.json` - @subtrackr/supabase package definition
- `subtrackr/supabase/config.toml` - Local Supabase project config

## Decisions Made

- **LargeSecureStore is mandatory:** expo-secure-store has a 2048-byte limit; Supabase JWTs regularly exceed this. The AES-256 hybrid approach (encryption key in SecureStore, ciphertext in AsyncStorage) is the only correct solution. Wired from day one per plan requirement.
- **it.todo for Wave 0 stubs:** Using `it.todo()` rather than `it.skip()` or no-op tests — `it.todo` registers items with Jest's test counter so they appear as "pending" in output, making it clear tests are planned. `--passWithNoTests` is explicitly NOT used.
- **pnpm workspace root install requires -w flag:** `pnpm add -D ...` at workspace root requires `--workspace-root` / `-w` flag to avoid the "ADDING_TO_ROOT" error.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed pnpm globally before scaffold work**
- **Found during:** T00 (pre-execution environment check)
- **Issue:** pnpm was not in PATH — `which pnpm` returned empty
- **Fix:** `npm install -g pnpm` — pnpm@10.33.0 installed
- **Files modified:** None (environment setup)
- **Committed in:** Not committed (environment setup, not source code)

**2. [Rule 3 - Blocking] Added @subtrackr/supabase workspace dep after T03 created it**
- **Found during:** T02 — attempting `pnpm add @subtrackr/supabase@workspace:*` before T03 created the package
- **Issue:** Package doesn't exist in workspace at T02 time — ERR_PNPM_WORKSPACE_PKG_NOT_FOUND
- **Fix:** Added `@subtrackr/core@workspace:*` in T02, then added `@subtrackr/supabase@workspace:*` after T03 created the package
- **Files modified:** subtrackr/apps/mobile/package.json
- **Committed in:** e480adc (T03 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary to unblock execution. No scope creep. No architectural changes.

## Issues Encountered

- **Peer dependency warnings:** nativewind@4 expects tailwindcss@~3 but Next.js web app installs tailwind@4. These warnings are non-blocking — nativewind is a mobile-only dependency and won't be imported in the web app. Web app uses tailwind directly.
- **pnpm workspace root flag:** Root-level `pnpm add` requires `-w` flag — documented as a decision.
- **expo-router not in blank-typescript template:** `create-expo-app blank-typescript` does not include expo-router. Manually installed `expo-router` and created `app/_layout.tsx` per plan spec.

## Known Stubs

- `subtrackr/packages/core/src/types/index.ts` — placeholder comment only; full Supabase-generated DB types arrive in Plan 01-02 after schema migration
- `subtrackr/apps/mobile/app/_layout.tsx` — contains `// Auth state listener wired in Plan 01-02` placeholder comment

Both stubs are intentional and documented as deferral to Plan 01-02. They do not block this plan's objective (bootable monorepo with working test runner).

## Next Phase Readiness

- All workspaces linked and `pnpm install` exits 0
- Jest exits 0 with 6 suites and 32 todos — Wave 0 compliant
- Both apps bootable (mobile: `expo start`, web: `next dev`)
- LargeSecureStore adapter ready for Plan 01-02 auth integration
- Supabase local instance ready for `supabase start` in Plan 01-02

## Self-Check: PASSED

All key files verified:
- FOUND: subtrackr/pnpm-workspace.yaml
- FOUND: subtrackr/packages/supabase/client.ts
- FOUND: subtrackr/packages/core/src/schemas/subscription.schema.ts
- FOUND: subtrackr/apps/mobile/app/_layout.tsx
- FOUND: subtrackr/packages/core/jest.config.js
- FOUND: .planning/phases/01-foundation-manual-tracker/01-01-SUMMARY.md

All task commits verified:
- FOUND: b760a69 (T00)
- FOUND: ab02582 (T01)
- FOUND: 71f54d7 (T02)
- FOUND: e480adc (T03)

---
*Phase: 01-foundation-manual-tracker*
*Completed: 2026-04-05*
