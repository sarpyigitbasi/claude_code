-- Requires pg_cron and pg_net extensions enabled in Supabase Dashboard:
--   Dashboard -> Database -> Extensions -> search pg_cron -> Enable
--   Dashboard -> Database -> Extensions -> search pg_net -> Enable

-- Step 1: Schedule daily at 9:00 AM UTC
-- Finds active subscriptions with next_billing_date = 3 days from now
-- Checks user notification preference before queueing
-- Inserts into sync_jobs for the Edge Function to process
SELECT cron.schedule(
  'queue-renewal-reminders',
  '0 9 * * *',
  $$
    INSERT INTO public.sync_jobs (user_id, job_type, status, metadata)
    SELECT DISTINCT s.user_id, 'renewal_reminder', 'pending',
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
      AND p.expo_push_token IS NOT NULL
  $$
);

-- Step 2: Schedule Edge Function invocation 1 minute after job insertion
-- Uses pg_net.http_post() to invoke the send-renewal-reminders Edge Function
-- This ensures sync_jobs rows exist before the function processes them
SELECT cron.schedule(
  'invoke-send-renewal-reminders',
  '1 9 * * *',
  $$
    SELECT pg_net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-renewal-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);
