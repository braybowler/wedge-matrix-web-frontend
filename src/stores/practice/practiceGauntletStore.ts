import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { usePracticeLogStore } from '@/stores/practice/practiceLogStore.ts'
import { useAxios } from '@/composables/axios/axios.ts'
import { useSessionStorage } from '@/composables/sessionStorage/useSessionStorage.ts'
import type {
  PracticeSession,
  PracticeSessionRecord,
  PracticeShot,
  PracticeShotCount,
} from '@/types/practice'

const STORAGE_KEY = 'wedge_matrix_practice_session'

export const usePracticeGauntletStore = defineStore('practiceGauntlet', () => {
  const { post } = useAxios()
  const storage = useSessionStorage<PracticeSession>(STORAGE_KEY, (parsed) => {
    return Array.isArray(parsed.shots) && parsed.shots.length === parsed.shotCount
  })

  const session = ref<PracticeSession | null>(null)

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

  function persist() {
    if (session.value) {
      storage.persist(session.value)
    }
  }

  function startPractice(shotCount: PracticeShotCount) {
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
    storage.clear()
  }

  function loadFromStorage() {
    session.value = storage.load()
  }

  async function saveSession() {
    if (!session.value || !session.value.completed) return

    const logStore = usePracticeLogStore()
    logStore.logError = null
    const response = await post<{ data: PracticeSessionRecord }>('/practice-session', {
      wedge_matrix_id: session.value.matrixId,
      mode: 'gauntlet',
      shot_count: session.value.shotCount,
      shots: session.value.shots,
      average_difference: averageDifference.value,
    })

    if (response.error || !response.data) {
      logStore.logError = response.error ?? 'Failed to save practice session'
      return
    }

    logStore.practiceLog.unshift(response.data.data)
    clearSession()
  }

  loadFromStorage()

  return {
    session,
    isActive,
    isComplete,
    totalShots,
    currentShotNumber,
    currentShot,
    progressPercent,
    averageDifference,
    startPractice,
    setActualCarry,
    advanceShot,
    goBackShot,
    clearSession,
    loadFromStorage,
    saveSession,
  }
})
