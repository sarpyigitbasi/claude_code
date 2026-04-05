import { z } from 'zod'

export const billingFrequencyEnum = z.enum(['weekly', 'monthly', 'quarterly', 'annual', 'unknown'])
export type BillingFrequency = z.infer<typeof billingFrequencyEnum>

export const subscriptionStatusEnum = z.enum(['active', 'cancelled', 'paused', 'archived', 'unknown'])
export type SubscriptionStatus = z.infer<typeof subscriptionStatusEnum>

export const subscriptionSourceEnum = z.enum(['email', 'bank', 'email+bank', 'manual'])
export type SubscriptionSource = z.infer<typeof subscriptionSourceEnum>

export const categoryEnum = z.enum(['entertainment', 'productivity', 'health', 'finance', 'shopping', 'other'])
export type Category = z.infer<typeof categoryEnum>

export const createSubscriptionSchema = z.object({
  service_name: z.string().min(1, 'Service name is required.'),
  amount: z.number().positive('Enter a valid amount (e.g. 14.99).'),
  billing_frequency: billingFrequencyEnum.optional().default('monthly'),
  next_billing_date: z.string().optional(), // ISO date string
  category: categoryEnum.optional(),
  logo_key: z.string().optional(),
})
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>

export const updateSubscriptionSchema = createSubscriptionSchema.partial()
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>

export interface Subscription {
  id: string
  user_id: string
  service_name: string
  normalized_name: string | null
  amount: number | null
  currency: string
  billing_frequency: BillingFrequency | null
  next_billing_date: string | null
  last_billing_date: string | null
  category: Category | null
  status: SubscriptionStatus
  cancellation_url: string | null
  confidence: number | null
  source: SubscriptionSource
  confirmed_by_user: boolean | null
  confirmed_at: string | null
  logo_key: string | null
  created_at: string
  updated_at: string
}
