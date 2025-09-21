<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <h3 class="text-xl font-semibold">Sign In</h3>
    </template>

    <UForm :schema="loginSchema" :state="state" @submit="onSubmit">
      <UFormGroup label="Email" name="email" class="mb-4">
        <UInput
          v-model="state.email"
          type="email"
          placeholder="Enter your email"
          icon="i-heroicons-envelope"
        />
      </UFormGroup>

      <UFormGroup label="Password" name="password" class="mb-4">
        <UInput
          v-model="state.password"
          type="password"
          placeholder="Enter your password"
          icon="i-heroicons-lock-closed"
        />
      </UFormGroup>

      <div class="flex items-center justify-between mb-6">
        <UCheckbox v-model="rememberMe" label="Remember me" />
        <ULink to="/auth/forgot-password" class="text-sm text-primary">
          Forgot password?
        </ULink>
      </div>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        :disabled="loading"
      >
        Sign In
      </UButton>
    </UForm>

    <template #footer>
      <div class="text-center text-sm">
        Don't have an account?
        <ULink to="/auth/register" class="text-primary font-medium">
          Sign up
        </ULink>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const toast = useToast()
const router = useRouter()
const { fetch: refreshSession } = useUserSession()

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

type Schema = z.infer<typeof loginSchema>

const state = reactive<Schema>({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log('Login form submitted', state.email)
  loading.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: state.email,
        password: state.password
      }
    })

    await refreshSession()

    toast.add({
      title: 'Success',
      description: 'You have been logged in successfully',
      color: 'green'
    })

    await router.push('/')
  } catch (error: any) {
    console.error('Login error:', error)
    toast.add({
      title: 'Error',
      description: error.data?.message || error.message || 'Invalid credentials',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>