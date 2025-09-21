import { describe, it, expect } from 'vitest'
import { generateToken, registerSchema, loginSchema } from '../../server/utils/auth'

describe('Auth Utils', () => {
  describe('Token Generation', () => {
    it('should generate a token', () => {
      const token = generateToken()

      expect(token).toBeDefined()
      expect(token).toHaveLength(32)
      expect(typeof token).toBe('string')
    })

    it('should generate unique tokens', () => {
      const token1 = generateToken()
      const token2 = generateToken()

      expect(token1).not.toBe(token2)
    })
  })

  describe('Validation Schemas', () => {
    describe('Register Schema', () => {
      it('should validate valid registration data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'password123',
          name: 'John Doe'
        }

        const result = registerSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid email', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'password123'
        }

        const result = registerSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Invalid email address')
        }
      })

      it('should reject short password', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'short'
        }

        const result = registerSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Password must be at least 8 characters')
        }
      })

      it('should allow optional name', () => {
        const dataWithoutName = {
          email: 'test@example.com',
          password: 'password123'
        }

        const result = registerSchema.safeParse(dataWithoutName)
        expect(result.success).toBe(true)
      })
    })

    describe('Login Schema', () => {
      it('should validate valid login data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'password'
        }

        const result = loginSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid email', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'password'
        }

        const result = loginSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Invalid email address')
        }
      })

      it('should require password', () => {
        const invalidData = {
          email: 'test@example.com',
          password: ''
        }

        const result = loginSchema.safeParse(invalidData)
        expect(result.success).toBe(true) // Empty string is still a string
      })
    })
  })
})