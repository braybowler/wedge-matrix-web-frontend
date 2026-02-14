import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'
import { useUserStore } from '@/stores/user/userStore.ts'
import { storeToRefs } from 'pinia'

type ApiResponse<T = unknown> = {
  data?: T
  error?: string
  status?: number
}

export function useAxios() {
  const userStore = useUserStore()
  const { accessToken } = storeToRefs(userStore)

  const loadingStore = useLoadingStore()
  const { startLoading, stopLoading } = loadingStore

  const wedgeMatrixBasePath = import.meta.env.VITE_API_URL

  const authHeaders = () =>
    accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}

  const handleError = <T = unknown>(error: unknown): ApiResponse<T> => {
    const axiosError = error as AxiosError<{ message?: string }>

    if (axiosError.response) {
      // Server responded with error status
      const message =
        axiosError.response.data?.message || 'An error occurred processing your request'
      return {
        error: message,
        status: axiosError.response.status,
      }
    } else if (axiosError.request) {
      // Request made but no response
      return {
        error: 'Unable to reach the server. Please check your connection.',
        status: 0,
      }
    } else {
      // Something else happened
      return {
        error: 'An unexpected error occurred',
        status: 0,
      }
    }
  }

  const get = async <T = unknown>(path: string): Promise<ApiResponse<T>> => {
    startLoading()
    try {
      const response: AxiosResponse<T> = await axios.get(wedgeMatrixBasePath + path, {
        headers: authHeaders(),
      })
      return { data: response.data, status: response.status }
    } catch (error) {
      return handleError<T>(error)
    } finally {
      stopLoading()
    }
  }

  const post = async <T = unknown>(path: string, requestBody: unknown): Promise<ApiResponse<T>> => {
    startLoading()
    try {
      const response: AxiosResponse<T> = await axios.post(
        wedgeMatrixBasePath + path,
        requestBody,
        {
          headers: authHeaders(),
        },
      )
      return { data: response.data, status: response.status }
    } catch (error) {
      return handleError<T>(error)
    } finally {
      stopLoading()
    }
  }

  const put = async <T = unknown>(path: string, requestBody: unknown): Promise<ApiResponse<T>> => {
    startLoading()
    try {
      const response: AxiosResponse<T> = await axios.put(wedgeMatrixBasePath + path, requestBody, {
        headers: authHeaders(),
      })
      return { data: response.data, status: response.status }
    } catch (error) {
      return handleError<T>(error)
    } finally {
      stopLoading()
    }
  }

  const del = async <T = unknown>(path: string): Promise<ApiResponse<T>> => {
    startLoading()
    try {
      const response: AxiosResponse<T> = await axios.delete(wedgeMatrixBasePath + path, {
        headers: authHeaders(),
      })
      return { data: response.data, status: response.status }
    } catch (error) {
      return handleError<T>(error)
    } finally {
      stopLoading()
    }
  }

  return {
    get,
    post,
    put,
    del,
  }
}
