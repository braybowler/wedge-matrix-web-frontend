import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCalibrationStore } from '@/stores/calibration/calibrationStore.ts'
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
      { carry_value: 100, total_value: 110 },
      { carry_value: 80, total_value: 90 },
    ],
    [
      { carry_value: 60, total_value: 70 },
      { carry_value: 40, total_value: 50 },
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

const ALL_CLUBS = [0, 1]
const ALL_COLS = [0, 1]

describe('useCalibrationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('startCalibration', () => {
    it('creates correct number of steps (clubs x columns)', () => {
      initMatrixStore()
      const store = useCalibrationStore()

      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      expect(store.session).not.toBeNull()
      expect(store.session!.steps).toHaveLength(4) // 2 clubs x 2 columns
    })

    it('initializes shots array with correct count of empty shots', () => {
      initMatrixStore()
      const store = useCalibrationStore()

      store.startCalibration(10, ALL_CLUBS, ALL_COLS)

      for (const step of store.session!.steps) {
        expect(step.shots).toHaveLength(10)
        for (const shot of step.shots) {
          expect(shot.carry_value).toBeNull()
          expect(shot.total_value).toBeNull()
        }
      }
    })

    it('persists session to localStorage', () => {
      initMatrixStore()
      const store = useCalibrationStore()

      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      const stored = localStorage.getItem('wedge_matrix_calibration_session')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      expect(parsed.shotCount).toBe(5)
      expect(parsed.matrixId).toBe(10)
    })

    it('sets currentStepIndex to 0 and completed to false', () => {
      initMatrixStore()
      const store = useCalibrationStore()

      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      expect(store.session!.currentStepIndex).toBe(0)
      expect(store.session!.completed).toBe(false)
    })

    it('orders steps with clubs as outer loop, columns as inner loop', () => {
      initMatrixStore()
      const store = useCalibrationStore()

      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      const steps = store.session!.steps
      // LW@col0, LW@col1, SW@col0, SW@col1
      expect(steps[0]!.clubIndex).toBe(0)
      expect(steps[0]!.columnIndex).toBe(0)
      expect(steps[1]!.clubIndex).toBe(0)
      expect(steps[1]!.columnIndex).toBe(1)
      expect(steps[2]!.clubIndex).toBe(1)
      expect(steps[2]!.columnIndex).toBe(0)
      expect(steps[3]!.clubIndex).toBe(1)
      expect(steps[3]!.columnIndex).toBe(1)
    })

    it('creates steps only for selected clubs and columns', () => {
      initMatrixStore()
      const store = useCalibrationStore()

      store.startCalibration(5, [0], [1])

      expect(store.session!.steps).toHaveLength(1)
      expect(store.session!.steps[0]!.clubIndex).toBe(0)
      expect(store.session!.steps[0]!.columnIndex).toBe(1)
    })

    it('stores selectedClubIndices and selectedColumnIndices on session', () => {
      initMatrixStore()
      const store = useCalibrationStore()

      store.startCalibration(5, [1], [0, 1])

      expect(store.session!.selectedClubIndices).toEqual([1])
      expect(store.session!.selectedColumnIndices).toEqual([0, 1])
    })
  })

  describe('setShotValue', () => {
    it('sets carry value and persists', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      store.setShotValue(0, 'carry_value', '105')

      expect(store.currentStep!.shots[0]!.carry_value).toBe(105)
      const stored = JSON.parse(localStorage.getItem('wedge_matrix_calibration_session')!)
      expect(stored.steps[0].shots[0].carry_value).toBe(105)
    })

    it('rounds decimals to 1 decimal place', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      store.setShotValue(0, 'carry_value', '105.67')

      expect(store.currentStep!.shots[0]!.carry_value).toBe(105.7)
    })

    it('sets to null for empty string', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)
      store.setShotValue(0, 'carry_value', '100')

      store.setShotValue(0, 'carry_value', '')

      expect(store.currentStep!.shots[0]!.carry_value).toBeNull()
    })

    it('sets to null for invalid values', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      store.setShotValue(0, 'carry_value', '-5')
      expect(store.currentStep!.shots[0]!.carry_value).toBeNull()

      store.setShotValue(0, 'carry_value', '1000')
      expect(store.currentStep!.shots[0]!.carry_value).toBeNull()

      store.setShotValue(0, 'carry_value', 'abc')
      expect(store.currentStep!.shots[0]!.carry_value).toBeNull()
    })

    it('sets total value', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      store.setShotValue(0, 'total_value', '115')

      expect(store.currentStep!.shots[0]!.total_value).toBe(115)
    })
  })

  describe('advanceStep / goBackStep', () => {
    it('increments currentStepIndex', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      store.advanceStep()

      expect(store.session!.currentStepIndex).toBe(1)
    })

    it('decrements currentStepIndex', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)
      store.advanceStep()

      store.goBackStep()

      expect(store.session!.currentStepIndex).toBe(0)
    })

    it('does not go below 0', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      store.goBackStep()

      expect(store.session!.currentStepIndex).toBe(0)
    })

    it('sets completed to true on last step', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      // 4 steps total, advance through all
      store.advanceStep() // step 1
      store.advanceStep() // step 2
      store.advanceStep() // step 3
      store.advanceStep() // completes

      expect(store.session!.completed).toBe(true)
    })
  })

  describe('computeAverages', () => {
    it('computes correct averages for non-null shots', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      store.setShotValue(0, 'carry_value', '100')
      store.setShotValue(1, 'carry_value', '110')
      store.setShotValue(2, 'carry_value', '105')

      const averages = store.computeAverages()

      expect(averages[0]![0]!.carry_value).toBe(105)
    })

    it('ignores null shots in average calculation', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      store.setShotValue(0, 'carry_value', '100')
      store.setShotValue(1, 'carry_value', '200')
      // shots 2,3,4 remain null

      const averages = store.computeAverages()

      expect(averages[0]![0]!.carry_value).toBe(150)
    })

    it('returns null for all-null shots', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      const averages = store.computeAverages()

      expect(averages[0]![0]!.carry_value).toBeNull()
      expect(averages[0]![0]!.total_value).toBeNull()
    })

    it('rounds averages to 1 decimal place', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      store.setShotValue(0, 'carry_value', '100')
      store.setShotValue(1, 'carry_value', '101')
      store.setShotValue(2, 'carry_value', '102')

      const averages = store.computeAverages()

      expect(averages[0]![0]!.carry_value).toBe(101)
    })
  })

  describe('applyCalibration', () => {
    it('calls setYardageValue for each cell with non-null averages', () => {
      const matrixStore = initMatrixStore()
      const spy = vi.spyOn(matrixStore, 'setYardageValue')
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      // Set carry values for step 0 (club 0, col 0)
      store.setShotValue(0, 'carry_value', '100')
      store.setShotValue(1, 'carry_value', '110')

      store.advanceStep()
      store.advanceStep()
      store.advanceStep()
      store.advanceStep()

      store.applyCalibration()

      expect(spy).toHaveBeenCalledWith('carry_value', '105', 0, 0)
    })

    it('clears session after applying', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      // advance to completion
      store.advanceStep()
      store.advanceStep()
      store.advanceStep()
      store.advanceStep()

      store.applyCalibration()

      expect(store.session).toBeNull()
      expect(localStorage.getItem('wedge_matrix_calibration_session')).toBeNull()
    })
  })

  describe('clearSession', () => {
    it('nulls session and removes localStorage', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      store.clearSession()

      expect(store.session).toBeNull()
      expect(localStorage.getItem('wedge_matrix_calibration_session')).toBeNull()
    })
  })

  describe('loadFromStorage', () => {
    it('loads a valid session from localStorage', () => {
      const matrixStore = initMatrixStore()
      const session = {
        matrixId: matrixStore.selectedMatrixId,
        shotCount: 5,
        selectedClubIndices: [0, 1],
        selectedColumnIndices: [0, 1],
        currentStepIndex: 1,
        steps: Array.from({ length: 4 }, (_, i) => ({
          clubIndex: Math.floor(i / 2),
          columnIndex: i % 2,
          shots: Array.from({ length: 5 }, () => ({ carry_value: null, total_value: null })),
        })),
        completed: false,
      }
      localStorage.setItem('wedge_matrix_calibration_session', JSON.stringify(session))

      const store = useCalibrationStore()
      store.loadFromStorage()

      expect(store.session).not.toBeNull()
      expect(store.session!.currentStepIndex).toBe(1)
    })

    it('discards session with mismatched matrixId', () => {
      initMatrixStore()
      const session = {
        matrixId: 999,
        shotCount: 5,
        selectedClubIndices: [0],
        selectedColumnIndices: [0],
        currentStepIndex: 0,
        steps: [
          {
            clubIndex: 0,
            columnIndex: 0,
            shots: [{ carry_value: null, total_value: null }],
          },
        ],
        completed: false,
      }
      localStorage.setItem('wedge_matrix_calibration_session', JSON.stringify(session))

      const store = useCalibrationStore()
      store.loadFromStorage()

      expect(store.session).toBeNull()
      expect(localStorage.getItem('wedge_matrix_calibration_session')).toBeNull()
    })

    it('handles corrupt JSON gracefully', () => {
      initMatrixStore()
      localStorage.setItem('wedge_matrix_calibration_session', '{invalid json}')

      const store = useCalibrationStore()
      store.loadFromStorage()

      expect(store.session).toBeNull()
      expect(localStorage.getItem('wedge_matrix_calibration_session')).toBeNull()
    })

    it('discards session with wrong step count', () => {
      const matrixStore = initMatrixStore()
      const session = {
        matrixId: matrixStore.selectedMatrixId,
        shotCount: 5,
        selectedClubIndices: [0, 1],
        selectedColumnIndices: [0, 1],
        currentStepIndex: 0,
        steps: [
          {
            clubIndex: 0,
            columnIndex: 0,
            shots: [{ carry_value: null, total_value: null }],
          },
        ],
        completed: false,
      }
      localStorage.setItem('wedge_matrix_calibration_session', JSON.stringify(session))

      const store = useCalibrationStore()
      store.loadFromStorage()

      expect(store.session).toBeNull()
    })

    it('discards old-format sessions without selectedClubIndices', () => {
      const matrixStore = initMatrixStore()
      const session = {
        matrixId: matrixStore.selectedMatrixId,
        shotCount: 5,
        currentStepIndex: 0,
        steps: Array.from({ length: 4 }, (_, i) => ({
          clubIndex: Math.floor(i / 2),
          columnIndex: i % 2,
          shots: Array.from({ length: 5 }, () => ({ carry_value: null, total_value: null })),
        })),
        completed: false,
      }
      localStorage.setItem('wedge_matrix_calibration_session', JSON.stringify(session))

      const store = useCalibrationStore()
      store.loadFromStorage()

      expect(store.session).toBeNull()
      expect(localStorage.getItem('wedge_matrix_calibration_session')).toBeNull()
    })

    it('discards session with out-of-bounds club indices', () => {
      const matrixStore = initMatrixStore()
      const session = {
        matrixId: matrixStore.selectedMatrixId,
        shotCount: 5,
        selectedClubIndices: [0, 5],
        selectedColumnIndices: [0],
        currentStepIndex: 0,
        steps: Array.from({ length: 2 }, (_, i) => ({
          clubIndex: i === 0 ? 0 : 5,
          columnIndex: 0,
          shots: Array.from({ length: 5 }, () => ({ carry_value: null, total_value: null })),
        })),
        completed: false,
      }
      localStorage.setItem('wedge_matrix_calibration_session', JSON.stringify(session))

      const store = useCalibrationStore()
      store.loadFromStorage()

      expect(store.session).toBeNull()
    })

    it('discards session with out-of-bounds column indices', () => {
      const matrixStore = initMatrixStore()
      const session = {
        matrixId: matrixStore.selectedMatrixId,
        shotCount: 5,
        selectedClubIndices: [0],
        selectedColumnIndices: [0, 10],
        currentStepIndex: 0,
        steps: Array.from({ length: 2 }, (_, i) => ({
          clubIndex: 0,
          columnIndex: i === 0 ? 0 : 10,
          shots: Array.from({ length: 5 }, () => ({ carry_value: null, total_value: null })),
        })),
        completed: false,
      }
      localStorage.setItem('wedge_matrix_calibration_session', JSON.stringify(session))

      const store = useCalibrationStore()
      store.loadFromStorage()

      expect(store.session).toBeNull()
    })
  })

  describe('computed properties', () => {
    it('isActive is true when session exists and not completed', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      expect(store.isActive).toBe(true)
    })

    it('isActive is false when no session', () => {
      initMatrixStore()
      const store = useCalibrationStore()

      expect(store.isActive).toBe(false)
    })

    it('isComplete is true when session is completed', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)
      store.advanceStep()
      store.advanceStep()
      store.advanceStep()
      store.advanceStep()

      expect(store.isComplete).toBe(true)
    })

    it('totalSteps returns correct count', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      expect(store.totalSteps).toBe(4)
    })

    it('currentStepNumber is 1-indexed', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      expect(store.currentStepNumber).toBe(1)
      store.advanceStep()
      expect(store.currentStepNumber).toBe(2)
    })

    it('progressPercent calculates correctly', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, ALL_CLUBS, ALL_COLS)

      expect(store.progressPercent).toBe(0)
      store.advanceStep()
      expect(store.progressPercent).toBe(25)
      store.advanceStep()
      expect(store.progressPercent).toBe(50)
    })
  })

  describe('getOldValues', () => {
    it('returns a deep copy of current yardage values', () => {
      initMatrixStore()
      const store = useCalibrationStore()

      const oldValues = store.getOldValues()

      expect(oldValues[0]![0]!.carry_value).toBe(100)
      expect(oldValues[0]![0]!.total_value).toBe(110)
    })
  })

  describe('getFilteredOldValues', () => {
    it('returns only selected club/column values', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, [1], [0])

      const filtered = store.getFilteredOldValues()

      expect(filtered).toHaveLength(1)
      expect(filtered[0]).toHaveLength(1)
      expect(filtered[0]![0]!.carry_value).toBe(60)
      expect(filtered[0]![0]!.total_value).toBe(70)
    })

    it('returns empty array when no session', () => {
      initMatrixStore()
      const store = useCalibrationStore()

      expect(store.getFilteredOldValues()).toEqual([])
    })
  })

  describe('getFilteredNewValues', () => {
    it('returns filtered averages for selected clubs/columns', () => {
      initMatrixStore()
      const store = useCalibrationStore()
      store.startCalibration(5, [0], [0])

      store.setShotValue(0, 'carry_value', '100')
      store.setShotValue(1, 'carry_value', '110')

      const filtered = store.getFilteredNewValues()

      expect(filtered).toHaveLength(1)
      expect(filtered[0]).toHaveLength(1)
      expect(filtered[0]![0]!.carry_value).toBe(105)
    })

    it('returns empty array when no session', () => {
      initMatrixStore()
      const store = useCalibrationStore()

      expect(store.getFilteredNewValues()).toEqual([])
    })
  })
})
