import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server'
import { PrismaClient } from '@prisma/client'

// Mock SimpleWebAuthn
vi.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: vi.fn(),
  verifyRegistrationResponse: vi.fn(),
  generateAuthenticationOptions: vi.fn(),
  verifyAuthenticationResponse: vi.fn()
}))

const mockPrisma = new PrismaClient()

describe('WebAuthn/Passkey Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Registration Options Generation', () => {
    it('should generate registration options for new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        password: null,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockOptions = {
        challenge: 'mock-challenge-string',
        rp: {
          name: 'Cuddly Nuxt App',
          id: 'localhost'
        },
        user: {
          id: 'user-123',
          name: 'test@example.com',
          displayName: 'Test User'
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' }
        ],
        timeout: 60000,
        attestation: 'none',
        excludeCredentials: [],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          residentKey: 'preferred',
          userVerification: 'preferred'
        }
      }

      vi.mocked(generateRegistrationOptions).mockResolvedValue(mockOptions)

      const options = await generateRegistrationOptions({
        rpName: 'Cuddly Nuxt App',
        rpID: 'localhost',
        userID: mockUser.id,
        userName: mockUser.email,
        userDisplayName: mockUser.name || mockUser.email,
        attestationType: 'none',
        excludeCredentials: [],
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
          authenticatorAttachment: 'platform'
        }
      })

      expect(generateRegistrationOptions).toHaveBeenCalled()
      expect(options.challenge).toBeTruthy()
      expect(options.rp.name).toBe('Cuddly Nuxt App')
      expect(options.user.id).toBe(mockUser.id)
    })

    it('should exclude existing authenticators from registration', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        authenticators: [
          {
            credentialID: Buffer.from('existing-credential'),
            credentialPublicKey: Buffer.from('public-key'),
            counter: 0,
            transports: ['usb', 'nfc']
          }
        ]
      }

      const excludeCredentials = mockUser.authenticators.map(auth => ({
        id: auth.credentialID,
        type: 'public-key' as const,
        transports: auth.transports as AuthenticatorTransport[]
      }))

      vi.mocked(generateRegistrationOptions).mockResolvedValue({
        challenge: 'mock-challenge',
        excludeCredentials
      } as any)

      const options = await generateRegistrationOptions({
        rpName: 'Test App',
        rpID: 'localhost',
        userID: mockUser.id,
        userName: mockUser.email,
        userDisplayName: mockUser.name,
        excludeCredentials
      })

      expect(generateRegistrationOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeCredentials
        })
      )
    })
  })

  describe('Registration Verification', () => {
    it('should verify valid registration response', async () => {
      const mockVerificationResult = {
        verified: true,
        registrationInfo: {
          credentialID: Buffer.from('new-credential-id'),
          credentialPublicKey: Buffer.from('public-key-data'),
          counter: 0,
          aaguid: 'mock-aaguid'
        }
      }

      vi.mocked(verifyRegistrationResponse).mockResolvedValue(mockVerificationResult)

      const verificationResult = await verifyRegistrationResponse({
        response: {
          id: 'credential-id',
          rawId: 'raw-credential-id',
          response: {
            clientDataJSON: 'client-data',
            attestationObject: 'attestation-object'
          },
          type: 'public-key'
        },
        expectedChallenge: 'expected-challenge',
        expectedOrigin: 'http://localhost:3000',
        expectedRPID: 'localhost'
      })

      expect(verifyRegistrationResponse).toHaveBeenCalled()
      expect(verificationResult.verified).toBe(true)
      expect(verificationResult.registrationInfo).toBeTruthy()
    })

    it('should reject invalid registration response', async () => {
      const mockVerificationResult = {
        verified: false,
        registrationInfo: undefined
      }

      vi.mocked(verifyRegistrationResponse).mockResolvedValue(mockVerificationResult)

      const verificationResult = await verifyRegistrationResponse({
        response: {
          id: 'invalid-credential-id',
          rawId: 'invalid-raw-credential-id',
          response: {
            clientDataJSON: 'invalid-client-data',
            attestationObject: 'invalid-attestation-object'
          },
          type: 'public-key'
        },
        expectedChallenge: 'wrong-challenge',
        expectedOrigin: 'http://localhost:3000',
        expectedRPID: 'localhost'
      })

      expect(verificationResult.verified).toBe(false)
      expect(verificationResult.registrationInfo).toBeUndefined()
    })
  })

  describe('Authentication Options Generation', () => {
    it('should generate authentication options', async () => {
      const mockOptions = {
        challenge: 'auth-challenge-string',
        timeout: 60000,
        rpId: 'localhost',
        allowCredentials: [],
        userVerification: 'preferred'
      }

      vi.mocked(generateAuthenticationOptions).mockResolvedValue(mockOptions)

      const options = await generateAuthenticationOptions({
        rpID: 'localhost',
        userVerification: 'preferred'
      })

      expect(generateAuthenticationOptions).toHaveBeenCalled()
      expect(options.challenge).toBeTruthy()
      expect(options.rpId).toBe('localhost')
    })
  })

  describe('Authentication Verification', () => {
    it('should verify valid authentication response', async () => {
      const mockAuthenticator = {
        credentialID: Buffer.from('credential-id'),
        credentialPublicKey: Buffer.from('public-key'),
        counter: 5,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User'
        }
      }

      const mockVerificationResult = {
        verified: true,
        authenticationInfo: {
          newCounter: 6,
          userVerified: true
        }
      }

      vi.mocked(mockPrisma.authenticator.findUnique).mockResolvedValue({
        credentialID: mockAuthenticator.credentialID,
        credentialPublicKey: mockAuthenticator.credentialPublicKey,
        counter: mockAuthenticator.counter,
        transports: ['usb'],
        userId: 'user-123',
        user: mockAuthenticator.user,
        id: 'auth-id',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      vi.mocked(verifyAuthenticationResponse).mockResolvedValue(mockVerificationResult)

      const authenticator = await mockPrisma.authenticator.findUnique({
        where: { credentialID: Buffer.from('credential-id') },
        include: { user: true }
      })

      expect(authenticator).toBeTruthy()

      if (authenticator) {
        const verificationResult = await verifyAuthenticationResponse({
          response: {
            id: 'credential-id',
            rawId: 'raw-credential-id',
            response: {
              clientDataJSON: 'client-data',
              authenticatorData: 'authenticator-data',
              signature: 'signature'
            },
            type: 'public-key'
          },
          expectedChallenge: 'expected-challenge',
          expectedOrigin: 'http://localhost:3000',
          expectedRPID: 'localhost',
          authenticator: {
            credentialID: authenticator.credentialID,
            credentialPublicKey: authenticator.credentialPublicKey,
            counter: authenticator.counter
          }
        })

        expect(verificationResult.verified).toBe(true)
        expect(verificationResult.authenticationInfo.newCounter).toBe(6)
      }
    })

    it('should update authenticator counter after successful authentication', async () => {
      const mockUpdatedAuth = {
        id: 'auth-id',
        credentialID: Buffer.from('credential-id'),
        credentialPublicKey: Buffer.from('public-key'),
        counter: 10,
        transports: ['usb'],
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      vi.mocked(mockPrisma.authenticator.update).mockResolvedValue(mockUpdatedAuth)

      const updatedAuthenticator = await mockPrisma.authenticator.update({
        where: { credentialID: Buffer.from('credential-id') },
        data: { counter: 10 }
      })

      expect(mockPrisma.authenticator.update).toHaveBeenCalledWith({
        where: { credentialID: Buffer.from('credential-id') },
        data: { counter: 10 }
      })
      expect(updatedAuthenticator.counter).toBe(10)
    })

    it('should reject authentication for non-existent authenticator', async () => {
      vi.mocked(mockPrisma.authenticator.findUnique).mockResolvedValue(null)

      const authenticator = await mockPrisma.authenticator.findUnique({
        where: { credentialID: Buffer.from('non-existent-credential') },
        include: { user: true }
      })

      expect(authenticator).toBeNull()
    })
  })

  describe('Authenticator Management', () => {
    it('should store new authenticator after successful registration', async () => {
      const mockAuthenticator = {
        id: 'new-auth-id',
        credentialID: Buffer.from('new-credential-id'),
        credentialPublicKey: Buffer.from('public-key-data'),
        counter: 0,
        transports: ['platform'],
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      vi.mocked(mockPrisma.authenticator.create).mockResolvedValue(mockAuthenticator)

      const authenticator = await mockPrisma.authenticator.create({
        data: {
          credentialID: Buffer.from('new-credential-id'),
          credentialPublicKey: Buffer.from('public-key-data'),
          counter: 0,
          transports: ['platform'],
          userId: 'user-123'
        }
      })

      expect(mockPrisma.authenticator.create).toHaveBeenCalled()
      expect(authenticator.credentialID).toEqual(Buffer.from('new-credential-id'))
      expect(authenticator.userId).toBe('user-123')
    })

    it('should retrieve user authenticators', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        password: null,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        authenticators: [
          {
            id: 'auth-1',
            credentialID: Buffer.from('credential-1'),
            credentialPublicKey: Buffer.from('public-key-1'),
            counter: 5,
            transports: ['platform'],
            userId: 'user-123',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser)

      const user = await mockPrisma.user.findUnique({
        where: { id: 'user-123' },
        include: { authenticators: true }
      })

      expect(user?.authenticators).toHaveLength(1)
      expect(user?.authenticators[0].credentialID).toEqual(Buffer.from('credential-1'))
    })
  })
})