import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { usePracticeLogStore } from '@/stores/practice/practiceLogStore.ts'
import { useAxios } from '@/composables/axios/axios.ts'
import { useSessionStorage } from '@/composables/sessionStorage/useSessionStorage.ts'
import { STORAGE_KEYS } from '@/constants/storageKeys.ts'
import type {
  DrillCombo,
  DrillSession,
  DrillStep,
  PracticeSessionRecord,
  PracticeShot,
} from '@/types/practice'

const DRILL_STORAGE_KEY = STORAGE_KEYS.DRILL_SESSION
const SHOTS_PER_COMBO = 5

export const usePracticeDrillStore = defineStore('practiceDrill', () => {
  const { post } = useAxios()
  const storage = useSessionStorage<DrillSession>(DRILL_STORAGE_KEY, (parsed) => {
    const matrixStore = useMatrixConfigurationStore()
    if (parsed.matrixId !== matrixStore.selectedMatrixId) return false
    return Array.isArray(parsed.steps) && parsed.steps.length > 0
  })

  const drillSession = ref<DrillSession | null>(null)

  const isDrillActive = computed(() => drillSession.value !== null && !drillSession.value.completed)
  const isDrillComplete = computed(
    () => drillSession.value !== null && drillSession.value.completed,
  )
  const drillTotalSteps = computed(() => drillSession.value?.steps.length ?? 0)
  const drillCurrentStepNumber = computed(() =>
    drillSession.value ? drillSession.value.currentStepIndex + 1 : 0,
  )
  const drillCurrentStep = computed(() =>
    drillSession.value
      ? (drillSession.value.steps[drillSession.value.currentStepIndex] ?? null)
      : null,
  )
  const drillProgressPercent = computed(() => {
    if (!drillSession.value || drillTotalSteps.value === 0) return 0
    return Math.round((drillSession.value.currentStepIndex / drillTotalSteps.value) * 100)
  })

  function stepReference(step: DrillStep): number | null {
    if (step.combo.targetYards !== null) return step.combo.targetYards
    const filled = step.shots.filter((v): v is number => v !== null)
    if (filled.length === 0) return null
    return filled.reduce((a, b) => a + b, 0) / filled.length
  }

  const drillStepAverages = computed(() => {
    if (!drillSession.value) return []
    return drillSession.value.steps.map((step) => {
      const ref = stepReference(step)
      if (ref === null) return null
      const filled = step.shots.filter((v): v is number => v !== null)
      if (filled.length === 0) return null
      const diffs = filled.map((v) => Math.abs(ref - v))
      return Math.round((diffs.reduce((a, b) => a + b, 0) / diffs.length) * 10) / 10
    })
  })

  const drillAverageDifference = computed(() => {
    if (!drillSession.value) return 0
    const allDiffs: number[] = []
    for (const step of drillSession.value.steps) {
      const ref = stepReference(step)
      if (ref === null) continue
      for (const v of step.shots) {
        if (v !== null) {
          allDiffs.push(Math.abs(ref - v))
        }
      }
    }
    if (allDiffs.length === 0) return 0
    return Math.round((allDiffs.reduce((a, b) => a + b, 0) / allDiffs.length) * 10) / 10
  })

  function persistDrill() {
    if (drillSession.value) {
      storage.persist(drillSession.value)
    }
  }

  function startDrill(combos: DrillCombo[]) {
    const matrixStore = useMatrixConfigurationStore()
    const matrixId = matrixStore.selectedMatrixId

    if (!matrixId || combos.length === 0) return

    const steps: DrillStep[] = combos.map((combo) => ({
      combo,
      shots: Array(SHOTS_PER_COMBO).fill(null) as (number | null)[],
    }))

    drillSession.value = {
      matrixId,
      steps,
      currentStepIndex: 0,
      completed: false,
    }
    persistDrill()
  }

  function setDrillCarry(shotIndex: number, rawValue: string) {
    if (!drillSession.value || !drillCurrentStep.value) return

    const step = drillCurrentStep.value
    const trimmed = rawValue.trim()
    if (trimmed === '') {
      step.shots[shotIndex] = null
      persistDrill()
      return
    }

    const parsed = Number(trimmed)
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 999) {
      step.shots[shotIndex] = Math.round(parsed * 10) / 10
    } else {
      step.shots[shotIndex] = null
    }
    persistDrill()
  }

  function advanceDrillStep() {
    if (!drillSession.value) return
    if (drillSession.value.currentStepIndex < drillSession.value.steps.length - 1) {
      drillSession.value.currentStepIndex++
    } else {
      drillSession.value.completed = true
    }
    persistDrill()
  }

  function goBackDrillStep() {
    if (!drillSession.value || drillSession.value.currentStepIndex <= 0) return
    drillSession.value.currentStepIndex--
    persistDrill()
  }

  function clearDrillSession() {
    drillSession.value = null
    storage.clear()
  }

  function loadDrillFromStorage() {
    drillSession.value = storage.load()
  }

  async function saveDrillSession() {
    if (!drillSession.value || !drillSession.value.completed) return

    const logStore = usePracticeLogStore()
    logStore.logError = null

    const shots: PracticeShot[] = []
    let shotNumber = 1
    for (const step of drillSession.value.steps) {
      const ref = stepReference(step) ?? 0
      for (const carry of step.shots) {
        const actual = carry !== null ? Math.round(carry * 10) / 10 : 0
        const diff = carry !== null ? Math.round(Math.abs(ref - actual) * 10) / 10 : 0
        shots.push({
          shot_number: shotNumber++,
          target_yards: Math.round(ref * 10) / 10,
          actual_carry: actual,
          difference: diff,
          club_label: step.combo.clubLabel,
          swing_label: step.combo.swingLabel,
        })
      }
    }

    const response = await post<{ data: PracticeSessionRecord }>('/practice-session', {
      wedge_matrix_id: drillSession.value.matrixId,
      mode: 'drill',
      shot_count: shots.length,
      shots,
      average_difference: drillAverageDifference.value,
    })

    if (response.error || !response.data) {
      logStore.logError = response.error ?? 'Failed to save drill session'
      return
    }

    logStore.practiceLog.unshift(response.data.data)
    clearDrillSession()
  }

  loadDrillFromStorage()

  return {
    drillSession,
    isDrillActive,
    isDrillComplete,
    drillTotalSteps,
    drillCurrentStepNumber,
    drillCurrentStep,
    drillProgressPercent,
    drillStepAverages,
    drillAverageDifference,
    startDrill,
    setDrillCarry,
    advanceDrillStep,
    goBackDrillStep,
    clearDrillSession,
    loadDrillFromStorage,
    saveDrillSession,
  }
})
