# Phase 1: Foundation + Manual Tracker — Research

**Researched:** 2026-04-04
**Domain:** Expo + React Native monorepo, Supabase Auth, Postgres schema, RevenueCat, Expo Push Notifications
**Confidence:** HIGH (stack is locked, libraries are current, all critical claims verified against live docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Dashboard Layout**
- D-01: Monthly total displayed prominently at top by default; annual toggle to switch view.
- D-02: Subscriptions sorted by cost, highest first.
- D-03: Upcoming renewals shown as a horizontal scrollable strip below the total — next 5-7 renewals as chips.

**Onboarding Flow**
- D-04: After signup + email verification: guided "add your first subscription" prompt — prominent CTA on the dashboard, not a walkthrough.
- D-05: Empty state: friendly illustration + "Add your first subscription" button.

**Free-Tier Paywall**
- D-06: When free user tries to add a 6th subscription: paywall bottom sheet slides up.
- D-07: Persistent usage counter visible to free users: "3 of 5 subscriptions used".

**Subscription Entry UX**
- D-08: Add subscription via form with auto-suggest — user types service name, app suggests from logo library and auto-fills known details.
- D-09: Only name + amount are required fields. All other fields are optional.

### Claude's Discretion

- Exact illustration style and empty state artwork
- Loading skeleton design
- Specific animation/transition timing
- Color palette (dark mode auto-follows system setting)
- Error state copy and design
- Category icon set

### Deferred Ideas (OUT OF SCOPE)

- Natural language subscription input ("Netflix $15.99 monthly") — requires AI, Phase 2+
- Shared expenses / family plan splitting — explicitly out of scope (PROJECT.md)
- Cancel guidance and trial tracker — v2 items
- Social features — out of scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | User can sign up with email and password | Supabase Auth email/password signup — standard, well-documented |
| AUTH-02 | User receives email verification after signup | Supabase Auth email confirm flow — built-in, requires `confirmEmail: true` in project settings |
| AUTH-03 | User can log in and out | Supabase `signInWithPassword` / `signOut` — standard |
| AUTH-04 | User session persists across app restarts | `expo-secure-store` + LargeSecureStore hybrid adapter (CRITICAL — see pitfall below) |
| SUB-01 | User can view all active subscriptions in a dashboard | React Native UI with TanStack Query fetching from `subscriptions` table; RLS enforced |
| SUB-02 | User can see total monthly and annual spend | Computed client-side from subscription rows; annual toggle UI (D-01) |
| SUB-03 | User can manually add a subscription | Form with auto-suggest from logo library (D-08, D-09) |
| SUB-04 | User can edit subscription details | Edit form reusing add form; CRUD via Supabase client |
| SUB-05 | User can delete/archive a subscription | Soft-delete via `status = 'archived'`; hard delete option |
| SUB-06 | User can categorize subscriptions | Category picker; enum stored in `subscriptions.category` column |
| NOTF-01 | User receives push notification 3 days before renewal | Expo Push + pg_cron job querying `next_billing_date`; APNs/FCM credentials via EAS |
| NOTF-02 | User can configure notification preferences | Toggle stored in `profiles.notification_preferences` JSONB; read before sending |
</phase_requirements>

---

## Summary

Phase 1 is a greenfield React Native (Expo SDK 55) + Next.js monorepo project backed by Supabase. The primary technical risks in this phase are: (1) the `expo-secure-store` session size limitation that requires a hybrid LargeSecureStore adapter, (2) RevenueCat and push notifications both requiring an Expo Development Build — Expo Go will not work for either, (3) the full DB schema including future-phase tables must be migrated in a single Wave 1 step to avoid schema drift.

The standard stack is completely locked from prior research. This phase research focuses on the implementation-level details the planner needs: exact library versions (verified against npm as of 2026-04-04), the LargeSecureStore adapter pattern, the RLS policy pattern for every table, notification scheduling architecture via pg_cron + Supabase Edge Functions, and the free-tier cap enforcement pattern.

**Primary recommendation:** Build Plan 01-02 (Auth + Schema) before any UI work. Get the full DB schema migrated and RLS policies applied before touching the dashboard. This is the irreversible foundation everything else stacks on.

---

## Project Constraints (from CLAUDE.md)

This repository is currently a vanilla HTML/CSS/JS multi-project repo (`tictactoe.html`, `index.html`). SubTrackr will be a new subdirectory or a separate project. The CLAUDE.md does not forbid adding new project types. Key directives that apply:

- After every meaningful change, commit with a clear descriptive message and push to GitHub (`sarpyigitbasi/claude_code`)
- Commit at logical milestones — do not batch unrelated changes
- No build step requirement applies to EXISTING projects — SubTrackr is a new project with a build step (this is fine)
- **playwright-cli skill** is available for browser automation testing of the web app (Next.js)
- **supabase-postgres-best-practices** skill is available — MUST consult for schema design and query writing

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo | 55.0.11 | Managed workflow SDK | Current stable; includes React Native 0.83 |
| react-native | 0.83.x | iOS + Android runtime | Bundled with Expo SDK 55 |
| expo-router | 55.0.10 | File-based navigation | One router for mobile + web |
| typescript | 5.x | Type safety | Catches integration contract bugs early |
| next | 16.2.2 | Web frontend | App Router, SSR, API routes for webhooks |
| @supabase/supabase-js | 2.101.1 | Supabase client | Auth, DB, Realtime |
| expo-secure-store | 55.0.11 | Encrypted token storage | Required — AsyncStorage is unencrypted |
| @react-native-async-storage/async-storage | — | Part of LargeSecureStore hybrid | Session payload overflow storage |
| expo-notifications | 55.0.16 | Push notifications | APNs + FCM via EAS |
| expo-auth-session | 55.0.12 | OAuth flows (Phase 2+) | Built-in PKCE; needed for Gmail OAuth |
| react-native-purchases | 9.15.1 | RevenueCat IAP SDK | Mobile subscription billing |
| @tanstack/react-query | 5.96.2 | Server state + caching | Pairs perfectly with Supabase |
| zustand | 5.0.12 | Local UI state | Lightweight, no boilerplate |
| zod | 3.x | Runtime validation | Shared across mobile + web |
| @supabase/ssr | 0.10.0 | Supabase auth in Next.js App Router | Required for SSR cookie-based auth |
| @stripe/stripe-js | 9.0.1 | Stripe Checkout on web | Standard web payment integration |
| tailwindcss | 4.2.2 | Web styling | Fast iteration |
| pnpm | 10.33.0 (available) | Monorepo workspace manager | Best hoisting for RN module resolution |
| eas-cli | 18.5.0 (available) | EAS Build + Submit | Required for Dev Build (RevenueCat, notifications) |

**Version verification:** All versions confirmed against npm registry on 2026-04-04. Expo SDK 55 uses React Native 0.83 (confirmed via docs.expo.dev/versions/v55.0.0/).

### Supporting Libraries (Mobile — Phase 1 specific)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-reanimated | 4.3.0 | Smooth animations | Bottom sheets, transitions (D-06 paywall sheet) |
| react-native-safe-area-context | 5.7.0 | Safe area insets | Required with Expo Router |
| @expo/vector-icons | 15.1.1 | Icon set | Category icons (Claude's discretion) |
| nativewind | 4.2.3 | Tailwind-style styling for RN | Consistent design tokens across mobile + web |
| expo-dev-client | latest | Development Build enabler | REQUIRED for RevenueCat + Push Notifications |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| pnpm workspaces | Turborepo | Turborepo adds value at scale; pnpm alone is sufficient here |
| nativewind | StyleSheet API | StyleSheet is more verbose; nativewind shares tokens with web Tailwind |
| TanStack Query | SWR | TQ has better offline caching and mutation management |
| zustand | Redux Toolkit | Redux overhead unjustified for this app size |
| expo-notifications | OneSignal | Expo's native push is simpler; OneSignal adds cross-platform analytics at cost |

**Installation:**
```bash
# From monorepo root
pnpm init
# Configure pnpm workspaces in package.json

# Mobile app
npx create-expo-app apps/mobile --template blank-typescript
cd apps/mobile
pnpm add @supabase/supabase-js expo-secure-store @react-native-async-storage/async-storage \
  expo-notifications expo-dev-client react-native-purchases react-native-purchases-ui \
  @tanstack/react-query zustand zod react-native-reanimated nativewind

# Web app
npx create-next-app@latest apps/web --typescript --tailwind --app --src-dir

# Shared packages
mkdir -p packages/core packages/supabase

# Supabase (already installed via Homebrew)
supabase init
supabase start
```

---

## Architecture Patterns

### Recommended Project Structure

```
subscription-tracker/
├── apps/
│   ├── mobile/                    # Expo SDK 55 + React Native 0.83
│   │   ├── app/                   # Expo Router file-based routes
│   │   │   ├── (auth)/            # Public routes (login, signup)
│   │   │   ├── (tabs)/            # Authenticated tab layout
│   │   │   │   ├── index.tsx      # Dashboard
│   │   │   │   └── settings.tsx   # Notification prefs
│   │   │   └── _layout.tsx        # Root layout — RevenueCat init here
│   │   ├── components/
│   │   │   ├── dashboard/         # SubscriptionList, TotalCard, UpcomingStrip
│   │   │   ├── subscriptions/     # AddForm, EditForm, ServicePicker
│   │   │   └── paywall/           # PaywallBottomSheet
│   │   ├── hooks/                 # useSubscriptions, useEntitlements
│   │   └── lib/                   # supabase.ts, revenuecat.ts
│   └── web/                       # Next.js 15 App Router
│       ├── app/
│       │   ├── (auth)/            # Login, signup pages
│       │   ├── dashboard/         # Web dashboard
│       │   └── api/               # Route handlers (webhooks, Stripe)
│       └── components/
├── packages/
│   ├── core/                      # Shared Zod schemas, TypeScript types
│   │   ├── schemas/               # subscription.schema.ts, profile.schema.ts
│   │   └── types/                 # Database.ts (generated from Supabase)
│   └── supabase/                  # Supabase client factory
│       └── client.ts              # LargeSecureStore adapter + createClient
├── supabase/
│   ├── functions/                 # Edge Functions
│   │   ├── send-renewal-reminders/  # pg_cron triggered notification sender
│   │   └── revenuecat-webhook/    # Entitlement sync stub
│   ├── migrations/                # SQL migration files
│   └── seed.sql
└── package.json                   # pnpm workspaces root
```

### Pattern 1: LargeSecureStore Adapter (CRITICAL)

**What:** Hybrid storage adapter that uses `expo-secure-store` for an AES-256 encryption key, and `AsyncStorage` for the encrypted session payload. Required because `expo-secure-store` has a 2048-byte value limit and Supabase session tokens routinely exceed this.

**When to use:** Always — this is the only correct storage adapter for Supabase auth in Expo.

**Example:**
```typescript
// packages/supabase/client.ts
// Source: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as aesjs from 'aes-js'
import 'react-native-get-random-values'

class LargeSecureStore {
  private async _encrypt(key: string, value: string) {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8))
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1))
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value))
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey))
    return aesjs.utils.hex.fromBytes(encryptedBytes)
  }
  private async _decrypt(key: string, value: string) {
    const encryptionKeyHex = await SecureStore.getItemAsync(key)
    if (!encryptionKeyHex) return null
    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1)
    )
    return aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(value)))
  }
  async getItem(key: string) {
    const encrypted = await AsyncStorage.getItem(key)
    if (!encrypted) return null
    return this._decrypt(key, encrypted)
  }
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key)
    await SecureStore.deleteItemAsync(key)
  }
  async setItem(key: string, value: string) {
    const encrypted = await this._encrypt(key, value)
    await AsyncStorage.setItem(key, encrypted)
  }
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: new LargeSecureStore(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // MUST be false on native
    },
  }
)
```

Additional deps: `pnpm add aes-js react-native-get-random-values`

### Pattern 2: RevenueCat Initialization

**What:** Initialize RevenueCat in root `_layout.tsx` before any navigation renders. Identify user with Supabase UID immediately after sign-in.

**When to use:** Root layout, and in the auth state change listener.

**Example:**
```typescript
// apps/mobile/app/_layout.tsx
// Source: https://www.revenuecat.com/docs/getting-started/installation/expo
import Purchases, { LOG_LEVEL } from 'react-native-purchases'

// In root layout useEffect:
if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG)
Purchases.configure({
  apiKey: Platform.select({
    ios: process.env.EXPO_PUBLIC_RC_IOS_KEY!,
    android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY!,
  })!,
})

// After Supabase auth.onAuthStateChange fires SIGNED_IN:
const { data: { user } } = await supabase.auth.getUser()
if (user) await Purchases.logIn(user.id)

// On SIGNED_OUT:
await Purchases.logOut()
```

**Note:** RevenueCat's "Preview API Mode" works in Expo Go for UI development, but actual purchases and full entitlement sync require an Expo Development Build via EAS.

### Pattern 3: RLS Policy — Apply to Every User-Data Table

**What:** Row Level Security policies that restrict each table to its owner via `auth.uid() = user_id`.

**When to use:** Every table that contains user data — no exceptions.

**Example:**
```sql
-- Apply this pattern to: profiles, subscriptions, email_evidence,
-- transaction_evidence, detection_feedback, sync_jobs, integrations, user_entitlements
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Service role (used only by Edge Functions) bypasses RLS. The anon key (used by the mobile/web client) is subject to RLS.

### Pattern 4: Free-Tier Cap Enforcement

**What:** Gate the 6th subscription insertion at the database level using a function + trigger, and in the app UI (D-06, D-07).

**When to use:** On every `INSERT` to `subscriptions` table; UI check before showing the form.

**Example:**
```sql
-- Database-level guard (prevents API bypass of free limit)
CREATE OR REPLACE FUNCTION check_subscription_limit()
RETURNS TRIGGER AS $$
DECLARE
  sub_count int;
  is_pro boolean;
BEGIN
  SELECT COUNT(*) INTO sub_count
  FROM public.subscriptions
  WHERE user_id = NEW.user_id AND status = 'active';

  SELECT EXISTS (
    SELECT 1 FROM public.user_entitlements
    WHERE user_id = NEW.user_id AND entitlement = 'pro' AND is_active = true
  ) INTO is_pro;

  IF sub_count >= 5 AND NOT is_pro THEN
    RAISE EXCEPTION 'FREE_TIER_LIMIT_REACHED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_subscription_limit
  BEFORE INSERT ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION check_subscription_limit();
```

App reads the error code `FREE_TIER_LIMIT_REACHED` and triggers the paywall bottom sheet (D-06).

### Pattern 5: Notification Scheduling via pg_cron

**What:** Supabase pg_cron job runs daily to find subscriptions renewing in 3 days and enqueue push notifications.

**When to use:** Phase 1 notification delivery architecture for NOTF-01.

**Example:**
```sql
-- Enable pg_cron extension (Supabase dashboard: Database > Extensions)
-- Schedule: daily at 9am UTC
SELECT cron.schedule(
  'send-renewal-reminders',
  '0 9 * * *',
  $$
    INSERT INTO public.sync_jobs (user_id, job_type, metadata)
    SELECT DISTINCT s.user_id, 'renewal_reminder',
      jsonb_build_object(
        'subscription_id', s.id,
        'service_name', s.service_name,
        'amount', s.amount,
        'renewal_date', s.next_billing_date
      )
    FROM public.subscriptions s
    JOIN public.profiles p ON p.id = s.user_id
    WHERE s.status = 'active'
      AND s.next_billing_date = CURRENT_DATE + INTERVAL '3 days'
      AND (p.notification_preferences->>'renewal_reminders')::boolean IS NOT FALSE
  $$
);
```

An Edge Function polls `sync_jobs` for `job_type = 'renewal_reminder'` and calls the Expo Push API.

### Anti-Patterns to Avoid

- **Simple SecureStore adapter:** The naive `SecureStore.getItemAsync/setItemAsync` adapter silently truncates session tokens > 2048 bytes, causing random auth failures. Always use the LargeSecureStore hybrid pattern.
- **AsyncStorage without encryption:** Tokens visible in device backups. Never use AsyncStorage directly for auth storage.
- **RLS added later:** RLS must be applied in the same migration that creates the table. Retrofitting RLS after data exists risks gaps.
- **Skipping `SECURITY DEFINER` on trigger functions:** Without it, the function runs with user permissions and can't check `user_entitlements` if RLS is enabled on that table.
- **Building the schema incrementally across phases:** All tables (including evidence tables, integrations, sync_jobs) must be created in Plan 01-02 even though they won't be populated until Phase 2. Migrations are hard to reverse.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Secure token storage | Custom encryption | LargeSecureStore (expo-secure-store + AsyncStorage hybrid) | Session size limit; encryption already solved |
| In-app purchases | Custom StoreKit/Play Billing wrapper | react-native-purchases (RevenueCat) | Receipt validation, entitlement sync, webhook handling — months of work |
| Auth session management | Manual JWT refresh loop | Supabase `autoRefreshToken: true` + LargeSecureStore | Supabase handles refresh timing and rotation |
| Push notification token registration | Manual APNs/FCM registration | expo-notifications + EAS credentials | EAS handles certificate provisioning; expo-notifications handles cross-platform token management |
| Free-tier enforcement | Client-only count check | DB trigger + client check | Client-only can be bypassed; trigger is the safety net |
| Subscription count queries | Raw SQL in components | TanStack Query hooks with Supabase client | Caching, background refetch, optimistic updates |
| Date-based notification scheduling | Cron in application server | pg_cron + Edge Function | No separate server needed; Supabase has it built-in |
| Service logo lookup | Custom logo scraper | Static JSON library (bundled, top 150-200 services) | Runtime scraping is slow and fragile; static bundle is instant |

**Key insight:** RevenueCat, expo-notifications, and Supabase Auth each solve problems that would take months to replicate at production quality. The dev time for this phase is in the UI and schema design, not infrastructure.

---

## Common Pitfalls

### Pitfall 1: expo-secure-store 2048-byte Session Limit

**What goes wrong:** Developer uses the simple `SecureStore.getItemAsync/setItemAsync` adapter from older tutorials. Supabase session tokens (access_token + refresh_token + metadata) can exceed 2048 bytes. When they do, storage silently fails or throws, causing "user is randomly logged out" bugs that are extremely hard to reproduce because they only happen with specific session payload sizes.

**Why it happens:** expo-secure-store wraps iOS Keychain and Android Keystore, both of which have item size limits. The limit is not always enforced consistently across OS versions.

**How to avoid:** Always use the LargeSecureStore hybrid pattern. This is documented in the Supabase official Expo tutorial (supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native). Never use the simple adapter.

**Warning signs:** Users report being logged out after background/foreground cycles on real devices but not during development.

**Confidence:** HIGH — verified against official Supabase docs 2026-04-04.

### Pitfall 2: RevenueCat + Push Notifications Require Dev Build, Not Expo Go

**What goes wrong:** Developer builds Plan 01-04 features (RevenueCat, push notifications) in Expo Go. RevenueCat has a "Preview API Mode" that loads without errors in Expo Go — purchases don't work, but initialization doesn't crash. Push notifications silently fail in Expo Go. The app appears to work until tested on a real build.

**Why it happens:** Both `react-native-purchases` and `expo-notifications` use native modules that Expo Go sandboxes. RevenueCat's Preview API Mode is specifically designed to not throw in Expo Go, masking the problem.

**How to avoid:** Set up EAS and run `eas build --profile development` before implementing Plan 01-04. Install `expo-dev-client` in Plan 01-01 as part of the monorepo scaffold.

**Warning signs:** RevenueCat never fires its webhook even after completing a "purchase" in development.

**Confidence:** HIGH — verified against RevenueCat Expo docs 2026-04-04.

### Pitfall 3: Missing `detectSessionInUrl: false` on Native

**What goes wrong:** The Supabase client is initialized with default settings. On native, Supabase tries to detect session tokens from URL hash fragments (a web pattern). This either causes errors or creates subtle session handling bugs.

**Why it happens:** The `@supabase/supabase-js` client defaults are designed for web. `detectSessionInUrl: true` (the default) makes sense for web OAuth redirects but is invalid in a React Native context.

**How to avoid:** Always set `detectSessionInUrl: false` in the Supabase client config when running on native.

**Warning signs:** Auth flows that work on web fail on mobile with confusing error messages.

**Confidence:** HIGH — documented behavior in Supabase JS client.

### Pitfall 4: RLS Bypass via Service Role Key Exposure

**What goes wrong:** The Supabase service role key (bypasses all RLS) is accidentally included in the mobile app bundle via `EXPO_PUBLIC_` prefixed environment variables. All user data becomes accessible to anyone who extracts the key from the app binary.

**Why it happens:** Developer uses `EXPO_PUBLIC_SUPABASE_SERVICE_KEY` in env vars to "fix" RLS issues quickly. `EXPO_PUBLIC_` variables are compiled into the bundle and visible via reverse engineering.

**How to avoid:** The mobile app must ONLY ever have the anon key (`EXPO_PUBLIC_SUPABASE_ANON_KEY`). The service role key belongs only in Edge Functions (via Deno env, not bundled). RLS errors should be fixed by correcting policies, not bypassing them.

**Warning signs:** Any `EXPO_PUBLIC_` variable with "service" or "secret" in the name.

**Confidence:** HIGH — Expo's documentation explicitly warns about `EXPO_PUBLIC_` variable exposure.

### Pitfall 5: Schema Migration Order and Missing Future-Phase Tables

**What goes wrong:** Plan 01-02 only creates the tables needed for Phase 1 (profiles, subscriptions, user_entitlements). Phase 2 tries to add `email_evidence`, `integrations`, `sync_jobs` — but there are now production users with active subscriptions. Adding columns and foreign keys to live tables requires careful migration management.

**Why it happens:** "We'll add it when we need it" thinking. DB schema migrations are irreversible and risky on live data.

**How to avoid:** Create ALL tables in Plan 01-02's migration — including `email_evidence`, `transaction_evidence`, `detection_feedback`, `sync_jobs`, `integrations` — even though they will be empty until Phase 2. This is explicitly required by the CONTEXT.md.

**Warning signs:** Plan 01-02 migration file doesn't include `email_evidence` or `integrations` tables.

**Confidence:** HIGH — architectural requirement from CONTEXT.md.

### Pitfall 6: Notification Token Not Stored Per-User

**What goes wrong:** The app registers a push notification token with Expo, but doesn't store it in the `profiles` table. The pg_cron job can't send notifications because it has no way to look up which Expo push token belongs to which user.

**Why it happens:** Expo notification setup tutorials focus on the client side; storing the token server-side is a separate step that's often overlooked.

**How to avoid:** On every app launch (after auth), call `expo-notifications`' `getExpoPushTokenAsync()` and upsert the result into `profiles.expo_push_token`. Add a `expo_push_token` column to the `profiles` table in Plan 01-02's migration.

**Warning signs:** The Edge Function for sending notifications has no way to look up the push token.

**Confidence:** HIGH — standard requirement for server-triggered push notifications.

---

## Code Examples

Verified patterns from official sources:

### Full DB Schema Migration (Plan 01-02)

```sql
-- Source: ARCHITECTURE.md (existing project research) + Supabase docs
-- supabase/migrations/00001_initial_schema.sql

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  expo_push_token TEXT,                          -- for NOTF-01
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed_at TIMESTAMPTZ,
  notification_preferences JSONB DEFAULT '{"renewal_reminders": true}'::JSONB
);

-- Subscriptions (canonical record)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  normalized_name TEXT,
  amount NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  billing_frequency TEXT CHECK (billing_frequency IN ('weekly','monthly','quarterly','annual','unknown')),
  next_billing_date DATE,
  last_billing_date DATE,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','paused','archived','unknown')),
  cancellation_url TEXT,
  confidence NUMERIC(4, 3),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('email','bank','email+bank','manual')),
  confirmed_by_user BOOLEAN,
  confirmed_at TIMESTAMPTZ,
  logo_key TEXT,                                 -- key into static logo library
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, normalized_name)
);

-- Integrations (Gmail + Plaid — populated Phase 2+)
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_synced_at TIMESTAMPTZ,
  sync_cursor TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider, provider_account_id)
);

-- Email evidence (populated Phase 2+)
CREATE TABLE public.email_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
  gmail_message_id TEXT NOT NULL,
  gmail_thread_id TEXT,
  received_at TIMESTAMPTZ,
  subject TEXT,
  from_address TEXT,
  extracted_data JSONB,
  llm_confidence NUMERIC(4, 3),
  llm_model TEXT,
  processing_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, gmail_message_id)
);

-- Transaction evidence (populated Phase 3+)
CREATE TABLE public.transaction_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
  plaid_transaction_id TEXT NOT NULL,
  plaid_stream_id TEXT,
  merchant_name TEXT,
  amount NUMERIC(10, 2),
  transaction_date DATE,
  plaid_category TEXT[],
  personal_finance_category JSONB,
  plaid_frequency TEXT,
  plaid_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plaid_transaction_id)
);

-- Detection feedback (populated Phase 2+)
CREATE TABLE public.detection_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('confirmed','rejected','edited')),
  previous_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync jobs (pg_cron + webhook job queue)
CREATE TABLE public.sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User entitlements (RevenueCat + Stripe webhook sink)
CREATE TABLE public.user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entitlement TEXT NOT NULL,                     -- 'pro'
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  platform TEXT,                                 -- 'ios', 'android', 'web'
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entitlement)
);

-- Indexes
CREATE INDEX idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_next_billing ON public.subscriptions(next_billing_date) WHERE status = 'active';
CREATE INDEX idx_sync_jobs_pending ON public.sync_jobs(status, created_at) WHERE status = 'pending';
CREATE INDEX idx_user_entitlements_active ON public.user_entitlements(user_id, entitlement) WHERE is_active = true;

-- RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detection_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

-- RLS policies (same pattern for each table)
CREATE POLICY "Users manage own profiles"
  ON public.profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage own subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- (repeat for all tables)

-- Free tier trigger
CREATE OR REPLACE FUNCTION check_subscription_limit()
RETURNS TRIGGER AS $$
DECLARE
  sub_count INT;
  is_pro BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO sub_count
  FROM public.subscriptions
  WHERE user_id = NEW.user_id AND status IN ('active', 'paused');

  SELECT EXISTS (
    SELECT 1 FROM public.user_entitlements
    WHERE user_id = NEW.user_id AND entitlement = 'pro' AND is_active = TRUE
  ) INTO is_pro;

  IF sub_count >= 5 AND NOT is_pro THEN
    RAISE EXCEPTION 'FREE_TIER_LIMIT_REACHED'
      USING HINT = 'Upgrade to Pro to add unlimited subscriptions';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_subscription_limit
  BEFORE INSERT ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION check_subscription_limit();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER user_entitlements_updated_at BEFORE UPDATE ON public.user_entitlements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### RevenueCat Webhook Stub (Plan 01-04)

```typescript
// supabase/functions/revenuecat-webhook/index.ts
// Source: https://www.revenuecat.com/docs/integrations/webhooks
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  // Verify RevenueCat shared secret
  if (authHeader !== `Bearer ${Deno.env.get('REVENUECAT_WEBHOOK_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const event = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Stub: log and return 200 — entitlement logic wired in Phase 4
  console.log('RevenueCat event:', event.event?.type, event.event?.app_user_id)
  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
```

### Expo Push Notification Token Registration

```typescript
// apps/mobile/hooks/usePushNotifications.ts
import * as Notifications from 'expo-notifications'
import { supabase } from '../lib/supabase'

export async function registerPushToken() {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
  })

  await supabase
    .from('profiles')
    .update({ expo_push_token: token.data })
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AsyncStorage for Supabase tokens | LargeSecureStore hybrid (SecureStore + AsyncStorage encrypted) | ~2023 | Secure token storage; avoids backup exposure |
| `transactions/get` (Plaid) | `transactions/sync` with cursor | 2022 | More efficient incremental sync; old endpoint deprecated |
| Expo Go for all development | Expo Dev Build for native modules | ~2022 | RevenueCat, push notifications, Plaid all require Dev Build |
| Manual IAP implementation | RevenueCat SDK | 2020+ | Handles receipt validation, webhooks, entitlements |
| Next.js Pages Router | App Router (Next.js 13+) | 2023 | Better SSR, nested layouts, server components |
| Expo SDK 51 | Expo SDK 55 | 2025 | React Native 0.83; improved bridgeless architecture |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr` — do not use the old package
- Expo Go for RevenueCat: Preview API Mode exists but is development-only; always use Dev Build
- Simple SecureStore adapter for Supabase: Use LargeSecureStore hybrid

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Everything | ✓ | v25.9.0 | — |
| npm | Package management | ✓ | 11.12.1 | — |
| pnpm | Monorepo workspaces | ✓ | 10.33.0 | Use npm workspaces (suboptimal for RN) |
| Supabase CLI | DB migrations, local dev | ✓ | 2.84.2 | — |
| EAS CLI | Dev Build, Push credentials | ✓ | 18.5.0 | — |
| Expo CLI | Project scaffolding | ✗ (not global) | — | Use `npx expo` — fully supported |
| iOS Simulator | Mobile dev testing | macOS (darwin) — likely ✓ | — | Use Android Emulator as alternative |
| Android Studio/Emulator | Android testing | Not verified | — | Use iOS Simulator; verify separately |

**Missing dependencies with no fallback:**
- None — all critical tools are available.

**Missing dependencies with fallback:**
- `expo` global CLI: Not installed globally, but `npx expo` works identically — no action needed.
- Android Emulator: Status not verified — iOS Simulator on macOS is primary dev target; Android can be verified separately.

**Key note:** Push notifications require a REAL DEVICE (not simulator/emulator). Plan 01-04 testing must include a physical iOS or Android device. This is a hard limitation of APNs/FCM — emulators do not support push.

---

## Validation Architecture

`nyquist_validation: true` in `.planning/config.json` — validation section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest + React Native Testing Library (mobile); Jest + React Testing Library (web) |
| Config file | `apps/mobile/jest.config.ts` (Wave 0 gap), `apps/web/jest.config.ts` (Wave 0 gap) |
| Quick run command | `pnpm --filter mobile test --passWithNoTests` |
| Full suite command | `pnpm test` (all workspaces) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Email/password signup creates user + profile | integration | `pnpm --filter mobile test auth.test` | ❌ Wave 0 |
| AUTH-02 | Email verification flow (deep link) | manual-only | — | Manual — requires real email |
| AUTH-03 | Login + logout clears session | unit | `pnpm --filter mobile test auth.test` | ❌ Wave 0 |
| AUTH-04 | Session persists across app restart | integration | `pnpm --filter mobile test session.test` | ❌ Wave 0 |
| SUB-01 | Dashboard renders subscriptions from DB | unit | `pnpm --filter mobile test dashboard.test` | ❌ Wave 0 |
| SUB-02 | Monthly/annual totals calculate correctly | unit | `pnpm --filter mobile test totals.test` | ❌ Wave 0 |
| SUB-03 | Add subscription inserts row + updates UI | integration | `pnpm --filter mobile test subscriptions.test` | ❌ Wave 0 |
| SUB-04 | Edit subscription updates row | integration | `pnpm --filter mobile test subscriptions.test` | ❌ Wave 0 |
| SUB-05 | Delete/archive sets status correctly | unit | `pnpm --filter mobile test subscriptions.test` | ❌ Wave 0 |
| SUB-06 | Category picker saves category | unit | `pnpm --filter mobile test subscriptions.test` | ❌ Wave 0 |
| NOTF-01 | pg_cron query selects correct renewals (3-day window) | unit (SQL) | `supabase test db` | ❌ Wave 0 |
| NOTF-02 | Notification preference toggle persists | unit | `pnpm --filter mobile test notifications.test` | ❌ Wave 0 |

**manual-only justification:** AUTH-02 (email verification) requires a real email inbox and click-through — cannot be automated in unit/integration tests. Smoke test manually after each deploy to staging.

### Sampling Rate

- **Per task commit:** `pnpm --filter mobile test --passWithNoTests` (quick unit suite)
- **Per wave merge:** `pnpm test` (full suite, all workspaces)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/mobile/jest.config.ts` — Jest config for React Native + Expo
- [ ] `apps/mobile/__tests__/auth.test.ts` — covers AUTH-01, AUTH-03
- [ ] `apps/mobile/__tests__/session.test.ts` — covers AUTH-04
- [ ] `apps/mobile/__tests__/dashboard.test.ts` — covers SUB-01
- [ ] `apps/mobile/__tests__/totals.test.ts` — covers SUB-02
- [ ] `apps/mobile/__tests__/subscriptions.test.ts` — covers SUB-03, SUB-04, SUB-05, SUB-06
- [ ] `apps/mobile/__tests__/notifications.test.ts` — covers NOTF-02
- [ ] `supabase/tests/schema.test.sql` — covers NOTF-01 (pg_cron query correctness), RLS policy verification
- [ ] Framework install: `pnpm add -D jest @testing-library/react-native @testing-library/jest-native` in `apps/mobile`

---

## Open Questions

1. **Supabase project: existing or new?**
   - What we know: Supabase CLI 2.84.2 is installed; `supabase init` will create a new local project.
   - What's unclear: Whether a Supabase cloud project for SubTrackr has already been created or needs to be created as Plan 01-01.
   - Recommendation: Plan 01-01 should include a step to create the Supabase cloud project and capture the project URL + anon key into env files.

2. **EAS project ID for push notifications**
   - What we know: `getExpoPushTokenAsync` requires `projectId` (the EAS project ID).
   - What's unclear: Whether the EAS project for SubTrackr has been registered yet.
   - Recommendation: Plan 01-01 must include `eas init` to register the project and obtain the `EXPO_PUBLIC_EAS_PROJECT_ID` value.

3. **RevenueCat dashboard products**
   - What we know: RevenueCat SDK is initialized in Plan 01-04; entitlement identifier is `'pro'`.
   - What's unclear: Whether RevenueCat products and entitlements need to be configured in the RevenueCat dashboard before the app code can be fully tested.
   - Recommendation: Plan 01-04 should include a manual step to configure RevenueCat dashboard (product IDs, `pro` entitlement) — this is a developer action, not code. The webhook stub can be tested without live products.

4. **Monorepo root location**
   - What we know: This repo is at `/Users/sarpyigitbasi/Desktop/CLAUDE-CODE` and currently contains `tictactoe.html` + `index.html`.
   - What's unclear: Whether SubTrackr should live as a subdirectory of this repo (e.g., `apps/subtrackr/`) or in a new repository.
   - Recommendation: Create a subdirectory `subtrackr/` in this repo to keep everything under version control at `sarpyigitbasi/claude_code`, consistent with CLAUDE.md git workflow guidance.

---

## Sources

### Primary (HIGH confidence)

- Supabase Expo React Native tutorial — LargeSecureStore pattern verified (supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native), 2026-04-04
- Expo SDK version docs — SDK 55 = React Native 0.83 (docs.expo.dev/versions/v55.0.0/), 2026-04-04
- RevenueCat Expo docs — Dev Build requirement confirmed (revenuecat.com/docs/getting-started/installation/expo), 2026-04-04
- Expo Push Notifications setup — Expo Go not supported, EAS required (docs.expo.dev/push-notifications/push-notifications-setup/), 2026-04-04
- Supabase Vault API — current syntax verified (supabase.com/docs/guides/database/vault), 2026-04-04
- npm registry — all package versions verified against current registry, 2026-04-04

### Secondary (MEDIUM confidence)

- Prior project research: `.planning/research/STACK.md`, `ARCHITECTURE.md`, `PITFALLS.md`, `FEATURES.md` — drawn from training data August 2025; stack decisions validated

### Tertiary (LOW confidence)

- pg_cron API syntax: Based on Supabase documentation patterns; verify `cron.schedule` function signature in Supabase dashboard before implementing.
- Android Emulator push notification support: Not tested in this environment — use real device for NOTF-01 verification.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry 2026-04-04
- Architecture patterns: HIGH — LargeSecureStore and RevenueCat patterns verified against official docs
- DB schema: HIGH — based on existing project research (ARCHITECTURE.md) + Supabase conventions
- Notification scheduling: MEDIUM — pg_cron pattern is standard; exact syntax should be verified in Supabase dashboard
- Pitfalls: HIGH — SecureStore limit, Dev Build requirement, RLS patterns all verified against official sources

**Research date:** 2026-04-04
**Valid until:** 2026-07-04 (stable stack — Expo SDK and Supabase versions change slowly; re-verify if > 90 days)
