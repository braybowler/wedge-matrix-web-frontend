import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { MAX_YARDAGE, type YardageGrid } from '@/types/matrix'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useSessionStorage } from '@/composables/sessionStorage/useSessionStorage.ts'
import { deepCopyYardageGrid } from '@/utils/deepCopyYardageGrid.ts'

export type ShotCount = 5 | 10 | 15

export type CalibrationShot = {
  carry_value: number | null
  total_value: number | null
}

export type CalibrationStepData = {
  clubIndex: number
  columnIndex: number
  shots: CalibrationShot[]
}

export type CalibrationSession = {
  matrixId: number
  shotCount: ShotCount
  selectedClubIndices: number[]
  selectedColumnIndices: number[]
  currentStepIndex: number
  steps: CalibrationStepData[]
  completed: boolean
}

const STORAGE_KEY = 'wedge_matrix_calibration_session'

export const useCalibrationStore = defineStore('calibration', () => {
  const storage = useSessionStorage<CalibrationSession>(STORAGE_KEY, (parsed) => {
    if (
      !Array.isArray(parsed.selectedClubIndices) ||
      !Array.isArray(parsed.selectedColumnIndices)
    ) {
      return false
    }

    const matrixStore = useMatrixConfigurationStore()
    const clubsInBounds = parsed.selectedClubIndices.every(
      (i) => i >= 0 && i < matrixStore.selectedClubs.length,
    )
    const colsInBounds = parsed.selectedColumnIndices.every(
      (i) => i >= 0 && i < matrixStore.matrixColumns,
    )
    if (!clubsInBounds || !colsInBounds) return false

    const expectedSteps = parsed.selectedClubIndices.length * parsed.selectedColumnIndices.length
    return parsed.steps.length === expectedSteps
  })

  const session = ref<CalibrationSession | null>(null)

  const isActive = computed(() => session.value !== null && !session.value.completed)
  const isComplete = computed(() => session.value !== null && session.value.completed)
  const totalSteps = computed(() => session.value?.steps.length ?? 0)
  const currentStepNumber = computed(() => (session.value ? session.value.currentStepIndex + 1 : 0))
  const currentStep = computed(() =>
    session.value ? (session.value.steps[session.value.currentStepIndex] ?? null) : null,
  )
  const progressPercent = computed(() => {
    if (!session.value || totalSteps.value === 0) return 0
    return Math.round((session.value.currentStepIndex / totalSteps.value) * 100)
  })

  function persist() {
    if (session.value) {
      storage.persist(session.value)
    }
  }

  function startCalibration(shotCount: ShotCount, clubIndices: number[], columnIndices: number[]) {
    const matrixStore = useMatrixConfigurationStore()
    const matrixId = matrixStore.selectedMatrixId

    if (!matrixId) return

    const steps: CalibrationStepData[] = []
    for (const clubIndex of clubIndices) {
      for (const columnIndex of columnIndices) {
        steps.push({
          clubIndex,
          columnIndex,
          shots: Array.from({ length: shotCount }, () => ({
            carry_value: null,
            total_value: null,
          })),
        })
      }
    }

    session.value = {
      matrixId,
      shotCount,
      selectedClubIndices: [...clubIndices],
      selectedColumnIndices: [...columnIndices],
      currentStepIndex: 0,
      steps,
      completed: false,
    }
    persist()
  }

  function setShotValue(shotIndex: number, field: 'carry_value' | 'total_value', rawValue: string) {
    if (!session.value || !currentStep.value) return

    const shot = currentStep.value.shots[shotIndex]
    if (!shot) return

    const trimmed = rawValue.trim()
    if (trimmed === '') {
      shot[field] = null
      persist()
      return
    }

    const parsed = Number(trimmed)
    const isValid = Number.isFinite(parsed) && parsed > 0 && parsed <= MAX_YARDAGE
    shot[field] = isValid ? Math.round(parsed * 10) / 10 : null
    persist()
  }

  function advanceStep() {
    if (!session.value) return
    if (session.value.currentStepIndex < session.value.steps.length - 1) {
      session.value.currentStepIndex++
    } else {
      session.value.completed = true
    }
    persist()
  }

  function goBackStep() {
    if (!session.value || session.value.currentStepIndex <= 0) return
    session.value.currentStepIndex--
    persist()
  }

  function computeAverages(): YardageGrid {
    const matrixStore = useMatrixConfigurationStore()
    const clubs = matrixStore.selectedClubs
    const columns = matrixStore.matrixColumns

    const grid: YardageGrid = Array.from({ length: clubs.length }, () =>
      Array.from({ length: columns }, () => ({ carry_value: null, total_value: null })),
    )

    if (!session.value) return grid

    for (const step of session.value.steps) {
      const cell = grid[step.clubIndex]?.[step.columnIndex]
      if (!cell) continue

      const carryValues = step.shots
        .map((s) => s.carry_value)
        .filter((v): v is number => v !== null)
      const totalValues = step.shots
        .map((s) => s.total_value)
        .filter((v): v is number => v !== null)

      cell.carry_value =
        carryValues.length > 0
          ? Math.round((carryValues.reduce((a, b) => a + b, 0) / carryValues.length) * 10) / 10
          : null
      cell.total_value =
        totalValues.length > 0
          ? Math.round((totalValues.reduce((a, b) => a + b, 0) / totalValues.length) * 10) / 10
          : null
    }

    return grid
  }

  function getOldValues(): YardageGrid {
    const matrixStore = useMatrixConfigurationStore()
    return deepCopyYardageGrid(matrixStore.yardageValues)
  }

  function getFilteredOldValues(): YardageGrid {
    if (!session.value) return []
    const matrixStore = useMatrixConfigurationStore()
    return session.value.selectedClubIndices.map((ci) =>
      session.value!.selectedColumnIndices.map((coli) => ({
        ...(matrixStore.yardageValues[ci]?.[coli] ?? { carry_value: null, total_value: null }),
      })),
    )
  }

  function getFilteredNewValues(): YardageGrid {
    if (!session.value) return []
    const averages = computeAverages()
    return session.value.selectedClubIndices.map((ci) =>
      session.value!.selectedColumnIndices.map((coli) => ({
        ...(averages[ci]?.[coli] ?? { carry_value: null, total_value: null }),
      })),
    )
  }

  function applyCalibration() {
    const matrixStore = useMatrixConfigurationStore()
    const averages = computeAverages()

    for (let clubIndex = 0; clubIndex < averages.length; clubIndex++) {
      const row = averages[clubIndex]!
      for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
        const cell = row[columnIndex]!
        if (cell.carry_value !== null) {
          matrixStore.setYardageValue(
            'carry_value',
            String(cell.carry_value),
            clubIndex,
            columnIndex,
          )
        }
        if (cell.total_value !== null) {
          matrixStore.setYardageValue(
            'total_value',
            String(cell.total_value),
            clubIndex,
            columnIndex,
          )
        }
      }
    }

    clearSession()
  }

  function clearSession() {
    session.value = null
    storage.clear()
  }

  function loadFromStorage() {
    session.value = storage.load()
  }

  loadFromStorage()

  return {
    session,
    isActive,
    isComplete,
    totalSteps,
    currentStepNumber,
    currentStep,
    progressPercent,
    startCalibration,
    setShotValue,
    advanceStep,
    goBackStep,
    computeAverages,
    getOldValues,
    getFilteredOldValues,
    getFilteredNewValues,
    applyCalibration,
    clearSession,
    loadFromStorage,
  }
})
