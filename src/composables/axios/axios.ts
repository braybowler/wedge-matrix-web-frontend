import axios, { type AxiosResponse } from 'axios'
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
    if (axios.isAxiosError<{ message?: string }>(error)) {
      if (error.response) {
        if (error.response.status === 401) {
          userStore.logout()
        }

        const message = error.response.data?.message || 'An error occurred processing your request'
        return {
          error: message,
          status: error.response.status,
        }
      } else if (error.request) {
        return {
          error: 'Unable to reach the server. Please check your connection.',
          status: 0,
        }
      }
    }

    return {
      error: 'An unexpected error occurred',
      status: 0,
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
      const response: AxiosResponse<T> = await axios.post(wedgeMatrixBasePath + path, requestBody, {
        headers: authHeaders(),
      })
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

  const patch = async <T = unknown>(
    path: string,
    requestBody?: unknown,
  ): Promise<ApiResponse<T>> => {
    startLoading()
    try {
      const response: AxiosResponse<T> = await axios.patch(
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

  const getBlob = async (path: string): Promise<ApiResponse<Blob>> => {
    startLoading()
    try {
      const response: AxiosResponse<Blob> = await axios.get(wedgeMatrixBasePath + path, {
        headers: authHeaders(),
        responseType: 'blob',
      })
      return { data: response.data, status: response.status }
    } catch (error) {
      return handleError<Blob>(error)
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
    getBlob,
    post,
    put,
    patch,
    del,
  }
}
