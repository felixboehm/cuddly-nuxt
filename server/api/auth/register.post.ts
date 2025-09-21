import { registerSchema } from '../../utils/auth'
import { usePrisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // Parse and validate request body
  const body = await readBody(event)

  const validation = registerSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0].message
    })
  }

  const { email, password, name } = validation.data
  const prisma = usePrisma()

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User already exists'
    })
  }

  // Hash password and create user
  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    }
  })

  // Set user session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  })

  return {
    user
  }
})