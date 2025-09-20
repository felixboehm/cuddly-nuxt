import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const rpID = process.env.NODE_ENV === 'production' ? 'your-domain.com' : 'localhost'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userEmail } = body

  try {
    let allowCredentials = undefined

    // If userEmail is provided, get user's existing authenticators
    if (userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: {
          authenticators: true
        }
      })

      if (user && user.authenticators.length > 0) {
        allowCredentials = user.authenticators.map(authenticator => ({
          id: authenticator.credentialID,
          type: 'public-key' as const,
          transports: authenticator.transports as AuthenticatorTransport[]
        }))
      }
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      allowCredentials
    })

    // In production, you should store the challenge in a session or cache
    // For now, we'll return it and expect the client to send it back
    return {
      options,
      challenge: options.challenge
    }
  } catch (error: any) {
    console.error('WebAuthn authentication options error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})