import CredentialsProvider from '@auth/core/providers/credentials'
import type { AuthConfig } from '@auth/core/types'
import { NuxtAuthHandler } from '#auth'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'

const prisma = new PrismaClient()
const runtimeConfig = useRuntimeConfig()

const rpID = process.env.NODE_ENV === 'production' ? 'your-domain.com' : 'localhost'
const origin = process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000'

export const authOptions: AuthConfig = {
  secret: runtimeConfig.authJs?.secret || process.env.NUXT_AUTH_SECRET || 'fallback-secret-for-development',
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            return null
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password)

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    }),
    CredentialsProvider({
      id: 'webauthn',
      name: 'Passkey',
      credentials: {
        response: { label: 'WebAuthn Response', type: 'text' },
        challenge: { label: 'Challenge', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.response || !credentials?.challenge) {
          return null
        }

        try {
          const webauthnResponse = JSON.parse(credentials.response)
          const expectedChallenge = credentials.challenge

          // Find the authenticator in the database
          const authenticator = await prisma.authenticator.findUnique({
            where: { credentialID: Buffer.from(webauthnResponse.id, 'base64url') },
            include: { user: true }
          })

          if (!authenticator) {
            return null
          }

          // Verify the authentication response
          const verification = await verifyAuthenticationResponse({
            response: webauthnResponse,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
              credentialID: authenticator.credentialID,
              credentialPublicKey: authenticator.credentialPublicKey,
              counter: authenticator.counter
            }
          })

          if (verification.verified) {
            // Update the counter
            await prisma.authenticator.update({
              where: { credentialID: authenticator.credentialID },
              data: { counter: verification.authenticationInfo.newCounter }
            })

            return {
              id: authenticator.user.id,
              email: authenticator.user.email,
              name: authenticator.user.name,
            }
          }

          return null
        } catch (error) {
          console.error('WebAuthn authentication error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  }
}

export default NuxtAuthHandler(authOptions, runtimeConfig)