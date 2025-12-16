import axios from 'axios'
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user/userStore.ts'

export function useAxios() {
  const userStore = useUserStore()
  const { accessToken } = storeToRefs(userStore)

  const loadingStore = useLoadingStore()
  const { isLoading } = storeToRefs(loadingStore)

  const wedgeMatrixBasePath = import.meta.env.VITE_API_URL

  const authHeaders = () =>
    accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}

  const get = async (path: string) => {
    try {
      isLoading.value = true
      const response = await axios.get(wedgeMatrixBasePath + path, {
        headers: authHeaders(),
      })
      isLoading.value = false
      return response
    } catch (error) {
      console.log(error)
      isLoading.value = false
    }
  }

  const post = async (path: string, requestBody: object) => {
    try {
      isLoading.value = true
      const response = await axios.post(wedgeMatrixBasePath + path, requestBody, {
        headers: authHeaders(),
      })
      isLoading.value = false
      return response
    } catch (error) {
      console.log(error)
      isLoading.value = false
    }
  }

  const put = async (path: string, requestBody: object) => {
    try {
      isLoading.value = true
      const response = await axios.put(wedgeMatrixBasePath + path, requestBody, {
        headers: authHeaders(),
      })
      isLoading.value = false
      return response
    } catch (error) {
      console.log(error)
      isLoading.value = false
    }
  }

  return {
    get,
    post,
    put,
  }
}
