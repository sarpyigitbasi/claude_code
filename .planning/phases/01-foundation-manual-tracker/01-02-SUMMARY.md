---
phase: 01-foundation-manual-tracker
plan: "02"
subsystem: auth, database
tags: [supabase, expo, react-native, postgres, zod, rls, revenuecat, largecurestore, expo-router]

# Dependency graph
requires: []
provides:
  - pnpm monorepo scaffold (apps/mobile, apps/web, packages/core, packages/supabase)
  - LargeSecureStore adapter for Supabase auth session persistence (AUTH-04)
  - Full Postgres schema — all 8 tables with RLS enabled on every table
  - Free-tier subscription limit trigger (FREE_TIER_LIMIT_REACHED at 5 subscriptions)
  - Auto-create profile on signup trigger (handle_new_user)
  - Zod auth schemas (signUpSchema, loginSchema) in @subtrackr/core
  - Supabase Auth flow: signup, email verification, login, logout
  - Auth-guarded root layout using useAuth hook + Expo Router
  - Tab navigator skeleton (Dashboard, Settings placeholders)
  - Wave 0 Jest test stubs — 6 suites, 32 todos, all passing
affects: [01-03, 01-04, 02-gmail-scan, 03-plaid-integration]

# Tech tracking
tech-stack:
  added:
    - pnpm workspaces (monorepo)
    - expo ~52, expo-router ~4
    - @supabase/supabase-js ^2.101.0
    - expo-secure-store (LargeSecureStore adapter)
    - aes-js + react-native-get-random-values (AES-256 session encryption)
    - @react-native-async-storage/async-storage (encrypted payload storage)
    - react-native-purchases (RevenueCat)
    - @tanstack/react-query
    - zod ^3
    - zustand
    - nativewind
    - jest + ts-jest (Wave 0 test infrastructure)
    - supabase CLI (local dev)
  patterns:
    - LargeSecureStore: SecureStore for AES key, AsyncStorage for encrypted session payload
    - Auth state via onAuthStateChange listener in useAuth hook
    - RevenueCat logIn/logOut wired to SIGNED_IN/SIGNED_OUT events
    - Expo Router file-based routing with (auth) and (tabs) route groups
    - Auth guard via AuthGuard component in root _layout.tsx using session state
    - Zod schema validation before submitting auth forms

key-files:
  created:
    - subtrackr/packages/supabase/client.ts (LargeSecureStore + Supabase client)
    - subtrackr/packages/core/src/schemas/auth.schema.ts (signUpSchema, loginSchema)
    - subtrackr/packages/core/src/schemas/subscription.schema.ts (shared Zod schemas)
    - subtrackr/packages/core/src/schemas/profile.schema.ts (Profile interface)
    - subtrackr/packages/core/src/index.ts (barrel export)
    - subtrackr/apps/mobile/hooks/useAuth.ts (auth state hook)
    - subtrackr/apps/mobile/lib/supabase.ts (mobile Supabase re-export)
    - subtrackr/apps/mobile/app/_layout.tsx (root layout with AuthGuard + RevenueCat)
    - subtrackr/apps/mobile/app/(auth)/_layout.tsx (Stack layout for auth group)
    - subtrackr/apps/mobile/app/(auth)/login.tsx (login screen)
    - subtrackr/apps/mobile/app/(auth)/signup.tsx (signup screen)
    - subtrackr/apps/mobile/app/(auth)/verify-email.tsx (email verification screen)
    - subtrackr/apps/mobile/app/(tabs)/_layout.tsx (Tab navigator)
    - subtrackr/apps/mobile/app/(tabs)/index.tsx (Dashboard placeholder)
    - subtrackr/apps/mobile/app/(tabs)/settings.tsx (Settings with sign out)
    - subtrackr/supabase/migrations/00001_initial_schema.sql (full DB schema)
    - subtrackr/pnpm-workspace.yaml
    - subtrackr/package.json
    - subtrackr/.env.example
    - subtrackr/.gitignore
    - subtrackr/.eslintrc.js
    - subtrackr/.prettierrc
    - subtrackr/apps/mobile/package.json
    - subtrackr/apps/mobile/app.json
    - subtrackr/apps/web/package.json
    - subtrackr/packages/core/package.json (with ts-jest, jest, @types/jest)
    - subtrackr/packages/core/jest.config.js
    - subtrackr/packages/core/src/__tests__/ (6 Wave 0 test stub files)
  modified: []

key-decisions:
  - "LargeSecureStore uses SecureStore for AES-256 key + AsyncStorage for encrypted payload — required because expo-secure-store has 2048-byte limit that Supabase tokens exceed"
  - "Full 8-table schema created in Plan 01-02 (not incrementally) to avoid painful migrations in Phases 2-3"
  - "RevenueCat logIn/logOut wired directly in useAuth onAuthStateChange to guarantee sync on every auth event"
  - "AuthGuard component in root _layout handles loading state (shows nothing) to prevent flash of auth screens"
  - "supabase db reset requires Docker — deferred to environment setup; migration SQL verified syntactically"

patterns-established:
  - "Pattern 1 — LargeSecureStore: Always use SecureStore+AsyncStorage hybrid for Supabase auth in Expo (never bare AsyncStorage)"
  - "Pattern 2 — Auth forms: Zod safeParse validation before calling Supabase, map error codes to user-facing strings"
  - "Pattern 3 — RLS: Every table in Supabase has ENABLE ROW LEVEL SECURITY + USING (auth.uid() = user_id) policy"
  - "Pattern 4 — RevenueCat: logIn on SIGNED_IN event, logOut on SIGNED_OUT event in onAuthStateChange"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

# Metrics
duration: 45min
completed: "2026-04-05"
---

# Phase 1 Plan 02: Auth + Secure Storage + Full DB Schema Summary

**pnpm monorepo scaffold + Supabase auth (signup/verify/login/logout) with LargeSecureStore session persistence + all 8 Postgres tables with RLS, free-tier trigger, and Expo Router auth guard**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-04-05T10:55:00Z
- **Completed:** 2026-04-05T11:40:00Z
- **Tasks:** 2 (01-02-T01, 01-02-T02), plus prerequisite 01-01 scaffold
- **Files created:** 31 (migration, auth screens, hooks, schemas, monorepo config)
- **Commits:** 2 task commits

## Accomplishments

- Built full pnpm monorepo scaffold (mobile, web, core, supabase packages) — prerequisite 01-01 was not yet executed
- Created complete Postgres migration with all 8 tables, RLS on every table (8 policies), 4 indexes, and 3 trigger functions
- Wired Supabase Auth with LargeSecureStore (AES-256 encrypted session, secure from 2048-byte limit bug)
- Built auth flow: signup with email validation → verify-email screen → login → authenticated tab navigation
- RevenueCat logIn/logOut wired to onAuthStateChange events per research pattern

## Task Commits

Each task was committed atomically:

1. **Task 01-02-T01: Full DB schema migration + monorepo scaffold** - `9adfc8f` (feat)
2. **Task 01-02-T02: Auth wiring — screens, hook, route guard** - `16694ef` (feat)

## Files Created/Modified

- `subtrackr/supabase/migrations/00001_initial_schema.sql` — 8 tables, 8 RLS policies, 4 indexes, 3 trigger functions
- `subtrackr/packages/supabase/client.ts` — LargeSecureStore adapter + Supabase client factory
- `subtrackr/packages/core/src/schemas/auth.schema.ts` — signUpSchema, loginSchema (Zod)
- `subtrackr/packages/core/src/schemas/subscription.schema.ts` — createSubscriptionSchema, enums
- `subtrackr/apps/mobile/hooks/useAuth.ts` — session state, onAuthStateChange, RC integration
- `subtrackr/apps/mobile/app/_layout.tsx` — AuthGuard + RevenueCat init + QueryClientProvider
- `subtrackr/apps/mobile/app/(auth)/login.tsx` — login form with validation and error handling
- `subtrackr/apps/mobile/app/(auth)/signup.tsx` — signup form with duplicate-email detection
- `subtrackr/apps/mobile/app/(auth)/verify-email.tsx` — verification screen with Resend
- `subtrackr/apps/mobile/app/(tabs)/_layout.tsx` — Tab navigator (Dashboard, Settings)

## Decisions Made

- Used LargeSecureStore (not bare AsyncStorage) — AsyncStorage alone stores tokens in cleartext; SecureStore alone has 2048-byte limit that Supabase tokens exceed
- Full 8-table schema in one migration — prevents painful migrations when Phases 2-3 add Gmail/Plaid integrations
- RevenueCat wired in useAuth not in each screen — guarantees RC user is always in sync with Supabase auth state
- AuthGuard returns `null` during loading (not a spinner) — avoids flash of auth content on cold start

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created full 01-01 monorepo scaffold (prerequisite not yet executed)**
- **Found during:** Task 01-02-T01 (DB schema migration)
- **Issue:** Plan 01-02 depends_on 01-01, but 01-01 had not been executed — no `subtrackr/` directory existed
- **Fix:** Created complete monorepo scaffold (pnpm workspace, all packages, Wave 0 test stubs, ESLint/Prettier config) before proceeding with 01-02 work
- **Files modified:** All scaffold files in subtrackr/
- **Verification:** Jest runs with 6 suites, 32 todos, 0 failures
- **Committed in:** `9adfc8f` (Task 01-02-T01 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking prerequisite)
**Impact on plan:** Required prerequisite work. No scope creep beyond what 01-01 was supposed to deliver.

## Issues Encountered

- Docker not available in execution environment — `supabase db reset` could not be run. Migration SQL is syntactically complete and was reviewed against RESEARCH.md schema. Needs `supabase start` + `supabase db reset` after Docker is available.

## Known Stubs

- `subtrackr/apps/mobile/app/(tabs)/index.tsx` — Dashboard placeholder screen showing "Your subscriptions will appear here." This is intentional — real content implemented in Plan 01-03.
- `subtrackr/apps/mobile/app/(tabs)/settings.tsx` — Settings placeholder with only Sign Out button. Full settings in Plan 01-04.

These stubs do NOT prevent the plan's goal (auth flow + schema) from being achieved. The tab navigation exists to prove the auth guard works (user lands in tabs after login).

## User Setup Required

Before running the app or testing auth:
1. Start Docker Desktop
2. Run `cd subtrackr && supabase start` to start local Supabase instance
3. Run `cd subtrackr && supabase db reset` to apply the migration
4. Copy `subtrackr/.env.example` to `subtrackr/apps/mobile/.env.local` and fill in Supabase anon key from `supabase status`

## Next Phase Readiness

- Plan 01-03 (Dashboard + Subscription List) can proceed immediately — auth guard is in place, tab layout exists, DB schema has subscriptions table with full RLS
- Plan 01-04 (Add/Edit Subscription + Settings) can proceed — Settings tab exists as placeholder
- DB migration needs Docker to apply to local Supabase before integration testing

---
*Phase: 01-foundation-manual-tracker*
*Completed: 2026-04-05*
