import { generateRegistrationOptions } from '@simplewebauthn/server'
import { PrismaClient } from '@prisma/client'
import type { AuthenticatorDevice } from '@simplewebauthn/server/script/deps'

const prisma = new PrismaClient()

const rpName = 'Cuddly Nuxt App'
const rpID = process.env.NODE_ENV === 'production' ? 'your-domain.com' : 'localhost'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userID } = body

  if (!userID) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required'
    })
  }

  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userID },
      include: {
        authenticators: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Get existing authenticators for this user
    const existingAuthenticators: AuthenticatorDevice[] = user.authenticators.map(auth => ({
      credentialID: auth.credentialID,
      credentialPublicKey: auth.credentialPublicKey,
      counter: auth.counter,
      transports: auth.transports as AuthenticatorTransport[]
    }))

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.email,
      userDisplayName: user.name || user.email,
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: 'none',
      // Prevent users from re-registering existing authenticators
      excludeCredentials: existingAuthenticators.map(authenticator => ({
        id: authenticator.credentialID,
        type: 'public-key',
        transports: authenticator.transports,
      })),
      // See "Guiding use of authenticators via authenticatorSelection" below
      authenticatorSelection: {
        // Defaults
        residentKey: 'preferred',
        userVerification: 'preferred',
        // Optional
        authenticatorAttachment: 'platform',
      },
    })

    // Store the challenge in the session (in production, use proper session storage)
    // For now, we'll return it and expect the client to send it back
    return {
      options,
      challenge: options.challenge
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('WebAuthn registration options error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})