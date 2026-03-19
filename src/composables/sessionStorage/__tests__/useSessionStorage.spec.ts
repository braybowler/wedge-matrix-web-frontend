import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSessionStorage } from '@/composables/sessionStorage/useSessionStorage.ts'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { WedgeMatrix } from '@/types/matrix'

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => ({
    put: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    del: vi.fn(),
    getBlob: vi.fn(),
  }),
}))

const TEST_KEY = 'test_session_key'

type TestSession = { matrixId: number; items: string[] }

const alwaysValid = () => true
const requireItems = (parsed: TestSession) => Array.isArray(parsed.items) && parsed.items.length > 0

const buildMatrix = (overrides: Partial<WedgeMatrix> = {}): WedgeMatrix => ({
  id: 10,
  user_id: 1,
  label: null,
  number_of_rows: 2,
  number_of_columns: 2,
  column_headers: ['50%', '100%'],
  selected_row_display_option: 'Carry',
  yardage_values: [
    [
      { carry_value: 80, total_value: 90 },
      { carry_value: 60, total_value: 70 },
    ],
    [
      { carry_value: 40, total_value: 50 },
      { carry_value: 30, total_value: 40 },
    ],
  ],
  club_labels: ['LW', 'SW'],
  ...overrides,
})

function initMatrixStore() {
  const store = useMatrixConfigurationStore()
  store.initializeMatrixValues([buildMatrix()])
  return store
}

describe('useSessionStorage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('persist', () => {
    it('stores data as JSON in localStorage', () => {
      const { persist } = useSessionStorage<TestSession>(TEST_KEY, alwaysValid)
      const data: TestSession = { matrixId: 10, items: ['a', 'b'] }

      persist(data)

      const stored = localStorage.getItem(TEST_KEY)
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!)).toEqual(data)
    })
  })

  describe('clear', () => {
    it('removes the key from localStorage', () => {
      localStorage.setItem(TEST_KEY, '{"matrixId":10}')

      const { clear } = useSessionStorage<TestSession>(TEST_KEY, alwaysValid)
      clear()

      expect(localStorage.getItem(TEST_KEY)).toBeNull()
    })
  })

  describe('load', () => {
    it('returns null when no data exists', () => {
      initMatrixStore()
      const { load } = useSessionStorage<TestSession>(TEST_KEY, alwaysValid)

      expect(load()).toBeNull()
    })

    it('returns parsed data when matrixId matches and validator passes', () => {
      initMatrixStore()
      const data: TestSession = { matrixId: 10, items: ['a'] }
      localStorage.setItem(TEST_KEY, JSON.stringify(data))

      const { load } = useSessionStorage<TestSession>(TEST_KEY, requireItems)

      expect(load()).toEqual(data)
    })

    it('returns null and clears storage when matrixId does not match', () => {
      initMatrixStore()
      const data: TestSession = { matrixId: 999, items: ['a'] }
      localStorage.setItem(TEST_KEY, JSON.stringify(data))

      const { load } = useSessionStorage<TestSession>(TEST_KEY, alwaysValid)

      expect(load()).toBeNull()
      expect(localStorage.getItem(TEST_KEY)).toBeNull()
    })

    it('returns null and clears storage when validator fails', () => {
      initMatrixStore()
      const data: TestSession = { matrixId: 10, items: [] }
      localStorage.setItem(TEST_KEY, JSON.stringify(data))

      const { load } = useSessionStorage<TestSession>(TEST_KEY, requireItems)

      expect(load()).toBeNull()
      expect(localStorage.getItem(TEST_KEY)).toBeNull()
    })

    it('returns null and clears storage on invalid JSON', () => {
      initMatrixStore()
      localStorage.setItem(TEST_KEY, '{not valid json}')

      const { load } = useSessionStorage<TestSession>(TEST_KEY, alwaysValid)

      expect(load()).toBeNull()
      expect(localStorage.getItem(TEST_KEY)).toBeNull()
    })
  })
})
