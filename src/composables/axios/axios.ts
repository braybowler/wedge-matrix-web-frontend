import axios from 'axios'
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'
import { storeToRefs } from 'pinia'

axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

export function useAxios() {
  const loadingStore = useLoadingStore()
  const { isLoading } = storeToRefs(loadingStore)

  const wedgeMatrixBasePath = import.meta.env.VITE_API_URL

  const get = async (path: string) => {
    try {
      isLoading.value = true
      const response = await axios.get(wedgeMatrixBasePath + path)
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
      const response = await axios.post(wedgeMatrixBasePath + path, requestBody)
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
  }
}
