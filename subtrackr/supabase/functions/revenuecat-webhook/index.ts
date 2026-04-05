import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Verify shared secret
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('REVENUECAT_WEBHOOK_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const event = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const eventType = event.event?.type
  const appUserId = event.event?.app_user_id

  console.log(`RevenueCat event: ${eventType} for user ${appUserId}`)

  // Stub: In Phase 4, this will upsert user_entitlements based on event type
  // Events to handle: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION
  // For now, just acknowledge receipt

  // Suppress unused variable warning — supabase client will be used in Phase 4
  void supabase

  return new Response(JSON.stringify({ received: true, event_type: eventType }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
