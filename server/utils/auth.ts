import * as argon2 from 'argon2'
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

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password)
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return await argon2.verify(hash, password)
}

// Generate verification token
export function generateToken(): string {
  return nanoid(32)
}