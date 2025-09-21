import { z } from 'zod'
import { nanoid } from 'nanoid'

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional()
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
})

// Generate verification token
export function generateToken(): string {
  return nanoid(32)
}

// Note: hashPassword and verifyPassword are provided by nuxt-auth-utils
// and are auto-imported in server context