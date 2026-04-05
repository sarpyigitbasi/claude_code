import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for writing entitlements
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`Stripe event: ${event.type}`)

  // Stub: In Phase 4, handle these events to upsert user_entitlements:
  // - checkout.session.completed: activate pro entitlement
  // - customer.subscription.deleted: deactivate pro entitlement
  // - customer.subscription.updated: update expiry
  // For now, just acknowledge receipt

  // Suppress unused variable warning — supabase client will be used in Phase 4
  void supabase

  return NextResponse.json({ received: true, event_type: event.type })
}

// Disable body parsing for webhook signature verification
export const config = {
  api: { bodyParser: false },
}
