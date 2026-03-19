import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAxios } from '@/composables/axios/axios.ts'
import type { PracticeSessionRecord } from '@/types/practice'

export const usePracticeLogStore = defineStore('practiceLog', () => {
  const { get, del } = useAxios()

  const practiceLog = ref<PracticeSessionRecord[]>([])
  const logError = ref<string | null>(null)

  async function fetchPracticeLog() {
    logError.value = null
    const response = await get<{ data: PracticeSessionRecord[] }>('/practice-session')
    if (response.error || !response.data) {
      logError.value = response.error ?? 'Failed to fetch practice log'
      return
    }
    practiceLog.value = response.data.data
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

  return {
    practiceLog,
    logError,
    fetchPracticeLog,
    deleteSession,
  }
})
