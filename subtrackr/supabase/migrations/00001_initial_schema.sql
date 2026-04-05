-- Source: ARCHITECTURE.md (existing project research) + Supabase docs
-- supabase/migrations/00001_initial_schema.sql

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  expo_push_token TEXT,
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
  logo_key TEXT,
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
  entitlement TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  platform TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entitlement)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_next_billing ON public.subscriptions(next_billing_date) WHERE status = 'active';
CREATE INDEX idx_sync_jobs_pending ON public.sync_jobs(status, created_at) WHERE status = 'pending';
CREATE INDEX idx_user_entitlements_active ON public.user_entitlements(user_id, entitlement) WHERE is_active = true;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detection_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

CREATE POLICY "Users manage own profiles"
  ON public.profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage own subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own integrations"
  ON public.integrations FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own email_evidence"
  ON public.email_evidence FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own transaction_evidence"
  ON public.transaction_evidence FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own detection_feedback"
  ON public.detection_feedback FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own sync_jobs"
  ON public.sync_jobs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own user_entitlements"
  ON public.user_entitlements FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS: AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGERS: FREE-TIER SUBSCRIPTION LIMIT
-- ============================================================

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

-- ============================================================
-- TRIGGERS: AUTO-UPDATE updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_entitlements_updated_at
  BEFORE UPDATE ON public.user_entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
