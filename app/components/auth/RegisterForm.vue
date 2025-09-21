<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <h3 class="text-xl font-semibold">Create Account</h3>
    </template>

    <UForm :schema="registerSchema" :state="state" @submit="onSubmit">
      <UFormGroup label="Name" name="name" class="mb-4">
        <UInput
          v-model="state.name"
          placeholder="Enter your name"
          icon="i-heroicons-user"
        />
      </UFormGroup>

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
          placeholder="Create a password"
          icon="i-heroicons-lock-closed"
        />
        <template #hint>
          <span class="text-xs">Minimum 8 characters</span>
        </template>
      </UFormGroup>

      <UFormGroup label="Confirm Password" name="confirmPassword" class="mb-4">
        <UInput
          v-model="state.confirmPassword"
          type="password"
          placeholder="Confirm your password"
          icon="i-heroicons-lock-closed"
        />
      </UFormGroup>

      <UCheckbox
        v-model="state.terms"
        name="terms"
        class="mb-6"
      >
        <template #label>
          <span class="text-sm">
            I agree to the
            <ULink to="/terms" class="text-primary">Terms of Service</ULink>
            and
            <ULink to="/privacy" class="text-primary">Privacy Policy</ULink>
          </span>
        </template>
      </UCheckbox>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        :disabled="loading || !state.terms"
      >
        Create Account
      </UButton>
    </UForm>

    <template #footer>
      <div class="text-center text-sm">
        Already have an account?
        <ULink to="/auth/login" class="text-primary font-medium">
          Sign in
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

const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  terms: z.boolean()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type Schema = z.infer<typeof registerSchema>

const state = reactive<Schema>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log('Form submitted', state)

  // Check if terms are accepted
  if (!state.terms) {
    toast.add({
      title: 'Error',
      description: 'Please accept the terms and conditions',
      color: 'red'
    })
    return
  }

  loading.value = true

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: state.name,
        email: state.email,
        password: state.password
      }
    })

    await refreshSession()

    toast.add({
      title: 'Success',
      description: 'Your account has been created successfully',
      color: 'green'
    })

    await router.push('/')
  } catch (error: any) {
    console.error('Registration error:', error)
    toast.add({
      title: 'Error',
      description: error.data?.message || error.message || 'Failed to create account',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>