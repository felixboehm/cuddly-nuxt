<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-12">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Cuddly Nuxt
          </h1>
          <div v-if="user" class="mb-8">
            <p class="text-xl text-gray-600 dark:text-gray-400 mb-2">
              Hello, {{ user.name || user.email }}!
            </p>
            <p class="text-gray-500 dark:text-gray-500">
              You are successfully authenticated.
            </p>
          </div>
          <div v-else class="mb-8">
            <p class="text-xl text-gray-600 dark:text-gray-400 mb-4">
              Modern authentication with password support
            </p>
            <div class="flex justify-center gap-4">
              <UButton to="/auth/register" size="lg">
                Get Started
              </UButton>
              <UButton to="/auth/login" variant="outline" size="lg">
                Sign In
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useUserSession()
</script>