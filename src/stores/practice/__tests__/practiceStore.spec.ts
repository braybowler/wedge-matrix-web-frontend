import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePracticeStore } from '@/stores/practice/practiceStore.ts'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { WedgeMatrix } from '@/types/matrix'

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockDel = vi.fn()

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => ({
    put: vi.fn(),
    get: mockGet,
    post: mockPost,
    del: mockDel,
    getBlob: vi.fn(),
  }),
}))

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

function initMatrixStore(overrides: Partial<WedgeMatrix> = {}) {
  const matrixStore = useMatrixConfigurationStore()
  matrixStore.initializeMatrixValues([buildMatrix(overrides)])
  return matrixStore
}

describe('usePracticeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    mockGet.mockReset()
    mockPost.mockReset()
    mockDel.mockReset()
  })

  describe('startPractice', () => {
    it('creates session with correct shot count', () => {
      initMatrixStore()
      const store = usePracticeStore()

      store.startPractice(5)

      expect(store.session).not.toBeNull()
      expect(store.session!.shotCount).toBe(5)
      expect(store.session!.shots).toHaveLength(5)
    })

    it('generates targets within valid range', () => {
      initMatrixStore()
      const store = usePracticeStore()

      store.startPractice(15)

      for (const shot of store.session!.shots) {
        expect(shot.target_yards).toBeGreaterThanOrEqual(5)
        expect(shot.target_yards).toBeLessThanOrEqual(100)
      }
    })

    it('uses max carry from matrix when higher than 100', () => {
      initMatrixStore({
        yardage_values: [
          [
            { carry_value: 120, total_value: 130 },
            { carry_value: 60, total_value: 70 },
          ],
          [
            { carry_value: 40, total_value: 50 },
            { carry_value: 30, total_value: 40 },
          ],
        ],
      })
      const store = usePracticeStore()

      store.startPractice(10)

      for (const shot of store.session!.shots) {
        expect(shot.target_yards).toBeLessThanOrEqual(120)
      }
    })

    it('initializes shots with null actual_carry and difference', () => {
      initMatrixStore()
      const store = usePracticeStore()

      store.startPractice(5)

      for (const shot of store.session!.shots) {
        expect(shot.actual_carry).toBeNull()
        expect(shot.difference).toBeNull()
      }
    })

    it('persists session to localStorage', () => {
      initMatrixStore()
      const store = usePracticeStore()

      store.startPractice(5)

      const stored = localStorage.getItem('wedge_matrix_practice_session')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      expect(parsed.shotCount).toBe(5)
      expect(parsed.matrixId).toBe(10)
    })

    it('sets currentShotIndex to 0 and completed to false', () => {
      initMatrixStore()
      const store = usePracticeStore()

      store.startPractice(5)

      expect(store.session!.currentShotIndex).toBe(0)
      expect(store.session!.completed).toBe(false)
    })
  })

  describe('setActualCarry', () => {
    it('parses carry and computes difference', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)
      const target = store.session!.shots[0]!.target_yards

      store.setActualCarry(String(target + 5))

      expect(store.session!.shots[0]!.actual_carry).toBe(target + 5)
      expect(store.session!.shots[0]!.difference).toBe(5)
    })

    it('rounds to 1 decimal place', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      store.setActualCarry('50.67')

      expect(store.session!.shots[0]!.actual_carry).toBe(50.7)
    })

    it('sets null for empty string', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)
      store.setActualCarry('50')

      store.setActualCarry('')

      expect(store.session!.shots[0]!.actual_carry).toBeNull()
      expect(store.session!.shots[0]!.difference).toBeNull()
    })

    it('sets null for invalid values', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      store.setActualCarry('abc')
      expect(store.session!.shots[0]!.actual_carry).toBeNull()

      store.setActualCarry('1000')
      expect(store.session!.shots[0]!.actual_carry).toBeNull()
    })

    it('allows zero as carry value', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      store.setActualCarry('0')

      expect(store.session!.shots[0]!.actual_carry).toBe(0)
    })
  })

  describe('advanceShot / goBackShot', () => {
    it('increments currentShotIndex', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      store.advanceShot()

      expect(store.session!.currentShotIndex).toBe(1)
    })

    it('decrements currentShotIndex', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)
      store.advanceShot()

      store.goBackShot()

      expect(store.session!.currentShotIndex).toBe(0)
    })

    it('does not go below 0', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      store.goBackShot()

      expect(store.session!.currentShotIndex).toBe(0)
    })

    it('sets completed to true on last shot', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      for (let i = 0; i < 5; i++) store.advanceShot()

      expect(store.session!.completed).toBe(true)
    })
  })

  describe('averageDifference', () => {
    it('computes average of absolute differences', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      // Manually set differences
      store.session!.shots[0]!.difference = 2
      store.session!.shots[1]!.difference = 4
      store.session!.shots[2]!.difference = 6

      expect(store.averageDifference).toBe(4)
    })

    it('returns 0 when no differences computed', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      expect(store.averageDifference).toBe(0)
    })

    it('rounds to 1 decimal', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      store.session!.shots[0]!.difference = 1
      store.session!.shots[1]!.difference = 2
      store.session!.shots[2]!.difference = 3

      expect(store.averageDifference).toBe(2)
    })
  })

  describe('clearSession', () => {
    it('nulls session and removes localStorage', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      store.clearSession()

      expect(store.session).toBeNull()
      expect(localStorage.getItem('wedge_matrix_practice_session')).toBeNull()
    })
  })

  describe('loadFromStorage', () => {
    it('loads a valid session from localStorage', () => {
      const matrixStore = initMatrixStore()
      const session = {
        matrixId: matrixStore.selectedMatrixId,
        shotCount: 5,
        shots: Array.from({ length: 5 }, (_, i) => ({
          shot_number: i + 1,
          target_yards: 50,
          actual_carry: null,
          difference: null,
        })),
        currentShotIndex: 2,
        completed: false,
      }
      localStorage.setItem('wedge_matrix_practice_session', JSON.stringify(session))

      const store = usePracticeStore()
      store.loadFromStorage()

      expect(store.session).not.toBeNull()
      expect(store.session!.currentShotIndex).toBe(2)
    })

    it('discards session with mismatched matrixId', () => {
      initMatrixStore()
      const session = {
        matrixId: 999,
        shotCount: 5,
        shots: Array.from({ length: 5 }, (_, i) => ({
          shot_number: i + 1,
          target_yards: 50,
          actual_carry: null,
          difference: null,
        })),
        currentShotIndex: 0,
        completed: false,
      }
      localStorage.setItem('wedge_matrix_practice_session', JSON.stringify(session))

      const store = usePracticeStore()
      store.loadFromStorage()

      expect(store.session).toBeNull()
      expect(localStorage.getItem('wedge_matrix_practice_session')).toBeNull()
    })

    it('handles corrupt JSON gracefully', () => {
      initMatrixStore()
      localStorage.setItem('wedge_matrix_practice_session', '{invalid json}')

      const store = usePracticeStore()
      store.loadFromStorage()

      expect(store.session).toBeNull()
      expect(localStorage.getItem('wedge_matrix_practice_session')).toBeNull()
    })

    it('discards session with wrong shot count', () => {
      const matrixStore = initMatrixStore()
      const session = {
        matrixId: matrixStore.selectedMatrixId,
        shotCount: 5,
        shots: Array.from({ length: 3 }, (_, i) => ({
          shot_number: i + 1,
          target_yards: 50,
          actual_carry: null,
          difference: null,
        })),
        currentShotIndex: 0,
        completed: false,
      }
      localStorage.setItem('wedge_matrix_practice_session', JSON.stringify(session))

      const store = usePracticeStore()
      store.loadFromStorage()

      expect(store.session).toBeNull()
    })
  })

  describe('fetchPracticeLog', () => {
    it('populates practiceLog on success', async () => {
      initMatrixStore()
      const store = usePracticeStore()
      mockGet.mockResolvedValue({
        data: {
          data: [{ id: 1, shot_count: 5, average_difference: 3.2, created_at: '2026-03-12' }],
        },
      })

      await store.fetchPracticeLog()

      expect(store.practiceLog).toHaveLength(1)
      expect(store.logError).toBeNull()
    })

    it('sets logError on failure', async () => {
      initMatrixStore()
      const store = usePracticeStore()
      mockGet.mockResolvedValue({ error: 'Network error' })

      await store.fetchPracticeLog()

      expect(store.logError).toBe('Network error')
    })
  })

  describe('saveSession', () => {
    it('posts session and prepends to log', async () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)
      // Complete the session
      for (let i = 0; i < 5; i++) store.advanceShot()

      const savedRecord = {
        id: 42,
        shot_count: 5,
        average_difference: 0,
        created_at: '2026-03-12',
      }
      mockPost.mockResolvedValue({ data: { data: savedRecord } })

      await store.saveSession()

      expect(mockPost).toHaveBeenCalled()
      expect(store.practiceLog[0]!.id).toBe(42)
      expect(store.session).toBeNull()
    })

    it('sets logError on failure', async () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)
      for (let i = 0; i < 5; i++) store.advanceShot()

      mockPost.mockResolvedValue({ error: 'Save failed' })

      await store.saveSession()

      expect(store.logError).toBe('Save failed')
    })
  })

  describe('deleteSession', () => {
    it('removes session from log', async () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.practiceLog = [
        {
          id: 1,
          user_id: 1,
          wedge_matrix_id: 10,
          shot_count: 5,
          shots: [],
          average_difference: 3,
          created_at: '2026-03-12',
        },
      ]
      mockDel.mockResolvedValue({})

      await store.deleteSession(1)

      expect(store.practiceLog).toHaveLength(0)
      expect(store.logError).toBeNull()
    })

    it('sets logError on failure', async () => {
      initMatrixStore()
      const store = usePracticeStore()
      mockDel.mockResolvedValue({ error: 'Delete failed' })

      await store.deleteSession(1)

      expect(store.logError).toBe('Delete failed')
    })
  })

  describe('computed properties', () => {
    it('isActive is true when session exists and not completed', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      expect(store.isActive).toBe(true)
    })

    it('isActive is false when no session', () => {
      initMatrixStore()
      const store = usePracticeStore()

      expect(store.isActive).toBe(false)
    })

    it('isComplete is true when session is completed', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)
      for (let i = 0; i < 5; i++) store.advanceShot()

      expect(store.isComplete).toBe(true)
    })

    it('totalShots returns correct count', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(10)

      expect(store.totalShots).toBe(10)
    })

    it('currentShotNumber is 1-indexed', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      expect(store.currentShotNumber).toBe(1)
      store.advanceShot()
      expect(store.currentShotNumber).toBe(2)
    })

    it('progressPercent calculates correctly', () => {
      initMatrixStore()
      const store = usePracticeStore()
      store.startPractice(5)

      expect(store.progressPercent).toBe(0)
      store.advanceShot()
      expect(store.progressPercent).toBe(20)
      store.advanceShot()
      expect(store.progressPercent).toBe(40)
    })
  })
})
