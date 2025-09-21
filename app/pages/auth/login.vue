<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <AuthLoginForm />
  </div>
</template>

<script setup lang="ts">
// Redirect if already authenticated
const { user } = useUserSession()
const router = useRouter()

onMounted(() => {
  if (user.value) {
    router.push('/')
  }
})

watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

definePageMeta({
  layout: false
})
</script>