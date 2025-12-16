import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)

  function initializeUserStoreValues(newUser: User, newAccessToken: string) {
    user.value = newUser
    accessToken.value = newAccessToken
  }

  return {
    user,
    accessToken,
    initializeUserStoreValues,
  }
})
