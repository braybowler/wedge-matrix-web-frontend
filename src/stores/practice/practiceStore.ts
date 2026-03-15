import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useAxios } from '@/composables/axios/axios.ts'
import type {
  DrillCombo,
  DrillSession,
  DrillStep,
  PracticeSession,
  PracticeSessionRecord,
  PracticeShot,
  PracticeShotCount,
} from '@/types/practice'

const STORAGE_KEY = 'wedge_matrix_practice_session'
const DRILL_STORAGE_KEY = 'wedge_matrix_drill_session'
const SHOTS_PER_COMBO = 5

export const usePracticeStore = defineStore('practice', () => {
  const { get, post, del } = useAxios()

  const session = ref<PracticeSession | null>(null)
  const drillSession = ref<DrillSession | null>(null)
  const practiceLog = ref<PracticeSessionRecord[]>([])
  const logError = ref<string | null>(null)

  // Gauntlet computed
  const isActive = computed(() => session.value !== null && !session.value.completed)
  const isComplete = computed(() => session.value !== null && session.value.completed)
  const totalShots = computed(() => session.value?.shotCount ?? 0)
  const currentShotNumber = computed(() => (session.value ? session.value.currentShotIndex + 1 : 0))
  const currentShot = computed(() =>
    session.value ? (session.value.shots[session.value.currentShotIndex] ?? null) : null,
  )
  const progressPercent = computed(() => {
    if (!session.value || totalShots.value === 0) return 0
    return Math.round((session.value.currentShotIndex / totalShots.value) * 100)
  })
  const averageDifference = computed(() => {
    if (!session.value) return 0
    const diffs = session.value.shots
      .map((s) => s.difference)
      .filter((d): d is number => d !== null)
    if (diffs.length === 0) return 0
    return Math.round((diffs.reduce((a, b) => a + b, 0) / diffs.length) * 10) / 10
  })

  // Drill computed
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

  // Gauntlet persistence
  function persist() {
    if (session.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session.value))
    }
  }

  // Drill persistence
  function persistDrill() {
    if (drillSession.value) {
      localStorage.setItem(DRILL_STORAGE_KEY, JSON.stringify(drillSession.value))
    }
  }

  // --- Gauntlet methods ---

  function startPractice(shotCount: PracticeShotCount) {
    // FUTURE PAYWALL — subscription check would gate access here
    const matrixStore = useMatrixConfigurationStore()
    const matrixId = matrixStore.selectedMatrixId

    if (!matrixId) return

    const yardageValues = matrixStore.yardageValues
    let maxCarry = 100
    for (const row of yardageValues) {
      for (const cell of row) {
        if (cell.carry_value !== null && cell.carry_value > maxCarry) {
          maxCarry = cell.carry_value
        }
      }
    }

    const shots: PracticeShot[] = Array.from({ length: shotCount }, (_, i) => ({
      shot_number: i + 1,
      target_yards: Math.floor(Math.random() * (maxCarry - 5 + 1)) + 5,
      actual_carry: null,
      difference: null,
    }))

    session.value = {
      matrixId,
      shotCount,
      shots,
      currentShotIndex: 0,
      completed: false,
    }
    persist()
  }

  function setActualCarry(rawValue: string) {
    if (!session.value || !currentShot.value) return

    const shot = currentShot.value
    const trimmed = rawValue.trim()
    if (trimmed === '') {
      shot.actual_carry = null
      shot.difference = null
      persist()
      return
    }

    const parsed = Number(trimmed)
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 999) {
      shot.actual_carry = Math.round(parsed * 10) / 10
      shot.difference = Math.round(Math.abs(shot.target_yards - shot.actual_carry) * 10) / 10
    } else {
      shot.actual_carry = null
      shot.difference = null
    }
    persist()
  }

  function advanceShot() {
    if (!session.value) return
    if (session.value.currentShotIndex < session.value.shots.length - 1) {
      session.value.currentShotIndex++
    } else {
      session.value.completed = true
    }
    persist()
  }

  function goBackShot() {
    if (!session.value || session.value.currentShotIndex <= 0) return
    session.value.currentShotIndex--
    persist()
  }

  function clearSession() {
    session.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as PracticeSession
      const matrixStore = useMatrixConfigurationStore()

      if (parsed.matrixId !== matrixStore.selectedMatrixId) {
        localStorage.removeItem(STORAGE_KEY)
        return
      }

      if (!Array.isArray(parsed.shots) || parsed.shots.length !== parsed.shotCount) {
        localStorage.removeItem(STORAGE_KEY)
        return
      }

      session.value = parsed
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // --- Drill methods ---

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
    localStorage.removeItem(DRILL_STORAGE_KEY)
  }

  function loadDrillFromStorage() {
    const raw = localStorage.getItem(DRILL_STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as DrillSession
      const matrixStore = useMatrixConfigurationStore()

      if (parsed.matrixId !== matrixStore.selectedMatrixId) {
        localStorage.removeItem(DRILL_STORAGE_KEY)
        return
      }

      if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
        localStorage.removeItem(DRILL_STORAGE_KEY)
        return
      }

      drillSession.value = parsed
    } catch {
      localStorage.removeItem(DRILL_STORAGE_KEY)
    }
  }

  // --- API methods ---

  async function fetchPracticeLog() {
    logError.value = null
    const response = await get<{ data: PracticeSessionRecord[] }>('/practice-session')
    if (response.error || !response.data) {
      logError.value = response.error ?? 'Failed to fetch practice log'
      return
    }
    practiceLog.value = response.data.data
  }

  async function saveSession() {
    if (!session.value || !session.value.completed) return

    logError.value = null
    const response = await post<{ data: PracticeSessionRecord }>('/practice-session', {
      wedge_matrix_id: session.value.matrixId,
      mode: 'gauntlet',
      shot_count: session.value.shotCount,
      shots: session.value.shots,
      average_difference: averageDifference.value,
    })

    if (response.error || !response.data) {
      logError.value = response.error ?? 'Failed to save practice session'
      return
    }

    practiceLog.value.unshift(response.data.data)
    clearSession()
  }

  async function saveDrillSession() {
    if (!drillSession.value || !drillSession.value.completed) return

    logError.value = null

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
      logError.value = response.error ?? 'Failed to save drill session'
      return
    }

    practiceLog.value.unshift(response.data.data)
    clearDrillSession()
  }

  async function deleteSession(id: number) {
    logError.value = null
    const response = await del('/practice-session/' + id)
    if (response.error) {
      logError.value = response.error
      return
    }
    practiceLog.value = practiceLog.value.filter((s) => s.id !== id)
  }

  loadFromStorage()
  loadDrillFromStorage()

  return {
    session,
    drillSession,
    practiceLog,
    logError,
    isActive,
    isComplete,
    totalShots,
    currentShotNumber,
    currentShot,
    progressPercent,
    averageDifference,
    isDrillActive,
    isDrillComplete,
    drillTotalSteps,
    drillCurrentStepNumber,
    drillCurrentStep,
    drillProgressPercent,
    drillStepAverages,
    drillAverageDifference,
    startPractice,
    setActualCarry,
    advanceShot,
    goBackShot,
    clearSession,
    loadFromStorage,
    startDrill,
    setDrillCarry,
    advanceDrillStep,
    goBackDrillStep,
    clearDrillSession,
    loadDrillFromStorage,
    fetchPracticeLog,
    saveSession,
    saveDrillSession,
    deleteSession,
  }
})
