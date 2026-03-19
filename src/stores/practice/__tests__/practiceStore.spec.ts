import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePracticeGauntletStore } from '@/stores/practice/practiceGauntletStore.ts'
import { usePracticeDrillStore } from '@/stores/practice/practiceDrillStore.ts'
import { usePracticeLogStore } from '@/stores/practice/practiceLogStore.ts'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { WedgeMatrix } from '@/types/matrix'
import type { DrillCombo } from '@/types/practice'

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

describe('practiceGauntletStore', () => {
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
      const store = usePracticeGauntletStore()

      store.startPractice(5)

      expect(store.session).not.toBeNull()
      expect(store.session!.shotCount).toBe(5)
      expect(store.session!.shots).toHaveLength(5)
    })

    it('generates targets within valid range', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()

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
      const store = usePracticeGauntletStore()

      store.startPractice(10)

      for (const shot of store.session!.shots) {
        expect(shot.target_yards).toBeLessThanOrEqual(120)
      }
    })

    it('initializes shots with null actual_carry and difference', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()

      store.startPractice(5)

      for (const shot of store.session!.shots) {
        expect(shot.actual_carry).toBeNull()
        expect(shot.difference).toBeNull()
      }
    })

    it('persists session to localStorage', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()

      store.startPractice(5)

      const stored = localStorage.getItem('wedge_matrix_practice_session')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      expect(parsed.shotCount).toBe(5)
      expect(parsed.matrixId).toBe(10)
    })

    it('sets currentShotIndex to 0 and completed to false', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()

      store.startPractice(5)

      expect(store.session!.currentShotIndex).toBe(0)
      expect(store.session!.completed).toBe(false)
    })
  })

  describe('setActualCarry', () => {
    it('parses carry and computes difference', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)
      const target = store.session!.shots[0]!.target_yards

      store.setActualCarry(String(target + 5))

      expect(store.session!.shots[0]!.actual_carry).toBe(target + 5)
      expect(store.session!.shots[0]!.difference).toBe(5)
    })

    it('rounds to 1 decimal place', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)

      store.setActualCarry('50.67')

      expect(store.session!.shots[0]!.actual_carry).toBe(50.7)
    })

    it('sets null for empty string', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)
      store.setActualCarry('50')

      store.setActualCarry('')

      expect(store.session!.shots[0]!.actual_carry).toBeNull()
      expect(store.session!.shots[0]!.difference).toBeNull()
    })

    it('sets null for invalid values', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)

      store.setActualCarry('abc')
      expect(store.session!.shots[0]!.actual_carry).toBeNull()

      store.setActualCarry('1000')
      expect(store.session!.shots[0]!.actual_carry).toBeNull()
    })

    it('allows zero as carry value', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)

      store.setActualCarry('0')

      expect(store.session!.shots[0]!.actual_carry).toBe(0)
    })
  })

  describe('advanceShot / goBackShot', () => {
    it('increments currentShotIndex', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)

      store.advanceShot()

      expect(store.session!.currentShotIndex).toBe(1)
    })

    it('decrements currentShotIndex', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)
      store.advanceShot()

      store.goBackShot()

      expect(store.session!.currentShotIndex).toBe(0)
    })

    it('does not go below 0', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)

      store.goBackShot()

      expect(store.session!.currentShotIndex).toBe(0)
    })

    it('sets completed to true on last shot', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)

      for (let i = 0; i < 5; i++) store.advanceShot()

      expect(store.session!.completed).toBe(true)
    })
  })

  describe('averageDifference', () => {
    it('computes average of absolute differences', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)

      // Manually set differences
      store.session!.shots[0]!.difference = 2
      store.session!.shots[1]!.difference = 4
      store.session!.shots[2]!.difference = 6

      expect(store.averageDifference).toBe(4)
    })

    it('returns 0 when no differences computed', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)

      expect(store.averageDifference).toBe(0)
    })

    it('rounds to 1 decimal', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
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
      const store = usePracticeGauntletStore()
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

      const store = usePracticeGauntletStore()
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

      const store = usePracticeGauntletStore()
      store.loadFromStorage()

      expect(store.session).toBeNull()
      expect(localStorage.getItem('wedge_matrix_practice_session')).toBeNull()
    })

    it('handles corrupt JSON gracefully', () => {
      initMatrixStore()
      localStorage.setItem('wedge_matrix_practice_session', '{invalid json}')

      const store = usePracticeGauntletStore()
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

      const store = usePracticeGauntletStore()
      store.loadFromStorage()

      expect(store.session).toBeNull()
    })
  })

  describe('saveSession', () => {
    it('posts session and prepends to log', async () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
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

      const logStore = usePracticeLogStore()
      expect(mockPost).toHaveBeenCalled()
      expect(logStore.practiceLog[0]!.id).toBe(42)
      expect(store.session).toBeNull()
    })

    it('sets logError on failure', async () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)
      for (let i = 0; i < 5; i++) store.advanceShot()

      mockPost.mockResolvedValue({ error: 'Save failed' })

      await store.saveSession()

      const logStore = usePracticeLogStore()
      expect(logStore.logError).toBe('Save failed')
    })
  })

  describe('computed properties', () => {
    it('isActive is true when session exists and not completed', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)

      expect(store.isActive).toBe(true)
    })

    it('isActive is false when no session', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()

      expect(store.isActive).toBe(false)
    })

    it('isComplete is true when session is completed', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)
      for (let i = 0; i < 5; i++) store.advanceShot()

      expect(store.isComplete).toBe(true)
    })

    it('totalShots returns correct count', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(10)

      expect(store.totalShots).toBe(10)
    })

    it('currentShotNumber is 1-indexed', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)

      expect(store.currentShotNumber).toBe(1)
      store.advanceShot()
      expect(store.currentShotNumber).toBe(2)
    })

    it('progressPercent calculates correctly', () => {
      initMatrixStore()
      const store = usePracticeGauntletStore()
      store.startPractice(5)

      expect(store.progressPercent).toBe(0)
      store.advanceShot()
      expect(store.progressPercent).toBe(20)
      store.advanceShot()
      expect(store.progressPercent).toBe(40)
    })
  })
})

describe('practiceLogStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    mockGet.mockReset()
    mockPost.mockReset()
    mockDel.mockReset()
  })

  describe('fetchPracticeLog', () => {
    it('populates practiceLog on success', async () => {
      initMatrixStore()
      const store = usePracticeLogStore()
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
      const store = usePracticeLogStore()
      mockGet.mockResolvedValue({ error: 'Network error' })

      await store.fetchPracticeLog()

      expect(store.logError).toBe('Network error')
    })
  })

  describe('deleteSession', () => {
    it('removes session from log', async () => {
      initMatrixStore()
      const store = usePracticeLogStore()
      store.practiceLog = [
        {
          id: 1,
          user_id: 1,
          wedge_matrix_id: 10,
          mode: 'gauntlet',
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
      const store = usePracticeLogStore()
      mockDel.mockResolvedValue({ error: 'Delete failed' })

      await store.deleteSession(1)

      expect(store.logError).toBe('Delete failed')
    })
  })
})

const buildCombos = (): DrillCombo[] => [
  { clubIndex: 0, columnIndex: 0, clubLabel: 'LW', swingLabel: '50%', targetYards: 60 },
  { clubIndex: 1, columnIndex: 1, clubLabel: 'SW', swingLabel: '100%', targetYards: 40 },
]

describe('practiceDrillStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    mockGet.mockReset()
    mockPost.mockReset()
    mockDel.mockReset()
  })

  describe('startDrill', () => {
    it('creates a drill session with steps for each combo', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      const combos = buildCombos()

      store.startDrill(combos)

      expect(store.drillSession).not.toBeNull()
      expect(store.drillSession!.steps).toHaveLength(2)
      expect(store.drillSession!.currentStepIndex).toBe(0)
      expect(store.drillSession!.completed).toBe(false)
    })

    it('each step has 5 null shots', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()

      store.startDrill(buildCombos())

      for (const step of store.drillSession!.steps) {
        expect(step.shots).toHaveLength(5)
        expect(step.shots.every((s) => s === null)).toBe(true)
      }
    })

    it('does not start drill with empty combos', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()

      store.startDrill([])

      expect(store.drillSession).toBeNull()
    })

    it('persists to localStorage', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()

      store.startDrill(buildCombos())

      const stored = localStorage.getItem('wedge_matrix_drill_session')
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!).matrixId).toBe(10)
    })
  })

  describe('setDrillCarry', () => {
    it('sets a carry value on the current step', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      store.setDrillCarry(0, '55')

      expect(store.drillCurrentStep!.shots[0]).toBe(55)
    })

    it('rounds to 1 decimal place', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      store.setDrillCarry(0, '55.67')

      expect(store.drillCurrentStep!.shots[0]).toBe(55.7)
    })

    it('sets null for empty string', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())
      store.setDrillCarry(0, '55')

      store.setDrillCarry(0, '')

      expect(store.drillCurrentStep!.shots[0]).toBeNull()
    })

    it('sets null for invalid input', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      store.setDrillCarry(0, 'abc')

      expect(store.drillCurrentStep!.shots[0]).toBeNull()
    })

    it('sets null for values over 999', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      store.setDrillCarry(0, '1000')

      expect(store.drillCurrentStep!.shots[0]).toBeNull()
    })
  })

  describe('advanceDrillStep / goBackDrillStep', () => {
    it('advances to the next step', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      store.advanceDrillStep()

      expect(store.drillSession!.currentStepIndex).toBe(1)
    })

    it('sets completed to true when advancing past the last step', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      store.advanceDrillStep()
      store.advanceDrillStep()

      expect(store.drillSession!.completed).toBe(true)
    })

    it('goes back to the previous step', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())
      store.advanceDrillStep()

      store.goBackDrillStep()

      expect(store.drillSession!.currentStepIndex).toBe(0)
    })

    it('does not go below step 0', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      store.goBackDrillStep()

      expect(store.drillSession!.currentStepIndex).toBe(0)
    })
  })

  describe('computed properties', () => {
    it('isDrillActive is true when session exists and not completed', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      expect(store.isDrillActive).toBe(true)
    })

    it('isDrillActive is false when no session', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()

      expect(store.isDrillActive).toBe(false)
    })

    it('isDrillComplete is true when completed', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())
      store.advanceDrillStep()
      store.advanceDrillStep()

      expect(store.isDrillComplete).toBe(true)
    })

    it('drillTotalSteps returns the number of steps', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      expect(store.drillTotalSteps).toBe(2)
    })

    it('drillCurrentStepNumber is 1-indexed', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      expect(store.drillCurrentStepNumber).toBe(1)
      store.advanceDrillStep()
      expect(store.drillCurrentStepNumber).toBe(2)
    })

    it('drillProgressPercent calculates correctly', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      expect(store.drillProgressPercent).toBe(0)
      store.advanceDrillStep()
      expect(store.drillProgressPercent).toBe(50)
    })
  })

  describe('drillStepAverages', () => {
    it('computes average differences per step using targetYards as reference', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      // Step 0: targetYards = 60, shots at 55 and 65 → diffs 5, 5 → avg 5
      store.setDrillCarry(0, '55')
      store.setDrillCarry(1, '65')

      expect(store.drillStepAverages[0]).toBe(5)
    })

    it('returns null for steps with no filled shots', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      expect(store.drillStepAverages[0]).toBeNull()
    })
  })

  describe('drillAverageDifference', () => {
    it('computes overall average across all steps', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      // Step 0: target 60, shoot 55 → diff 5
      store.setDrillCarry(0, '55')
      // Step 1: target 40, shoot 45 → diff 5
      store.advanceDrillStep()
      store.setDrillCarry(0, '45')

      expect(store.drillAverageDifference).toBe(5)
    })

    it('returns 0 when no shots are filled', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      expect(store.drillAverageDifference).toBe(0)
    })
  })

  describe('clearDrillSession', () => {
    it('nulls session and removes localStorage', () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      store.clearDrillSession()

      expect(store.drillSession).toBeNull()
      expect(localStorage.getItem('wedge_matrix_drill_session')).toBeNull()
    })
  })

  describe('loadDrillFromStorage', () => {
    it('loads a valid drill session from localStorage', () => {
      const matrixStore = initMatrixStore()
      const session = {
        matrixId: matrixStore.selectedMatrixId,
        steps: [
          {
            combo: buildCombos()[0],
            shots: [null, null, null, null, null],
          },
        ],
        currentStepIndex: 0,
        completed: false,
      }
      localStorage.setItem('wedge_matrix_drill_session', JSON.stringify(session))

      const store = usePracticeDrillStore()
      store.loadDrillFromStorage()

      expect(store.drillSession).not.toBeNull()
      expect(store.drillSession!.steps).toHaveLength(1)
    })

    it('discards session with mismatched matrixId', () => {
      initMatrixStore()
      const session = {
        matrixId: 999,
        steps: [{ combo: buildCombos()[0], shots: [null, null, null, null, null] }],
        currentStepIndex: 0,
        completed: false,
      }
      localStorage.setItem('wedge_matrix_drill_session', JSON.stringify(session))

      const store = usePracticeDrillStore()
      store.loadDrillFromStorage()

      expect(store.drillSession).toBeNull()
    })

    it('discards session with empty steps', () => {
      const matrixStore = initMatrixStore()
      const session = {
        matrixId: matrixStore.selectedMatrixId,
        steps: [],
        currentStepIndex: 0,
        completed: false,
      }
      localStorage.setItem('wedge_matrix_drill_session', JSON.stringify(session))

      const store = usePracticeDrillStore()
      store.loadDrillFromStorage()

      expect(store.drillSession).toBeNull()
    })
  })

  describe('saveDrillSession', () => {
    it('posts session and prepends to log', async () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())
      // Fill some shots and complete
      store.setDrillCarry(0, '55')
      store.advanceDrillStep()
      store.setDrillCarry(0, '45')
      store.advanceDrillStep() // completes

      const savedRecord = {
        id: 99,
        user_id: 1,
        wedge_matrix_id: 10,
        mode: 'drill',
        shot_count: 10,
        shots: [],
        average_difference: 5,
        created_at: '2026-03-19',
      }
      mockPost.mockResolvedValue({ data: { data: savedRecord } })

      await store.saveDrillSession()

      const logStore = usePracticeLogStore()
      expect(mockPost).toHaveBeenCalled()
      expect(logStore.practiceLog[0]!.id).toBe(99)
      expect(store.drillSession).toBeNull()
    })

    it('sets logError on failure', async () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())
      store.advanceDrillStep()
      store.advanceDrillStep()

      mockPost.mockResolvedValue({ error: 'Save failed' })

      await store.saveDrillSession()

      const logStore = usePracticeLogStore()
      expect(logStore.logError).toBe('Save failed')
    })

    it('does not post when session is not completed', async () => {
      initMatrixStore()
      const store = usePracticeDrillStore()
      store.startDrill(buildCombos())

      await store.saveDrillSession()

      expect(mockPost).not.toHaveBeenCalled()
    })
  })
})
