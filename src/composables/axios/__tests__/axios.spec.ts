import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { useAxios } from '@/composables/axios/axios.ts'
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'
import { useUserStore } from '@/stores/user/userStore.ts'

vi.mock('axios')

const mockedAxios = axios as unknown as {
  get: Mock
  post: Mock
  put: Mock
  delete: Mock
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('useAxios Composable', () => {
  describe('HTTP GET', () => {
    it('sends a GET request and returns data and status', async () => {
      mockedAxios.get.mockResolvedValue({ data: { id: 1 }, status: 200 })

      const { get } = useAxios()
      const result = await get('/test')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ headers: expect.any(Object) }),
      )
      expect(result).toEqual({ data: { id: 1 }, status: 200 })
    })

    it('includes Bearer token in auth headers when accessToken is set', async () => {
      const userStore = useUserStore()
      userStore.accessToken = 'my-token'
      mockedAxios.get.mockResolvedValue({ data: {}, status: 200 })

      const { get } = useAxios()
      await get('/test')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { Authorization: 'Bearer my-token' },
        }),
      )
    })

    it('omits Authorization header when no accessToken is set', async () => {
      mockedAxios.get.mockResolvedValue({ data: {}, status: 200 })

      const { get } = useAxios()
      await get('/test')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ headers: {} }),
      )
    })
  })

  describe('HTTP POST', () => {
    it('sends a POST request with body and returns data and status', async () => {
      mockedAxios.post.mockResolvedValue({ data: { created: true }, status: 201 })

      const { post } = useAxios()
      const result = await post('/items', { name: 'test' })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/items'),
        { name: 'test' },
        expect.objectContaining({ headers: expect.any(Object) }),
      )
      expect(result).toEqual({ data: { created: true }, status: 201 })
    })

    it('includes Bearer token in auth headers when accessToken is set', async () => {
      const userStore = useUserStore()
      userStore.accessToken = 'post-token'
      mockedAxios.post.mockResolvedValue({ data: {}, status: 200 })

      const { post } = useAxios()
      await post('/items', {})

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.objectContaining({
          headers: { Authorization: 'Bearer post-token' },
        }),
      )
    })
  })

  describe('Error Handling', () => {
    it('returns error message and status from a server error response', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          data: { message: 'Not found' },
          status: 404,
        },
      })

      const { get } = useAxios()
      const result = await get('/missing')

      expect(result).toEqual({ error: 'Not found', status: 404 })
    })

    it('returns a default message when server response has no message', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          data: {},
          status: 500,
        },
      })

      const { get } = useAxios()
      const result = await get('/fail')

      expect(result).toEqual({
        error: 'An error occurred processing your request',
        status: 500,
      })
    })

    it('returns a network error when request was made but no response received', async () => {
      mockedAxios.get.mockRejectedValue({
        request: {},
      })

      const { get } = useAxios()
      const result = await get('/timeout')

      expect(result).toEqual({
        error: 'Unable to reach the server. Please check your connection.',
        status: 0,
      })
    })

    it('returns an unexpected error for other failures', async () => {
      mockedAxios.get.mockRejectedValue({})

      const { get } = useAxios()
      const result = await get('/unknown')

      expect(result).toEqual({
        error: 'An unexpected error occurred',
        status: 0,
      })
    })
  })

  describe('Loading State', () => {
    it('starts and stops loading around a successful request', async () => {
      const loadingStore = useLoadingStore()
      mockedAxios.get.mockResolvedValue({ data: {}, status: 200 })

      const { get } = useAxios()
      const promise = get('/test')

      expect(loadingStore.isLoading).toBe(true)
      await promise
      expect(loadingStore.isLoading).toBe(false)
    })

    it('stops loading even when the request fails', async () => {
      const loadingStore = useLoadingStore()
      mockedAxios.post.mockRejectedValue({ response: { data: {}, status: 500 } })

      const { post } = useAxios()
      await post('/fail', {})

      expect(loadingStore.isLoading).toBe(false)
    })
  })
})
