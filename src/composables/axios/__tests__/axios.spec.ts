import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { useAxios } from '@/composables/axios/axios.ts'
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'
import { useUserStore } from '@/stores/user/userStore.ts'

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  return {
    ...actual,
    default: {
      ...actual.default,
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      isAxiosError: actual.default.isAxiosError,
    },
  }
})

const mockedAxios = axios as unknown as {
  get: Mock
  post: Mock
  put: Mock
  delete: Mock
}

function createAxiosError(config: { response?: unknown; request?: unknown }) {
  const error = new Error('Axios error') as Error & {
    isAxiosError: boolean
    response?: unknown
    request?: unknown
  }
  error.isAxiosError = true
  if (config.response) error.response = config.response
  if (config.request) error.request = config.request
  return error
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

  describe('HTTP GET Blob', () => {
    it('sends a GET request with responseType blob and returns data and status', async () => {
      const blob = new Blob(['pdf-content'], { type: 'application/pdf' })
      mockedAxios.get.mockResolvedValue({ data: blob, status: 200 })

      const { getBlob } = useAxios()
      const result = await getBlob('/download')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/download'),
        expect.objectContaining({
          headers: expect.any(Object),
          responseType: 'blob',
        }),
      )
      expect(result).toEqual({ data: blob, status: 200 })
    })

    it('handles errors the same as other methods', async () => {
      mockedAxios.get.mockRejectedValue(
        createAxiosError({
          response: {
            data: { message: 'Not found' },
            status: 404,
          },
        }),
      )

      const { getBlob } = useAxios()
      const result = await getBlob('/missing')

      expect(result).toEqual({ error: 'Not found', status: 404 })
    })
  })

  describe('Error Handling', () => {
    it('returns error message and status from a server error response', async () => {
      mockedAxios.get.mockRejectedValue(
        createAxiosError({
          response: {
            data: { message: 'Not found' },
            status: 404,
          },
        }),
      )

      const { get } = useAxios()
      const result = await get('/missing')

      expect(result).toEqual({ error: 'Not found', status: 404 })
    })

    it('logs out the user on a 401 response', async () => {
      const userStore = useUserStore()
      userStore.accessToken = 'expired-token'

      mockedAxios.get.mockRejectedValue(
        createAxiosError({
          response: {
            data: { message: 'Unauthenticated' },
            status: 401,
          },
        }),
      )

      const { get } = useAxios()
      await get('/protected')

      expect(userStore.user).toBeNull()
      expect(userStore.accessToken).toBeNull()
    })

    it('returns a default message when server response has no message', async () => {
      mockedAxios.get.mockRejectedValue(
        createAxiosError({
          response: {
            data: {},
            status: 500,
          },
        }),
      )

      const { get } = useAxios()
      const result = await get('/fail')

      expect(result).toEqual({
        error: 'An error occurred processing your request',
        status: 500,
      })
    })

    it('returns a network error when request was made but no response received', async () => {
      mockedAxios.get.mockRejectedValue(
        createAxiosError({
          request: {},
        }),
      )

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
      mockedAxios.post.mockRejectedValue(createAxiosError({ response: { data: {}, status: 500 } }))

      const { post } = useAxios()
      await post('/fail', {})

      expect(loadingStore.isLoading).toBe(false)
    })
  })
})
