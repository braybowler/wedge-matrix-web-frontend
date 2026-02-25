import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user/userStore.ts'
import type { User } from '@/types/user'
import type { WedgeMatrix } from '@/types/matrix'

const mockGet = vi.fn()

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => ({
    get: mockGet,
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
  }),
}))

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
  wedge_matrices: [mockMatrix],
  has_dismissed_tutorial: false,
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  mockGet.mockReset()
})

describe('useUserStore', () => {
  it('has null user and accessToken when localStorage is empty', () => {
    const store = useUserStore()
    expect(store.user).toBeNull()
    expect(store.accessToken).toBeNull()
  })

  describe('initializeUserStoreValues', () => {
    it('sets user and accessToken and persists to localStorage', () => {
      const store = useUserStore()
      store.initializeUserStoreValues(mockUser, 'abc-token')

      expect(store.user).toEqual(mockUser)
      expect(store.accessToken).toBe('abc-token')
      expect(localStorage.getItem('wedge_matrix_user')).toBe(JSON.stringify(mockUser))
      expect(localStorage.getItem('wedge_matrix_token')).toBe('abc-token')
    })
  })

  describe('logout', () => {
    it('clears user, accessToken, isAuthVerified, and localStorage', () => {
      const store = useUserStore()
      store.initializeUserStoreValues(mockUser, 'abc-token')
      store.setAuthVerified(true)

      store.logout()

      expect(store.user).toBeNull()
      expect(store.accessToken).toBeNull()
      expect(store.isAuthVerified).toBe(false)
      expect(localStorage.getItem('wedge_matrix_user')).toBeNull()
      expect(localStorage.getItem('wedge_matrix_token')).toBeNull()
    })
  })

  describe('verifyAndRefreshAuth', () => {
    it('returns false and logs out when no token exists', async () => {
      const store = useUserStore()
      const result = await store.verifyAndRefreshAuth()

      expect(result).toBe(false)
      expect(store.user).toBeNull()
    })

    it('returns false and logs out when API returns an error', async () => {
      mockGet.mockResolvedValue({ error: 'Unauthorized', status: 401 })
      const store = useUserStore()
      store.initializeUserStoreValues(mockUser, 'bad-token')

      const result = await store.verifyAndRefreshAuth()

      expect(result).toBe(false)
      expect(store.user).toBeNull()
      expect(store.accessToken).toBeNull()
    })

    it('returns true and updates user when API succeeds', async () => {
      const updatedUser = { ...mockUser, email: 'updated@example.com' }
      mockGet.mockResolvedValue({ data: { data: updatedUser } })
      const store = useUserStore()
      store.initializeUserStoreValues(mockUser, 'good-token')

      const result = await store.verifyAndRefreshAuth()

      expect(result).toBe(true)
      expect(store.user?.email).toBe('updated@example.com')
    })
  })

  describe('addWedgeMatrix', () => {
    it('appends the matrix and persists to localStorage', () => {
      const store = useUserStore()
      store.initializeUserStoreValues(mockUser, 'abc-token')
      const newMatrix: WedgeMatrix = { ...mockMatrix, id: 2, label: 'Second' }

      store.addWedgeMatrix(newMatrix)

      expect(store.user!.wedge_matrices).toHaveLength(2)
      expect(store.user!.wedge_matrices[1]!.id).toBe(2)
      const stored = JSON.parse(localStorage.getItem('wedge_matrix_user')!)
      expect(stored.wedge_matrices).toHaveLength(2)
    })
  })

  describe('removeWedgeMatrix', () => {
    it('filters out the matrix by ID and persists to localStorage', () => {
      const store = useUserStore()
      const matrix2: WedgeMatrix = { ...mockMatrix, id: 2, label: 'Second' }
      const userWith2 = { ...mockUser, wedge_matrices: [mockMatrix, matrix2] }
      store.initializeUserStoreValues(userWith2, 'abc-token')

      store.removeWedgeMatrix(1)

      expect(store.user!.wedge_matrices).toHaveLength(1)
      expect(store.user!.wedge_matrices[0]!.id).toBe(2)
      const stored = JSON.parse(localStorage.getItem('wedge_matrix_user')!)
      expect(stored.wedge_matrices).toHaveLength(1)
    })
  })

  describe('updateWedgeMatrixLabel', () => {
    it('updates the label in-place and persists to localStorage', () => {
      const store = useUserStore()
      store.initializeUserStoreValues(mockUser, 'abc-token')

      store.updateWedgeMatrixLabel(1, 'Renamed')

      expect(store.user!.wedge_matrices[0]!.label).toBe('Renamed')
      const stored = JSON.parse(localStorage.getItem('wedge_matrix_user')!)
      expect(stored.wedge_matrices[0].label).toBe('Renamed')
    })
  })
})
