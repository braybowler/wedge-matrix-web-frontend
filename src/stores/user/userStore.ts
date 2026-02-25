import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/user'
import type { WedgeMatrix } from '@/types/matrix'
import { useAxios } from '@/composables/axios/axios.ts'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'

const USER_STORAGE_KEY = 'wedge_matrix_user'
const TOKEN_STORAGE_KEY = 'wedge_matrix_token'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(loadUserFromStorage())
  const accessToken = ref<string | null>(loadTokenFromStorage())
  const isAuthVerified = ref(false)

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

  function setUser(newUser: User) {
    user.value = newUser
    saveToStorage(newUser, accessToken.value!)
  }

  function logout() {
    user.value = null
    accessToken.value = null
    isAuthVerified.value = false
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
      const { get } = useAxios()
      const response = await get<{ data: User }>('/user')

      if (response.error || !response.data) {
        // Token is invalid, clear storage
        logout()
        return false
      }

      const verifiedUser = response.data.data

      // Token is valid, update user data and initialize matrix configuration
      user.value = verifiedUser
      saveToStorage(verifiedUser, accessToken.value)

      // Initialize matrix configuration store if user has wedge_matrix data
      if (verifiedUser.wedge_matrices) {
        const matrixStore = useMatrixConfigurationStore()
        matrixStore.initializeMatrixValues(verifiedUser.wedge_matrices)
      }

      return true
    } catch (error) {
      console.error('Failed to verify:', error)
      logout()
      return false
    }
  }

  function addWedgeMatrix(matrix: WedgeMatrix) {
    if (!user.value) return
    user.value.wedge_matrices.push(matrix)
    saveToStorage(user.value, accessToken.value!)
  }

  function removeWedgeMatrix(matrixId: number) {
    if (!user.value) return
    user.value.wedge_matrices = user.value.wedge_matrices.filter((m) => m.id !== matrixId)
    saveToStorage(user.value, accessToken.value!)
  }

  function updateWedgeMatrixLabel(matrixId: number, label: string) {
    if (!user.value) return
    const matrix = user.value.wedge_matrices.find((m) => m.id === matrixId)
    if (matrix) {
      matrix.label = label
      saveToStorage(user.value, accessToken.value!)
    }
  }

  function updateWedgeMatrix(matrixId: number, updates: Partial<WedgeMatrix>) {
    if (!user.value) return
    const matrix = user.value.wedge_matrices.find((m) => m.id === matrixId)
    if (matrix) {
      Object.assign(matrix, updates)
      saveToStorage(user.value, accessToken.value!)
    }
  }

  function setAuthVerified(value: boolean) {
    isAuthVerified.value = value
  }

  return {
    user,
    accessToken,
    isAuthVerified,
    initializeUserStoreValues,
    setUser,
    logout,
    verifyAndRefreshAuth,
    setAuthVerified,
    addWedgeMatrix,
    removeWedgeMatrix,
    updateWedgeMatrixLabel,
    updateWedgeMatrix,
  }
})
