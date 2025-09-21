import { loginSchema } from '../../utils/auth'
import { usePrisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // Parse and validate request body
  const body = await readBody(event)

  const validation = loginSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0].message
    })
  }

  const { email, password } = validation.data
  const prisma = usePrisma()

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !user.password) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  // Verify password
  const validPassword = await verifyPassword(user.password, password)
  if (!validPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  // Set user session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  }
})