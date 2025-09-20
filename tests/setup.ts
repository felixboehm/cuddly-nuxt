import { vi } from 'vitest'

// Mock Prisma Client
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    authenticator: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    account: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    session: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }

  return {
    PrismaClient: vi.fn(() => mockPrisma)
  }
})

// Mock environment variables
process.env.NUXT_AUTH_SECRET = 'test-secret'
process.env.NODE_ENV = 'test'