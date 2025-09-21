export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session || !session.user) {
    return {
      user: null
    }
  }

  return {
    user: session.user
  }
})