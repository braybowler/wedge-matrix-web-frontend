import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useUserStore } from '@/stores/user/userStore.ts'
import { routerGuard } from '@/router/index.ts'
import type { User } from '@/types/user'
import type { WedgeMatrix } from '@/types/matrix'

const mockGet = vi.fn()

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => ({
    get: mockGet,
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
  }),
}))

const stubComponent = { template: '<div />' }

function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: { name: 'login' } },
      { path: '/login', name: 'login', component: stubComponent, meta: { requiresAuth: false } },
      {
        path: '/register',
        name: 'register',
        component: stubComponent,
        meta: { requiresAuth: false },
      },
      { path: '/matrix', name: 'matrix', component: stubComponent, meta: { requiresAuth: true } },
      {
        path: '/configure',
        name: 'configure',
        component: stubComponent,
        meta: { requiresAuth: true },
      },
    ],
  })

  router.beforeEach(routerGuard)

  return router
}

const mockMatrix: WedgeMatrix = {
  id: 1,
  user_id: 1,
  label: null,
  number_of_rows: 4,
  number_of_columns: 4,
  column_headers: ['100%', '75%', '50%', '25%'],
  selected_row_display_option: 'Carry',
  yardage_values: [],
}

const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  email_verified_at: null,
  wedge_matrix: mockMatrix,
  has_dismissed_tutorial: false,
}

describe('Router Guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    mockGet.mockReset()
  })

  describe('unauthenticated users', () => {
    it('allows access to /login', async () => {
      const router = createTestRouter()

      await router.push('/login')

      expect(router.currentRoute.value.name).toBe('login')
    })

    it('allows access to /register', async () => {
      const router = createTestRouter()

      await router.push('/register')

      expect(router.currentRoute.value.name).toBe('register')
    })

    it('redirects to /login when accessing /matrix', async () => {
      const router = createTestRouter()

      await router.push('/matrix')

      expect(router.currentRoute.value.name).toBe('login')
    })

    it('redirects to /login when accessing /configure', async () => {
      const router = createTestRouter()

      await router.push('/configure')

      expect(router.currentRoute.value.name).toBe('login')
    })

    it('redirects root path to /login', async () => {
      const router = createTestRouter()

      await router.push('/')

      expect(router.currentRoute.value.name).toBe('login')
    })
  })

  describe('authenticated users', () => {
    it('redirects from /login to /matrix', async () => {
      const userStore = useUserStore()
      userStore.initializeUserStoreValues(mockUser, 'valid-token')
      userStore.setAuthVerified(true)

      const router = createTestRouter()
      await router.push('/login')

      expect(router.currentRoute.value.name).toBe('matrix')
    })

    it('redirects from /register to /matrix', async () => {
      const userStore = useUserStore()
      userStore.initializeUserStoreValues(mockUser, 'valid-token')
      userStore.setAuthVerified(true)

      const router = createTestRouter()
      await router.push('/register')

      expect(router.currentRoute.value.name).toBe('matrix')
    })

    it('allows access to /matrix', async () => {
      mockGet.mockResolvedValue({ data: { user: mockUser } })
      const userStore = useUserStore()
      userStore.initializeUserStoreValues(mockUser, 'valid-token')

      const router = createTestRouter()
      await router.push('/matrix')

      expect(router.currentRoute.value.name).toBe('matrix')
    })

    it('allows access to /configure', async () => {
      mockGet.mockResolvedValue({ data: { user: mockUser } })
      const userStore = useUserStore()
      userStore.initializeUserStoreValues(mockUser, 'valid-token')

      const router = createTestRouter()
      await router.push('/configure')

      expect(router.currentRoute.value.name).toBe('configure')
    })
  })

  describe('token verification', () => {
    it('verifies token on first protected route navigation', async () => {
      mockGet.mockResolvedValue({ data: { user: mockUser } })
      const userStore = useUserStore()
      userStore.initializeUserStoreValues(mockUser, 'valid-token')

      const router = createTestRouter()
      await router.push('/matrix')

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(userStore.isAuthVerified).toBe(true)
    })

    it('skips verification on subsequent navigations after successful verify', async () => {
      mockGet.mockResolvedValue({ data: { user: mockUser } })
      const userStore = useUserStore()
      userStore.initializeUserStoreValues(mockUser, 'valid-token')

      const router = createTestRouter()
      await router.push('/matrix')
      await router.push('/configure')

      expect(mockGet).toHaveBeenCalledTimes(1)
    })

    it('redirects to /login when token verification fails', async () => {
      mockGet.mockResolvedValue({ error: 'Unauthorized', status: 401 })
      const userStore = useUserStore()
      userStore.initializeUserStoreValues(mockUser, 'expired-token')

      const router = createTestRouter()
      await router.push('/matrix')

      expect(router.currentRoute.value.name).toBe('login')
    })

    it('does not set isAuthVerified when verification fails', async () => {
      mockGet.mockResolvedValue({ error: 'Unauthorized', status: 401 })
      const userStore = useUserStore()
      userStore.initializeUserStoreValues(mockUser, 'expired-token')

      const router = createTestRouter()
      await router.push('/matrix')

      expect(userStore.isAuthVerified).toBe(false)
    })
  })
})
