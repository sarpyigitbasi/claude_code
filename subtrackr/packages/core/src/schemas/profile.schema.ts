import { z } from 'zod'

export const notificationPreferencesSchema = z.object({
  renewal_reminders: z.boolean().default(true),
})
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>

export interface Profile {
  id: string
  email: string
  expo_push_token: string | null
  created_at: string
  updated_at: string
  onboarding_completed_at: string | null
  notification_preferences: NotificationPreferences
}
