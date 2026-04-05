import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})
export type SignUpInput = z.infer<typeof signUpSchema>

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})
export type LoginInput = z.infer<typeof loginSchema>
