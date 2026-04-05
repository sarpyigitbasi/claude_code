import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Service role — bypasses RLS to read all pending jobs
  )

  // Fetch pending renewal_reminder jobs
  const { data: jobs, error } = await supabase
    .from('sync_jobs')
    .select('*, profiles!inner(expo_push_token)')
    .eq('job_type', 'renewal_reminder')
    .eq('status', 'pending')
    .limit(100)

  if (error || !jobs?.length) {
    return new Response(JSON.stringify({ processed: 0 }), { status: 200 })
  }

  // Build Expo push messages
  const messages = jobs
    .filter((job: any) => job.profiles?.expo_push_token)
    .map((job: any) => ({
      to: job.profiles.expo_push_token,
      sound: 'default',
      title: 'Upcoming Renewal',
      body: `${job.metadata.service_name} renews in 3 days for $${Number(job.metadata.amount).toFixed(2)}.`,
      data: { subscriptionId: job.metadata.subscription_id },
    }))

  // Send via Expo Push API
  if (messages.length > 0) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(messages),
    })
  }

  // Mark jobs as completed
  const jobIds = jobs.map((j: any) => j.id)
  await supabase
    .from('sync_jobs')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .in('id', jobIds)

  return new Response(JSON.stringify({ processed: messages.length }), { status: 200 })
})
