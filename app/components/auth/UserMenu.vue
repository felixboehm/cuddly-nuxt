<template>
  <div>
    <UDropdown v-if="user" :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
      <UAvatar :alt="user.name || user.email" size="sm" />

      <template #account="{ item }">
        <div class="text-left">
          <p>Signed in as</p>
          <p class="truncate font-medium text-gray-900 dark:text-white">
            {{ user.email }}
          </p>
        </div>
      </template>

      <template #item="{ item }">
        <span class="truncate">{{ item.label }}</span>
      </template>
    </UDropdown>

    <div v-else class="flex gap-2">
      <UButton to="/auth/login" variant="ghost">Sign In</UButton>
      <UButton to="/auth/register">Sign Up</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()
const router = useRouter()
const toast = useToast()

const userMenuItems = computed(() => [
  [{
    slot: 'account',
    disabled: true
  }],
  [{
    label: 'Profile',
    icon: 'i-heroicons-user-circle',
    click: () => router.push('/profile')
  }, {
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    click: () => router.push('/settings')
  }],
  [{
    label: 'Sign out',
    icon: 'i-heroicons-arrow-left-on-rectangle',
    click: async () => {
      await $fetch('/api/auth/logout', { method: 'POST' })
      await clear()

      toast.add({
        title: 'Signed out',
        description: 'You have been signed out successfully',
        color: 'blue'
      })

      await router.push('/')
    }
  }]
])
</script>