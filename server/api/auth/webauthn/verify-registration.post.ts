import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const rpName = 'Cuddly Nuxt App'
const rpID = process.env.NODE_ENV === 'production' ? 'your-domain.com' : 'localhost'
const origin = process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userID, response, expectedChallenge } = body

  if (!userID || !response || !expectedChallenge) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID, response, and expected challenge are required'
    })
  }

  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userID }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID
    })

    if (!verification.verified || !verification.registrationInfo) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Registration verification failed'
      })
    }

    const { registrationInfo } = verification

    // Save the authenticator to the database
    const authenticator = await prisma.authenticator.create({
      data: {
        credentialID: registrationInfo.credentialID,
        credentialPublicKey: registrationInfo.credentialPublicKey,
        counter: registrationInfo.counter,
        transports: response.response.transports || [],
        userId: userID
      }
    })

    return {
      success: true,
      verified: verification.verified,
      authenticator: {
        id: authenticator.id,
        credentialID: authenticator.credentialID.toString('base64url')
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('WebAuthn registration verification error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})