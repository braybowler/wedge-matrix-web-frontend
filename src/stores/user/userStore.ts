import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/user'

const USER_STORAGE_KEY = 'wedge_matrix_user'
const TOKEN_STORAGE_KEY = 'wedge_matrix_token'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(loadUserFromStorage())
  const accessToken = ref<string | null>(loadTokenFromStorage())

  function loadUserFromStorage(): User | null {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY)
      return storedUser ? JSON.parse(storedUser) : null
    } catch (error) {
      console.error('Failed to load user from storage:', error)
      return null
    }
  }

  function loadTokenFromStorage(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to load token from storage:', error)
      return null
    }
  }

  function saveToStorage(newUser: User, newAccessToken: string) {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
      localStorage.setItem(TOKEN_STORAGE_KEY, newAccessToken)
    } catch (error) {
      console.error('Failed to save to storage:', error)
    }
  }

  function clearStorage() {
    try {
      localStorage.removeItem(USER_STORAGE_KEY)
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  function initializeUserStoreValues(newUser: User, newAccessToken: string) {
    user.value = newUser
    accessToken.value = newAccessToken
    saveToStorage(newUser, newAccessToken)
  }

  function logout() {
    user.value = null
    accessToken.value = null
    clearStorage()
  }

  async function verifyAndRefreshAuth() {
    // If no token, clear everything
    if (!accessToken.value) {
      logout()
      return false
    }

    // Token exists, attempt to verify it by fetching user data
    try {
      const { useAxios } = await import('@/composables/axios/axios.ts')
      const { get } = useAxios()
      const response = await get<{ user: User }>('/user')

      if (response.error || !response.data) {
        // Token is invalid, clear storage
        logout()
        return false
      }

      // Token is valid, update user data and initialize matrix configuration
      user.value = response.data.user
      saveToStorage(response.data.user, accessToken.value)

      // Initialize matrix configuration store if user has wedge_matrix data
      if (response.data.user.wedge_matrix) {
        const { useMatrixConfigurationStore } = await import(
          '@/stores/matrix/matrixConfigurationStore.ts'
        )
        const matrixStore = useMatrixConfigurationStore()
        matrixStore.initializeMatrixValues(response.data.user.wedge_matrix)
      }

      return true
    } catch (error) {
      // If verification fails, clear storage
      logout()
      return false
    }
  }

  return {
    user,
    accessToken,
    initializeUserStoreValues,
    logout,
    verifyAndRefreshAuth,
  }
})
