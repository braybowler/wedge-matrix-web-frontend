// stores/user.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)

  function setUser(newUser: User | null) {
    user.value = newUser
  }

  return {
    user,
    setUser,
  }
})
